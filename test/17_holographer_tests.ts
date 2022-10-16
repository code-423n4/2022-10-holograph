import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Holographer, MockExternalCall, MockExternalCall__factory } from '../typechain-types';
import Web3 from 'web3';
import setup, { PreTest } from './utils';

import { HOLOGRAPHER_ALREADY_INITIALIZED_ERROR_MSG } from './utils/error_constants';
import { generateErc721Config, generateInitCode, Signature, StrictECDSA } from '../scripts/utils/helpers';
import { ConfigureEvents, HolographERC721Event } from '../scripts/utils/events';
import { DeploymentConfigStruct } from '../typechain-types/HolographFactory';

describe('Holograph Holographer Contract', function () {
  const web3 = new Web3();

  let l1: PreTest;
  let holographer: Holographer;
  let mockExternalCall: MockExternalCall;
  let deployer: SignerWithAddress;
  let holograph: string;
  let erc721ConfigEncodedInfo: DeploymentConfigStruct;
  const contractType = '0x' + web3.utils.asciiToHex('HolographERC721').substring(2).padStart(64, '0');

  before(async () => {
    [deployer] = await ethers.getSigners();
    l1 = await setup();

    let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
      l1.network, // reference to hardhat network object
      l1.deployer.address, // address of creator of contract
      'SampleERC721', // contract bytecode to use
      'Sample ERC721 Contract: unit test', // name of contract
      'SMPLR', // token symbol of contract
      1000, // royalties to use (bps 10%) <- erc721 specific
      ConfigureEvents([
        // events to connect / capture for SampleERC721
        HolographERC721Event.bridgeIn,
        HolographERC721Event.bridgeOut,
        HolographERC721Event.afterBurn,
      ]),
      generateInitCode(['address'], [l1.deployer.address]), // init code for SampleERC721 itself
      l1.salt // random bytes32 salt that you decide to assign this config, used again on other chains to guarantee uniqueness if all above vars are same for another contract for some reason
    );

    const sig = await deployer.signMessage(erc721ConfigHashBytes);
    const signature: Signature = StrictECDSA({
      r: '0x' + sig.substring(2, 66),
      s: '0x' + sig.substring(66, 130),
      v: '0x' + sig.substring(130, 132),
    } as Signature);

    const depoyTx = await l1.factory
      .connect(deployer)
      .deployHolographableContract(erc721Config, signature, deployer.address);
    const deployResult = await depoyTx.wait();

    const event = deployResult.events?.find((event: any) => event.event === 'BridgeableContractDeployed');
    if (!event) throw new Error('BridgeableContractDeployed event not fired');
    const [holographerAddress] = event?.args || ['', ''];

    holographer = await ethers.getContractAt('Holographer', holographerAddress);

    const mockExternalCallFactory = await ethers.getContractFactory<MockExternalCall__factory>('MockExternalCall');
    mockExternalCall = await mockExternalCallFactory.deploy();
    await mockExternalCall.deployed();

    erc721ConfigEncodedInfo = erc721Config;
    holograph = l1.holograph.address;
  });

  describe('constructor', async function () {
    it('should successfully deploy', async function () {
      expect(holographer.address).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe('init()', () => {
    it('should fail if already initialized', async () => {
      const initCode = generateInitCode(['address', 'bytes32[]'], [deployer.address, []]);
      await expect(holographer.connect(deployer).init(initCode)).to.be.revertedWith(
        HOLOGRAPHER_ALREADY_INITIALIZED_ERROR_MSG
      );
    });
  });

  describe(`getDeploymentBlock()`, async function () {
    it('Should return valid _blockHeightSlot', async () => {
      expect(await holographer.getDeploymentBlock()).to.not.equal(ethers.constants.AddressZero);
    });

    it('Should allow external contract to call fn', async () => {
      let ABI = ['function getDeploymentBlock() external view returns (address holograph) '];
      let iface = new ethers.utils.Interface(ABI);
      let encodedFunctionData = iface.encodeFunctionData('getDeploymentBlock', []);

      await expect(mockExternalCall.connect(deployer).callExternalFn(holographer.address, encodedFunctionData)).to.not
        .be.reverted;
    });
  });

  describe(`getHolograph()`, async function () {
    it('Should return valid _holographSlot', async () => {
      expect(await holographer.getHolograph()).to.equal(holograph);
    });

    it('Should allow external contract to call fn', async () => {
      let ABI = ['function getHolograph() external view returns (address holograph)'];
      let iface = new ethers.utils.Interface(ABI);
      let encodedFunctionData = iface.encodeFunctionData('getHolograph', []);

      await expect(mockExternalCall.connect(deployer).callExternalFn(holographer.address, encodedFunctionData)).to.not
        .be.reverted;
    });
  });

  describe(`getOriginChain()`, async function () {
    it('Should return valid _originChainSlot', async () => {
      const chainID = await l1.holograph.getHolographChainId();
      expect(await holographer.getOriginChain()).to.equal(chainID);
    });

    it('Should allow external contract to call fn', async () => {
      let ABI = ['function getOriginChain() external view returns (uint32 originChain)'];
      let iface = new ethers.utils.Interface(ABI);
      let encodedFunctionData = iface.encodeFunctionData('getOriginChain', []);

      await expect(mockExternalCall.connect(deployer).callExternalFn(holographer.address, encodedFunctionData)).to.not
        .be.reverted;
    });
  });

  describe(`getSourceContract()`, async function () {
    it('Should return valid _sourceContractSlot', async () => {
      expect(await holographer.getSourceContract()).to.not.equal(ethers.constants.AddressZero);
    });

    it('Should allow external contract to call fn', async () => {
      let ABI = ['function getSourceContract() external view returns (address sourceContract)'];
      let iface = new ethers.utils.Interface(ABI);
      let encodedFunctionData = iface.encodeFunctionData('getSourceContract', []);

      await expect(mockExternalCall.connect(deployer).callExternalFn(holographer.address, encodedFunctionData)).to.not
        .be.reverted;
    });
  });

  describe(`getHolographEnforcer()`, async function () {
    it('Should return Holograph smart contract that controls and enforces the ERC standards', async () => {
      expect(await holographer.getHolographEnforcer()).to.not.equal(ethers.constants.AddressZero);
    });

    it('Should allow external contract to call fn', async () => {
      let ABI = ['function getHolographEnforcer() public view returns (address)'];
      let iface = new ethers.utils.Interface(ABI);
      let encodedFunctionData = iface.encodeFunctionData('getHolographEnforcer', []);

      await expect(mockExternalCall.connect(deployer).callExternalFn(holographer.address, encodedFunctionData)).to.not
        .be.reverted;
    });
  });
});
