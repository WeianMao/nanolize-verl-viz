# 运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

已确认的分支缺陷另见 [issues.md](issues.md)。防默写检查本次退回 0 个不同文件、0 文件次。

## 12. dependency_groups 的私有调用形状仍受保留检查约束（昨天 #24 部分复现）

- 步骤：candidate-1 / test_dependency_groups。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`AssertionError: _resolve('leaf') call not found`；实际调用为 `call('leaf', 'root', [], set(), [])`，公共返回值的 4 个 attrs 已通过断言；该检查 1 failed、44 passed。
- 判断原因：转换器已将 `_resolve` / `_validate` 私有名称列为接口，但原测试还要求 `_resolve` 内部递归调用的单参数形状。声明名称不能完全消除实现耦合。昨天的 specifiers / pylock 私有类型约束已通过剔除相应旧检查避免，本次 dependency_groups 子项仍复现。
- 绕过：保留原检查并让默认修复流程兼容其明确要求，不删除 spy 断言或改测试。
- 结果：candidate-4 中修改 src/packaging/dependency_groups.py，恢复单参数 `_resolve(group)` 递归分派，保留完成展开缓存、循环检测和错误收集；test_dependency_groups 全部 45 个用例通过，全图 26/27 组通过。
- 验收放宽：无。
- 分类说明：当前证据直接证明候选与保留测试的调用约定不兼容，且通过修改候选修复。它本身不足以证明 nanolize 分支有代码错误，列为兼容修复现象。

## 13. 控制器只看到受限的失败分类，断言差异不可见

- 步骤：candidate-1 的失败进入 controller/0006；作业 bc73cb142f814dd8b90647ddbb10cd4a。
- 观察原文：check-11 / check-21 为 {"cases":1,"origin":"verifier","type":"AssertionError"}，check-3 为 {"cases":1,"origin":"other","type":"AssertionError"}。私有 verification.json 保留详细 traceback，控制器不能直接看到转义、插入符或 spy 参数差异。
- 源码核对：failure_digest.py 明确采用封闭词汇表；rewrite.safe_feedback 只输出分类，以限制测试内容经异常通道返回作者。报告中没有名为 failure_digest 的字段，不等于摘要代码没有执行。
- 分类：这是已明确设计的信息边界及其运行影响；本次证据不足以认定分支实现错误，移入运行现象。
- 处理与结果：沿用冻结事实、本地复现与默认只读源码参考，4 次定向修复后 27/27 组通过；未改 nanolize、未向作者传递隐藏测试源码。无法量化受限摘要额外造成的轮次。
