const ChainId = {
  evm2hlg: function (evmChainId: number): number {
    switch (evmChainId) {
      // local
      case 1338:
        return 4294967294;
      // local2
      case 1339:
        return 4294967293;
      default:
        return 0;
    }
  },
  hlg2evm: function (hlgChainId: number): number {
    switch (hlgChainId) {
      // local
      case 4294967294:
        return 1338;
      // local2
      case 4294967293:
        return 1339;
      default:
        return 0;
    }
  },
  lz2hlg: function (lzChainId: number): number {
    switch (lzChainId) {
      // local
      case 65535:
        return 4294967294;
      // local2
      case 65534:
        return 4294967293;
      default:
        return 0;
    }
  },
  hlg2lz: function (hlgChainId: number): number {
    switch (hlgChainId) {
      // local
      case 4294967294:
        return 65535;
      // local2
      case 4294967293:
        return 65534;
      default:
        return 0;
    }
  },
};

export default ChainId;
