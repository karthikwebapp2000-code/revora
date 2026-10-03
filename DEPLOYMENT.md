# Rayvora deployment plan

## Web
1. Put `website/` on a static host such as Cloudflare Pages, Vercel or Netlify.
2. Connect your chosen Rayvora domain.
3. Serve HTTPS only.
4. Replace prototype public routing calls with `https://api.<your-domain>/` in production.

## Android / Google Play
1. Create a Play Console developer account.
2. Use application ID `com.rayvora.app` if available and appropriate.
3. Configure production API URL and app signing.
4. Build a signed Android App Bundle (`.aab`) with EAS or a local Android build.
5. Add app icon, screenshots, privacy policy URL, Data Safety answers, content rating and support URL.
6. Test internally/closed before production release.

## iOS / App Store
1. Create an Apple Developer account and Bundle ID.
2. Use `com.rayvora.app` if available and appropriate.
3. Configure signing and production API URL.
4. Build/archive and upload to App Store Connect.
5. Add privacy details, location-use explanation, screenshots, age rating and support URL.
6. Test with TestFlight before review.

## Security gate before launch
- HTTPS/TLS
- server-side API keys only
- input validation
- rate limiting
- request-size limits
- upstream timeouts
- dependency audit
- SAST and secret scanning
- authentication only where required
- location minimization and deletion/retention policy
- crash/error monitoring
- backup/recovery plan
- production privacy/terms reviewed for the actual implementation
