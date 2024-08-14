<img src="./docs/images/kredential_logo.png" width="70%" alt="Kredential logo">

# Kredential Manager (EBSI Enterprise Wallet)

Kredential Manager is a reference implementation of the EBSI Enterprise Wallet as part of the EBSI Vector project developed and maintained by Protokol B.V.

It is primarily intended to be used by organizations wanting to issue verifiable credentials in accordance with EBSI guidelines. The frontend of this implementation is flavoured towards the so-called "diploma use case" (student/university relationship) as an example, but the underlying issuance mechanisms are universal and could easily be adapted for other use cases as well.

For a more detailed explanation on verifiable credential issuance please refer to EBSI [documentation](https://hub.ebsi.eu/conformance/learn/verifiable-credential-issuance#user-authentication) 

## User flow - issuance of a verifiable credential (diploma use case)
- Using a holder wallet (like Kredential wallet by Protokol B.V.) a student can request a verifiable credential from the university they attend
- Using the Kredential Manager an administrator at the university sees a request for a verifiable credential has been submitted. They have an option to approve or deny the request.
- After that the holder wallet user will be able to either receive the verifiable credential or is notified the request has been denied

## Architectural overview & design
The image below shows a high level view of the major parts of the Kredential Manager basic parts. Most (Backend, Identity and access management, Database) are separate Docker images. It also connects to a couple od "outside" services:
- EBSI layer is mainly used for the verification of publicly available DID documents.
- An external system providing data needed to populate requested verifiable credential schemas. In the reference implementation this data has to be entered manually through a form. In the pilot implementation phase data would ideally come from an external system and there would be no need for manual data input.

<img src="./docs/images/architecture.png" width="70%" alt="architecture">

### Data storage
There is no need to permanently store  personal data needed to issue a credential. The issuance process only requires the data has to be cached by the system until it is strictly needed for the process of issuance. Once the VC is sent to the holder all personal data can be permanently deleted from the system. In case the holder needs a re-issuance of the VC they will have to repeat the request-issue process again. 

> [!IMPORTANT]  
> It has to be noted that the current reference implementation is storing data beyond caching, mainly for demonstration and development purposes. This needs to be revisited during the pilot phase as it depends on details of the implementation (such as is it run locally by the issuer or by a third party, what are the needs of the issuers, legal implications, etc.)

Current implementation is running on AWS infrastructure. CDK scripts to simplify deployment to AWS are also included as part of this implementation.

## Communication with holder wallets
In order to request a credential holder wallets need a way to communicate with the enterprise wallet. Detailed API documentation is available [here](https://api.eu-dev.protokol.sh/api#OIDC) under the section OIDC


### Project Structure

```text
.
├── apps
│   ├── backend
│   ├── cdk
│   ├── ebsi-core
│   ├── ebsi-holder
│   ├── ebsi-json-rpc
│   ├── ebsi-sdk
│   ├── flows
│   └── frontend
└── docs
```

### Apps Folder
Currently, contains working directories for:
- `cdk` - AWS CDK for deploying infrastructure (if needed). AWS CDK is IaC (Infrastructure as Code) framework for AWS making it easy to deploy same infrastructure to various environments.
- `backend` - Backend application. Currently using [Nest.js](https://nestjs.com/).
- `frontend` - Frontend application. Currently using [Next.js](https://nextjs.org/) and [tailwindcss](https://tailwindcss.com/).

### CI/CD

For CI/CD we are currently using GitHub Actions.

## Installation guide

### Prerequisites
The organisation running this system needs to be onboarded to EBSI first. That means it needs to have a DID created and the DID document needs to be registered to EBSI. Details on this can be found here:
//TODO 

## License
The project and its applications can be licensed for use under a dual license model. For use within the EBSI VECTOR Pilot Project of the European Union and by the stakeholders therein, it is made available free of cost under the GNU Affero General Public License v3.0 ([AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html#license-text)). For all other uses, a commercial license, granted on an as-is basis, is available. For the avoidance of doubt, a commercial license does not grant the licensee a license to any background IPR or prior creations. Please refer to the AGPL-3.0 license text for more details on the terms and conditions. For commercial licensing inquiries, please contact us at info@protokol.com.

# Contact Us For Support And Custom Development

info@protokol.com


---



