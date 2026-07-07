import * as PIXI from "./pixi.mjs";

(async () => {

  const app = new PIXI.Application();

  await app.init({ background: '#dfe549', resizeTo: window });

  document.body.appendChild(app.canvas);
})();
