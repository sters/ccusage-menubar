import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Renderer index', () => {
  let mockApp: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    
    mockApp = vi.fn()
    vi.doMock('./App', () => ({
      default: mockApp
    }))

    window.electronAPI = {
      getUsageData: vi.fn(),
      onUsageUpdate: vi.fn(),
      quit: vi.fn()
    }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should create App instance when DOM is loaded', async () => {
    await import('./index')
    
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)

    expect(mockApp).toHaveBeenCalledTimes(1)
    expect(mockApp).toHaveBeenCalledWith(document.getElementById('app'))
  })

  it('should not create App if root element is missing', async () => {
    document.body.innerHTML = ''
    
    await import('./index')
    
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)

    expect(mockApp).not.toHaveBeenCalled()
  })
})