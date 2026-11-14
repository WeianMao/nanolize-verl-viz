# Requests graph-contract day2 问题记录

本节只列经核对确定需要修改 nanolize 分支的 2 项。普通提案退回、候选修复和防默写结果见 [运行中观察到的现象](observations.md)。

基点：WeianMao/nanolize `claude/graph-contract-field-fixes` / `9413138036b515f119ff63fa6db082a6148103f0`。
开始：2026-11-14T01:34:00Z（协调/准备）；作业时间另记。
所有检查和测试设计保持开启，scope=all，无人工预算/上限。本次未修改 nanolize 源码或放宽验收规则。

## 6. 函数敲除不适配导入期公开数据及兼容重导出，并丢弃相关事实

- 步骤：`design_leaf_tests` 两轮提案筛选。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：compatibility/status 两轮共 4 份提案均为 `no_behavioral_knockout_failure`，`runner_failures=[]`。
- 核对证据：第二轮兼容测试 14/14、状态测试 54/54 在原版重复执行通过且稳定，敲除矩阵仍为 `survived`。提案已实际执行，且运行器没有失败记录。
- 确定机制：`leaf_test_validity.py` 的 `_Knockout` 只改函数，保留模块数据、导入和导入期调用。状态表在导入期初始化，兼容层公开函数来自依赖重导出；敲掉本叶函数不会改变这些被测绑定。工具虽已有 `no_function_bodies` 例外，`_stands` 在 guarded 结果为 `survived` 时仍保留它，即使 plain 结果是 `no_function_bodies`。只读源码核对得到状态模块 guarded 可插入函数体 2 个、plain 可敲除函数体 0 个；保存的作业回执只直接记录最终 `survived`，不能称作重新运行的 plain 回执。
- 事实丢弃：`execution.py` 只将 accepted 测试及其 facts 纳入计划。被拒状态补测已包含 `early-hints=102`、`request_uri_too_long=122` 等历史值，实际首次作者请求、计划及 test-facts 中没有这两项别名事实。
- 上报边界：这是合法公共行为的验证及事实保留支持缺口。工具文档说明了导入期保留机制，并在缺少有效测试时保留 `unverified`；不将其描述为完整等价误通过，也不把其他叶节点缺少验证一概归因于本机制。
- 出现条件：叶节点主要提供导入期初始化常量表或依赖重导出，测试检查公开值而不调用本叶可敲除的运行期函数。重复设计不会让此类断言杀死函数敲除。
- 处理与结果：沿用默认第二轮、独立审阅和正式基线重建，最终接受 authentication、cookies、errors 的 4 文件/65 用例。最终仍有 compatibility、documentation、http-api、status 四个叶节点缺有效验证；该运行结果不代表四项缺口具有同一原因。未修改 nanolize 或放宽敲除判据。
- 补救方向：为公开数据及绑定提供受控变异，或分开保留经审阅成立的行为测试、事实与“尚无函数敲除证据”；不能把所有 `survived` 简单算通过。

## 7. 任务评估拒绝带尾斜杠的安全仓库内目录链接

- 步骤：`prepare_tasks` / 创建独立任务成本基线。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：`Task snapshots cannot isolate a directory symlink whose text is not a plain relative path (any .. first, then names)`；reason=`unsupported_repository_layout`，status=`unverified`。
- 核对证据：上游提交 `3c7baaa05ab4aa49cc819ce3a819d260de19c157` 的真实 Git 跟踪链接 `tests/certs/mtls/client/ca -> ../../expired/ca/` 为 mode `120000`，原始链接文本带尾斜杠；作业原版提交保留相同内容。目标存在，并解析到仓库内的 `tests/certs/expired/ca`。
- 确定机制：`effort.py` 先验证目标不越界，再由 `_directory_link` 检查 `os.readlink` 文本；`text.split("/")` 的末尾空字符串被拒绝。内存函数复核中原文本稳定被拒，去掉末尾斜杠则通过。
- 上报边界：文档已限制 plain relative path，现有 `test_effort_directory_links.py` 也明确把 `v1/` 列为拒绝情况。这是安全目录链接常见拼写的设计支持缺口，不是隔离失效或未捕获崩溃；不建议移除越界或快照完整性检查。昨天同类问题在该变体上复现。
- 出现条件：正常 checkout 此 Requests 提交并启用默认任务评估，或仓库含同类可解析到内部目录的尾斜杠链接时，都会进入相同拒绝分支。
- 处理：沿用 nanolize 内建 unsupported/unverified 记录继续完整压缩流程。未修改原版链接文本、任务快照边界规则、冻结检查或任务评估开启状态；未传 `--no-task-effort`。
- 结果：原版任务准备为 `unsupported_repository_layout / unverified`，`records=[]`，未启动任务模型调用。最终 `completed_with_gaps` 并已交付；最终任务比较另因 `behavior_acceptance_pending` 为 `unverified`，还存在行为验收缺口，不能把最终全部任务缺口归因于链接。没有有效任务基线，不能声称任务成本改善。
- 验收放宽：无；任务评估缺口明确保留。
