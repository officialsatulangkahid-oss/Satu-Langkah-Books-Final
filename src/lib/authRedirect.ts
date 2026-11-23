/** Only allow same-site application routes, never protocol-relative or encoded redirects. */
export function safeRedirect(value: string | null, fallback = "/learn/dashboard") {
  if (!value || !/^\/(?:learn|admin)(?:\/|\?|$)/.test(value) || /[\\\r\n%]/.test(value)) return fallback;
  if (/^\/learn\/auth(?:[/?]|$)/.test(value)) return fallback;
  return value;
}
