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
        // Placeholder for point click handling
        console.log('Point clicked:', point);
    };
</script>

<div class="puzzle-grid" bind:this={gridElement} style="grid-template-rows: repeat({rows}, 1fr); grid-template-columns: repeat({columns}, 1fr); aspect-ratio: {columns} / {rows};">
    {#each Array(rows) as _, row}
        {#each Array(columns) as _, column}
            <div class="puzzle-cell" data-row={row} data-column={column}>
                <button class="puzzle-point top-left" onclick={() => onPointClicked({row, column, corner: 'top-left'})} aria-label="Point at {row}, {column}" data-row={row} data-column={column}></button>
                {#if column === columns - 1}
                    <button class="puzzle-point top-right" onclick={() => onPointClicked({row, column, corner: 'top-right'})} aria-label="Point at {row}, {column + 1}" data-row={row} data-column={column + 1}></button>
                {/if}
                {#if row === rows - 1}
                    <button class="puzzle-point bottom-left" onclick={() => onPointClicked({row, column, corner: 'bottom-left'})} aria-label="Point at {row + 1}, {column}" data-row={row + 1} data-column={column}></button>
                {/if}
                {#if row === rows - 1 && column === columns - 1}
                    <button class="puzzle-point bottom-right" onclick={() => onPointClicked({row, column, corner: 'bottom-right'})} aria-label="Point at {row + 1}, {column + 1}" data-row={row + 1} data-column={column + 1}></button>
                {/if}
            </div>
        {/each}
    {/each}
</div>


<style>
    .puzzle-grid {
        display: grid;
        max-width: 100vw;
        max-height: 100vh;
        padding: 20px;
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
</style>