require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers"); // Using the correct ethers plugin for v6
require("dotenv").config();

// Import task definitions
require("./tasks/index.js");

// Default values for local testing
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const CALIBRATION_RPC_URL = process.env.CALIBRATION_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://api.node.glif.io";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  defaultNetwork: "calibration",
  // defaultNetwork: "localhost",
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000
      }
    },
    calibration: {
      chainId: 314159,
      url: CALIBRATION_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    mainnet: {
      chainId: 314,
      url: MAINNET_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    localhost: {
      chainId: 1337,
      url: "http://127.0.0.1:8545",
      // accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 100000
  }
};
