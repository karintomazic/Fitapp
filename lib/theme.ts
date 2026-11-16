// Browser bar color for each theme (shown around the app on iPhone).
export const THEME_COLORS = { light: "#dcf0e7", dark: "#173d34" };

// Runs in <head> before the page paints, so a saved dark choice never
// flashes light first.
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("theme")==="dark"){document.documentElement.dataset.theme="dark";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLORS.dark}")}}catch(e){}`;
