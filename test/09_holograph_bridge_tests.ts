describe('Holograph Bridge Contract', async function () {
  it('Should successfully transfer token #3 from L1 to L2');
  it('Should fail if we send a previously success bridge request.');

  describe('init():', async function () {
    it('should successfully init once'); // Validate hardcoded values are correct
    it('should fail to init if already initialized');
  });

  describe('bridgeOutRequest(): ', async function () {
    it('should fail if `toChainId` provided a string');
    it('should fail if `toChainId` provided a value larger than uint32');
    it('should fail if `holographableContract` is not a holographableContract v1');
    it('should fail if `holographableContract` is not a holographableContract v2');
    it('should fail if callData Data param is invalid'); // NOTE: Revert should be "HOLOGRAPH: bridge out failed"
    it('should successfully submit a bridge TX');
  });

  describe(`bridgeInRequest():`, async function () {
    it('should fail if `toChainId` provided a string');
    it('should fail if `toChainId` provided a value larger than uint32');
    it('should fail if `holographableContract` is not a holographableContract v1');
    it('should fail if `holographableContract` is not a holographableContract v2');
    it('should revert if `doNotRevert=false`');
    it('should successfully process a BridgeIn TX');
  });

  describe('revertedBridgeOutRequest()', async function () {
    it('should fail if `toChainId` provided a string');
    it('should fail if `toChainId` provided a value larger than uint32');
    it('should fail if the selector is not a bridgeOut.selector');
    it('should fail with "HOLOGRAPH: unknown error"');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe(`getBridgeOutRequestPayload():`, async function () {
    it('should fail if `toChainId` provided a string');
    it('should fail if `toChainId` provided a value larger than uint32');
    it('should fail if `holographableContract` is not a holographableContract v1');
    it('should fail if `holographableContract` is not a holographableContract v2');
    it(`should fail with dynamic reason (aka the try section fo the code)`);
    it('should successfully get payload given valid parameters on chain A'); // NOTE: check for a specific input and output
    it('should successfully get payload given valid parameters on chain B'); // NOTE: check for a specific input and output
    it('should successfully get payload given valid parameters on chain C'); // NOTE: check for a specific input and output
  });

  describe('Slot values:', async function () {
    describe('factory: ', async function () {
      it('should get expected factory address');
      it('should allow admin wallet to change factory slot');
      it('should fail to allow owner wallet to change factory slot');
      it('should fail to allow NON-admin to change factory slot');
    });

    describe('holograph: ', async function () {
      it('should get expected holograph address');
      it('should allow admin wallet to change holograph slot');
      it('should fail to allow owner wallet to change holograph slot');
      it('should fail to allow NON-admin to change holograph slot');
    });

    describe('operator: ', async function () {
      it('should get expected operator address');
      it('should allow admin wallet to change operator slot');
      it('should fail to allow owner wallet to change operator slot');
      it('should fail to allow NON-admin to change operator slot');
    });

    describe('registry: ', async function () {
      it('should get expected registry address');
      it('should allow admin wallet to change registry slot');
      it('should fail to allow owner wallet to change registry slot');
      it('should fail to allow NON-admin to change registry slot');
    });

    describe('_holograph(): ', async function () {
      it('should fail be be called by admin because fn is private');
      it('should fail be be called by owner because fn is private');
      it('should fail be be called by random user because fn is private');
      it('should fail to allow smart contract to call fn because fn is private');
    });

    describe('_jobNonce(): ', async function () {
      it('should fail be be called by admin because fn is private');
      it('should fail be be called by owner because fn is private');
      it('should fail be be called by random user because fn is private');
      it('should fail to allow smart contract to call fn because fn is private');
    });

    describe('_operator(): ', async function () {
      it('should fail be be called by admin because fn is private');
      it('should fail be be called by owner because fn is private');
      it('should fail be be called by random user because fn is private');
      it('should fail to allow smart contract to call fn because fn is private');
    });

    describe('_registry(): ', async function () {
      it('should fail be be called by admin because fn is private');
      it('should fail be be called by owner because fn is private');
      it('should fail be be called by random user because fn is private');
      it('should fail to allow smart contract to call fn because fn is private');
    });
  });
});
