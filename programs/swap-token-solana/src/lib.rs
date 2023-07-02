pub mod helper;
pub mod instructions;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("F9FoUdonDRvVE7S4ZbXCAV9PHtyGP9cgmvZEPeDfjbzN");

#[program]
pub mod swap_token_solana {
    use super::*;

    pub fn init_instruction<'info>(
        ctx: Context<'_, '_, '_, 'info, Initialize<'info>>,
        token_price: u64,
    ) -> Result<()> {
        init_pool(ctx, token_price)?;
        Ok(())
    }

    pub fn add_liquid_instruction<'info>(
        ctx: Context<'_, '_, '_, 'info, AddLiquid<'info>>,
        amount: u64,
    ) -> Result<()> {
        add_liquidity(ctx, amount)?;
        Ok(())
    }

    pub fn swap<'info>(
        ctx: Context<'_, '_, '_, 'info, SwapToken<'info>>,
        amount: u64,
        is_native: bool,
    ) -> Result<()> {
        swap_token(ctx, amount, is_native)?;
        Ok(())
    }
}
