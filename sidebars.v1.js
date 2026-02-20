// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docSidebar: [
    'overview',
    'architecture',
    'examples',
    'local-development',
    {
      type: 'category',
      label: 'Consumer',
      items: [
        'consumer/index',
        'consumer/new-consumer-onboarding',
        'consumer/ui-integration',
        'consumer/backend-integration',
        'consumer/configuration',
        'consumer/annotations-reference',
        'consumer/extensions',
        'consumer/session-reset-and-continuity',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/rest-api',
        'api/stream-api',
        'api/java-api',
        'api/audit-trace',
      ],
    },
    {
      type: 'category',
      label: 'Deep Dive',
      items: [
        'deep-dive/index',
        'deep-dive/lifecycle',
        'deep-dive/examples',
        'deep-dive/data-model',
        'deep-dive/developer-guide',
        'deep-dive/file-map',
        'deep-dive/pipeline-steps',
        'deep-dive/intent-and-schema',
        'deep-dive/rules-responses',
        'deep-dive/mcp-audit',
        'deep-dive/failure-gotchas',
        'deep-dive/improvement-backlog',
      ],
    },
    'version-history',
  ],
};

export default sidebars;
