import fetch from 'node-fetch';
const groupBy = require("group-by-with-sum");

export async function profitByDay(address: string, type: string) {
  return await profitBy(address, (t) => new Date(t).toLocaleDateString(), type);
}

export async function profitByMonth(address: string, type: string) {
  return await profitBy(address, (t) => `${new Date(t).getMonth() + 1}/${new Date(t).getFullYear()}`, type);
}

async function profitBy(address: string, dateConverter: (locktime: number) => any, type: string) {
  let domain = "api.plcultima.info";
  if (type === "x") {
    domain = "api.plcux.io/api";
  }
  
  const data: any = await fetch(`https://${domain}/v2/public/address?id=${address}&page=0&size=1000`).then((r) =>
    r.json()
  );
  
  const outputs = data.data.tx
    .filter((tx: any) => tx.type == "MINTING_CONTRACT")
    .flatMap((c: any) => c.outputs.filter((o: any) => o.address == c.minting.benAddress))
    .sort((a: any, b: any) => a.locktime - b.locktime)
    .map((o: any) => {
      return { time: dateConverter(o.locktime), value: o.value / 100000000 };
    });

  return groupBy(outputs, "time", "value");
}
