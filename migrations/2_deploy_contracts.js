const ERC721 = artifacts.require("ERC721Full");
const NFTMap = artifacts.require("NFTMap");

module.exports =async function(deployer) {
  // deploy erc721 full contracts
  await deployer.deploy(ERC721);
  const ERC721full= await ERC721.deploy()
  // deploy NFTMap contract
  await deployer.deploy(NFTMap, ERC721full.address);

};
