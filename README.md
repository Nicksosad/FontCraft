# FontCraft · 扩展字符版

基于 [fumoto0226/FontCraft](https://github.com/fumoto0226/FontCraft)，保留原版界面、手写绘字、预览和字体导出流程。

新增版权与常用符号、爱心与装饰、箭头与几何、颜文字表情、颜文字手势与边框五组字符。中、英、日三种语言使用同一套字符；导出的字体包含这些新增字符。

验证：`node test/characters.cjs`。

GitHub Pages：将代码推送到 `main`，在仓库 Settings → Pages → Build and deployment 中选择 GitHub Actions。内置工作流会发布网站。

原版 Google 登录与云同步配置保留自上游，新域名是否能使用由上游 Firebase 授权决定；浏览器本地绘字、保存和字体导出不依赖新建 Firebase 项目。
