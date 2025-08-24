export interface ConstructConfig {
  packageName: string;
  description?: string;
  authorName?: string;
  authorEmail?: string;
  cdkVersion?: string;
  repositoryUrl?: string;
}

export class ConstructInitializer {
  private readonly defaultConfig = {
    cdkVersion: '2.202.0',
    authorName: '<AUTHOR_NAME>',
    authorEmail: '<AUTHOR_EMAIL>',
    npmRegistryUrl: '<NPM_REGISTRY_URL>',
    accountId: '<AWS_ACCOUNT_ID>',
  };

  private buildProjenArgs(config: ConstructConfig): string[] {
    const cdkVersion = config.cdkVersion || this.defaultConfig.cdkVersion;
    const authorName = config.authorName || this.defaultConfig.authorName;
    const authorEmail = config.authorEmail || this.defaultConfig.authorEmail;

    const args: string[] = [
      'projen', 'new', 'awscdk-construct',
      '--name', `${config.packageName}`,
      '--package-name', `@<SCOPE>/${config.packageName}`,
      '--author-name', `${authorName}`,
      '--author-email', `${authorEmail}`,
      '--author-organization', '<AUTHOR_ORGANIZATION>',
      '--cdk-version', `${cdkVersion}`,
      '--npm-registry-url', `${this.defaultConfig.npmRegistryUrl}`,
      '--npm-access', 'restricted',
      '--edge-lambda-auto-discover', 'false',
      '--projenrc-ts', 'true',
    ];

    if (config.description) {
      args.push('--description', `${config.description}`);
    }
    if (config.repositoryUrl) {
      args.push('--repository-url', `${config.repositoryUrl}`);
    }

    return args;
  }

  generateProjenrcCustomizations(config: ConstructConfig): string {
    const roleArn = `arn:aws:iam::${this.defaultConfig.accountId}:role/github-repo-<ORG>-${config.packageName}`;

    return `
  codeArtifactOptions: {
    authProvider: javascript.CodeArtifactAuthProvider.GITHUB_OIDC,
    roleToAssume: '${roleArn}',
  },

  githubOptions: {
    pullRequestLint: true,
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          'feat',
          'fix',
          'chore',
          'docs',
        ],
      },
    },
  },`;
  }


  private ensureProjenImports(source: string): string {
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*'projen';/;
    const match = source.match(importRegex);
    if (!match) return source; // unexpected, but do nothing

    const inside = match[1];
    if (/\bjavascript\b/.test(inside)) return source;

    const updatedInside = inside
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    updatedInside.push('javascript');
    const unique = Array.from(new Set(updatedInside));
    const replacement = `import { ${unique.join(', ')} } from 'projen';`;
    return source.replace(importRegex, replacement);
  }

  private patchProjenRcText(source: string, customizations: string): { patched: string; changed: boolean } {
    const lines = source.split(/\r?\n/);
    const closingIndex = lines.findIndex(l => l.trim() === '});');
    if (closingIndex === -1) {
      return { patched: source, changed: false };
    }

    const closingLine = lines[closingIndex];
    const indentMatch = closingLine.match(/^(\s*)\}\);/);
    const indent = indentMatch ? indentMatch[1] : '';

    const customLines = customizations.replace(/^\n+|\n+$/g, '').split(/\r?\n/).map(l => indent + l);

    const before = lines.slice(0, closingIndex);
    const after = lines.slice(closingIndex);
    const patched = [...before, ...customLines, ...after].join('\n');
    return { patched, changed: true };
  }

  async initProject(config: ConstructConfig): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    const cp = await import('child_process');

    if (!config.packageName) {
      throw new Error('Package name is required');
    }

    const projectDir = path.resolve(process.cwd(), config.packageName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const args = this.buildProjenArgs(config);
    const projen = cp.spawnSync('npx', args, { cwd: projectDir, stdio: 'inherit' });
    if (projen.status !== 0) {
      throw new Error('Failed to run projen to scaffold the project');
    }

    const projenrcPath = path.join(projectDir, '.projenrc.ts');
    let content = fs.readFileSync(projenrcPath, 'utf8');
    content = this.ensureProjenImports(content);
    const { patched, changed } = this.patchProjenRcText(content, this.generateProjenrcCustomizations(config));
    if (!changed) {
      throw new Error('Could not find closing `});` in .projenrc.ts to insert customizations');
    }
    fs.writeFileSync(projenrcPath, patched);

    const projenSynth = cp.spawnSync('npx', ['projen'], { cwd: projectDir, stdio: 'inherit' });
    if (projenSynth.status !== 0) {
      throw new Error('Failed to run `npx projen` after patching .projenrc.ts');
    }

    cp.spawnSync('npm', ['install'], { cwd: projectDir, stdio: 'inherit' });
    cp.spawnSync('npm', ['run', 'build'], { cwd: projectDir, stdio: 'inherit' });
    cp.spawnSync('npm', ['test'], { cwd: projectDir, stdio: 'inherit' });

    cp.spawnSync('git', ['add', '.'], { cwd: projectDir, stdio: 'inherit' });
    cp.spawnSync('git', ['commit', '-m', 'feat: initial construct library setup'], { cwd: projectDir, stdio: 'inherit' });
  }
}