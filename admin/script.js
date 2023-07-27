"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;
let marketplaceContract = "0x63376C721eE9081E72F0CACED6F5c7a17B34F2CE";
let abi = [
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
    name: "_nextItemId",
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
        internalType: "uint256",
        name: "itemId",
        type: "uint256",
      },
    ],
    name: "getClaimersOf",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
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
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
}
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
async function fetchItem() {
  if (isConnected == false) {
    await connect();
  }
  let web3 = new Web3(provider);
  const marketplaceC = new web3.eth.Contract(abi, marketplaceContract);

  marketplaceC.methods
    .Items(document.getElementById("edit_id").value)
    .call({
      from: selectedAccount,
    })
    .then((item) => {
      document.getElementById("edit_name").value = item._name;
      document.getElementById("edit_image").value = item._image;
      document.getElementById("edit_type").value = item._type;
      document.getElementById("edit_quantity").value = item._quantity;
      document.getElementById("edit_price").value = web3.utils.fromWei(item._price, "ether");
      document.getElementById("edit_enabled").checked = item._enabled;
    });
}
async function downloadList() {
  if (isConnected == false) {
    await connect();
  }
  let web3 = new Web3(provider);
  const marketplaceC = new web3.eth.Contract(abi, marketplaceContract);

  marketplaceC.methods
    .getClaimersOf(document.getElementById("download_id").value)
    .call({
      from: selectedAccount,
    })
    .then((claimers) => {
      downloadObjectAsJson(claimers, "all");

      let unique = claimers.filter(onlyUnique);
      downloadObjectAsJson(unique, "unique");
    });
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function editItem() {
  if (isConnected == false) {
    await connect();
  }
  let web3 = new Web3(provider);
  const marketplaceC = new web3.eth.Contract(abi, marketplaceContract);

  marketplaceC.methods
    .editItem(
      document.getElementById("edit_id").value,
      document.getElementById("edit_name").value,
      document.getElementById("edit_image").value,
      document.getElementById("edit_type").value,
      document.getElementById("edit_quantity").value,

      web3.utils.toWei(document.getElementById("edit_price").value.toString(), "ether"),
      document.getElementById("edit_enabled").checked
    )
    .send({
      from: selectedAccount,
    })
    .then((status) => {
      toastr.success("Edited");
    });
}

async function addItem() {
  if (isConnected == false) {
    await connect();
  }
  let web3 = new Web3(provider);
  const marketplaceC = new web3.eth.Contract(abi, marketplaceContract);

  marketplaceC.methods
    .addItem(
      document.getElementById("add_name").value,
      document.getElementById("add_image").value,
      document.getElementById("add_type").value,
      document.getElementById("add_quantity").value,

      web3.utils.toWei(document.getElementById("add_price").value.toString(), "ether"),
      document.getElementById("add_enabled").checked
    )
    .send({
      from: selectedAccount,
    })
    .then((status) => {
      toastr.success("Added");
    });
}

async function connect() {
  if (window.web3 == undefined && window.ethereum == undefined) {
    window.open("https://metamask.app.link/dapp/mapi.artificialintelligenceclub.io", "_blank").focus();
  }
  provider = await web3Modal.connect();
  provider.on("accountsChanged", (accounts) => {
    disconnect();
  });

  await fetchAccountData();
  if (isConnected) {
    return;
  }

  if (selectedAccount) {
    let web3 = new Web3(provider);
    const marketplaceC = new web3.eth.Contract(abi, marketplaceContract);

    document.getElementById("connect-button").innerHTML = "Connected";
    toastr.success("Connected");
    isConnected = true;
    let items = await marketplaceC.methods.getAvailableItems().call();
    let lastItemId = await marketplaceC.methods._nextItemId().call();
    document.getElementById("lastItemId").innerHTML = "Last Item id : " + (lastItemId - 1);
    document.getElementById("totalItems").innerHTML = "Total items : " + items[1].length;
  }
}

window.addEventListener("load", async () => {
  init();
});
