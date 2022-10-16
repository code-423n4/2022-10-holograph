/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/ERC20H.sol";

import "../interface/ERC20.sol";
import "../interface/HolographERC20Interface.sol";
import "../interface/HolographInterface.sol";
import "../interface/HolographerInterface.sol";

/**
 * @title Holograph Utility Token.
 * @author CXIP-Labs
 * @notice A smart contract for minting and managing Holograph's ERC20 Utility Tokens.
 * @dev The entire logic and functionality of the smart contract is self-contained.
 */
contract HolographUtilityToken is ERC20H {
  /**
   * @dev Constructor is left empty and init is used instead
   */
  constructor() {}

  /**
   * @notice Used internally to initialize the contract instead of through a constructor
   * @dev This function is called by the deployer/factory when creating a contract
   * @param initPayload abi encoded payload to use for contract initilaization
   */
  function init(bytes memory initPayload) external override returns (bytes4) {
    address contractOwner = abi.decode(initPayload, (address));
    _setOwner(contractOwner);
    HolographERC20Interface(msg.sender).sourceMint(contractOwner, 10000000 * (10**18));
    // run underlying initializer logic
    return _init(initPayload);
  }
}
