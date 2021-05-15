module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "Node Threader";
        return args;
      })
  },
  publicPath: "/nodethreader",
  outputDir: "dist"
}
