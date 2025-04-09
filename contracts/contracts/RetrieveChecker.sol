// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title RetrieveChecker
 * @dev Base contract for handling file retrieval disputes
 */
contract RetrieveChecker {
    address public owner;
    address public retrieveCheckerAddress;
    
    // Fixed fee for raising disputes
    uint256 public disputeFee;
    
    // Free dispute limit per user
    uint256 public freeDisputeLimit = 10;
    
    // Enum to track dispute status
    enum DisputeStatus {
        None,       // No dispute exists
        Pending,    // Dispute raised but not yet resolved
        Resolved,   // Dispute resolved with no penalty (retrieval was successful)
        Failed,     // Dispute resolved with penalty (retrieval failed)
        Rejected    // Dispute rejected as invalid
    }
    
    // Minimal struct to store dispute information
    struct Dispute {
        uint256 disputeId;
        address raiser;
        bytes cid;
        DisputeStatus status;
        uint256 timestamp;
        uint256 resolutionTimestamp;
    }
    
    // Mapping to track disputes by ID
    mapping(uint256 => Dispute) public disputes;
    
    // Mapping to track number of disputes raised by an address
    mapping(address => uint256) public disputesByAddress;
    
    // Current dispute ID counter
    uint256 public currentDisputeId;
    
    // Events
    event DisputeRaised(uint256 disputeId, address raiser, bytes cid);
    event DisputeResolved(uint256 disputeId, DisputeStatus status);
    event RetrieveCheckerChanged(address newCheckerAddress);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRetrieveChecker() {
        require(msg.sender == retrieveCheckerAddress, "Only retrieve checker can call this function");
        _;
    }
    
    /**
     * @dev Constructor to initialize the contract with a retrieve checker address and dispute fee
     * @param _retrieveCheckerAddress Address allowed to resolve disputes
     * @param _disputeFee Fee required to raise a dispute
     */
    constructor(
        address _retrieveCheckerAddress, 
        uint256 _disputeFee
    ) {
        owner = msg.sender;
        retrieveCheckerAddress = _retrieveCheckerAddress;
        disputeFee = _disputeFee;
    }
    
    /**
     * @dev Raise a dispute for a content retrieval failure
     * @param cid The CID of the content that failed to retrieve
     * @return The ID of the created dispute
     */
    function raiseDispute(bytes calldata cid) external payable returns (uint256) {
        // Check if the sender still has free disputes available
        bool isFree = disputesByAddress[msg.sender] < freeDisputeLimit;
        
        // If it's not free, ensure the correct fee is paid
        if (!isFree) {
            require(msg.value >= disputeFee, "Insufficient fee for raising dispute");
        }
        
        // Create new dispute
        uint256 disputeId = currentDisputeId++;
        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            raiser: msg.sender,
            cid: cid,
            status: DisputeStatus.Pending,
            timestamp: block.timestamp,
            resolutionTimestamp: 0
        });
        
        // Increment dispute counter for this address
        disputesByAddress[msg.sender]++;
        
        // Emit event
        emit DisputeRaised(disputeId, msg.sender, cid);
        
        return disputeId;
    }
    
    /**
     * @dev Resolve a retrieval dispute
     * @param disputeId ID of the dispute to resolve
     * @param newStatus New status of the dispute (Resolved, Failed, Rejected)
     */
    function resolveDispute(
        uint256 disputeId,
        DisputeStatus newStatus
    ) external onlyRetrieveChecker {
        require(disputeId < currentDisputeId, "Invalid dispute ID");
        
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Pending, "Dispute is not in pending state");
        
        // Update dispute resolution time
        dispute.resolutionTimestamp = block.timestamp;
        
        // Update dispute status
        dispute.status = newStatus;
        
        // Emit event
        emit DisputeResolved(disputeId, newStatus);
    }
    
    /**
     * @dev Get dispute details by ID
     * @param disputeId ID of the dispute
     * @return The Dispute struct with all details
     */
    function getDisputeDetails(uint256 disputeId) external view returns (Dispute memory) {
        require(disputeId < currentDisputeId, "Invalid dispute ID");
        return disputes[disputeId];
    }
    
    /**
     * @dev Get a dispute's status
     * @param disputeId ID of the dispute
     * @return The status of the dispute
     */
    function getDisputeStatus(uint256 disputeId) external view returns (DisputeStatus) {
        require(disputeId < currentDisputeId, "Invalid dispute ID");
        return disputes[disputeId].status;
    }
    
    /**
     * @dev Change the retrieve checker address
     * @param newCheckerAddress New address for the retrieve checker
     */
    function setRetrieveCheckerAddress(address newCheckerAddress) external onlyOwner {
        retrieveCheckerAddress = newCheckerAddress;
        emit RetrieveCheckerChanged(newCheckerAddress);
    }
    
    /**
     * @dev Set the dispute fee
     * @param _disputeFee New fee for raising disputes
     */
    function setDisputeFee(uint256 _disputeFee) external onlyOwner {
        disputeFee = _disputeFee;
    }
    
    /**
     * @dev Set the number of free disputes per address
     * @param _freeDisputeLimit New limit for free disputes
     */
    function setFreeDisputeLimit(uint256 _freeDisputeLimit) external onlyOwner {
        freeDisputeLimit = _freeDisputeLimit;
    }
    
    /**
     * @dev Withdraw collected fees
     * @param to Address to send the fees to
     */
    function withdrawFees(address payable to) external onlyOwner {
        require(to != address(0), "Invalid address");
        to.transfer(address(this).balance);
    }
}