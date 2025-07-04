import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();
const sepolia = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
const mainnet = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
const web3 = new Web3(mainnet);

const abi = [
  {
    constant: false,
    inputs: [{ name: "newImplementation", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "newImplementation", type: "address" },
      { name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newAdmin", type: "address" }],
    name: "changeAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_implementation", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousAdmin", type: "address" },
      { indexed: false, name: "newAdmin", type: "address" },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "implementation", type: "address" }],
    name: "Upgraded",
    type: "event",
  },
];
const contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const contract = new web3.eth.Contract(abi, contractAddress);
const event = await contract.getPastEvents("allEvents", {
    fromBlock: 22844474,
    toBlock: "latest",
});

console.log(event.length);
