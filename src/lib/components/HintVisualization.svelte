<script lang="ts">
  import type { LineHighlight, PointHighlight, AngleHighlight } from "$lib/hints/types";
  import type { GridPoint, Line } from "$lib/types";
  import { HINT_THEME } from "$lib/constants/hintTheme";

  type Props = {
    lineHighlights: LineHighlight[];
    pointHighlights?: PointHighlight[];
    angleHighlights?: AngleHighlight[];
    getPointCoordinates: (point: GridPoint) => { x: number; y: number } | null;
    userLines?: Line[];
    viewBox?: string;
  };

  let {
    lineHighlights,
    pointHighlights = [],
    angleHighlights = [],
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

  // Compute pixel coordinates for highlighted angles
  const highlightedAngles = $derived(
    angleHighlights
      ?.map(highlight => {
        const vertexCoords = getPointCoordinates(highlight.vertex);
        const point1Coords = getPointCoordinates(highlight.point1);
        const point2Coords = getPointCoordinates(highlight.point2);

        if (!vertexCoords || !point1Coords || !point2Coords) return null;

        return {
          ...highlight,
          vertexCoords,
          point1Coords,
          point2Coords
        };
      })
      .filter(Boolean) ?? []
  );

  function getStrokeColor(type: string): string {
    return HINT_THEME.lineColors[type as keyof typeof HINT_THEME.lineColors] || '#000';
  }

  // Helper to calculate angle arc path
  function getAngleArcPath(
    vertexX: number,
    vertexY: number,
    point1X: number,
    point1Y: number,
    point2X: number,
    point2Y: number,
    radius: number = 20
  ): string {
    // Calculate angles for both arms
    const angle1 = Math.atan2(point1Y - vertexY, point1X - vertexX);
    const angle2 = Math.atan2(point2Y - vertexY, point2X - vertexX);

    // Calculate arc endpoints
    const startX = vertexX + radius * Math.cos(angle1);
    const startY = vertexY + radius * Math.sin(angle1);
    const endX = vertexX + radius * Math.cos(angle2);
    const endY = vertexY + radius * Math.sin(angle2);

    // Determine sweep direction (always use smaller arc)
    let angleDiff = angle2 - angle1;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const sweepFlag = angleDiff > 0 ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`;
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

  <!-- Draw angle indicators -->
  {#each highlightedAngles as angleHighlight}
    {#if angleHighlight}
      {@const arcPath = getAngleArcPath(
        angleHighlight.vertexCoords.x,
        angleHighlight.vertexCoords.y,
        angleHighlight.point1Coords.x,
        angleHighlight.point1Coords.y,
        angleHighlight.point2Coords.x,
        angleHighlight.point2Coords.y,
        25
      )}

      <!-- Draw angle arc -->
      <path
        d={arcPath}
        stroke={getStrokeColor(angleHighlight.highlightType)}
        stroke-width="2"
        fill="none"
        opacity="0.8"
      />

      <!-- Draw angle label -->
      {#if angleHighlight.label}
        {@const midAngle1 = Math.atan2(
          angleHighlight.point1Coords.y - angleHighlight.vertexCoords.y,
          angleHighlight.point1Coords.x - angleHighlight.vertexCoords.x
        )}
        {@const midAngle2 = Math.atan2(
          angleHighlight.point2Coords.y - angleHighlight.vertexCoords.y,
          angleHighlight.point2Coords.x - angleHighlight.vertexCoords.x
        )}
        {@const avgAngle = (midAngle1 + midAngle2) / 2}
        {@const labelRadius = 35}
        {@const labelX = angleHighlight.vertexCoords.x + labelRadius * Math.cos(avgAngle)}
        {@const labelY = angleHighlight.vertexCoords.y + labelRadius * Math.sin(avgAngle)}

        <text
          x={labelX}
          y={labelY}
          fill={getStrokeColor(angleHighlight.highlightType)}
          font-size={HINT_THEME.sizes.labelFontSize}
          text-anchor="middle"
          class="hint-label angle-label"
        >
          {angleHighlight.label}
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
