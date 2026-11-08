export interface KeywordEntry {
  id: string;
  keyword: string;
  type: 'salary' | 'guide';
  salary?: number;
  section?: string;
  status: 'proposed' | 'approved' | 'drafted' | 'published';
}

export interface Brief {
  id: string;
  keyword: string;
  title: string;
  description: string;
  search_intent: string;
  outline: string[];
  faqs: string[];
  internal_links: string[];
}
