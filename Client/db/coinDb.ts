import { Env } from 'node-lmdb';
      
var lmdb = require('..')

console.log("Current lmdb version is", lmdb.version);

function initializeDb(dbPath: string) {
    const env = new Env();
    env.open({
        path: dbPath,
        maxDbs:10
    });

    const dbi = env.openDbi({
        name: "coindb",
        create: true
    });

    return { env, dbi };
}

const { env: coinEnv, dbi: coinDbi } = initializeDb('./coinDb');

function insertDataToCoinDb(env: Env, dbi: any, data: any) {
    const txn = env.beginTxn();
    for (const key in data) {
        txn.putBinary(dbi, key, Buffer.from(JSON.stringify(data[key])));
    }
    txn.commit();
}

function readDataFromCoinDb(env: Env, dbi: any, key: string) {
    const txn = env.beginTxn({ readOnly: true });
    const data = txn.getBinary(dbi, key);
    txn.commit();

    return data ? JSON.parse(data.toString()) : null;
}


const coinData = {
    "bitcoin": { "ticker": 'BTC', 'rank': 1 }
}

insertDataToCoinDb(coinEnv, coinDbi, coinData);
const bitcoinData = readDataFromCoinDb(coinEnv, coinDbi, "bitcoin");
console.log(bitcoinData);
coinEnv.close();

