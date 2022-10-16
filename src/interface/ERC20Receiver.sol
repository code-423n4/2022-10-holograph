// SPDX-License-Identifier: UNLICENSED

/*SOLIDITY_COMPILER_VERSION*/

interface ERC20Receiver {
  function onERC20Received(
    address account,
    address recipient,
    uint256 amount,
    bytes memory data
  ) external returns (bytes4);
}
