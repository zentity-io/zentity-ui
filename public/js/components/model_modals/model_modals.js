import React from 'react';

import {
  EuiCode,
  EuiConfirmModal,
  EuiFieldText,
  EuiFormRow,
  EuiProgress,
  EuiTitle
} from '@elastic/eui';

/**
 * Expected props:
 *
 * - modalClone             (string or null)
 * - modalCloneName         (string)
 * - modalCreate            (string or null)
 * - modalCreateName        (string)
 * - modalDelete            (string or null)
 * - modalRename            (string or null)
 * - modalRenameName        (string)
 * - onCloseModalClone      (function)
 * - onCloseModalCreate     (function)
 * - onCloseModalDelete     (function)
 * - onCloseModalRename     (function)
 * - onChangeModalClone     (function)
 * - onChangeModalCreate    (function)
 * - onChangeModalRename    (function)
 * - onConfirmActionClone   (function)
 * - onConfirmActionCreate  (function)
 * - onConfirmActionDelete  (function)
 * - onConfirmActionRename  (function)
 */
export function ModelModals(props) {

  let modalClone;
  if (!!props.modalClone) {
    modalClone = (
      <EuiConfirmModal
        title={<EuiTitle><h2>Clone</h2></EuiTitle>}
        onCancel={props.onCloseModalClone}
        onConfirm={() => props.onConfirmActionClone(props.modalClone, props.modalCloneName)}
        cancelButtonText="Cancel"
        confirmButtonText="Clone"
        confirmButtonDisabled={props.modalCloneName === ''}
        buttonColor="primary"
        initialFocus="[name=modal-clone-name]">
        { props.loading &&
        <EuiProgress size="xs" color="accent" position="absolute" />
        }
        <EuiFormRow>
          <EuiCode>{props.modalClone}</EuiCode>
        </EuiFormRow>
        <EuiFormRow label="New name">
          <EuiFieldText
            value={props.modalCloneName}
            placeholder="Name..."
            onChange={(e) => props.onChangeModalClone(e.currentTarget.value)}
            name="modal-clone-name"
          />
        </EuiFormRow>
      </EuiConfirmModal>
    );
  }

  let modalCreate;
  if (!!props.modalCreate) {
    modalCreate = (
      <EuiConfirmModal
        title={<EuiTitle><h2>Create</h2></EuiTitle>}
        onCancel={props.onCloseModalCreate}
        onConfirm={() => props.onConfirmActionCreate(props.modalCreateName)}
        cancelButtonText="Cancel"
        confirmButtonText="Create"
        confirmButtonDisabled={props.modalCreateName === ''}
        buttonColor="primary"
        initialFocus="[name=modal-create-name]">
        { props.loading &&
        <EuiProgress size="xs" color="accent" position="absolute" />
        }
        <EuiFormRow label="Name">
          <EuiFieldText
            value={props.modalCreateName}
            placeholder="Name..."
            onChange={(e) => props.onChangeModalCreate(e.currentTarget.value)}
            name="modal-create-name"
          />
        </EuiFormRow>
      </EuiConfirmModal>
    );
  }

  let modalDelete;
  if (!!props.modalDelete) {
    modalDelete = (
      <EuiConfirmModal
        title={<EuiTitle><h2>Delete</h2></EuiTitle>}
        onCancel={props.onCloseModalDelete}
        onConfirm={() => props.onConfirmActionDelete(props.modalDelete)}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="cancel">
        { props.loading &&
        <EuiProgress size="xs" color="accent" position="absolute" />
        }
        <EuiCode>{props.modalDelete}</EuiCode>
      </EuiConfirmModal>
    );
  }

  let modalRename;
  if (!!props.modalRename) {
    modalRename = (
      <EuiConfirmModal
        title={<EuiTitle><h2>Rename</h2></EuiTitle>}
        onCancel={props.onCloseModalRename}
        onConfirm={() => props.onConfirmActionRename(props.modalRename, props.modalRenameName)}
        cancelButtonText="Cancel"
        confirmButtonText="Rename"
        confirmButtonDisabled={props.modalRenameName === ''}
        buttonColor="primary"
        initialFocus="[name=modal-rename-name]">
        { props.loading &&
        <EuiProgress size="xs" color="accent" position="absolute" />
        }
        <EuiFormRow>
          <EuiCode>{props.modalRename}</EuiCode>
        </EuiFormRow>
        <EuiFormRow label="New name">
          <EuiFieldText
            value={props.modalRenameName}
            placeholder="Name..."
            onChange={(e) => props.onChangeModalRename(e.currentTarget.value)}
            name="modal-rename-name"
          />
        </EuiFormRow>
      </EuiConfirmModal>
    );
  }

  return (<>
    {modalClone}
    {modalCreate}
    {modalDelete}
    {modalRename}
  </>);
};
