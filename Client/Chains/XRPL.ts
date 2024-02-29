import { XrplClient } from "xrpl-client";

const myAddresses = ['raU1BQED4uP63ZHzR8F9vGn9YAyqsJHP7L'];
const myTokens = [];

async function GetXrplBalanceAsync() {
    const client = new XrplClient();
    for (const address in myAddresses) {
        const response = await client.send( {
            command: "account_info",
            account: myAddresses[address],
        });
        const balance = response.account_data.Balance / 1000000;
        console.log(`${myAddresses[address]} - \t XRP:`, balance);
        client.close()
    }
}

export function GetXrplBalance() {
    GetXrplBalanceAsync();
}

