import React from 'react';

import { cloneDeep } from 'lodash';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiRange,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle
} from '@elastic/eui';

import { ModelFlyoutAbstract } from './model_flyout_abstract.js';

export class ModelFlyoutAttributes extends ModelFlyoutAbstract {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state
    }
    this.section = "attributes";
  }

  renderBody() {
    return (<>

      {/* Attribute type */}
      <EuiTitle>
        <EuiText>Type</EuiText>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiFormRow fullWidth helpText="The type of the attribute.">
        <EuiSelect
          id="attribute-type"
          fullWidth
          options={[
            { value: 'string', text: 'string' },
            { value: 'number', text: 'number' },
            { value: 'boolean', text: 'boolean' },
            { value: 'date', text: 'date' }
          ]}
          value={this.state.data.type}
          onChange={(e) => {
            const data = this.state.data;
            data.type = e.currentTarget.value;
            this.setState({ data: data });
          }}
        />
      </EuiFormRow>

      <EuiSpacer />

      {/* Attribute score */}
      <EuiFlexGroup gutterSize="s" responsive={false}>
        <EuiFlexItem grow={true}>
          <EuiTitle>
            <EuiText>Score</EuiText>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            checked={this.state.data.score != null}
            onChange={(e) => {
              const data = cloneDeep(this.state.data);
              // Toggle score
              if (data.score != null)
                data.score = null;
              else
                data.score = 0.5;
              this.setState({
                data: data
              });
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xs" />
      <EuiFormRow fullWidth helpText="The identity confidence base score of the attribute.">
        <>
        { this.state.data.score == null &&
          <EuiText color="subdued" size="xs">
            (Not defined. Click the toggle switch to enable.)
          </EuiText>
        }
        { this.state.data.score != null &&
        <EuiRange
          id="attribute-score"
          fullWidth
          showTicks={true}
          min={0.0}
          max={1.0}
          step={0.0001}
          ticks={[
            { label: '0.0', value: 0.0 },
            { label: '0.5', value: 0.5 },
            { label: '0.6', value: 0.6 },
            { label: '0.7', value: 0.7 },
            { label: '0.8', value: 0.8 },
            { label: '0.9', value: 0.9 },
            { label: '1.0', value: 1.0 },
          ]}
          showInput={true}
          levels={[
            {
              min: 0.0,
              max: 0.5,
              color: 'danger',
            },
            {
              min: 0.5,
              max: 1.0,
              color: 'success',
            },
          ]}
          showRange={true}
          value={this.state.data.score}
          onChange={(e) => {
            const data = cloneDeep(this.state.data);
            data.score = parseFloat(e.currentTarget.value);
            this.setState({ data: data });
          }}
        />
        }
        </>
      </EuiFormRow>

    </>);
  }
};
