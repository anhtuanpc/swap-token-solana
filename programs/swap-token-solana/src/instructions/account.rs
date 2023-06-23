use anchor_lang::prelude::*;

#[account]
pub struct SwapConfigAccount {}

impl SwapConfigAccount {
    pub const ACCOUNT_STORAGE_SIZE: usize = 8; //default
}