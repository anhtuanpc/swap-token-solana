use crate::helper::consts::*;
use crate::instructions::*;
use crate::helper::utils::*;
use crate::helper::error::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{ Mint, Token, TokenAccount };

#[derive(Accounts)]
#[instruction(lamport_amount: u64)]
pub struct SwapToken<'info> {
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
    #[account(
        init_if_needed,
        associated_token::mint = token_mint_address,
        associated_token::authority = user,
        payer = user
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    pub token_mint_address: Account<'info, Mint>,
    #[account(mut, constraint = authority.data_is_empty() @ CustomError::InvalidAccount)]
    pub authority: Signer<'info>,
    #[account(mut, constraint = user.lamports() > lamport_amount @ CustomError::InsufficientFunds)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn swap_token<'info>(
    ctx: Context<'_, '_, '_, 'info, SwapToken<'info>>,
    amount: u64,
    is_native: bool
) -> Result<()> {
    let token_price = ctx.accounts.pool_config_account.token_price;
    if is_native == true {
        let token_amount = token_price * amount / LAMPORTS_PER_SOL;
        ctx.accounts.transfer_sol_in(amount)?;
        ctx.accounts.transfer_token_out(token_amount)?;
    } else {
        let lamport_amount = amount * LAMPORTS_PER_SOL / token_price;
        ctx.accounts.transfer_token_in(amount)?;
        ctx.accounts.transfer_sol_out(lamport_amount)?;
    }
    Ok(())
}

impl<'info> SwapToken<'info> {
    fn transfer_sol_in(&self, lamports_amount: u64) -> Result<()> {
        transfer_native_to_account(
            self.user.to_account_info(),
            self.pool_native_account.to_account_info(),
            lamports_amount,
            self.system_program.to_account_info(),
            None
        )?;
        Ok(())
    }

    fn transfer_sol_out(&self, lamports_amount: u64) -> Result<()> {
        let authority = self.authority.key();
        let mint = self.token_mint_address.key();
        let pool_native_account_bump = self.pool_config_account.pool_native_account_bump;
        let pool_config_account = self.pool_config_account.key();
        let seeds = &[
            &[
                NATIVE_SEED,
                authority.as_ref(),
                mint.as_ref(),
                pool_config_account.as_ref(),
                bytemuck::bytes_of(&pool_native_account_bump),
            ][..],
        ];
        transfer_native_to_account(
            self.pool_native_account.to_account_info(),
            self.user.to_account_info(),
            lamports_amount,
            self.system_program.to_account_info(),
            Some(seeds)
        )?;
        Ok(())
    }

    fn transfer_token_out(&self, token_amount: u64) -> Result<()> {
        let authority = self.authority.key();
        let mint = self.token_mint_address.key();
        let pool_config_account_bump = self.pool_config_account.pool_config_account_bump;
        let seeds = &[
            &[
                CONFIG_SEED,
                authority.as_ref(),
                mint.as_ref(),
                bytemuck::bytes_of(&pool_config_account_bump),
            ][..],
        ];
        transfer_token_to_account(
            self.pool_token_account.to_account_info(),
            self.user_token_account.to_account_info(),
            self.pool_config_account.to_account_info(),
            token_amount,
            self.token_program.to_account_info(),
            Some(seeds)
        )?;

        Ok(())
    }

    fn transfer_token_in(&self, token_amount: u64) -> Result<()> {
        transfer_token_to_account(
            self.user_token_account.to_account_info(),
            self.pool_token_account.to_account_info(),
            self.user.to_account_info(),
            token_amount,
            self.token_program.to_account_info(),
            None
        )?;

        Ok(())
    }
}