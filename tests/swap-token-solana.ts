import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import { airdrop, createToken, mint, setup } from "./utils";

describe("swap-token-solana", async () => {
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
  const decimals = 6;

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
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initInstruction().rpc();
    console.log("Your transaction signature", tx);
  });
});


