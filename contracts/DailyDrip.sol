// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface OnchainVerifier {
  struct addressDataTuple {
    address addr;
    bytes32 hash;
    uint upvotes;
  }
    
  function getApprovedAddresses() external view returns (addressDataTuple[] memory);
}

interface Token {
  function transfer(address to, uint256 value) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
}

contract DailyDrip {
  OnchainVerifier public onchainVerifier;
  Token public token;
  uint256 public amountPerDay;
  uint256 public lastDripTime;
  
  constructor(address _onchainVerifier, address _tokenAddress) {
    onchainVerifier = OnchainVerifier(_onchainVerifier);
    token = Token(_tokenAddress);
    lastDripTime = block.timestamp - 1 days;
  }
  
  function drip() public payable {
    require(block.timestamp >= lastDripTime + 1 days, "Cannot drip more than once a day");
    
    uint256 balance = token.balanceOf(address(this));
    amountPerDay = balance / 400; // 0.25% of the balance
    
    OnchainVerifier.addressDataTuple[] memory approvedWallets = onchainVerifier.getApprovedAddresses();
    uint256 dripAmount = amountPerDay / approvedWallets.length;
    
    for (uint256 i = 0; i < approvedWallets.length; i++) {
      require(token.transfer(approvedWallets[i].addr, dripAmount), "Token transfer failed");
    }
    
    lastDripTime = block.timestamp;
  }
  
  function getBalance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  function canDrip() public view returns (bool) {
    return block.timestamp >= lastDripTime + 1 days;
  }
  
  function getAmountPerDay() public view returns (uint256) {
    uint256 balance = token.balanceOf(address(this));
    return balance / 400;
  }

  function getApprovedWallets() public view returns (address[] memory) {
    OnchainVerifier.addressDataTuple[] memory approvedWallets = onchainVerifier.getApprovedAddresses();
    address[] memory addrs = new address[](approvedWallets.length);
    
    for (uint256 i = 0; i < approvedWallets.length; i++) {
      addrs[i] = approvedWallets[i].addr;
    }
    
    return addrs;
  }

  function getDripAmount() public view returns (uint256) {
    uint256 balance = token.balanceOf(address(this));
    OnchainVerifier.addressDataTuple[] memory approvedWallets = onchainVerifier.getApprovedAddresses();
    uint256 dripAmount = (balance / 400) / approvedWallets.length;
    
    return dripAmount;
  }
}
