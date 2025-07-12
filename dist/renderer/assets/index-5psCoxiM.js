(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function a(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(e){if(e.ep)return;e.ep=!0;const s=a(e);fetch(e.href,s)}})();class o{container;usage=null;constructor(t){this.container=t,this.init()}async init(){this.render(!0);try{this.usage=await window.electronAPI.getUsageData(),this.render()}catch(t){console.error("Failed to fetch usage data:",t),this.renderError()}window.electronAPI.onUsageUpdate(t=>{this.usage=t,this.render()})}render(t=!1){if(t){this.container.innerHTML='<div class="app loading">Loading...</div>';return}if(!this.usage){this.renderError();return}this.container.innerHTML=`
      <div class="app">
        <header class="app-header">
          <h1>Today's Claude Code Usage</h1>
        </header>
        
        <main class="usage-stats">
          <div class="stat-card">
            <h2>Estimated Cost</h2>
            <div class="value large">$${this.usage.estimatedCost.toFixed(2)}</div>
          </div>

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
              ${this.usage.tokens.cacheCreation?`
              <div class="stat-item">
                <span class="label">Cache Creation:</span>
                <span class="value">${this.usage.tokens.cacheCreation.toLocaleString()}</span>
              </div>
              `:""}
              ${this.usage.tokens.cacheRead?`
              <div class="stat-item">
                <span class="label">Cache Read:</span>
                <span class="value">${this.usage.tokens.cacheRead.toLocaleString()}</span>
              </div>
              `:""}
            </div>
          </div>

          ${this.usage.modelsUsed&&this.usage.modelsUsed.length>0?`
            <div class="stat-card">
              <h2>Models Used</h2>
              <div class="models-list">
                ${this.usage.modelsUsed.map(a=>`<span class="model-tag">${a}</span>`).join("")}
              </div>
            </div>
          `:""}
        </main>
        
        <footer class="app-footer">
          <button class="refresh-btn" id="refresh-btn">Refresh</button>
          <button class="quit-btn" id="quit-btn">Quit</button>
        </footer>
      </div>
    `,this.attachEventListeners()}renderError(){this.container.innerHTML='<div class="app error">Failed to load usage data</div>'}attachEventListeners(){const t=document.getElementById("refresh-btn"),a=document.getElementById("quit-btn");t?.addEventListener("click",async()=>{try{this.usage=await window.electronAPI.getUsageData(),this.render()}catch(r){console.error("Failed to refresh data:",r)}}),a?.addEventListener("click",()=>{window.electronAPI.quit()})}}document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("app");n&&new o(n)});
