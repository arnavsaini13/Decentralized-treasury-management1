#!/bin/bash

# DAO Treasury Deployment Script
# This script helps deploy and initialize the DAO Treasury contract

set -e

echo "🌟 DAO Treasury Contract Deployment Script"
echo "==========================================="
echo ""

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Please install it first:"
    echo "   cargo install --locked stellar-cli --features opt"
    exit 1
fi

echo "✅ Stellar CLI found: $(stellar --version | head -n 1)"
echo ""

# Check if contract is built
WASM_PATH="target/wasm32-unknown-unknown/release/dao_treasury.wasm"
if [ ! -f "$WASM_PATH" ]; then
    echo "📦 Contract not built. Building now..."
    cargo build --release --target wasm32-unknown-unknown
    echo "✅ Contract built successfully"
else
    echo "✅ Contract wasm found at: $WASM_PATH"
fi
echo ""

# Get Freighter public key
echo "🔑 Please enter your Freighter wallet public key (starts with G):"
read -r FREIGHTER_KEY

if [[ ! $FREIGHTER_KEY =~ ^G[A-Z0-9]{55}$ ]]; then
    echo "❌ Invalid public key format. It should start with 'G' and be 56 characters long."
    exit 1
fi

echo ""
echo "📤 Deploying contract to Stellar Testnet..."
echo "   Source: $FREIGHTER_KEY"
echo ""
echo "⚠️  Your Freighter wallet will open. Please approve the transaction."
echo ""

# Deploy the contract
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$FREIGHTER_KEY" \
  --network testnet)

if [ -z "$CONTRACT_ID" ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Contract deployed successfully!"
echo "📝 Contract ID: $CONTRACT_ID"
echo ""

# Save contract ID to file
echo "$CONTRACT_ID" > .contract_id
echo "💾 Contract ID saved to .contract_id"
echo ""

# Ask if user wants to initialize
echo "🎬 Do you want to initialize the contract now? (y/n)"
read -r INITIALIZE

if [[ $INITIALIZE =~ ^[Yy]$ ]]; then
    echo ""
    echo "👥 Enter member addresses (comma-separated, or press Enter for none):"
    read -r MEMBERS_INPUT
    
    # Format members array
    if [ -z "$MEMBERS_INPUT" ]; then
        MEMBERS_ARG="--members []"
    else
        # Convert comma-separated to JSON array
        MEMBERS_ARRAY=$(echo "$MEMBERS_INPUT" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')
        MEMBERS_ARG="--members $MEMBERS_ARRAY"
    fi
    
    echo ""
    echo "🚀 Initializing contract..."
    echo "   Admin: $FREIGHTER_KEY"
    echo "   Members: $MEMBERS_ARG"
    echo ""
    
    stellar contract invoke \
      --id "$CONTRACT_ID" \
      --source "$FREIGHTER_KEY" \
      --network testnet \
      -- \
      init \
      --admin "$FREIGHTER_KEY" \
      $MEMBERS_ARG
    
    echo ""
    echo "✅ Contract initialized successfully!"
fi

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "📝 Your Contract ID: $CONTRACT_ID"
echo ""
echo "🔗 View on Stellar Expert:"
echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "📚 Next steps:"
echo "   1. Test your contract with: stellar contract invoke --id $CONTRACT_ID ..."
echo "   2. Check the DEPLOY.md file for example commands"
echo "   3. Use get_balance, deposit, create_proposal, vote, execute functions"
echo ""
echo "💡 Quick commands:"
echo "   # Check balance"
echo "   stellar contract invoke --id $CONTRACT_ID --source $FREIGHTER_KEY --network testnet -- get_balance"
echo ""
echo "   # Deposit funds"
echo "   stellar contract invoke --id $CONTRACT_ID --source $FREIGHTER_KEY --network testnet -- deposit --from $FREIGHTER_KEY --amount 1000000000"
echo ""
echo "Happy DAO building! 🚀"
