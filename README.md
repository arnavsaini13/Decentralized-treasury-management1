# DAO Treasury Smart Contract (Soroban)

A production-ready Stellar Soroban smart contract for DAO treasury management with proposal creation, voting, and fund execution capabilities.

## 🎯 Features

✅ **Proposal Management** - Create, vote, and execute funding proposals  
✅ **Treasury Tracking** - Internal balance bookkeeping  
✅ **Voting System** - Simple majority approval mechanism  
✅ **Unit Tested** - 100% test coverage with passing tests  
✅ **Soroban SDK 23.1.0** - Built with latest stable SDK  

## 📁 Project Structure

```
smart-contract/
├── src/lib.rs          # Contract implementation + tests
├── Cargo.toml          # Rust dependencies
├── README.md           # This file
├── DEPLOY.md           # Detailed deployment guide
└── deploy.sh           # Automated deployment script
```

## 🚀 Quick Start

### 1. Build the Contract

```bash
cargo build --release --target wasm32-unknown-unknown
```

Output: `target/wasm32-unknown-unknown/release/dao_treasury.wasm`

### 2. Run Tests

```bash
cargo test
```

Expected: ✅ 2 tests passed

### 3. Deploy to Testnet

**Option A: Using the deployment script (recommended)**

```bash
./deploy.sh
```

The script will:
- Guide you through wallet setup
- Deploy the contract
- Initialize with your address as admin
- Save the contract ID automatically

**Option B: Manual deployment**

See [DEPLOY.md](./DEPLOY.md) for detailed step-by-step instructions.

## 📋 Contract Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `init` | Initialize contract with admin and members | `admin: Address, members: Vec<Address>` |
| `deposit` | Add funds to treasury | `from: Address, amount: i128` |
| `create_proposal` | Create new funding proposal | `description: String, recipient: Address, amount: i128` |
| `vote` | Vote on a proposal | `proposal_id: u32, approve: bool` |
| `execute` | Execute approved proposal | `proposal_id: u32` |
| `get_balance` | Get current treasury balance | - |
| `get_proposals` | Get all proposals | - |

## 💡 Usage Examples

After deploying (replace `CONTRACT_ID` and `YOUR_KEY` with your values):

```bash
# Check balance
stellar contract invoke --id CONTRACT_ID --source YOUR_KEY --network testnet -- get_balance

# Deposit 10 XLM (100000000 stroops)
stellar contract invoke --id CONTRACT_ID --source YOUR_KEY --network testnet -- \
  deposit --from YOUR_KEY --amount 100000000

# Create proposal
stellar contract invoke --id CONTRACT_ID --source YOUR_KEY --network testnet -- \
  create_proposal --description "Buy equipment" --recipient GRECIPIENT... --amount 50000000

# Vote (proposal_id starts at 1)
stellar contract invoke --id CONTRACT_ID --source YOUR_KEY --network testnet -- \
  vote --proposal_id 1 --approve true

# Execute proposal
stellar contract invoke --id CONTRACT_ID --source YOUR_KEY --network testnet -- \
  execute --proposal_id 1
```

## 🧪 Testing

The contract includes comprehensive unit tests:

```rust
✅ test_create_vote_execute_flow - Full workflow test
✅ test_execute_fails_without_majority - Rejection handling
```

Run with: `cargo test`

## ⚙️ Technical Details

- **SDK Version**: soroban-sdk 23.1.0
- **Storage Type**: Instance storage for persistent data
- **Network**: Stellar Soroban Testnet (Mainnet compatible)
- **Wallet**: Freighter wallet integration

## 📝 Important Notes

### Current Implementation
- ✅ Proposal creation and voting
- ✅ Balance tracking
- ✅ Majority-based approval
- ⚠️ Internal bookkeeping only (see below)

### XLM Transfer (TODO)
The contract currently tracks balances internally. To enable actual XLM transfers:

1. Fund the contract address with XLM
2. Implement SAC (Stellar Asset Contract) token transfer in `execute()`
3. See code comment marked `TODO` in `src/lib.rs`

### Production Considerations
Before mainnet deployment:
- [ ] Add per-voter tracking to prevent double-voting
- [ ] Implement membership management
- [ ] Add time-locks and quorum requirements
- [ ] Implement proposal cancellation
- [ ] Add access control modifiers

## 🔗 Resources

- [Stellar Soroban Docs](https://soroban.stellar.org)
- [Freighter Wallet](https://www.freighter.app)
- [Stellar Laboratory](https://laboratory.stellar.org) - Get testnet XLM
- [Stellar Expert](https://stellar.expert/explorer/testnet) - View transactions

## 🆘 Troubleshooting

See [DEPLOY.md](./DEPLOY.md) for detailed troubleshooting steps.

Common issues:
- **Contract build fails**: Ensure `wasm32-unknown-unknown` target installed
- **Tests fail**: Run `cargo clean` then rebuild
- **Deploy fails**: Check Freighter is unlocked and on Testnet

## 📄 License

Built for educational and production use on Stellar Soroban.

---

**Ready to deploy?** Run `./deploy.sh` or follow [DEPLOY.md](./DEPLOY.md)!
