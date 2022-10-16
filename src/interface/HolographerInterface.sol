/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

interface HolographerInterface {
  function getDeploymentBlock() external view returns (address holograph);

  function getHolograph() external view returns (address holograph);

  function getHolographEnforcer() external view returns (address);

  function getOriginChain() external view returns (uint32 originChain);

  function getSourceContract() external view returns (address sourceContract);
}
