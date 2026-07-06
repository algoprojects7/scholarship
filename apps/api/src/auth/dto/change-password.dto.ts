import { IsString, Matches, MinLength } from 'class-validator';
import { Match } from './match.decorator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  newPassword!: string;

  @IsString()
  @Match('newPassword', { message: 'Passwords must match' })
  confirmPassword!: string;
}
