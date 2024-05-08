import React from 'react'

import { cloneDeep, isEqual } from 'lodash'

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'

import { ModelModals } from '../model_modals'
import { ModelValidations } from '../model_validations'

/**
 * Expected props:
 *
 * creating // Whether the object is being created or edited
 * data     // The object (e.g. an attribute, resolver, matcher, or index)
 * name     // The name of the object
 * onApply  // Function to apply changes and close the flyout editor
 * onClose  // Function to close the flyout editor
 */
export class ModelFlyoutAbstract extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: cloneDeep(this.props.data), // Value of the object
      name: this.props.name, // Name of the object being created or edited

      // Modal state
      modalRename: null, // Name of the object to be renamed
      modalRenameName: '', // New name of the object to be renamed
    }

    // Must be implemented by child class.
    // Must be one of 'attributes', 'resolvers', 'matchers', or 'indices'.
    this.section = null

    // To be implemented by child classes.
    this.renderBody = this.renderBody.bind(this)

    // Size of the flyout
    this.size = 'm'

    // Modal functions
    this.onConfirmActionRename = this.onConfirmActionRename.bind(this)
    this.onChangeModalRename = this.onChangeModalRename.bind(this)
    this.onCloseModalRename = this.onCloseModalRename.bind(this)
    this.onShowModalRename = this.onShowModalRename.bind(this)

    // Other functions
    this.onApply = this.onApply.bind(this)
    this.isChanged = this.isChanged.bind(this)
    this.isInvalid = this.isInvalid.bind(this)
  }

  /**
   * Allow child components to process data after clicking 'Apply'
   * but before the data is applied.
   */
  beforeApply(callback) {
    callback()
  }

  onApply() {
    this.beforeApply(() => {
      this.props.onApply(this.state.data, this.state.name, this.props.name)
    })
  }

  onConfirmActionRename(nameOld, nameNew) {
    this.setState({
      name: nameNew,
      modalRename: null,
      modalRenameName: null,
    })
  }

  onChangeModalRename(name) {
    console.debug('onChangeModalRename()')
    this.setState({ modalRenameName: name }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onCloseModalRename() {
    console.debug('onCloseModalRename()')
    this.setState({ modalRename: null }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  onShowModalRename(name) {
    console.debug('onShowModalRename()')
    this.setState({ modalRename: name }, () => {
      console.debug(cloneDeep(this.state))
    })
  }

  /**
   * Can be overridden by child classes to disable the 'Apply' button when true.
   */
  isInvalid() {
    return false
  }

  isChanged() {
    return !isEqual(this.state.data, this.props.data)
  }

  renderBody() {
    throw 'Not implemented.'
  }

  /**
   * Content to render in the flyout.
   */
  render() {
    return (
      <>
        <EuiFlyout
          ownFocus
          onClose={this.props.onClose}
          hideCloseButton
          size={this.size}
          aria-labelledby="flyoutComplicatedTitle"
        >
          {/* Header */}
          <EuiFlyoutHeader hasBorder>
            <EuiFlexGroup gutterSize="none" responsive={false}>
              {/* Top left */}
              <EuiFlexItem grow={true}>
                <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
                  {/* Name of attribute, resolver, matcher, or index */}
                  <EuiFlexItem grow={false}>
                    <EuiTitle>
                      <h2>{this.state.name}</h2>
                    </EuiTitle>
                  </EuiFlexItem>
                  {/* Rename button */}
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="pencil"
                      color="text"
                      size="s"
                      onClick={(e) => this.onShowModalRename(e.currentTarget.name)}
                      name={this.state.name}
                    >
                      Rename
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>

              {/* Top right */}
              {/* These buttons are relevant only when editing an existing object. */}
              {!this.props.creating && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
                    {/* Clone button */}
                    <EuiFlexItem grow={false}>
                      <EuiToolTip content="Clone">
                        <EuiButtonIcon
                          aria-label="Clone"
                          iconType="copy"
                          color="text"
                          size="s"
                          onClick={(e) => this.props.onShowModalClone(e.currentTarget.name)}
                          name={this.state.name}
                        ></EuiButtonIcon>
                      </EuiToolTip>
                    </EuiFlexItem>
                    {/* Delete button */}
                    <EuiFlexItem grow={false}>
                      <EuiToolTip content="Delete">
                        <EuiButtonIcon
                          aria-label="Delete"
                          iconType="trash"
                          color="danger"
                          size="s"
                          onClick={(e) => this.props.onShowModalDelete(e.currentTarget.name)}
                          name={this.state.name}
                          style={{ opacity: '0.8' }}
                        ></EuiButtonIcon>
                      </EuiToolTip>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlyoutHeader>

          {/*  Body*/}
          <EuiFlyoutBody>
            {this.renderBody()}

            {/* Validations */}
            <EuiSpacer />
            <ModelValidations validations={this.props.validations} section={this.state.data} state={this.state} />
          </EuiFlyoutBody>

          {/* Footer */}
          <EuiFlyoutFooter>
            <EuiFlexGroup justifyContent="spaceBetween" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty iconType="cross" onClick={this.props.onClose} flush="left">
                  Cancel
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  isDisabled={this.isInvalid() || (!this.props.creating && !this.isChanged())}
                  onClick={this.onApply}
                >
                  Apply
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlyout>

        {/* Modals */}
        <ModelModals
          loading={this.props.loading || this.props.saving}
          modalRename={this.state.modalRename}
          modalRenameName={this.state.modalRenameName}
          onChangeModalRename={this.onChangeModalRename}
          onCloseModalRename={this.onCloseModalRename}
          onConfirmActionRename={this.onConfirmActionRename}
        />
      </>
    )
  }
}
