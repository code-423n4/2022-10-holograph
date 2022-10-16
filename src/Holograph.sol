/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "./abstract/Admin.sol";
import "./abstract/Initializable.sol";

import "./interface/InitializableInterface.sol";
import "./interface/HolographInterface.sol";

/**
 * @title Holograph Protocol
 * @author https://github.com/holographxyz
 * @notice This is the primary Holograph Protocol smart contract
 * @dev This contract stores a reference to all the primary modules and variables of the protocol
 */
contract Holograph is Admin, Initializable, HolographInterface {
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.bridge')) - 1)
   */
  bytes32 constant _bridgeSlot = precomputeslot("eip1967.Holograph.bridge");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.chainId')) - 1)
   */
  bytes32 constant _chainIdSlot = precomputeslot("eip1967.Holograph.chainId");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.factory')) - 1)
   */
  bytes32 constant _factorySlot = precomputeslot("eip1967.Holograph.factory");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.holographChainId')) - 1)
   */
  bytes32 constant _holographChainIdSlot = precomputeslot("eip1967.Holograph.holographChainId");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.interfaces')) - 1)
   */
  bytes32 constant _interfacesSlot = precomputeslot("eip1967.Holograph.interfaces");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.operator')) - 1)
   */
  bytes32 constant _operatorSlot = precomputeslot("eip1967.Holograph.operator");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.registry')) - 1)
   */
  bytes32 constant _registrySlot = precomputeslot("eip1967.Holograph.registry");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.treasury')) - 1)
   */
  bytes32 constant _treasurySlot = precomputeslot("eip1967.Holograph.treasury");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.utilityToken')) - 1)
   */
  bytes32 constant _utilityTokenSlot = precomputeslot("eip1967.Holograph.utilityToken");

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
    require(!_isInitialized(), "HOLOGRAPH: already initialized");
    (
      uint32 holographChainId,
      address bridge,
      address factory,
      address interfaces,
      address operator,
      address registry,
      address treasury,
      address utilityToken
    ) = abi.decode(initPayload, (uint32, address, address, address, address, address, address, address));
    assembly {
      sstore(_adminSlot, origin())
      sstore(_chainIdSlot, chainid())
      sstore(_holographChainIdSlot, holographChainId)
      sstore(_bridgeSlot, bridge)
      sstore(_factorySlot, factory)
      sstore(_interfacesSlot, interfaces)
      sstore(_operatorSlot, operator)
      sstore(_registrySlot, registry)
      sstore(_treasurySlot, treasury)
      sstore(_utilityTokenSlot, utilityToken)
    }
    _setInitialized();
    return InitializableInterface.init.selector;
  }

  /**
   * @notice Get the address of the Holograph Bridge module
   * @dev Used for beaming holographable assets cross-chain
   */
  function getBridge() external view returns (address bridge) {
    assembly {
      bridge := sload(_bridgeSlot)
    }
  }

  /**
   * @notice Update the Holograph Bridge module address
   * @param bridge address of the Holograph Bridge smart contract to use
   */
  function setBridge(address bridge) external onlyAdmin {
    assembly {
      sstore(_bridgeSlot, bridge)
    }
  }

  /**
   * @notice Get the chain ID that the Protocol was deployed on
   * @dev Useful for checking if/when a hard fork occurs
   */
  function getChainId() external view returns (uint256 chainId) {
    assembly {
      chainId := sload(_chainIdSlot)
    }
  }

  /**
   * @notice Update the chain ID
   * @dev Useful for updating once a hard fork has been mitigated
   * @param chainId EVM chain ID to use
   */
  function setChainId(uint256 chainId) external onlyAdmin {
    assembly {
      sstore(_chainIdSlot, chainId)
    }
  }

  /**
   * @notice Get the address of the Holograph Factory module
   * @dev Used for deploying holographable smart contracts
   */
  function getFactory() external view returns (address factory) {
    assembly {
      factory := sload(_factorySlot)
    }
  }

  /**
   * @notice Update the Holograph Factory module address
   * @param factory address of the Holograph Factory smart contract to use
   */
  function setFactory(address factory) external onlyAdmin {
    assembly {
      sstore(_factorySlot, factory)
    }
  }

  /**
   * @notice Get the Holograph chain Id
   * @dev Holograph uses an internal chain id mapping
   */
  function getHolographChainId() external view returns (uint32 holographChainId) {
    assembly {
      holographChainId := sload(_holographChainIdSlot)
    }
  }

  /**
   * @notice Update the Holograph chain ID
   * @dev Useful for updating once a hard fork was mitigated
   * @param holographChainId Holograph chain ID to use
   */
  function setHolographChainId(uint32 holographChainId) external onlyAdmin {
    assembly {
      sstore(_holographChainIdSlot, holographChainId)
    }
  }

  /**
   * @notice Get the address of the Holograph Interfaces module
   * @dev Holograph uses this contract to store data that needs to be accessed by a large portion of the modules
   */
  function getInterfaces() external view returns (address interfaces) {
    assembly {
      interfaces := sload(_interfacesSlot)
    }
  }

  /**
   * @notice Update the Holograph Interfaces module address
   * @param interfaces address of the Holograph Interfaces smart contract to use
   */
  function setInterfaces(address interfaces) external onlyAdmin {
    assembly {
      sstore(_interfacesSlot, interfaces)
    }
  }

  /**
   * @notice Get the address of the Holograph Operator module
   * @dev All cross-chain Holograph Bridge beams are handled by the Holograph Operator module
   */
  function getOperator() external view returns (address operator) {
    assembly {
      operator := sload(_operatorSlot)
    }
  }

  /**
   * @notice Update the Holograph Operator module address
   * @param operator address of the Holograph Operator smart contract to use
   */
  function setOperator(address operator) external onlyAdmin {
    assembly {
      sstore(_operatorSlot, operator)
    }
  }

  /**
   * @notice Get the Holograph Registry module
   * @dev This module stores a reference for all deployed holographable smart contracts
   */
  function getRegistry() external view returns (address registry) {
    assembly {
      registry := sload(_registrySlot)
    }
  }

  /**
   * @notice Update the Holograph Registry module address
   * @param registry address of the Holograph Registry smart contract to use
   */
  function setRegistry(address registry) external onlyAdmin {
    assembly {
      sstore(_registrySlot, registry)
    }
  }

  /**
   * @notice Get the Holograph Treasury module
   * @dev All of the Holograph Protocol assets are stored and managed by this module
   */
  function getTreasury() external view returns (address treasury) {
    assembly {
      treasury := sload(_treasurySlot)
    }
  }

  /**
   * @notice Update the Holograph Treasury module address
   * @param treasury address of the Holograph Treasury smart contract to use
   */
  function setTreasury(address treasury) external onlyAdmin {
    assembly {
      sstore(_treasurySlot, treasury)
    }
  }

  /**
   * @notice Get the Holograph Utility Token address
   * @dev This is the official utility token of the Holograph Protocol
   */
  function getUtilityToken() external view returns (address utilityToken) {
    assembly {
      utilityToken := sload(_utilityTokenSlot)
    }
  }

  /**
   * @notice Update the Holograph Utility Token address
   * @param utilityToken address of the Holograph Utility Token smart contract to use
   */
  function setUtilityToken(address utilityToken) external onlyAdmin {
    assembly {
      sstore(_utilityTokenSlot, utilityToken)
    }
  }

  /**
   * @dev Purposefully reverts to prevent having any type of ether transfered into the contract
   */
  receive() external payable {
    revert();
  }

  /**
   * @dev Purposefully reverts to prevent any calls to undefined functions
   */
  fallback() external payable {
    revert();
  }
}
