(() => {
 const key='ifagrithm-theme';const root=document.documentElement;const system=window.matchMedia?.('(prefers-color-scheme: dark)');let saved;try{saved=localStorage.getItem(key)}catch{}
 function apply(theme){root.dataset.theme=theme;const button=document.querySelector('[data-theme-toggle]');if(button){const dark=theme==='dark';button.textContent=dark?'☀ Light mode':'☾ Dark mode';button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');button.setAttribute('aria-pressed',String(dark));}document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0d0f11':'#f7f8fa');}
 apply(saved==='light'||saved==='dark'?saved:system?.matches?'dark':'light');
 document.addEventListener('DOMContentLoaded',()=>{apply(root.dataset.theme);document.querySelector('[data-theme-toggle]')?.addEventListener('click',()=>{saved=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,saved)}catch{}apply(saved);});});
 system?.addEventListener?.('change',event=>{if(!saved)apply(event.matches?'dark':'light')});
})();
