## Initializing a project with TS client and Rust program

### Project setup:

- Create a folder
- Init a npm project
  - `npm init`
- Create `src/client` for TS client and `src/program` for Rust program

### Rust program

- Inside `src/program` initialize rust project with
  - `cargo init`
- Update the `Cargo.toml` file with the following dependency

  - ```
    [dependency]
    borsh = "0.9.3"
    borsh-derive = "0.9.1"
    solana-program = "~1.10.35"

    [dev]
    solana-program-test = "~1.10.35"
    solana-sdk = "~1.10.35"

    [lib]
    name="rust-counter" //name of the deploying .so
    crate-type= ["cdylib", "lib"]
    ```

### TS code dependencies:

- `npm install @solana/web3.js`
- `npm install borsh`
- `npm install yaml`
- `npm install --save-dev @types/mz`
- `npm install --save-dev ts-node`
- `npm install --save-dev typescript`

#### Update package.json

- add the following to build the rust program
- `"build-rust": "cargo build-bpf --manifest-path=./src/program/Cargo.toml --bpf-out-dir=dist/program"`
- `"start": "ts-node src/client/main.ts"`
