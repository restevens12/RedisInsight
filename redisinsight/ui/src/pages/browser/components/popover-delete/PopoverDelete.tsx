import React from 'react'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  header?: string
  text: JSX.Element | string
  item: string
  suffix: string
  deleting: string
  closePopover: () => void
  showPopover: (item: string) => void
  updateLoading: boolean
  handleDeleteItem: (item: string) => void
  handleButtonClick?: () => void
  appendInfo?: JSX.Element | string | null
  testid?: string
}

const PopoverDelete = (props: Props) => {
  const {
    header,
    text,
    item,
    suffix,
    deleting,
    closePopover,
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    testid = '',
  } = props

  const onButtonClick = () => {
    if (item + suffix !== deleting) {
      showPopover(item)
      handleButtonClick?.()
    } else {
      closePopover()
    }
  }

  return (
    <EuiPopover
      key={item}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="m"
      anchorClassName="deleteFieldPopover"
      button={(
        <EuiButtonIcon
          iconType="trash"
          aria-label="Remove field"
          color="primary"
          disabled={updateLoading}
          onClick={onButtonClick}
          data-testid={testid ? `${testid}-icon` : 'remove-icon'}
        />
      )}
    >
      <div className={styles.popover}>
        <EuiText size="m">
          {!!header && (
            <h4>
              <b>{header}</b>
            </h4>
          )}
          <EuiText size="s">
            {text}
          </EuiText>
          {appendInfo}
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            onClick={() => handleDeleteItem(item)}
            data-testid={testid || 'remove'}
          >
            Remove
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default PopoverDelete
