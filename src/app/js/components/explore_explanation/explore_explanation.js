import React from 'react'
import {
  EuiAccordion,
  EuiBadge,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiIconTip,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiSteps,
  EuiSubSteps,
  EuiText,
  EuiTitle,
} from '@elastic/eui'

const utils = require('../../utils')

export class ExploreExplanation extends React.Component {

  constructor(props) {
    super(props)

    const documents = this.resetDocuments(this.props.documents)
    const request = this.resetRequest(this.props.request)
    const steps = this.resetSteps(documents, this.props.request)

    this.state = {
      documents: documents,
      request: request,
      steps: steps
    }

  }

  // When the parent updates the documents, update this state.
  componentDidUpdate(oldProps) {
    if (this.props.documents !== oldProps.documents) {
      const documents = this.resetDocuments(this.props.documents)
      const request = this.resetRequest(this.props.request)
      const steps = this.resetSteps(documents, this.props.request)
      this.setState({
        documents: documents,
        request: request,
        steps: steps
      })
    }
  }

  // Assign an identifier for each document.
  resetDocuments(documents) {
    const _documents = []
    for (var i in documents) {
      const document = documents[i]
      document.__doc_row_id__ = i
      _documents.push(document)
    }
    return _documents
  }

  resetRequest(request) {
    return request
  }

  resetSteps(documents, request) {

    // Determine which attribute values are newly discovered on a given query.
    const newAttrValueTracker = {}

    // Group documents by queries. Identify queries as _hop._query pairs.
    const queries = {}
    for (var i in documents) {
      const document = documents[i]
      const qid = document._hop + '.' + document._query
      if (queries[qid] === undefined)
        queries[qid] = {
          _index: document._index,
          hits: []
        }
      queries[qid].hits.push(document)
    }

    const steps = []

    // Input attributes
    const attributes = []
    if (request.data.attributes) {
      for (var attributeName in request.data.attributes) {
        const value = request.data.attributes[attributeName]['values'][0] // TODO: Handle many

        // Mark values as known.
        if (newAttrValueTracker[attributeName] === undefined)
          newAttrValueTracker[attributeName] = {}
        if (value !== null && value.trim() !== '' && newAttrValueTracker[attributeName][value] === undefined) {
          newAttrValueTracker[attributeName][value] = true
        }

        const _attribute = <EuiFlexGroup key={utils.uniqueKey()}>
            <EuiFlexItem grow={1}>
              <EuiText size='s' color='subdued'>
                {attributeName}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={9}>
              <EuiText size='s'>
                {value}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        attributes.push(_attribute)
      }
    }

    // Input terms
    const terms = []
    if (request.data.terms) {
      for (var i in request.data.terms) {
        const value = request.data.terms[i]
        const _term = <EuiFlexGroup key={utils.uniqueKey()}>
            <EuiFlexItem grow={10}>
              <EuiText size='s'>
                {value}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        terms.push(_term)
      }
    }

    // Input step
    const input = {
      key: utils.uniqueKey(),
      status: 'incomplete',
      title: 'User input received.',
      titleSize: 's',
      children: <EuiPanel>
        <EuiAccordion
          buttonContent={
            <EuiText size='s'>
              <EuiIcon type='document'/> User input
            </EuiText>
          }
          id={utils.uniqueKey()}
          initialIsOpen={true}
          paddingSize='l'>

          {attributes.length > 0 &&
            <EuiAccordion
              buttonContent={
                <EuiTitle size='m'>
                  <EuiText size='m'>
                    <h3>Attributes</h3>
                  </EuiText>
                </EuiTitle>
              }
              id={'input.attributes'}
              initialIsOpen={true}
              paddingSize='l'>
              {attributes}
            </EuiAccordion>
          }

          {terms.length > 0 &&
            <EuiAccordion
              buttonContent={
                <EuiTitle size='m'>
                  <EuiText size='m'>
                    <h3>Terms</h3>
                  </EuiText>
                </EuiTitle>
              }
              id={'input.terms'}
              initialIsOpen={true}
              paddingSize='l'>
              {terms}
            </EuiAccordion>
          }

        </EuiAccordion>
      </EuiPanel>
    }
    steps.push(input)

    // Query steps
    const qids = Object.keys(queries).sort()
    for (var q in qids) {
      const query = queries[qids[q]]
      const hits = []

      // Documents (hits)
      for (var h = 0; h < query.hits.length; h++) {
        const hit = query.hits[h]

        // Explanation (resolvers)
        const resolvers = []
        for (var resolverName in hit._explanation.resolvers) {
          const attributes = []
          for (var a in hit._explanation.resolvers[resolverName].attributes) {
            const attributeName = hit._explanation.resolvers[resolverName].attributes[a]
            const attribute = <div key={utils.uniqueKey()}>
              <EuiBadge color='hollow'>{attributeName}</EuiBadge>
            </div>
            attributes.push(attribute)
          }
          const resolver = <EuiFlexGroup key={utils.uniqueKey()}>
              <EuiFlexItem grow={1}>
                <EuiText size='s'>
                  {resolverName}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={9}>
                <EuiText size='s'>
                  {attributes}
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          resolvers.push(resolver)
        }

        // Explanation (matches)
        const matches = []
        for (var m in hit._explanation.matches) {
          const match = hit._explanation.matches[m]
          const row = {
            key: utils.uniqueKey(),
            attribute: match.attribute,
            target_field: match.target_field,
            target_value: match.target_value,
            input_value: match.input_value,
            matcher: match.input_matcher,
            matcher_params: match.input_matcher_params
          }
          matches.push(row)
        }
        const columns = [
          {
            field: 'attribute',
            name: 'Attribute',
            render: (value) => ( <EuiText size='s'>{value}</EuiText> )
          },
          {
            field: 'target_field',
            name: 'Index Field',
            render: (value) => ( <EuiText size='s'>{value}</EuiText> )
          },
          {
            field: 'target_value',
            name: 'Index Value',
            render: (value) => ( <EuiText size='s'>{value}</EuiText> )
          },
          {
            field: 'input_value',
            name: 'Input Value',
            render: (value) => ( <EuiText size='s'>{value}</EuiText> )
          },
          {
            field: 'matcher',
            name: 'Matcher',
            render: (value) => ( <EuiText size='s'>{value}</EuiText> )
          },
          {
            field: 'matcher_params',
            name: 'Matcher Params',
            render: (value) => ( <EuiText size='s'>{JSON.stringify(value)}</EuiText> )
          }
        ]

        // Attributes
        const attributes = []
        for (var attributeName in hit._attributes) {
          const value = hit._attributes[attributeName][0] // TODO: Handle many

          // Determine if the attribute value is newly discovered on this query.
          var newValue = false
          if (newAttrValueTracker[attributeName] === undefined)
            newAttrValueTracker[attributeName] = {}
          if (value !== null && value.trim() !== '' && newAttrValueTracker[attributeName][value] === undefined) {
            newValue = true
            newAttrValueTracker[attributeName][value] = true
          }

          const _attribute = <EuiFlexGroup key={utils.uniqueKey()}>
              <EuiFlexItem grow={1}>
                <EuiText size='s' color='subdued'>
                  {attributeName}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={9}>
                <EuiText size='s'>
                  {value} {newValue && <EuiBadge color='#fea27f'><span style={{ 'fontSize': '9px' }}>NEW</span></EuiBadge>}
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          attributes.push(_attribute)
        }

        // Document (hit)
        const doc = <div key={utils.uniqueKey()}>
          <EuiPanel>
            <EuiAccordion
              buttonContent=<EuiText size='s'><EuiIcon type='document'/> {hit._id}</EuiText>
              id={'hit.' + query._index + '.' + hit._id}
              initialIsOpen={true}
              paddingSize='l'>

                <EuiAccordion
                  buttonContent={
                    <EuiTitle size='m'>
                      <EuiText size='m'>
                        <h3>Attributes</h3>
                      </EuiText>
                    </EuiTitle>
                  }
                  id={'hit.' + query._index + '.' + hit._id + '.attributes'}
                  initialIsOpen={true}
                  paddingSize='l'>
                  {attributes}
                </EuiAccordion>

                {/* Include all attributes */}
                {/* Indicate if match or new (or do nothing) -- first column, no heading */}
                {/* If match, show matchers */}
                {/* If new, get target fields from model and target values from _source */}
                {/* If not in matches, omit matcher and input value */}
                <EuiAccordion
                  buttonContent={
                    <EuiTitle size='m'>
                      <EuiText size='m'>
                        <h3>Matches</h3>
                      </EuiText>
                    </EuiTitle>
                  }
                  id={'hit.' + query._index + '.' + hit._id + '.matches'}
                  initialIsOpen={false}
                  paddingSize='l'>
                  <EuiInMemoryTable
                    columns={columns}
                    compressed={true}
                    items={matches}
                    pagination={false}
                    sorting={false}
                  />
                </EuiAccordion>

                <EuiAccordion
                  buttonContent={
                    <EuiTitle size='m'>
                      <EuiText size='m'>
                        <h3>Resolvers</h3>
                      </EuiText>
                    </EuiTitle>
                  }
                  id={'hit.' + query._index + '.' + hit._id + '.resolvers'}
                  initialIsOpen={false}
                  paddingSize='l'>
                  {resolvers}
                </EuiAccordion>

            </EuiAccordion>
          </EuiPanel>
          {h+1 < query.hits.length &&
            <EuiSpacer/>
          }
        </div>
        hits.push(doc)
      }

      // Query step
      const step = {
        key: utils.uniqueKey(),
        title: query._index + ' (' + query.hits.length + ' hit' + (query.hits.length !== 1 ? 's' : '') + ')',
        titleSize: 's',
        children: <>
          {hits}
        </>
      }
      steps.push(step)
    }

    // End step
    const end = {
      key: utils.uniqueKey(),
      status: 'complete',
      title: 'No more matches found.',
      titleSize: 's',
      children: <></>
    }
    steps.push(end)
    return steps
  }

  render() {

    return (<>
      <EuiFlexGroup gutterSize='m'>
        <EuiFlexItem grow={false} style={{ width: '0px' }}>
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <EuiSteps steps={this.state.steps} firstStepNumber={0}/>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>)
  }
}
