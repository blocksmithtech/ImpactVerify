// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AddressVoting {
    struct AddressVote {
        uint256 upvotes;
        uint256 downvotes;
    }

    mapping(address => AddressVote) public addressVotes;
    mapping(address => bool) public approvedAddresses;
    mapping(address => bool) public rejectedAddresses;
    mapping(address => bool) public registeredAddresses;
    address[] public approved;
    address[] public registered;

    event AddressRegistered(address indexed addr);
    event AddressUpvoted(address indexed addr, uint256 votes);
    event AddressDownvoted(address indexed addr, uint256 votes);
    event AddressApproved(address indexed addr);
    event AddressRejected(address indexed addr);

    function registerAddress() public {
        require(!registeredAddresses[msg.sender], "Address already registered");
        registeredAddresses[msg.sender] = true;
        registered.push(msg.sender);
        emit AddressRegistered(msg.sender);
    }

    function upvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !rejectedAddresses[addr], "Address cannot be approved or rejected");
        addressVotes[addr].upvotes++;
        emit AddressUpvoted(addr, addressVotes[addr].upvotes);
        if (addressVotes[addr].upvotes == 5) {
            approvedAddresses[addr] = true;
            approved.push(addr);
            registeredAddresses[addr] = false;
            emit AddressApproved(addr);
        }
    }

    function downvoteAddress(address addr) public {
        require(registeredAddresses[msg.sender], "Address must be registered to vote");
        require(!approvedAddresses[addr] && !rejectedAddresses[addr], "Address cannot be approved or rejected");
        addressVotes[addr].downvotes++;
        emit AddressDownvoted(addr, addressVotes[addr].downvotes);
        if (addressVotes[addr].downvotes == 5) {
            rejectedAddresses[addr] = true;
            registeredAddresses[addr] = false;
            emit AddressRejected(addr);
        }
    }

    function getAddresses() public view returns (address[] memory) {
        return registered;
    }

    function getApprovedAddresses() public view returns (address[] memory) {
        return approved;
    }
}
