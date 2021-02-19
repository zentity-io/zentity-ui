import React from 'react';

import { cloneDeep, get, isEqual } from 'lodash';

import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiProgress,
  EuiSpacer,
  EuiTitle
} from '@elastic/eui';

import { ModelFlyout } from '../model_flyout';
import { ModelModals } from '../model_modals';
import { ModelTable } from '../model_table';

/**
 * TODO: The properties and functions of the child components
 * can be converted into static values referenced by this one component.
 */
export class ModelSectionAbstract extends React.Component {

  /**
   * @constructor
   * @param {object}  modelCopy - "model" as locally modified in this application
   * @param {object}  modelDiff - Differences between "model" and "modelCopy"
   * @param {boolean} loading   - Indicates that "model" is being loaded
   * @param {boolean} saving    - Indicates that "model" is being saved
   */
  constructor(props) {
    super(props);
    this.state = {

      // Model state
      modelCopy: this.props.modelCopy,
      modelDiff: this.props.modelDiff,

      // Modal state
      modalClone: null,     // Name of the object to be cloned
      modalCloneName: '',   // New name of the object to be cloned
      modalCreate: null,    // Whether (true) a new object should be created
      modalCreateName: '',  // Name of the object to be created
      modalDelete: null,    // Name of the object to be deleted
      modalRename: null,    // Name of the object to be renamed
      modalRenameName: '',  // New name of the object to be renamed

      // Name of object selected from sidebar table
      selected: get(this.props, "match.params.selected") || null,

      // Name of object being created
      creating: null
    };

    // Must be implemented by child class.
    // Must be one of "attributes", "resolvers", "matchers", or "indices".
    this.section = null;

    // The default object when creating a new object.
    this.defaultObject = null;

    // Columns to display in the selection table.
    // Should be implemented by child class.
    this.columns = [];

    // Validation checks to display in the main panel content.
    // Should be implemented by child class.
    this.validations = [];

    // Table action functions.
    // Must be implemented by child class.
    this.onConfirmActionClone = this.onConfirmActionClone.bind(this);
    this.onConfirmActionCreate = this.onConfirmActionCreate.bind(this);
    this.onConfirmActionDelete = this.onConfirmActionDelete.bind(this);
    this.onConfirmActionRename = this.onConfirmActionRename.bind(this);

    // Table action functions.
    this.onClickActionClone = this.onClickActionClone.bind(this);
    this.onClickActionCreate = this.onClickActionCreate.bind(this);
    this.onClickActionDelete = this.onClickActionDelete.bind(this);
    this.onClickActionEdit = this.onClickActionEdit.bind(this);
    this.onClickActionRename = this.onClickActionRename.bind(this);

    // Modal functions
    this.onChangeModalClone = this.onChangeModalClone.bind(this);
    this.onChangeModalCreate = this.onChangeModalCreate.bind(this);
    this.onChangeModalRename = this.onChangeModalRename.bind(this);
    this.onCloseModalClone = this.onCloseModalClone.bind(this);
    this.onCloseModalCreate = this.onCloseModalCreate.bind(this);
    this.onCloseModalDelete = this.onCloseModalDelete.bind(this);
    this.onCloseModalRename = this.onCloseModalRename.bind(this);
    this.onShowModalClone = this.onShowModalClone.bind(this);
    this.onShowModalCreate = this.onShowModalCreate.bind(this);
    this.onShowModalDelete = this.onShowModalDelete.bind(this);
    this.onShowModalRename = this.onShowModalRename.bind(this);

    // Editor functions
    this.onChangeSelected = this.onChangeSelected.bind(this);
    this.onCloseEditor = this.onCloseEditor.bind(this);

    this.onApplyChanges = this.onApplyChanges.bind(this);
    this.onRename = this.onRename.bind(this);
  }

  componentDidUpdate(prevProps) {
    console.debug('componentDidUpdate()');
    //console.debug(cloneDeep(prevProps));
    //console.debug(cloneDeep(this.props));
    const newModelCopy = !isEqual(this.props.modelCopy, prevProps.modelCopy);
    const newModelDiff = !isEqual(this.props.modelDiff, prevProps.modelDiff);
    const newState = {};
    if (!isEqual(this.props.modelCopy, prevProps.modelCopy))
      newState.modelCopy = this.props.modelCopy;
    if (!isEqual(this.props.modelDiff, prevProps.modelDiff))
      newState.modelDiff = this.props.modelDiff;
    if (!!newState.modelCopy && !!newState.modelCopy[this.section]) {
      // If the current selection is a new, unsaved object,
      // remove the selection if the new model does not contain it.
      // This is necessary when reloading the entity model which
      // doesn't have the new, unsaved object.
      const names = [];
      if (!!newState.modelCopy && !!newState.modelCopy[this.section])
        for (var name in newState.modelCopy[this.section])
          names.push(name);
      if (!names.includes(this.state.selected))
        newState.selected = null;
    }

    // Update state based on any changes to the URL
    if (get(this.props, "match.params.selected") !== get(prevProps, "match.params.selected"))
      newState.selected = get(this.props, "match.params.selected");

    // Apply any new state
    if(Object.keys(newState).length > 0) {
      this.setState(newState, () => {
        console.debug(cloneDeep(this.state.modelCopy));
      });
    }
  }

  /**
   * Update modelCopy by deleting a top-level object under either "attributes",
   * "resolvers", "matchers", or "indices".
   *
   * Does not update the application state.
   *
   * Must be implemented by the child class.
   *
   * @param {object} modelCopy   - The modelCopy to update.
   * @param {string} nameDeleted - The name of the object to delete from modelCopy.
   * @return {object}            - The updated modelCopy.
   */
  onDelete(modelCopy, nameDeleted) {
    throw "Not implemented.";
  }

  /**
   * Update modelCopy by renaming a top-level object under either "attributes",
   * "resolvers", "matchers", or "indices".
   *
   * Does not update the application state.
   *
   * Must be implemented by the child class.
   *
   * @param {object} modelCopy - The modelCopy to update.
   * @param {string} nameOld   - Old name of the object to rename in modelCopy.
   * @param {string} nameNew   - New name of the object.
   * @return {object}          - The updated modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {
    throw "Not implemented.";
  }

  /**
   * Action to perform when cloning a first-level object under
   * "attributes", "resolvers", "matchers", or "indices".
   *
   * Updates the application state.
   */
  onConfirmActionClone(name, nameNew) {
    console.debug('onConfirmActionClone()');
    console.debug(name + " => " + nameNew);

    var modelCopy = cloneDeep(this.state.modelCopy);
    console.debug(modelCopy);

    // Update the local copy of the entity model
    // without updating the application state yet.
    modelCopy[this.section][nameNew] = cloneDeep(modelCopy[this.section][name]);

    // Update the application state with the updated
    // local copy of the entity model.
    this.props.onChangeModelCopy(modelCopy, () => {
      console.debug(cloneDeep(this.state));

      // Close and reset the clone modal.
      this.setState({
        modalClone: null,
        modalCloneName: ''
      }, () => {
        console.debug(cloneDeep(this.state));

        // Select the newly renamed object from the table.
        this.onChangeSelected(nameNew);
      })
    });
  }

  /**
   * Action to perform when choosing to create an object under
   * "attributes", "resolvers", "matchers", or "indices".
   * Opens the flyout editor to create the object.
   *
   * @param {string} name - Name of the attribute, resolver, matcher, or index.
   */
  onConfirmActionCreate(name) {
    console.debug('onConfirmActionCreate()');
    console.debug(name);

    var modelCopy = cloneDeep(this.state.modelCopy);
    console.debug(modelCopy);

    // Close the modal and open the flyout editor by passing the name
    // of the object to be created.
    this.setState({
      modalCreate: null,
      modalCreateName: '',
      creating: name
    }, () => {
      console.debug(cloneDeep(this.state));
    });
  }

  /**
   * Action to perform when confirming the deletion of an object
   * either from the selection table or the flyout editor.
   *
   * Updates the application state.
   *
   * @param {string} nameDeleted - Name of the object to delete from modelCopy.
   */
  onConfirmActionDelete(nameDeleted) {
    console.debug('onConfirmActionDelete()');
    console.debug(nameDeleted);

    var modelCopy = cloneDeep(this.state.modelCopy);
    console.debug(modelCopy);

    // Update the local copy of the entity model
    // without updating the application state yet.
    try {
      modelCopy = this.onDelete(modelCopy, nameDeleted);
    } catch(e) {
      console.error(e);
      this.setState({
        modalDelete: null
      }, () => {
        this.props.onAddToast(e);
      });
    }

    // Undo the selection if it was the one that was deleted,
    // because it will no longer exist in the table.
    const selected = this.state.selected === nameDeleted ? null : this.state.selected;
    this.onChangeSelected(selected, () => {
      console.debug(cloneDeep(this.state));

      // Update the application state with the updated
      // local copy of the entity model.
      this.props.onChangeModelCopy(modelCopy, () => {
        console.debug(cloneDeep(this.state));

        // Close and reset the delete modal.
        this.setState({
          modalDelete: null
        }, () => {
          console.debug(cloneDeep(this.state));
        })
      });
    });
  }

  /**
   * Action to perform when confirming the renaming of an object
   * either from the selection table or the flyout editor.
   *
   * Updates the application state.
   *
   * @param {string} nameOld - Old name of the object to rename in modelCopy.
   * @param {string} nameNew - New name of the object.
   */
  onConfirmActionRename(nameOld, nameNew) {
    console.debug('onConfirmActionRename()');
    console.debug(`${nameOld} to ${nameNew}`);

    var modelCopy = cloneDeep(this.state.modelCopy);
    console.debug(modelCopy);

    // Update the local copy of the entity model
    // without updating the application state yet.
    modelCopy = this.onRename(modelCopy, nameNew, nameOld);

    // Undo the selection, because it will
    // no longer exist in the table.
    this.onChangeSelected(null, () => {
      console.debug(cloneDeep(this.state));

      // Update the application state with the updated
      // local copy of the entity model.
      this.props.onChangeModelCopy(modelCopy, () => {
        console.debug(cloneDeep(this.state));

        // Close and reset the rename modal.
        this.setState({
          modalRename: null,
          modalRenameName: ''
        }, () => {

          // Select the newly renamed object from the table.
          this.onChangeSelected(nameNew, () => {
            console.debug(cloneDeep(this.state));
          });
        })
      });
    });
  }

  onClickActionClone(name) {
    console.debug('onClickActionClone()');
    console.debug(name);
    this.onShowModalClone(name);
  }

  onClickActionCreate() {
    console.debug('onClickActionCreate()');
    console.debug(name);
    this.onShowModalCreate();
  }

  onClickActionDelete(name) {
    console.debug('onClickActionDelete()');
    console.debug(name);
    this.onShowModalDelete(name);
  }

  onClickActionEdit(name) {
    console.debug('onClickActionEdit()');
    console.debug(name);
    this.onChangeSelected(name);
  }

  onClickActionRename(name) {
    console.debug('onClickActionRename()');
    console.debug(name);
    this.onShowModalRename(name);
  }

  onChangeModalClone(name) {
    console.debug('onChangeModalClone()');
    this.setState({ modalCloneName: name }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onChangeModalCreate(name) {
    console.debug('onChangeModalCreate()');
    this.setState({ modalCreateName: name }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onChangeModalRename(name) {
    console.debug('onChangeModalRename()');
    this.setState({ modalRenameName: name }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  /**
   * Update the URL when changing the selected object.
   * The router will update the application state accordingly.
   *
   * @param {string}   selection - Name of the selected object.
   * @param {function} callback  - Function to call after the selection changes.
   */
  onChangeSelected(selection, callback) {
    console.debug('onChangeSelected()');
    if (!!selection)
      window.location.hash = '/models/' + this.props.modelId + '/' + this.section + '/' + selection;
    else
      window.location.hash = '/models/' + this.props.modelId + '/' + this.section;
    if (callback)
      callback();
  }

  /**
   * When the flyout editor is creating an object, the URL remains the same.
   * When the flyout editor is editing an object, the URL is one level deeper.
   * That's why the close function must use onChangeSelected() when editing,
   * because that function changes the URL.
   */
  onCloseEditor() {
    console.debug('onCloseEditor()');
    if (this.state.creating)
      this.setState({ creating: null });
    else
      this.onChangeSelected(null);
  };

  onCloseModalClone() {
    console.debug('onCloseModalClone()');
    this.setState({ modalClone: null }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onCloseModalCreate() {
    console.debug('onCloseModalCreate()');
    this.setState({ modalCreate: null }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onCloseModalDelete() {
    console.debug('onCloseModalDelete()');
    this.setState({ modalDelete: null }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onCloseModalRename() {
    console.debug('onCloseModalRename()');
    this.setState({ modalRename: null }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onShowModalClone(name) {
    console.debug('onShowModalClone()');
    this.setState({ modalClone: name }, () => {
      //console.debug(cloneDeep(this.state));
    });
  };

  onShowModalCreate() {
    console.debug('onShowModalCreate()');
    this.setState({ modalCreate: true }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onShowModalDelete(name) {
    console.debug('onShowModalDelete()');
    this.setState({ modalDelete: name }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  onShowModalRename(name) {
    console.debug('onShowModalRename()');
    this.setState({ modalRename: name }, () => {
      console.debug(cloneDeep(this.state));
    });
  };

  /**
   * Action to perform when renaming a single top-level object under either
   * "attributes", "resolvers", "matchers", or "indices". Some actions require
   * renaming references by other objects, hence the need to provide the model.
   *
   * Updates the application state.
   *
   * Must be implemented by the child class.
   *
   * @data  {object} modelCopy - The local copy of the entity model.
   * @param {string} nameNew   - New name of the object
   * @param {string} nameOld   - Old name of the object, as exists in modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {
    throw "No implemented."
  }

  /**
   * Apply changes from the flyout editor to an object in the entity model.
   * The object is a single top-level object under either "attributes",
   * "resolvers", "matchers" or "indices".
   *
   * Updates the application state.
   *
   * @data  {object} data    - New data for the object.
   * @param {string} name    - Name of the object
   * @param {string} nameOld - Old name of the object, if renaming it.
   */
  onApplyChanges(data, name, nameOld) {
    console.debug('onApplyChanges()');
    let modelCopy = cloneDeep(this.state.modelCopy);

    // Rename the object and any references to that object.
    if (nameOld && name !== nameOld) {
      console.debug(`Renaming from ${nameOld} to ${name}`);
      modelCopy = this.onRename(modelCopy, name, nameOld);
    }

    // Change the object.
    modelCopy[this.section][name] = data;

    // Apply the changes locally.
    this.props.onChangeModelCopy(modelCopy, this.onCloseEditor);
  }

  render() {

    return (<>

      { (this.props.loading || this.props.saving) &&
      <EuiProgress size="xs" color="accent" position="fixed" />
      }

      {/* Selection table */}
      <ModelTable
        columns={this.columns}
        loading={this.props.loading || this.props.saving}
        model={this.props.model}
        modelCopy={this.state.modelCopy}
        modelDiff={this.state.modelDiff}
        onChangeTab={this.props.onChangeTab}
        onClickActionClone={this.onClickActionClone}
        onClickActionCreate={this.onClickActionCreate}
        onClickActionDelete={this.onClickActionDelete}
        onClickActionEdit={this.onClickActionEdit}
        onClickActionRename={this.onClickActionRename}
        section={this.section} // "attributes", "resolvers", "matchers", or "indices"
        selected={this.state.selected}
      />

      {/* Flyout editor for creating or editing an object */}
      { (this.state.creating || this.state.selected) && Object.keys(this.state.modelCopy).length > 0 &&

      <ModelFlyout
        type={this.section}
        loading={(this.state.loading || this.state.saving)}
        creating={this.state.creating}
        name={this.state.creating || this.state.selected}
        data={this.state.creating ? this.defaultObject : get(this.state, `modelCopy.${this.section}.${this.state.selected}`)}
        modelCopy={this.state.modelCopy}
        validations={this.validations}
        onApply={this.onApplyChanges}
        onClose={this.onCloseEditor}
        onShowModalClone={this.onShowModalClone}
        onShowModalDelete={this.onShowModalDelete}
      />

      }

      {/* Modals */}
      <ModelModals
        loading={(this.state.loading || this.state.saving)}
        modalClone={this.state.modalClone}
        modalCloneName={this.state.modalCloneName}
        modalCreate={this.state.modalCreate}
        modalCreateName={this.state.modalCreateName}
        modalDelete={this.state.modalDelete}
        modalRename={this.state.modalRename}
        modalRenameName={this.state.modalRenameName}
        onChangeModalClone={this.onChangeModalClone}
        onChangeModalCreate={this.onChangeModalCreate}
        onChangeModalRename={this.onChangeModalRename}
        onCloseModalClone={this.onCloseModalClone}
        onCloseModalCreate={this.onCloseModalCreate}
        onCloseModalDelete={this.onCloseModalDelete}
        onCloseModalRename={this.onCloseModalRename}
        onConfirmActionClone={this.onConfirmActionClone}
        onConfirmActionCreate={this.onConfirmActionCreate}
        onConfirmActionDelete={this.onConfirmActionDelete}
        onConfirmActionRename={this.onConfirmActionRename}
      />

    </>);
  }
};
