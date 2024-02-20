import { zeroAddress, type Address } from "viem";
import { Chains } from "./utils";

export const GNS_CONTRACT = "0x2c7e82641f03fa077f88833213210a86027f15dc";
export const GNS_REF_ADDRESS = "0x10C2CbfE29f4f5e4C24d54d36C8F283A61eB0c2f";

export const CHAIN_ID_TO_TOKENS: { [chainId: number]: Address[] } = {
  [Chains.ARBITRUM_ONE]: [
    zeroAddress, // ETH
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
    "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", // LINK
  ],
};
