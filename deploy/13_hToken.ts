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

  const holograph = await hre.ethers.getContract('Holograph');

  const factory = (await hre.ethers.getContractAt('HolographFactory', await holograph.getFactory())) as Contract;

  const registry = (await hre.ethers.getContractAt('HolographRegistry', await holograph.getRegistry())) as Contract;

  const holographerBytecode: BytesLike = (await hre.ethers.getContractFactory('Holographer')).bytecode;

  const error = function (err: string) {
    hre.deployments.log(err);
    process.exit();
  };

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

  const hTokenDeployer = async function (
    holograph: Contract,
    factory: Contract,
    registry: Contract,
    holographerBytecode: BytesLike,
    network: Network
  ) {
    const chainId = '0x' + network.holographId.toString(16).padStart(8, '0');
    let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
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

    const futureHTokenAddress = hre.ethers.utils.getCreate2Address(
      factory.address,
      erc20ConfigHash,
      hre.ethers.utils.keccak256(holographerBytecode)
    );
    hre.deployments.log('the future "hToken #' + network.holographId.toString() + '" address is', futureHTokenAddress);

    let hTokenDeployedCode: string = await hre.provider.send('eth_getCode', [futureHTokenAddress, 'latest']);
    if (hTokenDeployedCode == '0x' || hTokenDeployedCode == '') {
      hre.deployments.log('need to deploy "hToken #' + network.holographId.toString() + '"');

      const sig = await deployer.signMessage(erc20ConfigHashBytes);
      const signature: Signature = StrictECDSA({
        r: '0x' + sig.substring(2, 66),
        s: '0x' + sig.substring(66, 130),
        v: '0x' + sig.substring(130, 132),
      } as Signature);

      const depoyTx = await factory.deployHolographableContract(erc20Config, signature, deployer.address, {
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
      let hTokenAddress = deployResult.events[eventIndex].args[0];
      if (hTokenAddress != futureHTokenAddress) {
        throw new Error(
          `Seems like hTokenAddress ${hTokenAddress} and futureHTokenAddress ${futureHTokenAddress} do not match!`
        );
      }
      if ((await registry.getHToken(chainId)) != hTokenAddress) {
        hre.deployments.log('Updated "Registry" with "hToken #' + network.holographId.toString());
        const setHTokenTx = await registry.setHToken(chainId, hTokenAddress, {
          nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
        });
        await setHTokenTx.wait();
      }
      hre.deployments.log(
        'deployed "hToken #' + network.holographId.toString() + '" at:',
        await registry.getHToken(chainId)
      );
    } else {
      hre.deployments.log('reusing "hToken #' + network.holographId.toString() + '" at:', futureHTokenAddress);
    }
  };

  for (let key of Object.keys(networks)) {
    if (networks[key].active && networks[key].type == currentNetworkType) {
      if (network.holographId == networks[key].holographId || currentNetworkType != NetworkType.local) {
        await hTokenDeployer(holograph, factory, registry, holographerBytecode, networks[key]);
      }
    }
  }
};

export default func;
func.tags = ['hToken'];
func.dependencies = ['HolographGenesis', 'DeploySources', 'DeployERC20', 'RegisterTemplates'];
