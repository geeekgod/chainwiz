// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AIBridgeAgent
 * @dev Smart contract for AI-powered cross-chain bridge operations
 */
contract AIBridgeAgent is Ownable, ReentrancyGuard {
    // State variables
    address public bridgeInterface;
    mapping(address => bool) public authorizedAIAgents;
    mapping(bytes32 => bool) public processedTransactions;
    
    // Events
    event BridgeRequestInitiated(bytes32 indexed txHash, address indexed from, uint256 amount, uint256 targetChainId);
    event AIAgentAuthorized(address indexed agent, bool status);
    event BridgeInterfaceUpdated(address indexed newInterface);

    // Modifiers
    modifier onlyAuthorizedAgent() {
        require(authorizedAIAgents[msg.sender], "Not authorized AI agent");
        _;
    }

    constructor(address _bridgeInterface) {
        require(_bridgeInterface != address(0), "Invalid bridge interface");
        bridgeInterface = _bridgeInterface;
    }

    /**
     * @dev Initiates a cross-chain bridge transaction
     * @param _token The token address to bridge
     * @param _amount Amount to bridge
     * @param _targetChainId Destination chain ID
     * @param _data Additional data for the bridge operation
     */
    function initiateBridgeTransaction(
        address _token,
        uint256 _amount,
        uint256 _targetChainId,
        bytes calldata _data
    ) external onlyAuthorizedAgent nonReentrant {
        require(_token != address(0), "Invalid token address");
        require(_amount > 0, "Amount must be greater than 0");
        
        bytes32 txHash = keccak256(abi.encodePacked(
            _token,
            _amount,
            _targetChainId,
            _data,
            block.timestamp
        ));
        
        require(!processedTransactions[txHash], "Transaction already processed");
        processedTransactions[txHash] = true;

        // Transfer tokens to the bridge interface
        IERC20(_token).transferFrom(msg.sender, bridgeInterface, _amount);
        
        emit BridgeRequestInitiated(txHash, msg.sender, _amount, _targetChainId);
    }

    /**
     * @dev Authorizes or deauthorizes an AI agent
     * @param _agent Address of the AI agent
     * @param _status Authorization status
     */
    function setAIAgentAuthorization(address _agent, bool _status) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        authorizedAIAgents[_agent] = _status;
        emit AIAgentAuthorized(_agent, _status);
    }

    /**
     * @dev Updates the bridge interface address
     * @param _newInterface New bridge interface address
     */
    function updateBridgeInterface(address _newInterface) external onlyOwner {
        require(_newInterface != address(0), "Invalid interface address");
        bridgeInterface = _newInterface;
        emit BridgeInterfaceUpdated(_newInterface);
    }

    /**
     * @dev Checks if a transaction has been processed
     * @param _txHash Transaction hash to check
     * @return bool indicating if the transaction was processed
     */
    function isTransactionProcessed(bytes32 _txHash) external view returns (bool) {
        return processedTransactions[_txHash];
    }
} 