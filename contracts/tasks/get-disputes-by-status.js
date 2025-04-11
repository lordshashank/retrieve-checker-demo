const { task } = require("hardhat/config");
const { getRetrieveChecker } = require("./utils/contract-utils");

task("get-disputes-by-status", "Get all disputes with a specific status")
  .addParam("status", "Status to filter by (0=None, 1=Pending, 2=Resolved, 3=Failed, 4=Rejected)")
  .setAction(async (taskArgs, hre) => {
    const status = parseInt(taskArgs.status);
    if (isNaN(status) || status < 0 || status > 4) {
      throw new Error("Invalid status. Must be a number between 0 and 4");
    }

    const retrieveChecker = await getRetrieveChecker();
    const disputeIds = await retrieveChecker.getDisputesByStatus(status);

    if (disputeIds.length === 0) {
      console.log(`No disputes found with status ${status}`);
      return;
    }

    console.log(`Found ${disputeIds.length} dispute(s) with status ${status}:`);
    
    // Get details for each dispute
    for (const id of disputeIds) {
      const dispute = await retrieveChecker.getDisputeDetails(id);
      console.log(`\nDispute ID: ${dispute.disputeId}`);
      console.log(`Raiser: ${dispute.raiser}`);
      console.log(`CID: ${dispute.cid}`);
      console.log(`Timestamp: ${new Date(Number(dispute.timestamp) * 1000).toLocaleString()}`);
      if (dispute.resolutionTimestamp > 0) {
        console.log(`Resolution Time: ${new Date(Number(dispute.resolutionTimestamp) * 1000).toLocaleString()}`);
      }
    }
  });