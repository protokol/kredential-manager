# Ebsi vector

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