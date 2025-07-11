import { describe, it, expect } from 'vitest'
import { greet } from './main'

describe('greet function', () => {
  it('should return a greeting message', () => {
    expect(greet('World')).toBe('Hello, World!')
  })

  it('should work with different names', () => {
    expect(greet('TypeScript')).toBe('Hello, TypeScript!')
    expect(greet('Vite')).toBe('Hello, Vite!')
  })
})