import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class CreatePolygonDto {
  @IsString()
  name!: string;

  @IsArray()
  @ArrayMinSize(3)
  points!: [number, number][];
}

