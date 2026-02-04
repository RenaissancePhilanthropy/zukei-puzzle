import type { GridPoint, Line } from "$lib/types";
import { GEOMETRY_TOLERANCES } from "$lib/constants/geometry";

/**
 * Calculates the side lengths of a polygon formed by the given points.
 * Points should be in clockwise or counter-clockwise order.
 * @param points Array of points forming the polygon
 * @returns Array of side lengths where each element is the distance from point i to point (i+1) % n
 */
export function calculateSideLengths(points: GridPoint[]): number[] {
  return points.map((point, i) => {
    const next = points[(i + 1) % points.length];
    return Math.hypot(next.column - point.column, next.row - point.row);
  });
}

/**
 * Checks if the given lines form a closed polygon.
 * A closed polygon has each point connected to exactly 2 other points.
 * @param lines Array of lines
 * @returns True if lines form a closed polygon, false otherwise
 */
export function isClosedPolygon(lines: Line[]): boolean {
  if (lines.length < 3) {
    return false;
  }

  // Build adjacency map
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

  // Check that each point has exactly 2 connections
  for (const connections of adjacencyMap.values()) {
    if (connections.length !== 2) {
      return false;
    }
  }

  return true;
}

/**
 * Sorts points in clockwise order around their centroid.
 * Modifies the array in place and returns it.
 * @param points Array of points to sort
 * @returns The same array, sorted in clockwise order
 */
export function sortPointsClockwise(points: GridPoint[]): GridPoint[] {
  const centerX = points.reduce((sum, p) => sum + p.column, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.row, 0) / points.length;

  points.sort((a, b) => {
    const angleA = Math.atan2(a.row - centerY, a.column - centerX);
    const angleB = Math.atan2(b.row - centerY, b.column - centerX);
    return angleA - angleB;
  });

  return points;
}

/**
 * Checks if two line segments are parallel.
 * @param p1 Start point of first line
 * @param p2 End point of first line
 * @param p3 Start point of second line
 * @param p4 End point of second line
 * @returns True if lines are parallel within tolerance, false otherwise
 */
export function areParallel(p1: GridPoint, p2: GridPoint, p3: GridPoint, p4: GridPoint): boolean {
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

  // Check if slopes are equal using cross product
  const crossProduct = Math.abs(dy1 * dx2 - dy2 * dx1);
  return crossProduct < GEOMETRY_TOLERANCES.parallelCheck;
}

/**
 * Checks if two edges are perpendicular (form a 90-degree angle).
 * @param p1 First point of first edge
 * @param p2 Second point of first edge (shared vertex)
 * @param p3 Second point of second edge
 * @returns True if edges are perpendicular within tolerance, false otherwise
 */
export function arePerpendicular(p1: GridPoint, p2: GridPoint, p3: GridPoint): boolean {
  // Vectors from p2 to p1 and p2 to p3
  const v1x = p1.column - p2.column;
  const v1y = p1.row - p2.row;
  const v2x = p3.column - p2.column;
  const v2y = p3.row - p2.row;

  // Dot product should be zero for perpendicular vectors
  const dotProduct = v1x * v2x + v1y * v2y;
  return Math.abs(dotProduct) < GEOMETRY_TOLERANCES.vector;
}

/**
 * Extracts unique points from a list of lines.
 * @param lines Array of lines
 * @returns Array of unique GridPoints
 */
export function extractUniquePoints(lines: Line[]): GridPoint[] {
  const pointSet = new Map<string, GridPoint>();
  const pointKey = (p: GridPoint) => `${p.row},${p.column}`;

  for (const line of lines) {
    const fromKey = pointKey(line.from);
    const toKey = pointKey(line.to);

    if (!pointSet.has(fromKey)) {
      pointSet.set(fromKey, line.from);
    }
    if (!pointSet.has(toKey)) {
      pointSet.set(toKey, line.to);
    }
  }

  return Array.from(pointSet.values());
}

/**
 * Converts lines to an ordered array of points forming the polygon.
 * Assumes lines form a closed polygon.
 * @param lines Array of lines forming a polygon
 * @returns Ordered array of points
 */
export function linesToOrderedPoints(lines: Line[]): GridPoint[] {
  if (lines.length === 0) {
    return [];
  }

  const uniquePoints = extractUniquePoints(lines);
  return sortPointsClockwise(uniquePoints);
}

/**
 * Calculates the angle in degrees at a vertex formed by three points.
 * @param point1 First point forming one arm of the angle
 * @param vertex The vertex point where the angle is measured
 * @param point2 Second point forming the other arm of the angle
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(point1: GridPoint, vertex: GridPoint, point2: GridPoint): number {
  // Vectors from vertex to each point
  const v1x = point1.column - vertex.column;
  const v1y = point1.row - vertex.row;
  const v2x = point2.column - vertex.column;
  const v2y = point2.row - vertex.row;

  // Calculate angle using dot product and magnitudes
  const dotProduct = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  // Get angle in radians, then convert to degrees
  const angleRad = Math.acos(dotProduct / (mag1 * mag2));
  return angleRad * (180 / Math.PI);
}
