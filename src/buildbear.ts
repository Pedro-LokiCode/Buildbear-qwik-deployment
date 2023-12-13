export const ABI = [
  {
    inputs: [],
    name: "get",
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
        name: "data",
        type: "uint256",
      },
    ],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "storedData",
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
];
export const BYTECODE =
  "0x608060405234801561001057600080fd5b5061017f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80632a1afcd91461004657806360fe47b1146100645780636d4ce63c14610080575b600080fd5b61004e61009e565b60405161005b91906100d0565b60405180910390f35b61007e6004803603810190610079919061011c565b6100a4565b005b6100886100ae565b60405161009591906100d0565b60405180910390f35b60005481565b8060008190555050565b60008054905090565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b600080fd5b6100f9816100b7565b811461010457600080fd5b50565b600081359050610116816100f0565b92915050565b600060208284031215610132576101316100eb565b5b600061014084828501610107565b9150509291505056fea26469706673582212209ac800bfceee47946c3fe5ab10551b2b6693731ea932a2807254281d3f94dcaa64736f6c63430008140033";
export const BUILDBEAR_API_KEY = "";

import type { AxiosInstance } from "axios";
import axios from "axios";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const BuildBearClient: AxiosInstance = axios.create({
  baseURL: `https://api.buildbear.io/v1/buildbear-sandbox/`,
});

BuildBearClient.interceptors.request.use(
  async function (config) {
    try {
      config.headers["Authorization"] = `Bearer ${BUILDBEAR_API_KEY}`;
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

export async function createSanboxAPI(): Promise<any> {
  return BuildBearClient.post("", {
    chainId: 1,
  });
}

export async function sandboxStatus(sandboxId: string): Promise<any> {
  return BuildBearClient.get(`/${sandboxId}`);
}

export function deployWithMetamask(networkId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // Connect to MetaMask
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Get the current chain ID
      const currentChainId = await signer.getChainId();

      // Switch to the specified network if not already connected
      if (currentChainId !== networkId) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${networkId.toString(16)}` }],
        });
      }

      // Deploy the contract
      const factory = new ethers.ContractFactory(ABI, BYTECODE, signer);
      const contract = await factory.deploy();

      // Wait for the transaction to be mined
      const receipt = await contract.deployTransaction.wait();

      // Check for successful deployment
      if (receipt.status === 1) {
        console.log("Contract deployed at address:", contract.address);
        resolve();
      } else {
        console.error("Failed to deploy contract");
        reject(new Error("Failed to deploy contract"));
      }
    } catch (error) {
      console.error("Failed to deploy contract:", error);
      reject(error);
    }
  });
}
