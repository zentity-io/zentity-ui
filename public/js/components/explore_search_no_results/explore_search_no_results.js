import React from 'react';
import {
  EuiText,
  EuiTitle,
} from '@elastic/eui';

export class ExploreSearchNoResults extends React.Component {

  render() {
    return (
      <EuiText>
        <EuiTitle>
          <h2>
            No results
          </h2>
        </EuiTitle>
        <EuiText color="subdued">
          <p>
            Results appear when zentity finds <b>confident matches</b> for a search. The more information you give about an entity, the more likely you will find matches for it.
          </p>
        </EuiText>
      </EuiText>
    )
  }
}
