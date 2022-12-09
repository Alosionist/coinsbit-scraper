import express, { Express } from "express";
import dotenv from "dotenv";
import { getCurrentPrice, getHistory, pollingPrices, COMPUTED_MARKETS } from "./coinsbit-scraper";
import { profitByDay, profitByMonth } from "./explorer";
import { DataPoint } from "./models/DataPoint";
import { ErrorMessage } from "./models/ErrorMessage";

dotenv.config();
const app: Express = express();
const PORT = process.env.PORT;
const BAD_REQUEST: ErrorMessage = {code: 400, message: "bad request"};
const SERVER_ERROR: ErrorMessage = {code: 500, message: "Failed"};

pollingPrices();

app.use("/", express.static("dist/client"));

app.get("/api/markets", (req, res) => {
  const computed = COMPUTED_MARKETS.keys();
  const markets = process.env.MARKETS?.split(",") || [];
  res.json([...computed, ...markets]);
});

app.get("/api/markets/:market", (req, res) => {
  const market = req.params.market;

  const price = getCurrentPrice(market);
  if (price) {
    res.json({ market, price });
  } else {
    res.status(500).send(SERVER_ERROR);
  }
});

app.get("/api/markets/:market/history", async (req, res) => {
  const market = req.params.market;
  const from = Number(req.query.from);
  const to = Number(req.query.to);
  const interval = Number(req.query.interval);

  getHistory(market, from, to, interval)
    .then((datapoints: DataPoint[] | boolean) => {
      if (datapoints) {
        res.json(datapoints);
      } else {
        res.status(500).send(SERVER_ERROR);
      }
    })
    .catch((statusCode) => res.status(statusCode).send({code: statusCode, message: "Failed"}));
});

app.get("/api/explorer", async (req, res) => {
  try {
    const address = req.query.addr?.toString() || "";
    const by = req.query.by?.toString() || "day";
    const type = req.query.type?.toString() || "u"
    if (by === "day" && address !== "") {
      res.json(await profitByDay(address, type));
    } else if (by === "month" && address !== "") {
      res.json(await profitByMonth(address, type));
    } else {
      res.status(400).send(BAD_REQUEST);
    }
  } catch (e) {
    res.status(500).send(SERVER_ERROR);
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
