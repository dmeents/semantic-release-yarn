module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@dmeents/semantic-release-yarn', { npmPublish: true }],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'dist/**/*'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    ['@semantic-release/github', { assets: './*.tgz' }],
  ],
};
