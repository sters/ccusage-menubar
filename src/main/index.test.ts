import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { app, ipcMain } from 'electron'

vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn(),
    on: vi.fn(),
    quit: vi.fn()
  },
  ipcMain: {
    handle: vi.fn()
  },
  BrowserWindow: vi.fn()
}))

vi.mock('menubar', () => ({
  menubar: vi.fn(() => ({
    on: vi.fn()
  }))
}))

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true)
}))

describe('Main Process', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  it('should initialize app when ready', async () => {
    const readyPromise = Promise.resolve()
    vi.mocked(app.whenReady).mockReturnValue(readyPromise)

    await import('./index')

    expect(app.whenReady).toHaveBeenCalled()
  })

  it('should handle window-all-closed event', async () => {
    const mockOn = vi.mocked(app.on)
    
    const readyPromise = Promise.resolve()
    vi.mocked(app.whenReady).mockReturnValue(readyPromise)
    
    await import('./index')

    const windowAllClosedHandler = mockOn.mock.calls.find(
      call => call[0] === 'window-all-closed'
    )?.[1] as Function

    expect(windowAllClosedHandler).toBeDefined()

    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    })
    windowAllClosedHandler()
    expect(app.quit).toHaveBeenCalled()

    vi.clearAllMocks()
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true
    })
    windowAllClosedHandler()
    expect(app.quit).not.toHaveBeenCalled()
  })

  it('should handle get-usage-data IPC call', async () => {
    const mockHandle = vi.mocked(ipcMain.handle)

    const readyPromise = Promise.resolve()
    vi.mocked(app.whenReady).mockReturnValue(readyPromise)

    await import('./index')

    const handler = mockHandle.mock.calls.find(
      call => call[0] === 'get-usage-data'
    )?.[1] as Function

    expect(handler).toBeDefined()

    const result = await handler()
    expect(result).toEqual({
      tokens: {
        input: 1234,
        output: 5678,
        total: 6912
      },
      requests: 42,
      estimatedCost: 1.23
    })
  })
})