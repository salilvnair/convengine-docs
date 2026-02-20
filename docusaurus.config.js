import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ConvEngine',
  tagline: 'Deterministic conversational workflow engine',
  favicon: 'img/favicon.ico',
  future: { v4: true },
  trailingSlash: false,
  url: 'https://salilvnair.com',
  baseUrl: '/',
  organizationName: 'salilvnair',
  projectName: 'convengine-docs',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'v2',
        path: 'docs/v2',
        routeBasePath: 'docs/v2',
        sidebarPath: './sidebars.v2.js',
        editUrl: 'https://github.com/salilvnair/convengine-docs/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'v1',
        path: 'docs/v1',
        routeBasePath: 'docs/v1',
        sidebarPath: './sidebars.v1.js',
        editUrl: 'https://github.com/salilvnair/convengine-docs/tree/main/',
      },
    ],
  ],
  themeConfig: ({
    image: 'img/docusaurus-social-card.jpg',
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'ConvEngine Docs',
      logo: {
        alt: 'ConvEngine',
        src: 'img/logo_light.png',
        srcDark: 'img/logo.png',
      },
      items: [
        { to: '/docs/v2/overview', position: 'left', label: 'Overview', activeBaseRegex: '^/docs/v[12]/overview/?$' },
        { to: '/docs/v2/architecture', position: 'left', label: 'Architecture', activeBaseRegex: '^/docs/v[12]/architecture/?$' },
        { to: '/docs/v2/examples', position: 'left', label: 'Examples', activeBaseRegex: '^/docs/v[12]/examples/?$' },
        { to: '/docs/v2/version-history', position: 'left', label: 'Version History', activeBaseRegex: '^/docs/v[12]/version-history/?$' },
        { to: '/docs/v2/consumer', position: 'left', label: 'Consumer', activeBaseRegex: '^/docs/v[12]/consumer(?:/|$)' },
        { to: '/docs/v2/deep-dive', position: 'left', label: 'Deep Dive', activeBaseRegex: '^/docs/v[12]/deep-dive(?:/|$)' },
        { to: '/docs/v2/api/rest-api', position: 'left', label: 'API', activeBaseRegex: '^/docs/v[12]/api(?:/|$)' },
        {
          type: 'dropdown',
          position: 'right',
          label: 'Version',
          className: 'ce-version-dropdown',
          activeBaseRegex: '^/docs/v[12](?:/|$)',
          items: [
            { label: 'v2', to: '/docs/v2/overview', className: 'ce-version-item-v2' },
            { label: 'v1', to: '/docs/v1/overview', className: 'ce-version-item-v1' },
          ],
        },
        { type: 'html', position: 'right', value: '<button class="clean-btn ce-navbar-search-trigger" aria-label="Open global search" title="Open global search"><span class="ce-navbar-search-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="16.65" y1="16.65" x2="21" y2="21"></line></svg></span><span class="ce-navbar-search-text">Search</span><span class="ce-navbar-search-kbd">Cmd/Ctrl + K</span></button>' },
        { href: 'https://github.com/salilvnair/convengine', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Overview', to: '/docs/v2/overview' },
            { label: 'Architecture', to: '/docs/v2/architecture' },
            { label: 'Local Development', to: '/docs/v2/local-development' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'REST API', to: '/docs/v2/api/rest-api' },
            { label: 'Java API', to: '/docs/v2/api/java-api' },
            { label: 'Deep Dive', to: '/docs/v2/deep-dive' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ConvEngine.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['json', 'java', 'sql', 'bash', 'yaml'],
    },
  }),
};

export default config;
