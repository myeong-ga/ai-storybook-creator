import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(280, 85%, 50%)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

// Update the dark mode color values to be more black-focused like Vercel
config.theme.extend.colors = {
  ...config.theme.extend.colors,
  dark: {
    background: "hsl(0 0% 0%)", // Changed from 224 71% 4% (gray) to pure black
    foreground: "hsl(210 20% 98%)",

    card: "hsl(0 0% 0%)", // Changed from 224 71% 4% to pure black
    "card-foreground": "hsl(210 20% 98%)",

    popover: "hsl(0 0% 0%)", // Changed from 224 71% 4% to pure black
    "popover-foreground": "hsl(210 20% 98%)",

    primary: "hsl(280 75% 60%)",
    "primary-foreground": "hsl(210 20% 98%)",

    secondary: "hsl(215 25% 10%)", // Slightly adjusted for better contrast with black
    "secondary-foreground": "hsl(210 20% 98%)",

    muted: "hsl(215 25% 10%)", // Adjusted for better contrast with black
    "muted-foreground": "hsl(215 20% 65%)",

    accent: "hsl(215 25% 10%)", // Adjusted for better contrast with black
    "accent-foreground": "hsl(210 20% 98%)",

    destructive: "hsl(0 63% 31%)",
    "destructive-foreground": "hsl(210 20% 98%)",

    border: "hsl(215 25% 12%)",
    input: "hsl(215 25% 12%)",
    ring: "hsl(216 25% 17%)",
  },
}
