import type { GridPoint } from "./types";
import { validateShape, type ShapeType } from "./shapes";

/**
 * Configuration for decoy point generation
 */
export interface DecoyConfig {
	numDecoys: number; // How many decoy points to add
	maxAttempts: number; // Maximum attempts before giving up
}

const DEFAULT_CONFIG: DecoyConfig = {
	numDecoys: 5,
	maxAttempts: 75,
};

/**
 * Adds decoy points to the grid that don't create duplicate target shapes.
 *
 * @param targetShapeType The type of shape to avoid creating duplicates of
 * @param targetPoints The points that form the target shape
 * @param visiblePoints 2D array tracking which points are visible on the grid
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

	// Get all available grid positions (not currently visible)
	let candidatePoints = getAllAvailablePoints(visiblePoints, gridWidth, gridHeight);

	let decoyCount = 0;
	let attempts = 0;

	// Try to add decoy points
	while (decoyCount < numDecoys && attempts < maxAttempts && candidatePoints.length > 0) {
		attempts++;

		// Pick random candidate from available points
		const candidateIndex = Math.floor(Math.random() * candidatePoints.length);
		const candidate = candidatePoints[candidateIndex];

		// Check if adding this point would create the target shape
		if (wouldCreateTargetShape(candidate, targetPoints, targetShapeType)) {
			// This candidate would create a duplicate shape - remove it from candidates
			candidatePoints.splice(candidateIndex, 1);
			continue;
		}

		// Safe to add this decoy point
		visiblePoints[candidate.row][candidate.column] = true;
		targetPoints.push(candidate); // Add to tracking for next iteration
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
