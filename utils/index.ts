import { ColorSource, Graphics, Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { dimensionType, game_global_vars_type } from "../@types";
import { sound } from '@pixi/sound';
import { Theme, ToastPosition, toast } from "react-toastify";

// Provide safe defaults for environment variables
export const ENV = {
  API_URL: (window as any).REACT_APP_API_URL || "https://apiuat.bollygaming.games",
  SOCKET_URL: (window as any).REACT_APP_SOCKET_URL || "https://aviatoruat.bollygaming.games:3001",
  ASSETS_URL: (window as any).REACT_APP_ASSETS_IMAGE_URL || "https://s3.eu-west-2.amazonaws.com/lobbyuat.bollygaming.games/crash/aviator/"
};

export const Game_Global_Vars: game_global_vars_type = {
    curPayout: 0,
    allowedBet: false,
    id: [0, 0],
    hash: "",
    betValue: ["100", "100"],
    betPlaceStatus: ["none", "none"],
    cashingStatus: ["none", "none"],
    cashStarted: [false, false],
    pendingBet: [false, false],
    autoCashVal: ["1.45", "1.45"],
    enabledAutoCashOut: [false, false],
    stake: {
        max: 10000,
        min: 10
    },
}

export const curveFunction = (x: number, dimension: dimensionType) => {
    return 0.0007 * Math.pow(x, 1.9) * dimension.height / 1500
};

export const renderCurve = (g: Graphics, _dimension: dimensionType) => {
    const dimension = { width: _dimension.width, height: _dimension.height - 40 }
    const xAxis = Array.from({ length: Math.ceil(dimension.width / 10) + 1 }, (_, index) => index * 10)
    const points = xAxis.map(item => ({ x: item, y: dimension.height - curveFunction(item, dimension) }));
    
    g.clear()
    g.beginFill(0xE59407, 0.3);
    g.moveTo(0, dimension.height);
    for (let i = 0; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
    }
    g.lineTo(points[points.length - 1].x, dimension.height);
    g.closePath();
    g.endFill();

    const lineWidth = interpolate(window.innerWidth, 400, 1920, 16, 4)
    g.lineStyle(lineWidth, 0xffd900, 1);
    g.moveTo(0, dimension.height);
    for (let i = 0; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
    }
}

export const _drawOuterBoundery = (g: Graphics, dimension: dimensionType) => {
    g.clear();
    g.lineStyle(2, 0x2A2A2E, 1);
    g.drawRoundedRect(0, 0, dimension.width, dimension.height, 10);
}

export const _drawInnerBoundery = (g: Graphics, dimension: dimensionType) => {
    g.clear();
    g.lineStyle(2, 0x2A2A2E, 1);
    g.moveTo(40, 0);
    g.lineTo(40, dimension.height - 40);
    g.lineTo(dimension.width, dimension.height - 40);
}

export const createGradTexture = (dimension: dimensionType) => {
    const canvas = document.createElement('canvas');
    canvas.width = dimension.width;
    canvas.height = dimension.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grd = ctx.createRadialGradient(dimension.width / 4, dimension.height / 2, 50, dimension.width / 4, dimension.height / 2, dimension.width / 2);
        grd.addColorStop(0, '#E5940744');
        grd.addColorStop(1, '#00000000');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, dimension.width, dimension.height);
    }
    return Texture.from(canvas);
}

export const maskDraw = (g: Graphics, dimension: dimensionType) => {
    g.clear();
    g.beginFill(0xff0000);
    g.drawRect(0, 0, dimension.width, dimension.height);
    g.endFill();
}

export const smoothen = (t: number, dimension: dimensionType) => (Math.sin(Math.PI * t / (2 * dimension.width)) * dimension.width)

export const playSound = (type: 'bg' | 'flew' | 'win' | 'take') => {
    const status = (type === 'bg' ? localStorage.getItem('music') : localStorage.getItem('fx')) || 'true';
    if (status === 'true' && (sound as any).exists(`${type}-sound`)) {
        sound.play(`${type}-sound`, { loop: type === 'bg' });
    }
}

export const stopSound = (type: 'bg' | 'flew' | 'win' | 'take') => {
    if ((sound as any).exists(`${type}-sound`)) sound.stop(`${type}-sound`);
}

export const loadSound = () => {
    try {
      sound.add('bg-sound', `${ENV.ASSETS_URL}general/sound/bg-sound.mp3`);
      sound.add('flew-sound', `${ENV.ASSETS_URL}general/sound/flew.mp3`);
      sound.add('win-sound', `${ENV.ASSETS_URL}general/sound/win.mp3`);
      sound.add('take-sound', `${ENV.ASSETS_URL}general/sound/take.mp3`);
      sound.volumeAll = 0.5;
    } catch (e) {
      console.warn("Sound loading failed", e);
    }
}

export const setVolume = (val: number) => {
    sound.volumeAll = val / 100;
}

export const openFullscreen = async () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        try { await elem.requestFullscreen(); } catch (e) {}
    }
}

export const closeFullscreen = async () => {
    if (document.exitFullscreen) {
        try { await document.exitFullscreen(); } catch (e) {}
    }
}

export function interpolate(x: number, x1: number, x2: number, y1: number, y2: number) {
    const res = (y2 - y1) * (x - x1) / (x2 - x1) + y1;
    return Math.max(Math.min(y1, y2), Math.min(Math.max(y1, y2), res));
}

export function getHistoryItemColor(_val: string) {
    const val = parseFloat(_val);
    if (val < 2) return "#07BDE5";
    if (val < 10) return "#913EF8";
    return "#C017B4";
}

export const testMobile = () => {
    const ua = navigator.userAgent;
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    return {
        mobile,
        iPhone: /iPhone|iPad|iPod/i.test(ua)
    };
}

export const showToast = (msg: string, type: "error" | "info" = "error") => {
    const params = {
        position: "top-right" as ToastPosition,
        autoClose: 3000,
        theme: "colored" as Theme,
    };
    if (type === "error") toast.error(msg, params);
    else toast.info(msg, params);
}

export const setStateTemplate = (val: any, i: number) => (prev: any[]) => {
    const new_val = [...prev];
    new_val[i] = val;
    return new_val;
}

export const getUTCTimefromUTCTime = (timeString: string) => {
    if (!timeString) return new Date();
    const date = new Date(timeString.replace(' ', 'T'));
    return date;
}

export const doDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const initBet6 = JSON.parse(localStorage.getItem(`bet6`) || '["10", "50", "100", "200", "500", "1000"]');
// Support modern PixiJS versions for WebGL support detection
export const webpORpng = (PIXI as any).utils?.isWebGLSupported?.() ? "webp" : "png";