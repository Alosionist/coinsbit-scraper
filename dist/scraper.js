"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentMarkets = exports.startScraper = void 0;
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
const db_1 = require("./db");
dotenv_1.default.config();
const URL = 'wss://ws.coinsbit.io/';
const MARKETS = ((_a = process.env.MARKETS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
const INTERVAL = parseInt(process.env.SCRAPER_INTERVAL || '5');
const COMPUTED_MARKETS = [{ market: 'PLCUX_USDT', multOf: ['PLCUX_PLCU', 'PLCU_USDT'] }];
const currentMarkets = new Map();
exports.currentMarkets = currentMarkets;
function connect() {
    console.log('connecting...');
    const ws = new ws_1.default(URL);
    const cachedMarkets = new Map();
    ws.on('open', () => {
        console.log('connected, sending message, ' + new Date().toLocaleString());
        const marketMessage = {
            method: 'market.subscribe',
            params: [],
            id: 10,
        };
        ws.send(JSON.stringify(marketMessage));
    });
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log(`got message with method: ${message.method}`);
        if (message.method !== 'market.update')
            return;
        const markets = message.params.filter((param) => MARKETS.includes(param.market));
        markets.forEach((market) => {
            addToCache(market.market, parseFloat(market.last));
        });
        COMPUTED_MARKETS.forEach(computedMarket => {
            addToCache(computedMarket.market, calcPrice(computedMarket));
        });
    });
    ws.on('close', () => {
        addDataToDb();
    });
    function addToCache(market, price) {
        var _a;
        if (!price)
            return;
        if (!cachedMarkets.has(market)) {
            cachedMarkets.set(market, []);
        }
        (_a = cachedMarkets.get(market)) === null || _a === void 0 ? void 0 : _a.push(price);
        currentMarkets.set(market, price);
    }
    function addDataToDb() {
        const dataPointTime = new Date();
        cachedMarkets.forEach((prices, marketName) => {
            (0, db_1.insertDataPoint)({ market: marketName, price: (0, utils_1.average)(prices), time: dataPointTime });
        });
        console.log('data points for all markets were added with time: ', dataPointTime.toLocaleString());
    }
    function calcPrice(computedMarket) {
        const a = currentMarkets.get(computedMarket.multOf[0]) || -1;
        const b = currentMarkets.get(computedMarket.multOf[1]) || -1;
        if (a === -1 || b === -1)
            return;
        return a * b;
    }
}
function startScraper() {
    try {
        connect();
    }
    catch (error) {
        console.error(error);
    }
    setInterval(() => {
        connect();
    }, INTERVAL * 60 * 1000);
}
exports.startScraper = startScraper;
