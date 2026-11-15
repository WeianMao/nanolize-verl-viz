# Requests 运行问题记录

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 1 项。

### #3 证据发现被仓库内测试符号链接阻断

discover_evidence 遇到快照已接受的仓库内测试目录符号链接 tests/certs/mtls/client/ca 时，整个证据发现失败，scope=src/requests 也无法避开。evidence_store.py:223–225 在范围过滤前构造引用，触发 capabilities.py:255–259 的链接拒绝；需协调快照与证据引用规则，并提前过滤范围外路径。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

### #4 静态文本素材主导合计体积及分项解释

静态 SVG 按冻结的文本计量规则计入 configuration：883,794 字节、559,761 tokens，主导合计体积；官方仍为 621,471 → 583,816 tokens、保留 93.94%，未达到 50% 建议目标。仅源码保留 40.42%、两侧剔除同一 SVG 后保留 38.98% 为补充口径，可增强大文件占比提示和素材分项解释。

### #5 静态导出局限与人工补全

静态转换无法解析 requests.packages.idna、requests.packages.urllib3 的动态依赖转发，报告列出未解析项并移出 test_packages。人工补全导出并恢复该检查后，检查组从 8 到 9，最终该组通过。

### #8 二进制资产需显式 carry

Submit 在花费前拒绝不可按文本计量的 ext/requests-logo.ai，提示显式 carry；补充后提交成功。最终逐字保留 1 文件、2,189,478 字节，这是计量完整性关卡的正常流程。

### #13 独立审阅拒绝一个弱测试提案

补测提案 test_stream_contract.py 以 requests.compat.is_urllib3_1 计算预期值，与被测 super_len 使用同一实现标志，独立审阅将其拒绝。最终接受 10 文件、拒绝 1 文件、运行器失败 0；此处的测试提案拒绝不计作防默写源码退回。

### #14 初版行为回归被验证捕获并修复

初版候选缺 TEAPOT 别名、flasky 主题模块加载失败、编码探测结果重复，冻结行为比较捕获了这三组回归。经 4 次行为修复交付 candidate-5，最终 19/19 组通过、539 passed / 1 skipped、安装 2/2 通过。
