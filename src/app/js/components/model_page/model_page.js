import React from 'react'

import { cloneDeep, get } from 'lodash'
import { addedDiff, deletedDiff, updatedDiff } from 'deep-object-diff'

import {
  EuiButton,
  EuiCode,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingContent,
  EuiPage,
  EuiPageBody,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle
} from '@elastic/eui'

// App components
import { ModelSection } from '../model_section'

const client = require('../../client')
const utils = require('../../utils')

export class ModelPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      everLoaded: false,
      loading: false,
      modalReload: null,
      modalSave: null,
      model: {}, // Entity model as retrieved from zentity
      modelCopy: {}, // Entity model as modified by user in zentity-ui (unsaved)
      modelDiff: { // Track changes between model and modelCopy
        added: {},
        deleted: {},
        updated: {}
      },
      modelId: get(props, 'match.params.model_id') || null,
      saving: false,
      tab: get(props, 'match.params.tab') || 'attributes'
    }

    this.tabs = [
      {
        id: 'attributes',
        name: 'Attributes'
      },
      {
        id: 'resolvers',
        name: 'Resolvers'
      },
      {
        id: 'matchers',
        name: 'Matchers'
      },
      {
        id: 'indices',
        name: 'Indices'
      }
    ]

    this.getModel = this.getModel.bind(this)
    this.madeLocalChanges = this.madeLocalChanges.bind(this)
    this.modelDiff = this.modelDiff.bind(this)
    this.onChangeModelCopy = this.onChangeModelCopy.bind(this)
    this.onChangeTab = this.onChangeTab.bind(this)
    this.onInvalidModelCopy = this.onInvalidModelCopy.bind(this)
    this.onSubmitReload = this.onSubmitReload.bind(this)
    this.onSubmitSave = this.onSubmitSave.bind(this)

    // Modal functions
    this.onCloseModalReload = this.onCloseModalReload.bind(this)
    this.onCloseModalSave = this.onCloseModalSave.bind(this)
    this.onShowModalReload = this.onShowModalReload.bind(this)
    this.onShowModalSave = this.onShowModalSave.bind(this)
  }

  componentDidMount() {
    console.debug('componentDidMount()')
    this.getModel()
  }

  componentDidUpdate(prevProps) {
    const newState = {}

    // Update state based on any changes to the URL
    if (get(this.props, 'match.params.model_id') !== get(prevProps, 'match.params.model_id'))
      newState.modelId = get(this.props, 'match.params.model_id') || null
    if (get(this.props, 'match.params.tab') !== get(prevProps, 'match.params.tab'))
      newState.tab = get(this.props, 'match.params.tab') || 'attributes'
    if (Object.keys(newState).length > 0)
      this.setState(newState, () => {
        console.debug(this.state)
      })
  }

  onShowModalReload() {
    console.debug('onShowModalReload()')
    this.setState({ modalReload: true }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onCloseModalReload() {
    console.debug('onCloseModalReload()')
    this.setState({ modalReload: null }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onShowModalSave() {
    console.debug('onShowModalSave()')
    this.setState({ modalSave: true }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onCloseModalSave() {
    console.debug('onCloseModalSave()')
    this.setState({ modalSave: null }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  modelDiff(model, modelCopy) {
    console.debug('modelDiff()')
    const modelDiff = {
      added: addedDiff(model, modelCopy),
      deleted: deletedDiff(model, modelCopy),
      updated: updatedDiff(model, modelCopy)
    }
    return modelDiff
  }

  onChangeModelCopy(newModelCopy, onSuccess) {
    console.debug('onChangeModelCopy()')
    console.debug(cloneDeep(newModelCopy))
    this.setState({
      modelCopy: newModelCopy,
      modelDiff: this.modelDiff(this.state.model, newModelCopy)
    }, () => {
      if (onSuccess)
        onSuccess()
    })
  }

  onInvalidModelCopy() {
    console.debug('onInvalidModelCopy()')
    this.setState({
      modelCopy: this.state.model
    }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onChangeTab(tabId) {
    console.debug('onChangeTab()')
    window.location.hash = '/models/' + this.state.modelId + '/' + tabId
  }

  onSubmitReload() {
    console.debug('onSubmitReload()')
    this.madeLocalChanges() ? this.onShowModalReload() : this.getModel()
  }

  onSubmitSave() {
    console.debug('onSubmitSave()')
    this.saveModel()
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

  getModel() {
    console.debug('Get model: Started')

    // Set loading state
    this.setState({
      loading: true
    }, () => {
      console.debug('Get model: State')
      console.debug(cloneDeep(this.state))
    })

    // Get model
    client.get('/_zentity/models/' + this.state.modelId)
      .then((response) => {

        // Request successful
        try {
          if (response.data.found === true) {
            console.debug('Get model: Success')
            console.debug(response)

            // Set model
            const model = cloneDeep(response.data._source)
            const modelCopy = cloneDeep(model)
            this.setState({
              everLoaded: true,
              loading: false,
              modalReload: null,
              model: model || {},
              modelCopy: modelCopy || {},
              modelDiff: {
                added: {},
                deleted: {},
                updated: {}
              }
            }, () => {
              console.debug('Get model: State')
              console.debug(cloneDeep(this.state))
            })

          // Request failure
          } else {
            console.warn('Get model: Error')
            console.error(response)
            this.setState({
              everLoaded: true,
              loading: false,
              modalReload: null
            }, () => {
              console.log('Get model: State')
              console.log(cloneDeep(this.state))
              this.props.onAddToast({
                title: 'Error',
                text: (
                  <p>
                    Entity model <EuiCode>{this.state.modelId}</EuiCode> not found.
                  </p>
                )
              })
            })
          }

        // Response handling failed
        } catch (error) {
          console.warn('Get model: Failure')
          console.error(error)
          this.setState({
            everLoaded: true,
            loading: false,
            modalReload: null
          }, () => {
            console.log('Get model: State')
            console.log(cloneDeep(this.state))
            this.props.onAddToast(utils.errorToast(error))
          })
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Get model: Error')
        console.error(error)
        this.setState({
          everLoaded: true,
          loading: false,
          modalReload: null
        }, () => {
          console.log('Get model: State')
          console.log(cloneDeep(this.state))
          this.props.onAddToast(utils.errorToast(error))
        })
      })
  }

  saveModel() {
    console.debug('Save model: Started')

    // Set loading state
    this.setState({
      saving: true
    }, () => {
      console.debug('Save model: State')
      console.debug(cloneDeep(this.state))
    })

    // Save models
    client.put('/_zentity/models/' + this.state.modelId, { data: this.state.modelCopy })
      .then((response) => {

        // Request successful
        try {
          if (response.data.result === 'updated') {
            console.debug('Save model: Success')
            console.debug(response)

            // Set model
            const model = this.state.modelCopy
            const modelCopy = cloneDeep(model)
            this.setState({
              modalSave: null,
              model: model,
              modelCopy: modelCopy || {},
              modelDiff: {
                added: {},
                deleted: {},
                updated: {}
              },
              saving: false
            }, () => {
              console.debug('Save model: State')
              console.debug(cloneDeep(this.state))
            })
            this.props.onAddToast({
              title: 'Saved model',
              color: 'success',
              iconType: 'check',
              text: (<EuiCode>{this.state.modelId}</EuiCode>)
            })

          // Request failure
          } else {
            console.warn('Save model: Error')
            console.error(response)
            this.setState({
              modalSave: null,
              saving: false
            }, () => {
              console.log('Save model: State')
              console.log(cloneDeep(this.state))
              this.props.onAddToast({
                title: 'Error',
                text: (
                  <p>
                    {JSON.stringify(response.data)}
                  </p>
                )
              })
            })
          }

        // Response handling failed
        } catch (error) {
          console.warn('Save model: Failure')
          console.error(error)
          this.setState({
            modalSave: null,
            saving: false
          }, () => {
            console.log('Save model: State')
            console.log(cloneDeep(this.state))
            this.props.onAddToast(utils.errorToast(error))
          })
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Save model: Error')
        console.error(error)
        this.setState({
          modalSave: null,
          saving: false
        }, () => {
          console.log('Save model: State')
          console.log(cloneDeep(this.state))
          this.props.onAddToast(utils.errorToast(error))
        })
      })
  }

  madeLocalChanges() {
    const d = this.state.modelDiff
    return Object.keys(d.added).length + Object.keys(d.deleted).length + Object.keys(d.updated).length
  }

  render() {

    let modalReload
    if (this.state.modalReload) {
      modalReload = (
        <EuiConfirmModal
          title={<EuiTitle><h2>Reload Model</h2></EuiTitle>}
          onCancel={this.onCloseModalReload}
          onConfirm={this.getModel}
          cancelButtonText='Cancel'
          confirmButtonText='Reload'
          confirmButtonDisabled={this.state.loading}
          buttonColor='danger'
          defaultFocusedButton='cancel'
          isLoading={this.state.loading}>
          <EuiText>
            You have unsaved changes. Do you want to discard these changes and reload the entity model?
          </EuiText>
        </EuiConfirmModal>
      )
    }

    let modalSave
    if (this.state.modalSave) {
      modalReload = (
        <EuiConfirmModal
          title={<EuiTitle><h2>Save Model</h2></EuiTitle>}
          onCancel={this.onCloseModalSave}
          onConfirm={this.onSubmitSave}
          cancelButtonText='Cancel'
          confirmButtonText='Save'
          confirmButtonDisabled={this.state.saving}
          buttonColor='primary'
          defaultFocusedButton='cancel'
          isLoading={this.state.saving}>
          <EuiText>
            Save changes and overwrite existing entity model?
          </EuiText>
        </EuiConfirmModal>
      )
    }

    return (
      <EuiPage className='zentity-model'>
        <EuiPageBody>

          {/* Header */}
          <EuiTitle size='l'>
            <h1>{this.state.modelId}</h1>
          </EuiTitle>

          <EuiSpacer size='m'/>

          {/* Buttons */}
          <EuiFlexGroup responsive={false} gutterSize='s'>
            <EuiFlexItem grow={false}>
              <EuiButton
                type='submit'
                iconType={this.madeLocalChanges() ? 'check' : 'minusInCircle'}
                color='primary'
                fill={(!this.state.loading && this.madeLocalChanges()) ? true : false}
                isDisabled={this.state.loading || this.state.saving || !this.madeLocalChanges()}
                isLoading={this.state.saving}
                onClick={this.onShowModalSave}
              >
                Save
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                type='submit'
                iconType='refresh'
                color='primary'
                isDisabled={this.state.loading || this.state.saving}
                isLoading={this.state.loading}
                onClick={this.onSubmitReload}
              >
                Reload
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size='m'/>

          {/* Tabs */}
          <EuiTabs>
            {this.renderTabs()}
          </EuiTabs>

          <EuiSpacer/>

          {/* Editor */}
          <EuiPanel>
            { !this.state.everLoaded && this.state.loading &&
              <>
              <EuiLoadingContent lines={2} />
              <EuiSpacer />
              <EuiLoadingContent lines={6} />
              </>
            }
            { this.state.everLoaded &&
            <ModelSection
              {...this.props}
              loading={this.state.loading}
              saving={this.state.saving}
              section={this.state.tab}
              model={this.state.model}
              modelCopy={this.state.modelCopy}
              modelDiff={this.state.modelDiff}
              modelId={this.state.modelId}
              onChangeModelCopy={this.onChangeModelCopy}
              onChangeTab={this.onChangeTab}
            />
            }
          </EuiPanel>

        </EuiPageBody>

        {modalReload}
        {modalSave}

      </EuiPage>
    )
  }
}
