import {
  type TransactionFilter,
  type SwapActionParams,
  compressJson,
} from '@rabbitholegg/questdk'
import { type Address } from 'viem'
import { CHAIN_ID_ARRAY, ARBITRUM_CHAIN_ID } from './chain-ids'
import { DEFAULT_TOKEN_LIST } from './contract-addresses'
import { buildV2PathQuery, buildV3PathQuery, Tokens } from './utils'
import {
  CAMELOT_V2_ABI,
  CAMELOT_V3_EXACT_INPUT_ABI,
  CAMELOT_V3_EXACT_OUTPUT_ABI,
  PARASWAP_ABI,
} from './abi'
import {
  CAMELOT_V2_ROUTER,
  CAMELOT_V3_ROUTER,
  PARASWAP_ROUTER,
  INTERNAL_ETH_ADDRESS,
} from './contract-addresses'

export const swap = async (
  swap: SwapActionParams,
): Promise<TransactionFilter> => {
  const { chainId, tokenIn, tokenOut, amountIn, amountOut, recipient } = swap

  const ethUsedIn = tokenIn === Tokens.ETH
  const ethUsedOut = tokenOut === Tokens.ETH

  const tokenInOrEth = ethUsedIn ? INTERNAL_ETH_ADDRESS : tokenIn
  const tokenOutOrEth = ethUsedOut ? INTERNAL_ETH_ADDRESS : tokenOut
  const tokenInOrWeth = ethUsedIn ? Tokens.WETH : tokenIn
  const tokenOutOrWeth = ethUsedOut ? Tokens.WETH : tokenOut

  return compressJson({
    chainId: chainId,
    from: recipient,
    to: {
      $or: [
        CAMELOT_V2_ROUTER.toLowerCase(),
        CAMELOT_V3_ROUTER.toLowerCase(),
        PARASWAP_ROUTER.toLowerCase(),
      ],
    },
    value: ethUsedIn ? amountIn : undefined,
    input: {
      $or: [
        {
          // camelotV2 swap
          $abi: CAMELOT_V2_ABI,
          path: buildV2PathQuery(tokenInOrWeth, tokenOutOrWeth),
          amountOutMin: amountOut,
          amountIn: ethUsedIn ? undefined : amountIn,
        },
        {
          // camelotV3 swap
          $or: [
            {
              $abiAbstract: CAMELOT_V3_EXACT_OUTPUT_ABI,
              params: {
                $or: [
                  {
                    tokenIn: tokenInOrWeth,
                    tokenOut: tokenOutOrWeth,
                  },
                  {
                    path: buildV3PathQuery(tokenInOrWeth, tokenOutOrWeth),
                  },
                ],
                amountInMaximum: amountIn,
                amountOut,
              },
            },
            {
              $abiAbstract: CAMELOT_V3_EXACT_INPUT_ABI,
              params: {
                $or: [
                  {
                    tokenIn: tokenInOrWeth,
                    tokenOut: tokenOutOrWeth,
                  },
                  {
                    path: buildV3PathQuery(tokenInOrWeth, tokenOutOrWeth),
                  },
                ],
                amountIn,
                amountOutMinimum: amountOut,
              },
            },
          ],
        },
        {
          // paraswap
          $abi: PARASWAP_ABI,
          $or: [
            {
              // simpleswap, directUniV3Swap, directCurveSwap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                toToken: tokenOutOrEth,
                partner: '0x353D2d14Bb674892910685520Ac040f560CcBC06',
              },
            },
            {
              // multiswap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                path: {
                  $last: {
                    to: tokenOutOrEth,
                  },
                },
                partner: '0x353D2d14Bb674892910685520Ac040f560CcBC06',
              },
            },
            {
              // megaswap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                path: {
                  $last: {
                    path: {
                      $last: {
                        to: tokenOutOrEth,
                      },
                    },
                  },
                },
                partner: '0x353D2d14Bb674892910685520Ac040f560CcBC06',
              },
            },
            {
              // directBalancerV2
              data: {
                assets: buildV2PathQuery(tokenIn, tokenOut),
                fromAmount: amountIn,
                toAmount: amountOut,
                partner: '0x353D2d14Bb674892910685520Ac040f560CcBC06',
              },
            },
          ],
        },
      ],
    },
  })
}

export const getSupportedTokenAddresses = async (
  _chainId: number,
): Promise<Address[]> => {
  // Only return supported tokens for ARBITRUM_CHAIN_ID
  return _chainId === ARBITRUM_CHAIN_ID ? DEFAULT_TOKEN_LIST : []
}

export const getSupportedChainIds = async (): Promise<number[]> => {
  return CHAIN_ID_ARRAY
}
