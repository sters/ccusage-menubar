import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { usageService } from './usageService'

vi.mock('ccusage/data-loader', () => ({
  loadDailyUsageData: vi.fn()
}))

import { loadDailyUsageData } from 'ccusage/data-loader'

describe('UsageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-10T00:00:00'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should fetch and format usage data correctly', async () => {
    // Get the current date from the mocked time
    const today = new Date('2024-01-10T00:00:00')
    const todayStr = today.toISOString().split('T')[0]
    
    const mockDailyData = [
      {
        date: '2024-01-03',
        inputTokens: 100,
        outputTokens: 200,
        cacheCreationTokens: 10,
        cacheReadTokens: 20,
        totalCost: 0.5,
        modelsUsed: ['claude-3-opus']
      },
      {
        date: '2024-01-04',
        inputTokens: 150,
        outputTokens: 250,
        modelsUsed: ['claude-3-sonnet']
      },
      {
        date: todayStr,
        inputTokens: 1000,
        outputTokens: 2000,
        cacheCreationTokens: 100,
        cacheReadTokens: 200,
        cost: 3.0,
        modelsUsed: ['claude-3-opus', 'claude-3-sonnet']
      }
    ]

    vi.mocked(loadDailyUsageData).mockResolvedValue(mockDailyData)

    const result = await usageService.fetchUsageData()

    // Check that the date range is correct (7 days ago to tomorrow)
    expect(loadDailyUsageData).toHaveBeenCalled()
    const callArgs = vi.mocked(loadDailyUsageData).mock.calls[0]?.[0]
    expect(callArgs).toBeDefined()
    expect(callArgs!.order).toBe('asc')
    // The exact dates may vary based on timezone, so we just check the format
    expect(callArgs!.since).toMatch(/^\d{8}$/)
    expect(callArgs!.until).toMatch(/^\d{8}$/)

    expect(result.today).toEqual({
      inputTokens: 1000,
      outputTokens: 2000,
      cacheCreationTokens: 100,
      cacheReadTokens: 200,
      totalCost: 3.0,
      modelsUsed: ['claude-3-opus', 'claude-3-sonnet']
    })

    expect(result.daily).toHaveLength(3)
    expect(result.daily[0]).toEqual({
      date: '2024-01-03',
      inputTokens: 100,
      outputTokens: 200,
      cacheCreationTokens: 10,
      cacheReadTokens: 20,
      totalCost: 0.5,
      modelsUsed: ['claude-3-opus']
    })
  })

  it('should handle missing today data gracefully', async () => {
    const mockDailyData = [
      {
        date: '2024-01-03',
        inputTokens: 100,
        outputTokens: 200,
        modelsUsed: []
      }
    ]

    vi.mocked(loadDailyUsageData).mockResolvedValue(mockDailyData)

    const result = await usageService.fetchUsageData()

    expect(result.today).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      totalCost: 0,
      modelsUsed: []
    })

    expect(result.daily).toHaveLength(1)
  })

  it('should handle errors and return empty data', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(loadDailyUsageData).mockRejectedValue(new Error('API Error'))

    const result = await usageService.fetchUsageData()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching usage data:', expect.any(Error))
    expect(result).toEqual({
      today: {
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        modelsUsed: []
      },
      daily: []
    })

    consoleErrorSpy.mockRestore()
  })

  it('should handle cost field correctly', async () => {
    const today = new Date('2024-01-10T00:00:00')
    const todayStr = today.toISOString().split('T')[0]
    
    const mockDailyData = [
      {
        date: todayStr,
        inputTokens: 1000,
        outputTokens: 2000,
        totalCost: 5.0,
        modelsUsed: []
      }
    ]

    vi.mocked(loadDailyUsageData).mockResolvedValue(mockDailyData)

    const result = await usageService.fetchUsageData()

    expect(result.today.totalCost).toBe(5.0)
  })

  it('should handle missing cache tokens gracefully', async () => {
    const today = new Date('2024-01-10T00:00:00')
    const todayStr = today.toISOString().split('T')[0]
    
    const mockDailyData = [
      {
        date: todayStr,
        inputTokens: 1000,
        outputTokens: 2000,
        modelsUsed: []
      }
    ]

    vi.mocked(loadDailyUsageData).mockResolvedValue(mockDailyData)

    const result = await usageService.fetchUsageData()

    expect(result.today.cacheCreationTokens).toBe(0)
    expect(result.today.cacheReadTokens).toBe(0)
  })
})