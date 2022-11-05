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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const scraper_1 = require("./scraper");
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
(0, scraper_1.startScraper)();
app.get('/markets/:market', (req, res) => {
    const market = req.params.market;
    if (!scraper_1.currentMarkets.has(market)) {
        res.status(404).send('Not found');
    }
    else {
        res.json({ market, price: scraper_1.currentMarkets.get(market) });
    }
});
app.get('/markets/:market/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const market = req.params.market;
    const from = new Date(Number(req.query.from) || Date.now() - 86400000);
    const to = new Date(Number(req.query.to) || Date.now());
    res.json(yield (0, db_1.getHistory)(market, from, to));
}));
app.get('/markets', (req, res) => {
    res.json(Array.from(scraper_1.currentMarkets.keys()));
});
app.listen(PORT, () => {
    console.log('Server running on port 3000');
});
