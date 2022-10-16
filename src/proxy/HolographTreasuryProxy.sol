/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/Admin.sol";
import "../abstract/Initializable.sol";

import "../interface/InitializableInterface.sol";

contract HolographTreasuryProxy is Admin, Initializable {
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.treasury')) - 1)
   */
  bytes32 constant _treasurySlot = precomputeslot("eip1967.Holograph.treasury");

  constructor() {}

  function init(bytes memory data) external override returns (bytes4) {
    require(!_isInitialized(), "HOLOGRAPH: already initialized");
    (address treasury, bytes memory initCode) = abi.decode(data, (address, bytes));
    assembly {
      sstore(_adminSlot, origin())
      sstore(_treasurySlot, treasury)
    }
    (bool success, bytes memory returnData) = treasury.delegatecall(abi.encodeWithSignature("init(bytes)", initCode));
    bytes4 selector = abi.decode(returnData, (bytes4));
    require(success && selector == InitializableInterface.init.selector, "initialization failed");
    _setInitialized();
    return InitializableInterface.init.selector;
  }

  function getTreasury() external view returns (address treasury) {
    assembly {
      treasury := sload(_treasurySlot)
    }
  }

  function setTreasury(address treasury) external onlyAdmin {
    assembly {
      sstore(_treasurySlot, treasury)
    }
  }

  receive() external payable {}

  fallback() external payable {
    assembly {
      let treasury := sload(_treasurySlot)
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), treasury, 0, calldatasize(), 0, 0)
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
