declare var global: any;
import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Holographer, CxipERC721Proxy } from '../typechain-types';
import { hreSplit, NetworkType } from '../scripts/utils/helpers';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const { deployer } = await hre.getNamedAccounts();

  const salt = hre.deploymentSalt;

  const currentNetworkType: NetworkType = networks[hre.networkName].type;

  if (currentNetworkType != NetworkType.local) {
    const holographer: Contract | null = await hre.ethers.getContractOrNull('Holographer');
    if (holographer == null) {
      await hre.deployments.deploy('Holographer', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      });
      hre.deployments.log('Deployed a "Holographer" empty contract for block explorer verification purposes.');
    }

    const cxipERC721Proxy: Contract | null = await hre.ethers.getContractOrNull('CxipERC721Proxy');
    if (cxipERC721Proxy == null) {
      await hre.deployments.deploy('CxipERC721Proxy', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
        nonce: await hre.ethers.provider.getTransactionCount(deployer),
      });
      hre.deployments.log('Deployed a "CxipERC721Proxy" empty contract for block explorer verification purposes.');
    }
  }
};

export default func;
func.tags = ['Holographer4verify', 'CxipERC721Proxy4verify'];
func.dependencies = [];
