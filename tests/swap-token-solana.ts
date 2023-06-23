import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import { ErrorMessage, airdrop, createToken, mint, setup } from "./utils";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { getAccount, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

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
  let userTokenAccount: anchor.web3.PublicKey;
  const decimals = 6;
  const tokenPrice = 10;
  const addLiquidAmount = 10000;
  const swapSolValue = 1;

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

    userTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      user.publicKey
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

  it("[2]: Add liquidity successfully", async () => {
    // add liquid amount
    const rawAmount = parseUnits(
      addLiquidAmount.toString(),
      decimals
    ).toNumber();
    await program.methods
      .addLiquidInstruction(new anchor.BN(rawAmount))
      .accounts({
        poolConfigAccount: poolConfigAccount,
        poolNativeAccount: poolNativeAccount,
        poolTokenAccount: poolTokenAccount,
        tokenMintAddress: mintAddress,
        authority: authority.publicKey,
        depositorTokenAccount: associatedAccount, 
        depositor: authority.publicKey, // reuse authority as a depositor to liquid pool
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    const info = await getAccount(connection, poolTokenAccount);
    assert.equal(Number(info.amount), rawAmount);
  });

  it("[3]: Swap token successfully", async () => {
    await program.methods
      .swap(new anchor.BN(swapSolValue * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        poolConfigAccount: poolConfigAccount,
        poolTokenAccount: poolTokenAccount,
        poolNativeAccount: poolNativeAccount,
        tokenMintAddress: mintAddress,
        authority: authority.publicKey,
        userTokenAccount: userTokenAccount,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    const rawUserTokenBalance = await getAccount(connection, userTokenAccount);
    const userTokenBalance = parseUnits(rawUserTokenBalance.amount.toString(), decimals)
    const rawTokenPrice = parseUnits(
      tokenPrice.toString(),
      decimals
    ).toNumber();
    const tokenReceive =
      (rawTokenPrice * swapSolValue * anchor.web3.LAMPORTS_PER_SOL) /
      anchor.web3.LAMPORTS_PER_SOL;
    assert.equal(Number(userTokenBalance), tokenReceive);
  });

  it("[4]: Swap Token insufficient funds", async () => {
    const userBalance = await connection.getBalance(user.publicKey);
    let sig: string | null;
    try {
      sig = await program.methods
        .swap(new anchor.BN(userBalance + 1))
        .accounts({
          poolConfigAccount: poolConfigAccount,
          poolTokenAccount: poolTokenAccount,
          poolNativeAccount: poolNativeAccount,
          tokenMintAddress: mintAddress,
          authority: authority.publicKey,
          userTokenAccount: userTokenAccount,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    } catch (error) {
      assert.equal(error.error.errorCode.code, "InsufficientFunds");
      assert.equal(error.error.errorCode.number, 6001);
      assert.equal(error.error.errorMessage, ErrorMessage.InsufficientFunds);
    }
    assert.equal(sig, null);
  });
});


