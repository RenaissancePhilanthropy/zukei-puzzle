<script lang="ts">
    import { generateShape, validateShape, ShapeTypes, type ShapeType } from "$lib/shapes";
    import { addDecoyPoints } from "$lib/decoyPoints";
    import type { GridPoint, Line } from "$lib/types";
    import { THEME } from "$lib/constants/theme";
    import { PUZZLE_CONFIG } from "$lib/constants/puzzleConfig";
    import { onMount } from "svelte";
    import { analyzeUserAttempt, generateWhyHint, generateWhatHint, generateSuccessHint } from "$lib/hints/analyzer";
    import { extractUniquePoints } from "$lib/hints/utils";
    import type { HintData } from "$lib/hints/types";
    import HintModal from "./HintModal.svelte";

    type PuzzleGridProps = {
        rows: number;
        columns: number;
        visiblePoints?: boolean[][];
        generatedShapeType?: ShapeType | null;
    };

    let { rows, columns, visiblePoints = $bindable(createDefaultVisiblePoints(rows, columns, false)), generatedShapeType = $bindable(null) }: PuzzleGridProps = $props();

    export function setVisiblePoints(newVisiblePoints: boolean[][]) {
        visiblePoints = newVisiblePoints;
    }

    export function getVisiblePoints(): boolean[][] {
        return visiblePoints;
    }

    export function setAllVisiblePoints(visible: boolean) {
        visiblePoints = createDefaultVisiblePoints(rows, columns, visible);
    }

    /**
     * Creates a default visible points grid where all points are visible.
     * Grid is (rows + 1) x (columns + 1) in size.
     */
    function createDefaultVisiblePoints(rows: number, columns: number, defaultVisibility: boolean = true): boolean[][] {
        return Array(rows + 1).fill(null).map(() => Array(columns + 1).fill(defaultVisibility));
    }

    /**
     * Check if a point at given grid coordinates is visible.
     */
    function isPointVisible(x: number, y: number): boolean {
        if (!visiblePoints || y >= visiblePoints.length || x >= visiblePoints[0]?.length) {
            return true; // Default to visible if not specified
        }
        return visiblePoints[y][x];
    }

    let gridElement: HTMLElement;

    let firstPoint = $state<GridPoint | null>(null);
    let lines = $state<Line[]>([]);
    let mousePosition = $state<{ x: number; y: number } | null>(null);

    // Hint system state
    let currentHint = $state<HintData | null>(null);
    let showHintModal = $state(false);

    /**
     * Find a grid point element by grid coordinates.
     * @param column Column coordinate (0 to columns)
     * @param row Row coordinate (0 to rows)
     * @return The HTML element at that point, or null if not found
     */
    export function findGridPoint(column: number, row: number): HTMLElement | null {
        // Validate coordinates are within grid bounds
        if (column < 0 || column > columns || row < 0 || row > rows || !gridElement) {
            return null;
        }

        return gridElement.querySelector(`.puzzle-point[data-row="${row}"][data-column="${column}"]`) as HTMLElement;
    }

    const onPointClicked = (point: GridPoint, event: MouseEvent) => {
        event.stopPropagation(); // Prevent deselection when clicking a point

        if (!firstPoint) {
            // First click - select the starting point
            firstPoint = point;
        } else {
            // Second click - create a line
            const isSamePoint =
                firstPoint.row === point.row &&
                firstPoint.column === point.column;

            let newLine: Line = {
                from: firstPoint,
                to: point
            };


            // Reset the first point, if we've made a complete polygon
            if (lines.find(line =>
                (line.from.row === point.row && line.from.column === point.column) ||
                (line.to.row === point.row && line.to.column === point.column)
            )){
                firstPoint = null;
                mousePosition = null;
            } else {
                firstPoint = point;
            }

            if (!isSamePoint) {
                // Add the line
                lines.push(newLine);
            }
        }
    };

    const onGridClicked = () => {
        // Deselect when clicking on the grid background
        if (firstPoint) {
            firstPoint = null;
            mousePosition = null;
        }
    };

    const onLineClicked = (index: number, event: MouseEvent) => {
        event.stopPropagation(); // Prevent grid deselection

        if(firstPoint) {
            return; // Don't allow line removal while in connection mode
        }

        // Remove the clicked line
        lines.splice(index, 1);
        lines = lines; // Trigger reactivity
    };

    const onGridKeyDown = (event: KeyboardEvent) => {
        // Deselect on Escape key
        if (event.key === 'Escape' && firstPoint) {
            firstPoint = null;
            mousePosition = null;
        }
    };

    const onMouseMove = (event: MouseEvent) => {
        // Track mouse position when in connection mode
        if (firstPoint && gridElement) {
            const wrapperElement = gridElement.parentElement;
            if (!wrapperElement) return;

            const wrapperRect = wrapperElement.getBoundingClientRect();
            mousePosition = {
                x: event.clientX - wrapperRect.left,
                y: event.clientY - wrapperRect.top
            };
        }
    };

    const isPointSelected = (point: GridPoint): boolean => {
        if (!firstPoint) return false;
        return firstPoint.row === point.row &&
               firstPoint.column === point.column;
    };

    // Helper to get pixel coordinates for a grid point
    export const getPointCoordinates = (point: GridPoint): { x: number; y: number } | null => {
        const pointElement = findGridPoint(point.column, point.row);

        if (!pointElement || !gridElement) return null;

        const wrapperElement = gridElement.parentElement;
        if (!wrapperElement) return null;

        const wrapperRect = wrapperElement.getBoundingClientRect();
        const pointRect = pointElement.getBoundingClientRect();

        // Get center of the point relative to the wrapper (which contains the SVG)
        const x = pointRect.left - wrapperRect.left + pointRect.width / 2;
        const y = pointRect.top - wrapperRect.top + pointRect.height / 2;

        return { x, y };
    };

    /**
     * Get current user attempt for hint analysis
     */
    export function getCurrentAttempt(): { userPoints: GridPoint[]; userLines: Line[] } {
        const userPoints = extractUniquePoints(lines);
        return { userPoints, userLines: lines };
    }

    /**
     * Show "why" hint explaining why the shape is wrong
     */
    function showWhyHint(): void {
        const { userPoints, userLines } = getCurrentAttempt();

        if (!generatedShapeType) return;

        const analysis = analyzeUserAttempt(generatedShapeType, userPoints, userLines);
        currentHint = generateWhyHint(analysis);
        showHintModal = true;
    }

    /**
     * Show success hint with shape description and parallel side highlighting
     */
    function showSuccessHint(): void {
        const { userPoints } = getCurrentAttempt();

        if (!generatedShapeType) return;

        currentHint = generateSuccessHint(generatedShapeType, userPoints);
        showHintModal = true;
    }

    /**
     * Show "what" hint providing guidance about the target shape
     */
    export function showWhatHint(): void {
        if (!generatedShapeType) return;

        currentHint = generateWhatHint(generatedShapeType);
        showHintModal = true;
    }

    /**
     * Close the hint modal
     */
    export function closeHintModal(): void {
        showHintModal = false;
        currentHint = null;
    }

    /**
     * Clear all drawn lines and reset selection
     */
    export function clear(): void {
        lines = [];
        firstPoint = null;
        mousePosition = null;
    }

    export function check(): boolean {
        // Check if user has drawn any lines
        if (lines.length === 0) {
            currentHint = {
                type: 'why',
                title: 'No Lines Drawn',
                message: 'You need to connect points to form a shape. Click on points to draw lines between them.',
                lineHighlights: []
            };
            showHintModal = true;
            return false;
        }

        // Build an adjacency map to verify the lines form a closed polygon
        const adjacencyMap = new Map<string, GridPoint[]>();

        const pointKey = (p: GridPoint) => `${p.row},${p.column}`;

        for (const line of lines) {
            const fromKey = pointKey(line.from);
            const toKey = pointKey(line.to);

            if (!adjacencyMap.has(fromKey)) {
                adjacencyMap.set(fromKey, []);
            }
            if (!adjacencyMap.has(toKey)) {
                adjacencyMap.set(toKey, []);
            }

            adjacencyMap.get(fromKey)!.push(line.to);
            adjacencyMap.get(toKey)!.push(line.from);
        }

        // Check that each point has exactly 2 connections (forms a closed polygon)
        const uniquePoints: GridPoint[] = [];
        for (const [key, connections] of adjacencyMap.entries()) {
            if (connections.length !== 2) {
                // Not a valid closed polygon - show hint
                currentHint = {
                    type: 'why',
                    title: 'Not a Closed Polygon',
                    message: 'Your lines don\'t form a closed polygon. Each point must connect to exactly 2 other points to form a complete shape.',
                    lineHighlights: lines.map(line => ({
                        from: line.from,
                        to: line.to,
                        highlightType: 'problematic' as const
                    }))
                };
                showHintModal = true;
                return false;
            }
            const [row, column] = key.split(',').map(Number);
            uniquePoints.push({ row, column });
        }

        // Verify the polygon matches the expected shape
        if (!generatedShapeType) {
            return false;
        }
        const isValid = validateShape(generatedShapeType, uniquePoints);

        // Show appropriate hint based on validation result
        if (!isValid) {
            showWhyHint();
        } else {
            showSuccessHint();
        }

        return isValid;
    }

    const generatePuzzle = () => {
        // Clear board - always reset to empty grid
        visiblePoints = createDefaultVisiblePoints(rows, columns, false);

        // Pick random shape type
        const shapeTypes = Object.values(ShapeTypes);
        const randomShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        generatedShapeType = randomShape;
        const points = generateShape(randomShape, columns, rows);

        // Put target shape down
        for (let point of points) {
            visiblePoints[point.row][point.column] = true;
        }

        // Add decoy points that don't create duplicate target shapes
        addDecoyPoints(
            randomShape,
            points,
            visiblePoints,
            columns,
            rows,
            PUZZLE_CONFIG.decoyGeneration
        );

        visiblePoints = visiblePoints; // Trigger reactivity
    };

    /**
     * Generate a new puzzle and clear current drawing
     */
    function handleNewPuzzle(): void {
        clear();
        closeHintModal();
        generatePuzzle();
    }

    onMount(() => {
        generatePuzzle();
    });
</script>

<div class="puzzle-grid-wrapper" onclick={onGridClicked} onkeydown={onGridKeyDown} onmousemove={onMouseMove} role="button" tabindex="-1">
    <div class="puzzle-grid" bind:this={gridElement} style="grid-template-rows: repeat({rows}, 1fr); grid-template-columns: repeat({columns}, 1fr); aspect-ratio: {columns} / {rows};">
        <!-- Render cells for the dashed grid background -->
        {#each Array(rows) as _, row}
            {#each Array(columns) as _, column}
                <div class="puzzle-cell" data-row={row} data-column={column}></div>
            {/each}
        {/each}

        <!-- Render points on top of the grid -->
        {#each Array(rows + 1) as _, row}
            {#each Array(columns + 1) as _, column}
                {#if isPointVisible(column, row)}
                    <button
                        class="puzzle-point"
                        class:selected={isPointSelected({row, column})}
                        onclick={(e) => onPointClicked({row, column}, e)}
                        aria-label="Point at row {row}, column {column}"
                        data-row={row}
                        data-column={column}
                        style="
                            grid-row: {row + 1};
                            grid-column: {column + 1};
                        ">
                    </button>
                {/if}
            {/each}
        {/each}
    </div>

    <svg class="lines-overlay" class:connection-mode={firstPoint !== null}>
        {#each lines as line, index}
            {@const fromCoords = getPointCoordinates(line.from)}
            {@const toCoords = getPointCoordinates(line.to)}
            {#if fromCoords && toCoords}
                <line
                    class="drawn-line"
                    x1={fromCoords.x}
                    y1={fromCoords.y}
                    x2={toCoords.x}
                    y2={toCoords.y}
                    stroke={THEME.colors.line}
                    stroke-width={THEME.sizes.lineWidth}
                    stroke-linecap="round"
                    onclick={(e) => onLineClicked(index, e)}
                />
            {/if}
        {/each}

        {#if firstPoint && mousePosition}
            {@const fromCoords = getPointCoordinates(firstPoint)}
            {#if fromCoords}
                <line
                    x1={fromCoords.x}
                    y1={fromCoords.y}
                    x2={mousePosition.x}
                    y2={mousePosition.y}
                    stroke={THEME.colors.linePreview}
                    stroke-width={THEME.sizes.lineWidth}
                    stroke-linecap="round"
                    stroke-dasharray="5,5"
                    opacity="0.6"
                />
            {/if}
        {/if}
    </svg>
</div>

{#if showHintModal && currentHint}
    <HintModal
        hintData={currentHint}
        {getPointCoordinates}
        onClose={closeHintModal}
        onNewPuzzle={handleNewPuzzle}
        userLines={lines}
    />
{/if}

<style>
    .puzzle-grid-wrapper {
        position: relative;
        max-width: 100vw;
        max-height: 100vh;
        padding: 20px;
    }

    .puzzle-grid {
        display: grid;
        position: relative;
    }

    .puzzle-cell {
        border: 1px dashed #222; /* THEME.colors.cellBorder */
        position: relative;
    }

    .puzzle-point {
        width: 20px; /* THEME.sizes.point */
        height: 20px; /* THEME.sizes.point */
        background-color: #2b2a29; /* THEME.colors.point */
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .puzzle-point:hover {
        background-color: #4a4948; /* THEME.colors.pointHover */
        transform: translate(-50%, -50%) scale(1.2); /* THEME.sizes.pointScaleHover */
    }

    .puzzle-point.selected {
        background-color: #007bff; /* THEME.colors.pointSelected */
        border-color: #0056b3; /* THEME.colors.pointSelectedBorder */
        transform: translate(-50%, -50%) scale(1.3); /* THEME.sizes.pointScaleSelected */
    }

    .lines-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
    }

    .drawn-line {
        pointer-events: auto;
        transition: stroke 0.2s ease;
    }

    .lines-overlay:not(.connection-mode) .drawn-line {
        cursor: pointer;
    }

    .lines-overlay:not(.connection-mode) .drawn-line:hover {
        stroke: #ff4444; /* THEME.colors.lineHover */
        stroke-width: 4; /* THEME.sizes.lineWidthHover */
    }
</style>
