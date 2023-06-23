use crate::helper::consts::*;
use crate::helper::error::*;
use crate::helper::utils::*;
use crate::instructions::account::*;

use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint, Token, TokenAccount };

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct AddLiquid<'info> {
    #[account(
        mut,
        seeds = [
            TOKEN_SEED,
            authority.key().as_ref(),
            token_mint_address.key().as_ref(),
            pool_config_account.key().as_ref(),
        ],
        bump = pool_config_account.pool_token_account_bump,
        token::mint = token_mint_address,
        token::authority = pool_config_account
    )]
    pub pool_token_account: Account<'info, TokenAccount>,

    /// CHECK: This account will be create when create swap pool
    #[account(mut,
        seeds=[
            NATIVE_SEED,
            authority.key().as_ref(),
            token_mint_address.key().as_ref(),
            pool_config_account.key().as_ref()
        ],
        bump = pool_config_account.pool_native_account_bump
    )]
    pub pool_native_account: AccountInfo<'info>,

    #[account(mut,
        seeds = [
            CONFIG_SEED,
            authority.key().as_ref(),
            token_mint_address.key().as_ref(),
        ],
        bump = pool_config_account.pool_config_account_bump
    )]
    pub pool_config_account: Account<'info, PoolConfigAccount>,
    pub token_mint_address: Account<'info, Mint>,
    /// CHECK: this account use to verify escrow_token_account and config_account seed
    pub authority: AccountInfo<'info>,
    #[account(mut,
    token::mint=token_mint_address,
    token::authority = depositor,
    constraint = depositor_token_account.amount >= amount @ CustomError::InsufficientFunds)]
    pub depositor_token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = depositor.lamports() > 0 && depositor.data_is_empty() @ CustomError::InvalidAccount)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn add_liquidity<'info>(
    ctx: Context<'_, '_, '_, 'info, AddLiquid<'info>>,
    amount: u64
) -> Result<()> {
    transfer_token_to_account(
        ctx.accounts.depositor_token_account.to_account_info(),
        ctx.accounts.pool_token_account.to_account_info(),
        ctx.accounts.depositor.to_account_info(),
        amount,
        ctx.accounts.token_program.to_account_info(),
        None
    )?;
    Ok(())
}