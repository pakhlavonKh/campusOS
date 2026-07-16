import { IsString, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}
