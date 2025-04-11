const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract } = require("./utils/contract-utils");

task("listRegisteredSPs", "List all registered storage providers")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      
      console.log("Fetching registered storage providers...");
      
      // Get the array of registered SP actor IDs
      const registeredSPActorIds = await dealRetrieveSLA.getRegisteredSpActorIds();
      
      if (registeredSPActorIds.length === 0) {
        console.log("No storage providers registered yet.");
        return;
      }
      
      console.log(`\nFound ${registeredSPActorIds.length} registered storage provider(s):`);
      
      // Get details for each registered SP
      for (const actorId of registeredSPActorIds) {
        console.log(`\nStorage Provider Actor ID: ${actorId}`);
        
        // Check if the provider is registered (should be true)
        const isRegistered = await dealRetrieveSLA.isProviderRegistered(actorId);
        console.log(`Registered: ${isRegistered}`);
        
        // Get stake amount
        const stake = await dealRetrieveSLA.getProviderStake(actorId);
        console.log(`Current stake: ${hre.ethers.formatEther(stake)} FIL`);
        
        // Get dispute statistics
        try {
          const stats = await dealRetrieveSLA.getProviderStats(actorId);
          console.log(`Total disputes: ${stats.totalDisputes}`);
          console.log(`Pending disputes: ${stats.pendingDisputes}`);
          console.log(`Resolved disputes: ${stats.resolvedDisputes}`);
          console.log(`Failed disputes: ${stats.failedDisputes}`);
          console.log(`Rejected disputes: ${stats.rejectedDisputes}`);
        } catch (error) {
          console.log(`Could not fetch dispute stats: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Error listing registered storage providers:", error.message);
    }
  });

module.exports = {};