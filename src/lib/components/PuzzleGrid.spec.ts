import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';

import PuzzleGrid from './PuzzleGrid.svelte';

describe('PuzzleGrid', () => {
	let component: any;

	beforeEach(() => {
		component = render(PuzzleGrid, {
            rows: 3,
            columns: 3,
        });
	});

	afterEach(() => {
		if (component) {
            component.unmount();
		}
	});

	describe('findGridPoint', () => {
		it('should find a point at the top-left corner of the grid (0, 0)', () => {
			const element = component.component.findGridPoint(0, 0);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
			expect(element?.classList.contains('top-left')).toBe(true);
            expect(element?.dataset.row).toBe('0');
            expect(element?.dataset.column).toBe('0');
		});

		it('should find a point at the top-right corner of the grid (3, 0)', () => {
			const element = component.component.findGridPoint(3, 0);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
			expect(element?.classList.contains('top-right')).toBe(true);
            expect(element?.dataset.row).toBe('0');
            expect(element?.dataset.column).toBe('3');
		});

		it('should find a point at the bottom-left corner of the grid (0, 3)', () => {
			const element = component.component.findGridPoint(0, 3);
			expect(element).not.toBeNull();
			expect(element?.classList.contains('puzzle-point')).toBe(true);
			expect(element?.classList.contains('bottom-left')).toBe(true);
            expect(element?.dataset.row).toBe('3');
            expect(element?.dataset.column).toBe('0');
		});

        it('should find a point at the bottom-right corner of the grid (3, 3)', () => {
            const element = component.component.findGridPoint(3, 3);
            expect(element).not.toBeNull();
            expect(element?.classList.contains('puzzle-point')).toBe(true);
            expect(element?.classList.contains('bottom-right')).toBe(true);
            expect(element?.dataset.row).toBe('3');
            expect(element?.dataset.column).toBe('3');
        });

		it('should return null for coordinates outside the grid', () => {
			const point = component.component.findGridPoint(-100, -100);
			expect(point).toBeNull();

            const point2 = component.component.findGridPoint(1000, 1000);
            expect(point2).toBeNull();

            const point3 = component.component.findGridPoint(1, 4);
            expect(point3).toBeNull();

            const point4 = component.component.findGridPoint(4, 1);
            expect(point4).toBeNull();
		});
	});
});
