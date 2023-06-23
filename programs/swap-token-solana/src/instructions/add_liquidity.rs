use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint, Token, TokenAccount };

#[derive(Accounts)]
#[instruction()]
pub struct AddLiquid<'info> {
    #[account(mut, constraint = authority.lamports() > 0 && authority.data_is_empty())]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn add_liquidity<'info>(ctx: Context<'_, '_, '_, 'info, AddLiquid<'info>>) -> Result<()> {
    Ok(())
}