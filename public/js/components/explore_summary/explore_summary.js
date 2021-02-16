import React from 'react';
import {
  EuiCard,
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
  EuiTitle
} from '@elastic/eui';

import { ExploreSearchNoResults } from '../explore_search_no_results';
const utils = require('../../utils');

export class ExploreSummary extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      documents: this.props.documents,
      summary: this.summarize(this.props.documents),
    };

  };

  // When the parent updates the documents, update this state.
  componentDidUpdate(oldProps) {
    if (this.props.documents !== oldProps.documents) {
      this.setState({
        documents: this.props.documents,
        summary: this.summarize(this.props.documents)
      });
    }
  };

  summarize(documents) {
    const summary = {
      attributes: {},
      global_max: 0
    };
    for (var i in this.props.documents) {
      const document = this.props.documents[i];
      for (var a in document._attributes) {
        const values = (document._attributes[a] || []);
        for (var i in values) {
          const value = values[i];
          if (typeof value === "string" && value.trim() === "")
            continue;
          if (summary.attributes[a] === undefined)
            summary.attributes[a] = {
              distinct: 0,
              max: 0,
              values: []
            }
          if (summary.attributes[a].values[value] === undefined)
            summary.attributes[a].values[value] = 0;
          summary.attributes[a].values[value]++;
        }
      }
    }
    for (var a in summary.attributes) {
      summary.attributes[a]["distinct"] = Object.keys(summary.attributes[a].values).length;
      for (var value in summary.attributes[a].values) {
        if (summary.attributes[a].values[value] > summary.attributes[a].max)
          summary.attributes[a].max = summary.attributes[a].values[value];
        if (summary.attributes[a].max > summary.global_max)
          summary.global_max = summary.attributes[a].max;
      }
    }
    var summarySorted = {
      attributes: {},
      global_max: summary.global_max
    };
    for (var a in summary.attributes) {
      summarySorted.attributes[a] = {};
      summarySorted.attributes[a].distinct = summary.attributes[a].distinct;
      summarySorted.attributes[a].max = summary.attributes[a].max;
      summarySorted.attributes[a].values = [];
      for (var value in summary.attributes[a].values) {
        var count = summary.attributes[a].values[value];
        summarySorted.attributes[a].values.push([ value, count ]);
      }
      summarySorted.attributes[a].values.sort(function(a, b) {
        return b[1] - a[1];
      });
    }
    return summarySorted;
  };

  render() {

    const cards = [];
    var key = 0;
    for (var attributeName in this.state.summary.attributes) {
      const values = [];
      for (var v in this.state.summary.attributes[attributeName].values) {
        const value = this.state.summary.attributes[attributeName].values[v][0];
        const count = this.state.summary.attributes[attributeName].values[v][1];
        const max = this.state.summary.global_max;
        const _value = (
          <EuiProgress
            key={key + "-" + v}
            max={max}
            color={"vis0"}
            size="s"
            label={value}
            value={count}
            valueText={<>{count}</>}
          />
        );
        values.push(_value);
        values.push(<EuiSpacer key={key + "-" + v + "-spacer"} size="s" />);
      }
      const card = (
        <EuiFlexItem key={key}>
          <EuiPanel paddingSize="s">
            <EuiTitle size="s">
              <h4>{attributeName}</h4>
            </EuiTitle>
            <EuiSpacer size="m"/>
            <div className="zentity-summary-card-block">
              <div className="zentity-summary-card-values">
                {values}
              </div>
            </div>
          </EuiPanel>
        </EuiFlexItem>
      );
      cards.push(card);
      key++;
    }

    return (<>
      {this.state.documents.length > 0 &&
        <EuiFlexGrid columns={4} gutterSize="s">
          {cards}
        </EuiFlexGrid>
      }
      {this.state.documents.length === 0 &&
        <ExploreSearchNoResults/>
      }
    </>);
  };
};
