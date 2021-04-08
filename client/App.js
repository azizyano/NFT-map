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
    this.state = {amount: '0'};
  }
  // This function is called when the page successfully renders
  componentDidMount = async () => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = CeloBet.networks[networkId];
    const instance = new web3.eth.Contract(
      CeloBet.abi,
      deployedNetwork && deployedNetwork.address
    );
    this.setState({ CeloBet: instance })
  }

  login = async () => {
    const requestId = 'login'
    const dappName = 'Celo Bet'
    const callback = Linking.makeUrl('/my/path')
    requestAccountAddress({
      requestId,
      dappName,
      callback,
    })
    const dappkitResponse = await waitForAccountAuth(requestId)
    kit.defaultAccount = dappkitResponse.address
    let balance = await kit.web3.eth.getBalance(dappkitResponse.address)
    balance = balance/10**18
    const stableToken = await kit.contracts.getStableToken()
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)
    let cUSDBalance = cUSDBalanceBig.toString()/10**18
    this.setState({ cUSDBalance, celoBalance: balance, isLoadingBalance: false,
    address: dappkitResponse.address })
  }

  async makeBet(bet) {
    const requestId = 'spinup'
    const dappName = 'Celo Bet'
    const callback = Linking.makeUrl('/my/path')
    var randomSeed = Math.floor(Math.random() * Math.floor(1e9))
    const txObject = await this.state.CeloBet.methods.game(bet, randomSeed)
    await kit.sendTransactionObject(txObject, {from: this.state.address})
    requestTxSig(kit,[
        {
          from: this.state.address,
          to: this.state.CeloBet.options.address,
          tx: txObject,
          value: this.state.amount * 10**18,
          feeCurrency: FeeCurrency.cUSD
        }],
      { requestId, dappName, callback }
    )
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    console.log(`transaction receipt: `, result)
    let balance = await kit.web3.eth.getBalance(this.state.address)
    balance = balance/10**18
    const stableToken = await kit.contracts.getStableToken()
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)
    let cUSDBalance = cUSDBalanceBig.toString()/10**18
    this.setState({ cUSDBalance, celoBalance: balance, isLoadingBalance: false })
  }


  render(){
    return (
      <LinearGradient
      // Button Linear Gradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.button}>
    
      
        <View >
          <Button title="login()" style={styles.top}
            onPress={()=> this.login()} />
          <Text>{this.state.address}</Text>
          <Text style={{padding: 2, fontSize: 14}}>cUSD Balance: {this.state.cUSDBalance}</Text>
          <Text style={{padding: 2, fontSize: 14}}>Celo Balance: {this.state.celoBalance}</Text>
        </View>
        <Image style={{width: '100%', height: '55%'}} source={require("./assets/spinlogo.png")}></Image>
        <Text style={{padding: 5, fontSize: 20}}>
          Bet amount
        </Text>
        <TextInput
          style={styles.button}
          onChangeText={(amount) => this.setState({amount})}
          value={this.state.amount}
        />
        <Text style={{padding: 5, fontSize: 42}}>
          {this.state.amount}
        </Text>
      
        <View style={styles.fixToText}>
          <TouchableOpacity onPress={() => this.makeBet(1)} style={styles.buttonup}>
          <Text style={styles.buttonText}>Spin Up  </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.makeBet(0)} style={styles.buttondown}>
          <Text style={styles.buttonText}>Spin Down</Text>
          </TouchableOpacity>
        </View>
      
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#673ab7',
    alignItems: 'center',
  },
  top: {
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
    padding: 2, fontSize: 20,
    backgroundColor: "#603ab7",
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
  },
  buttonup: {
    margin: 8,
    backgroundColor: "red",
    padding: 20,
    borderRadius: 10,
  },
  buttondown: {
    backgroundColor: "blue",
    margin: 8,
    padding: 20,
    borderRadius: 10,
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
