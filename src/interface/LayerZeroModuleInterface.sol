/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

interface LayerZeroModuleInterface {
  function lzReceive(
    uint16 _srcChainId,
    bytes calldata _srcAddress,
    uint64 _nonce,
    bytes calldata _payload
  ) external payable;

  function getInterfaces() external view returns (address interfaces);

  function setInterfaces(address interfaces) external;

  function getLZEndpoint() external view returns (address lZEndpoint);

  function setLZEndpoint(address lZEndpoint) external;

  function getOperator() external view returns (address operator);

  function setOperator(address operator) external;
}
