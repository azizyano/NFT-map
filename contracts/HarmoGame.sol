// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.6.11;

contract CeloBet {
    uint256 public price;
    uint256 public gameId;
    uint256 public lastGameId;
    address payable public admin;
    //declaring 50% chance, (0.5*(uint256+1))
    uint256 constant half = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
    uint256 public randomResult;
    mapping(uint256 => Game) public games;
    
    event Withdraw(address admin, uint256 amount);
    event Received(address indexed sender, uint256 amount);
    event Result(uint256 id, uint256 bet, uint256 randomSeed, uint256 amount, address player, uint256 winAmount, uint256 randomResult, uint256 time);
    
    struct Game{uint256 id;uint256 bet;uint256 seed;uint256 amount;address payable player;}
    
    modifier onlyAdmin() {
        require(msg.sender == admin, 'caller is not the admin');
        _;
        
    }

    constructor() public {
        admin = msg.sender;
    }
     /* Allows this contract to receive payments */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
    
      /**
       * Taking bets function.
       * By winning, user 2x his betAmount.
       * Chances to win and lose are the same.
       */
     function game(uint256 bet, uint256 seed) public payable returns (bool) {

        //bet=0 is low, refers to 1-3  dice values
        //bet=1 is high, refers to 4-6 dice values
        require(bet<=1, 'Error, accept only 0 and 1');
    
        //vault balance must be at least equal to msg.value
        require(address(this).balance>=msg.value, 'Error, insufficent vault balance');
        
        //each bet has unique id
        games[gameId] = Game(gameId, bet, seed, msg.value, msg.sender);
        
        //increase gameId for the next bet
        gameId = gameId+1;
    
        callrandomResult(seed);
        return true;
     }

    function callrandomResult(uint256 Seed) public {
        randomResult = uint256(keccak256(abi.encode(now, block.number, blockhash(block.number - Seed))));

        //send final random value to the verdict();
        verdict(randomResult);
    }
    /**
   * Send rewards to the winners.
   */
    function verdict(uint256 random) public payable {
        //check bets from latest betting round, one by one
        for(uint256 i=lastGameId; i<gameId; i++){
            //reset winAmount for current user
            uint256 winAmount = 0;
            
            //if user wins, then receives 2x of their betting amount
            if((random>=half && games[i].bet==1) || (random<half && games[i].bet==0)){
            winAmount = games[i].amount*2;
            games[i].player.transfer(winAmount);
            }
            emit Result(games[i].id, games[i].bet, games[i].seed, games[i].amount, games[i].player, winAmount, random, block.timestamp);
        }
        //save current gameId to lastGameId for the next betting round
        lastGameId = gameId;
    }
  
   
    function withdraw(uint256 amount) external payable onlyAdmin {
        require(address(this).balance>=amount, 'Error, contract has insufficent balance');
        admin.transfer(amount);
        emit Withdraw(admin, amount);
  }
}