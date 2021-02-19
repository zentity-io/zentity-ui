import React from 'react';

import { cloneDeep } from 'lodash';

import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiRange,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle
} from '@elastic/eui';

import { CodeEditor } from '../code_editor';
import { ModelFlyoutAbstract } from './model_flyout_abstract.js';

export class ModelFlyoutMatchers extends ModelFlyoutAbstract {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      clauseString: '{}',
      clauseInvalid: false
    }
    try {
      this.state.clauseString = JSON.stringify(this.state.data.clause, null, 2);
    } catch (e) {
      clauseString: '{}',
      this.state.clauseInvalid = true;
    }

    this.section = "matchers";
  }

  beforeApply(callback) {
    const data = cloneDeep(this.state.data);
    data.clause = JSON.parse(this.state.clauseString);
    this.setState({ data: data }, callback);
  }

  isInvalid() {
    try {
      JSON.parse(this.state.clauseString);
    } catch (e) {
      return true;
    }
    return false;
  }

  renderBody() {
    return (<>

      {/* Matcher clause */}
      <EuiTitle>
        <EuiText>Clause</EuiText>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiFormRow fullWidth helpText="An Elasticsearch query clause.">
        <CodeEditor
          height="200px"
          isReadOnly={(this.props.loading || this.props.saving)}
          value={this.state.clauseString}
          onChange={(value) => {
            let clauseInvalid = false;
            try {
              JSON.parse(value);
            } catch (e) {
              clauseInvalid: true
            }
            this.setState({
              clauseString: value,
              clauseInvalid: clauseInvalid
            });
          }}
        />
      </EuiFormRow>

      <EuiSpacer />

      {/* Quality */}
      <EuiFlexGroup gutterSize="s" responsive={false}>
        <EuiFlexItem grow={true}>
          <EuiTitle>
            <EuiText>Quality</EuiText>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            checked={this.state.data.quality != null}
            onChange={(e) => {
              const data = cloneDeep(this.state.data);
              // Toggle quality
              if (data.quality != null)
                data.quality = null;
              else
                data.quality = 1.0;
              this.setState({
                data: data
              });
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xs" />
      <EuiFormRow fullWidth helpText="The quality of the matcher.">
        <>
        { this.state.data.quality == null &&
          <EuiText color="subdued" size="xs">
            (Not defined. Click the toggle switch to enable.)
          </EuiText>
        }
        { this.state.data.quality != null &&
        <EuiRange
          id="matcher-quality"
          fullWidth
          min={0.0}
          max={1.0}
          step={0.0001}
          ticks={[
            { label: '0.0', value: 0.0 },
            { label: '0.1', value: 0.1 },
            { label: '0.2', value: 0.2 },
            { label: '0.3', value: 0.3 },
            { label: '0.4', value: 0.4 },
            { label: '0.5', value: 0.5 },
            { label: '0.6', value: 0.6 },
            { label: '0.7', value: 0.7 },
            { label: '0.8', value: 0.8 },
            { label: '0.9', value: 0.9 },
            { label: '1.0', value: 1.0 },
          ]}
          showInput={true}
          showRange={true}
          showTicks={true}
          value={this.state.data.quality}
          onChange={(e) => {
            const data = cloneDeep(this.state.data);
            data.quality = parseFloat(e.currentTarget.value);
            this.setState({ data: data });
          }}
        />
        }
        </>
      </EuiFormRow>

    </>);
  }
};
