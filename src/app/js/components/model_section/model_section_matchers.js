import React from 'react'
import { Link } from 'react-router-dom'

import { EuiCode, EuiText } from '@elastic/eui'

import { ModelSectionAbstract } from './model_section_abstract.js'

export class ModelSectionMatchers extends ModelSectionAbstract {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
    }

    // Must be one of 'attributes', 'resolvers', 'matchers', or 'indices'.
    this.section = 'matchers'

    // The default object when creating a new matcher.
    this.defaultObject = {
      clause: {},
      quality: 1.0,
    }

    // Columns to display in the selection table.
    this.columns = [
      {
        field: 'clause',
        name: 'Clause',
        sortable: false,
        truncateText: true,
        render: (value) => {
          // Create a snippet showing the first object in the matcher,
          // which is likely to indicate the type of query
          // (e.g. 'match', 'term', 'range', 'script', 'bool').
          let isArray = false
          let firstObject = value
          let firstKey
          if (Array.isArray(value)) {
            isArray = true
            firstObject = value[0]
          }
          for (var key in firstObject) {
            firstKey = key
            break
          }
          let snippet
          if (firstKey) {
            if (isArray) snippet = '[{"' + firstKey + '": ... }]'
            else snippet = '{"' + firstKey + '": ... }'
          } else {
            snippet = JSON.stringify(value)
          }
          return (
            <EuiText>
              <EuiCode>{snippet}</EuiCode>
            </EuiText>
          )
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
      {
        field: 'quality',
        name: 'Quality',
        sortable: true,
        truncateText: true,
        render: (value) => <EuiText>{value != null ? value.toFixed(4) : <EuiCode>null</EuiCode>}</EuiText>,
      },
    ]

    // Validation checks to display in the main panel content.
    this.validations = [
      {
        check: (matcher, state) => {
          try {
            JSON.parse(state.clauseString)
          } catch (e) {
            return true
          }
        },
        level: 'error',
        text: <>Matcher clause is invalid JSON.</>,
      },
      {
        check: (matcher, state) => {
          return !state.clauseString.match(/\{\{\s*field\s*}}/)
        },
        level: 'warning',
        text: (
          <>
            The <EuiCode>{'{{ field }}'}</EuiCode> variable is not defined in the matcher clause.
          </>
        ),
      },
      {
        check: (matcher, state) => {
          return !state.clauseString.match(/\{\{\s*value\s*}}/)
        },
        level: 'warning',
        text: (
          <>
            The <EuiCode>{'{{ value }}'}</EuiCode> variable is not defined in the matcher clause.
          </>
        ),
      },
      {
        check: (matcher) => matcher.quality == 0.0,
        level: 'warning',
        text: (
          <>
            A quality score of <b>0.0</b> will cause the attribute match score to always be <b>0.5</b>, which means this
            matcher will have no effect on the final identity confidence score. Consider keeping every matcher quality
            score above <b>0.0</b> to ensure that each match improves the overall match score.
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
    // It cannot be referenced by any index fields.
    const references = {
      indices: [],
    }
    for (var indexName in modelCopy.indices) {
      var index = modelCopy.indices[indexName]
      for (var indexFieldName in index.fields) {
        var field = index.fields[indexFieldName]
        if (field.matcher === nameDeleted)
          references.indices.push(
            <div>
              <Link to={`/models/${this.props.modelId}/indices/${indexName}`}>
                {indexName}.{indexFieldName}
              </Link>
            </div>
          )
      }
    }
    if (references.indices.length > 0) {
      throw {
        title: 'Unsafe to delete',
        text: (
          <>
            <p>
              '{nameDeleted}' is referenced by other objects in this entity model. Deleting it would change or
              invalidate them.
            </p>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}>
              <p>
                <div>
                  <b>Index Fields</b>
                </div>
                {references.indices}
              </p>
            </div>
          </>
        ),
      }
    }

    // Reconstruct the matchers.
    var matchers = {}
    for (var name in modelCopy.matchers) {
      if (name !== nameDeleted) matchers[name] = modelCopy.matchers[name]
    }
    modelCopy.matchers = matchers
    return modelCopy
  }

  /**
   * Rename an attribute and any references to it.
   * Return the modified modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {
    // Reconstruct the matchers
    var matchers = {}
    for (var name in modelCopy.matchers) {
      if (name === nameOld) matchers[nameNew] = modelCopy.matchers[name]
      else matchers[name] = modelCopy.matchers[name]
    }
    modelCopy.matchers = matchers

    // Rename references from index field names to the old matcher name
    for (var i in modelCopy.indices) {
      var index = modelCopy.indices[i]
      for (var f in index.fields) {
        var field = index.fields[f]
        if (field.matcher === nameOld) modelCopy.indices[i].fields[f].matcher = nameNew
      }
    }

    return modelCopy
  }
}
