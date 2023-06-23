import * as anchor from "@coral-xyz/anchor";
import { formatUnits, parseUnits } from "@ethersproject/units";
import {
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { setup, delay } from "./setup";

(async () => {
  const authority = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(require("./keys/authority.json"))
  ) as anchor.web3.Keypair;

  const addLiquidAmount = 1000;
  const decimals = 6;
  const { program, mintAddress, poolConfigAccount, poolTokenAccount } =
    setup(authority);
  const depositorTokenAccount = await getAssociatedTokenAddress(
    mintAddress,
    authority.publicKey
  );
  const rawAmount = parseUnits(addLiquidAmount.toString(), decimals).toNumber();

  const poolNativeAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("native_account_seed"),
      authority.publicKey.toBuffer(),
      mintAddress.toBuffer(),
      poolConfigAccount.toBuffer(),
    ],
    program.programId
  )[0];

  const associatedAccount = new anchor.web3.PublicKey("B2LPygDg1Uh5HTnTj4fShQYAx3wu2mDX2AsFsmRufWvm")

  const signature = await program.methods
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

  console.log("add liquid signature: ", signature);
  await delay(2000);
  const info = await getAccount(program.provider.connection, poolTokenAccount);
  console.log("pool balance: ", formatUnits(info.amount.toString(), decimals));
})();
