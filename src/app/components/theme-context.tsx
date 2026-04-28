import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AppTheme {
  id: string;
  name: string;
  desc: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryRgb: string;   // "R, G, B"
  gold: string;
  goldRgb: string;      // "R, G, B"
  tint: string;         // light tint for backgrounds & selected states
  paperBg: string;      // page paper background
  sidebarBg: string;    // very dark sidebar background
}

/* ─── 8 bộ màu chủ đạo ──────────────────────────────────────────── */
export const THEMES: AppTheme[] = [
  {
    id: "navy-blue",
    name: "VPTU Đồng Nai",
    desc: "Xanh Navy · Vàng Đồng",
    primary: "#1C5FBE",
    primaryHover: "#1752a8",
    primaryActive: "#124590",
    primaryRgb: "28, 95, 190",
    gold: "#8a6400",
    goldRgb: "212, 168, 75",
    tint: "#ddeafc",
    paperBg: "#fbf8f2",
    sidebarBg: "#0b1426",
  },
  {
    id: "crimson",
    name: "Đỏ Son",
    desc: "Đỏ Lacquer · Vàng Hổ Phách",
    primary: "#B91C1C",
    primaryHover: "#991B1B",
    primaryActive: "#7F1D1D",
    primaryRgb: "185, 28, 28",
    gold: "#b45309",
    goldRgb: "217, 119, 6",
    tint: "#fee2e2",
    paperBg: "#fdf8f5",
    sidebarBg: "#1A0808",
  },
  {
    id: "jade",
    name: "Ngọc Bích",
    desc: "Xanh Ngọc · Vàng Cam",
    primary: "#0F766E",
    primaryHover: "#0D6B63",
    primaryActive: "#0A5E57",
    primaryRgb: "15, 118, 110",
    gold: "#b45309",
    goldRgb: "217, 119, 6",
    tint: "#ccfbf1",
    paperBg: "#f7fbf9",
    sidebarBg: "#061614",
  },
  {
    id: "royal",
    name: "Hoàng Gia",
    desc: "Tím Hoàng Gia · Vàng Rực",
    primary: "#6D28D9",
    primaryHover: "#5B21B6",
    primaryActive: "#4C1D95",
    primaryRgb: "109, 40, 217",
    gold: "#F59E0B",
    goldRgb: "245, 158, 11",
    tint: "#ede9fe",
    paperBg: "#fbf8ff",
    sidebarBg: "#110829",
  },
  {
    id: "forest",
    name: "Đồng Rừng",
    desc: "Xanh Lá · Vàng Mật Ong",
    primary: "#166534",
    primaryHover: "#145C2F",
    primaryActive: "#104E27",
    primaryRgb: "22, 101, 52",
    gold: "#CA8A04",
    goldRgb: "202, 138, 4",
    tint: "#dcfce7",
    paperBg: "#f7fbf7",
    sidebarBg: "#061409",
  },
  {
    id: "amber",
    name: "Trầm Hương",
    desc: "Nâu Đất · Vàng Hổ Phách",
    primary: "#92400E",
    primaryHover: "#7C3410",
    primaryActive: "#6B2C0D",
    primaryRgb: "146, 64, 14",
    gold: "#B45309",
    goldRgb: "180, 83, 9",
    tint: "#fde8cc",
    paperBg: "#fdf5ed",
    sidebarBg: "#160905",
  },
  {
    id: "indigo",
    name: "Đêm Tím",
    desc: "Chàm Sâu · Vàng Cam Ấm",
    primary: "#3730A3",
    primaryHover: "#312E81",
    primaryActive: "#272562",
    primaryRgb: "55, 48, 163",
    gold: "#b45309",
    goldRgb: "217, 119, 6",
    tint: "#e0e7ff",
    paperBg: "#f8f7ff",
    sidebarBg: "#0A0926",
  },
  {
    id: "rose",
    name: "Hồng Đào",
    desc: "Hồng Anh Đào · Vàng",
    primary: "#9D174D",
    primaryHover: "#881446",
    primaryActive: "#701039",
    primaryRgb: "157, 23, 77",
    gold: "#b45309",
    goldRgb: "217, 119, 6",
    tint: "#fce7f3",
    paperBg: "#fdf5f9",
    sidebarBg: "#18040F",
  },
];

/* ─── Apply theme to CSS :root ───────────────────────────────────── */
export function applyTheme(t: AppTheme) {
  const r = document.documentElement;
  // Primary action colours
  r.style.setProperty("--color-primary-btn",        t.primary);
  r.style.setProperty("--color-primary-btn-hover",  t.primaryHover);
  r.style.setProperty("--color-primary-btn-active", t.primaryActive);
  r.style.setProperty("--color-primary-btn-rgb",    t.primaryRgb);
  r.style.setProperty("--color-primary-tint",       t.tint);
  // Gold / accent
  r.style.setProperty("--color-gold",               t.gold);
  r.style.setProperty("--color-gold-rgb",           t.goldRgb);
  // Paper & sidebar
  r.style.setProperty("--color-paper",              t.paperBg);
  r.style.setProperty("--color-sidebar-bg",         t.sidebarBg);
  // Focus rings
  r.style.setProperty("--ring-focus",         `0 0 0 3px rgba(${t.primaryRgb}, 0.22)`);
  r.style.setProperty("--shadow-input-focus", `0 0 0 3px rgba(${t.primaryRgb}, 0.18)`);
}

/* ─── Context ────────────────────────────────────────────────────── */
interface ThemeCtx {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: THEMES[0],
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/* ─── Provider ───────────────────────────────────────────────────── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(THEMES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("vq-theme");
    const found = THEMES.find(t => t.id === saved) ?? THEMES[0];
    setThemeState(found);
    applyTheme(found);
  }, []);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("vq-theme", t.id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}