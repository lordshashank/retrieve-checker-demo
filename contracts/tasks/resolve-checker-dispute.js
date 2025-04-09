const { task } = require("hardhat/config");
const { getRetrieveCheckerContract, getDisputeStatusString } = require("./utils/contract-utils");

task("resolveCheckerDispute", "Resolve a retrieval dispute in the RetrieveChecker contract")
  .addParam("disputeid", "ID of the dispute to resolve")
  .addParam("status", "New status for the dispute (1=Resolved, 2=Failed, 3=Rejected)")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const retrieveChecker = await getRetrieveCheckerContract(hre, taskArgs.address);
      const disputeId = BigInt(taskArgs.disputeid);
      const status = parseInt(taskArgs.status);
      
      // Validate status
      if (![2, 3, 4].includes(status)) {
        throw new Error("Invalid status. Must be 2 (Resolved), 3 (Failed), or 4 (Rejected)");
      }
      
      console.log(`Resolving dispute ID: ${disputeId}`);
      console.log(`New status: ${getDisputeStatusString(status)}`);
      
      // First check current dispute details
      const currentDetails = await retrieveChecker.getDisputeDetails(disputeId);
      console.log(`\nCurrent dispute status: ${getDisputeStatusString(currentDetails.status)}`);
      console.log(`Raised by: ${currentDetails.raiser}`);
      console.log(`CID: ${currentDetails.cid}`);
      
      const tx = await retrieveChecker.resolveDispute(disputeId, status);
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`\nDispute resolved successfully!`);
      
      // Parse events properly
      const iface = retrieveChecker.interface;
      const resolvedEvent = receipt.logs
        .map(log => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(log => log && log.name === 'DisputeResolved');

      if (resolvedEvent) {
        console.log(`Resolution status: ${getDisputeStatusString(resolvedEvent.args[1])}`);
      }
      
      // Get updated dispute details
      const updatedDetails = await retrieveChecker.getDisputeDetails(disputeId);
      console.log(`\nResolution timestamp: ${new Date(updatedDetails.resolutionTimestamp * 1000).toISOString()}`);
      
    } catch (error) {
      console.error("Error resolving dispute:", error.message);
    }
  });

module.exports = {};