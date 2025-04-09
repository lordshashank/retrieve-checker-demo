const hre = require("hardhat");
const { saveDeploymentInfo } = require("./utils/deployment");

async function main() {
  console.log("Starting deployment of all contracts...");

  const networkName = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Network: ${networkName}`);
  console.log(`Deploying from account: ${deployer.address}`);

  // Deploy RetrieveChecker
  console.log("\nDeploying RetrieveChecker contract...");
  const disputeFee = hre.ethers.parseEther("0.01");
  
  const RetrieveChecker = await hre.ethers.getContractFactory("RetrieveChecker");
  const retrieveChecker = await RetrieveChecker.deploy(
    deployer.address,
    disputeFee
  );

  await retrieveChecker.waitForDeployment();
  const retrieveCheckerAddress = await retrieveChecker.getAddress();
  console.log(`RetrieveChecker deployed to: ${retrieveCheckerAddress}`);

  // Deploy DealRetrieveSLA
  console.log("\nDeploying DealRetrieveSLA contract...");
  const minimumStake = hre.ethers.parseEther("1");
  const disputeRaiserRewardPercentage = 5;
  
  const DealRetrieveSLA = await hre.ethers.getContractFactory("DealRetrieveSLA");
  const dealRetrieveSLA = await DealRetrieveSLA.deploy(
    retrieveCheckerAddress,
    minimumStake,
    disputeRaiserRewardPercentage
  );

  await dealRetrieveSLA.waitForDeployment();
  const dealRetrieveSLAAddress = await dealRetrieveSLA.getAddress();
  console.log(`DealRetrieveSLA deployed to: ${dealRetrieveSLAAddress}`);

  // Save all contract addresses
  await saveDeploymentInfo(networkName, {
    RetrieveChecker: retrieveCheckerAddress,
    DealRetrieveSLA: dealRetrieveSLAAddress
  });

  console.log("\nDeployment completed successfully!");
  console.log({
    retrieveChecker: retrieveCheckerAddress,
    dealRetrieveSLA: dealRetrieveSLAAddress
  });

  return {
    retrieveChecker: retrieveCheckerAddress,
    dealRetrieveSLA: dealRetrieveSLAAddress
  };
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });