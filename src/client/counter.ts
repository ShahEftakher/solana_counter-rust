import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

//import all uitls
import { getPayer, getRpcUrl, createKeypairFromFile } from './utils';

//connection to chain
let connection: Connection;

//signer
let payer: Keypair;

//program id
let programId: PublicKey;

//public of the account invoking the counter
let countPubKey: PublicKey;

//path to compiled program file
const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

//.so file is deployed to the blockchain
//generated while building the rust program
//path to the .so file
const PROGRAM_PATH_SO = path.join(PROGRAM_PATH, 'rust_counter.so');

//when deployed the solana file creates a program account
//the program account has a private and public key pair
//the keypair is generated while the rust program is compiled
//now the keypair path is provided for interaction
const PROGRAM_KEYPAIR_PATH = path.join(
  PROGRAM_PATH,
  'rust_counter-keypair.json'
);

//the documentation of helloworld example said: The state of a greeting account managed by the hello world program
//now does it refer to the data account that stores the state of the hello world program?
//if so then it is the data account holding the state of the counter program
class CounterAccount {
  counter = 0;
  //need more explanation about this part
  constructor(fields: { counter: number } | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

//a mapping with the CounterAccoun, the data account to the counter-rust program
//here the format will be the same as the struct of the rust account
const CounterShema = new Map([
  [CounterAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);

//so solana expects to know the size of everything beforehand
//that's why we are getting the size of the greeting account ig
//size of the byte array
const GREETING_SIZE = borsh.serialize(
  CounterShema,
  new CounterAccount()
).length;

//now we establish a connection to the cluster
//with rpc link
export const establishConnection = async (): Promise<void> => {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established', version);
};

//setup an account to pay fee
export const establishPayer = async (): Promise<void> => {
  let fees = 0;
  if (!payer) {
    const { feeCalculator } = await connection.getRecentBlockhash();
    fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);
    fees += feeCalculator.lamportsPerSignature * 100;
    payer = await getPayer();
  }
};
