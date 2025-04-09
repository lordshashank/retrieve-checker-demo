const hre = require("hardhat");
const { saveDeploymentInfo } = require("./utils/deployment");

async function main() {
  console.log("Deploying RetrieveChecker contract...");

  // Get the network name and deployer
  const networkName = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Network: ${networkName}`);
  console.log(`Deploying from account: ${deployer.address}`);

  // Deploy the RetrieveChecker contract
  const disputeFee = hre.ethers.parseEther("0.01");
  const RetrieveChecker = await hre.ethers.getContractFactory("RetrieveChecker");
  const retrieveChecker = await RetrieveChecker.deploy(
    deployer.address,
    disputeFee
  );

  await retrieveChecker.waitForDeployment();
  const retrieveCheckerAddress = await retrieveChecker.getAddress();
  console.log(`RetrieveChecker deployed to: ${retrieveCheckerAddress}`);

  // Save only the contract address
  await saveDeploymentInfo(networkName, {
    RetrieveChecker: retrieveCheckerAddress
  });
  
  console.log("Deployment completed successfully!");
  return retrieveCheckerAddress;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });