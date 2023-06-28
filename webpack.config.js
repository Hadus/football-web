const path = require('path');
const resolve = dir => path.join(__dirname, dir);
// 加载哪个文件
// const basic_path = path.join(__dirname, './index.html')
const basic_path = path.join(__dirname, './src/BigSmall/Login/login.html')
// 加载加个文件
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, './index.js'),
  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'bundle.js'
  },
  devServer: {
    port: 3000,
    open: true,
    hot: true,
  },
  resolve: {
    alias: {
      '@': resolve('src'),
    }
  },
  module: {
    rules: [{
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png|gif|jpeg|bmp)$/,
        use: 'url-loader?limit=7624&name=[name].[ext]'
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)$/,
        use: 'url-loader'
      },
    ]
  },
  plugins: [
    new htmlWebpackPlugin({ // 根据指定模板页面生成内存镜像
      template: basic_path,
      filename: 'index.html'
    }),
  ],
  mode: 'development'
}