/**
 * Deploys the Voting contract and writes its address + ABI to
 * frontend/src/contracts/Voting.json so the React app can find it.
 *
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("------------------------------------------------------------");
  console.log(` Network   : ${network.name} (chainId ${network.config.chainId})`);
  console.log(` Deployer  : ${deployer.address}`);
  console.log(` Balance   : ${ethers.formatEther(balance)} ETH`);
  console.log("------------------------------------------------------------");

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  const deployTx = voting.deploymentTransaction();
  console.log(` Deploy tx : ${deployTx.hash}`);

  await voting.waitForDeployment();
  const receipt = await deployTx.wait();
  const address = await voting.getAddress();

  console.log(` Contract  : ${address}`);
  console.log(` Block     : ${receipt.blockNumber}`);
  console.log(` Gas used  : ${receipt.gasUsed.toString()}`);

  // Export address + ABI for the frontend
  const artifact = await hre.artifacts.readArtifact("Voting");
  const output = {
    address,
    chainId: Number(network.config.chainId),
    network: network.name,
    deployBlock: receipt.blockNumber,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const outDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "Voting.json");
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(` Frontend config written to ${path.relative(process.cwd(), outFile)}`);
  console.log("------------------------------------------------------------");
  console.log(" Next: run `npm run seed:local` to create the demo election,");
  console.log(" or configure it yourself from the Admin page of the dApp.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
