<script lang="ts">
  import type { LineHighlight, PointHighlight } from "$lib/hints/types";
  import type { GridPoint, Line } from "$lib/types";
  import { HINT_THEME } from "$lib/constants/hintTheme";

  type Props = {
    lineHighlights: LineHighlight[];
    pointHighlights?: PointHighlight[];
    getPointCoordinates: (point: GridPoint) => { x: number; y: number } | null;
    userLines?: Line[];
    viewBox?: string;
  };

  let {
    lineHighlights,
    pointHighlights = [],
    getPointCoordinates,
    userLines = [],
    viewBox = "0 0 400 400"
  }: Props = $props();

  // Compute pixel coordinates for user's context lines
  const contextLines = $derived(
    userLines.map(line => {
      const fromCoords = getPointCoordinates(line.from);
      const toCoords = getPointCoordinates(line.to);
      return fromCoords && toCoords ? { fromCoords, toCoords } : null;
    }).filter(Boolean)
  );

  // Compute pixel coordinates for highlighted lines
  const highlightedLines = $derived(
    lineHighlights.map(highlight => {
      const fromCoords = getPointCoordinates(highlight.from);
      const toCoords = getPointCoordinates(highlight.to);
      return fromCoords && toCoords ? {
        ...highlight,
        fromCoords,
        toCoords
      } : null;
    }).filter(Boolean)
  );

  // Compute pixel coordinates for highlighted points
  const highlightedPoints = $derived(
    pointHighlights
      ?.map(highlight => {
        const coords = getPointCoordinates(highlight.point);
        return coords ? { ...highlight, coords } : null;
      })
      .filter(Boolean) ?? []
  );

  function getStrokeColor(type: string): string {
    return HINT_THEME.lineColors[type as keyof typeof HINT_THEME.lineColors] || '#000';
  }
</script>

<svg class="hint-visualization" {viewBox}>
  <!-- Draw user's lines as context (light gray) -->
  {#each contextLines as line}
    {#if line}
      <line
        x1={line.fromCoords.x}
        y1={line.fromCoords.y}
        x2={line.toCoords.x}
        y2={line.toCoords.y}
        stroke={HINT_THEME.lineColors.reference}
        stroke-width={HINT_THEME.sizes.contextLineWidth}
        stroke-linecap="round"
        opacity={HINT_THEME.opacity.contextLine}
      />
    {/if}
  {/each}

  <!-- Draw highlighted lines -->
  {#each highlightedLines as line}
    {#if line}
      <line
        x1={line.fromCoords.x}
        y1={line.fromCoords.y}
        x2={line.toCoords.x}
        y2={line.toCoords.y}
        stroke={getStrokeColor(line.highlightType)}
        stroke-width={HINT_THEME.sizes.highlightLineWidth}
        stroke-linecap="round"
        opacity={HINT_THEME.opacity.highlightLine}
      />

      {#if line.label}
        <text
          x={(line.fromCoords.x + line.toCoords.x) / 2}
          y={(line.fromCoords.y + line.toCoords.y) / 2 - 10}
          fill={getStrokeColor(line.highlightType)}
          font-size={HINT_THEME.sizes.labelFontSize}
          text-anchor="middle"
          class="hint-label"
        >
          {line.label}
        </text>
      {/if}
    {/if}
  {/each}

  <!-- Draw highlighted points -->
  {#each highlightedPoints as point}
    {#if point}
      <circle
        cx={point.coords.x}
        cy={point.coords.y}
        r={HINT_THEME.sizes.highlightPoint}
        fill={HINT_THEME.lineColors.reference}
        opacity="0.6"
      />

      {#if point.label}
        <text
          x={point.coords.x}
          y={point.coords.y - 15}
          fill={HINT_THEME.lineColors.reference}
          font-size={HINT_THEME.sizes.labelFontSize}
          text-anchor="middle"
          class="hint-label"
        >
          {point.label}
        </text>
      {/if}
    {/if}
  {/each}
</svg>

<style>
  .hint-visualization {
    width: 100%;
    height: 100%;
  }

  .hint-label {
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 600;
    text-shadow: 0 0 4px white, 0 0 4px white;
    user-select: none;
  }
</style>
