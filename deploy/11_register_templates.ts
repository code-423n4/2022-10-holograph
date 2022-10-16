declare var global: any;
import fs from 'fs';
import Web3 from 'web3';
import { BytesLike, ContractFactory, Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import {
  LeanHardhatRuntimeEnvironment,
  hreSplit,
  generateInitCode,
  genesisDeriveFutureAddress,
  zeroAddress,
} from '../scripts/utils/helpers';
import { ConfigureEvents } from '../scripts/utils/events';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const { deployer } = await hre.getNamedAccounts();

  const web3 = new Web3();

  const salt = hre.deploymentSalt;

  const error = function (err: string) {
    hre.deployments.log(err);
    process.exit();
  };

  const holographRegistryProxy = await hre.ethers.getContract('HolographRegistryProxy');
  const holographRegistry = ((await hre.ethers.getContract('HolographRegistry')) as Contract).attach(
    holographRegistryProxy.address
  );

  const futureErc721Address = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographERC721',
    generateInitCode(
      ['string', 'string', 'uint16', 'uint256', 'bool', 'bytes'],
      [
        'Holograph ERC721 Collection', // contractName
        'hNFT', // contractSymbol
        1000, // contractBps == 0%
        ConfigureEvents([]), // eventConfig
        true, // skipInit
        generateInitCode(['address'], [deployer]), // initCode
      ]
    )
  );
  hre.deployments.log('the future "HolographERC721" address is', futureErc721Address);

  const erc721Hash = '0x' + web3.utils.asciiToHex('HolographERC721').substring(2).padStart(64, '0');
  if ((await holographRegistry.getContractTypeAddress(erc721Hash)) != futureErc721Address) {
    const erc721Tx = await holographRegistry
      .setContractTypeAddress(erc721Hash, futureErc721Address, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      })
      .catch(error);
    hre.deployments.log('Transaction hash:', erc721Tx.hash);
    await erc721Tx.wait();
    hre.deployments.log(
      `Registered "HolographERC721" to: ${await holographRegistry.getContractTypeAddress(erc721Hash)}`
    );
  } else {
    hre.deployments.log('"HolographERC721" is already registered');
  }

  const futureCxipErc721Address = await genesisDeriveFutureAddress(
    hre,
    salt,
    'CxipERC721',
    generateInitCode(['address'], [zeroAddress])
  );
  hre.deployments.log('the future "CxipERC721" address is', futureCxipErc721Address);

  const cxipErc721Hash = '0x' + web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0');
  if ((await holographRegistry.getContractTypeAddress(cxipErc721Hash)) != futureCxipErc721Address) {
    const cxipErc721Tx = await holographRegistry
      .setContractTypeAddress(cxipErc721Hash, futureCxipErc721Address, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      })
      .catch(error);
    hre.deployments.log('Transaction hash:', cxipErc721Tx.hash);
    await cxipErc721Tx.wait();
    hre.deployments.log(
      `Registered "CxipERC721" to: ${await holographRegistry.getContractTypeAddress(cxipErc721Hash)}`
    );
  } else {
    hre.deployments.log('"CxipERC721" is already registered');
  }

  const futureErc20Address = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographERC20',
    generateInitCode(
      ['string', 'string', 'uint16', 'uint256', 'string', 'string', 'bool', 'bytes'],
      [
        'Holograph ERC20 Token', // contractName
        'HolographERC20', // contractSymbol
        18, // contractDecimals
        ConfigureEvents([]), // eventConfig
        'HolographERC20', // domainSeperator
        '1', // domainVersion
        true, // skipInit
        '0x', // initCode
      ]
    )
  );
  hre.deployments.log('the future "HolographERC20" address is', futureErc20Address);

  const erc20Hash = '0x' + web3.utils.asciiToHex('HolographERC20').substring(2).padStart(64, '0');
  if ((await holographRegistry.getContractTypeAddress(erc20Hash)) != futureErc20Address) {
    const erc20Tx = await holographRegistry
      .setContractTypeAddress(erc20Hash, futureErc20Address, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      })
      .catch(error);
    hre.deployments.log('Transaction hash:', erc20Tx.hash);
    await erc20Tx.wait();
    hre.deployments.log(`Registered "HolographERC20" to: ${await holographRegistry.getContractTypeAddress(erc20Hash)}`);
  } else {
    hre.deployments.log('"HolographERC20" is already registered');
  }

  const futureRoyaltiesAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'PA1D',
    generateInitCode(['address', 'uint256'], [zeroAddress, '0x' + '00'.repeat(32)])
  );
  hre.deployments.log('the future "PA1D" address is', futureRoyaltiesAddress);

  const pa1dHash = '0x' + web3.utils.asciiToHex('PA1D').substring(2).padStart(64, '0');
  if ((await holographRegistry.getContractTypeAddress(pa1dHash)) != futureRoyaltiesAddress) {
    const pa1dTx = await holographRegistry
      .setContractTypeAddress(pa1dHash, futureRoyaltiesAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      })
      .catch(error);
    hre.deployments.log('Transaction hash:', pa1dTx.hash);
    await pa1dTx.wait();
    hre.deployments.log(`Registered "PA1D" to: ${await holographRegistry.getContractTypeAddress(pa1dHash)}`);
  } else {
    hre.deployments.log('"PA1D" is already registered');
  }
};

export default func;
func.tags = ['RegisterTemplates'];
func.dependencies = ['HolographGenesis', 'DeploySources', 'DeployERC20', 'DeployERC721', 'DeployERC1155'];
