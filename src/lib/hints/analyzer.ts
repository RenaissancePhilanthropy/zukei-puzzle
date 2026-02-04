import type { HintData, ShapeAnalysis, GeometricIssue } from "./types";
import type { GridPoint, Line } from "$lib/types";
import type { ShapeType } from "$lib/shapes";
import { isClosedPolygon, sortPointsClockwise } from "./utils";
import {
  analyzeRhombusFailure,
  analyzeIsoscelesTriangleFailure,
  analyzeRectangleFailure,
  analyzeParallelogramFailure,
  analyzeTrapezoidFailure
} from "./shapeAnalyzers";
import {
  getRhombusGuidance,
  getIsoscelesTriangleGuidance,
  getRectangleGuidance,
  getParallelogramGuidance,
  getTrapezoidGuidance,
  getRhombusSuccess,
  getIsoscelesTriangleSuccess,
  getRectangleSuccess,
  getParallelogramSuccess,
  getTrapezoidSuccess
} from "./guidance";

/**
 * Generates a "why" hint that explains why the user's shape is incorrect.
 * @param analysis The shape analysis containing user's attempt and validation results
 * @returns HintData with explanatory feedback
 */
export function generateWhyHint(analysis: ShapeAnalysis): HintData {
  const { targetShape } = analysis;

  // Dispatch to shape-specific analyzer
  switch (targetShape) {
    case 'Rhombus':
      return analyzeRhombusFailure(analysis);
    case 'IsoscelesTriangle':
      return analyzeIsoscelesTriangleFailure(analysis);
    case 'Rectangle':
      return analyzeRectangleFailure(analysis);
    case 'Parallelogram':
      return analyzeParallelogramFailure(analysis);
    case 'Trapezoid':
      return analyzeTrapezoidFailure(analysis);
    default:
      return {
        type: 'why',
        title: 'Shape Mismatch',
        message: 'Your shape doesn\'t match the expected shape.',
        lineHighlights: []
      };
  }
}

/**
 * Generates a "what" hint that provides guidance about the target shape's properties.
 * @param targetShape The shape type to provide guidance for
 * @returns HintData with guidance information
 */
export function generateWhatHint(targetShape: ShapeType): HintData {
  // Dispatch to shape-specific guidance generator
  switch (targetShape) {
    case 'Rhombus':
      return getRhombusGuidance();
    case 'IsoscelesTriangle':
      return getIsoscelesTriangleGuidance();
    case 'Rectangle':
      return getRectangleGuidance();
    case 'Parallelogram':
      return getParallelogramGuidance();
    case 'Trapezoid':
      return getTrapezoidGuidance();
    default:
      return {
        type: 'what',
        title: 'Shape Properties',
        message: 'Look for points that form the target shape.',
        lineHighlights: []
      };
  }
}

/**
 * Generates a success hint that shows the correct shape with descriptions and highlights.
 * For shapes with parallel sides, highlights them with different colors.
 * @param targetShape The shape type that was solved
 * @param userPoints The points in the correct shape
 * @returns HintData with success message and visualization
 */
export function generateSuccessHint(targetShape: ShapeType, userPoints: GridPoint[]): HintData {
  // Dispatch to shape-specific success generator
  switch (targetShape) {
    case 'Rhombus':
      return getRhombusSuccess(userPoints);
    case 'IsoscelesTriangle':
      return getIsoscelesTriangleSuccess(userPoints);
    case 'Rectangle':
      return getRectangleSuccess(userPoints);
    case 'Parallelogram':
      return getParallelogramSuccess(userPoints);
    case 'Trapezoid':
      return getTrapezoidSuccess(userPoints);
    default:
      return {
        type: 'what',
        title: 'Success!',
        message: 'You solved the puzzle!',
        lineHighlights: []
      };
  }
}

/**
 * Analyzes the user's attempt and identifies geometric issues.
 * @param targetShape The expected shape type
 * @param userPoints The points in the user's shape
 * @param userLines The lines in the user's shape
 * @returns ShapeAnalysis with validation results and identified issues
 */
export function analyzeUserAttempt(
  targetShape: ShapeType,
  userPoints: GridPoint[],
  userLines: Line[]
): ShapeAnalysis {
  const issues: GeometricIssue[] = [];

  // Check point count
  const expectedPoints = targetShape === 'IsoscelesTriangle' ? 3 : 4;
  if (userPoints.length !== expectedPoints) {
    issues.push({
      issueType: 'wrong_point_count',
      severity: 'critical',
      affectedLines: [],
      description: `Expected ${expectedPoints} points, found ${userPoints.length}`,
      measurements: { expected: expectedPoints, actual: userPoints.length }
    });
  }

  // Check if polygon is closed
  if (userLines.length > 0 && !isClosedPolygon(userLines)) {
    issues.push({
      issueType: 'not_closed_polygon',
      severity: 'critical',
      affectedLines: userLines,
      description: 'Lines do not form a closed polygon'
    });
  }

  return {
    userPoints: sortPointsClockwise([...userPoints]),
    userLines,
    targetShape,
    validationResult: {
      isValid: issues.length === 0,
      issues
    }
  };
}
