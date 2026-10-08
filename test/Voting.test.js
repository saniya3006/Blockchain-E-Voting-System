const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;
const Phase = { Setup: 0n, Active: 1n, Ended: 2n };

describe("Voting", function () {
  // ---------------------------------------------------------------------------
  // Fixtures
  // ---------------------------------------------------------------------------

  /** Freshly deployed contract, nothing configured. */
  async function deployFixture() {
    const [owner, voter1, voter2, voter3, outsider] = await ethers.getSigners();
    const voting = await ethers.deployContract("Voting");
    return { voting, owner, voter1, voter2, voter3, outsider };
  }

  /** Election configured (opens in 1 hour, lasts 1 day) with 3 candidates, not started. */
  async function configuredFixture() {
    const base = await deployFixture();
    const now = await time.latest();
    const start = now + ONE_HOUR;
    const end = start + ONE_DAY;
    await base.voting.configureElection("Student Council 2026", "Annual election", start, end);
    await base.voting.addCandidate("Alice Johnson", "Sustainability");
    await base.voting.addCandidate("Rahul Sharma", "Placements");
    await base.voting.addCandidate("Priya Nair", "Inclusion");
    return { ...base, start, end };
  }

  /** Election started and the voting window currently open. */
  async function openFixture() {
    const base = await configuredFixture();
    await base.voting.startElection();
    await time.increaseTo(base.start);
    return base;
  }

  // ---------------------------------------------------------------------------
  // 1-2. Deployment & ownership
  // ---------------------------------------------------------------------------

  describe("Deployment", function () {
    it("deploys with a valid address", async function () {
      const { voting } = await loadFixture(deployFixture);
      expect(await voting.getAddress()).to.be.properAddress;
    });

    it("sets the deployer as owner", async function () {
      const { voting, owner } = await loadFixture(deployFixture);
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("starts in Setup phase with no candidates or votes", async function () {
      const { voting } = await loadFixture(deployFixture);
      expect(await voting.phase()).to.equal(Phase.Setup);
      expect(await voting.getCandidateCount()).to.equal(0n);
      expect(await voting.getTotalVotes()).to.equal(0n);
      expect(await voting.getElectionStatus()).to.equal("Not Started");
      expect(await voting.isVotingOpen()).to.equal(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 3-4. Election configuration & candidates
  // ---------------------------------------------------------------------------

  describe("Election configuration", function () {
    it("stores title, description and times and emits ElectionConfigured", async function () {
      const { voting } = await loadFixture(deployFixture);
      const now = await time.latest();
      await expect(voting.configureElection("Test Election", "Desc", now + 10, now + 1000))
        .to.emit(voting, "ElectionConfigured")
        .withArgs("Test Election", now + 10, now + 1000);

      const details = await voting.getElectionDetails();
      expect(details.title).to.equal("Test Election");
      expect(details.description).to.equal("Desc");
      expect(details.start).to.equal(BigInt(now + 10));
      expect(details.end).to.equal(BigInt(now + 1000));
      expect(details.admin).to.equal(await voting.owner());
    });

    it("rejects an empty title", async function () {
      const { voting } = await loadFixture(deployFixture);
      const now = await time.latest();
      await expect(voting.configureElection("", "Desc", now, now + 1000))
        .to.be.revertedWithCustomError(voting, "EmptyField")
        .withArgs("title");
    });

    it("rejects end time before start time or in the past", async function () {
      const { voting } = await loadFixture(deployFixture);
      const now = await time.latest();
      await expect(voting.configureElection("T", "D", now + 1000, now + 10)).to.be.revertedWithCustomError(
        voting,
        "InvalidTimeRange"
      );
      await expect(voting.configureElection("T", "D", now - 1000, now - 10)).to.be.revertedWithCustomError(
        voting,
        "InvalidTimeRange"
      );
    });

    it("cannot be reconfigured after the election has started", async function () {
      const { voting } = await loadFixture(configuredFixture);
      await voting.startElection();
      const now = await time.latest();
      await expect(voting.configureElection("New", "D", now, now + 1000))
        .to.be.revertedWithCustomError(voting, "InvalidPhase")
        .withArgs(Phase.Setup, Phase.Active);
    });
  });

  describe("Candidates", function () {
    it("adds candidates with sequential IDs and emits CandidateAdded", async function () {
      const { voting } = await loadFixture(deployFixture);
      await expect(voting.addCandidate("Alice", "A")).to.emit(voting, "CandidateAdded").withArgs(0n, "Alice");
      await expect(voting.addCandidate("Bob", "B")).to.emit(voting, "CandidateAdded").withArgs(1n, "Bob");

      const list = await voting.getCandidates();
      expect(list.length).to.equal(2);
      expect(list[1].id).to.equal(1n);
      expect(list[1].name).to.equal("Bob");
      expect(list[1].description).to.equal("B");
      expect(list[1].voteCount).to.equal(0n);
    });

    it("returns a single candidate by ID", async function () {
      const { voting } = await loadFixture(configuredFixture);
      const candidate = await voting.getCandidate(1);
      expect(candidate.name).to.equal("Rahul Sharma");
    });

    it("reverts getCandidate for an unknown ID", async function () {
      const { voting } = await loadFixture(configuredFixture);
      await expect(voting.getCandidate(99)).to.be.revertedWithCustomError(voting, "InvalidCandidate").withArgs(99n);
    });

    it("rejects an empty candidate name", async function () {
      const { voting } = await loadFixture(deployFixture);
      await expect(voting.addCandidate("", "desc"))
        .to.be.revertedWithCustomError(voting, "EmptyField")
        .withArgs("name");
    });

    it("prevents adding candidates after the election has started", async function () {
      const { voting } = await loadFixture(configuredFixture);
      await voting.startElection();
      await expect(voting.addCandidate("Late Entry", "Too late")).to.be.revertedWithCustomError(
        voting,
        "InvalidPhase"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 5-6. Starting & ending
  // ---------------------------------------------------------------------------

  describe("Starting and ending the election", function () {
    it("starts the election and emits ElectionStarted", async function () {
      const { voting, start, end } = await loadFixture(configuredFixture);
      await expect(voting.startElection()).to.emit(voting, "ElectionStarted").withArgs(start, end);
      expect(await voting.phase()).to.equal(Phase.Active);
      expect(await voting.getElectionStatus()).to.equal("Scheduled");
    });

    it("cannot start without a configured title", async function () {
      const { voting } = await loadFixture(deployFixture);
      await voting.addCandidate("A", "");
      await voting.addCandidate("B", "");
      await expect(voting.startElection()).to.be.revertedWithCustomError(voting, "EmptyField").withArgs("title");
    });

    it("cannot start with fewer than two candidates", async function () {
      const { voting } = await loadFixture(deployFixture);
      const now = await time.latest();
      await voting.configureElection("T", "D", now, now + ONE_DAY);
      await voting.addCandidate("Only One", "");
      await expect(voting.startElection()).to.be.revertedWithCustomError(voting, "NotEnoughCandidates");
    });

    it("cannot start once the configured end time has passed", async function () {
      const { voting, end } = await loadFixture(configuredFixture);
      await time.increaseTo(end + 1);
      await expect(voting.startElection()).to.be.revertedWithCustomError(voting, "InvalidTimeRange");
    });

    it("cannot be started twice", async function () {
      const { voting } = await loadFixture(configuredFixture);
      await voting.startElection();
      await expect(voting.startElection()).to.be.revertedWithCustomError(voting, "InvalidPhase");
    });

    it("ends the election and emits ElectionEnded with total votes", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await expect(voting.endElection()).to.emit(voting, "ElectionEnded").withArgs(anyValue, 1n);
      expect(await voting.phase()).to.equal(Phase.Ended);
      expect(await voting.getElectionStatus()).to.equal("Ended");
    });

    it("cannot end an election that has not started", async function () {
      const { voting } = await loadFixture(configuredFixture);
      await expect(voting.endElection())
        .to.be.revertedWithCustomError(voting, "InvalidPhase")
        .withArgs(Phase.Active, Phase.Setup);
    });
  });

  // ---------------------------------------------------------------------------
  // 7-11, 13. Voting
  // ---------------------------------------------------------------------------

  describe("Voting", function () {
    it("accepts a valid vote, updates counts and emits VoteCast", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      expect(await voting.getElectionStatus()).to.equal("Voting Open");
      expect(await voting.isVotingOpen()).to.equal(true);

      await expect(voting.connect(voter1).vote(1)).to.emit(voting, "VoteCast").withArgs(voter1.address, 1n);

      expect((await voting.getCandidate(1)).voteCount).to.equal(1n);
      expect(await voting.getTotalVotes()).to.equal(1n);
      expect(await voting.hasVoted(voter1.address)).to.equal(true);
      expect(await voting.hasUserVoted(voter1.address)).to.equal(true);
    });

    it("rejects a second vote from the same wallet", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await expect(voting.connect(voter1).vote(1)).to.be.revertedWithCustomError(voting, "AlreadyVoted");
      // the failed attempt must not change any counts
      expect((await voting.getCandidate(1)).voteCount).to.equal(0n);
      expect(await voting.getTotalVotes()).to.equal(1n);
    });

    it("rejects an invalid candidate ID", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      await expect(voting.connect(voter1).vote(3))
        .to.be.revertedWithCustomError(voting, "InvalidCandidate")
        .withArgs(3n);
      expect(await voting.hasVoted(voter1.address)).to.equal(false);
    });

    it("rejects voting while the election is still in setup", async function () {
      const { voting, voter1 } = await loadFixture(configuredFixture);
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(voting, "ElectionNotActive");
    });

    it("rejects voting before the start time", async function () {
      const { voting, voter1 } = await loadFixture(configuredFixture);
      await voting.startElection();
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(voting, "VotingNotStarted");
    });

    it("rejects voting after the end time", async function () {
      const { voting, voter1, end } = await loadFixture(openFixture);
      await time.increaseTo(end + 1);
      expect(await voting.getElectionStatus()).to.equal("Voting Period Over");
      expect(await voting.isVotingOpen()).to.equal(false);
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(voting, "VotingPeriodOver");
    });

    it("rejects voting after the admin ended the election", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      await voting.endElection();
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(voting, "ElectionNotActive");
    });

    it("counts votes from multiple wallets correctly", async function () {
      const { voting, owner, voter1, voter2, voter3 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(2);
      await voting.connect(voter3).vote(2);
      await voting.connect(owner).vote(1); // the admin is also allowed one vote

      const [list, total] = await voting.getResults();
      expect(list.map((c) => c.voteCount)).to.deep.equal([1n, 1n, 2n]);
      expect(total).to.equal(4n);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Access control
  // ---------------------------------------------------------------------------

  describe("Access control", function () {
    it("blocks non-owners from every admin function", async function () {
      const { voting, outsider } = await loadFixture(configuredFixture);
      const now = await time.latest();
      const asOutsider = voting.connect(outsider);

      await expect(asOutsider.configureElection("Hack", "", now, now + 100)).to.be.revertedWithCustomError(
        voting,
        "NotOwner"
      );
      await expect(asOutsider.addCandidate("Mallory", "")).to.be.revertedWithCustomError(voting, "NotOwner");
      await expect(asOutsider.startElection()).to.be.revertedWithCustomError(voting, "NotOwner");

      await voting.startElection();
      await expect(asOutsider.endElection()).to.be.revertedWithCustomError(voting, "NotOwner");
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Results & winner
  // ---------------------------------------------------------------------------

  describe("Results and winner", function () {
    it("does not reveal a winner while voting is still running", async function () {
      const { voting, voter1 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await expect(voting.getWinner()).to.be.revertedWithCustomError(voting, "ResultsNotFinal");
    });

    it("returns the candidate with the most votes after the election ends", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(1);
      await voting.connect(voter3).vote(2);
      await voting.endElection();

      const winner = await voting.getWinner();
      expect(winner.winnerId).to.equal(1n);
      expect(winner.name).to.equal("Rahul Sharma");
      expect(winner.voteCount).to.equal(2n);
      expect(winner.isTie).to.equal(false);
    });

    it("reports a tie when the top candidates have equal votes", async function () {
      const { voting, voter1, voter2 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(2);
      await voting.endElection();

      const winner = await voting.getWinner();
      expect(winner.isTie).to.equal(true);
      expect(winner.voteCount).to.equal(1n);
    });

    it("clears the tie flag when a later candidate takes the lead", async function () {
      const { voting, owner, voter1, voter2, voter3 } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(1); // tie between 0 and 1 ...
      await voting.connect(voter3).vote(2);
      await voting.connect(owner).vote(2); // ... then candidate 2 leads
      await voting.endElection();

      const winner = await voting.getWinner();
      expect(winner.winnerId).to.equal(2n);
      expect(winner.isTie).to.equal(false);
    });

    it("makes results final automatically once the voting period is over", async function () {
      const { voting, voter1, end } = await loadFixture(openFixture);
      await voting.connect(voter1).vote(2);
      await time.increaseTo(end + 1);
      const winner = await voting.getWinner();
      expect(winner.name).to.equal("Priya Nair");
    });
  });
});
