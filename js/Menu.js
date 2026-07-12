import { Container, Text } from "./pixi.mjs";

export default class Menu extends Container{
    constructor(app, startGameCallback) {
        super();

        this.app = app;
        this.startGameCallback = startGameCallback;
        

        const title = new Text({
            text: 'АРКАНОИД',
            style: {
                fontSize: 64,
                fill: 0xffffff,
                fontWeight: 'bold',
                fontFamily: 'Arial'
            }
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 150;
        this.addChild(title);

        const playBtn = new Text({
            text: 'НАЧАТЬ ИГРУ',
            style: {
                fontSize: 36,
                fill: 0x00ff00,
                fontWeight: 'bold',
                fontFamily: 'Arial'
            }
        });
        playBtn.anchor.set(0.5);
        playBtn.x = this.app.screen.width / 2;
        playBtn.y = 350;
        playBtn.interactive = true;
        playBtn.buttonMode = true;
        playBtn.on('pointerdown', () => {
            this.startGameCallback();
        });
        this.addChild(playBtn);

        const lessonBtn = new Text({
            text: 'Обучение',
            style: {
                fontSize: 24,
                fill: 0xff0000,
                fontFamily: 'Arial'
            }
        });
        lessonBtn.anchor.set(0.5);
        lessonBtn.x = this.app.screen.width / 2;
        lessonBtn.y = 450;
        lessonBtn.interactive = true;
        lessonBtn.buttonMode = true;
        lessonBtn.on('pointerdown', () => {
            console.log('Тут будет обучение')
        });
        this.addChild(lessonBtn);
    }
}