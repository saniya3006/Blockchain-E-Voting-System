// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  Voting - Decentralized E-Voting (educational prototype)
 * @notice One deployed contract = one election.
 *         The deployer becomes the administrator (owner). The admin configures
 *         the election, registers candidates and starts / ends the election.
 *         Any wallet address may cast exactly one vote while voting is open.
 *
 * @dev    IMPORTANT: Everything stored on a public blockchain is public.
 *         This contract therefore stores NO personal data about voters - only
 *         their wallet address and a "has voted" flag. Votes are NOT secret:
 *         anyone can see which address voted for which candidate by reading
 *         the VoteCast events. This is an academic demonstration and must not
 *         be used for real public elections.
 */
contract Voting {
    // ------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------

    /// Life-cycle of the election as controlled by the administrator.
    /// Setup  -> admin configures election details and adds candidates
    /// Active -> election started; voting allowed between startTime and endTime
    /// Ended  -> admin closed the election; results are final
    enum Phase {
        Setup,
        Active,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    // ------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------

    /// Administrator of this election (the account that deployed the contract).
    address public owner;

    string public electionTitle;
    string public electionDescription;
    uint256 public startTime; // unix timestamp (seconds)
    uint256 public endTime; // unix timestamp (seconds)
    Phase public phase;

    Candidate[] private candidates;

    /// Records whether a wallet address has already voted (one wallet, one vote).
    mapping(address => bool) public hasVoted;

    /// Total number of votes cast in this election.
    uint256 public totalVotes;

    // ------------------------------------------------------------------
    // Events (stored in transaction logs - cheap, permanent and searchable)
    // ------------------------------------------------------------------

    event ElectionConfigured(string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event ElectionStarted(uint256 startTime, uint256 endTime);
    event ElectionEnded(uint256 endedAt, uint256 totalVotes);
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    // ------------------------------------------------------------------
    // Custom errors (cheaper than revert strings, decoded by the frontend)
    // ------------------------------------------------------------------

    error NotOwner();
    error InvalidPhase(Phase expected, Phase actual);
    error EmptyField(string field);
    error InvalidTimeRange();
    error NotEnoughCandidates();
    error InvalidCandidate(uint256 candidateId);
    error AlreadyVoted();
    error ElectionNotActive();
    error VotingNotStarted();
    error VotingPeriodOver();
    error ResultsNotFinal();

    // ------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------

    modifier onlyOwner() {
        // msg.sender (never tx.origin) is the account that directly called us
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier inPhase(Phase expected) {
        if (phase != expected) revert InvalidPhase(expected, phase);
        _;
    }

    // ------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        phase = Phase.Setup;
    }

    // ------------------------------------------------------------------
    // Admin functions
    // ------------------------------------------------------------------

    /**
     * @notice Set (or update) the election details. Only allowed before the
     *         election is started.
     * @param _title       Election title, e.g. "Student Council Election 2026"
     * @param _description Short description of the election
     * @param _startTime   Unix timestamp when voting opens
     * @param _endTime     Unix timestamp when voting closes
     */
    function configureElection(
        string calldata _title,
        string calldata _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner inPhase(Phase.Setup) {
        if (bytes(_title).length == 0) revert EmptyField("title");
        if (_endTime <= _startTime || _endTime <= block.timestamp) revert InvalidTimeRange();

        electionTitle = _title;
        electionDescription = _description;
        startTime = _startTime;
        endTime = _endTime;

        emit ElectionConfigured(_title, _startTime, _endTime);
    }

    /**
     * @notice Register a new candidate. Candidates cannot be added once the
     *         election has started, so the ballot cannot change mid-vote.
     */
    function addCandidate(string calldata _name, string calldata _description)
        external
        onlyOwner
        inPhase(Phase.Setup)
    {
        if (bytes(_name).length == 0) revert EmptyField("name");

        uint256 newId = candidates.length;
        candidates.push(Candidate({id: newId, name: _name, description: _description, voteCount: 0}));

        emit CandidateAdded(newId, _name);
    }

    /**
     * @notice Start the election. Requires a configured election with at least
     *         two candidates and an end time that is still in the future.
     */
    function startElection() external onlyOwner inPhase(Phase.Setup) {
        if (bytes(electionTitle).length == 0) revert EmptyField("title");
        if (candidates.length < 2) revert NotEnoughCandidates();
        if (endTime <= block.timestamp) revert InvalidTimeRange();

        phase = Phase.Active;
        emit ElectionStarted(startTime, endTime);
    }

    /**
     * @notice End the election. After this no more votes are accepted and the
     *         results become final. The admin may end the election early.
     */
    function endElection() external onlyOwner inPhase(Phase.Active) {
        phase = Phase.Ended;
        emit ElectionEnded(block.timestamp, totalVotes);
    }

    // ------------------------------------------------------------------
    // Voting
    // ------------------------------------------------------------------

    /**
     * @notice Cast a vote for a candidate. Each wallet address can vote once.
     * @param candidateId Index of the candidate (0-based)
     */
    function vote(uint256 candidateId) external {
        if (phase != Phase.Active) revert ElectionNotActive();
        if (block.timestamp < startTime) revert VotingNotStarted();
        if (block.timestamp > endTime) revert VotingPeriodOver();
        if (hasVoted[msg.sender]) revert AlreadyVoted();
        if (candidateId >= candidates.length) revert InvalidCandidate(candidateId);

        // Effects: mark voter first, then count the vote
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(msg.sender, candidateId);
    }

    // ------------------------------------------------------------------
    // Read-only (view) functions - free to call, no transaction needed
    // ------------------------------------------------------------------

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        if (candidateId >= candidates.length) revert InvalidCandidate(candidateId);
        return candidates[candidateId];
    }

    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function getTotalVotes() external view returns (uint256) {
        return totalVotes;
    }

    function hasUserVoted(address voter) external view returns (bool) {
        return hasVoted[voter];
    }

    /// @notice True only when a vote submitted right now would be accepted
    ///         (ignoring the per-wallet "already voted" check).
    function isVotingOpen() public view returns (bool) {
        return phase == Phase.Active && block.timestamp >= startTime && block.timestamp <= endTime;
    }

    /// @notice Human-readable election status.
    function getElectionStatus() external view returns (string memory) {
        if (phase == Phase.Setup) return "Not Started";
        if (phase == Phase.Ended) return "Ended";
        if (block.timestamp < startTime) return "Scheduled";
        if (block.timestamp > endTime) return "Voting Period Over";
        return "Voting Open";
    }

    /// @notice All election details in a single call (used by the frontend).
    function getElectionDetails()
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 start,
            uint256 end,
            Phase currentPhase,
            uint256 candidateCount,
            uint256 votesCast,
            bool votingOpen,
            address admin
        )
    {
        return (
            electionTitle,
            electionDescription,
            startTime,
            endTime,
            phase,
            candidates.length,
            totalVotes,
            isVotingOpen(),
            owner
        );
    }

    /// @notice Full results: every candidate with their vote count, plus the total.
    function getResults() external view returns (Candidate[] memory list, uint256 total) {
        return (candidates, totalVotes);
    }

    /**
     * @notice Winner of the election. Only available once results are final,
     *         i.e. the admin has ended the election or the voting period is over.
     * @return winnerId  ID of the leading candidate (lowest ID wins a tie)
     * @return name      Name of the leading candidate
     * @return voteCount Votes received by the leading candidate
     * @return isTie     True if two or more candidates share the top vote count
     */
    function getWinner()
        external
        view
        returns (uint256 winnerId, string memory name, uint256 voteCount, bool isTie)
    {
        bool timeOver = phase == Phase.Active && block.timestamp > endTime;
        if (phase != Phase.Ended && !timeOver) revert ResultsNotFinal();
        if (candidates.length == 0) revert NotEnoughCandidates();

        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 votes = candidates[i].voteCount;
            if (i == 0 || votes > voteCount) {
                winnerId = i;
                voteCount = votes;
                isTie = false;
            } else if (votes == voteCount) {
                isTie = true;
            }
        }
        name = candidates[winnerId].name;
    }
}
