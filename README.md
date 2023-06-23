# solana program swap token

## Install

```bash
  npm install
```

## Build

```bash
  anchor build
```

## Run unit test

Run solana vadidator local:

```bash
  solana-test-validator --reset
```

Run Unit test

```bash
  anchor test --skip-local-validator
```

Result

```
$ /home/anhtuanpc/Projects/Remitano/swap-token-solana/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  ✔ [1]: Initialize Pool successfully (411ms)
  ✔ [2]: Add liquidity successfully (409ms)
  ✔ [3]: Swap token successfully (412ms)
  ✔ [4]: Swap Token insufficient funds

  4 passing (3s)

Done in 4.11s
```

## Deploy

```bash
  anchor deploy
```

## Run test Swap SOL -> Token

- The program deployed on [devnet](https://explorer.solana.com/address/F9FoUdonDRvVE7S4ZbXCAV9PHtyGP9cgmvZEPeDfjbzN?cluster=devnet).

[Program ID](https://explorer.solana.com/address/F9FoUdonDRvVE7S4ZbXCAV9PHtyGP9cgmvZEPeDfjbzN?cluster=devnet):

```ts
const programId = F9FoUdonDRvVE7S4ZbXCAV9PHtyGP9cgmvZEPeDfjbzN;
```

[Token mint address](https://explorer.solana.com/address/2FBp3RYAp72Wc7jpaWrHQu9XQkwo811SkPkt4j7vVAZd?cluster=devnet):

```ts
const mintAddress = 2FBp3RYAp72Wc7jpaWrHQu9XQkwo811SkPkt4j7vVAZd;
```

Run initialize pool:

```bash
  npx ts-node migrations/initPool.ts
```

Result:
```
signature:  3MEskgdnsHQ5FuXRGFWrQUzMQ9ndRwx2DdGgM7aomFNDWf1C2qAEHtqz5kVN4KBh4cpwZcbFr3i2exKxNDsycDRk
Pool config data:  {
  poolConfigAccount: 'HLAcGhfdCRARuxjGUU897YFt5GcmJKLPHudFn5NCguzE',
  poolNativeAccount: 'HSDASM7n5LmpWAA1kqzsb6R5SyqP7BjN4NgtjHrn96xt',
  poolTokenAccount: 'GUz91mGfwmVw6YrJLVjg71GQP9M4Jwrs5wZgjMFkV2Uj',
  price: 10000000
}
```
TX: https://explorer.solana.com/tx/3MEskgdnsHQ5FuXRGFWrQUzMQ9ndRwx2DdGgM7aomFNDWf1C2qAEHtqz5kVN4KBh4cpwZcbFr3i2exKxNDsycDRk?cluster=devnet


Run add liquidity pool:
```bash
  npx ts-node migrations/addLiquid.ts
```

TX: https://explorer.solana.com/tx/5ME2gXrLiFTf2nSj3iaYSWnuZLM5V5oPFpo7q6n4vD2UdCjqfTGJGT9EiUqdvCR718P7qcuPB16nWhLZ5JXCttYr?cluster=devnet


Run Swap:
```bash
  npx ts-node migrations/swap.ts
```

TX: https://explorer.solana.com/tx/oXJUfe616yiNXcMq35Y6AMU5kHGwUUoE4bR6qMPUpm13JiKKAn9KBgxmd8yj9h1hJAVBDuVgpHMPuHMQG2yoZXd?cluster=devnet
