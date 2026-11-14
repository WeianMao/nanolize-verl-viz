# nanolize 分支 bug 记录

仅收录有证据确认、需要修改 claude/graph-contract-field-fixes 分支实现的 bug；每项须说明预期行为、实际行为、代码原因与修复位置。

本次确认 2 项分支 bug：I12 的 carry 过滤误删已冻结的 benchmark 输出契约，I13 的 Controller 输出 schema 与执行约束不一致。候选代码或后续调用已绕过影响，但这两项 nanolize 实现缺陷尚未修复。其余 13 条归入运行现象区。

## I12 — compile_knowledge 误删 benchmark 的精确输出排版契约

- 步骤：candidate-1 / attempt 1，contract-benchmark-7e7cfc-1。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：
```text
E       AssertionError: assert ['Parsing dat...------------'] == ['Parsing dat...------------']
E
E         At index 1 diff: '' != '------------------------------------------------------'
E         Use -v to get more diff
FAILED tests/nanolize_contracts/benchmark/test_public_benchmark.py::test_run_prints_table_and_parser_order
1 failed, 4 passed in 0.54s
```
- 核对后的原因：`src/nanolize/knowledge.py:530` 支持以唯一尾名匹配 carried 文件；第 550—558 行会丢弃仅提到 carried 文件、未提到其他已知源码路径的非 `interface` 记录，`compile_knowledge` 在第 580 行使用该规则。冻结事实 `fact.1c9193903066fd28.6` 是绑定 `contract-benchmark-7e7cfc-1` 的 `behavior`，规定标题后的 54 个连字符、固定表头和 11/12/29 个连字符组成的分隔线，却因输出标题含 `Parsing data.toml 1 times:` 被匹配到 carried 文件 `benchmark/data.toml`，误当作文件内容记录删掉。
- 证据：冻结 `plan.json:1355` 含该事实，导出的 `authoring/.nanolize-rewrite/knowledge/contracts.jsonl:102` 却记录按文件内容裁剪；`runner.log:41` 和第 111—120 行的作者回执明确报告缺少精确分隔线知识及该事实。精确约束已经冻结，正常 carry 数据夹具即可触发这条过滤路径，与网络、依赖、权限或共享集群配置无关。
- 绕过：candidate-1 和 candidate-2 均未通过 benchmark；保存并完整复验 candidate-2 后，Controller 第 8 轮通过默认 `on_failed_check` 提供 `benchmark/run.py` 原文参考及更具体指令，作者修复空行、列宽和分隔线。保留冻结测试和断言，没有修改 nanolize 代码或修复知识裁剪。
- 结果：candidate-3 的 benchmark 检查 5/5 通过，全部 6 项冻结检查与安装检查 2/2 均通过。候选输出修复成功，nanolize 的知识裁剪缺陷仍在。
- 修复位置：knowledge.py/carried_contracts 应区分 carried 文件内容与引用该文件名的程序行为，保留绑定冻结检查的输出契约，并增加此类误删的回归覆盖。

## I13 — Controller 输出 schema 与 request_id 执行约束不一致

- 步骤：controller round 4 的修复批次。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：`call 1 (run_agent): request_id is 1 to 100 letters, digits, - or _ and does not start with op-`；无效值为 `repair-api-import-first correction `；后两项收到 `An earlier call of this batch was invalid`。
- 核对后的原因：`src/nanolize/strategies/controller.py:329` 的 `answer_schema()` 仅要求 `request_id` 为 `string|null`、最长 100 字符，执行前第 491 行却要求 1—100 个字母、数字、`-`、`_`，且不得以 `op-` 开头。空串、含空格字符串和保留前缀均可通过输出 schema，再被执行校验拒绝；内置 Controller 本次即生成了这样的值。
- 归因范围：`src/nanolize/effort_runner.py:225` 及第 279—284 行已支持 `pattern`，框架具备表达该约束的能力。prompt 已用自然语言说明字符规则，拒绝非法调用及跳过依赖调用也符合文档；确定的问题是已知字段约束未同步到结构化输出 schema。该差异不依赖本地环境或外层运行方式。
- 绕过：保留校验，框架拒绝该批次并按默认 advice 执行 compare_task_effort（返回 behavior_acceptance_pending）；下一轮 controller 自行改用有效 request_id 并发起两项修复。没有修改代码、参数或放宽 schema。
- 结果：round 5 修复正常开始；这次是 1 条 invalid 和 2 条 skipped，未执行无效批次中的作者调用。
- 修复位置：strategies/controller.py/answer_schema 应与 REQUEST_ID 共用一致的长度、字符及保留前缀约束，避免结构化输出允许执行端必然拒绝的值。

其余记录见 [运行现象记录](observations.md)。
