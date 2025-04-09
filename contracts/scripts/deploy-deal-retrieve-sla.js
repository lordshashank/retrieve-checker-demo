const hre = require("hardhat");
const { saveDeploymentInfo, getLatestDeployment } = require("./utils/deployment");

async function deployRetrieveChecker(deployer) {
  console.log("Deploying new RetrieveChecker contract...");
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
  console.log("Deploying DealRetrieveSLA contract...");

  const networkName = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Network: ${networkName}`);
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Get or deploy RetrieveChecker
  let retrieveCheckerAddress = process.argv[2];
  
  if (!retrieveCheckerAddress) {
    console.log("No RetrieveChecker address provided as argument.");
    console.log("Checking for previously deployed RetrieveChecker...");
    
    retrieveCheckerAddress = await getLatestDeployment(networkName, "RetrieveChecker");
    
    if (!retrieveCheckerAddress) {
      console.log("No existing RetrieveChecker found. Will deploy a new one...");
      retrieveCheckerAddress = await deployRetrieveChecker(deployer);
    } else {
      console.log(`Using previously deployed RetrieveChecker at: ${retrieveCheckerAddress}`);
    }
  } else {
    console.log(`Using provided RetrieveChecker address: ${retrieveCheckerAddress}`);
  }

  // Deploy DealRetrieveSLA
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
  
  // Save contract address
  await saveDeploymentInfo(networkName, {
    DealRetrieveSLA: dealRetrieveSLAAddress
  });
  
  console.log("Deployment completed successfully!");
  return dealRetrieveSLAAddress;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });