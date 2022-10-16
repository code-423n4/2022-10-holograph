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
  generateErc721Config,
  generateInitCode,
  NetworkType,
} from '../scripts/utils/helpers';
import {
  HolographERC20Event,
  HolographERC721Event,
  HolographERC1155Event,
  ConfigureEvents,
} from '../scripts/utils/events';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const accounts = await hre.ethers.getSigners();
  const deployer: SignerWithAddress = accounts[0];

  const network = networks[hre.networkName];

  const currentNetworkType: NetworkType = networks[hre.networkName].type;

  if (currentNetworkType == NetworkType.local) {
    const web3 = new Web3();

    const error = function (err: string) {
      hre.deployments.log(err);
      process.exit();
    };

    const salt = hre.deploymentSalt;

    const holographFactoryProxy = await hre.ethers.getContract('HolographFactoryProxy');
    const holographFactory = ((await hre.ethers.getContract('HolographFactory')) as Contract).attach(
      holographFactoryProxy.address
    );

    const holographRegistryProxy = await hre.ethers.getContract('HolographRegistryProxy');
    const holographRegistry = ((await hre.ethers.getContract('HolographRegistry')) as Contract).attach(
      holographRegistryProxy.address
    );

    const chainId = '0x' + network.holographId.toString(16).padStart(8, '0');

    let sampleErc20Config = await generateErc20Config(
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
    let sampleErc20Address = await holographRegistry.getHolographedHashAddress(sampleErc20Config.erc20ConfigHash);
    if (sampleErc20Address == zeroAddress) {
      hre.deployments.log('need to deploy "SampleERC20" for chain:', chainId);
      const sig = await deployer.signMessage(sampleErc20Config.erc20ConfigHashBytes);
      const signature: Signature = StrictECDSA({
        r: '0x' + sig.substring(2, 66),
        s: '0x' + sig.substring(66, 130),
        v: '0x' + sig.substring(130, 132),
      } as Signature);
      const depoyTx = await holographFactory.deployHolographableContract(
        sampleErc20Config.erc20Config,
        signature,
        deployer.address,
        {
          nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
        }
      );
      const deployResult = await depoyTx.wait();
      if (deployResult.events.length < 1 || deployResult.events[0].event != 'BridgeableContractDeployed') {
        throw new Error('BridgeableContractDeployed event not fired');
      }
      sampleErc20Address = deployResult.events[0].args[0];
      hre.deployments.log(
        'deployed "SampleERC20" at:',
        await holographRegistry.getHolographedHashAddress(sampleErc20Config.erc20ConfigHash)
      );
    } else {
      hre.deployments.log('reusing "SampleERC20" at:', sampleErc20Address);
    }

    let sampleErc721Config = await generateErc721Config(
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
    let sampleErc721Address = await holographRegistry.getHolographedHashAddress(sampleErc721Config.erc721ConfigHash);
    if (sampleErc721Address == zeroAddress) {
      hre.deployments.log('need to deploy "SampleERC721" for chain:', chainId);
      const sig = await deployer.signMessage(sampleErc721Config.erc721ConfigHashBytes);
      const signature: Signature = StrictECDSA({
        r: '0x' + sig.substring(2, 66),
        s: '0x' + sig.substring(66, 130),
        v: '0x' + sig.substring(130, 132),
      } as Signature);
      const depoyTx = await holographFactory.deployHolographableContract(
        sampleErc721Config.erc721Config,
        signature,
        deployer.address,
        {
          nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
        }
      );
      const deployResult = await depoyTx.wait();
      if (deployResult.events.length < 2 || deployResult.events[1].event != 'BridgeableContractDeployed') {
        throw new Error('BridgeableContractDeployed event not fired');
      }
      sampleErc721Address = deployResult.events[1].args[0];
      hre.deployments.log(
        'deployed "SampleERC721" at:',
        await holographRegistry.getHolographedHashAddress(sampleErc721Config.erc721ConfigHash)
      );
    } else {
      hre.deployments.log('reusing "SampleERC721" at:', sampleErc721Address);
    }

    let cxipErc721Config = await generateErc721Config(
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
          holographRegistry.address,
          generateInitCode(['address'], [deployer.address]),
        ]
      ),
      salt
    );
    let cxipErc721Address = await holographRegistry.getHolographedHashAddress(cxipErc721Config.erc721ConfigHash);
    if (cxipErc721Address == zeroAddress) {
      hre.deployments.log('need to deploy "CxipERC721Proxy" for chain:', chainId);
      const sig = await deployer.signMessage(cxipErc721Config.erc721ConfigHashBytes);
      const signature: Signature = StrictECDSA({
        r: '0x' + sig.substring(2, 66),
        s: '0x' + sig.substring(66, 130),
        v: '0x' + sig.substring(130, 132),
      } as Signature);
      const depoyTx = await holographFactory.deployHolographableContract(
        cxipErc721Config.erc721Config,
        signature,
        deployer.address,
        {
          nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
        }
      );
      const deployResult = await depoyTx.wait();
      if (deployResult.events.length < 2 || deployResult.events[1].event != 'BridgeableContractDeployed') {
        throw new Error('BridgeableContractDeployed event not fired');
      }
      cxipErc721Address = deployResult.events[1].args[0];
      hre.deployments.log(
        'deployed "CxipERC721Proxy" at:',
        await holographRegistry.getHolographedHashAddress(cxipErc721Config.erc721ConfigHash)
      );
    } else {
      hre.deployments.log('reusing "CxipERC721Proxy" at:', cxipErc721Address);
    }
  }
};

export default func;
func.tags = ['SampleERC20', 'SampleERC721', 'CxipERC721Proxy'];
func.dependencies = [
  'HolographGenesis',
  'DeploySources',
  'DeployERC20',
  'DeployERC721',
  'DeployERC1155',
  'RegisterTemplates',
  'ValidateInterfaces',
];
