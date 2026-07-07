import Paddle from "./entities/Paddle.js";

export default class Game{
    #app;

    constructor(app){
        this.#app = app;
        this.#app.stage.addChild(new Paddle());
    }
}