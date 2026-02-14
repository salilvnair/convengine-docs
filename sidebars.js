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
        'consumer/ui-integration',
        'consumer/backend-integration',
        'consumer/configuration',
        'consumer/extensions',
        'consumer/session-reset-and-continuity',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/rest-api',
        'api/java-api',
        'api/audit-trace',
      ],
    },
    {
      type: 'category',
      label: 'Deep Dive',
      items: [
        'deep-dive/index',
        'deep-dive/file-map',
        'deep-dive/request-lifecycle',
        'deep-dive/pipeline-steps',
        'deep-dive/intent-and-schema',
        'deep-dive/rules-responses',
        'deep-dive/mcp-audit',
      ],
    },
  ],
};

export default sidebars;
