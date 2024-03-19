import { XrplClient } from "xrpl-client";

interface TokenMap {
    [key: string]: string;
}

async function getXrplBalances(client: XrplClient, myAddresses: string[]) {
    return await Promise.all(
        myAddresses.map((myAddress: string) => {
            return client.send({
                command: "account_info",
                account: myAddress
            }).then(response => response.account_data.Balance);
        }),
    );
}

async function getAllTokenBalances(client: XrplClient, myAddresses: string[], myTokens: string[]) {
    return await Promise.all(
        myAddresses.map(async (myAddress: string) => {
            const response = await client.send({
                command: "account_lines",
                account: myAddress,
                ledger_index: "validated"
            });

            const lines = response.lines;

            return await Promise.all(
                myTokens.map(async (tokenName: string) => {
                    const line = lines.find(
                      (line: { currency: string; }) => line.currency.toUpperCase() === tokenName.toUpperCase()
                    ) || { currency: '', balance: '0' };
                    return line ? line.balance : 0;
                }),
            )
        })
    );
}

async function logXrplBalances(client: XrplClient) {
    const myAddresses = [
        'raU1BQED4uP63ZHzR8F9vGn9YAyqsJHP7L', 
        'rsXc9MsosgF1Bqu7UHYth7cHStazxniK8g'
    ];
    try {
        const xrplBalances = await getXrplBalances(client, myAddresses);
        xrplBalances.forEach((balance, addressIndex) => {
            let formattedBalance = balance / 1000000;
            console.log(`${myAddresses[addressIndex]} - XRP: ${formattedBalance}`);
        });
    }
    catch (error) {
        console.log(error);
        console.error("Error: ", error);
    }

}

async function logAllTokenBalances(client: XrplClient) {
    const myAddresses = [
        'raU1BQED4uP63ZHzR8F9vGn9YAyqsJHP7L', 
        'rsXc9MsosgF1Bqu7UHYth7cHStazxniK8g'
    ];
    const myTokens = [
        'FSE',
        'ELS'
    ];

    try {
        const tokenBalances = await getAllTokenBalances(client, myAddresses, myTokens);
        tokenBalances.forEach((tokenBalance, addressIndex) => {
          const address = myAddresses[addressIndex];
          
          tokenBalance.forEach((balance: number, tokenIndex: number) => {
            const tokenName = myTokens[tokenIndex];
            console.log(`${myAddresses[addressIndex]} - ${tokenName}: ${balance}`);
          });
        });
    } 
    catch (error) {
        console.error("Error: ", error);
    }
    finally {
        client.close();
    }

}

export function GetXrplBalance() {
    const client = new XrplClient();

    logXrplBalances(client);
    logAllTokenBalances(client);
}

