import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class ValidateCaptchaDto {
  @IsUUID('4', { message: 'Invalid security code session' })
  captchaId!: string;

  @IsString()
  @Length(6, 6, { message: 'Security code must be 6 characters' })
  @Matches(/^[A-Za-z2-9]+$/, {
    message: 'Security code contains invalid characters',
  })
  captchaCode!: string;
}
