export const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 3;
export const DEFAULT_MAX_RESPONSE_TOKENS = 1000;

export const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "css",
  "go",
  "swift",
  "html",
  "css",
  "go",
  "haskell",
  "java",
  "php",
  "ruby",
  "c",
  "go",
];

declare global {
  var IS_DEV: boolean | undefined;
}

export const IS_DEV = () => window.IS_DEV === true;
