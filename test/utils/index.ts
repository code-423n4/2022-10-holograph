declare var global: any;
import fs from 'fs';
import { expect, assert } from 'chai';
import { EthereumProvider, Artifacts, HardhatRuntimeEnvironment } from 'hardhat/types';
import { Address, Deployment, DeploymentsExtension } from '@holographxyz/hardhat-deploy-holographed/types';
import Web3 from 'web3';
import { BigNumberish, BytesLike, ContractFactory, Contract } from 'ethers';
import type { ethers } from 'ethers';
import type EthersT from 'ethers';
import { HardhatEthersHelpers } from '@nomiclabs/hardhat-ethers/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Admin,
  CxipERC721,
  CxipERC721Proxy,
  ERC20Mock,
  Faucet,
  Holograph,
  HolographBridge,
  HolographBridgeProxy,
  Holographer,
  HolographERC20,
  HolographERC721,
  HolographFactory,
  HolographFactoryProxy,
  HolographGenesis,
  HolographOperator,
  HolographOperatorProxy,
  HolographRegistry,
  HolographRegistryProxy,
  HolographTreasury,
  HolographTreasuryProxy,
  HToken,
  HolographUtilityToken,
  HolographInterfaces,
  LayerZeroModule,
  MockERC721Receiver,
  MockLZEndpoint,
  Owner,
  PA1D,
  SampleERC20,
  SampleERC721,
} from '../../typechain-types';
import {
  Erc20Config,
  Erc721Config,
  LeanHardhatRuntimeEnvironment,
  Network,
  Networks,
  l2Ethers,
  hreSplit,
  utf8ToBytes32,
  ZERO_ADDRESS,
  sha256,
  getHolographedContractHash,
  generateErc20Config,
  generateErc721Config,
  generateInitCode,
} from '../../scripts/utils/helpers';
import {
  HolographERC20Event,
  HolographERC721Event,
  HolographERC1155Event,
  ConfigureEvents,
} from '../../scripts/utils/events';
import networks from '../../config/networks';

let hre1: HardhatRuntimeEnvironment = require('hardhat');

export const generateRandomSalt = () => {
  return '0x' + Date.now().toString(16).padStart(64, '0');
};

export interface PreTest {
  hre: LeanHardhatRuntimeEnvironment;
  hre2: LeanHardhatRuntimeEnvironment;
  salt: string;
  networks: Networks;
  network: Network;
  network2: Network;
  web3: Web3;
  chainId: BytesLike;
  chainId2: BytesLike;
  deployer: SignerWithAddress;
  wallet1: SignerWithAddress;
  wallet2: SignerWithAddress;
  wallet3: SignerWithAddress;
  wallet4: SignerWithAddress;
  wallet5: SignerWithAddress;
  wallet6: SignerWithAddress;
  wallet7: SignerWithAddress;
  wallet8: SignerWithAddress;
  wallet9: SignerWithAddress;
  wallet10: SignerWithAddress;
  lzEndpoint: SignerWithAddress;
  admin: Admin;
  mockLZEndpoint: MockLZEndpoint;
  cxipErc721: CxipERC721;
  cxipErc721Proxy: CxipERC721Proxy;
  erc20Mock: ERC20Mock;
  holograph: Holograph;
  holographBridge: HolographBridge;
  holographBridgeProxy: HolographBridgeProxy;
  holographer: Holographer;
  holographErc20: HolographERC20;
  holographErc721: HolographERC721;
  holographFactory: HolographFactory;
  holographFactoryProxy: HolographFactoryProxy;
  holographGenesis: HolographGenesis;
  holographOperator: HolographOperator;
  holographOperatorProxy: HolographOperatorProxy;
  holographRegistry: HolographRegistry;
  holographRegistryProxy: HolographRegistryProxy;
  holographTreasury: HolographTreasury;
  holographTreasuryProxy: HolographTreasuryProxy;
  hToken: HToken;
  utilityToken: HolographUtilityToken;
  holographInterfaces: HolographInterfaces;
  mockErc721Receiver: MockERC721Receiver;
  owner: Owner;
  pa1d: PA1D;
  sampleErc20: SampleERC20;
  sampleErc721: SampleERC721;
  bridge: HolographBridge;
  factory: HolographFactory;
  operator: HolographOperator;
  registry: HolographRegistry;
  treasury: HolographTreasury;
  hTokenHolographer: Holographer;
  hTokenEnforcer: HolographERC20;
  utilityTokenHolographer: Holographer;
  utilityTokenEnforcer: HolographERC20;
  sampleErc20Holographer: Holographer;
  sampleErc20Enforcer: HolographERC20;
  sampleErc721Holographer: Holographer;
  sampleErc721Enforcer: HolographERC721;
  cxipErc721Holographer: Holographer;
  cxipErc721Enforcer: HolographERC721;
  faucet: Faucet;
  sampleErc721Hash: Erc721Config;
  lzModule: LayerZeroModule;
}

const animatedLoader = function (text: string) {
  process.stdout.write('\n');
  const symbols: string[] = ['▄▄▄', '▄▄■', '▄■▀', '■▀▀', '▀▀▀', '▀▀■', '▀■▄', '■▄▄'];
  let counter: number = 0;
  return setInterval(() => {
    let symbol: string = symbols[counter];
    counter++;
    if (counter == symbols.length) {
      counter = 0;
    }
    process.stdout.write('    ' + '\x1b[33m' + symbol + '\x1b[0m' + text + '\x1b[0m' + '\r');
  }, 100);
};

export default async function (l2?: boolean): Promise<PreTest> {
  if (l2) {
    global.__companionNetwork = true;
  } else {
    global.__companionNetwork = false;
  }
  const web3 = new Web3();
  let { hre, hre2 } = await hreSplit(hre1, l2);
  const salt = hre.deploymentSalt;
  const network: Network = networks[hre.networkName];
  const network2: Network = networks[hre2.networkName];
  const chainId: BytesLike = '0x' + network.holographId.toString(16).padStart(8, '0');
  const chainId2: BytesLike = '0x' + network2.holographId.toString(16).padStart(8, '0');
  const fixtures: string[] = [
    'HolographGenesis',
    'Holograph',
    'HolographBridge',
    'HolographBridgeProxy',
    'HolographFactory',
    'HolographFactoryProxy',
    'HolographOperator',
    'HolographOperatorProxy',
    'HolographRegistry',
    'HolographRegistryProxy',
    'HolographTreasury',
    'HolographTreasuryProxy',
    'HolographInterfaces',
    'PA1D',

    'HolographERC20',
    'HolographERC721',
    'CxipERC721',
    'LayerZeroModule',
    'MockLZEndpoint',
    'LayerZero',
    'ERC20Mock',
    'MockERC721Receiver',
    'RegisterTemplates',
    'ValidateInterfaces',
    'hToken',
    'HolographUtilityToken',
    'SampleERC20',
    'SampleERC721',
    'CxipERC721Proxy',
    'Faucet',
  ];

  let loop = animatedLoader('\x1b[2m' + ' loading/deploying relevant contracts');
  await hre.deployments.fixture(fixtures);
  clearInterval(loop);
  process.stdout.write(
    '    ' + '\x1b[32m' + '███' + '\x1b[0m' + '\x1b[2m' + ' relevant contracts loaded           ' + '\x1b[0m' + '\n\n'
  );

  const accounts = await hre.ethers.getSigners();
  const deployer: SignerWithAddress = accounts[0];
  const wallet1: SignerWithAddress = accounts[1];
  const wallet2: SignerWithAddress = accounts[2];
  const wallet3: SignerWithAddress = accounts[3];
  const wallet4: SignerWithAddress = accounts[4];
  const wallet5: SignerWithAddress = accounts[5];
  const wallet6: SignerWithAddress = accounts[6];
  const wallet7: SignerWithAddress = accounts[7];
  const wallet8: SignerWithAddress = accounts[8];
  const wallet9: SignerWithAddress = accounts[9];
  const wallet10: SignerWithAddress = accounts[10];
  const lzEndpoint: SignerWithAddress = accounts[10];

  let admin: Admin;
  let mockLZEndpoint: MockLZEndpoint;
  let cxipErc721: CxipERC721;
  let cxipErc721Proxy: CxipERC721Proxy;
  let erc20Mock: ERC20Mock;
  let holograph: Holograph;
  let holographBridge: HolographBridge;
  let holographBridgeProxy: HolographBridgeProxy;
  let holographer: Holographer;
  let holographErc20: HolographERC20;
  let holographErc721: HolographERC721;
  let holographFactory: HolographFactory;
  let holographFactoryProxy: HolographFactoryProxy;
  let holographGenesis: HolographGenesis;
  let holographOperator: HolographOperator;
  let holographOperatorProxy: HolographOperatorProxy;
  let holographRegistry: HolographRegistry;
  let holographRegistryProxy: HolographRegistryProxy;
  let holographTreasury: HolographTreasury;
  let holographTreasuryProxy: HolographTreasuryProxy;
  let hToken: HToken;
  let utilityToken: HolographUtilityToken;
  let holographInterfaces: HolographInterfaces;
  let mockErc721Receiver: MockERC721Receiver;
  let owner: Owner;
  let pa1d: PA1D;
  let sampleErc20: SampleERC20;
  let sampleErc721: SampleERC721;
  let faucet: Faucet;
  let lzModule: LayerZeroModule;

  let treasury: HolographTreasury;
  let registry: HolographRegistry;
  let operator: HolographOperator;
  let factory: HolographFactory;
  let bridge: HolographBridge;

  let hTokenHolographer: Holographer;
  let hTokenEnforcer: HolographERC20;
  let utilityTokenHolographer: Holographer;
  let utilityTokenEnforcer: HolographERC20;
  let sampleErc20Holographer: Holographer;
  let sampleErc20Enforcer: HolographERC20;
  let sampleErc721Holographer: Holographer;
  let sampleErc721Enforcer: HolographERC721;
  let cxipErc721Holographer: Holographer;
  let cxipErc721Enforcer: HolographERC721;

  let hTokenHash: Erc20Config;
  let sampleErc20Hash: Erc20Config;
  let sampleErc721Hash: Erc721Config;
  let cxipErc721Hash: Erc721Config;

  admin = (await hre.ethers.getContractOrNull('Admin')) as Admin;
  mockLZEndpoint = (await hre.ethers.getContractOrNull('MockLZEndpoint')) as MockLZEndpoint;
  cxipErc721 = (await hre.ethers.getContractOrNull('CxipERC721')) as CxipERC721;
  cxipErc721Proxy = (await hre.ethers.getContractOrNull('CxipERC721Proxy')) as CxipERC721Proxy;
  erc20Mock = (await hre.ethers.getContract('ERC20Mock')) as ERC20Mock;
  holograph = (await hre.ethers.getContract('Holograph')) as Holograph;
  holographBridge = (await hre.ethers.getContract('HolographBridge')) as HolographBridge;
  holographBridgeProxy = (await hre.ethers.getContract('HolographBridgeProxy')) as HolographBridgeProxy;
  // holographer = (await hre.ethers.getContractOrNull('Holographer')) as Holographer;
  holographErc20 = (await hre.ethers.getContract('HolographERC20')) as HolographERC20;
  holographErc721 = (await hre.ethers.getContract('HolographERC721')) as HolographERC721;
  holographFactory = (await hre.ethers.getContract('HolographFactory')) as HolographFactory;
  holographFactoryProxy = (await hre.ethers.getContract('HolographFactoryProxy')) as HolographFactoryProxy;
  holographGenesis = (await hre.ethers.getContract('HolographGenesis')) as HolographGenesis;
  holographOperator = (await hre.ethers.getContract('HolographOperator')) as HolographOperator;
  holographOperatorProxy = (await hre.ethers.getContract('HolographOperatorProxy')) as HolographOperatorProxy;
  holographRegistry = (await hre.ethers.getContract('HolographRegistry')) as HolographRegistry;
  holographRegistryProxy = (await hre.ethers.getContract('HolographRegistryProxy')) as HolographRegistryProxy;
  holographTreasury = (await hre.ethers.getContract('HolographTreasury')) as HolographTreasury;
  holographTreasuryProxy = (await hre.ethers.getContract('HolographTreasuryProxy')) as HolographTreasuryProxy;
  // hToken = (await hre.ethers.getContractOrNull('hToken')) as HToken;
  holographInterfaces = (await hre.ethers.getContractOrNull('HolographInterfaces')) as HolographInterfaces;
  mockErc721Receiver = (await hre.ethers.getContract('MockERC721Receiver')) as MockERC721Receiver;
  owner = (await hre.ethers.getContractOrNull('Owner')) as Owner;
  pa1d = (await hre.ethers.getContract('PA1D')) as PA1D;
  // sampleErc20 = (await hre.ethers.getContractOrNull('SampleERC20')) as SampleERC20;
  // sampleErc721 = (await hre.ethers.getContractOrNull('SampleERC721')) as SampleERC721;
  faucet = await hre.ethers.getContract<Faucet>('Faucet');
  lzModule = await hre.ethers.getContract<LayerZeroModule>('LayerZeroModule');

  bridge = holographBridge.attach(await holograph.getBridge()) as HolographBridge;
  factory = holographFactory.attach(await holograph.getFactory()) as HolographFactory;
  operator = holographOperator.attach(await holograph.getOperator()) as HolographOperator;
  registry = holographRegistry.attach(await holograph.getRegistry()) as HolographRegistry;
  treasury = holographTreasury.attach(await holograph.getTreasury()) as HolographTreasury;

  holographer = (await hre.ethers.getContractAt('Holographer', await registry.getHToken(chainId))) as Holographer;

  hTokenHash = await generateErc20Config(
    network,
    deployer.address,
    'hToken',
    network.tokenName + ' (Holographed #' + network.holographId.toString() + ')',
    'h' + network.tokenSymbol,
    network.tokenName + ' (Holographed #' + network.holographId.toString() + ')',
    '1',
    18,
    ConfigureEvents([]),
    generateInitCode(['address', 'uint16'], [deployer.address, 0]),
    salt
  );
  hTokenHolographer = (await hre.ethers.getContractAt(
    'Holographer',
    await registry.getHolographedHashAddress(hTokenHash.erc20ConfigHash)
  )) as Holographer;
  hTokenEnforcer = (await hre.ethers.getContractAt(
    'HolographERC20',
    await hTokenHolographer.getHolographEnforcer()
  )) as HolographERC20;
  hToken = (await hre.ethers.getContractAt('hToken', await hTokenHolographer.getSourceContract())) as HToken;

  utilityTokenHolographer = (await hre.ethers.getContractAt(
    'Holographer',
    await holograph.getUtilityToken()
  )) as Holographer;
  utilityTokenEnforcer = (await hre.ethers.getContractAt(
    'HolographERC20',
    await utilityTokenHolographer.getHolographEnforcer()
  )) as HolographERC20;
  utilityToken = (await hre.ethers.getContractAt(
    'HolographUtilityToken',
    await utilityTokenHolographer.getSourceContract()
  )) as HolographUtilityToken;

  sampleErc20Hash = await generateErc20Config(
    network,
    deployer.address,
    'SampleERC20',
    'Sample ERC20 Token (' + hre.networkName + ')',
    'SMPL',
    'Sample ERC20 Token',
    '1',
    18,
    ConfigureEvents([HolographERC20Event.bridgeIn, HolographERC20Event.bridgeOut]),
    generateInitCode(['address', 'uint16'], [deployer.address, 0]),
    salt
  );
  sampleErc20Holographer = (await hre.ethers.getContractAt(
    'Holographer',
    await registry.getHolographedHashAddress(sampleErc20Hash.erc20ConfigHash)
  )) as Holographer;
  sampleErc20Enforcer = (await hre.ethers.getContractAt(
    'HolographERC20',
    await sampleErc20Holographer.getHolographEnforcer()
  )) as HolographERC20;
  sampleErc20 = (await hre.ethers.getContractAt(
    'SampleERC20',
    await sampleErc20Holographer.getSourceContract()
  )) as SampleERC20;

  sampleErc721Hash = await generateErc721Config(
    network,
    deployer.address,
    'SampleERC721',
    'Sample ERC721 Contract (' + hre.networkName + ')',
    'SMPLR',
    1000,
    ConfigureEvents([HolographERC721Event.bridgeIn, HolographERC721Event.bridgeOut, HolographERC721Event.afterBurn]),
    generateInitCode(['address'], [deployer.address]),
    salt
  );
  sampleErc721Holographer = (await hre.ethers.getContractAt(
    'Holographer',
    await registry.getHolographedHashAddress(sampleErc721Hash.erc721ConfigHash)
  )) as Holographer;
  sampleErc721Enforcer = (await hre.ethers.getContractAt(
    'HolographERC721',
    await sampleErc721Holographer.getHolographEnforcer()
  )) as HolographERC721;
  sampleErc721 = (await hre.ethers.getContractAt(
    'SampleERC721',
    await sampleErc721Holographer.getSourceContract()
  )) as SampleERC721;

  cxipErc721Hash = await generateErc721Config(
    network,
    deployer.address,
    'CxipERC721Proxy',
    'CXIP ERC721 Collection (' + hre.networkName + ')',
    'CXIP',
    1000,
    ConfigureEvents([HolographERC721Event.bridgeIn, HolographERC721Event.bridgeOut, HolographERC721Event.afterBurn]),
    generateInitCode(
      ['bytes32', 'address', 'bytes'],
      [
        '0x' + web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
        registry.address,
        generateInitCode(['address'], [deployer.address]),
      ]
    ),
    salt
  );
  cxipErc721Holographer = (await hre.ethers.getContractAt(
    'Holographer',
    await registry.getHolographedHashAddress(cxipErc721Hash.erc721ConfigHash)
  )) as Holographer;
  cxipErc721Enforcer = (await hre.ethers.getContractAt(
    'HolographERC721',
    await cxipErc721Holographer.getHolographEnforcer()
  )) as HolographERC721;
  cxipErc721 = (await hre.ethers.getContractAt(
    'CxipERC721',
    await cxipErc721Holographer.getSourceContract()
  )) as CxipERC721;
  cxipErc721Proxy = (await hre.ethers.getContractAt(
    'CxipERC721Proxy',
    await cxipErc721Holographer.getSourceContract()
  )) as CxipERC721Proxy;

  global.__companionNetwork = false;

  return {
    hre,
    hre2,
    salt,
    networks,
    network,
    network2,
    web3,
    chainId,
    chainId2,
    deployer,
    wallet1,
    wallet2,
    wallet3,
    wallet4,
    wallet5,
    wallet6,
    wallet7,
    wallet8,
    wallet9,
    wallet10,
    lzEndpoint,
    admin,
    mockLZEndpoint,
    cxipErc721,
    cxipErc721Proxy,
    erc20Mock,
    holograph,
    holographBridge,
    holographBridgeProxy,
    holographer,
    holographErc20,
    holographErc721,
    holographFactory,
    holographFactoryProxy,
    holographGenesis,
    holographOperator,
    holographOperatorProxy,
    holographRegistry,
    holographRegistryProxy,
    holographTreasury,
    holographTreasuryProxy,
    hToken,
    utilityToken,
    holographInterfaces,
    mockErc721Receiver,
    owner,
    pa1d,
    sampleErc20,
    sampleErc721,
    bridge,
    factory,
    operator,
    registry,
    treasury,
    hTokenHolographer,
    hTokenEnforcer,
    utilityTokenHolographer,
    utilityTokenEnforcer,
    sampleErc20Holographer,
    sampleErc20Enforcer,
    sampleErc721Holographer,
    sampleErc721Enforcer,
    cxipErc721Holographer,
    cxipErc721Enforcer,
    faucet,
    lzModule,
    sampleErc721Hash,
  } as PreTest;
}
