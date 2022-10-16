import { expect } from 'chai';
import { ethers } from 'hardhat';

import { ERC721H, MockExternalCall, MockExternalCall__factory } from '../typechain-types';
import { functionHash, generateInitCode } from '../scripts/utils/helpers';
import setup, { PreTest } from './utils';
import { HOLOGRAPHER_ALREADY_INITIALIZED_ERROR_MSG } from './utils/error_constants';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('ERC721H Contract', async function () {
  let erc721H: ERC721H;
  let l1: PreTest;
  let mockExternalCall: MockExternalCall;

  before(async function () {
    l1 = await setup();
    erc721H = await ethers.getContractAt('ERC721H', l1.sampleErc721Holographer.address);
    const mockExternalCallFactory = await ethers.getContractFactory<MockExternalCall__factory>('MockExternalCall');
    mockExternalCall = await mockExternalCallFactory.deploy();
    await mockExternalCall.deployed();
  });

  async function testExternalCallToFunction(fnAbi: string, fnName: string, args: any[] = []) {
    const ABI = [fnAbi];
    const iface = new ethers.utils.Interface(ABI);
    const encodedFunctionData = iface.encodeFunctionData(fnName, args);
    await expect(mockExternalCall.connect(l1.deployer).callExternalFn(erc721H.address, encodedFunctionData)).to.not.be
      .reverted;
  }

  function testPrivateFunction(functionName: string, user?: SignerWithAddress) {
    const sender = user ?? l1.deployer;
    const contract = erc721H.connect(sender) as any;
    const method = contract[functionName];
    expect(typeof method).to.equal('undefined');
    expect(erc721H.connect(sender)).to.not.have.property(functionName);
  }

  describe('init()', async function () {
    it('should fail be initialized twice', async function () {
      const initCode = generateInitCode(['address'], [l1.deployer.address]);
      await expect(erc721H.connect(l1.deployer).init(initCode)).to.be.revertedWith(
        HOLOGRAPHER_ALREADY_INITIALIZED_ERROR_MSG
      );
    });
  });

  describe('owner()', async function () {
    it('should return the correct owner address', async function () {
      const ownerAddress = await erc721H.connect(l1.deployer).owner();
      expect(ownerAddress).to.equal(l1.deployer.address);
    });
    it('should fail when comparing to wrong address', async function () {
      const ownerAddress = await erc721H.connect(l1.wallet10).owner();
      expect(ownerAddress).to.not.equal(l1.wallet10.address);
    });
    it('should allow external contract to call fn', async function () {
      await testExternalCallToFunction('function owner() external view returns (address)', 'owner');
    });
  });

  describe('isOwner()', async function () {
    it('should allow external contract to call fn', async function () {
      await testExternalCallToFunction('function isOwner() external view returns (bool)', 'isOwner');
    });
    it('should allow external contract to call fn with params', async function () {
      await testExternalCallToFunction('function isOwner(address wallet) external view returns (bool)', 'isOwner', [
        l1.deployer.address,
      ]);
    });
  });

  describe('supportsInterface()', async function () {
    const validInterface = functionHash('totalSupply()');
    const invalidInterface = functionHash('invalidMethod(address,address,uint256,bytes)');

    it('should return true if interface is valid', async function () {
      const supportsInterface = await erc721H.connect(l1.deployer).supportsInterface(validInterface);
      expect(supportsInterface).to.equal(true);
    });

    it('should return false if interface is invalid', async function () {
      const supportsInterface = await erc721H.connect(l1.deployer).supportsInterface(invalidInterface);
      expect(supportsInterface).to.equal(false);
    });

    it('should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function supportsInterface(bytes4) external pure returns (bool)',
        'supportsInterface',
        [validInterface]
      );
    });
  });

  describe('_holographer()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_holographer');
    });
  });

  describe('_msgSender()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_msgSender');
    });
  });

  describe('_getOwner()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_getOwner');
    });
  });

  describe('_setOwner()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_setOwner');
    });
  });
});
