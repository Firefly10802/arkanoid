import Game from "./Game.js"
import * as PIXI from "./pixi.mjs";

(async () => {

  const app = new PIXI.Application();

  await app.init({ 
    width: 800,
    height: 800
  });

  document.body.appendChild(app.canvas);

  const game = new Game(app);
})();

