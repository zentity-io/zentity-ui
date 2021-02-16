import React from 'react';
import {
  Link
} from "react-router-dom";
import {
  EuiEmptyPrompt,
  EuiPage,
  EuiPanel,
  EuiText
} from '@elastic/eui';

export class ErrorPage extends React.Component {

  render() {
    return (
      <EuiPage className="zentity-error">
        <EuiPanel>
          <EuiEmptyPrompt
            title={
              <h1>404</h1>
            }
            titleSize="l"
            body={
              <EuiText>
                Not Found
              </EuiText>
            }
          />
        </EuiPanel>
      </EuiPage>
    );
  };
};
