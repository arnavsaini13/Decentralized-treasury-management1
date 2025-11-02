#!/bin/bash

# DAO Treasury Contract Interaction Helper
# Makes it easy to interact with your deployed contract

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load contract ID if exists
if [ -f .contract_id ]; then
    CONTRACT_ID=$(cat .contract_id)
    echo -e "${GREEN}✅ Contract ID loaded: $CONTRACT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  No contract ID found. Have you deployed yet?${NC}"
    echo "Enter your contract ID manually (or run ./deploy.sh first):"
    read -r CONTRACT_ID
fi

echo ""
echo -e "${BLUE}🔑 Enter your Freighter public key:${NC}"
read -r SOURCE_KEY

echo ""
echo -e "${BLUE}📋 Select an action:${NC}"
echo "1) Get Balance"
echo "2) Deposit Funds"
echo "3) Create Proposal"
echo "4) Vote on Proposal"
echo "5) Execute Proposal"
echo "6) Get All Proposals"
echo "7) Custom Command"
echo "0) Exit"
echo ""
read -p "Choice: " choice

case $choice in
    1)
        echo -e "${BLUE}📊 Getting treasury balance...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          get_balance
        ;;
    
    2)
        echo "Enter amount (in stroops, 1 XLM = 10000000):"
        read -r amount
        echo -e "${BLUE}💰 Depositing $amount stroops...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          deposit \
          --from "$SOURCE_KEY" \
          --amount "$amount"
        ;;
    
    3)
        echo "Enter proposal description:"
        read -r description
        echo "Enter recipient address:"
        read -r recipient
        echo "Enter amount (in stroops):"
        read -r amount
        echo -e "${BLUE}📝 Creating proposal...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          create_proposal \
          --description "$description" \
          --recipient "$recipient" \
          --amount "$amount"
        ;;
    
    4)
        echo "Enter proposal ID:"
        read -r proposal_id
        echo "Approve? (true/false):"
        read -r approve
        echo -e "${BLUE}🗳️  Voting on proposal $proposal_id...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          vote \
          --proposal_id "$proposal_id" \
          --approve "$approve"
        ;;
    
    5)
        echo "Enter proposal ID to execute:"
        read -r proposal_id
        echo -e "${BLUE}⚡ Executing proposal $proposal_id...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          execute \
          --proposal_id "$proposal_id"
        ;;
    
    6)
        echo -e "${BLUE}📋 Getting all proposals...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          get_proposals
        ;;
    
    7)
        echo "Enter function name:"
        read -r function_name
        echo "Enter additional arguments (e.g., --arg1 value1 --arg2 value2):"
        read -r args
        echo -e "${BLUE}🚀 Invoking $function_name...${NC}"
        stellar contract invoke \
          --id "$CONTRACT_ID" \
          --source "$SOURCE_KEY" \
          --network testnet \
          -- \
          "$function_name" \
          $args
        ;;
    
    0)
        echo "Goodbye! 👋"
        exit 0
        ;;
    
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo -e "${BLUE}🔗 View on Stellar Expert:${NC}"
echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
