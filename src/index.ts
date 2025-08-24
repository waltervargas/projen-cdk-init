import { ConstructInitializer, ConstructConfig } from './construct';

function main() {
  const args = process.argv.slice(2);
  const initializer = new ConstructInitializer();

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  if (args[0] === 'with-registry-aws-codeartifact') {
    const config = parseArguments(args.slice(1));
    if (!config.packageName) {
      console.error('❌ Package name is required. Use --package-name option.');
      showHelp();
      process.exit(1);
    }
    void initDirect(initializer, config);
    return;
  }

  console.error('❌ Unknown command. Use: with-registry-aws-codeartifact');
  showHelp();
}

function showHelp() {
  console.log(`
🚀 Projen CDK Construct Library Generator

Usage:
  cdk-construct-init with-registry-aws-codeartifact --package-name <name> [options]

Commands:
  with-registry-aws-codeartifact   Initialize project with npm registry in AWS CodeArtifact

Options:
  --package-name        Package name (required)
  --description         Package description
  --author-name         Author name (default: <AUTHOR_NAME>)
  --author-email        Author email (default: <AUTHOR_EMAIL>)
  --repository-url      Repository URL

Examples:
  cdk-construct-init with-registry-aws-codeartifact --package-name monitoring-constructs \
    --description "Reusable pipeline constructs"
`);
}

function parseArguments(args: string[]): ConstructConfig {
  const config: ConstructConfig = { packageName: '' };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--package-name':
        config.packageName = value;
        break;
      case '--description':
        config.description = value;
        break;
      case '--author-name':
        config.authorName = value;
        break;
      case '--author-email':
        config.authorEmail = value;
        break;
      case '--repository-url':
        config.repositoryUrl = value;
        break;
    }
  }

  return config;
}

if (require.main === module) {
  main();
}

async function initDirect(initializer: ConstructInitializer, config: ConstructConfig) {
  try {
    await initializer.initProject(config);
    console.log('🎉 Initialization completed successfully');
  } catch (err: any) {
    console.error('❌ Initialization failed:', err?.message || err);
    process.exit(1);
  }
}