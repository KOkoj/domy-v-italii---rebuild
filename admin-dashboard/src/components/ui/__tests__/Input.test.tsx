import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Test" error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays hint message', () => {
    render(<Input label="Test" hint="Test hint" />)
    expect(screen.getByText('Test hint')).toBeInTheDocument()
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input label="Test" onChange={handleChange} />)

    const input = screen.getByLabelText('Test')
    await user.type(input, 'test value')

    expect(handleChange).toHaveBeenCalled()
  })

  it('applies error styles when error is present', () => {
    render(<Input label="Test" error="Test error" />)
    const input = screen.getByLabelText('Test')
    expect(input).toHaveClass('border-red-500')
  })
})
