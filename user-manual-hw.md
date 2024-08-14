# Kredential Holder Wallet - user manual

Holder Wallet is a mobile application intended for users who would like to keep their credentials in a digital form. It is following the self-sovereign identity (SSI) guidelines. More info on EBSI verifiable credentials and SSI can be found [here](https://ec.europa.eu/digital-building-blocks/sites/display/EBSI/EBSI+Verifiable+Credentials) 

If you are interested in the issuance of verifiable credentials please take a look at the [Kredential Enterpride Wallet](user-manual-ew.md)

## First run and initialization
For the Self-sovereign identity to function a few things need to be put in place. The user needs a decentralized identifier (called DID) and a pair of digital keys (a public and a private key). No worries, the app will take care of that when it launches for the first time and a friendly wizard will take tha user through the process. The user will also have to set a PIN to enter tha app. There is also the option tu use biometric authentication.

The DID and the pair of keys are safely stored on the user device and the private key never leaves the user device.

## Dashboard
Dashboard is the first screen presented after the successful login and serves as a quick overview of all credentials

<img src="./docs/images/hw-dashboard.png" width="70%" alt="dashboard">

## Credentials
Here a user can see all their credentials. There are 3 different statuses a credential can have:
- Pending - user has requested a credential but the request has not been processed yet by the issuer.
- Issued - after the VC has been approved by the issuer the user can retrieve it by (download to the holder wallet) by clicking the refresh icon on the certificate in the state Pending. After the VC is sent to the holder wallet its status will be changed to Issued and the user will get the option to see the details of the certificate.
- Rejected - if for some reason the issuer thinks the user is not entitled to the certificate they can reject it.
 
<img src="./docs/images/hw-credentials.png" width="70%" alt="credentials">

## Requesting a new credential
User can request a new credential by clicking the + icon on the Credentials page. For test purposes we have entered 2 Test universities and 2 credential types. After clicking the "Submit request" button the request gets submitted to the issuers enterprise wallet.

> [!IMPORTANT]  
> This flow is in line with the reference implementation of Kredential Manager (enterprise wallet) and may be subject to change while the pilot implementation.

<img src="./docs/images/hw-request-start.png" width="70%" alt="request start">

<img src="./docs/images/hw-submitted.png" width="70%" alt="request submitted">

## My Profile
In this section a user can see their DID (EBSI ID) and other personal info in case they wish to enter it. However only the DID is necessary to request a VC.

<img src="./docs/images/hw-profile.png" width="70%" alt="profile">
