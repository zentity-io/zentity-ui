import React from 'react'
import {
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTextColor,
  EuiTitle
} from '@elastic/eui'

import { CodeEditor } from '../code_editor'
import { ExploreDocumentsTable } from '../explore_documents_table'
import { ExploreExplanation } from '../explore_explanation'
import { ExploreSearch } from '../explore_search'
import { ExploreSummary } from '../explore_summary'

const client = require('../../client')
const utils = require('../../utils')

export class ExplorePage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      models: {},
      resolution: {
        lastAttempt: {
          request: {},
          response: {}
        },
        lastSuccess: {
          request: {},
          requestString: '',
          response: {},
          responseString: ''
        }
      },
      tab: 'summary'
    }

    this.tabs = [
      {
        id: 'summary',
        name: 'Summary'
      },
      {
        id: 'documents',
        name: 'Documents'
      },
      {
        id: 'explanation',
        name: 'Explanation'
      },
      {
        id: 'request',
        name: 'Request'
      },
      {
        id: 'response',
        name: 'Response'
      }
    ]

    this.onChangeTab = this.onChangeTab.bind(this)
    this.onSubmitResolution = this.onSubmitResolution.bind(this)
    this.everSearched = this.everSearched.bind(this)
  }

  componentDidMount() {
    this.getModels()
  }

  getModels() {
    console.debug('Get models: Started')

    // Set loading state
    this.setState({
      loading: true
    }, () => {
      console.debug('Get models: State')
      console.debug(this.state)
    })

    // Get models
    client.get('/_zentity/models')
      .then((response) => {

        // Request successful
        try {
          console.debug('Get models: Success')
          console.debug(response)

          // Set models
          const models = {}
          for (var h in response.data.hits.hits) {
            const entityType = response.data.hits.hits[h]._id
            models[entityType] = response.data.hits.hits[h]._source
          }
          this.setState({
            loading: false,
            models: models
          }, () => {
            console.debug('Get models: State')
            console.debug(this.state)
          })

        // Response handling failed
        } catch (error) {
          console.warn('Get models: Failure')
          console.error(error)
          this.setState({
            loading: false
          }, () => {
            console.log('Get models: State')
            console.log(this.state)
            this.props.onAddToast(utils.errorToast(error))
          })
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Get models: Error')
        console.error(error)
        this.setState({
          loading: false
        }, () => {
          console.log('Get models: State')
          console.log(this.state)
          this.props.onAddToast(utils.errorToast(error))
        })
      })
  }

  onSubmitResolution(request) {
    console.debug('Submit resolution: Start')
    console.debug(request)
    const resolution = this.state.resolution
    resolution.lastAttempt = {
      request: request,
      response: {}
    }
    this.setState({
      loading: true,
      resolution: resolution
    }, () => {
      console.debug('Submit resolution: State')
      console.debug(this.state)
    })
    const path = '/_zentity/resolution/' + request.entity_type
    client.post(path, request)
      .then((response) => {

        // Request successful
        const resolution = this.state.resolution
        try {
          console.debug('Submit resolution: Success')
          console.debug(response)
          resolution.lastSuccess.request = request
          resolution.lastSuccess.requestString = JSON.stringify(request.data, null, 2)
          resolution.lastSuccess.response = {
            body: response.data
          }
          resolution.lastSuccess.responseString = JSON.stringify(response.data, null, 2)
          resolution.lastAttempt.response = {
            body: response.data
          }
          this.setState({
            loading: false,
            resolution: resolution
          }, () => {
            console.debug('Submit resolution: State')
            console.debug(this.state)
          })

        // Response handling failed
        } catch (error) {
          console.warn('Submit resolution: Failure')
          console.error(error)
          resolution.lastAttempt.response = {
            body: error.response.data
          }
          this.setState({
            loading: false,
            resolution: resolution
          }, () => {
            console.log('Submit resolution: State')
            console.log(this.state)
            this.props.onAddToast(utils.errorToast(error))
          })
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Submit resolution: Failure')
        console.error(error)
        this.setState({
          loading: false
        }, () => {
          console.log('Submit resolution: State')
          console.log(this.state)
          this.props.onAddToast(utils.errorToast(error))
        })
      })
  }

  onGetResolution() {
    return this.state.resolution
  }

  onChangeTab(id) {
    this.setState({
      tab: id,
    })
  }

  everSearched = () => {
    return Object.keys(this.state.resolution.lastAttempt.request).length > 0
  }

  renderTabs() {
    return this.tabs.map((tab, idx) => (
      <EuiTab
        onClick={() => this.onChangeTab(tab.id)}
        isSelected={tab.id === this.state.tab}
        key={idx}>
        {tab.name}
      </EuiTab>
    ))
  }

  getHits() {
    return this
  }

  render() {
    return (
      <EuiPage className='zentity-explore'>
        <EuiPageBody>

          <EuiTitle size='l'>
            <h1>Explore</h1>
          </EuiTitle>

          <EuiSpacer size='m'/>

          <ExploreSearch
            loading={this.state.loading}
            models={this.state.models}
            onAddToast={this.props.onAddToast}
            onGetResolution={this.onGetResolution}
            onSubmitResolution={this.onSubmitResolution}
            />

          <EuiSpacer/>

          <EuiFlexGroup>

            <EuiFlexItem className='zentity-explore' grow={10}>

              {!this.everSearched() &&
                <EuiFlexGroup>

                  <EuiFlexItem grow={2}>
                    {/* Spacer */}
                  </EuiFlexItem>

                  <EuiFlexItem grow={6}>

                    <EuiSpacer size='xxl'/>
                    <EuiIcon type='training' size='xxl'/>
                    <EuiSpacer size='xxl'/>

                    <EuiText textAlign='left'><h2>Getting started</h2></EuiText>

                    <EuiSpacer size='m'/>

                    <EuiText textAlign='left'>
                      <>
                        <p>
                          <ol>
                            <li>Select an <b>entity type</b>.</li>
                            <li>Enter <b>search terms</b> for your known entity.</li>
                            <li>Click <b>Resolve</b> to find matches for your entity.</li>
                          </ol>
                        </p>

                        <EuiSpacer size='m'/>

                        <EuiTitle>
                          <EuiText textAlign='left'>
                            <h2>Search syntax</h2>
                          </EuiText>
                        </EuiTitle>

                        <EuiSpacer size='m'/>

                        <EuiDescriptionList
                          type='responsiveColumn'
                          titleProps={{
                            style: { width: '20%' }
                          }}
                          descriptionProps={{
                            style: { width: '80%' }
                          }}
                          style={{ maxWidth: '840px' }}
                          listItems={[
                            {
                              title: (<>
                                <EuiTitle>
                                  <EuiText color='subdued'>
                                    Free text
                                  </EuiText>
                                </EuiTitle>
                                <EuiSpacer size='s'/>
                              </>),
                              description: (<>
                                <EuiTextColor color='accent'><code>Allie Jones 202-555-1234 "123 Main St"</code></EuiTextColor>
                                <br/>
                                <EuiTextColor color='muted'>
                                  <small>Terms are separated by spaces unless surrounded by double quotes: <EuiTextColor color='accent'><code>"</code></EuiTextColor></small>
                                </EuiTextColor>
                                <EuiSpacer size='s'/>
                              </>)
                            },
                            {
                              title: (<>
                                <EuiTitle>
                                  <EuiText color='subdued'>
                                    Structured
                                  </EuiText>
                                </EuiTitle>
                                <EuiSpacer size='s'/>
                              </>),
                              description: (<>
                                <code>
                                  <EuiTextColor color='subdued'>
                                    <EuiTextColor color='secondary'>first_name</EuiTextColor>:<EuiTextColor color='accent'>Allie</EuiTextColor>&nbsp;
                                    <EuiTextColor color='secondary'>last_name</EuiTextColor>:<EuiTextColor color='accent'>Jones</EuiTextColor>&nbsp;
                                    <EuiTextColor color='secondary'>phone</EuiTextColor>:<EuiTextColor color='accent'>202-555-1234</EuiTextColor>&nbsp;
                                    <EuiTextColor color='secondary'>street</EuiTextColor>:<EuiTextColor color='accent'>"123 Main St"</EuiTextColor>
                                  </EuiTextColor>
                                </code>
                                <br/>
                                <EuiTextColor color='muted'>
                                  <><small>Attribute names and values are separated by a colon: <EuiTextColor color='accent'><code>:</code></EuiTextColor></small></>
                                </EuiTextColor>
                                <EuiSpacer size='s'/>
                              </>)
                            },
                            {
                              title: (<>
                                <EuiTitle>
                                  <EuiText color='subdued'>
                                    Mixed
                                  </EuiText>
                                </EuiTitle>
                                <EuiSpacer size='s'/>
                              </>),
                              description: (
                                <>
                                  <code>
                                    <EuiTextColor color='subdued'>
                                      <EuiTextColor color='secondary'>first_name</EuiTextColor>:<EuiTextColor color='accent'>Allie</EuiTextColor>&nbsp;
                                      <EuiTextColor color='secondary'>last_name</EuiTextColor>:<EuiTextColor color='accent'>Jones</EuiTextColor>&nbsp;
                                      <EuiTextColor color='accent'>202-555-1234 "123 Main St"</EuiTextColor>
                                    </EuiTextColor>
                                  </code>
                                  <br/>
                                  <EuiTextColor color='muted'>
                                    <small>You can combine free text search and structured search.</small>
                                  </EuiTextColor>
                                  <EuiSpacer size='s'/>
                                </>
                              )
                            },
                          ]}
                        />
                      </>
                    </EuiText>

                  </EuiFlexItem>

                  <EuiFlexItem grow={2}>
                    {/* Spacer */}
                  </EuiFlexItem>

                </EuiFlexGroup>
              }

              {this.everSearched() &&
                <>
                <EuiTabs>
                  {this.renderTabs()}
                </EuiTabs>

                <EuiSpacer/>
                </>
              }

              {this.everSearched() && this.state.tab === 'summary' && this.state.resolution.lastSuccess.response.body &&
                <ExploreSummary
                  documents={this.state.resolution.lastSuccess.response.body.hits.hits}
                />
              }

              {this.everSearched() && this.state.tab === 'documents' && this.state.resolution.lastSuccess.response.body &&
                <ExploreDocumentsTable
                  documents={this.state.resolution.lastSuccess.response.body.hits.hits}
                />
              }

              {this.everSearched() && this.state.tab === 'explanation' && this.state.resolution.lastSuccess.response.body &&
                <ExploreExplanation
                  documents={this.state.resolution.lastSuccess.response.body.hits.hits}
                  request={this.state.resolution.lastSuccess.request}
                />
              }

              {this.everSearched() && this.state.tab === 'request' && this.state.resolution.lastSuccess.request.data &&
                <EuiPanel>
                  <CodeEditor
                    isReadOnly={true}
                    value={this.state.resolution.lastSuccess.requestString}
                  />
                </EuiPanel>
              }

              {this.everSearched() && this.state.tab === 'response' && this.state.resolution.lastSuccess.response.body &&
                <EuiPanel>
                  <CodeEditor
                    isReadOnly={true}
                    value={this.state.resolution.lastSuccess.responseString}
                  />
                </EuiPanel>
              }

            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageBody>
      </EuiPage>
    )
  }
}
