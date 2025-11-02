#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Vec, Symbol, String, BytesN};

// Simple DAO Treasury contract scaffold for Stellar Soroban (SDK v23+).
// This contract implements proposal creation, voting, treasury balance tracking,
// and proposal execution. For native XLM transfers, you'll need to invoke the
// Stellar Asset Contract (SAC) for XLM using contract invocation.

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Proposal {
    pub id: u32,
    pub description: String,
    pub recipient: Address,
    pub amount: i128,
    pub approvals: u32,
    pub rejections: u32,
    pub executed: bool,
}

#[contract]
pub struct DaoContract;

#[contractimpl]
impl DaoContract {
    // Initialize admin and initial members
    pub fn init(env: Env, admin: Address, members: Vec<Address>) {
        // Storage keys
        let admin_key = Symbol::new(&env, "ADMIN");
        let members_key = Symbol::new(&env, "MEMBERS");
        let balance_key = Symbol::new(&env, "BALANCE");
        let proposals_key = Symbol::new(&env, "PROPOSALS");
        let counter_key = Symbol::new(&env, "COUNTER");

        // Only allow init once
        if env.storage().instance().has(&admin_key) {
            panic!("already initialized");
        }

        env.storage().instance().set(&admin_key, &admin);
        env.storage().instance().set(&members_key, &members);
        env.storage().instance().set(&balance_key, &0i128);
        let vec: Vec<Proposal> = Vec::new(&env);
        env.storage().instance().set(&proposals_key, &vec);
        env.storage().instance().set(&counter_key, &0u32);
    }

    // Simple deposit that increases internal bookkeeping balance.
    // In production, you'd verify actual XLM payment via the Stellar Asset Contract
    pub fn deposit(env: Env, _from: Address, amount: i128) {
        if amount <= 0 {
            panic!("deposit amount must be positive");
        }
        let balance_key = Symbol::new(&env, "BALANCE");
        let bal: i128 = env.storage().instance().get(&balance_key).unwrap_or(0i128);
        env.storage().instance().set(&balance_key, &(bal + amount));
    }

    // Create a new proposal — returns its id
    pub fn create_proposal(env: Env, description: String, recipient: Address, amount: i128) -> u32 {
        if amount <= 0 {
            panic!("proposal amount must be positive");
        }

        let counter_key = Symbol::new(&env, "COUNTER");
        let proposals_key = Symbol::new(&env, "PROPOSALS");

        let counter: u32 = env.storage().instance().get(&counter_key).unwrap_or(0u32);
        let new_counter = counter + 1;
        env.storage().instance().set(&counter_key, &new_counter);

        let proposal = Proposal {
            id: new_counter,
            description: description.clone(),
            recipient: recipient.clone(),
            amount,
            approvals: 0,
            rejections: 0,
            executed: false,
        };

        // push into proposals vec
        let mut proposals: Vec<Proposal> = env.storage().instance()
            .get(&proposals_key)
            .unwrap_or(Vec::new(&env));
        proposals.push_back(proposal);
        env.storage().instance().set(&proposals_key, &proposals);

        new_counter
    }

    // Vote on a proposal. For simplicity, we do not track per-voter votes here,
    // but a production contract should prevent double-voting.
    pub fn vote(env: Env, proposal_id: u32, approve: bool) {
        let proposals_key = Symbol::new(&env, "PROPOSALS");
        let mut proposals: Vec<Proposal> = env.storage().instance()
            .get(&proposals_key)
            .unwrap_or(Vec::new(&env));

        let mut found = false;
        for i in 0..proposals.len() {
            let mut p = proposals.get(i).unwrap();
            if p.id == proposal_id {
                if p.executed {
                    panic!("proposal already executed");
                }
                if approve {
                    p.approvals += 1;
                } else {
                    p.rejections += 1;
                }
                proposals.set(i, p);
                found = true;
                break;
            }
        }
        if !found {
            panic!("proposal not found");
        }
        env.storage().instance().set(&proposals_key, &proposals);
    }

    // Execute a proposal if it has majority approvals.
    // Marks executed and decrements internal balance.
    // TODO: Add actual XLM transfer via Stellar Asset Contract invocation
    pub fn execute(env: Env, proposal_id: u32) {
        let proposals_key = Symbol::new(&env, "PROPOSALS");
        let balance_key = Symbol::new(&env, "BALANCE");

        let mut proposals: Vec<Proposal> = env.storage().instance()
            .get(&proposals_key)
            .unwrap_or(Vec::new(&env));

        let mut found = false;
        for i in 0..proposals.len() {
            let mut p = proposals.get(i).unwrap();
            if p.id == proposal_id {
                if p.executed {
                    panic!("already executed");
                }
                // Simple majority check: approvals > rejections
                if p.approvals <= p.rejections {
                    panic!("proposal not approved by majority");
                }

                let bal: i128 = env.storage().instance().get(&balance_key).unwrap_or(0i128);
                if p.amount > bal {
                    panic!("insufficient treasury balance");
                }

                // Deduct balance
                env.storage().instance().set(&balance_key, &(bal - p.amount));

                // TODO: Invoke Stellar Asset Contract for native XLM transfer
                // Example: 
                // let xlm_contract = Address::from_contract_id(&env, &XLM_CONTRACT_ID);
                // env.invoke_contract(&xlm_contract, &Symbol::new(&env, "transfer"), 
                //     vec![&env, env.current_contract_address().into_val(&env), 
                //          p.recipient.into_val(&env), p.amount.into_val(&env)]);

                p.executed = true;
                proposals.set(i, p);
                found = true;
                break;
            }
        }
        if !found {
            panic!("proposal not found");
        }
        env.storage().instance().set(&proposals_key, &proposals);
    }

    pub fn get_balance(env: Env) -> i128 {
        let balance_key = Symbol::new(&env, "BALANCE");
        env.storage().instance().get(&balance_key).unwrap_or(0i128)
    }

    pub fn get_proposals(env: Env) -> Vec<Proposal> {
        let proposals_key = Symbol::new(&env, "PROPOSALS");
        env.storage().instance()
            .get(&proposals_key)
            .unwrap_or(Vec::new(&env))
    }
}

// Unit tests for the contract business logic
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Env, Address, Vec, String, testutils::Address as _};

    #[test]
    fn test_create_vote_execute_flow() {
        let env = Env::default();
        let contract_id = env.register(DaoContract, ());
        let client = DaoContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let member = Address::generate(&env);
        let members: Vec<Address> = Vec::from_array(&env, [member.clone()]);

        // init
        client.init(&admin, &members);

        // deposit 1000
        client.deposit(&admin, &1000i128);
        let bal = client.get_balance();
        assert_eq!(bal, 1000i128);

        // create proposal for 200
        let desc = String::from_str(&env, "Buy coffee");
        let pid = client.create_proposal(&desc, &member, &200i128);
        assert_eq!(pid, 1u32);

        // vote approve
        client.vote(&pid, &true);

        // execute should pass because approvals > rejections
        client.execute(&pid);

        let bal2 = client.get_balance();
        assert_eq!(bal2, 800i128);

        // verify proposal is executed
        let proposals = client.get_proposals();
        let executed_proposal = proposals.get(0).unwrap();
        assert_eq!(executed_proposal.executed, true);
    }

    #[test]
    #[should_panic(expected = "proposal not approved by majority")]
    fn test_execute_fails_without_majority() {
        let env = Env::default();
        let contract_id = env.register(DaoContract, ());
        let client = DaoContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let members: Vec<Address> = Vec::new(&env);

        client.init(&admin, &members);
        client.deposit(&admin, &1000i128);

        let desc = String::from_str(&env, "Should fail");
        let pid = client.create_proposal(&desc, &admin, &200i128);

        // vote reject
        client.vote(&pid, &false);

        // should panic
        client.execute(&pid);
    }
}
