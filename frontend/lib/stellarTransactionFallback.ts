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
  secretKey?: string; // Optional: use if Freighter not available
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  ledger?: number;
}

/**
 * Execute payment with automatic fallback:
 * 1. Try Freighter if available
 * 2. Use secret key if provided
 */
export async function executePaymentWithFallback(params: TransactionParams): Promise<TransactionResult> {
  const {
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    network = 'testnet',
    secretKey
  } = params;

  try {
    const server = new StellarSdk.Horizon.Server(STELLAR_NETWORK[network]);
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Build transaction
    const transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
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
    
    if (memo) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
    }
    
    const transaction = transactionBuilder.build();
    
    // Try to sign with Freighter first
    const freighter = (window as any).freighter;
    let signedTransaction;
    
    if (freighter && freighter.signTransaction) {
      try {
        console.log('🔐 Attempting to sign with Freighter...');
        const signedXDR = await freighter.signTransaction(transaction.toXDR(), {
          network: network.toUpperCase(),
          networkPassphrase: NETWORK_PASSPHRASE[network],
        });
        
        signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
          signedXDR,
          NETWORK_PASSPHRASE[network]
        );
        console.log('✅ Signed with Freighter');
      } catch (freighterError) {
        console.log('⚠️ Freighter signing failed, trying secret key...');
        if (!secretKey) {
          throw new Error('Freighter failed and no secret key provided');
        }
      }
    }
    
    // If Freighter didn't work and we have secret key, use it
    if (!signedTransaction && secretKey) {
      console.log('🔑 Signing with secret key...');
      const keypair = StellarSdk.Keypair.fromSecret(secretKey);
      transaction.sign(keypair);
      signedTransaction = transaction;
      console.log('✅ Signed with secret key');
    }
    
    if (!signedTransaction) {
      return {
        success: false,
        error: 'No signing method available. Please install Freighter or provide secret key.'
      };
    }
    
    // Submit transaction
    console.log('📡 Submitting transaction...');
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
