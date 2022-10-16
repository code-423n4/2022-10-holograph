/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/Admin.sol";
import "../abstract/Initializable.sol";

import "../interface/HolographInterface.sol";
import "../interface/HolographerInterface.sol";
import "../interface/HolographRegistryInterface.sol";
import "../interface/InitializableInterface.sol";

/**
 * @dev This contract is a binder. It puts together all the variables to make the underlying contracts functional and be bridgeable.
 */
contract Holographer is Admin, Initializable, HolographerInterface {
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.originChain')) - 1)
   */
  bytes32 constant _originChainSlot = precomputeslot("eip1967.Holograph.originChain");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.holograph')) - 1)
   */
  bytes32 constant _holographSlot = precomputeslot("eip1967.Holograph.holograph");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.contractType')) - 1)
   */
  bytes32 constant _contractTypeSlot = precomputeslot("eip1967.Holograph.contractType");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.sourceContract')) - 1)
   */
  bytes32 constant _sourceContractSlot = precomputeslot("eip1967.Holograph.sourceContract");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.blockHeight')) - 1)
   */
  bytes32 constant _blockHeightSlot = precomputeslot("eip1967.Holograph.blockHeight");

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
    require(!_isInitialized(), "HOLOGRAPHER: already initialized");
    (bytes memory encoded, bytes memory initCode) = abi.decode(initPayload, (bytes, bytes));
    (uint32 originChain, address holograph, bytes32 contractType, address sourceContract) = abi.decode(
      encoded,
      (uint32, address, bytes32, address)
    );
    assembly {
      sstore(_adminSlot, caller())
      sstore(_blockHeightSlot, number())
      sstore(_contractTypeSlot, contractType)
      sstore(_holographSlot, holograph)
      sstore(_originChainSlot, originChain)
      sstore(_sourceContractSlot, sourceContract)
    }
    (bool success, bytes memory returnData) = HolographRegistryInterface(HolographInterface(holograph).getRegistry())
      .getReservedContractTypeAddress(contractType)
      .delegatecall(abi.encodeWithSignature("init(bytes)", initCode));
    bytes4 selector = abi.decode(returnData, (bytes4));
    require(success && selector == InitializableInterface.init.selector, "initialization failed");
    _setInitialized();
    return InitializableInterface.init.selector;
  }

  /**
   * @dev Returns the block height of when the smart contract was deployed. Useful for retrieving deployment config for re-deployment on other EVM-compatible chains.
   */
  function getDeploymentBlock() external view returns (address holograph) {
    assembly {
      holograph := sload(_blockHeightSlot)
    }
  }

  /**
   * @dev Returns a hardcoded address for the Holograph smart contract.
   */
  function getHolograph() external view returns (address holograph) {
    assembly {
      holograph := sload(_holographSlot)
    }
  }

  /**
   * @dev Returns a hardcoded address for the Holograph smart contract that controls and enforces the ERC standards.
   */
  function getHolographEnforcer() public view returns (address) {
    HolographInterface holograph;
    bytes32 contractType;
    assembly {
      holograph := sload(_holographSlot)
      contractType := sload(_contractTypeSlot)
    }
    return HolographRegistryInterface(holograph.getRegistry()).getReservedContractTypeAddress(contractType);
  }

  /**
   * @dev Returns the original chain that contract was deployed on.
   */
  function getOriginChain() external view returns (uint32 originChain) {
    assembly {
      originChain := sload(_originChainSlot)
    }
  }

  /**
   * @dev Returns a hardcoded address for the custom secure storage contract deployed in parallel with this contract deployment.
   */
  function getSourceContract() external view returns (address sourceContract) {
    assembly {
      sourceContract := sload(_sourceContractSlot)
    }
  }

  /**
   * @dev Purposefully left empty, to prevent running out of gas errors when receiving native token payments.
   */
  receive() external payable {}

  /**
   * @dev This takes the Enforcer's source code, runs it, and uses current address for storage slots.
   */
  fallback() external payable {
    address holographEnforcer = getHolographEnforcer();
    assembly {
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), holographEnforcer, 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }
}
