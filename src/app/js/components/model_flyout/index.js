import React from 'react'

import { ModelFlyoutAttributes } from './model_flyout_attributes.js'
import { ModelFlyoutResolvers } from './model_flyout_resolvers.js'
import { ModelFlyoutMatchers } from './model_flyout_matchers.js'
import { ModelFlyoutIndices } from './model_flyout_indices.js'

export function ModelFlyout(props) {
  /**
   * Factory function to return a child component of ModelFlyout.
   *
   * @param {string} type - 'attributes', 'resolvers', 'matchers', or 'indices'.
   * @param {object} props - Props to pass to the returned component.
   * @return {ModelFlyout} - A React component that extends ModelFlyout.
   */
  switch(props.type) {
    case 'attributes':
      return <ModelFlyoutAttributes {...props} />
    case 'resolvers':
      return <ModelFlyoutResolvers {...props} />
    case 'matchers':
      return <ModelFlyoutMatchers {...props} />
    case 'indices':
      return <ModelFlyoutIndices {...props} />
    default:
      throw `Unrecognized object type: ${props.type}`
  }
}
