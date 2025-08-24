import { ConstructInitializer, ConstructConfig } from '../src/construct';

describe('ConstructInitializer', () => {
  let initializer: ConstructInitializer;

  beforeEach(() => {
    initializer = new ConstructInitializer();
  });

  // Removed command string tests; we now build args for spawn directly

  describe('generateProjenrcCustomizations', () => {
    it('should generate CodeArtifact customizations', () => {
      const config: ConstructConfig = {
        packageName: 'test-construct',
      };

      const customizations = initializer.generateProjenrcCustomizations(config);

      expect(customizations).toContain('codeArtifactOptions: {');
      expect(customizations).toContain('authProvider: javascript.CodeArtifactAuthProvider.GITHUB_OIDC');
      expect(customizations).toContain("roleToAssume: 'arn:aws:iam::<AWS_ACCOUNT_ID>:role/github-repo-<ORG>-test-construct'");
    });

    it('should generate GitHub options with pull request linting', () => {
      const config: ConstructConfig = {
        packageName: 'test-construct',
      };

      const customizations = initializer.generateProjenrcCustomizations(config);

      expect(customizations).toContain('githubOptions: {');
      expect(customizations).toContain('pullRequestLint: true');
      expect(customizations).toContain('semanticTitleOptions: {');
      expect(customizations).toContain('types:');
      expect(customizations).toContain("'feat'");
      expect(customizations).toContain("'fix'");
      expect(customizations).toContain("'chore'");
      expect(customizations).toContain("'docs'");
    });
  });

  // Node runner generation removed
});