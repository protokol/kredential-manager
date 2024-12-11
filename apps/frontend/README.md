# EBSI Frontend

This is the frontend package of Balloon CRM, it is powered by Next.js, TypeScript and Tailwind CSS.

## Prerequisites

- Node.js and npm or pnpm installed on your machine

## Getting Started

1. Clone the project

```bash
git clone git@github.com:protokol/aqtis.git
```

2. Change into the frontend project directory

```bash
cd balloon/apps/frontend
```

3. Install dependencies using `pnpm install`

```bash
pnpm install
```

4. Add environment variables to the .env file

Run command below to generate `.env` at the root of your project and copy the following variables into the file.

```bash
echo "NEXT_PUBLIC_BASE_API_URL=" > .env
```

The command creates a `.env` file with the following variables:

```
NEXT_PUBLIC_BASE_API_URL=
```

Make sure .env is inside balloon directory!

## Project Structure

```
   |-- balloon
   |   |-- app
   |   |   |-- app // App protected routes
   |   |-- components
   |   |   |-- composed // Composed components, for example when used on specific pages
   |   |   |-- ui // Pure UI components, for example button, input, etc.
   |   |-- utils
   |   |   |-- api // Files related to API calls including types and hooks
   |   |   |-- configs // Global configs
   |   |   |-- helpers // Files with helper functions
   |   |   |-- routes.tsx // File with all routes defined
```

## Coding Guidelines

#### General

- All components should be created inside `components` directory.
- All endpoints should be called using react-query. Create a hook inside `utils/api/<MODULE_NAME>` directory and use it
  inside components.
- Split huge components into smaller ones, think how it can be reused in multiple places.
- All pages should be server side components.
- When installing dependencies lock version. For example `pnpm install react-query --save-exact`.
- To import components use absolute imports. For example `import { Button } from '@components/ui/button'`.
- When creating new directory with multiple words use kebab-case. For example `member-detail`.

#### Typescript

- `any` types are strictly forbidden.
- Do not cast types, use `as` only when you are sure that the type is correct.

#### Code style

- No eslint rule comments allowed, these are global rules and should be followed.
- Use prettier to format your code and eslint to fix linting errors.
- No unused variables allowed.
- No unused imports allowed.
- No console.log allowed.
- Follow existing codebase style.
- No complex ternary operators allowed.
- No tailwind arbitrary classes allowed, except for data-* attributes.
