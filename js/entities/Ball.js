import { Container, Graphics } from "../pixi.mjs";

export default class Ball extends Container{
    constructor(){
        super();

        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.circle(0,0, 10);
        view.stroke();

        this.addChild(view);
    } 
}