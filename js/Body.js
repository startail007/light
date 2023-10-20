import { Vector, VectorE } from "./math/Vector.js";
import { drawPolygon } from "./Fun.js";
export class Body {
  constructor(pos, option = {}) {
    this.type = "";
    this.pos = Vector.clone(pos);
    this.angle = 0;
    this.points = [];
    this._transformedPoints = [];
    this._transformUpdateRequired = false;
    this._edges = [];
    this._edgesUpdateRequired = false;
    Object.assign(this, option);
  }
  get transformedPoints() {
    if (this._transformUpdateRequired) {
      this._transformedPoints = this.points.map((point) => Vector.add(Vector.rotate(point, this.angle), this.pos));
      this._transformUpdateRequired = false;
    }
    return this._transformedPoints;
  }
  get edges() {
    if (this._edgesUpdateRequired) {
      const points = this.transformedPoints;
      const edges = [];
      for (let i = 0; i < points.length; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        const dir = Vector.sub(p1, p0);
        const unitDir = Vector.normalize(dir);
        edges.push({ p0, p1, dir, unitDir });
      }
      this._edges = edges;
      this._edgesUpdateRequired = false;
    }
    return this._edges;
  }
  rotate(amount) {
    this.angle += amount;
    this._transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
  rotateTo(angle) {
    this.angle = angle;
    this.transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
  rotateFrom(amount, center) {
    this.angle += amount;
    const move = Vector.sub(Vector.rotateFrom(this.pos, amount, center), this.pos);
    VectorE.add(this.pos, move);
    this._transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
  move(amount) {
    VectorE.add(this.pos, amount);
    this._transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
  moveTo(pos) {
    VectorE.set(this.pos, pos);
    this._transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
  render(ctx) {
    drawPolygon(ctx, this.transformedPoints, "#ff0000");
  }
}

export class BodyBox extends Body {
  constructor(pos, size = [100, 100], option = {}) {
    super(pos, option);
    this.type = "box";
    this.size = Vector.clone(size);
    const halfSize = Vector.scale(this.size, 0.5);
    this.points.push([-halfSize[0], -halfSize[1]]);
    this.points.push([halfSize[0], -halfSize[1]]);
    this.points.push([halfSize[0], halfSize[1]]);
    this.points.push([-halfSize[0], halfSize[1]]);
    this._transformUpdateRequired = true;
    this._edgesUpdateRequired = true;
  }
}
export class BodyCircle extends Body {
  constructor(pos, radius = 50, option = {}) {
    super(pos, option);
    this.type = "circle";
    this.radius = radius;
  }
  move(amount) {
    VectorE.add(this.pos, amount);
  }
}
