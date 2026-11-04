// Built as production everywhere; live vs preview is decided by hostname in the browser and by Host in api/ (api/_lib/site.ts).
export const IS_LIVE = import.meta.env.PUBLIC_SITE_ENV === 'production';
// Kill switch: PUBLIC_FORMS_LIVE=0 stops the forms sending anything (needs a redeploy; the API also honours it at runtime).
export const FORMS_LIVE = import.meta.env.PUBLIC_FORMS_LIVE !== '0';
/** The one hostname that is indexed, counted and shown without the preview banner. */
export const LIVE_HOST = 'ikigaicollective.org';
