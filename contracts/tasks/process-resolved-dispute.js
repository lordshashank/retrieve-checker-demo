const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract, getDisputeStatusString } = require("./utils/contract-utils");

task("processResolvedDispute", "Process a resolved dispute")
  .addParam("disputeid", "ID of the dispute to process")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const disputeId = BigInt(taskArgs.disputeid);
      
      console.log(`Processing resolved dispute with ID: ${disputeId}`);
      
      // First check the status to provide better feedback
      const disputeDetails = await dealRetrieveSLA.getDealDisputeDetails(disputeId);
      console.log(`Current dispute status: ${getDisputeStatusString(disputeDetails[6])}`);
      
      const tx = await dealRetrieveSLA.processResolvedDispute(disputeId);
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Dispute processed successfully!`);
      
      // Parse events properly
      const iface = dealRetrieveSLA.interface;
      const processedEvent = receipt.logs
        .map(log => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(log => log && log.name === 'DisputeProcessed');

      if (processedEvent) {
        console.log(`Event details: Status: ${getDisputeStatusString(processedEvent.args[2])}`);
        console.log(`Penalty: ${hre.ethers.formatEther(processedEvent.args[3])} FIL`);
        console.log(`Rewards - Raiser: ${hre.ethers.formatEther(processedEvent.args[4])} FIL`);
        console.log(`Client: ${hre.ethers.formatEther(processedEvent.args[5])} FIL`);
      }
    } catch (error) {
      console.error("Error processing dispute:", error.message);
    }
  });

module.exports = {};