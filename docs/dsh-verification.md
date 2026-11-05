# dsh 插件验证记录

验证使用 npm 官方 `@deepseek-ai/dsh@0.2.2-rc.1`，隔离的 DSH_HOME 与自建 Web profile。没有设置模型 API Key，也没有调用模型。

## 已实测

- 官方 CLI `dsh plugin --profile village add https://github.com/atlanmatrix/yua-world.git#dsh` 成功，只有一个已编译插件依赖，无 prepare/postinstall 或用户本机构建。
- 官方 Web 登录令牌交换与 Cookie 认证；未认证请求文档接口返回 401。
- 真实 Slots 侧栏入口与 main 页面、iframe 内 WebGL 场景、季节与天气、小地图/完整地图。
- 导入 JSON 存档后设置恢复；刷新宿主后仍保留导入的秋季/雨天设置。
- `/nested/` 文档子路径下，通过本地反向代理映射测试 Connection 文档 RPC 和内置场景加载。此测试未覆盖宿主的通用事件 WebSocket，不代表整个 dsh 反向代理部署验收。
- 编译 HTML 中无外部 script、stylesheet、importmap；所有内联脚本通过 JavaScript 语法验证。Three.js 与全部游戏源码和 CSS 随包内置。
- 22 项 Node 测试通过，独立网站 build 与 build:dsh 均通过。发布器测试覆盖幂等、快进历史、拒绝无关分支及源码/暂存内容不变。
- 发布分支仅有 package.json、cordis.patch.yml、README.md、release.json 和 lib/{host.js,client.js,world.html}，没有 node_modules、配置、测试输出或凭据。
- 自动插件发布成功：https://github.com/atlanmatrix/yua-world/actions/runs/42045371730
- 原 Pages 部署成功：https://github.com/atlanmatrix/yua-world/actions/runs/42045947958

实测代码版本：main `ca121dcd118c438b452e54b2332b860744a65093`，Pages 安装工具修正 `9ab243e`。其 Git 安装制品为 dsh `deb83f19125fcd15df7dd4fe23f8acf1aa9b4b8b`。后续文档更新会通过同一自动流程生成新 release.json；代码资源不变时不需要重建用户数据。

## 尚未实测

Desktop/Electron 未实际启动。已核对官方 Connection carrier 接口：插件不拼接 HTTP 根路径或 Desktop 自定义协议 URL，不使用 Web-only 的图片资源路由加载脚本；但这只是接口/路径审计，不是 Desktop 兼容性实测。

## 复现

1. 安装官方 0.2.2-rc.1 CLI 与 pnpm，设置一个新的 DSH_HOME。
2. `dsh --profile village --from-default-profile web --dump-config` 创建隔离 Web profile。
3. 执行上述真实 Git 安装命令。
4. `dsh --profile village --port 3097 --no-open`，使用该次启动提供的认证地址打开浏览器；不要公开启动令牌。
5. 关闭可选的登录/API Key 入门弹窗，从侧栏进入风栖小镇，验证操作、地图和 JSON 存档导入/刷新恢复。
6. 源码检查：`npm ci && npm test && npm run build && npm run build:dsh`。发布：`npm run publish:dsh`。
