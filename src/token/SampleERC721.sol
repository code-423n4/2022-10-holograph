/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/StrictERC721H.sol";

import "../interface/HolographERC721Interface.sol";

/**
 * @title Sample ERC-721 Collection that is bridgeable via Holograph
 * @author CXIP-Labs
 * @notice A smart contract for minting and managing Holograph Bridgeable ERC721 NFTs.
 * @dev The entire logic and functionality of the smart contract is self-contained.
 */
contract SampleERC721 is StrictERC721H {
  /**
   * @dev Mapping of all token URIs.
   */
  mapping(uint256 => string) private _tokenURIs;

  /**
   * @dev Internal reference used for minting incremental token ids.
   */
  uint224 private _currentTokenId;

  /**
   * @dev Temporary implementation to suppress compiler state mutability warnings.
   */
  bool private _dummy;

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
    // do your own custom logic here
    address contractOwner = abi.decode(initPayload, (address));
    _setOwner(contractOwner);
    // run underlying initializer logic
    return _init(initPayload);
  }

  /**
   * @notice Get's the URI of the token.
   * @dev Defaults the the Arweave URI
   * @return string The URI.
   */
  function tokenURI(uint256 _tokenId) external view onlyHolographer returns (string memory) {
    return _tokenURIs[_tokenId];
  }

  /**
   * @dev Sample mint where anyone can mint specific token, with a custom URI
   */
  function mint(
    address to,
    uint224 tokenId,
    string calldata URI
  ) external onlyHolographer onlyOwner {
    HolographERC721Interface H721 = HolographERC721Interface(holographer());
    if (tokenId == 0) {
      _currentTokenId += 1;
      while (H721.exists(uint256(_currentTokenId)) || H721.burned(uint256(_currentTokenId))) {
        _currentTokenId += 1;
      }
      tokenId = _currentTokenId;
    }
    H721.sourceMint(to, tokenId);
    uint256 id = H721.sourceGetChainPrepend() + uint256(tokenId);
    _tokenURIs[id] = URI;
  }

  function bridgeIn(
    uint32, /* _chainId*/
    address, /* _from*/
    address, /* _to*/
    uint256 _tokenId,
    bytes calldata _data
  ) external override onlyHolographer returns (bool) {
    string memory URI = abi.decode(_data, (string));
    _tokenURIs[_tokenId] = URI;
    return true;
  }

  function bridgeOut(
    uint32, /* _chainId*/
    address, /* _from*/
    address, /* _to*/
    uint256 _tokenId
  ) external override onlyHolographer returns (bytes memory _data) {
    _dummy = false;
    _data = abi.encode(_tokenURIs[_tokenId]);
  }

  function afterBurn(
    address, /* _owner*/
    uint256 _tokenId
  ) external override onlyHolographer returns (bool) {
    delete _tokenURIs[_tokenId];
    return true;
  }
}
