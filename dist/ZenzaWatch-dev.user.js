// ==UserScript==
// @name           ZenzaWatch DEV版
// @namespace      https://github.com/segabito/
// @description    ZenzaWatchの開発 先行バージョン
// @match          *://www.nicovideo.jp/*
// @match          *://ext.nicovideo.jp/
// @match          *://ext.nicovideo.jp/#*
// @match          *://blog.nicovideo.jp/*
// @match          *://ch.nicovideo.jp/*
// @match          *://com.nicovideo.jp/*
// @match          *://commons.nicovideo.jp/*
// @match          *://dic.nicovideo.jp/*
// @match          *://ex.nicovideo.jp/*
// @match          *://info.nicovideo.jp/*
// @match          *://search.nicovideo.jp/*
// @match          *://uad.nicovideo.jp/*
// @match          *://api.search.nicovideo.jp/*
// @match          *://*.nicovideo.jp/smile*
// @match          *://site.nicovideo.jp/*
// @match          *://anime.nicovideo.jp/*
// @match          https://www.upload.nicovideo.jp/garage/*
// @match          https://www.google.co.jp/search*
// @match          https://www.google.com/search*
// @match          https://*.bing.com/search*
// @match          https://feedly.com/*
// @exclude        *://ads.nicovideo.jp/*
// @exclude        *://www.nicovideo.jp/watch/*?edit=*
// @exclude        *://ch.nicovideo.jp/tool/*
// @exclude        *://flapi.nicovideo.jp/*
// @exclude        *://dic.nicovideo.jp/p/*
// @exclude        *://ext.nicovideo.jp/thumb/*
// @exclude        *://ext.nicovideo.jp/thumb_channel/*
// @grant          none
// @author         segabito
// @version        2.6.2
// @run-at         document-body
// @require        https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js
// ==/UserScript==
/* eslint-disable */
// import {SettingPanel} from './SettingPanel';
const AntiPrototypeJs = function() {
	if (this.promise !== null || !window.Prototype || window.PureArray) {
		return this.promise || Promise.resolve(window.PureArray || window.Array);
	}
	if (document.getElementsByClassName.toString().indexOf('B,A') >= 0) {
		delete document.getElementsByClassName;
	}
	const waitForDom = new Promise(resolve => {
		if (['interactive', 'complete'].includes(document.readyState)) {
			return resolve();
		}
		document.addEventListener('DOMContentLoaded', resolve, {once: true});
	});
	const f = Object.assign(document.createElement('iframe'), {
		srcdoc: '<html><title>ここだけ時間が10年遅れてるスレ</title></html>',
		id: 'prototype',
		loading: 'eager'
	});
	Object.assign(f.style, {position: 'absolute', left: '-100vw', top: '-100vh'});
	return this.promise = waitForDom
		.then(() => new Promise(res => {
			f.onload = res;
			document.body.append(f);
		})).then(() => {
	window.PureArray = f.contentWindow.Array;
	delete window.Array.prototype.toJSON;
			delete window.String.prototype.toJSON;
			f.remove();
			return Promise.resolve(window.PureArray);
		}).catch(err => console.error(err));
}.bind({promise: null});
AntiPrototypeJs();
(() => {
  try {
    if (window.top === window) {
      window.ZenzaLib = { _ };
      console.log('@require', JSON.stringify({lodash: _.VERSION}));
    }
  } catch(e) {
    window.top === window && console.warn('@require failed!', location, e);
  }
})();

(function (window) {
  const self = window;
  const document = window.document;
  'use strict';
  const PRODUCT = 'ZenzaWatch';
// 公式プレイヤーがurlを書き換えてしまうので読み込んでおく
  const START_PAGE_QUERY = (location.search ? location.search.substring(1) : '');
  const monkey = async (PRODUCT, START_PAGE_QUERY) /*** (｀・ω・´)9m ***/ => {
    const Array = window.PureArray ? window.PureArray : window.Array;
    let console = window.console;
    let $ = window.ZenzaJQuery || window.jQuery, _ = window.ZenzaLib ? window.ZenzaLib._ : window._;
    let TOKEN = 'r:' + (Math.random());
    let CONFIG = null;
    const NICORU = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAGh0lEQVRIS3VWeWxUxxn/zbxjvWuvvV4vXp9g43OddTB2EYEWnEuKgl3USqRHIpRIbVS7KapUmSbUIUpBBIjdtGpKHan9p0IkkQhNGtlUFaWFkGIi4WJq8BqMbQ4fuz7WV3bt3fdmXjWza8uozZOe3ryZb77fd/zm+4bgfx8VgCmmczN21HocoefiLFYfnI3VzBtBu5jP0HKWcjJtvbpiuzgd9Z6emL/076Sa1b0raska/WJMATBgp6/MM9o+MjO1y7QWV0W2Fmly/MVdY3VOJU4UZ607Ozhd0AJ8FgCgAOAALCG0AiC+4uUObXOT13mvYyQcFuv8t3sL2PbKdJrr0qnTpkj5xRizJubivHtgge87OSoU0mK3G6HFDc1R49p7SUMFgLUCIIRYul59yKENHQxGomj/fr6xd0e2lu3RAUIBzgEujUqYQhNbJ6fjOHlp0mj5YEzLSXUgapQcXoj3vZH0hAkpGTcbrWvKtA90BCMRs6ullO7akkW5YWEuwqSzKTpBio0mHQfiJgfnFuw2CqJSnL06wxva7vCc1FR1dqmyOcZ7hCdq0oOnfcXu6/0j4Sl0tpTyhq3rqBU3cerSFE6cC8KhEzzzqAs/3ZUPm41iaGwJv+oag6YAlBLs/2Yh8nId6Oqe5I3td2ixex1GwpuqgL8HJECZp7xzcPp2Q9v38o2WbxVq3OQyQ8c+foDXz0zIUHxnSzr++KMyONNVdPfPY/ubA6uJvnm8GlXr7TJ07Z+MGfs/HNPKPOVdg9O3G0luxpO104vXegw+y4MnNlNvlgZmchBQvNM5iv0fjktFP9jpwm9eKkFaqoqrtxaw5Y0AqrwU/SGOW21+lBc4pFwobCDnlWtco5nU49xcR/y5/rduTNw48O7eAuMnjfkaMxgoIbAsgl93jqIlCfByvQvvvPgwQE2+gt4xhoG2alQU2mEaFlSd4nedY8a+k6OaP9d/lFRkl1y+NTm07eqRKlZX5lRYjIOKXFoEh8/cx5sfB6VljZuceH9fuQzRlf55bFsTov63q+FbnwSwUfQMLrKvtfYrFdkl3cSl50fn4mP28RM1Vm6WTpgJECJYaOHcf+Zxvm8WCgX8hWnYs9UDTSeYmInj054wrCS7dte54XbqYJxBUalYt/Je6RW6l0SSra+X6PjrgWo4UxVwJgASfCeEgHHhDaAKMnMLMjvCAvGKheSXi7EFUAVYjDA8e7QP/xqKyyNjPVVpw6c/98ORokpuCwCx73zfPL4YXJTeVBWmoqE2CwolmF00cerzEJbiDAYDvrvNg5I8OxiDXI8um9j99g2cH4iBKMQTYda0I/RejZXt0gmXIbJkDg59dA+//CQkvXnpGxno+GEZUlIohsdjKPnZ9VWanjtQjqc3uWEaDKpGMDkXt7xNvUJ3lJS6vZfvhEPbAm3VrHK9Q3mIRV2jaPkgQdOWZz04+nwxVBvFg4llbGntQ1Ya0B/kuPB6Ber9GassGrgfZb79fUqp29tNavK9b/WOhQ6c+nGR8fzjXs2McZlU4cHac9D8pAut3y6CQ1cwMrWMHYcCyEkDhsMc/2ytwOPVSQAbxfsXQsYLv7+r1eR7jxKfZ0NtYPp+z/YSjf+ttZqmrcnDkT/fx8EziRCJx5+nSQovxS0MTsqWIZ9//KICTzyaATALX8Y4njnSxy8PGdTnWV8nS4XPm9oZCEUaTu/baOzZ6dWMZROaQvH5wByO/WUcMcPEcpzDYFx6JkB0lUBXKSrzHHhtdyHysjQQjeKjS1PGc+8Oaz5valcgFGmUAFl6ViVR5gLTSwz9xx/hvo3p1Fw2ZagiMY54XNQmskpfsUcCEQJ7CpHGKDYFgeEFXvXqTeqxK7CYyzcTnxlYLddFmY6mu7PRDkUhZuD4I7Rsg1NW1ITF4lxQIHk+Em1EeJM4BtBUDN5b5L5Xb3LGLLUo09F8dza6tlzLNseK3eqhkbB5UFh4/rVyo97v0hSdyNhaPEHdxAG0QETDUQhY3MLFG3PGU8duy35a7FYPj4TNhxqO3LPSMjdmak3jC0bHMgNe3uniL9bnsMoCB013UKqpiTZmmNxaiHI+MBrlf7oYVP7w2RxNUYC8dK15eNb4vy1zBUQ2/dw03edKZe2BENuV4AnBC485UZpjk393gjGcuiIuA4mS4vMqZ+ciSsvEl/GvbPqrlFtpoWLisQ1abYxbe649MJ8AsAmAvLYAWAJwfXOBesGmkNNX7hlfeW35LyB037N9NspNAAAAAElFTkSuQmCC';
    const dll = {};
    const util = {};
    let {dimport, workerUtil, IndexedDbStorage, Handler, PromiseHandler, Emitter, parseThumbInfo, WatchInfoCacheDb, StoryboardCacheDb, VideoSessionWorker} = window.ZenzaLib;
    START_PAGE_QUERY = encodeURIComponent(START_PAGE_QUERY);

    var VER = '2.6.2';
    const ENV = 'DEV';


    console.log(
      `%c${PRODUCT}@${ENV} v${VER}%c  (ﾟ∀ﾟ) ｾﾞﾝｻﾞ!  %cNicorü? %c田%c \n\nplatform: ${navigator.platform}\nua: ${navigator.userAgent}`,
      'font-family: Chalkduster; font-size: 200%; background: #039393; color: #ffc; padding: 8px; text-shadow: 2px 2px #888;',
      '',
      'font-family: "Chalkboard SE", Chalkduster,HeadLineA; font-size: 24px;',
      'display: inline-block; font-size: 24px; color: transparent; background-repeat: no-repeat; background-position: center; background-size: contain;' +
      `background-image: url(${NICORU});`,
      'line-height: 1.25; font-weight: bold; '
    );
    console.nicoru =
      console.log.bind(console,
        '%c　 ',
        'display: inline-block; font-size: 120%; color: transparent; background-repeat: no-repeat; background-position: center; background-size: contain;' +
        `background-image: url(${NICORU})`
        );

//@require ../packages/lib/src/infra/StorageWriter.js
//@require ../packages/lib/src/infra/objUtil.js
//@require ../packages/lib/src/infra/DataStorage.js
const Config = (() => {
	const DEFAULT_CONFIG = {
		debug: false,
		volume: 0.3,
		forceEnable: false,
		showComment: true,
		autoPlay: true,
		'autoPlay:ginza': true,
		'autoPlay:others': true,
		loop: false,
		mute: false,
		screenMode: 'normal',
		'screenMode:ginza': 'normal',
		'screenMode:others': 'normal',
		autoFullScreen: false,
		autoCloseFullScreen: true, // 再生終了時に自動でフルスクリーン解除するかどうか
		continueNextPage: false,   // 動画再生中にリロードやページ切り替えしたら続きから開き直す
		backComment: false,        // コメントの裏流し
		autoPauseCommentInput: true, // コメント入力時に自動停止する
		sharedNgLevel: 'MID',      // NG共有の強度 NONE, LOW, MID, HIGH, MAX
		enablePushState: true,     // ブラウザの履歴に乗せる
		enableHeatMap: true,
		enableCommentPreview: false,
		enableAutoMylistComment: false, // マイリストコメントに投稿者を入れる
		menuScale: 1.0,
		enableTogglePlayOnClick: false, // 画面クリック時に再生/一時停止するかどうか
		enableDblclickClose: true, //
		enableFullScreenOnDoubleClick: true,
		enableStoryboard: true, // シークバーサムネイル関連
		enableStoryboardBar: false, // シーンサーチ
		videoInfoPanelTab: 'videoInfoTab',
		fullscreenControlBarMode: 'auto', // 'always-show' 'always-hide'
		enableFilter: true,
		wordFilter: '',
		wordRegFilter: '',
		wordRegFilterFlags: 'i',
		userIdFilter: '',
		commandFilter: '',
		removeNgMatchedUser: false, // NGにマッチしたユーザーのコメント全部消す
		'filter.fork0': true, // 通常コメント
		'filter.fork1': true, // 投稿者コメント
		'filter.fork2': true, // かんたんコメント
		videoTagFilter: '',
		videoOwnerFilter: '',
		enableCommentPanel: true,
		enableCommentPanelAutoScroll: true,
		commentSpeedRate: 1.0,
		autoCommentSpeedRate: false,
		playlistLoop: false,
		commentLanguage: 'ja_JP',
		baseFontFamily: '',
		baseChatScale: 1.0,
		baseFontBolder: true,
		cssFontWeight: 'bold',
		allowOtherDomain: true,
		overrideWatchLink: false, // すべての動画リンクをZenzaWatchで開く
		'overrideWatchLink:others': false, // すべての動画リンクをZenzaWatchで開く
		speakLark: false, // 一発ネタのコメント読み上げ機能. 飽きたら消す
		speakLarkVolume: 1.0, // 一発ネタのコメント読み上げ機能. 飽きたら消す
		enableSingleton: false,
		loadLinkedChannelVideo: false,
		commentLayerOpacity: 1.0, //
		'commentLayer.textShadowType': '', // フォントの修飾タイプ
		'commentLayer.enableSlotLayoutEmulation': false,
		'commentLayer.ownerCommentShadowColor': '#008800', // 投稿者コメントの影の色
		'commentLayer.easyCommentOpacity': 0.5, // かんたんコメントの透明度
		overrideGinza: false,     // 動画視聴ページでもGinzaの代わりに起動する
		enableGinzaSlayer: false, // まだ実験中
		lastPlayerId: '',
		playbackRate: 1.0,
		lastWatchId: 'sm9',
		message: '',
		enableVideoSession: true,
		videoServerType: 'dmc',
		autoDisableDmc: true, // smileのほうが高画質と思われる動画でdmcを無効にする
		dmcVideoQuality: 'auto',   // 優先する画質 auto, veryhigh, high, mid, low
		smileVideoQuality: 'default', // default eco
		useWellKnownPort: false, // この機能なくなったぽい (常時true相当になった)
		'video.hls.enable': true,
		'video.hls.segmentDuration': 6000,
		'video.hls.enableOnlyRequired': true, // hlsが必須の動画だけ有効化する
		enableNicosJumpVideo: true, // @ジャンプを有効にするかどうか
		'videoSearch.ownerOnly': true,
		'videoSearch.mode': 'tag',
		'videoSearch.order': 'desc',
		'videoSearch.sort': 'playlist',
		'videoSearch.word': '',
		'uaa.enable': true,
		'screenshot.prefix': '', // スクリーンショットのファイル名の先頭につける文字
		'search.limit': 300, // 検索する最大件数(最大1600) 100件ごとにAPIを叩くので多くするほど遅くなる
		'touch.enable': window.ontouchstart !== undefined,
		'touch.tap2command': '',
		'touch.tap3command': 'toggle-mute',
		'touch.tap4command': 'toggle-showComment',
		'touch.tap5command': 'screenShot',
		'navi.favorite': [],
		'navi.playlistButtonMode': 'insert',
		'navi.ownerFilter': false,
		'navi.lastSearchQuery': '',
		autoZenTube: false,
		bestZenTube: false,
		KEY_CLOSE: 27,          // ESC
		KEY_RE_OPEN: 27 + 0x1000, // SHIFT + ESC
		KEY_HOME: 36 + 0x1000, // SHIFT + HOME
		KEY_SEEK_LEFT: 37 + 0x1000, // SHIFT + LEFT
		KEY_SEEK_RIGHT: 39 + 0x1000, // SHIFT + RIGHT
		KEY_SEEK_LEFT2: 99999999, // カスタマイズ用
		KEY_SEEK_RIGHT2: 99999999, //
		KEY_SEEK_PREV_FRAME: 188, // ,
		KEY_SEEK_NEXT_FRAME: 190, // .
		KEY_VOL_UP: 38 + 0x1000, // SHIFT + UP
		KEY_VOL_DOWN: 40 + 0x1000, // SHIFT + DOWN
		KEY_INPUT_COMMENT: 67, // C
		KEY_FULLSCREEN: 70, // F
		KEY_MUTE: 77, // M
		KEY_TOGGLE_COMMENT: 86, // V
		KEY_TOGGLE_LOOP: 82, // R 76, // L
		KEY_DEFLIST_ADD: 84,          // T
		KEY_DEFLIST_REMOVE: 84 + 0x1000, // SHIFT + T
		KEY_TOGGLE_PLAY: 32, // SPACE
		KEY_TOGGLE_PLAYLIST: 80, // P
		KEY_SCREEN_MODE_1: 49 + 0x1000, // SHIFT + 1
		KEY_SCREEN_MODE_2: 50 + 0x1000, // SHIFT + 2
		KEY_SCREEN_MODE_3: 51 + 0x1000, // SHIFT + 3
		KEY_SCREEN_MODE_4: 52 + 0x1000, // SHIFT + 4
		KEY_SCREEN_MODE_5: 53 + 0x1000, // SHIFT + 5
		KEY_SCREEN_MODE_6: 54 + 0x1000, // SHIFT + 6
		KEY_SHIFT_RESET: 49, // 1
		KEY_SHIFT_DOWN: 188 + 0x1000, // <
		KEY_SHIFT_UP: 190 + 0x1000, // >
		KEY_NEXT_VIDEO: 74, // J
		KEY_PREV_VIDEO: 75, // K
		KEY_SCREEN_SHOT: 83, // S
		KEY_SCREEN_SHOT_WITH_COMMENT: 83 + 0x1000, // SHIFT + S
	};
	if (navigator &&
		navigator.userAgent &&
		navigator.userAgent.match(/(Android|iPad;|CriOS)/i)) {
		DEFAULT_CONFIG.overrideWatchLink = true;
		DEFAULT_CONFIG.enableTogglePlayOnClick = true;
		DEFAULT_CONFIG.autoFullScreen = true;
		DEFAULT_CONFIG.autoCloseFullScreen = false;
		DEFAULT_CONFIG.volume = 1.0;
		DEFAULT_CONFIG.enableVideoSession = true;
		DEFAULT_CONFIG['uaa.enable'] = false;
	}
	return DataStorage.create(
		DEFAULT_CONFIG,
		{
			prefix: PRODUCT,
			ignoreExportKeys: ['message', 'lastPlayerId', 'lastWatchId', 'debug'],
			readonly: !location || location.host !== 'www.nicovideo.jp',
			storage: localStorage
		}
	);
})();
Config.exportConfig = () => Config.export();
Config.importConfig = v => Config.import(v);
Config.exportToFile = () => {
	const json = Config.exportJson();
	const blob = new Blob([json], {'type': 'text/html'});
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement('a'), {
		download: `${new Date().toLocaleString().replace(/[:/]/g, '_')}_ZenzaWatch.config.json`,
		rel: 'noopener',
		href: url
	});
	(document.body || document.documentElemennt).append(a);
	a.click();
	setTimeout(() => a.remove(), 1000);
};
const NaviConfig = Config;
await Config.promise('restore');
const uQuery = (() => {
	const endMap = new WeakMap();
	const emptyMap = new Map();
	const emptySet = new Set();
	const elementsEventMap = new WeakMap();
	const HAS_CSSTOM = (window.CSS && CSS.number) ? true : false;
	const toCamel = p => p.replace(/-./g, s => s.charAt(1).toUpperCase());
	const toSnake = p => p.replace(/[A-Z]/g, s => `-${s.charAt(1).toLowerCase()}`);
	const isStyleValue = val => ('px' in CSS) && val instanceof CSSStyleValue;
	const emitter = new Emitter();
	const UNDEF = Symbol('undefined');
	const waitForDom = resolve => {
		if (['interactive', 'complete'].includes(document.readyState)) {
			return resolve();
		}
		document.addEventListener('DOMContentLoaded', resolve, {once: true});
	};
	const waitForComplete = resolve => {
		if (['complete'].includes(document.readyState)) {
			return resolve();
		}
		window.addEventListener('load', resolve, {once: true});
	};
	const isTagLiteral = (t,...args) =>
		Array.isArray(t) &&
		Array.isArray(t.raw) &&
		t.length === t.raw.length &&
		args.length === t.length - 1;
	const templateMap = new WeakMap();
	const createDom = (template, ...args) => {
		const isTL = isTagLiteral(template, ...args);
		if (isTL && templateMap.has(template)) {
			const tpl = templateMap.get(template);
			return document.importNode(tpl.content, true);
		}
		const tpl = document.createElement('template');
		tpl.innerHTML = isTL ? String.raw(template, ...args) : template;
		isTL && templateMap.set(template, tpl);
		return document.importNode(tpl.content, true);
	};
	const walkingHandler = {
		set: function (target, prop, value) {
			for (const elm of target) {
				elm[prop] = value;
			}
			return true;
		},
		get: function (target, prop) {
			const isFunc = target.some(elm => typeof elm[prop] === 'function');
			if (!isFunc) {
				const isObj = target.some(elm => elm[prop] instanceof Object);
				let result = target.map(elm => typeof elm[prop] === 'function' ? elm[prop].bind(elm) : elm[prop]);
				return isObj ? result.walk : result;
			}
			return (...args) => {
				let result = target.map((elm, index) => {
					try {
						return (typeof elm[prop] === 'function' ?
							elm[prop].apply(elm, args) : elm[prop]) || elm;
					} catch (error) {
						console.warn('Exception: ', {target, prop, index, error});
					}
				});
				const isObj = result.some(r => r instanceof Object);
				return isObj ? result.walk : result;
			};
		}
	};
	const isHTMLElement = elm => {
		return (elm instanceof HTMLElement) ||
			(elm.ownerDocument && elm instanceof elm.ownerDocument.defaultView.HTMLElement);
	};
	const isNode = elm => {
		return (elm instanceof Node) ||
			(elm.ownerDocument && elm instanceof elm.ownerDocument.defaultView.Node);
	};
	const isDocument = d => {
		return (d instanceof Document) || (d && d[Symbol.toStringTag] === 'HTMLDocument') ||
			(d.documentElement && d instanceof d.documentElement.ownerDocument.defaultView.Node);
	};
	const isEventTarget = e => {
		return (e instanceof EventTarget) ||
			(e[Symbol.toStringTag] === 'EventTarget') ||
			(e.addEventListener && e.removeEventListener && e.dispatchEvent);
	};
	const isHTMLCollection = e => {
		return e instanceof HTMLCollection || (e && e[Symbol.toStringTag] === 'HTMLCollection');
	};
	const isNodeList = e => {
		return e instanceof NodeList || (e && e[Symbol.toStringTag] === 'NodeList');
	};
	class RafCaller {
		constructor(elm, methods = []) {
			this.elm = elm;
			methods.forEach(method => {
				const task = elm[method].bind(elm);
				task._name = method;
				this[method] = (...args) => {
					this.enqueue(task, ...args);
					return elm;
				};
			});
		}
		get promise() {
			return this.constructor.promise;
		}
		enqueue(task, ...args) {
			this.constructor.taskList.push([task, ...args]);
			this.constructor.exec();
		}
		cancel() {
			this.constructor.taskList.length = 0;
		}
	}
	RafCaller.promise = new PromiseHandler();
	RafCaller.taskList = [];
	RafCaller.exec = throttle.raf(function() {
		const taskList = this.taskList.concat();
		this.taskList.length = 0;
		for (const [task, ...args] of taskList) {
			try {
				task(...args);
			} catch (err) {
				console.warn('RafCaller task fail', {task, args});
			}
		}
		this.promise.resolve();
		this.promise = new PromiseHandler();
	}.bind(RafCaller));
	class $Array extends Array {
		get [Symbol.toStringTag]() {
			return '$Array';
		}
		get na() /* 先頭の要素にアクセス */ {
			return this[0];
		}
		get nz() /* 末尾の要素にアクセス */ {
			return this[this.length - 1];
		}
		get walk() /* 全要素のメソッド・プロパティにアクセス */ {
			const p = this._walker || new Proxy(this, walkingHandler);
			this._walker = p;
			return p;
		}
		get array() {
			return [...this];
		}
		toArray() {
			return this.array;
		}
		constructor(...args) {
			super();
			const elm = args.length > 1 ? args : args[0];
			if (isHTMLCollection(elm) || isNodeList(elm)) {
				for (const e of elm) {
					super.push(e);
				}
			} else if (typeof elm === 'number') {
				this.length = elm;
			} else {
				this[0] = elm;
			}
		}
		get raf() {
			if (!this._raf) {
				this._raf = new RafCaller(this, [
					'addClass','removeClass','toggleClass','css','setAttribute','attr','data','prop',
					'val','focus','blur','insert','append','appendChild','prepend','after','before',
					'text','appendTo','prependTo','remove','show','hide'
				]);
			}
			return this._raf;
		}
		get htmls() {
			return this.filter(isHTMLElement);
		}
		*getHtmls() {
			for (const elm of this) {
				if (isHTMLElement(elm)) { yield elm; }
			}
		}
		get firstElement() {
			for (const elm of this) {
				if (isHTMLElement(elm)) { return elm; }
			}
			return null;
		}
		get nodes() {
			return this.filter(isNode);
		}
		*getNodes() {
			for (const n of this) {
				if (isNode(n)) { yield n; }
			}
		}
		get firstNode() {
			for (const n of this) {
				if (isNode(n)) { return n; }
			}
			return null;
		}
		get independency() {
			const nodes = this.nodes;
			if (nodes.length <= 1) {
				return nodes;
			}
			return this.filter(elm => nodes.every(e => e === elm || !e.contains(elm)));
		}
		get uniq() {
			return this.constructor.from([...new Set(this)]);
		}
		clone() {
			return this.constructor.from(this.independency.filter(e => e.cloneNode).map(e => e.cloneNode(true)));
		}
		find(query) {
			if (typeof query !== 'string') {
				return super.find(query);
			}
			return this.query(query);
		}
		query(query) {
			const found = this
				.independency
				.filter(elm => elm.querySelectorAll)
				.map(elm => $Array.from(elm.querySelectorAll(query)))
				.flat();
			endMap.set(found, this);
			return found;
		}
		mapQuery(map) {
			const $tmp = this
				.independency
				.filter(elm => elm.querySelectorAll);
			const result = [], e = [], $ = {};
			for (const key of Object.keys(map)) {
				const query = map[key];
				const found = $tmp.map(elm => $Array.from(elm.querySelectorAll(query))).flat();
				result[key] = key.match(/^_?\$/) ? found : found[0];
				$[key.replace(/^(_?)/, '$1$')] = found;
				e[key.replace(/^(_?)\$/, '$1')] = found[0];
			}
			return {result, $, e};
		}
		end() {
			return endMap.has(this) ? endMap.get(this) : this;
		}
		each(callback) {
			this.htmls.forEach((elm, index) => callback.apply(elm, [index, elm]));
		}
		closest(selector) {
			const result = this.query(elm => elm.closest(selector));
			return result ? this.constructor.from(result) : null;
		}
		parent() {
			const found = this
				.independency
				.filter(e => e.parentNode).map(e => e.parentNode);
			return found;
		}
		parents(selector) {
			let h = selector ? this.parent().closest(selector) : this.parent();
			const found = [h];
			while (h.length) {
				h = selector ? h.parent().closest(selector) : h.parent();
				found.push(h);
			}
			return $Array.from(h.flat());
		}
		toggleClass(className, v) {
			if (typeof v === 'boolean') {
				return v ? this.addClass(className) : this.removeClass(className);
			}
			const classes = className.trim().split(/\s+/);
			const htmls = this.getHtmls();
			for (const elm of htmls) {
				for (const c of classes) {
					elm.classList.toggle(c, v);
				}
			}
			return this;
		}
		addClass(className) {
			const names = className.split(/\s+/);
			const htmls = this.getHtmls();
			for (const elm of htmls) {
				elm.classList.add(...names);
			}
			return this;
		}
		removeClass(className) {
			const names = className.split(/\s+/);
			const htmls = this.getHtmls();
			for (const elm of htmls) {
				elm.classList.remove(...names);
			}
			return this;
		}
		hasClass(className) {
			const names = className.trim().split(/[\s]+/);
			const htmls = this.htmls;
			return names.every(
				name => htmls.every(elm => elm.classList.contains(name)));
		}
		_css(props) {
			const htmls = this.getHtmls();
			for (const element of htmls) {
				const style = element.style;
				const map = element.attributeStyleMap;
				for (let [key, val] of ((props instanceof Map) ? props : Object.entries(props))) {
					const isNumber = /^[0-9+.]+$/.test(val);
					if (isNumber && /(width|height|top|left)$/i.test(key)) {
						val = HAS_CSSTOM ? CSS.px(val) : `${val}px`;
					}
					try {
						if (HAS_CSSTOM && isStyleValue(val)) {
							key = toSnake(key);
							map.set(key, val);
						} else {
							key = toCamel(key);
							style[key] = val;
						}
					} catch (err) {
						console.warn('uQuery.css fail', {key, val, isNumber});
					}
				}
			}
			return this;
		}
		css(key, val = UNDEF) {
			if (typeof key === 'string') {
				if (val !== UNDEF) {
					return this._css({[key]: val});
				} else {
					const element = this.firstElement;
					if (HAS_CSSTOM) {
						return element.attributeStyleMap.get(toSnake(key));
					} else {
						return element.style[toCamel(key)];
					}
				}
			} else if (key !== null && typeof key === 'object') {
				return this._css(key);
			}
			return this;
		}
		on(eventName, callback, options) {
			if (typeof callback !== 'function') {
				return this;
			}
			eventName = eventName.trim();
			const elementEventName = eventName.split('.')[0];
			for (const element of this.filter(isEventTarget)) {
				const elementEvents = elementsEventMap.get(element) || new Map;
				const listenerSet = elementEvents.get(eventName) || new Set;
				elementEvents.set(eventName, listenerSet);
				elementsEventMap.set(element, elementEvents);
				if (!listenerSet.has(callback)) {
					listenerSet.add(callback);
					element.addEventListener(elementEventName, callback, options);
				}
			}
			return this;
		}
		click(...args) {
			if (args.length) {
				const f = this.firstElement;
				f && f.click();
				return this;
			}
			const callback = args.find(a => typeof a === 'function');
			const data = args[0] !== callback ? args[0] : null;
			return this.on('click', e => {
				data && (e.data = e.data || {}) && Object.assign(e.data, data);
				callback(e);
			});
		}
		dblclick(...args) {
			const callback = args.find(a => typeof a === 'function');
			const data = args[0] !== callback ? args[0] : null;
			return this.on('dblclick', e => {
				data && (e.data = e.data || {}) && Object.assign(e.data, data);
				callback(e);
			});
		}
		off(eventName = UNDEF, callback = UNDEF) {
			if (eventName === UNDEF) {
				for (const element of this.filter(isEventTarget)) {
					const eventListenerMap = elementsEventMap.get(element) || emptyMap;
					for (const [eventName, listenerSet] of eventListenerMap) {
						for (const listener of listenerSet) {
							element.removeEventListener(eventName, listener);
						}
						listenerSet.clear();
					}
					eventListenerMap.clear();
					elementsEventMap.delete(element);
				}
				return this;
			}
			eventName = eventName.trim();
			const [elementEventName, eventKey] = eventName.split('.');
			if (callback === UNDEF) {
				for (const element of this.filter(isEventTarget)) {
					const eventListenerMap = elementsEventMap.get(element) || emptyMap;
					const listenerSet = eventListenerMap.get(eventName) || emptySet;
					for (const listener of listenerSet) {
						element.removeEventListener(elementEventName, listener);
					}
					listenerSet.clear();
					eventListenerMap.delete(eventName);
					for (const [key] of eventListenerMap) {
						if (
							(!eventKey && key.startsWith(`${elementEventName}.`)) ||
							(!elementEventName && key.endsWith(`.${eventKey}`))) {
							this.off(key);
						}
					}
				}
				return this;
			}
			for (const element of this.filter(isEventTarget)) {
				const eventListenerMap = elementsEventMap.get(element) || new Map;
				eventListenerMap.set(eventName, (eventListenerMap.get(eventName) || new Set));
				for (const [key, listenerSet] of eventListenerMap) {
					if (key !== eventName && !key.startsWith(`${elementEventName}.`)) {
						continue;
					}
					if (!listenerSet.has(callback)) {
						continue;
					}
					listenerSet.delete(callback);
					element.removeEventListener(elementEventName, callback);
				}
			}
			return this;
		}
		_setAttribute(key, val = UNDEF) {
			const htmls = this.getHtmls();
			if (val === null || val === '' || val === UNDEF) {
				for (const e of htmls) {
					e.removeAttribute(key);
				}
			} else {
				for (const e of htmls) {
					e.setAttribute(key, val);
				}
			}
			return this;
		}
		setAttribute(key, val = UNDEF) {
			if (typeof key === 'string') {
				return this._setAttribute(key, val);
			}
			for (const k of Object.keys(key)) {
				this._setAttribute(k, key[k]);
			}
			return this;
		}
		attr(key, val = UNDEF) {
			if (val !== UNDEF || typeof key === 'object') {
				return this.setAttribute(key, val);
			}
			const found = this.find(e => e.hasAttribute && e.hasAttribute(key));
			return found ? found.getAttribute(key) : null;
		}
		data(key, val = UNDEF) {
			if (typeof key === 'object') {
				for (const k of Object.keys(key)) {
					this.data(k, JSON.stringify(key[k]));
				}
				return this;
			}
			key = `data-${toSnake(key)}`;
			if (val !== UNDEF) {
				return this.setAttribute(key, JSON.stringify(val));
			}
			const found = this.find(e => e.hasAttribute && e.hasAttribute(key));
			const attr = found.getAttribute(key);
			try {
				return JSON.parse(attr);
			} catch (e) {
				return attr;
			}
		}
		prop(key, val = UNDEF) {
			if (typeof key === 'object') {
				for (const k of Object.keys(key)) {
					this.prop(k, key[k]);
				}
				return this;
			} else if (val !== UNDEF) {
				for (const elm of this) {
					elm[key] = val;
				}
				return this;
			} else {
				const found = this.find(e => e.hasOwnProperty(key));
				return found ? found[key] : null;
			}
		}
		val(v = UNDEF) {
			const htmls = this.getHtmls();
			for (const elm of htmls) {
				if (!('value' in elm)) {
					continue;
				}
				if (v === UNDEF) {
					return elm.value;
				} else {
					elm.value = v;
				}
			}
			return v === UNDEF ? '' : this;
		}
		hasFocus() {
			return this.some(e => e === document.activeElement);
		}
		focus() {
			const fe = this.firstElement;
			if (fe) {
				fe.focus();
			}
			return this;
		}
		blur() {
			const htmls = this.getHtmls();
			for (const elm of htmls) {
				if (elm === document.activeElement) {
					elm.blur();
				}
			}
			return this;
		}
		insert(where, ...args) {
			const fn = this.firstNode;
			if (!fn) {
				return this;
			}
			if (args.every(a => typeof a === 'string' || isNode(a))) {
				fn[where](...args);
			} else {
				const $d = uQuery(...args);
				if ($d instanceof $Array) {
					fn[where](...$d.filter(a => typeof a === 'string' || isNode(a)));
				}
			}
			return this;
		}
		append(...args) {
			return this.insert('append', ...args);
		}
		appendChild(...args) {
			return this.append(...args);
		}
		prepend(...args) {
			return this.insert('prepend', ...args);
		}
		after(...args) {
			return this.insert('after', ...args);
		}
		before(...args) {
			return this.insert('before', ...args);
		}
		text(text = UNDEF) {
			const fn = this.firstNode;
			if (text !== UNDEF) {
				fn && (fn.textContent = text);
			} else {
				return this.htmls.find(e => e.textContent) || '';
			}
			return this;
		}
		appendTo(target) {
			if (typeof target === 'string') {
				const e = document.querySelector(target);
				e && e.append(...this.nodes);
			} else {
				target.append(...this.nodes);
			}
			return this;
		}
		prependTo(target) {
			if (typeof target === 'string') {
				const e = document.querySelector(target);
				e && e.prepend(...this.nodes);
			} else {
				target.prepend(...this.nodes);
			}
			return this;
		}
		remove() {
			for (const elm of this) { elm.remove && elm.remove(); }
			return this;
		}
		show() {
			for (const elm of this) { elm.hidden = false; }
			return this;
		}
		hide() {
			for (const elm of this) { elm.hidden = true; }
			return this;
		}
		shadow(...args) {
			const elm = this.firstElement;
			if (!elm) {
				return this;
			}
			if (args.length === 0) {
				elm.shadowRoot || elm.attachShadow({mode: 'open'});
				return $Array(elm.shadowRoot);
			}
			const $d = uQuery(...args);
			if ($d instanceof $Array) {
				elm.shadowRoot || elm.attachShadow({mode: 'open'});
				$d.appendTo(elm.shadowRoot);
				return $d;
			}
			return this;
		}
	}
	const uQuery = (q, ...args) => {
		const isTL = isTagLiteral(q, ...args);
		if (isTL || typeof q === 'string') {
			const query = isTL ? String.raw(q, ...args) : q;
			return query.startsWith('<') ?
				new $Array(createDom(q, ...args).children) :
				new $Array(document.querySelectorAll(query));
		} else if (q instanceof Window) {
			return $Array.from(q.document);
		} else if (q instanceof $Array) {
			return q.concat();
		} else if (q[Symbol.iterator]) {
			return $Array.from(q);
		} else if (isDocument(q)) {
			return $Array.from(q.documentElement);
		} else {
			return new $Array(q);
		}
	};
	Object.assign(uQuery, {
		$Array,
		createDom,
		html: (...args) => new $Array(createDom(...args).children),
		isTL: isTagLiteral,
		ready: (func = () => {}) => emitter.promise('domReady', waitForDom).then(() => func()),
		complete: (func = () => {}) => emitter.promise('domComplete', waitForComplete).then(() => func()),
		each: (arr, callback) => Array.from(arr).forEach((a, i) => callback.apply(a, [i, a])),
		proxy: (func, ...args) => func.bind(...args),
		fn: {
		}
	});
	return uQuery;
})();
const uq = uQuery;

    const ZenzaWatch = {
      version: VER,
      env: ENV,
      debug: {WatchInfoCacheDb, StoryboardCacheDb},
      api: {},
      init: {},
      lib: { $: window.ZenzaLib.$ || $, _ },
      external: {},
      util,
      modules: {Emitter, Handler},
      config: Config,
      emitter: new Emitter(),
      state: {},
      dll
    };
    Promise.all([//https://unpkg.com/lit-html@1.1.2/lit-html.js?module
      dimport('https://unpkg.com/lit-html@1.1.2/lit-html.js?module'),
      dimport('https://unpkg.com/lit-html@1.1.2/directives/repeat?module'),
      dimport('https://unpkg.com/lit-html@1.1.2/directives/class-map?module')
    ]).then(([lit, ...directives]) => {
      dll.lit = lit;
      dll.directives = Object.assign({}, ...directives);
      emitter.emitResolve('lit-html', dll.lit);
    });

    const Navi = {
      version: VER,
      env: ENV,
      debug: {},
      config: NaviConfig,
      emitter: new Emitter(),
      state: {}
    };
    delete window.ZenzaLib;

    if (location.host.match(/\.nicovideo\.jp$/)) {
      window.ZenzaWatch = ZenzaWatch;
      window.Navi = Navi;
    } else {
      window.ZenzaWatch = {config: ZenzaWatch.config};
      window.Navi = {config: Navi.config};
    }
    window.ZenzaWatch.emitter = ZenzaWatch.emitter = new Emitter();
    const debug = ZenzaWatch.debug;
    const emitter = ZenzaWatch.emitter;

    // const modules = ZenzaWatch.modules;
const CONSTANT = {
	BASE_Z_INDEX: 100000,
	CONTROL_BAR_HEIGHT: 40,
	SIDE_PLAYER_WIDTH: 400,
	SIDE_PLAYER_HEIGHT: 225,
	BIG_PLAYER_WIDTH: 896,
	BIG_PLAYER_HEIGHT: 480,
	RIGHT_PANEL_WIDTH: 320,
	BOTTOM_PANEL_HEIGHT: 240,
	BLANK_VIDEO_URL: '//',
	BLANK_PNG: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NgYGD4DwABBAEAcCBlCwAAAABJRU5ErkJggg==',
	MEDIA_ERROR: {
		MEDIA_ERR_ABORTED: 1,
		MEDIA_ERR_NETWORK: 2,
		MEDIA_ERR_DECODE: 3,
		MEDIA_ERR_SRC_NOT_SUPPORTED: 4
	}
};
CONSTANT.BASE_CSS_VARS = (() => {
	const vars = {
		'base-bg-color': '#333',
		'base-fore-color': '#ccc',
		'light-text-color': '#fff',
		'scrollbar-bg-color': '#222',
		'scrollbar-thumb-color': '#666',
		'item-border-color': '#888',
		'hatsune-color': '#039393',
		'enabled-button-color': '#9cf'
	};
	const dt = new Date().toISOString();
		vars['scrollbar-thumb-color'] = vars['hatsune-color'];
	return '#zenzaVideoPlayerDialog, .zenzaRoot {\n' +
			Object.keys(vars).map(key => `--${key}:${vars[key]};`).join('\n') +
	'\n}';
})();
CONSTANT.COMMON_CSS = `
	${CONSTANT.BASE_CSS_VARS}
	.xDomainLoaderFrame {
		border: 0;
		position: fixed;
		top: -999px;
		left: -999px;
		width: 1px;
		height: 1px;
		border: 0;
		contain: paint;
	}
	.ZenButton {
		display: none;
		opacity: 0.8;
		position: absolute;
		z-index: ${CONSTANT.BASE_Z_INDEX + 100000};
		cursor: pointer;
		font-size: 8pt;
		width: 32px;
		height: 26px;
		padding: 0;
		line-height: 26px;
		font-weight: bold;
		text-align: center;
		transition: box-shadow 0.2s ease, opacity 0.4s ease;
		user-select: none;
		transform: translate(-50%, -50%);
		contain: layout style;
	}
	.ZenButton:hover {
		opacity: 1;
	}
		.ZenButtonInner {
			background: #eee;
			color: #000;
			border: outset 1px;
			box-shadow: 2px 2px rgba(0, 0, 0, 0.8);
		}
		.ZenButton:active .ZenButtonInner {
			border: inset 1px;
			transition: translate(2px, 2px);
			box-shadow: 0 0 rgba(0, 0, 0, 0.8);
		}
	.ZenButton.show {
		display: inline-block;
	}
	.zenzaPopupMenu {
		display: block;
		position: absolute;
		background: var(--base-bg-color);
		color: #fff;
		overflow: visible;
		border: 1px solid var(--base-fore-color);
		padding: 0;
		opacity: 0.99;
		box-sizing: border-box;
		transition: opacity 0.3s ease;
		z-index: ${CONSTANT.BASE_Z_INDEX + 50000};
		user-select: none;
	}
	.zenzaPopupMenu:not(.show) {
		transition: none;
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
	}
	.zenzaPopupMenu ul {
		padding: 0;
	}
	.zenzaPopupMenu ul li {
		position: relative;
		margin: 2px 4px;
		white-space: nowrap;
		cursor: pointer;
		padding: 2px 8px;
		list-style-type: none;
		float: inherit;
	}
	.zenzaPopupMenu ul li + li {
		border-top: 1px dotted var(--item-border-color);
	}
	.zenzaPopupMenu li.selected {
		font-weight: bolder;
	}
	.zenzaPopupMenu ul li:hover {
		background: #663;
	}
	.zenzaPopupMenu ul li.separator {
		border: 1px outset;
		height: 2px;
		width: 90%;
	}
	.zenzaPopupMenu li span {
		box-sizing: border-box;
		margin-left: 8px;
		display: inline-block;
		cursor: pointer;
	}
	.zenzaPopupMenu ul li.selected span:before {
		content: '✔';
		left: 0;
		position: absolute;
	}
	.zenzaPopupMenu.show {
		opacity: 0.8;
	}
	.zenzaPopupMenu .caption {
		padding: 2px 4px;
		text-align: center;
		margin: 0;
		font-weight: bolder;
		background: #666;
		color: #fff;
	}
	.zenzaPopupMenu .triangle {
		position: absolute;
		width: 16px;
		height: 16px;
		border: 1px solid #ccc;
		border-width: 0 0 1px 1px;
		background: #333;
		box-sizing: border-box;
	}
	body.showNicoVideoPlayerDialog #external_nicoplayer {
		transform: translate(-9999px, 0);
	}
	#ZenzaWatchVideoPlayerContainer .atsumori-root {
		position: absolute;
		z-index: 10;
	}
	#zenzaVideoPlayerDialog.is-guest .forMember {
		display: none;
	}
	#zenzaVideoPlayerDialog .forGuest {
		display: none;
	}
	#zenzaVideoPlayerDialog.is-guest .forGuest {
		display: inherit;
	}
	.scalingUI {
		transform: scale(var(--zenza-ui-scale));
	}
`.trim();
CONSTANT.SCROLLBAR_CSS = `
	.videoInfoTab::-webkit-scrollbar,
	#listContainer::-webkit-scrollbar,
	.zenzaCommentPreview::-webkit-scrollbar,
	.mylistSelectMenuInner::-webkit-scrollbar {
		background: var(--scrollbar-bg-color);
		width: 16px;
	}
	.videoInfoTab::-webkit-scrollbar-thumb,
	#listContainer::-webkit-scrollbar-thumb,
	.zenzaCommentPreview::-webkit-scrollbar-thumb,
	.mylistSelectMenuInner::-webkit-scrollbar-thumb {
		border-radius: 0;
		background: var(--scrollbar-thumb-color);
		will-change: transform;
	}
	.videoInfoTab::-webkit-scrollbar-button,
	#listContainer::-webkit-scrollbar-button,
	.zenzaCommentPreview::-webkit-scrollbar-button,
	.mylistSelectMenuInner::-webkit-scrollbar-button {
		display: none;
	}
`.trim();
const global = {
  emitter, debug,
  external: ZenzaWatch.external, PRODUCT, TOKEN, CONSTANT,
  notify: msg => ZenzaWatch.external.execCommand('notify', msg),
  alert: msg => ZenzaWatch.external.execCommand('alert', msg),
  config: Config,
  api: ZenzaWatch.api,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  NICORU,
  dll
};
class ClassListWrapper {
	constructor(element) {
		this.applyNow = this.apply.bind(this);
		this.apply = throttle.raf(this.applyNow);
		if (element) {
			this.setElement(element);
		} else {
			this._next = new Set;
			this._last = new Set;
		}
	}
	setElement(element) {
		if (this._element) {
			this.applyNow();
		}
		this._element = element;
		this._next = new Set(element.classList);
		this._last = new Set(this._next);
		return this;
	}
	add(...names) {
		names = names.map(name => name.trim().split(/\s+/)).flat();
		let changed = false;
		for (const name of names) {
			if (!this._next.has(name)) {
				changed = true;
				this._next.add(name);
			}
		}
		changed && this.apply();
		return this;
	}
	remove(...names) {
		names = names.map(name => name.trim().split(/\s+/)).flat();
		let changed = false;
		for (const name of names) {
			if (this._next.has(name)) {
				changed = true;
				this._next.delete(name);
			}
		}
		changed && this.apply();
		return this;
	}
	contains(name) {
		return this._next.has(name);
	}
	toggle(name, v) {
		if (v !== undefined) {
			v = !!v;
		} else {
			v = !this.contains(name);
		}
		const names = name.trim().split(/\s+/);
		v ? this.add(...names) : this.remove(...names);
		return this;
	}
	apply() {
		const last = [...this._last].sort().join(',');
		const next = [...this._next].sort().join(',');
		if (next === last) { return; }
		const element = this._element;
		const added = [], removed = [];
		for (const name of this._next) {
			if (!this._last.has(name)) { added.push(name); }
		}
		for (const name of this._last) {
			if (!this._next.has(name)) { removed.push(name); }
		}
		if (removed.length) { element.classList.remove(...removed); }
		if (added.length)   { element.classList.add(...added); }
		this._last = this._next;
		this._next = new Set(element.classList);
		return this;
	}
}
const ClassList = function(element) {
	if (this.map.has(element)) {
		return this.map.get(element);
	}
	const m = new ClassListWrapper(element);
	this.map.set(element, m);
	return m;
}.bind({map: new WeakMap()});
class domUtil {
	static create(name, options = {}) {
		const {dataset, style, ...props} = options;
		const element = Object.assign(document.createElement(name), props || {});
		dataset && Object.assign(element.dataset, dataset);
		style && Object.assign(element.style, style);
		return element;
	}
	static define(name, classDefinition) {
		if (!self.customElements) {
			return false;
		}
		if (customElements.get(name)) {
			return true;
		}
		customElements.define(name, classDefinition);
		return true;
	}
}
//@require reg
util.reg = reg;
//@require PopupMessage
const AsyncEmitter = (() => {
	const emitter = function () {
	};
	emitter.prototype.on = Emitter.prototype.on;
	emitter.prototype.once = Emitter.prototype.once;
	emitter.prototype.off = Emitter.prototype.off;
	emitter.prototype.clear = Emitter.prototype.clear;
	emitter.prototype.emit = Emitter.prototype.emit;
	emitter.prototype.emitAsync = Emitter.prototype.emitAsync;
	return emitter;
})();
(ZenzaWatch ? ZenzaWatch.lib : {}).AsyncEmitter = AsyncEmitter;
//@require Fullscreen
util.fullscreen = Fullscreen;
const dummyConsole = {};
window.console.timeLog || (window.console.timeLog = () => {});
for (const k of Object.keys(window.console)) {
	if (typeof window.console[k] !== 'function') {continue;}
	dummyConsole[k] = _.noop;
}
['assert', 'error', 'warn', 'nicoru'].forEach(k =>
	dummyConsole[k] = window.console[k].bind(window.console));
console = Config.props.debug ? window.console : dummyConsole;
Config.onkey('debug', v => console = v ? window.console : dummyConsole);
//@require css
Object.assign(util, css);
//@require textUtil
Object.assign(util, textUtil);
//@require nicoUtil
Object.assign(util, nicoUtil);
//@require messageUtil
Object.assign(util, messageUtil);
//@require PlayerSession
//@require WatchPageHistory
//@require env
Object.assign(util, env);
//@require Clipboard
util.copyToClipBoard = Clipboard.copyText;
//@require netUtil
Object.assign(util, netUtil);
//@require VideoCaptureUtil
util.videoCapture = VideoCaptureUtil.capture;
util.capTube = VideoCaptureUtil.capTube;
//@require saveMymemory
util.saveMymemory = saveMymemory;
//@require speech
util.speak = speech.speak;
//@require watchResize
util.watchResize = watchResize;
util.sortedLastIndex = (arr, value) => {
	let head = 0;
	let tail = arr.length;
	while (head < tail) {
		let p = Math.floor((head + tail) / 2);
		let v = arr[p];
		if (v <= value) {
			head = p + 1;
		} else {
			tail = p;
		}
	}
	return tail;
};
//@require createVideoElement
util.createVideoElement = createVideoElement;
//@require domEvent
Object.assign(util, domEvent);
util.defineElement = domUtil.defineElement;
util.$ = uQuery;
util.createDom = util.$.html;
util.isTL = util.$.isTL;
//@require ShortcutKeyEmitter
//@require RequestAnimationFrame
util.RequestAnimationFrame = RequestAnimationFrame;
//@require FrameLayer
//@require MylistPocketDetector
//@require BaseViewComponent
//@require StyleSwitcher
util.StyleSwitcher = StyleSwitcher;
util.dimport = dimport;
//@require VideoItemObserver
util.VideoItemObserver = VideoItemObserver;
//@require NicoQuery
util.NicoQuery = NicoQuery;
//@require sleep
util.sleep = sleep;
//@require bounce
util.bounce = bounce;
ZenzaWatch.lib.$ = uQuery;
workerUtil.env({netUtil, global});
const initCssProps = (win) => {
	win = win || window;
	const LEN = '<length>';
	const TM = '<time>';
	const LP = '<length-percentage>';
	const CL = '<color>';
	const NUM = '<number>';
	const SEC1 = cssUtil.s(1);
	const PX0 = cssUtil.px(0);
	const TP = 'transparent';
	const inherits = true;
	cssUtil.registerProps(
		{name: '--zenza-ui-scale', window: win,
			syntax: NUM, initialValue: cssUtil.number(1), inherits},
		{name: '--zenza-control-bar-height', window: win,
			syntax: LEN, initialValue: cssUtil.px(48), inherits},
		{name: '--zenza-comment-layer-opacity', window: win,
			syntax: NUM, initialValue: cssUtil.number(1),  inherits},
		{name: '--zenza-comment-panel-header-height', window: win,
			syntax: LEN, initialValue: cssUtil.px(64), inherits},
		{name: '--sideView-left-margin', window: win,
			syntax: LP, initialValue: cssUtil.px(CONSTANT.SIDE_PLAYER_WIDTH + 24), inherits},
		{name: '--sideView-top-margin', window: win,
			syntax: LP, initialValue: cssUtil.px(76), inherits},
		{name: '--base-bg-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--base-fore-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--light-text-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--scrollbar-bg-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--scrollbar-thumb-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--item-border-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--hatsune-color', window: win,
			syntax: CL, initialValue: TP, inherits},
		{name: '--enabled-button-color', window: win,
			syntax: CL, initialValue: TP, inherits}
	);
	cssUtil.setProps(
		[document.documentElement, '--inner-width', cssUtil.number(global.innerWidth)],
		[document.documentElement, '--inner-height', cssUtil.number(global.innerHeight)]
	);
};
initCssProps();
WindowResizeObserver.subscribe(({width, height}) => {
  global.innerWidth  = width;
  global.innerHeight = height;
  cssUtil.setProps(
    [document.documentElement, '--inner-width', cssUtil.number(width)],
    [document.documentElement, '--inner-height', cssUtil.number(height)]
  );
});
//@require ./element/BaseCommandElement.js
//@require ./element/VideoItemElement.js
//@require ./element/VideoSeriesLabel.js
//@require ./element/NoWebComponent.js
//@require ./element/RangeBarElement.js
const components = (() => {
	if (window.customElements) {
		customElements.get('zenza-video-item') || customElements.define('zenza-video-item', VideoItemElement);
	}
	return {
		BaseCommandElement,
		VideoItemElement,
		VideoSeriesLabel,
		RangeBarElement
	};
})();
class BaseState extends Emitter {
	static getInstance() {
		if (!this.instance) {
			this.instance = new this.constructor();
		}
		return this.instance;
	}
	static defineProps(self, props = {}) {
		const def = {};
		Object.keys(props).sort()
			.forEach(key => {
				def[key] = {
					enumerable: !key.startsWith('_'),
					get() { return self._state[key]; },
					set(val) { self.setState(key, val); }
				};
		});
		Object.defineProperties(self, def);
	}
	constructor(state) {
		super();
		this._name = '';
		this._state = state;
		this._changed = new Map;
		this._timestamp = performance.now();
		this._boundOnChange = _.debounce(this._onChange.bind(this), 0);
		this.constructor.defineProps(this, state);
	}
	_updateTimestamp() {
		return this._timestamp = performance.now();
	}
	onkey(key, func) {return this.on(`update-${key}`, func);}
	offkey(key, func) {return this.off(`update-${key}`, func);}
	_onChange() {
		const changed = this._changed;
		if (!changed.size) {
			return;
		}
		this.emit('change', changed, changed.size);
		for (const [key, val] of changed) {
			this.emit('update', key, val);
			this.emit(`update-${key}`, val);
		}
		this._changed.clear();
	}
	setState(key, val) {
		if (typeof key === 'string') {
			return this._setState(key, val);
		}
		for (const [k, v] of (key instanceof Map ? key : Object.entries(key))) {
			this._setState(k, v);
		}
	}
	_setState(key, val) {
		if (!this._state.hasOwnProperty(key)) {
			console.warn('%cUnknown property %s = %s', 'background: yellow;', key, val);
		}
		if (this._state[key] === val) {
			return;
		}
		this._state[key] = val;
		this._changed.set(key, val);
		this._boundOnChange();
	}
}
class PlayerState extends BaseState {
	static getInstance(config) {
		if (!PlayerState.instance) {
			PlayerState.instance = new PlayerState(config);
		}
		return PlayerState.instance;
	}
	constructor(config) {
		super({
			isAbort: false,
			isBackComment: config.props.backComment,
			isChanging: false,
			isCanPlay: false,
			isChannel: false,
			isShowComment: config.props.showComment,
			isCommentReady: false,
			isCommentPosting: false,
			isCommunity: false,
			isWaybackMode: false,
			isDebug: config.props.debug,
			isDmcAvailable: false,
			isDmcPlaying: false,
			isError: false,
			isEnded: false,
			isLoading: false,
			isLoop: config.props.loop,
			isMute: config.props.mute,
			isMymemory: false,
			isLiked: false,
			isOpen: false,
			isPausing: true,
			isPlaylistEnable: false,
			isPlaying: false,
			isSeeking: false,
			isRegularUser: !nicoUtil.isPremium(),
			isStalled: false,
			isUpdatingDeflist: false,
			isUpdatingMylist: false,
			isNotPlayed: true,
			isYouTube: false,
			isEnableFilter: config.props.enableFilter,
			sharedNgLevel: config.props.sharedNgLevel,
			currentSrc: '',
			currentTab: config.props.videoInfoPanelTab,
			errorMessage: '',
			screenMode: config.props.screenMode,
			playbackRate: config.props.playbackRate,
			thumbnail: '',
			videoCount: {},
			videoSession: {}
		});
		this.name = 'Player';
	}
	set videoInfo(videoInfo) {
		if (this._videoInfo) {
			this._videoInfo.update(videoInfo);
		} else {
			this._videoInfo = videoInfo;
		}
		global.debug.videoInfo = videoInfo;
		this.videoCount = videoInfo.count;
		this.thumbnail = videoInfo.betterThumbnail;
		this.emit('update-videoInfo', videoInfo);
	}
	get videoInfo() {
		return this._videoInfo;
	}
	set chatList(chatList) {
		this._chatList = chatList;
		this.emit('update-chatList', this._chatList);
	}
	get chatList() {
		return this._chatList;
	}
	resetVideoLoadingStatus() {
		this.setState({
			isLoading: true,
			isPlaying: false,
			isPausing: true,
			isCanPlay: false,
			isSeeking: false,
			isStalled: false,
			isError: false,
			isAbort: false,
			isMymemory: false,
			isCommunity: false,
			isChannel: false,
			isEnded: false,
			currentSrc: CONSTANT.BLANK_VIDEO_URL
		});
	}
	setVideoCanPlay() {
		this.setState({
			isStalled: false, isLoading: false, isPausing: true, isNotPlayed: true, isError: false, isSeeking: false, isCanPlay: true, isEnded: false
		});
	}
	setPlaying() {
		this.setState({
			isPlaying: true,
			isPausing: false,
			isCanPlay: false,
			isLoading: false,
			isNotPlayed: false,
			isError: false,
			isStalled: false,
			isEnded: false
		});
	}
	setPausing() {
		this.setState({isPlaying: false, isPausing: true});
	}
	setVideoEnded() {
		this.setState({isPlaying: false, isPausing: true, isSeeking: false, isEnded: true});
	}
	setVideoErrorOccurred() {
		this.setState({isError: true, isPlaying: false, isPausing: true, isLoading: false, isSeeking: false});
	}
}
class VideoControlState extends BaseState {
	constructor(state = {}) {
		super(Object.assign({
			isSeeking: false,
			isDragging: false,
			isWheelSeeking: false,
			isStoryboardAvailable: false
		}, state));
		this.name = 'VideoControl';
	}
}
//@require CacheStorage
//@require VideoInfoLoader
//@require ThumbInfoLoader
//@require MylistApiLoader
//@require NicoRssLoader
//@require MatrixRankingLoader
//@require IchibaLoader
//@require CommonsTreeLoader
//@require UploadedVideoApiLoader
//@require UaaLoader
//@require RecommendAPILoader
//@require NVWatchCaller
//@require PlaybackPosition
//@require CrossDomainGate
//@require NicoVideoApi
class DmcInfo {
	constructor(rawData) {
		this._rawData = rawData;
		this._session = rawData.movie.session;
	}
	get apiUrl() {
		return this._session.urls[0].url;
	}
	get urls() {
		return this._session.urls;
	}
	get audios() {
		return this._session.audios;
	}
	get videos() {
		return this._rawData.movie.videos;
	}
	get quality() {
		return this._rawData.movie.quality;
	}
	get signature() {
		return this._session.signature;
	}
	get token() {
		return this._session.token;
	}
	get serviceUserId() {
		return this._session.serviceUserId;
	}
	get contentId() {
		return this._session.contentId;
	}
	get playerId() {
		return this._session.playerId;
	}
	get recipeId() {
		return this._session.recipeId;
	}
	get heartBeatLifeTimeMs() {
		return this._session.heartbeatLifetime;
	}
	get protocols() {
		return this._session.protocols || [];
	}
	get isHLSRequired() {
		return !this.protocols.includes('http');
	}
	get contentKeyTimeout() {
		return this._session.contentKeyTimeout;
	}
	get priority() {
		return this._session.priority;
	}
	get authTypes() {
		return this._session.authTypes;
	}
	get videoFormatList() {
		return (this.videos || []).concat();
	}
	get hasStoryboard() {
		return !!this._rawData.storyboard_session_api;
	}
	get storyboardInfo() {
		return this._rawData.storyboard_session_api;
	}
	get transferPreset() {
		return (this._session.transferPresets || [''])[0] || '';
	}
	get heartbeatLifeTime() {
		return this._session.heartbeatLifetime || 120 * 1000;
	}
	get importVersion() {
		return this._rawData.import_version || 0;
	}
	get trackingId() {
		return this._rawData.trackingId || '';
	}
	get encryption() {
		return this._rawData.encryption || null;
	}
	getData() {
		const data = {};
		for (const prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (typeof this[prop] === 'function') { continue; }
			data[prop] = this[prop];
		}
		return data;
	}
	toJSON() {
		return JSON.stringify(this.getData());
	}
}
class VideoFilter {
	constructor(ngOwner, ngTag) {
		this.ngOwner = ngOwner;
		this.ngTag = ngTag;
	}
	get ngOwner() {
		return this._ngOwner || [];
	}
	set ngOwner(owner) {
		owner = _.isArray(owner) ? owner : owner.toString().split(/[\r\n]/);
		let list = [];
		owner.forEach(o => {
			list.push(o.replace(/#.*$/, '').trim());
		});
		this._ngOwner = list;
	}
	get ngTag() {
		return this._ngTag || [];
	}
	set ngTag(tag) {
		tag = Array.isArray(tag) ? tag : tag.toString().split(/[\r\n]/);
		const list = [];
		tag.forEach(t => {
			list.push(t.toLowerCase().trim());
		});
		this._ngTag = list;
	}
	isNgVideo(videoInfo) {
		let isNg = false;
		let isChannel = videoInfo.isChannel;
		let ngTag = this.ngTag;
		videoInfo.tagList.forEach(tag => {
			let text = (tag.tag || '').toLowerCase();
			if (ngTag.includes(text)) {
				isNg = true;
			}
		});
		if (isNg) {
			return true;
		}
		let owner = videoInfo.owner;
		let ownerId = isChannel ? ('ch' + owner.id) : owner.id;
		if (ownerId && this.ngOwner.includes(ownerId)) {
			isNg = true;
		}
		return isNg;
	}
}
class VideoInfoModel {
	constructor(videoInfoData, localCacheData = {}) {
		this._update(videoInfoData, localCacheData);
		this._currentVideoPromise = null;
	}
	update(videoInfoModel) {
		this._update(videoInfoModel._rawData);
		return true;
	}
	_update(info, localCacheData = {}) {
		this._rawData = info;
		this._cacheData = localCacheData;
		this._watchApiData = info.watchApiData;
		this._videoDetail = info.watchApiData.videoDetail;
		this._flashvars = info.watchApiData.flashvars;   // flashに渡す情報
		this._viewerInfo = info.viewerInfo;               // 閲覧者(＝おまいら)の情報
		this._flvInfo = info.flvInfo;
		this._msgInfo = info.msgInfo;
		this._dmcInfo = (info.dmcInfo && info.dmcInfo.movie.session) ? new DmcInfo(info.dmcInfo) : null;
		this._relatedVideo = info.playlist; // playlistという名前だが実質は関連動画
		this._playlistToken = info.playlistToken;
		this._watchAuthKey = info.watchAuthKey;
		this._seekToken = info.seekToken;
		this._resumeInfo = info.resumeInfo || {};
		this._currentVideo = null;
		this._currentVideoPromise = null;
		return true;
	}
	get title() {
		return this._videoDetail.title_original || this._videoDetail.title;
	}
	get description() {
		return this._videoDetail.description || '';
	}
	get descriptionOriginal() {
		return this._videoDetail.description_original;
	}
	get postedAt() {
		return this._videoDetail.postedAt;
	}
	get thumbnail() {
		return this._videoDetail.thumbnail;
	}
	get betterThumbnail() {
		return this._rawData.thumbnail;
	}
	get largeThumbnnail() {
		return this._videoDetail.largeThumbnnail;
	}
	get videoUrl() {
		return (this._flvInfo.url || '');//.replace(/^http:/, '');
	}
	get storyboardUrl() {
		let url = this._flvInfo.url;
		if (!url || !url.match(/smile\?m=/) || url.match(/^rtmp/)) {
			return null;
		}
		return url;
	}
	getCurrentVideo() {
		if (this._currentVideoPromise) {
			return this._currentVideoPromise;
		}
		return this._currentVideoPromise = new PromiseHandler();
	}
	setCurrentVideo(v) {
		this._currentVideo = v;
		this._currentVideoPromise && this._currentVideoPromise.resolve(v);
	}
	get isEconomy() {
		return this.videoUrl.match(/low$/) ? true : false;
	}
	get tagList() {
		return this._videoDetail.tagList;
	}
	getVideoId() { // sm12345
		return this.videoId;
	}
	get videoId() {
		return this._videoDetail.id;
	}
	get originalVideoId() {
		return (this.isMymemory || this.isCommunityVideo) ? this.videoId : '';
	}
	getWatchId() { // sm12345だったりスレッドIDだったり
		return this.watchId;
	}
	get watchId() {
		if (this.videoId.substring(0, 2) === 'so') {
			return this.videoId;
		}
		return this._videoDetail.v;
	}
	get contextWatchId() {
		return this._videoDetail.v;
	}
	get watchUrl() {
		return `https://www.nicovideo.jp/watch/${this.watchId}`;
	}
	get threadId() { // watchIdと同一とは限らない
		return this._msgInfo.threadId;
	}
	get videoSize() {
		return {
			width: this._videoDetail.width,
			height: this._videoDetail.height
		};
	}
	get duration() {
		return this._videoDetail.length;
	}
	get count() {
		const vd = this._videoDetail;
		return {
			comment: vd.commentCount,
			mylist: vd.mylistCount,
			view: vd.viewCount
		};
	}
	get isChannel() {
		return !!this._videoDetail.channelId;
	}
	get isMymemory() {
		return !!this._videoDetail.isMymemory;
	}
	get isCommunityVideo() {
		return !!(!this.isChannel && this._videoDetail.communityId);
	}
	get isPremiumOnly() {
		return !!this._videoDetail.isPremiumOnly;
	}
	get isLiked() {
		return !!this._videoDetail.isLiked;
	}
	set isLiked(v) {
		this._videoDetail.isLiked = v;
	}
	get hasParentVideo() {
		return !!(this._videoDetail.commons_tree_exists);
	}
	get isDmc() {
		return this.isDmcOnly || (this._rawData.isDmc);
	}
	get isDmcAvailable() {
		return this._rawData.isDmc;
	}
	get dmcInfo() {
		return this._dmcInfo;
	}
	get msgInfo() {
		return this._msgInfo;
	}
	get isDmcOnly() {
		return !!this._rawData.isDmcOnly || !this.videoUrl;
	}
	get hasDmcStoryboard() {
		return this._dmcInfo && this._dmcInfo.hasStoryboard;
	}
	get dmcStoryboardInfo() {
		return !!this._dmcInfo ? this._dmcInfo.storyboardInfo : null;
	}
	get owner() {
		let ownerInfo;
		if (this.isChannel) {
			let c = this._watchApiData.channelInfo || {};
			ownerInfo = {
				icon: c.icon_url || 'https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg',
				url: `https://ch.nicovideo.jp/ch${c.id}`,
				id: c.id,
				linkId: c.id ? `ch${c.id}` : '',
				name: c.name,
				favorite: c.is_favorited === 1, // こっちは01で
				type: 'channel'
			};
		} else {
			let u = this._watchApiData.uploaderInfo || {};
			let f = this._flashvars || {};
			ownerInfo = {
				icon: u.icon_url || 'https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg',
				url: u.id ? `//www.nicovideo.jp/user/${u.id}` : '#',
				id: u.id || f.videoUserId || '',
				linkId: u.id ? `user/${u.id}` : '',
				name: u.nickname || '(非公開ユーザー)',
				favorite: !!u.is_favorited, // こっちはbooleanという
				type: 'user',
				isMyVideoPublic: !!u.is_user_myvideo_public
			};
		}
		return ownerInfo;
	}
	get series() {
		if (!this._rawData.series || !this._rawData.series.id) {
			return null;
		}
		const series = this._rawData.series;
		const thumbnailUrl = series.thumbnailUrl || this.betterThumbnail;
		return Object.assign({}, series, {thumbnailUrl});
	}
	get firstVideo() {
		return this.series ? this.series.video.first : null;
	}
	get prevVideo() {
		return this.series ? this.series.video.prev : null;
	}
	get nextVideo() {
		return this.series ? this.series.video.next : null;
	}
	get relatedVideoItems() {
		return this._relatedVideo.playlist || [];
	}
	get replacementWords() {
		if (!this._flvInfo.ng_up || this._flvInfo.ng_up === '') {
			return null;
		}
		return textUtil.parseQuery(
			this._flvInfo.ng_up || ''
		);
	}
	get playlistToken() {
		return this._playlistToken;
	}
	set playlistToken(v) {
		this._playlistToken = v;
	}
	get watchAuthKey() {
		return this._watchAuthKey;
	}
	set watchAuthKey(v) {
		this._watchAuthKey = v;
	}
	get seekToken() {
		return this._seekToken;
	}
	get width() {
		return parseInt(this._videoDetail.width, 10);
	}
	get height() {
		return parseInt(this._videoDetail.height, 10);
	}
	get initialPlaybackTime() {
		return this.resumePoints[0] && (this.resumePoints[0].time || 0);
	}
	get resumePoints() {
		const duration = this.duration;
		const MARGIN = 10;
		const resumePoints =
			((this._cacheData && this._cacheData.resume) ? this._cacheData.resume : [])
				.filter(({now, time}) => time > MARGIN && time < duration - MARGIN)
				.map(({now, time}) => { return {now: new Date().toLocaleString(), time}; })
				.reverse();
		const lastResumePoint = this._resumeInfo ? this._resumeInfo.initialPlaybackPosition : 0;
		lastResumePoint && resumePoints.unshift({now: '前回', time: lastResumePoint});
		return resumePoints;
	}
	get csrfToken() {
		return this._rawData.csrfToken || '';
	}
	get extension() {
		if (this.isDmc) {
			return 'mp4';
		}
		const url = this.videoUrl;
		if (url.match(/smile\?m=/)) {
			return 'mp4';
		}
		if (url.match(/smile\?v=/)) {
			return 'flv';
		}
		if (url.match(/smile\?s=/)) {
			return 'swf';
		}
		return 'unknown';
	}
	get community() {
		return this._rawData.community || null;
	}
	get maybeBetterQualityServerType() {
		if (this.isDmcOnly) {
			return 'dmc';
		}
		if (this.isEconomy) {
			return 'dmc';
		}
		let dmcInfo = this.dmcInfo;
		if (!dmcInfo) {
			return 'smile';
		}
		if (/smile\?[sv]=/.test(this.videoUrl)) {
			return 'dmc';
		}
		let smileWidth = this.width;
		let smileHeight = this.height;
		let dmcVideos = dmcInfo.videos;
		let importVersion = dmcInfo.importVersion;
		if (isNaN(smileWidth) || isNaN(smileHeight)) {
			return 'dmc';
		}
		if (smileWidth > 1280 || smileHeight > 720) {
			return 'smile';
		}
		if (smileHeight < 360) {
			return 'smile';
		}
		const highestDmc = Math.max(...dmcVideos.map(v => {
			return (/_([0-9]+)p$/.exec(v)[1] || '') * 1;
		}));
		if (highestDmc >= 720) {
			return 'dmc';
		}
		if (smileHeight === 486 || smileHeight === 384) {
			return 'smile';
		}
		if (highestDmc >= smileHeight) {
			return 'dmc';
		}
		return 'dmc';
	}
	getData() {
		const data = {};
		for (const prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (typeof this[prop] === 'function') { continue; }
			data[prop] = this[prop];
		}
		return data;
	}
}
const {NicoSearchApiV2Query, NicoSearchApiV2Loader} =
	(function () {
		const BASE_URL = 'https://api.search.nicovideo.jp/api/v2/';
		const API_BASE_URL = `${BASE_URL}/video/contents/search`;
		const MESSAGE_ORIGIN = 'https://api.search.nicovideo.jp/';
		const SORT = {
			f: 'startTime',
			v: 'viewCounter',
			r: 'commentCounter',
			m: 'mylistCounter',
			l: 'lengthSeconds',
			n: 'lastCommentTime',
			h: '_hotMylistCounter',           // 人気が高い順
			'_hot': '_hotMylistCounter',    // 人気が高い順(↑と同じだけど互換用に残ってる)
			'_popular': '_popular',            // 並び順指定なしらしい
		};
		const F_RANGE = {
			U_1H: 4,
			U_24H: 1,
			U_1W: 2,
			U_30D: 3
		};
		const L_RANGE = {
			U_5MIN: 1,
			O_20MIN: 2
		};
		let gate;
		let initializeCrossDomainGate = function () {
			initializeCrossDomainGate = function () {
			};
			gate = new CrossDomainGate({
				baseUrl: BASE_URL,
				origin: MESSAGE_ORIGIN,
				type: 'searchApi',
				messager: WindowMessageEmitter
			});
		};
		class NicoSearchApiV2Query {
			constructor(word, params = {}) {
				if (word.searchWord) {
					this._initialize(word.searchWord, word);
				} else {
					this._initialize(word, params);
				}
			}
			get q() {
				return this._q;
			}
			get targets() {
				return this._targets;
			}
			get sort() {
				return this._sort;
			}
			get order() {
				return this._order;
			}
			get limit() {
				return this._limit;
			}
			get offset() {
				return this._offset;
			}
			get fields() {
				return this._fields;
			}
			get context() {
				return this._context;
			}
			get hotField() {
				return this._hotField;
			}
			get hotFrom() {
				return this._hotFrom;
			}
			get hotTo() {
				return this._hotTo;
			}
			_initialize(word, params) {
				if (params._now) {
					this.now = params._now;
				}
				const sortTable = SORT;
				this._filters = [];
				this._q = word || params.searchWord || 'ZenzaWatch';
				this._targets =
					params.searchType === 'tag' ?
						['tagsExact'] : ['tagsExact', 'title', 'description'];
				this._sort =
					(params.order === 'd' ? '-' : '+') +
					(params.sort && sortTable[params.sort] ?
						sortTable[params.sort] : 'lastCommentTime');
				this._order = params.order === 'd' ? 'desc' : 'asc';
				this._limit = 100;
				this._offset = Math.min(
					params.page ? Math.max(parseInt(params.page, 10) - 1, 0) * 25 : 0,
					1600
				);
				this._fields = [
					'contentId', 'title', 'description', 'tags', 'categoryTags',
					'viewCounter', 'commentCounter', 'mylistCounter', 'lengthSeconds',
					'startTime', 'thumbnailUrl'
				];
				this._context = 'ZenzaWatch';
				const n = new Date(), now = this.now;
				if (/^._hot/.test(this.sort)) {
					(() => {
						this._hotField = 'mylistCounter';
						this._hotFrom = new Date(now - 1 * 24 * 60 * 60 * 1000);
						this._hotTo = n;
						this._sort = '-_hotMylistCounter';
					})();
				}
				if (params.f_range &&
					[F_RANGE.U_1H, F_RANGE.U_24H, F_RANGE.U_1W, F_RANGE.U_30D]
						.includes(params.f_range * 1)) {
					this._filters.push(this._buildFRangeFilter(params.f_range * 1));
				}
				if (params.l_range &&
					[L_RANGE.U_5MIN, L_RANGE.O_20MIN].includes(params.l_range * 1)) {
					this._filters.push(this._buildLRangeFilter(params.l_range * 1));
				}
				if (params.userId && (params.userId + '').match(/^\d+$/)) {
					this._filters.push({type: 'equal', field: 'userId', value: params.userId * 1});
				}
				if (params.channelId && (params.channelId + '').match(/^\d+$/)) {
					this._filters.push({type: 'equal', field: 'channelId', value: params.channelId * 1});
				}
				if (params.commentCount && (params.commentCount + '').match(/^[0-9]+$/)) {
					this._filters.push({
						type: 'range',
						field: 'commentCounter',
						from: params.commentCount * 1
					});
				}
				if (params.utimeFrom || params.utimeTo) {
					this._filters.push(this._buildStartTimeRangeFilter({
						from: params.utimeFrom ? params.utimeFrom * 1 : 0,
						to: params.utimeTo ? params.utimeTo * 1 : now
					}));
				}
				if (params.dateFrom || params.dateTo) {
					this._filters.push(this._buildStartTimeRangeFilter({
						from: params.dateFrom ? (new Date(params.dateFrom)).getTime() : 0,
						to: params.dateTo ? (new Date(params.dateTo)).getTime() : now
					}));
				}
				const dateReg = /^\d{4}-\d{2}-\d{2}$/;
				if (dateReg.test(params.start) && dateReg.test(params.end)) {
					this._filters.push(this._buildStartTimeRangeFilter({
						from: (new Date(params.start)).getTime(),
						to: (new Date(params.end)).getTime()
					}));
				}
			}
			get stringfiedFilters() {
				if (this._filters.length < 1) {
					return '';
				}
				const result = [];
				const TIMEFIELDS = ['startTime'];
				this._filters.forEach((filter) => {
					let isTimeField = TIMEFIELDS.includes(filter.field);
					if (!filter) {
						return;
					}
					if (filter.type === 'equal') {
						result.push(`filters[${filter.field}][0]=${filter.value}`);
					} else if (filter.type === 'range') {
						let from = isTimeField ? this._formatDate(filter.from) : filter.from;
						if (filter.from) {
							result.push(`filters[${filter.field}][gte]=${from}`);
						}
						if (filter.to) {
							let to = isTimeField ? this._formatDate(filter.to) : filter.to;
							result.push(`filters[${filter.field}][lte]=${to}`);
						}
					}
				});
				return result.join('&');
			}
			get filters() {
				return this._filters;
			}
			_formatDate(time) {
				const dt = new Date(time);
				return dt.toISOString().replace(/\.\d*Z/, '') + '%2b00:00'; // '%2b00:00'
			}
			_buildStartTimeRangeFilter({from = 0, to}) {
				const range = {field: 'startTime', type: 'range'};
				if (from !== undefined && to !== undefined) {
					[from, to] = [from, to].sort(); // from < to になるように
				}
				if (from !== undefined) {
					range.from = from;
				}
				if (to !== undefined) {
					range.to = to;
				}
				return range;
			}
			_buildLengthSecondsRangeFilter({from, to}) {
				const range = {field: 'lengthSeconds', type: 'range'};
				if (from !== undefined && to !== undefined) {
					[from, to] = [from, to].sort(); // from < to になるように
				}
				if (from !== undefined) {
					range.from = from;
				}
				if (to !== undefined) {
					range.to = to;
				}
				return range;
			}
			_buildFRangeFilter(range) {
				const now = this.now;
				switch (range * 1) {
					case F_RANGE.U_1H:
						return this._buildStartTimeRangeFilter({
							from: now - 1000 * 60 * 60,
							to: now
						});
					case F_RANGE.U_24H:
						return this._buildStartTimeRangeFilter({
							from: now - 1000 * 60 * 60 * 24,
							to: now
						});
					case F_RANGE.U_1W:
						return this._buildStartTimeRangeFilter({
							from: now - 1000 * 60 * 60 * 24 * 7,
							to: now
						});
					case F_RANGE.U_30D:
						return this._buildStartTimeRangeFilter({
							from: now - 1000 * 60 * 60 * 24 * 30,
							to: now
						});
					default:
						return null;
				}
			}
			_buildLRangeFilter(range) {
				switch (range) {
					case L_RANGE.U_5MIN:
						return this._buildLengthSecondsRangeFilter({
							from: 0,
							to: 60 * 5
						});
					case L_RANGE.O_20MIN:
						return this._buildLengthSecondsRangeFilter({
							from: 60 * 20
						});
				}
			}
			toString() {
				const result = [];
				result.push('q=' + encodeURIComponent(this._q));
				result.push('targets=' + this.targets.join(','));
				result.push('fields=' + this.fields.join(','));
				result.push('_sort=' + encodeURIComponent(this.sort));
				result.push('_limit=' + this.limit);
				result.push('_offset=' + this.offset);
				result.push('_context=' + this.context);
				if (this.sort === '-_hot') {
					result.push('hotField=' + this.hotField);
					result.push('hotFrom=' + this.hotFrom);
					result.push('hotTo=' + this.hotTo);
				}
				const filters = this.stringfiedFilters;
				if (filters) {
					result.push(filters);
				}
				return result.join('&');
			}
			set now(v) {
				this._now = v;
			}
			get now() {
				return this._now || Date.now();
			}
		}
		NicoSearchApiV2Query.SORT = SORT;
		NicoSearchApiV2Query.F_RANGE = F_RANGE;
		NicoSearchApiV2Query.L_RANGE = L_RANGE;
		class NicoSearchApiV2Loader {
			static async search(word, params) {
				initializeCrossDomainGate();
				const query = new NicoSearchApiV2Query(word, params);
				const url = API_BASE_URL + '?' + query.toString();
				return gate.fetch(url).then(res => res.text()).then(result => {
					result = NicoSearchApiV2Loader.parseResult(result);
					if (typeof result !== 'number' && result.status === 'ok') {
						return Promise.resolve(Object.assign(result, {word, params}));
					} else {
						let description;
						switch (result) {
							default:
								description = 'UNKNOWN ERROR';
								break;
							case 400:
								description = 'INVALID QUERY';
								break;
							case 500:
								description = 'INTERNAL SERVER ERROR';
								break;
							case 503:
								description = 'MAINTENANCE';
								break;
						}
						return Promise.reject({
							status: 'fail',
							description
						});
					}
				});
			}
			static async searchMore(word, params, maxLimit = 300) {
				const ONCE_LIMIT = 100; // 一回で取れる件数
				const PER_PAGE = 25; // 検索ページで1ページあたりに表示される件数
				const MAX_PAGE = 64; // 25 * 64 = 1600
				const result = await NicoSearchApiV2Loader.search(word, params);
				const currentPage = params.page ? parseInt(params.page, 10) : 1;
				const currentOffset = (currentPage - 1) * PER_PAGE;
				if (result.count <= ONCE_LIMIT) {
					return result;
				}
				const searchCount = Math.min(
					Math.ceil((result.count - currentOffset) / PER_PAGE) - 1,
					Math.ceil((maxLimit - ONCE_LIMIT) / ONCE_LIMIT)
				);
				for (let i = 1; i <= searchCount; i++) {
					await sleep(300 * i);
					let page = currentPage + i * (ONCE_LIMIT / PER_PAGE);
					console.log('searchNext: "%s"', word, page, params);
					let res = await NicoSearchApiV2Loader.search(word, Object.assign(params, {page}));
					if (res && res.list && res.list.length) {
						result.list = result.list.concat(res.list);
					} else {
						break;
					}
				}
				return Object.assign(result, {word, params});
			}
			static _jsonParse(result) {
				try {
					return JSON.parse(result);
				} catch (e) {
					window.console.error('JSON parse error', e);
					return null;
				}
			}
			static parseResult(jsonText) {
				const data = NicoSearchApiV2Loader._jsonParse(jsonText);
				if (!data) {
					return 0;
				}
				const status = data.meta.status;
				const result = {
					status: status === 200 ? 'ok' : 'fail',
					count: data.meta.totalCount,
					list: []
				};
				if (status !== 200) {
					return status;
				}
				const midThumbnailThreshold = 23608629; // .Mのついた最小ID?
				data.data.forEach(item => {
					let description = item.description ? item.description.replace(/<.*?>/g, '') : '';
					if (item.thumbnailUrl.indexOf('.M') >= 0) {
						item.thumbnail_url = item.thumbnail_url.replace(/\.M$/, '');
						item.is_middle_thumbnail = true;
					} else if (item.thumbnailUrl.indexOf('.M') < 0 &&
						item.contentId.indexOf('sm') === 0) {
						let _id = parseInt(item.contentId.substring(2), 10);
						if (_id >= midThumbnailThreshold) {
							item.is_middle_thumbnail = true;
						}
					}
					const dt = textUtil.dateToString(new Date(item.startTime));
					result.list.push({
						id: item.contentId,
						type: 0, // 0 = VIDEO,
						length: item.lengthSeconds ?
							Math.floor(item.lengthSeconds / 60) + ':' +
							(item.lengthSeconds % 60 + 100).toString().substring(1) : '',
						mylist_counter: item.mylistCounter,
						view_counter: item.viewCounter,
						num_res: item.commentCounter,
						first_retrieve: dt,
						create_time: dt,
						thumbnail_url: item.thumbnailUrl,
						title: item.title,
						description_short: description.substring(0, 150),
						description_full: description,
						length_seconds: item.lengthSeconds,
						is_middle_thumbnail: item.is_middle_thumbnail
					});
				});
				return result;
			}
		}
		return {NicoSearchApiV2Query, NicoSearchApiV2Loader};
	})();
class TagEditApi {
	load(videoId) {
		const url = `/tag_edit/${videoId}/?res_type=json&cmd=tags&_=${Date.now()}`;
		return this._fetch(url, {credentials: 'include'});
	}
	add({videoId, tag, csrfToken, watchAuthKey, ownerLock = 0}) {
		const url = `/tag_edit/${videoId}/`;
		const body = this._buildQuery({
			cmd: 'add',
			tag,
			id: '',
			token: csrfToken,
			watch_auth_key: watchAuthKey,
			owner_lock: ownerLock,
			res_type: 'json'
		});
		const options = {
			method: 'POST',
			credentials: 'include',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body
		};
		return this._fetch(url, options);
	}
	remove({videoId, tag = '', id, csrfToken, watchAuthKey, ownerLock = 0}) {
		const url = `/tag_edit/${videoId}/`;
		const body = this._buildQuery({
			cmd: 'remove',
			tag, // いらないかも
			id,
			token: csrfToken,
			watch_auth_key: watchAuthKey,
			owner_lock: ownerLock,
			res_type: 'json'
		});
		const options = {
			method: 'POST',
			credentials: 'include',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body
		};
		return this._fetch(url, options);
	}
	_buildQuery(params) {
		const t = [];
		Object.keys(params).forEach(key => {
			t.push(`${key}=${encodeURIComponent(params[key])}`);
		});
		return t.join('&');
	}
	_fetch(url, options) {
		return util.fetch(url, options).then(result => {
			return result.json();
		});
	}
}
Object.assign(ZenzaWatch.api, {
  VideoInfoLoader,
  ThumbInfoLoader,
  MylistApiLoader,
  UploadedVideoApiLoader,
  CacheStorage,
  IchibaLoader,
  UaaLoader,
  PlaybackPosition,
  NicoVideoApi,
  RecommendAPILoader,
  NVWatchCaller,
  CommonsTreeLoader,
  NicoRssLoader,
  MatrixRankingLoader,
  NicoSearchApiV2Loader
});
ZenzaWatch.init.mylistApiLoader = MylistApiLoader;
ZenzaWatch.init.UploadedVideoApiLoader = UploadedVideoApiLoader;
/*
* アニメーション基準用の時間ゲッターとしてはperformance.now()よりWeb Animations APIのほうが優れている。
*/
class MediaTimeline {
	constructor(options = {}) {
		this.buffer = new (MediaTimeline.isSharable ? self.SharedArrayBuffer : ArrayBuffer)(Float32Array.BYTES_PER_ELEMENT * 100);
		this.fview = new Float32Array(this.buffer);
		this.iview = new Int32Array(this.buffer);
		const span = document.createElement('span');
		this.anime = span.animate ?
			span.animate([], {duration: 3 * 24 * 60 * 60 * 1000}) :
			{currentTime: 0, playbackRate: 1, paused: true};
		this.isWAAvailable = !!span.animate;
		this.interval = options.interval || 200;
		this.onTimer = this.onTimer.bind(this);
		this.onRaf = this.onRaf.bind(this);
		this.eventMap = this.initEventMap();
		this._isBusy = false;
		if (options.media) {
			this.attach(options.media);
		}
	}
	initEventMap() {
		const map = {
			'pause': e => {
				this.paused = true;
				this.currentTime = this.media.currentTime;
			},
			'play': e => {
				this.currentTime = this.media.currentTime;
				this.paused = false;
			},
			'seeked': e => {
				this.currentTime = this.media.currentTime;
			},
			'ratechange': e => {
				this.playbackRate = this.media.playbackRate;
				this.currentTime = this.media.currentTime;
			}
		};
		return objUtil.toMap(map);
	}
	attach(media) {
		if (this.media) {
			this.detach();
		}
		this.media = media;
		this.currentTime  = media.currentTime;
		this.playbackRate = media.playbackRate;
		this.duration     = media.duration;
		this.paused       = media.paused;
		this.timer = setInterval(this.onTimer, this.interval);
		for (const [eventName, handler] of this.eventMap) {
			media.addEventListener(eventName, handler, {passive: true});
		}
	}
	detach() {
		const media = this.media;
		for (const [eventName, handler] of this.eventMap) {
			media.removeEventListener(eventName, handler);
		}
		this.media = null;
		clearInterval(this.timer);
	}
	onTimer() {
		const media = this.media;
		const ac = this.anime.currentTime / 1000;
		const mc = media.currentTime;
		const diffMs = Math.abs(mc - ac) * 1000;
		if (!this.isWAAvailable || diffMs >= this.interval * 3 || media.paused !== this.paused) {
			this.currentTime  = mc;
			this.playbackRate = media.playbackRate;
			this.paused       = media.paused;
		}
	}
	onRaf() {
		if (this._isBusy) {
			this.raf = null;
			return;
		}
		this._isBusy = true;
		this.currentTime = Math.min(this.anime.currentTime / 1000, this.media.duration);
		this.timestamp = Math.round(performance.now() * 1000);
		if (!this.media.paused) {
			this.callRaf();
		} else {
			this.raf = null;
			this._isBusy = false;
		}
	}
	async callRaf() {
		await sleep.resolve;
		this.raf = requestAnimationFrame(this.onRaf);
		this._isBusy = false;
	}
	get timestamp() {
		return this.iview[MediaTimeline.MAP.timestamp];
	}
	set timestamp(v) {
		if (this.iview[MediaTimeline.MAP.timestamp] === v) { return; }
		if (MediaTimeline.isSharable) {
			Atomics.store(this.iview, MediaTimeline.MAP.timestamp, v);
			Atomics.notify(this.iview, MediaTimeline.MAP.timestamp);
		} else {
			this.iview[MediaTimeline.MAP.timestamp] = v;
		}
	}
	get currentTime() {
		return this.fview[MediaTimeline.MAP.currentTime];
	}
	set currentTime(v) {
		v = isNaN(v) ? 0 : v;
		if (this.fview[MediaTimeline.MAP.currentTime] !== v) {
			this.fview[MediaTimeline.MAP.currentTime] = v;
		}
		const ac = this.anime.currentTime / 1000;
		const diffMs = Math.abs(ac - v) * 1000;
		if (v === 0 || diffMs > 1000) {
			this.anime.currentTime = v * 1000;
		}
	}
	get duration() {
		return this.fview[MediaTimeline.MAP.duration];
	}
	set duration(v) {
		this.fview[MediaTimeline.MAP.duration] = v;
	}
	get playbackRate() {
		return this.fview[MediaTimeline.MAP.playbackRate];
	}
	set playbackRate(v) {
		this.fview[MediaTimeline.MAP.playbackRate] = v;
		(this.anime.playbackRate !== v) && (this.anime.playbackRate = v);
	}
	get paused() {
		return this.iview[MediaTimeline.MAP.paused] !== 0;
	}
	set paused(v) {
		this.iview[MediaTimeline.MAP.paused] = v ? 1 : 0;
		if (!this.isWAAvailable) { return; }
		if (v) {
			this.anime.pause();
			this.raf = cancelAnimationFrame(this.raf);
			this.timestamp = 0;
		} else {
			this.anime.play();
			if (!this.raf) {
				this.raf = requestAnimationFrame(this.onRaf);
			}
		}
	}
}
MediaTimeline.MAP = {
	currentTime: 0,
	duration: 1,
	playbackRate: 2,
	paused: 3,
	timestamp: 10
};
MediaTimeline.isSharable = ('SharedArrayBuffer' in self) && ('animate' in document.documentElement);
MediaTimeline.register = function(name = 'main', media = null) {
	if (!this.map.has(name)) {
		const mt = new MediaTimeline({media});
		this.map.set(name, mt);
		return mt;
	}
	const mt = this.map.get(name);
	media && mt.attach(media);
	return mt;
}.bind({map: new Map()});
MediaTimeline.get = name => MediaTimeline.register(name);
WatchInfoCacheDb.api(NicoVideoApi);
StoryboardCacheDb.api(NicoVideoApi);

const SmileStoryboardInfoLoader = (()=> {
	let parseStoryboard = ($storyboard, url) => {
		let id = $storyboard.attr('id') || '1';
		return {
			id,
			url: url.replace('sb=1', `sb=${id}`),
			thumbnail: {
				width: $storyboard.find('thumbnail_width').text(),
				height: $storyboard.find('thumbnail_height').text(),
				number: $storyboard.find('thumbnail_number').text(),
				interval: $storyboard.find('thumbnail_interval').text()
			},
			board: {
				rows: $storyboard.find('board_rows').text(),
				cols: $storyboard.find('board_cols').text(),
				number: $storyboard.find('board_number').text()
			}
		};
	};
	let parseXml = (xml, url) => {
		let $xml = util.$.html(xml), $storyboard = $xml.find('storyboard');
		if ($storyboard.length < 1) {
			return null;
		}
		let info = {
			format: 'smile',
			status: 'ok',
			message: '成功',
			url,
			movieId: $xml.find('movie').attr('id'),
			duration: $xml.find('duration').text(),
			storyboard: []
		};
		for (let i = 0, len = $storyboard.length; i < len; i++) {
			let sbInfo = parseStoryboard(util.$($storyboard[i]), url);
			info.storyboard.push(sbInfo);
		}
		info.storyboard.sort((a, b) => {
			let idA = parseInt(a.id.substr(1), 10), idB = parseInt(b.id.substr(1), 10);
			return (idA < idB) ? 1 : -1;
		});
		return info;
	};
	let load = videoFileUrl => {
		let a = document.createElement('a');
		a.href = videoFileUrl;
		let server = a.host;
		let search = a.search;
		if (!/\?(.)=(\d+)\.(\d+)/.test(search)) {
			return Promise.reject({status: 'fail', message: 'invalid url', url: videoFileUrl});
		}
		let fileType = RegExp.$1;
		let fileId = RegExp.$2;
		let key = RegExp.$3;
		if (fileType !== 'm') {
			return Promise.reject({status: 'fail', message: 'unknown file type', url: videoFileUrl});
		}
		return new Promise((resolve, reject) => {
			let url = '//' + server + '/smile?m=' + fileId + '.' + key + '&sb=1';
			util.fetch(url, {credentials: 'include'})
				.then(res => res.text())
				.then(result => {
					const info = parseXml(result, url);
					if (info) {
						resolve(info);
					} else {
						reject({
							status: 'fail',
							message: 'storyboard not exist (1)',
							result: result,
							url: url
						});
					}
				}).catch(err => {
				reject({
					status: 'fail',
					message: 'storyboard not exist (2)',
					result: err,
					url: url
				});
			});
		});
	};
	return {load};
})();
const StoryboardInfoLoader = {
	load: videoInfo => {
		if (!videoInfo.hasDmcStoryboard) {
			const url = videoInfo.storyboardUrl;
			return url ?
				StoryboardInfoLoader.load(url) :
				Promise.reject('smile storyboard api not exist');
		}
		const watchId = videoInfo.watchId;
		const info = videoInfo.dmcStoryboardInfo;
		const duration = videoInfo.duration;
		return VideoSessionWorker.storyboard(watchId, info, duration);
	}
};
// ZenzaWatch.api.DmcStoryboardInfoLoader = DmcStoryboardInfoLoader;
ZenzaWatch.api.StoryboardInfoLoader = StoryboardInfoLoader;

const {ThreadLoader} = (() => {
	const VERSION_OLD = '20061206';
	const VERSION     = '20090904';
	const FRONT_ID = '6';
	const FRONT_VER = '0';
	const LANG_CODE = {
		'en_us': 1,
		'zh_tw': 2
	};
	class ThreadLoader {
		constructor() {
			this._threadKeys = {};
		}
		getRequestCountByDuration(duration) {
			if (duration < 60)  { return 100; }
			if (duration < 240) { return 200; }
			if (duration < 300) { return 400; }
			return 1000;
		}
		getThreadKey(threadId, language = '', options = {}) {
			let url = `//flapi.nicovideo.jp/api/getthreadkey?thread=${threadId}`;
			let langCode = this.getLangCode(language);
			if (langCode) { url = `${url}&language_id=${langCode}`; }
			const headers = options.cookie ? {Cookie: options.cookie} : {};
			return netUtil.fetch(url, {
				method: 'POST',
				dataType: 'text',
				headers,
				credentials: 'include'
			}).then(res => res.text()).then(e => {
				const result = textUtil.parseQuery(e);
				this._threadKeys[threadId] = result;
				return result;
			}).catch(result => {
				return Promise.reject({
					result: result,
					message: `ThreadKeyの取得失敗 ${threadId}`
				});
			});
		}
		getLangCode(language = '') {
			language = language.replace('-', '_').toLowerCase();
			if (LANG_CODE[language]) {
				return LANG_CODE[language];
			}
			return 0;
		}
		getPostKey(threadId, blockNo, options = {}) {
			const url =
				`//flapi.nicovideo.jp/api/getpostkey?device=1&thread=${threadId}&block_no=${blockNo}&version=1&version_sub=2&yugi=`;
			console.log('getPostkey url: ', url);
			const headers = options.cookie ? {Cookie: options.cookie} : {};
			return netUtil.fetch(url, {
				method: 'POST',
				dataType: 'text',
				headers,
				credentials: 'include'
			}).then(res => res.text()).then(e => textUtil.parseQuery(e)).catch(result => {
				return Promise.reject({
					result,
					message: `PostKeyの取得失敗 ${threadId}`
				});
			});
		}
		buildPacketData(msgInfo, options = {}) {
			const packets = [];
			const resCount = this.getRequestCountByDuration(msgInfo.duration);
			const leafContent = `0-${Math.floor(msgInfo.duration / 60) + 1}:100,${resCount},nicoru:100`;
			const language = this.getLangCode(msgInfo.language);
			msgInfo.threads.forEach(thread => {
				if (!thread.isActive) { return; }
				const t = {
					thread: thread.id.toString(),
					user_id: msgInfo.userId > 0 ? msgInfo.userId.toString() : '', // 0の時は空文字
					language,
					nicoru: 3,
					scores: 1
				};
				if (thread.isThreadkeyRequired) {
					t.threadkey = msgInfo.threadKey[thread.id].key;
					t.force_184 = msgInfo.threadKey[thread.id].force184 ? '1' : '0';
				}
				if (msgInfo.when > 0) {
					t.when = msgInfo.when;
				}
				if (thread.fork) {
					t.fork = thread.fork;
				}
				if (options.resFrom > 0) {
					t.res_from = options.resFrom;
				}
				if (!t.threadkey /*&& !t.waybackkey*/ && msgInfo.userKey) {
					t.userkey = msgInfo.userKey;
				}
				if (t.fork || thread.isLeafRequired === false) { // 投稿者コメントなど
					packets.push({thread: Object.assign({with_global: 1, version: VERSION_OLD, res_from: -1000}, t)});
				} else {
					packets.push({thread: Object.assign({with_global: 1, version: VERSION}, t)});
					packets.push({thread_leaves: Object.assign({content: leafContent}, t)});
				}
			});
			return packets;
		}
		buildPacket(msgInfo, options = {}) {
			const data = this.buildPacketData(msgInfo);
			if (options.format !== 'xml') {
				return JSON.stringify(data);
			}
			const packet = document.createElement('packet');
			data.forEach(d => {
				const t = document.createElement(d.thread ? 'thread' : 'thread_leaves');
				const thread = d.thread ? d.thread : d.thread_leaves;
				Object.keys(thread).forEach(attr => {
					if (attr === 'content') {
						t.textContent = thread[attr];
						return;
					}
					t.setAttribute(attr, thread[attr]);
				});
				packet.append(t);
			});
			return packet.outerHTML;
		}
		_post(server, body, options = {}) {
			const url = server;
			return netUtil.fetch(url, {
				method: 'POST',
				dataType: 'text',
				headers: {'Content-Type': 'text/plain; charset=UTF-8'},
				body
			}).then(res => {
				if (options.format !== 'xml') {
					return res.json();
				}
				return res.text().then(text => {
					if (DOMParser) {
						return new DOMParser().parseFromString(text, 'application/xml');
					}
					return (new JSDOM(text)).window.document;
				});
			}).catch(result => {
				return Promise.reject({
					result,
					message: `コメントの通信失敗 server: ${server}`
				});
			});
		}
		_load(msgInfo, options = {}) {
			let packet;
			const language = msgInfo.language;
			msgInfo.threadKey = msgInfo.threadKey || {};
			const loadThreadKey = threadId => {
				if (msgInfo.threadKey[threadId]) { return; }
				msgInfo.threadKey[threadId] = {};
				return this.getThreadKey(threadId, language, options).then(info => {
					console.log('threadKey: ', threadId, info);
					msgInfo.threadKey[threadId] = {key: info.threadkey, force184: info.force_184};
				});
			};
			const loadThreadKeys = () =>
				Promise.all(msgInfo.threads.filter(t => t.isThreadkeyRequired).map(t => loadThreadKey(t.id)));
			return Promise.all([loadThreadKeys()]).then(() => {
				const format = options.format === 'xml' ? 'xml' : 'json';
				let server = format === 'json' ? msgInfo.server.replace('/api/', '/api.json/') : msgInfo.server;
				server = server.replace(/^http:/, '');
				packet = this.buildPacket(msgInfo, format);
				console.log('post packet...', server, packet);
				return this._post(server, packet, format);
			});
		}
		load(msgInfo, options = {}) {
			const server   = msgInfo.server;
			const threadId = msgInfo.threadId;
			const userId   = msgInfo.userId;
			const timeKey = `loadComment server: ${server} thread: ${threadId}`;
			console.time(timeKey);
			const onSuccess = result => {
				console.timeEnd(timeKey);
				debug.lastMessageServerResult = result;
				const format = 'array';
				let thread, totalResCount = 0;
				let resultCode = null;
				try {
					let threads = result.filter(t => t.thread).map(t => t.thread);
					let lastId = null;
					Array.from(threads).forEach(t => {
						let id = parseInt(t.thread, 10);
						let fork = t.fork || 0;
						if (lastId === id || fork) {
							return;
						}
						lastId = id;
						msgInfo[id] = thread;
						if (parseInt(id, 10) === parseInt(threadId, 10)) {
							thread = t;
							resultCode = t.resultcode;
						}
						if (!isNaN(t.last_res) && !fork) { // 投稿者コメントはカウントしない
							totalResCount += t.last_res;
						}
					});
				} catch (e) {
					console.error(e);
				}
				if (resultCode !== 0) {
					console.log('comment fail:\n', result);
					return Promise.reject({
						message: `コメント取得失敗[${resultCode}]`
					});
				}
				const last_res = isNaN(thread.last_res) ? 0 : thread.last_res * 1;
				const threadInfo = {
					server,
					userId,
					resultCode,
					threadId,
					thread:     thread.thread,
					serverTime: thread.server_time,
					force184:   msgInfo.defaultThread.isThreadkeyRequired ? '1' : '0',
					lastRes:    last_res,
					totalResCount,
					blockNo:    Math.floor((last_res + 1) / 100),
					ticket:     thread.ticket || '0',
					revision:   thread.revision,
					language:   msgInfo.language,
					when:       msgInfo.when,
					isWaybackMode: !!msgInfo.when
				};
				msgInfo.threadInfo = threadInfo;
				console.log('threadInfo: ', threadInfo);
				return Promise.resolve({resultCode, threadInfo, body: result, format});
			};
			const onFailFinally = e => {
				console.timeEnd(timeKey);
				window.console.error('loadComment fail finally: ', e);
				return Promise.reject({
					message: 'コメントサーバーの通信失敗: ' + server
				});
			};
			const onFail1st = e => {
				console.timeEnd(timeKey);
				window.console.error('loadComment fail 1st: ', e);
				PopupMessage.alert('コメントの取得失敗: 3秒後にリトライ');
				return sleep(3000).then(() => this._load(msgInfo, options).then(onSuccess).catch(onFailFinally));
			};
			return this._load(msgInfo, options).then(onSuccess).catch(onFail1st);
		}
		async _postChat(threadInfo, postkey, text, cmd, vpos) {
			const packet = JSON.stringify([{chat: {
				content: text,
				mail: cmd || '',
				vpos: vpos || 0,
				premium: util.isPremium() ? 1 : 0,
				postkey,
				user_id: threadInfo.userId.toString(),
				ticket: threadInfo.ticket,
				thread: threadInfo.threadId.toString()
			}}]);
			console.log('post packet: ', packet);
			const server = threadInfo.server.replace('/api/', '/api.json/');
			const result = await this._post(server, packet, 'json');
			let status = null, chat_result, no = 0, blockNo = 0;
			try {
				chat_result = result.find(t => t.chat_result).chat_result;
				status = chat_result.status * 1;
				no = parseInt(chat_result.no, 10);
				blockNo = Math.floor((no + 1) / 100);
			} catch (e) {
				console.error(e);
			}
			if (status === 0) {
				return {
					status: 'ok',
					no,
					blockNo,
					code: status,
					message: 'コメント投稿成功'
				};
			}
			return Promise.reject({
				status: 'fail',
				no,
				blockNo,
				code: status,
				message: `コメント投稿失敗 status: ${status} server: ${threadInfo.server}`
			});
		}
		async postChat(msgInfo, text, cmd, vpos, lang) {
			const threadInfo = msgInfo.threadInfo;
			const tk = await this.getPostKey(threadInfo.threadId, threadInfo.blockNo, lang);
			const postkey = tk.postkey;
			let result = await this._postChat(threadInfo, postkey, text, cmd, vpos, lang).catch(r => r);
			if (result.status === 'ok') {
				return result;
			}
			const errorCode = parseInt(result.code, 10);
			if (errorCode === 3) { // ticket fail
				await this.load(msgInfo);
			} else if (![2, 4, 5].includes(errorCode)) { // リカバー不能系
				return Promise.reject(result);
			}
			await sleep(3000);
			result = await this._postChat(threadInfo, postkey, text, cmd, vpos, lang).catch(r => r);
			return result.status === 'ok' ? result : Promise.reject(result);
		}
		getNicoruKey(threadId, langCode = 0, options = {}) {
			const url =
				`https://nvapi.nicovideo.jp/v1/nicorukey?language=${langCode}&threadId=${threadId}`;
			console.log('getNicorukey url: ', url);
			const headers = options.cookie ? {Cookie: options.cookie} : {};
			Object.assign(headers, {
				'X-Frontend-Id': FRONT_ID,
				});
			return netUtil.fetch(url, {
				headers,
				credentials: 'include'
			}).then(res => res.json())
				.then(js => {
					if (js.meta.status === 200) {
						return js.data;
					}
					return Promise.reject({status: js.meta.status});
				}).catch(result => {
				return Promise.reject({
					result,
					message: `NicoruKeyの取得失敗 ${threadId}`
				});
			});
		}
		async nicoru(msgInfo, chat) {
			const threadInfo = msgInfo.threadInfo;
			const language = this.getLangCode(msgInfo.language);
			const {nicorukey} = await this.getNicoruKey(chat.threadId, language);
			const server = threadInfo.server.replace('/api/', '/api.json/');
			const body = JSON.stringify({nicoru:{
				content: chat.text,
				fork: chat.fork || 0,
				id: chat.no.toString(),
				language,
				nicorukey,
				postdate: `${chat.date}.${chat.dateUsec}`,
				premium: nicoUtil.isPremium() ? 1 : 0,
				thread: chat.threadId.toString(),
				user_id: msgInfo.userId.toString()
			}});
			const result = await this._post(server, body);
			const [{nicoru_result: {status}}] = result;
			if (status === 4) {
				return Promise.reject({status, message: 'ニコり済みだった'});
			} else if (status !== 0) {
				return Promise.reject({status, message: `ニコれなかった＞＜ (status:${status})`});
			}
			return result;
		}
	}
	return {ThreadLoader: new ThreadLoader};
})();

const {YouTubeWrapper} = (() => {
	const STATE_PLAYING = 1;
	class YouTubeWrapper extends Emitter {
		constructor({parentNode, autoplay = true, volume = 0.3, playbackRate = 1, loop = false}) {
			super();
			this._isInitialized = false;
			this._parentNode = parentNode;
			this._autoplay = autoplay;
			this._volume = volume;
			this._playbackRate = playbackRate;
			this._loop = loop;
			this._startDiff = 0;
			this._isSeeking = false;
			this._seekTime = 0;
			this._onSeekEnd = _.debounce(this._onSeekEnd.bind(this), 500);
		}
		async setSrc(url, startSeconds = 0) {
			this._src = url;
			this._videoId = this._parseVideoId(url);
			this._canPlay = false;
			this._isSeeking = false;
			this._seekTime = 0;
			const player = this._player;
			const isFirst = !!player ? false : true;
			const urlParams = this._parseUrlParams(url);
			this._startDiff = /[0-9]+s/.test(urlParams.t) ? parseInt(urlParams.t) : 0;
			startSeconds += this._startDiff;
			if (isFirst && !url) {
				return Promise.resolve();
			}
			if (isFirst) {
				return this._initPlayer(this._videoId, startSeconds);//.then(({player}) => {
			}
			if (!url) {
				player.stopVideo();
				return;
			}
			player.loadVideoById({
				videoId: this._videoId,
				startSeconds: startSeconds
			});
			player.loadPlaylist({list: [this._videoId]});
		}
		set src(v) {
			this.setSrc(v);
		}
		get src() {
			return this._src;
		}
		_parseVideoId(url) {
			const videoId = (() => {
				const a = textUtil.parseUrl(url);
				if (a.hostname === 'youtu.be') {
					return a.pathname.substring(1);
				} else {
					return textUtil.parseQuery(a.search).v;
				}
			})();
			if (!videoId) {
				return videoId;
			}
			return videoId
				.replace(/[?[\]()"'@]/g, '')
				.replace(/<[a-z0-9]*>/, '');
		}
		_parseUrlParams(url) {
			const a = textUtil.parseUrl(url);
			return a.search.startsWith('?') ? textUtil.parseQuery(a.search) : {};
		}
		async _initPlayer(videoId, startSeconds = 0) {
			if (this._player) {
				return {player: this._player};
			}
			const YT = await this._initYT();
			const {player} = await new Promise(resolve => {
				this._player = new YT.Player(
					this._parentNode, {
						videoId,
						events: {
							onReady: () => resolve({player: this._player}),
							onStateChange: this._onPlayerStateChange.bind(this),
							onPlaybackQualityChange: e => window.console.info('video quality: ', e.data),
							onError: e => this.emit('error', e)
						},
						playerVars: {
							autoplay: this.autoplay ? 0 : 1,
							volume: this._volume * 100,
							start: startSeconds,
							fs: 0,
							loop: 0,
							controls: 1,
							disablekb: 1,
							modestbranding: 0,
							playsinline: 1,
							rel: 0,
							showInfo: 1
						}
					});
			});
			this._onPlayerReady();
		}
		async _initYT() {
			if (window.YT) {
				return window.YT;
			}
			return new Promise(resolve => {
				if (window.onYouTubeIframeAPIReady) {
					window.onYouTubeIframeAPIReady_ = window.onYouTubeIframeAPIReady;
				}
				window.onYouTubeIframeAPIReady = () => {
					if (window.onYouTubeIframeAPIReady_) {
						window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady_;
					}
					resolve(window.YT);
				};
				const tag = document.createElement('script');
				tag.src = 'https://www.youtube.com/iframe_api';
				document.head.append(tag);
			});
		}
		_onPlayerReady() {
			this.emitAsync('loadedMetaData');
		}
		_onPlayerStateChange(e) {
			const state = e.data;
			this.playerState = state;
			const YT = window.YT;
			switch (state) {
				case YT.PlayerState.ENDED:
					if (this._loop) {
						this.currentTime = 0;
						this.play();
					} else {
						this.emit('ended');
					}
					break;
				case YT.PlayerState.PLAYING:
					if (!this._canPlay) {
						this._canPlay = true;
						this.muted = this._muted;
						this.emit('loadedmetadata');
						this.emit('canplay');
					}
					this.emit('play');
					this.emit('playing');
					if (this._isSeeking) {
						this.emit('seeked');
					}
					break;
				case YT.PlayerState.PAUSED:
					this.emit('pause');
					break;
				case YT.PlayerState.BUFFERING:
					break;
				case YT.PlayerState.CUED:
					break;
			}
		}
		play() {
			this._player.playVideo();
			return Promise.resolve(); // 互換のため
		}
		pause() {
			this._player.pauseVideo();
		}
		get paused() {
			return window.YT ?
				this.playerState !== window.YT.PlayerState.PLAYING : true;
		}
		selectBestQuality() {
			const levels = this._player.getAvailableQualityLevels();
			const best = levels[0];
			this._player.pauseVideo();
			this._player.setPlaybackQuality(best);
			this._player.playVideo();
			window.console.info('bestQuality', {levels, best, current: this._player.getPlaybackQuality()});
		}
		_onSeekEnd() {
			this._isSeeking = false;
			this._player.seekTo(this._seekTime + this._startDiff);
		}
		set currentTime(v) {
			this._isSeeking = true;
			this._seekTime = Math.max(0, Math.min(v, this.duration));
			this._onSeekEnd();
			this.emit('seeking');
		}
		get currentTime() {
			const now = performance.now();
			if (this._isSeeking) {
				this._lastTime = now;
				return this._seekTime;
			}
			const state = this._player.getPlayerState();
			const currentTime = this._player.getCurrentTime() + this._startDiff;
			if (state !== STATE_PLAYING || this._lastCurrentTime !== currentTime) {
				this._lastCurrentTime = currentTime;
				this._lastTime = now;
				return currentTime;
			}
			const timeDiff = (now - this._lastTime) * this.playbackRate / 1000000;
			this._lastCurrentTime = Math.min(currentTime, this.duration);
			return currentTime + timeDiff;
		}
		get duration() {
			return this._player.getDuration() - this._startDiff;
		}
		set muted(v) {
			if (v) {
				this._player.mute();
			} else {
				this._player.unMute();
			}
			this._muted = !!v;
		}
		get muted() {
			return this._player.isMuted();
		}
		set volume(v) {
			if (this._volume !== v) {
				this._volume = v;
				this._player.setVolume(v * 100);
				this.emit('volumeChange', v);
			}
		}
		get volume() {
			return this._volume;
		}
		set playbackRate(v) {
			if (this._playbackRate !== v) {
				this._playbackRate = v;
				this._player.setPlaybackRate(v);
			}
		}
		get playbackRate() {
			return this._playbackRate;
		}
		set loop(v) {
			if (this._loop !== v) {
				this._loop = v;
				this._player.setLoop(v);
			}
		}
		get loop() {
			return this._loop;
		}
		get _state() {
			return this._player.getPlayerState();
		}
		get playing() {
			return this._state === 1;
		}
		get videoWidth() {
			return 1280;
		}
		get videoHeight() {
			return 720;
		}
		getAttribute(k) {
			return this[k];
		}
		removeAttribute() {
		}
	}
	return {YouTubeWrapper};
})();
global.debug.YouTubeWrapper = YouTubeWrapper;

class NicoVideoPlayer extends Emitter {
	constructor(params) {
		super();
		this.initialize(params);
	}
	initialize(params) {
		let conf = this._playerConfig = params.playerConfig;
		this._fullscreenNode = params.fullscreenNode;
		this._state = params.playerState;
		this._state.onkey('videoInfo', this.setVideoInfo.bind(this));
		const playbackRate = conf.props.playbackRate;
		const onCommand = (command, param) => this.emit('command', command, param);
		this._videoPlayer = new VideoPlayer({
			volume: conf.props.volume,
			loop: conf.props.loop,
			mute: conf.props.mute,
			autoPlay: conf.props.autoPlay,
			playbackRate,
			debug: conf.props.debug
		});
		this._videoPlayer.on('command', onCommand);
		this._commentPlayer = new NicoCommentPlayer({
			filter: {
				enableFilter: conf.props.enableFilter,
				wordFilter: conf.props.wordFilter,
				wordRegFilter: conf.props.wordRegFilter,
				wordRegFilterFlags: conf.props.wordRegFilterFlags,
				userIdFilter: conf.props.userIdFilter,
				commandFilter: conf.props.commandFilter,
				removeNgMatchedUser: conf.props.removeNgMatchedUser,
				fork0: conf.props['filter.fork0'],
				fork1: conf.props['filter.fork1'],
				fork2: conf.props['filter.fork2'],
				sharedNgLevel: conf.props.sharedNgLevel
			},
			showComment: conf.props.showComment,
			debug: conf.props.debug,
			playbackRate,
		});
		this._commentPlayer.on('command', onCommand);
		this._contextMenu = new ContextMenu({
			parentNode: params.node.length ? params.node[0] : params.node,
			playerState: this._state
		});
		this._contextMenu.on('command', onCommand);
		if (params.node) {
			this.appendTo(params.node);
		}
		this._initializeEvents();
		this._onTimer = this._onTimer.bind(this);
		this._beginTimer();
		global.debug.nicoVideoPlayer = this;
	}
	_beginTimer() {
		this._stopTimer();
		this._videoWatchTimer =
			self.setInterval(this._onTimer, 100);
	}
	_stopTimer() {
		if (!this._videoWatchTimer) {
			return;
		}
		self.clearInterval(this._videoWatchTimer);
		this._videoWatchTimer = null;
	}
	_initializeEvents() {
		const eventBridge = function(...args) {
			this.emit(...args);
		};
		this._videoPlayer.on('volumeChange', this._onVolumeChange.bind(this));
		this._videoPlayer.on('dblclick', this._onDblClick.bind(this));
		this._videoPlayer.on('aspectRatioFix', this._onAspectRatioFix.bind(this));
		this._videoPlayer.on('play', this._onPlay.bind(this));
		this._videoPlayer.on('playing', this._onPlaying.bind(this));
		this._videoPlayer.on('seeking', this._onSeeking.bind(this));
		this._videoPlayer.on('seeked', this._onSeeked.bind(this));
		this._videoPlayer.on('stalled', eventBridge.bind(this, 'stalled'));
		this._videoPlayer.on('timeupdate', eventBridge.bind(this, 'timeupdate'));
		this._videoPlayer.on('waiting', eventBridge.bind(this, 'waiting'));
		this._videoPlayer.on('progress', eventBridge.bind(this, 'progress'));
		this._videoPlayer.on('pause', this._onPause.bind(this));
		this._videoPlayer.on('ended', this._onEnded.bind(this));
		this._videoPlayer.on('loadedMetaData', this._onLoadedMetaData.bind(this));
		this._videoPlayer.on('canPlay', this._onVideoCanPlay.bind(this));
		this._videoPlayer.on('durationChange', eventBridge.bind(this, 'durationChange'));
		this._videoPlayer.on('playerTypeChange', eventBridge.bind(this, 'videoPlayerTypeChange'));
		this._videoPlayer.on('buffercomplete', eventBridge.bind(this, 'buffercomplete'));
		this._videoPlayer.on('mouseWheel',
			_.throttle(this._onMouseWheel.bind(this), 50));
		this._videoPlayer.on('abort', eventBridge.bind(this, 'abort'));
		this._videoPlayer.on('error', eventBridge.bind(this, 'error'));
		this._videoPlayer.on('click', this._onClick.bind(this));
		this._videoPlayer.on('contextMenu', this._onContextMenu.bind(this));
		this._commentPlayer.on('parsed', eventBridge.bind(this, 'commentParsed'));
		this._commentPlayer.on('change', eventBridge.bind(this, 'commentChange'));
		this._commentPlayer.on('filterChange', eventBridge.bind(this, 'commentFilterChange'));
		this._state.on('update', this._onPlayerStateUpdate.bind(this));
	}
	_onVolumeChange(vol, mute) {
		this._playerConfig.props.volume = vol;
		this._playerConfig.props.mute = mute;
		this.emit('volumeChange', vol, mute);
	}
	_onPlayerStateUpdate(key, value) {
		switch (key) {
			case 'isLoop':
				this._videoPlayer.isLoop=value;
				break;
			case 'playbackRate':
				this._videoPlayer.playbackRate=value;
				this._commentPlayer.playbackRate=value;
				break;
			case 'isAutoPlay':
				this._videoPlayer.isAutoPlay=value;
				break;
			case 'isShowComment':
				if (value) {
					this._commentPlayer.show();
				} else {
					this._commentPlayer.hide();
				}
				break;
			case 'isMute':
				this._videoPlayer.muted = value;
				break;
			case 'sharedNgLevel':
				this.filter.sharedNgLevel = value;
				break;
			case 'currentSrc':
				this.setVideo(value);
				break;
		}
	}
	_onMouseWheel(e, delta) {
		if (delta > 0) { // up
			this.volumeUp();
		} else {         // down
			this.volumeDown();
		}
	}
	volumeUp() {
		const v = Math.max(0.01, this._videoPlayer.volume);
		const r = v < 0.05 ? 1.3 : 1.1;
		this._videoPlayer.volume = Math.max(0, v * r);
	}
	volumeDown() {
		const v = this._videoPlayer.volume;
		const r = 1 / 1.2;
		this._videoPlayer.volume =  v * r;
	}
	_onTimer() {
		this._commentPlayer.currentTime = this._videoPlayer.currentTime;
	}
	_onAspectRatioFix(ratio) {
		this._commentPlayer.setAspectRatio(ratio);
		this.emit('aspectRatioFix', ratio);
	}
	_onLoadedMetaData() {
		this.emit('loadedMetaData');
	}
	_onVideoCanPlay() {
		this.emit('canPlay');
		if (this.autoplay && !this.paused) {
			this._video.play().catch(err => {
				if (err instanceof DOMException) {
					if (err.code === 35 /* NotAllowedError */) {
						this.dispatchEvent(new CustomEvent('autoplay-rejected'));
					}
				}
			});
		}
	}
	_onPlay() {
		this._isPlaying = true;
		this.emit('play');
	}
	_onPlaying() {
		this._isPlaying = true;
		this.emit('playing');
	}
	_onSeeking() {
		this._isSeeking = true;
		this.emit('seeking');
	}
	_onSeeked() {
		this._isSeeking = false;
		this.emit('seeked');
	}
	_onPause() {
		this._isPlaying = false;
		this.emit('pause');
	}
	_onEnded() {
		this._isPlaying = false;
		this._isEnded = true;
		this.emit('ended');
	}
	_onClick() {
		this._contextMenu.hide();
	}
	_onDblClick() {
		if (this._playerConfig.props.enableFullScreenOnDoubleClick) {
			this.toggleFullScreen();
		}
	}
	_onContextMenu(e) {
		if (!this._contextMenu.isOpen) {
			e.stopPropagation();
			e.preventDefault();
			this._contextMenu.show(e.clientX, e.clientY);
		}
	}
	setVideo(url) {
		let e = {src: url, url: null, promise: null};
		global.emitter.emit('beforeSetVideo', e);
		if (e.url) {
			url = e.url;
		}
		if (e.promise) {
			return e.promise.then(url => {
				this._videoPlayer.setSrc(url);
				this._isEnded = false;
			});
		}
		this._videoPlayer.setSrc(url);
		this._isEnded = false;
		this._isSeeking = false;
	}
	setThumbnail(url) {
		this._videoPlayer.thumbnail = url;
	}
	play() {
		return this._videoPlayer.play();
	}
	pause() {
		this._videoPlayer.pause();
		return Promise.resolve();
	}
	togglePlay() {
		return this._videoPlayer.togglePlay();
	}
	setPlaybackRate(playbackRate) {
		playbackRate = Math.max(0, Math.min(playbackRate, 10));
		this._videoPlayer.playbackRate = playbackRate;
		this._commentPlayer.setPlaybackRate(playbackRate);
	}
	fastSeek(t) {this._videoPlayer.fastSeek(Math.max(0, t));}
	set currentTime(t) {this._videoPlayer.currentTime = Math.max(0, t);}
	get currentTime() { return this._videoPlayer.currentTime;}
	get vpos() { return this.currentTime * 100; }
	get duration() {return this._videoPlayer.duration;}
	get chatList() {return this._commentPlayer.chatList;}
	get nonFilteredChatList() {return this._commentPlayer.nonFilteredChatList;}
	appendTo(node) {
		node = util.$(node)[0];
		this._parentNode = node;
		this._videoPlayer.appendTo(node);
		this._commentPlayer.appendTo(node);
	}
	close() {
		this._videoPlayer.close();
		this._commentPlayer.close();
	}
	closeCommentPlayer() {
		this._commentPlayer.close();
	}
	toggleFullScreen() {
		if (Fullscreen.now()) {
			Fullscreen.cancel();
		} else {
			this.requestFullScreen();
		}
	}
	requestFullScreen() {
		Fullscreen.request(this._fullscreenNode || this._parentNode);
	}
	canPlay() {
		return this._videoPlayer.canPlay();
	}
	get isPlaying() {
		return !!this._isPlaying;
	}
	get paused() {
		return this._videoPlayer.paused;
	}
	get isSeeking() {
		return !!this._isSeeking;
	}
	get bufferedRange() {return this._videoPlayer.bufferedRange;}
	addChat(text, cmd, vpos, options) {
		if (!this._commentPlayer) {
			return;
		}
		const nicoChat = this._commentPlayer.addChat(text, cmd, vpos, options);
		console.log('addChat:', text, cmd, vpos, options, nicoChat);
		return nicoChat;
	}
	get filter() {return this._commentPlayer.filter;}
	get videoInfo() {return this._videoInfo;}
	set videoInfo(info) {this._videoInfo = info;}
	getMymemory() {return this._commentPlayer.getMymemory();}
	getScreenShot() {
		window.console.time('screenShot');
		const fileName = this._getSaveFileName();
		const video = this._videoPlayer.videoElement;
		return VideoCaptureUtil.videoToCanvas(video).then(({canvas}) => {
			VideoCaptureUtil.saveToFile(canvas, fileName);
			window.console.timeEnd('screenShot');
		});
	}
	getScreenShotWithComment() {
		window.console.time('screenShotWithComment');
		const fileName = this._getSaveFileName({suffix: 'C'});
		const video = this._videoPlayer.videoElement;
		const html = this._commentPlayer.getCurrentScreenHtml();
		return VideoCaptureUtil.nicoVideoToCanvas({video, html}).then(({canvas}) => {
			VideoCaptureUtil.saveToFile(canvas, fileName);
			window.console.timeEnd('screenShotWithComment');
		});
	}
	_getSaveFileName({suffix = ''} = {}) {
		const title = this._videoInfo.title;
		const watchId = this._videoInfo.watchId;
		const currentTime = this._videoPlayer.currentTime;
		const time = util.secToTime(currentTime).replace(':', '_');
		const prefix = Config.props['screenshot.prefix'] || '';
		return `${prefix}${title} - ${watchId}@${time}${suffix}.png`;
	}
	get isCorsReady() {return this._videoPlayer && this._videoPlayer.isCorsReady;}
	get volume() { return this._videoPlayer.volume;}
	set volume(v) {this._videoPlayer.volume = v;}
	getDuration() {return this._videoPlayer.duration;}
	getChatList() {return this._commentPlayer.chatList;}
	getVpos() {return Math.floor(this._videoPlayer.currentTime * 100);}
	setComment(xmlText, options) {this._commentPlayer.setComment(xmlText, options);}
	getNonFilteredChatList() {return this._commentPlayer.nonFilteredChatList;}
	getBufferedRange() {return this._videoPlayer.bufferedRange;}
	setVideoInfo(v) { this.videoInfo = v; }
	getVideoInfo() { return this.videoInfo; }
}
class ContextMenu extends BaseViewComponent {
	constructor({parentNode, playerState}) {
		super({
			parentNode,
			name: 'VideoContextMenu',
			template: ContextMenu.__tpl__,
			css: ContextMenu.__css__
		});
		this._playerState = playerState;
		this._state = {
			isOpen: false
		};
		this._bound.onBodyClick = this.hide.bind(this);
	}
	_initDom(...args) {
		super._initDom(...args);
		global.debug.contextMenu = this;
		const onMouseDown = this._bound.onMouseDown = this._onMouseDown.bind(this);
		this._bound.onBodyMouseUp = this._onBodyMouseUp.bind(this);
		this._bound.onRepeat = this._onRepeat.bind(this);
		this._view.classList.toggle('is-pictureInPictureEnabled', document.pictureInPictureEnabled);
		this._view.addEventListener('mousedown', onMouseDown);
		this._isFirstShow = true;
		this._view.addEventListener('contextmenu', (e) => {
			setTimeout(() => {
				this.hide();
			}, 100);
			e.preventDefault();
			e.stopPropagation();
		});
	}
	_onClick(e) {
		if (e && e.button !== 0) {
			return;
		}
		if (e.type !== 'mousedown') {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		e.stopPropagation();
		super._onClick(e);
	}
	_onMouseDown(e) {
		if (e.target && e.target.getAttribute('data-is-no-close') === 'true') {
			e.stopPropagation();
			this._onClick(e);
		} else if (e.target && e.target.getAttribute('data-repeat') === 'on') {
			e.stopPropagation();
			this._onClick(e);
			this._beginRepeat(e);
		} else {
			e.stopPropagation();
			this._onClick(e);
			setTimeout(() => {
				this.hide();
			}, 100);
		}
	}
	_onBodyMouseUp() {
		this._endRepeat();
	}
	_beginRepeat(e) {
		this._repeatEvent = e;
		document.body.addEventListener('mouseup', this._bound.onBodyMouseUp);
		this._repeatTimer = window.setInterval(this._bound.onRepeat, 200);
		this._isRepeating = true;
	}
	_endRepeat() {
		this._repeatEvent = null;
		if (this._repeatTimer) {
			window.clearInterval(this._repeatTimer);
			this._repeatTimer = null;
		}
		document.body.removeEventListener('mouseup', this._bound.onBodyMouseUp);
	}
	_onRepeat() {
		if (!this._isRepeating) {
			this._endRepeat();
			return;
		}
		if (this._repeatEvent) {
			this._onClick(this._repeatEvent);
		}
	}
	show(x, y) {
		document.body.addEventListener('click', this._bound.onBodyClick);
		const view = this._view;
		this._onBeforeShow(x, y);
		view.style.left =
			cssUtil.px(Math.max(0, Math.min(x, global.innerWidth - view.offsetWidth)));
		view.style.top =
			cssUtil.px(Math.max(0, Math.min(y + 20, global.innerHeight - view.offsetHeight)));
		this.setState({isOpen: true});
		global.emitter.emitAsync('showMenu');
	}
	hide() {
		document.body.removeEventListener('click', this._bound.onBodyClick);
		util.$(this._view).css({left: '', top: ''});
		this._endRepeat();
		this.setState({isOpen: false});
		global.emitter.emitAsync('hideMenu');
	}
	get isOpen() {
		return this._state.isOpen;
	}
	_onBeforeShow() {
		const pr = parseFloat(this._playerState.playbackRate, 10);
		const view = util.$(this._view);
		view.find('.selected').removeClass('selected');
		view.find('.playbackRate').forEach(elm => {
			const p = parseFloat(elm.dataset.param, 10);
			if (Math.abs(p - pr) < 0.01) {
				elm.classList.add('selected');
			}
		});
		view.find('[data-config]').forEach(menu => {
			const name = menu.dataset.config;
			menu.classList.toggle('selected', !!global.config.props[name]);
		});
		view.find('.seekToResumePoint')
			.css('display', this._playerState.videoInfo.initialPlaybackTime > 0 ? '' : 'none');
		if (this._isFirstShow) {
			this._isFirstShow = false;
			const handler = (command, param) => {
				this.emit('command', command, param);
			};
			global.emitter.emitAsync('videoContextMenu.addonMenuReady',
				view.find('.empty-area-top'), handler
			);
			global.emitter.emitAsync('videoContextMenu.addonMenuReady.list',
				view.find('.listInner ul'), handler
			);
			global.emitter.emitResolve('videoContextMenu.addonMenuReady',
				{container: view.find('.empty-area-top'), handler}
			);
			global.emitter.emitResolve('videoContextMenu.addonMenuReady.list',
				{container: view.find('.listInner ul'), handler}
			);
		}
	}
}
ContextMenu.__css__ = (`
	.zenzaPlayerContextMenu {
		position: fixed;
		background: rgba(255, 255, 255, 0.8);
		overflow: visible;
		padding: 8px;
		border: 1px outset #333;
		box-shadow: 2px 2px 4px #000;
		transition: opacity 0.3s ease;
		min-width: 200px;
		z-index: 150000;
		user-select: none;
		color: #000;
	}
	.zenzaPlayerContextMenu.is-Open {
		display: block;
		opacity: 0.5;
	}
	.zenzaPlayerContextMenu.is-Open:hover {
		opacity: 1;
	}
	.is-fullscreen .zenzaPlayerContextMenu {
		position: absolute;
	}
	.zenzaPlayerContextMenu:not(.is-Open) {
		display: none;
		/*left: -9999px;
		top: -9999px;
		opacity: 0;*/
	}
	.zenzaPlayerContextMenu ul {
		padding: 0;
		margin: 0;
	}
	.zenzaPlayerContextMenu ul li {
		position: relative;
		line-height: 120%;
		margin: 2px;
		overflow-y: visible;
		white-space: nowrap;
		cursor: pointer;
		padding: 2px 14px;
		list-style-type: none;
		float: inherit;
	}
	.is-playlistEnable .zenzaPlayerContextMenu li.togglePlaylist:before,
	.is-flipV          .zenzaPlayerContextMenu li.toggle-flipV:before,
	.is-flipH          .zenzaPlayerContextMenu li.toggle-flipH:before,
	.zenzaPlayerContextMenu ul                 li.selected:before {
		content: '✔';
		left: -10px;
		color: #000 !important;
		position: absolute;
	}
	.zenzaPlayerContextMenu ul li:hover {
		background: #336;
		color: #fff;
	}
	.zenzaPlayerContextMenu ul li.separator {
		border: 1px outset;
		height: 2px;
		width: 90%;
	}
	.zenzaPlayerContextMenu.show {
		opacity: 0.8;
	}
	.zenzaPlayerContextMenu .listInner {
	}
	.zenzaPlayerContextMenu .controlButtonContainer {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 110%;
		transform: translate(-50%, 0);
		white-space: nowrap;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex {
		display: flex;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton {
		flex: 1;
		height: 48px;
		font-size: 24px;
		line-height: 46px;
		border: 1px solid;
		border-radius: 4px;
		color: #333;
		background: rgba(192, 192, 192, 0.95);
		cursor: pointer;
		transition: transform 0.1s, box-shadow 0.1s;
		box-shadow: 0 0 0;
		opacity: 1;
		margin: auto;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.screenShot {
		flex: 1;
		font-size: 24px;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.playbackRate {
		flex: 2;
		font-size: 14px;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.rate010,
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.rate100,
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.rate200 {
		flex: 3;
		font-size: 24px;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.seek5s {
		flex: 2;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton.seek15s {
		flex: 3;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton:hover {
		transform: translate(0px, -4px);
		box-shadow: 0px 4px 2px #666;
	}
	.zenzaPlayerContextMenu .controlButtonContainerFlex > .controlButton:active {
		transform: none;
		box-shadow: 0 0 0;
		border: 1px inset;
	}
	[data-command="picture-in-picture"] {
		display: none;
	}
	.is-pictureInPictureEnabled [data-command="picture-in-picture"] {
		display: block;
	}
	`).trim();
ContextMenu.__tpl__ = (`
	<div class="zenzaPlayerContextMenu">
		<div class="controlButtonContainer">
			<div class="controlButtonContainerFlex">
				<div class="controlButton command screenShot" data-command="screenShot"
					data-param="0.1" data-type="number" data-is-no-close="true">
					&#128247;<div class="tooltip">スクリーンショット</div>
				</div>
				<div class="empty-area-top" style="flex:4;" data-is-no-close="true"></div>
			</div>
			<div class="controlButtonContainerFlex">
				<div class="controlButton command rate010 playbackRate" data-command="playbackRate"
					data-param="0.1" data-type="number" data-repeat="on">
					&#128034;<div class="tooltip">コマ送り(0.1倍)</div>
				</div>
				<div class="controlButton command rate050 playbackRate" data-command="playbackRate"
					data-param="0.5" data-type="number" data-repeat="on">
					<div class="tooltip">0.5倍速</div>
				</div>
				<div class="controlButton command rate075 playbackRate" data-command="playbackRate"
					data-param="0.75" data-type="number" data-repeat="on">
					<div class="tooltip">0.75倍速</div>
				</div>
				<div class="controlButton command rate100 playbackRate" data-command="playbackRate"
					data-param="1.0" data-type="number" data-repeat="on">
					&#9655;<div class="tooltip">標準速</div>
				</div>
				<div class="controlButton command rate125 playbackRate" data-command="playbackRate"
					data-param="1.25" data-type="number" data-repeat="on">
					<div class="tooltip">1.25倍速</div>
				</div>
				<div class="controlButton command rate150 playbackRate" data-command="playbackRate"
					data-param="1.5" data-type="number" data-repeat="on">
					<div class="tooltip">1.5倍速</div>
				</div>
				<div class="controlButton command rate200 playbackRate" data-command="playbackRate"
					data-param="2.0" data-type="number" data-repeat="on">
					&#128007;<div class="tooltip">2倍速</div>
				</div>
			</div>
			<div class="controlButtonContainerFlex seekToResumePoint">
				<div class="controlButton command"
				data-command="seekToResumePoint"
				>▼ここまで見た
					<div class="tooltip">レジューム位置にジャンプ</div>
				</div>
			</div>
			<div class="controlButtonContainerFlex">
				<div class="controlButton command seek5s"
					data-command="seekBy" data-param="-5" data-type="number" data-repeat="on"
					>⇦
						<div class="tooltip">5秒戻る</div>
				</div>
				<div class="controlButton command seek15s"
					data-command="seekBy" data-param="-15" data-type="number" data-repeat="on"
					>⇦
						<div class="tooltip">15秒戻る</div>
				</div>
				<div class="controlButton command seek15s"
					data-command="seekBy" data-param="15" data-type="number" data-repeat="on"
					>⇨
						<div class="tooltip">15秒進む</div>
				</div>
				<div class="controlButton command seek5s"
					data-command="seekBy" data-param="5" data-type="number" data-repeat="on"
					>⇨
						<div class="tooltip">5秒進む</div>
				</div>
			</div>
		</div>
		<div class="listInner">
			<ul>
				<li class="command" data-command="togglePlay">停止/再開</li>
				<li class="command" data-command="seekTo" data-param="0">先頭に戻る</li>
				<hr class="separator">
				<li class="command toggleLoop"        data-config="loop" data-command="toggle-loop">リピート</li>
				<li class="command togglePlaylist"    data-command="togglePlaylist">連続再生</li>
				<li class="command toggleShowComment" data-config="showComment" data-command="toggle-showComment">コメントを表示</li>
				<li class="command" data-command="picture-in-picture">P in P</li>
				<hr class="separator">
				<li class="command forPremium toggle-flipH" data-command="toggle-flipH">左右反転</li>
				<li class="command toggle-flipV"            data-command="toggle-flipV">上下反転</li>
				<hr class="separator">
				<li class="command"
					data-command="reload">動画のリロード</li>
				<li class="command"
					data-command="copy-video-watch-url">動画URLをコピー</li>
				<li class="command debug" data-config="debug"
					data-command="toggle-debug">デバッグ</li>
				<li class="command mymemory"
					data-command="saveMymemory">コメントの保存</li>
			</ul>
		</div>
	</div>
`).trim();
class VideoPlayer extends Emitter {
	constructor(params) {
		super();
		this._initialize(params);
		global.debug.timeline = MediaTimeline.register('main', this);
	}
	_initialize(params) {
		this._id = 'video' + Math.floor(Math.random() * 100000);
		this._resetVideo(params);
		util.addStyle(VideoPlayer.__css__);
	}
	_reset() {
		this.removeClass('is-play is-pause is-abort is-error');
		this._isPlaying = false;
		this._canPlay = false;
	}
	addClass(className) {
		this.classList.add(...className.split(/\s/));
	}
	removeClass(className) {
		this.classList.remove(...className.split(/\s/));
	}
	toggleClass(className, v) {
		const classList = this.classList;
		className.split(/[ ]+/).forEach(name => {
			classList.toggle(name, v);
		});
	}
	_resetVideo(params) {
		params = params || {};
		if (this._videoElement) {
			params.autoplay = this._videoElement.autoplay;
			params.loop = this._videoElement.loop;
			params.mute = this._videoElement.muted;
			params.volume = this._videoElement.volume;
			params.playbackRate = this._videoElement.playbackRate;
			this._videoElement.remove();
		}
		const options = {
			autobuffer: true,
			preload: 'auto',
			mute: !!params.mute,
			'playsinline': true,
			'webkit-playsinline': true
		};
		const volume =
			params.hasOwnProperty('volume') ? parseFloat(params.volume) : 0.5;
		const playbackRate = this._playbackRate =
			params.hasOwnProperty('playbackRate') ? parseFloat(params.playbackRate) : 1.0;
		const video = util.createVideoElement();
		const body = document.createElement('div');
		util.$(body)
			.addClass(`videoPlayer nico ${this._id}`);
		util.$(video)
			.addClass('videoPlayer-video')
			.attr(options);
		body.id = 'ZenzaWatchVideoPlayerContainer';
		this._body = body;
		this.classList = ClassList(body);
		body.append(video);
		video.pause();
		this._video = video;
		this._video.className = 'zenzaWatchVideoElement';
		video.controlslist = 'nodownload';
		video.controls = false;
		video.autoplay = !!params.autoPlay;
		video.loop = !!params.loop;
		this._videoElement = video;
		this._isPlaying = false;
		this._canPlay = false;
		this.volume = volume;
		this.muted = params.mute;
		this.playbackRate = playbackRate;
		this._touchWrapper = new TouchWrapper({
			parentElement: body
		});
		this._touchWrapper.on('command', (command, param) => {
			if (command === 'contextMenu') {
				this._emit('contextMenu', param);
				return;
			}
			this.emit('command', command, param);
		});
		this._initializeEvents();
		global.debug.video = this._video;
		Object.assign(global.external, {getVideoElement: () => this._video});
	}
	_initializeEvents() {
		const eventBridge = function(name, ...args) {
			console.log('%c_on-%s:', 'background: cyan;', name, ...args);
			this.emit(name, ...args);
		};
		util.$(this._video)
			.on('canplay', this._onCanPlay.bind(this))
			.on('canplaythrough', eventBridge.bind(this, 'canplaythrough'))
			.on('loadstart', eventBridge.bind(this, 'loadstart'))
			.on('loadeddata', eventBridge.bind(this, 'loadeddata'))
			.on('loadedmetadata', eventBridge.bind(this, 'loadedmetadata'))
			.on('ended', eventBridge.bind(this, 'ended'))
			.on('emptied', eventBridge.bind(this, 'emptied'))
			.on('suspend', eventBridge.bind(this, 'suspend'))
			.on('waiting', eventBridge.bind(this, 'waiting'))
			.on('progress', this._onProgress.bind(this))
			.on('durationchange', this._onDurationChange.bind(this))
			.on('abort', this._onAbort.bind(this))
			.on('error', this._onError.bind(this))
			.on('buffercomplete', eventBridge.bind(this, 'buffercomplete'))
			.on('pause', this._onPause.bind(this))
			.on('play', this._onPlay.bind(this))
			.on('playing', this._onPlaying.bind(this))
			.on('seeking', this._onSeeking.bind(this))
			.on('seeked', this._onSeeked.bind(this))
			.on('volumechange', this._onVolumeChange.bind(this))
			.on('contextmenu', eventBridge.bind(this, 'contextmenu'))
			.on('click', eventBridge.bind(this, 'click'))
		;
		const touch = util.$(this._touchWrapper.body);
		touch
			.on('click', eventBridge.bind(this, 'click'))
			.on('dblclick', this._onDoubleClick.bind(this))
			.on('contextmenu', eventBridge.bind(this, 'contextmenu'))
			.on('wheel', this._onMouseWheel.bind(this), {passive: true})
		;
	}
	_onCanPlay(...args) {
		console.log('%c_onCanPlay:', 'background: cyan; color: blue;', ...args);
		this.playbackRate = this.playbackRate;
		if (!this._canPlay) {
			this._canPlay = true;
			this.removeClass('is-loading');
			this.emit('canPlay', ...args);
			if (this._video.videoHeight < 1) {
				this._isAspectRatioFixed = false;
			} else {
				this._isAspectRatioFixed = true;
				this.emit('aspectRatioFix',
					this._video.videoHeight / Math.max(1, this._video.videoWidth));
			}
			if (this._isYouTube && Config.props.bestZenTube) {
				this._videoYouTube.selectBestQuality();
			}
		}
	}
	_onProgress() {
		this.emit('progress', this._video.buffered, this._video.currentTime);
	}
	_onDurationChange() {
		console.log('%c_onDurationChange:', 'background: cyan;', arguments);
		this.emit('durationChange', this._video.duration);
	}
	_onAbort() {
		if (this._isYouTube) {
			return;
		} // TODO: YouTube側のエラーハンドリング
		this._isPlaying = false;
		this.addClass('is-abort');
		this.emit('abort');
	}
	_onError(e) {
		if (this._isYouTube) {
			return;
		}
		if (this._videoElement.src === CONSTANT.BLANK_VIDEO_URL ||
			!this._videoElement.src ||
			this._videoElement.src.match(/^https?:$/) ||
			this._videoElement.src === '//'
		) {
			return;
		}
		window.console.error('error src', this._video.src);
		window.console.error('%c_onError:', 'background: cyan; color: red;', arguments);
		this.addClass('is-error');
		this._canPlay = false;
		this.emit('error', {
			code: (e && e.target && e.target.error && e.target.error.code) || 0,
			target: e.target || this._video,
			type: 'normal'
		});
	}
	_onYouTubeError(e) {
		window.console.error('error src', this._video.src);
		window.console.error('%c_onError:', 'background: cyan; color: red;', e);
		this.addClass('is-error');
		this._canPlay = false;
		let fallback = false;
		const code = e.data;
		const description = (() => {
			switch (code) {
				case 2:
					return 'YouTube Error: パラメータエラー (2 invalid parameter)';
				case 5:
					return 'YouTube Error: HTML5 関連エラー (5 HTML5 error)';
				case 100:
					fallback = true;
					return 'YouTube Error: 動画が見つからないか、非公開 (100 video not found)';
				case 101:
				case 150:
					fallback = true;
					return `YouTube Error: 外部での再生禁止 (${code} forbidden)`;
				default:
					return `YouTube Error: (code${code})`;
			}
		})();
		this.emit('error', {
			code,
			description,
			fallback,
			target: this._videoElement,
			type: 'youtube'
		});
	}
	_onPause() {
		console.log('%c_onPause:', 'background: cyan;', arguments);
		this._isPlaying = false;
		this.emit('pause');
	}
	_onPlay() {
		console.log('%c_onPlay:', 'background: cyan;', arguments);
		this.addClass('is-play');
		this._isPlaying = true;
		this.emit('play');
	}
	_onPlaying() {
		console.log('%c_onPlaying:', 'background: cyan;', arguments);
		this._isPlaying = true;
		if (!this._isAspectRatioFixed) {
			this._isAspectRatioFixed = true;
			this.emit('aspectRatioFix',
				this._video.videoHeight / Math.max(1, this._video.videoWidth));
		}
		this.emit('playing');
	}
	_onSeeking() {
		console.log('%c_onSeeking:', 'background: cyan;', arguments);
		this.emit('seeking', this._video.currentTime);
	}
	_onSeeked() {
		console.log('%c_onSeeked:', 'background: cyan;', arguments);
		this.emit('seeked', this._video.currentTime);
	}
	_onVolumeChange() {
		console.log('%c_onVolumeChange:', 'background: cyan;', arguments);
		this.emit('volumeChange', this.volume, this.muted);
	}
	_onDoubleClick(e) {
		console.log('%c_onDoubleClick:', 'background: cyan;', arguments);
		e.preventDefault();
		e.stopPropagation();
		this.emit('dblclick');
	}
	_onMouseWheel(e) {
		if (e.buttons || e.shiftKey) {
			return;
		}
		console.log('%c_onMouseWheel:', 'background: cyan;', e);
		e.stopPropagation();
		const delta = -parseInt(e.deltaY, 10);
		if (delta !== 0) {
			this.emit('mouseWheel', e, delta);
		}
	}
	_onStalled(e) {
		this.emit('stalled', e);
		this._video.addEventListener('timeupdate', () => this.emit('timeupdate'), {once: true});
	}
	canPlay() {
		return !!this._canPlay;
	}
	async play() {
		if (this._currentVideo.currentTime === this.duration) {
			this.currentTime = 0;
		}
		const p = await this._video.play();
		this._isPlaying = true;
		return p;
	}
	pause() {
		this._video.pause();
		this._isPlaying = false;
		return Promise.resolve();
	}
	get isPlaying() {
		return !!this._isPlaying && !!this._canPlay;
	}
	get paused() {
		return this._video.paused;
	}
	set thumbnail(url) {
		console.log('%csetThumbnail: %s', 'background: cyan;', url);
		this._thumbnail = url;
		this._video.poster = url;
	}
	get thumbnail() {
		return this._thumbnail;
	}
	set src(url) {
		console.log('%csetSc: %s', 'background: cyan;', url);
		this._reset();
		this._src = url;
		this._isPlaying = false;
		this._canPlay = false;
		this._isAspectRatioFixed = false;
		this.addClass('is-loading');
		if (/(youtube\.com|youtu\.be)/.test(url)) {
			const currentTime = this._currentVideo.currentTime;
			this._initYouTube().then(() => {
				return this._videoYouTube.setSrc(url, currentTime);
			}).then(() => {
				this._changePlayer('YouTube');
			});
			return;
		}
		this._changePlayer('normal');
		if (url.indexOf('dmc.nico') >= 0 && location.host.indexOf('.nicovideo.jp') >= 0) {
			this._video.crossOrigin = 'use-credentials';
		} else if (this._video.crossOrigin) {
			this._video.crossOrigin = null;
		}
		this._video.src = url;
	}
	get src() {return this._src;}
	get _isYouTube() {return this._videoYouTube && this._currentVideo === this._videoYouTube;}
	_initYouTube() {
		if (this._videoYouTube) {
			return Promise.resolve(this._videoYouTube);
		}
		const yt = this._videoYouTube = new YouTubeWrapper({
			parentNode: this._body.appendChild(document.createElement('div')),
			volume: this._volume,
			autoplay: this._videoElement.autoplay
		});
		const eventBridge = function(...args) {
			this.emit(...args);
		};
		yt.on('canplay', this._onCanPlay.bind(this));
		yt.on('loadedmetadata', eventBridge.bind(this, 'loadedmetadata'));
		yt.on('ended', eventBridge.bind(this, 'ended'));
		yt.on('stalled', eventBridge.bind(this, 'stalled'));
		yt.on('pause', this._onPause.bind(this));
		yt.on('play', this._onPlay.bind(this));
		yt.on('playing', this._onPlaying.bind(this));
		yt.on('seeking', this._onSeeking.bind(this));
		yt.on('seeked', this._onSeeked.bind(this));
		yt.on('volumechange', this._onVolumeChange.bind(this));
		yt.on('error', this._onYouTubeError.bind(this));
		global.debug.youtube = yt;
		return Promise.resolve(this._videoYouTube);
	}
	_changePlayer(type) {
		switch (type.toLowerCase()) {
			case 'youtube':
				if (this._currentVideo !== this._videoYouTube) {
					const yt = this._videoYouTube;
					this.addClass('is-youtube');
					yt.autoplay = this._currentVideo.autoplay;
					yt.loop = this._currentVideo.loop;
					yt.muted = this._currentVideo.muted;
					yt.volume = this._currentVideo.volume;
					yt.playbackRate = this._currentVideo.playbackRate;
					this._currentVideo = yt;
					this._videoElement.src = CONSTANT.BLANK_VIDEO_URL;
					this.emit('playerTypeChange', 'youtube');
				}
				break;
			default:
				if (this._currentVideo === this._videoYouTube) {
					this.removeClass('is-youtube');
					this._videoElement.loop = this._currentVideo.loop;
					this._videoElement.muted = this._currentVideo.muted;
					this._videoElement.volume = this._currentVideo.volume;
					this._videoElement.playbackRate = this._currentVideo.playbackRate;
					this._currentVideo = this._videoElement;
					this._videoYouTube.src = '';
					this.emit('playerTypeChange', 'normal');
				}
				break;
		}
	}
	set volume(vol) {
		vol = Math.max(Math.min(1, vol), 0);
		this._video.volume = vol;
	}
	get volume() {return Math.max(0, this._video.volume);}
	set muted(v) {
		v = !!v;
		if (this._video.muted !== v) {
			this._video.muted = v;
		}
	}
	get muted() {return this._video.muted;}
	get currentTime() {
		if (!this._canPlay) {
			return 0;
		}
		return this._video.currentTime;
	}
	set currentTime(sec) {
		const cur = this._video.currentTime;
		if (cur !== sec) {
			this._video.currentTime = sec;
			this.emit('seek', this._video.currentTime);
		}
	}
	fastSeek(sec) {
		if (typeof this._video.fastSeek !== 'function' || this._isYouTube) {
			return this.currentTime=sec;
		}
		if (this._src.indexOf('dmc.nico') >= 0) {
			return this.currentTime = sec;
		}
		this._video.fastSeek(sec);
		this.emit('seek', this._video.currentTime);
	}
	get duration() {return this._video.duration;}
	togglePlay() {
		if (this.isPlaying) {
			return this.pause();
		} else {
			return this.play();
		}
	}
	get vpos() {return this._video.currentTime * 100;}
	set vpos(vpos) {this._video.currentTime = vpos / 100;}
	get isLoop() {return !!this._video.loop;}
	set isLoop(v) {this._video.loop = !!v; }
	set playbackRate(v) {
		console.log('setPlaybackRate', v);
		this._playbackRate = v;
		const video = this._video;
		video.playbackRate = 1;
		window.setTimeout(() => video.playbackRate = parseFloat(v), 100);
	}
	get playbackRate() {return this._playbackRate;}
	get bufferedRange() {return this._video.buffered;}
	set isAutoPlay(v) {this._video.autoplay = v;}
	get isAutoPlay() {return this._video.autoPlay;}
	setSrc(url) { this.src = url;}
	setVolume(v) { this.volume = v; }
	getVolume() { return this.volume; }
	setMute(v) { this.muted = v;}
	isMuted() { return this.muted; }
	getDuration() { return this.duration; }
	getVpos() { return this.vpos; }
	setVpos(v) { this.vpos = v; }
	getIsLoop() {return this.isLoop;}
	setIsLoop(v) {this.isLoop = !!v; }
	setPlaybackRate(v) { this.playbackRate = v; }
	getPlaybackRate() { return this.playbackRate; }
	getBufferedRange() { return this.bufferedRange; }
	setIsAutoPlay(v) {this.isAutoplay = v;}
	getIsAutoPlay() {return this.isAutoPlay;}
	appendTo(node) {node.append(this._body);}
	close() {
		this._video.pause();
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._videoElement.src = CONSTANT.BLANK_VIDEO_URL;
		if (this._videoYouTube) {
			this._videoYouTube.src = '';
		}
	}
	getScreenShot() {
		if (!this.isCorsReady) {
			return null;
		}
		const video = this._video;
		const width = video.videoWidth;
		const height = video.videoHeight;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		context.drawImage(video.drawableElement || video, 0, 0);
		return canvas;
	}
	get isCorsReady() {return this._video.crossOrigin === 'use-credentials';}
	get videoElement() {return this._videoElement;}
	get _video() {return this._currentVideo;}
	set _video(v) {this._currentVideo = v;}
}
VideoPlayer.__css__ = `
		.videoPlayer iframe,
		.videoPlayer .zenzaWatchVideoElement {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			z-index: 5;
		}
		.zenzaWatchVideoElement {
			display: block;
			transition: transform 0.4s ease;
		}
		.is-flipH .zenzaWatchVideoElement {
			transform: perspective(400px) rotateY(180deg);
		}
		.is-flipV .zenzaWatchVideoElement {
			transform: perspective(400px) rotateX(180deg);
		}
		.is-flipV.is-flipH .zenzaWatchVideoElement {
			transform: perspective(400px) rotateX(180deg) rotateY(180deg);
		}
		/* iOSだとvideo上でマウスイベントが発生しないのでカバーを掛ける */
		.touchWrapper {
			display: block;
			position: absolute;
			opacity: 0;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 10;
			touch-action: none;
		}
		/* YouTubeのプレイヤーを触れる用にするための隙間 */
		.is-youtube .touchWrapper {
			width:  calc(100% - 100px);
			height: calc(100% - 150px);
		}
		.is-loading .touchWrapper,
		.is-error .touchWrapper {
			display: none !important;
		}
		.videoPlayer.is-youtube .zenzaWatchVideoElement {
			display: none;
		}
		.videoPlayer iframe {
			display: none;
		}
		.videoPlayer.is-youtube iframe {
			display: block;
		}
	`.trim();
class TouchWrapper extends Emitter {
	constructor({parentElement}) {
		super();
		this._parentElement = parentElement;
		this._config = global.config.namespace('touch');
		this._isTouching = false;
		this._maxCount = 0;
		this._currentPointers = [];
		this._debouncedOnSwipe2Y = _.debounce(this._onSwipe2Y.bind(this), 400);
		this._debouncedOnSwipe3X = _.debounce(this._onSwipe3X.bind(this), 400);
		this.initializeDom();
	}
	initializeDom() {
		let body = this._body = document.createElement('div');
		body.className = 'touchWrapper';
		body.addEventListener('click', this._onClick.bind(this));
		body.addEventListener('touchstart', this._onTouchStart.bind(this), {passive: true});
		body.addEventListener('touchmove', this._onTouchMove.bind(this), {passive: true});
		body.addEventListener('touchend', this._onTouchEnd.bind(this), {passive: true});
		body.addEventListener('touchcancel', this._onTouchCancel.bind(this), {passive: true});
		this._onTouchMoveThrottled =
			_.throttle(this._onTouchMoveThrottled.bind(this), 200);
		if (this._parentElement) {
			this._parentElement.appendChild(body);
		}
		global.debug.touchWrapper = this;
	}
	get body() {
		return this._body;
	}
	_onClick() {
		this._lastTap = 0;
	}
	_onTouchStart(e) {
		let identifiers =
			this._currentPointers.map(touch => {
				return touch.identifier;
			});
		if (e.changedTouches.length > 1) {
			e.preventDefault();
		}
		[...e.changedTouches].forEach(touch => {
			if (identifiers.includes(touch.identifier)) {
				return;
			}
			this._currentPointers.push(touch);
		});
		this._maxCount = Math.max(this._maxCount, this.touchCount);
		this._startCenter = this._getCenter(e);
		this._lastCenter = this._getCenter(e);
		this._isMoved = false;
	}
	_onTouchMove(e) {
		if (e.targetTouches.length > 1) {
			e.preventDefault();
		}
		this._onTouchMoveThrottled(e);
	}
	_onTouchMoveThrottled(e) {
		if (!e.targetTouches) {
			return;
		}
		if (e.targetTouches.length > 1) {
			e.preventDefault();
		}
		let startPoint = this._startCenter;
		let lastPoint = this._lastCenter;
		let currentPoint = this._getCenter(e);
		if (!startPoint || !currentPoint) {
			return;
		}
		let width = this._body.offsetWidth;
		let height = this._body.offsetHeight;
		let diff = {
			count: this.touchCount,
			startX: startPoint.x,
			startY: startPoint.y,
			currentX: currentPoint.x,
			currentY: currentPoint.y,
			moveX: currentPoint.x - lastPoint.x,
			moveY: currentPoint.y - lastPoint.y,
			x: currentPoint.x - startPoint.x,
			y: currentPoint.y - startPoint.y,
		};
		diff.perX = diff.x / width * 100;
		diff.perY = diff.y / height * 100;
		diff.perStartX = diff.startX / width * 100;
		diff.perStartY = diff.startY / height * 100;
		diff.movePerX = diff.moveX / width * 100;
		diff.movePerY = diff.moveY / height * 100;
		if (Math.abs(diff.perX) > 2 || Math.abs(diff.perY) > 1) {
			this._isMoved = true;
		}
		if (diff.count === 2) {
			if (Math.abs(diff.movePerX) >= 0.5) {
				this._execCommand('seekRelativePercent', diff);
			}
			if (Math.abs(diff.perY) >= 20) {
				this._debouncedOnSwipe2Y(diff);
			}
		}
		if (diff.count === 3) {
			if (Math.abs(diff.perX) >= 20) {
				this._debouncedOnSwipe3X(diff);
			}
		}
		this._lastCenter = currentPoint;
		return diff;
	}
	_onSwipe2Y(diff) {
		this._execCommand(diff.perY < 0 ? 'shiftUp' : 'shiftDown');
		this._startCenter = this._lastCenter;
	}
	_onSwipe3X(diff) {
		this._execCommand(diff.perX < 0 ? 'playNextVideo' : 'playPreviousVideo');
		this._startCenter = this._lastCenter;
	}
	_execCommand(command, param) {
		if (!this._config.props.enable) {
			return;
		}
		if (!command) {
			return;
		}
		this.emit('command', command, param);
	}
	_onTouchEnd(e) {
		if (!e.changedTouches) {
			return;
		}
		let identifiers =
			Array.from(e.changedTouches).map(touch => {
				return touch.identifier;
			});
		let currentTouches = [];
		currentTouches = this._currentPointers.filter(touch => {
			return !identifiers.includes(touch.identifier);
		});
		this._currentPointers = currentTouches;
		if (!this._isMoved && this.touchCount === 0) {
			const config = this._config;
			this._lastTap = this._maxCount;
			window.console.info('touchEnd', this._maxCount, this._isMoved);
			switch (this._maxCount) {
				case 2:
					this._execCommand(config.props.tap2command);
					break;
				case 3:
					this._execCommand(config.props.tap3command);
					break;
				case 4:
					this._execCommand(config.props.tap4command);
					break;
				case 5:
					this._execCommand(config.props.tap5command);
					break;
			}
			this._maxCount = 0;
			this._isMoved = false;
		}
	}
	_onTouchCancel(e) {
		if (!e.changedTouches) {
			return;
		}
		let identifiers =
			Array.from(e.changedTouches).map(touch => {
				return touch.identifier;
			});
		let currentTouches = [];
		window.console.log('onTouchCancel', this._isMoved, e.changedTouches.length);
		currentTouches = this._currentPointers.filter(touch => {
			return !identifiers.includes(touch.identifier);
		});
		this._currentPointers = currentTouches;
	}
	get touchCount() {
		return this._currentPointers.length;
	}
	_getCenter(e) {
		let x = 0, y = 0;
		Array.from(e.touches).forEach(t => {
			x += t.pageX;
			y += t.pageY;
		});
		return {x: x / e.touches.length, y: y / e.touches.length};
	}
}

//@require Storyboard

	class VideoControlBar extends Emitter {
		constructor(...args) {
			super();
			this.initialize(...args);
		}
		initialize(params) {
			this._playerConfig        = params.playerConfig;
			this._$playerContainer    = params.$playerContainer;
			this._playerState         = params.playerState;
			this._currentTimeGetter   = params.currentTimeGetter;
			const player = this.player = params.player;
			this.state = new VideoControlState();
			player.on('open',           this._onPlayerOpen.bind(this));
			player.on('canPlay',        this._onPlayerCanPlay.bind(this));
			player.on('durationChange', this._onPlayerDurationChange.bind(this));
			player.on('close',          this._onPlayerClose.bind(this));
			player.on('progress',       this._onPlayerProgress.bind(this));
			player.on('loadVideoInfo',  this._onLoadVideoInfo.bind(this));
			player.on('commentParsed',  _.debounce(this._onCommentParsed.bind(this), 500));
			player.on('commentChange',  _.debounce(this._onCommentChange.bind(this), 100));
			Promise.all([
				player.promise('firstVideoInitialized'), this.promise('dom-ready')
			]).then(() => this._onFirstVideoInitialized());
			this._initializeDom();
			this._initializePlaybackRateSelectMenu();
			this._initializeVolumeControl();
			this._initializeVideoServerTypeSelectMenu();
			global.debug.videoControlBar = this;
		}
		_initializeDom() {
			const $view = this._$view = util.$.html(VideoControlBar.__tpl__);
			const $container = this._$playerContainer;
			const config = this._playerConfig;
			this._view = $view[0];
			const classList = this.classList = ClassList(this._view);
			const mq = $view.mapQuery({
				_seekBarContainer: '.seekBarContainer',
				_seekBar: '.seekBar',
				_currentTime: '.currentTime',
				_duration: '.duration',
				_playbackRateMenu: '.playbackRateMenu',
				_playbackRateSelectMenu: '.playbackRateSelectMenu',
				_videoServerTypeMenu: '.videoServerTypeMenu',
				_videoServerTypeSelectMenu: '.videoServerTypeSelectMenu',
				_resumePointer: 'zenza-seekbar-label',
				_bufferRange: '.bufferRange',
				_seekRange: '.seekRange',
				_seekBarPointer: '.seekBarPointer',
				resumePointers: 'zenza-seekbar-label',
			});
			Object.assign(this, mq.e, {_currentTime: 0});
			Object.assign(this, mq.$);
			util.$(this._seekRange)
				.on('input', this._onSeekRangeInput.bind(this))
				.on('change', e => e.target.blur());
			this._pointer = new SmoothSeekBarPointer({
				pointer: this._seekBarPointer,
				playerState: this._playerState
			});
			const timeStyle = {
				widthPx: 44,
				heightPx: 18,
				fontFamily: '\'Yu Gothic\', \'YuGothic\', \'Courier New\', Osaka-mono, \'ＭＳ ゴシック\', monospace',
				fontWeight: '',
				fontSizePx: 12,
				color: '#fff'
			};
			this.currentTimeLabel = TextLabel.create({
				container: $view.find('.currentTimeLabel')[0],
				name: 'currentTimeLabel',
				text: '--:--',
				style: timeStyle
			});
			this.durationLabel = TextLabel.create({
				container: $view.find('.durationLabel')[0],
				name: 'durationLabel',
				text: '--:--',
				style: timeStyle
			});
			this._$seekBar
				.on('mousedown', this._onSeekBarMouseDown.bind(this))
				.on('mousemove', this._onSeekBarMouseMove.bind(this));
			$view
				.on('click', this._onClick.bind(this))
				.on('command', this._onCommandEvent.bind(this));
			HeatMapWorker.init({container: this._seekBar}).then(hm => this.heatMap = hm);
			const updateHeatMapVisibility =
				v => this._$seekBarContainer.raf.toggleClass('noHeatMap', !v);
			updateHeatMapVisibility(this._playerConfig.props.enableHeatMap);
			this._playerConfig.onkey('enableHeatMap', updateHeatMapVisibility);
			global.emitter.on('heatMapUpdate',
				heatMap => WatchInfoCacheDb.put(this.player.watchId, {heatMap}));
			this.storyboard = new Storyboard({
				playerConfig: config,
				player: this.player,
				state: this.state,
				container: $view[0]
			});
			this.state.onkey('isStoryboardAvailable',
				v => classList.toggle('is-storyboardAvailable', v));
			this._seekBarToolTip = new SeekBarToolTip({
				$container: this._$seekBarContainer,
				storyboard: this.storyboard
			});
			this._commentPreview = new CommentPreview({
				$container: this._$seekBarContainer
			});
			const updateEnableCommentPreview = v => {
				this._$seekBarContainer.raf.toggleClass('enableCommentPreview', v);
				this._commentPreview.mode = v ? 'list' : 'hover';
			};
			updateEnableCommentPreview(config.props.enableCommentPreview);
			config.onkey('enableCommentPreview', updateEnableCommentPreview);
			const watchElement = $container[0].closest('#zenzaVideoPlayerDialog');
			this._wheelSeeker = new WheelSeeker({
				parentNode: $view[0],
				watchElement
			});
			watchElement.addEventListener('mousedown', e => {
				if (['A', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
					return;
				}
				if (e.buttons !== 3 && !(e.button === 0 && e.shiftKey)) {
					return;
				}
				if (e.buttons === 3) {
					watchElement.addEventListener('contextmenu', e => {
						window.console.log('contextmenu', e);
						e.preventDefault();
						e.stopPropagation();
					}, {once: true, capture: true});
				}
				this._onSeekBarMouseDown(e);
			});
			global.emitter.on('hideHover', () => {
				this._hideMenu();
				this._commentPreview.hide();
			});
			$container.append($view);
			this.emitResolve('dom-ready');
		}
		_initializePlaybackRateSelectMenu() {
			const config = this._playerConfig;
			const $menu = this._$playbackRateSelectMenu;
			const $rates = $menu.find('.playbackRate');
			const style = {
				widthPx: 48,
				heightPx: 30,
				fontFamily: '"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif',
				fontWeight: '',
				fontSizePx: 18,
				color: '#fff'
			};
			const rateLabel = TextLabel.create({
				container: this._$playbackRateMenu.find('.controlButtonInner')[0],
				name: 'currentTimeLabel',
				text: '',
				style
			});
			const updatePlaybackRate = rate => {
				rateLabel.text = `x${Math.round(rate * 100) / 100}`;
				$menu.find('.selected').removeClass('selected');
				const fr = Math.floor( parseFloat(rate, 10) * 100) / 100;
				$rates.forEach(item => {
					const r = parseFloat(item.dataset.param, 10);
					if (fr === r) {
						ClassList(item).add('selected');
					}
				});
				this._pointer.playbackRate = rate;
			};
			updatePlaybackRate(config.props.playbackRate);
			config.onkey('playbackRate', updatePlaybackRate);
		}
		_initializeVolumeControl() {
			const $vol = this._$view.find('zenza-range-bar input[type="range"]');
			const [vol] = $vol;
			const setVolumeBar = this._setVolumeBar = v => (vol.view || vol).value = v;
			$vol.on('input', e => util.dispatchCommand(e.target, 'volume', e.target.value));
			setVolumeBar(this._playerConfig.props.volume);
			this._playerConfig.onkey('volume', setVolumeBar);
		}
		_initializeVideoServerTypeSelectMenu() {
			const config = this._playerConfig;
			const $button = this._$videoServerTypeMenu;
			const $select  = this._$videoServerTypeSelectMenu;
			const $current = $select.find('.currentVideoQuality');
			const updateSmileVideoQuality = value => {
				const $dq = $select.find('.smileVideoQuality');
				$dq.removeClass('selected');
				$select.find('.select-smile-' + (value === 'eco' ? 'economy' : 'default')).addClass('selected');
			};
			const updateDmcVideoQuality = value => {
				const $dq = $select.find('.dmcVideoQuality');
				$dq.removeClass('selected');
				$select.find('.select-dmc-' + value).addClass('selected');
			};
			const onVideoServerType = (type, videoSessionInfo) => {
				$button.raf.removeClass('is-smile-playing is-dmc-playing')
					.raf.addClass(`is-${type === 'dmc' ? 'dmc' : 'smile'}-playing`);
				$select.find('.serverType').removeClass('selected');
				$select.find(`.select-server-${type === 'dmc' ? 'dmc' : 'smile'}`).addClass('selected');
				$current.raf.text(type !== 'dmc' ? '----' : videoSessionInfo.videoFormat.replace(/^.*h264_/, ''));
			};
			updateSmileVideoQuality(config.props.smileVideoQuality);
			updateDmcVideoQuality(config.props.dmcVideoQuality);
			config.onkey('forceEconomy',    updateSmileVideoQuality);
			config.onkey('dmcVideoQuality', updateDmcVideoQuality);
			this.player.on('videoServerType', onVideoServerType);
		}
		_onCommandEvent(e) {
			const command = e.detail.command;
			switch (command) {
				case 'toggleStoryboard':
					this.storyboard.toggle();
					break;
				case 'wheelSeek-start':
					window.console.log('start-seek-start');
					this.state.isWheelSeeking = true;
					this._wheelSeeker.currentTime = this.player.currentTime;
					this.classList.add('is-wheelSeeking');
					break;
				case 'wheelSeek-end':
					window.console.log('start-seek-end');
					this.state.isWheelSeeking = false;
					this.classList.remove('is-wheelSeeking');
					break;
				case 'wheelSeek':
					this._onWheelSeek(e.detail.param);
					break;
				default:
					return;
			}
			e.stopPropagation();
		}
		_onClick(e) {
			e.preventDefault();
			const target = e.target.closest('[data-command]');
			if (!target) {
				return;
			}
			let {command, param, type} = target.dataset;
			if (param && (type === 'bool' || type === 'json')) {
				param = JSON.parse(param);
			}
			switch (command) {
				case 'toggleStoryboard':
					this.storyboard.toggle();
					break;
				default:
					util.dispatchCommand(target, command, param);
					break;
			}
			e.stopPropagation();
		}
		_posToTime(pos) {
			const width = global.innerWidth;
			return this._duration * (pos / Math.max(width, 1));
		}
		_timeToPos(time) {
			return global.innerWidth * (time / Math.max(this._duration, 1));
		}
		_timeToPer(time) {
			return (time / Math.max(this._duration, 1)) * 100;
		}
		_onPlayerOpen() {
			this._startTimer();
			this.duration = 0;
			this.currentTime = 0;
			this.heatMap && this.heatMap.reset();
			this.storyboard.reset();
			this.resetBufferedRange();
		}
		_onPlayerCanPlay(watchId, videoInfo) {
			const duration = this.player.duration;
			this.duration = duration;
			this.storyboard.onVideoCanPlay(watchId, videoInfo);
			this.heatMap && (this.heatMap.duration = duration);
		}
		_onCommentParsed() {
			const chatList = this.player.chatList;
			this.heatMap && (this.heatMap.chatList = chatList);
			this._commentPreview.chatList = chatList;
		}
		_onCommentChange() {
			const chatList = this.player.chatList;
			this.heatMap && (this.heatMap.chatList = chatList);
			this._commentPreview.chatList = chatList;
		}
		_onPlayerDurationChange() {
			this._pointer.duration = this._playerState.videoInfo.duration;
			this._wheelSeeker.duration = this._playerState.videoInfo.duration;
			this.heatMap && (this.heatMap.chatList = this.player.chatList);
		}
		_onPlayerClose() {
			this._stopTimer();
		}
		_onPlayerProgress(range, currentTime) {
			this.setBufferedRange(range, currentTime);
		}
		_startTimer() {
			this._timerCount = 0;
			this._raf = this._raf || new RequestAnimationFrame(this._onTimer.bind(this));
			this._raf.enable();
		}
		_stopTimer() {
			this._raf && this._raf.disable();
		}
		_onSeekRangeInput(e) {
			const sec = e.target.value * 1;
			const left = sec / (e.target.max * 1) * global.innerWidth;
			util.dispatchCommand(e.target, 'seek', sec);
			this._seekBarToolTip.update(sec, left);
			this.storyboard.setCurrentTime(sec, true);
		}
		_onSeekBarMouseDown(e) {
			e.stopPropagation();
			this._beginMouseDrag(e);
		}
		_onSeekBarMouseMove(e) {
			if (!this.state.isDragging) {
				e.stopPropagation();
			}
			const left = e.offsetX;
			const sec = this._posToTime(left);
			this._seekBarMouseX = left;
			this._commentPreview.currentTime = sec;
			this._commentPreview.update(left);
			this._seekBarToolTip.update(sec, left);
		}
		_onWheelSeek(sec) {
			if (!this.state.isWheelSeeking) {
				return;
			}
			sec = sec * 1;
			const dur = this._duration;
			const left = sec / dur * window.innerWidth;
			this._seekBarMouseX = left;
			this._commentPreview.currentTime = sec;
			this._commentPreview.update(left);
			this._seekBarToolTip.update(sec, left);
			this.storyboard.setCurrentTime(sec, true);
		}
		_beginMouseDrag() {
			this._bindDragEvent();
			this.classList.add('is-dragging');
			this.state.isDragging = true;
		}
		_endMouseDrag() {
			this._unbindDragEvent();
			this.classList.remove('is-dragging');
			this.state.isDragging = false;
		}
		_onBodyMouseUp(e) {
			if ((e.button === 0 && e.shiftKey)) {
				return;
			}
			this._endMouseDrag();
		}
		_onWindowBlur() {
			this._endMouseDrag();
		}
		_bindDragEvent() {
			util.$('body')
				.on('mouseup.ZenzaWatchSeekBar', this._onBodyMouseUp.bind(this));
			util.$(window).on('blur.ZenzaWatchSeekBar', this._onWindowBlur.bind(this), {once: true});
		}
		_unbindDragEvent() {
			util.$('body')
				.off('mouseup.ZenzaWatchSeekBar');
			util.$(window).off('blur.ZenzaWatchSeekBar');
		}
		_onTimer() {
			this._timerCount++;
			const player = this.player;
			const currentTime = this.state.isWheelSeeking ?
				this._wheelSeeker.currentTime : player.currentTime;
			if (this._timerCount % 6 === 0) {
				this.currentTime = currentTime;
			}
			this.storyboard.currentTime = currentTime;
		}
		_onLoadVideoInfo(videoInfo) {
			this.duration = videoInfo.duration;
			const [view] = this._$view;
			const resumePoints = videoInfo.resumePoints;
			for (let i = 0, len = this.$resumePointers.length; i < len; i++) {
				const pointer = this.$resumePointers[i];
				const resume = resumePoints[i];
				if (!resume) {
					pointer.hidden = true;
					continue;
				}
				pointer.setAttribute('duration', videoInfo.duration);
				pointer.setAttribute('time', resume.time);
				pointer.setAttribute('text', `${resume.now} ここまで見た`);
				if (i > 0) {
					cssUtil.setProps(
						[pointer, '--pointer-color', 'rgba(128, 128, 255, 0.6)'],
						[pointer, '--color', '#aef']);
				} else{
					cssUtil.setProps([pointer, '--scale-pp', 1.7]);
				}
			}
		}
		async _onFirstVideoInitialized(watchId) {
			const [view] = this._$view;
			const handler = (command, param) => this.emit('command', command, param);
			const ge = global.emitter; // emitAsync は互換用に残してる
			ge.emitResolve('videoControBar.addonMenuReady',
				{container: view.querySelector('.controlItemContainer.left .scalingUI'), handler}
			).then(({container, handler}) => ge.emitAsync('videoControBar.addonMenuReady', container, handler));
			ge.emitResolve('seekBar.addonMenuReady',
				{container: view.querySelector('.seekBar'), handler}
			).then(({container, handle}) => ge.emitAsync('seekBar.addonMenuReady', container, handle));
		}
		get currentTime() {
			return this._currentTime;
		}
		setCurrentTime(sec) {
			this.currentTime = sec;
		}
		set currentTime(sec) {
			if (this._currentTime === sec) { return; }
			this._currentTime = sec;
			const currentTimeText = util.secToTime(sec);
			if (this._currentTimeText !== currentTimeText) {
				this._currentTimeText = currentTimeText;
				this.currentTimeLabel.text = currentTimeText;
			}
			this._pointer.currentTime = sec;
		}
		get duration() {
			return this._duration;
		}
		set duration(sec) {
			if (sec === this._duration) { return; }
			this._duration = sec;
			this._pointer.currentTime = -1;
			this._pointer.duration = sec;
			this._wheelSeeker.duration = sec;
			this._seekRange.max = sec;
			if (sec === 0 || isNaN(sec)) {
				this.durationLabel.text = '--:--';
			} else {
				this.durationLabel.text = util.secToTime(sec);
			}
			this.emit('durationChange');
		}
		setBufferedRange(range, currentTime) {
			const bufferRange = this._bufferRange;
			if (!range || !range.length || !this._duration) {
				return;
			}
			for (let i = 0, len = range.length; i < len; i++) {
				try {
					const start = range.start(i);
					const end   = range.end(i);
					const width = end - start;
					if (start <= currentTime && end >= currentTime) {
						if (this._bufferStart !== start ||
								this._bufferEnd   !== end) {
							const perLeft = (this._timeToPer(start) - 1);
							const scaleX = (this._timeToPer(width) + 2) / 100;
							cssUtil.setProps(
								[bufferRange, '--buffer-range-left', cssUtil.percent(perLeft)],
								[bufferRange, '--buffer-range-scale', scaleX]
							);
							this._bufferStart = start;
							this._bufferEnd   = end;
						}
						break;
					}
				} catch (e) {}
			}
		}
		resetBufferedRange() {
			this._bufferStart = 0;
			this._bufferEnd = 0;
			cssUtil.setProps([this._bufferRange, '--buffer-range-scale', 0]);
		}
		_hideMenu() {
			document.body.focus();
		}
	}
	VideoControlBar.BASE_HEIGHT = CONSTANT.CONTROL_BAR_HEIGHT;
	VideoControlBar.BASE_SEEKBAR_HEIGHT = 10;
util.addStyle(`
	.videoControlBar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100vw;
		height: var(--zenza-control-bar-height, ${VideoControlBar.BASE_HEIGHT}px);
		z-index: 150000;
		background: #000;
		transition: opacity 0.3s ease, transform 0.3s ease;
		user-select: none;
		contain: layout style size;
		will-change: transform;
	}
	.videoControlBar * {
		box-sizing: border-box;
		user-select: none;
	}
	.videoControlBar.is-wheelSeeking {
		pointer-events: none;
	}
	.controlItemContainer {
		position: absolute;
		top: 10px;
		height: 40px;
		z-index: 200;
	}
	.controlItemContainer:hover,
	.controlItemContainer:focus-within,
	.videoControlBar.is-menuOpen .controlItemContainer {
		z-index: 260;
	}
	.controlItemContainer.left {
		left: 0;
		height: 40px;
		white-space: nowrap;
		overflow: visible;
		transition: transform 0.2s ease, left 0.2s ease;
	}
	.controlItemContainer.left .scalingUI {
		padding: 0 8px 0;
	}
	.controlItemContainer.left .scalingUI:empty {
		display: none;
	}
	.controlItemContainer.left .scalingUI>* {
		background: #222;
		display: inline-block;
	}
	.controlItemContainer.center {
		left: 50%;
		height: 40px;
		transform: translate(-50%, 0);
		white-space: nowrap;
		overflow: visible;
		transition: transform 0.2s ease, left 0.2s ease;
	}
	.controlItemContainer.center .scalingUI {
		transform-origin: top center;
	}
	.controlItemContainer.center .scalingUI > div{
		display: flex;
		align-items: center;
		background:
			linear-gradient(to bottom,
			transparent, transparent 4px, #222 0, #222 30px, transparent 0, transparent);
		height: 32px;
	}
	.controlItemContainer.right {
		right: 0;
	}
	.is-mouseMoving .controlItemContainer.right .controlButton{
		background: #333;
	}
	.controlItemContainer.right .scalingUI {
		transform-origin: top right;
	}
	.controlButton {
		position: relative;
		display: inline-block;
		transition: opacity 0.4s ease;
		font-size: 20px;
		width: 32px;
		height: 32px;
		line-height: 30px;
		box-sizing: border-box;
		text-align: center;
		cursor: pointer;
		color: #fff;
		opacity: 0.8;
		min-width: 32px;
		vertical-align: middle;
		outline: none;
	}
	.controlButton:hover {
		cursor: pointer;
		opacity: 1;
	}
	.controlButton:active .controlButtonInner {
		transform: translate(0, 2px);
	}
	.is-abort   .playControl,
	.is-error   .playControl,
	.is-loading .playControl {
		opacity: 0.4 !important;
		pointer-events: none;
	}
	.controlButton .tooltip {
		display: none;
		pointer-events: none;
		position: absolute;
		left: 16px;
		top: -30px;
		transform:  translate(-50%, 0);
		font-size: 12px;
		line-height: 16px;
		padding: 2px 4px;
		border: 1px solid #000;
		background: #ffc;
		color: #000;
		text-shadow: none;
		white-space: nowrap;
		z-index: 100;
		opacity: 0.8;
	}
	.is-mouseMoving .controlButton:hover .tooltip {
		display: block;
		opacity: 1;
	}
	.videoControlBar:hover .controlButton {
		opacity: 1;
		pointer-events: auto;
	}
	.videoControlBar .controlButton:focus-within {
		pointer-events: none;
	}
	.videoControlBar .controlButton:focus-within .zenzaPopupMenu,
	.videoControlBar .controlButton              .zenzaPopupMenu:hover {
		pointer-events: auto;
		visibility: visible;
		opacity: 0.99;
		pointer-events: auto;
		transition: opacity 0.3s;
	}
	.videoControlBar .controlButton:focus-within .tooltip {
		display: none;
	}
	.settingPanelSwitch {
		width: 32px;
	}
	.settingPanelSwitch:hover {
		text-shadow: 0 0 8px #ff9;
	}
	.settingPanelSwitch .tooltip {
		left: 0;
	}
	.videoControlBar .zenzaSubMenu {
		left: 50%;
		transform: translate(-50%, 0);
		bottom: 44px;
		white-space: nowrap;
	}
	.videoControlBar .triangle {
		transform: translate(-50%, 0) rotate(-45deg);
		bottom: -8.5px;
		left: 50%;
	}
	.videoControlBar .zenzaSubMenu::after {
		content: '';
		position: absolute;
		display: block;
		width: 110%;
		height: 16px;
		left: -5%;
	}
	.controlButtonInner {
		display: inline-block;
	}
	.seekTop {
		left: 0px;
		width: 32px;
		transform: scale(1.1);
	}
	.togglePlay {
		width: 36px;
		transition: transform 0.2s ease;
		transform: scale(1.1);
	}
	.togglePlay:active {
		transform: scale(0.75);
	}
	.togglePlay .play,
	.togglePlay .pause {
		display: inline-block;
		position: absolute;
		top: 50%;
		left: 50%;
		transition: transform 0.1s linear, opacity 0.1s linear;
		user-select: none;
		pointer-events: none;
	}
	.togglePlay .play {
		width: 100%;
		height: 100%;
		transform: scale(1.2) translate(-50%, -50%) translate(10%, 10%);
	}
	.is-playing .togglePlay .play {
		opacity: 0;
	}
	.togglePlay>.pause {
		width: 24px;
		height: 16px;
		background-image: linear-gradient(
			to right,
			transparent 0, transparent 12.5%,
			currentColor 0, currentColor 43.75%,
			transparent 0, transparent 56.25%,
			currentColor 0, currentColor 87.5%,
			transparent 0);
		opacity: 0;
		transform: scaleX(0);
	}
	.is-playing .togglePlay>.pause {
		opacity: 1;
		transform: translate(-50%, -50%);
	}
	.seekBarContainer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		cursor: pointer;
		z-index: 250;
	}
	/* 見えないマウス判定 */
	.seekBarContainer .seekBarShadow {
		position: absolute;
		background: transparent;
		opacity: 0;
		width: 100vw;
		height: 8px;
		top: -8px;
	}
	.is-mouseMoving .seekBarContainer:hover .seekBarShadow {
		height: 48px;
		top: -48px;
	}
	.is-abort   .seekBarContainer,
	.is-loading .seekBarContainer,
	.is-error   .seekBarContainer {
		pointer-events: none;
	}
	.is-abort   .seekBarContainer *,
	.is-error   .seekBarContainer * {
		display: none;
	}
	.seekBar {
		position: relative;
		width: 100%;
		height: 10px;
		margin: 2px 0 2px;
		border-top:    1px solid #333;
		border-bottom: 1px solid #333;
		cursor: pointer;
		transition: height 0.2s ease 1s, margin-top 0.2s ease 1s;
	}
	.seekBar:hover {
		height: 24px;
		/* このmargin-topは見えないマウスオーバー判定を含む */
		margin-top: -14px;
		transition: none;
		background-color: rgba(0, 0, 0, 0.5);
	}
	.seekBarContainer .seekBar * {
		pointer-events: none;
	}
	.bufferRange {
		position: absolute;
		--buffer-range-left: 0;
		--buffer-range-scale: 0;
		width: 100%;
		height: 110%;
		left: 0px;
		top: 0px;
		box-shadow: 0 0 6px #ff9 inset, 0 0 4px #ff9;
		z-index: 190;
		background: #ff9;
		transform-origin: left;
		transform:
			translateX(var(--buffer-range-left))
			scaleX(var(--buffer-range-scale));
		transition: transform 0.2s;
		mix-blend-mode: overlay;
		will-change: transform, opacity;
		opacity: 0.6;
	}
	.is-youTube .bufferRange {
		width: 100% !important;
		height: 110% !important;
		background: #f99;
		transition: transform 0.5s ease 1s;
		transform: translate3d(0, 0, 0) scaleX(1) !important;
	}
	.seekBarPointer {
		/*--width-pp: 12px;
		--trans-x-pp: 0;*/
		position: absolute;
		display: inline-block;
		top: -1px;
		left: 0;
		width: 12px;
		background: rgba(255, 255, 255, 0.7);
		height: calc(100% + 2px);
		z-index: 200;
		box-shadow: 0 0 4px #ffc inset;
		pointer-events: none;
		transform: translateX(-6px);
		/*transform: translate(calc(var(--trans-x-pp) - var(--width-pp) / 2), -50%);*/
		will-change: transform;
		mix-blend-mode: lighten;
	}
	.is-loading .seekBarPointer {
		display: none !important;
	}
	.is-dragging .seekBarPointer.is-notSmooth {
		transition: none;
	}
	.is-dragging .seekBarPointer::after,
	.is-wheelSeeking .seekBarPointer::after {
		content: '';
		position: absolute;
		width: 36px;
		height: 36px;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: 100%;
		box-shadow: 0 0 8px #ffc inset, 0 0 8px #ffc;
		pointer-events: none;
	}
	.seekBarContainer .seekBar .seekRange {
		-webkit-appearance: none;
		position: absolute;
		width: 100vw;
		height: 100%;
		cursor: pointer;
		opacity: 0;
		pointer-events: auto;
	}
	.seekRange::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 10px;
		width: 2px;
	}
	.seekRange::-moz-range-thumb {
		height: 10px;
		width: 2px;
	}
	.videoControlBar .videoTime {
		display: inline-flex;
		top: 0;
		padding: 0;
		width: 96px;
		height: 18px;
		line-height: 18px;
		contain: strict;
		color: #fff;
		font-size: 12px;
		white-space: nowrap;
		vertical-align: middle;
		background: rgba(33, 33, 33, 0.5);
		border: 0;
		pointer-events: none;
		user-select: none;
	}
	.videoControlBar .videoTime .currentTimeLabel,
	.videoControlBar .videoTime .currentTime,
	.videoControlBar .videoTime .duration {
		position: relative;
		display: inline-block;
		color: #fff;
		text-align: center;
		background: inherit;
		border: 0;
		width: 44px;
		font-family: 'Yu Gothic', 'YuGothic', 'Courier New', Osaka-mono, 'ＭＳ ゴシック', monospace;
	}
	.videoControlBar.is-loading .videoTime {
		display: none;
	}
	.seekBarContainer .tooltip {
		position: absolute;
		padding: 1px;
		bottom: 12px;
		left: 0;
		transform: translate(-50%, 0);
		white-space: nowrap;
		font-size: 10px;
		opacity: 0;
		border: 1px solid #000;
		background: #fff;
		color: #000;
		z-index: 150;
	}
	.is-dragging .seekBarContainer .tooltip,
	.seekBarContainer:hover .tooltip {
		opacity: 0.8;
	}
	.resumePointer {
		position: absolute;
		mix-blend-mode: color-dodge;
		will-change: transform;
		top: 0;
		z-index: 200;
	}
	.zenzaHeatMap {
		position: absolute;
		pointer-events: none;
		top: 0; left: 0;
		width: 100%;
		height: 100%;
		transform-origin: 0 0 0;
		will-change: transform;
		opacity: 0.5;
		z-index: 110;
	}
	.noHeatMap .zenzaHeatMap {
		display: none;
	}
	.loopSwitch {
		width:  32px;
		height: 32px;
		line-height: 30px;
		font-size: 20px;
		color: #888;
	}
	.loopSwitch:active {
		font-size: 15px;
	}
	.is-loop .loopSwitch {
		color: var(--enabled-button-color);
	}
	.loopSwitch .controlButtonInner {
		font-family: STIXGeneral;
	}
	.playbackRateMenu {
		bottom: 0;
		width: auto;
		width: 48px;
		height: 32px;
		line-height: 30px;
		font-size: 18px;
		white-space: nowrap;
		margin-right: 0;
	}
	.playbackRateSelectMenu {
		width: 180px;
		text-align: left;
		line-height: 20px;
		font-size: 18px !important;
	}
	.playbackRateSelectMenu ul {
		margin: 2px 8px;
	}
	.playbackRateSelectMenu li {
		padding: 3px 4px;
	}
	.screenModeMenu {
		width:  32px;
		height: 32px;
		line-height: 30px;
		font-size: 20px;
	}
	.screenModeMenu:active {
		font-size: 15px;
	}
	.screenModeMenu:focus-within {
		background: #888;
	}
	.screenModeMenu:focus-within .tooltip {
		display: none;
	}
	.screenModeMenu:active {
		font-size: 10px;
	}
	.screenModeSelectMenu {
		width: 148px;
		padding: 2px 4px;
		font-size: 12px;
		line-height: 15px;
	}
	.screenModeSelectMenu ul {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.screenModeSelectMenu ul li {
		display: inline-block;
		text-align: center;
		border: none !important;
		margin: 0 !important;
		padding: 0 !important;
	}
	.screenModeSelectMenu ul li span {
		border: 1px solid #ccc;
		width: 50px;
		margin: 2px 8px;
		padding: 4px 0;
	}
	body[data-screen-mode="3D"]       .screenModeSelectMenu li.mode3D span,
	body[data-screen-mode="sideView"] .screenModeSelectMenu li.sideView span,
	body[data-screen-mode="small"]    .screenModeSelectMenu li.small span,
	body[data-screen-mode="normal"]   .screenModeSelectMenu li.normal span,
	body[data-screen-mode="big"]      .screenModeSelectMenu li.big span,
	body[data-screen-mode="wide"]     .screenModeSelectMenu li.wide span {
		color: #ff9;
		border-color: #ff0;
	}
	.fullscreenControlBarModeMenu {
		display: none;
	}
	.fullscreenControlBarModeMenu .controlButtonInner {
		filter: grayscale(100%);
	}
	.fullscreenControlBarModeMenu:focus-within .controlButtonInner,
	.fullscreenControlBarModeMenu:hover .controlButtonInner {
		filter: grayscale(50%);
	}
					.is-fullscreen  .fullscreenSwitch .controlButtonInner .toFull,
	body:not(.is-fullscreen) .fullscreenSwitch .controlButtonInner .returnFull {
		display: none;
	}
	.videoControlBar .muteSwitch {
		margin-right: 0;
	}
	.videoControlBar .muteSwitch:active {
		font-size: 15px;
	}
	.zenzaPlayerContainer:not(.is-mute) .muteSwitch .mute-on,
														.is-mute  .muteSwitch .mute-off {
		display: none;
	}
	.videoControlBar .volumeControl {
		display: inline-block;
	}
	.videoControlBar .volumeRange {
		width: 64px;
		height: 8px;
		position: relative;
		vertical-align: middle;
		--back-color: #333;
		--fore-color: #ccc;
	}
	.is-mute .videoControlBar .volumeRange  {
		--fore-color: var(--back-color);
		pointer-events: none;
	}
	.prevVideo.playControl,
	.nextVideo.playControl {
		display: none;
	}
	.is-playlistEnable .prevVideo.playControl,
	.is-playlistEnable .nextVideo.playControl {
		display: inline-block;
	}
	.prevVideo,
	.nextVideo {
		font-size: 23px;
	}
	.prevVideo .controlButtonInner {
		transform: scaleX(-1);
	}
	.toggleStoryboard {
		visibility: hidden;
		pointer-events: none;
	}
	.is-storyboardAvailable .toggleStoryboard {
		visibility: visible;
		pointer-events: auto;
	}
	.zenzaStoryboardOpen .is-storyboardAvailable .toggleStoryboard {
		color: var(--enabled-button-color);
	}
	.toggleStoryboard .controlButtonInner {
		position: absolute;
		width: 20px;
		height: 20px;
		top: 50%;
		left: 50%;
		border-radius: 75% 16%;
		border: 1px solid;
		transform: translate(-50%, -50%) rotate(45deg);
		pointer-events: none;
		background:
			radial-gradient(
				currentColor,
				currentColor 6px,
				transparent 0
			);
	}
	.toggleStoryboard:active .controlButtonInner {
		transform: translate(-50%, -50%) scaleY(0.1) rotate(45deg);
	}
	.toggleStoryboard:active {
		transform: scale(0.75);
	}
	.videoServerTypeMenu {
		bottom: 0;
		min-width: 40px;
		height:    32px;
		line-height: 30px;
		font-size: 16px;
		white-space: nowrap;
	}
	.videoServerTypeMenu.is-dmc-playing  {
		text-shadow:
			0px 0px 8px var(--enabled-button-color),
			0px 0px 6px var(--enabled-button-color),
			0px 0px 4px var(--enabled-button-color),
			0px 0px 2px var(--enabled-button-color);
	}
	.is-mouseMoving .videoServerTypeMenu.is-dmc-playing {
		background: #336;
	}
	.is-youTube .videoServerTypeMenu {
		text-shadow:
			0px 0px 8px #fc9, 0px 0px 6px #fc9, 0px 0px 4px #fc9, 0px 0px 2px #fc9 !important;
	}
	.is-youTube .videoServerTypeMenu:not(.forYouTube),
	.videoServerTypeMenu.forYouTube {
		display: none;
	}
	.is-youTube .videoServerTypeMenu.forYouTube {
		display: inline-block;
	}
	.videoServerTypeMenu:active {
		font-size: 13px;
	}
	.videoServerTypeMenu:focus-within {
		background: #888;
	}
	.videoServerTypeMenu:focus-within .tooltip {
		display: none;
	}
	.videoServerTypeSelectMenu  {
		bottom: 44px;
		left: 50%;
		transform: translate(-50%, 0);
		width: 180px;
		text-align: left;
		line-height: 20px;
		font-size: 16px !important;
		text-shadow: none !important;
		cursor: default;
	}
	.videoServerTypeSelectMenu ul {
		margin: 2px 8px;
	}
	.videoServerTypeSelectMenu li {
		padding: 3px 4px;
	}
	.videoServerTypeSelectMenu li.selected {
		pointer-events: none;
		text-shadow: 0 0 4px #99f, 0 0 8px #99f !important;
	}
	.videoServerTypeSelectMenu .smileVideoQuality,
	.videoServerTypeSelectMenu .dmcVideoQuality {
		font-size: 80%;
		padding-left: 28px;
	}
	.videoServerTypeSelectMenu .currentVideoQuality {
		color: #ccf;
		font-size: 80%;
		text-align: center;
	}
	.videoServerTypeSelectMenu .dmcVideoQuality.selected     span:before,
	.videoServerTypeSelectMenu .smileVideoQuality.selected   span:before {
		left: 22px;
		font-size: 80%;
	}
	.videoServerTypeSelectMenu .currentVideoQuality.selected   span:before {
		display: none;
	}
	/* dmcを使用不能の時はdmc選択とdmc画質選択を薄く */
	.zenzaPlayerContainer:not(.is-dmcAvailable) .serverType.select-server-dmc,
	.zenzaPlayerContainer:not(.is-dmcAvailable) .dmcVideoQuality,
	.zenzaPlayerContainer:not(.is-dmcAvailable) .currentVideoQuality {
		opacity: 0.4;
		pointer-events: none;
		text-shadow: none !important;
	}
	.zenzaPlayerContainer:not(.is-dmcAvailable) .currentVideoQuality {
		display: none;
	}
	.zenzaPlayerContainer:not(.is-dmcAvailable) .serverType.select-server-dmc span:before,
	.zenzaPlayerContainer:not(.is-dmcAvailable) .dmcVideoQuality       span:before{
		display: none !important;
	}
	.zenzaPlayerContainer:not(.is-dmcAvailable) .serverType {
		pointer-events: none;
	}
	/* dmcを使用している時はsmileの画質選択を薄く */
	.is-dmc-playing .smileVideoQuality {
		display: none;
	}
	/* dmcを選択していない状態ではdmcの画質選択を隠す */
	.is-smile-playing .currentVideoQuality,
	.is-smile-playing .dmcVideoQuality {
		display: none;
	}
	@media screen and (max-width: 768px) {
		.controlItemContainer.center {
			left: 0%;
			transform: translate(0, 0);
		}
	}
	.ZenzaWatchVer {
		display: none;
	}
	.ZenzaWatchVer[data-env="DEV"] {
		display: inline-block;
		color: #999;
		position: absolute;
		right: 0;
		background: transparent !important;
		transform: translate(100%, 0);
		font-size: 12px;
		line-height: 32px;
		pointer-events: none;
	}
	.progressWave {
		display: none;
	}
	.is-stalled .progressWave,
	.is-loading .progressWave {
		display: inline-block;
		position: absolute;
		left: 0;
		top: 1px;
		z-index: 400;
		width: 40%;
		height: calc(100% - 2px);
		background: linear-gradient(
			to right,
			rgba(0,0,0,0),
			${util.toRgba('#ffffcc', 0.3)},
			rgba(0,0,0)
		);
		mix-blend-mode: lighten;
		animation-name: progressWave;
		animation-iteration-count: infinite;
		animation-duration: 4s;
		animation-timing-function: linear;
		animation-delay: -1s;
	}
	@keyframes progressWave {
		0%   { transform: translate3d(-100%, 0, 0) translate3d(-5vw, 0, 0); }
		100% { transform: translate3d(100%, 0, 0) translate3d(150vw, 0, 0); }
	}
	.is-seeking .progressWave {
		display: none;
	}
`, {className: 'videoControlBar'});
util.addStyle(`
	.videoControlBar {
		width: 100% !important; /* 100vwだと縦スクロールバーと被る */
	}
`, {className: 'screenMode for-popup videoControlBar', disabled: true});
util.addStyle(`
	body .videoControlBar {
		position: absolute !important; /* firefoxのバグ対策 */
		opacity: 0;
		background: none;
	}
	.volumeChanging .videoControlBar,
	.is-mouseMoving .videoControlBar {
		opacity: 0.7;
		background: rgba(0, 0, 0, 0.5);
	}
	.showVideoControlBar .videoControlBar {
		opacity: 1 !important;
		background: #000 !important;
	}
	.videoControlBar.is-dragging,
	.videoControlBar:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.9);
	}
	.fullscreenControlBarModeMenu {
		display: inline-block;
	}
	.fullscreenControlBarModeSelectMenu {
		padding: 2px 4px;
		font-size: 12px;
		line-height: 15px;
		font-size: 16px !important;
		text-shadow: none !important;
	}
	.fullscreenControlBarModeSelectMenu ul {
		margin: 2px 8px;
	}
	.fullscreenControlBarModeSelectMenu li {
		padding: 3px 4px;
	}
	.videoServerTypeSelectMenu li.selected {
		pointer-events: none;
		text-shadow: 0 0 4px #99f, 0 0 8px #99f !important;
	}
	.fullscreenControlBarModeMenu li:focus-within,
	body[data-fullscreen-control-bar-mode="auto"] .fullscreenControlBarModeMenu [data-param="auto"],
	body[data-fullscreen-control-bar-mode="always-show"] .fullscreenControlBarModeMenu [data-param="always-show"],
	body[data-fullscreen-control-bar-mode="always-hide"] .fullscreenControlBarModeMenu [data-param="always-hide"] {
		color: #ff9;
		outline: none;
	}
`, {className: 'screenMode for-full videoControlBar', disabled: true});
util.addStyle(`
	.screenModeSelectMenu {
		display: none;
	}
	.controlItemContainer.left {
		top: auto;
		transform-origin: top left;
	}
	.seekBarContainer {
		top: auto;
		bottom: 0;
		z-index: 300;
	}
	.seekBarContainer:hover .seekBarShadow {
		height: 14px;
		top: -12px;
	}
	.seekBar {
		margin-top: 0px;
		margin-bottom: -14px;
		height: 24px;
		transition: none;
	}
	.screenModeMenu {
		display: none;
	}
	.controlItemContainer.center {
		top: auto;
	}
	.zenzaStoryboardOpen .controlItemContainer.center {
		background: transparent;
	}
	.zenzaStoryboardOpen .controlItemContainer.center .scalingUI {
		background: rgba(32, 32, 32, 0.5);
	}
	.zenzaStoryboardOpen .controlItemContainer.center .scalingUI:hover {
		background: rgba(32, 32, 32, 0.8);
	}
	.controlItemContainer.right {
		top: auto;
	}
`, {className: 'screenMode for-screen-full videoControlBar', disabled: true});
	VideoControlBar.__tpl__ = (`
		<div class="videoControlBar" data-command="nop">
			<div class="seekBarContainer">
				<div class="seekBarShadow"></div>
				<div class="seekBar">
					<div class="seekBarPointer"></div>
					<div class="bufferRange"></div>
					<div class="progressWave"></div>
					<input type="range" class="seekRange" min="0" step="any">
					<canvas width="200" height="10" class="heatMap zenzaHeatMap"></canvas>
				</div>
				<zenza-seekbar-label class="resumePointer" data-command="seekTo" data-text="ここまで見た"></zenza-seekbar-label>
				<zenza-seekbar-label class="resumePointer" data-command="seekTo" data-text="ここまで見た"></zenza-seekbar-label>
				<zenza-seekbar-label class="resumePointer" data-command="seekTo" data-text="ここまで見た"></zenza-seekbar-label>
				<zenza-seekbar-label class="resumePointer" data-command="seekTo" data-text="ここまで見た"></zenza-seekbar-label>
				<zenza-seekbar-label class="resumePointer" data-command="seekTo" data-text="ここまで見た"></zenza-seekbar-label>
			</div>
			<div class="controlItemContainer left">
				<div class="scalingUI">
					<div class="ZenzaWatchVer" data-env="${ZenzaWatch.env}">ver ${ZenzaWatch.version}${ZenzaWatch.env === 'DEV' ? '(Dev)' : ''}</div>
				</div>
			</div>
			<div class="controlItemContainer center">
				<div class="scalingUI">
					<div class="seekBarContainer-mainControl">
						<div class="prevVideo controlButton playControl" data-command="playPreviousVideo" data-param="0">
							<div class="controlButtonInner">&#x27A0;</div>
							<div class="tooltip">前の動画</div>
						</div>
						<div class="toggleStoryboard controlButton playControl forPremium" data-command="toggleStoryboard">
							<div class="controlButtonInner"></div>
							<div class="tooltip">シーンサーチ</div>
						</div>
						<div class="loopSwitch controlButton playControl" data-command="toggle-loop">
							<div class="controlButtonInner">&#8635;</div>
							<div class="tooltip">リピート</div>
						</div>
						<div class="seekTop controlButton playControl" data-command="seek" data-param="0">
							<div class="controlButtonInner">&#8676;</div>
							<div class="tooltip">先頭</div>
						</div>
						<div class="togglePlay controlButton playControl" data-command="togglePlay">
							<span class="pause"></span>
							<span class="play">▶</span>
						</div>
						<div class="playbackRateMenu controlButton" tabindex="-1" data-has-submenu="1">
							<div class="controlButtonInner"></div>
							<div class="tooltip">再生速度</div>
							<div class="playbackRateSelectMenu zenzaPopupMenu zenzaSubMenu">
								<div class="triangle"></div>
								<p class="caption">再生速度</p>
								<ul>
									<li class="playbackRate" data-command="playbackRate" data-param="10"><span>10倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="5"  ><span>5倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="4"  ><span>4倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="3"  ><span>3倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="2"  ><span>2倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="1.75"><span>1.75倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="1.5"><span>1.5倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="1.25"><span>1.25倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="1.0"><span>標準速度(x1)</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="0.75"><span>0.75倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="0.5"><span>0.5倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="0.25"><span>0.25倍</span></li>
									<li class="playbackRate" data-command="playbackRate" data-param="0.1"><span>0.1倍</span></li>
								</ul>
							</div>
						</div>
						<div class="videoTime">
							<span class="currentTimeLabel"></span>/<span class="durationLabel"></span>
						</div>
						<div class="muteSwitch controlButton" data-command="toggle-mute">
							<div class="tooltip">ミュート(M)</div>
							<div class="menuButtonInner mute-off">&#x1F50A;</div>
							<div class="menuButtonInner mute-on">&#x1F507;</div>
						</div>
						<div class="volumeControl">
							<zenza-range-bar><input class="volumeRange" type="range" value="0.5" min="0.01" max="1" step="any"></zenza-range-bar>
						</div>
						<div class="nextVideo controlButton playControl" data-command="playNextVideo" data-param="0">
							<div class="controlButtonInner">&#x27A0;</div>
							<div class="tooltip">次の動画</div>
						</div>
					</div>
				</div>
			</div>
			<div class="controlItemContainer right">
				<div class="scalingUI">
					<div class="videoServerTypeMenu controlButton forYouTube" data-command="reload" title="ZenTube解除">
						<div class="controlButtonInner">画</div>
					</div>
					<div class="videoServerTypeMenu controlButton" tabindex="-1" data-has-submenu="1">
						<div class="controlButtonInner">画</div>
						<div class="tooltip">動画サーバー・画質</div>
						<div class="videoServerTypeSelectMenu zenzaPopupMenu zenzaSubMenu">
							<div class="triangle"></div>
							<p class="caption">動画サーバー・画質</p>
							<ul>
								<li class="serverType select-server-dmc" data-command="update-videoServerType" data-param="dmc">
									<span>新システムを使用</span>
									<p class="currentVideoQuality"></p>
								</li>
								<li class="dmcVideoQuality selected select-dmc-auto" data-command="update-dmcVideoQuality" data-param="auto"><span>自動(auto)</span></li>
								<li class="dmcVideoQuality selected select-dmc-veryhigh" data-command="update-dmcVideoQuality" data-param="veryhigh"><span>超(1080) 優先</span></li>
								<li class="dmcVideoQuality selected select-dmc-high" data-command="update-dmcVideoQuality" data-param="high"><span>高(720) 優先</span></li>
								<li class="dmcVideoQuality selected select-dmc-mid"  data-command="update-dmcVideoQuality" data-param="mid"><span>中(480-540)</span></li>
								<li class="dmcVideoQuality selected select-dmc-low"  data-command="update-dmcVideoQuality" data-param="low"><span>低(360)</span></li>
								<li class="serverType select-server-smile" data-command="update-videoServerType" data-param="smile">
									<span>旧システムを使用</span>
								</li>
								<li class="smileVideoQuality select-smile-default" data-command="update-forceEconomy" data-param="false" data-type="bool"><span>自動</span></li>
								<li class="smileVideoQuality select-smile-economy" data-command="update-forceEconomy" data-param="true"  data-type="bool"><span>エコノミー固定</span></li>
						</ul>
						</div>
					</div>
					<div class="screenModeMenu controlButton" tabindex="-1" data-has-submenu="1">
						<div class="tooltip">画面サイズ・モード変更</div>
						<div class="controlButtonInner">&#9114;</div>
						<div class="screenModeSelectMenu zenzaPopupMenu zenzaSubMenu">
							<div class="triangle"></div>
							<p class="caption">画面モード</p>
							<ul>
								<li class="screenMode mode3D"   data-command="screenMode" data-param="3D"><span>3D</span></li>
								<li class="screenMode small"    data-command="screenMode" data-param="small"><span>小</span></li>
								<li class="screenMode sideView" data-command="screenMode" data-param="sideView"><span>横</span></li>
								<li class="screenMode normal"   data-command="screenMode" data-param="normal"><span>中</span></li>
								<li class="screenMode wide"     data-command="screenMode" data-param="wide"><span>WIDE</span></li>
								<li class="screenMode big"      data-command="screenMode" data-param="big"><span>大</span></li>
							</ul>
						</div>
					</div>
					<div class="fullscreenControlBarModeMenu controlButton" tabindex="-1" data-has-submenu="1">
						<div class="tooltip">ツールバーの表示</div>
						<div class="controlButtonInner">&#128204;</div>
						<div class="fullscreenControlBarModeSelectMenu zenzaPopupMenu zenzaSubMenu">
							<div class="triangle"></div>
							<p class="caption">ツールバーの表示</p>
							<ul>
								<li tabindex="-1" data-command="update-fullscreenControlBarMode" data-param="always-show"><span>常に固定</span></li>
								<li tabindex="-1" data-command="update-fullscreenControlBarMode" data-param="always-hide"><span>常に隠す</span></li>
								<li tabindex="-1" data-command="update-fullscreenControlBarMode" data-param="auto"><span>画面サイズ自動</span></li>
							</ul>
						</div>
					</div>
					<div class="fullscreenSwitch controlButton" data-command="fullscreen">
						<div class="tooltip">フルスクリーン(F)</div>
						<div class="controlButtonInner">
							<!-- TODO: YouTubeと同じにする -->
							<span class="toFull">&#8690;</span>
							<span class="returnFull">&#8689;</span>
						</div>
					</div>
					<div class="settingPanelSwitch controlButton" data-command="settingPanel">
						<div class="controlButtonInner">&#x2699;</div>
						<div class="tooltip">設定</div>
					</div>
				</div>
			</div>
		</div>
	`).trim();
//@require HeatMapWorker
	class CommentPreviewModel extends Emitter {
		reset() {
			this._chatReady = false;
			this._vpos = -1;
			this.emit('reset');
		}
		set chatList(chatList) {
			const list = chatList
				.top
				.concat(chatList.naka, chatList.bottom)
				.sort((a, b) => a.vpos - b.vpos);
			this._chatList = list;
			this._chatReady = true;
			this.update();
		}
		get chatList() {
			return this._chatList || [];
		}
		set currentTime(sec) {
			this.vpos = sec * 100;
		}
		set vpos(vpos) {
			if (this._vpos !== vpos) {
				this._vpos = vpos;
				this.emit('vpos', vpos);
			}
		}
		get currentIndex() {
			if (this._vpos < 0 || !this._chatReady) {
				return -1;
			}
			return this.getVposIndex(this._vpos);
		}
		getVposIndex(vpos) {
			const list = this._chatList;
			if (!list) { return -1; }
			for (let i = list.length - 1; i >= 0; i--) {
				const chat = list[i], cv = chat.vpos;
				if (cv <= vpos - 400) {
					return i + 1;
				}
			}
			return -1;
		}
		get currentChatList() {
			if (this._vpos < 0 || !this._chatReady) {
				return [];
			}
			return this.getItemByVpos(this._vpos);
		}
		getItemByVpos(vpos) {
			const list = this._chatList;
			const result = [];
			for (let i = 0, len = list.length; i < len; i++) {
				const chat = list[i], cv = chat.vpos, diff = vpos - cv;
				if (diff >= -100 && diff <= 400) {
					result.push(chat);
				}
			}
			return result;
		}
		getItemByUniqNo(uniqNo) {
			return this._chatList.find(chat => chat.uniqNo === uniqNo);
		}
		update() {
			this.emit('update');
		}
	}
	class CommentPreviewView {
		constructor(params) {
			const model = this._model = params.model;
			this._$parent = params.$container;
			this._inviewTable = new Map;
			this._chatList = [];
			this._initializeDom(this._$parent);
			model.on('reset',  this._onReset.bind(this));
			model.on('update', _.debounce(this._onUpdate.bind(this), 10));
			model.on('vpos', this._onVpos.bind(this));
			this._mode = 'hover';
			this._left = 0;
			this.update = _.throttle(this.update.bind(this), 200);
			this.applyView = throttle.raf(this.applyView.bind(this));
		}
		_initializeDom($parent) {
			cssUtil.registerProps(
				{name: '--buffer-range-left', syntax: '<percentage>', initialValue: '0%',inherits: false},
				{name: '--buffer-range-scale', syntax: '<number>', initialValue: 0, inherits: false},
			);
			const $view = util.$.html(CommentPreviewView.__tpl__);
			const view = this._view = $view[0];
			this._list = view.querySelector('.listContainer');
			$view.on('click', this._onClick.bind(this))
				.on('wheel', e => e.stopPropagation(), {passive: true})
				.on('scroll',
				_.throttle(this._onScroll.bind(this), 50, {trailing: false}), {passive: true});
			$parent.append($view);
		}
		set mode(v) {
			if (v === 'list') {
				util.StyleSwitcher.update({
					on: '.commentPreview.list', off: '.commentPreview.hover'});
			} else {
				util.StyleSwitcher.update({
					on: '.commentPreview.hover', off: '.commentPreview.list'});
			}
			this._mode = v;
		}
		_onClick(e) {
			e.stopPropagation();
			const target = e.target.closest('[data-command]');
			const view = this._view;
			const command = target ? target.dataset.command : '';
			const nicoChatElement = e.target.closest('.nicoChat');
			const uniqNo = parseInt(nicoChatElement.dataset.nicochatUniqNo, 10);
			const nicoChat  = this._model.getItemByUniqNo(uniqNo);
			if (command && nicoChat) {
				view.classList.add('is-updating');
				window.setTimeout(() => view.classList.remove('is-updating'), 3000);
				switch (command) {
					case 'addUserIdFilter':
						util.dispatchCommand(e.target, command, nicoChat.userId);
						break;
					case 'addWordFilter':
						util.dispatchCommand(e.target, command, nicoChat.text);
						break;
					case 'addCommandFilter':
						util.dispatchCommand(e.target, command, nicoChat.cmd);
						break;
				}
				return;
			}
			const vpos = nicoChatElement.dataset.vpos;
			if (vpos !== undefined) {
				util.dispatchCommand(e.target, 'seek', vpos / 100);
			}
		}
		_onUpdate() {
			this.updateList();
		}
		_onVpos(vpos) {
			const itemHeight = CommentPreviewView.ITEM_HEIGHT;
			const index = this._currentStartIndex = Math.max(0, this._model.currentIndex);
			this._currentEndIndex = Math.max(0, this._model.getVposIndex(vpos + 400));
			this._scrollTop = itemHeight * index;
			this._currentTime = vpos / 100;
			this._refreshInviewElements(this._scrollTop);
		}
		_onResize() {
			this._refreshInviewElements();
		}
		_onScroll() {
			this._scrollTop = -1;
			this._refreshInviewElements();
		}
		_onReset() {
			this._list.textContent = '';
			this._inviewTable.clear();
			this._scrollTop = 0;
			this._newListElements = null;
			this._chatList = [];
		}
		updateList() {
			const chatList = this._chatList = this._model.chatList;
			if (!chatList.length) {
				this._isListUpdated = false;
				return;
			}
			const itemHeight = CommentPreviewView.ITEM_HEIGHT;
			this._list.style.height = `${(chatList.length + 2) * itemHeight}px`;
			this._isListUpdated = false;
		}
		_refreshInviewElements(scrollTop) {
			if (!this._view) { return; }
			const itemHeight = CommentPreviewView.ITEM_HEIGHT;
			scrollTop = _.isNumber(scrollTop) ? scrollTop : this._view.scrollTop;
			const viewHeight = CommentPreviewView.MAX_HEIGHT;
			const viewBottom = scrollTop + viewHeight;
			const chatList = this._chatList;
			if (!chatList || chatList.length < 1) { return; }
			const startIndex =
				this._mode === 'list' ?
					Math.max(0, Math.floor(scrollTop / itemHeight) - 5) :
					this._currentStartIndex;
					const endIndex   =
				this._mode === 'list' ?
					Math.min(chatList.length, Math.floor(viewBottom / itemHeight) + 5) :
					Math.min(this._currentEndIndex, this._currentStartIndex + 15);
			const newItems = [], inviewTable = this._inviewTable;
			for (let i = startIndex; i < endIndex; i++) {
				const chat = chatList[i];
				if (inviewTable.has(i) || !chat) { continue; }
				const listItem = CommentPreviewChatItem.create(chat, i);
				newItems.push(listItem);
				inviewTable.set(i, listItem);
			}
			if (newItems.length < 1) { return; }
			for (const i of inviewTable.keys()) {
				if (i >= startIndex && i <= endIndex) { continue; }
				inviewTable.get(i).remove();
				inviewTable.delete(i);
			}
			this._newListElements = this._newListElements || document.createDocumentFragment();
			this._newListElements.append(...newItems);
			this.applyView();
		}
		get isEmpty() {
			return this._chatList.length < 1;
		}
		update(left) {
			if (this._isListUpdated) {
				this.updateList();
			}
			if (this.isEmpty) {
				return;
			}
			const width = this._mode === 'list' ?
				CommentPreviewView.WIDTH : CommentPreviewView.HOVER_WIDTH;
			const containerWidth = this._innerWidth = this._innerWidth || global.innerWidth;
			left = Math.min(Math.max(0, left - CommentPreviewView.WIDTH / 2), containerWidth - width);
			this._left = left;
			this.applyView();
		}
		applyView() {
			const view = this._view;
			cssUtil.setProps(
				[view, '--current-time', cssUtil.s(this._currentTime)],
				[view, '--scroll-top', cssUtil.px(this._scrollTop)],
				[view, '--trans-x-pp', cssUtil.px(this._left)]
			);
			if (this._newListElements && this._newListElements.childElementCount) {
				this._list.append(this._newListElements);
			}
			if (this._scrollTop > 0 && this._mode === 'list') {
				this._view.scrollTop = this._scrollTop;
				this._scrollTop = -1;
			}
		}
		hide() {
		}
	}
	class CommentPreviewChatItem {
		static get html() {
			return `
			<li class="nicoChat">
				<span class="vposTime"></span>
				<span class="text"></span>
				<span class="addFilter addUserIdFilter"
					data-command="addUserIdFilter" title="NGユーザー">NGuser</span>
				<span class="addFilter addWordFilter"
					data-command="addWordFilter" title="NGワード">NGword</span>
			</li>
			`.trim();
		}
		static get template() {
			if (!this._template) {
				const t = document.createElement('template');
				t.id = `${this.name}_${Date.now()}`;
				t.innerHTML = this.html;
				const content = t.content;
				this._template = {
					clone: () => document.importNode(t.content, true),
					chat: content.querySelector('.nicoChat'),
					time: content.querySelector('.vposTime'),
					text: t.content.querySelector('.text')
				};
			}
			return this._template;
		}
		static create(chat, idx) {
			const itemHeight = CommentPreviewView.ITEM_HEIGHT;
			const text = chat.text;
			const date = (new Date(chat.date * 1000)).toLocaleString();
			const vpos = chat.vpos;
			const no = chat.no;
			const uniqNo = chat.uniqNo;
			const oe = idx % 2 === 0 ? 'even' : 'odd';
			const title = `${no} : 投稿日 ${date}\nID:${chat.userId}\n${text}\n`;
			const color = chat.color || '#fff';
			const shadow = color === '#fff' ? '' : `text-shadow: 0 0 1px ${color};`;
			const vposToTime = vpos => util.secToTime(Math.floor(vpos / 100));
			const t = this.template;
			t.chat.className = `nicoChat fork${chat.fork} ${oe}`;
			t.chat.id = `commentPreviewItem${idx}`;
			t.chat.dataset.vpos = vpos;
			t.chat.dataset.nicochatUniqNo = uniqNo;
			t.time.textContent = `${vposToTime(vpos)}: `;
			t.text.title = title;
			t.text.style = shadow;
			t.text.textContent = text;
			t.chat.style.cssText = `
				top: ${idx * itemHeight}px;
				--duration: ${chat.duration}s;
				--vpos-time: ${chat.vpos / 100}s;
			`;
			return t.clone().firstElementChild;
		}
	}
CommentPreviewView.MAX_HEIGHT = 200;
CommentPreviewView.WIDTH = 350;
CommentPreviewView.HOVER_WIDTH = 180;
CommentPreviewView.ITEM_HEIGHT = 20;
CommentPreviewView.__tpl__ = (`
	<div class="zenzaCommentPreview">
		<div class="listContainer"></div>
	</div>
	`).trim();
util.addStyle(`
	.zenzaCommentPreview {
		display: none;
		position: absolute;
		bottom: 16px;
		opacity: 0.8;
		max-height: ${CommentPreviewView.MAX_HEIGHT}px;
		width: ${CommentPreviewView.WIDTH}px;
		box-sizing: border-box;
		color: #ccc;
		overflow: hidden;
		transform: translate(var(--trans-x-pp), 0);
		transition: --trans-x-pp 0.2s;
		will-change: transform;
	}
	.zenzaCommentPreview * {
		box-sizing: border-box;
	}
	.is-wheelSeeking .zenzaCommentPreview,
	.seekBarContainer:hover .zenzaCommentPreview {
		display: block;
	}
`, {className: 'commentPreview'});
util.addStyle(`
	.zenzaCommentPreview {
		border-bottom: 24px solid transparent;
		background: rgba(0, 0, 0, 0.4);
		z-index: 100;
		overflow: auto;
	}
	.zenzaCommentPreview:hover {
		background: black;
	}
	.zenzaCommentPreview.is-updating {
		transition: opacity 0.2s ease;
		opacity: 0.3;
		cursor: wait;
	}
	.zenzaCommentPreview.is-updating * {
		pointer-evnets: none;
	}
	.listContainer {
		bottom: auto;
		padding: 4px;
		pointer-events: none;
	}
	.zenzaCommentPreview:hover .listContainer {
		pointer-events: auto;
	}
	.listContainer .nicoChat {
		position: absolute;
		left: 0;
		display: block;
		width: 100%;
		height: ${CommentPreviewView.ITEM_HEIGHT}px;
		padding: 2px 4px;
		cursor: pointer;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		animation-duration: var(--duration);
		animation-delay: calc(var(--vpos-time) - var(--current-time) - 1s);
		animation-name: preview-text-inview;
		animation-timing-function: linear;
		animation-play-state: paused !important;
	}
	@keyframes preview-text-inview {
		0% {
			color: #ffc;
		}
		100% {
			color: #ffc;
		}
	}
	.listContainer:hover .nicoChat.odd {
		background: #333;
	}
	.listContainer .nicoChat.fork1 .vposTime {
		color: #6f6;
	}
	.listContainer .nicoChat.fork2 .vposTime {
		color: #66f;
	}
	.listContainer .nicoChat .no,
	.listContainer .nicoChat .date,
	.listContainer .nicoChat .userId {
		display: none;
	}
	.listContainer .nicoChat:hover .no,
	.listContainer .nicoChat:hover .date,
	.listContainer .nicoChat:hover .userId {
		display: inline-block;
		white-space: nowrap;
	}
	.listContainer .nicoChat .text {
		color: inherit !important;
	}
	.listContainer .nicoChat:hover .text {
		color: #fff !important;
	}
	.listContainer .nicoChat .text:hover {
		text-decoration: underline;
	}
	.listContainer .nicoChat .addFilter {
		display: none;
		position: absolute;
		font-size: 10px;
		color: #fff;
		background: #666;
		cursor: pointer;
		top: 0;
	}
	.listContainer .nicoChat:hover .addFilter {
		display: inline-block;
		border: 1px solid #ccc;
		box-shadow: 2px 2px 2px #333;
	}
	.listContainer .nicoChat .addFilter.addUserIdFilter {
		right: 8px;
		width: 48px;
	}
	.listContainer .nicoChat .addFilter.addWordFilter {
		right: 64px;
		width: 48px;
	}
	.listContainer .nicoChat .addFilter:active {
		transform: translateY(2px);
	}
	.zenzaScreenMode_sideView .zenzaCommentPreview,
	.zenzaScreenMode_small .zenzaCommentPreview {
		background: rgba(0, 0, 0, 0.9);
	}
`, {className: 'commentPreview list'});
util.addStyle(`
	.zenzaCommentPreview {
		bottom: 24px;
		box-sizing: border-box;
		height: 140px;
		z-index: 160;
		transition: none;
		color: #fff;
		opacity: 0.6;
		overflow: hidden;
		pointer-events: none;
		user-select: none;
		contain: layout style size paint;
		filter: drop-shadow(0 0 1px #000);
	}
	.listContainer {
		bottom: auto;
		width: 100%;
		height: 100% !important;
		margin: auto;
		border: none;
		contain: layout style size paint;
	}
	.listContainer .nicoChat {
		display: block;
		top: auto !important;
		font-size: 16px;
		line-height: 18px;
		height: 18px;
		white-space: nowrap;
	}
	.listContainer .nicoChat:nth-child(n + 8) {
		transform: translateY(-144px);
	}
	.listContainer .nicoChat:nth-child(n + 16) {
		transform: translateY(-288px);
	}
	.listContainer .nicoChat .text {
		display: inline-block;
		text-shadow: 1px 1px 1px #fff;
		transform: translateX(260px);
		visibility: hidden;
		will-change: transform;
		animation-duration: var(--duration);
		animation-delay: calc(var(--vpos-time) - var(--current-time) - 1s);
		animation-play-state: paused !important;
		animation-name: preview-text-moving;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}
	.listContainer .nicoChat .vposTime,
	.listContainer .nicoChat .addFilter {
		display: none !important;
	}
	@keyframes preview-text-moving {
		0% {
			visibility: visible;
		}
		100% {
			visibility: hidden;
			transform: translateX(85px) translateX(-100%);
		}
	}
`, {className: 'commentPreview hover', disabled: true});
	class CommentPreview {
		constructor(params) {
			this._model = new CommentPreviewModel({});
			this._view = new CommentPreviewView({
				model:      this._model,
				$container: params.$container
			});
			this.reset();
		}
		reset() {
			this._model.reset();
			this._view.hide();
		}
		set chatList(chatList) {
			this._model.chatList = chatList;
		}
		set currentTime(sec) {
			this._model.currentTime = sec;
		}
		update(left) {
			this._view.update(left);
		}
		hide() {
		}
		set mode(v) {
			if (v === this._mode) { return; }
			this._mode = v;
			this._view.mode = v;
		}
		get mode() {
			return this._mode;
		}
	}
	class SeekBarToolTip {
		constructor(params) {
			this._$container = params.$container;
			this._storyboard = params.storyboard;
			this._initializeDom(params.$container);
			this._boundOnRepeat = this._onRepeat.bind(this);
			this._boundOnMouseUp = this._onMouseUp.bind(this);
		}
		_initializeDom($container) {
			util.addStyle(SeekBarToolTip.__css__);
			const $view = this._$view = util.$.html(SeekBarToolTip.__tpl__);
			this._currentTime = $view.find('.currentTime')[0];
			this.currentTimeLabel = TextLabel.create({
				container: this._currentTime,
				name: 'currentTimeLabel',
				text: '00:00',
				style: {
					widthPx: 50,
					heightPx: 16,
					fontFamily: 'monospace',
					fontWeight: '',
					fontSizePx: 12,
					color: '#ccc'
				}
			});
			$view
				.on('mousedown',this._onMouseDown.bind(this))
				.on('click', e => { e.stopPropagation(); e.preventDefault(); });
			this._seekBarThumbnail = new SeekBarThumbnail({
				storyboard: this._storyboard,
				container: $view.find('.seekBarThumbnailContainer')[0]
			});
			$container.append($view);
		}
		_onMouseDown(e) {
			e.stopPropagation();
			const target = e.target.closest('[data-command]');
			if (!target) {
				return;
			}
			const {command, param, repeat} = target.dataset;
			if (!command) { return; }
			util.dispatchCommand(e.target, command, param);
			if (repeat === 'on') {
				this._beginRepeat(command, param);
			}
		}
		_onMouseUp(e) {
			e.preventDefault();
			this._endRepeat();
		}
		_beginRepeat(command, param) {
			this._repeatCommand = command;
			this._repeatParam   = param;
			util.$('body')
				.on('mouseup.zenzaSeekbarToolTip', this._boundOnMouseUp);
			this._$view
				.on('mouseleave', this._boundOnMouseUp)
				.on('mouseup', this._boundOnMouseUp);
			if (this._repeatTimer) {
				window.clearInterval(this._repeatTimer);
			}
			this._repeatTimer = window.setInterval(this._boundOnRepeat, 200);
			this._isRepeating = true;
		}
		_endRepeat() {
			this._isRepeating = false;
			if (this._repeatTimer) {
				window.clearInterval(this._repeatTimer);
				this._repeatTimer = null;
			}
			util.$('body').off('mouseup.zenzaSeekbarToolTip');
			this._$view.off('mouseleave').off('mouseup');
		}
		_onRepeat() {
			if (!this._isRepeating) {
				this._endRepeat();
				return;
			}
			util.dispatchCommand(this._$view[0], this._repeatCommand, this._repeatParam);
		}
		update(sec, left) {
			const timeText = util.secToTime(sec);
			if (this._timeText === timeText) { return; }
			this._timeText = timeText;
			this.currentTimeLabel && (this.currentTimeLabel.text = timeText);
			const w  = this.offsetWidth = this.offsetWidth || this._$view[0].offsetWidth;
			const vw = this._innerWidth = this._innerWidth || window.innerWidth;
			left = Math.max(0, Math.min(left - w / 2, vw - w));
			cssUtil.setProps([this._$view[0], '--trans-x-pp', cssUtil.px(left)]);
			this._seekBarThumbnail.currentTime = sec;
		}
	}
	SeekBarToolTip.__css__ = (`
		.seekBarToolTip {
			position: absolute;
			display: inline-block;
			visibility: hidden;
			z-index: 300;
			position: absolute;
			box-sizing: border-box;
			bottom: 24px;
			left: 0;
			width: 180px;
			white-space: nowrap;
			font-size: 10px;
			background: rgba(0, 0, 0, 0.3);
			z-index: 150;
			opacity: 0;
			border: 1px solid #666;
			border-radius: 8px;
			padding: 8px 4px 0;
			will-change: transform;
			transform: translate(var(--trans-x-pp), 0);
			pointer-events: none;
		}
		.is-wheelSeeking .seekBarToolTip,
		.is-dragging .seekBarToolTip,
		.seekBarContainer:hover  .seekBarToolTip {
			opacity: 1;
			visibility: visible;
		}
		.seekBarToolTipInner {
			padding-bottom: 10px;
			pointer-events: auto;
			display: flex;
			text-align: center;
			vertical-aligm: middle;
			width: 100%;
		}
		.is-wheelSeeking .seekBarToolTipInner,
		.is-dragging .seekBarToolTipInner {
			pointer-events: none;
		}
		.seekBarToolTipInner>* {
			flex: 1;
		}
		.seekBarToolTip .currentTime {
			display: inline-block;
			height: 16px;
			margin: 4px 0;
		}
		.seekBarToolTip .controlButton {
			display: inline-block;
			width: 40px;
			height: 28px;
			line-height: 22px;
			font-size: 20px;
			border-radius: 50%;
			margin: 0;
			cursor: pointer;
		}
		.seekBarToolTip .controlButton * {
			cursor: pointer;
		}
		.seekBarToolTip .controlButton:hover {
			text-shadow: 0 0 8px #fe9;
			box-shdow: 0 0 8px #fe9;
		}
		.seekBarToolTip .controlButton:active {
			font-size: 16px;
		}
		.seekBarToolTip .controlButton.toggleCommentPreview {
			opacity: 0.5;
		}
		.enableCommentPreview .seekBarToolTip .controlButton.toggleCommentPreview {
			opacity: 1;
			background: rgba(0,0,0,0.01);
		}
		.is-fullscreen .seekBarToolTip {
			bottom: 10px;
		}
	`).trim();
	SeekBarToolTip.__tpl__ = (`
		<div class="seekBarToolTip">
			<div class="seekBarThumbnailContainer"></div>
			<div class="seekBarToolTipInner">
				<div class="seekBarToolTipButtonContainer">
					<div class="controlButton backwardSeek" data-command="seekBy" data-param="-5" title="5秒戻る" data-repeat="on">
						<div class="controlButtonInner">⇦</div>
					</div>
					<div class="currentTime"></div>
					<div class="controlButton toggleCommentPreview" data-command="toggleConfig" data-param="enableCommentPreview" title="コメントのプレビュー表示">
						<div class="menuButtonInner">💬</div>
					</div>
					<div class="controlButton forwardSeek" data-command="seekBy" data-param="5" title="5秒進む" data-repeat="on">
						<div class="controlButtonInner">⇨</div>
					</div>
				</div>
			</div>
		</div>
	`).trim();
	class SmoothSeekBarPointer {
		constructor(params) {
			this._pointer = params.pointer;
			this._currentTime = 0;
			this._duration = 1;
			this._playbackRate = 1;
			this._isSmoothMode = false;
			this._isPausing = true;
			this._isSeeking = false;
			this._isStalled = false;
			this.refresh = throttle.raf(this.refresh.bind(this));
			this.transformLeft = 0;
			this.applyTransform = throttle.raf(() => {
				const per = Math.min(100, this._timeToPer(this._currentTime));
				this._pointer.style.transform = `translateX(${global.innerWidth * per / 100 - 6}px)`;
			});
			this._pointer.classList.toggle('is-notSmooth', !this._isSmoothMode);
			params.playerState.onkey('isPausing', v => this.isPausing = v);
			params.playerState.onkey('isSeeking', v => this.isSeeking = v);
			params.playerState.onkey('isStalled', v => this.isStalled = v);
			if (this._isSmoothMode) {
				WindowResizeObserver.subscribe(() => this.refresh());
			}
		}
		get currentTime() {
			return this._currentTime;
		}
		set currentTime(v) {
			if (!this._isSmoothMode) {
				this._currentTime = v;
				return this.applyTransform();
			}
			if (document.hidden) { return; }
			if (this._currentTime === v) {
				if (this.isPlaying) {
					this._animation.currentTime = v;
					this.isStalled = true;
					return;
				}
			} else {
				if (this.isStalled) {
					this.isStalled = false;
				}
			}
			this._currentTime = v;
			if (this._animation &&
				Math.abs(v * 1000 - this._animation.currentTime) > 300) {
				this._animation.currentTime = v * 1000;
			}
		}
		_timeToPer(time) {
			return (time / Math.max(this._duration, 1)) * 100;
		}
		set duration(v) {
			if (this._duration === v) { return; }
			this._duration = v;
			this.refresh();
		}
		set playbackRate(v) {
			if (this._playbackRate === v) { return; }
			this._playbackRate = v;
			if (!this._animation) { return; }
			this._animation.playbackRate = v;
		}
		get isPausing() {
			return this._isPausing;
		}
		set isPausing(v) {
			if (this._isPausing === v) { return; }
			this._isPausing = v;
			this._updatePlaying();
		}
		get isSeeking() {
			return this._isSeeking;
		}
		set isSeeking(v) {
			if (this._isSeeking === v) { return; }
			this._isSeeking = v;
			this._updatePlaying();
		}
		get isStalled() {
			return this._isStalled;
		}
		set isStalled(v) {
			if (this._isStalled === v) { return; }
			this._isStalled = v;
			this._updatePlaying();
		}
		get isPlaying() {
			return !this.isPausing && !this.isStalled && !this.isSeeking;
		}
		_updatePlaying() {
			if (!this._animation) { return; }
			if (this.isPlaying) {
				this._animation.play();
			} else {
				this._animation.pause();
			}
		}
		refresh() {
			if (!this._isSmoothMode) { return; }
			if (this._animation) {
				this._animation.finish();
			}
			this._animation = this._pointer.animate([
				{transform: 'translateX(-6px)'},
				{transform: `translateX(${global.innerWidth - 6}px)`}
			], {duration: this._duration * 1000, fill: 'backwards'});
			this._animation.currentTime = this._currentTime * 1000;
			this._animation.playbackRate = this._playbackRate;
			if (this.isPlaying) {
				this._animation.play();
			} else {
				this._animation.pause();
			}
		}
	}
	class WheelSeeker extends BaseViewComponent {
		static get template() {
			return `
				<div class="root" style="display: none;">
				</div>
			`;
		}
		constructor(params) {
			super({
				parentNode: params.parentNode,
				name: 'WheelSeeker',
				template: '<div class="WheelSeeker"></div>',
				shadow: WheelSeeker.template
			});
			Object.assign(this._props, {
				watchElement: params.watchElement,
				isActive: false,
				pos: 0,
				ax: 0,
				lastWheelTime: 0,
				duration: 1
			});
			this._bound.onWheel = _.throttle(this.onWheel.bind(this), 50);
			this._bound.onMouseUp = this.onMouseUp.bind(this);
			this._bound.dispatchSeek =this.dispatchSeek.bind(this);
			this._props.watchElement.addEventListener(
				'wheel', this._bound.onWheel, {passive: false});
		}
		_initDom(...args) {
			super._initDom(...args);
			this._elm = Object.assign({}, this._elm, {
				root: this._shadow || this._view,
			});
			this._shadow.addEventListener('contextmenu', e => {
				e.stopPropagation();
				e.preventDefault();
			});
		}
		enable() {
			document.addEventListener(
				'mouseup', this._bound.onMouseUp, {capture: true, once: true});
			this.refresh();
			this.dispatchCommand('wheelSeek-start');
			this._elm.root.style.display = '';
			this._props.isActive = true;
			this._props.ax = 0;
			this._props.lastWheelTime = performance.now();
		}
		disable() {
			document.removeEventListener('mouseup', this._bound.onMouseUp);
			this.dispatchCommand('wheelSeek-end');
			this.dispatchCommand('seek', this.currentTime);
			this._props.isActive = false;
			setTimeout(() => {
				this._elm.root.style.display = 'none';
			}, 300);
		}
		onWheel(e) {
			let {buttons, deltaY} = e;
			if (!deltaY) { return; }
			deltaY = Math.abs(deltaY) >= 100 ? deltaY / 50 : deltaY;
			if (this.isActive) {
				e.preventDefault();
				e.stopPropagation();
				if (!buttons && !e.shiftKey) {
					return this.disable();
				}
				let pos = this._props.pos;
				let ax = this._props.ax;
				const deltaReversed = ax * deltaY < 0 ;//lastDelta * deltaY < 0;
				const now = performance.now();
				const seconds = ((now - this._props.lastWheelTime) / 1000);
				this._props.lastWheelTime = now;
				if (deltaReversed) {
					ax = deltaY > 0 ? 0.5 : -0.5;
				} else {
					ax =
						ax *
						Math.pow(1.15, Math.abs(deltaY)) * // speedup
						Math.pow(0.8, Math.floor(seconds/0.1)) // speeddown
					;
					ax = Math.min(20, Math.abs(ax)) * (ax > 0 ? 1: -1);
					pos += ax; // / 100;
				}
				pos = Math.min(100, Math.max(0, pos));
				this._props.ax = ax;
				this.pos = pos;
				this._bound.dispatchSeek();
			} else if (buttons || e.shiftKey) {
				e.preventDefault();
				e.stopPropagation();
				this.enable();
				this._props.ax = deltaY > 0 ? 0.5 : -0.5;
			}
		}
		onMouseUp(e) {
			if (!this.isActive) { return; }
			e.preventDefault();
			e.stopPropagation();
			this.disable();
		}
		dispatchSeek() {
			this.dispatchCommand('wheelSeek', this.currentTime);
		}
		refresh() {
		}
		get isActive() {
			return this._props.isActive;
		}
		get duration() {
			return this._props.duration;
		}
		set duration(v) {
			this._props.duration = v;
		}
		get pos() {
			return this._props.pos;
		}
		set pos(v) {
			this._props.pos = v;
			if (this.isActive) {
				this.refresh();
			}
		}
		get currentTime() {
			return this.duration * this.pos / 100;
		}
		set currentTime(v) {
			this.pos = v / this.duration * 100;
		}
	}

//@require NicoTextParser
//@require CommentLayer
//@require NicoChat
//@require NicoChatViewModel
//@require NicoChatCss3View
//@require NicoChatFilter
class NicoCommentPlayer extends Emitter {
	constructor(params) {
		super();
		this._model = new NicoComment(params);
		this._viewModel = new NicoCommentViewModel(this._model);
		this._view = new NicoCommentCss3PlayerView({
			viewModel: this._viewModel,
			playbackRate: params.playbackRate,
			show: params.showComment,
			opacity: _.isNumber(params.commentOpacity) ? params.commentOpacity : 1.0
		});
		const onCommentChange = _.throttle(this._onCommentChange.bind(this), 1000);
		this._model.on('change', onCommentChange);
		this._model.on('filterChange', this._onFilterChange.bind(this));
		this._model.on('parsed', this._onCommentParsed.bind(this));
		this._model.on('command', this._onCommand.bind(this));
		global.emitter.on('commentLayoutChange', onCommentChange);
		global.debug.nicoCommentPlayer = this;
		this.emitResolve('GetReady!');
	}
	setComment(data, options) {
		if (typeof data === 'string') {
			if (options.format === 'json') {
				this._model.setData(JSON.parse(data), options);
			} else {
				this._model.setXml(new DOMParser().parseFromString(data, 'text/xml'), options);
			}
		} else if (typeof data.getElementsByTagName === 'function') {
			this._model.setXml(data, options);
		} else {
			this._model.setData(data, options);
		}
	}
	_onCommand(command, param) {
		this.emit('command', command, param);
	}
	_onCommentChange(e) {
		console.log('onCommentChange', e);
		if (this._view) {
			setTimeout(() => this._view.refresh(), 0);
		}
		this.emit('change');
	}
	_onFilterChange(nicoChatFilter) {
		this.emit('filterChange', nicoChatFilter);
	}
	_onCommentParsed() {
		this.emit('parsed');
	}
	getMymemory() {
		if (!this._view) {
			this._view = new NicoCommentCss3PlayerView({
				viewModel: this._viewModel
			});
		}
		return this._view.export();
	}
	set currentTime(sec) {this._model.currentTime=sec;}
	get currentTime() {return this._model.currentTime;}
	set vpos(vpos) {this._model.currentTime=vpos / 100;}
	get vpos() {return this._model.currentTime * 100;}
	setVisibility(v) {
		if (v) {
			this._view.show();
		} else {
			this._view.hide();
		}
	}
	addChat(text, cmd, vpos, options) {
		if (typeof vpos !== 'number') {
			vpos = this.vpos;
		}
		const nicoChat = NicoChat.create(Object.assign({text, cmd, vpos}, options));
		this._model.addChat(nicoChat);
		return nicoChat;
	}
	set playbackRate(v) {
		if (this._view) {
			this._view.playbackRate = v;
		}
	}
	get playbackRate() {
		if (this._view) { return this._view.playbackRate; }
		return 1;
	}
	setAspectRatio(ratio) {
		this._view.setAspectRatio(ratio);
	}
	appendTo(node) {
		this._view.appendTo(node);
	}
	show() {
		this._view.show();
	}
	hide() {
		this._view.hide();
	}
	close() {
		this._model.clear();
		if (this._view) {
			this._view.clear();
		}
	}
	get filter() {return this._model.filter;}
	get chatList() {return this._model.chatList;}
	get nonfilteredChatList() {return this._model.nonfilteredChatList;}
	export() {
		return this._viewModel.export();
	}
	getCurrentScreenHtml() {
		return this._view.getCurrentScreenHtml();
	}
}
//@require NicoComment
//@require OffscreenLayer
NicoComment.offscreenLayer = OffscreenLayer(Config);
//@require NicoCommentViewModel
//@require NicoChatGroup
//@require NicoChatGroupViewModel
const updateSpeedRate = () => {
	let rate = Config.props.commentSpeedRate * 1;
	if (Config.props.autoCommentSpeedRate) {
		rate = rate / Math.max(Config.props.playbackRate, 1);
	}
	if (rate !== NicoChatViewModel.SPEED_RATE) {
		NicoChatViewModel.SPEED_RATE = rate;
		NicoChatViewModel.emitter.emit('updateCommentSpeedRate', rate);
	}
};
Config.onkey('commentSpeedRate', updateSpeedRate);
Config.onkey('autoCommentSpeedRate', updateSpeedRate);
Config.onkey('playbackRate', updateSpeedRate);
updateSpeedRate();
//@require NicoCommentCss3PlayerView
Object.assign(global.debug, {
	NicoChat,
	NicoChatViewModel
});

const CommentLayoutWorker = (config => {
	const func = function(self) {
		const TYPE = {
			TOP: 'ue',
			NAKA: 'naka',
			BOTTOM: 'shita'
		};
		const SCREEN = {
			WIDTH_INNER: 512,
			WIDTH_FULL_INNER: 640,
			WIDTH: 512 + 32,
			WIDTH_FULL: 640 + 32,
			HEIGHT: 384
		};
		const isConflict = (target, others) => {
			if (target.isOverflow || others.isOverflow || others.isInvisible) {
				return false;
			}
			if (target.layerId !== others.layerId) {
				return false;
			}
			const othersY = others.ypos;
			const targetY = target.ypos;
			if (othersY + others.height < targetY ||
				othersY > targetY + target.height) {
				return false;
			}
			let rt, lt;
			if (target.beginLeft <= others.beginLeft) {
				lt = target;
				rt = others;
			} else {
				lt = others;
				rt = target;
			}
			if (target.isFixed) {
				if (lt.endRight > rt.beginLeft) {
					return true;
				}
			} else {
				if (lt.beginRight >= rt.beginLeft) {
					return true;
				}
				if (lt.endRight >= rt.endLeft) {
					return true;
				}
			}
			return false;
		};
		const moveToNextLine = (self, others) => {
			const margin = 1;
			const othersHeight = others.height + margin;
			const overflowMargin = 10;
			const rnd = Math.max(0, SCREEN.HEIGHT - self.height);
			const yMax = SCREEN.HEIGHT - self.height + overflowMargin;
			const yMin = 0 - overflowMargin;
			const type = self.type;
			let ypos = self.ypos;
			if (type !== TYPE.BOTTOM) {
				ypos += othersHeight;
				if (ypos > yMax) {
					self.isOverflow = true;
				}
			} else {
				ypos -= othersHeight;
				if (ypos < yMin) {
					self.isOverflow = true;
				}
			}
			self.ypos = self.isOverflow ? Math.floor(Math.random() * rnd) : ypos;
			return self;
		};
		const findCollisionStartIndex = (target, members) => {
			const tl = target.beginLeft;
			const tr = target.endRight;
			const layerId = target.layerId;
			for (let i = 0, len = members.length; i < len; i++) {
				const o = members[i];
				const ol = o.beginLeft;
				const or = o.endRight;
				if (o.id === target.id) {
					return -1;
				}
				if (layerId !== o.layerId || o.invisible || o.isOverflow) {
					continue;
				}
				if (tl <= or && tr >= ol) {
					return i;
				}
			}
			return -1;
		};
		const _checkCollision = (target, members, collisionStartIndex) => {
			const beginLeft = target.beginLeft;
			for (let i = collisionStartIndex, len = members.length; i < len; i++) {
				const o = members[i];
				if (o.id === target.id) {
					return target;
				}
				if (beginLeft > o.endRight) {
					continue;
				}
				if (isConflict(target, o)) {
					target = moveToNextLine(target, o);
					if (!target.isOverflow) {
						return _checkCollision(target, members, collisionStartIndex);
					}
				}
			}
			return target;
		};
		const checkCollision = (target, members) => {
			if (target.isInvisible) {
				return target;
			}
			const collisionStartIndex = findCollisionStartIndex(target, members);
			if (collisionStartIndex < 0) {
				return target;
			}
			return _checkCollision(target, members, collisionStartIndex);
		};
		const groupCollision = members => {
			for (let i = 0, len = members.length; i < len; i++) {
				checkCollision(members[i], members);
			}
			return members;
		};
		self.onmessage = ({command, params}) => {
			const {type, members, lastUpdate} = params;
			console.time('CommentLayoutWorker: ' + type);
			groupCollision(members);
			console.timeEnd('CommentLayoutWorker: ' + type);
			return {type, members, lastUpdate};
		};
	};
	let instance = null;
	return {
		_func: func,
		create: () => workerUtil.createCrossMessageWorker(func, {name: 'CommentLayoutWorker'}),
		getInstance() {
			if (!instance) {
				instance = this.create();
			}
			return instance;
		}
	};
})(Config);

const SlotLayoutWorker = (() => {
	const func = function (self) {
		const SLOT_COUNT = 40;
		class SlotEntry {
			constructor(slotCount) {
				this.slotCount = slotCount || SLOT_COUNT;
				this.slot = [];
				this.itemTable = {};
				this.p = 1;
			}
			findIdle(sec) {
				const {count, slot, table} = this;
				for (let i = 0; i < count; i++) {
					if (!slot[i]) {
						slot[i] = this.p++;
						return i;
					}
					let item = table[i];
					if (sec < item.begin || sec > item.end) {
						slot[i] = this.p++;
						return i;
					}
				}
				return -1;
			}
			get mostOld() {
				let idx = 0, slot = this.slot, min = slot[0];
				for (let i = 1, len = this.slot.length; i < len; i++) {
					if (slot[i] < min) {
						min = slot[i];
						idx = i;
					}
				}
				return idx;
			}
			find(item, sec) {
				let slot = this.findIdle(sec);
				if (slot < 0) {
					slot = this.mostOld;
				}
				this.itemTable[slot] = item;
				return slot;
			}
		}
		const sortByBeginTime = data => {
			data = data.concat().sort((a, b) => {
				const av = a.begin, bv = b.begin;
				if (av !== bv) {
					return av - bv;
				} else {
					return a.no < b.no ? -1 : 1;
				}
			});
			return data;
		};
		const execute = ({top, naka, bottom}) => {
			const data = sortByBeginTime([top, naka, bottom].flat());
			const slotEntries = [new SlotEntry(), new SlotEntry(), new SlotEntry()];
			for (let i = 0, len = data.length; i < len; i++) {
				const o = data[i];
				if (o.invisible) {
					continue;
				}
				const sec = o.begin;
				const fork = o.fork % 3;
				o.slot = slotEntries[fork].find(o, sec);
			}
			return data;
		};
		self.onmessage = ({command, params}) => {
			console.time('SlotLayoutWorker');
			const result = execute(params);
			console.timeEnd('SlotLayoutWorker');
			result.lastUpdate = params.lastUpdate;
			return result;
		};
	};
	return {
		_func: func,
		create: function () {
			if (!workerUtil.isAvailable) {
				return null;
			}
			return workerUtil.createCrossMessageWorker(func, {name: 'SlotLayoutWorker'});
		}
	};
})();

class NicoScriptParser {
	static get parseId() {
		if (!NicoScriptParser._count) {
			NicoScriptParser._count = 1;
		}
		return NicoScriptParser._count++;
	}
	static parseNiwango(lines) {
		let type, params, m;
		const result = [];
		for (let i = 0, len = lines.length; i < len; i++) {
			const text = lines[i];
			const id = NicoScriptParser.parseId;
			if ((m = /^\/?replace\((.*?)\)/.exec(text)) !== null) {
				type = 'REPLACE';
				params = NicoScriptParser.parseReplace(m[1]);
				result.push({id, type, params});
			} else if ((m = /^\/?commentColor\s*=\s*0x([0-9a-f]{6})/i.exec(text)) !== null) {
				result.push({id, type: 'COLOR', params: {color: '#' + m[1]}});
			} else if ((m = /^\/?seek\((.*?)\)/i.exec(text)) !== null) {
				params = NicoScriptParser.parseSeek(m[1]);
				result.push({id, type: 'SEEK', params});
			}
		}
		return result;
	}
	static parseParams(str) {
		let result = {}, v = '', lastC = '', key, isStr = false, quot = '';
		for (let i = 0, len = str.length; i < len; i++) {
			let c = str.charAt(i);
			switch (c) {
				case ':':
					key = v.trim();
					v = '';
					break;
				case ',':
					if (isStr) {
						v += c;
					}
					else {
						if (key !== '' && v !== '') {
							result[key] = v.trim();
						}
						key = v = '';
					}
					break;
				case ' ':
					if (v !== '') {
						v += c;
					}
					break;
				case '\'':
				case '"':
					if (v !== '') {
						if (quot !== c) {
							v += c;
						} else if (isStr) {
							if (lastC === '\\') {
								v += c;
							}
							else {
								if (quot === '"') {
									v = v.replace(/(\\r|\\n)/g, '\n').replace(/(\\t)/g, '\t');
								}
								result[key] = v;
								key = v = '';
								isStr = false;
							}
						} else {
							window.console.error('parse fail?', isStr, lastC, str);
							return null;
						}
					} else {
						quot = c;
						isStr = true;
					}
					break;
				default:
					v += c;
			}
			lastC = c;
		}
		if (key !== '' && v !== '') {
			result[key] = v.trim();
		}
		return result;
	}
	static parseNicosParams(str) {
		let result = [], v = '', lastC = '', quot = '';
		for (let i = 0, len = str.length; i < len; i++) {
			let c = str.charAt(i);
			switch (c) {
				case ' ':
				case '　':
					if (quot) {
						v += c;
					} else {
						if (v !== '') {
							result.push(v);
							v = quot = '';
						}
					}
					break;
				case '\'':
				case '"':
					if (v !== '') {
						if (quot !== c) {
							v += c;
						} else {
							if (lastC === '\\') {
								v += c;
							}
							else {
								v = v.replace(/(\\r|\\n)/g, '\n').replace(/(\\t)/g, '\t');
								result.push(v);
								v = quot = '';
							}
						}
					} else {
						quot = c;
					}
					break;
				case '「':
					if (v !== '') {
						v += c;
					} else {
						quot = c;
					}
					break;
				case '」':
					if (v !== '') {
						if (quot !== '「') {
							v += c;
						} else {
							if (lastC === '\\') {
								v += c;
							}
							else {
								result.push(v);
								v = quot = '';
							}
						}
					} else {
						v += c;
					}
					break;
				default:
					v += c;
			}
			lastC = c;
		}
		if (v !== '') {
			result.push(v.trim());
		}
		return result;
	}
	static parseNicos(text) {
		text = text.trim();
		const text1 = (text || '').split(/[ 　:：]+/)[0]; // eslint-disable-line
		let params;
		let type;
		switch (text1) {
			case '@デフォルト':
			case '＠デフォルト':
				type = 'DEFAULT';
				break;
			case '@逆':
			case '＠逆':
				type = 'REVERSE';
				params = NicoScriptParser.parse逆(text);
				break;
			case '@ジャンプ':
			case '＠ジャンプ':
				params = NicoScriptParser.parseジャンプ(text);
				type = params.type;
				break;
			case '@ジャンプマーカー':
			case '＠ジャンプマーカー':
				type = 'MARKER'; //@ジャンプマーカー：ループ
				params = NicoScriptParser.parseジャンプマーカー(text);
				break;
			default:
				if (text.indexOf('@置換') === 0 || text.indexOf('＠置換') === 0) {
					type = 'REPLACE';
					params = NicoScriptParser.parse置換(text);
				} else {
					type = 'PIPE';
					let lines = NicoScriptParser.splitLines(text);
					params = NicoScriptParser.parseNiwango(lines);
				}
		}
		const id = NicoScriptParser.parseId;
		return {id, type, params};
	}
	static splitLines(str) {
		let result = [], v = '', lastC = '', isStr = false, quot = '';
		for (let i = 0, len = str.length; i < len; i++) {
			let c = str.charAt(i);
			switch (c) {
				case ';':
					if (isStr) {
						v += c;
					}
					else {
						result.push(v.trim());
						v = '';
					}
					break;
				case ' ':
					if (v !== '') {
						v += c;
					}
					break;
				case '\'':
				case '"':
					if (isStr) {
						if (quot === c) {
							if (lastC !== '\\') {
								isStr = false;
							}
						}
						v += c;
					} else {
						quot = c;
						isStr = true;
						v += c;
					}
					break;
				default:
					v += c;
			}
			lastC = c;
		}
		if (v !== '') {
			result.push(v.trim());
		}
		return result;
	}
	static parseReplace(str) {
		const result = NicoScriptParser.parseParams(str);
		if (!result) {
			return null;
		}
		return {
			src: result.src,
			dest: result.dest || '',
			fill: result.fill === 'true' ? true : false,
			target: result.target || 'user',
			partial: result.partial === 'false' ? false : true
		};
	}
	static parseSeek(str) {
		const result = NicoScriptParser.parseParams(str);
		if (!result) {
			return null;
		}
		return {
			time: result.vpos
		};
	}
	static parse置換(str) {
		const tmp = NicoScriptParser.parseNicosParams(str);
		let target = 'user'; // '投コメ'
		if (tmp[4] === '含む' || tmp[4] === '全') { // マニュアルにはないが '全' もあるらしい
			target = 'owner user';
		} else if (tmp[4] === '投コメ') {
			target = 'owner';
		}
		return {
			src: tmp[1],
			dest: tmp[2] || '',
			fill: tmp[3] === '全' ? true : false,          //全体を置き換えるかどうか
			target, //(tmp[4] === '含む' || tmp[4] === '投コメ')     ? 'owner user' : 'user',
			partial: tmp[5] === '完全一致' ? false : true           // 完全一致のみを見るかどうか
		};
	}
	static parse逆(str) {
		const tmp = NicoScriptParser.parseNicosParams(str);
		/* eslint-disable */
		/* eslint-enable */
		const target = (tmp[1] || '').trim();
		return {
			target: (target === 'コメ' || target === '投コメ') ? target : '全',
		};
	}
	static parseジャンプ(str) {
		const tmp = NicoScriptParser.parseNicosParams(str);
		const target = tmp[1] || '';
		let type = 'JUMP';
		let time = 0;
		let m;
		if ((m = /^#(\d+):(\d+)$/.exec(target)) !== null) {
			type = 'SEEK';
			time = m[1] * 60 + m[2] * 1;
		} else if ((m = /^#(\d+):(\d+\.\d+)$/.exec(target)) !== null) {
			type = 'SEEK';
			time = m[1] * 60 + m[2] * 1;
		} else if ((m = /^(#|＃)(.+)/.exec(target)) !== null) {
			type = 'SEEK_MARKER';
			time = m[2];
		}
		return {target, type, time};
	}
	static parseジャンプマーカー(str) {
		const tmp = NicoScriptParser.parseNicosParams(str);
		const name = tmp[0].split(/[:： 　]/)[1]; // eslint-disable-line
		return {name};
	}
}
class NicoScripter extends Emitter {
	constructor() {
		super();
		this.reset();
	}
	reset() {
		this._hasSort = false;
		this._list = [];
		this._eventScript = [];
		this._nextVideo = null;
		this._marker = {};
		this._inviewEvents = {};
		this._currentTime = 0;
		this._eventId = 0;
	}
	add(nicoChat) {
		this._hasSort = false;
		this._list.push(nicoChat);
	}
	get isEmpty() {
		return this._list.length === 0;
	}
	getNextVideo() {
		return this._nextVideo || '';
	}
	getEventScript() {
		return this._eventScript || [];
	}
	get currentTime() {
		return this._currentTime;
	}
	set currentTime(v) {
		this._currentTime = v;
		if (this._eventScript.length > 0) {
			this._updateInviewEvents();
		}
	}
	_sort() {
		if (this._hasSort) {
			return;
		}
		const list = this._list.concat().sort((a, b) => {
			const av = a.vpos, bv = b.vpos;
			if (av !== bv) {
				return av - bv;
			} else {
				return a.no < b.no ? -1 : 1;
			}
		});
		this._list = list;
		this._hasSort = true;
	}
	_updateInviewEvents() {
		const ct = this._currentTime;
		this._eventScript.forEach(({p, nicos}) => {
			const beginTime = nicos.vpos / 100;
			const endTime = beginTime + nicos.duration;
			if (beginTime > ct || endTime < ct) {
				delete this._inviewEvents[p.id];
				return;
			}
			if (this._inviewEvents[p.id]) {
				return;
			}
			this._inviewEvents[p.id] = true;
			let diff = nicos.vpos / 100 - ct;
			diff = Math.min(1, Math.abs(diff)) * (diff / Math.abs(diff));
			switch (p.type) {
				case 'SEEK':
					this.emit('command', 'nicosSeek', Math.max(0, p.params.time * 1 + diff));
					break;
				case 'SEEK_MARKER': {
					let time = this._marker[p.params.time] || 0;
					this.emit('command', 'nicosSeek', Math.max(0, time + diff));
					break;
				}
			}
		});
	}
	apply(group) {
		this._sort();
		const assigned = {};
		const eventFunc = {
			'JUMP': (p, nicos) => {
				console.log('@ジャンプ: ', p, nicos);
				const target = p.params.target;
				if (/^([a-z]{2}|)[0-9]+$/.test(target)) {
					this._nextVideo = target;
				}
			},
			'SEEK': (p, nicos) => {
				if (assigned[p.id]) {
					return;
				}
				assigned[p.id] = true;
				this._eventScript.push({p, nicos});
			},
			'SEEK_MARKER': (p, nicos) => {
				if (assigned[p.id]) {
					return;
				}
				assigned[p.id] = true;
				console.log('SEEK_MARKER: ', p, nicos);
				this._eventScript.push({p, nicos});
			},
			'MARKER': (p, nicos) => {
				console.log('@ジャンプマーカー: ', p, nicos);
				this._marker[p.params.name] = nicos.vpos / 100;
			}
		};
		const applyFunc = {
			DEFAULT(nicoChat, nicos) {
				const nicosColor = nicos.color;
				const hasColor = nicoChat.hasColorCommand;
				if (nicosColor && !hasColor) {
					nicoChat.color = nicosColor;
				}
				const nicosSize = nicos.size;
				const hasSize = nicoChat.hasSizeCommand;
				if (nicosSize && !hasSize) {
					nicoChat.size = nicosSize;
				}
				const nicosType = nicos.type;
				const hasType = nicoChat.hasTypeCommand;
				if (nicosType && !hasType) {
					nicoChat.type = nicosType;
				}
			},
			COLOR(nicoChat, nicos, params) {
				const hasColor = nicoChat.hasColorCommand;
				if (!hasColor) {
					nicoChat.color = params.color;
				}
			},
			REVERSE(nicoChat, nicos, params) {
				if (params.target === '全') {
					nicoChat.isReverse = true;
				} else if (params.target === '投コメ') {
					if (nicoChat.fork > 0) {
						nicoChat.isReverse = true;
					}
				} else if (params.target === 'コメ') {
					if (nicoChat.fork === 0) {
						nicoChat.isReverse = true;
					}
				}
			},
			REPLACE(nicoChat, nicos, params) {
				if (!params) {
					return;
				}
				if (nicoChat.fork > 0 && (params.target || '').indexOf('owner') < 0) {
					return;
				}
				if (nicoChat.fork < 1 && params.target === 'owner') {
					return;
				}
				let isMatch = false;
				let text = nicoChat.text;
				if (params.partial === true) {
					isMatch = text.indexOf(params.src) >= 0;
				} else {
					isMatch = text === params.src;
				}
				if (!isMatch) {
					return;
				}
				if (params.fill === true) {
					text = params.dest;
				} else {// ＠置換 "~" "\n" 単 全
					const reg = new RegExp(textUtil.escapeRegs(params.src), 'g');
					text = text.replace(reg, params.dest);
				}
				nicoChat.text = text;
				const nicosColor = nicos.clor;
				const hasColor = nicoChat.hasColorCommand;
				if (nicosColor && !hasColor) {
					nicoChat.color = nicosColor;
				}
				const nicosSize = nicos.size;
				const hasSize = nicoChat.hasSizeCommand;
				if (nicosSize && !hasSize) {
					nicoChat.size = nicosSize;
				}
				const nicosType = nicos.type;
				const hasType = nicoChat.hasTypeCommand;
				if (nicosType && !hasType) {
					nicoChat.type = nicosType;
				}
			},
			PIPE(nicoChat, nicos, lines) {
				lines.forEach(line => {
					const type = line.type;
					const f = applyFunc[type];
					if (f) {
						f(nicoChat, nicos, line.params);
					}
				});
			}
		};
		this._list.forEach(nicos => {
			const p = NicoScriptParser.parseNicos(nicos.text);
			if (!p) {
				return;
			}
			if (!nicos.hasDurationSet) {
				nicos.duration = 99999;
			}
			const ev = eventFunc[p.type];
			if (ev) {
				return ev(p, nicos);
			}
			else if (p.type === 'PIPE') {
				p.params.forEach(line => {
					const type = line.type;
					const ev = eventFunc[type];
					if (ev) {
						return ev(line, nicos);
					}
				});
			}
			const func = applyFunc[p.type];
			if (!func) {
				return;
			}
			const beginTime = nicos.beginTime;
			const endTime = beginTime + nicos.duration;
			(group.members ? group.members : group).forEach(nicoChat => {
				if (nicoChat.isNicoScript) {
					return;
				}
				const ct = nicoChat.beginTime;
				if (beginTime > ct || endTime < ct) {
					return;
				}
				func(nicoChat, nicos, p.params);
			});
		});
	}
}

class CommentListModel extends Emitter {
	constructor(params) {
		super();
		this._isUniq = params.uniq;
		this._items = [];
		this._positions = [];
		this._maxItems = params.maxItems || 100;
		this._currentSortKey = 'vpos';
		this._isDesc = false;
		this._currentTime = 0;
		this._currentIndex = -1;
	}
	setItem(itemList) {
		this._items = Array.isArray(itemList) ? itemList : [itemList];
	}
	clear() {
		this._items = [];
		this._positions = [];
		this._currentTime = 0;
		this._currentIndex = -1;
		this.emit('update', [], true);
	}
	setChatList(chatList) {
		chatList = chatList.top.concat(chatList.naka, chatList.bottom);
		const items = [];
		const positions = [];
		for (let i = 0, len = chatList.length; i < len; i++) {
			items.push(new CommentListItem(chatList[i]));
			positions.push(parseFloat(chatList[i].vpos, 10) / 100);
		}
		this._items = items;
		this._positions = positions.sort((a, b) => a - b);
		this._currentTime = 0;
		this._currentIndex = -1;
		this.sort();
		this.emit('update', this._items, true);
	}
	removeItemByIndex(index) {
		const target = this._getItemByIndex(index);
		if (!target) {
			return;
		}
		this._items = this._items.filter(item => item !== target);
	}
	get length() {
		return this._items.length;
	}
	_getItemByIndex(index) {
		return this._items[index];
	}
	indexOf(item) {
		return (this._items || []).indexOf(item);
	}
	getItemByIndex(index) {
		const item = this._getItemByIndex(index);
		if (!item) {
			return null;
		}
		return item;
	}
	findByItemId(itemId) {
		itemId = parseInt(itemId, 10);
		return this._items.find(item => item.itemId === itemId);
	}
	removeItem(item) {
		const beforeLen = this._items.length;
		this._items = this._items.filter(i => i !== item); //_.pull(this._items, item);
		const afterLen = this._items.length;
		if (beforeLen !== afterLen) {
			this.emit('update', this._items);
		}
	}
	_onItemUpdate(item, key, value) {
		this.emit('itemUpdate', item, key, value);
	}
	sortBy(key, isDesc) {
		const table = {
			vpos: 'vpos',
			date: 'date',
			text: 'text',
			user: 'userId',
			nicoru: 'nicoru'
		};
		const func = table[key];
		if (!func) {
			return;
		}
		this._items = _.sortBy(this._items, item => item[func]);
		if (isDesc) {
			this._items.reverse();
		}
		this._currentSortKey = key;
		this._isDesc = isDesc;
		this.onUpdate(true);
	}
	sort() {
		this.sortBy(this._currentSortKey, this._isDesc);
	}
	get currentSortKey() {
		return this._currentSortKey;
	}
	onUpdate(replaceAll = false) {
		this.emitAsync('update', this._items, replaceAll);
	}
	getInViewIndex(sec) {
		return Math.max(0, _.sortedLastIndex(this._positions, sec + 1) - 1);
	}
	set currentTime(sec) {
		if (this._currentTime !== sec && typeof sec === 'number') {
			this._currentTime = sec;
			const inviewIndex = this.getInViewIndex(sec);
			if (this._currentSortKey === 'vpos' && this._currentIndex !== inviewIndex) {
				this.emit('currentTimeUpdate', sec, inviewIndex);
			}
			this._currentIndex = inviewIndex;
		}
	}
	get currentTime() {return this._currentTime;}
}
class CommentListView extends Emitter {
	constructor(params) {
		super();
		this._ItemView = CommentListItemView;
		this._itemCss = CommentListItemView.CSS;
		this._className = params.className || 'commentList';
		this._retryGetIframeCount = 0;
		this._maxItems = 100000;
		this._inviewItemList = new Map;
		this._scrollTop = 0;
		this.timeScrollTop = 0;
		this.newItems = [];
		this.removedItems = [];
		this._innerHeight = 100;
		this._model = params.model;
		if (this._model) {
			this._model.on('update', _.debounce(this._onModelUpdate.bind(this), 500));
		}
		this.setScrollTop = throttle.raf(this.setScrollTop.bind(this));
		this._initializeView(params, 0);
	}
	async _initializeView(params) {
		const html = CommentListView.__tpl__.replace('%CSS%', this._itemCss);
		const frame = this.frameLayer = new FrameLayer({
			container: params.container,
			html,
			className: 'commentListFrame'
		});
		const contentWindow = await frame.wait();
		this._initFrame(contentWindow);
	}
	_initFrame(w) {
		this.contentWindow = w;
		const doc = this.document = w.document;
		const body = this.body = doc.body;
		const classList = this.classList = ClassList(body);
		const $body = this._$body = uq(body);
		if (this._className) {
			classList.add(this._className);
		}
		this._container = doc.querySelector('#listContainer');
		this._$container = uq(this._container);
		this._list = doc.getElementById('listContainerInner');
		if (this._html) {
			this._list.innerHTML = this._html;
		}
		this._$menu = $body.find('.listMenu');
		this._$itemDetail = $body.find('.itemDetailContainer');
		$body
			.on('click', this._onClick.bind(this))
			.on('dblclick', this._onDblClick.bind(this))
			.on('keydown', e => global.emitter.emit('keydown', e))
			.on('keyup', e => global.emitter.emit('keyup', e))
			.toggleClass('is-guest', !nicoUtil.isLogin())
			.toggleClass('is-premium', nicoUtil.isPremium())
			.toggleClass('is-firefox', env.isFirefox());
		this.frameLayer.frame.addEventListener('visibilitychange', e => {
			const {isVisible} = e.detail;
			if (!isVisible) { return; }
			if (this.isAutoScroll) {
				this.setScrollTop(this.timeScrollTop);
			}
			this._refreshInviewElements();
		});
		this._$menu.on('click', this._onMenuClick.bind(this));
		this._$itemDetail.on('click', this._onItemDetailClick.bind(this));
		this._onScroll = this._onScroll.bind(this);
		this._onScrolling = _.throttle(this._onScrolling.bind(this), 100);
		this._onScrollEnd = _.debounce(this._onScrollEnd.bind(this), 500);
		this._container.addEventListener('scroll', this._onScroll, {passive: true});
		this._$container.on('mouseover', this._onMouseOver.bind(this))
			.on('mouseleave', this._onMouseOut.bind(this))
			.on('wheel', _.throttle(this._onWheel.bind(this), 100), {passive: true});
		w.addEventListener('resize', this._onResize.bind(this));
		this._innerHeight = w.innerHeight;
		this._refreshInviewElements = _.throttle(this._refreshInviewElements.bind(this), 100);
		this._appendNewItems = throttle.raf(this._appendNewItems.bind(this));
		cssUtil.setProps([body,'--inner-height', this._innerHeight]);
		this._debouncedOnItemClick = _.debounce(this._onItemClick.bind(this), 300);
		global.debug.$commentList = uq(this._list);
		global.debug.getCommentPanelItems = () =>
			Array.from(doc.querySelectorAll('.commentListItem'));
		this.emitResolve('frame-ready');
	}
	async _onModelUpdate(itemList, replaceAll) {
		if (!this._isFrameReady) {
			await this.promise('frame-ready');
		}
		this._isFrameReady = true;
		window.console.time('update commentlistView');
		this.addClass('updating');
		itemList = Array.isArray(itemList) ? itemList : [itemList];
		this.isActive = false;
		if (replaceAll) {
			this._scrollTop = this._container ? this._container.scrollTop : 0;
		}
		const itemViews = itemList.map((item, i) =>
			new this._ItemView({item: item, index: i, height: CommentListView.ITEM_HEIGHT})
		);
		this._itemViews = itemViews;
		await cssUtil.setProps([this.body, '--list-height',
			Math.max(CommentListView.ITEM_HEIGHT * itemViews.length, this._innerHeight) + 100]);
		if (!this._list) { return; }
		this._list.textContent = '';
		this._inviewItemList.clear();
		this._$menu.removeClass('show');
		this._refreshInviewElements();
		this.hideItemDetail();
		window.setTimeout(() => {
			this.removeClass('updating');
			this.emit('update');
		}, 100);
		window.console.timeEnd('update commentlistView');
	}
	_onClick(e) {
		e.stopPropagation();
		global.emitter.emitAsync('hideHover');
		const item = e.target.closest('.commentListItem');
		if (item) {
			return this._debouncedOnItemClick(e, item);
		}
	}
	_onItemClick(e, item) {
		if (e.target.closest('.nicoru-icon')) {
			item.classList.add('nicotta');
			item.dataset.nicoru = item.dataset.nicoru ? (item.dataset.nicoru * 1 + 1) : 1;
			this.emit('command', 'nicoru', item, item.dataset.itemId);
			return;
		}
		this._$menu
			.css('transform', `translate(0, ${item.dataset.top}px)`)
			.attr('data-item-id', item.dataset.itemId)
			.addClass('show');
	}
	_onMenuClick(e) {
		const target = e.target.closest('.menuButton');
		this._$menu.removeClass('show');
		if (!target) {
			return;
		}
		const {itemId} = e.target.closest('.listMenu').dataset;
		if (!itemId) {
			return;
		}
		const {command} = target.dataset;
		if (command === 'addUserIdFilter' || command === 'addWordFilter') {
			Array.from(this._list.querySelectorAll(`.item${itemId}`))
				.forEach(e => e.remove());
		}
		this.emit('command', command, null, itemId);
	}
	_onItemDetailClick(e) {
		const target = e.target.closest('.command');
		if (!target) {
			return;
		}
		const itemId = this._$itemDetail.attr('data-item-id');
		if (!itemId) {
			return;
		}
		const {command, param} = target.dataset;
		if (command === 'hideItemDetail') {
			return this.hideItemDetail();
		}
		if (command === 'reloadComment') {
			this.hideItemDetail();
		}
		this.emit('command', command, param, itemId);
	}
	_onDblClick(e) {
		e.stopPropagation();
		const item = e.target.closest('.commentListItem');
		if (!item) {
			return;
		}
		e.preventDefault();
		const itemId = item.dataset.itemId;
		this.emit('command', 'select', null, itemId);
	}
	_onMouseMove() {
		this.isActive = true;
		this.addClass('is-active');
	}
	_onMouseOver() {
		this.isActive = true;
		this.addClass('is-active');
	}
	_onWheel() {
		this.isActive = true;
		this.addClass('is-active');
	}
	_onMouseOut() {
		this.isActive = false;
		this.removeClass('is-active');
	}
	_onResize() {
		this._innerHeight = this.contentWindow.innerHeight;
		cssUtil.setProps([this.body, '--inner-height', this._innerHeight]);
		this._refreshInviewElements();
	}
	_onScroll(e) {
		if (!this.hasClass('is-scrolling')) {
			this.addClass('is-scrolling');
		}
		this._onScrolling();
		this._onScrollEnd();
	}
	_onScrolling() {
		this.syncScrollTop();
		this._refreshInviewElements();
	}
	_onScrollEnd() {
		this.removeClass('is-scrolling');
	}
	_refreshInviewElements() {
		if (!this._list || !this.frameLayer.isVisible) {
			return;
		}
		const itemHeight = CommentListView.ITEM_HEIGHT;
		const scrollTop = this._scrollTop;
		const innerHeight = this._innerHeight;
		const windowBottom = scrollTop + innerHeight;
		const itemViews = this._itemViews || [];
		const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 10);
		const endIndex = Math.min(itemViews.length, Math.floor(windowBottom / itemHeight) + 10);
		let changed = 0;
		const newItems = this.newItems, inviewItemList = this._inviewItemList;
		for (let i = startIndex; i < endIndex; i++) {
			if (inviewItemList.has(i) || !itemViews[i]) {
				continue;
			}
			changed++;
			newItems.push(itemViews[i].viewElement);
			inviewItemList.set(i, itemViews[i]);
		}
		const removedItems = this.removedItems;
		for (const i of inviewItemList.keys()) {
			if (i >= startIndex && i <= endIndex) {
				continue;
			}
			changed++;
			removedItems.push(inviewItemList.get(i).viewElement);
			inviewItemList.delete(i);
		}
		if (changed < 1) {
			return;
		}
		this._appendNewItems();
	}
	_appendNewItems() {
		if (this.removedItems.length) {
			for (const e of this.removedItems) { e.remove(); }
			this.removedItems.length = 0;
		}
		if (!this.newItems.length) {
			return;
		}
		const f = this._appendFragment = this._appendFragment || document.createDocumentFragment();
		f.append(...this.newItems);
		this._list.append(f);
		for (const e of this.newItems) { e.style.contentVisibility = 'visible'; }
		this.newItems.length = 0;
	}
	_updatePerspective() {
		const keys = Object.keys(this._inviewItemList);
		let avr = 0;
		if (!this._inviewItemList.size) {
			avr = 50;
		} else {
			let min = 0xffff;
			let max = -0xffff;
			keys.forEach(key => {
				let item = this._inviewItemList.get(key);
				min = Math.min(min, item.time3dp);
				max = Math.max(max, item.time3dp);
				avr += item.time3dp;
			});
			avr = avr / keys.length * 100 + 50; //max * 100; //(min + max) / 2 + 10; //50 + avr / keys.length;
		}
		this._list.style.transform = `translateZ(-${avr}px)`;
	}
	addClass(className) {
		this.classList && this.classList.add(className);
	}
	removeClass(className) {
		this.classList && this.classList.remove(className);
	}
	toggleClass(className, v) {
		this.classList && this.classList.toggle(className, v);
	}
	hasClass(className) {
		return this.classList.contains(className);
	}
	find(query) {
		return this.document.querySelectorAll(query);
	}
	syncScrollTop() {
		if (!this.contentWindow || !this.frameLayer.isVisible) {
			return;
		}
		if (this.isActive) {
			this._scrollTop = this._container.scrollTop;
		}
	}
	setScrollTop(v) {
		if (!this.contentWindow) {
			return;
		}
		this._scrollTop = v;
		if (!this.frameLayer.isVisible) {
			return;
		}
		this._container.scrollTop = v;
	}
	setCurrentPoint(sec, idx, isAutoScroll) {
		if (!this.contentWindow || !this._itemViews || !this.frameLayer.isVisible) {
			return;
		}
		const innerHeight = this._innerHeight;
		const itemViews = this._itemViews;
		const len = itemViews.length;
		const view = itemViews[idx];
		if (len < 1 || !view) {
			return;
		}
		const itemHeight = CommentListView.ITEM_HEIGHT;
		const top = Math.max(0, view.top - innerHeight + itemHeight);
		this.timeScrollTop = top;
		this.isAutoScroll = isAutoScroll;
		if (!this.isActive && isAutoScroll) {
				this.setScrollTop(top);
		}
	}
	showItemDetail(item) {
		const $d = this._$itemDetail;
		$d.attr('data-item-id', item.itemId);
		$d.find('.resNo').text(item.no).end()
			.find('.vpos').text(item.timePos).end()
			.find('.time').text(item.formattedDate).end()
			.find('.userId').text(item.userId).end()
			.find('.cmd').text(item.cmd).end()
			.find('.text').text(item.text).end()
			.addClass('show');
		global.debug.$itemDetail = $d;
	}
	hideItemDetail() {
		this._$itemDetail.removeClass('show');
	}
}
CommentListView.ITEM_HEIGHT = 40;
CommentListView.__css__ = '';
CommentListView.__tpl__ = (`
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>CommentList</title>
<style type="text/css">
	${CONSTANT.BASE_CSS_VARS}
	body {
		user-select: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
	body .is-debug {
		perspective: 100px;
		perspective-origin: left top;
		transition: perspective 0.2s ease;
	}
	body.is-scrolling #listContainerInner *{
		pointer-events: none;
	}
	.is-firefox .virtualScrollBarContainer {
		content: '';
		position: fixed;
		top: 0;
		right: 0;
		width: 16px;
		height: 100vh;
		background: rgba(0, 0, 0, 0.6);
		z-index: 100;
		contain: strict;
		pointer-events: none;
	}
	#listContainer {
		position: absolute;
		top: -1px;
		left:0;
		margin: 0;
		padding: 0;
		width: 100vw;
		height: 100vh;
		overflow-y: scroll;
		overflow-x: hidden;
		overscroll-behavior: none;
		will-change: transform;
		scrollbar-width: 16px;
		scrollbar-color: #039393;
	}
	.is-firefox #listContainer {
		will-change: auto;
	}
	#listContainerInner {
		height: calc(var(--list-height) * 1px);
		min-height: calc(100vh + 100px);
	}
	.is-debug #listContainerInner {
		transform-style: preserve-3d;
		transform: translateZ(-50px);
		transition: transform 0.2s;
	}
	#listContainerInner:empty::after {
		content: 'コメントは空です';
		color: #666;
		display: inline-block;
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.is-guest .forMember {
		display: none !important;
	}
	.itemDetailContainer {
		position: fixed;
		display: block;
		top: 50%;
		left: 50%;
		line-height: normal;
		min-width: 280px;
		max-height: 100%;
		overflow-y: scroll;
		overscroll-behavior: none;
		font-size: 14px;
		transform: translate(-50%, -50%);
		opacity: 0;
		pointer-events: none;
		z-index: 100;
		border: 2px solid #fc9;
		background-color: rgba(255, 255, 232, 0.9);
		box-shadow: 4px 4px 0 rgba(99, 99, 66, 0.8);
		transition: opacity 0.2s;
	}
	.itemDetailContainer.show {
		opacity: 1;
		pointer-events: auto;
	}
	.itemDetailContainer>* {
	}
	.itemDetailContainer * {
		word-break: break-all;
	}
	.itemDetailContainer .reloadComment {
		display: inline-block;
		padding: 0 4px;
		cursor: pointer;
		transform: scale(1.4);
		transition: transform 0.1s;
	}
	.itemDetailContainer .reloadComment:hover {
		transform: scale(1.8);
	}
	.itemDetailContainer .reloadComment:active {
		transform: scale(1.2);
		transition: none;
	}
	.itemDetailContainer .resNo,
	.itemDetailContainer .vpos,
	.itemDetailContainer .time,
	.itemDetailContainer .userId,
	.itemDetailContainer .cmd {
		font-size: 12px;
	}
	.itemDetailContainer .time {
		cursor: pointer;
		color: #339;
	}
	.itemDetailContainer .time:hover {
		text-decoration: underline;
	}
	.itemDetailContainer .time:hover:after {
		position: absolute;
		content: '${'\\00231A'} 過去ログ';
		right: 16px;
		text-decoration: none;
		transform: scale(1.4);
	}
	.itemDetailContainer .resNo:before,
	.itemDetailContainer .vpos:before,
	.itemDetailContainer .time:before,
	.itemDetailContainer .userId:before,
	.itemDetailContainer .cmd:before {
		display: inline-block;
		min-width: 50px;
	}
	.itemDetailContainer .resNo:before {
		content: 'no';
	}
	.itemDetailContainer .vpos:before {
		content: 'pos';
	}
	.itemDetailContainer .time:before {
		content: 'date';
	}
	.itemDetailContainer .userId:before {
		content: 'user';
	}
	.itemDetailContainer .cmd:before {
		content: 'cmd';
	}
	.itemDetailContainer .text {
		border: 1px inset #ccc;
		padding: 8px;
		margin: 4px 8px;
	}
	.itemDetailContainer .close {
		border: 2px solid #666;
		width: 50%;
		cursor: pointer;
		text-align: center;
		margin: auto;
		user-select: none;
	}
	.is-firefox .timeBar { display: none !important; }
	/*.timeBar {
		position: fixed;
		visibility: hidden;
		z-index: 110;
		right: 0;
		top: 1px;
		width: 14px;
		--height-pp:  calc(1px * var(--inner-height) * var(--inner-height) / var(--list-height));
		--trans-y-pp: calc((1px * var(--inner-height) - var(--height-pp)) * var(--time-scroll-top) / var(--list-height));
		min-height: 10px;
		height: var(--height-pp);
		max-height: 100vh;
		transform: translateY(var(--trans-y-pp));
		pointer-events: none;
		will-change: transform;
		border: 1px dashed #e12885;
		opacity: 0.8;
	}
	.timeBar::after {
		width: calc(100% + 6px);
		height: calc(100% + 6px);
		left: -3px;
		top: -3px;
		content: '';
		position: absolute;
		border: 2px solid #2b2b2b;
		outline: 2px solid #2b2b2b;
		outline-offset: -5px;
		box-sizing: border-box;
	}*/
	body:hover .timeBar {
		visibility: visible;
	}
	.virtualScrollBar {
		display: none;
	}
/*
	.is-firefox .virtualScrollBar {
		display: inline-block;
		position: fixed;
		z-index: 100;
		right: 0;
		top: 0px;
		width: 16px;
		--height-pp: calc( 1px * var(--inner-height) * var(--inner-height) / var(--list-height) );
		--trans-y-pp: calc( 1px * var(--inner-height) * var(--scroll-top) / var(--list-height));
		height: var(--height-pp);
		background: #039393;
		max-height: 100vh;
		transform: translateY(var(--trans-y-pp));
		pointer-events: none;
		will-change: transform;
		z-index: 110;
	}
*/
</style>
<style id="listItemStyle">%CSS%</style>
<body class="zenzaRoot">
	<div class="itemDetailContainer">
		<div class="resNo"></div>
		<div class="vpos"></div>
		<div class="time command" data-command="reloadComment"></div>
		<div class="userId"></div>
		<div class="cmd"></div>
		<div class="text"></div>
		<div class="command close" data-command="hideItemDetail">O K</div>
	</div>
	<div class="virtualScrollBarContainer"><div class="virtualScrollBar"></div></div><div class="timeBar"></div>
	<div id="listContainer">
		<div class="listMenu">
			<span class="menuButton itemDetailRequest"
				data-command="itemDetailRequest" title="詳細">？</span>
			<span class="menuButton clipBoard"        data-command="clipBoard" title="クリップボードにコピー">copy</span>
			<span class="menuButton addUserIdFilter"  data-command="addUserIdFilter" title="NGユーザー">NGuser</span>
			<span class="menuButton addWordFilter"    data-command="addWordFilter" title="NGワード">NGword</span>
		</div>
		<div id="listContainerInner"></div>
	</div>
</body>
</html>
	`).trim();
const CommentListItemView = (() => {
	const CSS = (`
			* {
				box-sizing: border-box;
			}
			body {
				background: #000;
				margin: 0;
				padding: 0;
				overflow: hidden;
				line-height: 0;
			}
			${CONSTANT.SCROLLBAR_CSS}
			.listMenu {
				position: absolute;
				display: block;
			}
			.listMenu.show {
				display: block;
				width: 100%;
				left: 0;
				z-index: 100;
			}
			.listMenu  .menuButton {
				display: inline-block;
				position: absolute;
				font-size: 13px;
				line-height: 20px;
				border: 1px solid #666;
				color: #fff;
				background: #666;
				cursor: pointer;
				top: 0;
				text-align: center;
			}
			.listMenu .menuButton:hover {
				border: 1px solid #ccc;
				box-shadow: 2px 2px 2px #333;
			}
			.listMenu .menuButton:active {
				box-shadow: none;
				transform: translate(0, 1px);
			}
			.listMenu .itemDetailRequest {
				right: 176px;
				width: auto;
				padding: 0 8px;
			}
			.listMenu .clipBoard {
				right: 120px;
				width: 48px;
			}
			.listMenu .addWordFilter {
				right: 64px;
				width: 48px;
			}
			.listMenu .addUserIdFilter {
				right: 8px;
				width: 48px;
			}
			.commentListItem {
				position: absolute;
				display: inline-block;
				will-change: transform;
				width: 100%;
				height: 40px;
				line-height: 20px;
				font-size: 20px;
				white-space: nowrap;
				margin: 0;
				padding: 0;
				background: #222;
				z-index: 50;
				contain: strict;
			}
			.is-firefox .commentListItem {
				contain: layout !important;
				width: calc(100vw - 16px);
				will-change: auto;
			}
			.is-active .commentListItem {
				pointer-events: auto;
			}
			.commentListItem * {
				cursor: default;
			}
			.commentListItem.odd {
				background: #333;
			}
			.commentListItem[data-nicoru] {
				background: #332;
			}
			.commentListItem.odd[data-nicoru] {
				background: #443;
			}
			.commentListItem[data-nicoru]:hover::before {
				position: absolute;
				content: attr(data-nicoru);
				color: #ccc;
				font-size: 12px;
				left: 80px;
			}
			.commentListItem .nicoru-icon {
				position: absolute;
				pointer-events: none;
				display: inline-block;
				cursor: pointer;
				visibility: hidden;
				transition: transform 0.2s linear, filter 0.2s;
				transform-origin: center;
				left: 50px;
				top: -2px;
				width: 24px;
				height: 24px;
				contain: strict;
			}
			.commentListItem:hover .nicoru-icon {
				visibility: visible;
			}
			.is-premium .commentListItem:hover .nicoru-icon {
				pointer-events: auto;
			}
			.commentListItem.nicotta .nicoru-icon {
				visibility: visible;
				transform: rotate(270deg);
				filter: drop-shadow(0px 0px 6px gold);
				pointer-events: none;
			}
			.commentListItem.updating {
				opacity: 0.5;
				cursor: wait;
			}
			.commentListItem .info {
				display: flex;
				justify-content: space-between;
				width: 100%;
				font-size: 14px;
				height: 20px;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				color: #888;
				margin: 0;
				padding: 0 8px 0;
			}
			.commentListItem[data-valhalla="1"] .info {
				color: #f88;
			}
			.commentListItem .timepos {
				display: inline-block;
				width: 100px;
			}
			.commentListItem .text {
				display: block;
				font-size: 16px;
				height: 20px;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				color: #ccc;
				margin: 0;
				padding: 0 8px;
				font-family: '游ゴシック', 'Yu Gothic', 'YuGothic', arial, 'Menlo';
				font-feature-settings: "palt" 1;
			}
			.commentListItem[data-valhalla="1"] .text {
				color: red;
				font-weight: bold;
			}
			.is-active .commentListItem:hover {
				overflow-x: hidden;
				overflow-y: visible;
				z-index: 60;
				height: auto;
				box-shadow: 2px 2px 2px #000, 2px -2px 2px #000;
				contain: layout style paint;
			}
			.is-active .commentListItem:hover .text {
				white-space: normal;
				word-break: break-all;
				height: auto;
			}
			.commentListItem.fork1 .timepos {
				text-shadow: 1px 1px 0 #008800, -1px -1px 0 #008800 !important;
			}
			.commentListItem.fork2 .timepos {
				opacity: 0.6;
			}
			.commentListItem.fork1 .text {
				font-weight: bolder;
			}
			.commentListItem.subThread {
				opacity: 0.6;
			}
			.commentListItem.is-active {
				outline: dashed 2px #ff8;
				outline-offset: 4px;
			}
			.font-gothic .text {font-family: "游ゴシック", "Yu Gothic", 'YuGothic', "ＭＳ ゴシック", "IPAMonaPGothic", sans-serif, Arial, Menlo;}
			.font-mincho .text {font-family: "游明朝体", "Yu Mincho", 'YuMincho', Simsun, Osaka-mono, "Osaka−等幅", "ＭＳ 明朝", "ＭＳ ゴシック", "モトヤLシーダ3等幅", 'Hiragino Mincho ProN', monospace;}
			.font-defont .text {font-family: 'Yu Gothic', 'YuGothic', "ＭＳ ゴシック", "MS Gothic", "Meiryo", "ヒラギノ角ゴ", "IPAMonaPGothic", sans-serif, monospace, Menlo; }
/*
			.commentListItem .progress-negi {
				position: absolute;
				width: 2px;
				height: 100%;
				bottom: 0;
				right: 0;
				pointer-events: none;
				background: #888;
				will-change: transform;
				animation-duration: var(--duration);
				animation-delay: calc(var(--vpos-time) - var(--current-time) - 1s);
				animation-name: negi-moving;
				animation-timing-function: linear;
				animation-fill-mode: forwards;
				animation-play-state: paused !important;
				contain: paint layout style size;
			}
			@keyframes negi-moving {
				0% { background: #ebe194;}
				50% { background: #fff; }
				80% { background: #fff; }
				100% { background: #039393; }
			}
*/
		`).trim();
	const TPL = (`
			<div class="commentListItem" style="position: absolute;">
				<img src="${NICORU}" class="nicoru-icon" data-command="nicoru" title="Nicorü">
				<p class="info">
					<span class="timepos"></span>&nbsp;&nbsp;<span class="date"></span>
				</p>
				<p class="text"></p>
				<span class="progress-negi" style="position: absolute; will-change: transform; contain: strict;"></span>
			</div>
		`).trim();
	let counter = 0;
	let template;
	class CommentListItemView {
		static get template() {
			if (!template) {
				const t = document.createElement('template');
				t.id = 'CommentListItemView-template' + Date.now();
				t.innerHTML = TPL;
				template = {
					t,
					clone: () => {
						return document.importNode(t.content, true).firstChild;
					},
					commentListItem: t.content.querySelector('.commentListItem'),
					timepos: t.content.querySelector('.timepos'),
					date: t.content.querySelector('.date'),
					text: t.content.querySelector('.text')
				};
			}
			return template;
		}
		constructor(params) {
			this.initialize(params);
		}
		initialize(params) {
			this._item = params.item;
			this._index = params.index;
			this._height = params.height;
			this._id = counter++;
		}
		build() {
			const template = this.constructor.template;
			const {commentListItem, timepos, date, text} = template;
			const item = this._item;
			const oden = (this._index % 2 === 0) ? 'even' : 'odd';
			const time3dp = Math.round(this._item.time3dp * 100);
			const formattedDate = item.formattedDate;
			commentListItem.id = this.domId;
			const font = item.fontCommand || 'default';
			commentListItem.className =
				`commentListItem no${item.no} item${this._id} ${oden} fork${item.fork} font-${font} ${item.isSubThread ? 'subThread' : ''}`;
			commentListItem.classList.toggle('nicotta', item.nicotta);
			commentListItem.style.cssText = `top: ${this.top}px; content-visibility: hidden;`;
					/*--duration: ${item.duration}s;
					--vpos-time: ${item.vpos / 100}s;*/
			Object.assign(commentListItem.dataset, {
				itemId: item.itemId,
				no: item.no,
				uniqNo: item.uniqNo,
				vpos: item.vpos,
				top: this.top,
				thread: item.threadId,
				title: `${item.no}: ${formattedDate} ID:${item.userId}\n${item.text}`,
				time3dp,
				valhalla: item.valhalla,
			});
			item.nicoru > 0 ?
				(commentListItem.dataset.nicoru = item.nicoru) :
				(delete commentListItem.dataset.nicoru);
			timepos.textContent = item.timePos;
			date.textContent = formattedDate;
			text.textContent = item.text.trim();
			const color = item.color;
			text.style.textShadow = color ? `0px 0px 2px ${color}` : '';
			this._view = template.clone();
		}
		get viewElement() {
			if (!this._view) {
				this.build();
			}
			return this._view;
		}
		get itemId() {
			return this._item.itemId;
		}
		get domId() {
			return `item${this._item.itemId}`;
		}
		get top() {
			return this._index * this._height;
		}
		remove() {
			if (!this._view) {
				return;
			}
			this._view.remove();
		}
		toString() {
			return this.viewElement.outerHTML;
		}
		get time3dp() {
			return this._item.time3dp;
		}
		get time3d() {
			return this._item.time3d;
		}
		get nicotta() {
			return this._item.nicotta;
		}
		set nicotta(v) {
			this._item.nicotta = v;
			this._view.classList.toggle('nicotta', v);
		}
		get nicoru() {
			return this._item.nicoru;
		}
		set nicoru(v) {
			this._item.nicoru = v;
			v > 0 ?
				(this._view.dataset.nicoru = v) : (delete this._view.dataset.nicoru);
		}
	}
	CommentListItemView.TPL = TPL;
	CommentListItemView.CSS = CSS;
	return CommentListItemView;
})();
class CommentListItem {
	constructor(nicoChat) {
		this.nicoChat = nicoChat;
		this._itemId = CommentListItem._itemId++;
		this._vpos = nicoChat.vpos;
		this._text = nicoChat.text;
		this._escapedText = textUtil.escapeHtml(this._text);
		this._userId = nicoChat.userId;
		this._date = nicoChat.date;
		this._fork = nicoChat.fork;
		this._no = nicoChat.no;
		this._color = nicoChat.color;
		this._fontCommand = nicoChat.fontCommand;
		this._isSubThread = nicoChat.isSubThread;
		this._formattedDate = textUtil.dateToString(this._date * 1000);
		this._timePos = textUtil.secToTime(this._vpos / 100);
	}
	get itemId() {return this._itemId;}
	get vpos() {return this._vpos;}
	get timePos() {return this._timePos;}
	get cmd() {return this.nicoChat.cmd;}
	get text() {return this._text;}
	get escapedText() {return this._escapedText;}
	get userId() {return this._userId;}
	get color() {return this._color;}
	get date() {return this._date;}
	get time() {return this._date * 1000;}
	get formattedDate() {return this._formattedDate;}
	get fork() {return this._fork;}
	get no() {return this._no;}
	get uniqNo() {return this.nicoChat.uniqNo;}
	get fontCommand() {return this._fontCommand;}
	get isSubThread() {return this._isSubThread;}
	get threadId() {return this.nicoChat.threadId;}
	get time3d() {return this.nicoChat.time3d;}
	get time3dp() {return this.nicoChat.time3dp;}
	get nicoru() {return this.nicoChat.nicoru;}
	set nicoru(v) { this.nicoChat.nicoru = v;}
	get duration() {return this.nicoChat.duration;}
	get valhalla() {return this.nicoChat.valhalla;}
	get nicotta() { return this.nicoChat.nicotta;}
	set nicotta(v) { this.nicoChat.nicotta = v; }
}
CommentListItem._itemId = 0;
class CommentPanelView extends Emitter {
	constructor(params) {
		super();
		this.$container = params.$container;
		this.model = params.model;
		this.commentPanel = params.commentPanel;
		css.addStyle(CommentPanelView.__css__);
		const $view = this.$view = uq.html(CommentPanelView.__tpl__);
		this.$container.append($view);
		const $menu = this._$menu = this.$view.find('.commentPanel-menu');
		global.debug.commentPanelView = this;
		const listView = this._listView = new CommentListView({
			container: this.$view.find('.commentPanel-frame')[0],
			model: this.model,
			className: 'commentList',
			builder: CommentListItemView,
			itemCss: CommentListItemView.__css__
		});
		listView.on('command', this._onCommand.bind(this));
		this._timeMachineView = new TimeMachineView({
			parentNode: document.querySelector('.timeMachineContainer')
		});
		this._timeMachineView.on('command', this._onCommand.bind(this));
		this.commentPanel.on('threadInfo',
			_.debounce(this._onThreadInfo.bind(this), 100));
		this.commentPanel.on('update',
			_.debounce(this._onCommentPanelStatusUpdate.bind(this), 100));
		this.commentPanel.on('itemDetailResp',
			_.debounce(item => listView.showItemDetail(item), 100));
		this._onCommentPanelStatusUpdate();
		this.model.on('currentTimeUpdate', this._onModelCurrentTimeUpdate.bind(this));
		this.$view.on('click', this._onCommentListCommandClick.bind(this));
		global.emitter.on('hideHover', () => $menu.removeClass('show'));
	}
	toggleClass(className, v) {
		this.$view.raf.toggleClass(className, v);
	}
	_onModelCurrentTimeUpdate(sec, viewIndex) {
		if (!this.$view){
			return;
		}
		this._lastCurrentTime = sec;
		this._listView.setCurrentPoint(sec, viewIndex, this.commentPanel.isAutoScroll);
	}
	_onCommand(command, param, itemId) {
		switch (command) {
			case 'nicoru':
				param.nicotta = true;
				this.emit('command', command, param, itemId);
				break;
			default:
				this.emit('command', command, param, itemId);
				break;
		}
	}
	_onCommentListCommandClick(e) {
		const target = e.target.closest('[data-command]');
		if (!target) { return; }
		const {command, param} = target.dataset;
		e.stopPropagation();
		if (!command) {
			return;
		}
		const $view = this.$view;
		const setUpdating = () => {
			document.activeElement.blur();
			$view.raf.addClass('updating');
			window.setTimeout(() => $view.removeClass('updating'), 1000);
		};
		switch (command) {
			case 'sortBy':
				setUpdating();
				this.emit('command', command, param);
				break;
			case 'reloadComment':
				setUpdating();
				this.emit('command', command, param);
				break;
			default:
				this.emit('command', command, param);
		}
		global.emitter.emitAsync('hideHover');
	}
	_onThreadInfo(threadInfo) {
		this._timeMachineView.update(threadInfo);
	}
	_onCommentPanelStatusUpdate() {
		const commentPanel = this.commentPanel;
		const $view = this.$view.raf.toggleClass('autoScroll', commentPanel.isAutoScroll);
		const langClass = `lang-${commentPanel.getLanguage()}`;
		if (!$view.hasClass(langClass)) {
			$view.raf.removeClass('lang-ja_JP lang-en_US lang-zh_TW').addClass(langClass);
		}
	}
}
CommentPanelView.__css__ = `
		:root {
			--zenza-comment-panel-header-height: 64px;
		}
		.commentPanel-container {
			height: 100%;
			overflow: hidden;
			user-select: none;
		}
		.commentPanel-header {
			height: var(--zenza-comment-panel-header-height);
			border-bottom: 1px solid #000;
			background: #333;
			color: #ccc;
		}
		.commentPanel-menu-button {
			display: inline-block;
			cursor: pointer;
			border: 1px solid #333;
			padding: 0px 4px;
			margin: 0 4px;
			background: #666;
			font-size: 16px;
			line-height: 28px;
			white-space: nowrap;
		}
		.commentPanel-menu-button:hover {
			border: 1px outset;
		}
		.commentPanel-menu-button:active {
			border: 1px inset;
		}
		.commentPanel-menu-button .commentPanel-menu-icon {
			font-size: 24px;
			line-height: 28px;
		}
		.commentPanel-container.autoScroll .autoScroll {
			text-shadow: 0 0 6px #f99;
			color: #ff9;
		}
		.commentPanel-frame {
			height: calc(100% - var(--zenza-comment-panel-header-height));
			transition: opacity 0.3s;
		}
		.updating .commentPanel-frame,
		.shuffle .commentPanel-frame {
			opacity: 0;
		}
		.commentPanel-menu-toggle {
			position: absolute;
			right: 8px;
			display: inline-block;
			font-size: 14px;
			line-height: 32px;
			cursor: pointer;
			outline: none;
		}
		.commentPanel-menu-toggle:focus-within {
			pointer-events: none;
		}
		.commentPanel-menu-toggle:focus-within .zenzaPopupMenu {
			pointer-events: auto;
			visibility: visible;
			opacity: 0.99;
			pointer-events: auto;
			transition: opacity 0.3s;
		}
		.commentPanel-menu {
			position: absolute;
			right: 0px;
			top: 24px;
			min-width: 150px;
		}
		.commentPanel-menu li {
			line-height: 20px;
		}
		.commentPanel-container.lang-ja_JP .commentPanel-command[data-param=ja_JP],
		.commentPanel-container.lang-en_US .commentPanel-command[data-param=en_US],
		.commentPanel-container.lang-zh_TW .commentPanel-command[data-param=zh_TW] {
			font-weight: bolder;
			color: #ff9;
		}
	`.trim();
CommentPanelView.__tpl__ = (`
		<div class="commentPanel-container">
			<div class="commentPanel-header">
				<label class="commentPanel-menu-button autoScroll commentPanel-command"
					data-command="toggleScroll"><icon class="commentPanel-menu-icon">⬇️</icon> 自動スクロール</label>
				<div class="commentPanel-command commentPanel-menu-toggle" tabindex="-1">
					▼ メニュー
					<div class="zenzaPopupMenu commentPanel-menu">
						<div class="listInner">
						<ul>
							<li class="commentPanel-command" data-command="sortBy" data-param="vpos">
								コメント位置順に並べる
							</li>
							<li class="commentPanel-command" data-command="sortBy" data-param="date:desc">
								コメントの新しい順に並べる
							</li>
							<li class="commentPanel-command" data-command="sortBy" data-param="nicoru:desc">
								ニコる数で並べる
							</li>
							<hr class="separator">
							<li class="commentPanel-command" data-command="update-commentLanguage" data-param="ja_JP">
								日本語
							</li>
							<li class="commentPanel-command" data-command="update-commentLanguage" data-param="en_US">
								English
							</li>
							<li class="commentPanel-command" data-command="update-commentLanguage" data-param="zh_TW">
								中文
							</li>
						</ul>
						</div>
					</div>
				</div>
			<div class="timeMachineContainer"></div>
			</div>
			<div class="commentPanel-frame"></div>
		</div>
	`).trim();
class CommentPanel extends Emitter {
	constructor(params) {
		super();
		this._thumbInfoLoader = params.loader || global.api.ThumbInfoLoader;
		this._$container = params.$container;
		const player = this._player = params.player;
		this._autoScroll = _.isBoolean(params.autoScroll) ? params.autoScroll : true;
		this._model = new CommentListModel({});
		this._language = params.language || 'ja_JP';
		player.on('commentParsed', _.debounce(this._onCommentParsed.bind(this), 500));
		player.on('commentChange', _.debounce(this._onCommentChange.bind(this), 500));
		player.on('commentReady', _.debounce(this._onCommentReady.bind(this), 500));
		player.on('open', this._onPlayerOpen.bind(this));
		player.on('close', this._onPlayerClose.bind(this));
		global.debug.commentPanel = this;
	}
	_initializeView() {
		if (this._view) {
			return;
		}
		this._view = new CommentPanelView({
			$container: this._$container,
			model: this._model,
			commentPanel: this,
			builder: CommentListItemView,
			itemCss: CommentListItemView.__css__
		});
		this._view.on('command', this._onCommand.bind(this));
	}
	startTimer() {
		this.stopTimer();
		this._timer = window.setInterval(this._onTimer.bind(this), 200);
	}
	stopTimer() {
		if (this._timer) {
			window.clearInterval(this._timer);
			this._timer = null;
		}
	}
	_onTimer() {
		if (this._autoScroll) {
			this.currentTime=this._player.currentTime;
		}
	}
	_onCommand(command, param, itemId) {
		let item;
		if (itemId) {
			item = this._model.findByItemId(itemId);
		}
		switch (command) {
			case 'toggleScroll':
				this.toggleScroll();
				break;
			case 'sortBy': {
				const tmp = param.split(':');
				this.sortBy(tmp[0], tmp[1] === 'desc');
				break;}
			case 'select':{
				const vpos = item.vpos;
				this.emit('command', 'seek', vpos / 100);
				break;}
			case 'clipBoard':
				Clipboard.copyText(item.text);
				this.emit('command', 'notify', 'クリップボードにコピーしました');
				break;
			case 'addUserIdFilter':
				this._model.removeItem(item);
				this.emit('command', command, item.userId);
				break;
			case 'addWordFilter':
				this._model.removeItem(item);
				this.emit('command', command, item.text);
				break;
			case 'reloadComment':
				if (item) {
					param = {};
					const dt = new Date(item.time);
					this.emit('command', 'notify', item.formattedDate + '頃のログ');
					param.when = Math.floor(dt.getTime() / 1000);
				}
				this.emit('command', command, param);
				break;
			case 'itemDetailRequest':
				if (item) {
					this.emit('itemDetailResp', item);
				}
				break;
			case 'nicoru':
				item.nicotta = true;
				item.nicoru += 1;
				this.emit('command', command, item.nicoChat);
				break;
			default:
				this.emit('command', command, param);
		}
	}
	_onCommentParsed(language) {
		this.setLanguage(language);
		this._initializeView();
		this.setChatList(this._player.chatList);
		this.startTimer();
	}
	_onCommentChange(language) {
		this.setLanguage(language);
		this._initializeView();
		this.setChatList(this._player.chatList);
	}
	_onCommentReady(result, threadInfo) {
		this._threadInfo = threadInfo;
		this.emit('threadInfo', threadInfo);
	}
	_onPlayerOpen() {
		this._model.clear();
	}
	_onPlayerClose() {
		this._model.clear();
		this.stopTimer();
	}
	setChatList(chatList) {
		if (!this._model) {
			return;
		}
		this._model.setChatList(chatList);
	}
	get isAutoScroll() {
		return this._autoScroll;
	}
	getLanguage() {
		return this._language || 'ja_JP';
	}
	getThreadInfo() {
		return this._threadInfo;
	}
	setLanguage(lang) {
		if (lang !== this._language) {
			this._language = lang;
			this.emit('update');
		}
	}
	toggleScroll(v) {
		if (!_.isBoolean(v)) {
			this._autoScroll = !this._autoScroll;
			if (this._autoScroll) {
				this._model.sortBy('vpos');
			}
			this.emit('update');
			return;
		}
		if (this._autoScroll !== v) {
			this._autoScroll = v;
			if (this._autoScroll) {
				this._model.sortBy('vpos');
			}
			this.emit('update');
		}
	}
	sortBy(key, isDesc) {
		this._model.sortBy(key, isDesc);
		if (key !== 'vpos') {
			this.toggleScroll(false);
		}
	}
	set currentTime(sec) {
		if (!this._view || this._player.currentTab !== 'comment') {
			return;
		}
		this._model.currentTime = sec;
	}
	get currentTime() {
		return this._model.currentTime;
	}
}
class TimeMachineView extends BaseViewComponent {
	constructor({parentNode}) {
		super({
			parentNode,
			name: 'TimeMachineView',
			template: '<div class="TimeMachineView"></div>',
			shadow: TimeMachineView._shadow_,
			css: ''
		});
		this._bound._onTimer = this._onTimer.bind(this);
		this._state = {
			isWaybackMode: false,
			isSelecting: false,
		};
		this._currentTimestamp = Date.now();
		global.debug.timeMachineView = this;
		window.setInterval(this._bound._onTimer, 3 * 1000);
	}
	_initDom(...args) {
		super._initDom(...args);
		const v = this._shadow || this._view;
		Object.assign(this._elm, {
			time: v.querySelector('.dateTime'),
			back: v.querySelector('.backToTheFuture'),
			input: v.querySelector('.dateTimeInput'),
			submit: v.querySelector('.dateTimeSubmit'),
			cancel: v.querySelector('.dateTimeCancel')
		});
		this._updateTimestamp();
		this._elm.time.addEventListener('click', this._toggle.bind(this));
		this._elm.back.addEventListener('mousedown', _.debounce(this._onBack.bind(this), 300));
		this._elm.submit.addEventListener('click', this._onSubmit.bind(this));
		this._elm.cancel.addEventListener('click', this._onCancel.bind(this));
	}
	update(threadInfo) {
		this._videoPostTime = threadInfo.threadId * 1000;
		const isWaybackMode = threadInfo.isWaybackMode;
		this.setState({isWaybackMode, isSelecting: false});
		if (isWaybackMode) {
			this._currentTimestamp = threadInfo.when * 1000;
		} else {
			this._currentTimestamp = Date.now();
		}
		this._updateTimestamp();
	}
	_updateTimestamp() {
		if (isNaN(this._currentTimestamp)) {
			return;
		}
		this._elm.time.textContent = this._currentTime = this._toDate(this._currentTimestamp);
	}
	openSelect() {
		const input = this._elm.input;
		const now = this._toTDate(Date.now());
		input.setAttribute('max', now);
		input.setAttribute('value', this._toTDate(this._currentTimestamp));
		input.setAttribute('min', this._toTDate(this._videoPostTime));
		this.setState({isSelecting: true});
		window.setTimeout(() => {
			input.focus();
		}, 0);
	}
	closeSelect() {
		this.setState({isSelecting: false});
	}
	_toggle() {
		if (this._state.isSelecting) {
			this.closeSelect();
		} else {
			this.openSelect();
		}
	}
	_onTimer() {
		if (this._state.isWaybackMode) {
			return;
		}
		let now = Date.now();
		let str = this._toDate(now);
		if (this._currentTime === str) {
			return;
		}
		this._currentTimestamp = now;
		this._updateTimestamp();
	}
	_padTime(time) {
		const pad = v => v.toString().padStart(2, '0');
		const dt = new Date(time);
		return {
			yyyy: dt.getFullYear(),
			mm: pad(dt.getMonth() + 1),
			dd: pad(dt.getDate()),
			h: pad(dt.getHours()),
			m: pad(dt.getMinutes()),
			s: pad(dt.getSeconds())
		};
	}
	_toDate(time) {
		const {yyyy, mm, dd, h, m} = this._padTime(time);
		return `${yyyy}/${mm}/${dd} ${h}:${m}`;
	}
	_toTDate(time) {
		const {yyyy, mm, dd, h, m, s} = this._padTime(time);
		return `${yyyy}-${mm}-${dd}T${h}:${m}:${s}`;
	}
	_onSubmit() {
		const val = this._elm.input.value;
		if (!val || !/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d(|:\d\d)$/.test(val)) {
			return;
		}
		const dt = new Date(val);
		const when =
			Math.floor(Math.max(dt.getTime(), this._videoPostTime) / 1000);
		this.emit('command', 'reloadComment', {when});
		this.closeSelect();
	}
	_onCancel() {
		this.closeSelect();
	}
	_onBack() {
		this.setState({isWaybackMode: false});
		this.closeSelect();
		this.emit('command', 'reloadComment', {when: 0});
	}
}
TimeMachineView._shadow_ = (`
		<style>
			.dateTime {
				display: inline-block;
				margin: auto 4px 4px;
				padding: 0 4px;
				border: 1px solid;
				background: #888;
				color: #000;
				font-size: 20px;
				line-height: 24px;
				font-family: monospace;
				cursor: pointer;
			}
			.is-WaybackMode .dateTime {
				background: #000;
				color: #888;
				box-shadow: 0 0 4px #ccc, 0 0 4px #ccc inset;
			}
			.reloadButton {
				display: inline-block;
				line-height: 24px;
				font-size: 16px;
				margin: auto 4px;
				cursor: pointer;
				user-select: none;
				transition: transform 0.1s;
			}
			.is-WaybackMode .reloadButton {
				display: none;
			}
				.reloadButton .icon {
					display: inline-block;
					transform: rotate(90deg) scale(1.3);
					transition: transform 1s, color 0.2s, text-shadow 0.2s;
					text-shadow: none;
					font-family: 'STIXGeneral';
					margin-right: 8px;
				}
				.reloadButton:hover {
					text-decoration: underline;
				}
				.reloadButton:active {
					color: #888;
					cursor: wait;
				}
				.reloadButton:active .icon {
					text-decoration: none;
					transform: rotate(-270deg) scale(2);
					transition: none;
					color: #ff0;
					text-shadow: 0 0 4px #ff8;
				}
			.backToTheFuture {
				display: none;
				line-height: 24px;
				font-size: 16px;
				margin: auto 4px;
				cursor: pointer;
				transition: transform 0.1s;
				user-select: none;
			}
			.backToTheFuture:hover {
				text-shadow: 0 0 8px #ffc;
				transform: translate(0, -2px);
			}
			.backToTheFuture:active {
				text-shadow: none;
				transform: translate(0px, -1000px);
			}
			.is-WaybackMode .backToTheFuture {
				display: inline-block;
			}
			.inputContainer {
				display: none;
				position: absolute;
				top: 32px;
				left: 4px;
				background: #333;
				box-shadow: 0 0 4px #fff;
			}
			.is-Selecting .inputContainer {
				display: block;
			}
				.dateTimeInput {
					display: block;
					font-size: 16px;
					min-width: 256px;
				}
				.submitContainer {
					text-align: right;
				}
					.dateTimeSubmit, .dateTimeCancel {
						display: inline-block;
						min-width: 50px;
						cursor: pointer;
						padding: 4px 8px;
						margin: 4px;
						border: 1px solid #888;
						text-align: center;
						transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
						user-select: none;
					}
					.dateTimeSubmit:hover, .dateTimeCancel:hover {
						background: #666;
						transform: translate(0, -2px);
						box-shadow: 0 4px 2px #000;
					}
					.dateTimeSubmit:active, .dateTimeCancel:active {
						background: #333;
						transform: translate(0, 0);
						box-shadow: 0 0 2px #000 inset;
					}
					.dateTimeSubmit {
					}
					.dateTimeCancel {
					}
		</style>
		<div class="root TimeMachine">
			<div class="dateTime" title="TimeMachine">0000/00/00 00:00</div>
			<div class="reloadButton command" data-command="reloadComment" data-param="0" title="コメントのリロード"><span class="icon">&#8635;</span>リロード</div>
			<div class="backToTheFuture" title="Back To The Future">&#11152; Back</div>
			<div class="inputContainer">
				<input type="datetime-local" class="dateTimeInput">
				<div class="submitContainer">
				<div class="dateTimeSubmit">G&nbsp;&nbsp;O</div>
				<div class="dateTimeCancel">Cancel</div>
				</div>
			</div>
		</div>
	`).trim();
TimeMachineView.__tpl__ = ('<div class="TimeMachineView"></div>').trim();

//@require VideoListItem
//@require VideoListModel
//@require VideoListItemView
//@require PlayListModel
//@require VideoList
//@require RelatedVideoList
//@require PlayListSession
//@require VideoListView
//@require PlayListView
class PlayList extends VideoList {
	initialize(params) {
		this._thumbInfoLoader = params.loader || global.api.ThumbInfoLoader;
		this._container = params.container;
		this._index = -1;
		this._isEnable = false;
		this._isLoop = params.loop;
		this.model = new PlayListModel({});
		global.debug.playlist = this;
		this.on('update', _.debounce(() => PlayListSession.save(this.serialize()), 3000));
		global.emitter.on('tabChange', tab => {
			if (tab === 'playlist') {
				this.scrollToActiveItem();
			}
		});
	}
	serialize() {
		return {
			items: this.model.serialize(),
			index: this._index,
			enable: this._isEnable,
			loop: this._isLoop
		};
	}
	unserialize(data) {
		if (!data) {
			return;
		}
		this._initializeView();
		console.log('unserialize: ', data);
		this.model.unserialize(data.items);
		this._isEnable = data.enable;
		this._isLoop = data.loop;
		this.emit('update');
		this.setIndex(data.index);
	}
	restoreFromSession() {
		this.unserialize(PlayListSession.restore());
	}
	_initializeView() {
		if (this.view) {
			return;
		}
		this.view = new PlayListView({
			container: this._container,
			model: this.model,
			playlist: this
		});
		this.view.on('command', this._onCommand.bind(this));
		this.view.on('deflistAdd', this._onDeflistAdd.bind(this));
		this.view.on('moveItem', this._onMoveItem.bind(this));
	}
	_onCommand(command, param, itemId) {
		let item;
		switch (command) {
			case 'toggleEnable':
				this.toggleEnable();
				break;
			case 'toggleLoop':
				this.toggleLoop();
				break;
			case 'shuffle':
				this.shuffle();
				break;
			case 'reverse':
				this.model.reverse();
				break;
			case 'sortBy': {
				let [key, order] = param.split(':');
				this.sortBy(key, order === 'desc');
				break;
			}
			case 'clear':
				this._setItemData([]);
				break;
			case 'select':
				item = this.model.findByItemId(itemId);
				this.setIndex(this.model.indexOf(item));
				this.emit('command', 'openNow', item.watchId);
				break;
			case 'playlistRemove':
				item = this.model.findByItemId(itemId);
				this.model.removeItem(item);
				this._refreshIndex();
				this.emit('update');
				break;
			case 'removePlayedItem':
				this.removePlayedItem();
				break;
			case 'resetPlayedItemFlag':
				this.model.resetPlayedItemFlag();
				break;
			case 'removeNonActiveItem':
				this.removeNonActiveItem();
				break;
			case 'exportFile':
				this._onExportFileCommand();
				break;
			case 'importFile':
				this._onImportFileCommand(param);
				break;
			case 'scrollToActiveItem':
				this.scrollToActiveItem(true);
				break;
			default:
				this.emit('command', command, param);
		}
	}
	_onExportFileCommand() {
		const dt = new Date();
		const title = prompt('プレイリストを保存\nプレイヤーにドロップすると復元されます',
			textUtil.dateToString(dt) + 'のプレイリスト');
		if (!title) {
			return;
		}
		const data = JSON.stringify(this.serialize(), null, 2);
		const blob = new Blob([data], {'type': 'text/html'});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		Object.assign(a, {
			download: title + '.playlist.json',
			rel: 'noopener',
			href: url
		});
		document.body.append(a);
		a.click();
		setTimeout(() => a.remove(), 1000);
	}
	_onImportFileCommand(fileData) {
		if (!textUtil.isValidJson(fileData)) {
			return;
		}
		this.emit('command', 'pause');
		this.emit('command', 'notify', 'プレイリストを復元');
		this.unserialize(JSON.parse(fileData));
		window.setTimeout(() => {
			const index = Math.max(0, fileData.index || 0);
			const item = this.model.getItemByIndex(index);
			if (item) {
				this.setIndex(index, true);
				this.emit('command', 'openNow', item.watchId);
			}
		}, 2000);
	}
	_onMoveItem(fromItemId, toItemId) {
		const fromItem = this.model.findByItemId(fromItemId);
		const toItem = this.model.findByItemId(toItemId);
		if (!fromItem || !toItem) {
			return;
		}
		this.model.moveItemTo(fromItem, toItem);
		this._refreshIndex();
	}
	_setItemData(listData) {
		const items = listData.map(itemData => new VideoListItem(itemData));
		this.model.setItem(items);
		this.setIndex(items.length > 0 ? 0 : -1);
	}
	_replaceAll(videoListItems, options) {
		options = options || {};
		this.model.setItem(videoListItems);
		const item = this.model.findByWatchId(options.watchId);
		if (item) {
			item.isActive = true;
			item.isPlayed = true;
			this._activeItem = item;
			setTimeout(() => this.view.scrollToItem(item), 1000);
		}
		this.setIndex(this.model.indexOf(item));
	}
	_appendAll(videoListItems, options) {
		options = options || {};
		this.model.appendItem(videoListItems);
		const item = this.model.findByWatchId(options.watchId);
		if (item) {
			item.isActive = true;
			item.isPlayed = true;
			this._refreshIndex(false);
		}
		setTimeout(() => this.view.scrollToItem(videoListItems[0]), 1000);
	}
	_insertAll(videoListItems, options) {
		options = options || {};
		this.model.insertItem(
			videoListItems,
			this.getIndex() + 1);
		const item = this.model.findByWatchId(options.watchId);
		if (item) {
			item.isActive = true;
			item.isPlayed = true;
			this._refreshIndex(false);
		}
		setTimeout(() => this.view.scrollToItem(videoListItems[0]), 1000);
	}
	replaceItems(videoListItemsRawData, options) {
		const items = videoListItemsRawData.map(raw => new VideoListItem(raw));
		return this._replaceAll(items, options);
	}
	appendItems(videoListItemsRawData, options) {
		const items = videoListItemsRawData.map(raw => new VideoListItem(raw));
		return this._appendAll(items, options);
	}
	insertItems(videoListItemsRawData, options) {
		const items = videoListItemsRawData.map(raw => new VideoListItem(raw));
		return this._insertAll(items, options);
	}
	loadFromMylist(mylistId, options, msgInfo) {
		this._initializeView();
		if (!this._mylistApiLoader) {
			this._mylistApiLoader = MylistApiLoader;
		}
		window.console.time('loadMylist: ' + mylistId);
		return this._mylistApiLoader
			.getMylistItems(mylistId, options, msgInfo).then(items => {
				window.console.timeEnd('loadMylist: ' + mylistId);
				let videoListItems = items.filter(item => {
					if (item.id === null) {
						return;
					} // ごく稀にある？idが抹消されたレコード
					if (item.item_data) {
						if (parseInt(item.item_type, 10) !== 0) {
							return;
						} // not video
						if (parseInt(item.item_data.deleted, 10) !== 0) {
							return;
						} // 削除動画を除外
					} else {
						if (item.thumbnail_url && item.thumbnail_url.indexOf('video_deleted') >= 0) {
							return;
						}
					}
					return true;
				}).map(item => VideoListItem.createByMylistItem(item));
				if (videoListItems.length < 1) {
					return Promise.reject({
						status: 'fail',
						message: 'マイリストの取得に失敗しました'
					});
				}
				if (options.shuffle) {
					videoListItems = _.shuffle(videoListItems);
				}
				if (options.insert) {
					this._insertAll(videoListItems, options);
				} else if (options.append) {
					this._appendAll(videoListItems, options);
				} else {
					this._replaceAll(videoListItems, options);
				}
				this.emit('update');
				return Promise.resolve({
					status: 'ok',
					message:
						options.append ?
							'マイリストの内容をプレイリストに追加しました' :
							'マイリストの内容をプレイリストに読み込みしました'
				});
			});
	}
	loadUploadedVideo(userId, options) {
		this._initializeView();
		if (!this._uploadedVideoApiLoader) {
			this._uploadedVideoApiLoader = UploadedVideoApiLoader;
		}
		window.console.time('loadUploadedVideos' + userId);
		return this._uploadedVideoApiLoader
			.load(userId, options).then(items => {
				window.console.timeEnd('loadUploadedVideos' + userId);
				let videoListItems = items.map(item => VideoListItem.createByMylistItem(item));
				if (videoListItems.length < 1) {
					return Promise.reject({});
				}
				videoListItems.reverse();
				if (options.shuffle) {
					videoListItems = _.shuffle(videoListItems);
				}
				if (options.insert) {
					this._insertAll(videoListItems, options);
				} else if (options.append) {
					this._appendAll(videoListItems, options);
				} else {
					this._replaceAll(videoListItems, options);
				}
				this.emit('update');
				return Promise.resolve({
					status: 'ok',
					message:
						options.append ?
							'投稿動画一覧をプレイリストに追加しました' :
							'投稿動画一覧をプレイリストに読み込みしました'
				});
			});
	}
	loadSearchVideo(word, options, limit = 300) {
		this._initializeView();
		if (!this._searchApiLoader) {
			this._nicoSearchApiLoader = NicoSearchApiV2Loader;
		}
		window.console.time('loadSearchVideos' + word);
		options = options || {};
		return this._nicoSearchApiLoader
			.searchMore(word, options, limit).then(result => {
				window.console.timeEnd('loadSearchVideos' + word);
				const items = result.list || [];
				let videoListItems = items
					.filter(item => {
						return (item.item_data &&
							parseInt(item.item_data.deleted, 10) === 0) ||
							(item.thumbnail_url || '').indexOf('video_deleted') < 0;
					}).map(item => VideoListItem.createByMylistItem(item));
				if (videoListItems.length < 1) {
					return Promise.reject({});
				}
				if (options.playlistSort) {
					videoListItems = _.sortBy(
						videoListItems, item =>  item.postedAt + item.sortTitle);
				}
				if (options.shuffle) {
					videoListItems = _.shuffle(videoListItems);
				}
				if (options.insert) {
					this._insertAll(videoListItems, options);
				} else if (options.append) {
					this._appendAll(videoListItems, options);
				} else {
					this._replaceAll(videoListItems, options);
				}
				this.emit('update');
				return Promise.resolve({
					status: 'ok',
					message:
						options.append ?
							'検索結果をプレイリストに追加しました' :
							'検索結果をプレイリストに読み込みしました'
				});
			});
	}
	async loadSeriesList(seriesId, options = {}) {
		this._initializeView();
		const data = await RecommendAPILoader.loadSeries(seriesId, options);
		const videoItems = [];
		(data.items || []).forEach(item => {
			if (item.contentType !== 'video') {
				return;
			}
			const content = item.content;
			videoItems.push(new VideoListItem({
				_format: 'recommendApi',
				_data: item,
				id: item.id,
				uniq_id: item.id,
				title: content.title,
				length_seconds: content.duration,
				num_res: content.count.comment,
				mylist_counter: content.count.mylist,
				view_counter: content.count.view,
				thumbnail_url: content.thumbnail.url,
				first_retrieve: content.registeredAt,
				has_data: true,
				is_translated: false
			}));
		});
		if (options.insert) {
			this._insertAll(videoItems, options);
		} else if (options.append) {
			this._appendAll(videoItems, options);
		} else {
			this._replaceAll(videoItems, options);
		}
		this.emit('update');
		return {
			status: 'ok',
			message:
				options.append ? '動画シリーズをプレイリストに追加しました' : '動画シリーズをプレイリストに読み込みしました'
		};
	}
	insert(watchId) {
		this._initializeView();
		if (this._activeItem && this._activeItem.watchId === watchId) {
			return Promise.resolve();
		}
		const model = this.model;
		const index = this._index;
		return this._thumbInfoLoader.load(watchId).then(info => {
			info.id = info.isChannel ? info.id : watchId;
			const item = VideoListItem.createByThumbInfo(info);
			model.insertItem(item, index + 1);
			this._refreshIndex(true);
			this.emit('update');
			this.emit('command', 'notifyHtml',
				`次に再生: <img src="${item.thumbnail}" style="width: 96px;">${textUtil.escapeToZenkaku(item.title)}`
			);
		}).catch(result => {
			const item = VideoListItem.createBlankInfo(watchId);
			model.insertItem(item, index + 1);
			this._refreshIndex(true);
			this.emit('update');
			window.console.error(result);
			this.emit('command', 'alert', `動画情報の取得に失敗: ${watchId}`);
		});
	}
	insertCurrentVideo(videoInfo) {
		this._initializeView();
		if (this._activeItem &&
			!this._activeItem.isBlankData &&
			this._activeItem.watchId === videoInfo.watchId) {
			this._activeItem.updateByVideoInfo(videoInfo);
			this._activeItem.isPlayed = true;
			this.scrollToActiveItem();
			return;
		}
		let currentItem = this.model.findByWatchId(videoInfo.watchId);
		if (currentItem && !currentItem.isBlankData) {
			currentItem.updateByVideoInfo(videoInfo);
			currentItem.isPlayed = true;
			this.setIndex(this.model.indexOf(currentItem));
			this.scrollToActiveItem();
			return;
		}
		const item = VideoListItem.createByVideoInfoModel(videoInfo);
		item.isPlayed = true;
		if (this._activeItem) {
			this._activeItem.isActive = false;
		}
		this.model.insertItem(item, this._index + 1);
		this._activeItem = this.model.findByItemId(item.itemId);
		this._refreshIndex(true);
	}
	removeItemByWatchId(watchId) {
		const item = this.model.findByWatchId(watchId);
		if (!item || item.isActive) {
			return;
		}
		this.model.removeItem(item);
		this._refreshIndex(true);
	}
	append(watchId) {
		this._initializeView();
		if (this._activeItem && this._activeItem.watchId === watchId) {
			return Promise.resolve();
		}
		const model = this.model;
		return this._thumbInfoLoader.load(watchId).then(info => {
			info.id = watchId;
			const item = VideoListItem.createByThumbInfo(info);
			model.appendItem(item);
			this._refreshIndex();
			this.emit('update');
			this.emit('command', 'notifyHtml',
				`リストの末尾に追加: <img src="${item.thumbnail}" style="width: 96px;">${textUtil.escapeToZenkaku(item.title)}`
			);
		}).catch(result => {
			const item = VideoListItem.createBlankInfo(watchId);
			model.appendItem(item);
			this._refreshIndex(true);
			this._refreshIndex();
			window.console.error(result);
			this.emit('command', 'alert', '動画情報の取得に失敗: ' + watchId);
		});
	}
	getIndex() {
		return this._activeItem ? this._index : -1;
	}
	setIndex(v, force) {
		v = parseInt(v, 10);
		if (this._index !== v || force) {
			this._index = v;
			if (this._activeItem) {
				this._activeItem.isActive = false;
			}
			this._activeItem = this.model.getItemByIndex(v);
			if (this._activeItem) {
				this._activeItem.isActive = true;
			}
			this.emit('update');
		}
	}
	_refreshIndex(scrollToActive) {
		this.setIndex(this.model.indexOf(this._activeItem), true);
		if (scrollToActive) {
			setTimeout(() => this.scrollToActiveItem(true), 1000);
		}
	}
	_setIndexByItemId(itemId) {
		const item = this.model.findByItemId(itemId);
		if (item) {
			this._setIndexByItem(item);
		}
	}
	_setIndexByItem(item) {
		const index = this.model.indexOf(item);
		if (index >= 0) {
			this.setIndex(index);
		}
	}
	toggleEnable(v) {
		if (!_.isBoolean(v)) {
			this._isEnable = !this._isEnable;
			this.emit('update');
			return;
		}
		if (this._isEnable !== v) {
			this._isEnable = v;
			this.emit('update');
		}
	}
	toggleLoop() {
		this._isLoop = !this._isLoop;
		this.emit('update');
	}
	shuffle() {
		this.model.shuffle();
		if (this._activeItem) {
			this.model.removeItem(this._activeItem);
			this.model.insertItem(this._activeItem, 0);
			this.setIndex(0);
		} else {
			this.setIndex(-1);
		}
		this.view.scrollTop(0);
	}
	sortBy(key, isDesc) {
		this.model.sortBy(key, isDesc);
		this._refreshIndex(true);
		setTimeout(() => {
			this.view.scrollToItem(this._activeItem);
		}, 1000);
	}
	removePlayedItem() {
		this.model.removePlayedItem();
		this._refreshIndex(true);
		setTimeout(() => this.view.scrollToItem(this._activeItem), 1000);
	}
	removeNonActiveItem() {
		this.model.removeNonActiveItem();
		this._refreshIndex(true);
		this.toggleEnable(false);
	}
	selectNext() {
		if (!this.hasNext) {
			return null;
		}
		const index = this.getIndex();
		const len = this.length;
		if (len < 1) {
			return null;
		}
		if (index < -1) {
			this.setIndex(0);
		} else if (index + 1 < len) {
			this.setIndex(index + 1);
		} else if (this.isLoop) {
			this.setIndex((index + 1) % len);
		}
		return this._activeItem ? this._activeItem.watchId : null;
	}
	selectPrevious() {
		const index = this.getIndex();
		const len = this.length;
		if (len < 1) {
			return null;
		}
		if (index < -1) {
			this.setIndex(0);
		} else if (index > 0) {
			this.setIndex(index - 1);
		} else if (this.isLoop) {
			this.setIndex((index + len - 1) % len);
		} else {
			return null;
		}
		return this._activeItem ? this._activeItem.watchId : null;
	}
	scrollToActiveItem(force) {
		if (this._activeItem && (force || !this.view.hasFocus)) {
			this.view.scrollToItem(this._activeItem, force);
		}
	}
	scrollToWatchId(watchId) {
		const item = this.model.findByWatchId(watchId);
		if (item) {
			this.view.scrollToItem(item);
		}
	}
	findByWatchId(watchId) {
		return this.model.findByWatchId(watchId);
	}
	get isEnable() {
		return this._isEnable;
	}
	get isLoop() {
		return this._isLoop;
	}
	get length() {
		return this.model.length;
	}
	get hasNext() {
		const len = this.length;
		return len > 0 && (this.isLoop || this._index < len - 1);
	}
}

//@require MediaSessionApi
//@require LikeApi
class PlayerConfig {
	static getInstance(config) {
		if (!PlayerConfig.instance) {
			PlayerConfig.instance = this.wrapKey(config);
		}
		return PlayerConfig.instance;
	}
	static wrapKey(config, mode = '') {
		if (!mode && util.isGinzaWatchUrl()) {
			mode = 'ginza';
		} else if (location && location.host.indexOf('.nicovideo.jp') < 0) {
			mode = 'others';
		}
		if (!mode) { return config; }
		config.getNativeKey = key => {
			switch(mode) {
				case 'ginza':
					if (['autoPlay', 'screenMode'].includes(key)) {
						return `${key}:${mode}`;
					}
				break;
				case 'others':
					if (['autoPlay', 'screenMode', 'overrideWatchLink'].includes(key)) {
						return `${key}:${mode}`;
					}
				break;
			}
			return key;
		};
		return config;
	}
}
class VideoWatchOptions {
	constructor(watchId, options, config) {
		this._watchId = watchId;
		this._options = options || {};
		this._config = config;
	}
	get rawData() {
		return this._options;
	}
	get eventType() {
		return this._options.eventType || '';
	}
	get query() {
		return this._options.query || {};
	}
	get videoLoadOptions() {
		let options = {
			economy: this.isEconomySelected
		};
		return options;
	}
	get mylistLoadOptions() {
		let options = {};
		let query = this.query;
		options.order = query.order;
		options.sort = query.sort;
		options.group_id = query.group_id;
		options.watchId = this._watchId;
		return options;
	}
	get isPlaylistStartRequest() {
		let eventType = this.eventType;
		let query = this.query;
		if (eventType !== 'click' || query.continuous !== '1') {
			return false;
		}
		if (['mylist', 'deflist', 'tag', 'search'].includes(query.playlist_type) &&
			(query.group_id || query.order)) {
			return true;
		}
		return false;
	}
	hasKey(key) {
		return _.has(this._options, key);
	}
	get isOpenNow() {
		return this._options.openNow === true;
	}
	get isEconomySelected() {
		return _.isBoolean(this._options.economy) ?
			this._options.economy : this._config.getValue('smileVideoQuality') === 'eco';
	}
	get isAutoCloseFullScreen() {
		return !!this._options.autoCloseFullScreen;
	}
	get isReload() {
		return this._options.reloadCount > 0;
	}
	get videoServerType() {
		return this._options.videoServerType;
	}
	get isAutoZenTubeDisabled() {
		return !!this._options.isAutoZenTubeDisabled;
	}
	get reloadCount() {
		return this._options.reloadCount;
	}
	get currentTime() {
		return _.isNumber(this._options.currentTime) ?
			parseFloat(this._options.currentTime, 10) : 0;
	}
	createForVideoChange(options) {
		options = options || {};
		delete this._options.economy;
		_.defaults(options, this._options);
		options.openNow = true;
		delete options.videoServerType;
		options.isAutoZenTubeDisabled = false;
		options.currentTime = 0;
		options.reloadCount = 0;
		options.query = {};
		return options;
	}
	createForReload(options) {
		options = options || {};
		delete this._options.economy;
		options.isAutoZenTubeDisabled = typeof options.isAutoZenTubeDisabled === 'boolean' ?
			options.isAutoZenTubeDisabled : true;
		_.defaults(options, this._options);
		options.openNow = true;
		options.reloadCount = options.reloadCount ? (options.reloadCount + 1) : 1;
		options.query = {};
		return options;
	}
	createForSession(options) {
		options = options || {};
		_.defaults(options, this._options);
		options.query = {};
		return options;
	}
}
class NicoVideoPlayerDialogView extends Emitter {
	constructor(...args) {
		super();
		this.initialize(...args);
	}
	initialize(params) {
		const dialog = this._dialog = params.dialog;
		this._playerConfig = params.playerConfig;
		this._nicoVideoPlayer = params.nicoVideoPlayer;
		this._state = params.playerState;
		this._currentTimeGetter = params.currentTimeGetter;
		this._aspectRatio = 9 / 16;
		dialog.on('canPlay', this._onVideoCanPlay.bind(this));
		dialog.on('videoCount', this._onVideoCount.bind(this));
		dialog.on('error', this._onVideoError.bind(this));
		dialog.on('play', this._onVideoPlay.bind(this));
		dialog.on('playing', this._onVideoPlaying.bind(this));
		dialog.on('pause', this._onVideoPause.bind(this));
		dialog.on('stalled', this._onVideoStalled.bind(this));
		dialog.on('abort', this._onVideoAbort.bind(this));
		dialog.on('aspectRatioFix', this._onVideoAspectRatioFix.bind(this));
		dialog.on('volumeChange', this._onVolumeChange.bind(this));
		dialog.on('volumeChangeEnd', this._onVolumeChangeEnd.bind(this));
		dialog.on('beforeVideoOpen', this._onBeforeVideoOpen.bind(this));
		dialog.on('loadVideoInfoFail', this._onVideoInfoFail.bind(this));
		dialog.on('videoServerType', this._onVideoServerType.bind(this));
		this._initializeDom();
		this._state.on('update', this._onPlayerStateUpdate.bind(this));
		this._state.onkey('videoInfo', this._onVideoInfoLoad.bind(this));
	}
	async _initializeDom() {
		util.addStyle(NicoVideoPlayerDialogView.__css__);
		const $dialog = this._$dialog = util.$.html(NicoVideoPlayerDialogView.__tpl__.trim());
		const onCommand = this._onCommand.bind(this);
		const config = this._playerConfig;
		const state = this._state;
		this._$body = util.$('body, html');
		const $container = this._$playerContainer = $dialog.find('.zenzaPlayerContainer');
		const container = $container[0];
		const classList = this.classList = ClassList(container);
		container.addEventListener('click', e => {
			global.emitter.emitAsync('hideHover');
			if (
				e.target.classList.contains('touchWrapper') &&
				config.props.enableTogglePlayOnClick &&
				!classList.contains('menuOpen')) {
				onCommand('togglePlay');
			}
			e.preventDefault();
			e.stopPropagation();
			classList.remove('menuOpen');
		});
		container.addEventListener('command', e=> {
			e.stopPropagation();
			e.preventDefault();
			this._onCommand(e.detail.command, e.detail.param);
		});
		container.addEventListener('focusin', e => {
			const target = (e.path && e.path.length) ? e.path[0] : e.target;
			if (target.dataset.hasSubmenu) {
				classList.add('menuOpen');
			}
		});
		this._applyState();
		let lastX = 0, lastY = 0;
		let onMouseMove = this._onMouseMove.bind(this);
		let onMouseMoveEnd = _.debounce(this._onMouseMoveEnd.bind(this), 400);
		container.addEventListener('mousemove', _.throttle(e => {
			if (e.buttons === 0 && lastX === e.screenX && lastY === e.screenY) {
				return;
			}
			lastX = e.screenX;
			lastY = e.screenY;
			onMouseMove(e);
			onMouseMoveEnd(e);
		}, 100));
		$dialog
			.on('dblclick', e => {
				if (!e.target || e.target.id !== 'zenzaVideoPlayerDialog') {
					return;
				}
				if (config.props.enableDblclickClose) {
					this.emit('command', 'close');
				}
			})
			.toggleClass('is-guest', !util.isLogin());
		this.hoverMenu = new VideoHoverMenu({
			playerContainer: container,
			playerState: state
		});
		this.commentInput = new CommentInputPanel({
			$playerContainer: $container,
			playerConfig: config
		});
		this.commentInput.on('post', (e, chat, cmd) =>
			this.emit('postChat', e, chat, cmd));
		let hasPlaying = false;
		this.commentInput.on('focus', isAutoPause => {
			hasPlaying = state.isPlaying;
			if (isAutoPause) {
				this.emit('command', 'pause');
			}
		});
		this.commentInput.on('blur', isAutoPause => {
			if (isAutoPause && hasPlaying && state.isOpen) {
				this.emit('command', 'play');
			}
		});
		this.commentInput.on('esc', () => this._escBlockExpiredAt = Date.now() + 1000 * 2);
		await sleep.idle();
		this.videoControlBar = new VideoControlBar({
			$playerContainer: $container,
			playerConfig: config,
			player: this._dialog,
			playerState: this._state,
			currentTimeGetter: this._currentTimeGetter
		});
		this.videoControlBar.on('command', onCommand);
		this._$errorMessageContainer = $container.find('.errorMessageContainer');
		await sleep.idle();
		this._initializeVideoInfoPanel();
		this._initializeResponsive();
		this.selectTab(this._state.currentTab);
		document.documentElement.addEventListener('paste', this._onPaste.bind(this));
		global.emitter.on('showMenu', () => this.addClass('menuOpen'));
		global.emitter.on('hideMenu', () => this.removeClass('menuOpen'));
		global.emitter.on('fullscreenStatusChange', () => this._applyScreenMode(true));
		document.body.append($dialog[0]);
		this.emitResolve('dom-ready');
	}
	_initializeVideoInfoPanel() {
		if (this.videoInfoPanel) {
			return this.videoInfoPanel;
		}
		this.videoInfoPanel = new VideoInfoPanel({
			dialog: this,
			node: this._$playerContainer
		});
		this.videoInfoPanel.on('command', this._onCommand.bind(this));
		return this.videoInfoPanel;
	}
	_onCommand(command, param) {
		switch (command) {
			case 'settingPanel':
				this.toggleSettingPanel();
				break;
			case 'toggle-flipH':
				this.toggleClass('is-flipH');
				break;
			case 'toggle-flipV':
				this.toggleClass('is-flipV');
				break;
			default:
				this.emit('command', command, param);
		}
	}
	async _onPaste(e) {
		const isZen = !!e.target.closest('.zenzaVideoPlayerDialog');
		const target = (e.path && e.path[0]) ? e.path[0] : e.target;
		window.console.log('onPaste', {e, target, isZen});
		if (!isZen && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
			return;
		}
		let text;
		try { text = await navigator.clipboard.readText(); }
		catch(err) {
			window.console.warn(err, navigator.clipboard);
			text = e.clipboardData.getData('text/plain');
		}
		if (!text) {
			return;
		}
		text = text.trim();
		const isOpen = this._state.isOpen;
		const watchIdReg = /((nm|sm|so)\d+)/.exec(text);
		if (watchIdReg) {
			return this._onCommand('open', watchIdReg[1]);
		}
		if (!isOpen) {
			return;
		}
		const youtubeReg = /^https?:\/\/((www\.|)youtube\.com\/watch|youtu\.be)/.exec(text);
		if (youtubeReg) {
			return this._onCommand('setVideo', text);
		}
		const seekReg = /^(\d+):(\d+)$/.exec(text);
		if (seekReg) {
			return this._onCommand('seek', seekReg[1] * 60 + seekReg[2] * 1);
		}
		const mylistReg = /mylist(\/#\/|\/)(\d+)/.exec(text);
		if (mylistReg) {
			return this._onCommand('playlistSetMylist', mylistReg[2]);
		}
		const ownerReg = /user\/(\d+)/.exec(text);
		if (ownerReg) {
			return this._onCommand('playlistSetUploadedVideo', ownerReg[1]);
		}
	}
	_initializeResponsive() {
		window.addEventListener('resize', _.debounce(this._updateResponsive.bind(this), 500));
		this.varMapper = new VariablesMapper({config: this._playerConfig});
		this.varMapper.on('update', () => this._updateResponsive());
	}
	_updateResponsive() {
		if (!this._state.isOpen) {
			return;
		}
		const $container = this._$playerContainer;
		const [header] = $container.find('.zenzaWatchVideoHeaderPanel');
		const config = this._playerConfig;
		const update = () => {
			const w = global.innerWidth, h = global.innerHeight;
			const vMargin = h - w * this._aspectRatio;
			const controlBarMode = config.props.fullscreenControlBarMode;
			if (controlBarMode === 'always-hide') {
				this.toggleClass('showVideoControlBar', false);
				return;
			}
			const videoControlBarHeight = this.varMapper.videoControlBarHeight;
			const showVideoHeaderPanel = vMargin >= videoControlBarHeight + header.offsetHeight * 2;
			let showVideoControlBar;
			switch (controlBarMode) {
				case 'always-show':
					showVideoControlBar = true;
					break;
				case 'auto':
				default:
					showVideoControlBar = vMargin >= videoControlBarHeight;
			}
			this.toggleClass('showVideoControlBar', showVideoControlBar);
			this.toggleClass('showVideoHeaderPanel', showVideoHeaderPanel);
		};
		update();
	}
	_onMouseMove() {
		if (this._isMouseMoving) {
			return;
		}
		this.addClass('is-mouseMoving');
		this._isMouseMoving = true;
	}
	_onMouseMoveEnd() {
		if (!this._isMouseMoving) {
			return;
		}
		this.removeClass('is-mouseMoving');
		this._isMouseMoving = false;
	}
	_onVideoCanPlay(watchId, videoInfo, options) {
		this.emit('canPlay', watchId, videoInfo, options);
	}
	_onVideoCount({comment, view, mylist} = {}) {
		this.emit('videoCount', {comment, view, mylist});
	}
	_onVideoError(e) {
		this.emit('error', e);
	}
	_onBeforeVideoOpen() {
		this._setThumbnail();
	}
	_onVideoInfoLoad(videoInfo) {
		this.videoInfoPanel.update(videoInfo);
	}
	_onVideoInfoFail(videoInfo) {
		if (videoInfo) {
			this.videoInfoPanel.update(videoInfo);
		}
	}
	_onVideoServerType(type, sessionInfo) {
		this.toggleClass('is-dmcPlaying', type === 'dmc');
		this.emit('videoServerType', type, sessionInfo);
	}
	_onVideoPlay() {
	}
	_onVideoPlaying() {
	}
	_onVideoPause() {
	}
	_onVideoStalled() {
	}
	_onVideoAbort() {
	}
	_onVideoAspectRatioFix(ratio) {
		this._aspectRatio = ratio;
		this._updateResponsive();
	}
	_onVolumeChange(/*vol, mute*/) {
		this.addClass('volumeChanging');
	}
	_onVolumeChangeEnd(/*vol, mute*/) {
		this.removeClass('volumeChanging');
	}
	_onScreenModeChange() {
		this._applyScreenMode();
	}
	_getStateClassNameTable() {
		return this._classNameTable = this._classNameTable || objUtil.toMap({
			isAbort: 'is-abort',
			isBackComment: 'is-backComment',
			isShowComment: 'is-showComment',
			isDebug: 'is-debug',
			isDmcAvailable: 'is-dmcAvailable',
			isDmcPlaying: 'is-dmcPlaying',
			isError: 'is-error',
			isLoading: 'is-loading',
			isMute: 'is-mute',
			isLoop: 'is-loop',
			isOpen: 'is-open',
			isPlaying: 'is-playing',
			isSeeking: 'is-seeking',
			isPausing: 'is-pausing',
			isLiked: 'is-liked',
			isChanging: 'is-changing',
			isUpdatingDeflist: 'is-updatingDeflist',
			isUpdatingMylist: 'is-updatingMylist',
			isPlaylistEnable: 'is-playlistEnable',
			isCommentPosting: 'is-commentPosting',
			isRegularUser: 'is-regularUser',
			isWaybackMode: 'is-waybackMode',
			isNotPlayed: 'is-notPlayed',
			isYouTube: 'is-youTube'
		});
	}
	_onPlayerStateChange(changedState) {
		for (const key of changedState.keys()) {
			this._onPlayerStateUpdate(key, changedState.get(key));
		}
	}
	_onPlayerStateUpdate(key, value) {
		switch (key) {
			case 'thumbnail':
				return this._setThumbnail(value);
			case 'screenMode':
			case 'isOpen':
				if (this._state.isOpen) {
					this.show();
					this._onScreenModeChange();
				} else {
					this.hide();
				}
				return;
			case 'errorMessage':
				return this._$errorMessageContainer[0].textContent = value;
			case 'currentTab':
				return this.selectTab(value);
		}
		const table = this._getStateClassNameTable();
		const className = table.get(key);
		if (className) {
			this.toggleClass(className, !!value);
		}
	}
	_applyState() {
		const table = this._getStateClassNameTable();
		const state = this._state;
		for (const [key, className] of table) {
			this.classList.toggle(className, state[key]);
		}
		if (this._state.isOpen) {
			this._applyScreenMode();
		}
	}
	_getScreenModeClassNameTable() {
		return [
			'zenzaScreenMode_3D',
			'zenzaScreenMode_small',
			'zenzaScreenMode_sideView',
			'zenzaScreenMode_normal',
			'zenzaScreenMode_big',
			'zenzaScreenMode_wide'
		];
	}
	_applyScreenMode(force = false) {
		const screenMode = `zenzaScreenMode_${this._state.screenMode}`;
		if (!force && this._lastScreenMode === screenMode) { return; }
		this._lastScreenMode = screenMode;
		const modes = this._getScreenModeClassNameTable();
		const isFull = util.fullscreen.now();
		Object.assign(document.body.dataset, {
			screenMode: this._state.screenMode,
			fullscreen: isFull ? 'yes' : 'no'
		});
		modes.forEach(m => this._$body.raf.toggleClass(m, m === screenMode && !isFull));
		this._updateScreenModeStyle();
	}
	_updateScreenModeStyle() {
		if (!this._state.isOpen) {
			util.StyleSwitcher.update({off: 'style.screenMode'});
			return;
		}
		if (Fullscreen.now()) {
			util.StyleSwitcher.update({
				on: 'style.screenMode.for-full, style.screenMode.for-screen-full',
				off: 'style.screenMode:not(.for-full):not(.for-screen-full), link[href*="watch.css"]'
			});
			return;
		}
		let on, off;
		switch (this._state.screenMode) {
			case '3D':
			case 'wide':
				on = 'style.screenMode.for-full, style.screenMode.for-window-full';
				off = 'style.screenMode:not(.for-full):not(.for-window-full), link[href*="watch.css"]';
				break;
			default:
			case 'normal':
			case 'big':
				on = 'style.screenMode.for-dialog, style.screenMode.for-big, style.screenMode.for-normal, link[href*="watch.css"]';
				off = 'style.screenMode:not(.for-dialog):not(.for-big):not(.for-normal)';
				break;
			case 'small':
			case 'sideView':
				on = 'style.screenMode.for-popup, style.screenMode.for-sideView, .style.screenMode.for-small, link[href*="watch.css"]';
				off = 'style.screenMode:not(.for-popup):not(.for-sideView):not(.for-small)';
				break;
		}
		util.StyleSwitcher.update({on, off});
	}
	show() {
		ClassList(this._$dialog[0]).add('is-open');
		if (!Fullscreen.now()) {
			ClassList(document.body).remove('fullscreen');
		}
		this._$body.raf.addClass('showNicoVideoPlayerDialog');
		util.StyleSwitcher.update({on: 'style.zenza-open'});
		this._updateScreenModeStyle();
	}
	hide() {
		ClassList(this._$dialog[0]).remove('is-open');
		this.settingPanel && this.settingPanel.close();
		this._$body.raf.removeClass('showNicoVideoPlayerDialog');
		util.StyleSwitcher.update({off: 'style.zenza-open, style.screenMode', on: 'link[href*="watch.css"]'});
		this._clearClass();
	}
	_clearClass() {
		const modes = this._getScreenModeClassNameTable().join(' ');
		this._lastScreenMode = '';
		this._$body.raf.removeClass(modes);
	}
	_setThumbnail(thumbnail) {
		if (thumbnail) {
			this.css('background-image', `url(${thumbnail})`);
		} else {
			this.css('background-image', `url(${CONSTANT.BLANK_PNG})`);
		}
	}
	focusToCommentInput() {
		window.setTimeout(() => this.commentInput.focus(), 0);
	}
	toggleSettingPanel() {
		if (!this.settingPanel) {
			this.settingPanel = document.createElement('zenza-setting-panel');
			this.settingPanel.config = this._playerConfig;
			this._$playerContainer.append(this.settingPanel);
		}
		this.settingPanel.toggle();
	}
	get$Container() {
		return this._$playerContainer;
	}
	css(key, val) {
		this._$playerContainer.raf.css(key, val);
	}
	addClass(name) {
		return this.classList.add(name);
	}
	removeClass(name) {
		return this.classList.remove(name);
	}
	toggleClass(name, v) {
		this.classList.toggle(name, v);
	}
	hasClass(name) {
		return this.classList.contains(name);
	}
	appendTab(name, title) {
		return this.videoInfoPanel.appendTab(name, title);
	}
	selectTab(name) {
		this._playerConfig.props.videoInfoPanelTab = name;
		this._state.currentTab = name;
		this.videoInfoPanel.selectTab(name);
		global.emitter.emit('tabChange', name);
	}
	execCommand(command, param) {
		this.emit('command', command, param);
	}
	blinkTab(name) {
		this.videoInfoPanel.blinkTab(name);
	}
	clearPanel() {
		this.videoInfoPanel.clear();
	}
}
util.addStyle(`
	.is-watch .BaseLayout {
		display: none;
	}
	#zenzaVideoPlayerDialog {
		touch-action: manipulation; /* for Safari */
		touch-action: none;
	}
	#zenzaVideoPlayerDialog::before {
		display: none;
	}
	.zenzaPlayerContainer {
		left: 0 !important;
		top:  0 !important;
		width:  100vw !important;
		height: 100vh !important;
		contain: size layout;
	}
	.videoPlayer,
	.commentLayerFrame,
	.resizeObserver {
		top:  0 !important;
		left: 0 !important;
		width:  100vw !important;
		height: 100% !important;
		right:  0 !important;
		border: 0 !important;
		z-index: 100 !important;
		contain: layout style size paint;
		will-change: transform,opacity;
	}
	.resizeObserver {
		z-index: -1;
		opacity: 0;
		pointer-events: none;
	}
	.is-open .videoPlayer>* {
		cursor: none;
	}
	.showVideoControlBar {
		--padding-bottom: ${VideoControlBar.BASE_HEIGHT}px;
		--padding-bottom: var(--zenza-control-bar-height);
	}
	.zenzaStoryboardOpen .showVideoControlBar {
		--padding-bottom: calc(var(--zenza-control-bar-height) + 80px);
	}
	.zenzaStoryboardOpen.is-fullscreen .showVideoControlBar {
		--padding-bottom: calc(var(--zenza-control-bar-height) + 50px);
	}
	.showVideoControlBar .videoPlayer,
	.showVideoControlBar .commentLayerFrame,
	.showVideoControlBar .resizeObserver {
		height: calc(100% - var(--padding-bottom)) !important;
	}
	.showVideoControlBar .videoPlayer {
		z-index: 100 !important;
	}
	.showVideoControlBar .commentLayerFrame {
		z-index: 101 !important;
	}
	.is-showComment.is-backComment .videoPlayer
	{
		top:  25% !important;
		left: 25% !important;
		width:  50% !important;
		height: 50% !important;
		right:  0 !important;
		bottom: 0 !important;
		border: 0 !important;
		z-index: 102 !important;
	}
	body[data-screen-mode="3D"] .zenzaPlayerContainer .videoPlayer {
		transform: perspective(700px) rotateX(10deg);
		margin-top: -5%;
	}
	.zenzaPlayerContainer {
		left: 0;
		width: 100vw;
		height: 100vh;
		box-shadow: none;
	}
	.is-backComment .videoPlayer {
		left: 25%;
		top:  25%;
		width:  50%;
		height: 50%;
		z-index: 102;
	}
	body[data-screen-mode="3D"] .zenzaPlayerContainer .videoPlayer {
		transform: perspective(600px) rotateX(10deg);
		height: 100%;
	}
	body[data-screen-mode="3D"] .zenzaPlayerContainer .commentLayerFrame {
		transform: translateZ(0) perspective(600px) rotateY(30deg) rotateZ(-15deg) rotateX(15deg);
		opacity: 0.9;
		height: 100%;
		margin-left: 20%;
	}
`, {className: 'screenMode for-full', disabled: true});
util.addStyle(`
	body #zenzaVideoPlayerDialog {
		contain: style size;
	}
	#zenzaVideoPlayerDialog::before {
		display: none;
	}
	body.zenzaScreenMode_sideView {
		--sideView-left-margin: ${CONSTANT.SIDE_PLAYER_WIDTH + 24}px;
		--sideView-top-margin: 76px;
		margin-left: var(--sideView-left-margin);
		margin-top: var(--sideView-top-margin);
		width: auto;
	}
	body.zenzaScreenMode_sideView.nofix {
		--sideView-top-margin: 40px;
	}
	body.zenzaScreenMode_sideView:not(.nofix) #siteHeader {
		width: auto;
	}
	body.zenzaScreenMode_sideView:not(.nofix) #siteHeader #siteHeaderInner {
		width: auto;
	}
.zenzaScreenMode_sideView .zenzaVideoPlayerDialog.is-open,
.zenzaScreenMode_small .zenzaVideoPlayerDialog.is-open {
		display: block;
		top: 0; left: 0; right: 100%; bottom: 100%;
	}
	.zenzaScreenMode_sideView .zenzaPlayerContainer,
	.zenzaScreenMode_small .zenzaPlayerContainer {
		width: ${CONSTANT.SIDE_PLAYER_WIDTH}px;
		height: ${CONSTANT.SIDE_PLAYER_HEIGHT}px;
	}
	.is-open .zenzaVideoPlayerDialog {
		contain: layout style size;
	}
	.zenzaVideoPlayerDialogInner {
		top: 0;
		left: 0;
		transform: none;
	}
	@media screen and (min-width: 1432px)
	{
		body.zenzaScreenMode_sideView {
			--sideView-left-margin: calc(100vw - 1024px);
		}
		body.zenzaScreenMode_sideView:not(.nofix) #siteHeader {
			width: calc(100vw - (100vw - 1024px));
		}
		.zenzaScreenMode_sideView .zenzaPlayerContainer {
			width: calc(100vw - 1024px);
			height: calc((100vw - 1024px) * 9 / 16);
		}
	}
`, {className: 'screenMode for-popup', disabled: true});
util.addStyle(`
body.zenzaScreenMode_sideView,
body.zenzaScreenMode_small {
	border-bottom: 40px solid;
	margin-top: 0;
}
`, {className: 'domain slack-com', disabled: true});
util.addStyle(`
	.zenzaScreenMode_normal .zenzaPlayerContainer .videoPlayer {
		left: 2.38%;
		width: 95.23%;
	}
	.zenzaScreenMode_big .zenzaPlayerContainer {
		width: ${CONSTANT.BIG_PLAYER_WIDTH}px;
		height: ${CONSTANT.BIG_PLAYER_HEIGHT}px;
	}
`, {className: 'screenMode for-dialog', disabled: true});
util.addStyle(`
	.zenzaScreenMode_3D,
	.zenzaScreenMode_normal,
	.zenzaScreenMode_big,
	.zenzaScreenMode_wide
	{
		overflow-x: hidden !important;
		overflow-y: hidden !important;
		overflow: hidden !important;
	}
	/*
		プレイヤーが動いてる間、裏の余計な物のマウスイベントを無効化
		多少軽量化が期待できる？
	*/
	body.zenzaScreenMode_big >*:not(.zen-family) *,
	body.zenzaScreenMode_normal >*:not(.zen-family) *,
	body.zenzaScreenMode_wide >*:not(.zen-family) *,
	body.zenzaScreenMode_3D >*:not(.zen-family) * {
		pointer-events: none;
		user-select: none;
		animation-play-state: paused !important;
		contain: style layout paint;
	}
	body.zenzaScreenMode_big .ZenButton,
	body.zenzaScreenMode_normal .ZenButton,
	body.zenzaScreenMode_wide .ZenButton,
	body.zenzaScreenMode_3D  .ZenButton {
		display: none;
	}
	.ads, .banner, iframe[name^="ads"] {
		visibility: hidden !important;
		pointer-events: none;
	}
	.VideoThumbnailComment {
		display: none !important;
	}
	/* 大百科の奴 */
	#scrollUp {
		display: none !important;
	}
	.SeriesDetailContainer-backgroundInner {
		background-image: none !important;
		filter: none !important;
	}
	.Hidariue-image {
		visibility: hidden !important;
	}
`, {className: 'zenza-open', disabled: true});
NicoVideoPlayerDialogView.__css__ = `
	.zenzaVideoPlayerDialog {
		display: none;
		position: fixed;
		/*background: rgba(0, 0, 0, 0.8);*/
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: ${CONSTANT.BASE_Z_INDEX};
		font-size: 13px;
		text-align: left;
		box-sizing: border-box;
		contain: size style layout;
	}
	.zenzaVideoPlayerDialog::before {
		content: ' ';
		background: rgba(0, 0, 0, 0.8);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		will-change: transform;
	}
	.is-regularUser  .forPremium {
		display: none !important;
	}
	.forDmc {
		display: none;
	}
	.is-dmcPlaying .forDmc {
		display: inherit;
	}
	.zenzaVideoPlayerDialog * {
		box-sizing: border-box;
	}
	.zenzaVideoPlayerDialog.is-open {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.zenzaVideoPlayerDialog li {
		text-align: left;
	}
	.zenzaVideoPlayerDialogInner {
		background: #000;
		box-sizing: border-box;
		z-index: ${CONSTANT.BASE_Z_INDEX + 1};
		box-shadow: 4px 4px 4px #000;
	}
	.zenzaPlayerContainer {
		position: relative;
		background: #000;
		width: 672px;
		height: 384px;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}
	.zenzaPlayerContainer.is-loading {
		cursor: wait;
	}
	.zenzaPlayerContainer:not(.is-loading):not(.is-error) {
		background-image: none !important;
		background: none !important;
	}
	.zenzaPlayerContainer.is-loading .videoPlayer,
	.zenzaPlayerContainer.is-loading .commentLayerFrame,
	.zenzaPlayerContainer.is-error .videoPlayer,
	.zenzaPlayerContainer.is-error .commentLayerFrame {
		display: none;
	}
	.zenzaPlayerContainer .videoPlayer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		right: 0;
		bottom: 0;
		height: 100%;
		border: 0;
		z-index: 100;
		background: #000;
		will-change: transform, opacity;
		user-select: none;
	}
	.is-mouseMoving .videoPlayer>* {
		cursor: auto;
	}
	.is-loading .videoPlayer>* {
		cursor: wait;
	}
	.zenzaPlayerContainer .commentLayerFrame {
		position: absolute;
		border: 0;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 101;
		pointer-events: none;
		cursor: none;
		user-select: none;
		opacity: var(--zenza-comment-layer-opacity);
	}
	.zenzaPlayerContainer.is-backComment .commentLayerFrame {
		position: fixed;
		top:  0;
		left: 0;
		width:  100vw;
		height: calc(100vh - 40px);
		right: auto;
		bottom: auto;
		z-index: 1;
	}
	.is-showComment.is-backComment .videoPlayer {
		opacity: 0.90;
	}
	.is-showComment.is-backComment .videoPlayer:hover {
		opacity: 1;
	}
	.loadingMessageContainer {
		display: none;
		pointer-events: none;
	}
	.zenzaPlayerContainer.is-loading .loadingMessageContainer {
		display: inline-block;
		position: absolute;
		z-index: ${CONSTANT.BASE_Z_INDEX + 10000};
		right: 8px;
		bottom: 8px;
		font-size: 24px;
		color: var(--base-fore-color);
		text-shadow: 0 0 8px #003;
		font-family: serif;
		letter-spacing: 2px;
	}
	@keyframes spin {
		0%   { transform: rotate(0deg); }
		100% { transform: rotate(-1800deg); }
	}
	.zenzaPlayerContainer.is-loading .loadingMessageContainer::before,
	.zenzaPlayerContainer.is-loading .loadingMessageContainer::after {
		display: inline-block;
		text-align: center;
		content: '${'\\00272A'}';
		font-size: 18px;
		line-height: 24px;
		animation-name: spin;
		animation-iteration-count: infinite;
		animation-duration: 5s;
		animation-timing-function: linear;
	}
	.zenzaPlayerContainer.is-loading .loadingMessageContainer::after {
		animation-direction: reverse;
	}
	.errorMessageContainer {
		display: none;
		pointer-events: none;
		user-select: none;
	}
	.zenzaPlayerContainer.is-error .errorMessageContainer {
		display: inline-block;
		position: absolute;
		z-index: ${CONSTANT.BASE_Z_INDEX + 10000};
		top: 50%;
		left: 50%;
		padding: 8px 16px;
		transform: translate(-50%, -50%);
		background: rgba(255, 0, 0, 0.9);
		font-size: 24px;
		box-shadow: 8px 8px 4px rgba(128, 0, 0, 0.8);
		white-space: nowrap;
	}
	.errorMessageContainer:empty {
		display: none !important;
	}
	.popupMessageContainer {
		top: 50px;
		left: 50px;
		z-index: 25000;
		position: absolute;
		pointer-events: none;
		transform: translateZ(0);
		user-select: none;
	}
	@media screen {
		/* 右パネル分の幅がある時は右パネルを出す */
		@media (min-width: 992px) {
			.zenzaScreenMode_normal .zenzaVideoPlayerDialogInner {
				padding-right: ${CONSTANT.RIGHT_PANEL_WIDTH}px;
				background: none;
			}
		}
		@media (min-width: 1216px) {
			.zenzaScreenMode_big .zenzaVideoPlayerDialogInner {
				padding-right: ${CONSTANT.RIGHT_PANEL_WIDTH}px;
				background: none;
			}
		}
		/* 縦長モニター */
		@media
			(max-width: 991px) and (min-height: 700px)
		{
			.zenzaScreenMode_normal .zenzaVideoPlayerDialogInner {
				padding-bottom: 240px;
				background: none;
			}
		}
		@media
			(max-width: 1215px) and (min-height: 700px)
		{
			.zenzaScreenMode_big .zenzaVideoPlayerDialogInner {
				padding-bottom: 240px;
				background: none;
			}
		}
		/* 960x540 */
		@media
			(min-width: 1328px) and (max-width: 1663px) and
			(min-height: 700px) and (min-height: 899px)
		{
			.zenzaScreenMode_big .zenzaPlayerContainer {
				width: calc(960px * 1.05);
				height: 540px;
			}
		}
		/* 1152x648 */
		@media
			(min-width: 1530px) and (min-height: 900px)
		{
			.zenzaScreenMode_big .zenzaPlayerContainer {
				width: calc(1152px * 1.05);
				height: 648px;
			}
		}
		/* 1280x720 */
		@media
			(min-width: 1664px) and (min-height: 900px)
		{
			.zenzaScreenMode_big .zenzaPlayerContainer {
				width: calc(1280px * 1.05);
				height: 720px;
			}
		}
		/* 1920x1080 */
		@media
			(min-width: 2336px) and (min-height: 1200px)
		{
			.zenzaScreenMode_big .zenzaPlayerContainer {
				width: calc(1920px * 1.05);
				height: 1080px;
			}
		}
		/* 2560x1440 */
		@media
			(min-width: 2976px) and (min-height: 1660px)
		{
			.zenzaScreenMode_big .zenzaPlayerContainer {
				width: calc(2560px * 1.05);
				height: 1440px;
			}
		}
	}
	`.trim();
NicoVideoPlayerDialogView.__tpl__ = (`
		<div id="zenzaVideoPlayerDialog" class="zenzaVideoPlayerDialog zen-family zen-root">
			<div class="zenzaVideoPlayerDialogInner">
				<div class="menuContainer"></div>
				<div class="zenzaPlayerContainer">
					<div class="popupMessageContainer"></div>
					<div class="errorMessageContainer"></div>
					<div class="loadingMessageContainer">動画読込中</div>
				</div>
			</div>
		</div>
	`).trim();
class NicoVideoPlayerDialog extends Emitter {
	constructor(params) {
		super();
		this.initialize(params);
	}
	initialize(params) {
		this._playerConfig = params.config;
		this._state = params.state;
		this._keyEmitter = params.keyHandler || ShortcutKeyEmitter.create(
			params.config,
			document.body,
			global.emitter
		);
		this._initializeDom();
		this._keyEmitter.on('keyDown', this._onKeyDown.bind(this));
		this._keyEmitter.on('keyUp', this._onKeyUp.bind(this));
		this._id = 'ZenzaWatchDialog_' + Date.now() + '_' + Math.random();
		this._playerConfig.on('update', this._onPlayerConfigUpdate.bind(this));
		this._escBlockExpiredAt = -1;
		this._videoFilter = new VideoFilter(
			this._playerConfig.props.videoOwnerFilter,
			this._playerConfig.props.videoTagFilter
		);
		this._savePlaybackPosition =
			_.throttle(this._savePlaybackPosition.bind(this), 1000, {trailing: false});
		this._onToggleLike = _.debounce(this._onToggleLike.bind(this), 1000);
		this.promise('firstVideoInitialized').then(() => console.nicoru('firstVideoInitialized'));
	}
	async _initializeDom() {
		this._view = new NicoVideoPlayerDialogView({
			dialog: this,
			playerConfig: this._playerConfig,
			nicoVideoPlayer: this._nicoVideoPlayer,
			playerState: this._state,
			currentTimeGetter: () => this.currentTime
		});
		await this._view.promise('dom-ready');
		this._initializeCommentPanel();
		this._$playerContainer = this._view.get$Container();
		this._view.on('command', this._onCommand.bind(this));
		this._view.on('postChat', (e, chat, cmd) => {
			this.addChat(chat, cmd)
				.then(() => e.resolve())
				.catch(() => e.reject());
		});
		MediaSessionApi.onCommand(this._onCommand.bind(this));
	}
	async _initializeNicoVideoPlayer() {
		if (this._nicoVideoPlayer) {
			return this._nicoVideoPlayer;
		}
		await this._view.promise('dom-ready');
		const config = this._playerConfig;
		const nicoVideoPlayer = this._nicoVideoPlayer = new NicoVideoPlayer({
			node: this._$playerContainer,
			playerConfig: config,
			playerState: this._state,
			volume: Math.max(config.props.volume, 0),
			loop: config.props.loop,
		});
		this.threadLoader = ThreadLoader;
		nicoVideoPlayer.on('loadedMetaData', this._onLoadedMetaData.bind(this));
		nicoVideoPlayer.on('ended', this._onVideoEnded.bind(this));
		nicoVideoPlayer.on('canPlay', this._onVideoCanPlay.bind(this));
		nicoVideoPlayer.on('play', this._onVideoPlay.bind(this));
		nicoVideoPlayer.on('pause', this._onVideoPause.bind(this));
		nicoVideoPlayer.on('playing', this._onVideoPlaying.bind(this));
		nicoVideoPlayer.on('seeking', this._onVideoSeeking.bind(this));
		nicoVideoPlayer.on('seeked', this._onVideoSeeked.bind(this));
		nicoVideoPlayer.on('stalled', this._onVideoStalled.bind(this));
		nicoVideoPlayer.on('waiting', this._onVideoStalled.bind(this));
		nicoVideoPlayer.on('timeupdate', this._onVideoTimeUpdate.bind(this));
		nicoVideoPlayer.on('progress', this._onVideoProgress.bind(this));
		nicoVideoPlayer.on('aspectRatioFix', this._onVideoAspectRatioFix.bind(this));
		nicoVideoPlayer.on('commentParsed', this._onCommentParsed.bind(this));
		nicoVideoPlayer.on('commentChange', this._onCommentChange.bind(this));
		nicoVideoPlayer.on('commentFilterChange', this._onCommentFilterChange.bind(this));
		nicoVideoPlayer.on('videoPlayerTypeChange', this._onVideoPlayerTypeChange.bind(this));
		nicoVideoPlayer.on('error', this._onVideoError.bind(this));
		nicoVideoPlayer.on('abort', this._onVideoAbort.bind(this));
		nicoVideoPlayer.on('volumeChange', this._onVolumeChange.bind(this));
		nicoVideoPlayer.on('volumeChange', _.debounce(this._onVolumeChangeEnd.bind(this), 1500));
		nicoVideoPlayer.on('command', this._onCommand.bind(this));
		this.emitResolve('nicovideo-player-ready');
		return nicoVideoPlayer;
	}
	execCommand(command, param) {
		return this._onCommand(command, param);
	}
	_onCommand(command, param) {
		let v;
		switch (command) {
			case 'volume':
				this.volume = param;
				break;
			case 'volumeBy':
				this.volume = this._nicoVideoPlayer.volume * param;
				break;
			case 'volumeUp':
				this._nicoVideoPlayer.volumeUp();
				break;
			case 'volumeDown':
				this._nicoVideoPlayer.volumeDown();
				break;
			case 'togglePlay':
				this.togglePlay();
				break;
			case 'pause':
				this.pause();
				break;
			case 'play':
				this.play();
				break;
			case 'fullscreen':
			case 'toggle-fullscreen':
				this._nicoVideoPlayer.toggleFullScreen();
				break;
			case 'deflistAdd':
				return this._onDeflistAdd(param);
			case 'deflistRemove':
				return this._onDeflistRemove(param);
			case 'playlistAdd':
			case 'playlistAppend':
				this._onPlaylistAppend(param);
				break;
			case 'playlistInsert':
				this._onPlaylistInsert(param);
				break;
			case 'playlistSetMylist':
				this._onPlaylistSetMylist(param);
				break;
			case 'playlistSetUploadedVideo':
				this._onPlaylistSetUploadedVideo(param);
				break;
			case 'playlistSetSearchVideo':
				this._onPlaylistSetSearchVideo(param);
				break;
			case 'playlistSetSeries':
				this._onPlaylistSetSeriesVideo(param);
			break;
			case 'playNextVideo':
				this.playNextVideo();
				break;
			case 'playPreviousVideo':
				this.playPreviousVideo();
				break;
			case 'shufflePlaylist':
					this._playlist.shuffle();
				break;
			case 'togglePlaylist':
					this._playlist.toggleEnable();
				break;
			case 'toggle-like':
				return this._onToggleLike();
			case 'mylistAdd':
				return this._onMylistAdd(param.mylistId, param.mylistName);
			case 'mylistRemove':
				return this._onMylistRemove(param.mylistId, param.mylistName);
			case 'mylistWindow':
				util.openMylistWindow(this._videoInfo.watchId);
				break;
			case 'seek':
			case 'seekTo':
				this.currentTime = param * 1;
				break;
			case 'seekBy':
				this.currentTime = this.currentTime + param * 1;
				break;
			case 'seekPrevFrame':
			case 'seekNextFrame':
				this.execCommand('pause');
				this.execCommand('seekBy', command === 'seekNextFrame' ? 1/60 : -1/60);
				break;
			case 'seekRelativePercent': {
				const dur = this._videoInfo.duration;
				const mv = Math.abs(param.movePerX) > 10 ?
					(param.movePerX / 2) : (param.movePerX / 8);
				const pos = this.currentTime + (mv * dur / 100);
				this.currentTime=Math.min(Math.max(0, pos), dur);
				break;
			}
			case 'seekToResumePoint':
				this.currentTime=this._videoInfo.initialPlaybackTime;
				break;
			case 'addWordFilter':
				this._nicoVideoPlayer.filter.addWordFilter(param);
				break;
			case 'setWordRegFilter':
			case 'setWordRegFilterFlags':
				this._nicoVideoPlayer.filter.setWordRegFilter(param);
				break;
			case 'addUserIdFilter':
				this._nicoVideoPlayer.filter.addUserIdFilter(param);
				break;
			case 'addCommandFilter':
				this._nicoVideoPlayer.filter.addCommandFilter(param);
				break;
			case 'setWordFilterList':
				this._nicoVideoPlayer.filter.wordFilterList = param;
				break;
			case 'setUserIdFilterList':
				this._nicoVideoPlayer.filter.userIdFilterList = param;
				break;
			case 'setCommandFilterList':
				this._nicoVideoPlayer.filter.commandFilterList = param;
				break;
			case 'openNow':
				this.open(param, {openNow: true});
				break;
			case 'open':
				this.open(param);
				break;
			case 'close':
				this.close(param);
				break;
			case 'reload':
				this.reload({currentTime: this.currentTime});
				break;
			case 'openGinza':
				window.open('//www.nicovideo.jp/watch/' + this._watchId, 'watchGinza');
				break;
			case 'reloadComment':
				this.reloadComment(param);
				break;
			case 'playbackRate':
				this._playerConfig.setValue(command, param);
				MediaSessionApi.updatePositionStateByMedia(this);
				break;
			case 'shiftUp': {
				v = parseFloat(this._playerConfig.getValue('playbackRate'), 10);
				if (v < 2) {
					v += 0.25;
				} else {
					v = Math.min(10, v + 0.5);
				}
				this._playerConfig.setValue('playbackRate', v);
			}
				break;
			case 'shiftDown': {
				v = parseFloat(this._playerConfig.getValue('playbackRate'), 10);
				if (v > 2) {
					v -= 0.5;
				} else {
					v = Math.max(0.1, v - 0.25);
				}
				this._playerConfig.setValue('playbackRate', v);
			}
				break;
			case 'screenShot':
				if (this._state.isYouTube) {
					util.capTube({
						title: this._videoInfo.title,
						videoId: this._videoInfo.videoId,
						author: this._videoInfo.owner.name
					});
					return;
				}
				this._nicoVideoPlayer.getScreenShot();
				break;
			case 'screenShotWithComment':
				if (this._state.isYouTube) {
					return;
				}
				this._nicoVideoPlayer.getScreenShotWithComment();
				break;
			case 'nextVideo':
				this._nextVideo = param;
				break;
			case 'nicosSeek':
				this._onNicosSeek(param);
				break;
			case 'fastSeek':
				this._nicoVideoPlayer.fastSeek(param);
				break;
			case 'setVideo':
				this.setVideo(param);
				break;
			case 'selectTab':
				this._state.currentTab = param;
				break;
			case 'nicoru':
				this.threadLoader.nicoru(this._videoInfo.msgInfo, param).catch(e => {
					this.execCommand('alert', e.message || 'ニコれなかった＞＜');
				});
				break;
			case 'update-smileVideoQuality':
				this._playerConfig.props.videoServerType = 'smile';
				this._playerConfig.props.smileVideoQuality = param;
				this.reload({videoServerType: 'smile', economy: param === 'eco'});
				break;
			case 'update-dmcVideoQuality':
				this._playerConfig.props.videoServerType = 'dmc';
				this._playerConfig.props.dmcVideoQuality = param;
				this.reload({videoServerType: 'dmc'});
				break;
			case 'update-videoServerType':
				this._playerConfig.props.videoServerType = param;
				this.reload({videoServerType: param === 'dmc' ? 'dmc' : 'smile'});
				break;
			case 'update-commentLanguage':
				command = command.replace(/^update-/, '');
				if (this._playerConfig.props[command] === param) {
					break;
				}
				this._playerConfig.props[command] = param;
				this.reloadComment(param);
				break;
			case 'saveMymemory':
				util.saveMymemory(this, this._state.videoInfo);
				break;
			default:
				this.emit('command', command, param);
		}
	}
	_onKeyDown(name, e, param) {
		this._onKeyEvent(name, e, param);
	}
	_onKeyUp(name, e, param) {
		this._onKeyEvent(name, e, param);
	}
	_onKeyEvent(name, e, param) {
		if (!this._state.isOpen) {
			const lastWatchId = this._playerConfig.props.lastWatchId;
			if (name === 'RE_OPEN' && lastWatchId) {
				this.open(lastWatchId);
				e.preventDefault();
			}
			return;
		}
		const TABLE = {
			'RE_OPEN': 'reload',
			'PAUSE': 'pause',
			'TOGGLE_PLAY': 'togglePlay',
			'SPACE': 'togglePlay',
			'FULL': 'toggle-fullscreen',
			'TOGGLE_PLAYLIST': 'togglePlaylist',
			'DEFLIST': 'deflistAdd',
			'DEFLIST_REMOVE': 'deflistRemove',
			'VIEW_COMMENT': 'toggle-showComment',
			'TOGGLE_LOOP': 'toggle-loop',
			'MUTE': 'toggle-mute',
			'VOL_UP': 'volumeUp',
			'VOL_DOWN': 'volumeDown',
			'SEEK_TO': 'seekTo',
			'SEEK_BY': 'seekBy',
			'SEEK_PREV_FRAME': 'seekPrevFrame',
			'SEEK_NEXT_FRAME': 'seekNextFrame',
			'NEXT_VIDEO': 'playNextVideo',
			'PREV_VIDEO': 'playPreviousVideo',
			'PLAYBACK_RATE': 'playbackRate',
			'SHIFT_UP': 'shiftUp',
			'SHIFT_DOWN': 'shiftDown',
			'SCREEN_MODE': 'screenMode',
			'SCREEN_SHOT': 'screenShot',
			'SCREEN_SHOT_WITH_COMMENT': 'screenShotWithComment'
		};
		switch (name) {
			case 'ESC':
				if (Date.now() < this._escBlockExpiredAt) {
					window.console.log('block ESC');
					break;
				}
				this._escBlockExpiredAt = Date.now() + 1000 * 2;
				if (!Fullscreen.now()) {
					this.close();
				}
				break;
			case 'INPUT_COMMENT':
				this._view.focusToCommentInput();
				break;
			default:
				if (!TABLE[name]) { return; }
				this.execCommand(TABLE[name], param);
		}
		const screenMode = this._playerConfig.props.screenMode;
		if (['small', 'sideView'].includes(screenMode) && ['TOGGLE_PLAY'].includes(name)) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
	}
	_onPlayerConfigUpdate(key, value) {
		if (!this._nicoVideoPlayer) { return; }
		const np = this._nicoVideoPlayer, filter = np.filter;
		switch (key) {
			case 'enableFilter':
				filter.isEnable = value;
				break;
			case 'wordFilter':
				filter.wordFilterList = value;
				break;
			case 'userIdFilter':
				filter.userIdFilterList = value;
				break;
			case 'commandFilter':
				filter.commandFilterList = value;
				break;
			case 'filter.fork0':
			case 'filter.fork1':
			case 'filter.fork2':
			case 'removeNgMatchedUser':
				filter[key.replace(/^.*\./, '')] = value;
				break;
		}
	}
	_updateScreenMode(mode) {
		this.emit('screenModeChange', mode);
	}
	_onPlaylistAppend(watchId) {
		this._playlist.append(watchId);
	}
	_onPlaylistInsert(watchId) {
		this._playlist.insert(watchId);
	}
	_onPlaylistSetMylist(mylistId, option) {
		option = Object.assign({watchId: this._watchId}, option || {});
		option.order = option.order == null ? 'asc' : option.order;
		option.sort = option.sort == null ? 'registeredAt' : option.sort;
		option.insert = this._playlist.isEnable;
		let query = this._videoWatchOptions.query;
		option.shuffle = parseInt(query.shuffle, 10) === 1;
		this._playlist.loadFromMylist(mylistId, option, this._videoInfo.msgInfo).then(result => {
				this.execCommand('notify', result.message);
				this._state.currentTab = 'playlist';
				this._playlist.insertCurrentVideo(this._videoInfo);
			},
			() => this.execCommand('alert', 'マイリストのロード失敗'));
	}
	_onPlaylistSetUploadedVideo(userId, option) {
		option = Object.assign({watchId: this._watchId}, option || {});
		option.insert = this._playlist.isEnable;
		this._playlist.loadUploadedVideo(userId, option).then(result => {
				this.execCommand('notify', result.message);
				this._state.currentTab = 'playlist';
				this._playlist.insertCurrentVideo(this._videoInfo);
			},
			err => this.execCommand('alert', err.message || '投稿動画一覧のロード失敗'));
	}
	_onPlaylistSetSearchVideo(params) {
		let option = Object.assign({watchId: this._watchId}, params.option || {});
		let word = params.word;
		option.insert = this._playlist.isEnable;
		if (option.owner) {
			let ownerId = parseInt(this._videoInfo.owner.id, 10);
			if (this._videoInfo.isChannel) {
				option.channelId = ownerId;
			} else {
				option.userId = ownerId;
			}
		}
		delete option.owner;
		let query = this._videoWatchOptions.query;
		option = Object.assign(option, query);
		this._state.currentTab = 'playlist';
		this._playlist.loadSearchVideo(word, option).then(result => {
				this.execCommand('notify', result.message);
				this._playlist.insertCurrentVideo(this._videoInfo);
				global.emitter.emitAsync('searchVideo', {word, option});
				window.setTimeout(() => this._playlist.scrollToActiveItem(), 1000);
			},
			err => {
				this.execCommand('alert', err.message || '検索失敗または該当無し: 「' + word + '」');
			});
	}
	_onPlaylistSetSeriesVideo(id, option = {}) {
		option = Object.assign({watchId: this._watchId}, option || {});
		option.insert = this._playlist.isEnable;
		this._state.currentTab = 'playlist';
		this._playlist.loadSeriesList(id, option).then(result => {
			this.execCommand('notify', result.message);
			this._playlist.insertCurrentVideo(this._videoInfo);
			window.setTimeout(() => this._playlist.scrollToActiveItem(), 1000);
		},
		err => this.execCommand('alert', err.message || `シリーズリストの取得に失敗: series/${id}`));
	}
	_onPlaylistStatusUpdate() {
		let playlist = this._playlist;
		this._playerConfig.setValue('playlistLoop', playlist.isLoop);
		this._state.isPlaylistEnable = playlist.isEnable;
		if (playlist.isEnable) {
			this._playerConfig.setValue('loop', false);
		}
		this._view.blinkTab('playlist');
	}
	_onCommentPanelStatusUpdate() {
		let commentPanel = this._commentPanel;
		this._playerConfig.setValue(
			'enableCommentPanelAutoScroll', commentPanel.isAutoScroll);
	}
	_onDeflistAdd(watchId) {
		if (this._state.isUpdatingDeflist || !util.isLogin()) {
			return;
		}
		const unlock = () => this._state.isUpdatingDeflist = false;
		this._state.isUpdatingDeflist = true;
		let timer = window.setTimeout(unlock, 10000);
		watchId = watchId || this._videoInfo.watchId;
		let description;
		if (!this._mylistApiLoader) {
			this._mylistApiLoader = MylistApiLoader;
		}
		const {enableAutoMylistComment} = this._playerConfig.props;
		(() => {
			if (watchId === this._watchId || !enableAutoMylistComment) {
				return Promise.resolve(this._videoInfo);
			}
			return ThumbInfoLoader.load(watchId);
		})().then(info => {
			const originalVideoId = info.originalVideoId ?
				`元動画: ${info.originalVideoId}` : '';
			description = enableAutoMylistComment ?
					`投稿者: ${info.owner.name} ${info.owner.linkId} ${originalVideoId}` : '';
		}).then(() => this._mylistApiLoader.addDeflistItem(watchId, description))
			.then(result => this.execCommand('notify', result.message))
			.catch(err => this.execCommand('alert', err.message ? err.message : 'とりあえずマイリストに登録失敗'))
			.then(() => {
			window.clearTimeout(timer);
			timer = window.setTimeout(unlock, 2000);
		});
	}
	_onDeflistRemove(watchId) {
		if (this._state.isUpdatingDeflist || !util.isLogin()) {
			return;
		}
		const unlock = () => this._state.isUpdatingDeflist = false;
		this._state.isUpdatingDeflist = true;
		let timer = window.setTimeout(unlock, 10000);
		watchId = watchId || this._videoInfo.watchId;
		if (!this._mylistApiLoader) {
			this._mylistApiLoader = MylistApiLoader;
		}
		this._mylistApiLoader.removeDeflistItem(watchId)
			.then(result => this.execCommand('notify', result.message))
			.catch(err => this.execCommand('alert', err.message))
			.then(() => {
				window.clearTimeout(timer);
				timer = window.setTimeout(unlock, 2000);
			});
	}
	_onToggleLike() {
		if (!util.isLogin()) { return; }
		const videoId = this._videoInfo.videoId;
		const isLiked = this._videoInfo.isLiked;
		(isLiked ? LikeApi.unlike(videoId) : LikeApi.like(videoId))
			.then(result => {
			const message = result.data ? (result.data.thanksMessage || '') : '';
			if (message) {
				this.execCommand('notify', `${message}`);
			} else {
				this.execCommand('notify',
					isLiked ? '(･A･)ﾉｼ' : '(･∀･)ｨｨﾈ!!');
			}
			this._state.isLiked = this._videoInfo.isLiked = !isLiked;
		}).catch(err => {
			console.warn(err);
			this.execCommand('alert', 'いいね！できなかった');
		});
	}
	_onMylistAdd(groupId, mylistName) {
		if (this._state.isUpdatingMylist || !util.isLogin()) {
			return;
		}
		const unlock = () => this._state.isUpdatingMylist = false;
		this._state.isUpdatingMylist = true;
		let timer = window.setTimeout(unlock, 10000);
		const owner = this._videoInfo.owner;
		const originalVideoId = this._videoInfo.originalVideoId ?
			`元動画: ${this._videoInfo.originalVideoId}` : '';
		const watchId = this._videoInfo.watchId;
		const description =
			this._playerConfig.getValue('enableAutoMylistComment') ?
				`投稿者: ${owner.name} ${owner.linkId} ${originalVideoId}` : '';
		if (!this._mylistApiLoader) {
			this._mylistApiLoader = MylistApiLoader;
		}
		this._mylistApiLoader.addMylistItem(watchId, groupId, description)
			.then(result => this.execCommand('notify', `${result.message}: ${mylistName}`))
			.catch(err => this.execCommand('alert', `${err.message}: ${mylistName}`))
			.then(() => {
				window.clearTimeout(timer);
				timer = window.setTimeout(unlock, 2000);
			});
	}
	_onMylistRemove(groupId, mylistName) {
		if (this._state.isUpdatingMylist || !util.isLogin()) {
			return;
		}
		const unlock = () => this._state.isUpdatingMylist = false;
		this._state.isUpdatingMylist = true;
		let timer = window.setTimeout(unlock, 10000);
		let watchId = this._videoInfo.watchId;
		if (!this._mylistApiLoader) {
			this._mylistApiLoader = MylistApiLoader;
		}
		this._mylistApiLoader.removeMylistItem(watchId, groupId)
			.then(result => this.execCommand('notify', `${result.message}: ${mylistName}`))
			.catch(err => this.execCommand('alert', `${err.message}: ${mylistName}`))
			.then(() => {
				window.clearTimeout(timer);
				timer = window.setTimeout(unlock, 2000);
			});
	}
	_onCommentParsed() {
		const lang = this._playerConfig.getValue('commentLanguage');
		this.emit('commentParsed', lang, this._threadInfo);
		global.emitter.emit('commentParsed');
	}
	_onCommentChange() {
		const lang = this._playerConfig.getValue('commentLanguage');
		this.emit('commentChange', lang, this._threadInfo);
		global.emitter.emit('commentChange');
	}
	_onCommentFilterChange(filter) {
		const config = this._playerConfig;
		config.props.enableFilter = filter.isEnable;
		config.props.wordFilter = filter.wordFilterList;
		config.props.userIdFilter = filter.userIdFilterList;
		config.props.commandFilter = filter.commandFilterList;
		this.emit('commentFilterChange', filter);
	}
	_onVideoPlayerTypeChange(type = '') {
		switch (type.toLowerCase()) {
			case 'youtube':
				this._state.setState({isYouTube: true});
				break;
			default:
				this._state.setState({isYouTube: false});
		}
	}
	_onNicosSeek(time) {
		const ct = this.currentTime;
		window.console.info('nicosSeek!', time);
		if (this.isPlaylistEnable) {
			if (ct < time) {
				this.execCommand('fastSeek', time);
			}
		} else {
			this.execCommand('fastSeek', time);
		}
	}
	show() {
		this._state.isOpen = true;
	}
	hide() {
		this._state.isOpen = false;
	}
	async open(watchId, options) {
		if (!watchId) {
			return;
		}
		if (Date.now() - this._lastOpenAt < 1500 && this._watchId === watchId) {
			return;
		}
		this.refreshLastPlayerId();
		this._requestId = 'play-' + Math.random();
		this._videoWatchOptions = options = new VideoWatchOptions(watchId, options, this._playerConfig);
		if (!options.isPlaylistStartRequest &&
			this.isPlaying && this.isPlaylistEnable && !options.isOpenNow) {
			this._onPlaylistInsert(watchId);
			return;
		}
		window.console.log('%copen video: ', 'color: blue;', watchId);
		window.console.time('動画選択から再生可能までの時間 watchId=' + watchId);
		let nicoVideoPlayer = this._nicoVideoPlayer;
		if (!nicoVideoPlayer) {
			nicoVideoPlayer = await this._initializeNicoVideoPlayer();
		} else {
			if (this._videoInfo) {
				this._savePlaybackPosition(this._videoInfo.contextWatchId, this.currentTime);
			}
			nicoVideoPlayer.close();
			this._view.clearPanel();
			this.emit('beforeVideoOpen');
			if (this._videoSession) {
				this._videoSession.close();
			}
		}
		this._state.resetVideoLoadingStatus();
		this._state.isCommentReady = false;
		this._watchId = watchId;
		this._lastCurrentTime = 0;
		this._lastOpenAt = Date.now();
		this._state.isError = false;
		Promise.all([
			VideoInfoLoader.load(watchId, options.videoLoadOptions),
			WatchInfoCacheDb.get(this._watchId),
			this._initializePlaylist()  //videoinfo取得に300msくらいかかってるぽいから他のことやろうか
		]).then(this._onVideoInfoLoaderLoad.bind(this, this._requestId)
		).catch(this._onVideoInfoLoaderFail.bind(this, this._requestId));
		this.show();
		if (this._playerConfig.getValue('autoFullScreen') && !util.fullscreen.now()) {
			nicoVideoPlayer.requestFullScreen();
		}
		this.emit('open', watchId, options);
		global.emitter.emitAsync('DialogPlayerOpen', watchId, options);
		global.emitter.emitResolve('firstPlayerOpen');
	}
	get isOpen() {
		return this._state.isOpen;
	}
	reload(options) {
		options = this._videoWatchOptions.createForReload(options);
		if (this._lastCurrentTime > 0) {
			options.currentTime = this._lastCurrentTime;
		}
		this.open(this._watchId, options);
	}
	get currentTime() {
		if (!this._nicoVideoPlayer) {
			return 0;
		}
		const ct = this._nicoVideoPlayer.currentTime * 1;
		if (!this._state.isError && ct > 0) {
			this._lastCurrentTime = ct;
		}
		return this._lastCurrentTime;
	}
	set currentTime(sec) {
		if (!this._nicoVideoPlayer) {
			return;
		}
		sec = Math.max(0, sec);
		this._nicoVideoPlayer.currentTime=sec;
		this._lastCurrentTime = sec;
		MediaSessionApi.updatePositionStateByMedia(this);
	}
	get id() { return this._id;}
	get isLastOpenedPlayer() {
		return this.id === this._playerConfig.props.lastPlayerId;
	}
	refreshLastPlayerId() {
		if (this.isLastOpenedPlayer) {
			return;
		}
		this._playerConfig.props.lastPlayerId = '';
		this._playerConfig.props.lastPlayerId = this.id;
	}
	async _onVideoInfoLoaderLoad(requestId, [videoInfoData, localCacheData]) {
		console.log('VideoInfoLoader.load!', requestId, this._watchId, videoInfoData);
		if (this._requestId !== requestId) {
			return;
		}
		const videoInfo = this._videoInfo = new VideoInfoModel(videoInfoData, localCacheData);
		this._watchId = videoInfo.watchId;
		WatchInfoCacheDb.put(this._watchId, {videoInfo});
		let serverType = 'dmc';
		if (!videoInfo.isDmcAvailable) {
			serverType = 'smile';
		} else if (videoInfo.isDmcOnly) {
			serverType = 'dmc';
		} else if (['dmc', 'smile'].includes(this._videoWatchOptions.videoServerType)) {
			serverType = this._videoWatchOptions.videoServerType;
		} else if (this._playerConfig.props.videoServerType === 'smile') {
			serverType = 'smile';
		} else {
			const disableDmc =
				this._playerConfig.props.autoDisableDmc &&
				this._videoWatchOptions.videoServerType !== 'smile' &&
				videoInfo.maybeBetterQualityServerType === 'smile';
			serverType = disableDmc ? 'smile' : 'dmc';
		}
		this._state.setState({
			isDmcAvailable: videoInfo.isDmcAvailable,
			isCommunity: videoInfo.isCommunityVideo,
			isMymemory: videoInfo.isMymemory,
			isChannel: videoInfo.isChannel,
			isLiked: videoInfo.isLiked
		});
		MediaSessionApi.updateByVideoInfo(this._videoInfo);
		const isHLSRequired = videoInfo.dmcInfo && videoInfo.dmcInfo.isHLSRequired;
		const isHLSSupported = !!global.debug.isHLSSupported ||
		document.createElement('video').canPlayType('application/x-mpegURL') !== '';
		const useHLS = isHLSSupported && (isHLSRequired || !this._playerConfig.props['video.hls.enableOnlyRequired']);
			this._videoSession = await VideoSessionWorker.create({
			videoInfo,
			videoQuality: this._playerConfig.props.dmcVideoQuality,
			serverType,
			isPlayingCallback: () => this.isPlaying,
			useWellKnownPort: true,
			useHLS
		});
		if (this._videoFilter.isNgVideo(videoInfo)) {
			return this._onVideoFilterMatch();
		}
		if (this._videoSession.isDmc) {
			NVWatchCaller.call(videoInfo.dmcInfo.trackingId)
				.then(() => this._videoSession.connect())
				.then(sessionInfo => {
					this.setVideo(sessionInfo.url);
					videoInfo.setCurrentVideo(sessionInfo.url);
					this.emit('videoServerType', 'dmc', sessionInfo, videoInfo);
				})
				.catch(this._onVideoSessionFail.bind(this));
		} else {
			if (this._playerConfig.props.enableVideoSession) {
				this._videoSession.connect();
			}
			videoInfo.setCurrentVideo(videoInfo.videoUrl);
			this.setVideo(videoInfo.videoUrl);
			this.emit('videoServerType', 'smile', {}, videoInfo);
		}
		this._state.videoInfo = videoInfo;
		this._state.isDmcPlaying = this._videoSession.isDmc;
		this.loadComment(videoInfo.msgInfo);
		this.emit('loadVideoInfo', videoInfo);
		this.emitResolve('firstVideoInitialized', this._watchId);
		if (Fullscreen.now() || this._playerConfig.props.screenMode === 'wide') {
			this.execCommand('notifyHtml',
				`<img src="${textUtil.escapeHtml(videoInfo.thumbnail)}" style="width: 96px;">` +
				util.escapeToZenkaku(videoInfo.title)
			);
		}
	}
	setVideo(url) {
		this._state.setState({
			isYouTube: url.indexOf('youtube') >= 0,
			currentSrc: url
		});
	}
	loadComment(msgInfo) {
		msgInfo.language = this._playerConfig.props.commentLanguage;
		this.threadLoader.load(msgInfo).then(
			this._onCommentLoadSuccess.bind(this, this._requestId),
			this._onCommentLoadFail.bind(this, this._requestId)
		);
	}
	reloadComment(param = {}) {
		const msgInfo = Object.assign({}, this._videoInfo.msgInfo);
		if (typeof param.when === 'number') {
			msgInfo.when = param.when;
		}
		this.loadComment(msgInfo);
	}
	_onVideoInfoLoaderFail(requestId, e) {
		const watchId = e.watchId;
		window.console.error('_onVideoInfoLoaderFail', watchId, e);
		if (this._requestId !== requestId) {
			return;
		}
		this._setErrorMessage(e.message || '通信エラー', watchId);
		this._state.isError = true;
		if (e.info) {
			this._videoInfo = new VideoInfoModel(e.info);
			this._state.videoInfo = this._videoInfo;
			this.emit('loadVideoInfoFail', this._videoInfo);
		} else {
			this.emit('loadVideoInfoFail');
		}
		global.emitter.emitAsync('loadVideoInfoFail', e);
		if (!this.isPlaylistEnable) {
			return;
		}
		if (e.reason === 'forbidden' || e.info.isPlayable === false) {
			window.setTimeout(() => this.playNextVideo(), 3000);
		}
	}
	_onVideoSessionFail(result) {
		window.console.error('dmc fail', result);
		this._setErrorMessage(
			`動画の読み込みに失敗しました(dmc.nico) ${result && result.message || ''}`, this._watchId);
		this._state.setState({isError: true, isLoading: false});
		if (this.isPlaylistEnable) {
			window.setTimeout(() => this.playNextVideo(), 3000);
		}
	}
	_onVideoPlayStartFail(err) {
		window.console.error('動画再生開始に失敗', err);
		if (!(err instanceof DOMException)) { //
			return;
		}
		console.warn('play() request was rejected code: %s. message: %s', err.code, err.message);
		const message = err.message;
		switch (message) {
			case 'SessionClosedError':
				if (this._playserState.isError) { break; }
				this._setErrorMessage('動画の再生開始に失敗しました', this._watchId);
				this._state.setVideoErrorOccurred();
				break;
			case 'AbortError': // 再生開始を待っている間に動画変更などで中断された等
			case 'NotAllowedError': // 自動再生のブロック
			default:
				break;
		}
		this.emit('loadVideoPlayStartFail');
		global.emitter.emitAsync('loadVideoPlayStartFail');
	}
	_onVideoFilterMatch() {
		window.console.error('ng video', this._watchId);
		this._setErrorMessage('再生除外対象の動画または投稿者です');
		this._state.isError = true;
		this.emit('error');
		if (this.isPlaylistEnable) {
			window.setTimeout(() => this.playNextVideo(), 3000);
		}
	}
	_setErrorMessage(msg) {
		this._state.errorMessage = msg;
	}
	_onCommentLoadSuccess(requestId, result) {
		if (requestId !== this._requestId) {
			return;
		}
		let options = {
			replacement: this._videoInfo.replacementWords,
			duration: this._videoInfo.duration,
			mainThreadId: result.threadInfo.threadId,
			format: result.format
		};
		this._nicoVideoPlayer.closeCommentPlayer();
		this._threadInfo = result.threadInfo;
		this._nicoVideoPlayer.setComment(result.body, options);
		WatchInfoCacheDb.put(this._watchId, {threadInfo: result.threadInfo});
		this._state.isCommentReady = true;
		this._state.isWaybackMode = result.threadInfo.isWaybackMode;
		this.emit('commentReady', result, this._threadInfo);
		if (result.threadInfo.totalResCount !== this._videoInfo.count.comment) {
			this._state.count = {
				...this._state.count, comment: result.threadInfo.totalResCount
			};
			this.emit('videoCount', {comment: result.threadInfo.totalResCount});
		}
	}
	_onCommentLoadFail(requestId, e) {
		if (requestId !== this._requestId) {
			return;
		}
		this.execCommand('alert', e.message);
	}
	_onLoadedMetaData() {
		if (this._state.isYouTube) {
			return;
		}
		let currentTime = this._videoWatchOptions.currentTime;
		if (currentTime > 0) {
			this.currentTime=currentTime;
		}
	}
	async _onVideoCanPlay() {
		if (!this._state.isLoading) {
			return;
		}
		window.console.timeEnd('動画選択から再生可能までの時間 watchId=' + this._watchId);
		this._playerConfig.props.lastWatchId = this._watchId;
		WatchInfoCacheDb.put(this._watchId, {watchCount: 1});
		await this.promise('playlist-ready');
		if (this._videoWatchOptions.isPlaylistStartRequest) {
			let option = this._videoWatchOptions.mylistLoadOptions;
			let query = this._videoWatchOptions.query;
			option.append = this.isPlaying && this._playlist.isEnable;
			option.shuffle = parseInt(query.shuffle, 10) === 1;
			console.log('playlist option:', option);
			if (query.playlist_type === 'mylist') {
				this._playlist.loadFromMylist(option.group_id, option, this._videoInfo.msgInfo);
			} else if (query.playlist_type === 'deflist') {
				this._playlist.loadFromMylist('deflist', option, this._videoInfo.msgInfo);
			} else if (query.playlist_type === 'tag' || query.playlist_type === 'search') {
				let word = query.tag || query.keyword;
				option.searchType = query.tag ? 'tag' : '';
				option = Object.assign(option, query);
				this._playlist.loadSearchVideo(word, option, this._playerConfig.props['search.limit']);
			}
			this._playlist.toggleEnable(true);
		}
		this._playlist.insertCurrentVideo(this._videoInfo);
		if (this._videoInfo.watchId !== this._videoInfo.videoId &&
			this._videoInfo.videoId.startsWith('so')) {
			this._playlist.removeItemByWatchId(this._videoInfo.watchId);
		}
		this._state.setVideoCanPlay();
		this.emitAsync('canPlay', this._watchId, this._videoInfo, this._videoWatchOptions);
		this.emitResolve('firstVideoCanPlay', this._watchId, this._videoInfo, this._videoWatchOptions);
		if (this._videoWatchOptions.eventType === 'playlist' && this.isOpen) {
			this.play();
		}
		if (this._nextVideo) {
			const nextVideo = this._nextVideo;
			this._nextVideo = null;
			if (this._playerConfig.props.enableNicosJumpVideo) {
				const nv = this._playlist.findByWatchId(nextVideo);
				if (nv && nv.isPlayed()) {
					return;
				} // 既にリストにあって再生済みなら追加しない(無限ループ対策)
				this.execCommand('notify', '@ジャンプ: ' + nextVideo);
				this.execCommand('playlistInsert', nextVideo);
			}
		}
	}
	_onVideoPlay() {
		this._state.setPlaying();
		MediaSessionApi.updatePositionStateByMedia(this);
		this.emit('play');
	}
	_onVideoPlaying() {
		this._state.setPlaying();
		this.emit('playing');
	}
	_onVideoSeeking() {
		this._state.isSeeking = true;
		this.emit('seeking');
	}
	_onVideoSeeked() {
		this._state.isSeeking = false;
		MediaSessionApi.updatePositionStateByMedia(this);
		this.emit('seeked');
	}
	_onVideoPause() {
		this._state.setPausing();
		this._savePlaybackPosition(this._videoInfo.contextWatchId, this.currentTime);
		this.emit('pause');
	}
	_onVideoStalled() {
		this._state.isStalled = true;
		this.emit('stalled');
	}
	_onVideoTimeUpdate() {
		this._state.isStalled = false;
	}
	_onVideoProgress(range, currentTime) {
		this.emit('progress', range, currentTime);
	}
	async _onVideoError(e) {
		this._state.setVideoErrorOccurred();
		if (e.type === 'youtube') {
			return this._onYouTubeVideoError(e);
		}
		if (!this._videoInfo) {
			this._setErrorMessage('動画の再生に失敗しました。');
			return;
		}
		const retry = params => {
			setTimeout(() => {
				if (!this.isOpen) {
					return;
				}
				this.reload(params);
			}, 3000);
		};
		const sessionState = await this._videoSession.getState();
		const {isDmc, isDeleted, isAbnormallyClosed} = sessionState;
		const videoWatchOptions = this._videoWatchOptions;
		const code = (e && e.target && e.target.error && e.target.error.code) || 0;
		window.console.error('VideoError!', code, e, (e.target && e.target.error), {isDeleted, isAbnormallyClosed});
		if (Date.now() - this._lastOpenAt > 3 * 60 * 1000 && isDeleted && !isAbnormallyClosed) {
			if (videoWatchOptions.reloadCount < 5) {
				retry();
			} else {
				this._setErrorMessage('動画のセッションが切断されました。');
			}
		} else if (!isDmc && this._videoInfo.isDmcAvailable) {
			this._setErrorMessage('SMILE動画の再生に失敗しました。DMC動画に接続します。');
			retry({economy: false, videoServerType: 'dmc'});
		} else if (!isDmc && (!this._videoWatchOptions.isEconomySelected && !this._videoInfo.isEconomy)) {
			this._setErrorMessage('動画の再生に失敗しました。エコノミー動画に接続します。');
			retry({economy: true, videoServerType: 'smile'});
		} else {
			this._setErrorMessage('動画の再生に失敗しました。');
		}
		this.emit('error', e, code);
	}
	_onYouTubeVideoError(e) {
		window.console.error('onYouTubeVideoError!', e);
		this._setErrorMessage(e.description);
		this.emit('error', e);
		if (e.fallback) {
			setTimeout(() => this.reload({isAutoZenTubeDisabled: true}), 3000);
		}
	}
	_onVideoAbort() {
		this.emit('abort');
	}
	_onVideoAspectRatioFix(ratio) {
		this.emit('aspectRatioFix', ratio);
	}
	_onVideoEnded() {
		this.emitAsync('ended');
		this._state.setVideoEnded();
		this._savePlaybackPosition(this._videoInfo.contextWatchId, 0);
		if (this.isPlaylistEnable && this._playlist.hasNext) {
			this.playNextVideo({eventType: 'playlist'});
			return;
		} else if (this._playlist) {
			this._playlist.toggleEnable(false);
		}
		const isAutoCloseFullScreen =
			this._videoWatchOptions.hasKey('autoCloseFullScreen') ?
				this._videoWatchOptions.isAutoCloseFullScreen :
				this._playerConfig.getValue('autoCloseFullScreen');
		if (Fullscreen.now() && isAutoCloseFullScreen) {
			Fullscreen.cancel();
		}
		global.emitter.emitAsync('videoEnded');
	}
	_onVolumeChange(vol, mute) {
		this.emit('volumeChange', vol, mute);
	}
	_onVolumeChangeEnd(vol, mute) {
		this.emit('volumeChangeEnd', vol, mute);
	}
	_savePlaybackPosition(contextWatchId, ct) {
		if (!util.isLogin()) {
			return;
		}
		const vi = this._videoInfo;
		if (!vi) {
			return;
		}
		const dr = this.duration;
		console.info('%csave PlaybackPosition:', 'background: cyan', ct, dr, vi.csrfToken);
		if (vi.contextWatchId !== contextWatchId) {
			return;
		}
		if (Math.abs(ct - dr) < 3) {
			return;
		}
		if (dr < 120) {
			return;
		} // 短い動画は記録しない
		PlaybackPosition.record(
			contextWatchId,
			ct,
			vi.msgInfo.frontendId,
			vi.msgInfo.frontendVersion
		).catch(e => {
			window.console.warn('save playback fail', e);
		});
	}
	close() {
		if (this.isPlaying) {
			this._savePlaybackPosition(this._watchId, this.currentTime);
		}
		WatchInfoCacheDb.put(this._watchId, {currentTime: this.currentTime});
		if (Fullscreen.now()) {
			Fullscreen.cancel();
		}
		this.pause();
		this.hide();
		this._refresh();
		this.emit('close');
		global.emitter.emitAsync('DialogPlayerClose');
	}
	_refresh() {
		if (this._nicoVideoPlayer) {
			this._nicoVideoPlayer.close();
		}
		if (this._videoSession) {
			this._videoSession.close();
		}
	}
	async _initializePlaylist() {
		if (this._playlist) {
			return;
		}
		const $container = this._view.appendTab('playlist', 'プレイリスト');
		this._playlist = new PlayList({
			loader: ThumbInfoLoader,
			container: $container[0],
			loop: this._playerConfig.props.playlistLoop
		});
		this._playlist.on('command', this._onCommand.bind(this));
		this._playlist.on('update', _.debounce(this._onPlaylistStatusUpdate.bind(this), 100));
		if (PlayListSession.isExist()) {
			this._playlist.restoreFromSession();
		}
		this.emitResolve('playlist-ready');
	}
	_initializeCommentPanel() {
		if (this._commentPanel) {
			return;
		}
		const $container = this._view.appendTab('comment', 'コメント');
		this._commentPanel = new CommentPanel({
			player: this,
			$container: $container,
			autoScroll: this._playerConfig.props.enableCommentPanelAutoScroll,
			language: this._playerConfig.props.commentLanguage
		});
		this._commentPanel.on('command', this._onCommand.bind(this));
		this._commentPanel.on('update', _.debounce(this._onCommentPanelStatusUpdate.bind(this), 100));
		this.emitResolve('commentpanel-ready');
	}
	get isPlaylistEnable() {
		return this._playlist && this._playlist.isEnable;
	}
	playNextVideo(options) {
		if (!this._playlist || !this.isOpen) {
			return;
		}
		let opt = this._videoWatchOptions.createForVideoChange(options);
		let nextId = this._playlist.selectNext();
		if (nextId) {
			this.open(nextId, opt);
		}
	}
	playPreviousVideo(options) {
		if (!this._playlist || !this.isOpen) {
			return;
		}
		let opt = this._videoWatchOptions.createForVideoChange(options);
		let prevId = this._playlist.selectPrevious();
		if (prevId) {
			this.open(prevId, opt);
		}
	}
	play() {
		if (!this._state.isError && this._nicoVideoPlayer) {
			this._nicoVideoPlayer.play().catch((e) => {
				this._onVideoPlayStartFail(e);
			});
		}
	}
	pause() {
		if (!this._state.isError && this._nicoVideoPlayer) {
			this._nicoVideoPlayer.pause();
			this._state.setPausing();
		}
	}
	get isPlaying() {
		return this._state.isPlaying;
	}
	get paused() {
		return this._nicoVideoPlayer ? this._nicoVideoPlayer.paused : true;
	}
	togglePlay() {
		if (!this._state.isError && this._nicoVideoPlayer) {
			if (this.isPlaying) {
				this.pause();
				return;
			}
			this._nicoVideoPlayer.togglePlay().catch((e) => {
				this._onVideoPlayStartFail(e);
			});
		}
	}
	set volume(v) {
		if (this._nicoVideoPlayer) {
			this._nicoVideoPlayer.volume = v;
		}
	}
	get volume() {
		return this._playerConfig.props.volume;
	}
	async addChat(text, cmd, vpos = null, options = {}) {
		if (!this._nicoVideoPlayer ||
			!this.threadLoader ||
			!this._state.isCommentReady ||
			this._state.isCommentPosting) {
			return Promise.reject();
		}
		if (!util.isLogin()) {
			return Promise.reject();
		}
		const threadId = this._threadInfo.threadId * 1;
		if (this._threadInfo.force184 !== '1') {
			cmd = cmd ? ('184 ' + cmd) : '184';
		}
		Object.assign(options, {isMine: true, isUpdating: true, thead: threadId});
		vpos = (!isNaN(vpos) && typeof vpos === 'number') ? vpos : this._nicoVideoPlayer.vpos;
		const nicoChat = this._nicoVideoPlayer.addChat(text, cmd, vpos, options);
		this._state.isCommentPosting = true;
		const lang = this._playerConfig.props.commentLanguage;
		window.console.time('コメント投稿');
		const onSuccess = result => {
			window.console.timeEnd('コメント投稿');
			nicoChat.isUpdating = false;
			nicoChat.no = result.no;
			this.execCommand('notify', 'コメント投稿成功');
			this._state.isCommentPosting = false;
			this._threadInfo.blockNo = result.blockNo;
			WatchInfoCacheDb.put(this._watchId, {comment: {text, cmd, vpos, options}});
			return Promise.resolve(result);
		};
		const onFail = err => {
			err = err || {};
			window.console.log('_onFail: ', err);
			window.console.timeEnd('コメント投稿');
			nicoChat.isPostFail = true;
			nicoChat.isUpdating = false;
			this.execCommand('alert', err.message);
			this._state.isCommentPosting = false;
			if (err.blockNo && typeof err.blockNo === 'number') {
				this._threadInfo.blockNo = err.blockNo;
			}
			return Promise.reject(err);
		};
		const msgInfo = this._videoInfo.msgInfo;
		return this.threadLoader.postChat(msgInfo, text, cmd, vpos, lang)
			.then(onSuccess).catch(onFail);
	}
	get duration() {
		if (!this._videoInfo) {
			return 0;
		}
		return this._videoInfo.duration;
	}
	get bufferedRange() {return this._nicoVideoPlayer.bufferedRange;}
	get nonFilteredChatList() {return this._nicoVideoPlayer.nonFilteredChatList;}
	get chatList() {return this._nicoVideoPlayer.chatList;}
	get playingStatus() {
		if (!this._nicoVideoPlayer || !this._nicoVideoPlayer.isPlaying) {
			return {};
		}
		const session = {
			playing: true,
			watchId: this._watchId,
			url: location.href,
			currentTime: this._nicoVideoPlayer.currentTime
		};
		const options = this._videoWatchOptions.createForSession();
		Object.keys(options).forEach(key => {
			session[key] = session.hasOwnProperty(key) ? session[key] : options[key];
		});
		return session;
	}
	get watchId() {
		return this._watchId;
	}
	get currentTab() {
		return this._state.currentTab;
	}
	getId() { return this.id; }
	getDuration() { return this.duration; }
	getBufferedRange() { return this.bufferedRange; }
	getNonFilteredChatList() { return this.nonFilteredChatList;}
	getChatList() { return this.chatList; }
	getPlayingStatus() { return this.playingStatus; }
	getMymemory() {
		return this._nicoVideoPlayer.getMymemory();
	}
}
class VideoHoverMenu {
	constructor(...args) {
		this.initialize(...args);
	}
	initialize(params) {
		this._container = params.playerContainer;
		this._state = params.playerState;
		this._bound = {};
		this._bound.emitClose =
			_.debounce(() => util.dispatchCommand(this._container, 'close'), 300);
		this._initializeDom();
	}
	async _initializeDom() {
		const container = this._container;
		util.$.html(VideoHoverMenu.__tpl__).appendTo(container);
		this._view = container.querySelector('.hoverMenuContainer');
		const $mc = util.$(container.querySelectorAll('.menuItemContainer'));
		$mc.on('contextmenu',
			e => { e.preventDefault(); e.stopPropagation(); });
		$mc.on('click', this._onClick.bind(this));
		$mc.on('mousedown', this._onMouseDown.bind(this));
		global.emitter.on('hideHover', this._hideMenu.bind(this));
		await this._initializeMylistSelectMenu();
	}
	async _initializeMylistSelectMenu() {
		if (!util.isLogin()) {
			return;
		}
		this._mylistApiLoader = MylistApiLoader;
		this._mylistList = await this._mylistApiLoader.getMylistList();
		this._initializeMylistSelectMenuDom();
	}
	_initializeMylistSelectMenuDom(mylistList) {
		if (!util.isLogin()) {
			return;
		}
		mylistList = mylistList || this._mylistList;
		const menu = this._container.querySelector('.mylistSelectMenu');
		menu.addEventListener('wheel', e => e.stopPropagation(), {passive: true});
		const ul = document.createElement('ul');
		mylistList.forEach(mylist => {
			const li = document.createElement('li');
			li.className = `folder${mylist.icon_id}`;
			const icon = document.createElement('span');
			icon.className = 'mylistIcon command';
			Object.assign(icon.dataset, {
				mylistId: mylist.id,
				mylistName: mylist.name,
				command: 'mylistOpen'
			});
			icon.title = mylist.name + 'を開く';
			const link = document.createElement('a');
			link.className = 'mylistLink name command';
			link.textContent = mylist.name;
			link.href = `https://www.nicovideo.jp/my/mylist/#/${mylist.id}`;
			Object.assign(link.dataset, {
				mylistId: mylist.id,
				mylistName: mylist.name,
				command: 'mylistAdd'
			});
			li.append(icon, link);
			ul.append(li);
		});
		menu.querySelector('.mylistSelectMenuInner').append(ul);
	}
	_onMouseDown(e) {
		e.stopPropagation();
		const target = e.target.closest('[data-command]');
		if (!target) {
			return;
		}
		let command = target.dataset.command;
		switch (command) {
			case 'deflistAdd':
				if (e.shiftKey) {
					command = 'mylistWindow';
				} else {
					command = e.which > 1 ? 'deflistRemove' : 'deflistAdd';
				}
				util.dispatchCommand(target, command);
				break;
			case 'toggle-like':
				util.dispatchCommand(target, command);
				break;
			case 'mylistAdd': {
				command = (e.shiftKey || e.which > 1) ? 'mylistRemove' : 'mylistAdd';
				const {mylistId, mylistName} = target.dataset;
				this._hideMenu();
				util.dispatchCommand(target, command, {mylistId, mylistName});
				break;
			}
			case 'mylistOpen': {
				const mylistId = target.dataset.mylistId;
				location.href = `https://www.nicovideo.jp/my/mylist/#/${mylistId}`;
				break;
			}
			case 'close':
				this._bound.emitClose();
				break;
			default:
				return;
		}
	}
	_onClick(e) {
		e.preventDefault();
		e.stopPropagation();
		const target = e.target.closest('[data-command]');
		if (!target) {
			return;
		}
		let {command, type, param} = target.dataset;
		switch (type) {
			case 'json':
			case 'bool':
			case 'number':
				param = JSON.parse(param);
				break;
		}
		switch (command) {
			case 'deflistAdd':
			case 'mylistAdd':
			case 'mylistOpen':
			case 'close':
				this._hideMenu();
				break;
			case 'mylistMenu':
				if (e.shiftKey) {
					util.dispatchCommand(target, 'mylistWindow');
				}
				break;
			case 'nop':
				break;
			default:
				this._hideMenu();
				util.dispatchCommand(target, command, param);
				break;
		}
	}
	_hideMenu() {
		if (!this._view.contains(document.activeElement)) {
			return;
		}
		window.setTimeout(() => document.body.focus(), 0);
	}
}
	util.addStyle(`
		.hoverMenuContainer {
			user-select: none;
			contain: style size;
		}
		.menuItemContainer {
			box-sizing: border-box;
			position: absolute;
			z-index: ${CONSTANT.BASE_Z_INDEX + 40000};
			overflow: visible;
			will-change: transform, opacity;
			user-select: none;
		}
			.menuItemContainer .menuButton {
				width: 32px;
				height:32px;
				font-size: 24px;
				background: #888;
				color: #000;
				border: 1px solid #666;
				border-radius: 4px;
				line-height: 30px;
				white-space: nowrap;
				text-align: center;
				cursor: pointer;
				outline: none;
			}
			.menuItemContainer:hover .menuButton {
				pointer-events: auto;
			}
			.menuItemContainer.rightTop {
				width: 240px;
				height: 40px;
				right: 0px;
				top: 0;
				perspective: 150px;
				perspective-origin: center;
			}
			.menuItemContainer.rightTop .scalingUI {
				transform-origin: right top;
			}
			.is-updatingDeflist .menuItemContainer.rightTop,
			.is-updatingMylist  .menuItemContainer.rightTop {
				cursor: wait;
				opacity: 1 !important;
			}
			.is-updatingDeflist .menuItemContainer.rightTop>*,
			.is-updatingMylist  .menuItemContainer.rightTop>* {
				pointer-events: none;
			}
		.menuItemContainer.leftTop {
			width: auto;
			height: auto;
			left: 32px;
			top: 32px;
			display: none;
		}
			.is-debug .menuItemContainer.leftTop {
				display: inline-block !important;
				opacity: 1 !important;
				transition: none !important;
				transform: translateZ(0);
				max-width: 200px;
			}
		.menuItemContainer.leftBottom {
			width: 120px;
			height: 32px;
			left: 8px;
			bottom: 48px;
			transform-origin: left bottom;
		}
		.menuItemContainer.rightBottom {
			width: 120px;
			height: 80px;
			right:  0;
			bottom: 8px;
		}
		.menuItemContainer.onErrorMenu {
			position: absolute;
			left: 50%;
			top: 60%;
			transform: translate(-50%, 0);
			display: none;
			white-space: nowrap;
		}
			.is-error .onErrorMenu {
				display: block !important;
				opacity: 1 !important;
			}
			.is-youTube .onErrorMenu .for-nicovideo,
									.onErrorMenu .for-ZenTube {
				display: none;
			}
			.is-youTube.is-error .onErrorMenu .for-ZenTube {
				display: inline-block;
			}
			.onErrorMenu .menuButton {
				position: relative;
				display: inline-block !important;
				margin: 0 16px;
				padding: 8px;
				background: #888;
				color: #000;
				opacity: 1;
				cursor: pointer;
				border-radius: 0;
				box-shadow: 4px 4px 0 #333;
				border: 2px outset;
				width: 100px;
				font-size: 14px;
				line-height: 16px;
			}
			.menuItemContainer.onErrorMenu .menuButton:active {
				background: var(--base-fore-color);
				border: 2px inset;
			}
			.menuItemContainer.onErrorMenu .playNextVideo {
				display: none !important;
			}
			.is-playlistEnable .menuItemContainer.onErrorMenu .playNextVideo {
				display: inline-block !important;
			}
		.menuButton {
			position: absolute;
			opacity: 0;
			transition:
				opacity 0.4s ease,
				box-shadow 0.2s ease 1s,
				background 0.4s ease;
			box-sizing: border-box;
			text-align: center;
			text-shadow: none;
			user-select: none;
			will-change: transform, opacity;
			contain: style size layout;
		}
			.menuButton:focus-within,
			.menuButton:hover {
				box-shadow: 0 2px 0 #000;
				cursor: pointer;
				opacity: 1;
				background: #888;
				color: #000;
			}
			.menuButton:active {
				transform: translate(0, 2px);
				box-shadow: 0 0 0 #000;
				transition: none;
			}
			.menuButton .tooltip {
				display: none;
				pointer-events: none;
				position: absolute;
				left: 16px;
				top: -24px;
				font-size: 12px;
				line-height: 16px;
				padding: 2px 4px;
				border: 1px solid !000;
				background: #ffc;
				color: black;
				box-shadow: 2px 2px 2px #fff;
				text-shadow: none;
				white-space: nowrap;
				z-index: 100;
				opacity: 0.8;
			}
			.menuButton:hover .tooltip {
				display: block;
			}
			.menuButton:avtive .tooltip {
				display: none;
			}
			.menuButtonInner {
				will-change: opacity;
			}
			.menuButton:active .zenzaPopupMenu {
				transform: translate(0, -2px);
				transition: none;
			}
			.hoverMenuContainer .menuButton:focus-within {
				pointer-events: none;
			}
			.hoverMenuContainer .menuButton:focus-within .zenzaPopupMenu,
			.hoverMenuContainer .menuButton              .zenzaPopupMenu:hover {
				pointer-events: auto;
				visibility: visible;
				opacity: 0.99;
				pointer-events: auto;
				transition: opacity 0.3s;
			}
			.rightTop .menuButton .tooltip {
				top: auto;
				bottom: -24px;
				right: -16px;
				left: auto;
			}
			.rightBottom .menuButton .tooltip {
				right: 16px;
				left: auto;
			}
			.is-mouseMoving .menuButton {
				opacity: 0.8;
				background: rgba(80, 80, 80, 0.5);
				border: 1px solid #888;
				transition: box-shadow 0.2s ease;
			}
			.is-mouseMoving .menuButton .menuButtonInner {
				opacity: 0.8;
				word-break: normal;
				transition:
					box-shadow 0.2s ease,
					background 0.4s ease;
			}
		.showCommentSwitch {
			left: 0;
			width:  32px;
			height: 32px;
			background:#888;
			color: #000;
			border: 1px solid #666;
			line-height: 30px;
			filter: grayscale(100%);
			border-radius: 4px;
		}
			.is-showComment .showCommentSwitch {
				color: #fff;
				filter: none;
				text-decoration: none;
			}
			.showCommentSwitch .menuButtonInner {
				text-decoration: line-through;
			}
			.is-showComment .showCommentSwitch .menuButtonInner {
				text-decoration: none;
			}
		.menuItemContainer .mylistButton {
			font-size: 21px;
		}
		.mylistButton.mylistAddMenu {
			left: 80px;
			top: 0;
		}
		.mylistButton.deflistAdd {
			left: 120px;
			top: 0;
		}
		.zenzaTweetButton {
			left: 40px;
		}
		@keyframes spinX {
			0%   { transform: rotateX(0deg); }
			100% { transform: rotateX(1800deg); }
		}
		@keyframes spinY {
			0%   { transform: rotateY(0deg); }
			100% { transform: rotateY(1800deg); }
		}
		.is-updatingDeflist .mylistButton.deflistAdd {
			pointer-events: none;
			opacity: 1 !important;
			border: 1px inset !important;
			box-shadow: none !important;
			background: #888 !important;
			color: #000 !important;
			animation-name: spinX;
			animation-iteration-count: infinite;
			animation-duration: 6s;
			animation-timing-function: linear;
		}
		.is-updatingDeflist .mylistButton.deflistAdd .tooltip {
			display: none;
		}
		.mylistButton.mylistAddMenu:focus-within,
		.is-updatingMylist  .mylistButton.mylistAddMenu {
			pointer-events: none;
			opacity: 1 !important;
			border: 1px inset #000 !important;
			color: #000 !important;
			box-shadow: none !important;
		}
		.mylistButton.mylistAddMenu:focus-within {
			background: #888 !important;
		}
		.is-updatingMylist  .mylistButton.mylistAddMenu {
			background: #888 !important;
			color: #000 !important;
			animation-name: spinX;
			animation-iteration-count: infinite;
			animation-duration: 6s;
			animation-timing-function: linear;
		}
		.mylistSelectMenu {
			top: 36px;
			right: -48px;
			padding: 8px 0;
			font-size: 13px;
			backface-visibility: hidden;
		}
		.is-updatingMylist .mylistSelectMenu {
			display: none;
		}
			.mylistSelectMenu .mylistSelectMenuInner {
				overflow-y: auto;
				overflow-x: hidden;
				max-height: 50vh;
				overscroll-behavior: none;
			}
			.mylistSelectMenu .triangle {
				transform: rotate(135deg);
				top: -8.5px;
				right: 55px;
			}
			.mylistSelectMenu ul li {
				line-height: 120%;
				overflow-y: visible;
				border-bottom: none;
			}
			.mylistSelectMenu .mylistIcon {
				display: inline-block;
				width: 18px;
				height: 14px;
				margin: -4px 4px 0 0;
				vertical-align: middle;
				margin-right: 15px;
				background: url("//nicovideo.cdn.nimg.jp/uni/img/zero_my/icon_folder_default.png") no-repeat scroll 0 0 transparent;
				transform: scale(1.5);
				transform-origin: 0 0 0;
				transition: transform 0.1s ease, box-shadow 0.1s ease;
				cursor: pointer;
			}
			.mylistSelectMenu .mylistIcon:hover {
				background-color: #ff9;
				transform: scale(2);
			}
			.mylistSelectMenu .mylistIcon:hover::after {
				background: #fff;
				z-index: 100;
				opacity: 1;
			}
			.mylistSelectMenu .deflist .mylistIcon { background-position: 0 -253px;}
			.mylistSelectMenu .folder1 .mylistIcon { background-position: 0 -23px;}
			.mylistSelectMenu .folder2 .mylistIcon { background-position: 0 -46px;}
			.mylistSelectMenu .folder3 .mylistIcon { background-position: 0 -69px;}
			.mylistSelectMenu .folder4 .mylistIcon { background-position: 0 -92px;}
			.mylistSelectMenu .folder5 .mylistIcon { background-position: 0 -115px;}
			.mylistSelectMenu .folder6 .mylistIcon { background-position: 0 -138px;}
			.mylistSelectMenu .folder7 .mylistIcon { background-position: 0 -161px;}
			.mylistSelectMenu .folder8 .mylistIcon { background-position: 0 -184px;}
			.mylistSelectMenu .folder9 .mylistIcon { background-position: 0 -207px;}
			.mylistSelectMenu .name {
				display: inline-block;
				width: calc(100% - 20px);
				vertical-align: middle;
				font-size: 110%;
				color: #fff;
				text-decoration: none !important;
			}
			.mylistSelectMenu .name:hover {
				color: #fff;
			}
			.mylistSelectMenu .name::after {
				content: ' に登録';
				font-size: 75%;
				color: #333;
			}
			.mylistSelectMenu li:hover .name::after {
				color: #fff;
			}
			.toggleLikeButton {
				transition:
				opacity 0.4s ease,
				box-shadow 0.2s ease 1s,
				transform 0.2s ease 1s;
			}
			.toggleLikeButton:hover {
				text-shadow: 0 0 2px deeppink;
				background: none;
				color: pink;
			}
			.is-liked .toggleLikeButton {
				color: pink;
			}
			.toggleLikeButton .liked-heart {
				display: none;
			}
			.is-liked .toggleLikeButton .liked-heart {
				display: block;
			}
			.is-liked .toggleLikeButton .not-liked-heart {
				display: none;
			}
			.toggleLikeButton .heart-effect {
				position: absolute;
				left: 50%; top: 50%;
				transform: translate(-50%, -50%) scale(5);
				text-shadow: 0 0 3px deeppink;
				color: #fff;
				opacity: 0;
				visibility: hidden;
				transition:
					transform 0.8s ease,
					opacity 0.8s ease,
					visibility 0.8s ease,
					color 0.8s ease;
			}
			.toggleLikeButton:active .heart-effect {
				transition: none;
				transform: translate(-50%, -50%) scale(0.3);
				color: pink;
				opacity: 0.5;
				visibility: visible;
			}
			.zenzaTweetButton:hover {
				text-shadow: 1px 1px 2px #88c;
				background: #1da1f2;
				color: #fff;
			}
		.menuItemContainer .menuButton.closeButton {
			position: absolute;
			font-size: 20px;
			top: 0;
			right: 0;
			z-index: ${CONSTANT.BASE_Z_INDEX + 60000};
			margin: 0 0 40px 40px;
			color: #ccc;
			border: solid 1px #888;
			border-radius: 0;
			transition:
				opacity 0.4s ease,
				transform 0.2s ease,
				background 0.2s ease,
				box-shadow 0.2s ease
					;
			pointer-events: auto;
			transform-origin: center center;
		}
		.is-mouseMoving .closeButton,
		.closeButton:hover {
			opacity: 1;
			background: rgba(0, 0, 0, 0.8);
		}
		.closeButton:hover {
			background: rgba(33, 33, 33, 0.9);
			box-shadow: 4px 4px 4px #000;
		}
		.closeButton:active {
			transform: scale(0.5);
		}
		.menuItemContainer .toggleDebugButton {
			position: relative;
			display: inline-block;
			opacity: 1 !important;
			padding: 8px 16px;
			color: #000;
			box-shadow: none;
			font-size: 21px;
			border: 1px solid black;
			background: rgba(192, 192, 192, 0.8);
			width: auto;
			height: auto;
		}
		.togglePlayMenu {
			display: none;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) scale(1.5);
			width: 80px;
			height: 45px;
			font-size: 35px;
			line-height: 45px;
			border-radius: 8px;
			text-align: center;
			color: var(--base-fore-color);
			z-index: ${CONSTANT.BASE_Z_INDEX + 10};
			background: rgba(0, 0, 0, 0.8);
			transition: transform 0.2s ease, box-shadow 0.2s, text-shadow 0.2s, font-size 0.2s;
			box-shadow: 0 0 2px rgba(255, 255, 192, 0.8);
			cursor: pointer;
		}
		.togglePlayMenu:hover {
			transform: translate(-50%, -50%) scale(1.6);
			text-shadow: 0 0 4px #888;
			box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
		}
		.togglePlayMenu:active {
			transform: translate(-50%, -50%) scale(2.0, 1.2);
			font-size: 30px;
			box-shadow: 0 0 4px inset rgba(0, 0, 0, 0.8);
			text-shadow: none;
			transition: transform 0.1s ease;
		}
		.is-notPlayed .togglePlayMenu {
			display: block;
		}
		.is-playing .togglePlayMenu,
		.is-error   .togglePlayMenu,
		.is-loading .togglePlayMenu {
			display: none;
		}
	`, {className: 'videoHoverMenu'});
util.addStyle(`
	.menuItemContainer.leftBottom {
		bottom: 64px;
	}
	.menuItemContainer.leftBottom .scalingUI {
		transform-origin: left bottom;
	}
	.menuItemContainer.leftBottom .scalingUI {
		height: 64px;
	}
	.menuItemContainer.rightBottom {
		bottom: 64px;
	}
	.ngSettingSelectMenu {
		bottom: 0px;
	}
	`, {className: 'videoHoverMenu screenMode for-full'});
VideoHoverMenu.__tpl__ = (`
		<div class="hoverMenuContainer">
			<div class="menuItemContainer leftTop">
					<div class="menuButton toggleDebugButton" data-command="toggle-debug">
						<div class="menuButtonInner">debug mode</div>
					</div>
			</div>
			<div class="menuItemContainer rightTop">
				<div class="scalingUI">
					<div class="menuButton toggleLikeButton forMember" data-command="toggle-like">
						<div class="tooltip">いいね！</div>
						<div class="menuButtonInner"><div class="not-liked-heart"
							>♡</div><div class="liked-heart"
							>♥</div><div class="heart-effect">♡</div></div>
					</div>
					<div class="menuButton zenzaTweetButton" data-command="tweet">
						<div class="tooltip">ツイート</div>
						<div class="menuButtonInner">t</div>
					</div>
					<div class="menuButton mylistButton mylistAddMenu forMember"
						data-command="nop" tabindex="-1" data-has-submenu="1">
						<div class="tooltip">マイリスト登録</div>
						<div class="menuButtonInner">My</div>
						<div class="mylistSelectMenu selectMenu zenzaPopupMenu forMember">
							<div class="triangle"></div>
							<div class="mylistSelectMenuInner">
							</div>
						</div>
					</div>
					<div class="menuButton mylistButton deflistAdd forMember" data-command="deflistAdd">
						<div class="tooltip">とりあえずマイリスト(T)</div>
						<div class="menuButtonInner">&#x271A;</div>
					</div>
					<div class="menuButton closeButton" data-command="close">
						<div class="menuButtonInner">&#x2716;</div>
					</div>
				</div>
			</div>
			<div class="menuItemContainer leftBottom">
				<div class="scalingUI">
					<div class="showCommentSwitch menuButton" data-command="toggle-showComment">
						<div class="tooltip">コメント表示ON/OFF(V)</div>
						<div class="menuButtonInner">💬</div>
					</div>
				</div>
			</div>
			<div class="menuItemContainer onErrorMenu">
				<div class="menuButton openGinzaMenu" data-command="openGinza">
					<div class="menuButtonInner">GINZAで視聴</div>
				</div>
				<div class="menuButton reloadMenu for-nicovideo" data-command="reload">
					<div class="menuButtonInner for-nicovideo">リロード</div>
					<div class="menuButtonInner for-ZenTube">ZenTube解除</div>
				</div>
				<div class="menuButton playNextVideo" data-command="playNextVideo">
					<div class="menuButtonInner">次の動画</div>
				</div>
			</div>
			<div class="togglePlayMenu menuItemContainer center" data-command="togglePlay">
				▶
			</div>
		</div>
	`).trim();
class VariablesMapper {
	get nextState() {
		const {menuScale, commentLayerOpacity, fullscreenControlBarMode} = this.config.props;
		return {menuScale, commentLayerOpacity, fullscreenControlBarMode};
	}
	get videoControlBarHeight() {
		return(
			(VideoControlBar.BASE_HEIGHT - VideoControlBar.BASE_SEEKBAR_HEIGHT) *
				this.state.menuScale + VideoControlBar.BASE_SEEKBAR_HEIGHT);
	}
	constructor({config, element}){
		this.config = config;
		this.state = {
			menuScale: 0,
			commentLayerOpacity: 0,
			fullscreenControlBarMode: 'auto'
		};
		this.element = element || document.body;
		this.emitter = new Emitter();
		const update = _.debounce(this.update.bind(this), 500);
		Object.keys(this.state).forEach(key =>
			config.onkey(key, () => update(key)));
		update();
	}
	on(...args) {
		this.emitter.on(...args);
	}
	shouldUpdate(state, nextState) {
		return Object.keys(state).some(key => state[key] !== nextState[key]);
	}
	setVar(key, value) {
		cssUtil.setProps([this.element, key, value]); }
	update() {
		const state = this.state;
		const nextState = this.nextState;
		if (!this.shouldUpdate(state, nextState)) {
			return;
		}
		const {menuScale, commentLayerOpacity, fullscreenControlBarMode} = nextState;
		this.state = nextState;
		Object.assign(this.element.dataset, {fullscreenControlBarMode});
		if (state.scale !== menuScale) {
			this.setVar('--zenza-ui-scale', menuScale);
			this.setVar('--zenza-control-bar-height', css.px(this.videoControlBarHeight));
		}
		if (state.commentLayerOpacity !== commentLayerOpacity) {
			this.setVar('--zenza-comment-layer-opacity', commentLayerOpacity);
		}
		this.emitter.emit('update', nextState);
	}
}

const RootDispatcher = (() => {
	let config;
	let player;
	let playerState;
	class RootDispatcher {
		static initialize(dialog) {
			player = dialog;
			playerState = ZenzaWatch.state.player;
			config = PlayerConfig.getInstance(config);
			config.on('update', RootDispatcher.onConfigUpdate);
			player.on('command', RootDispatcher.execCommand);
		}
		static execCommand(command, params) {
			let result = {status: 'ok'};
			switch(command) {
				case 'notifyHtml':
					PopupMessage.notify(params, true);
					break;
				case 'notify':
					PopupMessage.notify(params);
					break;
				case 'alert':
					PopupMessage.alert(params);
					break;
				case 'alertHtml':
					PopupMessage.alert(params, true);
					break;
				case 'copy-video-watch-url':
					Clipboard.copyText(playerState.videoInfo.watchUrl);
					break;
				case 'tweet':
					nicoUtil.openTweetWindow(playerState.videoInfo);
					break;
				case 'export-config':
					config.exportToFile();
					break;
				case 'toggleConfig': {
					config.props[params] = !config.props[params];
					break;
				}
				case 'picture-in-picture':
					document.querySelector('.zenzaWatchVideoElement').requestPictureInPicture();
					break;
				case 'toggle-comment':
				case 'toggle-showComment':
				case 'toggle-backComment':
				case 'toggle-mute':
				case 'toggle-loop':
				case 'toggle-debug':
				case 'toggle-enableFilter':
				case 'toggle-enableNicosJumpVideo':
				case 'toggle-useWellKnownPort':
				case 'toggle-bestZenTube':
				case 'toggle-autoCommentSpeedRate':
				case 'toggle-video.hls.enableOnlyRequired':
					command = command.replace(/^toggle-/, '');
					config.props[command] = !config.props[command];
					break;
				case 'baseFontFamily':
				case 'baseChatScale':
				case 'enableFilter':
				case 'update-enableFilter':
				case 'screenMode':
				case 'update-screenMode':
				case 'update-sharedNgLevel':
				case 'update-commentSpeedRate':
				case 'update-fullscreenControlBarMode':
					command = command.replace(/^update-/, '');
					if (config.props[command] === params) {
						break;
					}
					config.props[command] = params;
					break;
				case 'nop':
					break;
				case 'echo':
					window.console.log('%cECHO', 'font-weight: bold;', {params});
					PopupMessage.notify(`ECHO: 「${typeof params === 'string' ? params : JSON.stringify(params)}」`);
					break;
				default:
					ZenzaWatch.emitter.emit(`command-${command}`, command, params);
					window.dispatchEvent(new CustomEvent(`${PRODUCT}-command`, {detail: {command, params, param: params}}));
			}
			return result;
		}
		static onConfigUpdate(key, value) {
			switch (key) {
				case 'enableFilter':
					playerState.isEnableFilter = value;
					break;
				case 'backComment':
					playerState.isBackComment = !!value;
					break;
				case 'showComment':
					playerState.isShowComment = !!value;
					break;
				case 'loop':
					playerState.isLoop = !!value;
					break;
				case 'mute':
					playerState.isMute = !!value;
					break;
				case 'debug':
					playerState.isDebug = !!value;
					PopupMessage.notify('debug: ' + (value ? 'ON' : 'OFF'));
					break;
				case 'sharedNgLevel':
				case 'screenMode':
				case 'playbackRate':
					playerState[key] = value;
					break;
			}
		}
	}
	return RootDispatcher;
})();

class CommentInputPanel extends Emitter {
	constructor(params) {
		super();
		this._$playerContainer = params.$playerContainer;
		this.config = params.playerConfig;
		this._initializeDom();
		this.config.onkey('autoPauseCommentInput', this._onAutoPauseCommentInputChange.bind(this));
	}
	_initializeDom() {
		let $container = this._$playerContainer;
		let config = this.config;
		css.addStyle(CommentInputPanel.__css__);
		$container.append(uq.html(CommentInputPanel.__tpl__));
		let $view = this._$view = $container.find('.commentInputPanel');
		let $input = this._$input = $view.find('.commandInput, .commentInput');
		this._$form = $container.find('form');
		let $autoPause = this._$autoPause = $container.find('.autoPause');
		this._$commandInput = $container.find('.commandInput');
		let $cmt = this._$commentInput = $container.find('.commentInput');
		this._$commentSubmit = $container.find('.commentSubmit');
		let preventEsc = e => {
			if (e.keyCode === 27) { // ESC
				e.preventDefault();
				e.stopPropagation();
				this.emit('esc');
				e.target.blur();
			}
		};
		$input
			.on('focus', this._onFocus.bind(this))
			.on('blur', _.debounce(this._onBlur.bind(this), 500))
			.on('keydown', preventEsc)
			.on('keyup', preventEsc);
		$autoPause.prop('checked', config.props.autoPauseCommentInput);
		this._$autoPause.on('change', () => {
			config.props.autoPauseCommentInput = !!$autoPause.prop('checked');
			$cmt.focus();
		});
		this._$view.find('label').on('click', e => e.stopPropagation());
		this._$form.on('submit', this._onSubmit.bind(this));
		this._$commentSubmit.on('click', this._onSubmitButtonClick.bind(this));
		$view.on('click', e => e.stopPropagation()).on('paste', e => e.stopPropagation());
	}
	_onFocus() {
		if (!this._hasFocus) {
			this.emit('focus', this.isAutoPause);
		}
		this._hasFocus = true;
	}
	_onBlur() {
		if (this._$commandInput.hasFocus() || this._$commentInput.hasFocus()) {
			return;
		}
		this.emit('blur', this.isAutoPause);
		this._hasFocus = false;
	}
	_onSubmit() {
		this.submit();
	}
	_onSubmitButtonClick() {
		this.submit();
	}
	_onAutoPauseCommentInputChange(val) {
		this._$autoPause.prop('checked', !!val);
	}
	submit() {
		let chat = this._$commentInput.val().trim();
		let cmd = this._$commandInput.val().trim();
		if (!chat.length) {
			return;
		}
		setTimeout(() => {
			this._$commentInput.val('').blur();
			this._$commandInput.blur();
			let $view = this._$view.addClass('updating');
			(new Promise((resolve, reject) => this.emit('post', {resolve, reject}, chat, cmd)))
				.then(() => $view.removeClass('updating'))
				.catch(() => $view.removeClass('updating'));
		}, 0);
	}
	get isAutoPause() {
		return this.config.props.autoPauseCommentInput;
	}
	focus() {
		this._$commentInput.focus();
		this._onFocus();
	}
	blur() {
		this._$commandInput.blur();
		this._$commentInput.blur();
		this._onBlur();
	}
}
CommentInputPanel.__css__ = (`
	.commentInputPanel {
		position: fixed;
		top:  calc(-50vh + 50% + 100vh);
		left: 50vw;
		box-sizing: border-box;
		width: 200px;
		height: 50px;
		z-index: ${CONSTANT.BASE_Z_INDEX + 30000};
		transform: translate(-50%, -170px);
		overflow: visible;
	}
	.is-notPlayed .commentInputPanel,
	.is-waybackMode .commentInputPanel,
	.is-mymemory .commentInputPanel,
	.is-loading  .commentInputPanel,
	.is-error    .commentInputPanel {
		display: none;
	}
	.commentInputPanel:focus-within {
		width: 500px;
		z-index: ${CONSTANT.BASE_Z_INDEX + 100000};
	}
	.zenzaScreenMode_wide .commentInputPanel,
	.is-fullscreen           .commentInputPanel {
		position: absolute !important; /* fixedだとFirefoxのバグで消える */
		top:  auto !important;
		bottom: 120px !important;
		transform: translate(-50%, 0);
		left: 50%;
	}
	.commentInputPanel>* {
		pointer-events: none;
	}
	.commentInputPanel input {
		font-size: 18px;
	}
	.commentInputPanel:focus-within>*,
	.commentInputPanel:hover>* {
		pointer-events: auto;
	}
	.is-mouseMoving .commentInputOuter {
		border: 1px solid #888;
		box-sizing: border-box;
		border-radius: 8px;
		opacity: 0.5;
	}
	.is-mouseMoving:not(:focus-within) .commentInputOuter {
		box-shadow: 0 0 8px #fe9, 0 0 4px #fe9 inset;
	}
	.commentInputPanel:focus-within .commentInputOuter,
	.commentInputPanel:hover  .commentInputOuter {
		border: none;
		opacity: 1;
	}
	.commentInput {
		width: 100%;
		height: 30px !important;
		font-size: 24px;
		background: transparent;
		border: none;
		opacity: 0;
		transition: opacity 0.3s ease, box-shadow 0.4s ease;
		text-align: center;
		line-height: 26px !important;
		padding-right: 32px !important;
		margin-bottom: 0 !important;
	}
	.commentInputPanel:hover  .commentInput {
		opacity: 0.5;
	}
	.commentInputPanel:focus-within .commentInput {
		opacity: 0.9 !important;
	}
	.commentInputPanel:focus-within .commentInput,
	.commentInputPanel:hover  .commentInput {
		box-sizing: border-box;
		border: 1px solid #888;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 0 8px #fff;
	}
	.commentInputPanel .autoPauseLabel {
		display: none;
	}
	.commentInputPanel:focus-within .autoPauseLabel {
		position: absolute;
		top: 36px;
		left: 50%;
		transform: translate(-50%, 0);
		display: block;
		background: #336;
		z-index: 100;
		color: #ccc;
		padding: 0 8px;
	}
	.commandInput {
		position: absolute;
		width: 100px;
		height: 30px !important;
		font-size: 24px;
		top: 0;
		left: 0;
		border-radius: 8px;
		z-index: -1;
		opacity: 0;
		transition: left 0.2s ease, opacity 0.2s ease;
		text-align: center;
		line-height: 26px !important;
		padding: 0 !important;
		margin-bottom: 0 !important;
	}
	.commentInputPanel:focus-within .commandInput {
		left: -108px;
		z-index: 1;
		opacity: 0.9;
		border: none;
		pointer-evnets: auto;
		box-shadow: 0 0 8px #fff;
		padding: 0;
	}
	.commentSubmit {
		position: absolute;
		width: 100px !important;
		height: 30px !important;
		font-size: 24px;
		top: 0;
		right: 0;
		border: none;
		border-radius: 8px;
		z-index: -1;
		opacity: 0;
		transition: right 0.2s ease, opacity 0.2s ease;
		line-height: 26px;
		letter-spacing: 0.2em;
	}
	.commentInputPanel:focus-within .commentSubmit {
		right: -108px;
		z-index: 1;
		opacity: 0.9;
		box-shadow: 0 0 8px #fff;
	}
	.commentInputPanel:focus-within .commentSubmit:active {
		color: #000;
		background: #fff;
		box-shadow: 0 0 16px #ccf;
	}
`).trim();
CommentInputPanel.__tpl__ = (`
	<div class="commentInputPanel forMember" autocomplete="new-password">
		<form action="javascript: void(0);">
			<div class="commentInputOuter">
				<input
					type="text"
					value=""
					autocomplete="on"
					name="mail"
					placeholder="コマンド"
					class="commandInput"
					maxlength="30"
				>
				<input
					type="text"
					value=""
					autocomplete="off"
					name="chat"
					accesskey="c"
					placeholder="コメント入力(C)"
					class="commentInput"
					maxlength="75"
					>
				<input
					type="submit"
					value="送信"
					name="post"
					class="commentSubmit"
					>
				<div class="recButton" title="音声入力">
				</div>
		</div>
		</form>
		<label class="autoPauseLabel">
			<input type="checkbox" class="autoPause" checked="checked">
			入力時に一時停止
		</label>
	</div>
`).trim();

class TagListView extends BaseViewComponent {
	constructor({parentNode}) {
		super({
			parentNode,
			name: 'TagListView',
			template: '<div class="TagListView"></div>',
			shadow: TagListView.__shadow__,
			css: TagListView.__css__
		});
		this._state = {
			isInputing: false,
			isUpdating: false,
			isEditing: false
		};
		this._tagEditApi = new TagEditApi();
	}
	_initDom(...args) {
		super._initDom(...args);
		const v = this._shadow || this._view;
		Object.assign(this._elm, {
			videoTags: v.querySelector('.videoTags'),
			videoTagsInner: v.querySelector('.videoTagsInner'),
			tagInput: v.querySelector('.tagInputText'),
			form: v.querySelector('form')
		});
		this._elm.tagInput.addEventListener('keydown', this._onTagInputKeyDown.bind(this));
		this._elm.form.addEventListener('submit', this._onTagInputSubmit.bind(this));
		v.addEventListener('keydown', e => {
			if (this._state.isInputing) {
				e.stopPropagation();
			}
		});
		v.addEventListener('click', e => e.stopPropagation());
		ZenzaWatch.emitter.on('hideHover', () => {
			if (this._state.isEditing) {
				this._endEdit();
			}
		});
	}
	_onCommand(command, param) {
		switch (command) {
			case 'refresh':
				this._refreshTag();
				break;
			case 'toggleEdit':
				if (this._state.isEditing) {
					this._endEdit();
				} else {
					this._beginEdit();
				}
				break;
			case 'toggleInput':
				if (this._state.isInputing) {
					this._endInput();
				} else {
					this._beginInput();
				}
				break;
			case 'beginInput':
				this._beginInput();
				break;
			case 'endInput':
				this._endInput();
				break;
			case 'addTag':
				this._addTag(param);
				break;
			case 'removeTag': {
				let elm = this._elm.videoTags.querySelector(`.tagItem[data-tag-id="${param}"]`);
				if (!elm) {
					return;
				}
				elm.classList.add('is-Removing');
				let data = JSON.parse(elm.getAttribute('data-tag'));
				this._removeTag(param, data.tag);
				break;
			}
			case 'tag-search':
				this._onTagSearch(param);
				break;
			default:
				super._onCommand(command, param);
				break;
		}
	}
	_onTagSearch(word) {
		const config = Config.namespace('videoSearch');
		let option = {
			searchType: config.getValue('mode'),
			order: config.getValue('order'),
			sort: config.getValue('sort') || 'playlist',
			owner: config.getValue('ownerOnly')
		};
		if (option.sort === 'playlist') {
			option.sort = 'f';
			option.playlistSort = true;
		}
		super._onCommand('playlistSetSearchVideo', {word, option});
	}
	update({tagList = [], watchId = null, videoId = null, token = null, watchAuthKey = null}) {
		if (watchId) {
			this._watchId = watchId;
		}
		if (videoId) {
			this._videoId = videoId;
		}
		if (token) {
			this._token = token;
		}
		if (watchAuthKey) {
			this._watchAuthKey = watchAuthKey;
		}
		this.setState({
			isInputing: false,
			isUpdating: false,
			isEditing: false,
			isEmpty: false
		});
		this._update(tagList);
		this._boundOnBodyClick = this._onBodyClick.bind(this);
	}
	_onClick(e) {
		if (this._state.isInputing || this._state.isEditing) {
			e.stopPropagation();
		}
		super._onClick(e);
	}
	_update(tagList = []) {
		let tags = [];
		tagList.forEach(tag => {
			tags.push(this._createTag(tag));
		});
		tags.push(this._createToggleInput());
		this.setState({isEmpty: tagList.length < 1});
		this._elm.videoTagsInner.innerHTML = tags.join('');
	}
	_createToggleInput() {
		return (`
				<div
					class="button command toggleInput"
					data-command="toggleInput"
					data-tooltip="タグ追加">
					<span class="icon">&#8853;</span>
				</div>`).trim();
	}
	_onApiResult(watchId, result) {
		if (watchId !== this._watchId) {
			return; // 通信してる間に動画変わったぽい
		}
		const err = result.error_msg;
		if (err) {
			this.emit('command', 'alert', err);
		}
		this.update(result.tags);
	}
	_addTag(tag) {
		this.setState({isUpdating: true});
		const wait3s = this._makeWait(3000);
		const watchId = this._watchId;
		const videoId = this._videoId;
		const csrfToken = this._token;
		const watchAuthKey = this._watchAuthKey;
		const addTag = () => {
			return this._tagEditApi.add({
				videoId,
				tag,
				csrfToken,
				watchAuthKey
			});
		};
		return Promise.all([addTag(), wait3s]).then(results => {
			let result = results[0];
			if (watchId !== this._watchId) {
				return;
			} // 待ってる間に動画が変わったぽい
			if (result && result.tags) {
				this._update(result.tags);
			}
			this.setState({isInputing: false, isUpdating: false, isEditing: false});
			if (result.error_msg) {
				this.emit('command', 'alert', result.error_msg);
			}
		});
	}
	_removeTag(tagId, tag = '') {
		this.setState({isUpdating: true});
		const wait3s = this._makeWait(3000);
		const watchId = this._watchId;
		const videoId = this._videoId;
		const csrfToken = this._token;
		const watchAuthKey = this._watchAuthKey;
		const removeTag = () => {
			return this._tagEditApi.remove({
				videoId,
				tag,
				id: tagId,
				csrfToken,
				watchAuthKey
			});
		};
		return Promise.all([removeTag(), wait3s]).then((results) => {
			let result = results[0];
			if (watchId !== this._watchId) {
				return;
			} // 待ってる間に動画が変わったぽい
			if (result && result.tags) {
				this._update(result.tags);
			}
			this.setState({isUpdating: false});
			if (result.error_msg) {
				this.emit('command', 'alert', result.error_msg);
			}
		});
	}
	_refreshTag() {
		this.setState({isUpdating: true});
		const watchId = this._watchId;
		const wait1s = this._makeWait(1000);
		const load = () => {
			return this._tagEditApi.load(this._videoId);
		};
		return Promise.all([load(), wait1s]).then((results) => {
			let result = results[0];
			if (watchId !== this._watchId) {
				return;
			} // 待ってる間に動画が変わったぽい
			this._update(result.tags);
			this.setState({isUpdating: false, isInputing: false, isEditing: false});
		});
	}
	_makeWait(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(ms);
			}, ms);
		});
	}
	_createDicIcon(text, hasDic) {
		let href = `https://dic.nicovideo.jp/a/${encodeURIComponent(text)}`;
		let src = hasDic ?
			'https://live.nicovideo.jp/img/2012/watch/tag_icon002.png' :
			'https://live.nicovideo.jp/img/2012/watch/tag_icon003.png' ;
		let icon = `<img class="dicIcon" src="${src}">`;
		let hasNicodic = hasDic ? 1 : 0;
		return (
			`<zenza-tag-item-menu
				class="tagItemMenu"
				data-text="${encodeURIComponent(text)}"
				data-has-nicodic="${hasNicodic}"
			><a target="_blank" class="nicodic" href="${href}">${icon}</a></zenza-tag-item-menu>`
		);
	}
	_createDeleteButton(id) {
		return `<span target="_blank" class="deleteButton command" title="削除" data-command="removeTag" data-param="${id}">ー</span>`;
	}
	_createLink(text) {
		let href = `//www.nicovideo.jp/tag/${encodeURIComponent(text)}`;
		text = textUtil.escapeToZenkaku(textUtil.unescapeHtml(text));
		return `<a class="tagLink" href="${href}">${text}</a>`;
	}
	_createSearch(text) {
		let title = 'プレイリストに追加';
		let command = 'tag-search';
		let param = textUtil.escapeHtml(text);
		return (`<zenza-playlist-append class="playlistAppend" title="${title}" data-command="${command}" data-param="${param}">▶</zenza-playlist-append>`);
	}
	_createTag(tag) {
		let text = tag.tag;
		let dic = this._createDicIcon(text, !!tag.dic);
		let del = this._createDeleteButton(tag.id);
		let link = this._createLink(text);
		let search = this._createSearch(text);
		let data = textUtil.escapeHtml(JSON.stringify(tag));
		let className = (tag.lock || tag.owner_lock === 1 || tag.lck === '1') ? 'tagItem is-Locked' : 'tagItem';
		className = (tag.cat) ? `${className} is-Category` : className;
		return `<li class="${className}" data-tag="${data}" data-tag-id="${tag.id}">${dic}${del}${link}${search}</li>`;
	}
	_onTagInputKeyDown(e) {
		if (this._state.isUpdating) {
			e.preventDefault();
			e.stopPropagation();
		}
		switch (e.keyCode) {
			case 27: // ESC
				e.preventDefault();
				e.stopPropagation();
				this._endInput();
				break;
		}
	}
	_onTagInputSubmit(e) {
		if (this._state.isUpdating) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		let val = (this._elm.tagInput.value || '').trim();
		if (!val) {
			this._endInput();
			return;
		}
		this._onCommand('addTag', val);
		this._elm.tagInput.value = '';
	}
	_onBodyClick() {
		this._endInput();
		this._endEdit();
	}
	_beginEdit() {
		this.setState({isEditing: true});
		document.body.addEventListener('click', this._boundOnBodyClick);
	}
	_endEdit() {
		document.body.removeEventListener('click', this._boundOnBodyClick);
		this.setState({isEditing: false});
	}
	_beginInput() {
		this.setState({isInputing: true});
		document.body.addEventListener('click', this._boundOnBodyClick);
		this._elm.tagInput.value = '';
		window.setTimeout(() => {
			this._elm.tagInput.focus();
		}, 100);
	}
	_endInput() {
		this._elm.tagInput.blur();
		document.body.removeEventListener('click', this._boundOnBodyClick);
		this.setState({isInputing: false});
	}
}
TagListView.__shadow__ = (`
		<style>
			:host-context(.videoTagsContainer.sideTab) .tagLink {
				color: #000 !important;
				text-decoration: none;
			}
			.TagListView {
				position: relative;
				user-select: none;
			}
			.TagListView.is-Updating {
				cursor: wait;
			}
			:host-context(.videoTagsContainer.sideTab) .TagListView.is-Updating {
				overflow: hidden;
			}
			.TagListView.is-Updating:after {
				content: '${'\\0023F3'}';
				position: absolute;
				top: 50%;
				left: 50%;
				text-align: center;
				transform: translate(-50%, -50%);
				z-index: 10001;
				color: #fe9;
				font-size: 24px;
				letter-spacing: 3px;
				text-shadow: 0 0 4px #000;
				pointer-events: none;
			}
			.TagListView.is-Updating:before {
				content: ' ';
				background: rgba(0, 0, 0, 0.6);
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 100%;
				height: 100%;
				padding: 8px;
				z-index: 10000;
				box-shadow: 0 0 8px #000;
				border-radius: 8px;
				pointer-events: none;
			}
			.TagListView.is-Updating * {
				pointer-events: none;
			}
			*[data-tooltip] {
				position: relative;
			}
			.TagListView .button {
				position: relative;
				display: inline-block;
				min-width: 40px;
				min-height: 24px;
				cursor: pointer;
				user-select: none;
				transition: 0.2s transform, 0.2s box-shadow, 0.2s background;
				text-align: center;
			}
			.TagListView .button:hover {
				background: #666;
			}
			.TagListView .button:active {
				transition: none;
				box-shadow: 0 0 2px #000 inset;
			}
			.TagListView .button .icon {
				position: absolute;
				display: inline-block;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
			.TagListView *[data-tooltip]:hover:after {
				content: attr(data-tooltip);
				position: absolute;
				left: 50%;
				bottom: 100%;
				transform: translate(-50%, 0) scale(0.9);
				pointer-events: none;
				background: rgba(192, 192, 192, 0.9);
				box-shadow: 0 0 4px #000;
				color: black;
				font-size: 12px;
				margin: 0;
				padding: 2px 4px;
				white-space: nowrap;
				z-index: 10000;
				letter-spacing: 2px;
			}
			.videoTags {
				display: inline-block;
				padding: 0;
			}
			.videoTagsInner {
				display: flex;
				flex-wrap: wrap;
				padding: 0 8px;
			}
			.TagListView .tagItem {
				position: relative;
				list-style-type: none;
				display: inline-flex;
				margin-right: 2px;
				line-height: 20px;
				max-width: 50vw;
				align-items: center;
			}
			.TagListView .tagItem:first-child {
				margin-left: 100px;
			}
			.tagLink {
				color: #fff;
				text-decoration: none;
				user-select: none;
				display: inline-block;
				border: 1px solid rgba(0, 0, 0, 0);
			}
			.TagListView .nicodic {
				display: inline-block;
				margin-right: 4px;
				line-height: 20px;
				cursor: pointer;
				vertical-align: middle;
			}
			.TagListView.is-Editing .tagItemMenu,
			.TagListView.is-Editing .nicodic,
			.TagListView:not(.is-Editing) .deleteButton {
				display: none !important;
			}
			.TagListView .deleteButton {
				display: inline-block;
				margin: 0px;
				line-height: 20px;
				width: 20px;
				height: 20px;
				font-size: 16px;
				background: #f66;
				color: #fff;
				cursor: pointer;
				border-radius: 100%;
				transition: transform 0.2s, background 0.4s;
				text-shadow: none;
				transform: scale(1.2);
				text-align: center;
				opacity: 0.8;
			}
			.TagListView.is-Editing .deleteButton:hover {
				transform: rotate(0) scale(1.2);
				background: #f00;
				opacity: 1;
			}
			.TagListView.is-Editing .deleteButton:active {
				transform: rotate(360deg) scale(1.2);
				transition: none;
				background: #888;
			}
			.TagListView.is-Editing .is-Locked .deleteButton {
				visibility: hidden;
			}
			.TagListView .is-Removing .deleteButton {
				background: #666;
			}
			.tagItem .playlistAppend {
				display: inline-block;
				position: relative;
				left: auto;
				bottom: auto;
			}
			.TagListView .tagItem .playlistAppend {
				display: inline-block;
				font-size: 16px;
				line-height: 24px;
				width: 24px;
				height: 24px;
				bottom: 4px;
				background: #666;
				color: #ccc;
				text-decoration: none;
				border: 1px outset;
				cursor: pointer;
				text-align: center;
				user-select: none;
				visibility: hidden;
				margin-right: -2px;
			}
			.tagItem:hover .playlistAppend {
				visibility: visible;
			}
			.tagItem:hover .playlistAppend:hover {
				transform: scale(1.5);
			}
			.tagItem:hover .playlistAppend:active {
				transform: scale(1.4);
			}
			.tagItem.is-Removing {
				transform-origin: right !important;
				transform: translate(0, 150vh) !important;
				opacity: 0 !important;
				max-width: 0 !important;
				transition:
					transform 2s ease 0.2s,
					opacity 1.5s linear 0.2s,
					max-width 0.5s ease 1.5s
				!important;
				pointer-events: none;
				overflow: hidden !important;
				white-space: nowrap;
			}
			.is-Editing .playlistAppend {
				visibility: hidden !important;
			}
			.is-Editing .tagLink {
				pointer-events: none;
			}
			.is-Editing .dicIcon {
				display: none;
			}
			.tagItem:not(.is-Locked) {
				transition: transform 0.2s, text-shadow 0.2s;
			}
			.is-Editing .tagItem.is-Locked {
				position: relative;
				cursor: not-allowed;
			}
			.is-Editing .tagItem.is-Locked *{
				pointer-events: none;
			}
			.is-Editing .tagItem.is-Locked:hover:after {
				content: '${'\\01F6AB'} ロックタグ';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				color: #ff9;
				white-space: nowrap;
				background: rgba(0, 0, 0, 0.6);
			}
			.is-Editing .tagItem:nth-child(11).is-Locked:hover:after {
				content: '${'\\01F6AB'} ロックマン';
			}
			.is-Editing .tagItem:not(.is-Locked) {
				text-shadow: 0 4px 4px rgba(0, 0, 0, 0.8);
			}
			.is-Editing .tagItem.is-Category * {
				color: #ff9;
			}
			.is-Editing .tagItem.is-Category.is-Locked:hover:after {
				content: '${'\\01F6AB'} カテゴリタグ';
			}
			.tagInputContainer {
				display: none;
				padding: 4px 8px;
				background: #666;
				z-index: 5000;
				box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
				font-size: 16px;
			}
			:host-context(.videoTagsContainer.sideTab)     .tagInputContainer {
				position: absolute;
				background: #999;
			}
			.tagInputContainer .tagInputText {
				width: 200px;
				font-size: 20px;
			}
			.tagInputContainer .submit {
				font-size: 20px;
			}
			.is-Inputing .tagInputContainer {
				display: inline-block;
			}
			.is-Updating .tagInputContainer {
				pointer-events: none;
			}
				.tagInput {
					border: 1px solid;
				}
				.tagInput:active {
					box-shadow: 0 0 4px #fe9;
				}
				.submit, .cancel {
					background: #666;
					color: #ccc;
					cursor: pointer;
					border: 1px solid;
					text-align: center;
				}
			.TagListView .tagEditContainer {
				position: absolute;
				left: 0;
				top: 0;
				z-index: 1000;
				display: inline-block;
			}
			.TagListView.is-Empty .tagEditContainer {
				position: relative;
			}
			.TagListView:hover .tagEditContainer {
				display: inline-block;
			}
			.TagListView.is-Updating .tagEditContainer * {
				pointer-events: none;
			}
			.TagListView .tagEditContainer .button,
			.TagListView .videoTags .button {
				border-radius: 16px;
				font-size: 24px;
				line-height: 24px;
				margin: 0;
			}
			.TagListView.is-Editing .button.toggleEdit,
			.TagListView .button.toggleEdit:hover {
				background: #c66;
			}
			.TagListView .button.tagRefresh .icon {
				transform: translate(-50%, -50%) rotate(90deg);
				transition: transform 0.2s ease;
				font-family: STIXGeneral;
			}
			.TagListView .button.tagRefresh:active .icon {
				transform: translate(-50%, -50%) rotate(-330deg);
				transition: none;
			}
			.TagListView.is-Inputing .button.toggleInput {
				display: none;
			}
			.TagListView  .button.toggleInput:hover {
				background: #66c;
			}
			.tagEditContainer form {
				display: inline;
			}
		</style>
		<div class="root TagListView">
			<div class="tagEditContainer">
				<div
					class="button command toggleEdit"
					data-command="toggleEdit"
					data-tooltip="タグ編集">
					<span class="icon">&#9999;</span>
				</div>
				<div class="button command tagRefresh"
					data-command="refresh"
					data-tooltip="リロード">
					<span class="icon">&#8635;</span>
				</div>
			</div>
			<div class="videoTags">
				<span class="videoTagsInner"></span>
				<div class="tagInputContainer">
					<form action="javascript: void">
						<input type="text" name="tagText" class="tagInputText">
						<button class="submit button">O K</button>
					</form>
				</div>
			</div>
		</div>
	`).trim();
TagListView.__css__ = (`
		/* Firefox用 ShaowDOMサポートしたら不要 */
		.videoTagsContainer.sideTab .is-Updating {
			overflow: hidden;
		}
		.videoTagsContainer.sideTab a {
			color: #000 !important;
			text-decoration: none !important;
		}
		.videoTagsContainer.videoHeader a {
			color: #fff !important;
			text-decoration: none !important;
		}
		.videoTagsContainer.sideTab .tagInputContainer {
			position: absolute;
		}
	`).trim();
class TagItemMenu extends HTMLElement {
	static template({text}) {
		let host = location.host;
		return `
			<style>
				.root {
					display: inline-block;
					--icon-size: 16px;
					margin-right: 4px;
					outline: none;
				}
				.icon {
					position: relative;
					display: inline-block;
					vertical-align: middle;
					box-sizing: border-box;
					width: var(--icon-size);
					height: var(--icon-size);
					margin: 0;
					padding: 0;
					font-size: var(--icon-size);
					line-height: calc(var(--icon-size));
					text-align: center;
					cursor: pointer;
				}
				.nicodic, .toggle {
					background: #888;
					color: #ccc;
					box-shadow: 0.1em 0.1em 0 #333;
				}
				.has-nicodic .nicodic,.has-nicodic .toggle {
					background: #900;
				}
				.toggle::after {
					content: '？';
					position: absolute;
					width: var(--icon-size);
					left: 0;
					font-size: 0.8em;
					font-weight: bolder;
				}
				.menu {
					display: none;
					position: fixed;
					background-clip: content-box;
					border-style: solid;
					border-width: 16px 0 16px 0;
					border-color: transparent;
					padding: 0;
					z-index: 100;
					transform: translateY(-30px);
				}
				:host-context(.zenzaWatchVideoInfoPanelFoot) .menu {
					position: absolute;
					bottom: 0;
					transform: translateY(8x);
				}
				.root .menu:hover,
				.root:focus-within .menu {
					display: inline-block;
				}
				li {
					list-style-type: none;
					padding: 2px 8px 2px 20px;
					background: rgba(80, 80, 80, 0.95);
				}
				li a {
					display: inline-block;
					white-space: nowrap;
					text-decoration: none;
					color: #ccc;
				}
				li a:hover {
					text-decoration: underline;
				}
			</style>
			<div class="root" tabindex="-1">
				<div class="icon toggle"></div>
				<ul class="menu">
					<li>
						<a href="//dic.nicovideo.jp/a/${text}"
							${host !== 'dic.nicovideo.jp' ? 'target="_blank"' : ''}>
							大百科を見る
						</a>
					</li>
					<li>
						<a href="//ch.nicovideo.jp/search/${text}?type=video&mode=t"
							${host !== 'ch.nicovideo.jp' ? 'target="_blank"' : ''}>
							チャンネル検索
						</a>
					</li>
					<li>
						<a href="https://www.google.co.jp/search?q=${text}%20site:www.nicovideo.jp&num=100&tbm=vid"
							${host !== 'www.google.co.jp' ? 'target="_blank"' : ''}>
							Googleで検索
						</a>
					</li>
					<li>
						<a href="https://www.bing.com/videos/search?q=${text}%20site:www.nicovideo.jp&qft=+filterui:msite-nicovideo.jp"
							${host !== 'www.bing.com' ? 'target="_blank"' : ''}>Bingで検索
						</a>
					</li>
					<li>
						<a href="https://www.google.co.jp/search?q=${text}%20site:www.nicovideo.jp/series&num=100"
							${host !== 'www.google.co.jp' ? 'target="_blank"' : ''}>
							シリーズ検索
						</a>
					</li>
				</ul>
			</div>
		`;
	}
	constructor() {
		super();
		this.hasNicodic = parseInt(this.dataset.hasNicodic) !== 0;
		this.text = textUtil.escapeToZenkaku(this.dataset.text);
		const shadow = this._shadow = this.attachShadow({mode: 'open'});
		shadow.innerHTML = this.constructor.template({text: this.text});
		shadow.querySelector('.root').classList.toggle('has-nicodic', this.hasNicodic);
	}
}
if (window.customElements) {
	window.customElements.define('zenza-tag-item-menu', TagItemMenu);
}

class VideoInfoPanel extends Emitter {
	constructor(params) {
		super();
		this._videoHeaderPanel = new VideoHeaderPanel(params);
		this._dialog = params.dialog;
		this._config = Config;
		this._dialog.on('canplay', this._onVideoCanPlay.bind(this));
		this._dialog.on('videoCount', this._onVideoCountUpdate.bind(this));
		if (params.node) {
			this.appendTo(params.node);
		}
	}
	_initializeDom() {
		if (this._isInitialized) {
			return;
		}
		this._isInitialized = true;
		const $view = this._$view = uq.html(VideoInfoPanel.__tpl__);
		const view = this._view = $view[0];
		const classList = this.classList = ClassList(view);
		const $icon = this._$ownerIcon = $view.find('.ownerIcon');
		this._$ownerName = $view.find('.ownerName');
		this._$ownerPageLink = $view.find('.ownerPageLink');
		this._description = view.querySelector('.videoDescription');
		this._seriesList = view.querySelector('.seriesList');
		this._tagListView = new TagListView({
			parentNode: view.querySelector('.videoTagsContainer')
		});
		this._relatedInfoMenu = new RelatedInfoMenu({
			parentNode: view.querySelector('.relatedInfoMenuContainer')
		});
		this._videoMetaInfo = new VideoMetaInfo({
			parentNode: view.querySelector('.videoMetaInfoContainer')
		});
		this._uaaContainer = view.querySelector('.uaaContainer');
		this._uaaView = new UaaView(
			{parentNode: this._uaaContainer});
		this._ichibaContainer = view.querySelector('.ichibaContainer');
		this._ichibaItemView = new IchibaItemView(
			{parentNode: this._ichibaContainer});
		view.addEventListener('mousemove', e => e.stopPropagation());
		view.addEventListener('command', this._onCommandEvent.bind(this));
		view.addEventListener('click', this._onClick.bind(this));
		view.addEventListener('wheel', e => e.stopPropagation(), {passive: true});
		$icon.on('load', () => $icon.raf.removeClass('is-loading'));
		classList.add(Fullscreen.now() ? 'is-fullscreen' : 'is-notFullscreen');
		global.emitter.on('fullscreenStatusChange', isFull => {
			classList.toggle('is-fullscreen', isFull);
			classList.toggle('is-notFullscreen', !isFull);
		});
		view.addEventListener('touchenter', () => classList.add('is-slideOpen'), {passive: true});
		global.emitter.on('hideHover', () => classList.remove('is-slideOpen'));
		cssUtil.registerProps(
			{name: '--base-description-color', syntax: '<color>', initialValue: '#888', inherits: true}
		);
		MylistPocketDetector.detect().then(pocket => {
			this._pocket = pocket;
			classList.add('is-pocketReady');
		});
		if (window.customElements) {
			VideoItemObserver.observe({container: this._description});
		}
	}
	update(videoInfo) {
		this._videoInfo = videoInfo;
		this._videoHeaderPanel.update(videoInfo);
		const owner = videoInfo.owner;
		this._$ownerIcon.attr('src', owner.icon);
		this._$ownerPageLink.attr('href', owner.url);
		this._$ownerName.text(owner.name);
		this._videoMetaInfo.update(videoInfo);
		this._tagListView.update({
			tagList: videoInfo.tagList,
			watchId: videoInfo.watchId,
			videoId: videoInfo.videoId,
			token: videoInfo.csrfToken,
			watchAuthKey: videoInfo.watchAuthKey
		});
		this._seriesList.textContent = '';
		if (videoInfo.series) {
			const label = document.createElement('zenza-video-series-label');
			Object.assign(label.dataset, videoInfo.series);
			this._seriesList.append(label);
		}
		this._updateVideoDescription(videoInfo.description, videoInfo.series);
		const classList = this.classList;
		classList.remove('userVideo', 'channelVideo', 'initializing');
		classList.toggle('is-community', this._videoInfo.isCommunityVideo);
		classList.toggle('is-mymemory', this._videoInfo.isMymemory);
		classList.add(videoInfo.isChannel ? 'channelVideo' : 'userVideo');
		this._ichibaItemView.clear();
		this._ichibaItemView.videoId = videoInfo.videoId;
		this._uaaView.clear();
		this._uaaView.update(videoInfo);
		this._relatedInfoMenu.update(videoInfo);
	}
	async _updateVideoDescription(html, series = null) {
		this._description.textContent = '';
		this._zenTubeUrl = null;
		if (series) {
			if (series.video.prev || series.video.next) {
				html += `<br><br>「${textUtil.escapeHtml(series.title)}」 シリーズ前後の動画`;
			}
			if (series.video.prev) {
				html += `<br>前の動画 <a class="watch" href="https://www.nicovideo.jp/watch/${series.video.prev.id}">${series.video.prev.id}</a>`;
			}
			if (series.video.next) {
				html += `<br>次の動画 <a class="watch" href="https://www.nicovideo.jp/watch/${series.video.next.id}">${series.video.next.id}</a>`;
			}
		}
		const decorateWatchLink = watchLink => {
			const videoId = watchLink.textContent.replace('watch/', '');
			if (
				!/^(sm|nm|so|)[0-9]+$/.test(videoId) ||
				!['www.nicovideo.jp'].includes(watchLink.hostname) || !watchLink.pathname.startsWith('/watch/')) {
				return;
			}
			watchLink.classList.add('noHoverMenu');
			Object.assign(watchLink.dataset, {command: 'open', param: videoId});
			if (!window.customElements) {
				const $watchLink = uq(watchLink);
				const thumbnail = nicoUtil.getThumbnailUrlByVideoId(videoId);
				if (thumbnail) {
					const $img = uq('<img class="videoThumbnail">').attr('src', thumbnail);
					$watchLink.append($img);
				}
				const buttons = uq(`<zenza-playlist-append
					class="playlistAppend clickable-item" title="プレイリストで開く"
					data-command="playlistAppend" data-param="${videoId}"
				>▶</zenza-playlist-append><div
					class="deflistAdd" title="とりあえずマイリスト"
					data-command="deflistAdd" data-param="${videoId}"
				>&#x271A;</div
				><div class="pocket-info" title="動画情報"
					data-command="pocket-info" data-param="${videoId}"
				>？</div>`);
				$watchLink.append(buttons);
			} else {
				const vitem = document.createElement('zenza-video-item');
				vitem.dataset.videoId = videoId;
				watchLink.after(vitem);
				watchLink.classList.remove('watch');
			}
		};
		const seekTime = seek => {
			const [min, sec] = (seek.dataset.seektime || '0:0').split(':');
			Object.assign(seek.dataset, {command: 'seek', type: 'number', param: min * 60 + sec * 1});
		};
		const mylistLink = link => {
			link.classList.add('mylistLink');
			const mylistId = link.textContent.split('/')[1];
			const button = uq(`<zenza-mylist-link data-mylist-id="${mylistId}">
					${link.outerHTML}
					<zenza-playlist-append
						class="playlistSetMylist clickable-item" title="プレイリストで開く"
						data-command="playlistSetMylist" data-param="${mylistId}"
					>▶</zenza-playlist-append>
				</zenza-mylist-link>`)[0];
			link.replaceWith(button);
		};
		const youtube = link => {
			const btn = uq(`<zentube-button
				class="zenzaTubeButton"
				title="ZenzaWatchで開く(実験中)"
				accesskey="z"
				data-command="setVideo;"
				>▷Zen<span>Tube</span></zentube-button>`)[0];
			Object.assign(btn.dataset, {
				command: 'setVideo',
				param: link.href
			});
			link.parentNode.insertBefore(btn, link);
		};
		await sleep.promise();
		const $description = uq(`<zenza-video-description>${html}</zenza-video-description>`);
		for (const a of $description.query('a')) {
			a.classList.add('noHoverMenu');
			const href = a.href;
			if (a.classList.contains('watch')) {
				decorateWatchLink(a);
			} else if (a.classList.contains('seekTime')) {
				seekTime(a);
			} else if (/^mylist\//.test(a.textContent)) {
				mylistLink(a);
			} else if (/^https?:\/\/((www\.|)youtube\.com\/watch|youtu\.be)/.test(href)) {
				youtube(a);
				this._zenTubeUrl = href;
			}
		}
		for (const e of
			$description.query('[style*="color: #000000;"],[style*="color: black;"]')
		) {
			e.dataset.originalCss = e.cssText;
			e.style.color = '#FFF';
		}
		for (const e of $description.query('span')) {
			e.classList.add('videoDescription-font');
		}
		this._description.append($description[0]);
	}
	async _onVideoCanPlay(watchId, videoInfo, options) {
		if (!this._relatedVideoList) {
			this._relatedVideoList = new RelatedVideoList({
				container: this._$view.find('.relatedVideoContainer')[0]
			});
			this._relatedVideoList.on('command', this._onCommand.bind(this));
		}
		if (this._config.props.autoZenTube && this._zenTubeUrl && !options.isAutoZenTubeDisabled) {
			sleep(100).then(() => {
				window.console.info('%cAuto ZenTube', this._zenTubeUrl);
				this.emit('command', 'setVideo', this._zenTubeUrl);
			});
		}
		await sleep.idle();
		this._relatedVideoList.fetchRecommend(videoInfo.videoId, watchId, videoInfo);
	}
	_onVideoCountUpdate(...args) {
		if (!this._videoHeaderPanel) {
			return;
		}
		this._videoMetaInfo.updateVideoCount(...args);
		this._videoHeaderPanel.updateVideoCount(...args);
	}
	_onClick(e) {
		e.stopPropagation();
		if (
			(e.button !== 0 || e.metaKey || e.shiftKey || e.altKey || e.ctrlKey)) {
			return true;
		}
		const target = e.target.closest('[data-command]');
		if (!target) {
			global.emitter.emitAsync('hideHover'); // 手抜き
			return;
		}
		let {command, param, type} = target.dataset;
		if (param && (type === 'bool' || type === 'json')) {
			param = JSON.parse(param);
		}
		e.preventDefault();
		domEvent.dispatchCommand(e.target, command, param);
	}
	_onCommand(command, param) {
		switch (command) {
			default:
				domEvent.dispatchCommand(this._view, command, param);
				break;
		}
	}
	_onCommandEvent(e) {
		const {command, param} = e.detail;
		switch (command) {
			case 'pocket-info':
				this._pocket.external.info(param);
				break;
			case 'ownerVideo':
				domEvent.dispatchCommand(this._view, 'playlistSetUploadedVideo', this._videoInfo.owner.id);
				break;
			default:
				return;
		}
		e.stopPropagation();
	}
	appendTo(node) {
		this._initializeDom();
		this._$view.appendTo(node);
		this._videoHeaderPanel.appendTo(node);
	}
	hide() {
		this._videoHeaderPanel.hide();
	}
	close() {
		this._videoHeaderPanel.close();
	}
	clear() {
		this._videoHeaderPanel.clear();
		this.classList.add('initializing');
		this._$ownerIcon.raf.addClass('is-loading');
		this._description.textContent = '';
	}
	selectTab(tabName) {
		const $view = this._$view;
		const $target = $view.find(`.tabs.${tabName}, .tabSelect.${tabName}`);
		this._activeTabName = tabName;
		$view.find('.activeTab').removeClass('activeTab');
		$target.addClass('activeTab');
	}
	blinkTab(tabName) {
		const $view = this._$view;
		const $target = $view.find(`.tabs.${tabName}, .tabSelect.${tabName}`);
		if (!$target.length) {
			return;
		}
		$target.addClass('blink');
		window.setTimeout(() => $target.removeClass('blink'), 50);
	}
	appendTab(tabName, title, content) {
		const $view = this._$view;
		const $select =
			uq('<div class="tabSelect"/>')
				.addClass(tabName)
				.attr('data-command', 'selectTab')
				.attr('data-param', tabName)
				.text(title);
		const $body = uq('<div class="tabs"/>').addClass(tabName);
		if (content) {
			$body.append(content);
		}
		$view.find('.tabSelectContainer').append($select);
		$view.append($body);
		if (this._activeTabName === tabName) {
			$select.addClass('activeTab');
			$body.addClass('activeTab');
		}
		return $body;
	}
}
css.addStyle(`
	.zenzaWatchVideoInfoPanel .tabs:not(.activeTab) {
		display: none;
		pointer-events: none;
		overflow: hidden;
	}
	.zenzaWatchVideoInfoPanel .tabs.activeTab {
		margin-top: 32px;
		box-sizing: border-box;
		position: relative;
		width: 100%;
		height: calc(100% - 32px);
		overflow-x: hidden;
		overflow-y: visible;
		overscroll-behavior: none;
		text-align: left;
	}
	.zenzaWatchVideoInfoPanel .tabs.relatedVideoTab.activeTab {
		overflow: hidden;
	}
	.zenzaWatchVideoInfoPanel .tabs:not(.activeTab) {
		display: none !important;
		pointer-events: none;
		opacity: 0;
	}
	.zenzaWatchVideoInfoPanel .tabSelectContainer {
		position: absolute;
		display: flex;
		height: 32px;
		z-index: 100;
		width: 100%;
		white-space: nowrap;
		user-select: none;
	}
	.zenzaWatchVideoInfoPanel .tabSelect {
		flex: 1;
		box-sizing: border-box;
		display: inline-block;
		height: 32px;
		font-size: 12px;
		letter-spacing: 0;
		line-height: 32px;
		color: #666;
		background: #222;
		cursor: pointer;
		text-align: center;
		transition: text-shadow 0.2s ease, color 0.2s ease;
	}
	.zenzaWatchVideoInfoPanel .tabSelect.activeTab {
		font-size: 14px;
		letter-spacing: 0.1em;
		color: #ccc;
		background: #333;
	}
	.zenzaWatchVideoInfoPanel .tabSelect.blink:not(.activeTab) {
		color: #fff;
		text-shadow: 0 0 4px #ff9;
		transition: none;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel.is-notFullscreen .tabSelect.blink:not(.activeTab) {
		color: #fff;
		text-shadow: 0 0 4px #006;
		transition: none;
	}
	.zenzaWatchVideoInfoPanel .tabSelect:not(.activeTab):hover {
		background: #888;
	}
	.zenzaWatchVideoInfoPanel.initializing {
	}
	.zenzaWatchVideoInfoPanel>* {
		transition: opacity 0.4s ease;
		pointer-events: none;
	}
	.is-mouseMoving .zenzaWatchVideoInfoPanel>*,
								.zenzaWatchVideoInfoPanel:hover>* {
		pointer-events: auto;
	}
	.zenzaWatchVideoInfoPanel.initializing>* {
		opacity: 0;
		color: #333;
		transition: none;
	}
	.zenzaWatchVideoInfoPanel {
		position: absolute;
		top: 0;
		width: 320px;
		height: 100%;
		box-sizing: border-box;
		z-index: ${CONSTANT.BASE_Z_INDEX + 25000};
		background: #333;
		color: #ccc;
		overflow-x: hidden;
		overflow-y: hidden;
		transition: opacity 0.4s ease;
	}
	.zenzaWatchVideoInfoPanel .ownerPageLink {
		display: block;
		margin: 0 auto 8px;
		width: 104px;
	}
	.zenzaWatchVideoInfoPanel .ownerIcon {
		width: 96px;
		height: 96px;
		border: none;
		border-radius: 4px;
		transition: opacity 1s ease;
		vertical-align: middle;
	}
	.zenzaWatchVideoInfoPanel .ownerIcon.is-loading {
		opacity: 0;
	}
	.zenzaWatchVideoInfoPanel .ownerName {
		font-size: 20px;
		word-break: break-all;
	}
	.zenzaWatchVideoInfoPanel .videoOwnerInfoContainer {
		padding: 16px;
		display: table;
		width: 100%;
	}
	.zenzaWatchVideoInfoPanel .videoOwnerInfoContainer>*{
		display: block;
		vertical-align: middle;
		text-align: center;
	}
	.zenzaWatchVideoInfoPanel .videoDescription {
		padding: 8px 8px 8px;
		margin: 4px 0px;
		word-break: break-all;
		line-height: 1.5;
	}
	.zenzaWatchVideoInfoPanel .videoDescription a {
		display: inline-block;
		font-weight: bold;
		text-decoration: none;
		color: #ff9;
		padding: 2px;
	}
	.zenzaWatchVideoInfoPanel .videoDescription a:visited {
		color: #ffd;
	}
	.zenzaWatchVideoInfoPanel .videoDescription .watch {
		display: block;
		position: relative;
		line-height: 60px;
		box-sizing: border-box;
		padding: 4px 16px;;
		min-height: 60px;
		width: 272px;
		margin: 8px 10px;
		background: #444;
		border-radius: 4px;
	}
	.zenzaWatchVideoInfoPanel .videoDescription .watch:hover {
		background: #446;
	}
	.videoDescription-font {
		text-shadow: 1px 1px var(--base-description-color, #888);
	}
	.zenzaWatchVideoInfoPanel .videoDescription .mylistLink {
		white-space: nowrap;
		display: inline-block;
	}
	.zenzaWatchVideoInfoPanel:not(.is-pocketReady) .pocket-info {
		display: none !important;
	}
	.pocket-info {
		font-family: Menlo;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistAppend,
	.zenzaWatchVideoInfoPanel .videoInfoTab .deflistAdd,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetMylist,
	.zenzaWatchVideoInfoPanel .videoInfoTab .pocket-info,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetUploadedVideo {
		display: inline-block;
		font-size: 16px;
		line-height: 20px;
		width: 24px;
		height: 24px;
		background: #666;
		color: #ccc !important;
		background: #666;
		text-decoration: none;
		border: 1px outset;
		cursor: pointer;
		text-align: center;
		user-select: none;
		margin-left: 8px;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistAppend,
	.zenzaWatchVideoInfoPanel .videoInfoTab .pocket-info,
	.zenzaWatchVideoInfoPanel .videoInfoTab .deflistAdd {
		display: none;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .owner:hover .playlistAppend,
	.zenzaWatchVideoInfoPanel .videoInfoTab .watch:hover .playlistAppend,
	.zenzaWatchVideoInfoPanel .videoInfoTab .watch:hover .pocket-info,
	.zenzaWatchVideoInfoPanel .videoInfoTab .watch:hover .deflistAdd {
		display: inline-block;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistAppend {
		position: absolute;
		bottom: 4px;
		left: 16px;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .pocket-info {
		position: absolute;
		bottom: 4px;
		left: 48px;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .deflistAdd {
		position: absolute;
		bottom: 4px;
		left: 80px;
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .pocket-info:hover,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistAppend:hover,
	.zenzaWatchVideoInfoPanel .videoInfoTab .deflistAdd:hover,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetMylist:hover,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetUploadedVideo:hover {
		transform: scale(1.5);
	}
	.zenzaWatchVideoInfoPanel .videoInfoTab .pocket-info:active,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistAppend:active,
	.zenzaWatchVideoInfoPanel .videoInfoTab .deflistAdd:active,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetMylist:active,
	.zenzaWatchVideoInfoPanel .videoInfoTab .playlistSetUploadedVideo:active {
		transform: scale(1.2);
		border: 1px inset;
	}
	.zenzaWatchVideoInfoPanel .videoDescription .watch .videoThumbnail {
		position: absolute;
		right: 16px;
		height: 60px;
		pointer-events: none;
	}
	.zenzaWatchVideoInfoPanel .videoDescription:hover .watch .videoThumbnail {
		filter: none;
	}
	.zenzaWatchVideoInfoPanel .publicStatus,
	.zenzaWatchVideoInfoPanel .videoTagsContainer {
		display: none;
	}
	.zenzaWatchVideoInfoPanel .publicStatus {
		display: none;
		position: relative;
		margin: 8px 0;
		padding: 8px;
		line-height: 150%;
		text-align; center;
		color: #333;
	}
	.zenzaWatchVideoInfoPanel .videoMetaInfoContainer {
		display: inline-block;
		padding: 0 8px;
	}
	.zenzaScreenMode_normal .is-backComment .zenzaWatchVideoInfoPanel,
	.zenzaScreenMode_big    .is-backComment .zenzaWatchVideoInfoPanel {
		opacity: 0.7;
	}
	.zenzaWatchVideoInfoPanel .relatedVideoTab .relatedVideoContainer {
		box-sizing: border-box;
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		user-select: none;
	}
	.zenzaWatchVideoInfoPanel .videoListFrame,
	.zenzaWatchVideoInfoPanel .commentListFrame {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		border: 0;
		background: #333;
	}
	.zenzaWatchVideoInfoPanel .nowLoading {
		display: none;
		opacity: 0;
		pointer-events: none;
	}
	.zenzaWatchVideoInfoPanel.initializing .nowLoading {
		display: block !important;
		opacity: 1 !important;
		color: #888;
	}
	.zenzaWatchVideoInfoPanel .nowLoading {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
	}
	.zenzaWatchVideoInfoPanel .kurukuru {
		position: absolute;
		display: inline-block;
		font-size: 96px;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	@keyframes loadingRolling {
		0%   { transform: rotate(0deg); }
		100% { transform: rotate(1800deg); }
	}
	.zenzaWatchVideoInfoPanel.initializing .kurukuruInner {
		display: inline-block;
		pointer-events: none;
		text-align: center;
		text-shadow: 0 0 4px #888;
		animation-name: loadingRolling;
		animation-iteration-count: infinite;
		animation-duration: 4s;
	}
	.zenzaWatchVideoInfoPanel .nowLoading .loadingMessage {
		position: absolute;
		display: inline-block;
		font-family: Impact;
		font-size: 32px;
		text-align: center;
		top: calc(50% + 48px);
		left: 0;
		width: 100%;
	}
	${CONSTANT.SCROLLBAR_CSS}
	.zenzaWatchVideoInfoPanel .zenzaWatchVideoInfoPanelInner {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
		.zenzaWatchVideoInfoPanelContent {
			flex: 1;
		}
	.zenzaTubeButton {
		display: inline-block;
		padding: 4px 8px;
		cursor: pointer;
		background: #666;
		color: #ccc;
		border-radius: 4px;
		border: 1px outset;
		margin: 0 8px;
	}
	.zenzaTubeButton:hover {
		box-shadow: 0 0 8px #fff, 0 0 4px #ccc;
	}
		.zenzaTubeButton span {
			pointer-events: none;
			display: inline-block;
			background: #ccc;
			color: #333;
			border-radius: 4px;
		}
		.zenzaTubeButton:hover span {
			background: #f33;
			color: #ccc;
		}
	.zenzaTubeButton:active {
		box-shadow:  0 0 2px #ccc, 0 0 4px #000 inset;
		border: 1px inset;
	}
	.zenzaWatchVideoInfoPanel .relatedInfoMenuContainer {
		text-align: left;
	}
	.zenzaWatchVideoInfoPanel .seriesList {
		padding: 0 8px;
	}
	zenza-video-item,
	zenza-video-series-label,
	zenza-vieo-description,
	.UaaView,
	.ZenzaIchibaItemView {
		content-visibility: auto;
	}
	`, {className: 'videoInfoPanel'});
css.addStyle(`
	.is-open .zenzaWatchVideoInfoPanel>* {
		display: none;
		pointer-events: none;
	}
	.zenzaWatchVideoInfoPanel:hover>* {
		display: inherit;
		pointer-events: auto;
	}
	.zenzaWatchVideoInfoPanel:hover .tabSelectContainer {
		display: flex;
	}
	.zenzaWatchVideoInfoPanel {
		top: 20%;
		right: calc(32px - 320px);
		left: auto;
		width: 320px;
		height: 60%;
		border: 1px solid transparent;
		background: none;
		opacity: 0;
		box-shadow: none;
		transition: opacity 0.4s ease, transform 0.4s ease 1s;
		will-change: opacity, transform;
	}
	.is-mouseMoving  .zenzaWatchVideoInfoPanel {
		border: 1px solid #888;
		opacity: 0.5;
	}
	.zenzaWatchVideoInfoPanel.is-slideOpen,
	.zenzaWatchVideoInfoPanel:hover {
		background: #333;
		box-shadow: 4px 4px 4px #000;
		border: none;
		opacity: 0.9;
		transform: translate3d(-288px, 0, 0);
		transition: opacity 0.4s ease, transform 0.4s ease 1s;
	}
`, {className: 'screenMode for-full videoInfoPanel'});
css.addStyle(`
	.zenzaScreenMode_small .zenzaWatchVideoInfoPanel {
		display: none;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .tabSelectContainer {
		width: calc(100% - 16px);
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .tabSelect {
		background: #ccc;
		color: #888;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .tabSelect.activeTab {
		background: #ddd;
		color: black;
		border: none;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel {
		top: 230px;
		left: 0;
		width: ${CONSTANT.SIDE_PLAYER_WIDTH}px;
		height: calc(100vh - 296px);
		bottom: 48px;
		padding: 8px;
		box-shadow: none;
		background: #f0f0f0;
		color: #000;
		border: 1px solid #333;
		margin: 4px 2px;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .publicStatus {
		display: block;
		text-align: center;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoDescription a {
		color: #006699;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoDescription a:visited {
		color: #666666;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoTagsContainer {
		display: block;
		bottom: 48px;
		width: 364px;
		margin: 0 auto;
		padding: 8px;
		background: #ccc;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoDescription .watch {
		background: #ddd;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoDescription .watch:hover {
		background: #ddf;
	}
	.zenzaScreenMode_sideView .videoInfoTab::-webkit-scrollbar {
		background: #f0f0f0;
	}
	.zenzaScreenMode_sideView .videoInfoTab::-webkit-scrollbar-thumb {
		border-radius: 0;
		background: #ccc;
	}
`, {className: 'screenMode for-popup videoInfoPanel'});
uq.ready().then(() => {
	if (document.body.classList.contains('MatrixRanking-body')) {
		css.addStyle(`
			body.zenzaScreenMode_sideView.MatrixRanking-body .RankingRowRank {
				line-height: 48px;
				height: 48px;
				pointer-events: none;
				user-select: none;
			}
			body.zenzaScreenMode_sideView.MatrixRanking-body .RankingRowRank {
				position: sticky;
				left: calc(var(--sideView-left-margin) - 8px);
				z-index: 100;
				transform: none;
				padding-right: 16px;
				width: 64px;
				overflow: visible;
				text-align: right;
				mix-blend-mode: difference;
				text-shadow:
					1px  1px 0 #fff,
					1px -1px 0 #fff,
					-1px  1px 0 #fff,
					-1px -1px 0 #fff;
			}
			body.zenzaScreenMode_sideView.MatrixRanking-body .BaseLayout-block {
				width: ${1024 + 64 * 2}px;
			}
			.RankingMainContainer-decorateChunk+.RankingMainContainer-decorateChunk,
			.RankingMainContainer-decorateChunk>*+* {
				margin-top: 0;
			}
			body.zenzaScreenMode_sideView .RankingMainContainer {
				width: ${1024}px;
			}
			body.zenzaScreenMode_sideView.MatrixRanking-body .RankingMatrixVideosRow {
				width: ${1024 + 64}px;
				margin-left: ${-64}px;
			}
				.RankingGenreListContainer-categoryHelp {
					position: static;
				}
				.RankingMatrixNicoadsRow>*+*,
				.RankingMatrixVideosRow>:nth-child(n+3) {
					margin-left: 13px;
				}
				.RankingBaseItem {
					width: 160px;
					height: 196px;
				}
					body.zenzaScreenMode_sideView .RankingBaseItem .Card-link {
						grid-template-rows: 90px auto;
					}
					.VideoItem.RankingBaseItem .VideoThumbnail {
						border-radius: 3px 3px 0 0;
					}
					[data-nicoad-grade] .Thumbnail.VideoThumbnail .Thumbnail-image {
						margin: 3px;
						background-size: calc(100% + 6px);
					}
					[data-nicoad-grade] .Thumbnail.VideoThumbnail:after {
						width: 40px;
						height: 40px;
						background-size: 80px 80px;
					}
					.Thumbnail.VideoThumbnail .VideoLength {
						bottom: 3px;
						right: 3px;
					}
					.VideoThumbnailComment {
						transform: scale(0.8333);
					}
					.RankingBaseItem-meta {
						position: static;
						padding: 0 4px 8px;
					}
					.VideoItem.RankingBaseItem .VideoItem-metaCount>.VideoMetaCount {
						white-space: nowrap;
					}
			.RankingMainContainer .ToTopButton {
				transform: translateX(calc(100vw / 2 - 100% - 36px));
				user-select: none;
			}
		`, {className: 'screenMode for-sideView MatrixRanking', disabled: true});
		}
});
css.addStyle(`
	.is-open .zenzaWatchVideoInfoPanel {
		display: none;
		left: calc(100%);
		top: 0;
	}
	@media screen {
		@media (min-width: 992px) {
			.zenzaScreenMode_normal .zenzaWatchVideoInfoPanel {
				display: inherit;
			}
		}
		@media (min-width: 1216px) {
			.zenzaScreenMode_big .zenzaWatchVideoInfoPanel {
				display: inherit;
			}
		}
		/* 縦長モニター */
		@media
			(max-width: 991px) and (min-height: 700px)
		{
			.zenzaScreenMode_normal .zenzaWatchVideoInfoPanel {
				display: inherit;
				top: 100%;
				left: 0;
				width: 100%;
				height: ${CONSTANT.BOTTOM_PANEL_HEIGHT}px;
				z-index: ${CONSTANT.BASE_Z_INDEX + 20000};
			}
			.zenzaScreenMode_normal .ZenzaIchibaItemView {
				margin: 8px 8px 96px;
			}
			.zenzaScreenMode_normal .zenzaWatchVideoInfoPanel .videoOwnerInfoContainer {
				display: table;
			}
			.zenzaScreenMode_normal .zenzaWatchVideoInfoPanel .videoOwnerInfoContainer>* {
				display: table-cell;
				text-align: left;
			}
			.zenzaScreenMode_normal .zenzaWatchVideoHeaderPanel {
				width: 100% !important;
			}
		}
		@media
			(max-width: 1215px) and (min-height: 700px) {
			.zenzaScreenMode_big .zenzaWatchVideoInfoPanel {
				display: inherit;
				top: 100%;
				left: 0;
				width: 100%;
				height: ${CONSTANT.BOTTOM_PANEL_HEIGHT}px;
				z-index: ${CONSTANT.BASE_Z_INDEX + 20000};
			}
			.zenzaScreenMode_big .ZenzaIchibaItemView {
				margin: 8px 8px 96px;
			}
			.zenzaScreenMode_big .zenzaWatchVideoInfoPanel .videoOwnerInfoContainer {
				display: table;
			}
			.zenzaScreenMode_big .zenzaWatchVideoInfoPanel .videoOwnerInfoContainer>* {
				display: table-cell;
				text-align: left;
			}
			.zenzaScreenMode_big .zenzaWatchVideoHeaderPanel {
				width: 100% !important;
			}
		}
	}
`, {className: 'screenMode for-dialog videoInfoPanel'});
css.addStyle(`
	.zenzaWatchVideoInfoPanel .comment {
		padding-left: 0;
	}
`, {className: 'domain slack-com', disabled: true});
VideoInfoPanel.__tpl__ = (`
		<div class="zenzaWatchVideoInfoPanel show initializing">
			<div class="nowLoading">
				<div class="kurukuru"><span class="kurukuruInner">&#x262F;</span></div>
				<div class="loadingMessage">Loading...</div>
			</div>
			<div class="tabSelectContainer"><div class="tabSelect videoInfoTab activeTab" data-command="selectTab" data-param="videoInfoTab">動画情報</div><div class="tabSelect relatedVideoTab" data-command="selectTab" data-param="relatedVideoTab">関連動画</div></div>
			<div class="tabs videoInfoTab activeTab">
				<div class="zenzaWatchVideoInfoPanelInner">
					<div class="zenzaWatchVideoInfoPanelContent">
						<div class="videoOwnerInfoContainer">
							<a class="ownerPageLink" rel="noopener" target="_blank">
								<img class="ownerIcon loading"/>
							</a>
							<span class="owner">
								<span class="ownerName"></span>
								<zenza-playlist-append class="playlistSetUploadedVideo userVideo"
									data-command="ownerVideo"
									title="投稿動画一覧をプレイリストで開く">▶</zenza-playlist-append>
							</span>
						</div>
						<div class="publicStatus">
							<div class="videoMetaInfoContainer"></div>
							<div class="relatedInfoMenuContainer"></div>
						</div>
						<div class="seriesList"></div>
						<div class="videoDescription"></div>
					</div>
					<div class="zenzaWatchVideoInfoPanelFoot">
						<div class="uaaContainer"></div>
						<div class="ichibaContainer"></div>
						<div class="videoTagsContainer sideTab"></div>
					</div>
				</div>
			</div>
			<div class="tabs relatedVideoTab">
				<div class="relatedVideoContainer"></div>
			</div>
		</div>
	`).trim();
class VideoHeaderPanel extends Emitter {
	constructor(params) {
		super();
	}
	_initializeDom() {
		if (this._isInitialized) {
			return;
		}
		this._isInitialized = true;
		cssUtil.addStyle(VideoHeaderPanel.__css__);
		const $view = this._$view = uq.html(VideoHeaderPanel.__tpl__);
		const view = $view[0];
		const classList = this.classList = ClassList(view);
		this._videoTitle = $view.find('.videoTitle')[0];
		this._searchForm = new VideoSearchForm({
			parentNode: view
		});
		$view.on('wheel', e => e.stopPropagation(), {passive: true});
		this._seriesCover = view.querySelector('.series-thumbnail');
		this._tagListView = new TagListView({
			parentNode: view.querySelector('.videoTagsContainer')
		});
		this._relatedInfoMenu = new RelatedInfoMenu({
			parentNode: view.querySelector('.relatedInfoMenuContainer'),
			isHeader: true
		});
		this._relatedInfoMenu.on('open', () => classList.add('is-relatedMenuOpen'));
		this._relatedInfoMenu.on('close', () => classList.remove('is-relatedMenuOpen'));
		this._videoMetaInfo = new VideoMetaInfo({
			parentNode: view.querySelector('.videoMetaInfoContainer'),
		});
		classList.add(Fullscreen.now() ? 'is-fullscreen' : 'is-notFullscreen');
		global.emitter.on('fullScreenStatusChange', isFull => {
			classList.toggle('is-fullscreen', isFull);
			classList.toggle('is-notFullscreen', !isFull);
		});
		window.addEventListener('resize', _.debounce(this._onResize.bind(this), 500));
	}
	update(videoInfo) {
		this._videoInfo = videoInfo;
		this._videoTitle.title =  this._videoTitle.textContent = videoInfo.title;
		const watchId = videoInfo.watchId;
		this._videoMetaInfo.update(videoInfo);
		this._tagListView.update({
			tagList: videoInfo.tagList,
			watchId,
			videoId: videoInfo.videoId,
			token: videoInfo.csrfToken,
			watchAuthKey: videoInfo.watchAuthKey
		});
		this._relatedInfoMenu.update(videoInfo);
		const classList = this.classList;
		classList.remove('userVideo', 'channelVideo', 'initializing');
		classList.toggle('is-community', this._videoInfo.isCommunityVideo);
		classList.toggle('is-mymemory', this._videoInfo.isMymemory);
		classList.toggle('has-Parent', this._videoInfo.hasParentVideo);
		classList.add(videoInfo.isChannel ? 'channelVideo' : 'userVideo');
		this._$view.raf.css('display', '');
		if (videoInfo.series && videoInfo.series.thumbnailUrl) {
			this._seriesCover.style.backgroundImage = `url("${videoInfo.series.thumbnailUrl}")`;
		} else {
			this._seriesCover.removeAttribute('style');
		}
		window.setTimeout(() => this._onResize(), 1000);
	}
	updateVideoCount(...args) {
		this._videoMetaInfo.updateVideoCount(...args);
	}
	_onResize() {
		const view = this._$view[0];
		const rect = view.getBoundingClientRect();
		const isOnscreen = this.classList.contains('is-onscreen');
		const height = rect.bottom - rect.top;
		const top = isOnscreen ? (rect.top - height) : rect.top;
		this.classList.toggle('is-onscreen', top < -32);
	}
	appendTo(node) {
		this._initializeDom();
		this._$view.appendTo(node);
	}
	hide() {
		if (!this._$view) {
			return;
		}
		this.classList.remove('show');
	}
	close() {
	}
	clear() {
		if (!this._$view) {
			return;
		}
		this.classList.add('initializing');
		this._videoTitle.textContent = '';
	}
	getPublicStatusDom() {
		return this._$view.find('.publicStatus').html();
	}
}
css.addStyle(`
	.zenzaScreenMode_small .zenzaWatchVideoHeaderPanel {
		display: none;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel {
		top: 0;
		left: 400px;
		width: calc(100vw - 400px);
		bottom: auto;
		background: #272727;
		opacity: 0.9;
		height: 40px;
	}
	/* ヘッダ追従 */
	body.zenzaScreenMode_sideView:not(.nofix)  .zenzaWatchVideoHeaderPanel {
		top: 0;
	}
	/* ヘッダ固定 */
	.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel .videoTitleContainer {
		margin: 0;
	}
	.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel .publicStatus,
	.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel .videoTagsContainer {
		display: none;
	}
	@media screen and (min-width: 1432px)
	{
		.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .tabSelectContainer {
			width: calc(100% - 16px);
		}
		.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel {
			top: calc((100vw - 1024px) * 9 / 16 + 4px);
			width: calc(100vw - 1024px);
			height: calc(100vh - (100vw - 1024px) * 9 / 16 - 70px);
		}
		.zenzaScreenMode_sideView .zenzaWatchVideoInfoPanel .videoTagsContainer {
			width: calc(100vw - 1024px - 26px);
		}
		.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel {
			width: calc(100vw - (100vw - 1024px));
			left:  calc(100vw - 1024px);
		}
	}
`, {className: 'screenMode for-popup videoHeaderPanel', disabled: true});
css.addStyle(`
	body .is-open .zenzaWatchVideoHeaderPanel {
		width: calc(100% + ${CONSTANT.RIGHT_PANEL_WIDTH}px);
	}
		.zenzaWatchVideoHeaderPanel.is-onscreen {
			top: 0px;
			bottom: auto;
			background: rgba(0, 0, 0, 0.5);
			opacity: 0;
			box-shadow: none;
		}
		.is-loading .zenzaWatchVideoHeaderPanel.is-onscreen {
			opacity: 0.6;
			transition: 0.4s opacity;
		}
		.zenzaWatchVideoHeaderPanel.is-onscreen:hover {
			opacity: 1;
			transition: 0.5s opacity;
		}
		.zenzaWatchVideoHeaderPanel.is-onscreen .videoTagsContainer {
			display: none;
			width: calc(100% - 240px);
		}
		.zenzaWatchVideoHeaderPanel.is-onscreen:hover .videoTagsContainer {
			display: block;
		}
		.zenzaWatchVideoHeaderPanel.is-onscreen .videoTitleContainer {
			width: calc(100% - 180px);
		}
		.zenzaWatchVideoInfoPanelFoot {
			background: #222;
		}
`, {className: 'screenMode for-dialog videoHeaderPanel', disabled: true});
css.addStyle(`
	.is-open .zenzaWatchVideoHeaderPanel {
		position: absolute; /* fixedだとFirefoxのバグでおかしくなる */
		top: 0px;
		bottom: auto;
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		box-shadow: none;
	}
	.is-loading .zenzaWatchVideoHeaderPanel,
	.is-mouseMoving .zenzaWatchVideoHeaderPanel {
		opacity: 0.6;
		transition: 0.4s opacity;
	}
	.is-open .showVideoHeaderPanel .zenzaWatchVideoHeaderPanel,
	.is-open .zenzaWatchVideoHeaderPanel:hover {
		opacity: 1;
		transition: 0.5s opacity;
	}
	.is-open .videoTagsContainer {
		display: none;
		width: calc(100% - 240px);
	}
	.is-open .zenzaWatchVideoHeaderPanel:hover .videoTagsContainer {
		display: block;
	}
	.is-open .zenzaWatchVideoHeaderPanel .videoTitleContainer {
		width: calc(100% - 180px);
	}
`, {className: 'screenMode for-full videoHeaderPanel', disabled: true});
VideoHeaderPanel.__css__ = (`
		.zenzaWatchVideoHeaderPanel {
			position: absolute;
			width: calc(100%);
			z-index: ${CONSTANT.BASE_Z_INDEX + 30000};
			box-sizing: border-box;
			padding: 8px 8px 0;
			bottom: calc(100% + 8px);
			left: 0;
			background: #333;
			color: #ccc;
			text-align: left;
			box-shadow: 4px 4px 4px #000;
			transition: opacity 0.4s ease;
			will-change: transform;
		}
		.zenzaWatchVideoHeaderPanel.is-onscreen {
			width: 100% !important;
		}
		.zenzaScreenMode_sideView .zenzaWatchVideoHeaderPanel,
		.zenzaWatchVideoHeaderPanel.is-fullscreen {
			z-index: ${CONSTANT.BASE_Z_INDEX + 20000};
		}
		.zenzaWatchVideoHeaderPanel {
			pointer-events: none;
		}
		.is-mouseMoving .zenzaWatchVideoHeaderPanel,
										.zenzaWatchVideoHeaderPanel:hover {
			pointer-events: auto;
		}
		.zenzaWatchVideoHeaderPanel.initializing {
			display: none;
		}
		.zenzaWatchVideoHeaderPanel.initializing>*{
			opacity: 0;
		}
		.zenzaWatchVideoHeaderPanel .videoTitleContainer {
			margin: 8px;
		}
		.zenzaWatchVideoHeaderPanel .publicStatus {
			position: relative;
			color: #ccc;
		}
		.zenzaWatchVideoHeaderPanel .videoTitle {
			font-size: 24px;
			color: #fff;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			display: block;
			padding: 2px 0;
		}
		.zenzaWatchVideoHeaderPanel .videoTitle::before {
			display: none;
			position: absolute;
			font-size: 12px;
			top: 0;
			left: 0;
			background: #333;
			border: 1px solid #888;
			padding: 2px 4px;
			pointer-events: none;
		}
		.zenzaWatchVideoHeaderPanel.is-mymemory:not(:hover) .videoTitle::before {
			content: 'マイメモリー';
			display: inline-block;
		}
		.zenzaWatchVideoHeaderPanel.is-community:not(:hover) .videoTitle::before {
			content: 'コミュニティ動画';
			display: inline-block;
		}
		.videoMetaInfoContainer {
			display: inline-block;
		}
		.zenzaScreenMode_normal .is-backComment .zenzaWatchVideoHeaderPanel,
		.zenzaScreenMode_big    .is-backComment .zenzaWatchVideoHeaderPanel {
			opacity: 0.7;
		}
		.zenzaWatchVideoHeaderPanel .relatedInfoMenuContainer {
			display: inline-block;
			position: absolute;
			top: 0;
			margin: 0 16px;
			z-index: 1000;
		}
		.zenzaWatchVideoHeaderPanel:focus-within,
		.zenzaWatchVideoHeaderPanel.is-relatedMenuOpen {
			z-index: ${CONSTANT.BASE_Z_INDEX + 50000};
		}
		.zenzaWatchVideoHeaderPanel .series-thumbnail-cover {
			position: absolute;
			top: 0px;
			right: 0px;
			width: 50%;
			height: 100%;
			display: inline-block;
			overflow: hidden;
			contain: strict;
			pointer-events: none;
			user-select: none;
		}
		.zenzaWatchVideoHeaderPanel .series-thumbnail[style] {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			/*filter: sepia(50%) blur(4px);*/
			background-size: cover;
			background-position: center center;
			background-repeat: no-repeat;
			will-change: transform;
			-webkit-mask-image:
				linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%);
			mask-image:
				linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%);
		}
	`);
VideoHeaderPanel.__tpl__ = (`
		<div class="zenzaWatchVideoHeaderPanel show initializing" style="display: none;">
			<h2 class="videoTitleContainer">
				<span class="videoTitle"></span>
			</h2>
			<p class="publicStatus">
				<span class="videoMetaInfoContainer"></span>
				<span class="relatedInfoMenuContainer"></span>
			</p>
			<div class="videoTagsContainer videoHeader">
			</div>
			<div class="series-thumbnail-cover"><div class="series-thumbnail"></div></div>
		</div>
	`).trim();
class VideoSearchForm extends Emitter {
	constructor(...args) {
		super();
		this._config = Config.namespace('videoSearch');
		this._initDom(...args);
	}
	_initDom({parentNode}) {
		let tpl = document.getElementById('zenzaVideoSearchPanelTemplate');
		if (!tpl) {
			cssUtil.addStyle(VideoSearchForm.__css__);
			tpl = document.createElement('template');
			tpl.innerHTML = VideoSearchForm.__tpl__;
			tpl.id = 'zenzaVideoSearchPanelTemplate';
		}
		const view = document.importNode(tpl.content, true);
		this._view = view.querySelector('*');
		this._form = view.querySelector('form');
		this._word = view.querySelector('.searchWordInput');
		this._sort = view.querySelector('.searchSortSelect');
		this._mode = view.querySelector('.searchMode') || 'tag';
		this._form.addEventListener('submit', this._onSubmit.bind(this));
		const config = this._config;
		const form = this._form;
		form['ownerOnly'].checked = config.props.ownerOnly;
		const confMode = config.props.mode;
		if (typeof confMode === 'string' && ['tag', 'keyword'].includes(confMode)) {
			form['mode'].value = confMode;
		} else if (typeof confMode === 'boolean') {
			form['mode'].value = confMode ? 'tag' : 'keyword';
		} else {
			form['mode'].value = 'tag';
		}
		form['word'].value = config.props.word;
		form['sort'].value = config.props.sort;
		this._view.addEventListener('click', this._onClick.bind(this));
		view.addEventListener('paste', e => e.stopPropagation());
		const submit = _.debounce(this.submit.bind(this), 500);
		Array.from(view.querySelectorAll('input, select')).forEach(item => {
			if (item.type === 'checkbox') {
				item.addEventListener('change', () => {
					this._word.focus();
					config.props[item.name] = item.checked;
					submit();
				});
			} else if (item.type === 'radio') {
				item.addEventListener('change', () => {
					this._word.focus();
					config.props[item.name] = this._form[item.name].value;
					submit();
				});
			} else {
				item.addEventListener('change', () => {
					config.props[item.name] = item.value;
					if (item.tagName === 'SELECT') {
						submit();
					}
				});
			}
		});
		global.emitter.on('searchVideo', ({word}) => {
			form['word'].value = word;
		});
		if (parentNode) {
			parentNode.appendChild(view);
		}
		global.debug.searchForm = this;
	}
	_onClick(e) {
		e.stopPropagation();
		const tagName = (e.target.tagName || '').toLowerCase();
		const target = e.target.closest('.command');
		if (!['input', 'select'].includes(tagName)) {
			this._word.focus();
		}
		if (!target) {
			return;
		}
		const command = target.dataset.command;
		if (!command) {
			return;
		}
		e.preventDefault();
		const type = target.getAttribute('data-type') || 'string';
		let param = target.getAttribute('data-param');
		if (type !== 'string') { param = JSON.parse(param); }
		switch (command) {
			case 'clear':
				this._word.value = '';
				break;
			default:
				domEvent.dispatchCommand(e.target, command, param);
		}
	}
	_onSubmit(e) {
		this.submit();
		e.stopPropagation();
	}
	submit() {
		const word = this.word;
		if (!word) {
			return;
		}
		domEvent.dispatchCommand(this._view, 'playlistSetSearchVideo', {
			word,
			option: {
				searchType: this.searchType,
				sort: this.sort,
				order: this.order,
				owner: this.isOwnerOnly,
				playlistSort: this.isPlaylistSort
			}
		});
	}
	_hasFocus() {
		return !!document.activeElement.closest('#zenzaVideoSearchPanel');
	}
	_updateFocus() {
	}
	get word() {
		return (this._word.value || '').trim();
	}
	get searchType() {
		return this._form.mode.value;
	}
	get sort() {
		const sortTmp = (this._sort.value || '').split(',');
		const playlistSort = sortTmp[0] === 'playlist';
		return playlistSort ? 'f' : sortTmp[0];
	}
	get order() {
		const sortTmp = (this._sort.value || '').split(',');
		return sortTmp[1] || 'd';
	}
	get isPlaylistSort() {
		const sortTmp = (this._sort.value || '').split(',');
		return sortTmp[0] === 'playlist';
	}
	get isOwnerOnly() {
		return this._form['ownerOnly'].checked;
	}
}
css.addStyle(`
	.is-open .zenzaWatchVideoHeaderPanel .zenzaVideoSearchPanel {
		top: 120px;
		right: 32px;
	}
`, {className: 'screenMode for-popup videoSearchPanel', disabled: true});
VideoSearchForm.__css__ = (`
		.zenzaVideoSearchPanel {
			pointer-events: auto;
			position: absolute;
			top: 32px;
			right: 8px;
			padding: 0 8px
			width: 248px;
			z-index: 1000;
		}
		.zenzaScreenMode_normal .zenzaWatchVideoHeaderPanel.is-onscreen .zenzaVideoSearchPanel,
		.zenzaScreenMode_big    .zenzaWatchVideoHeaderPanel.is-onscreen .zenzaVideoSearchPanel,
		.zenzaScreenMode_3D    .zenzaVideoSearchPanel,
		.zenzaScreenMode_wide  .zenzaVideoSearchPanel,
		.zenzaWatchVideoHeaderPanel.is-fullscreen .zenzaVideoSearchPanel {
			top: 64px;
		}
		.zenzaVideoSearchPanel:focus-within {
			background: rgba(50, 50, 50, 0.8);
		}
		.zenzaVideoSearchPanel:not(:focus-within) .focusOnly {
			display: none;
		}
		.zenzaVideoSearchPanel .searchInputHead {
			position: absolute;
			opacity: 0;
			pointer-events: none;
			padding: 4px;
			transition: transform 0.2s ease, opacity 0.2s ease;
		}
		.zenzaVideoSearchPanel .searchInputHead:hover,
		.zenzaVideoSearchPanel:focus-within .searchInputHead {
			background: rgba(50, 50, 50, 0.8);
		}
		.zenzaVideoSearchPanel           .searchInputHead:hover,
		.zenzaVideoSearchPanel:focus-within .searchInputHead {
			pointer-events: auto;
			opacity: 1;
			transform: translate3d(0, -100%, 0);
		}
			.zenzaVideoSearchPanel .searchMode {
				position: absolute;
				opacity: 0;
			}
			.zenzaVideoSearchPanel .searchModeLabel {
				cursor: pointer;
			}
		.zenzaVideoSearchPanel .searchModeLabel span {
				display: inline-block;
				padding: 4px 8px;
				color: #666;
				cursor: pointer;
				border-radius: 8px;
				border-color: transparent;
				border-style: solid;
				border-width: 1px;
				pointer-events: none;
			}
			.zenzaVideoSearchPanel .searchModeLabel:hover span {
				background: #888;
			}
			.zenzaVideoSearchPanel .searchModeLabel input:checked + span {
				color: #ccc;
				border-color: currentColor;
				cursor: default;
			}
		.zenzaVideoSearchPanel .searchWord {
			white-space: nowrap;
			padding: 4px;
		}
			.zenzaVideoSearchPanel .searchWordInput {
				width: 200px;
				margin: 0;
				height: 24px;
				line-height: 24px;
				background: transparent;
				font-size: 16px;
				padding: 0 4px;
				color: #ccc;
				border: 1px solid #ccc;
				opacity: 0;
				transition: opacity 0.2s ease;
				will-change: opacity;
			}
			.zenzaVideoSearchPanel .searchWordInput:-webkit-autofill {
				background: transparent;
			}
			.is-mouseMoving .searchWordInput {
				opacity: 0.5;
			}
			.is-mouseMoving .searchWordInput:hover {
				opacity: 0.8;
			}
			.zenzaVideoSearchPanel:focus-within .searchWordInput {
				opacity: 1 !important;
			}
			.zenzaVideoSearchPanel .searchSubmit {
				width: 34px;
				margin: 0;
				padding: 0;
				font-size: 14px;
				line-height: 24px;
				height: 24px;
				border: solid 1px #ccc;
				cursor: pointer;
				background: #888;
				pointer-events: none;
				opacity: 0;
				transform: translate3d(-100%, 0, 0);
				transition: opacity 0.2s ease, transform 0.2s ease;
			}
			.zenzaVideoSearchPanel:focus-within .searchSubmit {
				pointer-events: auto;
				opacity: 1;
				transform: translate3d(0, 0, 0);
			}
			.zenzaVideoSearchPanel:focus-within .searchSubmit:hover {
				transform: scale(1.5);
			}
			.zenzaVideoSearchPanel:focus-within .searchSubmit:active {
				transform: scale(1.2);
				border-style: inset;
			}
			.zenzaVideoSearchPanel .searchClear {
				display: inline-block;
				width: 28px;
				margin: 0;
				padding: 0;
				font-size: 16px;
				line-height: 24px;
				height: 24px;
				border: none;
				cursor: pointer;
				color: #ccc;
				background: transparent;
				pointer-events: none;
				opacity: 0;
				transform: translate3d(100%, 0, 0);
				transition: opacity 0.2s ease, transform 0.2s ease;
			}
			.zenzaVideoSearchPanel:focus-within .searchClear {
				pointer-events: auto;
				opacity: 1;
				transform: translate3d(0, 0, 0);
			}
			.zenzaVideoSearchPanel:focus-within .searchClear:hover {
				transform: scale(1.5);
			}
			.zenzaVideoSearchPanel:focus-within .searchClear:active {
				transform: scale(1.2);
			}
		.zenzaVideoSearchPanel .searchInputFoot {
			white-space: nowrap;
			position: absolute;
			padding: 4px 0;
			opacity: 0;
			padding: 4px;
			pointer-events: none;
			transition: transform 0.2s ease, opacity 0.2s ease;
			transform: translate3d(0, -100%, 0);
		}
		.zenzaVideoSearchPanel .searchInputFoot:hover,
		.zenzaVideoSearchPanel:focus-within .searchInputFoot {
			pointer-events: auto;
			opacity: 1;
			background: rgba(50, 50, 50, 0.8);
			transform: translate3d(0, 0, 0);
		}
			.zenzaVideoSearchPanel .searchSortSelect,
			.zenzaVideoSearchPanel .searchSortSelect option{
				background: #333;
				color: #ccc;
			}
			.zenzaVideoSearchPanel .autoPauseLabel {
				cursor: pointer;
			}
			.zenzaVideoSearchPanel .autoPauseLabel input + span {
				display: inline-block;
				pointer-events: none;
			}
	`).trim();
VideoSearchForm.__tpl__ = (`
		<div class="zenzaVideoSearchPanel" id="zenzaVideoSearchPanel">
			<form action="javascript: void(0);">
				<div class="searchInputHead">
					<label class="searchModeLabel">
						<input type="radio" name="mode" class="searchMode" value="keyword">
						<span>キーワード</span>
					</label>
					<label class="searchModeLabel">
						<input type="radio" name="mode" class="searchMode" value="tag"
							id="zenzaVideoSearch-tag" checked="checked">
							<span>タグ</span>
					</label>
				</div>
				<div class="searchWord">
					<button class="searchClear command"
						type="button"
						data-command="clear"
						title="クリア">&#x2716;</button>
					<input
						type="text"
						value=""
						autocomplete="on"
						name="word"
						accesskey="e"
						placeholder="簡易検索(テスト中)"
						class="searchWordInput"
						maxlength="75"
						>
					<input
						type="submit"
						value="▶"
						name="post"
						class="searchSubmit"
						>
				</div>
				<div class="searchInputFoot focusOnly">
					<select name="sort" class="searchSortSelect">
						<option value="playlist">自動(連続再生用)</option>
						<option value="f">新しい順</option>
						<option value="h">人気順</option>
						<option value="n">最新コメント</option>
						<option value="r">コメント数</option>
						<option value="m">マイリスト数</option>
						<option value="l">長い順</option>
						<option value="l,a">短い順</option>
					</select>
					<label class="autoPauseLabel">
						<input type="checkbox" name="ownerOnly" checked="checked">
						<span>投稿者の動画のみ</span>
					</label>
				</div>
			</form>
		</div>
	`).toString();
class IchibaItemView extends BaseViewComponent {
	constructor({parentNode}) {
		super({
			parentNode,
			name: 'IchibaItemView',
			template: IchibaItemView.__tpl__,
			css: IchibaItemView.__css__,
		});
		ZenzaWatch.debug.ichiba = this;
	}
	_initDom(...args) {
		super._initDom(...args);
		this._listContainer =
			this._view.querySelector('.ichibaItemListContainer .ichibaItemListInner');
		this._listContainerDetails =
			this._view.querySelector('.ichibaItemListContainer .ichibaItemListDetails');
	}
	_onCommand(command, param) {
		switch (command) {
			case 'load':
				this.load(this._videoId);
				break;
			default:
				super._onCommand(command, param);
		}
	}
	load(videoId) {
		if (this._isLoading) {
			return;
		}
		videoId = videoId || this._videoId;
		this._isLoading = true;
		this.addClass('is-loading');
		return IchibaLoader.load(videoId)
			.then(this._onIchibaLoad.bind(this))
			.catch(this._onIchibaLoadFail.bind(this));
	}
	clear() {
		this.removeClass('is-loading is-success is-fail is-empty');
		this._listContainer.textContent = '';
	}
	_onIchibaLoad(data) {
		this.removeClass('is-loading');
		const div = document.createElement('div');
		div.innerHTML = data.main;
		Array.from(div.querySelectorAll('[id]')).forEach(elm => {
			elm.classList.add(`ichiba-${elm.id}`);
			elm.removeAttribute('id');
		});
		Array.from(div.querySelectorAll('[style]'))
			.forEach(elm => elm.removeAttribute('style'));
		const items = div.querySelectorAll('.ichiba_mainitem');
		if (!items || items.length < 1) {
			this.addClass('is-empty');
			this._listContainer.innerHTML = '<h2>貼られている商品はありません</h2>';
		} else {
			this._listContainer.innerHTML = div.innerHTML;
		}
		this.addClass('is-success');
		this._listContainerDetails.setAttribute('open', 'open');
		this._isLoading = false;
	}
	_onIchibaLoadFail() {
		this.removeClass('is-loading');
		this.addClass('is-fail');
		this._isLoading = false;
	}
	get videoId() {
		return this._videoId;
	}
	set videoId(v) {
		this._videoId = v;
	}
}
IchibaItemView.__tpl__ = (`
		<div class="ZenzaIchibaItemView">
			<div class="loadStart">
				<div class="loadStartButton command" data-command="load">ニコニコ市場</div>
			</div>
			<div class="ichibaLoadingView">
				<div class="loading-inner">
					<span class="spinner">&#8987;</span>
				</div>
			</div>
			<div class="ichibaItemListContainer">
				<details class="ichibaItemListDetails">
					<summary class="ichibaItemSummary loadStartButton">ニコニコ市場</summary>
					<div class="ichibaItemListInner"></div>
				</details>
			</div>
		</div>
		`).trim();
css.addStyle(`
	.ZenzaIchibaItemView .loadStartButton {
		color: #000;
	}
`, {className: 'screenMode for-popup ichiba', disabled: true});
IchibaItemView.__css__ = (`
		.ZenzaIchibaItemView {
			text-align: center;
			margin: 4px 8px 8px;
			color: #ccc;
		}
			.ZenzaIchibaItemView .loadStartButton {
				font-size: 24px;
				padding: 8px 8px;
				margin: 8px;
				background: inherit;
				color: inherit;
				border: 1px solid #ccc;
				outline: none;
				line-height: 20px;
				border-radius: 8px;
				cursor: pointer;
				user-select: none;
			}
			.ZenzaIchibaItemView .loadStartButton:active::after {
				opacity: 0;
			}
			.ZenzaIchibaItemView .loadStartButton:active {
				transform: translate(0, 2px);
			}
			.ZenzaIchibaItemView .ichibaLoadingView,
			.ZenzaIchibaItemView .ichibaItemListContainer {
				display: none;
			}
		.ZenzaIchibaItemView.is-loading {
			cursor: wait;
			user-select: none;
		}
			.ZenzaIchibaItemView.is-loading * {
				pointer-events: none;
			}
			.ZenzaIchibaItemView.is-loading .ichibaLoadingView {
				display: block;
				font-size: 32px;
			}
			.ZenzaIchibaItemView.is-loading .loadStart,
			.ZenzaIchibaItemView.is-loading .ichibaItemListContainer {
				display: none;
			}
		.ZenzaIchibaItemView.is-success {
			background: none;
		}
			.ZenzaIchibaItemView.is-success .ichibaLoadingView,
			.ZenzaIchibaItemView.is-success .loadStart {
				display: none;
			}
			.ZenzaIchibaItemView.is-success .ichibaItemListContainer {
				display: block;
			}
			.ZenzaIchibaItemView.is-success details[open] {
				border: 1px solid #666;
				border-radius: 4px;
				padding: 0px;
			}
			.ZenzaIchibaItemView.is-fail .ichibaLoadingView,
			.ZenzaIchibaItemView.is-fail .loadStartButton {
				display: none;
			}
			.ZenzaIchibaItemView.is-fail .ichibaItemListContainer {
				display: block;
			}
		.ZenzaIchibaItemView .ichibaItemListContainer {
			text-align: center;
		}
			.ZenzaIchibaItemView .ichibaItemListContainer .ichiba-ichiba_mainpiaitem,
			.ZenzaIchibaItemView .ichibaItemListContainer .ichiba_mainitem {
				display: inline-table;
				width: 220px;
				margin: 8px;
				padding: 8px;
				word-break: break-all;
				text-shadow: 1px 1px 0 #000;
				background: #666;
				border-radius: 4px;
			}
			.ZenzaIchibaItemView .price,
			.ZenzaIchibaItemView .buy,
			.ZenzaIchibaItemView .click {
				font-weight: bold;
			}
		.ZenzaIchibaItemView a {
			display: inline-block;
			font-weight: bold;
			text-decoration: none;
			color: #ff9;
			padding: 2px;
		}
		.ZenzaIchibaItemView a:visited {
			color: #ffd;
		}
		.ZenzaIchibaItemView .rowJustify,
		.ZenzaIchibaItemView .noItem,
		.ichiba-ichibaMainLogo,
		.ichiba-ichibaMainHeader,
		.ichiba-ichibaMainFooter {
			display: none;
		}
		`).trim();
class UaaView extends BaseViewComponent {
	constructor({parentNode}) {
		super({
			parentNode,
			name: 'UaaView',
			template: UaaView.__tpl__,
			shadow: UaaView._shadow_,
			css: UaaView.__css__
		});
		this._state = {
			isUpdating: false,
			isExist: false,
			isSpeaking: false
		};
		this._config = Config.namespace('uaa');
		this._bound.load = this.load.bind(this);
		this._bound.update = this.update.bind(this);
	}
	_initDom(...args) {
		super._initDom(...args);
		ZenzaWatch.debug.uaa = this;
		if (!this._shadow) {
			return;
		} // ShadowDOM使えなかったらバイバイ
		const shadow = this._shadow || this._view;
		this._elm.body = shadow.querySelector('.UaaDetailBody');
	}
	update(videoInfo) {
		if (!this._shadow || !this._config.props.enable) {
			return;
		}
		if (!this._elm.body) {
			return;
		}
		if (this._state.isUpdating) {
			return;
		}
		this.setState({isUpdating: true});
		this._props.videoInfo = videoInfo;
		this._props.videoId = videoInfo.videoId;
		window.setTimeout(() => {
			this.load(videoInfo);
		}, 5000);
	}
	load(videoInfo) {
		const videoId = videoInfo.videoId;
		return UaaLoader.load(videoId, {limit: 50})
			.then(this._onLoad.bind(this, videoId))
			.catch(this._onFail.bind(this, videoId));
	}
	clear() {
		this.setState({isUpdating: false, isExist: false, isSpeaking: false});
		if (!this._elm.body) {
			return;
		}
		this._elm.body.textContent = '';
	}
	_onLoad(videoId, result) {
		if (this._props.videoId !== videoId) {
			return;
		}
		this.setState({isUpdating: false});
		const data = result ? result.data : null;
		if (!data || data.sponsors.length < 1) {
			return;
		}
		const df = this.df = this.df || document.createDocumentFragment();
		const div = document.createElement('div');
		div.className = 'screenshots';
		let idx = 0, screenshots = 0;
		data.sponsors.forEach(u => {
			if (!u.auxiliary.bgVideoPosition || idx >= 4) {
				return;
			}
			u.added = true;
			div.append(this._createItem(u, idx++));
			screenshots++;
		});
		div.setAttribute('data-screenshot-count', screenshots);
		df.append(div);
		data.sponsors.forEach(u => {
			if (!u.auxiliary.bgVideoPosition || u.added) {
				return;
			}
			u.added = true;
			df.append(this._createItem(u, idx++));
		});
		data.sponsors.forEach(u => {
			if (u.added) {
				return;
			}
			u.added = true;
			df.append(this._createItem(u, idx++));
		});
		this._elm.body.innerHTML = '';
		this._elm.body.append(df);
		this.setState({isExist: true});
	}
	_createItem(data, idx) {
		const df = document.createElement('div');
		const contact = document.createElement('span');
		contact.textContent = data.advertiserName;
		contact.className = 'contact';
		df.className = 'item';
		const aux = data.auxiliary;
		const bgkeyframe = aux.bgVideoPosition || 0;
		if (data.message) {
			data.title = data.message;
		}
		df.setAttribute('data-index', idx);
		if (bgkeyframe && idx < 4) {
			const sec = parseFloat(bgkeyframe);
			df.setAttribute('data-time', textUtil.secToTime(sec));
			df.classList.add('clickable', 'command', 'other');
			Object.assign(df.dataset, { command: 'seek', type: 'number', param: sec });
			contact.setAttribute('title', `${data.message}(${textUtil.secToTime(sec)})`);
			this._props.videoInfo.getCurrentVideo()
				.then(url => ZenzaWatch.util.VideoCaptureUtil.capture(url, sec))
				.then(screenshot => {
				const cv = document.createElement('canvas');
				const ct = cv.getContext('2d');
				cv.width = screenshot.width;
				cv.height = screenshot.height;
				cv.className = 'screenshot command clickable';
				Object.assign(cv.dataset, { command: 'seek', type: 'number', param: sec });
				ct.fillStyle = 'rgb(32, 32, 32)';
				ct.fillRect(0, 0, cv.width, cv.height);
				ct.drawImage(screenshot, 0, 0);
				df.classList.add('has-screenshot');
				df.classList.remove('clickable', 'other');
				df.append(cv);
			}).catch(() => {});
		} else if (bgkeyframe) {
			const sec = parseFloat(bgkeyframe);
			df.classList.add('clickable', 'command', 'other');
			Object.assign(df.dataset, { command: 'seek', type: 'number', param: sec });
			contact.setAttribute('title', `${data.message}(${textUtil.secToTime(sec)})`);
		} else {
			df.classList.add('other');
		}
		df.append(contact);
		return df;
	}
	_onFail(videoId) {
		if (this._props.videoId !== videoId) {
			return;
		}
		this.setState({isUpdating: false});
	}
	_onCommand(command, param) {
		switch (command) {
			default:
				super._onCommand(command, param);
		}
	}
}
UaaView._shadow_ = (`
		<style>
			.UaaDetails,
			.UaaDetails * {
				box-sizing: border-box;
				user-select: none;
			}
			.UaaDetails .clickable {
				cursor: pointer;
			}
				.UaaDetails .clickable:active {
					transform: translate(0, 2px);
					box-shadow: none;
				}
			.UaaDetails {
				opacity: 0;
				pointer-events: none;
				max-height: 0;
				margin: 0 8px 0;
				color: #ccc;
				overflow: hidden;
				text-align: center;
				word-break: break-all;
			}
				.UaaDetails.is-Exist {
					display: block;
					pointer-events: auto;
					max-height: 800px;
					padding: 4px;
					opacity: 1;
					transition: opacity 0.4s linear 0.4s, max-height 1s ease-in, margin 0.4s ease-in;
				}
				.UaaDetails.is-Exist[open] {
					border: 1px solid #666;
					border-radius: 4px;
					overflow: auto;
				}
			.UaaDetails .uaaSummary {
				height: 38px;
				margin: 4px 4px 8px;
				color: inherit;
				outline: none;
				border: 1px solid #ccc;
				letter-spacing: 12px;
				line-height: 38px;
				font-size: 24px;
				text-align: center;
				cursor: pointer;
				border-radius: 8px;
			}
			.UaaDetails .uaaDetailBody {
				margin: auto;
			}
			.UaaDetails .item {
				display: inline;
				width: inherit;
				margin: 0 4px 0 0;
			}
				.UaaDetails .item.has-screenshot {
					position: relative;
					display:inline-block;
					margin: 4px;
				}
				.UaaDetails .item.has-screenshot::after {
					content: attr(data-time);
					position: absolute;
					right: 0;
					bottom: 0;
					padding: 2px 4px;
					background: #000;
					color: #ccc;
					font-size: 12px;
					line-height: 14px;
				}
				.UaaDetails .item.has-screenshot:hover::after {
					opacity: 0;
				}
			.UaaDetails .contact {
				display: inline-block;
				color: #fff;
				font-weight: bold;
				font-size: 16px;
				text-align: center;
				user-select: none;
				word-break: break-all;
			}
				.UaaDetails .item.has-screenshot .contact {
					position: absolute;
					text-align: center;
					width: 100%;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					color: #fff;
					text-shadow: 1px 1px 1px #000;
					text-stroke: 1px #000;
					-webkit-text-stroke: 1px #000;
					pointer-events: none;
					font-size: 16px;
				}
			.UaaDetails .item.has-screenshot:hover .contact {
					display: none;
				}
				.UaaDetails .item.other {
					display: inline-block;
					border: none;
					width: inherit;
					margin: 0;
					padding: 2px 4px;
					line-height: normal;
					min-height: inherit;
					text-align: left;
				}
					.UaaDetails .item.is-speaking {
						text-decoration: underline;
					}
					.UaaDetails .item.has-screenshot.is-speaking {
						outline: none;
						transition: transform 0.2s ease;
						transform: scale(1.2);
						z-index: 1000;
					}
					.UaaDetails .item .contact {
						display: inline;
						padding: 2px 4px;
						width: auto;
						font-size: 12px;
						text-stroke: 0;
						color: inherit; /*#ccc;*/
						outline-offset: -2px;
					}
				.UaaDetails .item.other.clickable {
					display: inline-block;
					padding: 2px 4px;
					margin: 0 4px;
				}
				.UaaDetails .item.other.clickable .contact {
					display: inline-block;
					color: #ffc;
				}
				.UaaDetails .item.other.clickable .contact::after {
					content: attr(title);
					color: #ccc;
					font-weight: normal;
					margin: 0 4px;
				}
			.UaaDetails .screenshot {
				display: block;
				width: 128px;
				margin: 0;
				vertical-align: middle;
				cursor: pointer;
			}
			.screenshots[data-screenshot-count="1"] .screenshot {
				width: 192px;
			}
			.zenzaScreenMode_sideView .is-notFullscreen .UaaDetails {
				color: #000;
			}
			:host-context(.zenzaScreenMode_sideView .is-notFullscreen) .UaaDetails {
				color: #000;
			}
		</style>
		<details class="root UaaDetails">
			<summary class="uaaSummary clickable">提供</summary>
			<div class="UaaDetailBody"></div>
		</details>
	`).trim();
UaaView.__tpl__ = ('<div class="uaaView"></div>').trim();
UaaView.__css__ = (`
		uaaView {
			display: none;
		}
		uaaView.is-Exist {
		display: block;
		}
	`).trim();
class RelatedInfoMenu extends BaseViewComponent {
	constructor({parentNode, isHeader}) {
		super({
			parentNode,
			name: 'RelatedInfoMenu',
			template: '<div class="RelatedInfoMenu" tabindex="-1"></div>',
			shadow: RelatedInfoMenu._shadow_,
			css: RelatedInfoMenu.__css__
		});
		this._state = {};
		this._bound.update = this.update.bind(this);
		this._bound._onBodyClick = _.debounce(this._onBodyClick.bind(this), 0);
		this.setState({isHeader});
	}
	_initDom(...args) {
		super._initDom(...args);
		ClassList(this._view).toggle('is-Edge', /edge/i.test(navigator.userAgent));
		const shadow = this._shadow || this._view;
		this._elm.body = shadow.querySelector('.RelatedInfoMenuBody');
		this._elm.summary = shadow.querySelector('summary');
		shadow.addEventListener('click', e => {
			e.stopPropagation();
		});
		this._elm.summary.addEventListener('click', _.debounce(() => {
			if (shadow.open) {
				document.body.addEventListener('mouseup', this._bound._onBodyClick, {once: true});
				this.emit('open');
			}
		}, 100));
		this._ginzaLink = shadow.querySelector('.ginzaLink');
		this._originalLink = shadow.querySelector('.originalLink');
		this._twitterLink = shadow.querySelector('.twitterHashLink');
		this._parentVideoLink = shadow.querySelector('.parentVideoLink');
	}
	_onBodyClick() {
		const shadow = this._shadow || this._view;
		shadow.open = false;
		document.body.removeEventListener('mouseup', this._bound._onBodyClick);
		this.emit('close');
	}
	update(videoInfo) {
		const shadow = this._shadow || this._view;
		shadow.open = false;
		this._currentWatchId = videoInfo.watchId;
		this._currentVideoId = videoInfo.videoId;
		this.setState({
			isParentVideoExist: videoInfo.hasParentVideo,
			isCommunity: videoInfo.isCommunityVideo,
			isMymemory: videoInfo.isMymemory
		});
		const vid = this._currentVideoId;
		const wid = this._currentWatchId;
		this._ginzaLink.setAttribute('href', `//www.nicovideo.jp/watch/${wid}`);
		this._originalLink.setAttribute('href', `//www.nicovideo.jp/watch/${vid}`);
		this._twitterLink.setAttribute('href', `https://twitter.com/hashtag/${vid}`);
		this._parentVideoLink.setAttribute('href', `//commons.nicovideo.jp/tree/${vid}`);
		this.emit('close');
	}
	_onCommand(command, param) {
		let url;
		const shadow = this._shadow || this._view;
		shadow.open = false;
		switch (command) {
			case 'watch-ginza':
				window.open(this._ginzaLink.href, 'watchGinza');
				super._onCommand('pause');
				break;
			case 'open-uad':
				url = `//nicoad.nicovideo.jp/video/publish/${this._currentWatchId}?frontend_id=6&frontend_version=0&zenza_watch`;
				window.open(url, '', 'width=428, height=600, toolbar=no, scrollbars=1');
				break;
			case 'open-twitter-hash':
				window.open(this._twitterLink.href);
				break;
			case 'open-parent-video':
				window.open(this._parentVideoLink.href);
				break;
			case 'copy-video-watch-url':
				super._onCommand(command, param);
				super._onCommand('notify', 'コピーしました');
				break;
			case 'open-original-video':
				super._onCommand('openNow', this._currentVideoId);
				break;
			default:
				super._onCommand(command, param);
		}
		this.emit('close');
	}
}
RelatedInfoMenu._css_ = ('').trim();
RelatedInfoMenu._shadow_ = (`
		<style>
			.RelatedInfoMenu,
			.RelatedInfoMenu * {
				box-sizing: border-box;
				user-select: none;
			}
			.RelatedInfoMenu {
				display: inline-block;
				padding: 8px;
				font-size: 16px;
				cursor: pointer;
			}
			.RelatedInfoMenu summary {
				display: inline-block;
				background: transparent;
				color: #333;
				padding: 4px 8px;
				border-radius: 4px;
				outline: none;
				border: 1px solid #ccc;
			}
			.RelatedInfoMenu ul {
				list-style-type: none;
				padding-left: 32px;
			}
			.RelatedInfoMenu li {
				padding: 4px;
			}
			.RelatedInfoMenu li > .command {
				display: inline-block;
				text-decoration: none;
				color: #ccc;
			}
			.RelatedInfoMenu li > .command:hover {
				text-decoration: underline;
			}
			.RelatedInfoMenu li > .command:hover::before {
				content: '▷';
				position: absolute;
				transform: translate(-100%, 0);
			}
				.RelatedInfoMenu .originalLinkMenu,
				.RelatedInfoMenu .parentVideoMenu {
					display: none;
				}
				.RelatedInfoMenu.is-Community        .originalLinkMenu,
				.RelatedInfoMenu.is-Mymemory         .originalLinkMenu,
				.RelatedInfoMenu.is-ParentVideoExist .parentVideoMenu {
					display: block;
				}
			.zenzaScreenMode_sideView .is-fullscreen .RelatedInfoMenu summary{
				background: #888;
			}
			:host-context(.zenzaScreenMode_sideView .is-fullscreen) .RelatedInfoMenu summary {
				background: #888;
			}
			/* :host-contextで分けたいけどFirefox対応のため */
			.RelatedInfoMenu.is-Header {
				font-size: 13px;
				padding: 0 8px;
			}
			.RelatedInfoMenu.is-Header summary {
				background: #666;
				color: #ccc;
				padding: 0 8px;
				border: none;
			}
			.RelatedInfoMenu.is-Header[open] {
				background: rgba(80, 80, 80, 0.9);
			}
			.RelatedInfoMenu.is-Header ul {
				font-size: 16px;
				line-height: 20px;
			}
			:host-context(.zenzaWatchVideoInfoPanel) .RelatedInfoMenu li > .command {
				color: #222;
			}
			.zenzaWatchVideoInfoPanel .RelatedInfoMenu li > .command {
				color: #222;
			}
				/* for Edge */
				.is-Edge .RelatedInfoMenuBody {
					display: none;
					color: #ccc;
					background: rgba(80, 80, 80, 0.9);
				}
				.RelatedInfoMenu[open] .RelatedInfoMenuBody,
				.RelatedInfoMenu:focus .RelatedInfoMenuBody,
				.RelatedInfoMenuBody:hover {
					display: block;
				}
		</style>
		<details class="root RelatedInfoMenu">
			<summary class="RelatedInfoMenuSummary clickable">関連メニュー</summary>
			<div class="RelatedInfoMenuBody">
				<ul>
					<li class="ginzaMenu">
						<a class="ginzaLink command"
							rel="noopener" data-command="watch-ginza">公式プレイヤーで開く</a>
					</li>
					<li class="uadMenu">
						<span class="uadLink command"
							rel="noopener" data-command="open-uad">ニコニ広告で宣伝</span>
					</li>
					<li class="twitterHashMenu">
						<a class="twitterHashLink command"
							rel="noopener" data-command="open-twitter-hash">twitterの反応を見る</a>
					</li>
					<li class="originalLinkMenu">
						<a class="originalLink command"
							rel="noopener" data-command="open-original-video">元動画を開く</a>
					</li>
					<li class="parentVideoMenu">
						<a class="parentVideoLink command"
							rel="noopener" data-command="open-parent-video">親作品・コンテンツツリー</a>
					</li>
					<li class="copyVideoWatchUrlMenu">
						<span class="copyVideoWatchUrlLink command"
							rel="noopener" data-command="copy-video-watch-url">動画URLをコピー</span>
					</li>
				</ul>
			</div>
		</details>
	`).trim();
class VideoMetaInfo extends BaseViewComponent {
	constructor({parentNode}) {
		super({
			parentNode,
			name: 'VideoMetaInfo',
			template: '<div class="VideoMetaInfo"></div>',
			shadow: VideoMetaInfo._shadow_,
			css: VideoMetaInfo.__css__
		});
		this._state = {};
		this._bound.update = this.update.bind(this);
	}
	_initDom(...args) {
		super._initDom(...args);
		const shadow = this._shadow || this._view;
		this._elm = Object.assign({}, this._elm, {
			postedAt: shadow.querySelector('.postedAt'),
			body: shadow.querySelector('.videoMetaInfo'),
			viewCount: shadow.querySelector('.viewCount'),
			commentCount: shadow.querySelector('.commentCount'),
			mylistCount: shadow.querySelector('.mylistCount')
		});
	}
	update(videoInfo) {
		this._elm.postedAt.textContent = videoInfo.postedAt;
		const count = videoInfo.count;
		this.updateVideoCount(count);
	}
	updateVideoCount({comment, view, mylist}) {
		const addComma = m => m.toLocaleString ? m.toLocaleString() : m;
		if (typeof comment === 'number') {
			this._elm.commentCount.textContent = addComma(comment);
		}
		if (typeof view === 'number') {
			this._elm.viewCount.textContent = addComma(view);
		}
		if (typeof mylist === 'number') {
			this._elm.mylistCount.textContent = addComma(mylist);
		}
	}
}
VideoMetaInfo._css_ = ('').trim();
VideoMetaInfo._shadow_ = (`
		<style>
			.VideoMetaInfo .postedAtOuter {
				display: inline-block;
				margin-right: 24px;
			}
			.VideoMetaInfo .postedAt {
				font-weight: bold
			}
			.VideoMetaInfo .countOuter {
				white-space: nowrap;
			}
			.VideoMetaInfo .countOuter .column {
				display: inline-block;
				white-space: nowrap;
			}
			.VideoMetaInfo .count {
				font-weight: bolder;
			}
			.userVideo .channelVideo,
			.channelVideo .userVideo
			{
				display: none !important;
			}
			:host-context(.userVideo) .channelVideo,
			:host-context(.channelVideo) .userVideo
			{
				display: none !important;
			}
		</style>
		<div class="VideoMetaInfo root">
			<span class="postedAtOuter">
				<span class="userVideo">投稿日:</span>
				<span class="channelVideo">配信日:</span>
				<span class="postedAt"></span>
			</span>
			<span class="countOuter">
				<span class="column">再生:       <span class="count viewCount"></span></span>
				<span class="column">コメント:   <span class="count commentCount"></span></span>
				<span class="column">マイリスト: <span class="count mylistCount"></span></span>
			</span>
		</div>
	`);

const initializeGinzaSlayer = (dialog, query) => {
	uq('.notify_update_flash_playerm, #external_nicoplayer').remove();
	const watchId = nicoUtil.getWatchId();
	const options = {};
	if (!isNaN(query.from)) {
		options.currentTime = parseFloat(query.from, 10);
	}
	const v = document.querySelector('#MainVideoPlayer video');
	v && v.pause();
	dialog.open(watchId, options);
};

const {initialize} = (() => {
//@require HoverMenu
	const isOverrideGinza = () => {
		if (window.name === 'watchGinza') {
			return false;
		}
		if (Config.props.overrideGinza && nicoUtil.isZenzaPlayableVideo()) {
			return true;
		}
		return false;
	};
	const initWorker = () => {
		if (!location.host.endsWith('.nicovideo.jp')) { return; }
		CommentLayoutWorker.getInstance();
		ThumbInfoLoader.load('sm9');
		window.console.time('init Workers');
		return Promise.all([
			StoryboardWorker.initWorker(),
			VideoSessionWorker.initWorker(),
			StoryboardCacheDb.initWorker(),
			WatchInfoCacheDb.initWorker()
		]).then(() => window.console.timeEnd('init Workers'));
	};
//@require replaceRedirectLinks
	const initialize = async function (){
		window.console.log('%cinitialize ZenzaWatch...', 'background: lightgreen; ');
		domEvent.dispatchCustomEvent(
			document.body, 'BeforeZenzaWatchInitialize', window.ZenzaWatch, {bubbles: true, composed: true});
		cssUtil.addStyle(CONSTANT.COMMON_CSS, {className: 'common'});
		initializeBySite();
		replaceRedirectLinks();
		const query = textUtil.parseQuery(START_PAGE_QUERY);
		await uq.ready(); // DOMContentLoaded
		const isWatch = util.isGinzaWatchUrl() &&
			(!!document.getElementById('watchAPIDataContainer') ||
				!!document.getElementById('js-initial-watch-data'));
		const hoverMenu = global.debug.hoverMenu = new HoverMenu({playerConfig: Config});
		await Promise.all([
			NicoComment.offscreenLayer.get(Config),
			global.emitter.promise('lit-html'),
			initWorker()
		]);
		document.body.classList.toggle('is-watch', isWatch);
		const dialog = initializeDialogPlayer(Config);
		hoverMenu.setPlayer(dialog);
		if (isWatch) {
			if (isOverrideGinza()) {
				initializeGinzaSlayer(dialog, query);
			}
			if (window.name === 'watchGinza') {
				window.name = '';
			}
		}
		initializeMessage(dialog);
		WatchPageHistory.initialize(dialog);
		initializeExternal(dialog, Config, hoverMenu);
		if (!isWatch) {
			initializeLastSession(dialog);
		}
		CustomElements.initialize();
		window.ZenzaWatch.ready = true;
		global.emitter.emitAsync('ready');
		global.emitter.emitResolve('init');
		domEvent.dispatchCustomEvent(
			document.body, 'ZenzaWatchInitialize', window.ZenzaWatch, {bubbles: true, composed: true});
	};
	const initializeMessage = player => {
		const config = Config;
		const bcast = BroadcastEmitter;
		const onBroadcastMessage = (cmd, type, sessionId) => {
			const isLast = player.isLastOpenedPlayer;
			const isOpen = player.isOpen;
			const {command, params, requestId, now} = cmd;
			let result;
			const localNow = Date.now();
			if (command === 'hello') {
				window.console.log(
					'%cHELLO! \ntime: %s (%smsec)\nmessage: %s \nfrom: %s\nurl: %s\n', 'font-weight: bold;',
					new Date(params.now).toLocaleString(), localNow - now,
					params.message, params.from, params.url,
					{command, isLast, isOpen});
					result = {status: 'ok'};
			} else if (command  === 'sendExecCommand' &&
					(params.command === 'echo' || (isLast && isOpen))) {
				result = player.execCommand(params.command, params.params);
			} else if (command === 'ping' && (params.force || (isLast && isOpen))) {
				window.console.info('pong!');
				result = {status: 'ok'};
			} else if (command === 'pong') {
				result = bcast.emitResolve('ping', params);
			} else if (command  === 'notifyClose' && isOpen) {
				result = player.refreshLastPlayerId();
				return;
			} else if (command  === 'notifyOpen') {
				config.refresh('lastPlayerId');
				return;
			} else if (command ==='pushHistory') {
				const {path, title} = params;
				WatchPageHistory.pushHistoryAgency(path, title);
			} else if (command === 'openVideo' && isLast) {
				const {watchId, query, eventType} = params;
				player.open(watchId, {autoCloseFullScreen: false, query, eventType});
			} else if (command === 'messageResult') {
				if (bcast.hasPromise(params.sessionId)) {
					params.status === 'ok' ?
						bcast.emitResolve(params.sessionId, params) :
						bcast.emitReject(params.sessionId, params);
				}
				return;
			} else {
				return;
			}
			result = result || {status: 'ok'};
			Object.assign(result, {
				playerId: player.getId(),
				title: document.title,
				url: location.href,
				windowId: bcast.windowId,
				sessionId,
				isLast,
				isOpen,
				requestId,
				now: localNow,
				time: localNow - now
			});
			bcast.sendMessage({command: 'messageResult', params: result});
	};
		const onWindowMessage = (cmd, type, sessionId) => {
			const {command, params} = cmd;
			const watchId = cmd.watchId || params.watchId; // 互換のため冗長
			if (watchId && command === 'open') {
				if (config.props.enableSingleton) {
					global.external.sendOrOpen(watchId);
				} else {
					player.open(watchId, {economy: Config.props.forceEconomy});
				}
			} else if (watchId && command === 'send') {
				BroadcastEmitter.sendExecCommand({command: 'openVideo', params: watchId});
			}
		};
		BroadcastEmitter.on('message', (message, type, sessionId) => {
			return type === 'broadcast' ?
				onBroadcastMessage(message, type, sessionId) :
				onWindowMessage(message, type, sessionId);
		});
		player.on('close', () => BroadcastEmitter.notifyClose());
		player.on('open', () => BroadcastEmitter.notifyOpen());
	};
	const initializeExternal = dialog => {
		const command = (command, param) => dialog.execCommand(command, param);
		const open = (watchId, params) => dialog.open(watchId, params);
		const send = (watchId, params) => BroadcastEmitter.sendOpen(watchId, params);
		const sendOrOpen = (watchId, params) => {
			if (dialog.isLastOpenedPlayer) {
				open(watchId, params);
			} else {
				return BroadcastEmitter
					.ping()
					.then(() => send(watchId, params), () => open(watchId, params));
			}
		};
		const importPlaylist = data => PlaylistSession.save(data);
		const exportPlaylist = () => PlaylistSession.restore() || {};
		const sendExecCommand = (command, params) => BroadcastEmitter.sendExecCommand({command, params});
		const sendOrExecCommand = (command, params) => {
			return BroadcastEmitter.ping()
				.then(() => sendExecCommand(command, params),
							() => dialog.execCommand(command, params));
		};
		const playlistAdd = watchId => sendOrExecCommand('playlistAdd', watchId);
		const insertPlaylist = watchId => sendOrExecCommand('playlistInsert', watchId);
		const deflistAdd = ({watchId, description, token}) => {
			const mylistApiLoader = ZenzaWatch.api.MylistApiLoader;
			if (token) {
				mylistApiLoader.setCsrfToken(token);
			}
			return mylistApiLoader.addDeflistItem(watchId, description);
		};
		const deflistRemove = ({watchId, token}) => {
			const mylistApiLoader = ZenzaWatch.api.MylistApiLoader;
			if (token) {
				mylistApiLoader.setCsrfToken(token);
			}
			return mylistApiLoader.removeDeflistItem(watchId);
		};
		const echo = (msg = 'こんにちはこんにちは！') => sendExecCommand('echo', msg);
		Object.assign(ZenzaWatch.external, {
			execCommand: command,
			sendExecCommand,
			sendOrExecCommand,
			open,
			send,
			sendOrOpen,
			deflistAdd,
			deflistRemove,
			hello: BroadcastEmitter.hello,
			ping: BroadcastEmitter.ping,
			echo,
			playlist: {
				add: playlistAdd,
				insert: insertPlaylist,
				import: importPlaylist,
				export: exportPlaylist
			}
		});
		Object.assign(ZenzaWatch.debug, {
			dialog,
			getFrameBodies: () => {
				return Array.from(document.querySelectorAll('.zenzaPlayerContainer iframe')).map(f => f.contentWindow.document.body);
			}
		});
		if (ZenzaWatch !== window.ZenzaWatch) {
			window.ZenzaWatch.external = {
				open,
				sendOrOpen,
				sendOrExecCommand,
				hello: BroadcastEmitter.hello,
				ping: BroadcastEmitter.ping,
				echo,
				playlist: {
					add: playlistAdd,
					insert: insertPlaylist
				}
			};
		}
	};
	const initializeLastSession = dialog => {
		window.addEventListener('beforeunload', () => {
			if (!dialog.isOpen) {
				return;
			}
			PlayerSession.save(dialog.playingStatus);
			dialog.close();
		}, {passive: true});
		PlayerSession.init(sessionStorage);
		let lastSession = PlayerSession.restore();
		let screenMode = Config.props.screenMode;
		if (
			lastSession.playing &&
			(screenMode === 'small' ||
				screenMode === 'sideView' ||
				location.href === lastSession.url ||
				Config.props.continueNextPage
			)
		) {
			lastSession.eventType = 'session';
			dialog.open(lastSession.watchId, lastSession);
		} else {
			PlayerSession.clear();
		}
	};
	const initializeBySite = () => {
		const hostClass = location.host
			.replace(/^.*\.slack\.com$/, 'slack.com')
			.replace(/\./g, '-');
		document.body.dataset.domain = hostClass;
		util.StyleSwitcher.update({on: `style.domain.${hostClass}`});
	};
	const initializeDialogPlayer = (config, offScreenLayer) => {
		console.log('initializeDialog');
		config = PlayerConfig.getInstance(config);
		const state = PlayerState.getInstance(config);
		ZenzaWatch.state.player = state;
		const dialog = new NicoVideoPlayerDialog({
			offScreenLayer,
			config,
			state
		});
		RootDispatcher.initialize(dialog);
		return dialog;
	};
	return {initialize};
})();

const CustomElements = {};
CustomElements.initialize = (() => {
	if (!window.customElements) {
		return;
	}
	class PlaylistAppend extends HTMLElement {
		static get observedAttributes() { return []; }
		static template() {
			return `
				<style>
				* {
					box-sizing: border-box;
					user-select: none;
				}
				:host {
					background: none !important;
					border: none !important;
				}
				.playlistAppend {
					display: inline-block;
					font-size: 16px;
					line-height: 22px;
					width: 24px;
					height: 24px;
					background: #666;
					color: #ccc;
					text-decoration: none;
					border: 1px outset;
					border-radius: 3px;
					cursor: pointer;
					text-align: center;
				}
				.playlistAppend:active {
					border: 1px inset;
				}
				.label {
					text-shadow: 1px 1px #333;
					display: inline-block;
				}
				:host-context(.videoList) .playlistAppend {
					width: 24px;
					height: 20px;
					line-height: 18px;
					border-radius: unset;
				}
				:host-context(.videoOwnerInfoContainer) {
				}
			</style>
			<div class="playlistAppend">
				<div class="label">▶</div></div>
			`;
		}
		constructor() {
			super();
			const shadow = this._shadow = this.attachShadow({mode: 'open'});
			shadow.innerHTML = this.constructor.template();
		}
		disconnectedCallback() {
			this._shadow.textContent = '';
		}
	}
	window.customElements.define('zenza-playlist-append', PlaylistAppend);
	class SeekbarLabel extends HTMLElement {
		static get observedAttributes() { return [
			'time', 'duration', 'text'
		]; }
		static template() {
			return `
				<style>
*, *::after, *::before {
	box-sizing: border-box;
	user-select: none;
}
:host(.owner-comment) * {
	--color: #efa;
	--pointer-color: rgba(128, 255, 128, 0.6);
}
.root * {
	pointer-events: none;
}
.root {
	position: absolute;
	width: 16px;
	height: 16px;
	top: calc(100% - 2px);
	left: 50%;
	color: var(--color, #fea);
	border-style: solid;
	border-width: 8px;
	border-color:
		var(--pointer-color, rgba(255, 128, 128, 0.6))
		transparent
		transparent
		transparent;
}
.label {
	display: inline-block;
	visibility: hidden;
	position: absolute;
	left: -8px;
	bottom: 8px;
	white-space: nowrap;
	padding: 2px 4px;
	background: rgba(0, 0, 0, 0.8);
	border-radius: 4px;
	border-color: var(--pointer-color, rgba(255, 128, 128, 0.6));
	border-style: solid;
	opacity: 0.5;
}
.root:hover .label {
	visibility: visible;
}
			</style>
			<div class="root">
				<span class="label"></span>
			</div>
			`;
		}
		constructor() {
			super();
			const shadow = this._shadow = this.attachShadow({mode: 'open'});
			shadow.innerHTML = this.constructor.template();
			this._root = shadow.querySelector('.root');
			this._label = shadow.querySelector('.label');
			this._updatePos = _.debounce(this._updatePos.bind(this), 100);
			this.props = {
				time: -1,
				duration: 1,
				text: this.getAttribute('text') || this.getAttribute('data-text')
			};
			this._label.textContent = this.props.text;
		}
		_updateTime(t) {
			this.props.time = isNaN(t) ? -1 : t;
			this._updatePos();
		}
		_updateDuration(d) {
			this.props.duration = isNaN(d) ? 1 : d;
			this._updatePos();
		}
		_updatePos() {
			const per = this.props.time / Math.max(this.props.duration, 1) * 100;
			this.hidden = per <= 0;
			this.setAttribute('data-param', this.props.time);
			this._root.style.transform = `translate(${per}vw, 0) translateX(-50%) scale(var(--scale-pp, 1.2))`;
			this._label.style.transform = `translate(-${per}%, 0)`;
		}
		_clear() {
			this._root.classList.toggle('has-screenshot', false);
			this.props.time = -1;
			this.props.duration = 1;
			this.hidden = true;
		}
		hide() {
			this.hidden = true;
		}
		attributeChangedCallback(attr, oldValue, newValue) {
			switch (attr) {
				case 'time':
					this._updateTime(parseFloat(newValue));
					break;
				case 'duration':
					this._updateDuration(parseFloat(newValue));
					break;
				case 'text':
					this._label.textContent = newValue;
					break;
			}
		}
	}
	window.customElements.define('zenza-seekbar-label', SeekbarLabel);
});

const TextLabel = (() => {
	const func = function(self) {
		const items = {};
		const getId = function() {return `id-${this.id++}${Math.random()}`;}.bind({id: 0});
		const create = async ({canvas, style}) => {
			const id = getId();
			const ctx = canvas.getContext('2d', {
				desynchronized: true,
			});
			items[id] = {
				canvas, style, ctx, text: ''
			};
			return setStyle({id, style});
		};
		const setStyle = ({id, style, name}) => {
			const item = items[id];
			if (!item) { throw new Error('unknown id', id); }
			name = name || 'label';
			const {canvas, ctx} = item;
			item.text = '';
			style.widthPx && (canvas.width = style.widthPx * style.ratio);
			style.heightPx && (canvas.height = style.heightPx * style.ratio);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return {id, text: ''};
		};
		const drawText = ({id, text}) => {
			const item = items[id];
			if (!item) { throw new Error('unknown id', id); }
			const {canvas, ctx, style} = item;
			if (item.text === text) {
				return;
			}
			ctx.beginPath();
			ctx.font = `${style.fontWeight || ''} ${style.fontSizePx ? `${style.fontSizePx * style.ratio}px` : ''} ${style.fontFamily || ''}`.trim();
			const measured = ctx.measureText(text);
			let {width, height} = measured;
			height = (height || style.fontSizePx) * style.ratio;
			const left = (canvas.width - width) / 2;
			const top = canvas.height - (canvas.height - height) / 2;
			ctx.fillStyle = style.color;
			ctx.textAlign = style.textAlign;
			ctx.textBaseline = 'bottom';
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillText(text, left, top);
			return {id, text};
		};
		const dispose = ({id}) => {
			delete items[id];
		};
		self.onmessage = async ({command, params}) => {
			switch (command) {
				case 'create':
					return create(params);
				case 'style':
					return setStyle(params);
				case 'drawText':
					return drawText(params);
				case 'dispose':
					return dispose(params);
			}
		};
	};
	const isOffscreenCanvasAvailable = !!HTMLCanvasElement.prototype.transferControlToOffscreen;
	const getContainerStyle = ({container, canvas, ratio}) => {
		let style = window.getComputedStyle(container || document.body);
		ratio = ratio || window.devicePixelRatio;
		const width = (container.offsetWidth || canvas.width) * ratio;
		const height = (container.offsetHeight || canvas.height) * ratio;
		if (!width || !height) {
			style = window.getComputedStyle(document.body);
		}
		return {
			width,
			height,
			font: style.font,
			fontFamily: style.fontFamily,
			fontWeight: style.fontWeight,
			fontSizePx: style.fontSize.replace(/[a-z]/g, '') * 1,
			color: style.color,
			backgroundColor: style.backgroundColor,
			textAlign: style.textAlign,
			ratio
		};
	};
	const NAME = 'TextLabelWorker';
	let worker;
	const initWorker = async () => {
		if (worker) { return worker; }
		if (!isOffscreenCanvasAvailable) {
			if (!worker) {
				worker = {
					name: NAME,
					onmessage: () => {},
					post: ({command, params}) => worker.onmessage({command, params})
				};
				func(worker);
			}
		} else {
			worker = worker || workerUtil.createCrossMessageWorker(func, {name: NAME});
		}
		return worker;
	};
	const create = ({container, canvas, ratio, name, style, text}) => {
		style = style || {};
		ratio = Math.max(ratio || window.devicePixelRatio || 2, 2);
		style.ratio = style.ratio || ratio;
		name = name || 'label';
		if (!canvas) {
			canvas = document.createElement('canvas');
			Object.assign(canvas.style, {
				width: `${style.widthPx}px` || '100%',
				height: `${style.heightPx}px` || '100%',
				backgroundColor: style.backgroundColor || ''
			});
			container && container.append(canvas);
			style.widthPx &&  (canvas.width = Math.max(style.widthPx * ratio));
			style.heightPx && (canvas.height = Math.max(style.heightPx * ratio));
		}
		canvas.dataset.name = name;
		const containerStyle = getContainerStyle({container, canvas, ratio});
		style.fontFamily = style.fontFamily || containerStyle.fontFamily;
		style.fontWeight = style.fontWeight || containerStyle.fontWeight;
		style.color      = style.color      || containerStyle.color;
		const promiseSetup = (async () => {
			const layer = isOffscreenCanvasAvailable ? canvas.transferControlToOffscreen() : canvas;
			const worker = await initWorker();
			const result = await worker.post(
				{command: 'create', params: {canvas: layer, style, name}},
				{transfer: [layer]}
			);
			return result.id;
		})();
		const init = {text};
		const post = async ({command, params}, transfer = {}) => {
			const id = await promiseSetup;
			params = params || {};
			params.id = id;
			return worker.post({command, params}, transfer);
		};
		const result = {
			container,
			canvas,
			style() {
				init.text = '';
				const style = getContainerStyle({container, canvas});
				return post({command: 'style', params: {style, name}});
			},
			async drawText(text) {
				if (init.text === text) {
					return;
				}
				const result = await post({command: 'drawText', params: {text}});
				init.text = result.text;
			},
			get text() { return init.text; },
			set text(t) { this.drawText(t); },
			dispose: () => worker.post({command: 'dispose'})
		};
		text && (result.text = text);
		return result;
	};
	return {create};
})();
ZenzaWatch.modules.TextLabel = TextLabel;

    if (window.name === 'commentLayerFrame') {
      return;
    }

    if (location.host === 'www.nicovideo.jp') {
      return initialize();
    }

    uq.ready().then(() => NicoVideoApi.configBridge(Config)).then(() => {
      window.console.log('%cZenzaWatch Bridge: %s', 'background: lightgreen;', location.host);
      if (document.getElementById('siteHeaderNotification')) {
        return initialize();
      }
      NicoVideoApi.fetch('https://www.nicovideo.jp/',{credentials: 'include'})
        .then(r => r.text())
        .then(result => {
          const $dom = util.$(`<div>${result}</div>`);

          const userData = JSON.parse($dom.find('#CommonHeader')[0].dataset.commonHeader).initConfig.user;
          const isLogin = !!userData.isLogin;
          const isPremium = !!userData.isPremium;
          window.console.log('isLogin: %s isPremium: %s', isLogin, isPremium);
          nicoUtil.isLogin = () => isLogin;
          nicoUtil.isPremium = util.isPremium = () => isPremium;
          initialize();
        });
    }, err => window.console.log('ZenzaWatch Bridge disabled', err));


  }; // end of monkey
(() => {
const dimport = (() => {
	try { // google先生の真似
		return new Function('u', 'return import(u)');
	} catch(e) {
		const map = {};
		let count = 0;
		return url => {
			if (map[url]) {
				return map[url];
			}
			try {
				const now = Date.now();
				const callbackName = `dimport_${now}_${count++}`;
				const loader = `
					import * as module${now} from "${url}";
					console.log('%cdynamic import from "${url}"',
						'font-weight: bold; background: #333; color: #ff9; display: block; padding: 4px; width: 100%;');
					window.${callbackName}(module${now});
					`.trim();
				window.console.time(`"${url}" import time`);
				const p = new Promise((ok, ng) => {
					const s = document.createElement('script');
					s.type = 'module';
					s.onerror = ng;
					s.append(loader);
					s.dataset.import = url;
					window[callbackName] = module => {
						window.console.timeEnd(`"${url}" import time`);
						ok(module);
						delete window[callbackName];
					};
					document.head.append(s);
				});
				map[url] = p;
				return p;
			} catch (e) {
				console.warn(url, e);
				return Promise.reject(e);
			}
		};
	}
})();
function EmitterInitFunc() {
class Handler { //extends Array {
	constructor(...args) {
		this._list = args;
	}
	get length() {
		return this._list.length;
	}
	exec(...args) {
		if (!this._list.length) {
			return;
		} else if (this._list.length === 1) {
			this._list[0](...args);
			return;
		}
		for (let i = this._list.length - 1; i >= 0; i--) {
			this._list[i](...args);
		}
	}
	execMethod(name, ...args) {
		if (!this._list.length) {
			return;
		} else if (this._list.length === 1) {
			this._list[0][name](...args);
			return;
		}
		for (let i = this._list.length - 1; i >= 0; i--) {
			this._list[i][name](...args);
		}
	}
	add(member) {
		if (this._list.includes(member)) {
			return this;
		}
		this._list.unshift(member);
		return this;
	}
	remove(member) {
		this._list = this._list.filter(m => m !== member);
		return this;
	}
	clear() {
		this._list.length = 0;
		return this;
	}
	get isEmpty() {
		return this._list.length < 1;
	}
	*[Symbol.iterator]() {
		const list = this._list || [];
		for (const member of list) {
			yield member;
		}
	}
	next() {
		return this[Symbol.iterator]();
	}
}
Handler.nop = () => {/*     ( ˘ω˘ ) スヤァ    */};
const PromiseHandler = (() => {
	const id = function() { return `Promise${this.id++}`; }.bind({id: 0});
	class PromiseHandler extends Promise {
		constructor(callback = () => {}) {
			const key = new Object({id: id(), callback, status: 'pending'});
			const cb = function(res, rej) {
				const resolve = (...args) => { this.status = 'resolved'; this.value = args; res(...args); };
				const reject  = (...args) => { this.status = 'rejected'; this.value = args; rej(...args); };
				if (this.result) {
					return this.result.then(resolve, reject);
				}
				Object.assign(this, {resolve, reject});
				return callback(resolve, reject);
			}.bind(key);
			super(cb);
			this.resolve = this.resolve.bind(this);
			this.reject = this.reject.bind(this);
			this.key = key;
		}
		resolve(...args) {
			if (this.key.resolve) {
				this.key.resolve(...args);
			} else {
				this.key.result = Promise.resolve(...args);
			}
			return this;
		}
		reject(...args) {
			if (this.key.reject) {
				this.key.reject(...args);
			} else {
				this.key.result = Promise.reject(...args);
			}
			return this;
		}
		addCallback(callback) {
			Promise.resolve().then(() => callback(this.resolve, this.reject));
			return this;
		}
	}
	return PromiseHandler;
})();
const {Emitter} = (() => {
	let totalCount = 0;
	let warnings = [];
	class Emitter {
		on(name, callback) {
			if (!this._events) {
				Emitter.totalCount++;
				this._events = new Map();
			}
			name = name.toLowerCase();
			let e = this._events.get(name);
			if (!e) {
				const handler = new Handler(callback);
				handler.name = name;
				e = this._events.set(name, handler);
			} else {
				e.add(callback);
			}
			if (e.length > 10) {
				console.warn('listener count > 10', name, e, callback);
				!Emitter.warnings.includes(this) && Emitter.warnings.push(this);
			}
			return this;
		}
		off(name, callback) {
			if (!this._events) {
				return;
			}
			name = name.toLowerCase();
			const e = this._events.get(name);
			if (!this._events.has(name)) {
				return;
			} else if (!callback) {
				this._events.delete(name);
			} else {
				e.remove(callback);
				if (e.isEmpty) {
					this._events.delete(name);
				}
			}
			if (this._events.size < 1) {
				delete this._events;
			}
			return this;
		}
		once(name, func) {
			const wrapper = (...args) => {
				func(...args);
				this.off(name, wrapper);
				wrapper._original = null;
			};
			wrapper._original = func;
			return this.on(name, wrapper);
		}
		clear(name) {
			if (!this._events) {
				return;
			}
			if (name) {
				this._events.delete(name);
			} else {
				delete this._events;
				Emitter.totalCount--;
			}
			return this;
		}
		emit(name, ...args) {
			if (!this._events) {
				return;
			}
			name = name.toLowerCase();
			const e = this._events.get(name);
			if (!e) {
				return;
			}
			e.exec(...args);
			return this;
		}
		emitAsync(...args) {
			if (!this._events) {
				return;
			}
			setTimeout(() => this.emit(...args), 0);
			return this;
		}
		promise(name, callback) {
			if (!this._promise) {
				this._promise = new Map;
			}
			const p = this._promise.get(name);
			if (p) {
				return callback ? p.addCallback(callback) : p;
			}
			this._promise.set(name, new PromiseHandler(callback));
			return this._promise.get(name);
		}
		emitResolve(name, ...args) {
			if (!this._promise) {
				this._promise = new Map;
			}
			if (!this._promise.has(name)) {
				this._promise.set(name, new PromiseHandler());
			}
			return this._promise.get(name).resolve(...args);
		}
		emitReject(name, ...args) {
			if (!this._promise) {
				this._promise = new Map;
			}
			if (!this._promise.has(name)) {
				this._promise.set(name, new PromiseHandler);
			}
			return this._promise.get(name).reject(...args);
		}
		resetPromise(name) {
			if (!this._promise) { return; }
			this._promise.delete(name);
		}
		hasPromise(name) {
			return this._promise && this._promise.has(name);
		}
		addEventListener(...args) { return this.on(...args); }
		removeEventListener(...args) { return this.off(...args);}
	}
	Emitter.totalCount = totalCount;
	Emitter.warnings = warnings;
	return {Emitter};
})();
	return {Handler, PromiseHandler, Emitter};
}
const {Handler, PromiseHandler, Emitter} = EmitterInitFunc();
const workerUtil = (() => {
	let config, TOKEN, PRODUCT = 'ZenzaWatch?', netUtil, CONSTANT, NAME = '';
	let global = null, external = null;
	const isAvailable = !!(window.Blob && window.Worker && window.URL);
	const messageWrapper = function(self) {
		const _onmessage = self.onmessage || (() => {});
		const promises = {};
		const onMessage = async function(self, type, e) {
			const {body, sessionId, status} = e.data;
			const {command, params} = body;
			try {
				let result;
				switch (command) {
					case 'commandResult':
						if (promises[sessionId]) {
							if (status === 'ok') {
									promises[sessionId].resolve(params.result);
							} else {
								promises[sessionId].reject(params.result);
							}
							delete promises[sessionId];
						}
					return;
					case 'ping':
						result = {now: Date.now(), NAME, PID, url: location.href};
						break;
					case 'port': {
						const port = e.ports[0];
						portMap[params.name] = port;
						port.addEventListener('message', onMessage.bind({}, port, params.name));
						bindFunc(port, 'MessageChannel');
						if (params.ping) {
							console.time('ping:' + sessionId);
							port.ping().then(result => {
								console.timeEnd('ping:' + sessionId);
								console.log('ok %smec', Date.now() - params.now, params);
							}).catch(err => {
								console.timeEnd('ping:' + sessionId);
								console.warn('ping fail', {err, data: e.data});
							});
						}
					}
						return;
					case 'broadcast': {
						if (!BroadcastChannel) { return; }
						const channel = new BroadcastChannel(`${params.name}`);
						channel.addEventListener('message', onMessage.bind({}, channel, 'BroadcastChannel'));
						bindFunc(channel, 'BroadcastChannel');
						bcast[params.basename] = channel;
					}
						return;
					case 'env':
						({config, TOKEN, PRODUCT, CONSTANT} = params);
						return;
					default:
						result = await _onmessage({command, params}, type, PID);
						break;
					}
				self.postMessage({body:
					{command: 'commandResult', params:
						{command, result}}, sessionId, TYPE: type, PID, status: 'ok'
					});
			} catch(err) {
				console.error('failed', {err, command, params, sessionId, TYPE: type, PID, data: e.data});
				self.postMessage({body:
						{command: 'commandResult', params: {command, result: err.message || null}},
						sessionId, TYPE: type, PID, status: err.status || 'fail'
					});
			}
		};
		self.onmessage = onMessage.bind({}, self, self.name);
		self.onconnect = e => {
			const port = e.ports[0];
			port.onmessage = self.onmessage;
			port.start();
		};
		const bindFunc = (self, type = 'Worker') => {
			const post = function(self, body, options = {}) {
				const sessionId = `recv:${NAME}:${type}:${this.sessionId++}`;
				return new Promise((resolve, reject) => {
					promises[sessionId] = {resolve, reject};
					self.postMessage({body, sessionId, PID}, options.transfer);
					if (typeof options.timeout === 'number') {
						setTimeout(() => {
							reject({status: 'fail', message: 'timeout'});
							delete promises[sessionId];
						}, options.timeout);
					}
				}).finally(() => { delete promises[sessionId]; });
			};
			const emit = function(self, eventName, data = null) {
				self.post({command: 'emit', params: {eventName, data}});
			};
			const notify = function(self, message) {
				self.post({command: 'notify', params: {message}});
			};
			const alert = function(self, message) {
				self.post({command: 'alert', params: {message}});
			};
			const ping = async function(self, options = {}) {
				const timekey = `PING "${self.name}"`;
				console.log(timekey);
				let result;
				options.timeout = options.timeout || 10000;
				try {
					console.time(timekey);
					result = await self.post({command: 'ping', params: {now: Date.now(), NAME, PID, url: location.href}}, options);
					console.timeEnd(timekey);
				} catch (e) {
					console.timeEnd(timekey);
					console.warn('ping fail', e);
				}
				return result;
			};
			self.post = post.bind({sessionId: 0}, this.port || self);
			self.emit = emit.bind({}, self);
			self.notify = notify.bind({}, self);
			self.alert = alert.bind({}, self);
			self.ping = ping.bind({}, self);
			return self;
		};
		bindFunc(self);
		self.xFetch = async (url, options = {}) => {
			options = {...options, ...{signal: null}}; // remove AbortController
			if (url.startsWith(location.origin)) {
				return fetch(url, options);
			}
			const result = await self.post({command: 'fetch', params: {url, options}});
			const {buffer, init, headers} = result;
			const _headers = new Headers();
			(headers || []).forEach(a => _headers.append(...a));
			const _init = {
				status: init.status,
				statusText: init.statusText || '',
				headers: _headers
			};
			return new Response(buffer, _init);
		};
	};
	const workerUtil = {
		isAvailable,
		js: (q, ...args) => {
			const strargs = args.map(a => typeof a === 'string' ? a : a.toString);
			return String.raw(q, ...strargs);
		},
		env: params => {
			({config, TOKEN, PRODUCT, netUtil, CONSTANT, global} =
				Object.assign({config, TOKEN, PRODUCT, netUtil, CONSTANT, global}, params));
			if (global) { ({config, TOKEN, PRODUCT, CONSTANT} = global); }
		},
		create: function(func, options = {}) {
			let cache = this.urlMap.get(func);
			const name = options.name || 'Worker';
			if (!cache) {
				const src = `
				const PID = '${window && window.name || 'self'}:${location.href}:${name}:${Date.now().toString(16).toUpperCase()}';
				console.log('%cinit %s %s', 'font-weight: bold;', self.name || '', '${PRODUCT}', location.origin);
				(${func.toString()})(self);
				`;
				const blob = new Blob([src], {type: 'text/javascript'});
				const url = URL.createObjectURL(blob);
				this.urlMap.set(func, url);
				cache = url;
			}
			if (options.type === 'SharedWorker') {
				const w = this.workerMap.get(func) || new SharedWorker(cache);
				this.workerMap.set(func, w);
				return w;
			}
			return new Worker(cache, options);
		}.bind({urlMap: new Map(), workerMap: new Map()}),
		createCrossMessageWorker: function(func, options = {}) {
			const promises = this.promises;
			const name = options.name || 'Worker';
			const PID = `${window && window.name || 'self'}:${location.host}:${name}:${Date.now().toString(16).toUpperCase()}`;
			const _func = `
			function (self) {
			let config = {}, PRODUCT, TOKEN, CONSTANT, NAME = decodeURI('${encodeURI(name)}'), bcast = {}, portMap = {};
			const {Handler, PromiseHandler, Emitter} = (${EmitterInitFunc.toString()})();
			(${func.toString()})(self);
			//===================================
			(${messageWrapper.toString()})(self);
			}
			`;
			const worker = workerUtil.create(_func, options);
			const self = options.type === 'SharedWorker' ? worker.port : worker;
			self.name = name;
			const onMessage = async function(self, e) {
				const {body, sessionId, status} = e.data;
				const {command, params} = body;
				try {
					let result = 'ok';
					let transfer = null;
					switch (command) {
						case 'commandResult':
							if (promises[sessionId]) {
								if (status === 'ok') {
									promises[sessionId].resolve(params.result);
								} else {
									promises[sessionId].reject(params.result);
								}
								delete promises[sessionId];
							}
							return;
						case 'ping':
								result = {now: Date.now(), NAME, PID, url: location.href};
								console.timeLog && console.timeLog(params.NAME, 'PONG');
								break;
						case 'emit':
							global && global.emitter.emitAsync(params.eventName, params.data);
							break;
						case 'fetch':
							result = await (netUtil || window).fetch(params.url,
								Object.assign({}, params.options || {}, {_format: 'arraybuffer'}));
							transfer = [result.buffer];
							break;
						case 'notify':
							global && global.notify(params.message);
							break;
						case 'alert':
							global && global.alert(params.message);
							break;
						default:
							self.oncommand && (result = await self.oncommand({command, params}));
							break;
					}
					self.postMessage({body: {command: 'commandResult', params: {command, result}}, sessionId, status: 'ok'}, transfer);
				} catch (err) {
					console.error('failed', {err, command, params, sessionId});
					self.postMessage({body: {command: 'commandResult', params: {command, result: err.message || null}}, sessionId, status: err.status || 'fail'});
				}
			};
			const bindFunc = (self, type = 'Worker') => {
				const post = function(self, body, options = {}) {
					const sessionId = `send:${name}:${type}:${this.sessionId++}`;
					return new Promise((resolve, reject) => {
							promises[sessionId] = {resolve, reject};
							self.postMessage({body, sessionId, TYPE: type, PID}, options.transfer);
							if (typeof options.timeout === 'number') {
								setTimeout(() => {
									reject({status: 'fail', message: 'timeout'});
									delete promises[sessionId];
								}, options.timeout);
							}
						}).finally(() => { delete promises[sessionId]; });
				};
				const ping = async function(self, options = {}) {
					const timekey = `PING "${self.name}" total time`;
					window.console.log(`PING "${self.name}"...`);
					let result;
					options.timeout = options.timeout || 10000;
					try {
					window.console.time(timekey);
					result = await self.post({command: 'ping', params: {now: Date.now(), NAME: self.name, PID, url: location.href}}, options);
					window.console.timeEnd(timekey);
					} catch (e) {
						console.timeEnd(timekey);
						console.warn('ping fail', e);
					}
					return result;
				};
				self.post = post.bind({sessionId: 0}, self);
				self.ping = ping.bind({}, self);
				self.addEventListener('message', onMessage.bind({sessionId: 0}, self));
				self.start && self.start();
			};
			bindFunc(self);
			if (config) {
				self.post({
					command: 'env',
					params: {config: config.export(true), TOKEN, PRODUCT, CONSTANT}
				});
			}
			self.addPort = (port, options = {}) => {
				const name = options.name || 'MessageChannel';
				return self.post({command: 'port', params: {port, name}}, {transfer: [port]});
			};
			const channel = new MessageChannel();
			self.addPort(channel.port2);
			bindFunc(channel.port1, {name: 'MessageChannel'});
			self.bridge = async (worker, options = {}) => {
				const name = options.name || 'MessageChannelBridge';
				const channel = new MessageChannel();
				await self.addPort(channel.port1, {name: worker.name || name});
				await worker.addPort(channel.port2, {name: self.name || name});
				console.log('ping self -> other', await channel.port1.ping());
				console.log('ping other -> self', await channel.port2.ping());
			};
			self.BroadcastChannel = basename => {
				const name = `${basename || 'Broadcast'}${TOKEN || Date.now().toString(16)}`;
				self.post({command: 'broadcast', params: {basename, name}});
				const channel = new BroadcastChannel(name);
				channel.addEventListener('message', onMessage.bind({}, channel, 'BroadcastChannel'));
				bindFunc(channel, 'BroadcastChannel');
				return name;
			};
			self.ping()
				.catch(result => console.warn('FAIL', result));
			return self;
		}.bind({
			sessionId: 0,
			promises: {}
		})
	};
	return workerUtil;
})();
const IndexedDbStorage = (() => {
	const workerFunc = function(self) {
		const db = {};
		const controller = {
			async init({name, ver, stores}) {
				if (db[name]) {
					return Promise.resolve(db[name]);
				}
				return new Promise((resolve, reject) => {
					const req = indexedDB.open(name, ver);
					req.onupgradeneeded = e => {
						const _db = e.target.result;
						for (const meta of stores) {
							if(_db.objectStoreNames.contains(meta.name)) {
								_db.deleteObjectStore(meta.name);
							}
							const store = _db.createObjectStore(meta.name, meta.definition);
							const indexes = meta.indexes || [];
							for (const idx of indexes) {
								store.createIndex(idx.name, idx.keyPath, idx.params);
							}
							store.transaction.oncomplete = () => {
								console.log('store.transaction.complete', JSON.stringify({name, ver, store: meta}));
							};
						}
					};
					req.onsuccess = e => {
						db[name] = e.target.result;
						resolve(db[name]);
					};
					req.onerror = reject;
				});
			},
			close({name}) {
				if (!db[name]) {
					return;
				}
				db[name].close();
				db[name] = null;
			},
			async getStore({name, storeName, mode = 'readonly'}) {
				const db = await this.init({name});
				return new Promise(async (resolve, reject) => {
					const tx = db.transaction(storeName, mode);
					tx.onerror = reject;
					return resolve({
						store: tx.objectStore(storeName),
						transaction: tx
					});
				});
			},
			async put({name, storeName, data}) {
				const {store, transaction} = await this.getStore({name, storeName, mode: 'readwrite'});
				return new Promise((resolve, reject) => {
					const req = store.put(data);
					req.onsuccess = e => {
						transaction.commit && transaction.commit();
						resolve(e.target.result);
					};
					req.onerror = reject;
				});
			},
			async get({name, storeName, data: {key, index, timeout}}) {
				const {store} = await this.getStore({name, storeName});
				return new Promise((resolve, reject) => {
					const req =
						index ?
							store.index(index).get(key) : store.get(key);
					req.onsuccess = e => resolve(e.target.result);
					req.onerror = reject;
					if (timeout) {
						setTimeout(() => {
							reject(`timeout: key${key}`);
						}, timeout);
					}
				});
			},
			async updateTime({name, storeName, data: {key, index, timeout}}) {
				const record = await this.get({name, storeName, data: {key, index, timeout}});
				if (!record) {
					return null;
				}
				record.updatedAt = Date.now();
				this.put({name, storeName, data: record});
				return record;
			},
			async delete({name, storeName, data: {key, index}}) {
				const {store, transaction} = await this.getStore({name, storeName, mode: 'readwrite'});
				return new Promise((resolve, reject) => {
					let remove = 0;
					let range = IDBKeyRange.only(key);
					let req =
						index ?
							store.index(index).openCursor(range) : store.openCursor(range);
					req.onsuccess = e =>  {
						const result = e.target.result;
						if (!result) {
							transaction.commit && transaction.commit();
							return resolve(remove > 0);
						}
						result.delete();
						remove++;
						result.continue();
					};
					req.onerror = reject;
				});
			},
			async clear({name, storeName}) {
				const {store} = await this.getStore({name, storeName, mode: 'readwrite'});
				return new Promise((resolve, reject) => {
					const req = store.clear();
					req.onsuccess = e => {
						console.timeEnd('storage clear');
						resolve();
					};
					req.onerror = e => {
						console.timeEnd('storage clear');
						reject(e);
					};
				});
			},
			async gc({name, storeName, data: {expireTime, index}}) {
				index = index || 'updatedAt';
				const {store, transaction} = await this.getStore({name, storeName, mode: 'readwrite'});
				const now = Date.now(), ptime = performance.now();
				const expiresAt = (index !== 'expiresAt') ? (now - expireTime) : now;
				const expireDateTime = new Date(expiresAt).toLocaleString();
				const timekey = `GC [DELETE FROM ${name}.${storeName} WHERE ${index} < '${expireDateTime}'] `;
				console.time(timekey);
				let count = 0;
				return new Promise((resolve, reject) => {
					const range = IDBKeyRange.upperBound(expiresAt);
					const idx = store.index(index);
					const req = idx.openCursor(range);
					req.onsuccess = e => {
						const cursor = e.target.result;
						if (cursor) {
							count++;
							cursor.delete();
							return cursor.continue();
						}
						console.timeEnd(timekey);
						resolve({status: 'ok', count, time: performance.now() - ptime});
						count && console.log('deleted %s records.', count);
					};
					req.onerror = reject;
				}).catch(e => {
					console.error('gc fail', {name, storeName, data: {expireTime, index}, timekey}, e);
					store.clear();
				});
			}
		};
		self.onmessage = async ({command, params}) => {
			try {
			switch (command) {
				case 'init':
					await controller[command](params);
					return 'ok';
				case 'put':
					return controller.put(params);
				case 'updateTime':
				case 'get':
					return controller[command](params);
				default:
					return controller[command](params) || 'ok';
				}
			} catch (err) {
				console.warn('command failed: ', {command, params});
				throw err;
			}
		};
		return controller;
	};
	const workers = new Map;
	const open = async ({name, ver, stores}, func) => {
		let worker;
		if (func) {
			let _func = workerFunc;
			if (func) {
				_func = `
				(() => {
				const controller = (${workerFunc.toString()})(self);
				(${func.toString()})(self)
				})
				`;
			}
			worker = workers.get(func) || workerUtil.createCrossMessageWorker(_func, {name: `IndexedDb[${name}]`});
			workers.set(func, worker);
		} else {
			worker = workers.get(workerFunc) || workerUtil.createCrossMessageWorker(workerFunc, {name: 'IndexedDb'});
			workers.set(workerFunc, worker);
		}
		worker.post({command: 'init', params: {name, ver, stores}});
		const post = (command, data, storeName, transfer) => {
			const params = {data, name, storeName, transfer};
			return worker.post({command, params}, transfer);
		};
		const result = {worker};
		for (const meta of stores) {
			const storeName = meta.name;
			result[storeName] = (storeName => {
				return {
					close: params => post('close', params, storeName),
					put: (record, transfer) => post('put', record, storeName, transfer),
					get: ({key, index, timeout}) => post('get', {key, index, timeout}, storeName),
					updateTime: ({key, index, timeout}) => post('updateTime', {key, index, timeout}, storeName),
					delete: ({key, index, timeout}) => post('delete', {key, index, timeout}, storeName),
					gc: (expireTime = 30 * 24 * 60 * 60 * 1000, index = 'updatedAt') => post('gc', {expireTime, index}, storeName)
				};
			})(storeName);
		}
		return result;
	};
	return {open};
})();
const WatchInfoCacheDb = (() => {
	const WATCH_INFO = {
		name: 'watch-info',
		ver: 2,
		stores: [
			{
				name: 'cache',
				indexes: [
					{name: 'videoId',    keyPath: 'videoId',    params: {unique: false}},
					{name: 'threadId',   keyPath: 'threadId',   params: {unique: false}},
					{name: 'ownerId',    keyPath: 'ownerId',    params: {unique: false}},
					{name: 'watchCount', keyPath: 'watchCount', params: {unique: false}},
					{name: 'postedAt',   keyPath: 'postedAt',   params: {unique: false}},
					{name: 'updatedAt',  keyPath: 'updatedAt',  params: {unique: false}},
				],
				definition: {keyPath: 'watchId', autoIncrement: false}
			}
		]
	};
	let db, instance, NicoVideoApi;
	const initWorker = async () => {
		if (db) { return db; }
		if (location.host === 'www.nicovideo.jp') {
			db = db || await IndexedDbStorage.open(WATCH_INFO);
		} else {
			db = db || await NicoVideoApi.bridgeDb(WATCH_INFO);
		}
		return db;
	};
	const open = async () => {
		if (instance) { return instance; }
		await initWorker();
		const cacheDb = db['cache'];
		return instance = {
			async put(watchId, options = {}) {
				const videoInfo = options.videoInfo || null;
				const videoInfoRawData = (videoInfo && videoInfo.getData) ? videoInfo.getData() : videoInfo;
				const cache = await this.get(watchId) || {};
				const now = Date.now();
				const videoId = videoInfo ? videoInfo.videoId : watchId;
				const postedAt = videoInfo ? new Date(videoInfo.postedAt).getTime() : 0;
				const threadId = videoInfo ? (videoInfo.threadId * 1) : 0;
				const updatedAt = Date.now();
				const resume = cache.resume || [];
				const watchCount = (cache.watchCount || 0) + (options.watchCount === 1 ? 1 : 0);
				typeof options.currentTime === 'number' && options.currentTime > 0 &&
					(resume.unshift({now, time: options.currentTime}));
				resume.length = Math.min(10, resume.length);
				const ownerId = videoInfo && videoInfo.owner.id ?
					`${videoInfo.isChannel? 'ch' : 'user/'}${videoInfo.owner.id}` : '';
				const comment = cache.comment || [];
				options.comment && (comment.push(comment));
				const record = {
					watchId,
					videoId:  (cache.videoId  ? cache.videoId  : videoId) || '',
					threadId: (cache.threadId ? cache.threadId : threadId) || '',
					ownerId:  (ownerId ? ownerId : cache.ownerId) || '',
					watchCount,
					postedAt: cache && cache.postedAt ? cache.postedAt : postedAt,
					updatedAt,
					videoInfo: videoInfoRawData ? videoInfoRawData : cache.videoInfo,
					threadInfo: (options.threadInfo ? options.threadInfo : cache.threadInfo) || 0,
					comment,
					resume,
					heatMap:    (options.heatMap    ? options.heatMap    : cache.heatMap) || null,
					config:     (options.config     ? options.config     : cache.config) || ''
				};
				cacheDb.put(record);
				return record;
			},
			get(watchId) { return cacheDb.updateTime({key: watchId}); },
			delete(watchId) { return cacheDb.delete({key: watchId}); },
			close() { return cacheDb.close(); },
			gc(expireTime) { return cacheDb.gc(expireTime); }
		};
	};
	const put = (watchId, options = {}) => open().then(db => db.put(watchId, options));
	const get = watchId => open().then(db => db.get(watchId));
	const del = watchId => open().then(db => db.delete(watchId));
	const close = () => open().then(db => db.close());
	const gc = (expireTime) => open().then(db => db.gc(expireTime));
	const api = api => NicoVideoApi = api;
	return {initWorker, open, put, get, delete: del, close, gc, api};
})();
function parseThumbInfo(xmlText) {
	if (typeof xmlText !== 'string' || xmlText.status === 'ok') {
		return xmlText;
	}
	const parser = new DOMParser();
	const xml = parser.parseFromString(xmlText, 'text/xml');
	const val = name => {
		const elms = xml.getElementsByTagName(name);
		if (elms.length < 1) {
			return null;
		}
		return elms[0].textContent;
	};
	const dateToString = dateString => {
		const date = new Date(dateString);
		const [yy, mm, dd, h, m, s] = [
				date.getFullYear(),
				date.getMonth() + 1,
				date.getDate(),
				date.getHours(),
				date.getMinutes(),
				date.getSeconds()
			].map(n => n.toString().padStart(2, '0'));
		return `${yy}/${mm}/${dd} ${h}:${m}:${s}`;
	};
	const resp = xml.getElementsByTagName('nicovideo_thumb_response');
	if (resp.length < 1 || resp[0].getAttribute('status') !== 'ok') {
		return {
			status: 'fail',
			code: val('code'),
			message: val('description')
		};
	}
	const [min, sec] = val('length').split(':');
	const duration = min * 60 + sec * 1;
	const watchId = val('watch_url').split('/').reverse()[0];
	const postedAt = dateToString(new Date(val('first_retrieve')));
	const tags = [...xml.getElementsByTagName('tag')].map(tag => {
			return {
				text: tag.textContent,
				category: tag.hasAttribute('category'),
				lock: tag.hasAttribute('lock')
			};
		});
	const videoId = val('video_id');
	const isChannel = videoId.substring(0, 2) === 'so';
	const result = {
		status: 'ok',
		_format: 'thumbInfo',
		v: isChannel ? videoId : watchId,
		id: videoId,
		videoId,
		watchId: isChannel ? videoId : watchId,
		originalVideoId: (!isChannel && watchId !== videoId) ? videoId : '',
		isChannel,
		title: val('title'),
		description: val('description'),
		thumbnail: val('thumbnail_url').replace(/^http:/, 'https:'),
		movieType: val('movie_type'),
		lastResBody: val('last_res_body'),
		duration,
		postedAt,
		mylistCount: parseInt(val('mylist_counter'), 10),
		viewCount: parseInt(val('view_counter'), 10),
		commentCount: parseInt(val('comment_num'), 10),
		tagList: tags
	};
	const userId = val('user_id');
	if (userId !== null && userId !== '') {
		result.owner = {
			type: 'user',
			id: userId,
			linkId: userId ? `user/${userId}` : '',
			name: val('user_nickname') || '(非公開ユーザー)',
			url: userId ? ('https://www.nicovideo.jp/user/' + userId) : '#',
			icon: val('user_icon_url') || 'https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg'
		};
	}
	const channelId = val('ch_id');
	if (channelId !== null && channelId !== '') {
		result.owner = {
			type: 'channel',
			id: channelId,
			linkId: channelId ? `ch${channelId}` : '',
			name: val('ch_name') || '(非公開チャンネル)',
			url: 'https://ch.nicovideo.jp/ch' + channelId,
			icon: val('ch_icon_url') || 'https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg'
		};
	}
	return result;
}
const StoryboardCacheDb = (() => {
	const WATCH_INFO = {
		name: 'storyboard',
		ver: 2,
		stores: [
			{
				name: 'cache',
				indexes: [
					{name: 'updatedAt',  keyPath: 'updatedAt',  params: {unique: false}},
				],
				definition: {keyPath: 'watchId', autoIncrement: false}
			}
		]
	};
	let db, instance, NicoVideoApi;
	const initWorker = async () => {
		if (db) { return db; }
		if (location.host === 'www.nicovideo.jp') {
			db = db || await IndexedDbStorage.open(WATCH_INFO);
		} else {
			db = db || await NicoVideoApi.bridgeDb(WATCH_INFO);
		}
		return db;
	};
	const open = async () => {
		if (instance) { return instance; }
		await initWorker();
		const cacheDb = db['cache'];
		instance = {
			async put(watchId, sbInfo = {}) {
				if (sbInfo.status !== 'ok') {
					console.warn('invalid sbInfo', watchId, sbInfo);
					return;
				}
				const record = {
					watchId,
					updatedAt: Date.now(),
					sbInfo
				};
				cacheDb.put(record);
				return record;
			},
			async get(watchId) {
				const record = await cacheDb.updateTime({key: watchId});
				if (!record) { return null; }
				return record.sbInfo;
			},
			delete(watchId) { return cacheDb.delete({key: watchId}); },
			close() { return cacheDb.close(); },
			gc(expireTime) { return cacheDb.gc(expireTime); }
		};
		instance.gc(7 * 24 * 60 * 60 * 1000);
		return instance;
	};
	const put = (watchId, sbInfo = {}) => open().then(db => db.put(watchId, sbInfo));
	const get = watchId => open().then(db => db.get(watchId));
	const del = watchId => open().then(db => db.delete(watchId));
	const close = () => open().then(db => db.close());
	const gc = (expireTime = 24 * 60 * 60 * 1000) => open().then(db => db.gc(expireTime));
	const api = api => NicoVideoApi = api;
	return {initWorker, open, put, get, delete: del, close, gc, db, api};
})();
const VideoSessionWorker = (() => {
	const func = function(self) {
		const SMILE_HEART_BEAT_INTERVAL_MS = 10 * 60 * 1000; // 10min
		const DMC_HEART_BEAT_INTERVAL_MS = 30 * 1000;      // 30sec
		const SESSION_CLOSE_FAIL_COUNT = 3;
		const VIDEO_QUALITY = {
			auto: /.*/,
			veryhigh: /_(1080p)$/,
			high: /_(720p)$/,
			mid: /_(540p|480p)$/,
			low: /_(360p)$/
		};
		const util = {
			fetch(url, params = {}) { // ブラウザによっては location.origin は 'blob:' しか入らない
				if (!location.origin.endsWith('.nicovideo.jp') && !/^blob:https?:\/\/[a-z0-9]+\.nicovideo\.jp\//.test(location.href)) {
					return self.xFetch(url, params);
				}
				const racers = [];
				let timer;
				const timeout = (typeof params.timeout === 'number' && !isNaN(params.timeout)) ? params.timeout : 30 * 1000;
				if (timeout > 0) {
					racers.push(new Promise((resolve, reject) =>
						timer = setTimeout(() => timer ? reject({name: 'timeout', message: 'timeout'}) : resolve(), timeout))
					);
				}
				const controller = AbortController ? (new AbortController()) : null;
				if (controller) {
					params.signal = controller.signal;
				}
				racers.push(fetch(url, params));
				return Promise.race(racers).catch(err => {
					if (err.name === 'timeout') {
						console.warn('request timeout', url, params);
						if (controller) {
							controller.abort();
						}
					}
					return Promise.reject(err.message || err);
				}).finally(() => timer = null);
			}
		};
		class DmcPostData {
			constructor(dmcInfo, videoQuality, {useHLS = true, useSSL = false}) {
				this._dmcInfo = dmcInfo;
				this._videoQuality = videoQuality || 'auto';
				this._useHLS = useHLS;
				this._useSSL = useSSL;
				this._useWellKnownPort = true;
			}
			toString() {
				let dmcInfo = this._dmcInfo;
				let videos = [];
				let availableVideos =
						dmcInfo.videos.filter(v => v.isAvailable)
								.sort((a, b) => b.levelIndex - a.levelIndex);
				let reg = VIDEO_QUALITY[this._videoQuality] || VIDEO_QUALITY.auto;
				if (reg === VIDEO_QUALITY.auto) {
					videos = availableVideos.map(v => v.id);
				} else {
					availableVideos.forEach(format => {
						if (reg.test(format.id)) {
							videos.push(format.id);
						}
					});
					if (videos.length < 1) {
						videos[0] = availableVideos[0].id;
					}
				}
				let audios = [dmcInfo.audios[0]];
				let contentSrcIdSets =
					(this._useHLS && reg === VIDEO_QUALITY.auto) ?
						this._buildAbrContentSrcIdSets(videos, audios) :
						this._buildContentSrcIdSets(videos, audios);
				let http_parameters = {};
				let parameters = {
					use_ssl: this._useSSL ? 'yes' : 'no',
					use_well_known_port: this._useWellKnownPort ? 'yes' : 'no',
					transfer_preset: dmcInfo.transferPreset
				};
				if (this._useHLS) {
					parameters.segment_duration = 6000;//Config.getValue('video.hls.segmentDuration');
					if (dmcInfo.encryption){
						parameters.encryption = {
							hls_encryption_v1 : {
								encrypted_key : dmcInfo.encryption.encryptedKey,
								key_uri : dmcInfo.encryption.keyUri
							}
						};
					}
				} else if (!dmcInfo.protocols.includes('http')) {
					throw new Error('HLSに未対応');
				}
				http_parameters.parameters = this._useHLS ?
					{hls_parameters: parameters} :
					{http_output_download_parameters: parameters};
				const request = {
					session: {
						client_info: {
							player_id: dmcInfo.playerId
						},
						content_auth: {
							auth_type: dmcInfo.authTypes[this._useHLS ? 'hls' : 'http'] || 'ht2',
							content_key_timeout: 600 * 1000,
							service_id: 'nicovideo',
							service_user_id: dmcInfo.serviceUserId,
						},
						content_id: dmcInfo.contentId,
						content_src_id_sets: contentSrcIdSets,
						content_type: 'movie',
						content_uri: '',
						keep_method: {
							heartbeat: {lifetime: dmcInfo.heartBeatLifeTimeMs}
						},
						priority: dmcInfo.priority,
						protocol: {
							name: 'http',
							parameters: {http_parameters}
						},
						recipe_id: dmcInfo.recipeId,
						session_operation_auth: {
							session_operation_auth_by_signature: {
								signature: dmcInfo.signature,
								token: dmcInfo.token
							}
						},
						timing_constraint: 'unlimited'
					}
				};
				return JSON.stringify(request, null, 2);
			}
			_buildContentSrcIdSets(videos, audios) {
				return [
					{
						content_src_ids: [
							{
								src_id_to_mux: {
									audio_src_ids: audios,
									video_src_ids: videos
								}
							}
						]
					}
				];
			}
			_buildAbrContentSrcIdSets(videos, audios) {
				const v = videos.concat();
				const contentSrcIds = [];
				while (v.length > 0) {
					contentSrcIds.push({
						src_id_to_mux: {
							audio_src_ids: [audios[0]],
							video_src_ids: v.concat()
						}
					});
					v.shift();
				}
				return [{content_src_ids: contentSrcIds}];
			}
		}
		class VideoSession {
			static create(params) {
				if (params.serverType === 'dmc') {
					return new DmcSession(params);
				} else {
					return new SmileSession(params);
				}
			}
			constructor(params) {
				this._videoInfo = params.videoInfo;
				this._dmcInfo = params.dmcInfo;
				this._isPlaying = () => true;
				this._pauseCount = 0;
				this._failCount = 0;
				this._lastResponse = '';
				this._videoQuality = params.videoQuality || 'auto';
				this._videoSessionInfo = {};
				this._isDeleted = false;
				this._isAbnormallyClosed = false;
				this._heartBeatTimer = null;
				this._useSSL = !!params.useSSL;
				this._useWellKnownPort = true;
				this._onHeartBeatSuccess = this._onHeartBeatSuccess.bind(this);
				this._onHeartBeatFail = this._onHeartBeatFail.bind(this);
			}
			connect() {
				this._createdAt = Date.now();
				return this._createSession(this._videoInfo, this._dmcInfo);
			}
			enableHeartBeat() {
				this.disableHeartBeat();
				this._heartBeatTimer =
					setInterval(this._onHeartBeatInterval.bind(this), this._heartBeatInterval);
			}
			changeHeartBeatInterval(interval) {
				if (this._heartBeatTimer) {
					clearInterval(this._heartBeatTimer);
				}
				this._heartBeatInterval = interval;
				this._heartBeatTimer =
					setInterval(this._onHeartBeatInterval.bind(this), this._heartBeatInterval);
			}
			disableHeartBeat() {
				if (this._heartBeatTimer) {
					clearInterval(this._heartBeatTimer);
				}
				this._heartBeatTimer = null;
			}
			_onHeartBeatInterval() {
				if (this._isClosed) {
					return;
				}
				this._heartBeat();
			}
			_onHeartBeatSuccess() {}
			_onHeartBeatFail() {
				this._failCount++;
				if (this._failCount >= SESSION_CLOSE_FAIL_COUNT) {
					this._isAbnormallyClosed = true;
					this.close();
				}
			}
			close() {
				this._isClosed = true;
				this.disableHeartBeat();
				return this._deleteSession();
			}
			get isDeleted() {
				return !!this._isDeleted;
			}
			get isDmc() {
				return this._serverType === 'dmc';
			}
			get isAbnormallyClosed() {
				return this._isAbnormallyClosed;
			}
		}
		class DmcSession extends VideoSession {
			constructor(params) {
				super(params);
				this._serverType = 'dmc';
				this._heartBeatInterval = DMC_HEART_BEAT_INTERVAL_MS;
				this._onHeartBeatSuccess = this._onHeartBeatSuccess.bind(this);
				this._onHeartBeatFail = this._onHeartBeatFail.bind(this);
				this._useHLS = typeof params.useHLS === 'boolean' ? params.useHLS : true;
				this._lastUpdate = Date.now();
				this._heartbeatLifeTime = this._heartbeatInterval;
			}
			_createSession(videoInfo, dmcInfo) {
				console.time('create DMC session');
				const baseUrl = (dmcInfo.urls.find(url => url.is_well_known_port === this._useWellKnownPort) || dmcInfo.urls[0]).url;
				return new Promise((resolve, reject) => {
					const url = `${baseUrl}?_format=json`;
					this._heartbeatLifeTime = dmcInfo.heartbeatLifeTime;
					const postData = new DmcPostData(dmcInfo, this._videoQuality, {
						useHLS: this.useHLS,
						useSSL: url.startsWith('https://'),
						useWellKnownPort: true
					});
					util.fetch(url, {
						method: 'post',
						timeout: 10000,
						dataType: 'text',
						body: postData.toString()
					}).then(res => res.json())
						.then(json => {
							const data = json.data || {}, session = data.session || {};
							let sessionId = session.id;
							let content_src_id_sets = session.content_src_id_sets;
							let videoFormat =
								content_src_id_sets[0].content_src_ids[0].src_id_to_mux.video_src_ids[0];
							let audioFormat =
								content_src_id_sets[0].content_src_ids[0].src_id_to_mux.audio_src_ids[0];
							this._heartBeatUrl =
								`${baseUrl}/${sessionId}?_format=json&_method=PUT`;
							this._deleteSessionUrl =
								`${baseUrl}/${sessionId}?_format=json&_method=DELETE`;
							this._lastResponse = data;
							this._lastUpdate = Date.now();
							this._videoSessionInfo = {
								type: 'dmc',
								url: session.content_uri,
								sessionId,
								videoFormat,
								audioFormat,
								heartBeatUrl: this._heartBeatUrl,
								deleteSessionUrl: this._deleteSessionUrl,
								lastResponse: json
							};
							this.enableHeartBeat();
							console.timeEnd('create DMC session');
							resolve(this._videoSessionInfo);
						}).catch(err => {
						console.error('create api fail', err);
						reject(err.message || err);
					});
				});
			}
			get useHLS() {
				return this._useHLS &&
					this._dmcInfo.protocols.includes('hls');
			}
			_heartBeat() {
				let url = this._videoSessionInfo.heartBeatUrl;
				util.fetch(url, {
					method: 'post',
					dataType: 'text',
					timeout: 10000,
					body: JSON.stringify(this._lastResponse)
				}).then(res => res.json())
					.then(this._onHeartBeatSuccess)
					.catch(this._onHeartBeatFail);
			}
			_deleteSession() {
				if (this._isDeleted) {
					return Promise.resolve();
				}
				this._isDeleted = true;
				let url = this._videoSessionInfo.deleteSessionUrl;
				return new Promise(res => setTimeout(res, 3000)).then(() => {
					return util.fetch(url, {
						method: 'post',
						dataType: 'text',
						timeout: 10000,
						body: JSON.stringify(this._lastResponse)
					});
				}).catch(err => console.error('delete fail', err));
			}
			_onHeartBeatSuccess(result) {
				let json = result;
				this._lastResponse = json.data;
				this._lastUpdate = Date.now();
			}
			get isDeleted() {
				return !!this._isDeleted || (Date.now() - this._lastUpdate) > this._heartbeatLifeTime * 1.2;
			}
		}
		class SmileSession extends VideoSession {
			constructor(params) {
				super(params);
				this._serverType = 'smile';
				this._heartBeatInterval = SMILE_HEART_BEAT_INTERVAL_MS;
				this._onHeartBeatSuccess = this._onHeartBeatSuccess.bind(this);
				this._onHeartBeatFail = this._onHeartBeatFail.bind(this);
				this._lastUpdate = Date.now();
			}
			_createSession(videoInfo) {
				this.enableHeartBeat();
				return Promise.resolve(videoInfo.videoUrl);
			}
			_heartBeat() {
				let url = this._videoInfo.watchUrl;
				let query = [
					'mode=pc_html5',
					'playlist_token=' + this._videoInfo.playlistToken,
					'continue_watching=1',
					'watch_harmful=2'
				];
				if (this._videoInfo.isEconomy) {
					query.push(this._videoInfo.isEconomy ? 'eco=1' : 'eco=0');
				}
				if (query.length > 0) {
					url += '?' + query.join('&');
				}
				util.fetch(url, {
					timeout: 10000,
					credentials: 'include'
				}).then(res => res.json())
					.then(this._onHeartBeatSuccess)
					.catch(this._onHeartBeatFail);
			}
			_deleteSession() {
				if (this._isDeleted) {
					return Promise.resolve();
				}
				this._isDeleted = true;
				return Promise.resolve();
			}
			_onHeartBeatSuccess(result) {
				this._lastResponse = result;
				if (result.status !== 'ok') {
					return this._onHeartBeatFail();
				}
				this._lastUpdate = Date.now();
				if (result && result.flashvars && result.flashvars.watchAuthKey) {
					this._videoInfo.watchAuthKey = result.flashvars.watchAuthKey;
				}
			}
			get isDeleted() {
				return this._isDeleted || (Date.now() - this._lastUpdate > 10 * 60 * 1000);
			}
		}
		const DmcStoryboardInfoLoader = (() => {
			const parseStoryboard = sb => {
				const result = {
					id: 0,
					urls: [],
					quality: sb.quality,
					thumbnail: {
						width: sb.thumbnail_width,
						height: sb.thumbnail_height,
						number: null,
						interval: sb.interval
					},
					board: {
						rows: sb.rows,
						cols: sb.columns,
						number: sb.images.length
					}
				};
				sb.images.forEach(image => result.urls.push(image.uri));
				return result;
			};
			const parseMeta = meta => {
				const result = {
					format: 'dmc',
					status: meta.meta.message,
					url: null,
					movieId: null,
					storyboard: []
				};
				meta.data.storyboards.forEach(sb => {
					result.storyboard.unshift(parseStoryboard(sb));
				});
				result.storyboard.sort((a, b) => {
					if (a.quality < b.quality) {
						return 1;
					}
					if (a.quality > b.quality) {
						return -1;
					}
					return 0;
				});
				return result;
			};
			const load = url => {
				return util.fetch(url, {credentials: 'include'}).then(res => res.json())
					.then(info => {
						if (!info.meta || !info.meta.message || info.meta.message !== 'ok') {
							return Promise.reject('storyboard request fail');
						}
						return parseMeta(info);
					});
			};
			return {
				load,
				_parseMeta: parseMeta,
				_parseStoryboard: parseStoryboard
			};
		})();
		class StoryboardSession {
			constructor(info) {
				this._info = info;
				this._url = info.urls[0].url;
			}
			create() {
				const url = `${this._url}?_format=json`;
				const body = this._createRequestString(this._info);
				return util.fetch(url, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body
				}).then(res => res.json()).catch(err => {
					console.error('create dmc session fail', err);
					return Promise.reject('create dmc session fail');
				});
			}
			_createRequestString(info) {
				if (!info) {
					info = this._info;
				}
				const request = {
					session: {
						client_info: {
							player_id: info.player_id
						},
						content_auth: {
							auth_type: info.auth_types.storyboard,
							content_key_timeout: info.content_key_timeout,
							service_id: 'nicovideo',
							service_user_id: info.service_user_id
						},
						content_id: info.content_id,
						content_src_id_sets: [{
							content_src_ids: []
						}],
						content_type: 'video',
						content_uri: '',
						keep_method: {
							heartbeat: {
								lifetime: info.heartbeat_lifetime
							}
						},
						priority: info.priority,
						protocol: {
							name: 'http',
							parameters: {
								http_parameters: {
									parameters: {
										storyboard_download_parameters: {
											use_well_known_port: info.urls[0].is_well_known_port ? 'yes' : 'no',
											use_ssl: info.urls[0].is_ssl ? 'yes' : 'no'
										}
									}
								}
							}
						},
						recipe_id: info.recipe_id,
						session_operation_auth: {
							session_operation_auth_by_signature: {
								signature: info.signature,
								token: info.token
							}
						},
						timing_constraint: 'unlimited'
					}
				};
				(info.videos || []).forEach(video => {
					request.session.content_src_id_sets[0].content_src_ids.push(video);
				});
				return JSON.stringify(request);
			}
		}
		const SESSION_ID = Symbol('SESSION_ID');
		const getSessionId = function() { return `session_${this.id++}`; }.bind({id: 0});
		let current = null;
		const create = async ({videoInfo, dmcInfo, videoQuality, serverType, useHLS}) => {
			if (current) {
				current.close();
				current = null;
			}
			current = await VideoSession.create({
				videoInfo, dmcInfo, videoQuality, serverType, useHLS});
			const sessionId = getSessionId();
			current[SESSION_ID] = sessionId;
			return {
				isDmc: current.isDmc,
				sessionId
			};
		};
		const connect = async () => {
			return current.connect();
		};
		const getState = () => {
			if (!current) {
				return {};
			}
			return {
				isDmc: current.isDmc,
				isDeleted: current.isDeleted,
				isAbnormallyClosed: current.isAbnormallyClosed,
				sessionId: current[SESSION_ID]
			};
		};
		const close = () => {
			current && current.close();
			current = null;
		};
		const storyboard = async ({info, duration}) => {
			const result = await new StoryboardSession(info).create();
			if (!result || !result.data || !result.data.session || !result.data.session.content_uri) {
				return Promise.reject('DMC storyboard api not exist');
			}
			const uri = result.data.session.content_uri;
			const sbInfo = await DmcStoryboardInfoLoader.load(uri);
			for (let board of sbInfo.storyboard) {
				board.thumbnail.number = Math.floor(duration * 1000 / board.thumbnail.interval);
				board.urls = await Promise.all(
					board.urls.map(url => fetch(url).then(r => r.arrayBuffer()).catch(() => url)
				));
				break; // 二番目以降は低画質
			}
			sbInfo.duration = duration;
			return sbInfo;
		};
		self.onmessage = async ({command, params}) => {
			switch (command) {
				case 'create':
					return create(params);
				case 'connect':
					return await connect();
				case 'getState':
					return getState();
				case 'close':
					return close();
				case 'storyboard':
					return await storyboard(params);
			}
		};
	};
	let worker;
	const initWorker = () => {
		if (worker) { return worker; }
		worker = worker || workerUtil.createCrossMessageWorker(func, {name: 'VideoSessionWorker'});
	};
	const create = async ({videoInfo, videoQuality, serverType, useHLS}) => {
		await initWorker();
		const params = {
			videoInfo: videoInfo.getData(),
			dmcInfo: videoInfo.dmcInfo ? videoInfo.dmcInfo.getData() : null,
			videoQuality,
			serverType,
			useHLS
		};
		const result = await worker.post({command: 'create', params});
		const sessionId = result.sessionId;
		return Object.assign(result, {
			connect: () => worker.post({command: 'connect', params: {sessionId}}),
			getState: () => worker.post({command: 'getState', params: {sessionId}}),
			close: () => worker.post({command: 'close', params: {sessionId}})
		});
	};
	const storyboard = async (watchId, sbSessionInfo, duration) => {
		const cache = await StoryboardCacheDb.get(watchId);
		if (cache) {
			return cache;
		}
		worker = worker || workerUtil.createCrossMessageWorker(func);
		const params = {info: sbSessionInfo, duration};
		const sbInfo = await worker.post({command: 'storyboard', params});
		sbInfo.watchId = watchId;
		StoryboardCacheDb.put(watchId, sbInfo);
		return sbInfo;
	};
	return {initWorker, create, storyboard};
})();

  window.ZenzaLib = Object.assign(window.ZenzaLib || {}, {
    workerUtil, dimport,
    IndexedDbStorage, WatchInfoCacheDb,
    Handler, PromiseHandler, Emitter, EmitterInitFunc,
    parseThumbInfo, StoryboardCacheDb, VideoSessionWorker
  });
})();

const GateAPI = (() => {
	const {dimport, Handler, PromiseHandler, Emitter, EmitterInitFunc, workerUtil, parseThumbInfo} = window.ZenzaLib || {};
//@require gate
	const {post, parseUrl, xFetch, uFetch, init} = gate();
	const {IndexedDbStorage} = window.ZenzaLib;
//@require ThumbInfoCacheDb
	const thumbInfo = async () => {
		const {port, TOKEN} = init({prefix: `thumbInfo${PRODUCT}Loader`, type: 'thumbInfo'});
		const db = await ThumbInfoCacheDb.open();
		port.addEventListener('message', async e => {
			const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
			const {body, sessionId, token} = data;
			const {command, params} = body;
			if (command !== 'fetch') { return; }
			const p = parseUrl(params.url);
			if (TOKEN !== token ||
				p.hostname !== location.host ||
				!p.pathname.startsWith('/api/getthumbinfo/')) {
				console.log('invalid msg: ', {origin: e.origin, TOKEN, token, body});
				return;
			}
			params.options = params.options || {};
			const watchId = params.url.split('/').reverse()[0];
			const expiresAt = Date.now() - (params.options.expireTime || 0);
			const cache = await db.get(watchId);
			if (cache && cache.thumbInfo.status === 'ok' && cache.updatedAt > expiresAt) {
				return post({status: 'ok', command, params: cache.thumbInfo}, {sessionId});
			}
			delete params.options.credentials;
			return uFetch(params)
			.then(res => res.text())
			.then(async xmlText => {
				let thumbInfo = parseThumbInfo(xmlText);
				if (thumbInfo.status === 'ok') {
					db.put(xmlText, thumbInfo);
				} else if (cache && cache.thumbInfo.status === 'ok') {
					thumbInfo = cache.thumbInfo;
				}
				const result = {status: 'ok', command, params: thumbInfo};
				post(result, {sessionId});
			}).catch(({status, message}) => {
				if (cache && cache.thumbInfo.status === 'ok') {
					return post({status: 'ok', command, params: cache.thumbInfo}, {sessionId});
				}
				return post({status, message, command}, {sessionId});
			});
		});
	};
	const nicovideo = () => {
		const {port, type, TOKEN, PID} = init({prefix: `nicovideoApi${PRODUCT}Loader`, type: 'nicovideoApi'});
		let isOk = false;
		const pushHistory = ({path, title = ''}) => {
			window.history.replaceState(null, title, path);
			if (broadcastChannel) {
				broadcastChannel.postMessage({body: {
					command: 'message', params: {command: 'pushHistory', params: {path, title}}
				}});
			}
		};
		const PREFIX = PRODUCT || 'ZenzaWatch';
		const kvs = null;
		const dumpConfig = (params, sessionId) => {
			if (!params.keys) {
				return;
			}
			const prefix = params.prefix || PREFIX;
			const config = {};
			const {keys, command} = params;
			keys.forEach(async key => {
				if (kvs) {
					const value = await kvs.get(key);
					(value !== undefined) && (config[key] = value);
					return;
				}
				const storageKey = `${prefix}_${key}`;
				if (localStorage.hasOwnProperty(storageKey) || localStorage[storageKey] !== undefined) {
					try {
						config[key] = JSON.parse(localStorage.getItem(storageKey));
					} catch (e) {
						window.console.error('config parse error key:"%s" value:"%s" ', key, localStorage.getItem(storageKey), e);
					}
				}
			});
			post({status: 'ok', command, params: config}, {sessionId});
		};
		const saveConfig = params => {
			if (!params.key) {
				return;
			}
			if (kvs) {
				kvs.set(params.key, params.value);
				return;
			}
			const prefix = params.prefix || PREFIX;
			const storageKey = `${prefix}_${params.key}`;
			const val = JSON.stringify(params.value);
			if (localStorage[storageKey] !== val) {
				localStorage.setItem(storageKey, val);
			}
		};
		const onStorage = e => {
			let key = e.key || '';
			if (e.type !== 'storage' || key.indexOf(`${PREFIX}_`) !== 0) {
				return;
			}
			key = key.replace(`${PREFIX}_`, '');
			const {oldValue, newValue} = e;
			if (oldValue === newValue || !isOk) {
				return;
			}
			switch (key) {
				case 'message':{
					const {body} = JSON.parse(newValue);
					return post({status: 'ok', command: 'message', params: body}, {sessionId: body.sessionId || ''});
				}
				default:
					return post({status: 'ok', command: 'configSync', params: {key, value: newValue}});
			}
		};
		const sendMessage = (body, sessionId) => {
			if (!isOk || !broadcastChannel) {
				return;
			}
			broadcastChannel.postMessage({
				id: PRODUCT,
				status: 'ok',
				command: 'message',
				body,
				sessionId
			});
		};
		const dbMap = {};
		const bridgeDb = async (params, sessionId) => {
			const {command} = params;
			if (command === 'open') {
				const {name, ver, stores} = params.params;
				const db = dbMap[name] || await IndexedDbStorage.open({name, ver, stores});
				dbMap[name] = db;
				return post({status: 'ok', command: 'bridge-db-result', params: {name, ver}}, {sessionId});
			}
			const {name, storeName, transfer, data} = params.params;
			const {key, index, timeout, expireTime} = data;
			const db = dbMap[name][storeName];
			let result = 'ok';
			switch(command) {
				case 'close':
					await db.close();
					break;
				case 'put':
					await db.put(data, transfer);
					break;
				case 'get':
					result = await db.get({key, index, timeout});
					break;
				case 'updateTime':
					result = await db.updateTime({key, index, timeout});
					break;
				case 'delete':
					await db.delete({key, index, timeout});
					break;
				case 'gc':
					await db.gc(expireTime, index);
					break;
			}
			return post({status: 'ok', command: 'bridge-db-result', params: result}, {sessionId});
		};
		const onBroadcastMessage = e => {
			if (!isOk) { return; }
			const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
			const {body, sessionId} = data;
			if (body.command !== 'message' || !body.params.command) {
				console.warn('unknown broadcast format', body);
				return;
			}
			return post(body, {sessionId});
		};
		const broadcastChannel =
			window.BroadcastChannel ? (new window.BroadcastChannel(PREFIX)) : null;
		if (broadcastChannel) {
			broadcastChannel.addEventListener('message', onBroadcastMessage);
		} else {
			window.addEventListener('storage', onStorage);
		}
		port.addEventListener('message', e => {
			const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
			const {body, sessionId, token} = data;
			const {command, params} = body;
			if (TOKEN !== token) {
				console.log('invalid msg: ', {origin: e.origin, TOKEN, token, body});
				return;
			}
			try {
				let result;
				switch (command) {
					case 'ok':
						window.console.info('%cCrossDomainGate initialize OK!', 'color: red;');
						isOk = true;
						break;
					case 'fetch':
						return xFetch(params, sessionId);
					case 'dumpConfig':
						return dumpConfig(params, sessionId);
					case 'saveConfig':
						return saveConfig(params, sessionId);
					case 'pushHistory':
						return pushHistory(params);
					case 'bridge-db':
						return bridgeDb(params, sessionId);
					case 'message':
						return sendMessage(body, sessionId);
					case 'ping':
						result = {now: Date.now(), NAME: window.name, PID, url: location.href};
						console.log('pong!: %smsec', Date.now() - params.now, params);
						break;
				}
				post({status: 'ok', command: 'commandResult', params: {command, result}}, {sessionId});
			} catch(e) {
				console.error('Exception', e);
				post({status: 'fail', command, params: {message: e.message || `${type} command fail`}});
			}
		});
	};
	const smile = () => {
		const {port, TOKEN} = init({
			prefix: `storyboard${PRODUCT}`,
			type: `storyboard${PRODUCT}_${location.host.split('.')[0].replace(/-/g, '_')}`
		});
		const videoCapture = (src, sec) => {
			return new Promise((resolve, reject) => {
				const v = Object.assign(document.createElement('video'), {
					volume: 0, autoplay: false, controls: false
				});
				v.addEventListener('loadedmetadata', () => v.currentTime = sec);
				v.addEventListener('error', err => {
					v.remove();
					console.warn('capture fail', {src, sec, err, videoError: v.error});
					reject(err);
				});
				const onSeeked = () => {
					const c = document.createElement('canvas');
					c.width = v.videoWidth;
					c.height = v.videoHeight;
					const ctx = c.getContext('2d');
					ctx.drawImage(v, 0, 0);
					v.remove();
					resolve(c);
				};
				v.addEventListener('seeked', onSeeked, {once: true});
				document.body.append(v);
				v.src = src;
				v.currentTime = sec;
			});
		};
		port.addEventListener('message', e => {
			const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
			const {body, sessionId, token} = data;
			const {command, params} = body;
			if (command !== 'videoCapture') { return; }
			if (TOKEN !== token) {
				window.console.log('invalid msg: ', {origin: e.origin, TOKEN, token, body});
				return;
			}
			videoCapture(params.src, params.sec).then(canvas => {
				const dataUrl = canvas.toDataURL('image/png');
				post({status: 'ok', command, params: {dataUrl}}, {sessionId});
			});
		});
	};
	const search = () => {
		const {port, TOKEN} = init({prefix: `searchApi${PRODUCT}Loader`, type: 'searchApi'});
		port.addEventListener('message', e => {
			const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
			const {body, sessionId, token} = data;
			const {command, params} = body;
			if (command !== 'fetch') { return; }
			const p = parseUrl(params.url);
			if (TOKEN !== token ||
				p.hostname !== location.host) {
				console.log('invalid msg: ', {origin: e.origin, TOKEN, token, body});
				return;
			}
			params.options = params.options || {};
			delete params.options.credentials;
			xFetch(params, sessionId);
		});
	};
	return {thumbInfo, nicovideo, smile, search};
})();

const boot = async (monkey, PRODUCT, START_PAGE_QUERY) => {
	if (window.ZenzaWatch) {
		return;
	}
	const document = window.document;
	const host = window.location.host || '';
	const name = window.name || '';
	const href = (location.href || '').replace(/#.*$/, '');
	if (href === 'https://www.nicovideo.jp/robots.txt' &&
		name.startsWith(`nicovideoApi${PRODUCT}Loader`)) {
		GateAPI.nicovideo();
	} else if (host.match(/^smile-.*?\.nicovideo\.jp$/)) {
		GateAPI.smile();
	} else if (host === 'api.search.nicovideo.jp' && name.startsWith(`searchApi${PRODUCT}Loader`)) {
		GateAPI.search();
	} else if (host === 'ext.nicovideo.jp' && name.startsWith(`thumbInfo${PRODUCT}Loader`)) {
		GateAPI.thumbInfo();
	} else if (host === 'ext.nicovideo.jp' && name.startsWith(`videoInfo${PRODUCT}Loader`)) {
		GateAPI.exApi();
	} else if (window === window.top) {
		await AntiPrototypeJs();
		if (window.ZenzaLib) {
			window.ZenzaJQuery = window.ZenzaLib.$;
			const blob = new Blob([
				`(${monkey})('${PRODUCT}', '${encodeURIComponent(START_PAGE_QUERY)}');`
			], {type: 'text/javascript'});
			const src = URL.createObjectURL(blob);
			const handler = () => {
				URL.revokeObjectURL(src);
				script.remove();
			};
			const script = Object.assign(document.createElement('script'), {
				id: `${PRODUCT}Loader`,
				type: 'text/javascript',
				src,
				onload: handler,
				onerror: handler
			});
			document.head.append(script);
		}
//@require ../packages/lib/src/nico/modernLazyload.js
	}
};
  boot(monkey, PRODUCT, START_PAGE_QUERY);

})(globalThis ? globalThis.window : window);
