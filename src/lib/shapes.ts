import type { GridPoint } from "./components/PuzzleGrid.svelte";

/**
 * Available shape types
 */
export const ShapeTypes = {
    Rhombus:  'Rhombus', 
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
export const validateShape = (shapeType: string, points: GridPoint[]) => {
    console.log("Validating shape of type:", shapeType);

    if(points.length < 3) {
        console.log("Not enough points to form a shape.");
        return false;
    }

    if(points.length > 4) {
        console.log("Too many points to form a valid shape.");
        return false;
    }

    const centerX = points.reduce((sum, p) => sum + p.column, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.row, 0) / points.length;

    // Sort points in clockwise order
    points.sort((a, b) => {
        const angleA = Math.atan2(a.row - centerY, a.column - centerX);
        const angleB = Math.atan2(b.row - centerY, b.column - centerX);
        return angleA - angleB;
    });

    // Shape-specific validation logic
    if(points.length === 3) {
        // Triangle validation logic here
        if(shapeType === ShapeTypes.IsoscelesTriangle) {
            const sideLengths = [
                Math.hypot(points[0].column - points[1].column, points[0].row - points[1].row),
                Math.hypot(points[1].column - points[2].column, points[1].row - points[2].row),
                Math.hypot(points[2].column - points[0].column, points[2].row - points[0].row),
            ];

            sideLengths.sort((a, b) => a - b);

            // If two sides are equal (within tolerance), it's isosceles
            const tolerance = 0.001;
            if(Math.abs(sideLengths[0] - sideLengths[1]) < tolerance ||
               Math.abs(sideLengths[1] - sideLengths[2]) < tolerance) {
                return true;
            } else {
                console.log("Triangle is not isosceles.");
                return false;
            }
        } else {
            console.log("Unknown shape type for triangle:", shapeType);
            return false;
        }
    } else if (points.length === 4) {
        const sideLengths = [
            Math.hypot(points[0].column - points[1].column, points[0].row - points[1].row),
            Math.hypot(points[1].column - points[2].column, points[1].row - points[2].row),
            Math.hypot(points[2].column - points[3].column, points[2].row - points[3].row),
            Math.hypot(points[3].column - points[0].column, points[3].row - points[0].row),
        ];

        const angles = [
            Math.atan2(points[1].row - points[0].row, points[1].column - points[0].column) - Math.atan2(points[3].row - points[0].row, points[3].column - points[0].column),
            Math.atan2(points[2].row - points[1].row, points[2].column - points[1].column) - Math.atan2(points[0].row - points[1].row, points[0].column - points[1].column),
            Math.atan2(points[3].row - points[2].row, points[3].column - points[2].column) - Math.atan2(points[1].row - points[2].row, points[1].column - points[2].column),
            Math.atan2(points[0].row - points[3].row, points[0].column - points[3].column) - Math.atan2(points[2].row - points[3].row, points[2].column - points[3].column),
        ];

        const oppositeSidesEqual = (sideLengths[0] === sideLengths[2]) && (sideLengths[1] === sideLengths[3]);

        // Quadrilateral validation logic here
        if(shapeType === ShapeTypes.Rhombus) {
            // Rhombus validation logic here
            const allSidesEqual = sideLengths.every(length => length === sideLengths[0]);
            
            if(allSidesEqual) {
                return true;
            } else {
                console.log("Rhombus sides are not equal.");
                return false;
            }
        } else if(shapeType === ShapeTypes.Parallelogram) {
            // Parallelogram validation logic here
            if(!oppositeSidesEqual) {
                console.log("Opposite sides of parallelogram must be equal.");
                return false;
            }

            if (Math.abs(angles[0]) < 0.01 || Math.abs(angles[1]) < 0.01 || Math.abs(angles[2]) < 0.01 || Math.abs(angles[3]) < 0.01) {
                console.log("Angles of parallelogram are not valid.");
                return false;
            }

            return true;
            
        } else if(shapeType === ShapeTypes.Trapezoid) {
            // Trapezoid validation: check if at least one pair of opposite sides is parallel
            const side01Parallel = areParallel(points[0], points[1], points[2], points[3]);
            const side12Parallel = areParallel(points[1], points[2], points[3], points[0]);

            if(side01Parallel || side12Parallel) {
                return true;
            } else {
                console.log("Trapezoid does not have a pair of parallel sides.");
                return false;
            }
        } else if(shapeType === ShapeTypes.Rectangle) {
            // Rectangle validation: opposite sides equal AND all angles are 90 degrees
            if (!oppositeSidesEqual) {
                console.log("Rectangle must have opposite sides equal.");
                return false;
            }

            // Check if all angles are right angles by checking if adjacent sides are perpendicular
            // For each vertex, check if the dot product of adjacent edge vectors is zero
            for (let i = 0; i < 4; i++) {
                const prev = points[(i + 3) % 4];
                const curr = points[i];
                const next = points[(i + 1) % 4];

                // Vectors from current point to adjacent points
                const v1x = prev.column - curr.column;
                const v1y = prev.row - curr.row;
                const v2x = next.column - curr.column;
                const v2y = next.row - curr.row;

                // Dot product should be zero for perpendicular vectors
                const dotProduct = v1x * v2x + v1y * v2y;
                if (Math.abs(dotProduct) > 0.001) {
                    console.log("Rectangle must have all right angles.");
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
 * Check if two line segments are parallel by comparing their slopes
 */
function areParallel(p1: GridPoint, p2: GridPoint, p3: GridPoint, p4: GridPoint): boolean {
    const dx1 = p2.column - p1.column;
    const dy1 = p2.row - p1.row;
    const dx2 = p4.column - p3.column;
    const dy2 = p4.row - p3.row;

    // Check if both are vertical lines
    if (Math.abs(dx1) < 0.001 && Math.abs(dx2) < 0.001) {
        return true;
    }

    // Check if both are horizontal lines
    if (Math.abs(dy1) < 0.001 && Math.abs(dy2) < 0.001) {
        return true;
    }

    // Check if slopes are equal: dy1/dx1 === dy2/dx2
    // Rearranged to avoid division: dy1 * dx2 === dy2 * dx1
    const crossProduct = Math.abs(dy1 * dx2 - dy2 * dx1);
    return crossProduct < 0.001;
}

/**
 * Helper function to get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a shape at a random position based on the specified type within the given grid dimensions.
 * @param shapeType Type of shape to generate
 * @param width Width of the grid (number of columns)
 * @param height Height of the grid (number of rows)
 * @returns Array of GridPoints representing the generated shape
 */
export const generateShape = (shapeType: string, width: number, height: number): GridPoint[] => {
    console.log("Generating shape of type:", shapeType);

    if (shapeType === ShapeTypes.Rhombus) {
        return generateRhombus(width, height);
    } else if (shapeType === ShapeTypes.IsoscelesTriangle) {
        return generateIsoscelesTriangle(width, height);
    } else if (shapeType === ShapeTypes.Parallelogram) {
        return generateParallelogram(width, height);
    } else if (shapeType === ShapeTypes.Trapezoid) {
        return generateTrapezoid(width, height);
    } else if (shapeType === ShapeTypes.Rectangle) {
        return generateRectangle(width, height);
    } else {
        console.log("Unknown shape type:", shapeType);
        return [];
    }
};

/**
 * Generates a rhombus (all sides equal)
 */
function generateRhombus(width: number, height: number): GridPoint[] {
    // Choose a random orientation: diamond or rotated
    const orientation = Math.random();

    if (orientation < 0.5) {
        // Diamond orientation (aligned with grid diagonals)
        const centerX = randomInt(1, width - 1);
        const centerY = randomInt(1, height - 1);
        const size = Math.min(centerX, width - centerX, centerY, height - centerY);

        return [
            createPoint(centerY - size, centerX),      // Top
            createPoint(centerY, centerX + size),      // Right
            createPoint(centerY + size, centerX),      // Bottom
            createPoint(centerY, centerX - size)       // Left
        ];
    } else {
        // Rotated rhombus
        const baseX = randomInt(0, width - 2);
        const baseY = randomInt(0, height - 2);
        const size = Math.min(2, width - baseX, height - baseY);

        return [
            createPoint(baseY, baseX),
            createPoint(baseY, baseX + size),
            createPoint(baseY + size, baseX + size),
            createPoint(baseY + size, baseX)
        ];
    }
}

/**
 * Generates an isosceles triangle (two sides equal)
 */
function generateIsoscelesTriangle(width: number, height: number): GridPoint[] {
    const orientation = randomInt(0, 3);

    if (orientation === 0) {
        // Base at bottom, apex at top
        const baseY = randomInt(2, height);
        const apexY = randomInt(0, baseY - 2);
        const apexX = randomInt(1, width - 1);
        const baseWidth = Math.min(apexX, width - apexX, baseY - apexY);

        return [
            createPoint(apexY, apexX),                      // Apex
            createPoint(baseY, apexX - baseWidth),          // Base left
            createPoint(baseY, apexX + baseWidth)           // Base right
        ];
    } else if (orientation === 1) {
        // Base at top, apex at bottom
        const baseY = randomInt(0, height - 2);
        const apexY = randomInt(baseY + 2, height);
        const apexX = randomInt(1, width - 1);
        const baseWidth = Math.min(apexX, width - apexX, apexY - baseY);

        return [
            createPoint(baseY, apexX - baseWidth),          // Base left
            createPoint(baseY, apexX + baseWidth),          // Base right
            createPoint(apexY, apexX)                       // Apex
        ];
    } else if (orientation === 2) {
        // Base on left, apex on right
        const baseX = randomInt(0, width - 2);
        const apexX = randomInt(baseX + 2, width);
        const apexY = randomInt(1, height - 1);
        const baseHeight = Math.min(apexY, height - apexY, apexX - baseX);

        return [
            createPoint(apexY - baseHeight, baseX),         // Base top
            createPoint(apexY + baseHeight, baseX),         // Base bottom
            createPoint(apexY, apexX)                       // Apex
        ];
    } else {
        // Base on right, apex on left
        const baseX = randomInt(2, width);
        const apexX = randomInt(0, baseX - 2);
        const apexY = randomInt(1, height - 1);
        const baseHeight = Math.min(apexY, height - apexY, baseX - apexX);

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
function generateParallelogram(width: number, height: number): GridPoint[] {
    // Ensure we have enough space for a parallelogram
    const w = randomInt(2, Math.min(3, Math.max(2, width - 1)));
    const h = randomInt(1, Math.min(2, Math.max(1, height - 1)));
    const skew = randomInt(1, Math.min(2, Math.max(1, width - w - 1)));

    // Calculate safe starting position that keeps all points in bounds
    const maxBaseX = width - w - skew;
    const maxBaseY = height - h;
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
function generateTrapezoid(width: number, height: number): GridPoint[] {
    const orientation = Math.random();

    if (orientation < 0.5) {
        // Horizontal parallel sides (top and bottom parallel)
        const h = randomInt(1, Math.min(4, height));
        const topY = randomInt(0, Math.max(0, height - h));
        const baseY = topY + h;

        // Generate two different lengths for parallel sides
        const minLength = 1;
        const maxLength = Math.min(4, width);
        const side1Length = randomInt(minLength, maxLength);
        let side2Length = randomInt(minLength, maxLength);
        while (side2Length === side1Length) {
            side2Length = randomInt(minLength, maxLength);
        }

        // Determine which is shorter and which is longer
        const shorterLength = Math.min(side1Length, side2Length);
        const longerLength = Math.max(side1Length, side2Length);

        // Position the longer side (base)
        const baseLeft = randomInt(0, Math.max(0, width - longerLength));
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
        const w = randomInt(1, Math.min(3, width));
        const leftX = randomInt(0, Math.max(0, width - w));
        const rightX = leftX + w;

        // Generate two different lengths for parallel sides
        const minLength = 1;
        const maxLength = Math.min(3, height);
        const side1Length = randomInt(minLength, maxLength);
        let side2Length = randomInt(minLength, maxLength);
        while (side2Length === side1Length) {
            side2Length = randomInt(minLength, maxLength);
        }

        // Determine which is shorter and which is longer
        const shorterLength = Math.min(side1Length, side2Length);
        const longerLength = Math.max(side1Length, side2Length);

        // Position the longer side
        const longerTop = randomInt(0, Math.max(0, height - longerLength));
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
function generateRectangle(width: number, height: number): GridPoint[] {
    const baseX = randomInt(0, width - 2);
    const baseY = randomInt(0, height - 2);
    const w = randomInt(1, Math.min(3, width - baseX));
    const h = randomInt(1, Math.min(3, height - baseY));

    return [
        createPoint(baseY, baseX),
        createPoint(baseY, baseX + w),
        createPoint(baseY + h, baseX + w),
        createPoint(baseY + h, baseX)
    ];
}