import WebSocket from "ws";
import dotenv from "dotenv";
import { CoinsbitMessage } from "./models/CoinsbitMessage";
import { DataPoint } from "./models/DataPoint";
import { Market } from "./models/Market";

dotenv.config();
const URL = "wss://ws.coinsbit.io/";
const MARKETS = process.env.MARKETS?.split(",") || [];
const currentPrices: Map<string, number> = new Map();
export const COMPUTED_MARKETS: Map<string, { market1: string; market2: string }> = new Map();
COMPUTED_MARKETS.set("PLCUX_USDT", { market1: "PLCUX_PLCU", market2: "PLCU_USDT" });

export function pollingPrices() {
  try {
    getCurrentPrices();
  } catch (error) {
    console.error(error);
  }
}

export async function getHistory(
  market: string,
  start: number,
  end: number,
  interval: number
): Promise<DataPoint[] | boolean> {
  if (COMPUTED_MARKETS.has(market)) {
    const mult = COMPUTED_MARKETS.get(market);
    const first = await getHistoryOfMarket(mult?.market1, start, end, interval);
    const second = await getHistoryOfMarket(mult?.market2, start, end, interval);

    return merge(market, first, second);
  } else {
    return await getHistoryOfMarket(market, start, end, interval);
  }
}

export function getCurrentPrice(market: string): number | boolean {
  const mult = COMPUTED_MARKETS.get(market);
  if (mult) {
    const first = currentPrices.get(mult.market1);
    const second = currentPrices.get(mult.market2);

    if (first && second) {
      return first * second;
    }

    return false;
  }

  return currentPrices.get(market) ?? false;
}

function getHistoryOfMarket(
  market: string | undefined,
  start: number,
  end: number,
  interval: number
): Promise<DataPoint[]> {
  console.log("connecting...");
  const ws = new WebSocket(URL);
  let promiseResolve: (value: DataPoint[] | PromiseLike<DataPoint[]>) => void;
  let promiseReject: (reason?: any) => void;
  const dataPointsPromise = new Promise<DataPoint[]>((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });

  ws.on("open", () => {
    console.log("connected, sending kline.query message, " + new Date().toLocaleString());

    const klineMessage: CoinsbitMessage = {
      method: "kline.query",
      params: [market, start / 1000, end / 1000, interval],
      id: Math.floor(Math.random() * 100000) + 1,
    };

    ws.send(JSON.stringify(klineMessage));
  });

  ws.on("message", (data) => {
    const message: CoinsbitMessage = JSON.parse(data.toString());
    console.log(`got message, result.size = ${message.result?.length}`);
    const datapoints: DataPoint[] =
      message.result?.map((rawData: any[]) => {
        return {
          market,
          time: rawData[0] * 1000,
          price: rawData[2],
        } as DataPoint;
      }) ?? [];

    if (datapoints.length > 0) {
      promiseResolve(datapoints);
    } else {
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

function getCurrentPrices(): void {
  console.log("connecting...");
  const ws = new WebSocket(URL);
  ws.on("open", () => {
    console.log("connected, sending today.subscribe message, " + new Date().toLocaleString());

    const marketMessage: CoinsbitMessage = {
      method: "market.subscribe",
      params: [],
      id: 10,
    };

    ws.send(JSON.stringify(marketMessage));
  });

  ws.on("message", (data) => {
    const message: CoinsbitMessage = JSON.parse(data.toString());
    console.log(`got message with method: ${message.method}`);
    if (message.method !== "market.update") return;

    const markets: Market[] = message.params.filter((param) => MARKETS.includes(param.market));
    markets.forEach(market => currentPrices.set(market.market, +market.last));
  });

  ws.on("close", () => {
    console.log("connection closed");
    getCurrentPrices();
  });
}

function merge(market: string, first: DataPoint[], second: DataPoint[]): DataPoint[] | boolean {
  const merged: DataPoint[] = [];
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
