import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import yaml from 'yaml';
import { Keypair } from '@solana/web3.js';

//access the config file of solana cli on the system
//returns configuration
const getConfig = async (): Promise<any> => {
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml'
  );
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
  return yaml.parse(configYml);
};

//gets the cli configuration file
//retrives the RPC url and returns
//in case of faileure returns localhost address
export const getRpcUrl = async (): Promise<string> => {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('Could not find rpc URL');
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost'
    );
    return 'https://127.0.0.1:8899';
  }
};

//gets the payer wallet path
//generates kaypair from the path
//if no keypair path available generates random keypair
export const getPayer = async (): Promise<Keypair> => {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
      'Failed to create keypair from CLI config file, Creating random keypair'
    );
    return Keypair.generate();
  }
};

//generate keypair from secret key stored in the file system / any key secret phrase tbh
export const createKeypairFromFile = async (
  filePath: string
): Promise<Keypair> => {
  const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
};
