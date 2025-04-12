// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {MarketAPI} from "filecoin-solidity-api/contracts/v0.8/MarketAPI.sol";
import {CommonTypes} from "filecoin-solidity-api/contracts/v0.8/types/CommonTypes.sol";
import {FilAddresses} from "filecoin-solidity-api/contracts/v0.8/utils/FilAddresses.sol";
import {MarketTypes} from "filecoin-solidity-api/contracts/v0.8/types/MarketTypes.sol";
import {DealInfo} from "./DealInfo.sol";
// import {FilForwarder} from "./FilForwarder.sol";
import {RetrieveChecker} from "./RetrieveChecker.sol";
import { SendAPI } from "filecoin-solidity-api/contracts/v0.8/SendAPI.sol";


/**
 * @title DealRetrieveSLA
 * @dev Contract for handling file retrieval disputes in Filecoin network
 */
contract DealRetrieveSLA is DealInfo {

    using SendAPI for CommonTypes.FilAddress;

    address public owner;
    RetrieveChecker public retrieveChecker;
    
    // Minimum stake required for storage providers
    uint256 public minimumStake;
    
    // Percentage of penalty to be given to dispute raiser (out of 100)
    uint8 public disputeRaiserRewardPercentage = 5; // 5% to raiser, rest to client
    
    // Import DisputeStatus enum from RetrieveChecker
    RetrieveChecker.DisputeStatus private zeroState; // Just for type reference
    
    // Struct to store enhanced dispute information
    struct DealDispute {
        uint256 baseDisputeId;
        uint64 dealId;
        CommonTypes.DealLabel dealLabel;
        bytes providerAddress;
        uint64 providerActorId;
        string reason;
        address raiser;  // Added field to track original raiser
    }
    
    // Struct to store provider statistics
    struct ProviderStats {
        uint256 totalDisputes;
        uint256 pendingDisputes;
        uint256 resolvedDisputes;
        uint256 failedDisputes;
        uint256 rejectedDisputes;
    }
    
    // Mapping to track registered storage providers
    mapping(bytes => bool) public registeredStorageProviders;

    // Array to track all registered SP actor IDs
    uint64[] public registeredSPActorIds;
    
    // Mapping to track staked amounts by storage providers
    mapping(bytes => uint256) public storageProviderStakes;
    
    // Mapping to track enhanced dispute info by base dispute ID
    mapping(uint256 => DealDispute) public dealDisputes;
    
    // Mapping to track disputes by provider
    mapping(bytes => uint256[]) public providerDisputes;

    // Mapping to track if a dispute has been processed already
    mapping(uint256 => bool) public processedDisputes;
    
    // Events
    event StorageProviderRegistered(uint64 actorId, bytes providerAddress, uint256 stakedAmount);
    event StorageProviderRemoved(bytes providerAddress);
    event DisputeRaised(uint256 baseDisputeId, address raiser, uint64 dealId, CommonTypes.DealLabel dealLabel, bytes providerAddress);
    event DisputeProcessed(uint256 baseDisputeId, bytes providerAddress, RetrieveChecker.DisputeStatus status, uint256 penaltyAmount, uint256 raiserReward, uint256 clientReward);
    event RewardPercentagesUpdated(uint8 disputeRaiserPercentage);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor to initialize the contract with a retrieve checker address and minimum stake
     * @param _retrieveCheckerAddress Address of the RetrieveChecker contract
     * @param _minimumStake Minimum amount of FIL tokens required for staking
     * @param _disputeRaiserRewardPercentage Percentage of penalty to be given to dispute raiser (out of 100)
     */
    constructor(
        address _retrieveCheckerAddress, 
        uint256 _minimumStake,
        uint8 _disputeRaiserRewardPercentage
    ) {
        owner = msg.sender;
        retrieveChecker = RetrieveChecker(_retrieveCheckerAddress);
        minimumStake = _minimumStake;
        disputeRaiserRewardPercentage = _disputeRaiserRewardPercentage;
    }
    
    /**
     * @dev Register a storage provider and stake tokens in one operation
     * @param actorId Actor ID of the storage provider
     */
    function registerStorageProvider(uint64 actorId) external payable onlyOwner {
        require(msg.value >= minimumStake, "Stake amount less than minimum required");
        
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        
        registeredStorageProviders[providerAddress] = true;
        storageProviderStakes[providerAddress] = msg.value;

        registeredSPActorIds.push(actorId);
        
        emit StorageProviderRegistered(actorId, providerAddress, msg.value);
    }
    
    /**
     * @dev Remove a storage provider from the registry
     * @param actorId Actor ID of the storage provider
     */
    function removeStorageProvider(uint64 actorId) external onlyOwner {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        
        require(registeredStorageProviders[providerAddress], "Provider not registered");
        
        // Return staked tokens to the owner
        uint256 stakedAmount = storageProviderStakes[providerAddress];
        if (stakedAmount > 0) {
            storageProviderStakes[providerAddress] = 0;
            payable(owner).transfer(stakedAmount);
        }
        // Remove actor ID from the array
        for (uint256 i = 0; i < registeredSPActorIds.length; i++) {
            if (registeredSPActorIds[i] == actorId) {
                // Replace with the last element and pop
                registeredSPActorIds[i] = registeredSPActorIds[registeredSPActorIds.length - 1];
                registeredSPActorIds.pop();
                break;
            }
        }
        
        registeredStorageProviders[providerAddress] = false;
        emit StorageProviderRemoved(providerAddress);
    }
    
    /**
     * @dev Raise a dispute for a storage provider's retrieval failure
     * @param dealId The ID of the deal in question
     * @param reason The reason for raising the dispute
     * @return The base dispute ID
     */
    function raiseDispute(uint64 dealId, string calldata reason) external payable returns (uint256) {
        // Get provider actor ID from the dealId
        (, uint64 providerActorId) = MarketAPI.getDealProvider(dealId);
        require(providerActorId != 0, "Invalid deal ID");
        
        // Get provider address
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(providerActorId);
        bytes memory providerAddress = providerAddr.data;
        
        // Check if provider is registered
        require(registeredStorageProviders[providerAddress], "Provider not registered in system");
        
        // Get deal label (contains the CID)
        (, CommonTypes.DealLabel memory dealLabel) = MarketAPI.getDealLabel(dealId);
        
        // Call the base RetrieveChecker contract to raise the dispute
        // Forward any value sent with this transaction to the retrieveChecker
        uint256 baseDisputeId = retrieveChecker.raiseDispute{value: msg.value}(dealLabel.data, providerActorId);
        
        // Store enhanced dispute information
        dealDisputes[baseDisputeId] = DealDispute({
            baseDisputeId: baseDisputeId,
            dealId: dealId,
            dealLabel: dealLabel,
            providerAddress: providerAddress,
            providerActorId: providerActorId,
            reason: reason,
            raiser: msg.sender  // Store the original raiser
        });
        
        // Add dispute to provider's disputes
        providerDisputes[providerAddress].push(baseDisputeId);
        
        // Emit event for off-chain retrieve checker to monitor
        emit DisputeRaised(baseDisputeId, msg.sender, dealId, dealLabel, providerAddress);
        
        return baseDisputeId;
    }
    
    /**
     * @dev Process a resolved dispute from the base RetrieveChecker
     * @param baseDisputeId ID of the base dispute to process
     */
    function processResolvedDispute(uint256 baseDisputeId) external {
        // Get dispute status from base contract
        RetrieveChecker.DisputeStatus status = retrieveChecker.getDisputeStatus(baseDisputeId);
        
        // Only process if the dispute has been resolved by the retrieve checker
        require(
            status == RetrieveChecker.DisputeStatus.Resolved || 
            status == RetrieveChecker.DisputeStatus.Failed || 
            status == RetrieveChecker.DisputeStatus.Rejected,
            "Dispute not resolved"
        );

        // Check if dispute has already been processed
        require(!processedDisputes[baseDisputeId], "Dispute already processed");
        
        DealDispute storage dispute = dealDisputes[baseDisputeId];
        require(dispute.baseDisputeId == baseDisputeId, "Enhanced dispute not found");
        
        // Get the base dispute details to verify the raiser
        RetrieveChecker.Dispute memory baseDispute = retrieveChecker.getDisputeDetails(baseDisputeId);
        require(baseDispute.raiser == address(this), "Invalid dispute raiser");
        
        bytes memory providerAddress = dispute.providerAddress;
        uint256 penaltyAmount = 0;
        uint256 raiserReward = 0;
        uint256 clientReward = 0;

        // Mark dispute as processed
        processedDisputes[baseDisputeId] = true;

        // If the dispute failed (retrieval failed), slash the stake
        if (status == RetrieveChecker.DisputeStatus.Failed) {
            penaltyAmount = storageProviderStakes[providerAddress];
            require(penaltyAmount > 0, "Provider has no stake to slash");
            
            // Reset provider's stake to 0
            storageProviderStakes[providerAddress] = 0;
            
            // Calculate rewards - 5% to raiser, rest to client
            raiserReward = (penaltyAmount * disputeRaiserRewardPercentage) / 100;
            clientReward = penaltyAmount - raiserReward;
            
            // Transfer reward to the original raiser stored in DealDispute
            (bool success, ) = payable(dispute.raiser).call{value: raiserReward}("");
            require(success, "Transfer to raiser failed");
            
            // Get deal client directly using inherited DealInfo methods and forward remaining funds
            if (clientReward > 0) {
                // Get client actor ID directly using the inherited function
                uint64 clientActorId = getDealClient(dispute.dealId);
                
                // Client address must be converted to filecoin address bytes
                CommonTypes.FilAddress memory clientAddr = FilAddresses.fromActorID(clientActorId);
                
                // Use the forward method with the correct syntax
                int256 errCode = clientAddr.send(clientReward);
                require(errCode == 0, "Transfer to client failed");
            }
        }
        
        // Emit event with additional reward info
        emit DisputeProcessed(baseDisputeId, providerAddress, status, penaltyAmount, raiserReward, clientReward);
    }
    
    /**
     * @dev Add more stake to a registered storage provider
     * @param actorId Actor ID of the storage provider
     */
    function addMoreStake(uint64 actorId) external payable onlyOwner {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        
        require(registeredStorageProviders[providerAddress], "Provider not registered");
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        storageProviderStakes[providerAddress] += msg.value;
    }
    
    /**
     * @dev Update the minimum stake amount
     * @param newMinimumStake New minimum stake amount
     */
    function setMinimumStake(uint256 newMinimumStake) external onlyOwner {
        minimumStake = newMinimumStake;
    }
    
    /**
     * @dev Update reward percentages for dispute resolution
     * @param raiserPercentage Percentage for dispute raiser (out of 100)
     */
    function setRewardPercentages(uint8 raiserPercentage) external onlyOwner {
        require(raiserPercentage <= 100, "Raiser percentage must be <= 100%");
        disputeRaiserRewardPercentage = raiserPercentage;
        
        emit RewardPercentagesUpdated(raiserPercentage);
    }
    
    /**
     * @dev Get the current stake for a storage provider
     * @param actorId Actor ID of the storage provider
     * @return The amount currently staked by the provider
     */
    function getProviderStake(uint64 actorId) external view returns (uint256) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        return storageProviderStakes[providerAddr.data];
    }
    
    /**
     * @dev Check if a storage provider is registered
     * @param actorId Actor ID of the storage provider
     * @return Boolean indicating if the provider is registered
     */
    function isProviderRegistered(uint64 actorId) external view returns (bool) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        return registeredStorageProviders[providerAddr.data];
    }
    
    /**
     * @dev Get all dispute IDs for a provider
     * @param actorId Actor ID of the storage provider
     * @return Array of dispute IDs associated with the provider
     */
    function getProviderDisputes(uint64 actorId) external view returns (uint256[] memory) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        return providerDisputes[providerAddr.data];
    }
    
    /**
     * @dev Get enhanced dispute details by ID
     * @param baseDisputeId ID of the base dispute
     * @return id The dispute ID
     * @return dealId The associated deal ID
     * @return dealLabel The deal label containing CID
     * @return providerAddress The address of the storage provider
     * @return providerActorId The actor ID of the provider
     * @return reason The reason for the dispute
     * @return status The current status of the dispute
     */
    function getDealDisputeDetails(uint256 baseDisputeId) external view returns (
        uint256 id,
        uint64 dealId,
        CommonTypes.DealLabel memory dealLabel,
        bytes memory providerAddress,
        uint64 providerActorId,
        string memory reason,
        RetrieveChecker.DisputeStatus status
    ) {
        DealDispute memory dealDispute = dealDisputes[baseDisputeId];
        RetrieveChecker.DisputeStatus disputeStatus = retrieveChecker.getDisputeStatus(baseDisputeId);
        
        return (
            dealDispute.baseDisputeId,
            dealDispute.dealId,
            dealDispute.dealLabel,
            dealDispute.providerAddress,
            dealDispute.providerActorId,
            dealDispute.reason,
            disputeStatus
        );
    }
    
    /**
     * @dev Get provider dispute statistics
     * @param actorId Actor ID of the storage provider
     * @return Statistics about the provider's disputes
     */
    function getProviderStats(uint64 actorId) external view returns (ProviderStats memory) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        uint256[] memory allDisputes = providerDisputes[providerAddress];
        ProviderStats memory stats = ProviderStats(0, 0, 0, 0, 0);
        
        stats.totalDisputes = allDisputes.length;
        
        for (uint256 i = 0; i < allDisputes.length; i++) {
            RetrieveChecker.DisputeStatus status = retrieveChecker.getDisputeStatus(allDisputes[i]);
            
            if (status == RetrieveChecker.DisputeStatus.Pending) {
                stats.pendingDisputes++;
            } else if (status == RetrieveChecker.DisputeStatus.Resolved) {
                stats.resolvedDisputes++;
            } else if (status == RetrieveChecker.DisputeStatus.Failed) {
                stats.failedDisputes++;
            } else if (status == RetrieveChecker.DisputeStatus.Rejected) {
                stats.rejectedDisputes++;
            }
        }
        
        return stats;
    }

    /**
     * @dev Get all registered storage providers
     * @return Array of registered storage provider addresses
     */
    function getRegisteredSpActorIds() external view returns (uint64[] memory) {
        return registeredSPActorIds;
    }
    
    /**
     * @dev Get all failed disputes for a provider
     * @param actorId Actor ID of the storage provider
     * @return Array of failed dispute IDs
     */
    function getProviderFailedDisputes(uint64 actorId) external view returns (uint256[] memory) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        uint256[] memory allDisputes = providerDisputes[providerAddress];
        uint256 failedCount = 0;
        
        // First pass: count failed disputes
        for (uint256 i = 0; i < allDisputes.length; i++) {
            if (retrieveChecker.getDisputeStatus(allDisputes[i]) == RetrieveChecker.DisputeStatus.Failed) {
                failedCount++;
            }
        }
        
        // Second pass: collect failed dispute IDs
        uint256[] memory failedDisputes = new uint256[](failedCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allDisputes.length; i++) {
            if (retrieveChecker.getDisputeStatus(allDisputes[i]) == RetrieveChecker.DisputeStatus.Failed) {
                failedDisputes[index++] = allDisputes[i];
            }
        }
        
        return failedDisputes;
    }
    
    /**
     * @dev Get all pending disputes for a provider
     * @param actorId Actor ID of the storage provider
     * @return Array of pending dispute IDs
     */
    function getProviderPendingDisputes(uint64 actorId) external view returns (uint256[] memory) {
        CommonTypes.FilAddress memory providerAddr = FilAddresses.fromActorID(actorId);
        bytes memory providerAddress = providerAddr.data;
        uint256[] memory allDisputes = providerDisputes[providerAddress];
        uint256 pendingCount = 0;
        
        // First pass: count pending disputes
        for (uint256 i = 0; i < allDisputes.length; i++) {
            if (retrieveChecker.getDisputeStatus(allDisputes[i]) == RetrieveChecker.DisputeStatus.Pending) {
                pendingCount++;
            }
        }
        
        // Second pass: collect pending dispute IDs
        uint256[] memory pendingDisputes = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allDisputes.length; i++) {
            if (retrieveChecker.getDisputeStatus(allDisputes[i]) == RetrieveChecker.DisputeStatus.Pending) {
                pendingDisputes[index++] = allDisputes[i];
            }
        }
        
        return pendingDisputes;
    }
    
    /**
     * @dev Get global dispute statistics
     * @return totalDisputes Total number of disputes raised
     * @return pendingDisputes Total pending disputes
     * @return resolvedDisputes Total resolved disputes (retrieval successful)
     * @return failedDisputes Total failed disputes (retrieval failed)
     * @return rejectedDisputes Total rejected disputes (invalid disputes)
     */
    function getGlobalDisputeStats() external view returns (
        uint256 totalDisputes,
        uint256 pendingDisputes,
        uint256 resolvedDisputes,
        uint256 failedDisputes,
        uint256 rejectedDisputes
    ) {
        // We have to get the total number of disputes from the base contract
        totalDisputes = retrieveChecker.currentDisputeId();
        
        // Iterate through all provider disputes to categorize them
        bytes[] memory providers = getAllProviders();
        
        for (uint256 i = 0; i < providers.length; i++) {
            uint256[] memory disputes = providerDisputes[providers[i]];
            
            for (uint256 j = 0; j < disputes.length; j++) {
                RetrieveChecker.DisputeStatus status = retrieveChecker.getDisputeStatus(disputes[j]);
                
                if (status == RetrieveChecker.DisputeStatus.Pending) {
                    pendingDisputes++;
                } else if (status == RetrieveChecker.DisputeStatus.Resolved) {
                    resolvedDisputes++;
                } else if (status == RetrieveChecker.DisputeStatus.Failed) {
                    failedDisputes++;
                } else if (status == RetrieveChecker.DisputeStatus.Rejected) {
                    rejectedDisputes++;
                }
            }
        }
        
        return (totalDisputes, pendingDisputes, resolvedDisputes, failedDisputes, rejectedDisputes);
    }
    
    /**
     * @dev Helper function to get all registered providers
     * @return Array of provider addresses
     * @dev Note: This is a simplified implementation and won't scale well with many providers
     */
    function getAllProviders() internal pure returns (bytes[] memory) {
        // This is a simplified implementation
        // In a production environment, we would use a different data structure to track providers
        // or implement pagination
        
        // For demonstration purposes, we'll just return an empty array
        // In a real implementation, you'd need to track all registered providers separately
        bytes[] memory providers = new bytes[](0);
        return providers;
    }

    /**
     * @dev Get all disputes raised by a specific address
     * @param raiser Address of the dispute raiser
     * @return Array of disputes raised by the specified address
     */
    function getDisputesByRaiser(address raiser) external view returns (DealDispute[] memory) {
        // Count disputes by this raiser first
        uint256 count = 0;
        for (uint256 i = 0; i <= retrieveChecker.currentDisputeId(); i++) {
            // Only count if this is a valid dispute in our system and matches the raiser
            if (dealDisputes[i].baseDisputeId == i && dealDisputes[i].raiser == raiser) {
                count++;
            }
        }
        
        // Create array to hold results
        DealDispute[] memory disputes = new DealDispute[](count);
        
        // Fill the array with matching dispute IDs
        uint256 index = 0;
        for (uint256 i = 0; i <= retrieveChecker.currentDisputeId(); i++) {
            if (dealDisputes[i].baseDisputeId == i && dealDisputes[i].raiser == raiser) {
                disputes[index] = dealDisputes[i];
                index++;
            }
        }
        
        return disputes;
    }
}
