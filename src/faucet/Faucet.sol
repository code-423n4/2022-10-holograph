/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

import "../abstract/Initializable.sol";
import "../interface/HolographERC20Interface.sol";
import "../interface/InitializableInterface.sol";

contract Faucet is Initializable {
  address public owner;
  HolographERC20Interface public token;

  uint256 public faucetDripAmount = 100 ether;
  uint256 public faucetCooldown = 24 hours;

  mapping(address => uint256) lastAccessTime;

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
    require(!_isInitialized(), "Faucet contract is already initialized");
    (address _contractOwner, address _tokenInstance) = abi.decode(initPayload, (address, address));
    token = HolographERC20Interface(_tokenInstance);
    owner = _contractOwner;
    _setInitialized();
    return InitializableInterface.init.selector;
  }

  /// @notice Get tokens from faucet's own balance. Rate limited.
  function requestTokens() external {
    require(isAllowedToWithdraw(msg.sender), "Come back later");
    require(token.balanceOf(address(this)) >= faucetDripAmount, "Faucet is empty");
    lastAccessTime[msg.sender] = block.timestamp;
    token.transfer(msg.sender, faucetDripAmount);
  }

  /// @notice Update token address
  function setToken(address tokenAddress) external onlyOwner {
    token = HolographERC20Interface(tokenAddress);
  }

  /// @notice Grant tokens to receiver from faucet's own balance. Not rate limited.
  function grantTokens(address _address) external onlyOwner {
    require(token.balanceOf(address(this)) >= faucetDripAmount, "Faucet is empty");
    token.transfer(_address, faucetDripAmount);
  }

  function grantTokens(address _address, uint256 _amountWei) external onlyOwner {
    require(token.balanceOf(address(this)) >= _amountWei, "Insufficient funds");
    token.transfer(_address, _amountWei);
  }

  /// @notice Withdraw all funds from the faucet.
  function withdrawAllTokens(address _receiver) external onlyOwner {
    token.transfer(_receiver, token.balanceOf(address(this)));
  }

  /// @notice Withdraw amount of funds from the faucet. Amount is in wei.
  function withdrawTokens(address _receiver, uint256 _amountWei) external onlyOwner {
    require(token.balanceOf(address(this)) >= _amountWei, "Insufficient funds");
    token.transfer(_receiver, _amountWei);
  }

  /// @notice Configure the time between two drip requests. Time is in seconds.
  function setWithdrawCooldown(uint256 _waitTimeSeconds) external onlyOwner {
    faucetCooldown = _waitTimeSeconds;
  }

  /// @notice Configure the drip request amount. Amount is in wei.
  function setWithdrawAmount(uint256 _amountWei) external onlyOwner {
    faucetDripAmount = _amountWei;
  }

  /// @notice Check whether an address can request drip and is not on cooldown.
  function isAllowedToWithdraw(address _address) public view returns (bool) {
    if (lastAccessTime[_address] == 0) {
      return true;
    } else if (block.timestamp >= lastAccessTime[_address] + faucetCooldown) {
      return true;
    }
    return false;
  }

  /// @notice Get the last time the address withdrew tokens.
  function getLastAccessTime(address _address) public view returns (uint256) {
    return lastAccessTime[_address];
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
  }
}
