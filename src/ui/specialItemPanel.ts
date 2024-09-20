import { Container } from 'pixi.js';
import { IconButton } from './buttons/IconButton';
import { Signal } from 'typed-signals';
import { boardConfig, SpecialBubbleType } from '../game/boardConfig';
import { Ads } from '../sdk/ads';
import gsap from 'gsap';
import { FirebaseEventLogger } from '../firebase/firebaseEventLogger';
import { Game } from '../game/Game';
import { PauseSystem } from '../game/systems/PauseSystem';

export class SpecialItemPanel {
    public view = new Container();
    public _bombButton = new IconButton('bubble-bomb-ads', 0.85, 'button-circle', { x: -7, y: -10 });
    public _timerButton = new IconButton('bubble-timer-ads', 0.85, 'button-circle', { x: -7, y: -10 });
    public _superButton = new IconButton('bubble-super-ads', 0.85, 'button-circle', { x: -7, y: -10 });

    public signalSelected = new Signal<(type: SpecialBubbleType) => void>();

    private _checkRewardAdsIntervalID: any;
    public game!: Game;

    constructor() {
        this.view.alpha = 0;
        this.addBoom();
        this.addTimer();
        this.addSuper();
        this.checkIsRewardAdsAvailable();
    }

    public checkIsRewardAdsAvailable() {
        if (this._checkRewardAdsIntervalID) {
            clearInterval(this._checkRewardAdsIntervalID);
        }
        this._activeButtonAds(false);
        this._checkRewardAdsIntervalID = setInterval(() => {
            Ads.checkIsRewardAdsReady((isReady: boolean) => {
                if (isReady) {
                    this._activeButtonAds(true);
                    clearInterval(this._checkRewardAdsIntervalID);
                } else {
                    this._activeButtonAds(false);
                }
            });
        }, 1000);
    }

    enable(isEnable: boolean) {
        if (isEnable) {
            gsap.to(this.view, { alpha: 1, duration: 0.5 });
        } else {
            gsap.to(this.view, { alpha: 0, duration: 0.5 });
        }
    }

    _activeButtonAds(isActive: boolean) {
        this._bombButton.interactive = isActive;
        this._timerButton.interactive = isActive;
        this._superButton.interactive = isActive;
        if (isActive) {
            this._bombButton.iconView.tint = 0xffffff;
            this._timerButton.iconView.tint = 0xffffff;
            this._superButton.iconView.tint = 0xffffff;
            this._bombButton.defaultView.tint = 0xffffff;
            this._timerButton.defaultView.tint = 0xffffff;
            this._superButton.defaultView.tint = 0xffffff;
        } else {
            this._bombButton.iconView.tint = 0x808080;
            this._timerButton.iconView.tint = 0x808080;
            this._superButton.iconView.tint = 0x808080;
            this._bombButton.defaultView.tint = 0x808080;
            this._timerButton.defaultView.tint = 0x808080;
            this._superButton.defaultView.tint = 0x808080;
        }
    }

    private _pause() {
        const pauseSystem = this.game.systems.get(PauseSystem);
        pauseSystem.pauseOnly();
    }

    private _resume() {
        const pauseSystem = this.game.systems.get(PauseSystem);
        pauseSystem.resume();
    }

    addBoom() {
        this.view.addChild(this._bombButton);
        this._bombButton.onPress.connect(() => {
            this._pause();
            Ads.showRewardAds(() => {
                this._resume();
                this.signalSelected.emit(boardConfig.specialBubbleTypes[0]);
                this.checkIsRewardAdsAvailable();
                FirebaseEventLogger.log('rw_show', { case: 'use bomb' });
            });
        });
    }

    addTimer() {
        this.view.addChild(this._timerButton);
        this._timerButton.x = 60;
        this._timerButton.onPress.connect(() => {
            this._pause();
            Ads.showRewardAds(() => {
                this._resume();
                this.signalSelected.emit(boardConfig.specialBubbleTypes[2]);
                this.checkIsRewardAdsAvailable();
                FirebaseEventLogger.log('rw_show', { case: 'use timer' });
            });
        });
    }

    addSuper() {
        this.view.addChild(this._superButton);
        this._superButton.x = 120;
        this._superButton.onPress.connect(() => {
            this._pause();
            Ads.showRewardAds(() => {
                this._resume();
                this.signalSelected.emit(boardConfig.specialBubbleTypes[1]);
                this.checkIsRewardAdsAvailable();
                FirebaseEventLogger.log('rw_show', { case: 'use super' });
            });
        });
    }
}
