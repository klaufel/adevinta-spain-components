/* eslint-disable react-hooks/exhaustive-deps */
import {lazy, Suspense, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useConsent} from '@s-ui/react-tcf-services'
import {
  LAYER_BANNER,
  LAYER_OFF,
  LAYER_PURPOSES,
  LAYER_VENDORS
} from '../constants'

const FirstLayer = lazy(() => import('../FirstLayer'))
const SecondLayer = lazy(() => import('../SecondLayer'))

export default function TCFContainer({logo, onCloseModal, showPurposesLayer}) {
  const [showLayer, setShowLayer] = useState(LAYER_OFF)
  const [vendorsLayerBackTo, setVendorsLayerBackTo] = useState(LAYER_OFF)
  const {uiVisible, loadUserConsent, saveUserConsent} = useConsent()
  useEffect(() => {
    if (showPurposesLayer) {
      uiVisible({visible: true})
      changeLayer(LAYER_PURPOSES)
    }
  }, [showPurposesLayer, uiVisible])

  useEffect(() => {
    async function checkConsentStatus() {
      const userConsent = await loadUserConsent()
      const {valid} = userConsent
      if (!valid) {
        uiVisible({visible: true})
        changeLayer(LAYER_BANNER)
      }
    }
    checkConsentStatus().catch(() => {
      changeLayer(LAYER_OFF)
    })
  }, [])

  const changeLayer = to => {
    if (to === LAYER_VENDORS) {
      setVendorsLayerBackTo(showLayer)
    }
    setShowLayer(to)
  }

  const handleOpenSecondLayer = () => {
    changeLayer(LAYER_PURPOSES)
  }
  const handleVendorsClick = () => {
    changeLayer(LAYER_VENDORS)
  }
  const handleSecondLayerGoBack = () => {
    if (showPurposesLayer) {
      onCloseModal && onCloseModal()
      changeLayer(LAYER_OFF)
    } else {
      changeLayer(LAYER_BANNER)
    }
  }
  const handleThirdLayerGoBack = () => {
    changeLayer(vendorsLayerBackTo)
  }
  const handleOpenCookiePolicyLayer = () => {
    changeLayer(LAYER_VENDORS)
  }
  const handleSaveUserConsent = async () => {
    await saveUserConsent()
    uiVisible({visible: false})
    onCloseModal && onCloseModal()
    changeLayer(LAYER_OFF)
  }

  return (
    <>
      {showLayer === LAYER_BANNER && (
        <Suspense fallback={<div />}>
          <FirstLayer
            logo={logo}
            onOpenCookiePolicyLayer={handleOpenCookiePolicyLayer}
            onOpenSecondLayer={handleOpenSecondLayer}
            onSaveUserConsent={handleSaveUserConsent}
          />
        </Suspense>
      )}
      {showLayer === LAYER_PURPOSES && (
        <Suspense fallback={<div />}>
          <SecondLayer
            logo={logo}
            onSaveUserConsent={handleSaveUserConsent}
            onGoBack={handleSecondLayerGoBack}
            onVendorsClick={handleVendorsClick}
          />
        </Suspense>
      )}
      {showLayer === LAYER_VENDORS && (
        <Suspense fallback={<div />}>
          <SecondLayer
            isVendorLayer
            logo={logo}
            onSaveUserConsent={handleSaveUserConsent}
            onGoBack={handleThirdLayerGoBack}
          />
        </Suspense>
      )}
    </>
  )
}

TCFContainer.displayName = 'TcfUi'

TCFContainer.propTypes = {
  logo: PropTypes.string,
  onCloseModal: PropTypes.func,
  showPurposesLayer: PropTypes.bool
}
