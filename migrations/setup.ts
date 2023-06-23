import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SwapTokenSolana } from "../target/types/swap_token_solana";

export function setup(authority: anchor.web3.Keypair) {
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet")
  );
  const mintAddress = new anchor.web3.PublicKey(
    "2FBp3RYAp72Wc7jpaWrHQu9XQkwo811SkPkt4j7vVAZd"
  );
  const idl = require("../target/idl/swap_token_solana.json");
  const wallet = new anchor.Wallet(authority);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "processed",
  });

  const Program_ID = new anchor.web3.PublicKey(
    "F9FoUdonDRvVE7S4ZbXCAV9PHtyGP9cgmvZEPeDfjbzN"
  );
  const program = new anchor.Program(
    idl,
    Program_ID,
    provider
  ) as Program<SwapTokenSolana>;
  const poolConfigAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("config_account_seed"),
      authority.publicKey.toBuffer(),
      mintAddress.toBuffer(),
    ],
    program.programId
  )[0];

  const poolTokenAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_account_seed"),
      authority.publicKey.toBuffer(),
      mintAddress.toBuffer(),
      poolConfigAccount.toBuffer(),
    ],
    program.programId
  )[0];

  const poolNativeAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("native_account_seed"),
      authority.publicKey.toBuffer(),
      mintAddress.toBuffer(),
      poolConfigAccount.toBuffer(),
    ],
    program.programId
  )[0];

  return {
    program,
    mintAddress,
    poolConfigAccount,
    poolNativeAccount,
    poolTokenAccount,
  };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
