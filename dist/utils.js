"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.average = void 0;
const average = (arr) => arr.length == 0 ? 0 : arr.reduce((p, c) => p + c, 0) / arr.length;
exports.average = average;
