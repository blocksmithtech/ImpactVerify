import {Model} from '@taikai/dappkit/dist/src/base/model';
import {Web3Connection} from '@taikai/dappkit/dist/src/base/web3-connection';
import {Web3ConnectionOptions} from '@taikai/dappkit/dist/src/interfaces/web3-connection-options';
import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit/dist/src/interfaces/methods/contract-call-method';

export class OnchainVerifier extends Model<OnchainVerifierMethods> {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions,
              readonly abi: any,
              readonly contractAddress: string) {
    super(web3Connection, abi, contractAddress);
  }

  async getPendingAddresses() {
    return this.callTx(this.contract.methods.getPendingAddresses());
  }

  async getApprovedAddresses() {
    return this.callTx(this.contract.methods.getApprovedAddresses());
  }

  async registerAddress(address: string) {
    return this.sendTx(this.contract.methods.registerAddress(address));
  }
  async vote(hash: string, isUpvote: boolean) {
    return this.sendTx(this.contract.methods.vote(hash, isUpvote));
  }
}

export interface OnchainVerifierMethods {
  getPendingAddresses() :ContractCallMethod<any>;
  getApprovedAddresses() :ContractCallMethod<any>;
  registerAddress(address: string) :ContractSendMethod;
  vote(hash: string, isUpvote: boolean) :ContractSendMethod;
}