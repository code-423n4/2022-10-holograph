declare var global: any;
import fs from 'fs';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import '@holographxyz/hardhat-deploy-holographed';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import { types, task, HardhatUserConfig } from 'hardhat/config';
import '@holographxyz/hardhat-holograph-contract-builder';
import networks from './config/networks';
import dotenv from 'dotenv';
dotenv.config();

enum Environment {
  experimental = 'experimental',
  develop = 'develop',
  testnet = 'testnet',
  mainnet = 'mainnet',
}

const getEnvironment = (): Environment => {
  let environment = Environment.experimental;
  const acceptableBranches: Set<string> = new Set<string>(['experimental', 'develop', 'testnet', 'mainnet']);
  const head = './.git/HEAD';
  const env: string = process.env.HOLOGRAPH_ENVIRONMENT || '';
  if (env === '') {
    if (fs.existsSync(head)) {
      const contents = fs.readFileSync('./.git/HEAD', 'utf8');
      const branch = contents.trim().split('ref: refs/heads/')[1];
      console.log('GitBranch:', branch);
      if (acceptableBranches.has(branch)) {
        environment = Environment[branch as keyof typeof Environment];
      }
    }
  } else if (acceptableBranches.has(env)) {
    console.log('HOLOGRAPH_ENVIRONMENT:', env);
    environment = Environment[env as keyof typeof Environment];
  }
  console.log('Environment:', environment);

  return environment;
};

const currentEnvironment = Environment[getEnvironment()];

const SOLIDITY_VERSION = process.env.SOLIDITY_VERSION || '0.8.13';

const MNEMONIC = process.env.MNEMONIC || 'test '.repeat(11) + 'junk';
const DEPLOYER = process.env.DEPLOYER || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || DEPLOYER;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || DEPLOYER;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || DEPLOYER;
const MATIC_PRIVATE_KEY = process.env.MATIC_PRIVATE_KEY || DEPLOYER;
const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY || DEPLOYER;
const FUJI_PRIVATE_KEY = process.env.FUJI_PRIVATE_KEY || DEPLOYER;
const CXIP_PRIVATE_KEY = process.env.CXIP_PRIVATE_KEY || DEPLOYER;

const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || '';
const POLYGONSCAN_API_KEY: string = process.env.POLYGONSCAN_API_KEY || '';
const AVALANCHE_API_KEY: string = process.env.AVALANCHE_API_KEY || '';

const selectDeploymentSalt = (): number => {
  let salt;
  switch (currentEnvironment) {
    case Environment.experimental:
      salt = parseInt(process.env.EXPERIMENTAL_DEPLOYMENT_SALT || '1000000');
      if (salt > 9999999 || salt < 1000000) {
        throw new Error('EXPERIMENTAL_DEPLOYMENT_SALT is out of bounds. Allowed range is [1000000-9999999]');
      }
      break;
    case Environment.develop:
      salt = parseInt(process.env.DEVELOP_DEPLOYMENT_SALT || '1000');
      if (salt > 999999 || salt < 1000) {
        throw new Error('DEVELOP_DEPLOYMENT_SALT is out of bounds. Allowed range is [1000-999999]');
      }
      break;
    case Environment.testnet:
      salt = parseInt(process.env.TESTNET_DEPLOYMENT_SALT || '0');
      if (salt > 999 || salt < 0) {
        throw new Error('TESTNET_DEPLOYMENT_SALT is out of bounds. Allowed range is [0-999]');
      }
      break;
    case Environment.mainnet:
      salt = parseInt(process.env.MAINNET_DEPLOYMENT_SALT || '0');
      if (salt > 999 || salt < 0) {
        throw new Error('MAINNET_DEPLOYMENT_SALT is out of bounds. Allowed range is [0-999]');
      }
      break;
    default:
      throw new Error('Unknown Environment provided -> ' + currentEnvironment);
  }
  return salt;
};

const DEPLOYMENT_SALT = selectDeploymentSalt();

const DEPLOYMENT_PATH = process.env.DEPLOYMENT_PATH || 'deployments';

global.__DEPLOYMENT_SALT = '0x' + DEPLOYMENT_SALT.toString(16).padStart(64, '0');

task('abi', 'Create standalone ABI files for all smart contracts')
  .addOptionalParam('silent', 'Provide less details in the output', false, types.boolean)
  .setAction(async (args, hre) => {
    if (!fs.existsSync('./artifacts')) {
      throw new Error('The directory "artifacts" was not found. Make sure you run "yarn compile" first.');
    }
    const recursiveDelete = function (dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (let i = 0, l = files.length; i < l; i++) {
        if (files[i].isDirectory()) {
          recursiveDelete(dir + '/' + files[i].name);
          fs.rmdirSync(dir + '/' + files[i].name);
        } else {
          fs.unlinkSync(dir + '/' + files[i].name);
        }
      }
    };
    const extractABIs = function (sourceDir: string, deployDir: string) {
      const files = fs.readdirSync(sourceDir, { withFileTypes: true });
      for (let i = 0, l = files.length; i < l; i++) {
        const file = files[i].name;
        if (files[i].isDirectory()) {
          extractABIs(sourceDir + '/' + file, deployDir);
        } else {
          if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
            if (!args.silent) {
              console.log(' -- exporting', file.split('.')[0], 'ABI');
            }
            const data = JSON.parse(fs.readFileSync(sourceDir + '/' + file, 'utf8')).abi;
            fs.writeFileSync(deployDir + '/' + file, JSON.stringify(data, undefined, 2));
          }
        }
      }
    };
    if (!fs.existsSync('./abi')) {
      fs.mkdirSync('./abi');
    }
    if (!fs.existsSync('./abi/' + currentEnvironment)) {
      fs.mkdirSync('./abi/' + currentEnvironment);
    } else {
      recursiveDelete('./abi/' + currentEnvironment);
    }
    extractABIs('./artifacts/contracts', './abi/' + currentEnvironment);
  });

/**
 * Go to https://hardhat.org/config/ to learn more
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  paths: {
    deployments: DEPLOYMENT_PATH + '/' + currentEnvironment,
  },
  defaultNetwork: 'localhost',
  external: {
    deployments: {
      arbitrum: [DEPLOYMENT_PATH + '/external/arbitrum'],
      arbitrum_rinkeby: [DEPLOYMENT_PATH + '/external/arbitrum_rinkeby'],
      aurora: [DEPLOYMENT_PATH + '/external/aurora'],
      aurora_testnet: [DEPLOYMENT_PATH + '/external/aurora_testnet'],
      avax: [DEPLOYMENT_PATH + '/external/avax'],
      bsc: [DEPLOYMENT_PATH + '/external/bsc'],
      bsc_testnet: [DEPLOYMENT_PATH + '/external/bsc_testnet'],
      cronos: [DEPLOYMENT_PATH + '/external/cronos'],
      cronos_testnet: [DEPLOYMENT_PATH + '/external/cronos_testnet'],
      cxip: [DEPLOYMENT_PATH + '/external/cxip'],
      eth: [DEPLOYMENT_PATH + '/external/eth'],
      eth_goerli: [DEPLOYMENT_PATH + '/external/eth_goerli'],
      eth_kovan: [DEPLOYMENT_PATH + '/external/eth_kovan'],
      eth_rinkeby: [DEPLOYMENT_PATH + '/external/eth_rinkeby'],
      eth_ropsten: [DEPLOYMENT_PATH + '/external/eth_ropsten'],
      ftm: [DEPLOYMENT_PATH + '/external/ftm'],
      ftm_testnet: [DEPLOYMENT_PATH + '/external/ftm_testnet'],
      fuji: [DEPLOYMENT_PATH + '/external/fuji'],
      gno: [DEPLOYMENT_PATH + '/external/gno'],
      gno_sokol: [DEPLOYMENT_PATH + '/external/gno_sokol'],
      localhost: [DEPLOYMENT_PATH + '/external/localhost'],
      localhost2: [DEPLOYMENT_PATH + '/external/localhost2'],
      matic: [DEPLOYMENT_PATH + '/external/matic'],
      mumbai: [DEPLOYMENT_PATH + '/external/mumbai'],
      optimism: [DEPLOYMENT_PATH + '/external/optimism'],
      optimism_kovan: [DEPLOYMENT_PATH + '/external/optimism_kovan'],
    },
  },
  networks: {
    localhost: {
      url: networks.localhost.rpc,
      chainId: networks.localhost.chain,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 11,
        passphrase: '',
      },
      companionNetworks: {
        // https://github.com/wighawag/hardhat-deploy#companionnetworks
        l2: 'localhost2',
      },
      saveDeployments: false,
    },
    localhost2: {
      url: networks.localhost2.rpc,
      chainId: networks.localhost2.chain,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 11,
        passphrase: '',
      },
      companionNetworks: {
        // https://github.com/wighawag/hardhat-deploy#companionnetworks
        l2: 'localhost',
      },
      saveDeployments: false,
    },
    eth: {
      url: networks.eth.rpc,
      chainId: networks.eth.chain,
      accounts: [MAINNET_PRIVATE_KEY],
    },
    eth_rinkeby: {
      url: networks.eth_rinkeby.rpc,
      chainId: networks.eth_rinkeby.chain,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    eth_goerli: {
      url: networks.eth_goerli.rpc,
      chainId: networks.eth_goerli.chain,
      accounts: [GOERLI_PRIVATE_KEY],
    },
    matic: {
      url: networks.matic.rpc,
      chainId: networks.matic.chain,
      accounts: [MATIC_PRIVATE_KEY] || '',
    },
    mumbai: {
      url: networks.mumbai.rpc,
      chainId: networks.mumbai.chain,
      accounts: [MUMBAI_PRIVATE_KEY],
    },
    fuji: {
      url: networks.fuji.rpc,
      chainId: networks.fuji.chain,
      accounts: [FUJI_PRIVATE_KEY],
    },
    cxip: {
      url: networks.cxip.rpc,
      chainId: networks.cxip.chain,
      accounts: [CXIP_PRIVATE_KEY],
    },
    coverage: {
      url: 'http://127.0.0.1:8555',
    },
  },
  namedAccounts: {
    deployer: 0,
    lzEndpoint: 10,
  },
  solidity: {
    version: SOLIDITY_VERSION,
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  mocha: {
    timeout: 1000 * 60 * 60,
  },
  gasReporter: {
    // I prefer my command line tools to not try to connect to a 3rd party site while I am loading private keys into it
    enabled: process.env.PRIVACY_MODE ? false : true,
    // enabled: process.env.COINMARKETCAP_API_KEY !== undefined,
    outputFile: './gasReport.txt', // comment line to get the report on terminal
    noColors: true, // comment line to get the report on terminal
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || '',
    token: 'ETH',
    gasPriceApi: 'https://api.bscscan.com/api?module=proxy&action=eth_gasPrice',
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      rinkeby: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      avalanche: AVALANCHE_API_KEY,
      avalancheFujiTestnet: AVALANCHE_API_KEY,
    },
  },
  hardhatHolographContractBuilder: {
    runOnCompile: true,
    verbose: false,
  },
};

export default config;
