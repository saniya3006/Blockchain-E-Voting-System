/**
 * Creates the demo election on an already deployed Voting contract:
 *   "Student Council Election 2026" with four candidates, then starts it.
 *
 *   npx hardhat run scripts/seed-demo.js --network localhost
 *
 * The contract address is read from frontend/src/contracts/Voting.json
 * (written by deploy.js). Must be run with the admin (deployer) account.
 */
const hre = require("hardhat");
const { loadDeployment } = require("./utils");

const DEMO_ELECTION = {
  title: "Student Council Election 2026",
  description:
    "Annual election for the Student Council President. Every registered student wallet may cast exactly one vote.",
  durationDays: 7,
  candidates: [
    { name: "Alice Johnson", description: "Candidate for Student Council President - focus on campus sustainability" },
    { name: "Rahul Sharma", description: "Candidate for Student Council President - focus on placements and internships" },
    { name: "Priya Nair", description: "Candidate for Student Council President - focus on student safety and inclusion" },
    { name: "Arjun Mehta", description: "Candidate for Student Council President - focus on sports and cultural events" },
  ],
};

async function main() {
  const { ethers } = hre;
  const deployment = loadDeployment();
  const voting = await ethers.getContractAt("Voting", deployment.address);
  const [admin] = await ethers.getSigners();

  const owner = await voting.owner();
  if (owner.toLowerCase() !== admin.address.toLowerCase()) {
    throw new Error(`Signer ${admin.address} is not the contract owner (${owner}).`);
  }

  const phase = Number(await voting.phase());
  if (phase !== 0) {
    console.log("Election already started or ended - nothing to seed. Redeploy for a fresh election.");
    return;
  }

  // Use blockchain time (not the computer clock) so the window is always valid
  const now = (await ethers.provider.getBlock("latest")).timestamp;
  const start = now;
  const end = now + DEMO_ELECTION.durationDays * 24 * 60 * 60;

  console.log(`Configuring "${DEMO_ELECTION.title}" ...`);
  await (await voting.configureElection(DEMO_ELECTION.title, DEMO_ELECTION.description, start, end)).wait();

  const existing = Number(await voting.getCandidateCount());
  for (const candidate of DEMO_ELECTION.candidates.slice(existing)) {
    const tx = await voting.addCandidate(candidate.name, candidate.description);
    await tx.wait();
    console.log(`  + Candidate added: ${candidate.name}`);
  }

  await (await voting.startElection()).wait();
  console.log(`Election started. Voting closes ${new Date(end * 1000).toLocaleString()}.`);
  console.log(`Status: ${await voting.getElectionStatus()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
