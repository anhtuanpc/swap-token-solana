use anchor_lang::prelude::*;

declare_id!("9ByBv1L1SRp8tNDLu9rEv67NnYcVnuQ9xzPFQGWKtFUj");

#[program]
pub mod swap_token_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
