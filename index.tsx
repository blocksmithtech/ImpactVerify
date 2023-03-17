import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tag, Button, GridContainer, GridRow, GridCol, Table, AvatarImage, ButtonLink, NumberInputSpinner } from '@taikai/rocket-kit';
import GlobalStyles from './styles/globalStyles'
import { ZkConnectButton, useZkConnect } from "@sismo-core/zk-connect-react";
const { useEffect, useState } = React
const config = {
  appId: "0xa46b780f964ccf1be8e5571ced4ab0bf",
  devMode: {
    enabled: true,
    devAddresses: [
      "0x2E5deB91b444EfbeA95E34BFb9aA043A5F99f567"
    ]
  }
};

const App = () => {
  const [groupSnapshot, setGroupSnapshot] = useState({});
  const [groupMembers, setGroupMembers] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { dataUrl } = await fetchGroupSnapshot()
      console.log(dataUrl)
      await fetchGroupMembers(dataUrl)
    }
    const fetchGroupSnapshot = async () => {
      const query = `
        query getSnapshot {
          groupSnapshot(
            groupId: "0x3572d27296a9718a6e5c3274f7076991",
          ) {
            id
            dataUrl
            size
            timestamp
            valueDistribution {
              numberOfAccounts
              value
            }
          }
        }
      `

      const res = await fetch('https://api.sismo.io', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query})
      });
      const { data, errors } = await res.json();
      console.log(data)
      setGroupSnapshot(data.groupSnapshot)
      return data.groupSnapshot
    }

    const fetchGroupMembers = async (dataUrl) => {
      const res = await fetch(dataUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = JSON.parse(await res.text());
      console.log(data)
      setGroupMembers(data)
    }

    fetchData()
      .catch(console.error);
  }, []);

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
    <GridContainer>
      <GridRow>
        <GridCol>
          <Tag value={'Hello'} />
        
          <Button
            className="button"
            color="purple500"
            txtColor="white"
            value="Connect"
            variant="solid"
          />
        </GridCol>
        <GridCol>
          <h3>Group Snapshot</h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{ JSON.stringify(groupSnapshot, null, 2) }</div>

          <h3>Group Members</h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{ JSON.stringify(groupMembers, null, 2) }</div>
        </GridCol>
        <GridCol>
          <ZkConnectButton 
            //You will need to register an appId in the Factory
            appId={"0xa46b780f964ccf1be8e5571ced4ab0bf"}
            //Request proofs from your users for a groupId
            dataRequest={{
              groupId: "0x3572d27296a9718a6e5c3274f7076991"
            }}
            //After user redirection get a response containing his proofs 
            onResponse={async (response) => {
              //Send the response to your server to verify proofs
              //thanks to the @sismo-core/zk-connect-server package
              console.log(response)
            }}
          />
        </GridCol>
      </GridRow>
    </GridContainer>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
