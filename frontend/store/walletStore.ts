import { create } from 'zustand';

interface Proposal {
  id: number;
  description: string;
  recipient: string;
  amount: string;
  approvals: number;
  rejections: number;
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
