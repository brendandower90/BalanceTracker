import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from 'viem/chains'

interface TokenMap {
  [key: string]: string;
}

// Hard coded sample data
const erc20Abi = require('erc-20-abi');




const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function getEthBalances(myAddresses: string[]) {
  return await Promise.all(
    myAddresses.map((myAddress: string) =>
      client.getBalance({
        address: myAddress as `0x${string}`,
      }),
    ),
  );
}

async function getAllTokenBalances(myAddresses: string[], myTokens: TokenMap) {
  return await Promise.all(
    myAddresses.map((myAddress: string) => {
      return Promise.all(
        Object.keys(myTokens).map((tokenKey: string) => {
          const tokenAddress = myTokens[tokenKey];
          return client.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [myAddress]
          });
        })
      );
    })
  );
}


async function logEthBalances() {
  const myAddresses = [
    '0x43830Cfcf8332FD82D6490217f899d69f74803e1',
    '0x9f3B3BBdC3A7D58054500b8e105a781fFd6FBedD'
  ];

  try {
    const ethBalances = await getEthBalances(myAddresses);
    ethBalances.forEach((balance, addressIndex) => {
      let formattedBalance = formatEther(balance);
      console.log(`${myAddresses[addressIndex]} - ETH: ${formattedBalance}`);
      });
  }
  catch (error) {
    console.error("Error: ", error);
  }
}

async function logTokenBalances() {
  const myAddresses = [
    '0x43830Cfcf8332FD82D6490217f899d69f74803e1',
    '0x9f3B3BBdC3A7D58054500b8e105a781fFd6FBedD'
  ];
  const myTokens: TokenMap = {
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    'GALA': '0xd1d2Eb1B1e90B638588728b4130137D262C87cae',
  }

  try {
    const tokenBalances = await getAllTokenBalances(myAddresses, myTokens);
    tokenBalances.forEach((tokenBalance, addressIndex) => {
        const address= myAddresses[addressIndex];
        
        tokenBalance.forEach((balance, tokenIndex) => {
          const tokenKey = Object.keys(myTokens)[tokenIndex];
          console.log(`${myAddresses[addressIndex]} - ${tokenKey}: ${balance}`)
        });
    });
  }
  catch (error) {
    console.log("Error: ", error);
  }
}

export function GetEtherumTokenBalances() {
  logEthBalances();
  logTokenBalances();
}