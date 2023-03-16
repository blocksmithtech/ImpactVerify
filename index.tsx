import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tag, Button, GridContainer, GridRow, GridCol } from '@taikai/rocket-kit';

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
      </GridRow>
    </GridContainer>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
