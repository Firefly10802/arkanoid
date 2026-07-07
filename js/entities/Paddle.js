import { Container, Graphics } from "../pixi.mjs";

export default class Paddle extends Container{
    constructor(){
        super();

        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.rect(0,0,120,60);
        view.stroke();
        
        this.addChild(view);
    } 
}