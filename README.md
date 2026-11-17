# Business Booster website (2027 redesign)

Static site, no build step. Serve the folder with any local server (for example `python -m http.server 8765`) or view it on GitHub Pages.

## Pages
- `index.html` home
- `content/` content and design (social media, video and photography, brand)
- `marketing/` marketing and search (SEO, AEO and GEO, paid ads, sales follow-up)
- `technology/` websites and systems (websites, business systems, apps and automation)
- `work/` websites and systems portfolio
- `about/` founders and team
- `contact/` WhatsApp, phone, email and a form that opens WhatsApp
- `services/` redirects to the services section on the home page
- `site-analysis.html` audit of the previous site

## Features
- Light and dark theme (follows the visitor's system setting; the toggle is remembered)
- Hero video montage, one clip per service
- Scroll-driven services panel with animated graphics
- Text and cards animate in on scroll; all motion respects reduced-motion settings
- Cursor-following glow on desktop, floating "Chat with us" WhatsApp button

## Media credits
- Videos in `assets/video/` are from Mixkit under the Mixkit Stock Video Free License (IDs 34476, 41278, 41637, 41659, 42648, 4908, 50602), re-encoded without audio.
- `assets/img/colombo-night.webp`: "Colombo city skyline at night" by Gihanud2001, Wikimedia Commons, CC0.
- Client screenshots and the BB logo are Business Booster's own.

## Placeholders to replace
| Where | What to add |
|---|---|
| Home "In their words" | Real client quotes, names and businesses (currently marked as sample quotes) |
| Footer social icons | Instagram, Facebook, TikTok and LinkedIn URLs (currently `#`) |
| About | Founder photos and team photos |
| Work | Case studies with results |
| Hero video | Your own studio footage, if you want to replace the stock clips |

Styles live in `assets/css/style.css` and scripts in `assets/js/main.js`.
