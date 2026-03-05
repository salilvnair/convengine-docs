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
        'deep-dive/thymeleaf-spel',
        'deep-dive/verbose-and-conversation-runtime',
        'deep-dive/table-config',
        'deep-dive/developer-guide',
        'deep-dive/file-map',
        'deep-dive/pipeline-steps',
        'deep-dive/intent-and-schema',
        'deep-dive/rules-responses',
        {
          type: 'category',
          label: 'MCP',
          link: { type: 'doc', id: 'deep-dive/mcp/index' },
          items: [
            'deep-dive/mcp/basics',
            'deep-dive/mcp/advanced',
            'deep-dive/mcp/semantic-catalog',
            'deep-dive/mcp/semantic-query',
            'deep-dive/mcp/knowledge',
            'deep-dive/mcp/http-tool',
            'deep-dive/mcp/deep-dive',
            'deep-dive/mcp/example1',
            'deep-dive/mcp/example2',
            'deep-dive/mcp/example3',
            'deep-dive/mcp/example4',
            'deep-dive/mcp/example5',
          ],
        },
        'deep-dive/v2-features',
        'deep-dive/failure-gotchas',
        'deep-dive/improvement-backlog',
      ],
    },
    'version-history',
  ],
};

export default sidebars;
