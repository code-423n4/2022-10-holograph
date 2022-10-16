// SPDX-License-Identifier: UNLICENSED

/*SOLIDITY_COMPILER_VERSION*/

interface ERC20Burnable {
  function burn(uint256 amount) external;

  function burnFrom(address account, uint256 amount) external returns (bool);
}
