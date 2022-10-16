/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "./CollectionURI.sol";
import "./ERC165.sol";
import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";
import "./ERC721TokenReceiver.sol";
import "./Holographable.sol";

interface HolographERC721Interface is
  ERC165,
  ERC721,
  ERC721Enumerable,
  ERC721Metadata,
  ERC721TokenReceiver,
  CollectionURI,
  Holographable
{
  function approve(address to, uint256 tokenId) external payable;

  function burn(uint256 tokenId) external;

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) external payable;

  function setApprovalForAll(address to, bool approved) external;

  function sourceBurn(uint256 tokenId) external;

  function sourceMint(address to, uint224 tokenId) external;

  function sourceGetChainPrepend() external view returns (uint256);

  function sourceTransfer(address to, uint256 tokenId) external;

  function transfer(address to, uint256 tokenId) external payable;

  function contractURI() external view returns (string memory);

  function getApproved(uint256 tokenId) external view returns (address);

  function isApprovedForAll(address wallet, address operator) external view returns (bool);

  function name() external view returns (string memory);

  function burned(uint256 tokenId) external view returns (bool);

  function decimals() external pure returns (uint256);

  function exists(uint256 tokenId) external view returns (bool);

  function ownerOf(uint256 tokenId) external view returns (address);

  function supportsInterface(bytes4 interfaceId) external view returns (bool);

  function symbol() external view returns (string memory);

  function tokenByIndex(uint256 index) external view returns (uint256);

  function tokenOfOwnerByIndex(address wallet, uint256 index) external view returns (uint256);

  function tokensOfOwner(address wallet) external view returns (uint256[] memory);

  function tokenURI(uint256 tokenId) external view returns (string memory);

  function totalSupply() external view returns (uint256);
}
