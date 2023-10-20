import { Vector } from "./math/Vector.js";

export const drawLine = (ctx, p0, p1, color) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(...p0);
  ctx.lineTo(...p1);
  ctx.stroke();
};
export const drawPoint = (ctx, p0, color) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(...p0, 5, 0, 2 * Math.PI);
  ctx.stroke();
};
export const drawPolygon = (ctx, points, color) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  if (points.length > 1) {
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(...points[i]);
    }
    ctx.lineTo(...points[0]);
  }
  ctx.stroke();
};
export const calcRefraction = (incidentRay, edge, n) => {
  const d = Vector.dot(incidentRay, edge);
  const x1 = d * n;
  if (Math.abs(x1) <= 1) {
    const y1 = (1 - x1 ** 2) ** 0.5;
    const x2 = x1 * edge[0] - y1 * edge[1];
    const y2 = x1 * edge[1] + y1 * edge[0];
    return [x2, y2];
  }
};
export const lightToEdge = (pos, dir, edgePos, edgeDir) => {
  const det = Vector.cross(dir, edgeDir);
  if (det !== 0) {
    const v3 = Vector.sub(edgePos, pos);
    const t = Vector.cross(v3, edgeDir) / det;
    const t0 = Vector.cross(v3, dir) / det;
    if (t >= 0 && t0 >= 0 && t0 <= 1) {
      return t;
    }
  }
};
