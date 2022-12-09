"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentPrice = exports.getHistory = exports.pollingPrices = exports.COMPUTED_MARKETS = void 0;
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const URL = "wss://ws.coinsbit.io/";
const MARKETS = ((_a = process.env.MARKETS) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
const currentPrices = new Map();
exports.COMPUTED_MARKETS = new Map();
exports.COMPUTED_MARKETS.set("PLCUX_USDT", { market1: "PLCUX_PLCU", market2: "PLCU_USDT" });
function pollingPrices() {
    try {
        getCurrentPrices();
    }
    catch (error) {
        console.error(error);
    }
}
exports.pollingPrices = pollingPrices;
function getHistory(market, start, end, interval) {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.COMPUTED_MARKETS.has(market)) {
            const mult = exports.COMPUTED_MARKETS.get(market);
            const first = yield getHistoryOfMarket(mult === null || mult === void 0 ? void 0 : mult.market1, start, end, interval);
            const second = yield getHistoryOfMarket(mult === null || mult === void 0 ? void 0 : mult.market2, start, end, interval);
            return merge(market, first, second);
        }
        else {
            return yield getHistoryOfMarket(market, start, end, interval);
        }
    });
}
exports.getHistory = getHistory;
function getCurrentPrice(market) {
    var _a;
    const mult = exports.COMPUTED_MARKETS.get(market);
    if (mult) {
        const first = currentPrices.get(mult.market1);
        const second = currentPrices.get(mult.market2);
        if (first && second) {
            return first * second;
        }
        return false;
    }
    return (_a = currentPrices.get(market)) !== null && _a !== void 0 ? _a : false;
}
exports.getCurrentPrice = getCurrentPrice;
function getHistoryOfMarket(market, start, end, interval) {
    console.log("connecting...");
    const ws = new ws_1.default(URL);
    let promiseResolve;
    let promiseReject;
    const dataPointsPromise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
    ws.on("open", () => {
        console.log("connected, sending kline.query message, " + new Date().toLocaleString());
        const klineMessage = {
            method: "kline.query",
            params: [market, start / 1000, end / 1000, interval],
            id: Math.floor(Math.random() * 100000) + 1,
        };
        ws.send(JSON.stringify(klineMessage));
    });
    ws.on("message", (data) => {
        var _a, _b, _c;
        const message = JSON.parse(data.toString());
        console.log(`got message, result.size = ${(_a = message.result) === null || _a === void 0 ? void 0 : _a.length}`);
        const datapoints = (_c = (_b = message.result) === null || _b === void 0 ? void 0 : _b.map((rawData) => {
            return {
                market,
                time: rawData[0] * 1000,
                price: rawData[2],
            };
        })) !== null && _c !== void 0 ? _c : [];
        if (datapoints.length > 0) {
            promiseResolve(datapoints);
        }
        else {
            promiseReject(400);
        }
        ws.close();
    });
    ws.on("close", () => {
        console.log("connection closed");
        promiseReject(500);
    });
    return dataPointsPromise;
}
function getCurrentPrices() {
    console.log("connecting...");
    const ws = new ws_1.default(URL);
    ws.on("open", () => {
        console.log("connected, sending today.subscribe message, " + new Date().toLocaleString());
        const marketMessage = {
            method: "market.subscribe",
            params: [],
            id: 10,
        };
        ws.send(JSON.stringify(marketMessage));
    });
    ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        console.log(`got message with method: ${message.method}`);
        if (message.method !== "market.update")
            return;
        const markets = message.params.filter((param) => MARKETS.includes(param.market));
        markets.forEach(market => currentPrices.set(market.market, +market.last));
    });
    ws.on("close", () => {
        console.log("connection closed");
        getCurrentPrices();
    });
}
function merge(market, first, second) {
    const merged = [];
    first = first.reverse();
    second = second.reverse();
    for (let i = 0; i < first.length - 1 && i < second.length - 1; i++) {
        if (first[i].time !== second[i].time) {
            console.log(i);
            console.log(first[156]);
            console.log(second[156]);
            console.log(first[157]);
            console.log(second[157]);
            console.log(first[158]);
            console.log(second[158]);
            console.log(first[i].time);
            console.log(second[i].time);
            return false;
        }
        merged[i] = {
            market,
            price: first[i].price * second[i].price,
            time: first[i].time,
        };
    }
    return merged;
}
