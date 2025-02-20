import React from 'react'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { formatNameShort, Maybe } from 'uiSrc/utils'
import styles from './styles.module.scss'

// TODO: use i18n file for texts
export default {
  ADDED_NEW_INSTANCE: (instanceName: string) => ({
    title: 'Database has been added',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b>
        {' '}
        has been added to RedisInsight.
      </>
    ),
  }),
  DELETE_INSTANCE: (instanceName: string) => ({
    title: 'Database has been deleted',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b>
        {' '}
        has been deleted from RedisInsight.
      </>
    ),
  }),
  DELETE_INSTANCES: (instanceNames: Maybe<string>[]) => {
    const limitShowRemovedInstances = 10
    return {
      title: 'Databases have been deleted',
      message: (
        <>
          <span>
            <b>{instanceNames.length}</b>
            {' '}
            databases have been deleted from RedisInsight:
          </span>
          <ul style={{ marginBottom: 0 }}>
            {instanceNames.slice(0, limitShowRemovedInstances).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className={styles.list} key={i}>
                {formatNameShort(el)}
              </li>
            ))}
            {instanceNames.length >= limitShowRemovedInstances && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  ADDED_NEW_KEY: (keyName: string) => ({
    title: 'Key has been added',
    message: (
      <>
        <b>{formatNameShort(keyName)}</b>
        {' '}
        has been added. Please refresh the list of Keys to see
        updates.
      </>
    ),
  }),
  DELETED_KEY: (keyName: string) => ({
    title: 'Key has been deleted',
    message: (
      <>
        <b>{formatNameShort(keyName)}</b>
        {' '}
        has been deleted.
      </>
    ),
  }),
  REMOVED_KEY_VALUE: (keyName: string, keyValue: string, valueType: string) => ({
    title: (
      <>
        <span>{valueType}</span>
        {' '}
        has been removed
      </>
    ),
    message: (
      <>
        <b>{formatNameShort(keyValue)}</b>
        {' '}
        has been removed from &nbsp;
        <b>{formatNameShort(keyName)}</b>
      </>
    ),
  }),
  REMOVED_LIST_ELEMENTS: (keyName: string, numberOfElements: number, listOfElements: string[]) => {
    const limitShowRemovedElements = 10
    return {
      title: 'Elements have been removed',
      message: (
        <>
          <span>
            {`${numberOfElements} Element(s) removed from ${formatNameShort(keyName)}:`}
          </span>
          <ul style={{ marginBottom: 0 }}>
            {listOfElements.slice(0, limitShowRemovedElements).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className={styles.list} key={i}>
                {formatNameShort(el)}
              </li>
            ))}
            {listOfElements.length >= limitShowRemovedElements && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  INSTALLED_NEW_UPDATE: (updateDownloadedVersion: string, onClickLink?: () => void) => ({
    title: 'Application updated',
    message: (
      <>
        <span>{`Your application has been updated to ${updateDownloadedVersion}. Find more information in `}</span>
        <a href={EXTERNAL_LINKS.releaseNotes} onClick={() => onClickLink?.()} className="link-underline" target="_blank" rel="noreferrer">Release Notes.</a>
      </>
    ),
    group: 'upgrade'
  }),
}
