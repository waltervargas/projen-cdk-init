# projen-cdk-init

Scaffold a Projen-based AWS CDK construct library, pre-wired to use an npm registry hosted in AWS CodeArtifact.

## Prerequisites

- Node.js >= 18
- npm or yarn
- Git (recommended)
- Access to an AWS account if you plan to publish to CodeArtifact

## Install / Run

No installation required. Use npx, which runs the CLI directly from npm:

```
npx projen-cdk-init with-registry-aws-codeartifact --package-name my-construct
```

An alternate CLI name is also available:

```
npx cdk-construct-init with-registry-aws-codeartifact --package-name my-construct
```

## Usage

```
cdk-construct-init with-registry-aws-codeartifact --package-name <name> [options]

Options:
	--package-name        Package name (required)
	--description         Package description
	--author-name         Author name (default: <AUTHOR_NAME>)
	--author-email        Author email (default: <AUTHOR_EMAIL>)
	--repository-url      Repository URL
```

### What the generator does

When you run the command, it will:

- Create a new folder named after your package.
- Run `projen new awscdk-construct` to scaffold a TypeScript library.
- Configure npm publishing to an AWS CodeArtifact registry and add GitHub OIDC authentication snippets to `.projenrc.ts`.
- Synthesize the project (`npx projen`), then run install/build/tests.

The generator patches the new project’s `.projenrc.ts` to include a CodeArtifact role similar to:

```
arn:aws:iam::<AWS_ACCOUNT_ID>:role/github-repo-<ORG>-<packageName>
```

and sets the npm registry URL using a value you provide via defaults (see Configuration) or that you later edit in the generated project.

## Configuration

This CLI ships with placeholders so it can be adapted to your environment:

- <AUTHOR_NAME>, <AUTHOR_EMAIL>, <AUTHOR_ORGANIZATION>
- <NPM_REGISTRY_URL>
- <AWS_ACCOUNT_ID>
- <SCOPE> (used for the package scope @<SCOPE>/your-package)
- <ORG> (used in the IAM role name in `.projenrc.ts`)

You can customize these defaults in this repository’s `src/construct.ts` before publishing your own copy of the CLI. Alternatively, after your project is generated, open the new project’s `.projenrc.ts` and adjust the CodeArtifact options, repository metadata, and role to match your setup.

## Examples

Generate a construct library with description and repo URL:

```
npx projen-cdk-init with-registry-aws-codeartifact \
	--package-name monitoring-constructs \
	--description "Reusable pipeline constructs" \
	--repository-url https://github.com/<ORG>/<REPO>
```

## Developing this CLI

- Install deps and build:
	- `npx projen build`
- Run locally (after build):
	- `npx ./bin/cdk-construct-init with-registry-aws-codeartifact --package-name demo-lib`
- Tests:
	- `npm test`

## License

Apache-2.0