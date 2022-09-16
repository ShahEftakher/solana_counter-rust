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
const COUNTER_SIZE = borsh.serialize(CounterShema, new CounterAccount()).length;

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
  //if a payer is not found
  //this part is for fee calculation for the transaction or rent fee of the data account??
  //and set a payer
  if (!payer) {
    //getRecentBlockhash() seem to return a feecalculator and idk why a getRecentBlockhash will have
    //a fee calculator, pretty wierd
    const { feeCalculator } = await connection.getRecentBlockhash();
    //now the cost is calculated based on the size of the byte array of the serialized data account
    //to find minimum required balance to extemp the account from paying rent
    fees += await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    //calculating cost for sending the transaction
    fees += feeCalculator.lamportsPerSignature * 100; //wag??
    payer = await getPayer();
  }

  //now to check if the user has enough balance to pay the fee
  let lamports = await connection.getBalance(payer.publicKey);
  //if balance is less than fee then request air
  if (lamports < fees) {
    //create the transaction
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports
    );
    //confirmed the transaction
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees'
  );
};

//check if the program is deployed on the chain
const checkProgram = async (): Promise<void> => {
  //while compiled a keypair for the program account is created
  //the public key of the program account is the program id
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program key pair at ${PROGRAM_KEYPAIR_PATH}`
    );
  }
  //now we check if the program is deployed
  const programInfo = await connection.getAccountInfo(programId);
  //if program is not deployed handle error
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_PATH_SO)) {
      throw new Error(
        'Deploy program with `solana program deploy dist/program/rust_counter.so`'
      );
    } else {
      throw new Error('Build the program first');
    }
  } else if (!programInfo.executable) {
    throw new Error('Program is not executable');
  }
  //if program found
  console.log(`Using program ${programId.toBase58()}`);

  //we derive a PDA
  const COUNTER_SEED = 'ESD';
  //PDA public key
  countPubKey = await PublicKey.createWithSeed(
    payer.publicKey,
    COUNTER_SEED,
    programId
  );
  //check if the a PDA is already created
  const counterAccount = await connection.getAccountInfo(countPubKey);
  if (counterAccount === null) {
    console.log('Createing PDA at: ' + countPubKey.toBase58());
  }

  //find the funds required for creating PDA
  const lamports = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );
  //transaction structure
  /**
   *
   */
  const transaction = new Transaction().add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer.publicKey,
      basePubkey: payer.publicKey,
      seed: COUNTER_SEED,
      newAccountPubkey: countPubKey,
      lamports,
      space: COUNTER_SIZE,
      programId,
    })
  );
  await sendAndConfirmTransaction(connection, transaction, [payer]);
};

export const increament = async (): Promise<void> => {
  console.log('Saying hello to', countPubKey.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: countPubKey, isSigner: false, isWritable: true }],
    programId,
    data: Buffer.alloc(0),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer]
  );
};

export const reportCounterState = async (): Promise<void> => {
  const accountInfo = await connection.getAccountInfo(countPubKey);
  if (accountInfo === null) {
    throw 'Error cannot find count account';
  }
  const count = borsh.deserialize(
    CounterShema,
    CounterAccount,
    accountInfo.data
  );
  console.log(
    countPubKey.toBase58(),
    'has been greeted',
    count.counter,
    'time(s)'
  );
};
