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
        ctx: Context<'_, '_, '_, 'info, Initialize<'info>>
    ) -> Result<()> {
        init_pool(ctx)?;
        Ok(())
    }
}
