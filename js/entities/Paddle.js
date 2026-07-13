import { Container, Graphics, Sprite } from "../pixi.mjs";

export default class Paddle extends Container{
    constructor(texture){
        super();
        this._width = 68;
        this._height = 18;

        this.texture = texture;

        this.updateTexture()
    } 
    updateTexture() {
        while (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }

        if (this.texture) {
            const sprite = new Sprite(this.texture);
            sprite.width = this._width;
            sprite.height = this._height + 18;
            this.addChild(sprite);
            this._sprite = sprite;
        } else {
            const view = new Graphics();
            view.fill(0xffffff);
            view.setStrokeStyle({ width: 2, color: 0xff0000 });
            view.rect(0, 0, this._width, this._height);
            view.stroke();
            this.addChild(view);
        }
    }
    get width() {
        return this._width;
    }

    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.updateTexture();
        }
    }

    get height() {
        return this._height;
    }

    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.updateTexture();
        }
    }

    setTexture(texture) {
        this.texture = texture;
        this.updateTexture();
    }

    setSize(width) {
        let needUpdate = false;
        
        if (this._width !== width) {
            this._width = width;
            needUpdate = true;
        }
        
        if (needUpdate) {
            this.updateTexture();
        }
    }
}