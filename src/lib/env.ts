// Build environment. Set PUBLIC_SITE_ENV=production for the live build; everything else
// (local dev, preview deploys) is treated as preview. Sections waiting on client content show a
// labelled placeholder in preview and are left out entirely in production.
export const isProduction = import.meta.env.PUBLIC_SITE_ENV === 'production';
export const isPreview = !isProduction;
