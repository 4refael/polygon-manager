export type Point = readonly [number, number];
export type PolygonPoints = Point[];

export interface PolygonData {
  readonly name: string;
  readonly points: PolygonPoints;
}

export interface Polygon extends PolygonData {
  readonly id: string;
}

export interface ApiError {
  readonly error: string;
  readonly message: string;
  readonly statusCode: number;
}