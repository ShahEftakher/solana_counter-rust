# Solana Counter

Solana counter application with rust and typescript.

## Running the program

- Install rust compiler [rustc](https://www.rust-lang.org/tools/install), [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) and [solana-cli](https://docs.solana.com/cli/install-solana-cli-tools)

### Compiling the rust on chain porgram

- Install build-essential

```bash
sudo apt update && sudo apt install build-essential
```

- Install libssl or use this [LINK](https://github.com/solana-labs/example-helloworld/issues/470#issuecomment-1204576416)

```bash
wget http://nz2.archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
```

- Build the rust code using:
  - npm: `npm run build:program`
  - cargo and bpf: `cargo build-bpf --manifest-path=./src/program/Cargo.toml --bpf-out-dir=dist/program`
  - This will create a `dist/program` folder at the root with a deployable program `counter_rust.so` and a keypair for the program account `counter_rust-keypair.json`

### Off chain client

- Install all the dependencies with `npm install`
- To run the client `npm run start`

### Running the code in a local cluster

- Start solana validator: `solana-test-validator`
- Create a fs wallet with solana-cli:

```shell
  solana-keygen new
```

```shell
  solana airdrop 3
```

- Deploy the on chain code:

```shell
  solana program deploy dist/program/counter_rust.so
```

- Interact using the off chain client:

```shell
  npm run start
```

---

- Set account from a keypair:

```shell
solana config set --keypair ~/.config/solana/devnet.json
```
