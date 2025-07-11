import App from './App'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app')
  if (root) {
    new App(root)
  }
})