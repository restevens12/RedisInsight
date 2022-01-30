import React, { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import cx from 'classnames'
import { EuiTextColor } from '@elastic/eui'
import { ListOnScrollProps, VariableSizeList as List } from 'react-window'

import { getFormatTime } from 'uiSrc/utils'
import { DEFAULT_TEXT } from 'uiSrc/components/notifications'

import styles from 'uiSrc/components/monitor/Monitor/styles.module.scss'
import 'react-virtualized/styles.css'

export interface Props {
  compressed: boolean
  items: any[]
  width: number
  height: number
}

const PROTRUDING_OFFSET = 2
const DEFAULT_ITEM_HEIGHT = 17
const LETTER_WIDTH = 8.74

const MonitorOutputList = (props: Props) => {
  const listRef = useRef<any>(null)
  const { compressed, items = [], width = 0, height = 0 } = props
  const [autoScroll, setAutoScroll] = useState(true)
  const [, forceRender] = useState({})

  const handleWheel = ({ scrollOffset }: ListOnScrollProps) => {
    // TODO: setAutoScroll flag
    // setAutoScroll(clientHeight + scrollOffset >= scrollHeight)
  }

  const updateWidth = debounce(() => {
    setTimeout(() => {
      updateItemsHeight()
      forceRender({})
    }, 0)
  }, 50, { maxWait: 100 })

  const updateItemsHeight = debounce(() => {
    listRef.current.resetAfterIndex(0, true)
  }, 100, { maxWait: 100 })

  useEffect(() => {
    // function "handleWheel" after the first render rewrite initial state value "true"
    setAutoScroll(true)

    globalThis.addEventListener('resize', updateWidth)
    return () => {
      globalThis.removeEventListener('resize', updateWidth)
    }
  }, [])

  useEffect(() => {
    if (listRef.current && autoScroll) {
      listRef.current.scrollToItem(items.length - 1)
    }
    updateItemsHeight()
  }, [items])

  useEffect(() => {
    updateWidth()
  }, [width, compressed])

  const getArgs = (args: string[]): JSX.Element => (
    <span className={cx(styles.itemArgs, { [styles.itemArgs__compressed]: compressed })}>
      {args?.map((arg, i) => (
        <span key={`${arg + i}`}>
          {i === 0 && (
            <span className={cx(styles.itemCommandFirst)}>{`"${arg}"`}</span>
          )}
          { i !== 0 && ` "${arg}"`}
        </span>
      ))}
    </span>
  )

  const getItemSize = (index: number, width: number): number => {
    const { time = '', args = [], database = '', source = '' } = items[index]
    const value = `${getFormatTime(time)} [${database} ${source}] "${args.join('" "')}"`

    return DEFAULT_ITEM_HEIGHT * Math.ceil((value.length * LETTER_WIDTH) / width)
  }

  const Row = ({ index, style }: any) => {
    const { time = '', args = [], database = '', source = '', isError, message = '' } = items[index]
    return (
      <div key={index} className={styles.item} style={style}>
        {!isError && (
          <>
            <span>{getFormatTime(time)}</span>
            <span>{`[${database} ${source}]`}</span>
            <span>{getArgs(args)}</span>
          </>
        )}
        {isError && (
          <EuiTextColor color="danger">{message ?? DEFAULT_TEXT}</EuiTextColor>
        )}
      </div>
    )
  }

  return (
    <List
      ref={listRef}
      width={width - PROTRUDING_OFFSET}
      height={height - PROTRUDING_OFFSET}
      itemCount={items.length}
      itemSize={(index: number) => getItemSize(index, width - PROTRUDING_OFFSET)}
      overscanCount={30}
      estimatedItemSize={DEFAULT_ITEM_HEIGHT}
      className={['List', styles.listWrapper].join(' ')}
      onScroll={handleWheel}
    >
      {Row}
    </List>
  )
}

export default MonitorOutputList
