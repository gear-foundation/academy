// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Gear Academy',
  tagline: 'A place to learn about Gear and how to use it.',
  url: 'https://academy.gear.rs',
  baseUrl: '/inner/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'gear-dapps',
  projectName: 'academy',

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars-inner.js'),
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Current',
              badge: false,
            },
          },
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/inner.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust', 'toml'],
      },
    }),

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn'],
    localeConfigs: {
      'en': {
        label: 'English',
      },
      'zh-cn': {
        label: '简体中文'
      }
    }
  },

  scripts: [
    {
      src:
        '/js/iframeResizer.contentWindow.min.js',
      async: false,
    },
  ],
};

module.exports = config;
