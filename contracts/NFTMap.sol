pragma solidity 0.5.16;

import "./ERC721Full.sol";

contract Locals is ERC721Full {

  struct EntityStruct {
    address entityAddress;
    uint latitude;
    uint longitude;
    // more fields
  }

  constructor() ERC721Full("Treasure", "TRSR") public {
  }
  EntityStruct[] public entityStructs;

  function newEntity(address entityAddress, uint latitude, uint longitude) public returns(uint rowNumber) {
    EntityStruct memory newEntity;
    newEntity.entityAddress = entityAddress;
    newEntity.latitude    = latitude;
    newEntity.longitude    = longitude;
    uint _id = entityStructs.push(newEntity);
    _mint(msg.sender, _id);
    return entityStructs.push(newEntity)-1;
  }

  function getEntityCount() public view returns(uint entityCount) {
    return entityStructs.length;
  }
}
