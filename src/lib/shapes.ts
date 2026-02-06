import type { GridPoint } from "./types";
import { GEOMETRY_TOLERANCES } from "./constants/geometry";

/**
 * Type-safe shape types
 */
export type ShapeType =
    | 'Rhombus'
    | 'IsoscelesTriangle'
    | 'Parallelogram'
    | 'Trapezoid'
    | 'Rectangle';

/**
 * Available shape types
 */
export const ShapeTypes: Record<ShapeType, ShapeType> = {
    Rhombus: 'Rhombus',
    IsoscelesTriangle: 'IsoscelesTriangle',
    Parallelogram: 'Parallelogram',
    Trapezoid: 'Trapezoid',
    Rectangle: 'Rectangle',
};

/**
 * Validates if the given points form a shape of the specified type.
 * @param shapeType Expected shape type
 * @param points Set of points making up shape
 * @returns True if points make a shape of shapeType
 */
export const validateShape = (shapeType: ShapeType, points: GridPoint[]): boolean => {
    if(points.length < 3) {
        return false;
    }

    if(points.length > 4) {
        return false;
    }

    const centerX = points.reduce((sum, p) => sum + p.column, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.row, 0) / points.length;

    // Sort points in clockwise order
    let sortedPoints = [...points];
    sortedPoints.sort((a, b) => {
        const angleA = Math.atan2(a.row - centerY, a.column - centerX);
        const angleB = Math.atan2(b.row - centerY, b.column - centerX);
        return angleA - angleB;
    });

    // Shape-specific validation logic
    if(sortedPoints.length === 3) {
        // Triangle validation logic here
        if(shapeType === ShapeTypes.IsoscelesTriangle) {
            const sideLengths = calculateSideLengths(sortedPoints);

            sideLengths.sort((a, b) => a - b);

            // If two sides are equal (within tolerance), it's isosceles
            if(Math.abs(sideLengths[0] - sideLengths[1]) < GEOMETRY_TOLERANCES.sideLength ||
               Math.abs(sideLengths[1] - sideLengths[2]) < GEOMETRY_TOLERANCES.sideLength) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else if (sortedPoints.length === 4) {
        const sideLengths = calculateSideLengths(sortedPoints);

        const angles = [
            Math.atan2(sortedPoints[1].row - sortedPoints[0].row, sortedPoints[1].column - sortedPoints[0].column) - Math.atan2(sortedPoints[3].row - sortedPoints[0].row, sortedPoints[3].column - sortedPoints[0].column),
            Math.atan2(sortedPoints[2].row - sortedPoints[1].row, sortedPoints[2].column - sortedPoints[1].column) - Math.atan2(sortedPoints[0].row - sortedPoints[1].row, sortedPoints[0].column - sortedPoints[1].column),
            Math.atan2(sortedPoints[3].row - sortedPoints[2].row, sortedPoints[3].column - sortedPoints[2].column) - Math.atan2(sortedPoints[1].row - sortedPoints[2].row, sortedPoints[1].column - sortedPoints[2].column),
            Math.atan2(sortedPoints[0].row - sortedPoints[3].row, sortedPoints[0].column - sortedPoints[3].column) - Math.atan2(sortedPoints[2].row - sortedPoints[3].row, sortedPoints[2].column - sortedPoints[3].column),
        ];

        const oppositeSidesEqual = (sideLengths[0] === sideLengths[2]) && (sideLengths[1] === sideLengths[3]);

        // Quadrilateral validation logic here
        if(shapeType === ShapeTypes.Rhombus) {
            // Rhombus validation logic here
            const allSidesEqual = sideLengths.every(length => length === sideLengths[0]);
            
            if(allSidesEqual) {
                return true;
            } else {
                return false;
            }
        } else if(shapeType === ShapeTypes.Parallelogram) {
            // Parallelogram validation logic here
            if(!oppositeSidesEqual) {
                return false;
            }

            if (Math.abs(angles[0]) < GEOMETRY_TOLERANCES.angle || Math.abs(angles[1]) < GEOMETRY_TOLERANCES.angle || Math.abs(angles[2]) < GEOMETRY_TOLERANCES.angle || Math.abs(angles[3]) < GEOMETRY_TOLERANCES.angle) {
                return false;
            }

            return true;
            
        } else if(shapeType === ShapeTypes.Trapezoid) {
            // Trapezoid validation: check if at least one pair of opposite sides is parallel
            const side01Parallel = areParallel(sortedPoints[0], sortedPoints[1], sortedPoints[2], sortedPoints[3]);
            const side12Parallel = areParallel(sortedPoints[1], sortedPoints[2], sortedPoints[3], sortedPoints[0]);

            if(side01Parallel || side12Parallel) {
                return true;
            } else {
                return false;
            }
        } else if(shapeType === ShapeTypes.Rectangle) {
            // Rectangle validation: opposite sides equal AND all angles are 90 degrees
            if (!oppositeSidesEqual) {
                return false;
            }

            // Check if all angles are right angles by checking if adjacent sides are perpendicular
            // For each vertex, check if the dot product of adjacent edge vectors is zero
            for (let i = 0; i < 4; i++) {
                const prev = sortedPoints[(i + 3) % 4];
                const curr = sortedPoints[i];
                const next = sortedPoints[(i + 1) % 4];

                // Vectors from current point to adjacent points
                const v1x = prev.column - curr.column;
                const v1y = prev.row - curr.row;
                const v2x = next.column - curr.column;
                const v2y = next.row - curr.row;

                // Dot product should be zero for perpendicular vectors
                const dotProduct = v1x * v2x + v1y * v2y;
                if (Math.abs(dotProduct) > GEOMETRY_TOLERANCES.vector) {
                    return false;
                }
            }

            return true;
        }
    }

    return false;
};

/**
 * Helper function to create a GridPoint
 */
function createPoint(row: number, column: number): GridPoint {
    return { row, column };
}

/**
 * Calculates the side lengths of a polygon formed by the given points.
 * Returns an array where each element is the distance from point i to point (i+1) % n.
 */
function calculateSideLengths(points: GridPoint[]): number[] {
    return points.map((point, i) => {
        const next = points[(i + 1) % points.length];
        return Math.hypot(next.column - point.column, next.row - point.row);
    });
}

/**
 * Check if two line segments are parallel by comparing their slopes
 */
function areParallel(p1: GridPoint, p2: GridPoint, p3: GridPoint, p4: GridPoint): boolean {
    const dx1 = p2.column - p1.column;
    const dy1 = p2.row - p1.row;
    const dx2 = p4.column - p3.column;
    const dy2 = p4.row - p3.row;

    // Check if both are vertical lines
    if (Math.abs(dx1) < GEOMETRY_TOLERANCES.parallelCheck && Math.abs(dx2) < GEOMETRY_TOLERANCES.parallelCheck) {
        return true;
    }

    // Check if both are horizontal lines
    if (Math.abs(dy1) < GEOMETRY_TOLERANCES.parallelCheck && Math.abs(dy2) < GEOMETRY_TOLERANCES.parallelCheck) {
        return true;
    }

    // Check if slopes are equal: dy1/dx1 === dy2/dx2
    // Rearranged to avoid division: dy1 * dx2 === dy2 * dx1
    const crossProduct = Math.abs(dy1 * dx2 - dy2 * dx1);
    return crossProduct < GEOMETRY_TOLERANCES.parallelCheck;
}

/**
 * Helper function to get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a diamond-shaped rhombus centered in the available space.
 * Used as a fallback when other rhombus orientations don't fit the grid.
 */
function generateDiamondFallback(gridWidth: number, gridHeight: number): GridPoint[] {
    const centerX = randomInt(1, Math.max(1, gridWidth - 1));
    const centerY = randomInt(1, Math.max(1, gridHeight - 1));
    const size = Math.min(centerX, gridWidth - centerX, centerY, gridHeight - centerY);

    return [
        createPoint(centerY - size, centerX),      // Top
        createPoint(centerY, centerX + size),      // Right
        createPoint(centerY + size, centerX),      // Bottom
        createPoint(centerY, centerX - size)       // Left
    ];
}

/**
 * Generates a shape at a random position based on the specified type within the given grid dimensions.
 * @param shapeType Type of shape to generate
 * @param gridWidth Width of the grid (number of columns)
 * @param gridHeight Height of the grid (number of rows)
 * @returns Array of GridPoints representing the generated shape
 */
export const generateShape = (shapeType: ShapeType, gridWidth: number, gridHeight: number): GridPoint[] => {
    if (shapeType === ShapeTypes.Rhombus) {
        return generateRhombus(gridWidth, gridHeight);
    } else if (shapeType === ShapeTypes.IsoscelesTriangle) {
        return generateIsoscelesTriangle(gridWidth, gridHeight);
    } else if (shapeType === ShapeTypes.Parallelogram) {
        return generateParallelogram(gridWidth, gridHeight);
    } else if (shapeType === ShapeTypes.Trapezoid) {
        return generateTrapezoid(gridWidth, gridHeight);
    } else if (shapeType === ShapeTypes.Rectangle) {
        return generateRectangle(gridWidth, gridHeight);
    } else {
        return [];
    }
};

/**
 * Generates a rhombus (all sides equal)
 */
function generateRhombus(gridWidth: number, gridHeight: number): GridPoint[] {
    // For very small grids, use a simple grid-aligned square rhombus
    if (gridWidth <= 2 || gridHeight <= 2) {
        const baseX = 0;
        const baseY = 0;
        const size = Math.min(gridWidth, gridHeight, 2);
        return [
            createPoint(baseY, baseX),
            createPoint(baseY, baseX + size),
            createPoint(baseY + size, baseX + size),
            createPoint(baseY + size, baseX)
        ];
    }

    // Choose between different rhombus orientations for variety
    const orientation = Math.random();

    if (orientation < 0.25) {
        // Diamond orientation (aligned with grid diagonals)
        const centerX = randomInt(1, Math.max(1, gridWidth - 1));
        const centerY = randomInt(1, Math.max(1, gridHeight - 1));
        const size = Math.min(centerX, gridWidth - centerX, centerY, gridHeight - centerY);

        return [
            createPoint(centerY - size, centerX),      // Top
            createPoint(centerY, centerX + size),      // Right
            createPoint(centerY + size, centerX),      // Bottom
            createPoint(centerY, centerX - size)       // Left
        ];
    } else if (orientation < 0.5) {
        // Grid-aligned square rhombus
        const baseX = randomInt(0, gridWidth - 2);
        const baseY = randomInt(0, gridHeight - 2);
        const size = Math.min(2, gridWidth - baseX, gridHeight - baseY);

        return [
            createPoint(baseY, baseX),
            createPoint(baseY, baseX + size),
            createPoint(baseY + size, baseX + size),
            createPoint(baseY + size, baseX)
        ];
    } else {
        // Skinny rhombus with varied angles
        // Strategy: Create a line (horizontal or vertical), place two endpoints on it,
        // then place two more points equidistant from the midpoint

        const isHorizontal = Math.random() < 0.5;

        // Check if grid is large enough for skinny rhombus (need at least 3 units)
        if (gridWidth < 3 || gridHeight < 3) {
            // Fall back to diamond for small grids
            return generateDiamondFallback(gridWidth, gridHeight);
        }

        if (isHorizontal) {
            // Horizontal line
            // Use EVEN distance (2 or 4) so midpoint is an integer
            // This corresponds to odd number of points (3 or 5)
            const lineDistance = 2 * randomInt(1, 2); // 2 or 4

            // Make sure line fits: lineEndX = lineStartX + lineDistance must be <= gridWidth
            if (lineDistance > gridWidth) {
                // Fallback to diamond
                return generateDiamondFallback(gridWidth, gridHeight);
            }

            // Constrain perpDistance to fit within grid bounds
            // Need: lineY - perpDistance >= 0 AND lineY + perpDistance <= gridHeight
            // So perpDistance must be at most floor(gridHeight / 2)
            const maxPerpDistance = Math.floor(gridHeight / 2);
            if (maxPerpDistance < 1) {
                return generateDiamondFallback(gridWidth, gridHeight);
            }
            const perpDistance = randomInt(1, Math.min(2, maxPerpDistance));

            // Position the line
            const lineY = randomInt(perpDistance, gridHeight - perpDistance);
            const lineStartX = randomInt(0, gridWidth - lineDistance);
            const lineEndX = lineStartX + lineDistance;

            // Midpoint of the line (now guaranteed to be integer)
            const midX = lineStartX + lineDistance / 2;

            // Four points of the rhombus
            const p1 = createPoint(lineY, lineStartX);           // Left endpoint
            const p2 = createPoint(lineY - perpDistance, midX);   // Top point
            const p3 = createPoint(lineY, lineEndX);              // Right endpoint
            const p4 = createPoint(lineY + perpDistance, midX);   // Bottom point

            return [p1, p2, p3, p4];
        } else {
            // Vertical line
            const lineDistance = 2 * randomInt(1, 2); // 2 or 4

            if (lineDistance > gridHeight) {
                // Fallback to diamond
                return generateDiamondFallback(gridWidth, gridHeight);
            }

            // Constrain perpDistance to fit within grid bounds
            // Need: lineX - perpDistance >= 0 AND lineX + perpDistance <= gridWidth
            // So perpDistance must be at most floor(gridWidth / 2)
            const maxPerpDistance = Math.floor(gridWidth / 2);
            if (maxPerpDistance < 1) {
                return generateDiamondFallback(gridWidth, gridHeight);
            }
            const perpDistance = randomInt(1, Math.min(2, maxPerpDistance));

            // Position the line
            const lineX = randomInt(perpDistance, gridWidth - perpDistance);
            const lineStartY = randomInt(0, gridHeight - lineDistance);
            const lineEndY = lineStartY + lineDistance;

            // Midpoint of the line (now guaranteed to be integer)
            const midY = lineStartY + lineDistance / 2;

            // Four points of the rhombus
            const p1 = createPoint(lineStartY, lineX);            // Top endpoint
            const p2 = createPoint(midY, lineX + perpDistance);   // Right point
            const p3 = createPoint(lineEndY, lineX);              // Bottom endpoint
            const p4 = createPoint(midY, lineX - perpDistance);   // Left point

            return [p1, p2, p3, p4];
        }
    }
}

/**
 * Generates an isosceles triangle (two sides equal)
 */
function generateIsoscelesTriangle(gridWidth: number, gridHeight: number): GridPoint[] {
    const orientation = randomInt(0, 3);

    if (orientation === 0) {
        // Base at bottom, apex at top
        const baseY = randomInt(2, gridHeight);
        const apexY = randomInt(0, baseY - 2);
        const apexX = randomInt(1, gridWidth - 1);
        const baseWidth = Math.min(apexX, gridWidth - apexX, baseY - apexY);

        return [
            createPoint(apexY, apexX),                      // Apex
            createPoint(baseY, apexX - baseWidth),          // Base left
            createPoint(baseY, apexX + baseWidth)           // Base right
        ];
    } else if (orientation === 1) {
        // Base at top, apex at bottom
        const baseY = randomInt(0, gridHeight - 2);
        const apexY = randomInt(baseY + 2, gridHeight);
        const apexX = randomInt(1, gridWidth - 1);
        const baseWidth = Math.min(apexX, gridWidth - apexX, apexY - baseY);

        return [
            createPoint(baseY, apexX - baseWidth),          // Base left
            createPoint(baseY, apexX + baseWidth),          // Base right
            createPoint(apexY, apexX)                       // Apex
        ];
    } else if (orientation === 2) {
        // Base on left, apex on right
        const baseX = randomInt(0, gridWidth - 2);
        const apexX = randomInt(baseX + 2, gridWidth);
        const apexY = randomInt(1, gridHeight - 1);
        const baseHeight = Math.min(apexY, gridHeight - apexY, apexX - baseX);

        return [
            createPoint(apexY - baseHeight, baseX),         // Base top
            createPoint(apexY + baseHeight, baseX),         // Base bottom
            createPoint(apexY, apexX)                       // Apex
        ];
    } else {
        // Base on right, apex on left
        const baseX = randomInt(2, gridWidth);
        const apexX = randomInt(0, baseX - 2);
        const apexY = randomInt(1, gridHeight - 1);
        const baseHeight = Math.min(apexY, gridHeight - apexY, baseX - apexX);

        return [
            createPoint(apexY, apexX),                      // Apex
            createPoint(apexY - baseHeight, baseX),         // Base top
            createPoint(apexY + baseHeight, baseX)          // Base bottom
        ];
    }
}

/**
 * Generates a parallelogram (opposite sides parallel and equal)
 */
function generateParallelogram(gridWidth: number, gridHeight: number): GridPoint[] {
    // Ensure we have enough space for a parallelogram
    const w = randomInt(2, Math.min(3, Math.max(2, gridWidth - 1)));
    const h = randomInt(1, Math.min(2, Math.max(1, gridHeight - 1)));
    const skew = randomInt(1, Math.min(2, Math.max(1, gridWidth - w - 1)));

    // Calculate safe starting position that keeps all points in bounds
    const maxBaseX = gridWidth - w - skew;
    const maxBaseY = gridHeight - h;
    const baseX = randomInt(0, Math.max(0, maxBaseX));
    const baseY = randomInt(0, Math.max(0, maxBaseY));

    return [
        createPoint(baseY, baseX),
        createPoint(baseY, baseX + w),
        createPoint(baseY + h, baseX + w + skew),
        createPoint(baseY + h, baseX + skew)
    ];
}

/**
 * Generates a trapezoid (one pair of parallel sides)
 */
function generateTrapezoid(gridWidth: number, gridHeight: number): GridPoint[] {
    const orientation = Math.random();

    if (orientation < 0.5) {
        // Horizontal parallel sides (top and bottom parallel)
        const h = randomInt(1, Math.min(4, gridHeight));
        const topY = randomInt(0, Math.max(0, gridHeight - h));
        const baseY = topY + h;

        // Generate two different lengths for parallel sides
        const minLength = 1;
        const maxLength = Math.min(4, gridWidth);
        const side1Length = randomInt(minLength, maxLength);
        let side2Length = randomInt(minLength, maxLength);
        while (side2Length === side1Length) {
            side2Length = randomInt(minLength, maxLength);
        }

        // Determine which is shorter and which is longer
        const shorterLength = Math.min(side1Length, side2Length);
        const longerLength = Math.max(side1Length, side2Length);

        // Position the longer side (base)
        const baseLeft = randomInt(0, Math.max(0, gridWidth - longerLength));
        const baseRight = baseLeft + longerLength;

        // Position the shorter side (top) - it should be within the bounds of the base
        // to ensure the trapezoid sides don't cross
        const maxOffset = longerLength - shorterLength;
        const topOffset = randomInt(0, maxOffset);
        const topLeft = baseLeft + topOffset;
        const topRight = topLeft + shorterLength;

        // Randomly decide if top or bottom is the longer side
        if (side1Length < side2Length) {
            return [
                createPoint(topY, topLeft),           // Top left
                createPoint(topY, topRight),          // Top right
                createPoint(baseY, baseRight),        // Base right
                createPoint(baseY, baseLeft)          // Base left
            ];
        } else {
            return [
                createPoint(topY, baseLeft),          // Top left
                createPoint(topY, baseRight),         // Top right
                createPoint(baseY, topRight),         // Base right
                createPoint(baseY, topLeft)           // Base left
            ];
        }
    } else {
        // Vertical parallel sides (left and right parallel)
        const w = randomInt(1, Math.min(3, gridWidth));
        const leftX = randomInt(0, Math.max(0, gridWidth - w));
        const rightX = leftX + w;

        // Generate two different lengths for parallel sides
        const minLength = 1;
        const maxLength = Math.min(3, gridHeight);
        const side1Length = randomInt(minLength, maxLength);
        let side2Length = randomInt(minLength, maxLength);
        while (side2Length === side1Length) {
            side2Length = randomInt(minLength, maxLength);
        }

        // Determine which is shorter and which is longer
        const shorterLength = Math.min(side1Length, side2Length);
        const longerLength = Math.max(side1Length, side2Length);

        // Position the longer side
        const longerTop = randomInt(0, Math.max(0, gridHeight - longerLength));
        const longerBottom = longerTop + longerLength;

        // Position the shorter side - it should be within the bounds of the longer side
        // to ensure the trapezoid sides don't cross
        const maxOffset = longerLength - shorterLength;
        const shorterOffset = randomInt(0, maxOffset);
        const shorterTop = longerTop + shorterOffset;
        const shorterBottom = shorterTop + shorterLength;

        // Randomly decide if left or right is the longer side
        if (side1Length < side2Length) {
            return [
                createPoint(shorterTop, leftX),       // Left top
                createPoint(shorterBottom, leftX),    // Left bottom
                createPoint(longerBottom, rightX),    // Right bottom
                createPoint(longerTop, rightX)        // Right top
            ];
        } else {
            return [
                createPoint(longerTop, leftX),        // Left top
                createPoint(longerBottom, leftX),     // Left bottom
                createPoint(shorterBottom, rightX),   // Right bottom
                createPoint(shorterTop, rightX)       // Right top
            ];
        }
    }
}

/**
 * Generates a rectangle (all angles 90 degrees, opposite sides equal)
 */
function generateRectangle(gridWidth: number, gridHeight: number): GridPoint[] {
    const baseX = randomInt(0, gridWidth - 2);
    const baseY = randomInt(0, gridHeight - 2);
    const w = randomInt(1, Math.min(3, gridWidth - baseX));
    const h = randomInt(1, Math.min(3, gridHeight - baseY));

    return [
        createPoint(baseY, baseX),
        createPoint(baseY, baseX + w),
        createPoint(baseY + h, baseX + w),
        createPoint(baseY + h, baseX)
    ];
}