const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

/** Reads the deployment info written by deploy.js and checks it matches the current network. */
function loadDeployment() {
  const file = path.join(__dirname, "..", "frontend", "src", "contracts", "Voting.json");
  if (!fs.existsSync(file)) {
    throw new Error("frontend/src/contracts/Voting.json not found - run the deploy script first.");
  }
  const deployment = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!deployment.address) {
    throw new Error("No contract address in Voting.json - run the deploy script first.");
  }
  if (Number(deployment.chainId) !== Number(hre.network.config.chainId)) {
    throw new Error(
      `Voting.json is for chainId ${deployment.chainId} but you are running on ${hre.network.name} (chainId ${hre.network.config.chainId}).`
    );
  }
  return deployment;
}

module.exports = { loadDeployment };
