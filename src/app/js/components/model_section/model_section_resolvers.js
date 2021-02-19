import React from 'react';

import { cloneDeep, get } from 'lodash';

import {
  EuiBadge,
  EuiCode,
  EuiComboBox,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui';

import { ModelSectionAbstract } from './model_section_abstract.js';

export class ModelSectionResolvers extends ModelSectionAbstract {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state
    }

    // Must be one of "attributes", "resolvers", "matchers", or "indices".
    this.section = "resolvers";

    // The default object when creating a new resolver.
    this.defaultObject = {
      attributes: [],
      weight: 0
    };

    // TODO: Code is duplicated in ModelFlyoutResolvers.
    // Move to a shared location.
    this.computeResolverScore = function (resolverAttributes, modelAttributes) {
      const attributeScores = [];
      for (var i in (resolverAttributes || [])) {
        const attributeName = resolverAttributes[i];
        const attributeScore = get(modelAttributes, `${attributeName}.score`) || null;
        if (attributeScore !== null)
          attributeScores.push(attributeScore);
      }
      if (attributeScores.length === 0)
        return null;
      const attributeScoresProduct = attributeScores.reduce((a, b)=> a * b, 1);
      const attributeScoresProductInverse = attributeScores.reduce((a, b)=> a * (1.0 - b), 1);
      const resolverScore = attributeScoresProduct / (attributeScoresProduct + attributeScoresProductInverse);
      return resolverScore;
    };

    // Columns to display in the selection table.
    this.columns = [
      {
        field: 'attributes',
        name: 'Attributes',
        sortable: false,
        truncateText: false,
        render: (value) => {
          const items = [];
          for (var i in value)
            items.push(
              <EuiFlexItem key={i} grow={false}>
                <EuiBadge>{value[i]}</EuiBadge>
              </EuiFlexItem>
            );
          return (
            <EuiFlexGroup wrap responsive={false} gutterSize="xs">
              {items}
            </EuiFlexGroup>
          );
        }
      },
      {
        name: 'Score',
        sortable: (value) => {
          return this.computeResolverScore(value.attributes, this.state.modelCopy.attributes);
        },
        truncateText: true,
        render: (value) => {
          try {
            // TODO: Duplicate code in ModelFlyoutResolvers
            let resolverScore = null;
            let resolverScoreBadge = null;
            if (value.attributes.length) {
              resolverScore = this.computeResolverScore(value.attributes, this.state.modelCopy.attributes);
              let color;
              let message;
              if (resolverScore === 1.0) {
                color = "danger";
                message = "Guaranteed match";
              } else if (resolverScore >= 0.99 && resolverScore < 1.0) {
                color = "secondary";
                message = "Very strong match";
              } else if (resolverScore >= 0.9 && resolverScore < 0.99) {
                color = "secondary";
                message = "Strong match";
              } else if (resolverScore >= 0.75 && resolverScore < 0.9) {
                color = "warning";
                message = "Moderate match";
              } else if (resolverScore > 0.5 && resolverScore < 0.75) {
                color = "default";
                message = "Weak match";
              } else if (resolverScore === 0.5) {
                color = "default";
                message = "No decision";
              } else if (resolverScore < 0.5 && resolverScore > 0.0) {
                color = "danger";
                message = "Likely false match";
              } else if (resolverScore === 0.0) {
                color = "danger";
                message = "Guaranteed false match";
              } else {
                color = "default";
                message = "-";
              }
              resolverScoreBadge = (
                <EuiBadge color={color} style={{ margin: "0 10px" }}>
                  {message}
                </EuiBadge>
              );
            }
            if (resolverScore != null)
              return (
                <EuiText>
                  {resolverScore.toFixed(8)} {resolverScoreBadge}
                </EuiText>
              );
            else
              return (
                <EuiText>
                  <EuiCode>null</EuiCode>
                </EuiText>
              );
          } catch (e) {
            console.error(e);
            return (<></>);
          }
        }
      },
      {
        field: 'weight',
        name: 'Weight',
        sortable: true,
        truncateText: true,
        render: (value) => (<EuiText>{value != null ? value : <EuiCode>null</EuiCode>}</EuiText>)
      }
    ];

    // Validation checks to display in the main panel content.
    this.validations = [
      {
        check: (resolver) => {
          return (resolver.attributes || []).length === 0;
        },
        level: "error",
        text: (<>A resolver must have at least one attribute.</>),
      },
      {
        check: (resolver) => {
          return (resolver.attributes || []).length === 1;
        },
        level: "info",
        text: (<>A best practice is to define <a href="https://zentity.io/docs/basic-usage/multiple-attribute-resolution/" target="_blank">more than one attribute</a> in a resolver to help avoid false matches.</>),
      }
    ];
  }

  /**
   * Delete a resolver.
   * Return the modified modelCopy.
   */
  onDelete(modelCopy, nameDeleted) {

    // Reconstruct the resolvers.
    var resolvers = {};
    for (var name in modelCopy.resolvers)
      if (name !== nameDeleted)
        resolvers[name] = modelCopy.resolvers[name];
    modelCopy.resolvers = resolvers;
    return modelCopy;
  }

  /**
   * Rename a resolver.
   * Return the modified modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {

    // Reconstruct the resolvers
    var resolvers = {};
    for (var name in modelCopy.resolvers) {
      if (name === nameOld)
        resolvers[nameNew] = modelCopy.resolvers[name];
      else
        resolvers[name] = modelCopy.resolvers[name];
    }
    modelCopy.resolvers = resolvers;
    return modelCopy;
  }

};
