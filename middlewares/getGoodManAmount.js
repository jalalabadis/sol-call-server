const { Connection, PublicKey, clusterApiUrl } =  require('@solana/web3.js');
const dotenv = require('dotenv');
dotenv.config();

const getGoodManAmount = async (walletAddress) => {
  const tokenMintAddress = process.env.TOKEN_MINT;

  try {
     const { getAssociatedTokenAddress, getAccount }= await import('@solana/spl-token');
    // Connect to the Solana devnet
    //const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const connection = new Connection(clusterApiUrl(process.env.TOKEN_MODE), 'confirmed');

    // Fetch the public key objects
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Fetch the associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(tokenMintPublicKey, walletPublicKey);

  
    // Fetch the token account info
    const tokenAccountInfo = await getAccount(connection, tokenAccountAddress);
    //console.log(tokenAccountInfo.amount);
    return tokenAccountInfo.amount;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0000';
  }
  };

  module.exports = getGoodManAmount