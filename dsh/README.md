# 风栖小镇 dsh 插件

安装地址：`https://github.com/atlanmatrix/yua-world.git#dsh`

在插件管理页添加此 Git 地址，启用后点击侧栏「风栖小镇」。仅声明支持已核对接口的 **dsh 0.2.2-rc.1**（官方源码 fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159）；后续预稳定版本需要重新验证。

包根的 cordis.patch.yml 加载 dsh-yua-world Host；同名客户端通过 `__ModuleLoader__.load`、`sidebar.panellist` 和 `main` Slots 注册。Host 通过官方 Connection 的 `/yua-world` 通道向 owner 返回随包发布的 world.html。iframe 的 srcdoc 包含全部 Three.js、JS 和 CSS，无网络资源、Worker、WASM、字体、Service Worker、动态分包或安装期构建。因为不构造 HTTP 根路径、file URL 或 Desktop 路径，资源与认证均由 Connection 承载；Desktop 自定义协议仍需真实 Desktop 验证，不能以 Web 实测替代。

iframe 隔离样式与键盘事件；卸载中止 RPC、移除 iframe，pagehide 释放 WebGL。iframe 允许脚本与同源存储，只运行本包经过构建的代码，不加载第三方网页。

## 数据迁移

原网站唯一持久化数据是 localStorage 的 `yua-climate`（season/weather）；房屋、宠物和地形是确定性生成，没有角色进度存档。插件保留同名键，但运行在 dsh 的 origin，与 Pages 网站和不同 Desktop origin 的存储隔离。

在原网站浏览器控制台执行：

```js
copy(JSON.stringify({version:1,climate:JSON.parse(localStorage.getItem('yua-climate'))}))
```

将内容保存为 yua-world-save.json，在插件页点击「导入存档」。无已保存设置时无需迁移。插件内「导出存档」生成同样格式，支持备份、换浏览器、Web/Desktop 迁移；仅验证和导入 season/weather，不覆盖其他宿主数据。回到独立网站时可将导出的 climate 对象写回原键并刷新。

## 开发、打包和发布

main 中维护源码；dsh 分支仅含根清单、patch、此文档、release.json 和 lib 编译资源。

```sh
npm ci
npm test
npm run build             # 原独立网站不变
npm run build:dsh         # 输出 dist-dsh
npm run pack:dsh          # 可选 tgz，不是 Git 安装的前提
npm run publish:dsh       # 普通快进推送，独立临时 bare 仓库/index
```

发布器不 checkout、不修改开发仓库的 index/HEAD/暂存内容；拒绝没有本项目发布身份的已有 dsh 分支。发布提交记录 main SHA，完全相同的 tree 不重复提交，推送竞争由非强制推送拒绝。GitHub Actions 在相关 main 文件改变或手动触发时执行同一命令。不要将 dsh 分支合并回 main。

官方接口依据：
- https://github.com/deepseek-ai/deepseek-harness/blob/fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159/docs/user/develop/basic/publish.md
- 同版本 docs/subsystems/client-modules.md、slots.md、packages/client/connection/README.md

无需 API Key：插件不调用模型。
