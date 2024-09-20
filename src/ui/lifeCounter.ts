import { Container, Sprite } from 'pixi.js';

export class LifeCounter {
    public view = new Container();

    public hearts: Container<any>[] = [];

    constructor() {
        for (let i = 0; i < 3; i++) {
            this.addHeart(i);
        }
    }

    addHeart(index = 0) {
        const container = new Container();
        container.x = 10 + index * 50;
        this.view.addChild(container);
        this.hearts.push(container);

        const scale = 0.35;
        const heartBase = Sprite.from('heart');
        heartBase.anchor.set(0.5);
        heartBase.scale.set(scale);
        heartBase.tint = 0x00000;
        heartBase.alpha = 0.5;
        container.addChild(heartBase);

        const heart = Sprite.from('heart');
        heart.anchor.set(0.5);
        heart.scale.set(scale);
        container.addChild(heart);
    }

    setLife(lives: number) {
        this.hearts.forEach((heart, index) => {
            heart.getChildAt(1).visible = index < lives;
        });
    }
}
