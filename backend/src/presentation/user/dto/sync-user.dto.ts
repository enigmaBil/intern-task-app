import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class SyncUserDto {
  @IsString()
  keycloakId: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
