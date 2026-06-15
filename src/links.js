const initIcons = () => window.lucide && window.lucide.createIcons()
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initIcons)
  : initIcons()
