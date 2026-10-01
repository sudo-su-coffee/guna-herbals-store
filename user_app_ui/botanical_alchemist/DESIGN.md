---
name: Botanical Alchemist
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad8'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f2'
  surface-container: '#efedec'
  surface-container-high: '#eae8e6'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1b'
  on-surface-variant: '#424846'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0ef'
  outline: '#727876'
  outline-variant: '#c2c8c5'
  surface-tint: '#51625e'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#0f1f1c'
  on-primary-container: '#778884'
  inverse-primary: '#b8cac5'
  secondary: '#5f5e59'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2db'
  on-secondary-container: '#65645f'
  tertiary: '#000201'
  on-tertiary: '#ffffff'
  tertiary-container: '#171e1b'
  on-tertiary-container: '#7f8682'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e6e1'
  primary-fixed-dim: '#b8cac5'
  on-primary-fixed: '#0e1e1b'
  on-primary-fixed-variant: '#3a4a46'
  secondary-fixed: '#e5e2db'
  secondary-fixed-dim: '#c9c6c0'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#474742'
  tertiary-fixed: '#dde4df'
  tertiary-fixed-dim: '#c1c8c3'
  on-tertiary-fixed: '#161d1a'
  on-tertiary-fixed-variant: '#414845'
  background: '#fbf9f8'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e1'
  brand-green: '#1a2e29'
  surface-card: '#ffffff'
  status-sale: '#0f1f1c'
  border-subtle: rgba(255, 255, 255, 0.1)
  text-muted: rgba(15, 31, 28, 0.6)
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 60px
    fontWeight: '400'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Noto Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.2em
  price-tag:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-margin: 1.5rem
  section-gap-sm: 2.5rem
  section-gap-lg: 5rem
  element-gap: 0.5rem
  grid-gutter: 1rem
---

## Brand & Style
The brand identity is rooted in **Modern Apothecary**—a sophisticated blend of traditional herbal wisdom and premium, contemporary minimalism. It targets a conscious, wellness-oriented audience that values authenticity, purity, and heritage. 

The visual style is **Minimalist-Tactile**. It utilizes heavy whitespace (cream-toned), refined serif typography, and high-quality photography to evoke an emotional response of calm, trust, and luxury. The design avoids digital-first tropes like heavy gradients or vibrant neon, opting instead for a palette and layout that feels organic, grounded, and "physical," as if browsing a boutique artisan shop in person.

## Colors
The color palette is inspired by nature’s deep forests and raw materials. 

- **Primary (#0f1f1c):** A deep, near-black forest green used for headers, footers, and primary call-to-actions to provide a strong structural anchor.
- **Secondary/Base (#f4f1ea):** A warm, tactile "Brand Cream" that serves as the primary background color, offering a softer, more premium alternative to pure white.
- **Tertiary (#dce3de):** A muted "Sage" used for iconography and subtle accents to reinforce the botanical theme.
- **Neutrals:** High-contrast white is reserved for product cards and specific interactive surfaces to make them "pop" against the cream background.

## Typography
The typography strategy relies on the tension between a high-contrast, editorial Serif and a functional, clean Sans-Serif.

- **Headlines:** Use *Playfair Display*. Italics are used frequently for "Alchemist" or "The Apothecary" to add a human, handwritten touch to the rigid layout.
- **Body & Interface:** Use *Noto Sans*. It provides high legibility for product descriptions and navigation.
- **Metadata/Labels:** A consistent use of 10px uppercase tracking for "Est. 2018", category labels, and button text creates an organized, archival feel.
- **Hierarchy:** Dramatic scale shifts (from 60px display text to 10px labels) create a clear editorial rhythm.

## Layout & Spacing
The layout follows a **Fixed-Width Mobile-First** approach that transitions into a multi-column grid for larger displays.

- **Grid:** On mobile, a 2-column grid is used for product listings to maximize visual density while maintaining large imagery. 
- **Margins:** Consistent 24px (1.5rem) horizontal padding ensures content doesn't feel cramped.
- **Sectioning:** Large vertical gaps (80px–100px) are used between major content blocks to allow the design to "breathe," mimicking the layout of a premium lifestyle magazine.
- **Alignment:** Center-alignment is preferred for brand storytelling sections, while left-alignment is used for functional product data.

## Elevation & Depth
This system avoids traditional material shadows, opting for **Tonal Layering** and **Subtle Outlines**.

- **Surface Tiers:** The "Brand Cream" is the base. Pure white is used as a "raised" surface for product cards to imply interactivity.
- **Depth via Imagery:** Parallax-style background images with dark overlays (30-40% opacity) create a sense of immersion and physical space.
- **Ghost Borders:** Elements like buttons and icons use low-opacity borders (white/10% or dark/20%) rather than shadows to define their boundaries.
- **Shadows:** Only a very subtle `shadow-sm` is applied to product cards to provide a slight lift from the cream background.

## Shapes
The shape language is primarily **Geometric and Sharp**, with targeted use of rounds for organic balance.

- **Primary Buttons/Inputs:** Use 0px to 2px (Sharp) corners to maintain a sophisticated, archival aesthetic.
- **Container Surfaces:** Product cards and specific category banners use `rounded-lg` (0.5rem) or `rounded-xl` (1rem) to soften the UI and feel more approachable.
- **Icons/Avatars:** Circles are used exclusively for profile initials and feature icons (e.g., "100% Natural") to contrast against the rectangular grid.

## Components
- **Buttons:**
  - *Primary:* Solid dark background, cream text, sharp corners, all-caps.
  - *Secondary:* Transparent with a thin border, used for less urgent actions like "Bulk Orders."
- **Cards:** Product cards must have a fixed aspect ratio (4:5) for images. Labels are placed at the top (New, Sale) using high-contrast black blocks.
- **Badges:** Small, high-contrast rectangles with 9px bold text.
- **Navigation:**
  - *Header:* Sticky, dark background, minimal icons.
  - *Bottom Bar:* Fixed mobile navigation with simplified icon set and active state indicated by color shifts.
- **Testimonials:** Use the "Brand Cream" as a container with centered serif italics for the quote, emphasizing the "personal recommendation" feel.
- **Feature Icons:** Outlined "Material Symbols" in Sage green, enclosed in thin-bordered circles.