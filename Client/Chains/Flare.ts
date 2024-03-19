import { createPublicClient, http, formatEther } from "viem";
import { flare } from 'viem/chains'

interface TokenMap {
  [key: string]: string;
}

const erc20Abi = require('erc-20-abi');

const client = createPublicClient({
  chain: flare,
  transport: http(),
});

async function getFlareBalanceForAddresses(myAddresses: string[]) {
  return await Promise.all(
    myAddresses.map((myAddress: string) =>
      client.getBalance({
        address: myAddress as `0x${string}`,
      }),
    ),
  );
}

async function getTokenBalancesForAddresses(myAddresses: string[], myTokens: TokenMap) {
  return await Promise.all(
    myAddresses.map(async (myAddress: string) => {
      return await Promise.all(
        Object.keys(myTokens).map((tokenKey: string) => {
          const tokenAddress = myTokens[tokenKey];
          return getTokenBalance(myAddress, tokenAddress as `0x${string}`)
        })
      );
    })
  );
}

async function getTokenBalance(myAddress: string, tokenAddress: `0x${string}`) {
  return await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [myAddress]
  });
}


async function logFlareBalances() {
  const myAddresses = [
    '0x36F4019B6475d0f35F7200D565a870aA12134206',
    '0xfE0dB7B1cb4980C1863b4EfDaAf1Cfd906fb1F79'
  ];

  try {
    const ethBalances = await getFlareBalanceForAddresses(myAddresses);
    ethBalances.forEach((balance, addressIndex) => {
      let formattedBalance = formatEther(balance);
      console.log(`${myAddresses[addressIndex]} - FLR: ${formattedBalance}`);
      });
  }
  catch (error) {
    console.error("Error: ", error);
  }
}

async function logTokenBalances() {
  const myAddresses = [
    '0x36F4019B6475d0f35F7200D565a870aA12134206',
    '0xfE0dB7B1cb4980C1863b4EfDaAf1Cfd906fb1F79'
  ];
  const myTokens: TokenMap = {
    'WFLR': '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d',
    'eUSDT': '0x96B41289D90444B8adD57e6F265DB5aE8651DF29',
  }

  try {
    const tokenBalances = await getTokenBalancesForAddresses(myAddresses, myTokens);
    tokenBalances.forEach((tokenBalance, addressIndex) => {
        const address= myAddresses[addressIndex];
        
        tokenBalance.forEach((balance, tokenIndex) => {
          const tokenKey = Object.keys(myTokens)[tokenIndex];
          console.log(`${myAddresses[addressIndex]} - ${tokenKey}: ${balance}`);
        });
    });
  }
  catch (error) {
    console.error("Error: ", error);
  }
}

export function GetFlareTokenBalances() {
  logFlareBalances();
  logTokenBalances();
}