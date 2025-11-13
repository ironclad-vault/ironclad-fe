# 🏰 IRONCLAD VAULT

## Enterprise-Grade Bitcoin Vault with Time-Locked Security

Brutalist Design • Uncompromising Security • Autonomous Operations

![IRONCLAD VAULT Logo](public/ironclad-vault-logo.png)

---

## What is IRONCLAD VAULT?

**IRONCLAD VAULT** is a revolutionary time-locked Bitcoin custody solution engineered for individuals and institutions who demand absolute control over their digital assets. Built on brutalist principles of stripped-down essentials and uncompromising security, IRONCLAD VAULT empowers users to create cryptographically-secured vaults with configurable lock timers, enabling autonomous wealth preservation without intermediaries.

### Core Value Proposition

- **🔐 Time-Locked Security** — Set precise lock timers on Bitcoin deposits with cryptographic enforcement
- **🎯 Zero Trust Architecture** — Your private keys, your vault, your rules—no middlemen
- **⚡ Autonomous Operations** — Smart contracts handle execution, eliminating counterparty risk
- **🛡️ Institutional Grade** — Built for professional traders, funds, and high-net-worth individuals
- **🌐 On-Chain Transparency** — Every transaction recorded immutably on the blockchain
- **💎 Brutalist Elegance** — Minimal interface, maximum clarity—no unnecessary UI flourishes

## Technical Architecture

IRONCLAD VAULT's frontend delivers exceptional performance and user experience through cutting-edge modern web technologies. The sophisticated stack combines **Next.js 16**, **React 19**, **TypeScript**, and premium animation libraries (GSAP + Lenis), providing instant responsiveness, seamless interactions, and an unmatched visual experience across all devices.

**Design Philosophy:** Brutalist minimalism meets enterprise-grade functionality. Every pixel serves a purpose. Every interaction communicates intent.

## Key Features

- **Enterprise-Grade Security** — Type-safe, auditable codebase with zero `any` types
- **Lightning Performance** — Next.js 16 with Turbopack, SSR, and optimized asset delivery
- **Fluid Animations** — GSAP + ScrollTrigger + Lenis for 60fps smooth interactions
- **Responsive Design** — Tailwind CSS 4 with custom design system for all breakpoints
- **Professional Aesthetics** — Brutalist UI framework with no unnecessary flourishes
- **Full TypeScript Support** — Robust, maintainable, type-safe development throughout

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|----------|
| **Framework** | Next.js | 16.0.2 |
| **Runtime** | React | 19.2.0 |
| **Styling** | Tailwind CSS | 4.0 |
| **Language** | TypeScript | 5.x |
| **Animation** | GSAP + Lenis | Latest |
| **Icons** | Lucide React | 0.553.0 |
| **Linting** | ESLint | 9.x |

## Project Structure

```txt
citadel-fe/
├── app/
│   ├── landing/          # Landing page component
│   ├── vault/            # Vault interface
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Entry point
│   └── globals.css       # Global styling
├── components/           # Reusable React components
├── public/               # Static assets
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun package manager

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd citadel-fe
npm install
```

### Development Server

Start the development server:

```bash
npm run dev
```

Alternatively:

```bash
yarn dev
pnpm dev
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will auto-refresh as you make changes to the source files.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

## Development Workflow

### Code Editing

Start by modifying files in the `app/` directory:

- **Landing Page**: `app/landing/page.tsx`
- **Vault Interface**: `app/vault/page.tsx`
- **Global Styles**: `app/globals.css`

The development server supports hot module replacement (HMR) for instant feedback.

### Font Optimization

This project uses `next/font` to automatically optimize and load custom fonts (Inter, Anton, IBM Plex Mono) from Google Fonts, ensuring optimal performance and zero Cumulative Layout Shift (CLS).

## Production Build

Create an optimized production build:

```bash
npm run build
```

This generates a `.next` directory with optimized static files and server-side rendering artifacts.

## Deployment

### Deploy on Vercel (Recommended)

Vercel, the creators of Next.js, provides the optimal hosting platform:

1. Push your repository to GitHub, GitLab, or Bitbucket
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy with a single click

For detailed deployment instructions, see the [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying).

### Alternative Deployment Options

- **Docker**: Containerize the application for flexible deployment
- **Self-Hosted**: Deploy to your own infrastructure using the production build
- **Serverless**: Deploy on platforms like AWS Lambda, Google Cloud Functions, or Netlify

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs) — Comprehensive Next.js feature and API reference
- [React Documentation](https://react.dev) — Learn React fundamentals and hooks
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) — Utility-first CSS framework guide
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) — TypeScript language reference
- [GSAP Documentation](https://gsap.com/docs) — Animation library reference

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with clear messages
4. Push to your branch
5. Open a Pull Request with a detailed description

## Code Quality

Ensure code quality before submitting changes:

```bash
npm run lint
```

Fix linting issues automatically where possible:

```bash
npm run lint -- --fix
```

## License

This project is proprietary and confidential.

## Support

For issues, questions, or feature requests, please open an issue in the repository or contact the development team.

---

**IRONCLAD VAULT** — *Brutalist Bitcoin Vault*

Built with precision. Designed for security. Made to last.
