const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";

    return {
        entry: "./Src/index.js", // ponto de entrada do aplicativo
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].[contenthash].js",
            chunkFilename: "[name].[contenthash].chunk.js",
            publicPath: isProduction ? "./" : "/", // "/" para desenvolvimento, "./" para produção
            clean: true, // Limpa a pasta dist antes de cada build
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", { modules: false }],
                                "@babel/preset-react",
                            ],
                            cacheDirectory: true,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    sideEffects: true, // permite que o CSS seja importado
                    use: ["style-loader", "css-loader", "postcss-loader"], // adiciona suporte para o css e postcss
                },
                {
                    test: /\.(png|jpg|gif|svg)$/, // adiciona suporte para imagens
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[path][name].[ext]",
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: [".js", ".jsx"], // permite importar sem escrever extensão
        },
        optimization: {
            splitChunks: {
                chunks: "all",
                maxInitialRequests: 20,
                maxAsyncRequests: 20,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all",
                        priority: 10,
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: "react",
                        chunks: "all",
                        priority: 20,
                    },
                    common: {
                        minChunks: 2,
                        chunks: "all",
                        enforce: true,
                        priority: 5,
                    },
                },
            },
            runtimeChunk: "single",
            minimize: isProduction,
            usedExports: true,
            sideEffects: false,
        },
        performance: {
            hints: isProduction ? "warning" : false,
            maxEntrypointSize: 400000, // 400KB
            maxAssetSize: 400000, // 400KB
        },
        devServer: {
            static: {
                directory: path.join(__dirname, "dist"),
            },
            //static: false, // Não serve arquivos estáticos durante desenvolvimento
            port: 8080,
            host: "localhost",
            open: true,
            hot: true, // Hot module replacement
            compress: true,
            historyApiFallback: {
                disableDotRule: true, // Importante para SPAs
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./Public/index.html",
                inject: true,
                filename: "index.html",
                minify: isProduction
                    ? {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true,
                      }
                    : false,
            }),
        ],
    };
};
