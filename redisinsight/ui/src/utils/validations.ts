import { floor } from 'lodash'

export const MAX_TTL_NUMBER = 2147483647
export const MAX_PORT_NUMBER = 65535
export const MAX_DATABASE_INDEX_NUMBER = 99
export const MAX_SCORE_DECIMAL_LENGTH = 15
export const MAX_REFRESH_RATE = 999.9
export const MIN_REFRESH_RATE = 1.0

export const entryIdRegex = /^(\*)$|^(([0-9]+)(-)((\*)$|([0-9]+$)))/

export const validateField = (text: string) => text.replace(/\s/g, '')

export const validateEntryId = (initValue: string) => initValue.replace(/[^0-9-*]+/gi, '')

export const validateCountNumber = (initValue: string) => {
  const value = initValue.replace(/[^0-9]+/gi, '')

  if (+value <= 0) {
    return ''
  }

  return value
}

export const validateTTLNumber = (initValue: string) => {
  const value = +initValue.replace(/[^0-9]+/gi, '')

  if (value > MAX_TTL_NUMBER) {
    return MAX_TTL_NUMBER.toString()
  }

  if (value < 0 || (value === 0 && initValue !== '0')) {
    return ''
  }

  return value.toString()
}

export const validateTTLNumberForAddKey = (iniValue: string) =>
  validateTTLNumber(iniValue).replace(/^(0)?/, '')

export const validateListIndex = (initValue: string) => initValue.replace(/[^0-9]+/gi, '')

export const validateScoreNumber = (initValue: string) => {
  let value = initValue
    .replace(/[^-0-9.]+/gi, '')
    .replace(/^(-?\d*\.?)|(-?\d*)\.?/g, '$1$2')
    .replace(/(?!^)-/g, '')

  if (value.includes('.') && value.split('.')[1].length > MAX_SCORE_DECIMAL_LENGTH) {
    const numberOfExceed = value.split('.')[1].length - MAX_SCORE_DECIMAL_LENGTH
    value = value.slice(0, -numberOfExceed)
  }
  return value.toString()
}

export const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const validatePortNumber = (initValue: string) => validateNumber(initValue, MAX_PORT_NUMBER)
export const validateDatabaseNumber = (initValue: string) =>
  validateNumber(initValue, MAX_DATABASE_INDEX_NUMBER)

export const validateNumber = (initValue: string, maxNumber: number = Infinity, minNumber: number = 0) => {
  const positiveNumbers = /[^0-9]+/gi
  const negativeNumbers = /[^0-9-]+/gi
  const value = initValue ? initValue.replace(minNumber < 0 ? negativeNumbers : positiveNumbers, '') : ''

  if (+value > maxNumber) {
    return maxNumber.toString()
  }

  if (+value < minNumber) {
    return ''
  }

  return value.toString()
}

export const validateRefreshRateNumber = (initValue: string) => {
  let value = initValue.replace(/[^0-9.]/gi, '')

  if (countDecimals(+value) > 0) {
    value = `${floor(+value, 1)}`
  }

  if (+value > MAX_REFRESH_RATE) {
    return MAX_REFRESH_RATE.toString()
  }

  if (+value < 0) {
    return ''
  }

  return value.toString()
}

export const errorValidateRefreshRateNumber = (value: string) => {
  const decimalsRegexp = /^\d+(\.\d{1})?$/
  return !decimalsRegexp.test(value)
}

export const errorValidateNegativeInteger = (value: string) => {
  const negativeIntegerRegexp = /^-?\d+$/
  return !negativeIntegerRegexp.test(value)
}

export const validateCertName = (initValue: string) =>
  initValue.replace(/[^ a-zA-Z0-9!@#$%^&*-_()[\]]+/gi, '').toString()

export const isRequiredStringsValid = (...params: string[]) => params.every((p = '') => p.length > 0)

const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0
  return value.toString().split('.')?.[1]?.length || 0
}
