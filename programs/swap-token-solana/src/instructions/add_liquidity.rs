use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint, Token, TokenAccount };

#[derive(Accounts)]
#[instruction()]
pub struct AddLiquid<'info> {

}

pub fn add_liquidity<'info>(ctx: Context<'_, '_, '_, 'info, Initialize<'info>>) -> Result<()> {
    Ok(())
}