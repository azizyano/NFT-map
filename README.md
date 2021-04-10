celo spin contract address 0x8a7EC29913a89763Af8C2D954f30Dbd3280e800E deployed in alfajores network 

this project is a fork from https://github.com/critesjosh/celo-dappkit

## Requirements

- [Node.js](https://nodejs.org/en/)
- [Yarn package manager](https://yarnpkg.com/)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Expo](https://docs.expo.io/get-started/installation/)


The project smart contracts and configuration are in the root directory. The React Native front end is in the `/client` directory. Once you download the box, run 

```bash
yarn       # install depenedncies
cd client  # move into the client directory
yarn       # install front end dependencies
```

## Mobile Dependencies

You will need the Expo app installed on your development mobile device or emulator ([iOS](https://apps.apple.com/app/apple-store/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www)). 

You will also need the [Celo Wallet](https://celo.org/developers/wallet) on your mobile device (or emulator) to sign transactions. The app may automatically connect to a HelloWorld contract that has already been deployed to the testnet, or you may have to deploy your own (details below).

## Smart contract development


Copy your account address and paste it in to the [Alfajores faucet](https://celo.org/developers/faucet) to fund your account.


## Developing the mobile application

Keep in mind that you will need a version of the Celo Wallet installed on the mobile device with which you are developing the application. The Celo Wallet is the private key management software that the user will sign transactions with. 

You can install the Celo wallet on your physical device with an invite code [here.](https://celo.org/developers/wallet) 

You can build a the latest version of the Celo Wallet and find instructions on running a development build [here.](https://github.com/celo-org/celo-monorepo/tree/master/packages/mobile) 

Once you have a device with the Celo wallet installed, you can test the application. 


### Application development with Expo

In this project, the React Native application lives in the `client` directory. `cd` into the client directory and run `$ yarn` to install the dependencies. 

[Expo](https://expo.io/) is a tool that makes developing React Native applications much easier. We will be using Expo for easy setup.

Install it with:
```
yarn global add expo-cli
# or
npm install --global expo-cli
```

You can start the application from the client directory with
```
expo start
```

You can use your physical mobile device or an emulator to develop apps with Expo. If you want to use your physical device, you will have to [install the Expo app on your device.](https://expo.io/learn)

Make sure the Celo Wallet app is open on your device when you are using your dapp. Your dapp will be requesting information from the Celo Wallet.

### Using an emulator

You can find more information about running and Android emulator [here.](https://developer.android.com/studio/run/emulator-commandline)

## Run Celo Dapp 

```
cd client 
npm run start
```
the app run in you localhost. if you have an emulator just click run on android device/emulator
if you want to use your mobile open expo app and scan to QR  code.

demo 



