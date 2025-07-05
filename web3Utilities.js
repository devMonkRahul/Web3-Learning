import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

const web3 = new Web3(
  `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
);

// console.log(web3.utils);

// web3.eth.getGasPrice().then((result) => {
//     console.log(web3.utils.fromWei(result, 'ether') + " ETH");
// })

// console.log(web3.utils.sha3("Hello"))
// console.log(web3.utils.soliditySha3("Hello"))
// console.log(web3.utils.soliditySha3Raw("Hello"))
// console.log(web3.utils.keccak256("Hello"))

// console.log(web3.utils.randomHex(32));


