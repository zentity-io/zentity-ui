import { ModelSectionAbstract } from './model_section_abstract.js'

export class ModelSectionIndices extends ModelSectionAbstract {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
    }

    // Must be one of 'attributes', 'resolvers', 'matchers', or 'indices'.
    this.section = 'indices'

    // The default object when creating a new indx.
    this.defaultObject = {
      fields: {},
    }

    // Columns to display in the selection table.
    this.columns = []

    // Validation checks to display in the main panel content.
    this.validations = []
  }

  /**
   * Delete an index.
   * Return the modified modelCopy.
   */
  onDelete(modelCopy, nameDeleted) {
    // Reconstruct the indices.
    var indices = {}
    for (var name in modelCopy.indices) if (name !== nameDeleted) indices[name] = modelCopy.indices[name]
    modelCopy.indices = indices
    return modelCopy
  }

  /**
   * Rename an index.
   * Return the modified modelCopy.
   */
  onRename(modelCopy, nameNew, nameOld) {
    // Reconstruct the indices
    var indices = {}
    for (var name in modelCopy.indices) {
      if (name === nameOld) indices[nameNew] = modelCopy.indices[name]
      else indices[name] = modelCopy.indices[name]
    }
    modelCopy.indices = indices
    return modelCopy
  }
}
