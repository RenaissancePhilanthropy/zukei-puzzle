/**
 * Shared type definitions for the ZukeiDemo application
 */

/**
 * Represents a point on the puzzle grid
 */
export type GridPoint = {
	row: number;
	column: number;
};

/**
 * Represents a pixel coordinate (used for SVG rendering)
 */
export type Coordinate = {
	x: number;
	y: number;
};

/**
 * Represents a line connecting two grid points
 */
export type Line = {
	from: GridPoint;
	to: GridPoint;
};
