<script lang="ts">
    type PuzzleGridProps = {
        rows: number;
        columns: number;
    };

    let { rows, columns }: PuzzleGridProps = $props();

</script>

<div class="puzzle-grid" style="grid-template-rows: repeat({rows}, 1fr); grid-template-columns: repeat({columns}, 1fr); aspect-ratio: {columns} / {rows};">
    {#each Array(rows) as _, row}
        {#each Array(columns) as _, column}
            <div class="puzzle-cell" data-row={row} data-column={column}>
                <div class="puzzle-point top-left"></div>
                {#if column === columns - 1}
                    <div class="puzzle-point top-right"></div>
                {/if}
                {#if row === rows - 1}
                    <div class="puzzle-point bottom-left"></div>
                {/if}
                {#if row === rows - 1 && column === columns - 1}
                    <div class="puzzle-point bottom-right"></div>
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