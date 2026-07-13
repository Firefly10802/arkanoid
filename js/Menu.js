import { Container, Text, Graphics } from "./pixi.mjs";

export default class Menu extends Container {
    constructor(app, startGameCallback) {
        super();

        this.app = app;
        this.startGameCallback = startGameCallback;

        const title = new Text({
            text: 'АРКАНОИД',
            style: {
                fontSize: 64,
                fill: 0x8998a9,
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7'
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
                fill: 0x8998a9,
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7'
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
                fill: 0x8998a9,
                fontFamily: 'long_pixel-7'
            }
        });
        lessonBtn.anchor.set(0.5);
        lessonBtn.x = this.app.screen.width / 2;
        lessonBtn.y = 450;
        lessonBtn.interactive = true;
        lessonBtn.buttonMode = true;
        lessonBtn.on('pointerdown', () => {
            console.log('Тут будет обучение');
        });
        this.addChild(lessonBtn);
    }
}