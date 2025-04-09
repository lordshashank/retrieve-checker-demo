const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract } = require("./utils/contract-utils");
const { json } = require("hardhat/internal/core/params/argumentTypes");

task("registerSP", "Register a storage provider with the contract")
  .addParam("actorid", "Actor ID of the storage provider")
  .addParam("stake", "Amount of FIL to stake (in ether units)")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      const stakeAmount = hre.ethers.parseEther(taskArgs.stake);
      
      console.log(`Registering storage provider with actor ID: ${actorId}`);
      console.log(`Staking amount: ${taskArgs.stake} FIL`);
      
      const tx = await dealRetrieveSLA.registerStorageProvider(actorId, { value: stakeAmount });
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Storage provider registered successfully!`);
      
      // Get events from logs
      const iface = dealRetrieveSLA.interface;
      const registerEvent = receipt.logs
        .map(log => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(log => log && log.name === 'StorageProviderRegistered');

      if (registerEvent) {
        console.log(`Event details: Provider actor ID: ${registerEvent.args[0]}, Staked amount: ${hre.ethers.formatEther(registerEvent.args[2])} FIL`);
      }
    } catch (error) {
      console.error("Error registering storage provider:", error.message);
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }
  });

module.exports = {};