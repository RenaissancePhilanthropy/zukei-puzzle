import { DEFAULT_CONFIG as DEFAULT_DECOY_CONFIG } from '../decoyPoints';

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
	decoyGeneration: DEFAULT_DECOY_CONFIG,
} as const;
