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
    const mockErc721Receiver = await deploy('MockERC721Receiver', {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      nonce: await hre.ethers.provider.getTransactionCount(deployer),
    });
  }
};
export default func;
func.tags = ['MockERC721Receiver'];
func.dependencies = ['HolographGenesis'];
