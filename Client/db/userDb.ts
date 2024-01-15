import { Env } from 'node-lmdb'

function initializeDb(dbPath: string) {
    const env = new Env;
    env.open({
        path: dbPath,
        maxDbs: 10
    });

    const dbi = env.openDbi({
        name: 'userDb',
        create: true
    });

    return { env, dbi };
}

const { env: userEnv, dbi: userDbi } = initializeDb('./userDb');

function insertDataToUserDb(env: Env, dbi: any, data: any) {
    const txn = env.beginTxn();
    for (const key in data) {
        txn.putBinary(dbi, key, Buffer.from(JSON.stringify(data[key])));
    }
    txn.commit();
}

function readDataFromUserDb(env: Env, dbi: any, key: string) {
    const txn = env.beginTxn({ readOnly: true });
    const data = txn.getBinary(dbi, key);
    txn.commit();

    return data ? JSON.parse(data.toString()) : null;
}

const userData = {
    "bitcoin": "bgdhsd"
};

insertDataToUserDb(userEnv, userDbi, userData);
const btcAddress = readDataFromUserDb(userEnv, userDbi, "bitcoin");
console.log(btcAddress);

userEnv.close();