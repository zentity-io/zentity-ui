import React from 'react'

import { cloneDeep, get } from 'lodash'

import {
  EuiBadge,
  EuiComboBox,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui'

import { ModelFlyoutAbstract } from './model_flyout_abstract.js'

export class ModelFlyoutResolvers extends ModelFlyoutAbstract {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
    }
    this.section = 'resolvers'

    this.computeResolverScore = this.computeResolverScore.bind(this)
  }

  isInvalid() {
    return !this.state.data.attributes.length
  }

  // TODO: Code is duplicated in ModelSectionResolvers.
  // Move to a shared location.
  computeResolverScore(resolverAttributes, modelAttributes) {
    const attributeScores = []
    for (var i in resolverAttributes || []) {
      const attributeName = resolverAttributes[i]
      const attributeScore = get(modelAttributes, `${attributeName}.score`) || null
      if (attributeScore !== null) attributeScores.push(attributeScore)
    }
    if (attributeScores.length === 0) return null
    const attributeScoresProduct = attributeScores.reduce((a, b) => a * b, 1)
    const attributeScoresProductInverse = attributeScores.reduce((a, b) => a * (1.0 - b), 1)
    const resolverScore = attributeScoresProduct / (attributeScoresProduct + attributeScoresProductInverse)
    return resolverScore
  }

  renderBody() {
    // TODO: Duplicate code in ModelSectionResolvers
    let resolverScore = null
    let resolverScoreBadge = null
    if (this.state.data.attributes.length) {
      resolverScore = this.computeResolverScore(this.state.data.attributes, this.props.modelCopy.attributes)
      let color
      let message
      if (resolverScore === 1.0) {
        color = 'danger'
        message = 'Guaranteed match'
      } else if (resolverScore >= 0.99 && resolverScore < 1.0) {
        color = 'secondary'
        message = 'Very strong match'
      } else if (resolverScore >= 0.9 && resolverScore < 0.99) {
        color = 'secondary'
        message = 'Strong match'
      } else if (resolverScore >= 0.75 && resolverScore < 0.9) {
        color = 'warning'
        message = 'Moderate match'
      } else if (resolverScore > 0.5 && resolverScore < 0.75) {
        color = 'default'
        message = 'Weak match'
      } else if (resolverScore === 0.5) {
        color = 'default'
        message = 'No decision'
      } else if (resolverScore < 0.5 && resolverScore > 0.0) {
        color = 'danger'
        message = 'Likely false match'
      } else if (resolverScore === 0.0) {
        color = 'danger'
        message = 'Guaranteed false match'
      } else {
        color = 'default'
        message = '-'
      }
      resolverScoreBadge = (
        <EuiBadge color={color} style={{ margin: '0 10px' }}>
          {message}
        </EuiBadge>
      )
    }

    return (
      <>
        {/* Resolver attributes */}
        <EuiTitle>
          <EuiText>Attributes</EuiText>
        </EuiTitle>
        <EuiSpacer size="xs" />
        <EuiFormRow
          fullWidth
          helpText="The attributes of the resolver. During entity resolution, a document matches the entity when its fields match all the attributes of at least one resolver."
        >
          <EuiComboBox
            id="resolver-attributes"
            fullWidth
            placeholder="Attributes..."
            options={(() => {
              const options = []
              for (var attributeName in this.props.modelCopy.attributes)
                options.push({
                  label: attributeName,
                })
              return options
            })()}
            selectedOptions={(() => {
              const options = []
              for (var i in this.state.data.attributes)
                options.push({
                  label: this.state.data.attributes[i],
                })
              return options
            })()}
            onChange={(resolverAttributes) => {
              const data = cloneDeep(this.state.data)
              data.attributes = []
              for (var i in resolverAttributes) data.attributes.push(resolverAttributes[i].label)
              this.setState({ data: data })
            }}
            onCreateOption={(e) => e}
            isClearable={true}
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiTitle>
          <EuiText>Score</EuiText>
        </EuiTitle>
        <EuiSpacer size="xs" />
        <EuiFormRow fullWidth helpText="The combined identity confidence score of the attributes.">
          <>
            {resolverScore !== null && (
              <EuiText>
                {resolverScore.toFixed(8)} {resolverScoreBadge}
              </EuiText>
            )}
            {resolverScore === null && <EuiText color="subdued">-</EuiText>}
          </>
        </EuiFormRow>

        <EuiSpacer />

        {/* Resolver weight */}
        <EuiFlexGroup gutterSize="s" responsive={false}>
          <EuiFlexItem grow={true}>
            <EuiTitle>
              <EuiText>Weight</EuiText>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              checked={this.state.data.weight != null}
              onChange={(e) => {
                const data = cloneDeep(this.state.data)
                // Toggle weight
                if (data.weight != null) data.weight = null
                else data.weight = 0
                this.setState({
                  data: data,
                })
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        <EuiFormRow fullWidth helpText="The priority of the resolver over others with shared attributes.">
          <>
            {this.state.data.weight == null && (
              <EuiText color="subdued" size="xs">
                (Not defined. Click the toggle switch to enable.)
              </EuiText>
            )}
            {this.state.data.weight != null && (
              <EuiFieldNumber
                id="resolver-weight"
                fullWidth
                placeholder="Weight..."
                value={this.state.data.weight}
                onChange={(e) => {
                  const data = cloneDeep(this.state.data)
                  data.weight = parseInt(e.currentTarget.value)
                  this.setState({ data: data })
                }}
              />
            )}
          </>
        </EuiFormRow>
      </>
    )
  }
}
