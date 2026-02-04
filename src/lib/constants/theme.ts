/**
 * UI theme constants for the puzzle grid
 */
export const THEME = {
	colors: {
		/** Default point color */
		point: '#2b2a29',

		/** Point color on hover */
		pointHover: '#4a4948',

		/** Selected point color */
		pointSelected: '#007bff',

		/** Selected point border color */
		pointSelectedBorder: '#0056b3',

		/** Default line color */
		line: '#2b2a29',

		/** Preview line color (while drawing) */
		linePreview: '#007bff',

		/** Line color on hover */
		lineHover: '#ff4444',

		/** Grid cell border color */
		cellBorder: '#222',
	},

	sizes: {
		/** Point diameter in pixels */
		point: 20,

		/** Line stroke width in pixels */
		lineWidth: 3,

		/** Point scale multiplier on hover */
		pointScaleHover: 1.2,

		/** Point scale multiplier when selected */
		pointScaleSelected: 1.3,

		/** Hovered line width in pixels */
		lineWidthHover: 4,
	},
} as const;
