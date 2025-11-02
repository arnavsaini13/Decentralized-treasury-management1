# 🚀 DAO Treasury Contract Deployment Guide

## ✅ Prerequisites Completed

- ✅ Rust contract compiled successfully
- ✅ Unit tests passed (2/2 tests passing)
- ✅ Stellar CLI installed (v23.1.4)
- ✅ Testnet network configured

## 📋 What You Need

1. **Freighter Wallet** with Testnet enabled
2. **Testnet XLM** (you mentioned you have 10,000 XLM ✅)
3. **Your Freighter Public Key** (we'll get this in Step 1)

---

## 🔑 Step 1: Get Your Freighter Public Key

1. Open your **Freighter wallet extension**
2. Make sure you're on **Testnet** (check the network dropdown at the top)
3. Click on your account name
4. Click **"Copy Address"** or manually copy the public key (starts with `G...`)

Example format: `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## 🏗️ Step 2: Build the Contract (Already Done!)

The contract has already been built. The wasm file is located at:
```
target/wasm32-unknown-unknown/release/dao_treasury.wasm
```

To rebuild if needed:
```bash
cd smart-contract
cargo build --release --target wasm32-unknown-unknown
```

---

## 📤 Step 3: Deploy the Contract

Replace `YOUR_FREIGHTER_PUBLIC_KEY` with your actual public key from Step 1.

```bash
cd smart-contract

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/dao_treasury.wasm \
  --source YOUR_FREIGHTER_PUBLIC_KEY \
  --network testnet
```

**What happens:**
- Stellar CLI will upload your contract to Testnet
- You'll be prompted to sign the transaction in Freighter
- You'll receive a **Contract ID** (starts with `C...`)
- Save this Contract ID! You'll need it for all future interactions

**Example output:**
```
CBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🎬 Step 4: Initialize the Contract

After deploying, initialize the contract with your wallet as admin.

Replace:
- `CONTRACT_ID` = the ID you received in Step 3
- `YOUR_PUBLIC_KEY` = your Freighter public key

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  init \
  --admin YOUR_PUBLIC_KEY \
  --members '[]'
```

**Note:** The `--members '[]'` creates an empty members list. To add members:
```bash
--members '["GMEMBER1...", "GMEMBER2..."]'
```

---

## 💰 Step 5: Test Your Contract

### Check Balance
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  get_balance
```

### Deposit Funds
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  deposit \
  --from YOUR_PUBLIC_KEY \
  --amount 1000000000
```
*(Amount is in stroops: 1 XLM = 10,000,000 stroops)*

### Create a Proposal
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  create_proposal \
  --description "Test proposal" \
  --recipient GRECIPIENT_PUBLIC_KEY \
  --amount 500000000
```

### Vote on Proposal
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  vote \
  --proposal_id 1 \
  --approve true
```

### Execute Proposal
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  execute \
  --proposal_id 1
```

### Get All Proposals
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_PUBLIC_KEY \
  --network testnet \
  -- \
  get_proposals
```

---

## 🔍 Verify on Stellar Expert

After deploying, you can view your contract on Stellar Expert:

**Testnet:** https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID

---

## 💡 Tips

1. **Save Your Contract ID**: Store it in a file or environment variable:
   ```bash
   export DAO_CONTRACT_ID="CBXXXXXXX..."
   ```

2. **Check Transaction Status**: Every invoke shows a transaction hash. View it on:
   https://stellar.expert/explorer/testnet/tx/TRANSACTION_HASH

3. **Freighter Auto-Opens**: When you run deploy/invoke commands, Freighter will automatically open for signing

4. **Transaction Fees**: Each operation costs a small amount of XLM (usually < 0.01 XLM)

---

## ⚠️ Important Notes

- **Native XLM Transfer**: The current contract tracks balances internally. To enable actual XLM transfers from the contract's balance to recipients, you'll need to:
  1. Send XLM to the contract address
  2. Implement SAC (Stellar Asset Contract) token transfer in the `execute` function
  
  The contract currently has a TODO marker where this should be added.

- **Double Voting Prevention**: The current version doesn't prevent users from voting multiple times. For production, implement per-voter tracking.

---

## 🆘 Troubleshooting

### "insufficient balance"
- Make sure your Freighter wallet has enough testnet XLM
- Get more from: https://laboratory.stellar.org/#account-creator?network=test

### "Contract already initialized"
- You can only call `init` once. If you need to reinitialize, deploy a new contract

### "proposal not found"
- Make sure you're using the correct proposal_id (starts from 1, not 0)

### Freighter doesn't pop up
- Make sure Freighter is unlocked
- Check that you're on Testnet in Freighter
- Try refreshing your browser

---

## 📝 Next Steps

Once deployed and tested, you can:

1. **Build a Frontend**: Create a React app to interact with this contract using:
   - `@stellar/stellar-sdk` for contract calls
   - `@stellar/freighter-api` for wallet connection

2. **Add Features**:
   - Time-locks for proposals
   - Quorum requirements
   - Proposal cancellation
   - Member management functions

3. **Deploy to Mainnet**: When ready, deploy to mainnet by:
   - Changing `--network testnet` to `--network mainnet`
   - Using real XLM (not testnet)
   - Adding mainnet network config to stellar CLI

---

## 📞 Ready to Deploy?

1. Get your Freighter public key
2. Run the deploy command from Step 3
3. Run the init command from Step 4
4. Start testing with Step 5!

**Need help?** Share your Freighter public key and I can generate the exact commands for you to copy-paste!
