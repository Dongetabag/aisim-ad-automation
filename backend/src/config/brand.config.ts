// AISim Brand Standards (from aisim-brand.json)
export const AISIM_BRAND = {
  name: "AISim",
  tagline: "AI-Powered Marketing Excellence",
  colors: {
    primary: "#10b981",      // Emerald green
    secondary: "#34d399",    // Light emerald
    accent: "#059669",       // Dark emerald
    text: "#ffffff",
    textSecondary: "#9ca3af",
    background: "#0a0a0a",
    surface: "#1a1a1a",
    border: "rgba(255, 255, 255, 0.05)",
    gradient: "linear-gradient(135deg, #10b981, #34d399)"
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem"
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem"
  },
  components: {
    card: {
      background: "#1a1a1a",
      borderRadius: "12px",
      padding: "35px",
      border: "1px solid rgba(255, 255, 255, 0.05)"
    },
    button: {
      primary: {
        background: "linear-gradient(135deg, #10b981, #34d399)",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        fontWeight: 600
      }
    }
  }
} as const;

export type BrandConfig = typeof AISIM_BRAND;



