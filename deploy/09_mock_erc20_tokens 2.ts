declare var global: any;
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import { LeanHardhatRuntimeEnvironment, hreSplit, NetworkType } from '../scripts/utils/helpers';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const currentNetworkType: NetworkType = networks[hre.networkName].type;

  if (currentNetworkType == NetworkType.local) {
    const mockErc20Tokens = await deploy('ERC20Mock', {
      from: deployer,
      args: ['Wrapped ETH (MOCK)', 'WETHmock', 18, 'ERC20Mock', '1'],
      log: true,
      waitConfirmations: 1,
      nonce: await hre.ethers.provider.getTransactionCount(deployer),
    });
  }
};

export default func;
func.tags = ['ERC20Mock', 'MockERC720Tokens'];
func.dependencies = ['HolographGenesis'];
