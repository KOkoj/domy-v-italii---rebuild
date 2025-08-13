import { render, screen } from '@testing-library/react'
import { EnvWidget } from '../EnvWidget'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ status: 200 })),
  },
}))

describe('EnvWidget Component', () => {
  it('renders environment information', () => {
    render(<EnvWidget />)

    expect(screen.getByText('Environment')).toBeInTheDocument()
    expect(screen.getByText(/API URL:/)).toBeInTheDocument()
    expect(screen.getByText('API Server')).toBeInTheDocument()
    expect(screen.getByText('Health Check')).toBeInTheDocument()
  })

  it('displays the correct API URL', () => {
    render(<EnvWidget />)
    expect(screen.getByText('http://localhost:3001/api')).toBeInTheDocument()
  })

  it('has a refresh button', () => {
    render(<EnvWidget />)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })
})
