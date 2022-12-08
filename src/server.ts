import express, { Express } from 'express';
import dotenv from 'dotenv';
import {startScraper, currentMarkets} from './scraper';
import { getHistory } from './db';
import { profitByDay, profitByMonth } from './explorer';

dotenv.config();
const app: Express = express();
const PORT = process.env.PORT;

startScraper();

app.use('/', express.static('dist/client'))

app.get('/api/markets/:market', (req, res) => {
  const market = req.params.market;
  
  if (!currentMarkets.has(market)) {
    res.status(404).send('Not found');
  } else {
    res.json({ market, price: currentMarkets.get(market) });
  }
});

app.get('/api/markets/:market/history', async (req, res) => {
  const market = req.params.market;
  const from = new Date(Number(req.query.from) || Date.now() - 86400000);
  const to = new Date(Number(req.query.to) || Date.now())

  res.json(await getHistory(market, from, to))
});

app.get('/api/markets', (req, res) => {
  res.json(Array.from(currentMarkets.keys()));
});

app.get('/api/explorer', async (req, res) => {
  try {
    const address = req.query.addr?.toString() || '';
    const by = req.query.by?.toString() || 'day';
    if (by === 'day' && address !== '') {
      res.json(await profitByDay(address));
    } else if (by === 'month' && address !== '') {
      res.json(await profitByMonth(address));
    } else {
      res.status(400).send('bad request');
    }
  } catch (e) {
    res.status(500).send('failed');
  }
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});