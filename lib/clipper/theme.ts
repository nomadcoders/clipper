export const THEME_STORAGE_KEY = "clipper-theme";

/** Applied before paint so a saved theme never flashes the wrong palette. */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
