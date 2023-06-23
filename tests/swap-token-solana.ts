import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import { airdrop, createToken, mint, setup } from "./utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("# Solana Program Test Swap", async () => {
  // Configure the client to use the local cluster.
  const connection = new anchor.web3.Connection(
    "http://127.0.0.1:8899",
    "processed"
  );
  const authority = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  const program = await setup(connection, authority);
  let mintAddress: anchor.web3.PublicKey;
  let associatedAccount: anchor.web3.PublicKey;
  let poolTokenAccount: anchor.web3.PublicKey;
  let poolNativeAccount: anchor.web3.PublicKey;
  let poolConfigAccount: anchor.web3.PublicKey;
  const decimals = 6;
  let tokenPrice = 10;
  let tokenDenominator = 1;
  // Ensure that the proportion of Sol : Token = 1 : 10

  before(async () => {
    // airdrop 10 SOL for each wallet
    await airdrop(connection, authority.publicKey);
    await airdrop(connection, user.publicKey);
    const authorityBalance = await connection.getBalance(authority.publicKey);
    const userBalance = await connection.getBalance(user.publicKey);
    assert.equal(authorityBalance, 10 * anchor.web3.LAMPORTS_PER_SOL);
    assert.equal(userBalance, 10 * anchor.web3.LAMPORTS_PER_SOL);

    // init and mint token
    mintAddress = await createToken(connection, authority, decimals);
    associatedAccount = await mint(
      connection,
      authority,
      authority,
      mintAddress,
      10000000000
    );

    // find pda accounts
    poolConfigAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("config_account_seed"),
        authority.publicKey.toBuffer(),
        mintAddress.toBuffer(),
      ],
      program.programId
    )[0];

    poolTokenAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_account_seed"),
        authority.publicKey.toBuffer(),
        mintAddress.toBuffer(),
        poolConfigAccount.toBuffer(),
      ],
      program.programId
    )[0];

    poolNativeAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("native_account_seed"),
        authority.publicKey.toBuffer(),
        mintAddress.toBuffer(),
        poolConfigAccount.toBuffer(),
      ],
      program.programId
    )[0];
  });

  it("[1]: Initialize Pool successfully", async () => {
    // Add your test here.
    const tx = await program.methods
      .initInstruction(new anchor.BN(tokenPrice))
      .accounts({
        poolConfigAccount: poolConfigAccount,
        poolNativeAccount: poolNativeAccount,
        poolTokenAccount: poolTokenAccount,
        tokenMintAddress: mintAddress,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    const poolConfigAccountData = await program.account.poolConfigAccount.fetch(
      poolConfigAccount
    );
    assert.equal(Number(poolConfigAccountData.tokenPrice), tokenPrice);
    assert.equal(
      poolConfigAccountData.tokenMintAddress.toString(),
      mintAddress.toString()
    );
    assert.equal(
      poolConfigAccountData.poolTokenAccount.toString(),
      poolTokenAccount.toString()
    );

    assert.equal(
      poolConfigAccountData.poolNativeAccount.toString(),
      poolNativeAccount.toString()
    );
  });
});


