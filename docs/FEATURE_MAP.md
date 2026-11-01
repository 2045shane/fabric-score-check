# 功能映射

| 功能 | 文件 | 验证 |
| --- | --- | --- |
| MV3、权限、注入顺序、图标 | `manifest.json`、`icons/*.png` | `tests/manifest.test.js` |
| 双向百分比、中文同义词、分类、占比、评分、提示 | `src/lib/composition.js` | `tests/composition.test.js` |
| 本地日期、每日 3 次、串行存储 | `src/lib/quota.js` | `tests/quota.test.js` |
| FSC1. SHA-256 离线校验 | `src/lib/license.js`、`scripts/gen-license.mjs` | `tests/license.test.js` |
| 商品路由、集中选择器、Amazon 文本兜底 | `src/content/selectors.js` | `tests/selectors.test.js` |
| 主动检查、后台计次、设置页保存许可 | `src/background/service-worker.js` | `tests/background.test.js` |
| 页面右下角中文面板、SPA 状态、收起 | `src/content/content.js` | 待真实 Chrome 手工验收 |
| 当前商品触发、剩余次数、设置入口 | `src/popup/popup.html`、`popup.js` | 待真实 Chrome 手工验收 |
| 输入、验证、保存、清除离线许可 | `src/options/options.html`、`options.js` | 后台逻辑已测试；页面待手工验收 |
| 米色、朱红、字体、公共页面布局 | `src/ui/theme.css`、`pages.css` | 参考仓主题；待视觉验收 |

## 数据流

用户点击面板或 popup → content 确认商品路由 → 后台排队校验许可/配额 → `chrome.storage.local` 计次 → content 读取商品 DOM → composition 分析 → Shadow DOM 面板显示原文、结果和提示。被动加载不调用计次；超限不提取成分。

## MVP 边界 / 待办

- DOM 易变、未在真站验收。Amazon 需要逐地区采集脱敏 HTML fixture 和人工验证。
- Shein / Zara 选择器明确为占位实现，TODO 保留在集中选择器文件中；需真站核验。
- 不同面料层的独立评分、OCR、更多地区语言与同商品去重尚未实现。
- 不含在线支付、服务端授权、防篡改计费或数据上报。
- 所有测试均为离线 Node 测试，不等同于真实 Chrome 端到端验证。
