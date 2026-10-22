// Mide el uso de las herramientas con eventos de GA4. Respeta el consentimiento: si no está concedido, gtag no guarda nada identificable.
// Nunca se envía el contenido pegado por el usuario, solo recuentos.
type Params = Record<string, string | number | boolean>;
export function track(name: string, params: Params = {}) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === "function") g("event", name, params);
  } catch {
    /* sin medición */
  }
}
