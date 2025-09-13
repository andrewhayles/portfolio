/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
		fontFamily: {
			sans: ['var(--font-azeret-mono)'],
			mono: ['var(--font-dm-mono)']
		}
	},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}