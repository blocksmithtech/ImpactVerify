// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract OnchainVerifier {
    IERC1155 public tokenContract;
    uint256 public tokenId;
    address private contractDeployer;

    struct AddressData {
        address addr;
        bytes32 hash;
        uint upvotes;
        uint downvotes;
        bool approved;
        bool rejected;
    }

    mapping(bytes32 => AddressData) private addresses;
    bytes32[] private pending;
    bytes32[] private approved;
    mapping(address => mapping(bytes32 => bool)) private hasVoted;

    event AddressRegistered(bytes32 indexed hash, address addr);
    event AddressUpvoted(bytes32 indexed hash, uint upvotes);
    event AddressDownvoted(bytes32 indexed hash, uint downvotes);
    event AddressApproved(bytes32 indexed hash);
    event AddressRejected(bytes32 indexed hash);

    modifier onlyTokenHolders() {
        require(
            msg.sender == contractDeployer ||
            tokenContract.balanceOf(msg.sender, tokenId) > 0,
            "Caller must hold the required token or be the contract deployer"
        );
        _;
    }

    constructor(address _tokenContract, uint256 _tokenId) {
        tokenContract = IERC1155(_tokenContract);
        tokenId = _tokenId;
        contractDeployer = msg.sender;
    }

    function registerAddress(address addr) external payable onlyTokenHolders {
        bytes32 hash = keccak256(abi.encodePacked(addr));
        require(addresses[hash].hash == bytes32(0), "Address already registered");

        addresses[hash] = AddressData({
            addr: addr,
            hash: hash,
            upvotes: 0,
            downvotes: 0,
            approved: false,
            rejected: false
        });

        pending.push(hash);

        emit AddressRegistered(hash, addr);
    }

    function vote(bytes32 hash, bool isUpvote) external onlyTokenHolders {
        require(addresses[hash].hash != bytes32(0), "Address not registered");
        require(!addresses[hash].rejected, "Address rejected");
        require(!hasVoted[msg.sender][hash], "You have already voted on this address");

        hasVoted[msg.sender][hash] = true;

        if (isUpvote) {
            addresses[hash].upvotes++;
            emit AddressUpvoted(hash, addresses[hash].upvotes);
            if (addresses[hash].upvotes == 1 && !addresses[hash].approved) {
                addresses[hash].approved = true;
                approved.push(hash);
                removePending(hash);
                emit AddressApproved(hash);
            }
        } else {
            addresses[hash].downvotes++;
            emit AddressDownvoted(hash, addresses[hash].downvotes);
            if (addresses[hash].downvotes == 1) {
                addresses[hash].rejected = true;
                removePending(hash);
                emit AddressRejected(hash);
            }
        }
    }

    function isApproved(bytes32 hash) external view returns (bool) {
        return addresses[hash].approved;
    }

    function isRejected(bytes32 hash) external view returns (bool) {
        return addresses[hash].rejected;
    }

    function getPendingAddresses() external view returns (addressDataTuple[] memory) {
        addressDataTuple[] memory pendingAddresses = new addressDataTuple[](pending.length);
        for (uint i = 0; i < pending.length; i++) {
            bytes32 hash = pending[i];
            pendingAddresses[i] = addressDataToTuple(addresses[hash]);
        }
        return pendingAddresses;
    }

    function getApprovedAddresses() external view returns (addressDataTuple[] memory) {
        addressDataTuple[] memory approvedAddresses = new addressDataTuple[](approved.length);
        for (uint i = 0; i < approved.length; i++) {
            bytes32 hash = approved[i];
            approvedAddresses[i] = addressDataToTuple(addresses[hash]);
        }
        return approvedAddresses;
    }

    function removePending(bytes32 hash) private {
        for (uint i = 0; i < pending.length; i++) {
            if (pending[i] == hash) {
                pending[i] = pending[pending.length - 1];
                pending.pop();
                break;
            }
        }
    }

    struct addressDataTuple {
        address addr;
        bytes32 hash;
        uint upvotes;
    }

    function addressDataToTuple(AddressData memory data) internal pure returns (addressDataTuple memory) {
        return addressDataTuple({
            addr: data.addr,
            hash: data.hash,
            upvotes: data.upvotes
        });
    }

    function updateTokenContractAddress(address _newTokenContract) external onlyContractDeployer {
        tokenContract = IERC1155(_newTokenContract);
    }

    function updateTokenId(uint256 _newTokenId) external onlyContractDeployer {
        tokenId = _newTokenId;
    }

    modifier onlyContractDeployer() {
        require(msg.sender == contractDeployer, "Caller must be the contract deployer");
        _;
    }
}