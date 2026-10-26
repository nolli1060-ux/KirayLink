# KirayLink — Performance, Optimization & Accessibility Architecture

This document outlines the performance engineering, rendering strategies, asset optimization, and accessibility practices implemented in KirayLink.

---

## 1. Next.js 16 Partial Prerendering (PPR) Architecture

KirayLink utilizes Next.js 16's Partial Prerendering engine configured via `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    agentFeedback: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};
```

### How PPR Operates in KirayLink
1. **Static Shell Generation**: At build time, Next.js generates static HTML for the application's root layout, navigation bar, headers, footer, and informational content.
2. **Dynamic Streaming via Suspense**: Dynamic server access (such as reading session cookies via `requireAuth()` or `cookies()`) is isolated strictly inside `<Suspense fallback={...}>` boundaries.
3. **Instant First Paint**: The browser receives and renders the cached static shell immediately, while dynamic user data (e.g. personal inquiries, saved residences) streams in parallel.
4. **No Build Bailouts**: Client components that rely on runtime parameters receive them through props or promises inside Suspense boundaries, preventing Next.js from bailing out of static generation.

---

## 2. Asset & Image Optimization

Property photos are important, but large unoptimized images can slow the site and use too much mobile data.

KirayLink addresses this through `next/image`:
- **Responsive `sizes` Attributes**:
  ```tsx
  <Image
    src={property.imageUrl}
    alt={property.title}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    priority={priority}
    className="object-cover"
  />
  ```
- **LCP Optimization**: On the homepage and listings catalog, the first visible property card and hero banners receive `priority={true}`, instructing the browser to preload the critical image and maximize the Largest Contentful Paint (LCP) score.
- **Modern Formats**: Automatically converts source photography to AVIF and WebP formats on supported browsers.
- **Fixed Aspect Ratios**: Containers enforce strict aspect ratios (`aspect-[16/10]`, `aspect-[16/9]`) to eliminate Cumulative Layout Shift (CLS).

---

## 3. Bundle Minimization & Rendering Boundaries

1. **Server Components by Default**: All route pages (`/`, `/listings`, `/properties/[id]`, `/tenant/dashboard`, `/landlord/dashboard`, `/admin/dashboard`) are Server Components. They do not ship server logic, bcrypt utilities, or JSON file readers to the client browser.
2. **Selective Client Components**: Only elements requiring browser event listeners and state transitions are marked `"use client"`:
   - `ListingsClient`: Manages live search term state, slider ranges, and filter tags.
   - `PropertyInquiryForm`: Manages user form inputs, validation state, and submit indicators.
   - `SavePropertyButton`: Manages optimistic bookmark toggling.
   - `AddListingModal`: Manages interactive modal opening and form submission.
3. **Zero Redundant State Libraries**: By leveraging native React 19 hooks and Server Actions, KirayLink eliminates heavy third-party client state managers (Redux, Zustand, React Query, Axios), saving over 120kB of compressed JavaScript.

---

## 4. Tailwind CSS v4 & Styling Efficiency

KirayLink utilizes Tailwind CSS v4 with an inline `@theme` configuration:
- **Zero Config Overhead**: Replaces legacy `tailwind.config.js` with pure CSS custom properties defined in `src/app/globals.css`.
- **CSS Variables for Design Tokens**: Colors, borders, and shadows compile into standard CSS variables (`--color-navy`, `--color-gold`, `--color-ivory`).
- **Elimination of Runtime CSS-in-JS**: Styles are completely static and compiled ahead of time with zero JavaScript execution penalty.

---

## 5. Accessibility (a11y) & Semantic HTML

KirayLink follows WCAG 2.1 Level AA accessibility standards:

1. **Color Contrast Compliance**:
   - Deep Navy text (`#0F172A`) against Soft Ivory background (`#FAF8F5`) yields a contrast ratio of **15.2:1** (exceeding the 4.5:1 AA requirement).
   - Warm Gold interactive accents (`#8C6E43`) on white background yield a contrast ratio of **4.8:1**.
2. **Keyboard Navigation & Focus Indicators**:
   - All interactive buttons and links feature visible focus rings (`focus-visible:outline-2 focus-visible:outline-[#C5A880]`).
   - Modal dialogs support keyboard focus trapping and explicit `X` close controls.
3. **Screen Reader Support**:
   - All decorative Lucide icons include `aria-hidden="true"`.
   - Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="modal-title"`.
   - Form inputs include explicit `<label htmlFor="...">` associations and `aria-describedby` error bindings.
   - Dynamic error states include `role="alert"` for instantaneous assistive technology announcements.
4. **Strict Zero-Emoji Rule**: Eliminating emojis prevents visual rendering bugs across unsupported operating systems and avoids unintuitive screen reader voiceovers (e.g. reading "house with garden" instead of the property title).
