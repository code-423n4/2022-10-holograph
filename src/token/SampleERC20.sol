/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/StrictERC20H.sol";

import "../interface/HolographERC20Interface.sol";

/**
 * @title Sample ERC-20 token that is bridgeable via Holograph
 * @author CXIP-Labs
 * @notice A smart contract for minting and managing Holograph Bridgeable ERC20 Tokens.
 * @dev The entire logic and functionality of the smart contract is self-contained.
 */
contract SampleERC20 is StrictERC20H {
  /**
   * @dev Just a dummy value for now to test transferring of data.
   */
  mapping(address => bytes32) private _walletSalts;

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
   * @dev Sample mint where anyone can mint any amounts of tokens.
   */
  function mint(address to, uint256 amount) external onlyHolographer onlyOwner {
    HolographERC20Interface(holographer()).sourceMint(to, amount);
    if (_walletSalts[to] == bytes32(0)) {
      _walletSalts[to] = keccak256(
        abi.encodePacked(to, amount, block.timestamp, block.number, blockhash(block.number - 1))
      );
    }
  }

  function bridgeIn(
    uint32, /* _chainId*/
    address, /* _from*/
    address _to,
    uint256, /* _amount*/
    bytes calldata _data
  ) external override onlyHolographer returns (bool) {
    bytes32 salt = abi.decode(_data, (bytes32));
    _walletSalts[_to] = salt;
    return true;
  }

  function bridgeOut(
    uint32, /* _chainId*/
    address, /* _from*/
    address _to,
    uint256 /* _amount*/
  ) external override onlyHolographer returns (bytes memory _data) {
    _dummy = false;
    _data = abi.encode(_walletSalts[_to]);
  }
}
