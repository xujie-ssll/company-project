const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  // 基本路径配置
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',

  // 关闭生产环境的代码检查（避免干扰）
  lintOnSave: false,

  // 开发服务器配置（代理）
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.1.198:8001',
        changeOrigin: true,
        ws: true,
        // pathRewrite: { '^/api': '' }
      }
    },
    client: {
      overlay: false // 关闭错误弹框
    }
  },

  // Webpack 自定义配置（解决所有 Node.js 核心模块编译错误）
  configureWebpack: {
    resolve: {
      fallback: {
        // 一次性禁用所有 serialport 依赖的 Node.js 核心模块
        "os": false,
        "path": false,
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "crypto": false,
        "stream": false, // 新增：解决 stream 模块错误
        "util": false,
        "buffer": false
      }
    },
    // 禁用 Webpack 对 Node.js 模块的警告
    ignoreWarnings: [/Failed to parse source map/, /Can't resolve/],
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]
  },

  // 强制转译 serialport 相关依赖
  transpileDependencies: ['@serialport', 'node-gyp-build']
})