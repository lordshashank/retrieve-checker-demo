const { task } = require("hardhat/config");
const { getDealRetrieveSLAContract } = require("./utils/contract-utils");

task("raiseDispute", "Raise a dispute for a storage provider's retrieval failure")
  .addParam("dealid", "ID of the deal in dispute")
  .addParam("reason", "Reason for raising the dispute")
  .addOptionalParam("fee", "Fee to pay for raising the dispute (in ether units)", "0.01")
  .addOptionalParam("address", "Contract address (uses the latest deployed if not provided)")
  .setAction(async (taskArgs, hre) => {
    try {
      const dealRetrieveSLA = await getDealRetrieveSLAContract(hre, taskArgs.address);
      const dealId = BigInt(taskArgs.dealid);
      const fee = hre.ethers.parseEther(taskArgs.fee);
      
      console.log(`Raising dispute for deal ID: ${dealId}`);
      console.log(`Reason: ${taskArgs.reason}`);
      console.log(`Fee: ${taskArgs.fee} FIL`);
      
      const tx = await dealRetrieveSLA.raiseDispute(dealId, taskArgs.reason, { value: fee });
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Dispute raised successfully!`);
      
      // Parse events properly
      const iface = dealRetrieveSLA.interface;
      const disputeEvent = receipt.logs
        .map(log => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(log => log && log.name === 'DisputeRaised');

      if (disputeEvent) {
        console.log(`Dispute ID: ${disputeEvent.args[0]}`);
        console.log(`Dispute details: DealID: ${disputeEvent.args[2]}, Provider: ${disputeEvent.args[4]}`);
      }
    } catch (error) {
      console.error("Error raising dispute:", error.message);
    }
  });

module.exports = {};