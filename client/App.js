import React from 'react'
import './global'
import { web3, kit } from './root'
import { Image, StyleSheet, Text, TextInput, Button, View, YellowBox, TouchableOpacity, Platform,
SafeAreaView, ScrollView } from 'react-native'
import {   
  requestTxSig,
  waitForSignedTxs,
  requestAccountAddress,
  waitForAccountAuth,
  FeeCurrency
} from '@celo/dappkit'
import { toTxResult } from "@celo/connect"
import * as Linking from 'expo-linking'
import HelloWorldContract from './contracts/HelloWorld.json'
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
const { SkynetClient } = require('@nebulous/skynet');
const client = new SkynetClient();

YellowBox.ignoreWarnings(['Warning: The provided value \'moz', 'Warning: The provided value \'ms-stream'])

export default class App extends React.Component {

  // Set the defaults for the state
  state = {
    address: 'Not logged in',
    phoneNumber: 'Not logged in',
    cUSDBalance: 'Not logged in',
    helloWorldContract: {},
    contractName: '',
    location: 'not find',
    latitude: 'not find',
    longitude: 'not find',
    errorMsg: '',
    alow : null,
    image: null,
    link: '',
    textInput: ''
  }

  // This function is called when the page successfully renders
  componentDidMount = async () => {

    let { status } = await Location.requestPermissionsAsync();
          if (status !== 'granted') {
        this.setState({errorMsg:'Permission to access location was denied'});
        return;
      }
    let location = await Location.getCurrentPositionAsync({});

    this.setState({latitude: JSON.stringify(location.coords.latitude),longitude: JSON.stringify(location.coords.longitude)  })
    // Check the Celo network ID
    const networkId = await web3.eth.net.getId();
    
    // Get the deployed HelloWorld contract info for the appropriate network ID
    const deployedNetwork = HelloWorldContract.networks[networkId];

    // Create a new contract instance with the HelloWorld contract info
    const instance = new web3.eth.Contract(
      HelloWorldContract.abi,
      deployedNetwork && deployedNetwork.address
    );
    // Save the contract instance 
    this.setState({ helloWorldContract: instance })
  }
  alowpic = async () => {
        if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
  }
  pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({image: result.uri });
    }
  };
  upload = async () => {
    	// upload
    const skylink = await client.uploadFile(this.state.image.uri);
    console.log(`Upload successful, skylink: ${skylink}`);
    this.setState({link: this.state.image.uri})
  }
  login = async () => {
    
    // A string you can pass to DAppKit, that you can use to listen to the response for that request
    const requestId = 'login'
    
    // A string that will be displayed to the user, indicating the DApp requesting access/signature
    const dappName = 'Hello Celo'
    
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

    // Get the stabel token contract
    const stableToken = await kit.contracts.getStableToken()

    // Get the user account balance (cUSD)
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)
    
    // Convert from a big number to a string
    let cUSDBalance = cUSDBalanceBig.toString()
    
    // Update state
    this.setState({ cUSDBalance, 
                    isLoadingBalance: false,
                    address: dappkitResponse.address, 
                    phoneNumber: dappkitResponse.phoneNumber })
  }

  read = async () => {
    
    // Read the name stored in the HelloWorld contract
    let name = await this.state.helloWorldContract.methods.getName().call()
    
    // Update state
    this.setState({ contractName: name })
  }

  write = async () => {
    const requestId = 'update_name'
    const dappName = 'Hello Celo'
    const callback = Linking.makeUrl('/my/path')

    // Create a transaction object to update the contract with the 'textInput'
    const txObject = await this.state.helloWorldContract.methods.setName(this.state.textInput)

    // Send a request to the Celo wallet to send an update transaction to the HelloWorld contract
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.helloWorldContract.options.address,
          tx: txObject,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )

    // Get the response from the Celo wallet
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    
    // Get the transaction result, once it has been included in the Celo blockchain
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()

    console.log(`Hello World contract update transaction receipt: `, result)  
  }
 
  onChangeText = async (text) => {
    this.setState({textInput: text})
  }

  render(){
    return (
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Image resizeMode='contain' source={require("./assets/white-wallet-rings.png")}></Image>
        <Text style={styles.baseText}>Did you take a beautiful picture in a place in this land!
            transfer it to NFT. </Text>
        <Text style={styles.baseText} >your localisation is:
        <Text>latitude: {this.state.latitude}</Text>
        ,
        <Text>longitude: {this.state.longitude}</Text> </Text>  
        
        <Button title="Chose an image" onPress={this.pickImage} />
        {this.state.image && <Image source={{ uri: this.state.image }} style={{ width: 200, height: 200 }} />}
        <Button title="Upload to Skylink" 
          onPress={()=> this.upload()} />
          <Text>your link: {this.state.link}</Text>
        <Button title="login()" 
          onPress={()=> this.login()} />
                <Text style={styles.title}>Account Info:</Text>
        <Text>Current Account Address:</Text>
        <Text>{this.state.address}</Text>
        <Text>Phone number: {this.state.phoneNumber}</Text>
        <Text>cUSD Balance: {this.state.cUSDBalance}</Text>
        <Text style={styles.title}>Read HelloWorld</Text>
        <Button title="Read Contract Name" 
          onPress={()=> this.read()} />
        <Text>Contract Name: {this.state.contractName}</Text>
        
        <Text style={styles.title}>Write to HelloWorld</Text>
        <Text>New contract name:</Text>
        <TextInput
          style={{  borderColor: 'black', borderWidth: 1, backgroundColor: 'white' }}
          placeholder="input new name here"
          onChangeText={text => this.onChangeText(text)}
          value={this.state.textInput}
          />
        <Button style={{padding: 30}} title="update contract name" 
          onPress={()=> this.write()} />
      </View>

    </ScrollView>
    </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#61dafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    marginTop: 16,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 20,
  },
  title: {
    marginVertical: 8, 
    fontSize: 20, 
    fontWeight: 'bold'
  }
});
