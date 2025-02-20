import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import HashDetails, { Props } from './HashDetails'

const mockedProps = mock<Props>()
const fields = [
  { field: 'field', value: '123' },
  { field: 'field2', value: '1' },
  { field: 'field3', value: '5' },
]

jest.mock('uiSrc/slices/browser/hash', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
  return ({
    hashSelector: jest.fn().mockReturnValue(defaultState),
    updateHashValueStateSelector: jest.fn().mockReturnValue(defaultState.updateValue),
    hashDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: '123zxczxczxc',
      fields
    }),
    setHashInitialState: jest.fn,
    fetchHashFields: () => jest.fn
  })
})

describe('HashDetails', () => {
  it('should render', () => {
    expect(render(<HashDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<HashDetails {...instance(mockedProps)} />)
    const rows = container.querySelectorAll('.ReactVirtualized__Table__row[role="row"]')
    expect(rows).toHaveLength(fields.length)
  })

  it('should render search input', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(
      searchInput,
      { target: { value: '*1*' } }
    )
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    fireEvent(
      screen.getAllByTestId(/remove-hash-button/)[0],
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(screen.getByTestId(`remove-hash-button-${fields[0].field}-icon`)).toBeInTheDocument()
  })

  it('should render editor after click edit button', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    fireEvent(
      screen.getAllByTestId(/edit-hash-button/)[0],
      new MouseEvent('click', {
        bubbles: true,
      })
    )
    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
  })
})
