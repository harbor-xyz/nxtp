
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "./hardhat-harbor.js";

import "harbor-hardhat-deploy";

import "hardhat-deploy-ethers"
import { task } from "hardhat/config";


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    deployer: 0,
  },
  // defaultNetwork: "anvil",

  networks: {
    hardhat: {
		loggingEnabled: true,
		saveDeployments: true,
		allowUnlimitedContractSize: true,
		
      chainId: 1338,
      companionNetworks: {
      hub: "local_1337",
	    },

      accounts: {
		mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
	  },

    },

    local_1337: {
		mining: {auto: false, interval: 1000},
		loggingEnabled: true,
		saveDeployments: true,
		allowUnlimitedContractSize: true,
      url: "http://localhost:4000",
    },

    anvil: {
      url: "http://0.0.0.0:4004/",
      launch: false, 
    },
  },
};
