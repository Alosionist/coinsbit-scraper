import {Collection, Db, MongoClient} from 'mongodb'
import dotenv from 'dotenv';
import { DataPoint } from './models/DataPoint';
// Deprecated
dotenv.config();
let db: Db, histroy: Collection;

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(URL);

// client.connect().then(() => {
//     db = client.db("coinsbit")
//     histroy = db.collection("histroy")
//   }
// )

export function insertDataPoint(dataPoint: DataPoint) {
  histroy.insertOne(dataPoint);
}

export async function getHistory(market: string, from: Date, to: Date) {
  return await histroy.find({
    market,
    time: {
      $gte: from,
      $lte: to
    }
  }).toArray();
} 

