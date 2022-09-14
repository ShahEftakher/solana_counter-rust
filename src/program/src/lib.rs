use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey
};

/// Stored in the account
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount{
    pub counter: u32,
}

// the program's entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey, //Referenced to Public key of the account program is loaded into
    accounts: &[AccountInfo], //All the account info to be passed with to the chain
    _instruction_data: &[u8] //The instruction to be sent to the chain/program
)->ProgramResult{ //afaik it is supposed to be the return type of the data to be returned from this function

}


