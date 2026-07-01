/**
 * @typedef {null | { username: string; password: string; role: string }} GuideAuth
 */

/**
 * @typedef {{
 *   id: string;
 *   section: string;
 *   title: string;
 *   path: string;
 *   auth: GuideAuth;
 *   audience: string;
 *   purpose: string;
 *   overview: string;
 *   elements: Array<{ name: string; type: string; description: string }>;
 *   tips?: string[];
 *   subPages?: Array<{ path: string; title: string; description: string }>;
 *   waitMs?: number;
 *   skipScreenshot?: boolean;
 * }} GuidePage
 */

export {};
