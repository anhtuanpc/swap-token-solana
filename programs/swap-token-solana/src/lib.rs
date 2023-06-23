pub mod instructions;
pub mod helper;

use anchor_lang::prelude::*;
use instructions::*;
use helper::*;

declare_id!("9ByBv1L1SRp8tNDLu9rEv67NnYcVnuQ9xzPFQGWKtFUj");

#[program]
pub mod swap_token_solana {
    use super::*;

    pub fn init_instruction<'info>(
        ctx: Context<'_, '_, '_, 'info, Initialize<'info>>,
        token_price: u64
    ) -> Result<()> {
        init_pool(ctx, token_price)?;
        Ok(())
    }

    pub fn add_liquid_instruction<'info>(
        ctx: Context<'_, '_, '_, 'info, AddLiquid<'info>>,
        amount: u64
    ) -> Result<()> {
        add_liquidity(ctx, amount)?;
        Ok(())
    }
}
