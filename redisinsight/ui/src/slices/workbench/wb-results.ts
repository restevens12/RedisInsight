import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { CliOutputFormatterType } from 'uiSrc/constants/cliOutput'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
} from 'uiSrc/utils'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'

import { AppDispatch, RootState } from '../store'
import {
  CommandExecution,
  CommandExecutionUI,
  CreateCommandExecutionDto,
  StateWorkbenchResults,
} from '../interfaces'

export const initialState: StateWorkbenchResults = {
  loading: false,
  error: '',
  items: [],
}

// A slice for recipes
const workbenchResultsSlice = createSlice({
  name: 'workbenchResults',
  initialState,
  reducers: {
    setWBResultsInitialState: () => initialState,

    // Fetch Workbench history
    loadWBHistory: (state) => {
      state.loading = true
    },

    loadWBHistorySuccess: (state, { payload }:{ payload: CommandExecution[] }) => {
      state.items = payload
      state.loading = false
    },

    loadWBHistoryFailure: (state, { payload }) => {
      state.error = payload
      state.loading = false
    },

    // Process Workbench command to API
    processWBCommand: (state, { payload = '' }: { payload: string }) => {
      if (!payload) return

      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    processWBCommandFailure: (state, { payload }: { payload: CommandExecutionUI }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return { ...item, loading: false, error: payload?.error }
        }
        return item
      })
    },

    sendWBCommand: (state, { payload }: { payload: { command: string, commandId: string } }) => {
      const newItems = [
        { id: payload.commandId, command: payload.command, loading: true, isOpen: true, error: '' },
        ...state.items
      ]

      if (newItems?.length > WORKBENCH_HISTORY_MAX_LENGTH) {
        newItems.pop()
      }

      state.items = newItems
    },

    sendWBCommandSuccess: (state,
      { payload }: { payload: { data: CommandExecution, commandId: string } }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.commandId) {
          return { ...payload.data, loading: false, isOpen: true, error: '' }
        }
        return item
      })
    },

    fetchWBCommandSuccess: (state, { payload }: { payload: CommandExecution }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return { ...item, ...payload, loading: false, isOpen: true, error: '' }
        }
        return item
      })
    },

    deleteWBCommandSuccess: (state, { payload }: { payload: string }) => {
      state.items = [...state.items.filter((item) => item.id !== payload)]
    },

    // toggle open card
    toggleOpenWBResult: (state, { payload }: { payload: string }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, isOpen: !item.isOpen }
        }
        return item
      })
    },

    resetWBHistoryItems: (state) => {
      state.items = []
    }
  },
})

// Actions generated from the slice
export const {
  setWBResultsInitialState,
  loadWBHistory,
  loadWBHistorySuccess,
  loadWBHistoryFailure,
  processWBCommand,
  fetchWBCommandSuccess,
  processWBCommandFailure,
  sendWBCommand,
  sendWBCommandSuccess,
  toggleOpenWBResult,
  deleteWBCommandSuccess,
  resetWBHistoryItems,
} = workbenchResultsSlice.actions

// A selector
export const workbenchResultsSelector = (state: RootState) => state.workbench.results

// The reducer
export default workbenchResultsSlice.reducer

// Asynchronous thunk actions
export function fetchWBHistoryAction(instanceId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadWBHistory())

    try {
      const { data, status } = await apiService.get<CommandExecution[]>(
        getUrl(
          instanceId,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadWBHistorySuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadWBHistoryFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandAction({
  command = '',
  multiCommands = '',
  commandId = `${Date.now()}`,
  onSuccessAction,
  onFailAction,
}: {
  command: string
  multiCommands?: string
  commandId?: string
  onSuccessAction?: (multiCommands: string) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(sendWBCommand({ command, commandId }))

      const { data, status } = await apiService.post<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        ),
        {
          command,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess({ commandId, data }))

        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandClusterAction({
  command = '',
  multiCommands = '',
  options,
  commandId = `${Date.now()}`,
  onSuccessAction,
  onFailAction,
}: {
  command: string
  options: CreateCommandExecutionDto
  commandId?: string
  multiCommands?: string
  onSuccessAction?: (multiCommands: string) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(sendWBCommand({ command, commandId }))

      const { data, status } = await apiService.post<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        ),
        {
          ...options,
          command,
          outputFormat: CliOutputFormatterType.Raw,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess({ commandId, data }))

        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))

      const { data, status } = await apiService.get<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
          commandId
        ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(fetchWBCommandSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function deleteWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))

      const { status } = await apiService.delete<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
          commandId,
        ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteWBCommandSuccess(commandId))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}
