import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default {
  title: 'Gear Academy',
  tagline: 'A place to learn about Gear and how to use it.',
  url: 'https://academy.gear.rs',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'gear-foundation',
  projectName: 'academy',

  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/gear-foundation/academy/edit/master/',
          showLastUpdateTime: true,
          editLocalizedFiles: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
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
          customCss: './src/css/custom.css',
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
            type: 'dropdown',
            label: 'Courses',
            position: 'left',
            items: [
              {
                type: 'doc',
                docId: 'scd/index',
                label: 'Gear Smart Contract Developer',
              },
              {
                type: 'html',
                value: '<hr style="margin: 0.3rem 0;">',
              },
              // TODO: Uncomment when ready
              // {
              //   type: 'doc',
              //   docId: 'starter/index',
              //   label: '🚧 Starter (in-progress)',
              // },
              {
                type: 'doc',
                docId: 'basic/index',
                label: '🚧 Basic (in-progress)',
              },
              {
                type: 'doc',
                docId: 'intermediate/index',
                label: '🚧 Intermediate (in-progress)',
              },
            ],
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/gear-foundation/academy',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['rust', 'toml'],
      },
      algolia: {
        appId: 'G9ZWUC4KDW',
        apiKey: 'efc8d64eb799f47b90edfc19edd0a1a2',
        indexName: 'academy-gear',
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      },
    }),

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'zh-cn'],
    localeConfigs: {
      'en': {
        label: 'English',
      },
      'es': {
        label: 'Español'
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
