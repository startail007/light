import { BodyBox } from "./js/Body.js";
import { drawLine, calcRefraction, lightToEdge, drawPoint } from "./js/Fun.js";
import { Vector, VectorE } from "./js/math/Vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
const maxLen = (cWidth ** 2 + cHeight ** 2) ** 0.5;

const bodyList = [];
bodyList.push(new BodyBox([250, 200], [200, 200], { angle: 0.15 * Math.PI }));
bodyList.push(new BodyBox([550, 400], [200, 200], { angle: 0.15 * Math.PI }));
bodyList.forEach((body) => {
  body.render(ctx);
});
const lights = [];
for (let i = 0; i < 10; i++) {
  const rate = i / 10;
  lights.push({
    pos: [0, 0 + rate * 600],
    //dir: [Math.cos(rate * 2 * Math.PI), Math.sin(rate * 2 * Math.PI)],
    dir: [1, 0],
    n: 1,
    s: 100,
  });
}
// lights.push({
//   pos: [0, 200],
//   dir: [1, 0],
//   n: 1,
//   s: 100,
// });
// lights.push({
//   pos: [0, 260],
//   dir: [1, 0],
//   n: 1,
//   s: 100,
// });
// lights.push({
//   pos: [0, 320],
//   dir: [1, 0],
//   n: 1,
//   s: 100,
// });
let tRate = 0;
const update = () => {
  tRate += 0.02;
  tRate %= 1;
  bodyList[0].rotate(-0.002);
  bodyList[1].rotate(0.004);
  const edges = [];
  bodyList.forEach((body) => {
    edges.push(...body.edges);
  });
  // const n1 = 1.333;
  const n1 = 2.417;
  edges.forEach((edge) => {
    edge.dir = Vector.sub(edge.p1, edge.p0);
    edge.unitDir = Vector.normalize(edge.dir);
  });

  edges.forEach((edge) => {
    drawLine(ctx, edge.p0, edge.p1, "#ff0000");
  });
  lights.forEach((light) => {
    let pos = Vector.clone(light.pos);
    let dir = Vector.clone(light.dir);
    let s = light.s;
    let n = light.n;
    let currentEdge = null;
    let rate = tRate;
    for (let i = 0; i < 30; i++) {
      let _t = Number.MAX_VALUE;
      let _edge = null;
      let _currentEdge = null;
      edges.forEach((edge, index) => {
        const t = lightToEdge(pos, dir, edge.p0, edge.dir);
        if (index === currentEdge) return;
        if (t === undefined) return;
        if (t >= _t) return;
        _t = t;
        _edge = edge;
        _currentEdge = index;
      });
      if (_edge) {
        const v = Vector.sub(pos, _edge.p0);
        let _n = n / n1;
        let _edgeDir = _edge.unitDir;
        if (Vector.cross(v, _edge.dir) < 0) {
          _n = 1 / _n;
          _edgeDir = Vector.negate(_edgeDir);
        }
        currentEdge = _currentEdge;
        const intersection = Vector.add(pos, Vector.scale(dir, _t));
        let emergentRay = calcRefraction(dir, _edgeDir, _n);
        let bool = true;
        if (!emergentRay) {
          bool = false;
          const projection = Vector.projection(dir, _edgeDir);
          const normal = Vector.sub(dir, projection);
          emergentRay = Vector.add(projection, Vector.negate(normal));
        }
        drawLine(ctx, pos, intersection, "#ffffff");
        drawPart(ctx, pos, intersection, s, rate);
        rate = (1 - ((Vector.distance(pos, intersection) - rate * s) % s) / s) % 1;
        if (bool) {
          s *= _n;
        }
        VectorE.set(pos, intersection);
        VectorE.set(dir, emergentRay);
      } else {
        break;
      }
    }
    // console.log(rate);
    const pp = Vector.add(pos, Vector.scale(dir, maxLen));
    drawLine(ctx, pos, pp, "#ffffff");
    drawPart(ctx, pos, pp, s, rate);
  });
};
const drawPart = (ctx, p0, p1, s, rate) => {
  const v = Vector.sub(p1, p0);
  const len = Vector.length(v);
  const count = Math.floor((len - rate * s) / s);
  for (let i = 0; i < count + 1; i++) {
    drawPoint(ctx, Vector.add(p0, Vector.scale(v, ((rate + i) * s) / len)), "#00ff00");
  }
};
const animate = (t) => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, cWidth, cHeight);
  update();
};
requestAnimationFrame(animate);
