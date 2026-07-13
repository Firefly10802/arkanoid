import { Container, Graphics, Sprite } from "../pixi.mjs";

export default class Block extends Container{
    constructor(x, y, width, height, color, hp, texture){
        super();

        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.width = width;
        this.height = height;
        this.hp = hp

        const sprite = new Sprite(texture);
        sprite.width = width;
        sprite.height = height;
        this.addChild(sprite);      
    } 

    destroy() {
        this.isAlive = false;
        this.parent.removeChild(this);
    }
}