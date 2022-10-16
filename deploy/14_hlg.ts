declare var global: any;
import fs from 'fs';
import Web3 from 'web3';
import { BigNumberish, BytesLike, ContractFactory, Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  LeanHardhatRuntimeEnvironment,
  Signature,
  hreSplit,
  zeroAddress,
  StrictECDSA,
  generateErc20Config,
  generateInitCode,
  Network,
  NetworkType,
  genesisDeriveFutureAddress,
  remove0x,
} from '../scripts/utils/helpers';
import { HolographERC20Event, ConfigureEvents, AllEventsEnabled } from '../scripts/utils/events';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const accounts = await hre.ethers.getSigners();
  const deployer: SignerWithAddress = accounts[0];

  const web3 = new Web3();

  const salt = hre.deploymentSalt;

  const network = networks[hre.networkName];

  const chainId = '0x' + network.holographId.toString(16).padStart(8, '0');

  const holograph = await hre.ethers.getContract('Holograph');
  let hlgTokenAddress = await holograph.getUtilityToken();

  const holographFactoryProxy = await hre.ethers.getContract('HolographFactoryProxy');
  const holographFactory = ((await hre.ethers.getContract('HolographFactory')) as Contract).attach(
    holographFactoryProxy.address
  );

  const holographRegistryProxy = await hre.ethers.getContract('HolographRegistryProxy');
  const holographRegistry = ((await hre.ethers.getContract('HolographRegistry')) as Contract).attach(
    holographRegistryProxy.address
  );

  const error = function (err: string) {
    hre.deployments.log(err);
    process.exit();
  };

  // Future Holograph Utility Token
  const currentNetworkType: NetworkType = network.type;
  let primaryNetwork: Network;
  if (currentNetworkType == NetworkType.local) {
    primaryNetwork = networks.localhost;
  } else if (currentNetworkType == NetworkType.testnet) {
    primaryNetwork = networks.eth_goerli;
  } else if (currentNetworkType == NetworkType.mainnet) {
    primaryNetwork = networks.eth;
  } else {
    throw new Error('cannot identity current NetworkType');
  }

  let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
    primaryNetwork,
    deployer.address,
    'HolographUtilityToken',
    'Holograph Utility Token',
    'HLG',
    'Holograph Utility Token',
    '1',
    18,
    ConfigureEvents([]),
    generateInitCode(['address'], [deployer.address]),
    salt
  );

  const holographerBytecode: BytesLike = (await hre.ethers.getContractFactory('Holographer')).bytecode;
  const futureHlgAddress = hre.ethers.utils.getCreate2Address(
    holographFactoryProxy.address,
    erc20ConfigHash,
    hre.ethers.utils.keccak256(holographerBytecode)
  );
  hre.deployments.log('the future "HolographUtilityToken" address is', futureHlgAddress);

  let hlgDeployedCode: string = await hre.provider.send('eth_getCode', [futureHlgAddress, 'latest']);
  hre.deployments.log('hlgTokenAddress', hlgTokenAddress);
  hre.deployments.log('futureHlgAddress', futureHlgAddress);
  if (hlgDeployedCode == '0x' || hlgDeployedCode == '' || hlgTokenAddress != futureHlgAddress) {
    hre.deployments.log('need to deploy "HLG" for chain:', chainId);

    const sig = await deployer.signMessage(erc20ConfigHashBytes);
    const signature: Signature = StrictECDSA({
      r: '0x' + sig.substring(2, 66),
      s: '0x' + sig.substring(66, 130),
      v: '0x' + sig.substring(130, 132),
    } as Signature);

    const depoyTx = await holographFactory.deployHolographableContract(erc20Config, signature, deployer.address, {
      nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
    });
    const deployResult = await depoyTx.wait();
    let eventIndex: number = 0;
    let eventFound: boolean = false;
    for (let i = 0, l = deployResult.events.length; i < l; i++) {
      let e = deployResult.events[i];
      if (e.event == 'BridgeableContractDeployed') {
        eventFound = true;
        eventIndex = i;
        break;
      }
    }
    if (!eventFound) {
      throw new Error('BridgeableContractDeployed event not fired');
    }
    hlgTokenAddress = deployResult.events[eventIndex].args[0];
    if (hlgTokenAddress != futureHlgAddress) {
      throw new Error(
        `Seems like hlgTokenAddress ${hlgTokenAddress} and futureHlgAddress ${futureHlgAddress} do not match!`
      );
    }
    if ((await holograph.getUtilityToken()) != hlgTokenAddress) {
      const setHTokenTx = await holograph.setUtilityToken(hlgTokenAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await setHTokenTx.wait();
    }
    if ((await holographRegistry.getUtilityToken()) != hlgTokenAddress) {
      const setHTokenTx2 = await holographRegistry.setUtilityToken(hlgTokenAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await setHTokenTx2.wait();
    }

    hre.deployments.log('deployed "HLG" at:', await holograph.getUtilityToken());
  } else {
    hre.deployments.log('reusing "HLG" at:', hlgTokenAddress);
  }
};

export default func;
func.tags = ['HLG', 'HolographUtilityToken'];
func.dependencies = ['HolographGenesis', 'DeploySources', 'DeployERC20', 'RegisterTemplates'];
