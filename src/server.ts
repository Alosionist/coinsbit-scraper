import express, { Express } from 'express';
import dotenv from 'dotenv';
import {startScraper, currentMarkets} from './scraper';
import { getHistory } from './db';

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

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});