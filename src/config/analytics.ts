// Analytics settings (docs/phase-2/07-technical-architecture.md §7; open question Q14).
// Nothing loads unless one of these is set in the host's environment:
//   PUBLIC_GA4_ID           Google Analytics 4 (sets cookies, so it waits for consent; Consent Mode v2)
//   PUBLIC_PLAUSIBLE_DOMAIN Plausible (cookieless, no banner needed)
// The consent banner only appears when a consent-requiring tool is configured.

export const ga4Id = import.meta.env.PUBLIC_GA4_ID ?? '';
export const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN ?? '';

/** True when the site uses a tool that needs opt-in consent (UK/EU). */
export const consentRequired = ga4Id !== '';

/** localStorage key for the visitor's choice. */
export const consentKey = 'stride-consent-v1';
