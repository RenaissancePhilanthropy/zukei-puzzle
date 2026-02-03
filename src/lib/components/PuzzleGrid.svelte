<script lang="ts">
    type PuzzleGridProps = {
        rows: number;
        columns: number;
    };

    export type GridPoint = {
        row: number;
        column: number;
        corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };

    let { rows, columns }: PuzzleGridProps = $props();

    let gridElement: HTMLElement;

    type Line = {
        from: GridPoint;
        to: GridPoint;
    };

    let firstPoint = $state<GridPoint | null>(null);
    let lines = $state<Line[]>([]);

    /**
     * Find a grid point element by grid coordinates.
     * @param x Column coordinate (0 to columns)
     * @param y Row coordinate (0 to rows)
     * @return The HTML element at that point, or null if not found
     */
    export function findGridPoint(x: number, y: number): HTMLElement | null {
        // Validate coordinates are within grid bounds
        if (x < 0 || x > columns || y < 0 || y > rows || !gridElement) {
            return null;
        }

        // Determine which cell and corner contains this point
        let cellRow: number;
        let cellColumn: number;
        let corner: string;
        
        if (y === rows && x === columns) {
            // Bottom-right corner
            cellRow = rows - 1;
            cellColumn = columns - 1;
            corner = 'bottom-right';
        } else if (y === rows) {
            // Bottom edge
            cellRow = rows - 1;
            cellColumn = x;
            corner = 'bottom-left';
        } else if (x === columns) {
            // Right edge
            cellRow = y;
            cellColumn = columns - 1;
            corner = 'top-right';
        } else {
            // Interior or top-left points
            cellRow = y;
            cellColumn = x;
            corner = 'top-left';
        }

        // Find the cell element
        const cell = gridElement.querySelector(
            `.puzzle-cell[data-row="${cellRow}"][data-column="${cellColumn}"]`
        );

        if (!cell) return null;

        // Find the point button within the cell
        return cell.querySelector(`.puzzle-point.${corner}`) as HTMLElement;
    }

    const onPointClicked = (point: GridPoint) => {
        if (!firstPoint) {
            // First click - select the starting point
            firstPoint = point;
        } else {
            // Second click - create a line
            const isSamePoint =
                firstPoint.row === point.row &&
                firstPoint.column === point.column &&
                firstPoint.corner === point.corner;

            if (!isSamePoint) {
                // Add the line
                lines.push({
                    from: firstPoint,
                    to: point
                });
            }

            // Reset the first point
            firstPoint = null;
        }
    };

    const isPointSelected = (point: GridPoint): boolean => {
        if (!firstPoint) return false;
        return firstPoint.row === point.row &&
               firstPoint.column === point.column &&
               firstPoint.corner === point.corner;
    };

    // Helper to get pixel coordinates for a grid point
    const getPointCoordinates = (point: GridPoint): { x: number; y: number } | null => {
        const pointElement = findGridPoint(
            point.corner === 'top-right' || point.corner === 'bottom-right' ? point.column + 1 : point.column,
            point.corner === 'bottom-left' || point.corner === 'bottom-right' ? point.row + 1 : point.row
        );

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
</script>

<div class="puzzle-grid-wrapper">
    <div class="puzzle-grid" bind:this={gridElement} style="grid-template-rows: repeat({rows}, 1fr); grid-template-columns: repeat({columns}, 1fr); aspect-ratio: {columns} / {rows};">
        {#each Array(rows) as _, row}
            {#each Array(columns) as _, column}
                <div class="puzzle-cell" data-row={row} data-column={column}>
                    <button
                        class="puzzle-point top-left"
                        class:selected={isPointSelected({row, column, corner: 'top-left'})}
                        onclick={() => onPointClicked({row, column, corner: 'top-left'})}
                        aria-label="Point at {row}, {column}"
                        data-row={row}
                        data-column={column}>
                    </button>
                    {#if column === columns - 1}
                        <button
                            class="puzzle-point top-right"
                            class:selected={isPointSelected({row, column, corner: 'top-right'})}
                            onclick={() => onPointClicked({row, column, corner: 'top-right'})}
                            aria-label="Point at {row}, {column + 1}"
                            data-row={row}
                            data-column={column + 1}>
                        </button>
                    {/if}
                    {#if row === rows - 1}
                        <button
                            class="puzzle-point bottom-left"
                            class:selected={isPointSelected({row, column, corner: 'bottom-left'})}
                            onclick={() => onPointClicked({row, column, corner: 'bottom-left'})}
                            aria-label="Point at {row + 1}, {column}"
                            data-row={row + 1}
                            data-column={column}>
                        </button>
                    {/if}
                    {#if row === rows - 1 && column === columns - 1}
                        <button
                            class="puzzle-point bottom-right"
                            class:selected={isPointSelected({row, column, corner: 'bottom-right'})}
                            onclick={() => onPointClicked({row, column, corner: 'bottom-right'})}
                            aria-label="Point at {row + 1}, {column + 1}"
                            data-row={row + 1}
                            data-column={column + 1}>
                        </button>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>

    <svg class="lines-overlay">
        {#each lines as line}
            {@const fromCoords = getPointCoordinates(line.from)}
            {@const toCoords = getPointCoordinates(line.to)}
            {#if fromCoords && toCoords}
                <line
                    x1={fromCoords.x}
                    y1={fromCoords.y}
                    x2={toCoords.x}
                    y2={toCoords.y}
                    stroke="#2b2a29"
                    stroke-width="3"
                    stroke-linecap="round"
                />
            {/if}
        {/each}
    </svg>
</div>


<style>
    .puzzle-grid-wrapper {
        position: relative;
        max-width: 100vw;
        max-height: 100vh;
        padding: 20px;
    }

    .puzzle-grid {
        display: grid;
    }

    .puzzle-cell {
        border: 1px dashed #222;
        position: relative;
    }

    .puzzle-point {
        width: 20px;
        height: 20px;
        background-color: #2b2a29;
        border-radius: 50%;
        position: absolute;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
    }

    .puzzle-point:hover {
        background-color: #4a4948;
        transform: scale(1.2);
    }

    .puzzle-point.selected {
        background-color: #007bff;
        border-color: #0056b3;
        transform: scale(1.3);
    }

    .puzzle-point.top-left {
        top: -10px;
        left: -10px;
    }

    .puzzle-point.top-right {
        top: -10px;
        right: -10px;
    }

    .puzzle-point.bottom-left {
        bottom: -10px;
        left: -10px;
    }

    .puzzle-point.bottom-right {
        bottom: -10px;
        right: -10px;
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
</style>