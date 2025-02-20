import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, remove, isNull } from 'lodash'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Maybe } from 'uiSrc/utils'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  GetHashFieldsResponse,
  AddFieldsToHashDto,
  HashFieldDto,
} from 'apiSrc/modules/browser/dto/hash.dto'
import {
  deleteKeyFromList,
  deleteKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { StateHash } from '../interfaces'
import { addErrorNotification, addMessageNotification } from '../app/notifications'

export const initialState: StateHash = {
  loading: false,
  error: '',
  data: {
    total: 0,
    key: '',
    keyName: '',
    fields: [],
    nextCursor: 0,
    match: '*',
  },
  updateValue: {
    loading: false,
    error: '',
  },
}

// A slice for recipes
const hashSlice = createSlice({
  name: 'hash',
  initialState,
  reducers: {
    setHashInitialState: () => initialState,
    // load Hash fields
    loadHashFields: (state, { payload: [match = '', resetData = true] }: PayloadAction<[string, Maybe<boolean>]>) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }

      state.data = {
        ...state.data,
        match: match || '*'
      }
    },
    loadHashFieldsSuccess: (
      state,
      { payload }: PayloadAction<GetHashFieldsResponse>
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.key = payload.keyName
      state.loading = false
    },
    loadHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // load more Hash fields for infinity scroll
    loadMoreHashFields: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreHashFieldsSuccess: (
      state,
      { payload: { fields, ...rest } }: PayloadAction<GetHashFieldsResponse>
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        fields: state.data?.fields?.concat(fields),
      }
    },
    loadMoreHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Update Hash Value
    updateValue: (state) => {
      state.updateValue = {
        ...state.updateValue,
        loading: true,
        error: '',
      }
    },
    updateValueSuccess: (state) => {
      state.updateValue = {
        ...state.updateValue,
        loading: false,
      }
    },
    updateValueFailure: (state, { payload }) => {
      state.updateValue = {
        ...state.updateValue,
        loading: false,
        error: payload,
      }
    },
    resetUpdateValue: (state) => {
      state.updateValue = cloneDeep(initialState.updateValue)
    },

    // delete Hash fields
    removeHashFields: (state) => {
      state.loading = true
      state.error = ''
    },
    removeHashFieldsSuccess: (state) => {
      state.loading = false
    },
    removeHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeFieldsFromList: (state, { payload }: { payload: string[] }) => {
      remove(state.data?.fields, ({ field }) => payload.includes(field))

      state.data = {
        ...state.data,
        total: state.data.total - 1,
      }
    },
    updateFieldsInList: (state, { payload }: { payload: HashFieldDto[] }) => {
      const newFieldsState = state.data.fields.map((listItem) => {
        const index = payload.findIndex(
          (item) => item.field === listItem.field
        )
        if (index > -1) {
          return payload[index]
        }
        return listItem
      })

      state.data = {
        ...state.data,
        fields: newFieldsState,
      }
    },
  },
})

// Actions generated from the slice
export const {
  setHashInitialState,
  loadHashFields,
  loadHashFieldsSuccess,
  loadHashFieldsFailure,
  loadMoreHashFields,
  loadMoreHashFieldsSuccess,
  loadMoreHashFieldsFailure,
  removeHashFields,
  removeHashFieldsSuccess,
  removeHashFieldsFailure,
  removeFieldsFromList,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetUpdateValue,
  updateFieldsInList,
} = hashSlice.actions

// Selectors
export const hashSelector = (state: RootState) => state.browser.hash
export const hashDataSelector = (state: RootState) => state.browser.hash?.data
export const updateHashValueStateSelector = (state: RootState) =>
  state.browser.hash.updateValue

// The reducer
export default hashSlice.reducer

// Asynchronous thunk actions
export function fetchHashFields(
  key: string,
  cursor: number,
  count: number,
  match: string,
  onSuccess?: (data: GetHashFieldsResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadHashFields([isNull(match) ? '*' : match, true]))

    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetHashFieldsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadHashFieldsSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.(data)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function refreshHashFieldsAction(key: string = '', resetData?: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { match } = state.browser.hash.data
    dispatch(loadHashFields([match || '*', resetData]))

    try {
      const { data, status } = await apiService.post<GetHashFieldsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS
        ),
        {
          keyName: key,
          cursor: 0,
          count: SCAN_COUNT_DEFAULT,
          match,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadHashFieldsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function fetchMoreHashFields(
  key: string,
  cursor: number,
  count: number,
  match: string
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreHashFields())

    try {
      const state = stateInit()
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS
        ),
        {
          keyName: key,
          cursor,
          count,
          match: isNull(match) ? '*' : match,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreHashFieldsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMoreHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function deleteHashFields(key: string, fields: string[], onSuccessAction?: () => void,) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeHashFields())
    try {
      const state = stateInit()
      const { status, data } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_FIELDS
        ),
        {
          data: {
            keyName: key,
            fields,
          },
        }
      )
      const newTotalValue = state.browser.hash.data.total - data.affected
      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(removeHashFieldsSuccess())
        dispatch(removeFieldsFromList(fields))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              key,
              fields.join(''),
              'Field'
            )
          ))
        } else {
          dispatch(deleteKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(removeHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function addHashFieldsAction(
  data: AddFieldsToHashDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH
        ),
        data
      )
      if (isStatusSuccessful(status)) {
        if (onSuccessAction) {
          onSuccessAction()
        }
        dispatch(updateValueSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      }
    } catch (error) {
      if (onFailAction) {
        onFailAction()
      }
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
    }
  }
}
// Asynchronous thunk action
export function updateHashFieldsAction(
  data: AddFieldsToHashDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH
        ),
        data
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_EDITED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.Hash,
          }
        })
        if (onSuccessAction) {
          onSuccessAction()
        }
        dispatch(updateValueSuccess())
        dispatch(updateFieldsInList(data.fields))
        dispatch<any>(refreshKeyInfoAction(data.keyName))
      }
    } catch (error) {
      if (onFailAction) {
        onFailAction()
      }
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
    }
  }
}
