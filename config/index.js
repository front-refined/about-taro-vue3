import Components from 'unplugin-vue-components/webpack';
import NutUIResolver from '@nutui/nutui-taro/dist/resolver';
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack');
import MyPlugin from '../myWebpackPlugin/plugin';
import path from 'path';
const config = {
  projectName: 'nutui-taro-compile-h5-issue',
  date: '2023-7-13',
  designWidth(input) {
    if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
      return 375;
    }
    return 750;
  },
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'vue3',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false }
  },
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  sass: {
    data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`
  },
  mini: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(
        Components({
          resolvers: [NutUIResolver({ taro: true })]
        })
      );

      // myPlugin
      chain.plugin('myPlugin').use(MyPlugin);

      // myLoader
      chain.merge({
        module: {
          rule: {
            myLoader: {
              test: /\.vue$/,
              include: [
                path.resolve(__dirname, '../src/pages/weapp-tw/index.vue')
              ],
              use: [
                {
                  loader: path.resolve(
                    __dirname,
                    '../myWebpackPlugin/loader.js'
                  )
                }
              ]
            }
          }
        }
      });

      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [
              {
                appType: 'taro'
              }
            ]
          }
        }
      });
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          // selectorBlackList: ['nut-']
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(
        Components({
          resolvers: [NutUIResolver({ taro: true })]
        })
      );

      chain.plugin('myPlugin').use(MyPlugin);

      chain.merge({
        module: {
          rule: {
            myLoader: {
              test: /\.vue$/,
              include: [
                path.resolve(__dirname, '../src/pages/weapp-tw/index.vue')
              ],
              use: [
                {
                  loader: path.resolve(
                    __dirname,
                    '../myWebpackPlugin/loader.js'
                  )
                }
              ]
            }
          }
        }
      });
    },
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['nutui-taro', 'icons-vue-taro'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
