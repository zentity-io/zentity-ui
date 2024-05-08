import React from 'react'

import { cloneDeep, isEqual } from 'lodash'

import {
  EuiButton,
  EuiCode,
  EuiComboBox,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiInMemoryTable,
  EuiRange,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle
} from '@elastic/eui'

import { ModelFlyoutAbstract } from './model_flyout_abstract.js'
import { ModelValidations } from '../model_validations'

export class ModelFlyoutIndices extends ModelFlyoutAbstract {

  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
      modalCreate: null,
      modalEdit: null
    }
    this.section = 'indices'
    this.size = 'l'

    this.defaultIndexField = {
      attribute: null,
      matcher: null,
      quality: null
    }

    // Select the first attribute and matcher for the default index field.
    for (var attributeName in this.props.modelCopy.attributes) {
      this.defaultIndexField.attribute = attributeName
      break
    }
    for (var matcherName in this.props.modelCopy.matchers) {
      this.defaultIndexField.matcher = matcherName
      break
    }

    this.onApplyField = this.onApplyField.bind(this)
    this.onClickActionCreateField = this.onClickActionCreateField.bind(this)
    this.onClickActionEditField = this.onClickActionEditField.bind(this)
    this.onCloseModalEditField = this.onCloseModalEditField.bind(this)
  }

  /**
   * Apply changes from the index field editor to an index in the entity model.
   *
   * Updates the application state.
   *
   * @data  {object} dataNew - New data for the index field.
   * @param {string} name    - Name of the index field
   * @param {string} nameOld - Old name of the index field, if renaming it.
   */
  onApplyField(indexFieldNew, name, nameOld) {
    console.debug('onApplyField()')
    const data = cloneDeep(this.state.data)

    // Rename the index field.
    if (nameOld && name !== nameOld) {
      console.debug(`Renaming from ${nameOld} to ${name}`)
      delete data.fields[nameOld]
    }

    // Change the index field data.
    data.fields[name] = indexFieldNew

    // Apply the changes locally.
    this.setState({
      data: data
    }, () => {
      // Close the editor.
      this.onCloseModalEditField()
    })
  }

  onClickActionCreateField(e) {
    console.debug('onClickActionCreateField()')
    console.warn(e)
    this.setState({
      modalCreate: true
    })
  }

  onClickActionEditField(item) {
    console.debug('onClickActionEditField()')
    this.setState({
      modalEdit: item.name
    })
  }

  onCloseModalCreateField() {
    console.debug('onCloseModalCreateField()')
    this.setState({
      modalCreate: null
    })
  }

  onCloseModalEditField() {
    console.debug('onCloseModalEditField()')
    this.setState({
      modalCreate: null,
      modalEdit: null
    })
  }

  renderBody() {

    let modalEdit
    if (this.state.modalCreate || this.state.modalEdit) {
      modalEdit = (
        <ModalIndexFieldEditor
          name={this.state.modalEdit || ''}
          data={this.state.modalCreate ? this.defaultIndexField : this.state.data.fields[this.state.modalEdit]}
          indexData={this.state.data}
          indexName={this.props.name}
          modelCopy={this.props.modelCopy}
          onApply={this.onApplyField}
          onClose={this.onCloseModalEditField}
        />
      )
    }

    const items = []
    for (var indexFieldName in this.state.data.fields) {
      const item = cloneDeep(this.state.data.fields[indexFieldName])
      item.name = indexFieldName
      items.push(item)
    }

    const actions = [
      {
        name: 'Edit',
        description: 'Edit field',
        icon: 'pencil',
        isPrimary: true,
        type: 'icon',
        color: 'text',
        onClick: (item) => this.onClickActionEditField(item)
      },
      {
        name: 'Delete',
        description: 'Delete field',
        icon: 'trash',
        isPrimary: true,
        type: 'icon',
        color: 'danger',
        onClick: (item) => {
          const data = cloneDeep(this.state.data)
          delete data.fields[item.name]
          this.setState({ data: data })
        }
      }
    ]

    const columns = [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        truncateText: true,
        render: (name) => (
          <EuiText>{name}</EuiText>
        ),
        mobileOptions: {
          width: '100%'
        }
      },
      {
        field: 'attribute',
        name: 'Attribute',
        sortable: true,
        truncateText: true,
        render: (value, item) => (<EuiText>{value}</EuiText>)
      },
      {
        field: 'matcher',
        name: 'Matcher',
        sortable: true,
        truncateText: true,
        render: (value, item) => ( <EuiText>{value ? value : <EuiCode>null</EuiCode>}</EuiText>)
      },
      {
        field: 'quality',
        name: 'Quality',
        sortable: true,
        truncateText: true,
        render: (value, item) => (<EuiText>{value != null ? value.toFixed(4) : <EuiCode>null</EuiCode>}</EuiText>),
        mobileOptions: {
          width: '100%'
        }
      },
      {
        name: 'Actions',
        actions,
      }
    ]

    const createIndexFieldButton = (
      <EuiButton
        fill
        iconType='plusInCircle'
        isDisabled={this.props.loading}
        onClick={this.onClickActionCreateField}
        key='createObject'>
          Add Field
      </EuiButton>
    )

    const search = {
      box: {
        incremental: true,
        placeholder: 'Search...'
      },
      filters: [],
      toolsLeft: [
        createIndexFieldButton
      ]
    }

    const pagination = {
      initialPageSize: 10,
      pageSizeOptions: [10, 25, 50],
    }

    const sorting = {
      sort: {
        field: 'name',
        direction: 'asc'
      }
    }

    return (<>

      {/* Index fields */}
      <EuiTitle>
        <h4>Index Fields</h4>
      </EuiTitle>
      <EuiSpacer size='m' />

      <EuiInMemoryTable
        columns={columns}
        items={items}
        itemId='name'
        hasActions={true}
        loading={this.props.loading}
        message={(
          <EuiEmptyPrompt
            title={<EuiTitle><h3>No Results</h3></EuiTitle>}
            titleSize='xs'
            body='No fields matched your query.'
            actions={
              createIndexFieldButton
            }/>
        )}
        pagination={pagination}
        search={search}
        sorting={sorting}
        tableLayout='auto'
      />

      <EuiSpacer />

      { modalEdit }

    </>)
  }
}

class ModalIndexFieldEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: cloneDeep(this.props.data),
      indexData: this.props.indexData,
      indexName: this.props.indexName,
      modelCopy: cloneDeep(this.props.modelCopy),
      name: this.props.name,
      nameEdit: this.props.name,
      isNameDirty: false,     // Was this form field ever edited or blurred
      isAttributeDirty: false // Was this form field ever edited or blurred
    }

    // Validation checks to display.
    this.validations = [
      {
        check: (field, state, name) => state.isNameDirty && name.trim() === '',
        level: 'error',
        text: (<>Name is required.</>),
      },
      {
        check: (field, state, name) => {
          if (name === state.name)
            return false
          if (!!state.indexData.fields[name])
            return true
          return false
        },
        level: 'error',
        text: (<>This index field is already defined in the entity model.</>),
      },
      {
        check: (field, state) => state.isAttributeDirty && !field.attribute,
        level: 'error',
        text: (<>Attribute is required.</>),
      },
      {
        check: (field) => (field.quality == 0.0),
        level: 'warning',
        text: (<>A quality score of <b>0.0</b> will cause the attribute match score to always be <b>0.5</b>, which means this index field will have no effect on the final identity confidence score. Consider keeping every index field quality score above <b>0.0</b> to ensure that each match improves the overall score.</>),
      }
    ]

    this.isChanged = this.isChanged.bind(this)
    this.isInvalid = this.isInvalid.bind(this)
    this.isInvalidName = this.isInvalidName.bind(this)
    this.isInvalidAttribute = this.isInvalidAttribute.bind(this)
    this.onChangeNameEdit = this.onChangeNameEdit.bind(this)
  }

  onChangeNameEdit(value) {
    console.debug('onChangeNameEdit()')
    this.setState({
      nameEdit: value
    })
  }

  isInvalidName() {
    if (this.state.nameEdit.trim() === '')
      return true
    if (this.state.nameEdit === this.state.name)
      return false
    if (!!this.state.indexData.fields[this.state.nameEdit])
      return true
    return false
  }

  isInvalidAttribute() {
    return !this.state.data.attribute
  }

  isInvalid() {
    return this.isInvalidName() || this.isInvalidAttribute()
  }

  isChanged() {
    return this.state.nameEdit !== this.state.name || !isEqual(this.state.data, this.props.data)
  }

  render() {

    return (
      <EuiConfirmModal
        title={<EuiTitle><h2>Edit Field</h2></EuiTitle>}
        onCancel={this.props.onClose}
        onConfirm={() => this.props.onApply(this.state.data, this.state.nameEdit, this.state.name)}
        cancelButtonText='Cancel'
        confirmButtonText='Apply'
        confirmButtonDisabled={this.isInvalid() || !this.isChanged()}
        buttonColor='primary'
        initialFocus='[name=modal-edit-name]'
        style={{ width: '600px' }}>
        <>

        {/* Index Field Name */}
        <EuiTitle>
          <EuiText>Name</EuiText>
        </EuiTitle>
        <EuiSpacer size='xs' />
        <EuiFormRow fullWidth helpText={<>The name of the index field. Passed to the <EuiCode>{'{{'} field {'}}'}</EuiCode> variable of the matcher.</>}>
          <EuiFieldText
            fullWidth
            id={'edit-index-field-name-' + this.state.name}
            isInvalid={this.state.isNameDirty && this.isInvalidName()}
            name='modal-edit-name'
            onBlur={() => this.setState({ isNameDirty: true })}
            onChange={(e) => this.onChangeNameEdit(e.currentTarget.value)}
            placeholder='Name...'
            spellCheck='false'
            value={this.state.nameEdit}
          />
        </EuiFormRow>

        <EuiSpacer />

          {/* Attribute */}
          <EuiTitle>
            <EuiText>Attribute</EuiText>
          </EuiTitle>
          <EuiSpacer size='xs' />
          <EuiFormRow fullWidth helpText='The attribute of the entity model that this field represents.'>
            <EuiComboBox
              fullWidth
              id={'edit-index-field-attribute-' + this.state.name}
              isClearable={false}
              isInvalid={this.state.isAttributeDirty && this.isInvalidAttribute()}
              onBlur={() => this.setState({ isAttributeDirty: true })}
              onChange={(selections) => {
                const data = cloneDeep(this.state.data)
                const selection = selections[0]
                data.attribute = selection.label
                this.setState({ data: data })
              }}
              options={(() => {
                const options = []
                for (var attributeName in this.props.modelCopy.attributes)
                  options.push({
                    label: attributeName,
                    field: this.state.nameEdit
                  })
                return options
              })()}
              placeholder='Select attribute'
              selectedOptions={(() => {
                const options = []
                const attribute = this.state.data.attribute
                if (attribute)
                  options.push({
                    label: attribute
                  })
                return options
              })()}
              singleSelection={{ asPlainText: true }}
            />
          </EuiFormRow>

          <EuiSpacer />

          {/* Matcher */}
          <EuiFlexGroup gutterSize='s' responsive={false}>
            <EuiFlexItem grow={true}>
              <EuiTitle>
                <EuiText>Matcher</EuiText>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSwitch
                checked={this.state.data.matcher != null}
                onChange={(e) => {
                  const data = cloneDeep(this.state.data)
                  if (data.matcher == null) {
                    // Select first matcher from list
                    for (var matcherName in this.props.modelCopy.matchers) {
                      data.matcher = matcherName
                      break
                    }
                  } else {
                    // Nullify matcher
                    data.matcher = null
                  }
                  this.setState({
                    data: data
                  })
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size='xs' />
          <EuiFormRow fullWidth helpText='The matcher that will search this field.'>
            <>
            { this.state.data.matcher == null &&
              <EuiText color='subdued' size='xs'>
                (None selected. Click the toggle switch to enable.)
              </EuiText>
            }
            { this.state.data.matcher != null &&
            <EuiComboBox
              fullWidth
              helpText='The matcher to use to search this field.'
              id={'edit-index-field-matcher-' + this.state.name}
              isClearable={false}
              onChange={(selections) => {
                const data = cloneDeep(this.state.data)
                const selection = selections[0]
                if (selection) {
                  data.matcher = selection.label
                  this.setState({
                    data: data
                  })
                }
              }}
              onCreateOption={(e)=>e}
              options={(() => {
                const options = []
                for (var matcherName in this.props.modelCopy.matchers)
                  options.push({
                    label: matcherName
                  })
                return options
              })()}
              placeholder='Select matcher'
              selectedOptions={(() => {
                const options = []
                const matcher = this.state.data.matcher
                if (matcher)
                  options.push({
                    label: matcher
                  })
                return options
              })()}
              singleSelection={{ asPlainText: true }}
            />
            }
            </>
          </EuiFormRow>

          <EuiSpacer />

          {/* Quality */}
          <EuiFlexGroup gutterSize='s' responsive={false}>
            <EuiFlexItem grow={true}>
              <EuiTitle>
                <EuiText>Quality</EuiText>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSwitch
                checked={this.state.data.quality != null}
                onChange={(e) => {
                  const data = cloneDeep(this.state.data)
                  // Toggle quality
                  if (data.quality != null)
                    data.quality = null
                  else
                    data.quality = 1.0
                  this.setState({
                    data: data
                  })
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size='xs' />
          <EuiFormRow fullWidth helpText='The quality of the data in the field.'>
            <>
            { this.state.data.quality == null &&
              <EuiText color='subdued' size='xs'>
                (Not defined. Click the toggle switch to enable.)
              </EuiText>
            }
            { this.state.data.quality != null &&
            <EuiRange
              id={'edit-index-field-quality-' + this.state.modalEdit}
              fullWidth
              min={0.0}
              max={1.0}
              step={0.0001}
              ticks={[
                { label: '0.0', value: 0.0 },
                { label: '1.0', value: 1.0 },
              ]}
              showInput={true}
              showRange={true}
              showTicks={true}
              value={this.state.data.quality}
              onChange={(e) => {
                const data = cloneDeep(this.state.data)
                data.quality = parseFloat(e.currentTarget.value)
                this.setState({ data: data })
              }}
            />
            }
            </>
          </EuiFormRow>

          {/* Validations */}
          <EuiSpacer />
          <ModelValidations
            name={this.state.nameEdit}
            section={this.state.data}
            state={this.state}
            validations={this.validations}
            validMessage={{
              title: 'Everything looks good so far.',
              text: 'zentity will validate the existence of indices and fields at search time.'
            }}
          />

        </>
      </EuiConfirmModal>
    )
  }

}
