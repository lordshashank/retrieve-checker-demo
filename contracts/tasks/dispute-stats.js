const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract } = require("./utils/contract-utils");

task("getProviderStats", "Get statistics about a provider's disputes")
  .addParam("actorid", "Actor ID of the storage provider")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      
      console.log(`Fetching stats for provider with actor ID: ${actorId}`);
      
      const stats = await dealRetrieveSLA.getProviderStats(actorId);
      
      console.log("\n--- Provider Statistics ---");
      console.log(`Total Disputes: ${stats.totalDisputes}`);
      console.log(`Pending Disputes: ${stats.pendingDisputes}`);
      console.log(`Resolved Disputes: ${stats.resolvedDisputes}`);
      console.log(`Failed Disputes: ${stats.failedDisputes}`);
      console.log(`Rejected Disputes: ${stats.rejectedDisputes}`);
      
      // Fetch provider disputes
      const disputes = await dealRetrieveSLA.getProviderDisputes(actorId);
      console.log(`\nDispute IDs: ${disputes.join(', ') || 'None'}`);
    } catch (error) {
      console.error("Error fetching provider statistics:", error.message);
    }
  });

task("getGlobalStats", "Get global dispute statistics")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      
      console.log("Fetching global dispute statistics...");
      
      const stats = await dealRetrieveSLA.getGlobalDisputeStats();
      
      console.log("\n--- Global Dispute Statistics ---");
      console.log(`Total Disputes: ${stats[0]}`);
      console.log(`Pending Disputes: ${stats[1]}`);
      console.log(`Resolved Disputes: ${stats[2]}`);
      console.log(`Failed Disputes: ${stats[3]}`);
      console.log(`Rejected Disputes: ${stats[4]}`);
    } catch (error) {
      console.error("Error fetching global statistics:", error.message);
    }
  });

module.exports = {};