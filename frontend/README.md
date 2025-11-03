# 🚀 DAO Treasury - Decentralized Treasury Management

A stunning, modern web application for managing DAO treasuries on the Stellar blockchain with Soroban smart contracts.

![DAO Treasury](https://img.shields.io/badge/Stellar-Soroban-7B3FF2)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Features

### 🎨 Mind-Blowing UI/UX
- **Glassmorphism Design** - Modern glass-effect components with blur effects
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Gradient Backgrounds** - Dynamic mesh gradients and color schemes
- **Responsive Layout** - Perfect experience on all devices
- **Dark Theme** - Eye-friendly interface with purple/blue accents

### 🔥 Core Functionality
- **Wallet Integration** - Seamless Freighter wallet connection
- **Dashboard** - Real-time treasury stats and analytics
- **Proposal Management** - Create, vote, and execute proposals
- **Live Charts** - Beautiful visualizations of treasury performance
- **Activity Feed** - Track all DAO activities in real-time

### 🛡️ Blockchain Features
- **Stellar Integration** - Built on Stellar Soroban
- **Smart Contracts** - Secure treasury management
- **Transparent Voting** - Democratic governance system
- **Multi-sig Security** - Majority approval required

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx             # Main page with hero section
│   └── globals.css          # Global styles and animations
├── components/
│   ├── Navigation.tsx       # Header with wallet connection
│   ├── Dashboard.tsx        # Main dashboard view
│   ├── ProposalList.tsx     # Proposal voting interface
│   ├── CreateProposal.tsx   # Proposal creation form
│   └── TreasuryStats.tsx    # Performance charts
├── store/
│   └── walletStore.ts       # Zustand state management
└── package.json             # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Freighter Wallet extension ([Install here](https://www.freighter.app/))
- Stellar testnet account with XLM

### Installation

1. **Clone the repository**
```bash
cd Decentralized-treasury-management1/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎯 Usage Guide

### 1. Connect Your Wallet
- Click "Connect Wallet" button
- Approve connection in Freighter wallet
- Your address will appear in the navigation bar

### 2. View Dashboard
- See treasury balance and statistics
- Monitor active proposals
- Track voting activity
- View performance charts

### 3. Create Proposals
- Navigate to "Create" tab
- Fill in proposal details:
  - Description of the proposal
  - Recipient Stellar address
  - Amount in XLM
- Submit for community voting

### 4. Vote on Proposals
- Go to "Proposals" tab
- Review proposal details
- Click "Approve" or "Reject"
- Execute when majority approves

## 🎨 Design Highlights

### Color Palette
- **Primary**: Purple (#8b5cf6) to Blue (#3b82f6) gradients
- **Accent**: Pink (#ec4899) and Cyan (#06b6d4)
- **Background**: Dark slate with mesh gradients
- **Glass Effects**: Semi-transparent with backdrop blur

### Animations
- Floating background elements
- Smooth page transitions
- Hover effects on cards
- Loading states and spinners
- Gradient animations

### Components
All components feature:
- ✅ Glass-morphism design
- ✅ Smooth animations
- ✅ Responsive layouts
- ✅ Accessibility features
- ✅ Loading states
- ✅ Error handling

## 🔧 Configuration

### Smart Contract
Update the contract ID in `store/walletStore.ts`:
```typescript
contractId: 'YOUR_CONTRACT_ID_HERE',
```

### Network Settings
The app connects to Stellar testnet by default. To use mainnet:
1. Update Freighter to mainnet
2. Update contract addresses
3. Test thoroughly before deploying

## 📦 Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### Styling & UI
- **TailwindCSS 3** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### State Management
- **Zustand** - Lightweight state management
- **Sonner** - Toast notifications

### Blockchain
- **@stellar/freighter-api** - Wallet integration
- **@stellar/stellar-sdk** - Stellar SDK

## 🌟 Key Features Explained

### Glassmorphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animated Backgrounds
- Floating orbs with different animation delays
- Mesh gradients that subtly animate
- Smooth transitions between states

## 📱 Responsive Design

The interface adapts beautifully to all screen sizes:
- **Mobile**: Stacked layout with hamburger menu
- **Tablet**: 2-column grids
- **Desktop**: Full multi-column layouts

## 🔐 Security

- Client-side wallet integration
- No private keys stored
- All transactions signed in Freighter
- Smart contract security on Stellar

## 🚦 Roadmap

- [x] Stunning UI/UX design
- [x] Wallet integration
- [x] Proposal management
- [x] Voting system
- [ ] Real blockchain integration
- [ ] Member management
- [ ] Multi-signature support
- [ ] Advanced analytics
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Next.js Documentation](https://nextjs.org/docs)

## 💬 Support

For questions and support, please open an issue on GitHub.

---

**Built with ❤️ for the Stellar ecosystem**

Contract ID: `CC2OBONLPDUPDMWJ34E77F2YKECLCWC5XS26EZG2KVV5OAS3LW4ZP2MD`
