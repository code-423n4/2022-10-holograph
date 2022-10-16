declare var global: any;
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import { NetworkType } from '../scripts/utils/helpers';
import networks from '../config/networks';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const currentNetworkType: NetworkType = networks[hre.network.name].type;

  if (currentNetworkType != NetworkType.local) {
    let contracts: string[] = [
      'Holograph',
      'HolographBridge',
      'HolographBridgeProxy',
      'Holographer',
      'HolographERC20',
      'HolographERC721',
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
      'CxipERC721',
      'CxipERC721Proxy',
      'Faucet',
      'LayerZeroModule',
    ];
    for (let i: number = 0, l: number = contracts.length; i < l; i++) {
      let contract: string = contracts[i];
      try {
        await hre.run('verify:verify', {
          address: (await hre.ethers.getContract(contract)).address,
          constructorArguments: [],
        });
      } catch (error) {
        hre.deployments.log(`Failed to verify ""${contract}" -> ${error}`);
      }
    }
  } else {
    hre.deployments.log('Not verifying contracts on localhost networks.');
  }
};
export default func;
func.tags = ['Verify'];
func.dependencies = [];
