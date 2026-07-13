import { Sprite } from "./pixi.mjs";

export default class Background extends Sprite {
    constructor(texture, app) {
        super(texture);
        this.width = app.screen.width;
        this.height = app.screen.width;
    }
}