# FontCraft · 扩展字符版

基于 [fumoto0226/FontCraft](https://github.com/fumoto0226/FontCraft)，保留原版界面、手写绘字、预览和字体导出流程。

新增版权与常用符号、爱心与装饰、箭头与几何、颜文字表情、颜文字手势与边框五组字符。中、英、日三种语言使用同一套字符；导出的字体包含这些新增字符。

验证：`node test/characters.cjs`。

GitHub Pages：将代码推送到 `main`，在仓库 Settings → Pages → Build and deployment 中选择 GitHub Actions。内置工作流会发布网站。

原版 Google 登录与云同步配置保留自上游，新域名是否能使用由上游 Firebase 授权决定；浏览器本地绘字、保存和字体导出不依赖新建 Firebase 项目。

## 导入已有字体

页面顶部可导入 TTF / OTF，补充当前字符表中尚未绘制的字形。已有画稿不会被覆盖，空白字形会跳过。未修改的导入字形在再次导出时保留矢量轮廓和字宽；重新绘制后使用新的画稿。仅导入当前字符表中的字符，不迁移字体的字偶距、连字等高级排版规则。

如果旧作品只存在原网站的字体库里，先从原网站下载字体文件，再在此导入。

导入/导出回归测试：安装 opentype.js 1.3.4 后运行 `node test/font-import.cjs`，或通过 `OPENTYPE_JS` 指定该版本库文件的位置。
