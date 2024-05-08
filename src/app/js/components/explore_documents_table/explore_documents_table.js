import React from 'react'
var _ = require('lodash')
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiText,
} from '@elastic/eui'

import { CodeEditor } from '../code_editor'
import { ExploreSearchNoResults } from '../explore_search_no_results'

export class ExploreDocumentsTable extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      documents: this.resetDocuments(this.props.documents),
      documentsExpanded: {}
    }

    this.onToggleRowDetails = this.onToggleRowDetails.bind(this)

  }

  // When the parent updates the documents, update this state.
  componentDidUpdate(oldProps) {
    if (this.props.documents !== oldProps.documents) {
      this.setState({
        documents: this.resetDocuments(this.props.documents),
        documentsExpanded: {}
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

  onToggleRowDetails(item) {
    const documentsExpanded = { ...this.state.documentsExpanded }
    if (documentsExpanded[item.__doc_row_id__]) {
      delete documentsExpanded[item.__doc_row_id__]
    } else {
      const items = [
        {
          name: 'Details',
          id: item.__doc_row_id__ + '.details',
          items: [
            {
              name: 'Attributes',
              id: item.__doc_row_id__ + '._attributes',
              onClick: () => {

              },
              isSelected: true
            },
            {
              name: 'Explanation',
              id: item.__doc_row_id__ + '._explanation',
              onClick: () => {

              },
              isSelected: false
            },
            {
              name: 'Source',
              id: item.__doc_row_id__ + '._source',
              onClick: () => {

              },
              isSelected: false
            },
            {
              name: 'JSON',
              id: item.__doc_row_id__ + '.json',
              onClick: () => {

              },
              isSelected: false
            }
          ]
        }
      ]
      documentsExpanded[item.__doc_row_id__] = (
        <EuiFlexGroup>
          <EuiFlexItem grow>
            <EuiText>
              <CodeEditor
                isReadOnly={true}
                value={JSON.stringify(_.omit(item, '__doc_row_id__'), null, 2)}
              />
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }
    this.setState({
      documentsExpanded: documentsExpanded
    }, () => {
      console.log('toggle row details:')
      console.log(item)
      console.log(this.state)
    })
  }

  render() {

    const columns = [
      {
        width: '40px',
        isExpander: true,
        render: item => (
          <EuiButtonIcon
            onClick={() => this.onToggleRowDetails(item)}
            aria-label={this.state.documentsExpanded[item.__doc_row_id__] ? 'Collapse' : 'Expand'}
            iconType={this.state.documentsExpanded[item.__doc_row_id__] ? 'arrowDown' : 'arrowRight'}
          />
        )
      }
    ]
    const attributes = {}
    for (var i in this.state.documents) {
      for (var name in this.state.documents[i]._attributes) {
        attributes[name] = true
      }
    }
    const attributesNames = Object.keys(attributes).sort()
    for (var i in attributesNames) {
      columns.push({
        field: '_attributes.' + attributesNames[i],
        name: attributesNames[i],
        sortable: true,
        truncateText: false
      })
    }
    const standardColumns = [
      {
        field: '_index',
        name: '_index',
        sortable: true,
        truncateText: false
      },
      {
        field: '_id',
        name: '_id',
        sortable: true,
        truncateText: false
      },
      {
        field: '_hop',
        name: '_hop',
        sortable: true,
        truncateText: false
      },
      {
        field: '_query',
        name: '_query',
        sortable: true,
        truncateText: false
      },
      {
        field: '_score',
        name: '_score',
        sortable: true,
        truncateText: false
      }
    ]
    for (var i in standardColumns) {
      columns.push(standardColumns[i])
    }

    const search = {
      box: {
        incremental: true,
        placeholder: 'Filter...'
      },
      filters: []
    }

    const pagination = {
      initialPageSize: 10,
      pageSizeOptions: [10, 25, 50]
    }

    /*
    _index
    attribute_a
    attribute_b
    attribute_c
    ...
    _id
    _hop
    _query
    */
    return (
      <EuiPanel>
        {this.state.documents.length > 0 &&
          <EuiInMemoryTable
            items={this.state.documents}
            itemId='__doc_row_id__'
            itemIdToExpandedRowMap={this.state.documentsExpanded}
            columns={columns}
            search={search}
            pagination={pagination}
            sorting={true}
            hasActions={true}
            isExpandable={true}
            isSelectable={false}
          />
        }
        {this.state.documents.length === 0 &&
          <ExploreSearchNoResults/>
        }
      </EuiPanel>
    )
  }
}
