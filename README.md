# PayFi – CryptoTracker

A real-time cryptocurrency transaction tracker with MetaMask wallet integration, built for the Shardeum network.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- ethers.js
- MetaMask (via `@metamask/detect-provider`)

## Features

- MetaMask wallet connection and balance display
- Real-time Shardeum transaction fetching and display
- Custom React hooks to categorize and tag transactions dynamically
- Flowchart-based visualizations for expense tracking and actionable insights
- Analytics dashboard with charts (Nivo, Recharts, Chart.js)
- AI-assisted transaction insights via Google Generative AI

## Getting Started

### Prerequisites

- Node.js 18 or later
- MetaMask browser extension

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
  components/    UI components (Dashboard, Header, Navigation, Analytics, TransactionHistory, WalletConnection)
  hooks/         Custom React hooks (useWallet, useTransactions)
  main.tsx       Application entry point
  App.tsx        Root component
```

## Usage

Connect your MetaMask wallet to the Shardeum network. The application will automatically fetch your transaction history, categorize transactions, and display spending insights through the dashboard and analytics views.
