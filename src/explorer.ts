const groupBy = require("group-by-with-sum");

export async function profitByDay(address: string) {
  return await profitBy(address, (t) => new Date(t).toLocaleDateString());
}

export async function profitByMonth(address: string) {
  return await profitBy(address, (t) => `${new Date(t).getMonth() + 1}/${new Date(t).getFullYear()}`);
}

async function profitBy(address: string, dateConverter: (locktime: number) => any) {  
  const data = await fetch(`https://api.plcultima.info/v2/public/address?id=${address}&page=0&size=1000`).then((r) =>
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
