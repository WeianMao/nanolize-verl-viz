# 运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

保留 I06 的基线审计局限及防默写检查结果；I12、I13 的代码缺陷及其处理见问题记录。

防默写退回属于运行机制记录，本次为 0 个文件、0 次拒绝；若发生退回，也应在此区记录，不计入分支 bug。

## I06 — 基线映射与动态 knockout 的验证局限

分类依据：已说明的静态映射与动态验证局限，不构成已确认实现错误。

- 步骤：capture_baseline 原版检查有效性审计。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 诊断原文：`mapping_without_static_evidence` / `No test source imports these leaves' modules.`（4 项检查）；`leaf_knockout_not_assessable` / `No knockout of this leaf's own source is possible; the check counts for it without dynamic evidence.`（api）；`undeclared_dependency` / `Knocking out this undeclared leaf broke the check's behavior.`。
- 原因判断：原测试经 tests 包别名引用 tomli；api 文件只是重导出；原版检查还能触达直接声明外的 parse/scalars 依赖。
- 绕过：这些是默认审计警告，按规则记录并继续，没有变更检查、图、基线或标准。
- 结果：4 项检查均通过且稳定；3 项 pytest 来源为 original_verified，内联检查来源 contract；api/parse 为 valid，api 缺少自身动态 knockout 证据的局限保持可见。
