export const officialPackages = [
  "0x889b73a6dcacf7d86d716d62bc096bbb7cecccc8f831fa8c31838c412b6e17e9",
  "0xfb3afd146f1b7b203b90d64df5fecf28f71aa102cc89598dc0dff268e0c81a42",
];

export const graphqlUrl = (network: string | null) => {
  if (!network) return "https://graphql.testnet.iota.cafe";
  else return network === "testnet" ? "https://graphql.testnet.iota.cafe" : "https://graphql.mainnet.iota.cafe";
};
