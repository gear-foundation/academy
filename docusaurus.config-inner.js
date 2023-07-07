const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

module.exports = async function config() {
  const math = (await import('remark-math')).default;
  const katex = (await import('rehype-katex')).default;

  return {
    title: 'Gear Academy',
    tagline: 'A place to learn about Gear and how to use it.',
    url: 'https://academy.gear.rs',
    baseUrl: '/inner/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
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
            sidebarPath: require.resolve('./sidebars-inner.js'),
            remarkPlugins: [math],
            rehypePlugins: [katex],
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
