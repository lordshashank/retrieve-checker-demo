const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract } = require("./utils/contract-utils");

task("addMoreStake", "Add more stake for a registered storage provider")
  .addParam("actorid", "Actor ID of the storage provider")
  .addParam("amount", "Amount of FIL to add to stake (in ether units)")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      const stakeAmount = hre.ethers.parseEther(taskArgs.amount);
      
      console.log(`Adding stake for storage provider with actor ID: ${actorId}`);
      console.log(`Additional stake amount: ${taskArgs.amount} FIL`);
      
      const tx = await dealRetrieveSLA.addMoreStake(actorId, { value: stakeAmount });
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Stake added successfully!`);
      
      // Get updated stake information
      const newStake = await dealRetrieveSLA.getProviderStake(actorId);
      console.log(`Updated total stake: ${hre.ethers.formatEther(newStake)} FIL`);
    } catch (error) {
      console.error("Error adding stake:", error.message);
    }
  });

task("getProviderStake", "Get the current stake for a storage provider")
  .addParam("actorid", "Actor ID of the storage provider")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      
      console.log(`Fetching stake for provider with actor ID: ${actorId}`);
      
      const stake = await dealRetrieveSLA.getProviderStake(actorId);
      console.log(`Current stake: ${hre.ethers.formatEther(stake)} FIL`);
      
      // Also check if the provider is registered
      const isRegistered = await dealRetrieveSLA.isProviderRegistered(actorId);
      console.log(`Provider registered: ${isRegistered}`);
    } catch (error) {
      console.error("Error fetching provider stake:", error.message);
    }
  });

module.exports = {};