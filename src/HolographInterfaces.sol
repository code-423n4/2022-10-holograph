/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "./abstract/Admin.sol";
import "./abstract/Initializable.sol";

import "./enum/ChainIdType.sol";
import "./enum/InterfaceType.sol";
import "./enum/TokenUriType.sol";

import "./interface/CollectionURI.sol";
import "./interface/ERC20.sol";
import "./interface/ERC20Burnable.sol";
import "./interface/ERC20Metadata.sol";
import "./interface/ERC20Permit.sol";
import "./interface/ERC20Safer.sol";
import "./interface/ERC165.sol";
import "./interface/ERC721.sol";
import "./interface/ERC721Enumerable.sol";
import "./interface/ERC721Metadata.sol";
import "./interface/ERC721TokenReceiver.sol";
import "./interface/InitializableInterface.sol";
import "./interface/PA1DInterface.sol";

import "./library/Base64.sol";
import "./library/Strings.sol";

/**
 * @title Holograph Interfaces
 * @author https://github.com/holographxyz
 * @notice Get universal Holograph Protocol variables
 * @dev The contract stores a reference of all supported: chains, interfaces, functions, etc.
 */
contract HolographInterfaces is Admin, Initializable {
  /**
   * @dev Internal mapping of all InterfaceType interfaces
   */
  mapping(InterfaceType => mapping(bytes4 => bool)) private _supportedInterfaces;

  /**
   * @dev Internal mapping of all ChainIdType conversions
   */
  mapping(ChainIdType => mapping(uint256 => mapping(ChainIdType => uint256))) private _chainIdMap;

  /**
   * @dev Internal mapping of all TokenUriType prepends
   */
  mapping(TokenUriType => string) private _prependURI;

  /**
   * @dev Constructor is left empty and init is used instead
   */
  constructor() {}

  /**
   * @notice Used internally to initialize the contract instead of through a constructor
   * @dev This function is called by the deployer/factory when creating a contract
   * @param initPayload abi encoded payload to use for contract initilaization
   */
  function init(bytes memory initPayload) external override returns (bytes4) {
    require(!_isInitialized(), "HOLOGRAPH: already initialized");
    address contractAdmin = abi.decode(initPayload, (address));
    assembly {
      sstore(_adminSlot, contractAdmin)
    }
    _setInitialized();
    return InitializableInterface.init.selector;
  }

  /**
   * @notice Get a base64 encoded contract URI JSON string
   * @dev Used to dynamically generate contract JSON payload
   * @param name the name of the smart contract
   * @param imageURL string pointing to the primary contract image, can be: https, ipfs, or ar (arweave)
   * @param externalLink url to website/page related to smart contract
   * @param bps basis points used for specifying royalties percentage
   * @param contractAddress address of the smart contract
   * @return a base64 encoded json string representing the smart contract
   */
  function contractURI(
    string calldata name,
    string calldata imageURL,
    string calldata externalLink,
    uint16 bps,
    address contractAddress
  ) external pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(
            abi.encodePacked(
              '{"name":"',
              name,
              '","description":"',
              name,
              '","image":"',
              imageURL,
              '","external_link":"',
              externalLink,
              '","seller_fee_basis_points":',
              Strings.uint2str(bps),
              ',"fee_recipient":"0x',
              Strings.toAsciiString(contractAddress),
              '"}'
            )
          )
        )
      );
  }

  /**
   * @notice Get the prepend to use for tokenURI
   * @dev Provides the prepend to use with TokenUriType URI
   */
  function getUriPrepend(TokenUriType uriType) external view returns (string memory prepend) {
    prepend = _prependURI[uriType];
  }

  /**
   * @notice Update the tokenURI prepend
   * @param uriType specify which TokenUriType to set for
   * @param prepend the string to use for the prepend
   */
  function updateUriPrepend(TokenUriType uriType, string calldata prepend) external onlyAdmin {
    _prependURI[uriType] = prepend;
  }

  /**
   * @notice Update the tokenURI prepends
   * @param uriTypes specify array of TokenUriTypes to set for
   * @param prepends array string to use for the prepends
   */
  function updateUriPrepends(TokenUriType[] calldata uriTypes, string[] calldata prepends) external onlyAdmin {
    for (uint256 i = 0; i < uriTypes.length; i++) {
      _prependURI[uriTypes[i]] = prepends[i];
    }
  }

  function getChainId(
    ChainIdType fromChainType,
    uint256 fromChainId,
    ChainIdType toChainType
  ) external view returns (uint256 toChainId) {
    return _chainIdMap[fromChainType][fromChainId][toChainType];
  }

  function updateChainIdMap(
    ChainIdType fromChainType,
    uint256 fromChainId,
    ChainIdType toChainType,
    uint256 toChainId
  ) external onlyAdmin {
    _chainIdMap[fromChainType][fromChainId][toChainType] = toChainId;
  }

  function updateChainIdMaps(
    ChainIdType[] calldata fromChainType,
    uint256[] calldata fromChainId,
    ChainIdType[] calldata toChainType,
    uint256[] calldata toChainId
  ) external onlyAdmin {
    uint256 length = fromChainType.length;
    for (uint256 i = 0; i < length; i++) {
      _chainIdMap[fromChainType[i]][fromChainId[i]][toChainType[i]] = toChainId[i];
    }
  }

  function supportsInterface(InterfaceType interfaceType, bytes4 interfaceId) external view returns (bool) {
    return _supportedInterfaces[interfaceType][interfaceId];
  }

  function updateInterface(
    InterfaceType interfaceType,
    bytes4 interfaceId,
    bool supported
  ) external onlyAdmin {
    _supportedInterfaces[interfaceType][interfaceId] = supported;
  }

  function updateInterfaces(
    InterfaceType interfaceType,
    bytes4[] calldata interfaceIds,
    bool supported
  ) external onlyAdmin {
    for (uint256 i = 0; i < interfaceIds.length; i++) {
      _supportedInterfaces[interfaceType][interfaceIds[i]] = supported;
    }
  }

  /**
   * @dev Purposefully reverts to prevent having any type of ether transfered into the contract
   */
  receive() external payable {
    revert();
  }

  /**
   * @dev Purposefully reverts to prevent any calls to undefined functions
   */
  fallback() external payable {
    revert();
  }
}
