"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;

let web3E;
let web3M;
let web3G;
let stakingContract = "0x39b3B9beA1aF40812B238E72F2BF6448F019cF76";
let NFTContract = "0x01a8f00C64bBcbFe80087a14e9cC48001e8CB810";
let wormContract = "0xB17204068f45997aEDD40a7fb33Cb6b4C81B41E4"; // poly
let globalTokensClaimable = {};
let stakingC = undefined;
let wormsC = undefined;
let nftC = undefined;

let apiUrl = "https://worms.ebgnft.xyz";
let abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "WORMS_FOR_BIRD",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "claimableWormsFor",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "claimableWormsForId",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "stakedTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "stakeDate",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "stakerAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "boost",
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
        name: "owner",
        type: "address",
      },
    ],
    name: "tokensOwnedBy",
    outputs: [
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "tokensStakedBy",
    outputs: [
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
        internalType: "uint256[]",
        name: "tokens",
        type: "uint256[]",
      },
    ],
    name: "tokensDetails",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "stakeDate",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "stakerAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tierId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collected",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "boost",
            type: "uint256",
          },
        ],
        internalType: "struct EarlyBirds_Staking.token[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
      {
        internalType: "uint256[]",
        name: "tokensIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "wormsCount",
        type: "uint256[]",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

let tiersTime = {
  1: 1209600,
  2: 7776000,
  3: 31536000,
};
let tiersColors = {
  1: "4CF497",
  2: "41A8FF",
  3: "FF9E35",
};
let tiersRate = {
  1: 0.0000578703703,
  2: 0.0001157407406,
  3: 0.0002314814812,
};
let selectedOwnedBirds = [];
let selectedStakedBirds = [];

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
  if (await isMatic()) {
    // show buttons
    document.getElementById("claimWormsButton").classList.remove("d-none");

    web3E = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/c4321e8694634f0aaa461d82f9979390"));
    web3M = new Web3(provider);
    // d
    stakingC = new web3E.eth.Contract(abi, stakingContract);
    wormsC = new web3M.eth.Contract(abi, wormContract);
    nftC = new web3E.eth.Contract(abi, NFTContract);
  }

  if (await isETH()) {
    // show buttons
    document.getElementById("stakeCard").classList.remove("d-none");
    web3E = new Web3(provider);
    web3M = new Web3(new Web3.providers.HttpProvider("https://polygon-mainnet.infura.io/v3/c4321e8694634f0aaa461d82f9979390"));
    // d
    stakingC = new web3E.eth.Contract(abi, stakingContract);
    wormsC = new web3M.eth.Contract(abi, wormContract);
    nftC = new web3E.eth.Contract(abi, NFTContract);
  }

  await fetchAccountData();

  if (selectedAccount) {
    loadTokens();
    document.getElementById("nestS").classList.remove("d-none");
    document.getElementById("connectSection").classList.add("d-none");

    toastr.success("Connected");
    isConnected = true;
  }
}

function secondsToDHMS(seconds) {
  seconds = Number(seconds);
  let d = Math.floor(seconds / (3600 * 24));
  let h = Math.floor((seconds % (3600 * 24)) / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = Math.floor(seconds % 60);

  return `${d.toString().length >= 2 ? d : "0" + d}D ${h.toString().length >= 2 ? h : "0" + h}H : ${m.toString().length >= 2 ? m : "0" + m}M : ${s.toString().length >= 2 ? s : "0" + s}S`;
}

function selectBird(tokenId, type) {
  if (type == "s") {
    if (selectedStakedBirds.includes(tokenId)) {
      selectedStakedBirds.splice(selectedStakedBirds.indexOf(tokenId), 1);
      document.getElementById(tokenId + "c").classList.remove("selected-card");
    } else {
      document.getElementById(tokenId + "c").classList.add("selected-card");
      selectedStakedBirds.push(tokenId);
    }
  } else {
    if (selectedOwnedBirds.includes(tokenId)) {
      selectedOwnedBirds.splice(selectedOwnedBirds.indexOf(tokenId), 1);
      document.getElementById(tokenId + "c").classList.remove("selected-card");
    } else {
      document.getElementById(tokenId + "c").classList.add("selected-card");
      selectedOwnedBirds.push(tokenId);
    }
  }
}
async function loadTokens() {
  // check for staked longer than period bahviour
  selectedOwnedBirds = [];
  selectedStakedBirds = [];
  let totalBirds = 0;

  document.getElementById("tokensSection").innerHTML = "";
  let tokensSection = {};
  stakingC.methods
    .tokensOwnedBy(selectedAccount)
    .call()
    .then((tokens) => {
      tokens.forEach((token) => {
        totalBirds++;
        document.getElementById("ownedBirds").innerHTML = `BIRDS OWNED: ${totalBirds}`;
        tokensSection[token] = `<div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-3">
        <div class="ebg-card h-100 pointer-card" id="${token}c" onclick="selectBird(${token},'o');">
            <img class="ebg-card-image" src="${imagesUrls[token] == undefined ? "https://via.placeholder.com/1000" : imagesUrls[token]}">
            <h6 class="font2 text-light pt-2">EARLY BIRD #${token}</h6>
            <h6 class="font2 mx-1 my-4" style="color:#646486;">UNSTAKED</h6>
        </div></div>`;
      });

      document.getElementById("tokensSection").innerHTML = "";
      Object.keys(tokensSection)
        .sort()
        .reduce((obj, key) => {
          obj[key] = tokensSection[key];
          return obj;
        }, {});
      Object.values(tokensSection).forEach((token) => {
        document.getElementById("tokensSection").innerHTML += token;
      });
    });

  let tokensStakedBy = await stakingC.methods.tokensStakedBy(selectedAccount).call();
  let totalClaimable = 0;
  if (tokensStakedBy.length > 0) {
    stakingC.methods
      .tokensDetails(tokensStakedBy)
      .call()
      .then((stakedTokensDetails) => {
        stakedTokensDetails.forEach((token, tokenIndex) => {
          totalBirds++;
          document.getElementById("ownedBirds").innerHTML = `BIRDS OWNED: ${totalBirds}`;

          tokensSection[tokensStakedBy[tokenIndex]] = `<div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-3">
            <div class="ebg-card pointer-card" id="${tokensStakedBy[tokenIndex]}c" onclick="selectBird(${tokensStakedBy[tokenIndex]},'s');">
                <img class="ebg-card-image" src="${imagesUrls[tokensStakedBy[tokenIndex]] == undefined ? "https://via.placeholder.com/1000" : imagesUrls[tokensStakedBy[tokenIndex]]}">
                <h6 class="font2 text-light pt-2">EARLY BIRD #${tokensStakedBy[tokenIndex]}</h6>
                <h6 class="font2 m-1" style="color:#${tiersColors[token.tierId]};"><i class="fa-solid fa-stopwatch"></i> ${tiersTime[token.tierId] / (60 * 60 * 24)} Days</h6>
                <div class="font2 m-1">
                    <small style="color:#5D30F0"id="${tokensStakedBy[tokenIndex]}t">00D 00H : 00M : 00S</small>
                </div>
                <h6 class="font2 mt-3" style="color:#43F030;"id="${tokensStakedBy[tokenIndex]}w"><img style="height: 25px;" src="../images/coin.gif"> +0</h6>
            </div></div>`;

          setInterval(() => {
            if (document.getElementById(tokensStakedBy[tokenIndex] + "t")) {
              //console.log(parseInt(token.stakeDate), tiersTime[token.tierId], getCurrentTimeUTC());
              document.getElementById(tokensStakedBy[tokenIndex] + "t").innerHTML = secondsToDHMS(parseInt(token.stakeDate) + parseInt(tiersTime[token.tierId]) - getCurrentTimeUTC());
            }
          }, 1000);
          // polygon infura

          wormsC.methods
            .WORMS_FOR_BIRD(tokensStakedBy[tokenIndex])
            .call()
            .then((claimedWorms) => {
              let claimedWormsParsed = web3G.utils.fromWei(claimedWorms.toString(), "ether");
              let claimableWorms = countPendingWorms(token.stakeDate, token.collected, token.tierId, token.boost, claimedWormsParsed);
              totalClaimable += claimableWorms;

              document.getElementById("claimableWorms").innerHTML = `<img style="height: 25px;" src="../images/coin.gif">CLAIMABLE: ${parseFloat(totalClaimable).toFixed(2)}`;
              setInterval(() => {
                if (document.getElementById(tokensStakedBy[tokenIndex] + "w")) {
                  let claimableWormsTokens = parseFloat(countPendingWorms(token.stakeDate, token.collected, token.tierId, token.boost, claimedWormsParsed)).toFixed(4);
                  globalTokensClaimable[tokensStakedBy[tokenIndex]] = claimableWormsTokens;
                  document.getElementById(tokensStakedBy[tokenIndex] + "w").innerHTML = '<img style="height: 25px;" src="../images/coin.gif"> +' + claimableWormsTokens;
                }
              }, 1000);
            });

          setInterval(() => {
            let totalClaimableAmount = 0;

            Object.values(globalTokensClaimable).forEach((amount) => {
              totalClaimableAmount += parseFloat(amount);
            });
            document.getElementById("claimableWorms").innerHTML = `<img style="height: 25px;" src="../images/coin.gif">CLAIMABLE: ${parseFloat(totalClaimableAmount).toFixed(2)}`;
          }, 1000);
          // polygon end
        });

        document.getElementById("tokensSection").innerHTML = "";
        Object.keys(tokensSection)
          .sort()
          .reduce((obj, key) => {
            obj[key] = tokensSection[key];
            return obj;
          }, {});
        Object.values(tokensSection).forEach((token) => {
          document.getElementById("tokensSection").innerHTML += token;
        });
      });
  }

  // polygon infura
  try {
    let balance = await wormsC.methods.balanceOf(selectedAccount).call();
    let parsedBalance = parseFloat(web3G.utils.fromWei(balance.toString(), "ether")).toFixed(3);
    document.getElementById("wormsBalance").innerHTML = `<img style="height: 25px;" src="../images/coin.gif">BALANCE: ${parsedBalance == "0.000" ? "0" : parsedBalance}`;
  } catch (error) {
    console.log(error);
  }

  // polygon end
}

function getCurrentTimeUTC() {
  return Math.floor(new Date().getTime() / 1000);
}

function countPendingWorms(stakeDate, collected, tierId, boost, claimedWorms) {
  let parsedCollected = parseFloat(web3G.utils.fromWei(collected.toString(), "ether"));
  let noBoostAmount;
  if (getCurrentTimeUTC() - Number(stakeDate) > Number(tiersTime[tierId])) {
    noBoostAmount = Number(tiersTime[tierId]) * Number(tiersRate[tierId]);
  } else {
    noBoostAmount = (getCurrentTimeUTC() - Number(stakeDate)) * Number(tiersRate[tierId]);
  }

  if (boost == 0) {
    return noBoostAmount + parsedCollected - claimedWorms;
  } else {
    return noBoostAmount + parsedCollected + (noBoostAmount * Number(boost)) / 1000 - claimedWorms;
  }
}

async function stake(tierId) {
  let isApproved = await nftC.methods.isApprovedForAll(selectedAccount, stakingContract).call();
  if (selectedOwnedBirds.length == 0) {
    toastr.error("0 birds selected");
    return;
  }

  if (isApproved) {
    stakingC.methods
      .stake(selectedOwnedBirds, tierId)
      .send({
        from: selectedAccount,
      })
      .then((status) => {
        loadTokens();
      });
  } else {
    nftC.methods
      .setApprovalForAll(stakingContract, true)
      .send({
        from: selectedAccount,
      })
      .finally(() => {
        toastr.info("Approved all.");
        stakingC.methods
          .stake(selectedOwnedBirds, tierId)
          .send({
            from: selectedAccount,
          })
          .then((statusx) => {
            toastr.success("Staked.");
            loadTokens();
          });
      });
  }
}

async function unstake() {
  const web3 = new Web3(provider);
  const stakingC = new web3.eth.Contract(abi, stakingContract);

  if (selectedStakedBirds.length == 0) {
    toastr.error("0 birds selected");
    return;
  }

  stakingC.methods
    .unstake(selectedStakedBirds)
    .send({
      from: selectedAccount,
    })
    .then((status) => {
      loadTokens();
    });
}

async function claimWorms() {
  let signatures = [];
  let tokensIds = [];
  let wormsCounts = [];
  let tokensStakedBy = await stakingC.methods.tokensStakedBy(selectedAccount).call();

  for (let index = 1; index <= tokensStakedBy.length; index++) {
    try {
      let req = await axios.post(apiUrl + "/getClaimAmount", {
        wallet: selectedAccount,
        tokenId: parseInt(tokensStakedBy[index - 1]),
      });

      signatures.push(req.data.signature);
      tokensIds.push(req.data.tokenId);
      wormsCounts.push(req.data.wormsCount);
      if (index == 1) {
        toastr.success(`Checked ${index} bird`);
      } else {
        toastr.success(`Checked ${index} birds`);
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
  wormsC.methods
    .claim(signatures, tokensIds, wormsCounts)
    .send({
      from: selectedAccount,
    })
    .then((state) => {
      toastr.success(`Claimed successfully`);
    })
    .catch((error) => {
      console.log(error);
    });
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
