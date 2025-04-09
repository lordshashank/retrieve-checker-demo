const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract, getDisputeStatusString } = require("./utils/contract-utils");

task("getDisputeDetails", "Get details of a dispute")
  .addParam("disputeid", "ID of the dispute")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const disputeId = BigInt(taskArgs.disputeid);
      
      console.log(`Fetching details for dispute ID: ${disputeId}`);
      
      const details = await dealRetrieveSLA.getDealDisputeDetails(disputeId);
      
      console.log("\n--- Dispute Details ---");
      console.log(`Dispute ID: ${details[0]}`);
      console.log(`Deal ID: ${details[1]}`);
      console.log(`Deal Label: ${details[2]}`);
      console.log(`Provider Address: ${details[3]}`);
      console.log(`Provider Actor ID: ${details[4]}`);
      console.log(`Reason: ${details[5]}`);
      console.log(`Status: ${getDisputeStatusString(details[6])}`);
    } catch (error) {
      console.error("Error fetching dispute details:", error.message);
    }
  });

task("getFailedDisputes", "Get list of failed disputes for a provider")
  .addParam("actorid", "Actor ID of the storage provider")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      
      console.log(`Fetching failed disputes for provider with actor ID: ${actorId}`);
      
      const failedDisputes = await dealRetrieveSLA.getProviderFailedDisputes(actorId);
      
      console.log(`\nFailed Dispute IDs: ${failedDisputes.join(', ') || 'None'}`);
      
      if (failedDisputes.length > 0) {
        console.log("\nFetching details for each failed dispute...");
        for (const disputeId of failedDisputes) {
          const details = await dealRetrieveSLA.getDealDisputeDetails(disputeId);
          console.log(`\nDispute ID: ${disputeId}`);
          console.log(`Deal ID: ${details[1]}`);
          console.log(`Reason: ${details[5]}`);
        }
      }
    } catch (error) {
      console.error("Error fetching failed disputes:", error.message);
    }
  });

task("getPendingDisputes", "Get list of pending disputes for a provider")
  .addParam("actorid", "Actor ID of the storage provider")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const actorId = BigInt(taskArgs.actorid);
      
      console.log(`Fetching pending disputes for provider with actor ID: ${actorId}`);
      
      const pendingDisputes = await dealRetrieveSLA.getProviderPendingDisputes(actorId);
      
      console.log(`\nPending Dispute IDs: ${pendingDisputes.join(', ') || 'None'}`);
      
      if (pendingDisputes.length > 0) {
        console.log("\nFetching details for each pending dispute...");
        for (const disputeId of pendingDisputes) {
          const details = await dealRetrieveSLA.getDealDisputeDetails(disputeId);
          console.log(`\nDispute ID: ${disputeId}`);
          console.log(`Deal ID: ${details[1]}`);
          console.log(`Reason: ${details[5]}`);
        }
      }
    } catch (error) {
      console.error("Error fetching pending disputes:", error.message);
    }
  });

module.exports = {};