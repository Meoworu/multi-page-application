const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { AutoWebPlugin } = require('web-webpack-plugin');

const autoWebPlugin = new AutoWebPlugin('pages', {
    template: './templates/index.html', // HTML 模版文件所在的文件路径
    //postEntrys: ['./vendor.js'],// 所有页面都依赖这份通用的 文件
    // 提取出所有页面公共的代码
    commonsChunk: {
      name: 'common',// 提取出公共代码 Chunk 的名称
    },
});
module.exports = (env = {}, argv)=>{
    return {
        entry: autoWebPlugin.entry({
            // 这里可以加入你额外需要的 Chunk 入口
        }),
        output:{
            filename:`js/[name]_[hash:8].js`,
            path:path.resolve(__dirname, 'dist'),
        },
        module:{
            rules:[
                {
                    test:/(\.js|\.jsx)$/,
                    exclude:[
                        path.resolve(__dirname, 'node_modules'),
                    ],
                    use:['babel-loader'],                    
                },
                {
                    test:/(\.scss|\.css)$/,
                    use:ExtractTextPlugin.extract({
                        fallback:'style-loader',
                        use:[
                            'css-loader?minimize',
                            'sass-loader',
                        ]
                    })
                }
            ]
        },

        plugins:[
            autoWebPlugin,//按目录生成单页面应用插件

            new ExtractTextPlugin({
                filename:`style/[name]_[contenthash:8].css`,
            }),
            new DefinePlugin({
                // 定义 NODE_ENV 环境变量为 production 去除 react 代码中的开发时才需要的部分
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new UglifyJsPlugin({
                // 最紧凑的输出
                beautify: false,
                // 删除所有的注释
                comments: false,
                compress: {
                  // 在UglifyJs删除没有用到的代码时不输出警告
                  warnings: false,
                  // 删除所有的 `console` 语句，可以兼容ie浏览器
                  drop_console: true,
                  // 内嵌定义了但是只用到一次的变量
                  collapse_vars: true,
                  // 提取出出现多次但是没有定义成变量去引用的静态值
                  reduce_vars: true,
                }
            }),
        ]        
    }
}