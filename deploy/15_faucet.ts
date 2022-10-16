declare var global: any;
import { Contract, BigNumber } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  hreSplit,
  genesisDeployHelper,
  genesisDeriveFutureAddress,
  generateErc20Config,
  generateInitCode,
  NetworkType,
} from '../scripts/utils/helpers';
import { HolographERC20Event, ConfigureEvents } from '../scripts/utils/events';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);

  const accounts = await hre.ethers.getSigners();
  const deployer: SignerWithAddress = accounts[0];

  const network = networks[hre.networkName];

  const salt = hre.deploymentSalt;

  const holograph = await hre.ethers.getContract('Holograph');
  const hlgTokenAddress = await holograph.getUtilityToken();

  const currentNetworkType: NetworkType = network.type;

  if (currentNetworkType == NetworkType.local || currentNetworkType == NetworkType.testnet) {
    const futureFaucetAddress = await genesisDeriveFutureAddress(
      hre,
      salt,
      'Faucet',
      generateInitCode(['address', 'address'], [deployer.address, hlgTokenAddress])
    );
    hre.deployments.log('the future "Faucet" address is', futureFaucetAddress);

    // Faucet
    let faucetDeployedCode: string = await hre.provider.send('eth_getCode', [futureFaucetAddress, 'latest']);
    if (faucetDeployedCode == '0x' || faucetDeployedCode == '') {
      hre.deployments.log('"Faucet" bytecode not found, need to deploy"');
      let faucet = await genesisDeployHelper(
        hre,
        salt,
        'Faucet',
        generateInitCode(['address', 'address'], [deployer.address, hlgTokenAddress]),
        futureFaucetAddress
      );
      const hlgContract = (await hre.ethers.getContract('HolographERC20')).attach(hlgTokenAddress);
      if (currentNetworkType == NetworkType.testnet) {
        const transferTx = await hlgContract.transfer(
          futureFaucetAddress,
          BigNumber.from('1000000000000000000000000'),
          {
            nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
          }
        );
        await transferTx.wait();
      }
    } else {
      hre.deployments.log('"Faucet" is already deployed.');
    }
    if (currentNetworkType == NetworkType.testnet) {
      const faucetContract = await hre.ethers.getContract('Faucet');
      if ((await faucetContract.token()) != hlgTokenAddress) {
        const tx = await faucetContract.setToken(hlgTokenAddress, {
          nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
        });
        await tx.wait();
        hre.deployments.log('Updated HLG reference');
      }
    }
  }
};

export default func;
func.tags = ['Faucet'];
func.dependencies = ['SampleERC20'];
