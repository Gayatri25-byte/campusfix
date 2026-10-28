export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#eef2f8',100:'#d9e1ee',200:'#b3c3dc',500:'#2d4a7a',700:'#13294f',800:'#0d1f3c',900:'#08142a',950:'#050d1c' },
        mint: { 50:'#effaf5',100:'#d5f3e5',200:'#a9e6cb',400:'#4fc99a',600:'#1f9a6c' },
        sand: { 50:'#faf7f2',100:'#f3ede2',200:'#e6dccb',400:'#c9b896' },
        teal: { 50:'#e8fbf8',100:'#c5f5ee',300:'#5fe3d2',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e' }
      },
      fontFamily: { sans: ['"Instrument Sans"','system-ui','sans-serif'], display: ['Fraunces','Georgia','serif'] },
      boxShadow: { lift: '0 1px 2px rgba(8,20,42,.06), 0 12px 32px -12px rgba(8,20,42,.18)' }
    }
  }
}
