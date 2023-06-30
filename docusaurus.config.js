const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

module.exports = async function config() {
  const math = (await import('remark-math')).default;
  const katex = (await import('rehype-katex')).default;

  return {
    title: 'Gear Academy',
    tagline: 'A place to learn about Gear and how to use it.',
    url: 'https://academy.gear.rs',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'gear-dapps',
    projectName: 'academy',

    presets: [
      [
        '@docusaurus/preset-classic',
        ({
          docs: {
            path: './docs',
            routeBasePath: '/',
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl: 'https://github.com/gear-dapps/academy/edit/master/',
            showLastUpdateTime: true,
            editLocalizedFiles: true,
            remarkPlugins: [math],
            rehypePlugins: [katex],
            lastVersion: 'current',
            versions: {
              current: {
                label: 'Current',
                badge: false,
              },
              next: {
                path: 'next',
                label: 'Next 🚧',
                banner: 'unreleased',
                badge: true,
              },
            },
          },
          blog: false,
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        }),
      ],
    ],

    themeConfig:
      ({
        navbar: {
          title: 'Gear Academy',
          logo: {
            alt: 'Logo',
            src: 'img/logo.svg',
            srcDark: "img/logo-inverted.svg"
          },
          items: [
            {
              type: 'docsVersionDropdown',
              position: 'right',
            },
            {
              type: 'localeDropdown',
              position: 'right',
            },
            {
              href: 'https://github.com/gear-dapps/academy',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
          additionalLanguages: ['rust', 'toml'],
        },
        algolia: {
          appId: 'TSHOIRZ5LK',
          apiKey: 'ad910ba9dd4a4f9ee44ad562b9e81b7a',
          indexName: 'gear-academy',
          contextualSearch: true,
          searchParameters: {},
          searchPagePath: 'search',
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

    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
        type: 'text/css',
        integrity:
          'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
        crossorigin: 'anonymous',
      },
    ],
  };
};
