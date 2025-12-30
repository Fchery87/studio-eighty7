# Security Headers and Content Security Policy (CSP)

This document explains the security headers and Content Security Policy (CSP) implemented for the Studio Eighty7 React + Vite application.

## Overview

The application implements comprehensive OWASP-compliant security headers to protect against common web vulnerabilities including:

- Cross-Site Scripting (XSS)
- Clickjacking
- MIME type sniffing attacks
- Cross-Origin attacks
- Man-in-the-middle attacks

## Security Headers

### Content Security Policy (CSP)

CSP is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' https: data:",
  "connect-src 'self' https://studioeighty7.com https://generativelanguage.googleapis.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ')
```

#### CSP Directives Explained

| Directive | Purpose | Value |
|-----------|---------|-------|
| `default-src 'self'` | Default policy for all content types not explicitly defined | Only allows resources from same origin |
| `script-src` | Controls JavaScript sources | `'self'`, `'unsafe-inline'` for Tailwind config, Tailwind CDN, esm.sh imports |
| `style-src` | Controls CSS sources | `'self'`, `'unsafe-inline'` for Tailwind CDN, Google Fonts |
| `font-src` | Controls font sources | `'self'`, Google Fonts domains |
| `img-src` | Controls image sources | `'self'`, HTTPS URLs, data: URIs |
| `connect-src` | Controls fetch/XHR/WebSocket targets | `'self'`, WordPress API, Google Gemini API |
| `media-src` | Controls audio/video sources | `'self'` only |
| `object-src 'none'` | Controls Flash/Java/other plugins | Completely disabled |
| `base-uri 'self'` | Controls base tag values | Only allows same origin |
| `form-action 'self'` | Controls form submission targets | Only allows same origin |
| `frame-ancestors 'none'` | Prevents embedding in frames | Prevents clickjacking |
| `upgrade-insecure-requests` | Forces HTTPS for all requests | Automatic upgrade from HTTP to HTTPS |

**Note**: `unsafe-inline` is used for `script-src` and `style-src` to support Tailwind CSS CDN configuration. This is a necessary trade-off for the current CDN-based setup. In production, consider switching to a build-time bundler to eliminate this requirement.

### HTTP Strict Transport Security (HSTS)

```typescript
'Strict-Transport-Security': 'max-age=15768000; includeSubDomains; preload'
```

**Purpose**: Ensures the browser only communicates with the server over HTTPS for 180 days.

- `max-age=15768000` (180 days): Tells browsers to remember HSTS policy for 6 months
- `includeSubDomains`: Applies HSTS to all subdomains
- `preload`: Allows inclusion in the HSTS preload list (permanent HTTPS enforcement)

**Protection**: Prevents man-in-the-middle attacks and SSL stripping attacks.

### X-Frame-Options

```typescript
'X-Frame-Options': 'DENY'
```

**Purpose**: Prevents clickjacking attacks by blocking the page from being embedded in iframes.

- `DENY`: Completely prevents framing by any site (even same origin)
- Alternative: `SAMEORIGIN` allows framing by same origin only

**Protection**: Clickjacking protection.

### X-Content-Type-Options

```typescript
'X-Content-Type-Options': 'nosniff'
```

**Purpose**: Prevents MIME type sniffing by browsers.

- `nosniff`: Forces browser to respect the declared Content-Type header

**Protection**: Prevents execution of malicious scripts disguised as other file types (e.g., `script` with Content-Type `text/plain`).

### X-XSS-Protection

```typescript
'X-XSS-Protection': '1; mode=block'
```

**Purpose**: Enables the browser's built-in XSS filter.

- `1`: Enable XSS filtering
- `mode=block`: Block page entirely if XSS is detected (rather than sanitizing)

**Note**: This is a legacy header (Chrome/Edge deprecated it), but provides defense-in-depth for older browsers.

### Referrer-Policy

```typescript
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

**Purpose**: Controls how much referrer information is sent with cross-origin requests.

- `strict-origin-when-cross-origin`: Sends full URL to same origin, but only origin (scheme, host, port) to cross-origin requests

**Protection**: Prevents leakage of sensitive path information to third parties.

### Permissions-Policy

```typescript
'Permissions-Policy': [
  'geolocation=()',
  'microphone=()',
  'camera=()',
  'payment=()',
  'usb=()',
  'magnetometer=()',
  'gyroscope=()',
  'accelerometer=()',
].join(', ')
```

**Purpose**: Controls which browser features the page can access.

- All sensitive features are disabled with `()` (empty allowlist)
- Features that can be added as needed: `sync-xhr`, `fullscreen`, etc.

**Protection**: Prevents unauthorized access to device capabilities.

### Cross-Origin-Embedder-Policy (COEP)

```typescript
'Cross-Origin-Embedder-Policy': 'require-corp'
```

**Purpose**: Controls loading of cross-origin resources without explicit permission.

- `require-corp`: Requires cross-origin resources to be loaded with `Cross-Origin-Resource-Policy` header

**Protection**: Prevents Spectre-style attacks through cross-origin isolation.

### Cross-Origin-Opener-Policy (COOP)

```typescript
'Cross-Origin-Opener-Policy': 'same-origin'
```

**Purpose**: Controls cross-origin window access.

- `same-origin`: Prevents cross-origin windows from accessing this window

**Protection**: Prevents cross-origin attacks through window references.

## Testing CSP Headers

### Local Development

When running `npm run dev` or `npm run preview`, Vite will apply the security headers automatically.

To verify headers are working:

1. Start dev server: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Click on the main request (index.html)
6. Check Response Headers section

### Using curl to verify:

```bash
# Check dev server headers
curl -I http://localhost:3000/

# Check preview server headers
curl -I http://localhost:4173/
```

Expected output should include all security headers.

## CSP Reporting

For production environments, consider implementing CSP violation reporting:

```typescript
'Content-Security-Policy-Report-Only': `...; report-uri /csp-violation-report-endpoint`,
'Content-Security-Policy': `...; report-uri /csp-violation-report-endpoint`,
```

This allows you to monitor and debug CSP violations without blocking resources.

## Production Deployment Considerations

The security headers in `vite.config.ts` apply to:
- Development server (`npm run dev`)
- Preview mode (`npm run preview`)

For production deployments (e.g., Nginx, Apache, Netlify, Vercel, Cloudflare), you must configure these headers on your web server or CDN. Examples:

### Nginx
```nginx
add_header Content-Security-Policy "default-src 'self'; ...";
add_header Strict-Transport-Security "max-age=15768000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Netlify (_headers file)
```
/*
  Content-Security-Policy: default-src 'self'; ...
  Strict-Transport-Security: max-age=15768000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### Vercel (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; ..."
        }
      ]
    }
  ]
}
```

## External Resources Allowed by CSP

The application uses the following external resources, all of which are explicitly allowed in the CSP:

### Script Sources
- `https://cdn.tailwindcss.com` - Tailwind CSS CDN
- `https://esm.sh` - ESM module imports for React, lucide-react, @google/genai

### Style Sources
- `https://fonts.googleapis.com` - Google Fonts CSS
- `https://cdn.tailwindcss.com` - Tailwind CSS CDN

### Font Sources
- `https://fonts.gstatic.com` - Google Fonts font files
- `https://fonts.googleapis.com` - Google Fonts API

### Connect Sources
- `https://studioeighty7.com` - WordPress REST API
- `https://generativelanguage.googleapis.com` - Google Gemini AI API

## Common CSP Issues and Solutions

### Issue: Console shows CSP violations

**Symptom**: Browser console reports CSP directive violations.

**Solutions**:
1. Check the violated directive in the console
2. Add the necessary source to the CSP directive in `vite.config.ts`
3. Restart dev server: `npm run dev`

### Issue: Tailwind styles not loading

**Symptom**: Tailwind styles are not applied to elements.

**Solution**: Ensure `script-src` and `style-src` include `'unsafe-inline'` and `https://cdn.tailwindcss.com`.

### Issue: esm.sh imports fail

**Symptom**: Modules from esm.sh fail to load.

**Solution**: Ensure `script-src` includes `https://esm.sh`.

## Subresource Integrity (SRI)

### Overview

Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (from a CDN or elsewhere) are delivered without unexpected manipulation. It works by having the CDN provide a cryptographic hash of the resource, and the browser checking that the fetched resource matches that hash.

### Implementation in Studio Eighty7

The following external resources now have SRI enabled:

| Resource | URL | Hash Algorithm | Hash Value |
|----------|-----|----------------|------------|
| Tailwind CSS | `https://cdn.tailwindcss.com` | SHA-384 | `igm5BeiBt36UU4gqwWS7imYmelpTsZlQ45FZf+XBn9MuJbn4nQr7yx1yFydocC/K` |

### How SRI Works

When a browser loads a resource with SRI:
1. Browser fetches the resource from the CDN
2. Browser computes the hash of the fetched content using the specified algorithm
3. Browser compares the computed hash with the hash provided in the `integrity` attribute
4. If hashes match, resource loads; if not, browser refuses to execute/load the resource

### Resources Without SRI (and Why)

#### Google Fonts
- **Reason**: Google Fonts CSS is dynamically generated based on the user's browser and user agent. The CSS content varies per request, making SRI verification impossible.
- **Security**: Google Fonts uses HTTPS and is considered a trusted source. Font preconnect links don't require SRI.

#### ESM.sh Module Imports (importmap)
- **Reason**: The importmap is used for dynamic module resolution, not direct resource loading. Modules are resolved at runtime based on the importmap configuration.
- **Security**: ESM.sh uses HTTPS and provides immutable versioned URLs. Consider switching to a build-time bundler (esbuild, Rollup) for production to gain better control over module integrity.

#### WordPress API
- **Reason**: API endpoints are dynamic data sources, not static resources.
- **Security**: WordPress API uses HTTPS and returns dynamic content based on requests.

### How to Regenerate SRI Hashes

When CDN resources are updated (e.g., Tailwind CSS version change), you must regenerate the SRI hash:

#### Method 1: Using curl and openssl (Linux/Mac)

```bash
# Download the resource
curl -sL https://cdn.tailwindcss.com -o /tmp/tailwind.js

# Generate SHA-384 hash
openssl dgst -sha384 -binary /tmp/tailwind.js | openssl base64 -A
```

#### Method 2: Using a single command

```bash
curl -sL https://cdn.tailwindcss.com | openssl dgst -sha384 -binary | openssl base64 -A
```

#### Method 3: Using npx and sri-toolbox

```bash
npx sri-toolbox generate https://cdn.tailwindcss.com
```

#### Method 4: Online SRI Generators

- [SRI Hash Generator](https://www.srihash.org/)
- [Report URI SRI Generator](https://report-uri.com/home/sri)

### Updating the Hash

After generating the new hash:

1. Update the `integrity` attribute in `index.html`:

```html
<!-- Before -->
<script src="https://cdn.tailwindcss.com" integrity="sha384-OLD_HASH" crossorigin="anonymous"></script>

<!-- After -->
<script src="https://cdn.tailwindcss.com" integrity="sha384-NEW_HASH" crossorigin="anonymous"></script>
```

2. Update this documentation with the new hash value.

3. Test the application to ensure the new hash is correct.

### Automating SRI Hash Updates

For a more automated approach, consider these options:

#### Option 1: Build Script with npm script

Add to `package.json`:

```json
{
  "scripts": {
    "sri:update": "curl -sL https://cdn.tailwindcss.com | openssl dgst -sha384 -binary | openssl base64 -A"
  }
}
```

Run with: `npm run sri:update`

#### Option 2: Using sri-hash-generator (npm package)

```bash
npm install -D sri-hash-generator

# Generate hash
npx sri-hash-generator https://cdn.tailwindcss.com
```

#### Option 3: CI/CD Integration

Add SRI hash verification to your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Verify SRI Hashes
  run: |
    HASH=$(curl -sL https://cdn.tailwindcss.com | openssl dgst -sha384 -binary | openssl base64 -A)
    EXPECTED="igm5BeiBt36UU4gqwWS7imYmelpTsZlQ45FZf+XBn9MuJbn4nQr7yx1yFydocC/K"
    if [ "$HASH" != "$EXPECTED" ]; then
      echo "SRI hash mismatch! Expected: $EXPECTED, Got: $HASH"
      exit 1
    fi
```

### Troubleshooting SRI Issues

#### Browser Console Error: "Failed to find a valid digest"

**Cause**: The fetched resource content doesn't match the hash in the `integrity` attribute.

**Solutions**:
1. Verify the CDN URL is correct and accessible
2. Regenerate the hash using current CDN content
3. Check if CDN has updated the resource (version change)
4. Clear browser cache and try again

#### CSP Violation with SRI

**Cause**: The `integrity` attribute requires the resource to be loaded with CORS.

**Solution**: Ensure the resource includes the `crossorigin="anonymous"` attribute:

```html
<script src="https://cdn.tailwindcss.com" integrity="sha384-HASH" crossorigin="anonymous"></script>
```

### SRI Best Practices

1. **Always use SHA-384**: SHA-384 is the recommended algorithm for SRI (more secure than SHA-256).
2. **Include crossorigin**: Always use `crossorigin="anonymous"` with `integrity` attributes.
3. **Regenerate after CDN updates**: Always regenerate hashes when CDN resources change versions.
4. **Document hash sources**: Keep track of which hashes correspond to which CDN versions.
5. **Test in dev environment**: Always test new hashes in development before deploying to production.
6. **Monitor CDN changes**: Subscribe to CDN update notifications or version feeds.

### References

- [MDN Web Docs - Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [W3C Subresource Integrity Specification](https://www.w3.org/TR/SRI/)
- [SRI Hash Generator](https://www.srihash.org/)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Hardening Recommendations

For maximum security, consider these additional measures:

1. **Eliminate 'unsafe-inline'**: Switch from Tailwind CDN to build-time bundling (e.g., `npm install -D tailwindcss`)

2. **Implement CSP Nonces**: Use nonce-based CSP for dynamic scripts in production

3. **Add CSP Hashes**: Use hash-based CSP for inline scripts that cannot use nonces

4. **Enable Subresource Integrity (SRI)**: ✅ **Implemented for Tailwind CDN** - Add SRI to other static external resources

5. **Implement Content Security Policy Report-Only**: Test CSP changes before enforcing

6. **Regular Header Monitoring**: Use services like securityheaders.com to verify header configuration

7. **HSTS Preload**: Submit site to HSTS preload list after verifying HTTPS works correctly

## References

- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN Web Security - CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)

## Support

For questions or issues related to security headers, consult the official documentation or contact the development team.
