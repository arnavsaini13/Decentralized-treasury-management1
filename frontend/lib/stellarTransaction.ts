import * as StellarSdk from '@stellar/stellar-sdk';

export const STELLAR_NETWORK = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

export const NETWORK_PASSPHRASE = {
  testnet: StellarSdk.Networks.TESTNET,
  mainnet: StellarSdk.Networks.PUBLIC,
};

export interface TransactionParams {
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
  memo?: string;
  network?: 'testnet' | 'mainnet';
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  ledger?: number;
}

/**
 * Build and submit a Stellar payment transaction using Freighter
 */
export async function executePayment(params: TransactionParams): Promise<TransactionResult> {
  const {
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    network = 'testnet'
  } = params;

  try {
    // Initialize server
    const server = new StellarSdk.Horizon.Server(STELLAR_NETWORK[network]);
    
    // Load source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE[network],
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(180);
    
    // Add memo if provided
    if (memo) {
      transaction.addMemo(StellarSdk.Memo.text(memo));
    }
    
    const builtTransaction = transaction.build();
    
    // Sign with Freighter if available
    const freighter = (window as any).freighter;
    
    if (!freighter || !freighter.signTransaction) {
      return {
        success: false,
        error: 'Freighter wallet not available. Please install Freighter extension to sign transactions.'
      };
    }
    
    console.log('🔐 Requesting transaction signature from Freighter...');
    
    // Sign transaction
    const signedXDR = await freighter.signTransaction(builtTransaction.toXDR(), {
      network: network.toUpperCase(),
      networkPassphrase: NETWORK_PASSPHRASE[network],
    });
    
    console.log('✅ Transaction signed successfully');
    
    // Parse signed transaction
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE[network]
    );
    
    // Submit to network
    console.log('📡 Submitting transaction to Stellar network...');
    const result = await server.submitTransaction(signedTransaction as any);
    
    console.log('✅ Transaction successful!', result);
    
    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
    };
    
  } catch (error: any) {
    console.error('❌ Transaction error:', error);
    
    let errorMessage = 'Transaction failed';
    
    if (error.toString().includes('User declined')) {
      errorMessage = 'Transaction declined by user';
    } else if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMessage = `Transaction failed: ${codes.transaction || codes.operations?.join(', ')}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if Freighter wallet is available and connected
 */
export async function checkFreighterAvailability(): Promise<{
  available: boolean;
  connected: boolean;
  publicKey?: string;
}> {
  try {
    const freighter = (window as any).freighter;
    
    if (!freighter) {
      return { available: false, connected: false };
    }
    
    const isConnected = await freighter.isConnected();
    
    if (!isConnected) {
      return { available: true, connected: false };
    }
    
    const publicKey = await freighter.getPublicKey();
    
    return {
      available: true,
      connected: true,
      publicKey,
    };
    
  } catch (error) {
    console.error('Error checking Freighter:', error);
    return { available: false, connected: false };
  }
}
