import type { HintData, LineHighlight } from "./types";
import type { GridPoint, Line } from "$lib/types";
import { sortPointsClockwise, areParallel } from "./utils";

/**
 * Returns guidance hint for Rhombus shape.
 * Shows example rhombus shapes to demonstrate the properties.
 */
export function getRhombusGuidance(): HintData {
  // Example rhombus 1: Diamond orientation
  const example1: GridPoint[] = [
    { row: 1, column: 2 },
    { row: 0, column: 0 },
    { row: 1, column: -2 },
    { row: 2, column: 0 }
  ];

  // Example 2: Square (special rhombus with right angles)
  const example2: GridPoint[] = [
    { row: 0, column: 4 },
    { row: 0, column: 6 },
    { row: 2, column: 6 },
    { row: 2, column: 4 }
  ];

  const lineHighlights: LineHighlight[] = [
    // Example 1
    { from: example1[0], to: example1[1], highlightType: 'correct', label: '2.83' },
    { from: example1[1], to: example1[2], highlightType: 'correct', label: '2.83' },
    { from: example1[2], to: example1[3], highlightType: 'correct', label: '2.83' },
    { from: example1[3], to: example1[0], highlightType: 'correct', label: '2.83' },
    // Example 2
    { from: example2[0], to: example2[1], highlightType: 'problematic', label: '2.24' },
    { from: example2[1], to: example2[2], highlightType: 'problematic', label: '2.24' },
    { from: example2[2], to: example2[3], highlightType: 'problematic', label: '2.24' },
    { from: example2[3], to: example2[0], highlightType: 'problematic', label: '2.24' }
  ];

  return {
    type: 'what',
    title: 'Rhombus Properties',
    message: 'A rhombus has 4 sides that are all equal length. Here are two example rhombi (shown in different colors).',
    lineHighlights,
    detailedExplanation: 'All four sides must be exactly the same length. A rhombus can be oriented in any direction - it doesn\'t have to be axis-aligned.'
  };
}

/**
 * Returns success hint for Rhombus shape.
 * Shows the correct shape with parallel sides highlighted.
 */
export function getRhombusSuccess(userPoints: GridPoint[]): HintData {
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const lineHighlights: LineHighlight[] = [
    { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'correct' },
    { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'correct' },
    { from: sortedPoints[2], to: sortedPoints[3], highlightType: 'correct' },
    { from: sortedPoints[3], to: sortedPoints[0], highlightType: 'correct' }
  ];

  return {
    type: 'what',
    title: 'Correct! Rhombus',
    message: 'Perfect! You found a rhombus - a quadrilateral with all four sides equal in length.',
    lineHighlights,
    detailedExplanation: 'A rhombus has opposite sides that are parallel. All four sides are equal, making it a special type of parallelogram.'
  };
}

/**
 * Returns guidance hint for Isosceles Triangle shape.
 * Shows example isosceles triangles to demonstrate the properties.
 */
export function getIsoscelesTriangleGuidance(): HintData {
  // Example 1: Upward-pointing isosceles triangle
  const example1: GridPoint[] = [
    { row: 2, column: 1 },  // apex
    { row: 0, column: 0 },  // base left
    { row: 0, column: 2 }   // base right
  ];

  // Example 2: Different orientation
  const example2: GridPoint[] = [
    { row: 0, column: 5 },
    { row: -2, column: 7 },
    { row: 1, column: 7 }
  ];

  const lineHighlights: LineHighlight[] = [
    // Example 1 - equal sides
    { from: example1[0], to: example1[1], highlightType: 'correct', label: '2.83' },
    { from: example1[0], to: example1[2], highlightType: 'correct', label: '2.83' },
    { from: example1[1], to: example1[2], highlightType: 'reference', label: '2.00' },
    // Example 2 - equal sides
    { from: example2[0], to: example2[1], highlightType: 'problematic', label: '2.83' },
    { from: example2[0], to: example2[2], highlightType: 'problematic', label: '2.83' },
    { from: example2[1], to: example2[2], highlightType: 'reference', label: '3.00' }
  ];

  return {
    type: 'what',
    title: 'Isosceles Triangle Properties',
    message: 'An isosceles triangle has exactly 2 sides of equal length. Here are two examples.',
    lineHighlights,
    detailedExplanation: 'The two equal sides (shown in green/orange) are called the legs. The third side (shown in gray) is called the base and can be any length.'
  };
}

/**
 * Returns success hint for Isosceles Triangle shape.
 */
export function getIsoscelesTriangleSuccess(userPoints: GridPoint[]): HintData {
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const lineHighlights: LineHighlight[] = [
    { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'correct' },
    { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'correct' },
    { from: sortedPoints[2], to: sortedPoints[0], highlightType: 'correct' }
  ];

  return {
    type: 'what',
    title: 'Correct! Isosceles Triangle',
    message: 'Perfect! You found an isosceles triangle - a triangle with two sides of equal length.',
    lineHighlights,
    detailedExplanation: 'In an isosceles triangle, two sides (called the legs) are equal in length, while the third side (the base) can be different.'
  };
}

/**
 * Returns guidance hint for Rectangle shape.
 * Shows example rectangles with parallel sides highlighted.
 */
export function getRectangleGuidance(): HintData {
  // Example rectangle
  const example: GridPoint[] = [
    { row: 0, column: 0 },
    { row: 0, column: 3 },
    { row: 2, column: 3 },
    { row: 2, column: 0 }
  ];

  const lineHighlights: LineHighlight[] = [
    { from: example[0], to: example[1], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: example[1], to: example[2], highlightType: 'problematic', label: 'Parallel Pair 2' },
    { from: example[2], to: example[3], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: example[3], to: example[0], highlightType: 'problematic', label: 'Parallel Pair 2' }
  ];

  return {
    type: 'what',
    title: 'Rectangle Properties',
    message: 'A rectangle has two pairs of parallel sides (shown in different colors) and all corners at 90-degree angles.',
    lineHighlights,
    detailedExplanation: 'Opposite sides are equal and parallel. All four angles are right angles (90°). Use points that are aligned horizontally or vertically on the grid.'
  };
}

/**
 * Returns success hint for Rectangle shape.
 * Highlights both pairs of parallel sides in different colors.
 */
export function getRectangleSuccess(userPoints: GridPoint[]): HintData {
  const sortedPoints = sortPointsClockwise([...userPoints]);

  // Highlight opposite sides with different colors
  // Sides 0-1 and 2-3 are one pair (use one color)
  // Sides 1-2 and 3-0 are the other pair (use another color)
  const lineHighlights: LineHighlight[] = [
    { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'problematic', label: 'Parallel Pair 2' },
    { from: sortedPoints[2], to: sortedPoints[3], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: sortedPoints[3], to: sortedPoints[0], highlightType: 'problematic', label: 'Parallel Pair 2' }
  ];

  return {
    type: 'what',
    title: 'Correct! Rectangle',
    message: 'Perfect! You found a rectangle - a quadrilateral with opposite sides equal and all angles at 90 degrees.',
    lineHighlights,
    detailedExplanation: 'A rectangle has two pairs of parallel sides (shown in different colors). Both pairs of opposite sides are equal in length, and all four angles are right angles.'
  };
}

/**
 * Returns guidance hint for Parallelogram shape.
 * Shows an example parallelogram with parallel sides highlighted.
 */
export function getParallelogramGuidance(): HintData {
  // Example parallelogram (pushed over rectangle)
  const example: GridPoint[] = [
    { row: 0, column: 0 },
    { row: 0, column: 3 },
    { row: 2, column: 4 },
    { row: 2, column: 1 }
  ];

  const lineHighlights: LineHighlight[] = [
    { from: example[0], to: example[1], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: example[1], to: example[2], highlightType: 'problematic', label: 'Parallel Pair 2' },
    { from: example[2], to: example[3], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: example[3], to: example[0], highlightType: 'problematic', label: 'Parallel Pair 2' }
  ];

  return {
    type: 'what',
    title: 'Parallelogram Properties',
    message: 'A parallelogram has two pairs of parallel sides (shown in different colors). It looks like a "pushed over" rectangle.',
    lineHighlights,
    detailedExplanation: 'Opposite sides are parallel and equal in length. Unlike a rectangle, the angles are NOT 90 degrees - if all angles are right angles, it would be a rectangle instead.'
  };
}

/**
 * Returns success hint for Parallelogram shape.
 * Highlights both pairs of parallel sides in different colors.
 */
export function getParallelogramSuccess(userPoints: GridPoint[]): HintData {
  const sortedPoints = sortPointsClockwise([...userPoints]);

  const lineHighlights: LineHighlight[] = [
    { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'problematic', label: 'Parallel Pair 2' },
    { from: sortedPoints[2], to: sortedPoints[3], highlightType: 'correct', label: 'Parallel Pair 1' },
    { from: sortedPoints[3], to: sortedPoints[0], highlightType: 'problematic', label: 'Parallel Pair 2' }
  ];

  return {
    type: 'what',
    title: 'Correct! Parallelogram',
    message: 'Perfect! You found a parallelogram - a quadrilateral with opposite sides parallel and equal.',
    lineHighlights,
    detailedExplanation: 'A parallelogram has two pairs of parallel sides (shown in different colors). Opposite sides are equal in length and parallel to each other.'
  };
}

/**
 * Returns guidance hint for Trapezoid shape.
 * Shows an example trapezoid with the parallel sides highlighted.
 */
export function getTrapezoidGuidance(): HintData {
  // Example trapezoid
  const example: GridPoint[] = [
    { row: 0, column: 0 },
    { row: 0, column: 3 },
    { row: 2, column: 2 },
    { row: 2, column: 1 }
  ];

  const lineHighlights: LineHighlight[] = [
    { from: example[0], to: example[1], highlightType: 'correct', label: 'Parallel' },
    { from: example[1], to: example[2], highlightType: 'reference', label: 'Not Parallel' },
    { from: example[2], to: example[3], highlightType: 'correct', label: 'Parallel' },
    { from: example[3], to: example[0], highlightType: 'reference', label: 'Not Parallel' }
  ];

  return {
    type: 'what',
    title: 'Trapezoid Properties',
    message: 'A trapezoid has exactly ONE pair of parallel sides (shown in green). The other pair is NOT parallel (shown in gray).',
    lineHighlights,
    detailedExplanation: 'Only one pair of opposite sides should be parallel. If both pairs are parallel, it would be a parallelogram instead. Use points that share the same row or column for the parallel sides.'
  };
}

/**
 * Returns success hint for Trapezoid shape.
 * Highlights the parallel pair in one color and non-parallel sides in another.
 */
export function getTrapezoidSuccess(userPoints: GridPoint[]): HintData {
  const sortedPoints = sortPointsClockwise([...userPoints]);

  // Determine which pair of opposite sides is parallel
  const side01Parallel = areParallel(sortedPoints[0], sortedPoints[1], sortedPoints[2], sortedPoints[3]);
  const side12Parallel = areParallel(sortedPoints[1], sortedPoints[2], sortedPoints[3], sortedPoints[0]);

  let lineHighlights: LineHighlight[];

  if (side01Parallel) {
    // Sides 0-1 and 2-3 are parallel
    lineHighlights = [
      { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'correct', label: 'Parallel' },
      { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'reference', label: 'Not Parallel' },
      { from: sortedPoints[2], to: sortedPoints[3], highlightType: 'correct', label: 'Parallel' },
      { from: sortedPoints[3], to: sortedPoints[0], highlightType: 'reference', label: 'Not Parallel' }
    ];
  } else if (side12Parallel) {
    // Sides 1-2 and 3-0 are parallel
    lineHighlights = [
      { from: sortedPoints[0], to: sortedPoints[1], highlightType: 'reference', label: 'Not Parallel' },
      { from: sortedPoints[1], to: sortedPoints[2], highlightType: 'correct', label: 'Parallel' },
      { from: sortedPoints[2], to: sortedPoints[3], highlightType: 'reference', label: 'Not Parallel' },
      { from: sortedPoints[3], to: sortedPoints[0], highlightType: 'correct', label: 'Parallel' }
    ];
  } else {
    // Fallback if neither is detected (shouldn't happen for a valid trapezoid)
    lineHighlights = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length],
      highlightType: 'correct' as const
    }));
  }

  return {
    type: 'what',
    title: 'Correct! Trapezoid',
    message: 'Perfect! You found a trapezoid - a quadrilateral with exactly one pair of parallel sides.',
    lineHighlights,
    detailedExplanation: 'A trapezoid has exactly one pair of parallel sides (shown in green). The other pair of sides are not parallel (shown in gray).'
  };
}
