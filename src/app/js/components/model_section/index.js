import React from 'react'

import { ModelSectionAttributes } from './model_section_attributes.js'
import { ModelSectionResolvers } from './model_section_resolvers.js'
import { ModelSectionMatchers } from './model_section_matchers.js'
import { ModelSectionIndices } from './model_section_indices.js'

export function ModelSection(props) {
  /**
   * Factory function to render a child component of ModelSection.
   *
   * @param {string} type - One of 'attributes', 'resolvers', 'matchers', or 'indices'.
   * @param {object} props - Props to pass to the created component.
   * @return {ModelSection} - A React component that extends ModelSection.
   */
  switch(props.section) {
    case 'attributes':
      return <ModelSectionAttributes {...props} />
    case 'resolvers':
      return <ModelSectionResolvers {...props} />
    case 'matchers':
      return <ModelSectionMatchers {...props} />
    case 'indices':
      return <ModelSectionIndices {...props} />
    default:
      throw `Unrecognized model section: ${props.section}`
  }
}
