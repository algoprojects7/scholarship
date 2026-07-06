export interface CaptchaValue {
  captchaId: string;
  captchaCode: string;
}

export type SecurityVerificationVariant = "student" | "admin";

export interface SecurityVerificationProps {
  apiBaseUrl?: string;
  value: CaptchaValue;
  onChange: (value: CaptchaValue) => void;
  variant?: SecurityVerificationVariant;
  error?: string;
  disabled?: boolean;
}

export interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expiresIn: number;
}
