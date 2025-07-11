console.log('Hello from TypeScript with Vite!')

export function greet(name: string): string {
  return `Hello, ${name}!`
}

const appDiv = document.getElementById('app')
if (appDiv) {
  appDiv.textContent = greet('Vite + TypeScript')
}