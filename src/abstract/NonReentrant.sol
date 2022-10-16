/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

abstract contract NonReentrant {
  /**
   * @dev bytes32(uint256(keccak256('eip1967.Holograph.reentrant')) - 1)
   */
  bytes32 constant _reentrantSlot = precomputeslot("eip1967.Holograph.reentrant");

  modifier nonReentrant() {
    require(getStatus() != 2, "HOLOGRAPH: reentrant call");
    setStatus(2);
    _;
    setStatus(1);
  }

  constructor() {}

  function getStatus() internal view returns (uint256 status) {
    assembly {
      status := sload(_reentrantSlot)
    }
  }

  function setStatus(uint256 status) internal {
    assembly {
      sstore(_reentrantSlot, status)
    }
  }
}
