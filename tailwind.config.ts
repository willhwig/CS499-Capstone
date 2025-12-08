import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS Configuration
 *
 * I'm using Tailwind CSS for styling because it allows rapid UI development
 * with utility classes. This is especially helpful for a capstone project
 * where I need to build a polished interface quickly.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // I'm adding custom colors that represent the aviation theme
      // These will be used for status badges and other UI elements
      colors: {
        aviation: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0c8ee6',
          600: '#0070c4',
          700: '#01599f',
          800: '#064c83',
          900: '#0b406d',
        },
      },
    },
  },
  plugins: [],
}

export default config
