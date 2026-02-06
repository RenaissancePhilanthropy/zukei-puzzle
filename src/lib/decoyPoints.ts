import type { GridPoint } from "./types";
import { validateShape, type ShapeType } from "./shapes";

/**
 * Configuration for decoy point generation
 */
export interface DecoyConfig {
	numDecoys: number; // How many decoy points to add
	maxAttempts: number; // Maximum attempts before giving up
}

export const DEFAULT_CONFIG: DecoyConfig = {
	numDecoys: 4,
	maxAttempts: 300,
};

/**
 * Adds decoy points to the grid that don't create duplicate target shapes.
 *
 * @param targetShapeType The type of shape to avoid creating duplicates of
 * @param targetPoints The points that form the target shape (not mutated)
 * @param visiblePoints 2D array tracking which points are visible on the grid (mutated in place)
 * @param gridWidth Width of the grid (columns)
 * @param gridHeight Height of the grid (rows)
 * @param config Optional configuration for number of decoys and max attempts
 */
export function addDecoyPoints(
	targetShapeType: ShapeType,
	targetPoints: GridPoint[],
	visiblePoints: boolean[][],
	gridWidth: number,
	gridHeight: number,
	config: Partial<DecoyConfig> = {}
): void {
	const { numDecoys, maxAttempts } = { ...DEFAULT_CONFIG, ...config };

	// Track all visible points (target + decoys) without mutating original array
	const allVisiblePoints = [...targetPoints];

	// Get all available grid positions (not currently visible)
	let candidatePoints = getAllAvailablePoints(visiblePoints, gridWidth, gridHeight);

	// Filter out points that lie on the edges of the target shape
	// These are particularly prone to creating additional instances of the target shape
	candidatePoints = candidatePoints.filter(
		(point) => !liesOnShapeEdge(point, targetPoints)
	);

	let decoyCount = 0;
	let attempts = 0;

	// Try to add decoy points
	while (decoyCount < numDecoys && attempts < maxAttempts && candidatePoints.length > 0) {
		attempts++;

		// Pick random candidate from available points
		const candidateIndex = Math.floor(Math.random() * candidatePoints.length);
		const candidate = candidatePoints[candidateIndex];

		// Check if adding this point would create the target shape
		if (wouldCreateTargetShape(candidate, allVisiblePoints, targetShapeType)) {
			// This candidate would create a duplicate shape - remove it from candidates
			candidatePoints.splice(candidateIndex, 1);
			continue;
		}

		// Safe to add this decoy point
		visiblePoints[candidate.row][candidate.column] = true;
		allVisiblePoints.push(candidate); // Track locally for shape validation
		candidatePoints.splice(candidateIndex, 1); // Remove from candidate pool
		decoyCount++;
	}

	if (decoyCount < numDecoys) {
		console.warn(
			`Only added ${decoyCount} of ${numDecoys} requested decoy points after ${attempts} attempts`
		);
	}
}

/**
 * Check if adding a candidate point would create the target shape type
 * with any subset of existing points.
 *
 * @param candidate The point to test
 * @param existingPoints Current points on the grid
 * @param targetShapeType The shape type to avoid creating
 * @returns true if adding the candidate would create the target shape
 */
function wouldCreateTargetShape(
	candidate: GridPoint,
	existingPoints: GridPoint[],
	targetShapeType: ShapeType
): boolean {
	// Determine how many points are needed for this shape type
	const requiredPoints = targetShapeType === "IsoscelesTriangle" ? 3 : 4;
	const pointsNeeded = requiredPoints - 1; // We need this many from existing points

	// Can't create the target shape if we don't have enough existing points
	if (existingPoints.length < pointsNeeded) {
		return false;
	}

	// Generate all combinations of the required size from existing points
	// For triangles: check all pairs (2 points) of existing points
	// For quads: check all triples (3 points) of existing points
	const combinations = generateCombinations(existingPoints, pointsNeeded);

	// Test each combination with the candidate point
	for (const combo of combinations) {
		const testPoints = [...combo, candidate];

		// Use existing validation logic from shapes.ts
		if (validateShape(targetShapeType, testPoints)) {
			// This candidate would complete the target shape!
			return true;
		}
	}

	// Safe - this candidate doesn't create the target shape with any existing points
	return false;
}

/**
 * Generate all k-combinations from an array.
 * For example: generateCombinations([1,2,3], 2) returns [[1,2], [1,3], [2,3]]
 *
 * @param arr Array to generate combinations from
 * @param k Size of each combination
 * @returns Array of all k-combinations
 */
function generateCombinations<T>(arr: T[], k: number): T[][] {
	const result: T[][] = [];
	const n = arr.length;

	if (k > n || k <= 0) {
		return result;
	}

	if (k === 1) {
		return arr.map((item) => [item]);
	}

	// Use iterative approach with index tracking for efficiency
	const indices = Array.from({ length: k }, (_, i) => i);
	result.push(indices.map((i) => arr[i]));

	while (true) {
		// Find the rightmost index that can be incremented
		let i = k - 1;
		while (i >= 0 && indices[i] === n - k + i) {
			i--;
		}

		// No more combinations possible
		if (i < 0) {
			break;
		}

		// Increment this index
		indices[i]++;

		// Set all indices to the right to their minimum possible values
		for (let j = i + 1; j < k; j++) {
			indices[j] = indices[j - 1] + 1;
		}

		result.push(indices.map((idx) => arr[idx]));
	}

	return result;
}

/**
 * Checks if a point lies on any edge of the shape formed by the given points.
 * This helps filter out candidates that are particularly prone to creating
 * additional instances of the target shape.
 *
 * @param point The point to check
 * @param shapePoints The points forming the shape
 * @returns true if the point lies on any edge of the shape
 */
function liesOnShapeEdge(point: GridPoint, shapePoints: GridPoint[]): boolean {
	const n = shapePoints.length;

	// Check each edge of the shape
	for (let i = 0; i < n; i++) {
		const p1 = shapePoints[i];
		const p2 = shapePoints[(i + 1) % n];

		if (isPointOnLineSegment(point, p1, p2)) {
			return true;
		}
	}

	return false;
}

/**
 * Checks if a point lies on the line segment between two other points.
 * Uses cross product to check collinearity and then verifies the point
 * is between the segment endpoints.
 *
 * @param point The point to check
 * @param segmentStart Start of the line segment
 * @param segmentEnd End of the line segment
 * @returns true if point lies on the segment (excluding endpoints)
 */
function isPointOnLineSegment(
	point: GridPoint,
	segmentStart: GridPoint,
	segmentEnd: GridPoint
): boolean {
	// Don't filter out the actual vertices of the shape
	if (
		(point.row === segmentStart.row && point.column === segmentStart.column) ||
		(point.row === segmentEnd.row && point.column === segmentEnd.column)
	) {
		return false;
	}

	// Vector from segmentStart to point
	const dx1 = point.column - segmentStart.column;
	const dy1 = point.row - segmentStart.row;

	// Vector from segmentStart to segmentEnd
	const dx2 = segmentEnd.column - segmentStart.column;
	const dy2 = segmentEnd.row - segmentStart.row;

	// Cross product to check collinearity
	// If cross product is 0, the points are collinear
	const crossProduct = dx1 * dy2 - dy1 * dx2;
	if (crossProduct !== 0) {
		return false; // Not collinear
	}

	// Check if point is between segmentStart and segmentEnd
	// For this, check if the point is within the bounding box
	const minX = Math.min(segmentStart.column, segmentEnd.column);
	const maxX = Math.max(segmentStart.column, segmentEnd.column);
	const minY = Math.min(segmentStart.row, segmentEnd.row);
	const maxY = Math.max(segmentStart.row, segmentEnd.row);

	return (
		point.column >= minX &&
		point.column <= maxX &&
		point.row >= minY &&
		point.row <= maxY
	);
}

/**
 * Get all available (non-visible) points on the grid.
 *
 * @param visiblePoints 2D array tracking which points are visible
 * @param gridWidth Width of the grid (columns)
 * @param gridHeight Height of the grid (rows)
 * @returns Array of all available grid points
 */
function getAllAvailablePoints(
	visiblePoints: boolean[][],
	gridWidth: number,
	gridHeight: number
): GridPoint[] {
	const available: GridPoint[] = [];

	// Grid points range from (0,0) to (gridHeight, gridWidth)
	for (let row = 0; row <= gridHeight; row++) {
		for (let column = 0; column <= gridWidth; column++) {
			if (!visiblePoints[row][column]) {
				available.push({ row, column });
			}
		}
	}

	return available;
}
