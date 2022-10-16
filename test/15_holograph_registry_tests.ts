import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import web3 from 'web3';

import { generateInitCode, zeroAddress } from '../scripts/utils/helpers';
import { MockExternalCall, MockExternalCall__factory } from '../typechain-types';
import setup, { PreTest } from './utils';
import {
  ALREADY_INITIALIZED_ERROR_MSG,
  CONTRACT_ALREADY_SET_ERROR_MSG,
  EMPTY_CONTRACT_ERROR_MSG,
  FACTORY_ONLY_ERROR_MSG,
  ONLY_ADMIN_ERROR_MSG,
} from './utils/error_constants';

describe('Holograph Registry Contract', async function () {
  let HolographRegistry: any;
  let holographRegistry: any;
  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let randUser: SignerWithAddress;
  let mockAddress: string;
  let hTokenAddress: string;
  let utilityTokenAddress: string;
  let l1: PreTest;
  let mockExternalCall: MockExternalCall;
  const validChainId = 5;
  const invalidChainId = 0;

  before(async function () {
    l1 = await setup();
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    owner = accounts[2];
    randUser = accounts[10];
    mockAddress = '0xeB721f3E4C45a41fBdF701c8143E52665e67c76b'; // NOTE: sample Address
    hTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // NOTE: sample Address
    utilityTokenAddress = '0x4b02422DC46bb21D657A701D02794cD3Caeb17d0'; // NOTE: sample Address
    HolographRegistry = await ethers.getContractFactory('HolographRegistry');
    holographRegistry = await HolographRegistry.deploy();
    await holographRegistry.deployed();
    const mockExternalCallFactory = await ethers.getContractFactory<MockExternalCall__factory>('MockExternalCall');
    mockExternalCall = await mockExternalCallFactory.deploy();
    await mockExternalCall.deployed();
  });

  function createRandomAddress() {
    return ethers.Wallet.createRandom().address;
  }

  function getContractType(contractName = 'HolographERC721') {
    return '0x' + web3.utils.asciiToHex(contractName).substring(2).padStart(64, '0');
  }

  async function testExternalCallToFunction(fnAbi: string, fnName: string, args: any[] = []) {
    const ABI = [fnAbi];
    const iface = new ethers.utils.Interface(ABI);
    const encodedFunctionData = iface.encodeFunctionData(fnName, args);

    await expect(mockExternalCall.connect(deployer).callExternalFn(holographRegistry.address, encodedFunctionData)).to
      .not.be.reverted;
  }

  describe('constructor', async function () {
    it('should successfully deploy', async function () {
      expect(holographRegistry.address).to.not.equal(zeroAddress);
    });
  });

  describe('init()', async function () {
    it('should successfully be initialized once', async function () {
      const initCode = generateInitCode(['address', 'bytes32[]'], [deployer.address, []]);
      await expect(holographRegistry.connect(deployer).init(initCode)).to.not.be.reverted;
    });
    it('should fail be initialized twice', async function () {
      const initCode = generateInitCode(['address', 'bytes32[]'], [deployer.address, []]);
      await expect(holographRegistry.connect(deployer).init(initCode)).to.be.revertedWith(
        ALREADY_INITIALIZED_ERROR_MSG
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('setHolographedHashAddress', async function () {
    it('Should return fail to add contract because it does not have a factory', async function () {
      const contractHash = getContractType();
      await expect(
        l1.registry.connect(l1.deployer).setHolographedHashAddress(contractHash, l1.holographErc721.address)
      ).to.be.revertedWith(FACTORY_ONLY_ERROR_MSG);
    });
    it('Should allow external contract to call fn');
    // it('should fail to allow inherited contract to call fn');
  });

  describe('getHolographableContracts', async function () {
    it('Should return valid contracts', async function () {
      const expectedHolographableContractsCount = 5;
      const contracts = await l1.registry.getHolographableContracts(0, expectedHolographableContractsCount);
      expect(contracts.length).to.equal(expectedHolographableContractsCount);
      expect(contracts).include(l1.sampleErc721Holographer.address);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getHolographableContracts(uint256 index, uint256 length) external view returns (address[] memory contracts)',
        'getHolographableContracts',
        [0, 1]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('getHolographableContractsLength', async function () {
    it('Should return valid _holographableContracts length', async function () {
      const expectedHolographableContractsCount = 5;
      const length = await l1.registry.getHolographableContractsLength();
      expect(length).to.equal(expectedHolographableContractsCount);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getHolographableContractsLength() external view returns (uint256)',
        'getHolographableContractsLength'
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('isHolographedContract', async function () {
    it('Should return true if smartContract is valid', async function () {
      const isHolographed = await l1.registry.isHolographedContract(l1.sampleErc721Holographer.address);
      expect(isHolographed).to.equal(true);
    });
    it('Should return false if smartContract is INVALID', async function () {
      const isHolographed = await l1.registry.connect(l1.deployer).isHolographedContract(mockAddress);
      expect(isHolographed).to.equal(false);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function isHolographedContract(address smartContract) external view returns (bool)',
        'isHolographedContract',
        [mockAddress]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('isHolographedHashDeployed', async function () {
    it('Should return true if hash is valid', async function () {
      const isHolographed = await l1.registry.isHolographedHashDeployed(l1.sampleErc721Hash.erc721ConfigHash);
      expect(isHolographed).to.equal(true);
    });
    it('should return false if hash is INVALID', async function () {
      const contractHash = getContractType();
      const isHolographed = await l1.registry.isHolographedHashDeployed(contractHash);
      expect(isHolographed).to.equal(false);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function isHolographedHashDeployed(bytes32 hash) external view returns (bool)',
        'isHolographedHashDeployed',
        [l1.sampleErc721Hash.erc721ConfigHash]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('getHolographedHashAddress', async function () {
    it('Should return valid _holographedContractsHashMap', async function () {
      const address = await l1.registry.getHolographedHashAddress(l1.sampleErc721Hash.erc721ConfigHash);
      expect(address).to.equal(l1.sampleErc721Holographer.address);
    });
    it('should return 0x0 for invalid hash', async function () {
      const contractHash = getContractType();
      const address = await l1.registry.getHolographedHashAddress(contractHash);
      expect(address).to.equal(zeroAddress);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getHolographedHashAddress(bytes32 hash) external view returns (address)',
        'getHolographedHashAddress',
        [l1.sampleErc721Hash.erc721ConfigHash]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('setReservedContractTypeAddress()', async function () {
    it('should allow admin to set contract type address', async function () {
      const contractTypeHash = getContractType();
      await expect(l1.registry.connect(l1.deployer).setReservedContractTypeAddress(contractTypeHash, true)).to.not.be
        .reverted;
    });
    it('should fail to allow rand user to alter contract type address', async function () {
      const contractTypeHash = getContractType();
      await expect(l1.registry.connect(randUser).setReservedContractTypeAddress(contractTypeHash, true)).to.be.reverted;
    });
  });

  describe('getReservedContractTypeAddress()', async function () {
    it('should return expected contract type address', async function () {
      const contractTypeHash = getContractType();
      const contractAddress = await l1.registry.getReservedContractTypeAddress(contractTypeHash);
      expect(contractAddress).to.be.equal(l1.holographErc721.address);
    });
  });

  describe('setContractTypeAddress', async function () {
    it('should allow admin to alter setContractTypeAddress', async function () {
      const contractTypeHash = getContractType();
      const contractAddress = createRandomAddress();
      await l1.registry.connect(l1.deployer).setReservedContractTypeAddress(contractTypeHash, true);
      await expect(l1.registry.connect(l1.deployer).setContractTypeAddress(contractTypeHash, contractAddress)).to.not.be
        .reverted;
      const tmp = await l1.registry.getReservedContractTypeAddress(contractTypeHash);
      expect(tmp).to.equal(contractAddress);
    });

    it('should fail to allow rand user to alter setContractTypeAddress', async function () {
      const contractTypeHash = getContractType();
      const contractAddress = createRandomAddress();
      await l1.registry.connect(l1.deployer).setReservedContractTypeAddress(contractTypeHash, true);
      await expect(l1.registry.connect(randUser).setContractTypeAddress(contractTypeHash, contractAddress)).to.be
        .reverted;
      const tmp = await l1.registry.getReservedContractTypeAddress(contractTypeHash);
      expect(tmp).to.not.equal(contractAddress);
    });
    it('should allow external contract to call fn');
    // it('should fail to allow inherited contract to call fn');
  });

  describe('getContractTypeAddress()', async function () {
    it('Should return valid _contractTypeAddresses', async function () {
      const contractTypeHash = getContractType();
      const contractAddress = createRandomAddress();
      await l1.registry.connect(l1.deployer).setReservedContractTypeAddress(contractTypeHash, true);
      await expect(l1.registry.connect(l1.deployer).setContractTypeAddress(contractTypeHash, contractAddress)).to.not.be
        .reverted;
      const tmp = await l1.registry.getContractTypeAddress(contractTypeHash);
      expect(tmp).to.equal(contractAddress);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getContractTypeAddress(bytes32 contractType) external view returns (address)',
        'getContractTypeAddress',
        [getContractType()]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('referenceContractTypeAddress', async function () {
    it('should return valid address', async function () {
      await expect(l1.registry.referenceContractTypeAddress(l1.holographErc20.address)).to.not.be.reverted;
    });
    it('should fail if contract is empty', async function () {
      const contractAddress = createRandomAddress();
      await expect(l1.registry.referenceContractTypeAddress(contractAddress)).to.be.revertedWith(
        EMPTY_CONTRACT_ERROR_MSG
      );
    });
    it('should fail if contract is already set', async function () {
      await expect(l1.registry.referenceContractTypeAddress(l1.holographErc20.address)).to.revertedWith(
        CONTRACT_ALREADY_SET_ERROR_MSG
      );
    });
    it('should fail if the address type is reserved already');
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function referenceContractTypeAddress(address contractAddress) external returns (bytes32)',
        'referenceContractTypeAddress',
        [l1.holographErc20.address]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('setHolograph()', async function () {
    it('should allow admin to alter _holographSlot', async function () {
      await holographRegistry.connect(deployer).setHolograph(mockAddress);
      const holographAddr = await holographRegistry.connect(deployer).getHolograph();
      expect(holographAddr).to.equal(mockAddress);
    });

    it('should fail to allow owner to alter _holographSlot', async function () {
      await expect(holographRegistry.connect(owner).setHolograph(mockAddress)).to.be.revertedWith(ONLY_ADMIN_ERROR_MSG);
    });

    it('should fail to allow non-owner to alter _holographSlot', async function () {
      await expect(holographRegistry.connect(randUser).setHolograph(mockAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
  });

  describe('getHolograph()', async function () {
    it('Should return valid _holographSlot', async function () {
      const holographAddr = await holographRegistry.connect(deployer).getHolograph();
      expect(holographAddr).to.equal(mockAddress);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getHolograph() external view returns (address holograph)',
        'getHolograph'
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('setHToken()', async function () {
    it('should allow admin to alter _hTokens', async function () {
      await holographRegistry.connect(deployer).setHToken(validChainId, hTokenAddress);
      const hTokenAddr = await holographRegistry.connect(deployer).getHToken(validChainId);
      expect(hTokenAddr).to.equal(hTokenAddress);
    });
    it('should fail to allow owner to alter _hTokens', async function () {
      await expect(holographRegistry.connect(owner).setHToken(validChainId, hTokenAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it('should fail to allow non-owner to alter _hTokens', async function () {
      await expect(holographRegistry.connect(randUser).setHToken(validChainId, hTokenAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
  });

  describe('getHToken', async function () {
    it('Should return valid _hTokens', async function () {
      const hTokenAddr = await holographRegistry.connect(deployer).getHToken(validChainId);
      expect(hTokenAddr).to.equal(hTokenAddress);
    });
    it('should return 0x0 for invalid chainId', async function () {
      const hTokenAddr = await holographRegistry.connect(deployer).getHToken(invalidChainId);
      expect(hTokenAddr).to.equal(zeroAddress);
    });
    it('Should allow external contract to call fn', async function () {
      await testExternalCallToFunction(
        'function getHToken(uint32 chainId) external view returns (address)',
        'getHToken',
        [validChainId]
      );
    });
    // it('should fail to allow inherited contract to call fn');
  });

  describe('setUtilityToken()', async function () {
    it('should allow admin to alter _utilityTokenSlot', async function () {
      await holographRegistry.connect(deployer).setUtilityToken(utilityTokenAddress);
      const utilityTokenAddr = await holographRegistry.connect(deployer).getUtilityToken();
      expect(utilityTokenAddr).to.equal(utilityTokenAddress);
    });
    it('should fail to allow owner to alter _utilityTokenSlot', async function () {
      await expect(holographRegistry.connect(owner).setUtilityToken(utilityTokenAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it('should fail to allow non-owner to alter _utilityTokenSlot', async function () {
      await expect(holographRegistry.connect(randUser).setUtilityToken(utilityTokenAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
  });

  describe('getUtilityToken', async function () {
    it('Should return valid _hTokens', async function () {
      const utilityToken = await holographRegistry.connect(deployer).getUtilityToken();
      expect(utilityToken).to.equal(utilityTokenAddress);
    });
  });
});
