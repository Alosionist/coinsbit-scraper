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
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitByMonth = exports.profitByDay = void 0;
const axios = require("axios");
const groupBy = require("group-by-with-sum");
function profitByDay(address, type) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield profitBy(address, (t) => new Date(t).toLocaleDateString(), type);
    });
}
exports.profitByDay = profitByDay;
function profitByMonth(address, type) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield profitBy(address, (t) => `${new Date(t).getMonth() + 1}/${new Date(t).getFullYear()}`, type);
    });
}
exports.profitByMonth = profitByMonth;
function profitBy(address, dateConverter, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let domain = "api.plcultima.info";
        if (type === "x") {
            domain = "api.plcux.io/api";
        }
        const data = yield axios.get(`https://${domain}/v2/public/address?id=${address}&page=0&size=1000`);
        const outputs = data.data.tx
            .filter((tx) => tx.type == "MINTING_CONTRACT")
            .flatMap((c) => c.outputs.filter((o) => o.address == c.minting.benAddress))
            .sort((a, b) => a.locktime - b.locktime)
            .map((o) => {
            return { time: dateConverter(o.locktime), value: o.value / 100000000 };
        });
        return groupBy(outputs, "time", "value");
    });
}
