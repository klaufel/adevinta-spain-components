class TcfRepository {
  constructor({tcfApi, language = 'es', scope = {}}) {
    this._tcfApi = tcfApi
    this._language = language
    this._scope = scope
    this._cachedConsent = null
    this._data = {}
  }

  getVendorList() {
    return this._tcfApi.getVendorList({language: this._language})
  }

  loadUserConsent() {
    this._cachedConsent = this._cachedConsent || this._initializeConsent()
    return this._cachedConsent
  }

  async _initializeConsent() {
    const userConsent = await this._tcfApi.loadUserConsent()
    if (userConsent.isNew) {
      const vendorList = await this.getVendorList()
      userConsent.purpose = {consents: {}, legitimateInterests: {}}
      userConsent.vendor = {consents: {}, legitimateInterests: {}}
      userConsent.specialFeatures = {}

      this._scope.purposes =
        this._scope.purposes || Object.keys(vendorList.purposes)
      this._scope.purposes.forEach(key => {
        userConsent.purpose.consents[key] = true
        userConsent.purpose.legitimateInterests[key] = true
      })

      Object.keys(vendorList.vendors).forEach(key => {
        userConsent.vendor.consents[key] = true
        userConsent.vendor.legitimateInterests[key] = true
      })

      this._scope.specialFeatures =
        this._scope.specialFeatures || Object.keys(vendorList.specialFeatures)
      this._scope.specialFeatures.forEach(
        key => (userConsent.specialFeatures[key] = true)
      )
    }
    this._data = userConsent
    return this._data
  }

  async saveUserConsent() {
    const {purpose, vendor, specialFeatures} = this._data
    return this._tcfApi.saveUserConsent({purpose, vendor, specialFeatures})
  }

  uiVisible({visible}) {
    return this._tcfApi.uiVisible({visible})
  }

  updateUserConsent({
    purpose = {},
    vendor = {},
    specialFeatures = {},
    allPurposes = null,
    allVendors = null,
    allSpecialFeatures = null
  } = {}) {
    const updated = {purpose, vendor, specialFeatures}
    updated.purpose.consents = updated.purpose.consents || {}
    updated.purpose.legitimateInterests =
      updated.purpose.legitimateInterests || {}
    updated.vendor.consents = updated.vendor.consents || {}
    updated.vendor.legitimateInterests =
      updated.vendor.legitimateInterests || {}

    if (allPurposes !== null) {
      this._scope.purposes = this._scope.purposes || []
      this._scope.purposes.forEach(key => {
        updated.purpose.consents[key] = allPurposes
        updated.purpose.legitimateInterests[key] = allPurposes
      })
    }

    if (allVendors !== null) {
      Object.keys(updated.vendor.consents).forEach(key => {
        updated.vendor.consents[key] = allVendors
        updated.vendor.legitimateInterests[key] = allVendors
      })
    }

    if (allSpecialFeatures !== null) {
      this._scope.specialFeatures = this._scope.specialFeatures || []
      this._scope.specialFeatures.forEach(key => {
        updated.specialFeatures[key] = allSpecialFeatures
      })
    }
    Object.assign(this._data, updated)
  }
}

export {TcfRepository}