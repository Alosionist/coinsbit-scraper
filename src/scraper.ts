import WebSocket from 'ws';
import dotenv from 'dotenv';
import { CoinsbitMessage } from './models/CoinsbitMessage';
import { Market } from './models/Market';
import { average } from './utils';
import { insertDataPoint } from './db';

dotenv.config();
const URL = 'wss://ws.coinsbit.io/';
const MARKETS = process.env.MARKETS?.split(',') || [];
const INTERVAL = parseInt(process.env.SCRAPER_INTERVAL || '5');
const COMPUTED_MARKETS = [{ market: 'PLCUX_USDT', multOf: ['PLCUX_PLCU', 'PLCU_USDT'] }];
const currentMarkets: Map<string, number> = new Map();

function connect() {
  console.log('connecting...');
  const ws = new WebSocket(URL);
  const cachedMarkets: Map<string, number[]> = new Map();

  ws.on('open', () => {
    console.log('connected, sending message, ' +  new Date().toLocaleString());

    const marketMessage: CoinsbitMessage = {
      method: 'market.subscribe',
      params: [],
      id: 10,
    };

    ws.send(JSON.stringify(marketMessage));
  });

  ws.on('message', (data) => {
    const message: CoinsbitMessage = JSON.parse(data.toString());
    console.log(`got message with method: ${message.method}`);
    if (message.method !== 'market.update') return;

    const markets: Market[] = message.params.filter((param) =>
      MARKETS.includes(param.market)
    );

    markets.forEach((market) => {
      addToCache(market.market, parseFloat(market.last));
    });

    COMPUTED_MARKETS.forEach(computedMarket => {
      addToCache(computedMarket.market, calcPrice(computedMarket));
    })

  });

  ws.on('close', () => {
    addDataToDb();
  });

  function addToCache(market: string, price: number | undefined) {
    if (!price) return;
    if (!cachedMarkets.has(market)) {
      cachedMarkets.set(market, []);
    }
    cachedMarkets.get(market)?.push(price);
    currentMarkets.set(market, price);
  }
  
  function addDataToDb() {
    const dataPointTime = new Date();
    cachedMarkets.forEach((prices: number[], marketName: string) => {
      insertDataPoint({ market: marketName, price: average(prices), time: dataPointTime });
    });
    console.log('data points for all markets were added with time: ', dataPointTime.toLocaleString());
  }

  function calcPrice(computedMarket: any): number | undefined {
    const a = currentMarkets.get(computedMarket.multOf[0]) || -1
    const b = currentMarkets.get(computedMarket.multOf[1]) || -1
    if (a === -1 || b === -1) return;
    return a * b;
  }
}

export function startScraper() {
  connect();
  setInterval(() => {
    connect();
  }, INTERVAL * 60 * 1000);
}

export { currentMarkets };
