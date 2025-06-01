// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PythStructs {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }
}

interface IPyth {
    function getPriceUnsafe(bytes32 id) external view returns (PythStructs.Price memory);
}
