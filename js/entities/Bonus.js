import { Container, Graphics, Sprite } from "../pixi.mjs";

export default class Bonus extends Container{
    constructor(x, y, type, texture){
        super();
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.type = type;
        this.speed = 3;
        this.maxSize = 38;
        const scale = Math.min(
            this.maxSize / texture.width,
            this.maxSize / texture.height
        );
        
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(scale);
        this.addChild(sprite);
        this._sprite = sprite;
        
    } 
    update() {
        this.y += this.speed;
    }
    destroy() {
        this.isAlive = false;
        this.parent.removeChild(this);
    }
}