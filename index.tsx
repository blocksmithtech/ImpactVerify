import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tag, Button, GridContainer, GridRow, GridCol, Table, AvatarImage, ButtonLink, NumberInputSpinner } from '@taikai/rocket-kit';
import GlobalStyles from './styles/globalStyles'
import { ZkConnectButton, useZkConnect } from "@sismo-core/zk-connect-react";
const { useEffect, useState } = React
import { Web3Connection } from '@taikai/dappkit';
import { OnchainVerifier } from './models/OnchainVerifier';
import { utils } from 'ethers';
const { keccak256, defaultAbiCoder } = utils;
import styled from 'styled-components';

const config = {
  appId: "0xa46b780f964ccf1be8e5571ced4ab0bf",
  devMode: {
    enabled: true,
    devAddresses: [
      "0x2E5deB91b444EfbeA95E34BFb9aA043A5F99f567"
    ]
  }
};

const address = "0x31429d1856aD1377A8A0079410B297e1a9e214c2";
const abi = [
  {
    "inputs": [],
    "name": "getApprovedAddresses",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
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
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
    "stateMutability": "nonpayable",
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
  }
]

const copyToClipboard = async (address) => {
  try {
    await navigator.clipboard.writeText(address);
    alert("Address copied to clipboard. Send them some ETH!")
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

const App = () => {
  const [groupSnapshot, setGroupSnapshot] = useState({});
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [isGroupMember, setIsGroupMember] = useState(false);

  const web3Connection = new Web3Connection({ web3Host: "https://goerli.infura.io/v3/d841459c0fca4e8aad16020ddf86f7f7" });
  let OnchainVerifierContract;

  useEffect(() => {
    const init = async () => {
      await web3Connection.start();
      await web3Connection.connect();

      OnchainVerifierContract = new OnchainVerifier(
        web3Connection,
        abi,
        address
      );
      await OnchainVerifierContract.start();
      // console.log(await OnchainVerifierContract.getPendingAddresses());
      setGroupMembers([
        { id: 1, address: "0x2E5deB91b444EfbeA95E34BFb9aA043A5F99f567", score: 2 },
        { id: 2, address: "0x7f7dc3631a1413f8609114cc66c6afdbe24c7e33", score: 3 },
        { id: 3, address: "0x5B92aBcbC35B574e41e3D237d741aCFF61297D2e", score: 1 }
      ])
    }

    init()
      .catch(alert);
  }, []);

  const onchainVote = async (newValue, data) => {
    const { score, address } = data

    const encodedAddress = defaultAbiCoder.encode(['address'], [address]);
    const hashedAddress = keccak256(encodedAddress);
    
    await OnchainVerifierContract.vote(
      hashedAddress,
      newValue > score // isUpvote
    )
  }
  

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { dataUrl } = await fetchGroupSnapshot()
  //     console.log(dataUrl)
  //     await fetchGroupMembers(dataUrl)
  //   }
  //   const fetchGroupSnapshot = async () => {
  //     const query = `
  //       query getSnapshot {
  //         groupSnapshot(
  //           groupId: "0x3572d27296a9718a6e5c3274f7076991",
  //         ) {
  //           id
  //           dataUrl
  //           size
  //           timestamp
  //           valueDistribution {
  //             numberOfAccounts
  //             value
  //           }
  //         }
  //       }
  //     `

  //     const res = await fetch('https://api.sismo.io', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //       body: JSON.stringify({ query})
  //     });
  //     const { data, errors } = await res.json();
  //     console.log(data)
  //     setGroupSnapshot(data.groupSnapshot)
  //     return data.groupSnapshot
  //   }

  //   const fetchGroupMembers = async (dataUrl) => {
  //     const res = await fetch(dataUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Accept': 'application/json',
  //       }
  //     });
  //     const data = JSON.parse(await res.text());
  //     console.log(data)
  //     setGroupMembers(data)
  //   }

  //   fetchData()
  //     .catch(console.error);
  // }, []);

  const { response: ZkConnectResponse } = useZkConnect({ config });
  
  useEffect(() => {
    console.log('ZkConnectResponse', ZkConnectResponse)
    if (!ZkConnectResponse) { return }
    const { verifiableStatements } = ZkConnectResponse
    if (verifiableStatements.findIndex((statement) => statement.groupId === "0x3572d27296a9718a6e5c3274f7076991") >= 0) {
      setIsGroupMember(true)
    }
  }, [ZkConnectResponse]);


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
                    id: 'score',
                    value: 'Score',
                    dataKey: 'score',
                    renderer: (score: number, data: any) => (
                      <div className="c-increase-decrease-input">
                        {isGroupMember ? (
                          <NumberInputSpinner
                            increment={1}
                            onChange={(newValue) => onchainVote(newValue, data)}
                            value={score}
                          />
                        ) : (
                          <span>{score}</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    id: 'goTo',
                    className: 'right',
                    value: 'regen Me Up',
                    dataKey: 'address',
                    renderer: (address: string) => <Button icon="send" color="darkGreen" action={() => copyToClipboard(address)} />,
                  },
                ]
              }}
              values={groupMembers}
            />
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
