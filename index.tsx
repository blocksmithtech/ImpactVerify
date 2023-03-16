import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tag, Button, GridContainer, GridRow, GridCol } from '@taikai/rocket-kit';
import { ZkConnectButton, ZkConnectResponse } from "@sismo-core/zk-connect-react";

const App = () => {

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
