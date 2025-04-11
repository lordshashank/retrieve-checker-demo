// DealRetrieveSLA contract interface
export const DealRetrieveSLAContract = {
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with your actual contract address
  abi: [
    // Owner functions
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'registerStorageProvider',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'removeStorageProvider',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'addMoreStake',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    
    // Read functions
    {
      inputs: [],
      name: 'minimumStake',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getRegisteredSpActorIds',
      outputs: [{ name: '', type: 'uint64[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'getProviderStake',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'isProviderRegistered',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'actorId', type: 'uint64' }],
      name: 'getProviderStats',
      outputs: [
        {
          components: [
            { name: 'totalDisputes', type: 'uint256' },
            { name: 'pendingDisputes', type: 'uint256' },
            { name: 'resolvedDisputes', type: 'uint256' },
            { name: 'failedDisputes', type: 'uint256' },
            { name: 'rejectedDisputes', type: 'uint256' }
          ],
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function',
    },
    
    // Write functions for disputes
    {
      inputs: [
        { name: 'dealId', type: 'uint64' },
        { name: 'reason', type: 'string' }
      ],
      name: 'raiseDispute',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [{ name: 'baseDisputeId', type: 'uint256' }],
      name: 'processResolvedDispute',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ]
};

export const DealRetrieveSLA = {
  address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_retrieveCheckerAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_minimumStake",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_disputeRaiserRewardPercentage",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ActorNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailToCallActor",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "addr",
          "type": "bytes"
        }
      ],
      "name": "InvalidAddress",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "name": "InvalidCodec",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidResponseLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "NotEnoughBalance",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "baseDisputeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "enum RetrieveChecker.DisputeStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "penaltyAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "raiserReward",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "clientReward",
          "type": "uint256"
        }
      ],
      "name": "DisputeProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "baseDisputeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "raiser",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        },
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "isString",
              "type": "bool"
            }
          ],
          "indexed": false,
          "internalType": "struct CommonTypes.DealLabel",
          "name": "dealLabel",
          "type": "tuple"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        }
      ],
      "name": "DisputeRaised",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "disputeRaiserPercentage",
          "type": "uint8"
        }
      ],
      "name": "RewardPercentagesUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stakedAmount",
          "type": "uint256"
        }
      ],
      "name": "StorageProviderRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        }
      ],
      "name": "StorageProviderRemoved",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "addMoreStake",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "dealDisputes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "baseDisputeId",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        },
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "isString",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.DealLabel",
          "name": "dealLabel",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        },
        {
          "internalType": "uint64",
          "name": "providerActorId",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "raiser",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "disputeRaiserRewardPercentage",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getAllDealData",
      "outputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "isString",
                  "type": "bool"
                }
              ],
              "internalType": "struct CommonTypes.DealLabel",
              "name": "dealLabel",
              "type": "tuple"
            },
            {
              "internalType": "uint64",
              "name": "dealClientActorId",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "dealProviderActorId",
              "type": "uint64"
            },
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "uint64",
                  "name": "size",
                  "type": "uint64"
                }
              ],
              "internalType": "struct MarketTypes.GetDealDataCommitmentReturn",
              "name": "dealCommitment",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "CommonTypes.ChainEpoch",
                  "name": "start",
                  "type": "int64"
                },
                {
                  "internalType": "CommonTypes.ChainEpoch",
                  "name": "duration",
                  "type": "int64"
                }
              ],
              "internalType": "struct MarketTypes.GetDealTermReturn",
              "name": "dealTerm",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "val",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "neg",
                  "type": "bool"
                }
              ],
              "internalType": "struct CommonTypes.BigInt",
              "name": "dealPricePerEpoch",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "val",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "neg",
                  "type": "bool"
                }
              ],
              "internalType": "struct CommonTypes.BigInt",
              "name": "clientCollateral",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "val",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "neg",
                  "type": "bool"
                }
              ],
              "internalType": "struct CommonTypes.BigInt",
              "name": "providerCollateral",
              "type": "tuple"
            },
            {
              "internalType": "bool",
              "name": "isDealActivated",
              "type": "bool"
            },
            {
              "components": [
                {
                  "internalType": "CommonTypes.ChainEpoch",
                  "name": "activated",
                  "type": "int64"
                },
                {
                  "internalType": "CommonTypes.ChainEpoch",
                  "name": "terminated",
                  "type": "int64"
                }
              ],
              "internalType": "struct MarketTypes.GetDealActivationReturn",
              "name": "activationStatus",
              "type": "tuple"
            }
          ],
          "internalType": "struct DealInfo.DealData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getClientCollateral",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "val",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "neg",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.BigInt",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealActivationStatus",
      "outputs": [
        {
          "components": [
            {
              "internalType": "CommonTypes.ChainEpoch",
              "name": "activated",
              "type": "int64"
            },
            {
              "internalType": "CommonTypes.ChainEpoch",
              "name": "terminated",
              "type": "int64"
            }
          ],
          "internalType": "struct MarketTypes.GetDealActivationReturn",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealClient",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealCommitment",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "uint64",
              "name": "size",
              "type": "uint64"
            }
          ],
          "internalType": "struct MarketTypes.GetDealDataCommitmentReturn",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseDisputeId",
          "type": "uint256"
        }
      ],
      "name": "getDealDisputeDetails",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        },
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "isString",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.DealLabel",
          "name": "dealLabel",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "providerAddress",
          "type": "bytes"
        },
        {
          "internalType": "uint64",
          "name": "providerActorId",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "enum RetrieveChecker.DisputeStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealLabel",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "isString",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.DealLabel",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealProvider",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealTerm",
      "outputs": [
        {
          "components": [
            {
              "internalType": "CommonTypes.ChainEpoch",
              "name": "start",
              "type": "int64"
            },
            {
              "internalType": "CommonTypes.ChainEpoch",
              "name": "duration",
              "type": "int64"
            }
          ],
          "internalType": "struct MarketTypes.GetDealTermReturn",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealTotalPrice",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "val",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "neg",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.BigInt",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getDealVerification",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "raiser",
          "type": "address"
        }
      ],
      "name": "getDisputesByRaiser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "baseDisputeId",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "dealId",
              "type": "uint64"
            },
            {
              "components": [
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "isString",
                  "type": "bool"
                }
              ],
              "internalType": "struct CommonTypes.DealLabel",
              "name": "dealLabel",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "providerAddress",
              "type": "bytes"
            },
            {
              "internalType": "uint64",
              "name": "providerActorId",
              "type": "uint64"
            },
            {
              "internalType": "string",
              "name": "reason",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "raiser",
              "type": "address"
            }
          ],
          "internalType": "struct DealRetrieveSLA.DealDispute[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGlobalDisputeStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalDisputes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pendingDisputes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "resolvedDisputes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "failedDisputes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "rejectedDisputes",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        }
      ],
      "name": "getProviderCollateral",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "val",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "neg",
              "type": "bool"
            }
          ],
          "internalType": "struct CommonTypes.BigInt",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "getProviderDisputes",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "getProviderFailedDisputes",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "getProviderPendingDisputes",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "getProviderStake",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "getProviderStats",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "totalDisputes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pendingDisputes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "resolvedDisputes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "failedDisputes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "rejectedDisputes",
              "type": "uint256"
            }
          ],
          "internalType": "struct DealRetrieveSLA.ProviderStats",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRegisteredSpActorIds",
      "outputs": [
        {
          "internalType": "uint64[]",
          "name": "",
          "type": "uint64[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "isProviderRegistered",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minimumStake",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseDisputeId",
          "type": "uint256"
        }
      ],
      "name": "processResolvedDispute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "processedDisputes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "providerDisputes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "dealId",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "raiseDispute",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "registerStorageProvider",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "registeredSPActorIds",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "registeredStorageProviders",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "actorId",
          "type": "uint64"
        }
      ],
      "name": "removeStorageProvider",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retrieveChecker",
      "outputs": [
        {
          "internalType": "contract RetrieveChecker",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newMinimumStake",
          "type": "uint256"
        }
      ],
      "name": "setMinimumStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "raiserPercentage",
          "type": "uint8"
        }
      ],
      "name": "setRewardPercentages",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "storageProviderStakes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
};
