const { getLatestDeployment } = require("../../scripts/utils/deployment");

// Helper function to get deployed contract instance
async function getDealRetrieveSLAContract(hre, address = null) {
  const [deployer] = await hre.ethers.getSigners();
  const DealRetrieveSLA = await hre.ethers.getContractFactory("DealRetrieveSLA");
  
  // If no address provided, try to get the latest deployed contract
  if (!address) {
    address = await getLatestDeployment(hre.network.name, "DealRetrieveSLA");
    
    if (!address) {
      throw new Error("DealRetrieveSLA contract not deployed and no address provided");
    }
  }
  
  console.log(`Using DealRetrieveSLA contract at address: ${address}`);
  return await DealRetrieveSLA.connect(deployer).attach(address);
}

// Helper function to get deployed RetrieveChecker contract instance
async function getRetrieveCheckerContract(hre, address = null) {
  const [deployer] = await hre.ethers.getSigners();
  const RetrieveChecker = await hre.ethers.getContractFactory("RetrieveChecker");
  
  // If no address provided, try to get the latest deployed contract
  if (!address) {
    address = await getLatestDeployment(hre.network.name, "RetrieveChecker");
    
    if (!address) {
      throw new Error("RetrieveChecker contract not deployed and no address provided");
    }
  }
  
  console.log(`Using RetrieveChecker contract at address: ${address}`);
  return await RetrieveChecker.connect(deployer).attach(address);
}

// Helper function to convert dispute status to string
function getDisputeStatusString(status) {
  const statusCodes = {
    0: "None",
    1: "Pending",
    2: "Resolved", 
    3: "Failed",
    4: "Rejected"
  };
  return statusCodes[status] || "Unknown";
}

module.exports = {
  getDealRetrieveSLAContract,
  getRetrieveCheckerContract,
  getDisputeStatusString
};