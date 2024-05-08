import React from 'react'
import { Link } from 'react-router-dom'

import { cloneDeep } from 'lodash'

import {
  EuiButton,
  EuiCode,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiInMemoryTable,
  EuiLoadingContent,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui'

const client = require('../../client')
const utils = require('../../utils')

export class ModelsTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      modalClone: null,
      modalCloneName: '',
      modalCreate: null,
      modalCreateName: '',
      modalDelete: null,
      models: null,
      selections: [],
    }

    this.getModels = this.getModels.bind(this)
    this.onChangeModalCloneName = this.onChangeModalCloneName.bind(this)
    this.onChangeModalCreateName = this.onChangeModalCreateName.bind(this)
    this.onClickActionClone = this.onClickActionClone.bind(this)
    this.onClickActionCreate = this.onClickActionCreate.bind(this)
    this.onClickActionEdit = this.onClickActionEdit.bind(this)
    this.onClickActionExport = this.onClickActionExport.bind(this)
    this.onClickActionDelete = this.onClickActionDelete.bind(this)
    this.onCloseModalClone = this.onCloseModalClone.bind(this)
    this.onCloseModalCreate = this.onCloseModalCreate.bind(this)
    this.onCloseModalDelete = this.onCloseModalDelete.bind(this)
    this.onShowModalClone = this.onShowModalClone.bind(this)
    this.onShowModalCreate = this.onShowModalCreate.bind(this)
    this.onShowModalDelete = this.onShowModalDelete.bind(this)
    this.onSubmitClone = this.onSubmitClone.bind(this)
    this.onSubmitCreate = this.onSubmitCreate.bind(this)
    this.onSubmitDelete = this.onSubmitDelete.bind(this)
    this.onSubmitDeleteMany = this.onSubmitDeleteMany.bind(this)
    this.everSearched = this.everSearched.bind(this)
  }

  componentDidMount() {
    this.getModels()
  }

  getModels() {
    console.debug('Get models: Started')

    // Set loading state
    this.setState(
      {
        loading: true,
      },
      () => {
        console.debug('Get models: State')
        console.debug(this.state)
      }
    )

    // Get models
    client
      .get('/_zentity/models')
      .then((response) => {
        // Success
        try {
          console.debug('Get models: Success')
          console.debug(response)
          this.setState(
            {
              loading: false,
              models: response.data.hits.hits,
            },
            () => {
              console.debug('Get models: State')
              console.debug(this.state)
            }
          )
        } catch (error) {
          console.warn('Get models: Failure')
          console.error(error)
          this.setState(
            {
              loading: false,
            },
            () => {
              console.log('Get models: State')
              console.log(this.state)

              // Notify user
              this.props.onAddToast(utils.errorToast(error))
            }
          )
        }
      })
      .catch((error) => {
        // Error
        console.warn('Get models: Error')
        console.error(error)
        this.setState(
          {
            loading: false,
          },
          () => {
            console.log('Get models: State')
            console.log(this.state)

            // Notify user
            this.props.onAddToast(utils.errorToast(error))
          }
        )
      })
  }

  onChangeModalCloneName(name) {
    this.setState({ modalCloneName: name })
  }

  onChangeModalCreateName(name) {
    this.setState({ modalCreateName: name })
  }

  onCloseModalCreate() {
    this.setState({ modalCreate: null, modalCreateName: '' })
  }

  onCloseModalClone() {
    this.setState({ modalClone: null, modalCloneName: '' })
  }

  onCloseModalDelete() {
    this.setState({ modalDelete: null })
  }

  onShowModalClone(model) {
    this.setState({ modalClone: model })
  }

  onShowModalCreate() {
    this.setState({ modalCreate: true })
  }

  onShowModalDelete(models) {
    this.setState({ modalDelete: models })
  }

  onSubmitClone(model, clonedName) {
    console.debug('Clone model: Start')
    console.debug('...getting current model: ' + model._id)
    client
      .get('/_zentity/models/' + model._id)
      .then((response) => {
        try {
          // Request successful
          if (response.data.found === true) {
            console.debug('...creating clone model: ' + clonedName)
            const clonedModel = response.data._source
            client
              .post('/_zentity/models/' + clonedName, { data: clonedModel })
              .then((response2) => {
                try {
                  // Request successful
                  if (response2.data.result === 'created') {
                    console.debug('Clone model: Success')
                    console.debug(response2)

                    // Add cloned model to view
                    const models = []
                    const clonedModel = cloneDeep(model)
                    clonedModel._id = clonedName
                    models.push(clonedModel)
                    for (var m in this.state.models) {
                      models.push(this.state.models[m])
                    }
                    this.setState(
                      {
                        loading: false,
                        modalClone: null,
                        modalCloneName: '',
                        models: models,
                      },
                      () => {
                        console.debug('Clone model: State')
                        console.debug(this.state)

                        // Notify the user
                        this.props.onAddToast({
                          title: 'Cloned model',
                          color: 'success',
                          iconType: 'check',
                          text: <EuiCode>{clonedName}</EuiCode>,
                        })
                      }
                    )

                    // Request failure
                  } else {
                    console.warn('Clone model: Error')
                    console.error(response2)
                    this.setState(
                      {
                        loading: false,
                      },
                      () => {
                        console.log('Clone model: State')
                        console.log(this.state)

                        // Notify the user
                        this.props.onAddToast({
                          title: 'Error',
                          text: <p>{response2.data.result}</p>,
                        })
                      }
                    )
                  }

                  // Response handling failed
                } catch (error) {
                  console.warn('Clone model: Error')
                  console.error(error)
                  this.setState(
                    {
                      loading: false,
                    },
                    () => {
                      console.log('Clone model: State')
                      console.log(this.state)

                      // Notify the user
                      this.props.onAddToast(utils.errorToast(error))
                    }
                  )
                }
              })

              // Request failed
              .catch((error) => {
                console.warn('Clone model: Error')
                console.error(error)
                this.setState(
                  {
                    loading: false,
                  },
                  () => {
                    console.log('Clone model: State')
                    console.log(this.state)

                    // Notify the user
                    this.props.onAddToast(utils.errorToast(error))
                  }
                )
              })

            // Request failure
          } else {
            console.warn('Clone model: Error')
            console.error(response)
            this.setState(
              {
                loading: false,
              },
              () => {
                console.log('Clone model: State')
                console.log(this.state)

                // Notify the user
                this.props.onAddToast({
                  title: 'Error',
                  text: <p>{response.data.result}</p>,
                })
              }
            )
          }

          // Response handling failed
        } catch (error) {
          console.warn('Clone model: Error')
          console.error(error)
          this.setState(
            {
              loading: false,
            },
            () => {
              console.log('Clone model: State')
              console.log(this.state)

              // Notify the user
              this.props.onAddToast(utils.errorToast(error))
            }
          )
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Clone model: Error')
        console.error(error)
        this.setState(
          {
            loading: false,
          },
          () => {
            console.log('Clone model: State')
            console.log(this.state)

            // Notify the user
            this.props.onAddToast(utils.errorToast(error))
          }
        )
      })
  }

  onSubmitCreate(name) {
    console.debug('Create model: Started')

    // Set loading state
    this.setState(
      {
        loading: true,
      },
      () => {
        console.debug('Create model: State')
        console.debug(cloneDeep(this.state))
      }
    )

    // Save new, empty model
    const model = {
      attributes: {},
      resolvers: {},
      matchers: {},
      indices: {},
    }
    client
      .put('/_zentity/models/' + name, { data: model })
      .then((response) => {
        // Request successful
        try {
          if (response.data.result === 'created') {
            console.debug('Create model: Success')
            console.debug(response)

            // Set model
            const model = this.state.modelCopy
            const modelCopy = cloneDeep(model)
            this.setState(
              {
                modalCreate: null,
                modalCreateName: '',
                loading: false,
              },
              () => {
                console.debug('Create model: State')
                console.debug(cloneDeep(this.state))

                // Notify the user
                this.props.onAddToast({
                  title: 'Create model',
                  color: 'success',
                  iconType: 'check',
                  text: <EuiCode>{name}</EuiCode>,
                })

                // Select the newly renamed object from the table.
                this.onClickActionEdit({ _id: name }, () => {
                  console.debug(cloneDeep(this.state))
                })
              }
            )

            // Request failure
          } else {
            console.warn('Create model: Error')
            console.error(response)
            this.setState(
              {
                modalCreate: null,
                modalCreateName: '',
                loading: false,
              },
              () => {
                console.log('Create model: State')
                console.log(cloneDeep(this.state))

                // Notify the user
                this.props.onAddToast({
                  title: 'Error',
                  text: <p>{JSON.stringify(response.data)}</p>,
                })
              }
            )
          }

          // Response handling failed
        } catch (error) {
          console.warn('Create model: Failure')
          console.error(error)
          this.setState(
            {
              modalCreate: null,
              modalCreateName: '',
              loading: false,
            },
            () => {
              console.log('Create model: State')
              console.log(cloneDeep(this.state))

              // Notify the user
              this.props.onAddToast(utils.errorToast(error))
            }
          )
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Create model: Error')
        console.error(error)
        this.setState(
          {
            modalCreate: null,
            modalCreateName: '',
            loading: false,
          },
          () => {
            console.log('Create model: State')
            console.log(cloneDeep(this.state))

            // Notify the user
            this.props.onAddToast(utils.errorToast(error))
          }
        )
      })
  }

  onSubmitDeleteMany(models) {
    console.debug('Delete models: Start')

    // Create bulk payload
    const items = []
    for (var i in this.state.selections) {
      const model = this.state.selections[i]
      const action = JSON.stringify({ delete: { entity_type: model._id } })
      const payload = '{}'
      items.push(action)
      items.push(payload)
    }
    const ndjson = items.join('\n')
    const opts = {
      data: ndjson,
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
    }

    client
      .post('/_zentity/models/_bulk', opts)
      .then((response) => {
        try {
          const itemsSuccess = []
          const itemsFailure = []
          var numItems = 0
          var numSuccess = 0
          var numFailure = 0

          // Gather deleted items
          const deleted = {}
          for (var i in response.data.items) {
            const item = response.data.items[i]
            const _id = this.state.selections[i]._id
            if (item.delete) {
              if (!item.delete.error) {
                deleted[_id] = true
                itemsSuccess.push(
                  <div key={_id}>
                    <EuiCode>{_id}</EuiCode>
                  </div>
                )
                numSuccess++
              } else {
                itemsFailure.push(
                  <div key={_id}>
                    <EuiCode>{_id}</EuiCode>
                  </div>
                )
                numFailure++
              }
            }
            numItems++
          }

          // Request successful
          if (numSuccess > 0) {
            if (numFailure > 0) console.debug('Delete models: Partial success')
            else console.debug('Delete models: Success')
            console.debug(response)

            // Remove deleted models from view
            const models = []
            for (var m in this.state.models) {
              if (deleted[this.state.models[m]._id]) continue
              models.push(this.state.models[m])
            }
            this.setState(
              {
                loading: false,
                modalDelete: null,
                models: models,
              },
              () => {
                console.debug('Delete models: State')
                console.debug(this.state)

                // Notify the user
                if (numFailure === 0) {
                  this.props.onAddToast({
                    title: 'Deleted ' + numSuccess + ' models',
                    color: 'success',
                    iconType: 'check',
                    text: itemsSuccess,
                  })
                } else if (numSuccess > 0) {
                  this.props.onAddToast({
                    title: 'Deleted ' + numSuccess + ' of ' + numItems + ' models',
                    color: 'warning',
                    iconType: 'alert',
                    text: (
                      <div>
                        <div>
                          <b>Success</b>
                        </div>
                        <div>{itemsSuccess}</div>
                        <EuiSpacer size="m" />
                        <div>
                          <b>Failure</b>
                        </div>
                        <div>{itemsFailure}</div>
                      </div>
                    ),
                  })
                } else {
                  this.props.onAddToast({
                    title: 'Failed to delete models',
                    color: 'danger',
                    iconType: 'alert',
                    text: itemsFailure,
                  })
                }
              }
            )

            // Request failure
          } else {
            console.warn('Delete models: Error')
            console.error(response)
            this.setState(
              {
                loading: false,
              },
              () => {
                console.log('Delete models: State')
                console.log(this.state)

                // Notify the user
                this.props.onAddToast({
                  title: 'Failed to delete models',
                  color: 'danger',
                  iconType: 'alert',
                  text: itemsFailure,
                })
              }
            )
          }

          // Response handling failed
        } catch (error) {
          console.warn('Delete models: Error')
          console.error(error)
          this.setState(
            {
              loading: false,
            },
            () => {
              console.log('Delete models: State')
              console.log(this.state)

              // Notify the user
              this.props.onAddToast(utils.errorToast(error))
            }
          )
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Delete models: Error')
        console.error(error)
        this.setState(
          {
            loading: false,
          },
          () => {
            console.log('Delete models: State')
            console.log(this.state)

            // Notify the user
            this.props.onAddToast(utils.errorToast(error))
          }
        )
      })
  }

  onSubmitDelete(model) {
    console.debug('Delete model: Start')
    client
      .del('/_zentity/models/' + model._id)
      .then((response) => {
        try {
          // Request successful
          if (response.data.result === 'deleted') {
            console.debug('Delete model: Success')
            console.debug(response)

            // Remove deleted model from view
            const models = []
            for (var m in this.state.models) {
              if (this.state.models[m]._id === model._id) continue
              models.push(this.state.models[m])
            }
            this.setState(
              {
                loading: false,
                modalDelete: null,
                models: models,
              },
              () => {
                console.debug('Delete model: State')
                console.debug(this.state)

                // Notify the user
                this.props.onAddToast({
                  title: 'Deleted model',
                  color: 'success',
                  iconType: 'check',
                  text: <EuiCode>{model._id}</EuiCode>,
                })
              }
            )

            // Request failure
          } else {
            console.warn('Delete model: Error')
            console.error(response)
            this.setState(
              {
                loading: false,
              },
              () => {
                console.log('Delete model: State')
                console.log(this.state)

                // Notify the user
                this.props.onAddToast({
                  title: 'Error',
                  text: <p>{response.data.result}</p>,
                })
              }
            )
          }

          // Response handling failed
        } catch (error) {
          console.warn('Delete model: Error')
          console.error(error)
          this.setState(
            {
              loading: false,
            },
            () => {
              console.log('Delete model: State')
              console.log(this.state)

              // Notify the user
              this.props.onAddToast(utils.errorToast(error))
            }
          )
        }
      })

      // Request failed
      .catch((error) => {
        console.warn('Delete model: Error')
        console.error(error)
        this.setState(
          {
            loading: false,
          },
          () => {
            console.log('Delete model: State')
            console.log(this.state)

            // Notify the user
            this.props.onAddToast(utils.errorToast(error))
          }
        )
      })
  }

  //onClickActionResolve = model => {/* TODO */}

  onClickActionEdit(model) {
    window.location.hash = '/models/' + model._id
  }

  onClickActionCreate() {
    this.onShowModalCreate()
  }

  onClickActionClone(model) {
    this.onShowModalClone(model)
  }

  onClickActionDelete(models) {
    this.onShowModalDelete(models)
  }

  onClickActionExport(selections) {
    const items = []
    for (var i in selections) {
      const model = selections[i]
      const action = JSON.stringify({ create: { entity_type: model._id } })
      const payload = JSON.stringify(model._source)
      items.push(action)
      items.push(payload)
    }
    const ndjson = items.join('\n')
    const data = new Blob([ndjson], { type: 'application/ndjson' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(data)
    link.setAttribute('download', `zentity-models.ndjson`)
    link.click()
    link.remove()
  }

  everSearched() {
    return Array.isArray(this.state.models)
  }

  render() {
    let modalCreate
    if (this.state.modalCreate) {
      modalCreate = (
        <EuiConfirmModal
          title={
            <EuiTitle>
              <h2>Create Model</h2>
            </EuiTitle>
          }
          onCancel={this.onCloseModalCreate}
          onConfirm={() => this.onSubmitCreate(this.state.modalCreateName)}
          cancelButtonText="Cancel"
          confirmButtonText="Create"
          confirmButtonDisabled={this.state.modalCreateName === ''}
          buttonColor="primary"
          initialFocus="[name=modal-create-name]"
        >
          <EuiFormRow label="Name of entity model">
            <EuiFieldText
              value={this.state.modalCreateName}
              placeholder="Entity type name..."
              onChange={(e) => this.onChangeModalCreateName(e.currentTarget.value)}
              name="modal-create-name"
            />
          </EuiFormRow>
        </EuiConfirmModal>
      )
    }

    let modalClone
    if (this.state.modalClone) {
      modalClone = (
        <EuiConfirmModal
          title={
            <EuiTitle>
              <h2>Clone Model</h2>
            </EuiTitle>
          }
          onCancel={this.onCloseModalClone}
          onConfirm={() => this.onSubmitClone(this.state.modalClone, this.state.modalCloneName)}
          cancelButtonText="Cancel"
          confirmButtonText="Clone"
          confirmButtonDisabled={this.state.modalCloneName === ''}
          buttonColor="primary"
          initialFocus="[name=modal-clone-name]"
        >
          <EuiFormRow>
            <EuiCode>{this.state.modalClone._id}</EuiCode>
          </EuiFormRow>
          <EuiFormRow label="Name of cloned model">
            <EuiFieldText
              value={this.state.modalCloneName}
              placeholder="Entity type name..."
              onChange={(e) => this.onChangeModalCloneName(e.currentTarget.value)}
              name="modal-clone-name"
            />
          </EuiFormRow>
        </EuiConfirmModal>
      )
    }

    let modalDelete
    if (this.state.modalDelete) {
      const items = []
      for (var i in this.state.modalDelete)
        items.push(
          <div key={this.state.modalDelete[i]._id}>
            <EuiCode>{this.state.modalDelete[i]._id}</EuiCode>
          </div>
        )
      modalDelete = (
        <EuiConfirmModal
          title={
            <EuiTitle>
              <h2>Delete Model</h2>
            </EuiTitle>
          }
          onCancel={this.onCloseModalDelete}
          onConfirm={() =>
            items.length === 1
              ? this.onSubmitDelete(this.state.modalDelete[0])
              : this.onSubmitDeleteMany(this.state.modalDelete)
          }
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          {items}
        </EuiConfirmModal>
      )
    }

    const actions = [
      /*{
        name: 'Resolve',
        description: 'Resolve Entities',
        icon: 'inspect',
        type: 'icon',
        onClick: this.onClickActionResolve,
        isPrimary: true
      },*/
      {
        name: 'Edit',
        description: 'Edit model',
        icon: 'pencil',
        type: 'icon',
        onClick: this.onClickActionEdit,
        isPrimary: true,
      },
      {
        name: 'Clone',
        description: 'Clone model',
        icon: 'copy',
        type: 'icon',
        onClick: this.onClickActionClone,
      },
      {
        name: 'Delete',
        description: 'Delete model',
        icon: 'trash',
        type: 'icon',
        color: 'danger',
        onClick: (model) => this.onClickActionDelete([model]),
      },
      {
        name: 'Export',
        description: 'Export model',
        icon: 'download',
        type: 'icon',
        onClick: (model) => this.onClickActionExport([model]),
      },
    ]

    const columns = [
      {
        field: '_id',
        name: 'Entity type',
        sortable: true,
        truncateText: true,
        render: (_id) => (
          <Link to={{ pathname: `/models/${_id}` }}>
            <EuiText>{_id}</EuiText>
          </Link>
        ),
      },
      {
        name: 'Actions',
        actions,
      },
    ]

    const search = {
      box: {
        incremental: true,
        placeholder: 'Search...',
      },
      filters: [],
      props: {
        gutterSize: 'none',
      },
      toolsRight: (() => {
        return [
          <EuiButton
            key="delete"
            color="danger"
            disabled={!this.state.selections.length}
            iconType="trash"
            onClick={() => this.onShowModalDelete(this.state.selections)}
          >
            Delete
          </EuiButton>,
          <EuiButton
            key="export"
            color="primary"
            disabled={!this.state.selections.length}
            iconType="download"
            onClick={() => this.onClickActionExport(this.state.selections)}
          >
            Export
          </EuiButton>,
        ]
      })(),
    }

    const pagination = {
      initialPageSize: 10,
      pageSizeOptions: [10, 25, 50],
    }

    const sorting = {
      sort: {
        field: '_id',
        direction: 'asc',
      },
    }

    const selectionValue = {
      selectable: () => true,
      onSelectionChange: (selections) => {
        this.setState({
          selections: selections,
        })
      },
      initialSelected: [],
    }

    return (
      <>
        {this.state.loading && <EuiProgress size="xs" color="accent" position="fixed" />}

        {/* Buttons */}
        <EuiFlexGroup gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButton fill iconType="plusInCircle" onClick={this.onClickActionCreate} isDisabled={this.state.loading}>
              Create
            </EuiButton>
          </EuiFlexItem>
          {
            <EuiFlexItem grow={false}>
              <EuiButton iconType="download" onClick={this.getModels} isDisabled={this.state.loading}>
                Import
              </EuiButton>
            </EuiFlexItem>
          }
          <EuiFlexItem grow={false}>
            <EuiButton iconType="refresh" onClick={this.getModels} isDisabled={this.state.loading}>
              Refresh
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiPanel>
          {!this.everSearched() && this.state.loading && (
            <>
              <EuiLoadingContent lines={2} />
              <EuiSpacer />
              <EuiLoadingContent lines={6} />
            </>
          )}
          {this.everSearched() && this.state.models.length > 0 && (
            <EuiInMemoryTable
              columns={columns}
              error={this.state.error}
              hasActions={true}
              isSelectable={true}
              itemId="_id"
              items={this.state.models}
              loading={this.state.loading}
              message={
                <EuiEmptyPrompt
                  title={
                    <EuiTitle>
                      <h3>No Results</h3>
                    </EuiTitle>
                  }
                  titleSize="xs"
                  body="No models matched your query."
                  actions={
                    <EuiButton size="s" key="createModel" onClick={this.onClickActionCreate}>
                      Create Model
                    </EuiButton>
                  }
                />
              }
              pagination={pagination}
              search={search}
              selection={selectionValue}
              sorting={sorting}
            />
          )}
          {this.everSearched() && this.state.models.length === 0 && (
            <EuiEmptyPrompt
              title={<h3>No Models</h3>}
              titleSize="xs"
              body="Looks like you don't have any models. Let's create some!"
              actions={
                <EuiButton size="s" key="createModel" onClick={this.onClickActionCreate}>
                  Create Model
                </EuiButton>
              }
            />
          )}
        </EuiPanel>

        {modalCreate}
        {modalClone}
        {modalDelete}
      </>
    )
  }
}
