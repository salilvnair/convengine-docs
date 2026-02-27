// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docSidebar: [
    'overview',
    'architecture',
    'examples',
    'faq',
    'local-development',
    {
      type: 'category',
      label: 'Consumer',
      link: { type: 'doc', id: 'consumer/index' },
      items: [
        'consumer/new-consumer-onboarding',
        'consumer/ui-integration',
        'consumer/backend-integration',
        'consumer/caching-and-persistence',
        'consumer/configuration',
        'consumer/annotations-reference',
        'consumer/extensions',
        'consumer/session-reset-and-continuity',
        {
          type: 'category',
          label: 'MCP',
          items: [
            'consumer/mcp/basics',
            'consumer/mcp/advanced',
            'consumer/mcp/http-tool',
            'consumer/mcp/deep-dive',
            'consumer/mcp/example1',
            'consumer/mcp/example2',
          ],
        },
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
      link: { type: 'doc', id: 'deep-dive/index' },
      items: [
        'deep-dive/lifecycle',
        'deep-dive/examples',
        'deep-dive/data-model',
        'deep-dive/developer-guide',
        'deep-dive/file-map',
        'deep-dive/pipeline-steps',
        'deep-dive/intent-and-schema',
        'deep-dive/rules-responses',
        'deep-dive/mcp-audit',
        'deep-dive/v2-features',
        'deep-dive/failure-gotchas',
        'deep-dive/improvement-backlog',
      ],
    },
    'version-history',
  ],
};

export default sidebars;
