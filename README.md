# Rayvora

A working starter web app inspired by the core idea shown in the supplied Veyil screenshots: estimate which side of a journey receives less direct sunlight.

## Included
- Responsive landing page
- Departure/destination place search
- Optional browser geolocation
- OSRM route lookup
- Solar-position calculation in the browser
- Left/right sunlight estimate
- About, privacy and sign-in pages
- Basic SEO metadata, robots.txt and sitemap.xml

## Run
Because browser APIs and geolocation work best from a web server, serve this folder with any static server, for example:

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Production work still needed
1. Replace public demo routing/geocoding endpoints with production services and follow their usage policies.
2. Add rate limiting/server-side API protection.
3. Add real authentication and saved routes.
4. Add analytics only after defining a privacy/consent policy.
5. Add route-specific pages/content for SEO.
6. Add PWA/mobile packaging if desired.
