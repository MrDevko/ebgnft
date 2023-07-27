"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;

let web3G;
let web3E;
let wormContract = "0xB17204068f45997aEDD40a7fb33Cb6b4C81B41E4";
let marketplaceContract = "0x63376C721eE9081E72F0CACED6F5c7a17B34F2CE";
let NFTContract = "0x01a8f00C64bBcbFe80087a14e9cC48001e8CB810";
let stakingContract = "0x39b3B9beA1aF40812B238E72F2BF6448F019cF76";
let itemsLoaded = {};
let currentFilter = null;
let abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_type",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_enabled",
        type: "bool",
      },
    ],
    name: "addItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_itemId",
        type: "uint256",
      },
    ],
    name: "buyItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      {
        internalType: "uint256",
        name: "_itemId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_type",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_enabled",
        type: "bool",
      },
    ],
    name: "editItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "getAvailableItems",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_image",
            type: "string",
          },
          {
            internalType: "string",
            name: "_type",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_quantity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_price",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_enabled",
            type: "bool",
          },
        ],
        internalType: "struct EarlyBirdsMarketplace.Item[]",
        name: "",
        type: "tuple[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSoldItems",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_image",
            type: "string",
          },
          {
            internalType: "string",
            name: "_type",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_quantity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_price",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_enabled",
            type: "bool",
          },
        ],
        internalType: "struct EarlyBirdsMarketplace.Item[]",
        name: "",
        type: "tuple[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Items",
    outputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_type",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_enabled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "itemId",
        type: "uint256",
      },
    ],
    name: "quantityLeftForItem",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "totalStakedBy",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

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
async function isMatic() {
  let chainId = await web3G.eth.getChainId();
  if (chainId == 137) {
    return true;
  } else {
    return false;
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
async function connect() {
  if (window.web3 == undefined && window.ethereum == undefined) {
    window.open("https://metamask.app.link/dapp/ebgnft.xyz", "_blank").focus();
  }
  provider = await web3Modal.connect();
  provider.on("accountsChanged", (accounts) => {
    disconnect();
  });
  web3G = new Web3(provider);
  web3E = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/c4321e8694634f0aaa461d82f9979390"));
  await fetchAccountData();
  let nftCTemp = new web3E.eth.Contract(abi, NFTContract);
  let stakingCTemp = new web3E.eth.Contract(abi, stakingContract);
  if ((await nftCTemp.methods.balanceOf(selectedAccount).call()) == 0 && (await stakingCTemp.methods.totalStakedBy(selectedAccount).call()) == 0 && selectedAccount !== "0x00000040f69B8E3382734491cBAA241B6a863AB3") {
    toastr.error("Holders access only.");
    return;
  }
  if (selectedAccount) {
    if (isMatic()) {
      loadItems();

      try {
        const wormsC = new web3G.eth.Contract(abi, wormContract);
        let balance = await wormsC.methods.balanceOf(selectedAccount).call();
        let parsedBalance = parseFloat(web3G.utils.fromWei(balance.toString(), "ether")).toFixed(3);
        document.getElementById("wormsBalance").innerHTML = `<img style="height: 25px;" src="../images/coin.gif">BALANCE: ${parsedBalance == "0.000" ? "0" : parsedBalance}`;
      } catch (error) {
        console.log(error);
      }
      document.getElementById("martS").classList.remove("d-none");
      document.getElementById("connectSection").classList.add("d-none");
      toastr.success("Connected");
      isConnected = true;
    }
  }
}

async function loadItems() {
  // polygon
  itemsLoaded = {};
  const marketplaceC = new web3G.eth.Contract(abi, marketplaceContract);
  document.getElementById("martSection").innerHTML = "";

  marketplaceC.methods
    .getAvailableItems()
    .call()
    .then((itemsAvailable) => {
      itemsAvailable[0].forEach(async (item, index) => {
        let quantityLeft = await marketplaceC.methods.quantityLeftForItem(itemsAvailable[1][index]).call();
        let price = parseFloat(web3G.utils.fromWei(item._price.toString(), "ether")).toFixed(2);
        let itemHtml = `<div class="col-6 col-lg-4 col-xl-3 mb-3">
            <div class="ebg-card">
                <img class="ebg-card-image" src="${item._image}">
                <h6 class="font2 text-light pt-2">${item._name}</h6>
                <div class="font2 m-1">
                    <small style="color:#5D30F0">${quantityLeft} of ${item._quantity} Remaining</small>
                </div>
                <div style="display:flex">
                    <h6 class="font2 mt-3 text-light text-start ms-2 me-auto" style="display:inline-block;">
                        <img style="height: 25px;" src="../images/coin.gif">${price}</h6>
                    <a href="#" onclick="buyItem(${itemsAvailable[1][index]},'${item._price}');" class="font2 btnsty"
                        style="display:inline-block;">CLAIM</a>
                </div>
            </div>
            </div>`;
        document.getElementById("martSection").innerHTML += itemHtml;

        let type = item._type.replace(/\s/g, "");
        if (itemsLoaded[type] == undefined) {
          itemsLoaded[type] = [itemHtml];
        } else {
          itemsLoaded[type].push(itemHtml);
        }

        if (index == itemsAvailable[0].length - 1) {
          loadFilter();
        }
      });
    });
  marketplaceC.methods
    .getSoldItems()
    .call()
    .then((itemsSold) => {
      itemsSold[0].forEach(async (item, index) => {
        let quantityLeft = await marketplaceC.methods.quantityLeftForItem(itemsSold[1][index]).call();
        let price = parseFloat(web3G.utils.fromWei(item._price.toString(), "ether")).toFixed(2);
        let itemHtml = `<div class="col-6 col-lg-4 col-xl-3 mb-3">
            <div class="ebg-card">
                <img class="ebg-card-image" src="${item._image}">
                <h6 class="font2 text-light pt-2">${item._name}</h6>
                <div class="font2 m-1">
                    <small style="color:#5D30F0">Sold Out</small>
                </div>
                <div style="display:flex">
                    <h6 class="font2 mt-3 text-light text-start ms-2 me-auto" style="display:inline-block;">
                        <img style="height: 25px;" src="../images/coin.gif">${price}</h6>
                    <a  class="font2 btnsty"
                        style="display:inline-block;">SOLD</a>
                </div>
            </div>
            </div>`;
        document.getElementById("martSection").innerHTML += itemHtml;

        let type = "SOLD OUT";
        if (itemsLoaded[type] == undefined) {
          itemsLoaded[type] = [itemHtml];
        } else {
          itemsLoaded[type].push(itemHtml);
        }

        if (index == itemsSold[0].length - 1) {
          loadFilter();
        }
      });
    });
}

function loadFilter() {
  document.getElementById("filterSection").innerHTML = "";
  Object.keys(itemsLoaded).forEach((itemType) => {
    document.getElementById("filterSection").innerHTML += `<div class="col-12">
        <div class="ebg-card mb-1 py-1 pointer-card" id="filter-${itemType}" onclick="filter('${itemType}');">
            <h6 class="font2 text-light pt-2" >${itemType} (${itemsLoaded[itemType].length})</h6>
        </div>
    </div>`;
  });
}

function filter(id) {
  if (currentFilter == id) {
    resetFiler();
    currentFilter = null;
  } else {
    resetFiler();
    currentFilter = id;
    document.getElementById("filter-" + id).classList.add("selected-card");
  }
  document.getElementById("martSection").innerHTML = "";
  if (currentFilter == null) {
    Object.values(itemsLoaded).forEach((itemsByType) => {
      itemsByType.forEach((item) => {
        document.getElementById("martSection").innerHTML += item;
      });
    });
  } else {
    itemsLoaded[id].forEach((item) => {
      document.getElementById("martSection").innerHTML += item;
    });
  }
}

function resetFiler() {
  Object.keys(itemsLoaded).forEach((itemType) => {
    if (document.getElementById("filter-" + itemType)) {
      document.getElementById("filter-" + itemType).classList.remove("selected-card");
    }
  });
}

async function buyItem(itemId, price) {
  const marketplaceC = new web3G.eth.Contract(abi, marketplaceContract);
  const wormsC = new web3G.eth.Contract(abi, wormContract);
  let allowance = await wormsC.methods.allowance(selectedAccount, marketplaceContract).call();
  console.log(allowance);
  if (web3G.utils.fromWei(allowance.toString(), "ether") >= web3G.utils.fromWei(price.toString(), "ether")) {
    marketplaceC.methods
      .buyItem(itemId)
      .send({
        from: selectedAccount,
      })
      .then((status) => {
        loadItems();
      });
  } else {
    wormsC.methods
      .approve(marketplaceContract, web3G.utils.toWei("100000".toString(), "ether").toString())
      .send({
        from: selectedAccount,
      })
      .then((state) => {
        console.log(state);
        if (state) {
          marketplaceC.methods
            .buyItem(itemId)
            .send({
              from: selectedAccount,
            })
            .then((status) => {
              loadItems();
            });
        }
      });
  }
}

async function approve100() {
  if ((await isMatic()) == false) {
    return;
  }
  const wormsC = new web3G.eth.Contract(abi, wormContract);
  wormsC.methods
    .approve(marketplaceContract, web3G.utils.toWei("10000000".toString(), "ether").toString())
    .send({
      from: selectedAccount,
      maxFeePerGas: "0x8BB2C97000",
      maxPriorityFeePerGas: "0x104C533C00",
      type: "0x2",
    })
    .then((state) => {

    });
}
function addWorms() {
  ethereum
    .request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0xB17204068f45997aEDD40a7fb33Cb6b4C81B41E4",
          symbol: "$WORMS",
          decimals: 18,
          image: "https://ebgnft.xyz/images/coin.gif",
        },
      },
    })
    .then((success) => {
      if (success) {
        console.log("$WORMS successfully added to wallet!");
      } else {
        // throw new Error('Something went wrong.');
      }
    })
    .catch(console.error);
}
window.addEventListener("load", async () => {
  init();
});
