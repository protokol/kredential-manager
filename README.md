# EBSI Enterprise Wallet by Protokol

This is a reference implementation of the EBSI Enterprise Wallet as part of the EBSI Vector project.

The wallet is intended to be used by organizations wanting to issue verifiable credentials in accordance with EBSI guidelines. The frontend is flavoured towards the so-called "diploma use case" (student/university relationship) as an example, but the underlying issuance mechanisms are universal and could easily be adapted for other use cases as well. 

# User flow (diploma use case)
- Using a holder wallet 
Issuance of Verifiable Credentials
Decenralized Identifier (DID)

## Supported features
- issuance of VCs
- 
## Architectural overview

## Installation guide

## License

# Contact Us For Support And Custom Development

info@protokol.com


---


Monorepo project utilizing [pnpm workspaces](https://pnpm.io/workspaces) and [pnpm](https://pnpm.io/).

## Project Structure

```text
.
├── apps
│   ├── cdk
│   ├── backend
│   └── frontend
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

### Apps Folder
Currently, contains working directories for:
- `cdk` - AWS CDK for deploying infrastructure (if needed). AWS CDK is IaC (Infrastructure as Code) framework for AWS making it easy to deploy same infrastructure to various environments.
- `backend` - Backend application. Currently using [Nest.js](https://nestjs.com/).
- `frontend` - Frontend application. Currently using [Next.js](https://nextjs.org/) and [tailwindcss](https://tailwindcss.com/).

### CI/CD

For CI/CD we are currently using GitHub Actions.