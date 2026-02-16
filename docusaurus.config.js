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
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/salilvnair/convengine-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
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
        { to: '/docs/overview', position: 'left', label: 'Overview' },
        { to: '/docs/architecture', position: 'left', label: 'Architecture' },
        { to: '/docs/examples', position: 'left', label: 'Examples' },
        { to: '/docs/version-history', position: 'left', label: 'Version History' },
        { to: '/docs/consumer', position: 'left', label: 'Consumer' },
        { to: '/docs/deep-dive', position: 'left', label: 'Deep Dive' },
        { to: '/docs/api/rest-api', position: 'left', label: 'API' },
        // { type: 'html', position: 'right', value: '<button class="clean-btn ce-navbar-toc-btn" aria-label="Toggle table of contents" title="Show TOC"><span class="ce-navbar-toc-btn-icon">≡</span></button>' },
        { href: 'https://github.com/salilvnair/convengine', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Overview', to: '/docs/overview' },
            { label: 'Architecture', to: '/docs/architecture' },
            { label: 'Local Development', to: '/docs/local-development' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'REST API', to: '/docs/api/rest-api' },
            { label: 'Java API', to: '/docs/api/java-api' },
            { label: 'Deep Dive', to: '/docs/deep-dive' },
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
