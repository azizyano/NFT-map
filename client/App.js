import React from 'react'
import './global'
import { web3, kit } from './root'
import { Image, StyleSheet, Text, Button,TouchableOpacity, TextInput, View, YellowBox } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import {   
  requestTxSig,
  waitForSignedTxs,
  requestAccountAddress,
  waitForAccountAuth,
  FeeCurrency
} from '@celo/dappkit'
import { toTxResult } from "@celo/connect"
import * as Linking from 'expo-linking'
import CeloBet from './contracts/CeloBet.json'


YellowBox.ignoreWarnings(['Warning: The provided value \'moz', 'Warning: The provided value \'ms-stream'])

export default class App extends React.Component {

  // Set the defaults for the state
  state = {
    address: 'Not logged in',
    celoBalance: 'Not logged in',
    cUSDBalance: 'Not logged in',
    CeloBet: {}
  }
  constructor(props) {
    super(props);
    this.state = {text: ''};
  }
  // This function is called when the page successfully renders
  componentDidMount = async () => {
    
    // Check the Celo network ID
    const networkId = await web3.eth.net.getId();
    
    // Get the deployed HelloWorld contract info for the appropriate network ID
    const deployedNetwork = CeloBet.networks[networkId];

    // Create a new contract instance with the HelloWorld contract info
    const instance = new web3.eth.Contract(
      CeloBet.abi,
      deployedNetwork && deployedNetwork.address
    );

    // Save the contract instance
    this.setState({ CeloBet: instance })
  }

  login = async () => {
    
    // A string you can pass to DAppKit, that you can use to listen to the response for that request
    const requestId = 'login'
    
    // A string that will be displayed to the user, indicating the DApp requesting access/signature
    const dappName = 'Celo Bet'
    
    // The deeplink that the Celo Wallet will use to redirect the user back to the DApp with the appropriate payload.
    const callback = Linking.makeUrl('/my/path')
  
    // Ask the Celo Alfajores Wallet for user info
    requestAccountAddress({
      requestId,
      dappName,
      callback,
    })
  
    // Wait for the Celo Wallet response
    const dappkitResponse = await waitForAccountAuth(requestId)

    // Set the default account to the account returned from the wallet
    kit.defaultAccount = dappkitResponse.address
    let balance = await kit.web3.eth.getBalance(dappkitResponse.address)
    balance= balance/10**18
    // Get the stabel token contract
    const stableToken = await kit.contracts.getStableToken()

    // Get the user account balance (cUSD)
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)
    
    // Convert from a big number to a string
    let cUSDBalance = cUSDBalanceBig.toString()/10**18
    // Update state
    this.setState({ cUSDBalance, 
                    celoBalance: balance,
                    isLoadingBalance: false,
                    address: dappkitResponse.address })
  }

  async makeBet(bet, amount) {
    const requestId = 'spinup'
    const dappName = 'Celo Bet'
    const callback = Linking.makeUrl('/my/path')
    var randomSeed = Math.floor(Math.random() * Math.floor(1e9))
    const txObject = await this.state.CeloBet.methods.game(bet, randomSeed)
    await kit.sendTransactionObject(txObject, {from: this.state.address})
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.CeloBet.options.address,
          tx: txObject,
          value: amount,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    console.log(`Hello World contract update transaction receipt: `, result)
    this.state.CeloBet.events.Result({}, async (error, event) => {
      const verdict = event.returnValues.winAmount
      if(verdict === '0') {
        console.log('lose :(')
      } else {
        console.log('WIN!')
      }
    })
  }
  spindown = async () => {
    const requestId = 'qpinup'
    const dappName = 'Celo Bet'
    const callback = Linking.makeUrl('/my/path')
    var randomSeed = Math.floor(Math.random() * Math.floor(1e9))
    const txObject = await this.state.CeloBet.methods.game(1, randomSeed)
    await kit.sendTransactionObject(txObject, {from: this.state.address})
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.CeloBet.options.address,
          tx: txObject,
          value: this.state.amount*10^18,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    console.log(`Hello World contract update transaction receipt: `, result)
  }



  render(){
    return (
      <View style={styles.container}>
        <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.background}
      />
        <View style={styles.top} >
          <Button title="login()" style={styles.button}
            onPress={()=> this.login()} />
          <Text>{this.state.address}</Text>
          <Text>cUSD Balance: {this.state.cUSDBalance}</Text>
          <Text>Celo Balance: {this.state.celoBalance}</Text>
        </View>
        <Image resizeMode='contain' source={require("./assets/spin2win.png")}></Image>
        <Text>celo bet amount </Text>
        <TextInput
          style={{height: 40}}
          placeholder="Bet amount"
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
        <Text style={{padding: 10, fontSize: 42}}>
          {this.state.text}
        </Text>
        <Text>Low </Text>
        <Text>Hight</Text>
        <View style={styles.fixToText}>
          <TouchableOpacity onPress={() => this.spinup()} style={styles.buttonup}>
          <Text style={styles.buttonText}>Spin Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.spindown()} style={styles.buttondown}>
          <Text style={styles.buttonText}>Spin Down</Text>
          </TouchableOpacity>
        </View>
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#673ab7',
    alignItems: 'center',
  },
  top: {
    flex: 0.15,
    backgroundColor: 'grey',
    borderWidth: 1,
    padding: 60,
    borderRadius: 20,
  },
  title: {
    marginVertical: 8, 
    fontSize: 20, 
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 10,
  },
  buttonup: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 10,
  },
  buttondown: {
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
