/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS 변수를 Tailwind에서도 사용할 수 있게 설정
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          300: 'var(--gray-300)',
          500: 'var(--gray-500)',
          700: 'var(--gray-700)',
          900: 'var(--gray-900)',
        },
      },
      fontFamily: {
        'logo': ['var(--font-family-logo)'],
        'base': ['var(--font-family-base)'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'content': 'var(--max-width-content)',
      },
      height: {
        'header': 'var(--header-height)',
      },
    },
  },
  plugins: [],
}