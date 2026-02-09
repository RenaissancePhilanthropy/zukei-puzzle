import type { GridPoint, Line } from "$lib/types";
import type { ShapeType } from "$lib/shapes";

/**
 * Type of hint: why (explains failure) or what (provides guidance)
 */
export type HintType = 'why' | 'what';

/**
 * Types of line highlighting for visual feedback
 */
export type LineHighlightType =
  | 'incorrect'     // Red - violates a rule
  | 'problematic'   // Orange - check this relationship
  | 'reference'     // Gray - for context
  | 'correct';      // Green - this is good (rare, for partial credit)

/**
 * Represents a line to be highlighted in the hint visualization
 */
export interface LineHighlight {
  from: GridPoint;
  to: GridPoint;
  highlightType: LineHighlightType;
  label?: string; // Optional label like "Length: 2.83"
}

/**
 * Represents a point to be highlighted in the hint visualization
 */
export interface PointHighlight {
  point: GridPoint;
  label?: string;
}

export interface AngleHighlight {
  vertex: GridPoint;        // The point where the angle is measured
  point1: GridPoint;        // First point forming the angle
  point2: GridPoint;        // Second point forming the angle
  angle: number;            // Angle in degrees
  highlightType: LineHighlightType;  // Same color scheme as lines
  label?: string;           // Optional label like "85°" or "Right angle"
}

/**
 * Complete hint data structure for display
 */
export interface HintData {
  type: HintType;
  title: string;
  message: string;
  lineHighlights: LineHighlight[];
  pointHighlights?: PointHighlight[];
  angleHighlights?: AngleHighlight[];
  detailedExplanation?: string; // Secondary text with more details
  imageUrl?: string; // Optional image/GIF to display in the hint
}

/**
 * Analysis of a user's shape attempt
 */
export interface ShapeAnalysis {
  userPoints: GridPoint[];
  userLines: Line[];
  targetShape: ShapeType;
  validationResult: {
    isValid: boolean;
    issues: GeometricIssue[];
  };
}

/**
 * Represents a specific geometric issue with the user's shape
 */
export interface GeometricIssue {
  issueType: IssueType;
  severity: 'critical' | 'warning';
  affectedLines: Line[];
  description: string;
  measurements?: Record<string, number>; // e.g., { "length": 2.83 }
}

/**
 * Types of geometric issues that can be identified
 */
export type IssueType =
  | 'wrong_point_count'
  | 'not_closed_polygon'
  | 'sides_not_equal'
  | 'sides_not_parallel'
  | 'angles_not_right'
  | 'not_isosceles';
