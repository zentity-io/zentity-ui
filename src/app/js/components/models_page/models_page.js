// Third-party components
import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui';

import { get } from 'lodash';

// App components
import { ModelsTable } from '../models_table';

export class ModelsPage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <EuiPage className="zentity-models">
        <EuiPageBody>
          <EuiTitle size="l">
            <h1>Entity models</h1>
          </EuiTitle>
          <EuiSpacer size="m" />
          <ModelsTable onAddToast={this.props.onAddToast} />
        </EuiPageBody>
      </EuiPage>
    );
  }
};
