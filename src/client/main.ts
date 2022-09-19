//Controller code for the counter program

import {
  establishConnection,
  establishPayer,
  checkProgram,
  increament,
  reportCounterState,
} from './counter';

async function main() {
  //establish connection to solana cluster
  await establishConnection();

  //Connect the payer for the fees
  await establishPayer();

  //check if the program is deployed
  await checkProgram();

  //say hello to account
  await increament();

  //report status
  await reportCounterState();
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
