const { task } = require("hardhat/config");
const { getRetrieveCheckerContract, getDisputeStatusString } = require("./utils/contract-utils");

task("getDisputeStatus", "Get the status of a dispute directly from the RetrieveChecker contract")
  .addParam("id", "Dispute ID to check")
  .addOptionalParam("address", "RetrieveChecker contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const retrieveChecker = await getRetrieveCheckerContract(hre, taskArgs.address);
      const disputeId = taskArgs.id;
      
      console.log(`Fetching status for dispute ID: ${disputeId}`);
      
      // Get dispute status
      const status = await retrieveChecker.getDisputeStatus(disputeId);
      console.log(`Dispute status: ${status}`);
      console.log(`Status: ${getDisputeStatusString(status)}`);
      
      // Get full dispute details for more information
      const disputeDetails = await retrieveChecker.getDisputeDetails(disputeId);
      
      console.log(`\nDispute Details:`);
      console.log(`Dispute ID: ${disputeDetails.disputeId.toString()}`);
      console.log(`Raiser: ${disputeDetails.raiser}`);
      console.log(`Storage Provider Actor ID: ${disputeDetails.spActorId.toString()}`);
      console.log(`CID: ${hre.ethers.hexlify(disputeDetails.cid)}`);
      console.log(`Raised at: ${new Date(Number(disputeDetails.timestamp) * 1000).toLocaleString()}`);
      
      if (disputeDetails.resolutionTimestamp > 0) {
        console.log(`Resolved at: ${new Date(Number(disputeDetails.resolutionTimestamp) * 1000).toLocaleString()}`);
      } else {
        console.log(`Resolved at: Not yet resolved`);
      }
      
      // Calculate time elapsed since dispute was raised
      const disputeAge = Math.floor((Date.now() / 1000) - Number(disputeDetails.timestamp));
      console.log(`Time since dispute raised: ${formatTimeInterval(disputeAge)}`);
      
      if (disputeDetails.resolutionTimestamp > 0) {
        const resolutionTime = Number(disputeDetails.resolutionTimestamp) - Number(disputeDetails.timestamp);
        console.log(`Time to resolution: ${formatTimeInterval(resolutionTime)}`);
      }
    } catch (error) {
      console.error("Error fetching dispute status:", error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  });

/**
 * Format a time interval in seconds to a human-readable string
 */
function formatTimeInterval(seconds) {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes, ${seconds % 60} seconds`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours, ${remainingMinutes} minutes`;
  }
  const days = Math.floor(seconds / 86400);
  const remainingHours = Math.floor((seconds % 86400) / 3600);
  return `${days} days, ${remainingHours} hours`;
}

module.exports = {};
