import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';

import PuzzleGrid from './PuzzleGrid.svelte';
import type { GridPoint } from '$lib/types';
import { validateShape, generateShape, ShapeTypes } from '$lib/shapes';

describe('PuzzleGrid', () => {
	let component: any;

	beforeEach(() => {
		component = render(PuzzleGrid, {
            rows: 4,
            columns: 4,
        });
	});

	afterEach(() => {
		if (component) {
            component.unmount();
		}
	});

	describe('findGridPoint', () => {
		it('should return null when no points are visible', async () => {
			// First, ensure all grid points are hidden
			component.component.setAllVisiblePoints(false);
			await tick(); // Wait for DOM to update

			const point = component.component.findGridPoint(2, 2);
			expect(point).toBeNull();
		});

		it('should find a point at the center of the grid (2, 2)', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update

			const element = component.component.findGridPoint(2, 2);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
			expect(element?.dataset.row).toBe('2');
			expect(element?.dataset.column).toBe('2');
		});

		it('should find a point at the top-left corner of the grid (0, 0)', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update

			const element = component.component.findGridPoint(0, 0);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
            expect(element?.dataset.row).toBe('0');
            expect(element?.dataset.column).toBe('0');
		});

		it('should find a point at the top-right corner of the grid (4, 0)', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update

			const element = component.component.findGridPoint(4, 0);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
            expect(element?.dataset.row).toBe('0');
            expect(element?.dataset.column).toBe('4');
		});

		it('should find a point at the bottom-left corner of the grid (0, 4)', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update

			const element = component.component.findGridPoint(0, 4);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
            expect(element?.dataset.row).toBe('4');
            expect(element?.dataset.column).toBe('0');
		});

        it('should find a point at the bottom-right corner of the grid (4, 4)', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update

			const element = component.component.findGridPoint(4, 4);
            expect(element).not.toBeNull();
            expect(element?.classList.contains('puzzle-point')).toBe(true);
            expect(element?.dataset.row).toBe('4');
            expect(element?.dataset.column).toBe('4');
        });

		it('should return null for coordinates outside the grid', async () => {
			// First, set all grid points to be present
			component.component.setAllVisiblePoints(true);
			await tick(); // Wait for DOM to update


			const point = component.component.findGridPoint(-100, -100);
			expect(point).toBeNull();

            const point2 = component.component.findGridPoint(1000, 1000);
            expect(point2).toBeNull();

            const point3 = component.component.findGridPoint(1, 5);
            expect(point3).toBeNull();

            const point4 = component.component.findGridPoint(5, 1);
            expect(point4).toBeNull();
		});
	});

	describe('validateShape', () => {
		it('should return false when given fewer than 3 points', () => {
			const points: GridPoint[] = [
				{ row: 0, column: 0 },
				{ row: 0, column: 1 }
			];
			const result = validateShape(ShapeTypes.Rhombus, points);
			expect(result).toBe(false);
		});

		it('should return false when given more than 4 points', () => {
			const points: GridPoint[] = [
				{ row: 0, column: 0 },
				{ row: 0, column: 1 },
				{ row: 1, column: 0 },
				{ row: 1, column: 1 },
				{ row: 2, column: 2 }
			];
			const result = validateShape(ShapeTypes.Rectangle, points);
			expect(result).toBe(false);
		});

		describe('Triangle shapes (3 points)', () => {
			it('should validate an isosceles triangle with 3 points', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 1 },
					{ row: 2, column: 0 },
					{ row: 2, column: 2 }
				];
				const result = validateShape(ShapeTypes.IsoscelesTriangle, points);
				expect(result).toBe(true);
			});

			it('should return false for non-isosceles triangle', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 1, column: 2 },
					{ row: 6, column: 1 }
				];
				const result = validateShape(ShapeTypes.IsoscelesTriangle, points);
				expect(result).toBe(false);
			});

			it('should return false for triangle with unknown shape type', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 1 },
					{ row: 1, column: 0 }
				];
				const result = validateShape('UnknownTriangle' as any, points);
				expect(result).toBe(false);
			});
		});

		describe('Quadrilateral shapes (4 points)', () => {
			it('should validate a rhombus with 4 points', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 1 },
					{ row: 1, column: 0 },
					{ row: 2, column: 1 },
					{ row: 1, column: 2 }
				];
				const result = validateShape(ShapeTypes.Rhombus, points);
				expect(result).toBe(true);
			});

			it('should validate a parallelogram with 4 points', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 2 },
					{ row: 1, column: 3 },
					{ row: 1, column: 1 }
				];
				const result = validateShape(ShapeTypes.Parallelogram, points);
				expect(result).toBe(true);
			});

			it('should validate a trapezoid with 4 points', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 1 },
					{ row: 0, column: 2 },
					{ row: 2, column: 0 },
					{ row: 2, column: 3 }
				];
				const result = validateShape(ShapeTypes.Trapezoid, points);
				expect(result).toBe(true);
			});

			it('should validate a rectangle with 4 points', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 2 },
					{ row: 2, column: 2 },
					{ row: 2, column: 0 }
				];
				const result = validateShape(ShapeTypes.Rectangle, points);
				expect(result).toBe(true);
			});

			it('should return false for invalid rhombus (sides not equal)', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 3 },
					{ row: 1, column: 1 },
					{ row: 1, column: 2 }
				];
				const result = validateShape(ShapeTypes.Rhombus, points);
				expect(result).toBe(false);
			});

			it('should return false for invalid parallelogram (opposite sides not parallel)', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 2 },
					{ row: 2, column: 1 },
					{ row: 1, column: 3 }
				];
				const result = validateShape(ShapeTypes.Parallelogram, points);
				expect(result).toBe(false);
			});

			it('should return false for invalid rectangle (not right angles)', () => {
				const points: GridPoint[] = [
					{ row: 0, column: 0 },
					{ row: 0, column: 2 },
					{ row: 2, column: 3 },
					{ row: 2, column: 1 }
				];
				const result = validateShape(ShapeTypes.Rectangle, points);
				expect(result).toBe(false);
			});
		});
	});

	describe('generateShape', () => {
		it('should return an array of GridPoints', () => {
			const points = generateShape(ShapeTypes.Rhombus, 3, 3);
			expect(Array.isArray(points)).toBe(true);
			if (points.length > 0) {
				expect(points[0]).toHaveProperty('row');
				expect(points[0]).toHaveProperty('column');
			}
		});

		it('should generate 4 points for a rhombus', () => {
			const points = generateShape(ShapeTypes.Rhombus, 3, 3);
			expect(points.length).toBe(4);
		});

		it('should generate 3 points for an isosceles triangle', () => {
			const points = generateShape(ShapeTypes.IsoscelesTriangle, 3, 3);
			expect(points.length).toBe(3);
		});

		it('should generate 4 points for a parallelogram', () => {
			const points = generateShape(ShapeTypes.Parallelogram, 3, 3);
			expect(points.length).toBe(4);
		});

		it('should generate 4 points for a trapezoid', () => {
			const points = generateShape(ShapeTypes.Trapezoid, 3, 3);
			expect(points.length).toBe(4);
		});

		it('should generate 4 points for a rectangle', () => {
			const points = generateShape(ShapeTypes.Rectangle, 3, 3);
			expect(points.length).toBe(4);
		});

		it('should generate points within a valid grid', () => {
			const points = generateShape(ShapeTypes.Rhombus, 3, 3);
			points.forEach((point: GridPoint) => {
				expect(point.row).toBeGreaterThanOrEqual(0);
				expect(point.row).toBeLessThanOrEqual(3);
				expect(point.column).toBeGreaterThanOrEqual(0);
				expect(point.column).toBeLessThanOrEqual(3);
			});
		});

		it('should generate a valid shape that passes validation', () => {
			const shapeTypes = [
				ShapeTypes.Rhombus,
				ShapeTypes.IsoscelesTriangle,
				ShapeTypes.Parallelogram,
				ShapeTypes.Trapezoid,
				ShapeTypes.Rectangle
			];

			shapeTypes.forEach(shapeType => {
				const points = generateShape(shapeType, 3, 3);
				if (points.length > 0) {
					const isValid = validateShape(shapeType, points);
					if (!isValid) {
						console.log(`Rejected generated points for ${shapeType}:`, points);
					}
					expect(isValid).toBe(true);
				}
			});
		});

		it('should return empty array for unknown shape type', () => {
			const points = generateShape('UnknownShape' as any, 3, 3);
			expect(points).toEqual([]);
		});

		it('should generate different shapes on multiple calls (randomness)', () => {
			const points1 = generateShape(ShapeTypes.Rhombus, 100, 100);
			const points2 = generateShape(ShapeTypes.Rhombus, 100, 100);

			// At least one coordinate should be different between two randomly generated shapes
			if (points1.length > 0 && points2.length > 0) {
				const isDifferent = points1.some((p1: GridPoint, index: number) => {
					const p2 = points2[index];
					return p1.row !== p2.row || p1.column !== p2.column;
				});
				expect(isDifferent).toBe(true);
			}
		});

		describe('Bounds checking (multiple iterations)', () => {
			const iterations = 50; // Test multiple random generations
			const gridWidth = 3;
			const gridHeight = 3;

			it('should always generate rhombus within bounds', () => {
				for (let i = 0; i < iterations; i++) {
					const points = generateShape(ShapeTypes.Rhombus, gridWidth, gridHeight);
					points.forEach((point: GridPoint) => {
						expect(point.row).toBeGreaterThanOrEqual(0);
						expect(point.row).toBeLessThanOrEqual(gridHeight);
						expect(point.column).toBeGreaterThanOrEqual(0);
						expect(point.column).toBeLessThanOrEqual(gridWidth);
					});
				}
			});

			it('should always generate isosceles triangle within bounds', () => {
				for (let i = 0; i < iterations; i++) {
					const points = generateShape(ShapeTypes.IsoscelesTriangle, gridWidth, gridHeight);
					points.forEach((point: GridPoint) => {
						expect(point.row).toBeGreaterThanOrEqual(0);
						expect(point.row).toBeLessThanOrEqual(gridHeight);
						expect(point.column).toBeGreaterThanOrEqual(0);
						expect(point.column).toBeLessThanOrEqual(gridWidth);
					});
				}
			});

			it('should always generate parallelogram within bounds', () => {
				for (let i = 0; i < iterations; i++) {
					const points = generateShape(ShapeTypes.Parallelogram, gridWidth, gridHeight);
					points.forEach((point: GridPoint) => {
						expect(point.row).toBeGreaterThanOrEqual(0);
						expect(point.row).toBeLessThanOrEqual(gridHeight);
						expect(point.column).toBeGreaterThanOrEqual(0);
						expect(point.column).toBeLessThanOrEqual(gridWidth);
					});
				}
			});

			it('should always generate trapezoid within bounds', () => {
				for (let i = 0; i < iterations; i++) {
					const points = generateShape(ShapeTypes.Trapezoid, gridWidth, gridHeight);
					points.forEach((point: GridPoint) => {
						expect(point.row).toBeGreaterThanOrEqual(0);
						expect(point.row).toBeLessThanOrEqual(gridHeight);
						expect(point.column).toBeGreaterThanOrEqual(0);
						expect(point.column).toBeLessThanOrEqual(gridWidth);
					});
				}
			});

			it('should always generate rectangle within bounds', () => {
				for (let i = 0; i < iterations; i++) {
					const points = generateShape(ShapeTypes.Rectangle, gridWidth, gridHeight);
					points.forEach((point: GridPoint) => {
						expect(point.row).toBeGreaterThanOrEqual(0);
						expect(point.row).toBeLessThanOrEqual(gridHeight);
						expect(point.column).toBeGreaterThanOrEqual(0);
						expect(point.column).toBeLessThanOrEqual(gridWidth);
					});
				}
			});
		});
	});
});
