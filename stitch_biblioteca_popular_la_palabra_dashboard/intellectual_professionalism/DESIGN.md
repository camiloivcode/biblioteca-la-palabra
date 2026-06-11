---
name: Intellectual Professionalism
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#455f87'
  on-secondary: '#ffffff'
  secondary-container: '#b5d0fd'
  on-secondary-container: '#3e5980'
  tertiary: '#006229'
  on-tertiary: '#ffffff'
  tertiary-container: '#007e37'
  on-tertiary-container: '#c1ffc5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#adc8f5'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#2d486d'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

This design system is engineered for efficiency, clarity, and institutional trust. It targets library administrators and patrons who require a high-performance management environment that feels both sophisticated and invisible. 

The aesthetic is rooted in **Modern Corporate Minimalism**, drawing inspiration from industry-leading SaaS platforms. It prioritizes information density without clutter, utilizing significant white space to reduce cognitive load. The emotional response should be one of "quiet authority"—a tool that feels expensive, precise, and reliable. Every element serves a functional purpose, eschewing decorative trends like glassmorphism or heavy gradients in favor of structural integrity and impeccable typography.

## Colors

The palette is anchored by **Primary Blue (#2563EB)** for actions and **Deep Blue (#1E3A5F)** for core branding and navigational structure. This combination establishes a professional, trustworthy foundation.

- **Background & Surface**: We utilize a tiered white system. `#F8FAFC` serves as the global canvas, while `#FFFFFF` is reserved for elevated containers like cards and modals to create subtle depth.
- **Borders**: The use of `#CBD5E1` provides a crisp, low-contrast definition between elements, maintaining a "high-end" feel without fragmenting the layout.
- **Functional Colors**: Success, Alert, and Warning colors are used sparingly for status indicators and feedback loops, ensuring they command attention only when necessary.

## Typography

The typography system relies exclusively on **Inter** to achieve a neutral, systematic, and highly legible interface. 

- **Weight Strategy**: Use Semi-Bold (600) for headlines to create clear visual entry points. Medium (500) is reserved for interactive elements like buttons and navigation items.
- **Scale**: A strict hierarchy ensures that administrative data is easily scannable. 
- **Character**: For "Display" and "Headline" roles, a slight negative letter spacing is applied to create a tighter, more "editorial" SaaS appearance.
- **Labels**: Small caps or uppercase labels with increased tracking should be used for secondary metadata to differentiate from body text.

## Layout & Spacing

This design system employs a **Fixed-Fluid Hybrid Grid**. Content is housed within a 12-column layout with a maximum width of 1440px, centering the experience on ultra-wide monitors while remaining fluid on smaller screens.

- **Spacing Rhythm**: A 4px baseline grid ensures vertical consistency. 
- **Gutters & Margins**: 24px gutters provide ample breathing room between data modules. 
- **Desktop**: 12 columns.
- **Tablet**: 8 columns with 24px margins.
- **Mobile**: 4 columns with 16px margins. 
- **Philosophy**: Use "Macro-spacing" (40px+) to separate distinct functional areas (e.g., search bar vs. book list) and "Micro-spacing" (8px-16px) for related elements within a card.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Subtle Ambient Shadows** rather than stark borders or heavy gradients.

1.  **Level 0 (Base)**: `#F8FAFC` - The foundational canvas.
2.  **Level 1 (Surface)**: `#FFFFFF` - Cards, input fields, and white containers. These use a 1px border of `#CBD5E1` and a very soft shadow (0px 1px 3px rgba(0,0,0,0.05)).
3.  **Level 2 (Interaction)**: Hover states on cards or navigation items should increase the shadow spread (0px 10px 15px -3px rgba(0,0,0,0.08)) and remove the border or change the border color to Primary Blue.
4.  **Level 3 (Overlays)**: Modals and dropdowns use a crisp shadow with a larger blur (0px 20px 25px -5px rgba(0,0,0,0.1)) to clearly sit above the UI.

## Shapes

The design system uses a **Rounded (0.5rem / 8px)** baseline for standard elements, which strikes a balance between professional geometry and modern approachability.

- **Standard (8px)**: Used for buttons, input fields, and small cards.
- **Large (16px)**: Used for main content containers and dashboard widgets to emphasize their role as distinct sections.
- **Extra Large (24px)**: Used for primary promotional banners or large modal containers.
- **Icons**: Icons should follow a 2px stroke weight and 2px corner radius for internal shapes to match the UI's softened geometric language.

## Components

### Buttons
- **Primary**: Solid Primary Blue (#2563EB) with white text. 8px border radius.
- **Secondary**: Deep Blue (#1E3A5F) outline or background for heavy-weight secondary actions.
- **Ghost**: No background, Primary Blue text. Used for less frequent actions like "Cancel" or "View Details".

### Inputs & Forms
- **Fields**: White background, 1px border (#CBD5E1), 8px radius. On focus, the border changes to Primary Blue with a 2px soft outer glow.
- **Labels**: Small, bolded Inter (#64748B) positioned above the input field.

### Chips & Badges
- **Status Chips**: Use a "tinted" approach. E.g., Success is a light green background with dark green text. No heavy borders.
- **Category Chips**: Deep Blue text on a light slate background.

### Cards
- **Structure**: White background, 1px border, 16px padding.
- **Hierarchy**: Use `title-lg` for card headers and `body-md` for description text.

### Data Tables
- **Styling**: Minimalist. No vertical lines. Only horizontal dividers (#CBD5E1). Header row uses `label-md` with a subtle gray background.

### Navigation
- **Sidebar**: Deep Blue (#1E3A5F) background with white text for a high-contrast administrative feel. Active states should use a left-aligned primary blue indicator pill.