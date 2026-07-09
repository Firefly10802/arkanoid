import { Container, Graphics } from "../pixi.mjs";

export default class Block extends Container{
    constructor(x, y, width, height, color){
        super();
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.color = color;
        this.width = width;
        this.height = height;

        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: color});
        view.rect(0,0,width,height);
        view.stroke();

        this.addChild(view);

        
    } 

    destroy() {
        this.isAlive = false;
        this.parent.removeChild(this);
    }
}