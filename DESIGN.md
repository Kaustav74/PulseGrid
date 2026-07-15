---
name: Amber Meridian
colors:
  surface: '#210e0b'
  surface-dim: '#210e0b'
  surface-bright: '#4c332f'
  surface-container-lowest: '#1b0906'
  surface-container-low: '#2b1613'
  surface-container: '#2f1a16'
  surface-container-high: '#3b2420'
  surface-container-highest: '#472f2a'
  on-surface: '#ffdad4'
  on-surface-variant: '#e0bfb7'
  inverse-surface: '#ffdad4'
  inverse-on-surface: '#422a26'
  outline: '#a88a83'
  outline-variant: '#59413b'
  surface-tint: '#ffb4a1'
  primary: '#ffb4a1'
  on-primary: '#611300'
  primary-container: '#bd401e'
  on-primary-container: '#ffe7e2'
  inverse-primary: '#ac3412'
  secondary: '#f4be55'
  on-secondary: '#412d00'
  secondary-container: '#986d00'
  on-secondary-container: '#fffbff'
  tertiary: '#cec5b9'
  on-tertiary: '#343027'
  tertiary-container: '#706a60'
  on-tertiary-container: '#f4ebde'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd2'
  primary-fixed-dim: '#ffb4a1'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#891f00'
  secondary-fixed: '#ffdea7'
  secondary-fixed-dim: '#f4be55'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#eae1d4'
  tertiary-fixed-dim: '#cec5b9'
  on-tertiary-fixed: '#1f1b13'
  on-tertiary-fixed-variant: '#4b463d'
  background: '#210e0b'
  on-background: '#ffdad4'
  surface-variant: '#472f2a'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
This design system reimagines the typically cold, sterile medical interface as a "sanctuary OS." It blends **Corporate Modern** structure with **Tactile** warmth, creating an environment that feels medically precise yet emotionally supportive. The design targets healthcare professionals and patients who require a high-density information environment that doesn't sacrifice human comfort.

The aesthetic utilizes a "low-glow" dark mode. Instead of pure blacks, it uses deep, rich browns and earthy neutrals to reduce eye strain and evoke a sense of groundedness. Surfaces appear as soft, matte materials with precise, illuminated accents.

## Colors
The palette is derived from natural earth pigments to provide a "healing" visual spectrum.
- **Primary (Terracotta):** Used for critical actions, urgency indicators, and active states. It provides high visibility against dark backgrounds without the alarmist tone of pure red.
- **Secondary (Gold):** Reserved for interactive warnings, highlights, and secondary progress indicators.
- **Tertiary (Cream):** The primary text color and high-contrast accent. It offers a softer reading experience than pure white.
- **Neutral (Deep Brown & Umber):** The foundation of the UI. Deep Brown (#261614) serves as the base background, while lighter Umber tones define surface containers and card backgrounds.

## Typography
The typography system balances modern sans-serif legibility with technical precision. 
- **Manrope** is used for all UI headings and body copy, chosen for its balanced, approachable geometric forms that maintain high readability in low-light environments.
- **JetBrains Mono** is utilized for metadata, timestamps, and medical data values (e.g., heart rate, dosage). Its monospaced nature ensures that fluctuating numerical data remains visually stable and aligned.
- **Weighting:** Use Semibold (600) for interactive elements and Regular (400) for patient notes or descriptive text to ensure a clear hierarchy.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model with a refined 8px base unit. 
- **Desktop:** A 12-column grid with generous 24px gutters. Use large margins (48px) to frame the interface, creating a "contained" OS feel.
- **Mobile:** A 4-column grid with 16px margins.
- **Information Density:** For medical dashboards, use a "Compact" density mode where internal component padding is reduced to `sm`, but maintain `md` spacing between major layout modules to prevent visual clutter.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Ambient Shadows** tinted with the primary palette.
- **Base Level:** Deep Brown (#261614) solid background.
- **Surface Level:** Umber (#3D2622) cards with a subtle 1px inner border of Cream (#F2E9DC) at 5% opacity to define edges.
- **Shadows:** Avoid black shadows. Use a "Warm Glow" shadow: `0 8px 24px rgba(38, 22, 20, 0.5)`.
- **Active State:** Elements should "lift" using a subtle Primary (Terracotta) outer glow to signify focus without relying on traditional drop shadows.

## Shapes
The shape language is consistently **Rounded**. 
- **Standard UI (Buttons, Inputs):** 0.5rem (8px) radius. This provides a soft, non-aggressive feel while maintaining enough structure for a professional OS.
- **Large Containers (Cards, Modals):** 1.5rem (24px) radius.
- **Indicators (Status pips, avatars):** Fully circular (Pill-shaped).
- **Icons:** Use a 2px stroke weight with rounded terminals to match the typography's curvature.

## Components
- **Buttons:** Primary buttons use a solid Terracotta background with Cream text. Secondary buttons use an outlined Gold stroke. Ghost buttons use JetBrains Mono in Gold.
- **Input Fields:** Dark Umber fill with a bottom-only border in Gold for a refined, surgical look. Floating labels use JetBrains Mono at `label-sm`.
- **Cards:** Background: `#3D2622`. Cards should never use a pure black background. Use header sections with a subtle 10% Gold tint to separate title areas from content.
- **Medical Chips:** Small, pill-shaped indicators. Use a background of Primary/Secondary at 15% opacity with full-saturation text for high readability.
- **Lists:** Data-heavy lists should use alternating row highlights (Zebra striping) with a 2% Cream tint for high-speed scanning of medical records.
- **Status Indicators:** Pulse animations are encouraged for live telemetry data (ECG, Heart Rate) using a blurred Gold glow effect.