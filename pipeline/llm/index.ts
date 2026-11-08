// Thin provider adapter. Swap providers with LLM_PROVIDER; nothing else in the pipeline knows which one runs.
// Free tiers change often — check current limits/models before relying on a default below.

export interface LLMRequest {
  task: 'brief' | 'draft' | 'claims';
  system: string;
  user: string;
  json?: boolean;          // ask for a JSON object response
  temperature?: number;
  context?: unknown;       // structured data, used only by the mock provider
}

export interface LLMProvider {
  name: string;
  model: string;
  complete(req: LLMRequest): Promise<string>;
}

const env = (k: string) => process.env[k] || '';

async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let delay = 5000;
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      const msg = String(e);
      const retryable = /\b(429|500|502|503|504)\b/.test(msg);
      if (!retryable || i >= tries - 1) throw e;
      console.warn(`LLM call failed (${msg.slice(0, 120)}); retrying in ${delay / 1000}s`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function postJson(url: string, body: unknown, headers: Record<string, string>) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function gemini(model: string): LLMProvider {
  const key = env('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not set');
  return {
    name: 'gemini', model,
    complete: (req) => withRetry(async () => {
      const data = await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          systemInstruction: { parts: [{ text: req.system }] },
          contents: [{ role: 'user', parts: [{ text: req.user }] }],
          generationConfig: { temperature: req.temperature ?? 0.4, ...(req.json ? { responseMimeType: 'application/json' } : {}) },
        },
        { 'x-goog-api-key': key },
      );
      return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    }),
  };
}

function openAICompatible(name: string, baseUrl: string, token: string, model: string): LLMProvider {
  if (!token) throw new Error(`API token for ${name} not set`);
  return {
    name, model,
    complete: (req) => withRetry(async () => {
      const data = await postJson(
        `${baseUrl}/chat/completions`,
        {
          model,
          temperature: req.temperature ?? 0.4,
          messages: [{ role: 'system', content: req.system }, { role: 'user', content: req.user }],
          ...(req.json ? { response_format: { type: 'json_object' } } : {}),
        },
        { authorization: `Bearer ${token}` },
      );
      return data.choices?.[0]?.message?.content ?? '';
    }),
  };
}

export function getProvider(kind: 'writer' | 'verifier' = 'writer'): LLMProvider {
  const provider = (kind === 'verifier' && env('LLM_VERIFY_PROVIDER')) || env('LLM_PROVIDER') || 'mock';
  const modelOverride = (kind === 'verifier' && env('LLM_VERIFY_MODEL')) || env('LLM_MODEL');
  switch (provider) {
    case 'gemini':
      return gemini(modelOverride || 'gemini-2.5-flash');
    case 'groq':
      return openAICompatible('groq', 'https://api.groq.com/openai/v1', env('GROQ_API_KEY'), modelOverride || 'llama-3.3-70b-versatile');
    case 'github':
      return openAICompatible('github', 'https://models.github.ai/inference', env('GITHUB_TOKEN'), modelOverride || 'openai/gpt-4.1-mini');
    case 'cloudflare':
      return openAICompatible('cloudflare', `https://api.cloudflare.com/client/v4/accounts/${env('CLOUDFLARE_ACCOUNT_ID')}/ai/v1`,
        env('CLOUDFLARE_API_TOKEN'), modelOverride || '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
    case 'mock': {
      // Deterministic offline provider for CI and dry runs.
      return { name: 'mock', model: 'mock', complete: async (req) => (await import('./mock')).mockComplete(req) };
    }
    default:
      throw new Error(`Unknown LLM_PROVIDER "${provider}"`);
  }
}

/** Strip code fences / prose around a JSON object and parse it. */
export function parseJsonLoose<T>(text: string): T {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error(`No JSON object in LLM response: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(start, end + 1)) as T;
}
