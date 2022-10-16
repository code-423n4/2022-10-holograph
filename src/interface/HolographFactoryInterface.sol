/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../struct/DeploymentConfig.sol";
import "../struct/Verification.sol";

/**
 * @title Holograph Factory
 * @author https://github.com/holographxyz
 * @notice Deploy holographable contracts
 * @dev The contract provides methods that allow for the creation of Holograph Protocol compliant smart contracts, that are capable of minting holographable assets
 */
interface HolographFactoryInterface {
  /**
   * @dev This event is fired every time that a bridgeable contract is deployed.
   */
  event BridgeableContractDeployed(address indexed contractAddress, bytes32 indexed hash);

  /**
   * @notice Deploy a holographable smart contract
   * @dev Using this function allows to deploy smart contracts that have the same address across all EVM chains
   * @param config contract deployement configurations
   * @param signature that was created by the wallet that created the original payload
   * @param signer address of wallet that created the payload
   */
  function deployHolographableContract(
    DeploymentConfig memory config,
    Verification memory signature,
    address signer
  ) external;

  /**
   * @notice Get the Holograph Protocol contract
   * @dev Used for storing a reference to all the primary modules and variables of the protocol
   */
  function getHolograph() external view returns (address holograph);

  /**
   * @notice Update the Holograph Protocol contract address
   * @param holograph address of the Holograph Protocol smart contract to use
   */
  function setHolograph(address holograph) external;

  /**
   * @notice Get the Holograph Registry module
   * @dev This module stores a reference for all deployed holographable smart contracts
   */
  function getRegistry() external view returns (address registry);

  /**
   * @notice Update the Holograph Registry module address
   * @param registry address of the Holograph Registry smart contract to use
   */
  function setRegistry(address registry) external;
}
