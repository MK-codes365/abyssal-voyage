<div align="center">

# 🌊 Abyssal Voyage

_Dive into the depths of an immersive ocean experience_

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38b2ac?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 💡 Concept & Design

**Abyssal Voyage** is an immersive interactive experience that takes users on a journey through Earth's ocean depths. The project combines cutting-edge web technologies with storytelling to create a meditative exploration of marine ecosystems.

### Design Philosophy

The experience is built on **progressive depth revelation**—as users scroll, they descend through distinct ocean zones, each with unique visual characteristics, ambient audio, and interactive elements. The design prioritizes:

- **Atmospheric Immersion** - Layered visuals, dynamic lighting, and spatial audio create presence
- **Smooth Interactions** - GSAP animations and Lenis scrolling ensure fluid, responsive motion
- **Narrative Integration** - AI-generated narration syncs with visual transitions, deepening engagement
- **Accessibility** - Custom cursor effects and pressure overlays enhance interaction without compromising usability

### Technical Approach

We leveraged **React Three Fiber** for 3D rendering, **Next.js** for performance optimization, and **AWS Polly** for dynamic audio generation. The architecture separates concerns into reusable effect components, section modules, and utility hooks—enabling scalability and maintainability.

The result is a seamless blend of art and technology that transforms passive scrolling into active exploration.

---

## ✨ Features

<table>
<tr>
<td align="center" width="50%">

### 🎬 Immersive Visuals

Interactive 3D ocean zones with smooth transitions and depth-based animations

</td>
<td align="center" width="50%">

### 🎵 Dynamic Audio

AI-generated narration synced with visual storytelling

</td>
</tr>
<tr>
<td align="center" width="50%">

### 🎮 Interactive UI

Custom cursor effects and pressure-based overlays

</td>
<td align="center" width="50%">

### 📊 Depth Tracking

Real-time depth meter and zone indicators

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to explore the abyss.

---

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app directory
├── components/
│   ├── effects/      # Visual effects (cursor, pressure, sound)
│   ├── sections/     # Page sections (hero, zones, footer)
│   └── ui/           # Reusable UI components
├── hooks/            # Custom React hooks
└── lib/              # Utilities and animations
```

---

## 🛠️ Tech Stack

| Layer             | Technology                   |
| ----------------- | ---------------------------- |
| **Framework**     | Next.js 16 + React 19        |
| **Styling**       | Tailwind CSS 4 + GSAP        |
| **3D Graphics**   | Three.js + React Three Fiber |
| **Audio**         | AWS Polly + Web Audio API    |
| **Smooth Scroll** | Lenis                        |
| **Icons**         | Lucide React                 |

---

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🌐 Ocean Zones

Explore the depths through distinct zones:

- **Sunlight Zone** - Bright surface waters
- **Twilight Zone** - Dimly lit mid-depths
- **Midnight Zone** - Complete darkness
- **Abyssal Zone** - The deepest trenches
- **Hadal Zone** - Extreme depths

---

## 📦 Key Dependencies

- **@react-three/fiber** - React renderer for Three.js
- **gsap** - Professional animation library
- **lenis** - Smooth scrolling
- **lucide-react** - Beautiful icons
- **next-themes** - Theme management

---

<div align="center">

### 🌊 Dive Deeper

[Explore the Experience](http://localhost:3000) • [View Source](https://github.com) • [Report Issues](https://github.com/issues)

---

_Built with passion for the ocean_ 🐚

</div>
