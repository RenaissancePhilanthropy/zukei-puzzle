/**
 * Geometry calculation tolerances
 *
 * These values are used for floating-point comparisons in geometric calculations
 * to account for precision errors.
 */
export const GEOMETRY_TOLERANCES = {
	/** Tolerance for comparing side lengths (used in isosceles triangle validation) */
	sideLength: 0.001,

	/** Tolerance for comparing angles (used in parallelogram validation) */
	angle: 0.01,

	/** Tolerance for vector operations (used in rectangle perpendicularity checks) */
	vector: 0.001,

	/** Tolerance for parallel line checks (used in trapezoid validation) */
	parallelCheck: 0.001,
} as const;
