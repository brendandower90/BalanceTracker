import { createPublicClient, http } from "viem";
import { mainnet } from 'viem/chains'

interface TokenMap {
    [key: string]: string;
}

const client = createPublicClient({
    chain: mainnet,
    transport: http(),
});

const erc20Abi = require('erc-20-abi');
const myAddresses = ['0x43830Cfcf8332FD82D6490217f899d69f74803e1','0x9f3B3BBdC3A7D58054500b8e105a781fFd6FBedD'];
const myTokens: TokenMap = {
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    'GALA': '0xd1d2Eb1B1e90B638588728b4130137D262C87cae'
}

async function main() {
    for (const address in myAddresses) {
        for (const token in myTokens) {
            try {
                const balance = await client.readContract({
                    address: myTokens[token] as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [myAddresses[address]]
                })  
                console.log(myAddresses[address], ": ", token, myTokens[token] as `0x${string}`, balance);
            }
            catch (error) {
                console.error("Error: ", error);
            }     
        }
    }
}

main();