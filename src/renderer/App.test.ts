import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

describe('App', () => {
  let container: HTMLElement
  let mockGetUsageData: ReturnType<typeof vi.fn>
  let mockOnUsageUpdate: ReturnType<typeof vi.fn>

  const mockUsageData = {
    tokens: {
      input: 1000,
      output: 2000,
      cacheCreation: 100,
      cacheRead: 200
    },
    estimatedCost: 5.50,
    modelsUsed: ['claude-3-opus', 'claude-3-sonnet'],
    daily: [
      {
        date: '2024-01-01',
        inputTokens: 500,
        outputTokens: 1000,
        cacheCreationTokens: 50,
        cacheReadTokens: 100,
        totalCost: 2.75,
        modelsUsed: ['claude-3-opus']
      }
    ]
  }

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app'
    document.body.appendChild(container)

    mockGetUsageData = vi.fn().mockResolvedValue(mockUsageData)
    mockOnUsageUpdate = vi.fn()

    window.electronAPI = {
      getUsageData: mockGetUsageData,
      onUsageUpdate: mockOnUsageUpdate,
      quit: vi.fn()
    }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    new App(container)
    expect(container.innerHTML).toContain('Loading...')
  })

  it('should render usage data after loading', async () => {
    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Claude Code Usage')
      expect(container.innerHTML).toContain('1,000')
      expect(container.innerHTML).toContain('2,000')
      expect(container.innerHTML).toContain('100')
      expect(container.innerHTML).toContain('200')
      expect(container.innerHTML).toContain('$5.50')
      expect(container.innerHTML).toContain('claude-3-opus')
      expect(container.innerHTML).toContain('claude-3-sonnet')
    })
  })

  it('should render error when data fetch fails', async () => {
    mockGetUsageData.mockRejectedValue(new Error('Failed to fetch'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Failed to load usage data')
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch usage data:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should handle refresh button click', async () => {
    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Refresh')
    })

    const refreshBtn = container.querySelector('#refresh-btn') as HTMLButtonElement
    expect(refreshBtn).toBeTruthy()

    mockGetUsageData.mockClear()
    await refreshBtn.click()

    expect(mockGetUsageData).toHaveBeenCalledTimes(1)
  })

  it('should handle quit button click', async () => {
    const mockQuit = vi.mocked(window.electronAPI.quit)
    
    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Quit')
    })

    const quitBtn = container.querySelector('#quit-btn') as HTMLButtonElement
    expect(quitBtn).toBeTruthy()

    await quitBtn.click()

    expect(mockQuit).toHaveBeenCalledTimes(1)
  })

  it('should update display when usage data changes', async () => {
    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('1,000')
    })

    const updateCallback = mockOnUsageUpdate.mock.calls[0][0]
    const newData = {
      tokens: {
        input: 2000,
        output: 3000,
        cacheCreation: 150,
        cacheRead: 250
      },
      estimatedCost: 10.00,
      modelsUsed: ['claude-3-opus'],
      daily: []
    }

    updateCallback(newData)

    expect(container.innerHTML).toContain('2,000')
    expect(container.innerHTML).toContain('3,000')
    expect(container.innerHTML).toContain('150')
    expect(container.innerHTML).toContain('250')
    expect(container.innerHTML).toContain('$10.00')
  })

  it('should handle refresh error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    new App(container)
    
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Refresh')
    })

    const refreshBtn = container.querySelector('#refresh-btn') as HTMLButtonElement
    
    mockGetUsageData.mockRejectedValueOnce(new Error('Refresh failed'))
    await refreshBtn.click()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh data:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})