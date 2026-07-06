declare module 'svg-captcha' {
  export interface CaptchaOptions {
    text?: string;
    size?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
  }

  export interface CaptchaResult {
    data: string;
    text: string;
  }

  /** Renders SVG for the given captcha text (default export). */
  function createCaptcha(text: string, options?: CaptchaOptions): string;

  export default createCaptcha;

  /** Generates random text — do not use when text is pre-generated. */
  export function create(options?: CaptchaOptions): CaptchaResult;
}
