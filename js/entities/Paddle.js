import { Container, Graphics } from "../pixi.mjs";

export default class Paddle extends Container{
    constructor(){
        super();

        const view = new Graphics();
        view.fill(0xffffff);
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.rect(0,0,120,30);
        view.stroke();
        this.addChild(view);
    } 
}