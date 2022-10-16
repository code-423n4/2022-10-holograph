/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

interface Ownable {
  function owner() external view returns (address);

  function isOwner() external view returns (bool);

  function isOwner(address wallet) external view returns (bool);
}
