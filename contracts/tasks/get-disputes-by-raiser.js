const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract, getDisputeStatusString } = require("./utils/contract-utils");

task("getDisputesByRaiser", "Get all disputes raised by a specific address")
  .addParam("raiser", "Address of the dispute raiser")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const raiserAddress = taskArgs.raiser;
      
      console.log(`Fetching disputes raised by address: ${raiserAddress}`);
      
      const disputes = await dealRetrieveSLA.getDisputesByRaiser(raiserAddress);
      
      if (disputes.length === 0) {
        console.log(`No disputes found for this address`);
        return;
      }
      
      console.log(`\nFound ${disputes.length} dispute(s):`);
      
      for (let i = 0; i < disputes.length; i++) {
        const dispute = disputes[i];
        
        // Get dispute status from the base contract
        const status = await dealRetrieveSLA.retrieveChecker().then(
          checkerAddress => {
            const retrieveChecker = hre.ethers.getContractAt("RetrieveChecker", checkerAddress);
            return retrieveChecker.then(contract => contract.getDisputeStatus(dispute.baseDisputeId));
          }
        );
        
        console.log(`\n--- Dispute ${i+1} ---`);
        console.log(`Dispute ID: ${dispute.baseDisputeId}`);
        console.log(`Deal ID: ${dispute.dealId}`);
        console.log(`Provider Actor ID: ${dispute.providerActorId}`);
        console.log(`Reason: ${dispute.reason}`);
        console.log(`Status: ${getDisputeStatusString(status)}`);
        
        // Check if dispute has been processed
        const processed = await dealRetrieveSLA.processedDisputes(dispute.baseDisputeId);
        console.log(`Processed: ${processed ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.error("Error fetching disputes by raiser:", error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  });

module.exports = {};
