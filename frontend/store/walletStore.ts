import { create } from 'zustand';

// Your wallet configuration
export const TREASURY_WALLET = {
  publicKey: 'GC3LYD4MB43ESIDBVJBH5CVJM36KCYEPIBX3RZFKOY53YOUPCYROSWLU', // Matches your secret key
  // IMPORTANT: Add your secret key here if Freighter doesn't work
  // You can find it in Freighter > Settings > Show secret key
  secretKey: 'SDGPI4SXF6V4UZ5RVEU42AEPMIVE5WPGTHOKR6VWCW2GTMVTWXOSASMC', // Your secret key
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015'
};

export type ProposalCategory = 'Development' | 'Marketing' | 'Security' | 'Social' | 'Infrastructure' | 'Other';

interface Proposal {
  id: number;
  description: string;
  recipient: string;
  amount: string;
  category: ProposalCategory;
  approvals: number;
  rejections: number;
  voters: string[]; // Array of wallet addresses that have voted
  executed: boolean;
  createdAt: Date;
}

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  balance: string;
  network: string;
  proposals: Proposal[];
  contractId: string;
  setPublicKey: (key: string | null) => void;
  setBalance: (balance: string) => void;
  setNetwork: (network: string) => void;
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: number, updates: Partial<Proposal>) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  isConnected: false,
  balance: '0',
  network: 'TESTNET',
  proposals: [],
  contractId: 'CC2OBONLPDUPDMWJ34E77F2YKECLCWC5XS26EZG2KVV5OAS3LW4ZP2MD',
  
  setPublicKey: (key) => set({ publicKey: key, isConnected: !!key }),
  
  setBalance: (balance) => set({ balance }),
  
  setNetwork: (network) => set({ network }),
  
  setProposals: (proposals) => set({ proposals }),
  
  addProposal: (proposal) => set((state) => ({
    proposals: [...state.proposals, proposal]
  })),
  
  updateProposal: (id, updates) => set((state) => ({
    proposals: state.proposals.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  
  disconnect: () => set({
    publicKey: null,
    isConnected: false,
    balance: '0',
    network: 'TESTNET',
    proposals: []
  }),
}));
