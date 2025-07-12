interface UsageData {
  tokens: {
    input: number
    output: number
    cacheCreation?: number
    cacheRead?: number
  }
  estimatedCost: number
  modelsUsed?: string[]
  daily?: Array<{
    date: string
    inputTokens: number
    outputTokens: number
    cacheCreationTokens?: number
    cacheReadTokens?: number
    totalCost: number
    modelsUsed: string[]
  }>
}

declare global {
  interface Window {
    electronAPI: {
      getUsageData: () => Promise<UsageData>
      onUsageUpdate: (callback: (data: UsageData) => void) => void
    }
  }
}

class App {
  private container: HTMLElement
  private usage: UsageData | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.init()
  }

  private async init() {
    this.render(true)
    
    try {
      this.usage = await window.electronAPI.getUsageData()
      this.render()
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      this.renderError()
    }

    window.electronAPI.onUsageUpdate((data) => {
      this.usage = data
      this.render()
    })
  }

  private render(loading = false) {
    if (loading) {
      this.container.innerHTML = '<div class="app loading">Loading...</div>'
      return
    }

    if (!this.usage) {
      this.renderError()
      return
    }

    this.container.innerHTML = `
      <div class="app">
        <header class="app-header">
          <h1>Claude Code Usage</h1>
        </header>
        
        <main class="usage-stats">
          <div class="stat-card">
            <h2>Tokens</h2>
            <div class="token-stats">
              <div class="stat-item">
                <span class="label">Input:</span>
                <span class="value">${this.usage.tokens.input.toLocaleString()}</span>
              </div>
              <div class="stat-item">
                <span class="label">Output:</span>
                <span class="value">${this.usage.tokens.output.toLocaleString()}</span>
              </div>
              ${this.usage.tokens.cacheCreation ? `
              <div class="stat-item">
                <span class="label">Cache Creation:</span>
                <span class="value">${this.usage.tokens.cacheCreation.toLocaleString()}</span>
              </div>
              ` : ''}
              ${this.usage.tokens.cacheRead ? `
              <div class="stat-item">
                <span class="label">Cache Read:</span>
                <span class="value">${this.usage.tokens.cacheRead.toLocaleString()}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="stat-card">
            <h2>Estimated Cost</h2>
            <div class="value large">$${this.usage.estimatedCost.toFixed(2)}</div>
          </div>

          ${this.usage.modelsUsed && this.usage.modelsUsed.length > 0 ? `
            <div class="stat-card">
              <h2>Models Used</h2>
              <div class="models-list">
                ${this.usage.modelsUsed.map(model => `<span class="model-tag">${model}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </main>
        
        <footer class="app-footer">
          <button class="refresh-btn" id="refresh-btn">Refresh</button>
          <button class="settings-btn" id="settings-btn">Settings</button>
        </footer>
      </div>
    `

    this.attachEventListeners()
  }

  private renderError() {
    this.container.innerHTML = '<div class="app error">Failed to load usage data</div>'
  }

  private attachEventListeners() {
    const refreshBtn = document.getElementById('refresh-btn')
    const settingsBtn = document.getElementById('settings-btn')

    refreshBtn?.addEventListener('click', async () => {
      try {
        this.usage = await window.electronAPI.getUsageData()
        this.render()
      } catch (error) {
        console.error('Failed to refresh data:', error)
      }
    })

    settingsBtn?.addEventListener('click', () => {
      console.log('Settings clicked')
      // TODO: Implement settings window
    })
  }
}

export default App
