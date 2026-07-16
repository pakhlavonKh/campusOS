import { IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class RecordGradeDto {
  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
