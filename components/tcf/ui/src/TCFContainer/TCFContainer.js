import React, {Suspense, useState, useEffect} from 'react'
import PropTypes from 'prop-types'

const FirstLayer = React.lazy(() => import('@s-ui/react-tcf-first-layer'))
const SecondLayer = React.lazy(() => import('@s-ui/react-tcf-second-layer'))

export default function TCFContainer({
  getVendorList,
  loadUserConsent,
  onCloseModal,
  saveUserConsent,
  uiVisible,
  isMobile,
  lang,
  logo,
  showVendors,
  showInModalForMobile
}) {
  const [showLayer, setShowLayer] = useState(0)

  useEffect(() => {
    if (showVendors) {
      uiVisible({visible: true})
      setShowLayer(2)
    }
  }, [showVendors, uiVisible])

  useEffect(() => {
    async function checkConsentStatus() {
      const {valid} = await loadUserConsent()
      if (!valid) {
        uiVisible({visible: true})
        setShowLayer(1)
      }
    }
    checkConsentStatus()
  }, [])

  const handleOpenSecondLayer = () => {
    setShowLayer(2)
  }
  const handleVendorsClick = () => {
    setShowLayer(3)
  }
  const handleSecondLayerGoBack = () => {
    if (showVendors) {
      onCloseModal && onCloseModal()
      setShowLayer(0)
    } else {
      setShowLayer(1)
    }
  }
  const handleThirdLayerGoBack = () => {
    setShowLayer(2)
  }
  const handleOpenCookiepolicyLayer = () => {
    setShowLayer(3)
  }
  const handleSaveUserConsent = async ({purpose, vendor, specialFeatures}) => {
    await saveUserConsent({purpose, vendor, specialFeatures})
    uiVisible({visible: false})
    onCloseModal && onCloseModal()
    setShowLayer(0)
  }

  return (
    <>
      {showLayer === 1 && (
        <Suspense fallback={<div />}>
          <FirstLayer
            isMobile={isMobile}
            lang={lang}
            logo={logo}
            getVendorList={getVendorList}
            loadUserConsent={loadUserConsent}
            saveUserConsent={handleSaveUserConsent}
            openSecondLayer={handleOpenSecondLayer}
            openCookiepolicyLayer={handleOpenCookiepolicyLayer}
            showInModalForMobile={showInModalForMobile}
          />
        </Suspense>
      )}
      {showLayer === 2 && (
        <Suspense fallback={<div />}>
          <SecondLayer
            isMobile={isMobile}
            lang={lang}
            logo={logo}
            loadUserConsent={loadUserConsent}
            saveUserConsent={handleSaveUserConsent}
            getVendorList={getVendorList}
            onGoBack={handleSecondLayerGoBack}
            onVendorsClick={handleVendorsClick}
          />
        </Suspense>
      )}
      {showLayer === 3 && (
        <Suspense fallback={<div />}>
          <SecondLayer
            isVendorLayer
            isMobile={isMobile}
            lang={lang}
            logo={logo}
            loadUserConsent={loadUserConsent}
            saveUserConsent={handleSaveUserConsent}
            getVendorList={getVendorList}
            onGoBack={handleThirdLayerGoBack}
          />
        </Suspense>
      )}
    </>
  )
}

TCFContainer.displayName = 'TcfUi'

TCFContainer.propTypes = {
  getVendorList: PropTypes.func,
  loadUserConsent: PropTypes.func,
  uiVisible: PropTypes.func,
  onCloseModal: PropTypes.func,
  saveUserConsent: PropTypes.func,
  isMobile: PropTypes.bool,
  showVendors: PropTypes.bool,
  lang: PropTypes.string,
  logo: PropTypes.string,
  showInModalForMobile: PropTypes.bool
}
