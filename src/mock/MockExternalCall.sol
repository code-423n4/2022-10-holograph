/*HOLOGRAPH_LICENSE_HEADER*/

/*SOLIDITY_COMPILER_VERSION*/

contract MockExternalCall {
  function callExternalFn(address contractAddress, bytes calldata encodedSignature) public {
    (bool success, ) = address(contractAddress).call(encodedSignature);
    require(success, "Failed");
  }
}
