import * as anchor from "@coral-xyz/anchor";
import { parseUnits } from "@ethersproject/units";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setup, delay } from "./setup";
import { createToken, mint } from "../tests/utils";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

(async () => {
  const authority = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(require("./keys/authority.json"))
  ) as anchor.web3.Keypair;

  const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed'
  );


  let mintAddress: anchor.web3.PublicKey;
  let associatedAccount: anchor.web3.PublicKey;

  const decimals = 6;

    mintAddress = await createToken(connection, authority, decimals);
    associatedAccount = await mint(
      connection,
      authority,
      authority,
      mintAddress,
      10000000000
    );

    console.log(mintAddress.toString())
    console.log(associatedAccount.toString())
})();
