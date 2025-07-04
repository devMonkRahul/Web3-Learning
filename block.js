import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

const web3 = new Web3(
  `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
);

const block = await web3.eth.getBlock(
  22845755
);
console.log({
  blockHash: block.hash,
  blockNumber: block.number
});
