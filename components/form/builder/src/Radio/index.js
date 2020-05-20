import React from 'react'

import PropTypes from 'prop-types'
import {field, createComponentMemo} from '../prop-types'
import MoleculeRadioButtonGroup from '@s-ui/react-molecule-radio-button-group'
import MoleculeRadioButtonField from '@s-ui/react-molecule-radio-button-field'

const Radio = ({radio, tabIndex, onChange, errors, alerts, renderer}) => {
  const errorMessages = errors[radio.id]
  const alertMessages = alerts[radio.id]
  const datalist = radio.datalist
  const onChangeHandler = value => {
    return onChange(radio.id, value)
  }

  const radioProps = {
    id: radio.id,
    label: radio.label,
    tabIndex: tabIndex,
    ...(radio.disabled && {
      disabled: true
    }),
    ...(radio.hidden && {
      hidden: true
    }),
    ...(!!errorMessages && {
      errorText: errorMessages.join('\n')
    }),
    ...(!!alertMessages && {
      alertText: alertMessages.join('\n')
    })
  }

  if (radioProps.hidden) {
    return null
  }

  const rendererResponse = renderer({
    id: radio.id,
    innerProps: {
      ...radioProps,
      datalist
    }
  })

  // render custom component
  if (React.isValidElement(rendererResponse)) return rendererResponse
  // render SUI component
  return (
    <div
      className={`sui-FormBuilder-field sui-FormBuilder-Radio sui-FormBuilder-${radioProps.id ||
        tabIndex}`}
    >
      {radio.label && (
        <label className="sui-FormBuilder-label sui-FormBuilder-Radio-label">
          {radio.label}
        </label>
      )}
      <MoleculeRadioButtonGroup
        onChange={(_, {value}) => {
          onChangeHandler(value)
        }}
        id={radio.id}
        value={radio.value}
        {...rendererResponse}
      >
        {datalist.map(button => (
          <MoleculeRadioButtonField
            id={button.value}
            key={button.value}
            value={button.value}
            label={button.text}
            helpText={button.hint}
          />
        ))}
      </MoleculeRadioButtonGroup>
    </div>
  )
}

Radio.displayName = 'Radio'
Radio.propTypes = {
  radio: field,
  tabIndex: PropTypes.number,
  onChange: PropTypes.func,
  errors: PropTypes.object,
  alerts: PropTypes.object,
  renderer: PropTypes.func
}

export default React.memo(Radio, createComponentMemo('radio'))
