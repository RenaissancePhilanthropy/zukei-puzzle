import type { HintData, ShapeAnalysis, LineHighlight } from "./types";
import { calculateSideLengths, sortPointsClockwise, areParallel, arePerpendicular, linesToOrderedPoints } from "./utils";
import { GEOMETRY_TOLERANCES } from "$lib/constants/geometry";

/**
 * Analyzes a failed Rhombus attempt and generates explanatory hint.
 * @param analysis The shape analysis data
 * @returns HintData explaining why the shape is not a valid Rhombus
 */
export function analyzeRhombusFailure(analysis: ShapeAnalysis): HintData {
  const { userPoints, userLines } = analysis;

  // Check point count first
  if (userPoints.length !== 4) {
    return {
      type: 'why',
      title: 'Wrong Number of Points',
      message: 'A rhombus needs exactly 4 points to form a quadrilateral.',
      lineHighlights: [],
      pointHighlights: userPoints.map(p => ({ point: p }))
    };
  }

  // Sort points in clockwise order for consistent analysis
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const sideLengths = calculateSideLengths(sortedPoints);

  // Check if all sides are equal
  const allEqual = sideLengths.every(len =>
    Math.abs(len - sideLengths[0]) < GEOMETRY_TOLERANCES.sideLength
  );

  if (!allEqual) {
    // Create ordered lines from sorted points
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    // Highlight lines with their lengths
    const lineHighlights: LineHighlight[] = orderedLines.map((line, i) => {
      const length = sideLengths[i];
      const isUnequal = Math.abs(length - sideLengths[0]) >= GEOMETRY_TOLERANCES.sideLength;

      return {
        from: line.from,
        to: line.to,
        highlightType: isUnequal ? 'incorrect' : 'reference',
        label: `${length.toFixed(2)}`
      };
    });

    return {
      type: 'why',
      title: 'Sides Not Equal',
      message: 'All 4 sides of a rhombus must be equal length.',
      lineHighlights,
      detailedExplanation: `Your sides are: ${sideLengths.map(l => l.toFixed(2)).join(', ')} units. They should all be the same.`
    };
  }

  // Fallback for other issues
  return {
    type: 'why',
    title: 'Shape Mismatch',
    message: 'Your shape doesn\'t match the expected rhombus.',
    lineHighlights: []
  };
}

/**
 * Analyzes a failed Isosceles Triangle attempt and generates explanatory hint.
 * @param analysis The shape analysis data
 * @returns HintData explaining why the shape is not a valid Isosceles Triangle
 */
export function analyzeIsoscelesTriangleFailure(analysis: ShapeAnalysis): HintData {
  const { userPoints, userLines } = analysis;

  // Check point count first
  if (userPoints.length !== 3) {
    return {
      type: 'why',
      title: 'Wrong Number of Points',
      message: 'A triangle needs exactly 3 points.',
      lineHighlights: [],
      pointHighlights: userPoints.map(p => ({ point: p }))
    };
  }

  // Sort points for consistent analysis
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const sideLengths = calculateSideLengths(sortedPoints);

  // Check if any two sides are equal
  const hasEqualSides = sideLengths.some((len, i) =>
    sideLengths.some((len2, j) => i !== j &&
      Math.abs(len - len2) < GEOMETRY_TOLERANCES.sideLength
    )
  );

  if (!hasEqualSides) {
    // Create ordered lines from sorted points
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    // Highlight all lines with their lengths
    const lineHighlights: LineHighlight[] = orderedLines.map((line, i) => ({
      from: line.from,
      to: line.to,
      highlightType: 'problematic',
      label: `${sideLengths[i].toFixed(2)}`
    }));

    return {
      type: 'why',
      title: 'No Equal Sides',
      message: 'An isosceles triangle needs exactly 2 sides of equal length.',
      lineHighlights,
      detailedExplanation: `Your sides are: ${sideLengths.map(l => l.toFixed(2)).join(', ')} units. Two sides should be equal.`
    };
  }

  // Fallback
  return {
    type: 'why',
    title: 'Shape Mismatch',
    message: 'Your shape doesn\'t match the expected isosceles triangle.',
    lineHighlights: []
  };
}

/**
 * Analyzes a failed Rectangle attempt and generates explanatory hint.
 * @param analysis The shape analysis data
 * @returns HintData explaining why the shape is not a valid Rectangle
 */
export function analyzeRectangleFailure(analysis: ShapeAnalysis): HintData {
  const { userPoints, userLines } = analysis;

  // Check point count first
  if (userPoints.length !== 4) {
    return {
      type: 'why',
      title: 'Wrong Number of Points',
      message: 'A rectangle needs exactly 4 points.',
      lineHighlights: [],
      pointHighlights: userPoints.map(p => ({ point: p }))
    };
  }

  // Sort points for consistent analysis
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const sideLengths = calculateSideLengths(sortedPoints);

  // Check if opposite sides are equal
  const oppositeSidesEqual =
    Math.abs(sideLengths[0] - sideLengths[2]) < GEOMETRY_TOLERANCES.sideLength &&
    Math.abs(sideLengths[1] - sideLengths[3]) < GEOMETRY_TOLERANCES.sideLength;

  if (!oppositeSidesEqual) {
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    const lineHighlights: LineHighlight[] = orderedLines.map((line, i) => ({
      from: line.from,
      to: line.to,
      highlightType: 'incorrect',
      label: `${sideLengths[i].toFixed(2)}`
    }));

    return {
      type: 'why',
      title: 'Opposite Sides Not Equal',
      message: 'Opposite sides of a rectangle must be equal length.',
      lineHighlights,
      detailedExplanation: `Sides: ${sideLengths.map(l => l.toFixed(2)).join(', ')}. Opposite sides (1st & 3rd, 2nd & 4th) should be equal.`
    };
  }

  // Check if all angles are right angles
  const allRightAngles = sortedPoints.every((point, i) => {
    const prev = sortedPoints[(i + 3) % 4];
    const next = sortedPoints[(i + 1) % 4];
    return arePerpendicular(prev, point, next);
  });

  if (!allRightAngles) {
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    const lineHighlights: LineHighlight[] = orderedLines.map(line => ({
      from: line.from,
      to: line.to,
      highlightType: 'incorrect'
    }));

    return {
      type: 'why',
      title: 'Angles Not Right Angles',
      message: 'All corners of a rectangle must be 90-degree angles.',
      lineHighlights,
      detailedExplanation: 'Try using points that line up horizontally or vertically on the grid for perfect 90° angles.'
    };
  }

  // Fallback
  return {
    type: 'why',
    title: 'Shape Mismatch',
    message: 'Your shape doesn\'t match the expected rectangle.',
    lineHighlights: []
  };
}

/**
 * Analyzes a failed Parallelogram attempt and generates explanatory hint.
 * @param analysis The shape analysis data
 * @returns HintData explaining why the shape is not a valid Parallelogram
 */
export function analyzeParallelogramFailure(analysis: ShapeAnalysis): HintData {
  const { userPoints, userLines } = analysis;

  // Check point count first
  if (userPoints.length !== 4) {
    return {
      type: 'why',
      title: 'Wrong Number of Points',
      message: 'A parallelogram needs exactly 4 points.',
      lineHighlights: [],
      pointHighlights: userPoints.map(p => ({ point: p }))
    };
  }

  // Sort points for consistent analysis
  const sortedPoints = sortPointsClockwise([...userPoints]);
  const sideLengths = calculateSideLengths(sortedPoints);

  // Check if opposite sides are equal
  const oppositeSidesEqual =
    Math.abs(sideLengths[0] - sideLengths[2]) < GEOMETRY_TOLERANCES.sideLength &&
    Math.abs(sideLengths[1] - sideLengths[3]) < GEOMETRY_TOLERANCES.sideLength;

  if (!oppositeSidesEqual) {
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    const lineHighlights: LineHighlight[] = orderedLines.map((line, i) => ({
      from: line.from,
      to: line.to,
      highlightType: 'incorrect',
      label: `${sideLengths[i].toFixed(2)}`
    }));

    return {
      type: 'why',
      title: 'Opposite Sides Not Equal',
      message: 'Opposite sides of a parallelogram must be equal length.',
      lineHighlights,
      detailedExplanation: `Sides: ${sideLengths.map(l => l.toFixed(2)).join(', ')}. Opposite sides should be equal.`
    };
  }

  // Check if it's actually a rectangle (all right angles)
  const allRightAngles = sortedPoints.every((point, i) => {
    const prev = sortedPoints[(i + 3) % 4];
    const next = sortedPoints[(i + 1) % 4];
    return arePerpendicular(prev, point, next);
  });

  if (allRightAngles) {
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    const lineHighlights: LineHighlight[] = orderedLines.map(line => ({
      from: line.from,
      to: line.to,
      highlightType: 'problematic'
    }));

    return {
      type: 'why',
      title: 'This is a Rectangle',
      message: 'All angles are 90 degrees - this is a rectangle, not a parallelogram.',
      lineHighlights,
      detailedExplanation: 'A parallelogram must NOT have right angles at all corners. Try creating a "pushed over" rectangle with angles that aren\'t 90°.'
    };
  }

  // Check if opposite sides are parallel
  const side01Parallel = areParallel(sortedPoints[0], sortedPoints[1], sortedPoints[2], sortedPoints[3]);
  const side12Parallel = areParallel(sortedPoints[1], sortedPoints[2], sortedPoints[3], sortedPoints[0]);

  if (!side01Parallel || !side12Parallel) {
    const orderedLines = sortedPoints.map((point, i) => ({
      from: point,
      to: sortedPoints[(i + 1) % sortedPoints.length]
    }));

    const lineHighlights: LineHighlight[] = orderedLines.map((line, i) => {
      let highlightType: 'incorrect' | 'reference' = 'reference';

      // Highlight non-parallel opposite sides
      if ((i === 0 || i === 2) && !side01Parallel) {
        highlightType = 'incorrect';
      } else if ((i === 1 || i === 3) && !side12Parallel) {
        highlightType = 'incorrect';
      }

      return {
        from: line.from,
        to: line.to,
        highlightType
      };
    });

    return {
      type: 'why',
      title: 'Opposite Sides Not Parallel',
      message: 'Opposite sides of a parallelogram must be parallel.',
      lineHighlights,
      detailedExplanation: 'The highlighted sides should be parallel to their opposite sides.'
    };
  }

  // Fallback
  return {
    type: 'why',
    title: 'Shape Mismatch',
    message: 'Your shape doesn\'t match the expected parallelogram.',
    lineHighlights: []
  };
}

/**
 * Analyzes a failed Trapezoid attempt and generates explanatory hint.
 * @param analysis The shape analysis data
 * @returns HintData explaining why the shape is not a valid Trapezoid
 */
export function analyzeTrapezoidFailure(analysis: ShapeAnalysis): HintData {
  const { userPoints, userLines } = analysis;

  // Check point count first
  if (userPoints.length !== 4) {
    return {
      type: 'why',
      title: 'Wrong Number of Points',
      message: 'A trapezoid needs exactly 4 points.',
      lineHighlights: [],
      pointHighlights: userPoints.map(p => ({ point: p }))
    };
  }

  // Sort points for consistent analysis
  const sortedPoints = sortPointsClockwise([...userPoints]);

  // Check if opposite sides are parallel
  const side01Parallel = areParallel(sortedPoints[0], sortedPoints[1], sortedPoints[2], sortedPoints[3]);
  const side12Parallel = areParallel(sortedPoints[1], sortedPoints[2], sortedPoints[3], sortedPoints[0]);

  const orderedLines = sortedPoints.map((point, i) => ({
    from: point,
    to: sortedPoints[(i + 1) % sortedPoints.length]
  }));

  // If no parallel sides
  if (!side01Parallel && !side12Parallel) {
    const lineHighlights: LineHighlight[] = orderedLines.map(line => ({
      from: line.from,
      to: line.to,
      highlightType: 'incorrect'
    }));

    return {
      type: 'why',
      title: 'No Parallel Sides',
      message: 'A trapezoid needs exactly one pair of opposite sides that are parallel.',
      lineHighlights,
      detailedExplanation: 'None of your opposite sides are parallel. Try using points that share the same row or column for at least one pair of opposite sides.'
    };
  }

  // If both pairs are parallel (it's a parallelogram)
  if (side01Parallel && side12Parallel) {
    const lineHighlights: LineHighlight[] = orderedLines.map(line => ({
      from: line.from,
      to: line.to,
      highlightType: 'problematic'
    }));

    return {
      type: 'why',
      title: 'Too Many Parallel Sides',
      message: 'Both pairs of opposite sides are parallel - this is a parallelogram, not a trapezoid.',
      lineHighlights,
      detailedExplanation: 'A trapezoid must have exactly ONE pair of parallel sides. Your shape has both pairs parallel, making it a parallelogram.'
    };
  }

  // Fallback
  return {
    type: 'why',
    title: 'Shape Mismatch',
    message: 'Your shape doesn\'t match the expected trapezoid.',
    lineHighlights: []
  };
}
