// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable max-len */
/* eslint-disable no-undef */
import { EventEmitter } from 'pixi.js';
export class Ads {
    static isReady = false;

    static emitter = new EventEmitter();
    static HS_BOARD_ID = 'bubbo_bubbo_hsbdmoj';

    /**
     * @summary Initialize ads SDK. This method must be called before showing ads.
     * @static
     * @param {function} callback - Callback function to be called when the SDK is ready.
     */
    static async init() {
        this.adsConfig = window.LAGGED_SDK_CONFIG;
        if (!this.adsConfig.SHOW_ADS) {
            this.isReady = true;
            return;
        }

        await this._loadSDK();

        this._createBackground();

        LaggedAPI.init(this.adsConfig.DEV_ID, this.adsConfig.PUBLISHER_ID);

        await new Promise((resolve) => {
            setTimeout(() => {
                Ads.isReady = true;
                this.emitter.emit('ready');
                resolve();
            }, 550); // 550 is the time for dev mode in lagged sdk
        });
    }

    static async _loadSDK() {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            const url = DEV_MODE ? this.adsConfig.DEV_URL : this.adsConfig.SDK_URL;
            script.src = url;
            script.onload = resolve;
            document.body.appendChild(script);
        });
    }

    static _createBackground() {
        this._background = document.createElement('div');
        this._background.style.top = '0px';
        this._background.style.left = '0px';
        this._background.style.margin = '0px';
        this._background.style.padding = '0px';
        this._background.id = 'ads-background';
        this._background.style.position = 'absolute';
        this._background.style.width = '100%';
        this._background.style.height = '100%';
        this._background.style.backgroundColor = 'black';
        this._background.style.opacity = '0.8';
        this._background.style.zIndex = '100';
        document.body.appendChild(this._background);
        this._background.style.display = 'none';

        // block mouse, touch, keyboard
        const blockEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        };
        this._background.addEventListener('mousedown', blockEvent);
        this._background.addEventListener('mousemove', blockEvent);
        this._background.addEventListener('mouseup', blockEvent);

        this._background.addEventListener('touchstart', blockEvent);
        this._background.addEventListener('touchmove', blockEvent);
        this._background.addEventListener('touchend', blockEvent);

        this._background.addEventListener('pointerdown', blockEvent);
        this._background.addEventListener('pointermove', blockEvent);
        this._background.addEventListener('pointerup', blockEvent);

        this._background.addEventListener('keydown', blockEvent);
        this._background.addEventListener('keyup', blockEvent);
        this._background.addEventListener('keypress', blockEvent);

        this._background.addEventListener('contextmenu', blockEvent);
    }

    static _showBackground() {
        this._background.style.display = 'block';
        this._background.style.opacity = '0.8';
    }

    static _hideBackground() {
        this._background.style.display = 'none';
        this._background.style.opacity = '0.0';
    }

    static _showBackgroundNoOpacity() {
        this._background.style.display = 'block';
        this._background.style.opacity = '0.0';
    }

    static _hideBackgroundNoOpacity() {
        this._background.style.display = 'none';
        this._background.style.opacity = '0.0';
    }

    /**
     * @summary Show Interstitial ads. The game must be paused before calling this method.
     * @static
     * @param {function} callback - Callback function to be called when the ad is closed. Game should be resumed in this callback.
     */
    static showInterstitialAds(callback, showBackground = true) {
        if (!this.adsConfig.SHOW_ADS) {
            callback?.();
            return;
        }
        if (!this.isReady) {
            this.emitter.once('ready', () => {
                this.showInterstitialAds(callback);
            });
            return;
        }
        this.emitter.emit('ads-start');
        if (showBackground) {
            this._showBackground();
        } else {
            this._showBackgroundNoOpacity();
        }
        this.isShowingInterstitialAds = true;
        LaggedAPI.APIAds.show(() => {
            if (showBackground) {
                this._hideBackground();
            } else {
                this._hideBackgroundNoOpacity();
            }
            this.isShowingInterstitialAds = false;
            this.emitter.emit('ads-complete');
            callback?.();
        });
    }

    static saveAchievement(achievementId, callback) {
        if (!this.adsConfig.SHOW_ADS) {
            callback?.();
            return;
        }

        LaggedAPI.Achievements.save([achievementId], (response) => {
            if (response.success) {
                callback?.();
            } else {
                console.warn(response.errormsg);
                callback?.(response.errormsg);
            }
        });
    }

    static saveHighScore(score, callback) {
        if (!this.adsConfig.SHOW_ADS) {
            callback?.();
            return;
        }
        let boardInfo = {};
        boardInfo.score = score;
        boardInfo.board = this.HS_BOARD_ID;
        LaggedAPI.Scores.save(boardInfo, (response) => {
            if (response.success) {
                callback?.();
            } else {
                console.warn(response.errormsg);
                callback?.(response.errormsg);
            }
        });
    }

    static _lastCallRewardAds = 0;

    static _rewardAdsThreshold = 1000; // 1s

    static _showRewardAdsFn = null;

    static _rewardAdsSuccessCallback = null;

    static checkIsRewardAdsReady(callback) {
        if (!this.adsConfig.SHOW_ADS) {
            callback?.(false);
            return;
        }

        if (!this.isReady) {
            this.emitter.once('ready', () => {
                this.checkIsRewardAdsReady(callback);
            });
            return;
        }

        if (performance.now() - this._lastCallRewardAds < this._rewardAdsThreshold) {
            callback?.(false, 'Too fast');
            return;
        }
        this._lastCallRewardAds = performance.now();

        let callbackCalled = false;

        let cb = (isReady, error) => {
            if (callbackCalled) {
                return;
            }
            callbackCalled = true;
            callback?.(isReady, error);
        };

        if (this._showRewardAdsFn) {
            cb(true);
            return;
        }

        let canShowReward = (success, showAdFn) => {
            if (success) {
                this._showRewardAdsFn = showAdFn;
                cb(true);
            } else {
                cb(false, 'Reward ads not ready');
            }
        };

        let rewardSuccess = (success) => {
            if (!this._rewardAdsSuccessCallback) {
                return;
            }
            if (success) {
                this._rewardAdsSuccessCallback?.();
            } else {
                this._rewardAdsSuccessCallback?.('Reward ads failed');
            }
        };

        LaggedAPI.GEvents.reward(canShowReward, rewardSuccess);
    }

    /**
     * @summary Show Reward ads. The game must be paused before calling this method.
     * @static
     * @param {function} callback - Callback function to be called when the ad is closed, if the ad is successfully watched, the callback will be called with no error, otherwise it will be called with an error message. Game should be resumed in this callback.
     */
    static showRewardAds(callback) {
        if (!this.adsConfig.SHOW_ADS) {
            callback?.();
            return;
        }

        if (!this._showRewardAdsFn) {
            callback?.('Reward ads not ready');
            return;
        }

        if (!this.isReady) {
            this.emitter.once('ready', () => {
                this.showRewardAds(callback);
            });
            return;
        }
        this._showBackground();
        this._rewardAdsSuccessCallback = (error) => {
            this._hideBackground();
            callback?.(error);
            this._rewardAdsSuccessCallback = null;
        };
        this._showRewardAdsFn();
        this._showRewardAdsFn = null;
    }
}
