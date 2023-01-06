const { ethers } = require("ethers");
const { ethers: ethersHardat } = require("hardhat");
const hre = require("hardhat");
const { gql, GraphQLClient } = require("graphql-request");
const dotenv = require("dotenv");

// const { default: axios } = require("axios");

const config = require("../configs/wallets-config.json");
dotenv.config();


const graphQLClient = new GraphQLClient(process.env.HASURA_API_URL, {
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
  },
});

const tokensAndWallets = [];
config?.forEach(async (w, idx) => {
  for (let i = 0; i < w.tokens.length; i++) {
    let foundRec = tokensAndWallets.findIndex((t) => t.symbol === w.tokens[i].symbol);
    if(foundRec !== -1) {
      tokensAndWallets[foundRec].wallet = `${tokensAndWallets[foundRec].wallet},${idx}:${w.tokens[i].amount}`;
    } else {
      tokensAndWallets.push({ ...w.tokens[i], wallet: `${idx}:${w.tokens[i].amount}` });
    }
  }
});


const getTokenAddressQuery = gql`
  query GetWhaleAddress($symbol: String!) {
    whales_contract(where: { symbol: { _eq: $symbol } }) {
      symbol
      chain
      whale_address
      token_address
    }
  }
`;

// get abi from token_address_name table
const getAbiFromHasura = async (tokenAddress) => {
  const query = gql`
    query GetAbi($address: String!) {
      token_address_name(where: {address: {_eq: $address}}) {
        abi
      }
    }
  `;
  const variables = {
    address: tokenAddress,
  };

  try {
  const data = await graphQLClient.request(query, variables);
  return data.token_address_name[0].abi;
  } catch (e) {
    console.log(e);
  }
};


// const getAbiFromEtherScan = async (tokenAddress) => {
//   try {
//     const response = axios.get(
//       `https://api.etherscan.io/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
//     );
//     return (await response).data.result;
//   } catch (e) {
//     console.log("====ETHERSCAN ABI========ERROR===",e);
//   }
// };

const impersonateAccount = async (
  accountToImpersonate,
  tokenAddress,
  tokenAmount,
  tokenSymbol,
  walletAndAmount
) => {
  try {
    let accounts = await ethersHardat.getSigners();
    let accountToFund = accounts[0].address;
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [accountToImpersonate],
    });

    const signer = await hre.ethers.getSigner(accountToImpersonate);
    let abi = await getAbiFromHasura(tokenAddress);

    let tokenContract = await new hre.ethers.Contract(
      tokenAddress,
      abi,
      signer
    );



    let balance = await tokenContract.balanceOf(accountToImpersonate);
    const decimals = await tokenContract.decimals();
  
    


    const amountWalletArr = walletAndAmount.split(",").map((w) => ({ wallet: Number(w.split(":")[0]), amount: w.split(":")[1] }));
    for (let aw of amountWalletArr) {

      let amount = ethers.utils.parseUnits(
        aw.amount.toString(),
        decimals
      );
      if (ethers.utils.parseUnits(balance.toString(), decimals).gte(amount)) {
        await tokenContract.approve(
          accounts[aw.wallet].address,
          ethers.utils.parseEther(tokenAmount.toString())
        );

         await tokenContract.transfer(
          accounts[aw.wallet].address,
          amount
          // { gasLimit: 30000000, gasPrice: 30000000 }
        );

      }
    }
    return;


  } catch (e) {
    console.log("here==========>>>>",e);
  }
};

async function getTokenAddress(symbol = "MATIC") {
  

  try {
    const response = await graphQLClient.request(getTokenAddressQuery, {
      symbol: symbol.toUpperCase(),
    });

    return response?.whales_contract;
  } catch (e) {
    console.log(e);
  }
}

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  for (let t of tokensAndWallets) {
      
    const whaleData = await getTokenAddress(t.symbol);
    const { token_address:tokenAddress = '', whale_address: accountToImpersonate = '' } = whaleData[0] || {};
    try {
      if (accountToImpersonate) {
        impersonateAccount(
          accountToImpersonate,
          tokenAddress,
          t.amount,
          t.symbol,
          t.wallet
        );
        // console.log({ accountToImpersonate });
      }
    } catch (e) {
      console.log("error", e);
    }
  }
};