#!/bin/bash

# DAO Treasury Deployment Script (Using Stellar Identity)
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

# Check for existing identity or create one
echo "🔑 Checking for Stellar identity..."
if stellar keys ls | grep -q "dao-deployer"; then
    echo "✅ Found existing identity: dao-deployer"
else
    echo "📝 Creating new identity 'dao-deployer'..."
    echo ""
    echo "Choose an option:"
    echo "1) Generate a new keypair (for testing)"
    echo "2) Import your Freighter wallet secret key"
    read -p "Choice (1 or 2): " key_choice
    
    if [ "$key_choice" = "1" ]; then
        stellar keys generate dao-deployer --network testnet --fund
        echo "✅ New keypair generated and funded with testnet XLM"
    else
        echo ""
        echo "⚠️  SECURITY WARNING: Your secret key will be stored locally"
        echo "Only use this for testing on Testnet!"
        echo ""
        echo "Enter your Freighter wallet SECRET KEY (starts with S):"
        read -r SECRET_KEY
        echo "$SECRET_KEY" | stellar keys add dao-deployer --secret-key
        echo "✅ Identity imported"
    fi
fi

# Get the public key for the identity
PUBLIC_KEY=$(stellar keys address dao-deployer)
echo ""
echo "📋 Using address: $PUBLIC_KEY"
echo ""

# Fund account if needed (testnet only)
echo "💰 Checking account balance..."
if stellar keys fund dao-deployer --network testnet 2>/dev/null; then
    echo "✅ Account funded with testnet XLM"
else
    echo "ℹ️  Account already has funds or funding skipped"
fi
echo ""

echo "📤 Deploying contract to Stellar Testnet..."
echo ""

# Deploy the contract
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source dao-deployer \
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
        echo ""
        echo "🚀 Initializing contract with admin only..."
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source dao-deployer \
          --network testnet \
          -- \
          init \
          --admin "$PUBLIC_KEY" \
          --members '[]'
    else
        # Convert comma-separated to JSON array
        IFS=',' read -ra ADDR <<< "$MEMBERS_INPUT"
        MEMBERS_JSON="["
        for i in "${ADDR[@]}"; do
            MEMBERS_JSON+="\"$(echo $i | xargs)\","
        done
        MEMBERS_JSON="${MEMBERS_JSON%,}]"
        
        echo ""
        echo "🚀 Initializing contract..."
        echo "   Admin: $PUBLIC_KEY"
        echo "   Members: $MEMBERS_JSON"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source dao-deployer \
          --network testnet \
          -- \
          init \
          --admin "$PUBLIC_KEY" \
          --members "$MEMBERS_JSON"
    fi
    
    echo ""
    echo "✅ Contract initialized successfully!"
fi

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "📝 Your Contract ID: $CONTRACT_ID"
echo "📝 Your Address: $PUBLIC_KEY"
echo ""
echo "🔗 View on Stellar Expert:"
echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "📚 Next steps:"
echo "   1. Test your contract with: ./interact.sh"
echo "   2. Or use: make interact"
echo "   3. Check DEPLOY.md for more examples"
echo ""
echo "💡 Quick test commands:"
echo "   # Check balance"
echo "   stellar contract invoke --id $CONTRACT_ID --source dao-deployer --network testnet -- get_balance"
echo ""
echo "   # Deposit funds (10 XLM = 100000000 stroops)"
echo "   stellar contract invoke --id $CONTRACT_ID --source dao-deployer --network testnet -- deposit --from $PUBLIC_KEY --amount 100000000"
echo ""
echo "Happy DAO building! 🚀"
