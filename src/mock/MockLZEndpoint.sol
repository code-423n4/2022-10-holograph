/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/Admin.sol";

import "../interface/LayerZeroOverrides.sol";

contract MockLZEndpoint is Admin {
  event LzEvent(uint16 _dstChainId, bytes _destination, bytes _payload);

  constructor() {
    assembly {
      sstore(_adminSlot, origin())
    }
  }

  function send(
    uint16 _dstChainId,
    bytes calldata _destination,
    bytes calldata _payload,
    address payable, /* _refundAddress*/
    address, /* _zroPaymentAddress*/
    bytes calldata /* _adapterParams*/
  ) external payable {
    // we really don't care about anything and just emit an event that we can leverage for multichain replication
    emit LzEvent(_dstChainId, _destination, _payload);
  }

  function estimateFees(
    uint16,
    address,
    bytes calldata,
    bool,
    bytes calldata
  ) external pure returns (uint256 nativeFee, uint256 zroFee) {
    nativeFee = 10**15;
    zroFee = 10**7;
  }

  function defaultSendLibrary() external view returns (address) {
    return address(this);
  }

  function getAppConfig(uint16, address) external view returns (LayerZeroOverrides.ApplicationConfiguration memory) {
    return LayerZeroOverrides.ApplicationConfiguration(0, 0, address(this), 0, 0, address(this));
  }

  function dstPriceLookup(uint16) external pure returns (uint128 dstPriceRatio, uint128 dstGasPriceInWei) {
    dstPriceRatio = 10**10;
    dstGasPriceInWei = 1000000000;
  }

  function dstConfigLookup(uint16, uint16)
    external
    pure
    returns (
      uint128 dstNativeAmtCap,
      uint64 baseGas,
      uint64 gasPerByte
    )
  {
    dstNativeAmtCap = 10**18;
    baseGas = 50000;
    gasPerByte = 25;
  }
}
