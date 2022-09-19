use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Stored in the account
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub counter: u32,
}

// the program's entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey, //Referenced to Public key of the program program account
    accounts: &[AccountInfo], //All the account info to be passed with to the chain
    _instruction_data: &[u8] //The instruction to be sent to the chain/program
) -> ProgramResult {
    //afaik it is supposed to be the return type of the data to be returned from this function
    let accounts_iter = &mut accounts.iter();

    let account = next_account_info(accounts_iter)?;

    //account owner means the
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    //creating a instance of the PDA
    //accessing the variable to update
    //deserialize this instance from a slice of bytes
    let mut counter_account = CounterAccount::try_from_slice(&account.data.borrow())?;
    counter_account.counter += 1;
    //storing on the chain I suppose
    counter_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Counter state: {}", counter_account.counter);

    Ok(())
}