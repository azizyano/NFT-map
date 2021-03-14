
const NFTMap = artifacts.require("NFTMap");

module.exports =async function(deployer) {
  // deploy NFTMap contract
  await deployer.deploy(NFTMap);

};
