/**
 * LOCAL NETWORK ONLY: casts a few sample votes from Hardhat test accounts
 * #10 - #15 so the results dashboard has data to show during the demo.
 * Accounts #0 (admin) and #1 - #9 are left untouched for live voting in MetaMask.
 *
 *   npx hardhat run scripts/cast-sample-votes.js --network localhost
 */
const hre = require("hardhat");
const { loadDeployment } = require("./utils");

// Candidate IDs voted for by accounts #10, #11, ... -> Alice 2, Rahul 2, Priya 1, Arjun 1
// (a tie at the top, so the live vote during the viva decides the winner)
const SAMPLE_VOTES = [0, 1, 1, 0, 2, 3];

async function main() {
  const { ethers, network } = hre;
  if (network.config.chainId !== 31337) {
    throw new Error("Sample votes are only meant for the local Hardhat network.");
  }

  const deployment = loadDeployment();
  const voting = await ethers.getContractAt("Voting", deployment.address);
  const signers = await ethers.getSigners();

  if (!(await voting.isVotingOpen())) {
    console.log("Voting is not open - run `npm run seed:local` first.");
    return;
  }

  for (let i = 0; i < SAMPLE_VOTES.length; i++) {
    const voter = signers[10 + i];
    if (await voting.hasVoted(voter.address)) {
      console.log(`  - ${voter.address} already voted, skipping`);
      continue;
    }
    const tx = await voting.connect(voter).vote(SAMPLE_VOTES[i]);
    await tx.wait();
    console.log(`  + ${voter.address} voted for candidate #${SAMPLE_VOTES[i]}`);
  }

  console.log(`Total votes: ${await voting.getTotalVotes()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
