/**
 * Theme constants for the hint visualization system
 */
export const HINT_THEME = {
  /**
   * Colors for different types of line highlights
   */
  lineColors: {
    incorrect: '#dc3545',     // Red - clear problem
    problematic: '#fd7e14',   // Orange - needs attention
    reference: '#6c757d',     // Gray - context
    correct: '#28a745'        // Green - good (rare)
  },

  /**
   * Modal styling constants
   */
  modal: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    background: '#ffffff',
    border: '#dee2e6',
    maxWidth: '600px',
    maxHeight: '80vh'
  },

  /**
   * Size constants for visual elements
   */
  sizes: {
    highlightLineWidth: 5,
    contextLineWidth: 2,
    highlightPoint: 10,
    labelFontSize: 12
  },

  /**
   * Opacity settings for various elements
   */
  opacity: {
    contextLine: 0.3,
    highlightLine: 0.9
  }
} as const;
