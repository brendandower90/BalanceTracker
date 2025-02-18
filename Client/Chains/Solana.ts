import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const accountAddress = new PublicKey('CW9C7HBwAMgqNdXkNgFg9Ujr3edR2Ab9ymEuQnVacd1A');



async function getTokenMetadataWithRetry(mintAddress: PublicKey, retries = 3, delay = 1000): Promise<Metadata | undefined> {
    try {
        const metadata = await Metadata.load(connection, mintAddress);
        return metadata;
    } catch (error: any) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return getTokenMetadataWithRetry(mintAddress, retries - 1, delay * 2);
        } else {
            console.error('Error fetching token metadata:', error);
            return undefined;
        }
    }
}


async function getSolBalance() {
    try {
        const balance = await connection.getBalance(accountAddress);
        const solBalance = balance / LAMPORTS_PER_SOL;
        console.log(solBalance)
    } catch (error) {
        console.error('Error retrieving balance:', error);
    }
}

async function getSolTokenBalance() {
    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(accountAddress, { programId: TOKEN_PROGRAM_ID })
        // console.log(tokenAccounts);
        console.log("Token                                         Balance");
        console.log("------------------------------------------------------------");
        tokenAccounts.value.forEach(async (tokenAccount) => {
            const accountData = AccountLayout.decode(tokenAccount.account.data);
            const ca = new PublicKey(accountData.mint);
            let tokenMetadata;
            try {
                tokenMetadata = await getTokenMetadataWithRetry(ca);
                if (tokenMetadata) {
                    // Process the token metadata
                    console.log('Token Metadata:', tokenMetadata);  // Debug the structure
                    console.log('Balance:', accountData.amount.toString());
                } else {
                    console.log('Token metadata not available');
                }
            } catch (error: any) {
                // Handle the error
                console.error("Error fetching token metadata: ", error);
            }
        });
    } catch (error) {
        console.error('Error retrieving token balances:', error);
    }
}

export function GetSolBalances() {
    // getSolBalance();
    getSolTokenBalance();
}