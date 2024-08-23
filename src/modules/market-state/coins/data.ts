

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Whitelisted Symbols
 * The following list was put together on  Aug 23, 2024 based on the top 200 cryptocurrencies by
 * market capital.
 *
 * Last updated: Aug 23, 2024
 */
const WHITELISTED_SYMBOLS: string[] = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'TON', 'DOGE', 'TRX', 'ADA', 'AVAX', 'SHIB', 'LINK', 'DOT',
  'BCH', 'LEO', 'MATIC', 'NEAR', 'LTC', 'UNI', 'ICP', 'KAS', 'PEPE', 'APT', 'XMR', 'ETC', 'XLM',
  'FET', 'STX', 'TAO', 'FIL', 'SUI', 'CRO', 'OKB', 'IMX', 'RENDER', 'HBAR', 'INJ', 'MNT', 'VET',
  'AAVE', 'ARB', 'MKR', 'ATOM', 'OP', 'AR', 'WIF', 'GRT', 'RUNE', 'BGB', 'FTM', 'THETA', 'BONK',
  'FLOKI', 'ALGO', 'TIA', 'PYTH', 'JUP', 'NOT', 'JASMY', 'HNT', 'LDO', 'CORE', 'SEI', 'DOG', 'IPV',
  'ONDO', 'KCS', 'BRETT', 'FLOW', 'BSV', 'BTT', 'QNT', 'EOS', 'EGLD', 'OM', 'BEAM', 'AXS', 'NEO',
  'GT', 'XTZ', 'GALA', 'DYDX', 'XEC', 'FLR', 'CFX', 'ORDI', 'SAND', 'ENS', 'ZEC', 'WLD', 'POPCAP',
  'AKT', 'STRK', 'KLAY', 'RON', 'ENA', 'NEXO', 'MINA', 'BNX', 'MANA', 'AIOZ', 'CHZ', 'ASTR', 'ATH',
  'SNX', 'DEXE', 'FTT', 'BOME', 'CAKE', 'LPT', 'IOTA', 'PENDLE', 'AXL', 'LUNC', 'NFT', 'RAY', 'ZK',
  'MEW', 'GNO', 'COMP', 'MOG', 'CKB', 'ROSE', 'BTG', 'ZRO', 'TFUEL', 'APE', 'TWT', 'KAVA', 'CRV',
  'SFP', 'XDC', 'SAFE', 'MX', 'WEMIX', 'IOTX', 'AEVO', 'RSR', 'BLUR', '1INCH', 'WOO', 'GLM', 'JTO',
  'KSM', 'PEOPLE', 'GMT', 'AMP', 'GAL', 'DASH', 'JST', 'ANT', 'SUPER', 'HOT', 'ELF', 'LUNA', 'MWC',
  'OSMO', 'MEME', 'MANTA', 'DYM', 'RPL', 'ZIL', 'ZRX', 'CELO', 'ANKR', 'BAT', 'ID', 'SC', 'SUN',
  'ENJ', 'ETHFI', 'QTUM', 'RVN', 'XRD', 'ARKM', 'GMX', 'PRIME', 'TRAC', 'CVX', 'GAS', 'IO', 'TRIBE',
  'ETHW', 'EDU', 'MASK', 'BICO', 'BLAST', 'METIS', 'ALT', 'ILV', 'POLYX', 'EDLC', 'FLZ', 'ZBU',
  'CHEEL', 'FTN', 'AERO', 'BDX', 'H2O', 'PEPECOIN', 'TURBO',
];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  WHITELISTED_SYMBOLS,
};
