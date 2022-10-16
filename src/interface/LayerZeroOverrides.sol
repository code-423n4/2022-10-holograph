/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

interface LayerZeroOverrides {
  // @dev defaultAppConfig struct
  struct ApplicationConfiguration {
    uint16 inboundProofLibraryVersion;
    uint64 inboundBlockConfirmations;
    address relayer;
    uint16 outboundProofType;
    uint64 outboundBlockConfirmations;
    address oracle;
  }

  struct DstPrice {
    uint128 dstPriceRatio; // 10^10
    uint128 dstGasPriceInWei;
  }

  struct DstConfig {
    uint128 dstNativeAmtCap;
    uint64 baseGas;
    uint64 gasPerByte;
  }

  // @dev using this to retrieve UltraLightNodeV2 address
  function defaultSendLibrary() external view returns (address);

  // @dev using this to extract defaultAppConfig
  function getAppConfig(uint16 destinationChainId, address userApplicationAddress)
    external
    view
    returns (ApplicationConfiguration memory);

  // @dev using this to extract defaultAppConfig directly from storage slot
  function defaultAppConfig(uint16 destinationChainId)
    external
    view
    returns (
      uint16 inboundProofLibraryVersion,
      uint64 inboundBlockConfirmations,
      address relayer,
      uint16 outboundProofType,
      uint64 outboundBlockConfirmations,
      address oracle
    );

  // @dev access the mapping to get base price fee
  function dstPriceLookup(uint16 destinationChainId)
    external
    view
    returns (uint128 dstPriceRatio, uint128 dstGasPriceInWei);

  // @dev access the mapping to get base gas and gas per byte
  function dstConfigLookup(uint16 destinationChainId, uint16 outboundProofType)
    external
    view
    returns (
      uint128 dstNativeAmtCap,
      uint64 baseGas,
      uint64 gasPerByte
    );

  // @dev send message to LayerZero Endpoint
  function send(
    uint16 _dstChainId,
    bytes calldata _destination,
    bytes calldata _payload,
    address payable _refundAddress,
    address _zroPaymentAddress,
    bytes calldata _adapterParams
  ) external payable;

  // @dev estimate LayerZero message cost
  function estimateFees(
    uint16 _dstChainId,
    address _userApplication,
    bytes calldata _payload,
    bool _payInZRO,
    bytes calldata _adapterParam
  ) external view returns (uint256 nativeFee, uint256 zroFee);
}
