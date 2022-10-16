/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "./ZoraDecimal.sol";

struct ZoraBidShares {
  // % of sale value that goes to the _previous_ owner of the nft
  ZoraDecimal prevOwner;
  // % of sale value that goes to the original creator of the nft
  ZoraDecimal creator;
  // % of sale value that goes to the seller (current owner) of the nft
  ZoraDecimal owner;
}
