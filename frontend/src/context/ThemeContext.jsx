import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  { id: "light",    label: "Light",    icon: "☀️",  preview: ["#f0f4ff","#4f6ef7"] },
  { id: "dark",     label: "Dark",     icon: "🌙",  preview: ["#12131a","#7c8cf8"] },
  { id: "blush",    label: "Blush",    icon: "🌸",  preview: ["#fff0f3","#f4607a"] },
  { id: "mint",     label: "Mint",     icon: "🌿",  preview: ["#edfaf4","#2dbe7a"] },
  { id: "ocean",    label: "Ocean",    icon: "🌊",  preview: ["#e8f4fd","#0ea5e9"] },
  { id: "lavender", label: "Lavender", icon: "💜",  preview: ["#f3f0ff","#8b5cf6"] },
  { id: "sunset",   label: "Sunset",   icon: "🌅",  preview: ["#fff8f0","#f97316"] },
  { id: "forest",   label: "Forest",   icon: "🌲",  preview: ["#eef6ee","#3a9e5f"] },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const dark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    // Tailwind dark class — only for the "dark" theme
    root.classList.toggle("dark", dark);
    // CSS variable theme
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, dark]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const setNamedTheme = (t) => setTheme(t);

  return (
    <ThemeContext.Provider value={{ dark, theme, toggle, setNamedTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
