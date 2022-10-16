describe('Holograph Interfaces Contract', async function () {
  describe('constructor', async function () {
    it('should successfully deploy');
  });

  describe('init()', async function () {
    it('should successfully be initialized once'); // Validate hardcoded values are correct
    it('should fail if already initialized');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe(`contractURI()`, async function () {
    it('should successfully get contract URI');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe(`getUriPrepend()`, async function () {
    it('should get expected prepend value');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe('updateUriPrepend(uriTypes,string)', async function () {
    it('should allow admin to alter _prependURI');
    it('should fail to allow owner to alter _prependURI');
    it('should fail to allow non-owner to alter _prependURI');
  });

  describe('updateUriPrepends(uriTypes, string[])', async function () {
    it('should allow admin to alter _prependURI');
    it('should fail to allow owner to alter _prependURI');
    it('should fail to allow non-owner to alter _prependURI');
  });

  describe(`getChainId()`, async function () {
    it('should get expected toChainId value');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe('updateChainIdMap()', async function () {
    it('should allow admin to alter _chainIdMap');
    it('should fail to allow owner to alter _chainIdMap');
    it('should fail to allow non-owner to alter _chainIdMap');
  });

  describe(`supportsInterface()`, async function () {
    it('should get expected _supportedInterfaces value');
    it('Should allow external contract to call fn');
    it('should fail to allow inherited contract to call fn');
  });

  describe('updateInterface()', async function () {
    it('should allow admin to alter _supportedInterfaces');
    it('should fail to allow owner to alter _supportedInterfaces');
    it('should fail to allow non-owner to alter _supportedInterfaces');
  });

  describe('updateInterfaces()', async function () {
    it('should allow admin to alter _supportedInterfaces');
    it('should fail to allow owner to alter _supportedInterfaces');
    it('should fail to allow non-owner to alter _supportedInterfaces');
  });

  describe(`receive()`, async function () {
    it('should revert');
  });

  describe(`fallback()`, async function () {
    it('should revert');
  });
});
