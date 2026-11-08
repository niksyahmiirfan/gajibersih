export const SITE = {
  name: 'GajiBersih',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, ''),
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
};

/** Salaries that get their own cluster page, e.g. /salary/rm-5000-salary-after-epf-and-tax/ */
export const CLUSTER_SALARIES = [1700, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 12000, 15000, 20000];

export const salarySlug = (amount: number) => `rm-${amount}-salary-after-epf-and-tax`;
export const slugToSalary = (slug: string) => {
  const m = /^rm-(\d+)-salary-after-epf-and-tax$/.exec(slug);
  return m ? Number(m[1]) : null;
};
