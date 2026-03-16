# Figma Model - Chilllink

This document defines a practical Figma structure for the Chilllink project.
It is intended to be recreated directly in Figma without additional design decisions.

## Goal

Build a clean and reusable Figma file for:
- authentication screens
- main chat dashboard
- workspace and channel management modals
- profile management
- a small shared design system

## Recommended Figma File Structure

### Page 1 - Cover
- `Cover / Chilllink`
- `Project summary`

### Page 2 - Foundations
- `Colors`
- `Typography`
- `Spacing`
- `Radii`
- `Shadows`
- `Icons`

### Page 3 - Components
- `Buttons`
- `Inputs`
- `Textareas`
- `Dropdowns`
- `Sidebar items`
- `Workspace item`
- `Channel item`
- `Message bubble`
- `Modal shell`
- `Alerts`
- `Badges`

### Page 4 - Authentication
- `Login screen`
- `Register screen`

### Page 5 - Dashboard
- `Chat dashboard`
- `Empty state`
- `Locked channel state`

### Page 6 - Modals
- `Create workspace modal`
- `Rename workspace modal`
- `Delete workspace confirmation`
- `Workspace members modal`
- `Create channel modal`
- `Channel settings modal`
- `Profile modal`

### Page 7 - Prototype
- `Main user flow`
- `Auth flow`
- `Workspace and channel management flow`

## Suggested Frame Naming

Use a stable naming convention:

- `Auth / Login`
- `Auth / Register`
- `Dashboard / Chat`
- `Dashboard / Empty channel`
- `Dashboard / Locked channel`
- `Modal / Create workspace`
- `Modal / Delete workspace`
- `Modal / Workspace members`
- `Modal / Create channel`
- `Modal / Channel settings`
- `Modal / Profile`

## Recommended Frame Sizes

Desktop first:
- `1440 x 1024` for the main application
- `1280 x 900` for lighter dashboard variants
- `480 x 640` to `640 x 720` for standalone auth screens

Modal working area:
- `640 x 520`
- `720 x 620`
- `820 x 640`

## Design Tokens

These values are aligned with the current Chilllink UI direction.

### Colors

- `bg/app`: `#0b0f19`
- `bg/surface`: `#111827`
- `bg/surface-alt`: `#1f2937`
- `bg/input`: `#0f172a`
- `border/default`: `#334155`
- `border/strong`: `#94a3b8`
- `text/primary`: `#f8fafc`
- `text/secondary`: `#cbd5e1`
- `text/muted`: `#94a3b8`
- `brand/primary`: `#f59e0b`
- `brand/primary-hover`: `#fbbf24`
- `accent/info`: `#60a5fa`
- `accent/success`: `#34d399`
- `accent/danger`: `#ef4444`
- `overlay`: `rgba(2, 6, 23, 0.72)`

### Typography

Recommended families:
- `Sora` for titles
- `Manrope` for interface text

Fallback if needed:
- `Segoe UI`, `sans-serif`

Text styles:
- `Heading / XL`: 32, semibold
- `Heading / L`: 24, semibold
- `Heading / M`: 20, semibold
- `Body / L`: 16, medium
- `Body / M`: 14, regular
- `Body / S`: 12, medium
- `Label / M`: 13, semibold

### Spacing

Use an 8px base scale:
- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `40`

### Radii

- `sm`: `10`
- `md`: `14`
- `lg`: `18`
- `xl`: `24`
- `pill`: `999`

### Shadows

- `modal`:
  - `0 20 60 rgba(0,0,0,0.45)`
- `soft`:
  - `0 8 24 rgba(0,0,0,0.18)`

## Core Components

### Buttons

Create these variants:
- `Button / Primary`
- `Button / Secondary`
- `Button / Danger`
- `Button / Ghost`
- `Button / Icon`

States:
- `default`
- `hover`
- `pressed`
- `disabled`

### Inputs

Create:
- `Input / Default`
- `Input / With icon`
- `Input / Error`
- `Input / Disabled`

### Modal Shell

Base modal should include:
- header title
- subtitle
- close button
- content area
- actions area

Variants:
- `Modal / Form`
- `Modal / Confirmation`
- `Modal / Members management`

### Message Bubble

Variants:
- `Message / Mine`
- `Message / Other`
- `Message / System`

Optional sub-elements:
- avatar
- author
- timestamp
- content

## Screens To Build First

Priority order:

1. `Auth / Login`
2. `Auth / Register`
3. `Dashboard / Chat`
4. `Modal / Profile`
5. `Modal / Workspace members`
6. `Modal / Channel settings`
7. `Modal / Create workspace`
8. `Modal / Create channel`
9. `Modal / Delete workspace`

## Screen Content Guidelines

### Auth / Login

Include:
- logo
- title
- email input
- password input
- primary CTA
- link to register

Reference:
- `docs/wireframe/wireframe-login-screen.png`

### Auth / Register

Include:
- logo
- title
- email input
- password input
- primary CTA
- link to login

Reference:
- `docs/wireframe/wireframe-register-screen.png`

### Dashboard / Chat

Include:
- top global header
- workspace rail
- channel sidebar
- main message area
- channel action button
- message composer
- typing indicator area

Reference:
- `docs/wireframe/wireframe-chat-thread.png`

### Modal / Profile

Include:
- first name
- last name
- birth date
- phone
- city
- country
- bio
- close and save actions

Reference:
- `docs/wireframe/wireframe-profile-modal.png`

### Modal / Workspace members

Include:
- invite by email field
- members list
- remove action
- close and save actions

Reference:
- `docs/wireframe/wireframe-workspace-members-modal.png`

### Modal / Channel settings

Include:
- rename field
- add member field
- member list
- remove member actions
- destructive zone for delete

Reference:
- `docs/wireframe/wireframe-channel-settings-modal.png`

### Modal / Create workspace

Include:
- workspace name field
- helper text
- cancel and create actions

Reference:
- `docs/wireframe/wireframe-create-workspace-modal.png`

### Modal / Create channel

Include:
- channel name field
- helper text about access
- cancel and create actions

Reference:
- `docs/wireframe/wireframe-create-channel-modal.png`

### Modal / Delete workspace

Include:
- destructive title
- warning text
- impact summary
- cancel and confirm delete actions

Reference:
- `docs/wireframe/wireframe-workspace-delete-confirmation.png`

## Prototype Links

Recommended prototype flow:

1. `Login` -> `Dashboard / Chat`
2. `Dashboard / Chat` -> `Profile modal`
3. `Dashboard / Chat` -> `Workspace members modal`
4. `Dashboard / Chat` -> `Channel settings modal`
5. `Dashboard / Chat` -> `Create workspace modal`
6. `Dashboard / Chat` -> `Create channel modal`
7. `Dashboard / Chat` -> `Delete workspace confirmation`

## Component Naming Convention

Use slash-based naming:

- `Button/Primary/Default`
- `Button/Primary/Hover`
- `Input/Default`
- `Input/Error`
- `Modal/Form`
- `Modal/Confirmation`
- `Sidebar/WorkspaceItem`
- `Sidebar/ChannelItem`
- `Message/Mine`
- `Message/Other`

## Practical Build Order In Figma

1. Create color and text styles
2. Create layout grid for desktop screens
3. Create buttons and inputs
4. Create modal shell
5. Create sidebar items and message bubbles
6. Assemble auth screens
7. Assemble dashboard
8. Assemble modals
9. Link main prototype

## Deliverables Expected In Figma

- one clean file
- reusable components with variants
- desktop screens for the main flows
- at least one clickable prototype path
- consistent naming for styles and layers
