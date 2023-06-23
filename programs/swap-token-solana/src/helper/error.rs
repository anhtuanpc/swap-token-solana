use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("[SWAP]: Amount swap too large")]
    ToolargeAmount,

    #[msg("[SWAP]: Not enough balance")]
    InsufficientFunds,

    #[msg("[SWAP]: Invalid account type")]
    InvalidAccount,

    #[msg("[SWAP]: Invalid input")]
    InvalidInput
}