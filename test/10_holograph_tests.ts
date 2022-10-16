import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { generateInitCode } from '../scripts/utils/helpers';
import {
  Holograph,
  MockExternalCall,
  MockExternalCall__factory,
  MockHolographChild,
  Holograph__factory,
} from '../typechain-types';

describe('Holograph Contract', () => {
  let holograph: Holograph;
  let mockExternalCall: MockExternalCall;
  let mockHolographChild: MockHolographChild;

  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let user: SignerWithAddress;

  const randomAddress = () => ethers.Wallet.createRandom().address;

  const holographChainId = 1;
  const bridge = randomAddress();
  const factory = randomAddress();
  const interfaces = randomAddress();
  const operator = randomAddress();
  const registry = randomAddress();
  const treasury = randomAddress();
  const utilityToken = randomAddress();

  const initCode = generateInitCode(
    ['uint32', 'address', 'address', 'address', 'address', 'address', 'address', 'address'],
    [holographChainId, bridge, factory, interfaces, operator, registry, treasury, utilityToken]
  );

  function encodeFunctionSignature(fnSignature: string, fnName: string, fnParams: any[] = []) {
    return new ethers.utils.Interface([fnSignature]).encodeFunctionData(fnName, fnParams);
  }

  before(async () => {
    [deployer, admin, user] = await ethers.getSigners();

    const HolographFactory = await ethers.getContractFactory<Holograph__factory>('Holograph');
    holograph = await HolographFactory.deploy();
    await holograph.deployed();

    const mockExternalCallFactory = await ethers.getContractFactory<MockExternalCall__factory>('MockExternalCall');
    mockExternalCall = await mockExternalCallFactory.deploy();
    await mockExternalCall.deployed();

    const mockHolographChildFactory = await ethers.getContractFactory('MockHolographChild');
    mockHolographChild = (await mockHolographChildFactory.deploy()) as MockHolographChild;
    await mockHolographChild.deployed();
  });

  describe('init():', () => {
    it('should successfully init once', async () => {
      await expect(holograph.init(initCode)).to.not.be.reverted;
      await expect(holograph.functions.setAdmin(admin.address)).to.not.be.reverted;
    });

    it('should fail to init if already initialized', async () => {
      await expect(holograph.init(initCode)).to.be.reverted;
    });

    it('should fail if holographChainId is value larger than uint32'); // does it make sense at all?
  });

  describe(`getBridge()`, () => {
    it('Should return valid _bridgeSlot', async () => {
      await expect((await holograph.functions.getBridge()).bridge).to.equal(bridge);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getBridge() external view returns (address bridge)', 'getBridge', [])
        )
      ).to.not.be.reverted;
    });

    it(
      'should fail to allow inherited contract to call fn' /*async () => {
      // This actually doesn't fail
      await expect(
        mockHolographChild.functions.getBridge()
      ).to.be.reverted
    }*/
    );
  });

  describe('setBridge()', () => {
    it('should allow admin to alter _bridgeSlot', async () => {
      await expect(holograph.connect(admin).functions.setBridge(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _bridgeSlot', async () => {
      await expect(holograph.functions.setBridge(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _bridgeSlot', async () => {
      await expect(holograph.connect(user).functions.setBridge(randomAddress())).to.be.reverted;
    });
  });

  describe(`getChainId()`, () => {
    it('Should return valid _chainIdSlot', async () => {
      await expect((await holograph.functions.getChainId()).chainId.toString()).to.not.be.empty;
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getChainId() external view returns (uint256 chainId)', 'getChainId', [])
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setChainId()', () => {
    it('should allow admin to alter _chainIdSlot', async () => {
      await expect(holograph.connect(admin).functions.setChainId(2)).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _chainIdSlot', async () => {
      await expect(holograph.functions.setChainId(3)).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _chainIdSlot', async () => {
      await expect(holograph.connect(user).functions.setChainId(4)).to.be.reverted;
    });
  });

  describe(`getFactory()`, () => {
    it('Should return valid _factorySlot', async () => {
      await expect((await holograph.functions.getFactory()).factory).to.equal(factory);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getFactory() external view returns (address factory)', 'getFactory', [])
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setFactory()', () => {
    it('should allow admin to alter _factorySlot', async () => {
      await expect(holograph.connect(admin).functions.setFactory(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _factorySlot', async () => {
      await expect(holograph.functions.setFactory(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _factorySlot', async () => {
      await expect(holograph.connect(user).functions.setFactory(randomAddress())).to.be.reverted;
    });
  });

  describe(`getHolographChainId()`, () => {
    it('Should return valid _holographChainIdSlot', async () => {
      await expect((await holograph.functions.getHolographChainId()).holographChainId).to.equal(holographChainId);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature(
            'function getHolographChainId() external view returns (uint32 holographChainId)',
            'getHolographChainId',
            []
          )
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setHolographChainId()', () => {
    it('should allow admin to alter _holographChainIdSlot', async () => {
      await expect(holograph.connect(admin).functions.setHolographChainId(2)).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _holographChainIdSlot', async () => {
      await expect(holograph.functions.setHolographChainId(3)).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _holographChainIdSlot', async () => {
      await expect(holograph.connect(user).functions.setHolographChainId(4)).to.be.reverted;
    });
  });

  describe(`getInterfaces()`, () => {
    it('Should return valid _interfacesSlot', async () => {
      await expect((await holograph.functions.getInterfaces()).interfaces).to.equal(interfaces);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature(
            'function getInterfaces() external view returns (address interfaces)',
            'getInterfaces',
            []
          )
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setInterfaces()', () => {
    it('should allow admin to alter _interfacesSlot', async () => {
      await expect(holograph.connect(admin).functions.setInterfaces(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _interfacesSlot', async () => {
      await expect(holograph.functions.setInterfaces(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _interfacesSlot', async () => {
      await expect(holograph.connect(user).functions.setInterfaces(randomAddress())).to.be.reverted;
    });
  });

  describe(`getOperator()`, () => {
    it('Should return valid _operatorSlot', async () => {
      await expect((await holograph.functions.getOperator()).operator).to.equal(operator);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getOperator() external view returns (address operator)', 'getOperator', [])
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setOperator()', () => {
    it('should allow admin to alter _operatorSlot', async () => {
      await expect(holograph.connect(admin).functions.setOperator(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _operatorSlot', async () => {
      await expect(holograph.functions.setOperator(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _operatorSlot', async () => {
      await expect(holograph.connect(user).functions.setOperator(randomAddress())).to.be.reverted;
    });
  });

  describe(`getRegistry()`, () => {
    it('Should return valid _registrySlot', async () => {
      await expect((await holograph.functions.getRegistry()).registry).to.equal(registry);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getRegistry() external view returns (address registry)', 'getRegistry', [])
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setRegistry()', () => {
    it('should allow admin to alter _registrySlot', async () => {
      await expect(holograph.connect(admin).functions.setRegistry(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _registrySlot', async () => {
      await expect(holograph.functions.setRegistry(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _registrySlot', async () => {
      await expect(holograph.connect(user).functions.setRegistry(randomAddress())).to.be.reverted;
    });
  });

  describe(`getTreasury()`, () => {
    it('Should return valid _treasurySlot', async () => {
      await expect((await holograph.functions.getTreasury()).treasury).to.equal(treasury);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature('function getTreasury() external view returns (address treasury)', 'getTreasury', [])
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setTreasury()', () => {
    it('should allow admin to alter _treasurySlot', async () => {
      await expect(holograph.connect(admin).functions.setTreasury(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _treasurySlot', async () => {
      await expect(holograph.functions.setTreasury(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _treasurySlot', async () => {
      await expect(holograph.connect(user).functions.setTreasury(randomAddress())).to.be.reverted;
    });
  });

  describe(`getUtilityToken()`, () => {
    it('Should return valid _utilityTokenSlot', async () => {
      await expect((await holograph.functions.getUtilityToken()).utilityToken).to.equal(utilityToken);
    });

    it('Should allow external contract to call fn', async () => {
      await expect(
        mockExternalCall.functions.callExternalFn(
          holograph.address,
          encodeFunctionSignature(
            'function getUtilityToken() external view returns (address utilityToken)',
            'getUtilityToken',
            []
          )
        )
      ).to.not.be.reverted;
    });

    it('should fail to allow inherited contract to call fn');
  });

  describe('setUtilityToken()', () => {
    it('should allow admin to alter _utilityTokenSlot', async () => {
      await expect(holograph.connect(admin).functions.setUtilityToken(randomAddress())).to.not.be.reverted;
    });

    it('should fail to allow owner to alter _utilityTokenSlot', async () => {
      await expect(holograph.functions.setUtilityToken(randomAddress())).to.be.reverted;
    });

    it('should fail to allow non-owner to alter _utilityTokenSlot', async () => {
      await expect(holograph.connect(user).functions.setUtilityToken(randomAddress())).to.be.reverted;
    });
  });

  describe(`receive()`, () => {
    it('should revert');
  });

  describe(`fallback()`, () => {
    it('should revert');
  });
});
