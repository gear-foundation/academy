import lightCodeTheme from 'prism-react-renderer';
import darkCodeTheme from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default {
  title: 'Gear Academy',
  tagline: 'A place to learn about Gear and how to use it.',
  url: 'https://academy.gear.rs',
  baseUrl: '/inner/',
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
          sidebarPath: './sidebars-inner.js',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
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
          customCss: './src/css/inner.css',
        },
      }),
    ],
  ],

  themeConfig:
    ({
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust', 'toml'],
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

  scripts: [
    {
      src:
        '/js/iframeResizer.contentWindow.min.js',
      async: false,
    },
  ],

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
