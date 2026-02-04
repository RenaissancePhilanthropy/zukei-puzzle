/**
 * Puzzle configuration constants
 */
export const PUZZLE_CONFIG = {
	/** Default grid dimensions */
	defaultGridSize: {
		rows: 4,
		columns: 4,
	},

	/** Decoy point generation settings */
	decoyGeneration: {
		/** Number of decoy points to add to each puzzle */
		numDecoys: 3,

		/** Maximum attempts to find valid decoy positions before giving up */
		maxAttempts: 50,
	},
} as const;
