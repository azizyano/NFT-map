celo spin contract address 0x8a7EC29913a89763Af8C2D954f30Dbd3280e800E deployed in alfajores network 
![](https://github.com/azizyano/celo-spin/blob/main/client/assets/spinlogo.png)

this project is a fork from https://github.com/critesjosh/celo-dappkit so plz take a look to see how to run the project.
## Run Celo Dapp 

```
cd client 
npm run start
```
Celo spin is a game that users can bet for an Celo amount an get  chance to win x
 the contract use the function randomResult = uint256(keccak256(abi.encode(now, block.number, blockhash(block.number - Seed)))); 
 to get a random result. the chance to win or lose is 50%. the contract needs to be funded. the creator of the contract can deposit or withdraw fun at any time.
demo 
[login](https://github.com/azizyano/celo-spin/blob/main/demo_for_a_celo_dapp%20(1).gif)
[bet amount](https://github.com/azizyano/celo-spin/blob/main/demo_for_a_celo_dapp%20(2).gif)

https://www.youtube.com/watch?v=V2O95ZXmNx8



