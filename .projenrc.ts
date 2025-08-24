import { typescript, javascript } from 'projen';
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'projen-cdk-init',
  projenrcTs: true,
  packageName: 'projen-cdk-init',
  description: 'Scaffold a Projen CDK construct project with npm registry on AWS CodeArtifact',
  
  // npm package metadata and distribution settings
  authorName: 'Walter Vargas',
  authorEmail: 'w@walter.bio',
  authorOrganization: true,
  repository: 'https://github.com/waltervargas/projen-cdk-init',
  homepage: 'https://github.com/waltervargas/projen-cdk-init#readme',
  keywords: ['cdk', 'projen', 'aws', 'codeartifact', 'construct', 'scaffold'],
  bin: {
    'projen-cdk-init': 'bin/cdk-construct-init',
    'cdk-construct-init': 'bin/cdk-construct-init',
  },
  minNodeVersion: '20.9.0',
  workflowNodeVersion: '20.9.0',
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmTokenSecret: 'NPM_TOKEN',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
});
project.synth();