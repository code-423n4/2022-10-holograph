declare var global: any;
import fs from 'fs';
import Web3 from 'web3';
import { BytesLike, ContractFactory, Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import networks from '../config/networks';
import { Network, NetworkType } from '../scripts/utils/helpers';
import {
  LeanHardhatRuntimeEnvironment,
  hreSplit,
  generateInitCode,
  genesisDeriveFutureAddress,
  zeroAddress,
} from '../scripts/utils/helpers';
import { ConfigureEvents } from '../scripts/utils/events';
import {
  ERC20,
  ERC20Burnable,
  ERC20Metadata,
  ERC20Permit,
  ERC20Safer,
  ERC165,
  ERC721,
  ERC721Enumerable,
  ERC721Metadata,
  ERC721TokenReceiver,
  HolographInterfaces,
  InitializableInterface,
  PA1DInterface,
} from '../typechain-types';

const web3 = new Web3();

const functionHash = function (func: string): string {
  return web3.eth.abi.encodeFunctionSignature(func);
};

const bitwiseXorHexString = function (pinBlock1: string, pinBlock2: string): string {
  pinBlock1 = pinBlock1.substring(2);
  pinBlock2 = pinBlock2.substring(2);
  let result: string = '';
  for (let index: number = 0; index < 8; index++) {
    let temp: string = (parseInt(pinBlock1.charAt(index), 16) ^ parseInt(pinBlock2.charAt(index), 16))
      .toString(16)
      .toLowerCase();
    result += temp;
  }
  return '0x' + result;
};

const XOR = function (hashes: string[]): string {
  let output: string = '0x00000000';
  for (let i: number = 0, l: number = hashes.length; i < l; i++) {
    output = bitwiseXorHexString(output, hashes[i]);
  }
  return output;
};

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const { deployer } = await hre.getNamedAccounts();

  const salt = hre.deploymentSalt;

  const error = function (err: string) {
    hre.deployments.log(err);
    process.exit();
  };

  const futureHolographInterfacesAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographInterfaces',
    generateInitCode(['address'], [zeroAddress])
  );
  hre.deployments.log('the future "HolographInterfaces" address is', futureHolographInterfacesAddress);

  const holographInterfaces: HolographInterfaces = (await hre.ethers.getContractAt(
    'HolographInterfaces',
    futureHolographInterfacesAddress
  )) as HolographInterfaces;
  const network: Network = networks[hre.networkName];
  const networkType: NetworkType = network.type;
  const networkKeys: string[] = Object.keys(networks);
  const networkValues: Network[] = Object.values(networks);
  let supportedNetworkNames: string[] = [];
  let supportedNetworks: Network[] = [];
  let needToMap: number[][] = [];
  for (let i = 0, l = networkKeys.length; i < l; i++) {
    const key: string = networkKeys[i];
    const value: Network = networkValues[i];
    if (value.type == networkType) {
      supportedNetworkNames.push(key);
      supportedNetworks.push(value);
      if (value.holographId > 0) {
        let evm2hlg: number = (await holographInterfaces.getChainId(1, value.chain, 2)).toNumber();
        if (evm2hlg != value.holographId) {
          needToMap.push([1, value.chain, 2, value.holographId]);
        }
        let hlg2evm: number = (await holographInterfaces.getChainId(2, value.holographId, 1)).toNumber();
        if (hlg2evm != value.chain) {
          needToMap.push([2, value.holographId, 1, value.chain]);
        }
        if (value.lzId > 0) {
          let lz2hlg: number = (await holographInterfaces.getChainId(3, value.lzId, 2)).toNumber();
          if (lz2hlg != value.holographId) {
            needToMap.push([3, value.lzId, 2, value.holographId]);
          }
          let hlg2lz: number = (await holographInterfaces.getChainId(2, value.holographId, 3)).toNumber();
          if (hlg2lz != value.lzId) {
            needToMap.push([2, value.holographId, 3, value.lzId]);
          }
        }
      }
    }
  }
  if (needToMap.length == 0) {
    hre.deployments.log('HolographInterfaces supports all currently configured networks');
  } else {
    hre.deployments.log('HolographInterfaces needs to have some network support configured');
    hre.deployments.log(JSON.stringify(needToMap));
    let fromChainType: number[] = [];
    let fromChainId: number[] = [];
    let toChainType: number[] = [];
    let toChainId: number[] = [];
    for (let chainMap of needToMap) {
      fromChainType.push(chainMap[0]);
      fromChainId.push(chainMap[1]);
      toChainType.push(chainMap[2]);
      toChainId.push(chainMap[3]);
    }
    let tx = await holographInterfaces.updateChainIdMaps(fromChainType, fromChainId, toChainType, toChainId, {
      nonce: await hre.ethers.provider.getTransactionCount(deployer),
    });
    await tx.wait();
  }

  let supportedPrepends: { type: number; prepend: string }[] = [
    { type: 1, prepend: 'ipfs://' },
    { type: 2, prepend: 'https://' },
    { type: 3, prepend: 'ar://' },
  ];
  let needToMapPrepends: { type: number; prepend: string }[] = [];
  for (let prepend of supportedPrepends) {
    let currentPrepend: string = await holographInterfaces.getUriPrepend(prepend.type);
    if (currentPrepend != prepend.prepend) {
      needToMapPrepends.push(prepend);
    }
  }
  if (needToMapPrepends.length == 0) {
    hre.deployments.log('HolographInterfaces has all currently supported URI prepends configured');
  } else {
    hre.deployments.log('HolographInterfaces needs to have some URI prepends configured');
    let uriTypes: number[] = [];
    let prepends: string[] = [];
    for (let prepend of needToMapPrepends) {
      uriTypes.push(prepend.type);
      prepends.push(prepend.prepend);
    }
    let tx = await holographInterfaces.updateUriPrepends(uriTypes, prepends, {
      nonce: await hre.ethers.provider.getTransactionCount(deployer),
    });
    await tx.wait();
  }
  const supportedInterfaces: { [key: string]: string[] } = {
    // ERC20
    '1': [
      // ERC165
      functionHash('supportsInterface(bytes4)'),

      // ERC20
      functionHash('allowance(address,address)'),
      functionHash('approve(address,uint256)'),
      functionHash('balanceOf(address)'),
      functionHash('totalSupply()'),
      functionHash('transfer(address,uint256)'),
      functionHash('transferFrom(address,address,uint256)'),
      XOR([
        functionHash('allowance(address,address)'),
        functionHash('approve(address,uint256)'),
        functionHash('balanceOf(address)'),
        functionHash('totalSupply()'),
        functionHash('transfer(address,uint256)'),
        functionHash('transferFrom(address,address,uint256)'),
      ]),

      // ERC20Metadata
      functionHash('name()'),
      functionHash('symbol()'),
      functionHash('decimals()'),
      XOR([functionHash('name()'), functionHash('symbol()'), functionHash('decimals()')]),

      // ERC20Burnable
      functionHash('burn(uint256)'),
      functionHash('burnFrom(address,uint256)'),
      XOR([functionHash('burn(uint256)'), functionHash('burnFrom(address,uint256)')]),

      // ERC20Safer
      functionHash('safeTransfer(address,uint256)'),
      functionHash('safeTransfer(address,uint256,bytes)'),
      functionHash('safeTransferFrom(address,address,uint256)'),
      functionHash('safeTransferFrom(address,address,uint256,bytes)'),
      XOR([
        functionHash('safeTransfer(address,uint256)'),
        functionHash('safeTransfer(address,uint256,bytes)'),
        functionHash('safeTransferFrom(address,address,uint256)'),
        functionHash('safeTransferFrom(address,address,uint256,bytes)'),
      ]),

      // ERC20Permit
      functionHash('permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'),
      functionHash('nonces(address)'),
      functionHash('DOMAIN_SEPARATOR()'),
      XOR([
        functionHash('permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'),
        functionHash('nonces(address)'),
        functionHash('DOMAIN_SEPARATOR()'),
      ]),
    ],

    // ERC721
    '2': [
      // ERC165
      functionHash('supportsInterface(bytes4)'),

      // ERC721
      functionHash('balanceOf(address)'),
      functionHash('ownerOf(uint256)'),
      functionHash('safeTransferFrom(address,address,uint256)'),
      functionHash('safeTransferFrom(address,address,uint256,bytes)'),
      functionHash('transferFrom(address,address,uint256)'),
      functionHash('approve(address,uint256)'),
      functionHash('setApprovalForAll(address,bool)'),
      functionHash('getApproved(uint256)'),
      functionHash('isApprovedForAll(address,address)'),
      XOR([
        functionHash('balanceOf(address)'),
        functionHash('ownerOf(uint256)'),
        functionHash('safeTransferFrom(address,address,uint256)'),
        functionHash('safeTransferFrom(address,address,uint256,bytes)'),
        functionHash('transferFrom(address,address,uint256)'),
        functionHash('approve(address,uint256)'),
        functionHash('setApprovalForAll(address,bool)'),
        functionHash('getApproved(uint256)'),
        functionHash('isApprovedForAll(address,address)'),
      ]),

      // ERC721Enumerable
      functionHash('totalSupply()'),
      functionHash('tokenByIndex(uint256)'),
      functionHash('tokenOfOwnerByIndex(address,uint256)'),
      XOR([
        functionHash('totalSupply()'),
        functionHash('tokenByIndex(uint256)'),
        functionHash('tokenOfOwnerByIndex(address,uint256)'),
      ]),

      // ERC721Metadata
      functionHash('name()'),
      functionHash('symbol()'),
      functionHash('tokenURI(uint256)'),
      XOR([functionHash('name()'), functionHash('symbol()'), functionHash('tokenURI(uint256)')]),

      // adding ERC20-like-Metadata support for Etherscan totalSupply fix
      functionHash('decimals()'),
      XOR([functionHash('name()'), functionHash('symbol()'), functionHash('decimals()')]),

      // ERC721TokenReceiver
      functionHash('onERC721Received(address,address,uint256,bytes)'),

      // CollectionURI
      functionHash('contractURI()'),
    ],
    // PA1D
    '4': [
      // PA1D
      functionHash('initPA1D(bytes)'),
      functionHash('configurePayouts(address[],uint256[])'),
      functionHash('getPayoutInfo()'),
      functionHash('getEthPayout()'),
      functionHash('getTokenPayout(address)'),
      functionHash('getTokensPayout(address[])'),
      functionHash('supportsInterface(bytes4)'),
      functionHash('setRoyalties(uint256,address,uint256)'),
      functionHash('royaltyInfo(uint256,uint256)'),
      functionHash('getFeeBps(uint256)'),
      functionHash('getFeeRecipients(uint256)'),
      XOR([functionHash('getFeeBps(uint256)'), functionHash('getFeeRecipients(uint256)')]),
      functionHash('getRoyalties(uint256)'),
      functionHash('getFees(uint256)'),
      functionHash('tokenCreator(address,uint256)'),
      functionHash('calculateRoyaltyFee(address,uint256,uint256)'),
      functionHash('marketContract()'),
      functionHash('tokenCreators(uint256)'),
      functionHash('bidSharesForToken(uint256)'),
      functionHash('getStorageSlot(string)'),
      functionHash('getTokenAddress(string)'),
    ],
  };
  if (global.__deployedHolographInterfaces) {
    hre.deployments.log('HolographInterfaces needs to have all supported interfaces configured');
    for (let key of Object.keys(supportedInterfaces)) {
      let tx = await holographInterfaces.updateInterfaces(parseInt(key), supportedInterfaces[key], true, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      });
      await tx.wait();
    }
  } else {
    hre.deployments.log('Checking HolographInterfaces if some supported interfaces need to be configured');
    for (let key of Object.keys(supportedInterfaces)) {
      let interfaces: string[] = supportedInterfaces[key];
      let todo: string[] = [];
      for (let i of interfaces) {
        if (!(await holographInterfaces.supportsInterface(parseInt(key), i))) {
          // we need to add support
          todo.push(i);
        }
      }
      if (todo.length == 0) {
        hre.deployments.log('No missing interfaces in HolographInterfaces for InterfaceType[' + key + ']');
      } else {
        hre.deployments.log('Found missing interfaces in HolographInterfaces for InterfaceType[' + key + ']');
        let tx = await holographInterfaces.updateInterfaces(parseInt(key), todo, true, {
          nonce: await hre.ethers.provider.getTransactionCount(deployer),
        });
        await tx.wait();
      }
    }
  }
};

export default func;
func.tags = ['ValidateInterfaces'];
func.dependencies = ['HolographGenesis', 'DeploySources'];
