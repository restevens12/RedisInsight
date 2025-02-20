import React from 'react'
import cx from 'classnames'
import { EuiText, EuiTextColor } from '@elastic/eui'

import { numberWithSpaces } from 'uiSrc/utils/numbers'
import ScanMore from '../scan-more'

import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  items: any[]
  scanned?: number
  totalItemsCount?: number
  scanMoreStyle?: {
    [key: string]: string | number;
  }
  loadMoreItems?: (config: any) => void
}

const KeysSummary = (props: Props) => {
  const {
    items = [],
    loading,
    scanned = 0,
    totalItemsCount = 0,
    scanMoreStyle,
    loadMoreItems,
  } = props

  const resultsLength = items.length
  const scannedDisplay = resultsLength > scanned ? resultsLength : scanned

  return (
    <>
      {!!totalItemsCount && (
        <div className={styles.content} data-testid="keys-summary">
          <EuiText size="xs">
            {!!scanned && (
              <>
                <EuiTextColor className="eui-alignMiddle">
                  <b>
                    Results:&nbsp;
                    <span data-testid="keys-number-of-results">{numberWithSpaces(resultsLength)}</span>
                    {' '}
                    key
                    {resultsLength !== 1 && 's'}
                    .&nbsp;
                  </b>
                  <EuiTextColor color="subdued">
                    Scanned
                    {' '}
                    <span data-testid="keys-number-of-scanned">{numberWithSpaces(scannedDisplay)}</span>
                    {' '}
                    /
                    {' '}
                    <span data-testid="keys-total">{numberWithSpaces(totalItemsCount)}</span>
                    {' '}
                    keys
                    <span
                      className={cx([styles.loading, { [styles.loadingShow]: loading }])}
                    />
                  </EuiTextColor>
                </EuiTextColor>
                <ScanMore
                  withAlert
                  fill={false}
                  style={scanMoreStyle}
                  scanned={scanned}
                  totalItemsCount={totalItemsCount}
                  loading={loading}
                  loadMoreItems={loadMoreItems}
                />
              </>
            )}

            {!scanned && (
              <EuiText size="xs">
                <b>
                  Total:&nbsp;
                  {numberWithSpaces(totalItemsCount)}
                </b>
              </EuiText>
            )}
          </EuiText>
        </div>
      )}
      {loading && !totalItemsCount && (
        <EuiText size="xs" data-testid="scanning-text">
          Scanning...
        </EuiText>
      )}
    </>
  )
}

export default KeysSummary
