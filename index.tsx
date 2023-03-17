import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tag, Button, GridContainer, GridRow, GridCol, Table, AvatarImage, ButtonLink, NumberInputSpinner, FormGroup, TextField, CardValue } from '@taikai/rocket-kit';
import GlobalStyles from './styles/globalStyles'
import { ZkConnectButton, useZkConnect } from "@sismo-core/zk-connect-react";
const { useEffect, useState, useCallback } = React
import { Web3Connection } from '@taikai/dappkit';
import { OnchainVerifier, DailyDrip } from './models/contracts';
import { utils } from 'ethers';
const { getAddress, formatEther } = utils;

const config = {
  appId: "0xa46b780f964ccf1be8e5571ced4ab0bf",
  devMode: {
    enabled: true,
    devAddresses: [
      "0x2E5deB91b444EfbeA95E34BFb9aA043A5F99f567"
    ]
  }
};

const address = "0xb6E528Ec53E59c3592810645C6C5C869A9587Eb3";
const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "registerAddress",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isUpvote",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getApprovedAddresses",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "hash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "upvotes",
            "type": "uint256"
          }
        ],
        "internalType": "struct OnchainVerifier.addressDataTuple[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingAddresses",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "hash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "upvotes",
            "type": "uint256"
          }
        ],
        "internalType": "struct OnchainVerifier.addressDataTuple[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "isApproved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "isRejected",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const dripAddress = "0x9022541C658911E3C58d63e588E10c8CD2576BFd"
const dripABI = [
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDripAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastDripTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const isValidAddress = (address) => {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}

const App = () => {
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [newRegenPunkAddress, setNewRegenPunkAddress] = useState("");

  const [dripBalance, setDripBalance] = useState(0);
  const [dripAmount, setDripAmount] = useState(0);
  const [lastDrip, setLastDrip] = useState(new Date());

  const web3Connection = new Web3Connection({ web3Host: "https://goerli.infura.io/v3/d841459c0fca4e8aad16020ddf86f7f7" });
  const [OnchainVerifierContract, setOnchainVerifierContract] = useState(
    new OnchainVerifier(
      web3Connection,
      abi,
      address
    )
  );

  useEffect(() => {
    const init = async () => {
      await web3Connection.start();
      await web3Connection.connect();

      await OnchainVerifierContract.start();
      await updateAddresses();

      const dripContract = new DailyDrip(
        web3Connection,
        dripABI,
        dripAddress
      )
      await dripContract.start();
      const balance = await dripContract.getBalance();
      setDripBalance(formatEther(balance))
      const dripAmount = await dripContract.getDripAmount();
      setDripAmount(formatEther(dripAmount))
      const lastDripTime = await dripContract.lastDripTime();
      setLastDrip(new Date(lastDripTime*1000))
    }

    init()
      .catch(alert);
  }, []);

  const updateAddresses = useCallback(async () => {
    // TODO: get ens
    const pendingAddressesResponse = await OnchainVerifierContract.getPendingAddresses();
    const pendingAddresses = pendingAddressesResponse.reduce((acc, cur) => {
      acc.push({
        id: cur.hash,
        address: cur.addr,
        score: parseInt(cur.upvotes)
      });
      return acc;
    }, []);

    const approvedAddressesResponse = await OnchainVerifierContract.getApprovedAddresses();
    const approvedAddresses = approvedAddressesResponse.reduce((acc, cur) => {
      acc.push({
        id: cur.hash,
        address: cur.addr,
        score: parseInt(cur.upvotes)
      });
      return acc;
    }, pendingAddresses);

    const sortedAddresses = approvedAddresses.sort((a, b) => b.score - a.score)
    // sort

    console.log(sortedAddresses);
    setGroupMembers(sortedAddresses);
  }, [groupMembers]);

  const onchainVote = useCallback(async (newValue, data) => {
    await updateAddresses();
    try {
      const { score, id } = data;
    
      const response = await OnchainVerifierContract.vote(
        id,
        newValue > score // isUpvote
      );
      console.log(response)
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
    await updateAddresses();
  }, [groupMembers]);

  const { response: ZkConnectResponse } = useZkConnect({ config });
  
  useEffect(() => {
    console.log('ZkConnectResponse', ZkConnectResponse)
    if (!ZkConnectResponse) { return }
    const { verifiableStatements } = ZkConnectResponse
    if (verifiableStatements.findIndex((statement) => statement.groupId === "0x3572d27296a9718a6e5c3274f7076991") >= 0) {
      setIsGroupMember(true)
    }
  }, [ZkConnectResponse]);

  const formSaveAddress = useCallback((event) => {
    console.log(event.target.value)
    setNewRegenPunkAddress(event.target.value)
  }, [newRegenPunkAddress]);

  const registerNewAddress = useCallback(async () => {
    if (!isValidAddress(newRegenPunkAddress)) {
      return alert("Please add a valid address");
    }
    try {
      const response = await OnchainVerifierContract.registerAddress(newRegenPunkAddress);
      console.log(response);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
    setNewRegenPunkAddress("");
    await updateAddresses();
  }, [newRegenPunkAddress, groupMembers])


  return (
    <>
      <GlobalStyles />
      <GridContainer>
        <GridRow>
          <GridCol size={4}>
            <marquee className="c-marquee" behavior="alternate" direction="down">regenMeUp regenMeUp regenMeUp</marquee>
          </GridCol>
          <GridCol size={4} className="is-third">
            <img src={require("./icon.png")} alt="regenMeUp" style={{ width: '100%' }} />
            <Table
              border
              loadingColumns={4}
              loadingRows={6}
              options={{
                columns: [
                  {
                    className: 'avatar',
                    dataKey: 'address',
                    id: 'address',
                    renderer: (address: string) => (
                      <>
                        <AvatarImage alt={address} boringType="beam" /> <span title={address}>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                      </>
                    ),
                    value: 'Address'
                  },
                  {
                    className: 'right',
                    id: 'score',
                    value: 'Score',
                    dataKey: 'score',
                    renderer: (score: number, data: any) => (
                      <div className="c-increase-decrease-input">
                        {isGroupMember ? (
                          <NumberInputSpinner
                            increment={1}
                            onChange={(newValue) => onchainVote(newValue, data)}
                            value={groupMembers.find(m => m.id === data.id).score}
                          />
                        ) : (
                          <span>{score}</span>
                        )}
                      </div>
                    ),
                  }
                ]
              }}
              values={groupMembers}
            />

            <br />
            <br />

            <div className="c-card">
              <FormGroup label="Submit new RegenPunk">
                <TextField placeholder="0x..." minimal={false} value={newRegenPunkAddress} onChange={formSaveAddress} />
              </FormGroup>
              <Button
                className="button full-width"
                color="darkGreen"
                icon="rocket"
                iconPosition="right"
                txtColor="white"
                value="Submit"
                variant="solid"
                action={registerNewAddress}
              />
            </div>

            <br />
            <br />

            <CardValue
              label="Drip Contract Balance"
              value={`${dripBalance} BCT`}
            />
            <br/>
            <p>{`Last Drip: ${lastDrip.toLocaleString()}`}</p>
            <p>{`Drip Amount: ${dripAmount} BCT`}</p>

            <br />
            <br />
          </GridCol>
          <GridCol size={4} className="col-right">
            <ZkConnectButton 
              config={config}
              dataRequest={{
                groupId: "0x3572d27296a9718a6e5c3274f7076991"
              }}
            />
            <marquee className="c-marquee is-flipped" behavior="alternate" direction="down">regenMeUp regenMeUp regenMeUp</marquee>
          </GridCol>
        </GridRow>
      </GridContainer>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
