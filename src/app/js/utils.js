import React from 'react'

const errorToast = (error) => {
  return {
    title: error.response ? error.response.data.error : 'Error',
    text: (
      <p>
        {error.response ? error.response.data.message : 'Unknown error'}
      </p>
    )
  }
}

const uniqueKey = () => (new Date().valueOf() + Math.random()).toString()

const stringToNumber = (str) => /\./.test(str) ? parseFloat(str) : parseInt(str)

const stringToBoolean = (str) => str === 'true' ? true : false

/**
 * Convert Query.ast._indexedClauses to a zentity resolution query.
 */
const esQueryToResolutionInput = (esQuery, zentityModelAttributes) => {
  console.debug('Parsing search bar query.')

  const resolutionInput = {
    attributes: {},
    terms: []
  }

  // Track attribute values and terms as object keys to prevent duplicate values.
  const attrValueSets = {}
  const termSets = {}

  // For any Elasticsearch field queries with an attribute name, add the
  // attribute and value to the 'attributes' field of the resolution request.
  for (var attrName in esQuery.ast._indexedClauses.field) {
    if (attrValueSets[attrName] === undefined)
      attrValueSets[attrName] = {}
    for (var a in esQuery.ast._indexedClauses.field[attrName]) {
      const clause = esQuery.ast._indexedClauses.field[attrName][a]
      if (clause.match !== 'must' || clause.operator !== 'eq' || clause.type !== 'field')
        throw {
          data: {
            error: 'Query syntax error',
            message: 'The attribute value query syntax must be the name and value of the attribute separated by a colon.'
          }
        }
      attrValueSets[attrName][clause.value] = true
    }
  }
  const attrs = Object.keys(attrValueSets).sort()
  for (var a in attrs) {
    const attrName = attrs[a]
    if (resolutionInput.attributes[attrName] === undefined)
      resolutionInput.attributes[attrName] = {
        values: []
      }
    const values = Object.keys(attrValueSets[attrName]).sort()
    for (var v in values)
      resolutionInput.attributes[attrName].values.push(values[v])
  }

  // For any Elasticsearch term queries without an attribute name, add the term
  // to the 'terms' field of the resolution request.
  for (var t in esQuery.ast._indexedClauses.term) {
    const clause = esQuery.ast._indexedClauses.term[t]
    if (clause.match !== 'must' || clause.type !== 'term')
      throw {
        data: {
          error: 'Query syntax error',
          message: 'Unsupported query syntax.'
        }
      }
    termSets[clause.value] = true
  }
  const terms = Object.keys(termSets).sort()
  for (var t in terms)
    resolutionInput.terms.push(terms[t])
  console.debug(resolutionInput)
  return resolutionInput
}

exports.errorToast = errorToast
exports.esQueryToResolutionInput = esQueryToResolutionInput
exports.uniqueKey = uniqueKey
