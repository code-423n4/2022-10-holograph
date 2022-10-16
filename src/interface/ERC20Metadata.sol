// SPDX-License-Identifier: UNLICENSED

/*SOLIDITY_COMPILER_VERSION*/

interface ERC20Metadata {
  function decimals() external view returns (uint8);

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);
}
