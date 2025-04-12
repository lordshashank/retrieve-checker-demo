export const RetrieveChecker = {
    address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}` || "0xD708573EdaeF9B2C4ce5242742bff99C0C3d7298",
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
            "name": "_disputeFee",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "disputeId",
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
            "internalType": "bytes",
            "name": "cid",
            "type": "bytes"
          },
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "spActorId",
            "type": "uint64"
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
            "internalType": "uint256",
            "name": "disputeId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "enum RetrieveChecker.DisputeStatus",
            "name": "status",
            "type": "uint8"
          }
        ],
        "name": "DisputeResolved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newCheckerAddress",
            "type": "address"
          }
        ],
        "name": "RetrieveCheckerChanged",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "currentDisputeId",
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
        "name": "disputeFee",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "disputes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "disputeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "raiser",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "cid",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "spActorId",
            "type": "uint64"
          },
          {
            "internalType": "enum RetrieveChecker.DisputeStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "resolutionTimestamp",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "disputesByAddress",
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
        "name": "freeDisputeLimit",
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
            "internalType": "uint256",
            "name": "disputeId",
            "type": "uint256"
          }
        ],
        "name": "getDisputeDetails",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "raiser",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "cid",
                "type": "bytes"
              },
              {
                "internalType": "uint64",
                "name": "spActorId",
                "type": "uint64"
              },
              {
                "internalType": "enum RetrieveChecker.DisputeStatus",
                "name": "status",
                "type": "uint8"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "resolutionTimestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct RetrieveChecker.Dispute",
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
            "name": "disputeId",
            "type": "uint256"
          }
        ],
        "name": "getDisputeStatus",
        "outputs": [
          {
            "internalType": "enum RetrieveChecker.DisputeStatus",
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
            "internalType": "enum RetrieveChecker.DisputeStatus",
            "name": "status",
            "type": "uint8"
          }
        ],
        "name": "getDisputesByStatus",
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
            "internalType": "bytes",
            "name": "cid",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "spActorId",
            "type": "uint64"
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
            "internalType": "uint256",
            "name": "disputeId",
            "type": "uint256"
          },
          {
            "internalType": "enum RetrieveChecker.DisputeStatus",
            "name": "newStatus",
            "type": "uint8"
          }
        ],
        "name": "resolveDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "retrieveCheckerAddress",
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
            "name": "_disputeFee",
            "type": "uint256"
          }
        ],
        "name": "setDisputeFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_freeDisputeLimit",
            "type": "uint256"
          }
        ],
        "name": "setFreeDisputeLimit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newCheckerAddress",
            "type": "address"
          }
        ],
        "name": "setRetrieveCheckerAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address payable",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "withdrawFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
}