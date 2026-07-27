export interface CustomCSSVars {
  size?: number;
  speed?: number;
  colorDark?: string;
  colorLight?: string;
}

/**
 * Resolves CSS variables declared on the element or any parent element.
 * Supported variables:
 * --orb-size: e.g. 64px, 20px
 * --orb-speed: e.g. 1.5
 * --orb-color-dark: e.g. #ffffff
 * --orb-color-light: e.g. #000000
 */
export function resolveCSSVars(el: HTMLElement | null): CustomCSSVars {
  if (!el || typeof window === 'undefined' || !window.getComputedStyle) {
    return {};
  }

  const computed = window.getComputedStyle(el);
  const vars: CustomCSSVars = {};

  const rawSize = computed.getPropertyValue('--orb-size').trim();
  if (rawSize) {
    const parsedSize = parseFloat(rawSize);
    if (!isNaN(parsedSize)) vars.size = parsedSize;
  }

  const rawSpeed = computed.getPropertyValue('--orb-speed').trim();
  if (rawSpeed) {
    const parsedSpeed = parseFloat(rawSpeed);
    if (!isNaN(parsedSpeed)) vars.speed = parsedSpeed;
  }

  const rawDarkColor = computed.getPropertyValue('--orb-color-dark').trim();
  if (rawDarkColor) vars.colorDark = rawDarkColor;

  const rawLightColor = computed.getPropertyValue('--orb-color-light').trim();
  if (rawLightColor) vars.colorLight = rawLightColor;

  return vars;
}
