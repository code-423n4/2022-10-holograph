import { expect, assert } from 'chai';
import { PreTest } from './utils';
import setup from './utils';
import { BytesLike, BigNumber, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Signature,
  StrictECDSA,
  zeroAddress,
  functionHash,
  randomHex,
  generateInitCode,
  generateErc721Config,
  remove0x,
  KeyOf,
  HASH,
  sleep,
} from '../scripts/utils/helpers';
import { HolographERC721Event, ConfigureEvents } from '../scripts/utils/events';
import { HolographERC20, HolographOperator, Mock } from '../typechain-types';
import { ONLY_ADMIN_ERROR_MSG } from './utils/error_constants';

const bnHEX = function (n: number, bytes: number, prepend: boolean = true): BytesLike {
  return (prepend ? '0x' : '') + remove0x(BigNumber.from(n).toHexString()).padStart(bytes * 2, '0');
};

const BLOCKTIME: number = 60;
const GWEI: BigNumber = BigNumber.from('1000000000');
const TESTGASLIMIT: BigNumber = BigNumber.from('10000000');
const GASPRICE: BigNumber = BigNumber.from('1000000000');

const getRequestPayload = async function (
  l1: PreTest,
  l2: PreTest,
  target: string | BytesLike,
  data: string | BytesLike
): Promise<BytesLike> {
  let payload: BytesLike = await l1.bridge
    .connect(l1.deployer)
    .callStatic.getBridgeOutRequestPayload(
      l2.network.holographId,
      target as string,
      '0x' + 'ff'.repeat(32),
      '0x' + 'ff'.repeat(32),
      data as string
    );
  return payload;
};

const hValueTrim = function (inputPayload: string | BytesLike): BytesLike {
  let index = 2 + 4 * 2 + 32 * 2 * 5; // 0x + functionSig + data
  let payload: string = inputPayload as string;
  return payload.slice(0, index) + '00'.repeat(32) + payload.slice(index + 32 * 2, payload.length);
};

const getEstimatedGas = async function (
  l1: PreTest,
  l2: PreTest,
  target: string | BytesLike,
  data: string | BytesLike,
  payload: string | BytesLike,
  trimHValue: boolean = false
): Promise<(string | BytesLike | BigNumber)[]> {
  let estimatedGas: BigNumber = TESTGASLIMIT.sub(
    await l2.operator.callStatic.jobEstimator(payload as string, {
      gasPrice: GASPRICE,
      gasLimit: TESTGASLIMIT,
    })
  );

  payload = await l1.bridge
    .connect(l1.deployer)
    .callStatic.getBridgeOutRequestPayload(
      l2.network.holographId,
      target as string,
      estimatedGas,
      GWEI,
      data as string
    );

  if (trimHValue) {
    payload = hValueTrim(payload);
  }

  let fees = await l1.bridge.callStatic.getMessageFee(l2.network.holographId, estimatedGas, GWEI, payload);
  let total: BigNumber = fees[0].add(fees[1]);
  let gasEstimation = await l2.operator.callStatic.jobEstimator(payload);
  return [payload, gasEstimation, total, fees[0], fees[1]];
};

function shuffleWallets(array: KeyOf<PreTest>[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

describe('Holograph Operator Contract', async () => {
  let l1: PreTest;
  let l2: PreTest;

  let HLGL1: HolographERC20;
  let HLGL2: HolographERC20;
  let MOCKL1: Mock;
  let MOCKL2: Mock;

  let mockOperator: HolographOperator;

  let wallets: KeyOf<PreTest>[];

  let pickOperator = function (chain: PreTest, target: string, opposite: boolean = false): SignerWithAddress {
    let operator: SignerWithAddress = chain.deployer;
    let targetOperator = target.toLowerCase();
    if (targetOperator != zeroAddress) {
      let wallet: SignerWithAddress;
      // shuffle
      shuffleWallets(wallets);
      for (let i = 0, l = wallets.length; i < l; i++) {
        wallet = chain[wallets[i]] as SignerWithAddress;
        if (
          (!opposite && wallet.address.toLowerCase() == targetOperator) ||
          (opposite && wallet.address.toLowerCase() != targetOperator)
        ) {
          operator = wallet;
          break;
        }
      }
    }
    return operator;
  };

  let availableJobs: string[] = [];
  let zeroAddressJobs: string[] = [];

  let operatorJobTokenId: number = 0;

  let createOperatorJob = async function (
    l1: PreTest,
    l2: PreTest,
    tokenId: number,
    skipZeroAddressFallback: boolean = false
  ): Promise<boolean> {
    if (tokenId > 1) {
      await l1.sampleErc721
        .attach(l1.sampleErc721Holographer.address)
        .mint(l1.deployer.address, bnHEX(tokenId, 32), 'IPFSURIHERE');
    }
    let originalMessagingModule = await l1.operator.getMessagingModule();
    let data: BytesLike = generateInitCode(
      ['address', 'address', 'uint256'],
      [l1.deployer.address, l2.deployer.address, bnHEX(tokenId, 32)]
    );
    let payload: BytesLike = hValueTrim(await getRequestPayload(l1, l2, l1.sampleErc721Holographer.address, data));
    let gasEstimates: (string | BytesLike | BigNumber)[] = await getEstimatedGas(
      l1,
      l2,
      l1.sampleErc721Holographer.address,
      data,
      payload,
      true
    );
    payload = gasEstimates[0] as string;
    let payloadHash: string = HASH(payload);
    // temporarily set deployer as messaging module, to allow for easy sending
    await l1.operator.setMessagingModule(l1.deployer.address);
    // make call with deployer AS messaging module
    await l1.operator.crossChainMessage(payload);
    // return messaging module back to original address
    await l1.operator.setMessagingModule(originalMessagingModule);
    let operatorJob = await l1.operator.getJobDetails(payloadHash);
    let operator = (operatorJob[2] as string).toLowerCase();
    if (operator == zeroAddress) {
      zeroAddressJobs.push(payloadHash);
      zeroAddressJobs.push(payload as string);
      return false;
    } else {
      if (skipZeroAddressFallback && operatorJob[5][0] == 0) {
        // need to skip this one, since it will fail a fallback test
        // execute job to leave operator bonded
        await l1.operator.connect(pickOperator(l1, operator)).executeJob(payload);
        return false;
      } else {
        availableJobs.push(payloadHash);
        availableJobs.push(payload as string);
        return true;
      }
    }
  };

  before(async function () {
    l1 = await setup();
    l2 = await setup(true);

    HLGL1 = await l1.holographErc20.attach(l1.utilityTokenHolographer.address);
    HLGL2 = await l2.holographErc20.attach(l2.utilityTokenHolographer.address);

    MOCKL1 = (await (await l1.hre.ethers.getContractFactory('Mock')).deploy()) as Mock;
    await MOCKL1.deployed();
    await MOCKL1.init(generateInitCode(['bytes32'], ['0x' + 'ff'.repeat(32)]));
    await MOCKL1.setStorage(0, '0x' + remove0x(l1.operator.address).padStart(64, '0'));

    MOCKL2 = (await (await l2.hre.ethers.getContractFactory('Mock')).deploy()) as Mock;
    await MOCKL2.deployed();
    await MOCKL2.init(generateInitCode(['bytes32'], ['0x' + 'ff'.repeat(32)]));
    await MOCKL2.setStorage(0, '0x' + remove0x(l2.operator.address).padStart(64, '0'));

    wallets = [
      'wallet1',
      'wallet2',
      'wallet3',
      'wallet4',
      'wallet5',
      'wallet6',
      'wallet7',
      'wallet8',
      'wallet9',
      'wallet10',
    ];

    // Need to deploy l1 version of SampleERC721 on l2 in order to simplify some of the logic below
    let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
      l1.network,
      l1.deployer.address,
      'SampleERC721',
      'Sample ERC721 Contract (' + l1.hre.networkName + ')',
      'SMPLR',
      1000,
      ConfigureEvents([HolographERC721Event.bridgeIn, HolographERC721Event.bridgeOut, HolographERC721Event.afterBurn]),
      generateInitCode(['address'], [l1.deployer.address /*owner*/]),
      l1.salt
    );

    let sig = await l1.deployer.signMessage(erc721ConfigHashBytes);
    let signature: Signature = StrictECDSA({
      r: '0x' + sig.substring(2, 66),
      s: '0x' + sig.substring(66, 130),
      v: '0x' + sig.substring(130, 132),
    } as Signature);

    await l2.factory.deployHolographableContract(erc721Config, signature, l1.deployer.address);

    await l1.sampleErc721
      .attach(l1.sampleErc721Holographer.address)
      .mint(l1.deployer.address, bnHEX(1, 32), 'IPFSURIHERE');

    // 0xfffffffd00000000000000000000000000000000000000000000000000000001
    await l2.sampleErc721
      .attach(l1.sampleErc721Holographer.address)
      .mint(l1.deployer.address, bnHEX(1, 32), 'IPFSURIHERE');
  });

  function testPrivateFunction(functionName: string, user?: SignerWithAddress) {
    const sender = user ?? l1.deployer;
    const operator = l1.operator.connect(sender) as any;
    const method = operator[functionName];
    expect(typeof method).to.equal('undefined');
    expect(l1.operator.connect(sender)).to.not.have.property(functionName);
  }

  after(async () => {});

  beforeEach(async () => {});

  afterEach(async () => {});

  describe('constructor', async () => {
    it('should successfully deploy', async () => {
      let operatorFactory: ContractFactory = await l1.hre.ethers.getContractFactory('HolographOperator');
      mockOperator = (await operatorFactory.deploy()) as HolographOperator;
      await mockOperator.deployed();
      assert(mockOperator.address != zeroAddress, 'zero address');
      let deployedCode = await l1.hre.ethers.provider.getCode(mockOperator.address);
      assert(deployedCode != '0x' && deployedCode != '', 'code not deployed');
    });
  });

  describe('init()', async () => {
    it('should successfully be initialized once', async () => {
      let initPayload = generateInitCode(
        ['address', 'address', 'address', 'address', 'address'],
        [
          await l1.operator.getBridge(),
          await l1.operator.getHolograph(),
          await l1.operator.getInterfaces(),
          await l1.operator.getRegistry(),
          await l1.operator.getUtilityToken(),
        ]
      );
      let tx = await mockOperator.init(initPayload);
      await tx.wait();
      expect(await mockOperator.getBridge()).to.equal(await l1.operator.getBridge());
      expect(await mockOperator.getHolograph()).to.equal(await l1.operator.getHolograph());
      expect(await mockOperator.getInterfaces()).to.equal(await l1.operator.getInterfaces());
      expect(await mockOperator.getRegistry()).to.equal(await l1.operator.getRegistry());
      expect(await mockOperator.getUtilityToken()).to.equal(await l1.operator.getUtilityToken());
    });
    it('should fail if already initialized', async () => {
      let initPayload = generateInitCode(
        ['address', 'address', 'address', 'address', 'address'],
        [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
      );
      await expect(mockOperator.init(initPayload)).to.be.revertedWith('HOLOGRAPH: already initialized');
    });
    it('Should allow external contract to call fn', async () => {
      let initPayload = generateInitCode(
        ['address', 'address', 'address', 'address', 'address'],
        [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
      );
      // temp set fallback to mockOperator
      await MOCKL1.setStorage(0, '0x' + remove0x(mockOperator.address).padStart(64, '0'));
      await expect(
        MOCKL1.callStatic.mockCall(
          mockOperator.address,
          (
            await mockOperator.populateTransaction.init(initPayload)
          ).data as string
        )
      ).to.be.revertedWith('HOLOGRAPH: already initialized');
      // return fallback to operator
      await MOCKL1.setStorage(0, '0x' + remove0x(l1.operator.address).padStart(64, '0'));
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('jobEstimator()', async () => {
    it('should return expected estimated value', async () => {
      // used this space go into more detail and breakdown what is actually happening behind the scenes
      let bridgeInRequestPayload =
        // this is the data that is sent to HolographOperator jobEstimator function
        generateInitCode(
          // bridgeInRequestPayload
          ['uint256', 'uint32', 'address', 'address', 'address', 'uint256', 'bool', 'bytes'],
          [
            0, // nonce
            l1.network.holographId, // fromChain
            l1.sampleErc721Holographer.address, // holographableContract
            zeroAddress, // hToken
            zeroAddress, // hTokenRecipient
            0, // hTokenValue
            true, // doNotRevert
            // this is the data that is sent to HolographBridge (by operator) bridgeInRequest function
            generateInitCode(
              // bridgeInPayload
              ['uint32', 'bytes'],
              [
                l1.network.holographId, // fromChain
                // this is the data that is sent to HolographERC721 (enforcer) bridgeIn function
                generateInitCode(
                  // payload
                  ['address', 'address', 'uint256', 'bytes'],
                  [
                    l1.deployer.address, // from
                    l1.deployer.address, // to
                    bnHEX(1, 32), // tokenId
                    // this is init code that is sent to SampleERC721 (custom contract) bridgeIn function
                    generateInitCode(
                      // _data
                      ['string'],
                      [
                        'IPFSURIHERE', // token URI
                      ]
                    ),
                  ]
                ),
              ]
            ),
          ]
        );
      let functionSig = functionHash('bridgeInRequest(uint256,uint32,address,address,address,uint256,bool,bytes)'); // fuunction signature
      let gasEstimation = await l2.operator.callStatic.jobEstimator(functionSig + remove0x(bridgeInRequestPayload));
      assert(gasEstimation.gt(BigNumber.from('0x38d7ea4c68000')), 'unexpectedly low gas estimation'); // 0.001 ETH
    });
    it('Should allow external contract to call fn', async () => {
      let data: BytesLike = generateInitCode(
        ['address', 'address', 'uint256'],
        [l1.deployer.address, l2.deployer.address, bnHEX(1, 32)]
      );

      let payload: BytesLike = hValueTrim(await getRequestPayload(l1, l2, l1.sampleErc721Holographer.address, data));

      let estimatedGas: BigNumber = TESTGASLIMIT.sub(
        await l2.operator.callStatic.jobEstimator(payload, {
          gasPrice: GASPRICE,
          gasLimit: TESTGASLIMIT,
        })
      );

      payload = hValueTrim(
        await l1.bridge
          .connect(l1.deployer)
          .callStatic.getBridgeOutRequestPayload(
            l2.network.holographId,
            l1.sampleErc721Holographer.address,
            estimatedGas,
            GWEI,
            data
          )
      );

      let fees = await l1.bridge.callStatic.getMessageFee(l2.network.holographId, estimatedGas, GWEI, payload);
      let total: BigNumber = fees[0].add(fees[1]);
      let gasEstimation = await l2.operator
        .attach(MOCKL2.address)
        .callStatic.jobEstimator(payload, { value: BigNumber.from('1000000000000000000') });
      assert(gasEstimation.gt(BigNumber.from('0x38d7ea4c68000')), 'unexpectedly low gas estimation'); // 0.001 ETH
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
    it('should be payable', async () => {
      let data: BytesLike = generateInitCode(
        ['address', 'address', 'uint256'],
        [l1.deployer.address, l2.deployer.address, bnHEX(1, 32)]
      );
      let payload: BytesLike = hValueTrim(await getRequestPayload(l1, l2, l1.sampleErc721Holographer.address, data));
      let gasEstimates: (string | BytesLike | BigNumber)[] = await getEstimatedGas(
        l1,
        l2,
        l1.sampleErc721Holographer.address,
        data,
        payload,
        true
      ); // returns: gasLimit, nativeFee, hlgFee, msgFee
      assert((gasEstimates[1] as BigNumber).gt(BigNumber.from('0x38d7ea4c68000')), 'unexpectedly low gas estimation'); // 0.001 ETH
    });
  });

  describe('getTotalPods()', async () => {
    it('should return expected number of pods', async () => {
      expect(await l1.operator.getTotalPods()).to.equal(BigNumber.from('1'));
    });
  });

  describe('getPodOperatorsLength()', async () => {
    it('should return expected pod length', async () => {
      expect(await l1.operator.getPodOperatorsLength(1)).to.equal(BigNumber.from('1'));
    });
    it('should fail if pod does not exist', async () => {
      await expect(l1.operator.getPodOperatorsLength(2)).to.be.revertedWith('HOLOGRAPH: pod does not exist');
    });
  });

  describe('getPodOperators(pod)', async () => {
    it('should return expected operators for a valid pod', async () => {
      let operators = await l1.operator.callStatic['getPodOperators(uint256)'](1);
      assert.deepEqual(operators, [zeroAddress]);
    });
    it('should fail to return operators for an INVALID pod', async () => {
      await expect(l1.operator['getPodOperators(uint256)'](2)).to.be.revertedWith('HOLOGRAPH: pod does not exist');
    });
    it('Should allow external contract to call fn', async () => {
      let operators = await l1.operator.attach(MOCKL1.address).callStatic['getPodOperators(uint256)'](1);
      assert.deepEqual(operators, [zeroAddress]);
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getPodOperators(pod, index, length)', async () => {
    it('should return expected operators for a valid pod', async () => {
      let operators = await l1.operator.callStatic['getPodOperators(uint256,uint256,uint256)'](1, 0, 10);
      assert.deepEqual(operators, [zeroAddress]);
    });
    it('should fail to return operators for an INVALID pod', async () => {
      await expect(l1.operator['getPodOperators(uint256,uint256,uint256)'](2, 0, 10)).to.be.revertedWith(
        'HOLOGRAPH: pod does not exist'
      );
    });
    it('should fail if index out of bounds', async () => {
      await expect(l1.operator['getPodOperators(uint256,uint256,uint256)'](1, 10, 10)).to.be.reverted;
    });
    // this will never fail because length is auto adjusted
    //it.skip('should fail if length is out of bounds', async () => {});
    it('Should allow external contract to call fn', async () => {
      let operators = await l1.operator
        .attach(MOCKL1.address)
        .callStatic['getPodOperators(uint256,uint256,uint256)'](1, 0, 10);
      assert.deepEqual(operators, [zeroAddress]);
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getPodBondAmounts(pod)', async () => {
    it('should return expected base and current value', async () => {
      let bondRequirements1: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      assert.equal(bondRequirements1[0].toHexString(), '0x056bc75e2d63100000');
      assert.equal(bondRequirements1[1].toHexString(), '0x056bc75e2d63100000');
      let bondRequirements2: BigNumber[] = await l1.operator.getPodBondAmounts(2);
      assert.equal(bondRequirements2[0].toHexString(), '0x0ad78ebc5ac6200000');
      assert.equal(bondRequirements2[1].toHexString(), '0x0ad78ebc5ac6200000');
    });
    it('Should allow external contract to call fn', async () => {
      let bondRequirements1 = await l1.operator.attach(MOCKL1.address).getPodBondAmounts(1);
      assert.equal(bondRequirements1[0].toHexString(), '0x056bc75e2d63100000');
      assert.equal(bondRequirements1[1].toHexString(), '0x056bc75e2d63100000');
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('bondUtilityToken()', async () => {
    it('should successfully allow bonding', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await expect(l1.operator.bondUtilityToken(l1.deployer.address, currentBondAmount, 1))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.deployer.address, l1.operator.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.deployer.address)).to.equal(currentBondAmount);
      expect(await l1.operator.getBondedPod(l1.deployer.address)).to.equal(BigNumber.from('1'));
    });
    it('should successfully allow bonding a contract', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      // we will bond to SampleERC20 as an example
      await expect(l1.operator.bondUtilityToken(l1.sampleErc20Holographer.address, currentBondAmount, 1))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.deployer.address, l1.operator.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.sampleErc20Holographer.address)).to.equal(currentBondAmount);
      expect(await l1.operator.getBondedPod(l1.sampleErc20Holographer.address)).to.equal(BigNumber.from('1'));
    });
    it('should fail if the operator is already bonded', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await expect(l1.operator.bondUtilityToken(l1.deployer.address, currentBondAmount, 1)).to.be.revertedWith(
        'HOLOGRAPH: operator is bonded'
      );
      bondRequirements = await l1.operator.getPodBondAmounts(2);
      currentBondAmount = bondRequirements[1];
      await expect(l1.operator.bondUtilityToken(l1.deployer.address, currentBondAmount, 2)).to.be.revertedWith(
        'HOLOGRAPH: operator is bonded'
      );
    });
    it('Should fail if the provided bond amount is too low', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await expect(
        l1.operator.connect(l1.wallet1).bondUtilityToken(l1.wallet1.address, currentBondAmount, 2)
      ).to.be.revertedWith('HOLOGRAPH: bond amount too small');
    });
    it('Should fail if operator does not have enough utility tokens', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await expect(
        l1.operator.connect(l1.wallet1).bondUtilityToken(l1.wallet1.address, currentBondAmount, 1)
      ).to.be.revertedWith('ERC20: amount exceeds balance');
    });
    it('should fail if the token transfer failed', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await expect(
        l1.operator.connect(l1.wallet1).bondUtilityToken(l1.wallet2.address, currentBondAmount, 1)
      ).to.be.revertedWith('ERC20: amount exceeds balance');
    });
    /**
     * @dev This one is impossible to do, pod operator limit is max value of uint16 (65535)
     *      Maybe do this as an entirely separate test/file where that many random wallets are assigned
     *      There might be an issue of not enough utility token being available for this to happen
     */
    //it.skip('should fail if the pod operator limit has been reached', async () => {});
    it('Should allow external contract to call fn', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await HLGL1.transfer(MOCKL1.address, currentBondAmount);
      await expect(l1.operator.attach(MOCKL1.address).bondUtilityToken(MOCKL1.address, currentBondAmount, 1))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(MOCKL1.address, l1.operator.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(MOCKL1.address)).to.equal(currentBondAmount);
      expect(await l1.operator.getBondedPod(MOCKL1.address)).to.equal(BigNumber.from('1'));
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('topupUtilityToken()', async () => {
    it('should fail if operator is not bonded', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      expect(await l1.operator.getBondedPod(l1.wallet1.address)).to.equal(BigNumber.from('0'));
      await expect(
        l1.operator.connect(l1.wallet1).topupUtilityToken(l1.wallet1.address, currentBondAmount)
      ).to.be.revertedWith('HOLOGRAPH: operator not bonded');
    });
    it('successfully top up utility tokens', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      await HLGL1.transfer(l1.wallet1.address, currentBondAmount);
      expect(await l1.operator.getBondedPod(l1.deployer.address)).to.equal(BigNumber.from('1'));
      await expect(l1.operator.connect(l1.wallet1).topupUtilityToken(l1.deployer.address, currentBondAmount))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.wallet1.address, l1.operator.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.deployer.address)).to.equal(
        currentBondAmount.mul(BigNumber.from('2'))
      );
    });
  });

  describe('unbondUtilityToken()', async () => {
    it('should fail if the operator has not bonded', async () => {
      await expect(
        l1.operator.connect(l1.wallet2).unbondUtilityToken(l1.wallet2.address, l1.wallet2.address)
      ).to.be.revertedWith('HOLOGRAPH: operator not bonded');
    });
    it('should fail if the operator is not sender, and operator is not contract', async () => {
      await expect(
        l1.operator.connect(l1.wallet1).unbondUtilityToken(l1.deployer.address, l1.wallet1.address)
      ).to.be.revertedWith('HOLOGRAPH: operator not contract');
    });
    it('Should succeed if operator is contract and owned by sender', async () => {
      let currentBondAmount: BigNumber = await l1.operator.getBondedAmount(l1.sampleErc20Holographer.address);
      await expect(l1.operator.unbondUtilityToken(l1.sampleErc20Holographer.address, l1.deployer.address))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.operator.address, l1.deployer.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.sampleErc20Holographer.address)).to.equal(BigNumber.from('0'));
    });
    it('Should fail if operator is contract and not owned by sender', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let currentBondAmount: BigNumber = bondRequirements[1];
      // we will bond to SampleERC20 as an example
      await expect(l1.operator.bondUtilityToken(l1.sampleErc20Holographer.address, currentBondAmount, 1))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.deployer.address, l1.operator.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.sampleErc20Holographer.address)).to.equal(currentBondAmount);
      expect(await l1.operator.getBondedPod(l1.sampleErc20Holographer.address)).to.equal(BigNumber.from('1'));
      await expect(
        l1.operator.connect(l1.wallet1).unbondUtilityToken(l1.sampleErc20Holographer.address, l1.deployer.address)
      ).to.be.revertedWith('HOLOGRAPH: sender not owner');
    });
    it('should fail if the token transfer failed', async () => {
      let currentBalance: BigNumber = await HLGL1.balanceOf(l1.operator.address);
      await expect(
        l1.operator.adminCall(
          HLGL1.address,
          (
            await HLGL1.populateTransaction.transfer(l1.deployer.address, currentBalance)
          ).data as string
        )
      )
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.operator.address, l1.deployer.address, currentBalance);
      expect(await HLGL1.balanceOf(l1.operator.address)).to.equal(BigNumber.from('0'));
      await expect(l1.operator.unbondUtilityToken(l1.deployer.address, l1.deployer.address)).to.be.revertedWith(
        'ERC20: amount exceeds balance'
      );
      await HLGL1.transfer(l1.operator.address, currentBalance);
    });
    it('should successfully allow unbonding', async () => {
      let currentBondAmount: BigNumber = await l1.operator.getBondedAmount(l1.deployer.address);
      await expect(l1.operator.unbondUtilityToken(l1.deployer.address, l1.deployer.address))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.operator.address, l1.deployer.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(l1.deployer.address)).to.equal(BigNumber.from('0'));
    });
    it('Should allow external contract to call fn', async () => {
      let currentBondAmount: BigNumber = await l1.operator.getBondedAmount(MOCKL1.address);
      await expect(l1.operator.attach(MOCKL1.address).unbondUtilityToken(MOCKL1.address, l1.deployer.address))
        .to.emit(HLGL1, 'Transfer')
        .withArgs(l1.operator.address, l1.deployer.address, currentBondAmount);
      expect(await l1.operator.getBondedAmount(MOCKL1.address)).to.equal(BigNumber.from('0'));
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getBondedAmount()', async () => {
    it('should return expected _bondedOperators', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      expect(await l1.operator.getBondedAmount(l1.sampleErc20Holographer.address)).to.equal(bondRequirements[0]);
    });
    it('Should allow external contract to call fn', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      expect(await l1.operator.attach(MOCKL1.address).getBondedAmount(l1.sampleErc20Holographer.address)).to.equal(
        bondRequirements[0]
      );
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getBondedPod()', async () => {
    it('should return expected _bondedOperators', async () => {
      expect(await l1.operator.getBondedPod(l1.sampleErc20Holographer.address)).to.equal(BigNumber.from('1'));
    });
    it('Should allow external contract to call fn', async () => {
      expect(await l1.operator.attach(MOCKL1.address).getBondedPod(l1.sampleErc20Holographer.address)).to.equal(
        BigNumber.from('1')
      );
      // actually unbond afterwards
      await l1.operator.unbondUtilityToken(l1.sampleErc20Holographer.address, l1.deployer.address);
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('crossChainMessage()', async () => {
    it('Should successfully allow messaging address to call fn', async () => {
      let originalMessagingModule = await l1.operator.getMessagingModule();
      // generate payload
      let data: BytesLike = generateInitCode(
        ['address', 'address', 'uint256'],
        [l1.deployer.address, l2.deployer.address, bnHEX(1, 32)]
      );
      let payload: BytesLike = hValueTrim(await getRequestPayload(l1, l2, l1.sampleErc721Holographer.address, data));
      let gasEstimates: (string | BytesLike | BigNumber)[] = await getEstimatedGas(
        l1,
        l2,
        l1.sampleErc721Holographer.address,
        data,
        payload,
        true
      );
      payload = gasEstimates[0] as string;
      // this is to make sure it reverts
      let search: string = remove0x(l1.sampleErc721Holographer.address).toLowerCase();
      let replace: string = remove0x(zeroAddress);
      payload = payload.replace(search, replace);
      let payloadHash: string = HASH(payload);
      // temporarily set deployer as messaging module, to allow for easy sending
      await l1.operator.setMessagingModule(l1.deployer.address);
      // make call with deployer AS messaging module
      await expect(l1.operator.crossChainMessage(payload))
        .to.emit(l1.operator, 'AvailableOperatorJob')
        .withArgs(payloadHash, payload);
      availableJobs.push(payloadHash);
      availableJobs.push(payload as string);
      // return messaging module back to original address
      await l1.operator.setMessagingModule(originalMessagingModule);
    });
    it('Should fail to allow admin address to call fn', async () => {
      // just random bytes, along with gasPrice and gasLimit at the end
      let payload: string =
        randomHex(4) + randomHex(64, false) + bnHEX(1000000000, 32, false) + bnHEX(1000000, 32, false);
      let payloadHash: string = HASH(payload);
      await expect(l1.operator.crossChainMessage(payload)).to.be.revertedWith('HOLOGRAPH: messaging only call');
    });
    it('Should fail to allow random address to call fn', async () => {
      // just random bytes, along with gasPrice and gasLimit at the end
      let payload: string =
        randomHex(4) + randomHex(64, false) + bnHEX(1000000000, 32, false) + bnHEX(1000000, 32, false);
      let payloadHash: string = HASH(payload);
      await expect(l1.operator.connect(l1.wallet1).crossChainMessage(payload)).to.be.revertedWith(
        'HOLOGRAPH: messaging only call'
      );
    });
  });

  describe('getJobDetails()', async () => {
    it('should return expected operatorJob from valid jobHash', async () => {
      let jobHash: string = availableJobs[0];
      let operatorJob: string = JSON.stringify(await l1.operator.getJobDetails(jobHash));
      assert(
        operatorJob !=
          '[0,' +
            BLOCKTIME +
            ',"0x0000000000000000000000000000000000000000",0,{"type":"BigNumber","hex":"0x00"},[0,0,0,0,0]]',
        'valid job hash returns empty job details'
      );
    });
    it('should return expected operatorJob from INVALID jobHash', async () => {
      let jobHash: string = '0x' + '00'.repeat(32);
      let operatorJob: string = JSON.stringify(await l1.operator.getJobDetails(jobHash));
      assert(
        operatorJob ==
          '[0,' +
            BLOCKTIME +
            ',"0x0000000000000000000000000000000000000000",0,{"type":"BigNumber","hex":"0x00"},[0,0,0,0,0]]',
        'invalid job hash returns non-empty job details'
      );
    });
  });

  describe('** bond test operators **', async () => {
    it('should add 10 operator wallets on each chain', async function () {
      let bondAmounts: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let bondAmount: BigNumber = bondAmounts[0];
      for (let i = 0, l = wallets.length; i < l; i++) {
        let l1wallet: SignerWithAddress = l1[wallets[i]] as SignerWithAddress;
        let l2wallet: SignerWithAddress = l2[wallets[i]] as SignerWithAddress;
        await HLGL1.connect(l1wallet).approve(l1.operator.address, bondAmount);
        await expect(l1.operator.bondUtilityToken(l1wallet.address, bondAmount, 1)).to.not.be.reverted;
        await expect(l2.operator.bondUtilityToken(l2wallet.address, bondAmount, 1)).to.not.be.reverted;
      }
    });
  });

  describe('executeJob()', async () => {
    it('Should fail if job hash is not in _operatorJobs', async () => {
      let payload: string = randomHex(4) + '00'.repeat(64) + bnHEX(1000000000, 32, false) + bnHEX(1000000, 32, false);
      await expect(l1.operator.executeJob(payload)).to.be.revertedWith('HOLOGRAPH: invalid job');
    });
    it('Should fail if there is not enough gas', async () => {
      let payloadHash: string = availableJobs[0];
      let payload: string = availableJobs[1];
      let gasLimit: BigNumber = BigNumber.from('0x' + payload.substring(payload.length - 128, payload.length - 64));
      await expect(l1.operator.executeJob(payload, { gasLimit: gasLimit.div(BigNumber.from('2')) })).to.be.revertedWith(
        'HOLOGRAPH: not enough gas left'
      );
    });
    it('Should succeed executing a reverting job', async () => {
      let payloadHash: string = availableJobs.shift() as string;
      let payload: string = availableJobs.shift() as string;
      let gasLimit: BigNumber = BigNumber.from('0x' + payload.substring(payload.length - 128, payload.length - 64)).mul(
        BigNumber.from('2')
      );
      await expect(l1.operator.executeJob(payload, { gasLimit }))
        .to.emit(l1.operator, 'FailedOperatorJob')
        .withArgs(payloadHash);
    });
    it('Should succeed executing a job', async () => {
      operatorJobTokenId++;
      while (!(await createOperatorJob(l1, l2, operatorJobTokenId))) {
        operatorJobTokenId++;
      }
      let payloadHash: string = availableJobs.shift() as string;
      let payload: string = availableJobs.shift() as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let jobOperator = pickOperator(l1, operatorJob[2]);
      await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.not.be.reverted;
    });
    it('Should fail non-operator address tries to execute job', async () => {
      operatorJobTokenId++;
      while (!(await createOperatorJob(l1, l2, operatorJobTokenId, true))) {
        operatorJobTokenId++;
      }
      let payloadHash: string = availableJobs[0] as string;
      let payload: string = availableJobs[1] as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let jobOperator = pickOperator(l1, operatorJob[2], true);
      await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.be.revertedWith(
        'HOLOGRAPH: operator has time'
      );
    });
    it('Should fail if there has been a gas spike', async () => {
      let payloadHash: string = availableJobs[0] as string;
      let payload: string = availableJobs[1] as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let jobOperator = pickOperator(l1, operatorJob[2], true);
      process.stdout.write(' '.repeat(8) + 'sleeping for ' + BLOCKTIME + ' seconds...' + '\n');
      await sleep(1000 * BLOCKTIME); // gotta wait 60 seconds for operator opportunity to close
      await expect(
        l1.operator.connect(jobOperator).executeJob(payload, { gasPrice: GASPRICE.mul(BigNumber.from('2')) })
      ).to.be.revertedWith('HOLOGRAPH: gas spike detected');
    });
    it('Should fail if fallback is invalid', async () => {
      let payloadHash: string = availableJobs[0] as string;
      let payload: string = availableJobs[1] as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let fallbackOperator = (
        await l1.operator.callStatic['getPodOperators(uint256,uint256,uint256)'](1, operatorJob[5][0], 1)
      )[0];
      let jobOperator: SignerWithAddress = pickOperator(l1, fallbackOperator, true);
      // iterate and try again in case current job operator is selected
      while (jobOperator.address.toLowerCase() == operatorJob[2].toLowerCase()) {
        jobOperator = pickOperator(l1, fallbackOperator, true);
      }
      await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.be.revertedWith(
        'HOLOGRAPH: invalid fallback'
      );
    });
    it('Should succeed if fallback is valid (operator slashed)', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      let payloadHash: string = availableJobs.shift() as string;
      let payload: string = availableJobs.shift() as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let selectedOperator = operatorJob[2] as string;
      let selectedOperatorBondAmount: BigNumber = await l1.operator.getBondedAmount(selectedOperator);
      let fallbackOperator = (
        await l1.operator.callStatic['getPodOperators(uint256,uint256,uint256)'](1, operatorJob[5][0], 1)
      )[0];
      let jobOperator: SignerWithAddress = pickOperator(l1, fallbackOperator);
      let jobOperatorBondAmount: BigNumber = await l1.operator.getBondedAmount(jobOperator.address);
      await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.not.be.reverted;
      expect(await l1.operator.getBondedAmount(selectedOperator)).to.equal(
        selectedOperatorBondAmount.sub(bondRequirements[0])
      );
      expect(await l1.operator.getBondedPod(selectedOperator)).to.equal(BigNumber.from('0'));
      expect(await l1.operator.getBondedAmount(jobOperator.address)).to.equal(
        jobOperatorBondAmount.add(bondRequirements[0])
      );
      // add slashed operator back
      await expect(l1.operator.bondUtilityToken(selectedOperator, bondRequirements[1], 1)).to.not.be.reverted;
    });
    it('Should succeed if fallback is valid (operator has enough tokens to stay)', async () => {
      let bondRequirements: BigNumber[] = await l1.operator.getPodBondAmounts(1);
      // since there is no way to know which operator will be selected, all will be topped up in preparation for slashing
      let wallet: SignerWithAddress;
      for (let i = 0, l = wallets.length; i < l; i++) {
        wallet = l1[wallets[i]] as SignerWithAddress;
        await l1.operator.topupUtilityToken(wallet.address, bondRequirements[1]);
      }
      operatorJobTokenId++;
      while (!(await createOperatorJob(l1, l2, operatorJobTokenId, true))) {
        operatorJobTokenId++;
      }
      let payloadHash: string = availableJobs.shift() as string;
      let payload: string = availableJobs.shift() as string;
      let operatorJob = await l1.operator.getJobDetails(payloadHash);
      let selectedOperator = operatorJob[2] as string;
      let selectedOperatorBondAmount: BigNumber = await l1.operator.getBondedAmount(selectedOperator);
      let fallbackOperator = (
        await l1.operator.callStatic['getPodOperators(uint256,uint256,uint256)'](1, operatorJob[5][0], 1)
      )[0];
      let jobOperator = pickOperator(l1, fallbackOperator);
      let jobOperatorBondAmount: BigNumber = await l1.operator.getBondedAmount(jobOperator.address);
      process.stdout.write(' '.repeat(8) + 'sleeping for ' + BLOCKTIME + ' seconds...' + '\n');
      await sleep(1000 * BLOCKTIME); // gotta wait 60 seconds for operator opportunity to close
      await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.not.be.reverted;
      expect(await l1.operator.getBondedAmount(selectedOperator)).to.equal(
        selectedOperatorBondAmount.sub(bondRequirements[0])
      );
      expect(await l1.operator.getBondedPod(selectedOperator)).to.equal(BigNumber.from(operatorJob[0] as number));
      expect(await l1.operator.getBondedAmount(jobOperator.address)).to.equal(
        jobOperatorBondAmount.add(bondRequirements[0])
      );
    });
    it('Should succeed executing 20 jobs', async () => {
      for (let i = 0, l = 20; i < l; i++) {
        if (zeroAddressJobs.length == 0) {
          operatorJobTokenId++;
          await createOperatorJob(l1, l2, operatorJobTokenId);
        }
        let targetArray = availableJobs;
        if (availableJobs.length == 0) {
          targetArray = zeroAddressJobs;
        }
        let payloadHash: string = targetArray.shift() as string;
        let payload: string = targetArray.shift() as string;
        let operatorJob = await l1.operator.getJobDetails(payloadHash);
        let jobOperator = pickOperator(l1, operatorJob[2]);
        await expect(l1.operator.connect(jobOperator).executeJob(payload)).to.not.be.reverted;
        process.stdout.write(
          ' '.repeat(8) + '[' + (i + 1).toString().padStart(3, '0') + '] executed by ' + jobOperator.address + '\n'
        );
      }
    });
  });

  describe('send()', async () => {
    it.skip('should fail if "toChainId" provided a string', async () => {});
    it.skip('should fail if "toChainId" provided a value larger than uint32', async () => {});
  });

  describe('getMessagingModule()', async () => {
    it.skip('Should return valid _messagingModuleSlot', async () => {});
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setMessagingModule()', async () => {
    it.skip('should allow admin to alter _messagingModuleSlot', async () => {});
    it.skip('should fail to allow owner to alter _messagingModuleSlot', async () => {});
    it.skip('should fail to allow non-owner to alter _messagingModuleSlot', async () => {});
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getBridge()', async () => {
    it.skip('Should return valid _bridgeSlot', async () => {});
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setBridge()', async () => {
    it.skip('should allow admin to alter _bridgeSlot', async () => {});
    it.skip('should fail to allow owner to alter _bridgeSlot', async () => {});
    it.skip('should fail to allow non-owner to alter _bridgeSlot', async () => {});
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getRegistry()', async () => {
    it('Should return valid _registrySlot', async () => {
      expect(await l1.operator.getRegistry()).to.equal(l1.registry.address);
    });
    it('Should allow external contract to call fn', async () => {
      const registryAddress = await l1.operator.attach(MOCKL1.address).callStatic.getRegistry();
      assert.deepEqual(registryAddress, l1.registry.address);
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setRegistry()', async () => {
    it('should allow admin to alter _registrySlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await l1.operator.connect(l1.deployer).setRegistry(randomAddress);
      expect(await l1.operator.getRegistry()).to.equal(randomAddress);
    });
    it('should fail to allow owner to alter _registrySlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet1).setRegistry(randomAddress)).to.be.revertedWith(ONLY_ADMIN_ERROR_MSG);
    });
    it('should fail to allow non-owner to alter _registrySlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet10).setRegistry(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it.skip('Should allow external contract to call fn');
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getHolograph()', async () => {
    it('Should return valid _holographSlot', async () => {
      expect(await l1.operator.getHolograph()).to.equal(l1.holograph.address);
    });
    it('Should allow external contract to call fn', async () => {
      const holographAddress = await l1.operator.attach(MOCKL1.address).callStatic.getHolograph();
      assert.deepEqual(holographAddress, l1.holograph.address);
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setHolograph()', async () => {
    it('should allow admin to alter _holographSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await l1.operator.connect(l1.deployer).setHolograph(randomAddress);
      expect(await l1.operator.getHolograph()).to.equal(randomAddress);
    });
    it('should fail to allow owner to alter _holographSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet1).setHolograph(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it('should fail to allow non-owner to alter _holographSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet10).setHolograph(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('getInterfaces()', async () => {
    it('Should return valid _interfacesSlot', async () => {
      expect(await l1.operator.getInterfaces()).to.equal(l1.holographInterfaces.address);
    });
    it('Should allow external contract to call fn', async () => {
      const interfacesAddress = await l1.operator.attach(MOCKL1.address).callStatic.getInterfaces();
      assert.deepEqual(interfacesAddress, l1.holographInterfaces.address);
    });
    it('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setInterfaces()', async () => {
    it('should allow admin to alter _interfacesSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await l1.operator.connect(l1.deployer).setInterfaces(randomAddress);
      expect(await l1.operator.getInterfaces()).to.equal(randomAddress);
    });
    it('should fail to allow owner to alter _interfacesSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet1).setInterfaces(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it('should fail to allow non-owner to alter _interfacesSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet10).setInterfaces(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
  });

  describe('getUtilityToken()', async () => {
    it.skip('Should return valid _utilityTokenSlot');
    it('Should allow external contract to call fn', async () => {
      await expect(l1.operator.attach(MOCKL1.address).callStatic.getUtilityToken()).to.not.be.reverted;
    });
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('setUtilityToken()', async () => {
    it('should allow admin to alter _utilityTokenSlot');
    it('should fail to allow owner to alter _utilityTokenSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet1).setUtilityToken(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it('should fail to allow non-owner to alter _utilityTokenSlot', async () => {
      const randomAddress = '0x' + '1'.repeat(40);
      await expect(l1.operator.connect(l1.wallet10).setUtilityToken(randomAddress)).to.be.revertedWith(
        ONLY_ADMIN_ERROR_MSG
      );
    });
    it.skip('Should allow external contract to call fn', async () => {});
    it.skip('should fail to allow inherited contract to call fn', async () => {});
  });

  describe('_bridge()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_bridge');
    });
  });

  describe('_holograph()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_holograph');
    });
  });

  describe('_interfaces()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_interfaces');
    });
  });

  describe('_messagingModule()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_messagingModule');
    });
  });

  describe('_registry()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_registry');
    });
  });

  describe('_utilityToken()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_utilityToken');
    });
  });

  describe('_jobNonce()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_jobNonce');
    });
  });

  describe('_popOperator()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_popOperator');
    });
  });

  describe('_getBaseBondAmount()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_getBaseBondAmount');
    });
  });

  describe('_getCurrentBondAmount()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_getCurrentBondAmount');
    });
  });

  describe('_randomBlockHash()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_randomBlockHash');
    });
  });

  describe('_isContract()', async () => {
    it('is private function', async () => {
      testPrivateFunction('_isContract');
    });
  });
});
