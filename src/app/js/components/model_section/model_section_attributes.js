import React from 'react'
import { Link } from 'react-router-dom'

import { EuiBadge, EuiCode, EuiText } from '@elastic/eui'

import { ModelSectionAbstract } from './model_section_abstract.js'

export class ModelSectionAttributes extends ModelSectionAbstract {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
    }

    // Must be one of 'attributes', 'resolvers', 'matchers', or 'indices'.
    this.section = 'attributes'

    // The default object when creating a new attribute.
    this.defaultObject = {
      type: 'string',
      score: 0.5,
    }

    // Columns to display in the selection table.
    this.columns = [
      {
        field: 'type',
        name: 'Type',
        sortable: true,
        truncateText: true,
        render: (value) => <EuiText>{value ? value : 'string'}</EuiText>,
      },
      {
        field: 'score',
        name: 'Score',
        sortable: true,
        truncateText: true,
        render: (value) => {
          try {
            let badge = null
            if (value != null) {
              let color
              let message
              if (value === 1.0) {
                color = 'danger'
                message = 'Guaranteed match'
              } else if (value >= 0.99 && value < 1.0) {
                color = 'secondary'
                message = 'Very strong match'
              } else if (value >= 0.9 && value < 0.99) {
                color = 'secondary'
                message = 'Strong match'
              } else if (value >= 0.75 && value < 0.9) {
                color = 'warning'
                message = 'Moderate match'
              } else if (value > 0.5 && value < 0.75) {
                color = 'default'
                message = 'Weak match'
              } else if (value === 0.5) {
                color = 'default'
                message = 'No decision'
              } else if (value < 0.5 && value > 0.0) {
                color = 'danger'
                message = 'Likely false match'
              } else if (value === 0.0) {
                color = 'danger'
                message = 'Guaranteed false match'
              } else {
                color = 'default'
                message = '-'
              }
              badge = (
                <EuiBadge color={color} style={{ margin: '0 10px' }}>
                  {message}
                </EuiBadge>
              )
            }
            return (
              <EuiText>
                {value != null ? (
                  <>
                    {value.toFixed(4)} {badge}
                  </>
                ) : (
                  <EuiCode>null</EuiCode>
                )}
              </EuiText>
            )
          } catch (e) {
            console.error(e)
            return <></>
          }
        },
      },
      {
        field: 'params',
        name: 'Params',
        sortable: false,
        truncateText: true,
        render: (value) => (
          <EuiText>{value ? <EuiCode>{JSON.stringify(value)}</EuiCode> : <EuiCode>null</EuiCode>}</EuiText>
        ),
      },
    ]

    // Validation checks to display in the main panel content.
    this.validations = [
      {
        check: (attribute) => attribute.score == 1.0,
        level: 'warning',
        text: (
          <>
            An attribute score of <b>1.0</b> will cause the final identity confidence score to always be <b>1.0</b>,
            regardless of the scores of other matching attributes. Consider keeping every attribute score under{' '}
            <b>1.0</b> to prevent any single attribute from dictating the final identity confidence score.
          </>
        ),
      },
      {
        check: (attribute) => attribute.score == 0.0,
        level: 'warning',
        text: (
          <>
            An attribute score of <b>0.0</b> will cause the final identity confidence score to always be <b>0.0</b>,
            regardless of the scores of other matching attributes. Consider keeping every attribute score above{' '}
            <b>0.0</b> to prevent any single attribute from dictating the final identity confidence score.
          </>
        ),
      },
      {
        check: (attribute) => attribute.score < 0.5 && attribute.score > 0.0,
        level: 'warning',
        text: (
          <>
            An attribute score of <b>less than 0.5</b> will penalize the final identity confidence score. Consider
            keeping every attribute score <b>above 0.5</b> to ensure that every matched attribute contributes to a
            greater level of confidence in the matched document.
          </>
        ),
      },
      {
        check: (attribute) => attribute.score == 0.5,
        level: 'info',
        text: (
          <>
            An attribute score of <b>0.5</b> will never affect the final identity confidence score. Consider keeping
            every attribute score <b>above 0.5</b> to ensure that every matched attribute contributes to a greater level
            of confidence in the matched document.
          </>
        ),
      },
    ]
  }

  /**
   * Delete an attribute an any references to it.
   * Return the modified modelCopy.
   */
  onDelete(modelCopy, nameDeleted) {
    // Verify that the action can be done.
    // It cannot be referenced by any resolvers or index fields.
    const references = {
      resolvers: [],
      indices: [],
    }
    for (var resolverName in modelCopy.resolvers) {
      var resolver = modelCopy.resolvers[resolverName]
      var resolverAttributes = []
      for (var i in resolver.attributes) {
        if (resolver.attributes[i] === nameDeleted)
          references.resolvers.push(
            <div>
              <Link to={`/models/${this.props.modelId}/resolvers/${resolverName}`}>{resolverName}</Link>
            </div>
          )
      }
    }
    for (var indexName in modelCopy.indices) {
      var index = modelCopy.indices[indexName]
      for (var indexFieldName in index.fields) {
        var field = index.fields[indexFieldName]
        if (field.attribute === nameDeleted)
          references.indices.push(
            <div>
              <Link to={`/models/${this.props.modelId}/indices/${indexName}`}>
                {indexName}.{indexFieldName}
              </Link>
            </div>
          )
      }
    }
    if (references.resolvers.length > 0 || references.indices.length > 0) {
      throw {
        title: 'Unsafe to delete',
        text: (
          <>
            <p>
              '{nameDeleted}' is referenced by other objects in this entity model. Deleting it would change or
              invalidate them.
            </p>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}>
              {references.resolvers.length > 0 && (
                <p>
                  <div>
                    <b>Resolvers</b>
                  </div>
                  {references.resolvers}
                </p>
              )}
              {references.indices.length > 0 && (
                <p>
                  <div>
                    <b>Index Fields</b>
                  </div>
                  {references.indices}
                </p>
              )}
            </div>
          </>
        ),
      }
    }

    // Reconstruct the attributes.
    var attributes = {}
    for (var name in modelCopy.attributes) {
      if (name !== nameDeleted) attributes[name] = modelCopy.attributes[name]
    }
    modelCopy.attributes = attributes
    return modelCopy
  }

  /**
   * Rename an attribute and any references to it.
   * Return the modified modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {
    // Reconstruct the attributes
    var attributes = {}
    for (var name in modelCopy.attributes) {
      if (name === nameOld) attributes[nameNew] = modelCopy.attributes[name]
      else attributes[name] = modelCopy.attributes[name]
    }
    modelCopy.attributes = attributes

    // Rename references from resolvers to the old attribute name
    for (var r in modelCopy.resolvers) {
      var resolver = modelCopy.resolvers[r]
      var resolverAttributes = []
      for (var i in resolver.attributes) {
        const name = resolver.attributes[i]
        if (name === nameOld) resolverAttributes.push(nameNew)
        else resolverAttributes.push(name)
      }
      modelCopy.resolvers[r].attributes = resolverAttributes
    }

    // Rename references from index field names to the old attribute name
    for (var i in modelCopy.indices) {
      var index = modelCopy.indices[i]
      for (var f in index.fields) {
        var field = index.fields[f]
        if (field.attribute === nameOld) modelCopy.indices[i].fields[f].attribute = nameNew
      }
    }

    return modelCopy
  }
}
