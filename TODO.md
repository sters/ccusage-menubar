# CCUsage Menubar - Project TODO List

A menubar application that displays Claude Code usage information using the `ccusage` npm package and `menubar` for Electron integration.

## Phase 1: Foundation & Setup
- [x] **Set up Electron app with menubar**
  - Configure Electron main process
  - Integrate menubar package
  - Set up TypeScript for Electron
  - Configure development environment with hot reload

- [ ] **Configure Claude Code authentication**
  - Handle API key storage securely
  - Support for environment variables
  - Keychain/credential manager integration
  - Session management

## Phase 2: Core Claude Code Integration
- [ ] **Implement ccusage integration**
  - Initialize ccusage client
  - Handle authentication errors
  - Implement retry logic for API failures
  - Parse usage data (tokens, requests, costs)

- [ ] **Create usage tracking service**
  - Fetch current usage statistics
  - Track token usage (input/output)
  - Monitor API request counts
  - Calculate costs based on usage
  - Historical usage tracking

- [ ] **Implement data caching**
  - Cache usage data locally
  - Configurable cache TTL
  - Background refresh
  - Real-time usage updates

## Phase 3: UI/UX Implementation
- [x] **Design menubar icon** (Basic implementation)
  - Show usage indicator (tokens/requests)
  - Color coding for usage levels
  - Support for light/dark themes
  - Loading state indicator

- [x] **Implement dropdown menu** (Mocked data)
  - Current session token usage
  - Today's usage statistics
  - Model breakdown (Claude 3.5, etc.)
  - Usage trend indicators
  - Quick actions (refresh, settings, quit)

- [ ] **Create detailed view window**
  - Token usage breakdown (input/output)
  - API request history
  - Cost estimates
  - Usage graphs and charts
  - Export functionality

## Phase 4: User Experience
- [ ] **Add auto-refresh mechanism**
  - Real-time usage updates
  - Configurable refresh intervals
  - Manual refresh option
  - Efficient API polling

- [ ] **Implement settings window**
  - API key configuration
  - Usage display preferences
  - Refresh interval settings
  - Usage alert thresholds
  - Notification preferences
  - Theme selection

- [ ] **Add notification system**
  - High usage alerts
  - Daily usage summaries
  - Rate limit warnings
  - Token quota alerts

## Phase 5: Advanced Features
- [ ] **Multi-project support**
  - Track usage across different projects
  - Project switcher in UI
  - Consolidated usage view
  - Per-project breakdown

- [ ] **Usage analytics**
  - Token efficiency metrics
  - Peak usage times
  - Model usage comparison
  - Cost optimization tips

- [ ] **Usage limits and budgets**
  - Set daily/monthly limits
  - Visual quota tracking
  - Usage vs limit comparison
  - Alerts before hitting limits

## Phase 6: Polish & Distribution
- [ ] **Performance optimization**
  - Minimize memory usage
  - Efficient data structures
  - Lazy loading for detailed views
  - Background worker for API calls

- [ ] **Security hardening**
  - Encrypt stored credentials
  - Secure IPC communication
  - Content Security Policy
  - Regular dependency updates

- [ ] **Package for distribution**
  - macOS: .dmg with code signing
  - Windows: .exe installer
  - Auto-update mechanism
  - App notarization for macOS

- [ ] **Documentation**
  - Setup guide for AWS credentials
  - IAM policy requirements
  - Troubleshooting guide
  - Contributing guidelines

## Technical Architecture

### Main Process (Electron)
- API key management
- ccusage API calls
- Data caching layer
- Menu bar management
- IPC communication

### Renderer Process
- UI components (if using web technologies)
- Data visualization
- Settings interface
- Real-time updates

### Security Considerations
- Never store API keys in plain text
- Use Electron safeStorage API
- Secure IPC channels
- Encrypted local storage

### Data Structure
```typescript
interface UsageData {
  timestamp: Date;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  requests: number;
  model: string;
  estimatedCost: number;
}
```

## Dependencies
- `menubar`: Electron menubar management
- `ccusage`: Claude Code usage tracking
- `electron`: Desktop application framework
- `electron-store`: Persistent data storage
- `node-keytar`: Secure credential storage (optional)
- `chart.js`: Usage visualization (optional)

## Future Enhancements
- [ ] Support for other AI providers (OpenAI, Anthropic API)
- [ ] Team usage tracking
- [ ] Usage patterns analysis
- [ ] Token optimization suggestions
- [ ] Export to CSV/PDF
- [ ] Integration with development tools
- [ ] Slack/Discord notifications
- [ ] Usage prediction based on patterns
- [ ] Cost allocation by project/client