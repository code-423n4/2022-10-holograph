/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/Admin.sol";
import "../abstract/Initializable.sol";

import "../interface/InitializableInterface.sol";
import "../interface/HolographRegistryInterface.sol";

contract CxipERC721Proxy is Admin, Initializable {
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.contractType')) - 1)
   */
  bytes32 constant _contractTypeSlot = precomputeslot("eip1967.Holograph.contractType");
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.registry')) - 1)
   */
  bytes32 constant _registrySlot = precomputeslot("eip1967.Holograph.registry");

  constructor() {}

  function init(bytes memory data) external override returns (bytes4) {
    require(!_isInitialized(), "HOLOGRAPH: already initialized");
    (bytes32 contractType, address registry, bytes memory initCode) = abi.decode(data, (bytes32, address, bytes));
    assembly {
      sstore(_contractTypeSlot, contractType)
      sstore(_registrySlot, registry)
    }
    (bool success, bytes memory returnData) = getCxipERC721Source().delegatecall(
      abi.encodeWithSignature("init(bytes)", initCode)
    );
    bytes4 selector = abi.decode(returnData, (bytes4));
    require(success && selector == InitializableInterface.init.selector, "initialization failed");

    _setInitialized();
    return InitializableInterface.init.selector;
  }

  function getCxipERC721Source() public view returns (address) {
    HolographRegistryInterface registry;
    bytes32 contractType;
    assembly {
      registry := sload(_registrySlot)
      contractType := sload(_contractTypeSlot)
    }
    return registry.getContractTypeAddress(contractType);
  }

  receive() external payable {}

  fallback() external payable {
    address cxipErc721Source = getCxipERC721Source();
    assembly {
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), cxipErc721Source, 0, calldatasize(), 0, 0)
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
