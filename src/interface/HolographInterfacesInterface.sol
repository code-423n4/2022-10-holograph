/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../enum/ChainIdType.sol";
import "../enum/InterfaceType.sol";
import "../enum/TokenUriType.sol";

interface HolographInterfacesInterface {
  function contractURI(
    string calldata name,
    string calldata imageURL,
    string calldata externalLink,
    uint16 bps,
    address contractAddress
  ) external pure returns (string memory);

  function getUriPrepend(TokenUriType uriType) external view returns (string memory prepend);

  function updateUriPrepend(TokenUriType uriType, string calldata prepend) external;

  function updateUriPrepends(TokenUriType[] calldata uriTypes, string[] calldata prepends) external;

  function getChainId(
    ChainIdType fromChainType,
    uint256 fromChainId,
    ChainIdType toChainType
  ) external view returns (uint256 toChainId);

  function updateChainIdMap(
    ChainIdType fromChainType,
    uint256 fromChainId,
    ChainIdType toChainType,
    uint256 toChainId
  ) external;

  function updateChainIdMaps(
    ChainIdType[] calldata fromChainType,
    uint256[] calldata fromChainId,
    ChainIdType[] calldata toChainType,
    uint256[] calldata toChainId
  ) external;

  function supportsInterface(InterfaceType interfaceType, bytes4 interfaceId) external view returns (bool);

  function updateInterface(
    InterfaceType interfaceType,
    bytes4 interfaceId,
    bool supported
  ) external;

  function updateInterfaces(
    InterfaceType interfaceType,
    bytes4[] calldata interfaceIds,
    bool supported
  ) external;
}
