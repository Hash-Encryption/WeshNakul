/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#FFF8F1',       // Background
          red: '#F0443E',         // Primary action
          redPressed: '#D93833',  // Button shadow/press state
          redSoft: '#FFF0EE',     // Selected card tint
          yellow: '#FFD75A',      // Playful accents
          yellowPressed: '#E9BE3D',
          green: '#55B96A',       // Success / Agreement
          greenPressed: '#439B54',
          whatsapp: '#25D366',
          whatsappPressed: '#1EAA52',
          ink: '#241B18',         // Typography
          gray: '#7A6E67',        // Metadata & secondary text
          card: '#FFFFFF',        // Card surfaces
          border: '#F2E8DF',      // Neutral borders
        },
        token: {
          blue: '#73C8EA',
          pink: '#F6A6AD',
          green: '#55B96A',
          yellow: '#FFD75A',
          purple: '#9B86EC',
          sand: '#E5D3B3',
        }
      },
      fontFamily: {
        alexandria: ['Alexandria', 'sans-serif'],
      },
      boxShadow: {
        'tactile-red': '0 4px 0 0 #D93833',
        'tactile-yellow': '0 4px 0 0 #E9BE3D',
        'tactile-green': '0 4px 0 0 #439B54',
        'tactile-whatsapp': '0 4px 0 0 #1EAA52',
        'tactile-card': '0 2px 8px 0 rgba(36, 27, 24, 0.04)',
        'tactile-white': '0 3px 0 0 #E5D8CD',
      }
    }
  },
  plugins: [],
}
