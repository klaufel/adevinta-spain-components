import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'

import SuiButton from '@s-ui/react-atom-button'

import GroupItem from './GroupItem'
export default function PurposeGroup({
  name,
  i18n,
  isNew,
  baseClass,
  descriptions,
  state,
  onConsentsChange,
  onAcceptAll,
  onRejectAll,
  vendorList
}) {
  const [consentValue, setConsentValue] = useState(state)
  useEffect(() => {
    if (isNew) {
      setConsentValue(prevState => {
        Object.keys(descriptions).map(key => {
          prevState.consents[key] = true
        })
        return {...prevState, consents: prevState.consents}
      })
    }
  }, [isNew, descriptions])
  return (
    <>
      <div className={`${baseClass}-title-container`}>
        <h2 className={`${baseClass}-title`}>{name}</h2>
        <div className={`${baseClass}-buttons`}>
          <SuiButton size="small" design="outline" onClick={onRejectAll}>
            {i18n.DISABLE_BUTTON}
          </SuiButton>
          <SuiButton size="small" onClick={onAcceptAll}>
            {i18n.ENABLE_BUTTON}
          </SuiButton>
        </div>
      </div>
      {consentValue &&
        descriptions &&
        Object.keys(descriptions).map((key, index) => {
          return (
            <GroupItem
              key={`${key}-${index}`}
              baseClass={`${baseClass}-item`}
              itemInfo={descriptions[key]}
              itemValue={consentValue.consents[key]}
              i18n={i18n}
              vendorList={vendorList}
              onItemChange={value => onConsentsChange({index: key, value})}
            />
          )
        })}
    </>
  )
}

PurposeGroup.propTypes = {
  name: PropTypes.string,
  i18n: PropTypes.object,
  baseClass: PropTypes.string,
  descriptions: PropTypes.object,
  state: PropTypes.object,
  onConsentsChange: PropTypes.func,
  onAcceptAll: PropTypes.func,
  onRejectAll: PropTypes.func,
  vendorList: PropTypes.object,
  isNew: PropTypes.bool
}
