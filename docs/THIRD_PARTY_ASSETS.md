# Runtime artwork and fonts

The supplied Bullet rickshaw artwork is copied with provenance at apps/web/public/images/PROVENANCE.md. The original PDF and immutable reference source are excluded from runtime images and publication.

Noto Sans Bengali is self-hosted through the pinned @fontsource/noto-sans-bengali 5.3.0 package, with weights 400, 600 and 700. The package includes the SIL Open Font License (OFL-1.1); font CSS and WOFF2 assets are bundled locally, without Google Fonts requests. Source/license: https://fontsource.org/fonts/noto-sans-bengali/about . Preserve the upstream license in redistributed dependency bundles.

The test-only @axe-core/playwright 4.13.0 package uses MPL-2.0. Application code never imports it; the current Docker build retains workspace development dependencies, so container size reduction remains a documented improvement. Accessibility automation follows the official Playwright accessibility-testing guidance, supplemented by keyboard tests and screenshot review; this is not a certification claim.

The unmodified upstream OFL is also shipped as [NotoSansBengali-OFL.txt](../apps/web/public/licenses/NotoSansBengali-OFL.txt), publicly served at `/licenses/NotoSansBengali-OFL.txt`. Copyright2025 The Noto Project Authors; SHA256 `c0d17a4a6f928d78749dbebfa9d2953b6086c2a1f64cdd1e450cc77fb8199b32`. No font binaries or upstream license text were altered.
