import React, { createContext, forwardRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

import './styles.css'
import { ITableColumn } from './interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

const getRenderedCursor = (children:any[]) =>
  children.reduce(
    (
      [minRow, maxRow, minColumn, maxColumn],
      { props: { columnIndex, rowIndex } }
    ) => {
      if (rowIndex < minRow) {
        minRow = rowIndex
      }
      if (rowIndex > maxRow) {
        maxRow = rowIndex
      }
      if (columnIndex < minColumn) {
        minColumn = columnIndex
      }
      if (columnIndex > maxColumn) {
        maxColumn = columnIndex
      }

      return [minRow, maxRow, minColumn, maxColumn]
    },
    [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    ]
  )

const headerBuilder = (minColumn, maxColumn, columnWidth, stickyHeight, initColumns: ITableColumn[]) => {
  const columns = []

  for (let i = minColumn; i <= maxColumn; i++) {
    columns.push({
      height: stickyHeight,
      width: columnWidth,
      left: i * columnWidth,
      // label: `Sticky Col ${i}`
      label: initColumns[i]?.label
    })
  }

  return columns
}

const columnsBuilder = (minRow, maxRow, rowHeight, stickyWidth, labels: any[]) => {
  const rows = []

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({
      height: rowHeight,
      width: stickyWidth,
      top: i * rowHeight,
      id: labels[i],
      label: labels[i]
    })
  }

  return rows
}

const StickyHeader = ({ stickyHeight, stickyWidth, headerColumns, columnBase }: any) => {
  const baseStyle = {
    height: stickyHeight,
    width: stickyWidth
  }
  const scrollableStyle = { left: stickyWidth }

  return (
    <div className="sticky-grid__header">
      <div className="sticky-grid__header__base" style={baseStyle}>
        {columnBase?.label}
      </div>
      <div className="sticky-grid__header__scrollable" style={scrollableStyle}>
        {headerColumns.map(({ label, ...style }, i) => (
          <div
            className="sticky-grid__header__scrollable__column"
            style={style}
            key={i}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

const StickyColumns = ({ rows, stickyHeight, stickyWidth }: any) => {
  const leftSideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: `calc(100% - ${stickyHeight}px)`
  }

  return (
    <div
      className="sticky-grid__sticky-columns__container"
      style={leftSideStyle}
    >
      {rows.map(({ label, id, ...style }, i) => (
        <div className="sticky-grid__sticky-columns__row" style={style} key={i}>
          {label}
          <div className="test-actions">123</div>
        </div>
      ))}
    </div>
  )
}

const StickyGridContext = createContext()
StickyGridContext.displayName = 'StickyGridContext'

const innerGridElementType = forwardRef(({ children, ...rest }: any, ref) => (
  <StickyGridContext.Consumer>
    {({
      stickyHeight,
      stickyWidth,
      headerBuilder,
      columnsBuilder,
      columnWidth,
      firstColumnData,
      columns: [columnBase, ...columns],
      rowHeight
    }: any) => {
      const [minRow, maxRow, minColumn, maxColumn] = getRenderedCursor(
        children
      ) // TODO maybe there is more elegant way to get this
      const headerColumns = headerBuilder(
        minColumn,
        maxColumn,
        columnWidth,
        stickyHeight,
        columns
      )
      const leftSideRows = columnsBuilder(
        minRow,
        maxRow,
        rowHeight,
        stickyWidth,
        firstColumnData,
      )
      const rightSideRows = columnsBuilder(
        minRow,
        maxRow,
        rowHeight,
        stickyWidth,
        firstColumnData,
      )
      const containerStyle = {
        ...rest.style,
        width: `${parseFloat(rest.style.width) + stickyWidth}px`,
        height: `${parseFloat(rest.style.height) + stickyHeight}px`
      }
      const containerProps = { ...rest, style: containerStyle }
      const gridDataContainerStyle = { top: stickyHeight, left: stickyWidth }

      return (
        <div className="sticky-grid__container" ref={ref} {...containerProps}>
          <StickyHeader
            columnBase={columnBase}
            headerColumns={headerColumns}
            stickyHeight={stickyHeight}
            stickyWidth={stickyWidth}
          />
          <StickyColumns
            rows={leftSideRows}
            stickyHeight={stickyHeight}
            stickyWidth={stickyWidth}
          />

          <div
            className="sticky-grid__data__container"
            style={gridDataContainerStyle}
          >
            {children}
          </div>

          {/* <StickyColumns
            rows={rightSideRows}
            stickyHeight={stickyHeight}
            stickyWidth={20}
          /> */}
        </div>
      )
    }}
  </StickyGridContext.Consumer>
))

const VirtualTableGrid = ({
  stickyHeight,
  stickyWidth,
  columnWidth,
  rowHeight,
  children,
  loadMoreItems,
  totalItemsCount,
  columns,
  firstColumnData,
  ...rest
}:any) => {
  const isItemLoaded = ({ index }: any) => !!children[index]

  return (
    <StickyGridContext.Provider
      value={{
        stickyHeight,
        stickyWidth,
        columnWidth,
        rowHeight,
        columns,
        firstColumnData,
        headerBuilder,
        columnsBuilder
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            minimumBatchSize={SCAN_COUNT_DEFAULT}
            threshold={100}
            loadMoreItems={loadMoreItems}
            itemCount={totalItemsCount}
          >
            {({ onItemsRendered, ref }) => (
              <Grid
                height={height}
                width={width}
                columnWidth={columnWidth}
                rowHeight={rowHeight}
                innerElementType={innerGridElementType}
                noItem
                onItemsRendered={({
                  visibleRowStartIndex,
                  visibleRowStopIndex,
                  overscanRowStopIndex,
                  overscanRowStartIndex,
                }) => {
                // props.setScrollRowAndColumn(visibleRowStartIndex, visibleColumnStartIndex)
                  onItemsRendered({
                    overscanStartIndex: overscanRowStartIndex,
                    overscanStopIndex: overscanRowStopIndex,
                    visibleStartIndex: visibleRowStartIndex,
                    visibleStopIndex: visibleRowStopIndex,
                  })
                }}
                ref={ref}
                {...rest}
              >
                {children}
              </Grid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </StickyGridContext.Provider>
  )
}

export default VirtualTableGrid
