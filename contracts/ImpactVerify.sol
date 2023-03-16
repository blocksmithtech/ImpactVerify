// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AddressVoting {
    mapping(address => uint256) public addressVotes;
    mapping(address => bool) public approvedAddresses;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => bool) public registeredAddresses;
    address[] public addresses;
    address[] public approved;

    event AddressRegistered(address indexed addr);
    event AddressUpvoted(address indexed addr, uint256 votes);
    event AddressDownvoted(address indexed addr, uint256 votes);
    event AddressApproved(address indexed addr);
    event AddressBlacklisted(address indexed addr);

    function registerAddress() public {
        require(!registeredAddresses[msg.sender], "Address already registered");
        addresses.push(msg.sender);
        registeredAddresses[msg.sender] = true;
        emit AddressRegistered(msg.sender);
    }

    function upvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !blacklistedAddresses[addr], "Address cannot be approved or blacklisted");
        addressVotes[addr]++;
        emit AddressUpvoted(addr, addressVotes[addr]);
        if (addressVotes[addr] == 5) {
            approvedAddresses[addr] = true;
            approved.push(addr);
            emit AddressApproved(addr);
        }
    }

    function downvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !blacklistedAddresses[addr], "Address cannot be approved or blacklisted");
        addressVotes[addr]--;
        emit AddressDownvoted(addr, addressVotes[addr]);
        if (addressVotes[addr] == -5) {
            blacklistedAddresses[addr] = true;
            emit AddressBlacklisted(addr);
        }
    }

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }

    function getApprovedAddresses() public view returns (address[] memory) {
        return approved;
    }
}
