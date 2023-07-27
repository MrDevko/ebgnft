"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;

let web3E;
let web3G;
let stakingContract = "0x39b3B9beA1aF40812B238E72F2BF6448F019cF76";
let stakingC = undefined;

let abi = [{
  "inputs": [
    {
      "internalType": "uint256[]",
      "name": "tokenIds",
      "type": "uint256[]"
    },
    {
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }
  ],
  "name": "transferOwnershipOfTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

async function init() {
  const providerOptions = {};
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    disableInjectedProvider: false,
  });
  try {
    if (window.ethereum.selectedAddress !== null) {
      connect();
    }
  } catch (error) {}
}
async function fetchAccountData() {
  try {
    const accounts = await web3G.eth.getAccounts();
    selectedAccount = accounts[0];
  } catch (error) {}
}

async function connect() {
  if (window.web3 == undefined && window.ethereum == undefined) {
    window.open("https://metamask.app.link/dapp/mapi.ebgNft.xyz", "_blank").focus();
  }
  provider = await web3Modal.connect();
  provider.on("accountsChanged", (accounts) => {
    disconnect();
  });
  web3G = new Web3(provider);

  if (await isETH()) {
    document.getElementById("transferS").classList.remove("d-none");
    document.getElementById("connectSection").classList.add("d-none");
    web3E = new Web3(provider);

    stakingC = new web3E.eth.Contract(abi, stakingContract);
  }

  await fetchAccountData();

  if (selectedAccount) {
    toastr.success("Connected");
    isConnected = true;
  }
}
async function isETH() {
  let chainId = await web3G.eth.getChainId();
  if (chainId == 1) {
    return true;
  } else {
    return false;
  }
}
async function transfer() {
  let tokenIds = JSON.parse(document.getElementById("tokenIds").value);
  let address = document.getElementById("address").value;

  stakingC.methods
    .transferOwnershipOfTokens(tokenIds, address)
    .send({
      from: selectedAccount,
    })
    .then((status) => {
      loadTokens();
    });
}

window.addEventListener("load", async () => {
  init();
});
