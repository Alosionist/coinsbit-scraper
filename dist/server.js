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
const coinsbit_scraper_1 = require("./coinsbit-scraper");
const explorer_1 = require("./explorer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const BAD_REQUEST = { code: 400, message: "bad request" };
const SERVER_ERROR = { code: 500, message: "Failed" };
(0, coinsbit_scraper_1.pollingPrices)();
app.use("/", express_1.default.static("dist/client"));
app.get("/api/markets", (req, res) => {
    var _a;
    const computed = coinsbit_scraper_1.COMPUTED_MARKETS.keys();
    const markets = ((_a = process.env.MARKETS) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
    res.json([...computed, ...markets]);
});
app.get("/api/markets/:market", (req, res) => {
    const market = req.params.market;
    const price = (0, coinsbit_scraper_1.getCurrentPrice)(market);
    if (price) {
        res.json({ market, price });
    }
    else {
        res.status(500).send(SERVER_ERROR);
    }
});
app.get("/api/markets/:market/history", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const market = req.params.market;
    const from = Number(req.query.from);
    const to = Number(req.query.to);
    const interval = Number(req.query.interval);
    (0, coinsbit_scraper_1.getHistory)(market, from, to, interval)
        .then((datapoints) => {
        if (datapoints) {
            res.json(datapoints);
        }
        else {
            res.status(500).send(SERVER_ERROR);
        }
    })
        .catch((statusCode) => res.status(statusCode).send({ code: statusCode, message: "Failed" }));
}));
app.get("/api/explorer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const address = ((_a = req.query.addr) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        const by = ((_b = req.query.by) === null || _b === void 0 ? void 0 : _b.toString()) || "day";
        const type = ((_c = req.query.type) === null || _c === void 0 ? void 0 : _c.toString()) || "u";
        if (by === "day" && address !== "") {
            res.json(yield (0, explorer_1.profitByDay)(address, type));
        }
        else if (by === "month" && address !== "") {
            res.json(yield (0, explorer_1.profitByMonth)(address, type));
        }
        else {
            res.status(400).send(BAD_REQUEST);
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send(SERVER_ERROR);
    }
}));
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
