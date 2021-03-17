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
import Nftmap from './contracts/NFTMap.json'
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
const { SkynetClient } = require('@nebulous/skynet');
const client = new SkynetClient();

YellowBox.ignoreWarnings(['Warning: The provided value \'moz', 'Warning: The provided value \'ms-stream'])

export default class App extends React.Component {

  state = {
    address: 'Not logged in',
    phoneNumber: 'Not logged in',
    cUSDBalance: 'Not logged in',
    Nftmap: {},
    nftlist: '0',
    location: 'not fond',
    latitude: 'not fond',
    longitude: 'not fond',
    errorMsg: '',
    alow : null,
    image: null,
    link: '',
    textInput: ''
  }
  componentDidMount = async () => {

    let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        this.setState({errorMsg:'Permission to access location was denied'});
      return;
    }
    let location = await Location.getCurrentPositionAsync({});

    this.setState({latitude: JSON.stringify(location.coords.latitude),longitude: JSON.stringify(location.coords.longitude)  })
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Nftmap.networks[networkId];
    const instance = new web3.eth.Contract(
      Nftmap.abi,
      deployedNetwork && deployedNetwork.address
    );
    this.setState({ Nftmap: instance })
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
    const skylink = await client.uploadFile(this.state.image.uri);
    console.log(`Upload successful, skylink: ${skylink}`);
    this.setState({link: this.state.image.uri})
  }
  login = async () => {
    const requestId = 'login'
    const dappName = 'Celo NFT'
    const callback = Linking.makeUrl('/my/path')
    requestAccountAddress({
      requestId,
      dappName,
      callback,
    })
    const dappkitResponse = await waitForAccountAuth(requestId)
    kit.defaultAccount = dappkitResponse.address
    const stableToken = await kit.contracts.getStableToken()
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)
    let cUSDBalance = cUSDBalanceBig.toString()
    this.setState({ cUSDBalance, 
                    isLoadingBalance: false,
                    address: dappkitResponse.address, 
                    phoneNumber: dappkitResponse.phoneNumber })
  }

  read = async () => {
    let name = await this.state.Nftmap.methods.balanceOf(this.state.address).call()
    this.setState({ nftlist: name })
  }

  write = async () => {
    const requestId = 'create_nft'
    const dappName = 'Celo NFT'
    const callback = Linking.makeUrl('/my/path')
    const txObject = await this.state.Nftmap.methods.newEntity(
      this.state.address,
      this.state.latitude,
      this.state.longitude)
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.Nftmap.options.address,
          tx: txObject,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    console.log(`the NFT was created for this location: `, result)  
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
        <Text>latitude: {this.state.latitude} , </Text>
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
        <Text style={styles.title}>Chek you arrdess if you have NFTs</Text>
        <Button title="nft balance" 
          onPress={()=> this.read()} />
        <Text>Your NFTs: {this.state.nftlist}</Text>
        
        <Text style={styles.title}>create your NFT</Text>
        <Text>Create:</Text>
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
