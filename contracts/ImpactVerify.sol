// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AddressVoting {
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

    event AddressRegistered(bytes32 indexed hash, address addr);
    event AddressUpvoted(bytes32 indexed hash, uint upvotes);
    event AddressDownvoted(bytes32 indexed hash, uint downvotes);
    event AddressApproved(bytes32 indexed hash);
    event AddressRejected(bytes32 indexed hash);

    function registerAddress(address addr) external {
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

    function vote(bytes32 hash, bool isUpvote) external {
        require(addresses[hash].hash != bytes32(0), "Address not registered");
        require(!addresses[hash].approved && !addresses[hash].rejected, "Address already approved or rejected");

        if (isUpvote) {
            addresses[hash].upvotes++;
            emit AddressUpvoted(hash, addresses[hash].upvotes);
            if (addresses[hash].upvotes >= 5) {
                addresses[hash].approved = true;
                approved.push(hash);
                removePending(hash);
                emit AddressApproved(hash);
            }
        } else {
            addresses[hash].downvotes++;
            emit AddressDownvoted(hash, addresses[hash].downvotes);
            if (addresses[hash].downvotes >= 5) {
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

    function getPendingAddresses() external view returns (address[] memory) {
        address[] memory pendingAddresses = new address[](pending.length);
        for (uint i = 0; i < pending.length; i++) {
            pendingAddresses[i] = addresses[pending[i]].addr;
        }
        return pendingAddresses;
    }

    function getApprovedAddresses() external view returns (address[] memory) {
        address[] memory approvedAddresses = new address[](approved.length);
        for (uint i = 0; i < approved.length; i++) {
            approvedAddresses[i] = addresses[approved[i]].addr;
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
}
