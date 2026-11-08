// Runs in <head> before paint: restores the saved theme choice. Kept out of 'use client' files so the server can inline it.
export const themeInitScript =
  "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})();";
