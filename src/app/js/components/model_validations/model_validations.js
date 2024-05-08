import React from 'react'

import {
  EuiCallOut,
  EuiSpacer
} from '@elastic/eui'

/**
 * Expected props:
 *
 * - validations
 * - section      // Data for the attributes, resolvers, matcher, or index passed to validations.check()
 * - name         // Name of the object passed to validations.check()
 * - state        // Parent state
 *
 * Expected structure of 'validations':
 *
 *  {
 *    check: (props.params) => { return boolean },
 *    level: 'warning' | 'error',
 *    text: {<> JSX </>}
 *  }
 */
export function ModelValidations(props) {

  const items = []
  for (var i in props.validations) {
    if (props.validations[i].check(props.section, props.state, props.name)) {
      let title
      let color
      switch(props.validations[i].level) {
        case 'error':
          title = 'Error'
          color = 'danger'
          break
        case 'warning':
          title = 'Warning'
          color = 'warning'
          break
        default:
          title = 'Note'
          color = 'primary'
          break
      }
      if (items.length > 0)
        items.push(<EuiSpacer size='s' key={i + '-spacer'}/>)
      items.push(
        <EuiCallOut title={title} color={color} iconType='help' key={i}>
          <p>
            {props.validations[i].text}
          </p>
        </EuiCallOut>
      )
    }
  }
  if (items.length === 0) {
    let validMessage = {
      title: 'Everything looks good with this.',
      text: null
    }
    if (props.validMessage) {
      if (props.validMessage.title)
        validMessage.title = props.validMessage.title
      if (props.validMessage.text)
        validMessage.text = props.validMessage.text
    }
    items.push(
      <EuiCallOut title={validMessage.title} color='success' iconType='help' key='0'>
        {validMessage.text}
      </EuiCallOut>
    )
  }

  return (<>
    {items}
  </>)
}
