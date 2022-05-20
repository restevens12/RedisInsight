import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { last, isNull } from 'lodash'
import cx from 'classnames'
import { EuiButtonIcon, EuiProgress } from '@elastic/eui'

import {
  fetchMoreStreamEntries,
  fetchStreamEntries,
  updateStart,
  updateEnd,
  streamDataSelector,
  streamSelector,
  streamRangeSelector,
} from 'uiSrc/slices/browser/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import RangeFilter from 'uiSrc/components/range-filter/RangeFilter'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import { getTimestampFromId } from 'uiSrc/utils/streamUtils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const actionsWidth = 54
const minColumnWidth = 190
const xrangeIdPrefix = '('
const noItemsMessageString = 'There are no Entries in the Stream.'

interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

export interface Props {
  data: IStreamEntry[]
  columns: ITableColumn[]
  onEditEntry: (entryId:string, editing: boolean) => void
  onClosePopover: () => void
  isFooterOpen?: boolean
}

const StreamDetails = (props: Props) => {
  const { data: entries = [], columns = [], onClosePopover, isFooterOpen } = props
  const dispatch = useDispatch()

  const { loading } = useSelector(streamSelector)
  const { start, end } = useSelector(streamRangeSelector)
  const {
    total,
    firstEntry,
    lastEntry,
  } = useSelector(streamDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const shouldFilterRender = !isNull(firstEntry) && (firstEntry.id !== '') && !isNull(lastEntry) && lastEntry.id !== ''

  const [sortedColumnName, setSortedColumnName] = useState<string>('id')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(SortOrder.DESC)

  const loadMoreItems = () => {
    const lastLoadedEntryId = last(entries)?.id
    const lastLoadedEntryTimeStamp = getTimestampFromId(lastLoadedEntryId)

    const lastRangeEntryTimestamp = end ? parseInt(end, 10) : getTimestampFromId(lastEntry?.id)
    const firstRangeEntryTimestamp = start ? parseInt(start, 10) : getTimestampFromId(firstEntry?.id)
    const shouldLoadMore = () => {
      if (!lastLoadedEntryTimeStamp) {
        return false
      }
      return sortedColumnOrder === SortOrder.ASC
        ? lastLoadedEntryTimeStamp > lastRangeEntryTimestamp
        : lastLoadedEntryTimeStamp < firstRangeEntryTimestamp
    }
    const previousLoadedString = `${xrangeIdPrefix + lastLoadedEntryId}`

    if (shouldLoadMore()) {
      dispatch(
        fetchMoreStreamEntries(
          key,
          sortedColumnOrder === SortOrder.DESC ? start : previousLoadedString,
          sortedColumnOrder === SortOrder.DESC ? previousLoadedString : end,
          SCAN_COUNT_DEFAULT,
          sortedColumnOrder,
        )
      )
    }
  }

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, order, false))
  }

  const handleChangeStartFilter = useCallback(
    (value: number) => {
      dispatch(updateStart(value.toString()))
    },
    []
  )

  const handleChangeEndFilter = useCallback(
    (value: number) => {
      dispatch(updateEnd(value.toString()))
    },
    []
  )

  const handleResetFilter = useCallback(
    () => {
      dispatch(updateStart(firstEntryTimeStamp.toString()))
      dispatch(updateEnd(lastEntryTimeStamp.toString()))
      sendEventTelemetry({
        event: TelemetryEvent.STREAM_DATA_FILTER_RESET,
        eventData: {
          databaseId: instanceId,
          total,
        }
      })
    },
    []
  )

  const firstEntryTimeStamp = useMemo(() => getTimestampFromId(firstEntry?.id), [firstEntry?.id])
  const lastEntryTimeStamp = useMemo(() => getTimestampFromId(lastEntry?.id), [lastEntry?.id])

  const startNumber = useMemo(() => (start === '' ? 0 : parseInt(start, 10)), [start])
  const endNumber = useMemo(() => (end === '' ? 0 : parseInt(end, 10)), [end])

  useEffect(() => {
    if (start === '' && firstEntry?.id !== '') {
      dispatch(updateStart(firstEntryTimeStamp.toString()))
    }
  }, [firstEntryTimeStamp])

  useEffect(() => {
    if (end === '' && lastEntry?.id !== '') {
      dispatch(updateEnd(lastEntryTimeStamp.toString()))
    }
  }, [lastEntryTimeStamp])

  useEffect(() => {
    if (start !== '' && end !== '') {
      dispatch(fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        sortedColumnOrder,
        false
      ))
    }
  }, [start, end])

  return (
    <>
      {shouldFilterRender ? (
        <RangeFilter
          max={lastEntryTimeStamp}
          min={firstEntryTimeStamp}
          start={startNumber}
          end={endNumber}
          handleChangeStart={handleChangeStartFilter}
          handleChangeEnd={handleChangeEndFilter}
          handleReset={handleResetFilter}
        />
      )
        : (
          <div className={styles.rangeWrapper}>
            <div className={cx(styles.sliderTrack, styles.mockRange)} />
          </div>
        )}
      <div
        className={cx(
          'key-details-table',
          'stream-entries-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-test-id="stream-entries-container"
      >
        {loading && (
          <EuiProgress
            color="primary"
            size="xs"
            position="absolute"
            data-testid="progress-key-stream"
          />
        )}
        {/* <div className={styles.columnManager}>
          <EuiButtonIcon iconType="boxesVertical" aria-label="manage columns" />
        </div> */}
        <VirtualTable
          hideProgress
          selectable={false}
          keyName={key}
          headerHeight={entries?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={entries}
          totalItemsCount={total}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
          tableWidth={columns.length * minColumnWidth - actionsWidth}
          sortedColumn={entries?.length ? {
            column: sortedColumnName,
            order: sortedColumnOrder,
          } : undefined}
        />
      </div>
    </>
  )
}

export default StreamDetails
