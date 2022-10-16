/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

interface CrossChainMessageInterface {
  function send(
    uint256 gasLimit,
    uint256 gasPrice,
    uint32 toChain,
    address msgSender,
    uint256 msgValue,
    bytes calldata crossChainPayload
  ) external payable;

  function getMessageFee(
    uint32 toChain,
    uint256 gasLimit,
    uint256 gasPrice,
    bytes calldata crossChainPayload
  ) external view returns (uint256 hlgFee, uint256 msgFee);

  function getHlgFee(
    uint32 toChain,
    uint256 gasLimit,
    uint256 gasPrice
  ) external view returns (uint256 hlgFee);
}
