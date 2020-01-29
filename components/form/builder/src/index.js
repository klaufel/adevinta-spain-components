import React, {useState, useEffect, useCallback, useRef} from 'react'
import PropTypes from 'prop-types'

import {json} from './prop-types'
import {reducer} from './reducer'
import {CHANGE, RULES} from './reducer/constants'
import {
  fieldsToObject,
  fieldsNamesInOrderOfDefinition,
  changeFieldById
} from './reducer/fields'
import ProxyField from './ProxyField'
import {inputSizes as fieldSizes} from '@s-ui/react-atom-input'
import AtomSpinner, {AtomSpinnerTypes} from '@s-ui/react-atom-spinner'

const FormBuilder = ({
  json,
  initFields,
  onChange,
  requestInterceptor,
  urlInterceptor,
  loader,
  fieldSize,
  errors
}) => {
  const {fields = [], rules = {}, id: formID} = json.form
  const [stateFields, setStateFields] = useState(fields)
  const [stateShowSpinner, setStateShowSpinner] = useState(false)
  const __PERFORMANCE_UGLY_HACK_STATE_FIELDS__ = useRef()
  __PERFORMANCE_UGLY_HACK_STATE_FIELDS__.current = stateFields

  const handlerChange = useCallback(async (id, value) => {
    const reducerWithRules = reducer(
      rules,
      formID,
      requestInterceptor,
      urlInterceptor
    )
    const timerShowSpinner = setTimeout(
      () => setStateShowSpinner(true),
      FormBuilder.USER_MINIMAL_DELAY
    )

    const nextFields = changeFieldById(
      __PERFORMANCE_UGLY_HACK_STATE_FIELDS__.current,
      id,
      {value}
    )
    setStateFields(nextFields)
    onChange({...nextFields, __FIELD_CHANGED__: id})
    clearTimeout(timerShowSpinner)

    const nextStateFields = await reducerWithRules(
      __PERFORMANCE_UGLY_HACK_STATE_FIELDS__.current,
      {
        type: RULES,
        id,
        value
      }
    )
    clearTimeout(timerShowSpinner)
    setStateFields(nextStateFields)
    onChange({
      ...fieldsToObject(nextStateFields),
      __FIELD_CHANGED__: id
    })

    setStateShowSpinner(false)
  }, []) // eslint-disable-line

  useEffect(() => {
    const reducerWithRules = reducer(
      rules,
      formID,
      requestInterceptor,
      urlInterceptor
    )
    const timerShowSpinner = setTimeout(
      () => setStateShowSpinner(true),
      FormBuilder.USER_MINIMAL_DELAY
    )
    fieldsNamesInOrderOfDefinition(fields)
      .reduce(async (previousPromise, field) => {
        const previousFields = await previousPromise

        if (!initFields[field] || initFields[field] === '') {
          return previousFields
        }

        const nextFields = await reducerWithRules(previousFields, {
          type: CHANGE,
          id: field,
          value: initFields[field]
        })
        return nextFields
      }, Promise.resolve(__PERFORMANCE_UGLY_HACK_STATE_FIELDS__.current))
      .then(nextFields => {
        clearTimeout(timerShowSpinner)
        setStateFields(nextFields)
        setStateShowSpinner(false)
      })
        }, []) // eslint-disable-line

  return (
    <div className="sui-FormBuilder">
      {stateFields.map((field, index) => (
        <ProxyField
          key={field.id}
          field={field}
          tabIndex={index + 1}
          onChange={handlerChange}
          fieldSize={fieldSize}
          errors={errors}
        />
      ))}
      {stateShowSpinner && (
        <AtomSpinner type={AtomSpinnerTypes.SECTION} loader={loader} />
      )}
    </div>
  )
}

FormBuilder.USER_MINIMAL_DELAY = 250
FormBuilder.displayName = 'FormBuilder'

FormBuilder.propTypes = {
  initFields: PropTypes.arrayOf(PropTypes.object),
  json,
  onChange: PropTypes.func,
  requestInterceptor: PropTypes.func,
  urlInterceptor: PropTypes.func,
  loader: PropTypes.object,
  fieldSize: PropTypes.oneOf(Object.values(fieldSizes)),
  errors: PropTypes.object
}

FormBuilder.defaultProps = {
  initFields: {},
  onChange: () => {},
  requestInterceptor: ({response}) => response,
  urlInterceptor: () => {},
  errors: {}
}

export {fieldSizes as formBuilderFieldSizes}
export {checkConstrainstsFactory} from './Standard'
export default FormBuilder
