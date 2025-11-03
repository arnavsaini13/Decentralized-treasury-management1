# 🎨 Frontend Deployment & Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### Step 4: Connect Wallet
1. Install [Freighter Wallet](https://www.freighter.app/) if you haven't
2. Create/import a wallet
3. Switch to Testnet in Freighter settings
4. Click "Connect Wallet" in the app

## 🎯 What You'll See

### Home Page (Landing)
- **Hero Section** with animated gradients
- **Feature Cards** showcasing capabilities
- **Stats Display** with real-time data
- **Call-to-Action** sections
- **Floating Background** elements

### Dashboard (After Connection)
- **Welcome Panel** with connected address
- **Statistics Grid** showing:
  - Treasury Balance
  - Active Proposals
  - Total Members
  - Vote Count
- **Performance Chart** with interactive graphs
- **Recent Activity** feed
- **Quick Actions** buttons

### Proposals Page
- **Search & Filter** functionality
- **Proposal Cards** with:
  - Status badges (Active/Executed)
  - Voting statistics
  - Progress bars
  - Action buttons
- **Vote Interface** (Approve/Reject)
- **Execute Button** for approved proposals

### Create Proposal Page
- **Multi-step Form** with validation
- **Live Preview** of proposal
- **Tips Section** for best practices
- **Submit Button** with loading states

## 🎨 Design Features

### Animations
- Page transitions with Framer Motion
- Hover effects on all interactive elements
- Loading spinners and state transitions
- Floating background orbs
- Gradient animations

### Colors
```css
/* Primary Gradient */
from-purple-600 to-blue-600

/* Glass Effect */
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(10px)

/* Accent Colors */
- Green: Success states
- Red: Error/reject states
- Blue: Information
- Purple: Primary actions
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large sizes
- **Body**: Regular weight
- **Mono**: For addresses and IDs

## 📦 Build for Production

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

## 🔧 Configuration

### Update Contract ID
Edit `store/walletStore.ts`:
```typescript
contractId: 'YOUR_ACTUAL_CONTRACT_ID',
```

### Environment Variables (Optional)
Create `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ID=CC2OBONLPDUPDMWJ34E77F2YKECLCWC5XS26EZG2KVV5OAS3LW4ZP2MD
NEXT_PUBLIC_NETWORK=testnet
```

## 🚀 Performance Optimization

The app is already optimized with:
- ✅ Next.js App Router
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ CSS optimization with Tailwind
- ✅ React Server Components

## 📱 Mobile Experience

The app is fully responsive:
- **Mobile**: Single column, hamburger menu
- **Tablet**: 2-column grid
- **Desktop**: Full multi-column layout

Test on different devices using browser DevTools.

## 🔍 Troubleshooting

### Freighter Not Detected
```
Solution: Install Freighter extension and refresh page
```

### Wallet Connection Fails
```
Solution: 
1. Unlock Freighter wallet
2. Switch to Testnet
3. Try connecting again
```

### Styles Not Loading
```
Solution:
1. Delete .next folder
2. Run: npm run dev
```

### Build Errors
```
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm install
3. Run: npm run build
```

## 🎯 Next Steps

1. **Integrate Real Blockchain**
   - Connect to actual smart contract
   - Implement real transaction signing
   - Add error handling for blockchain calls

2. **Add More Features**
   - Member management
   - Advanced analytics
   - Proposal templates
   - Multi-sig wallets

3. **Enhance UI**
   - Add more charts
   - Implement dark/light theme toggle
   - Add notifications system

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Stellar SDK](https://developers.stellar.org/docs)

## 🎉 You're All Set!

Your frontend is now ready. Visit http://localhost:3000 to see the stunning interface!

---

**Questions?** Check the main README or open an issue on GitHub.
