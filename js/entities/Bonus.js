import { Container, Graphics } from "../pixi.mjs";

export default class Bonus extends Container{
    constructor(x, y, type){
        super();
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.type = type;
        this.speed = 3;
        const colors = {
            wide: 0x00FF00,
            narrow: 0xFF0000,
            slow: 0xFFFF00,
            fast: 0xFF00FF,
            life: 0x00FFFF,
            manyballs: 0xFF8183 
        }
        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: colors[type]});
        view.rect(0,0,20,10);
        view.stroke();

        this.addChild(view);

        
    } 
    update() {
        this.y += this.speed;
    }
    destroy() {
        this.isAlive = false;
        this.parent.removeChild(this);
    }
}