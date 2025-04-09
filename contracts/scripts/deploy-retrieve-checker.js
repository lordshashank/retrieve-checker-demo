const hre = require("hardhat");
const { saveDeploymentInfo } = require("./utils/deployment");

async function deployRetrieveChecker(hre, deployer) {
  console.log("Deploying RetrieveChecker contract...");
  const disputeFee = hre.ethers.parseEther("0.01");
  
  const RetrieveChecker = await hre.ethers.getContractFactory("RetrieveChecker");
  const retrieveChecker = await RetrieveChecker.deploy(
    deployer.address,
    disputeFee
  );

  await retrieveChecker.waitForDeployment();
  const retrieveCheckerAddress = await retrieveChecker.getAddress();
  console.log(`New RetrieveChecker deployed to: ${retrieveCheckerAddress}`);

  // Save the new RetrieveChecker address
  await saveDeploymentInfo(hre.network.name, {
    RetrieveChecker: retrieveCheckerAddress
  });

  return retrieveCheckerAddress;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deploying from account: ${deployer.address}`);

  const retrieveCheckerAddress = await deployRetrieveChecker(hre, deployer);
  
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

module.exports = { deployRetrieveChecker };