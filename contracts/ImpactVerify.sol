// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AddressVoting {
    struct AddressVote {
        uint256 upvotes;
        uint256 downvotes;
    }

    mapping(address => AddressVote) public addressVotes;
    mapping(address => bool) public approvedAddresses;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => bool) public registeredAddresses;
    address[] public approved;
    uint256 public registeredCount;

    event AddressRegistered(address indexed addr);
    event AddressUpvoted(address indexed addr, uint256 votes);
    event AddressDownvoted(address indexed addr, uint256 votes);
    event AddressApproved(address indexed addr);
    event AddressBlacklisted(address indexed addr);

    function registerAddress() public {
        require(!registeredAddresses[msg.sender], "Address already registered");
        registeredAddresses[msg.sender] = true;
        registeredCount++;
        emit AddressRegistered(msg.sender);
    }

    function upvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !blacklistedAddresses[addr], "Address cannot be approved or blacklisted");
        addressVotes[addr].upvotes++;
        emit AddressUpvoted(addr, addressVotes[addr].upvotes);
        if (addressVotes[addr].upvotes == 5) {
            approvedAddresses[addr] = true;
            approved.push(addr);
            registeredCount--;
            delete registeredAddresses[addr];
            emit AddressApproved(addr);
        }
    }

    function downvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !blacklistedAddresses[addr], "Address cannot be approved or blacklisted");
        addressVotes[addr].downvotes++;
        emit AddressDownvoted(addr, addressVotes[addr].downvotes);
        if (addressVotes[addr].downvotes == 5) {
            blacklistedAddresses[addr] = true;
            registeredCount--;
            delete registeredAddresses[addr];
            emit AddressBlacklisted(addr);
        }
    }

    function getAddresses() public view returns (address[] memory) {
        address[] memory result = new address[](registeredCount);
        uint256 count = 0;
        for (uint256 i = 0; i < approved.length; i++) {
            if (registeredAddresses[approved[i]]) {
                result[count] = approved[i];
                count++;
            }
        }
        return result;
    }

    function getApprovedAddresses() public view returns (address[] memory) {
        return approved;
    }
}
