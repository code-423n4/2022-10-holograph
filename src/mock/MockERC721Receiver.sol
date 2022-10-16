/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../interface/ERC721.sol";
import "../interface/ERC165.sol";
import "../interface/ERC721TokenReceiver.sol";

contract MockERC721Receiver is ERC165, ERC721TokenReceiver {
  bool private _works;

  constructor() {
    _works = true;
  }

  function toggleWorks(bool active) external {
    _works = active;
  }

  function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
    if (interfaceID == 0x01ffc9a7 || interfaceID == 0x150b7a02) {
      return true;
    } else {
      return false;
    }
  }

  function onERC721Received(
    address, /*operator*/
    address, /*from*/
    uint256, /*tokenId*/
    bytes calldata /*data*/
  ) external view returns (bytes4) {
    if (_works) {
      return 0x150b7a02;
    } else {
      return 0x00000000;
    }
  }

  function transferNFT(
    address payable token,
    uint256 tokenId,
    address to
  ) external {
    ERC721(token).safeTransferFrom(address(this), to, tokenId);
  }
}
