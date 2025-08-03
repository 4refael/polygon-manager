export type Point = readonly [number, number];

export interface PolygonData {
  readonly name: string;
  readonly points: Point[];
}

export interface Polygon extends PolygonData {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}