import { Container, Graphics } from "../pixi.mjs";

export default class Paddle extends Container{
    constructor(){
        super();
        this._width = 400;
        this._height = 30;

        const view = new Graphics();
        view.fill(0xffffff);
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.rect(0,0,this._width,this._height);
        view.stroke();
        this.addChild(view);
    } 

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.updateView();
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.updateView();
    }

    updateView() {
        this.removeChild(this.children[0]);

        const view = new Graphics();
        view.fill(0xffffff);
        view.setStrokeStyle({ width: 2, color: 0xff0000 });
        view.rect(0, 0, this._width, this._height);
        view.stroke();
        this.addChild(view);
    }
}