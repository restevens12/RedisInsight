import { createBrowserHistory } from 'history'
import { configureStore, combineReducers } from '@reduxjs/toolkit'

import instancesReducer from './instances/instances'
import caCertsReducer from './instances/caCerts'
import clientCertsReducer from './instances/clientCerts'
import clusterReducer from './instances/cluster'
import cloudReducer from './instances/cloud'
import sentinelReducer from './instances/sentinel'
import keysReducer from './browser/keys'
import stringReducer from './browser/string'
import zsetReducer from './browser/zset'
import setReducer from './browser/set'
import hashReducer from './browser/hash'
import listReducer from './browser/list'
import rejsonReducer from './browser/rejson'
import streamReducer from './browser/stream'
import notificationsReducer from './app/notifications'
import cliSettingsReducer from './cli/cli-settings'
import outputReducer from './cli/cli-output'
import monitorReducer from './cli/monitor'
import userSettingsReducer from './user/user-settings'
import appInfoReducer from './app/info'
import appContextReducer from './app/context'
import appRedisCommandsReducer from './app/redis-commands'
import appPluginsReducer from './app/plugins'
import workbenchResultsReducer from './workbench/wb-results'
import workbenchGuidesReducer from './workbench/wb-guides'
import workbenchTutorialsReducer from './workbench/wb-tutorials'
import contentCreateRedisButtonReducer from './content/create-redis-buttons'
import slowLogReducer from './slowlog/slowlog'

export const history = createBrowserHistory()

export const rootReducer = combineReducers({
  app: combineReducers({
    info: appInfoReducer,
    notifications: notificationsReducer,
    context: appContextReducer,
    redisCommands: appRedisCommandsReducer,
    plugins: appPluginsReducer
  }),
  connections: combineReducers({
    instances: instancesReducer,
    caCerts: caCertsReducer,
    clientCerts: clientCertsReducer,
    cluster: clusterReducer,
    cloud: cloudReducer,
    sentinel: sentinelReducer,
  }),
  browser: combineReducers({
    keys: keysReducer,
    string: stringReducer,
    zset: zsetReducer,
    set: setReducer,
    hash: hashReducer,
    list: listReducer,
    rejson: rejsonReducer,
    stream: streamReducer,
  }),
  cli: combineReducers({
    settings: cliSettingsReducer,
    output: outputReducer,
    monitor: monitorReducer,
  }),
  user: combineReducers({
    settings: userSettingsReducer,
  }),
  workbench: combineReducers({
    results: workbenchResultsReducer,
    guides: workbenchGuidesReducer,
    tutorials: workbenchTutorialsReducer,
  }),
  content: combineReducers({
    createRedisButtons: contentCreateRedisButtonReducer,
  }),
  slowlog: slowLogReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
