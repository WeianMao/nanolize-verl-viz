# 运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

沿用原记录编号，以下 3 条为正常审阅重试及候选实现回归和修复，不计为 nanolize 分支 bug。防默写退回为 0 文件 / 0 次，文件保护拒绝为 0 次；作者调用 3 次，其中定向修复 2 次。

## 007 — 独立审阅拒绝一条过度概括的文件编辑事实

- 出错步骤：write_test_facts 对原版 test_main.py 的第一轮事实审阅。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`The examples are correct, but preservation of all other text and blank lines is overstated. The parser includes leading whitespace in an assignment's original text, which replacement discards. For example, replacing a in '\\na=b' removes the leading blank line.`；missing 为 `tests/test_main.py::test_set_key` 和 `tests/test_main.py::test_set_key_round_trips`。
- 原因判断：事实撰写者把有限案例的文本保留行为概括得过强，独立审阅发现与原版行为不符。
- 绕过：采用工具原生第二轮事实撰写与审阅；保留原测试、断言及审阅规则，未手工修改事实或状态。
- 结果：第二轮完成；最终 109 条事实、2 条历史事实剔除、0 个测试未覆盖，01:48:13 UTC 进入基线与敲除验证。另一条剔除见分支缺陷 008。
- 验收标准：未放宽；这是验证流程正常捕获的模型输出问题。

## 011 — 首轮候选的文件编辑异常路径出现两项回归

- 出错步骤：候选 candidate-1 / verification-4 的 compare_behavior。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`tests.test_main::test_rewrite_closes_file_handle_on_lstat_failure` 在 `src/dotenv/main.py:170 in _edit` 抛出 `FileNotFoundError`；`test_rewrite_reports_original_error_when_cleanup_fails` 在 `[temp_file] = dotenv_path.parent.glob(".tmp_*")` 处报 `ValueError: not enough values to unpack (expected 1, got 0)`。
- 原因判断：候选对 lstat 的 FileNotFoundError 处理与原版不同；临时文件命名或清理机制也没有满足冻结行为。第二项与昨天记录 018 的临时文件问题相同。
- 绕过：保留两项测试和断言，交给默认作者修复；控制器第 4 轮安排针对环境加载/编辑能力的 run_agent，默认 on_failed_check 策略可提供对应原生产文件。根协调器不修改候选或测试。
- 结果：首轮 test_main 为 154 passed、2 failed；全套 287 passed、4 failed、1 skipped。控制器于 02:24:57 UTC 开始修复；candidate-2 / verification-9 中两项均通过，全套恢复 291 passed、0 failed、1 skipped。
- 验收标准：未放宽；体积达到目标不抵消行为失败。

## 012 — 首轮候选缺少 CLI 错误提示中的固定引号

- 出错步骤：候选 candidate-1 / verification-4 的 compare_behavior。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`test_run_without_cmd` 和 `test_run_with_env_missing_and_invalid_cmd` 均为 `assert "Invalid value for '-f'" in result.stderr` 失败，实际提示为 `Error: Invalid value for -f: File .env does not exist.`。
- 原因判断：候选仍返回预期的退出码 2，但错误提示删掉了 -f 周围的单引号，不符合原版固定输出。
- 绕过：保持原测试输出要求，交由控制器安排的独立 CLI 修复调用修改候选；不放宽字符串断言。
- 结果：首轮 test_cli 为 51 passed、2 failed、1 skipped；旧问题 test_list[None] 本轮通过。candidate-2 / verification-9 中两项已修复，test_cli 为 53 passed、0 failed、1 skipped；最终候选体积 5,164 / 10,933 token（47.23%），3 项安装检查再次全部通过。
- 验收标准：未放宽。
