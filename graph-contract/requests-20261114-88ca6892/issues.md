# Requests graph-contract day2 问题记录

基点：WeianMao/nanolize `claude/graph-contract-field-fixes` / `9413138036b515f119ff63fa6db082a6148103f0`。
开始：2026-11-14T01:34:00Z（协调/准备）；作业时间另记。
所有检查和测试设计保持开启，scope=all，无人工预算/上限。每项绕过独立记录。本次未修改 nanolize 源码，无工具绕过补丁；候选行为修复由独立作者完成并提交。

## 1. 获取私有 nanolize 仓库时 HTTPS 缺少交互凭据
- 步骤：安装准备 / git ls-remote。
- 作业 ID：尚未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`。
- 原因判断：环境为 GitHub 配置了 SSH 访问，HTTPS 没有 credential helper。
- 绕过：仓库 URL 改为 `git@github.com:WeianMao/nanolize.git`；不更改源码与验收参数。
- 结果：成功读取指定分支，远端 HEAD 精确等于 `9413138036b515f119ff63fa6db082a6148103f0`。
- 验收放宽：无。

## 2. Web 阅读器无法打开昨天公开报告
- 步骤：准备 / 读取对照报告。
- 作业 ID：尚未创建。
- 报错原文：`Internal Error` / URL `is not accessible via this tool`。
- 原因判断：专用 Web 阅读器访问失败，站点本身可用。
- 绕过：用 curl 下载公开 HTML、summary.json 和 issues.md 到 `run/baseline/`。
- 结果：成功保存并读取，无需登录；得到 6 项公开问题及原始指标。
- 验收放宽：无。

## 3. 环境额外 PyPI 镜像 DNS 失败导致安装重试
- 步骤：安装 nanolize 与测试依赖。
- 作业 ID：尚未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`，伴随 pip `Retrying`。
- 原因判断：环境额外配置的 NVIDIA 包索引不可解析；官方 PyPI 正常。
- 绕过：停止本任务旧 pip 进程，使用 `PIP_CONFIG_FILE=/dev/null PIP_EXTRA_INDEX_URL= PIP_INDEX_URL=https://pypi.org/simple` 重装指定分支及 Requests 测试依赖；不改模型或作业预算。
- 结果：nanolize 0.8.0 editable 安装至本地固定提交目录，测试依赖安装成功。完整日志 `logs/install-deps.log`。
- 验收放宽：无。

## 4. 默认 Slurm 检查执行器缺少 account
- 步骤：作业启动 / 检查执行器预检。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：
```text
fell back: the batch could not be submitted: Scheduler command failed: sbatch: sbatch: error: You forgot to specify which account you want to use.
sbatch: error: To see the list of accounts which you have access to:
sbatch: error:     sacctmgr -nP show assoc where user=$(whoami) format=account
sbatch: error: Batch job submission failed: Invalid account or account/partition combination specified
```
- 原因判断：集群要求明确指定账户，而默认 auto 执行器没有可用账户设置。
- 绕过：采用 nanolize 内建 auto 回退，本次所有检查在本机运行；没有修改冻结配置、预算或测试。
- 结果：`check-executor.json` 记录 kind=local，作业已进入原版基线与事实提取。
- 验收放宽：无，仅执行位置变化。

## 5. 原版基线的两个检查超时 / 重复不一致
- 步骤：capture_baseline，重复原版检查与节点敲除前的基线运行。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：`Baseline check 'original-lowlevel' did not pass: timed_out.`；`Checks passed once and then did not pass the same way on a repeated run; their candidate results are unverified, not regressions.`（original-testserver）。
- 原始证据：`baseline-result.json`：original-lowlevel 耗时 30.1264 秒、默认 timeout=30；original-testserver 初次通过耗时 26.2503 秒，stability=unstable。
- 原因判断：两个文件各有约 19.5 秒真实计时/本地 socket 测试，来源审计与解释器启动开销使整文件执行接近默认 30 秒；复查证实不一致由资源超时触发；没有已完成的行为断言失败。
- 绕过：保留全部测试、默认 30 秒和重复验证策略；先在相同来源审计下单独复查，继续工具默认设计后重建基线流程，最终无需拆分检查。
- 结果：默认设计后重建正式基线全部通过；保留最初失败证据，详见下方正式结果。
- 验收放宽：无。

### 问题 5 复查
- 原版 testserver 的不一致也确认为超时：重复记录 `status=timed_out`, `duration_seconds=30.1174`, `exit_code=-9`，没有完成的行为断言失败。
- 相同来源审计、相同命令和默认 30 秒下的独立复查：lowlevel 20/20 通过（28.4931 秒）；testserver 10 通过、1 个原版跳过（25.0915 秒）。证据：`run/slow-check-recheck.json`。
- 未改变检查定义；作业设计完成后会按工具默认流程重新冻结全部基线，独立复查不替代正式作业证据。

### 问题 5 正式结果
- 设计后的正式基线 `7f7644beb6bd4ef38ba1002c9716b76a` 全部 11 项检查通过，issues=[]。
- original-lowlevel 初次 22.2212 秒、重复记录 22.4422 秒；original-testserver 初次 20.7794 秒、重复记录 22.7133 秒；二者 runs=3，exit_stable=true，output_stable=true。
- 原命令、默认 30 秒时限和重复次数均未更改。采用默认设计后基线重建已恢复，没有拆分检查、跳过测试或手工把失败改成通过。

## 6. 第一轮补测的动态属性访问和敲除证据不足
- 步骤：design_leaf_tests 第一轮提案筛选。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：
  - `tests/nanolize_contracts/http_api_64b92ffe/test_public_http_verbs.py`：`outside_external_contract`；`not in the external contract: requests.(dynamic attribute)`。
  - `tests/nanolize_contracts/compatibility/test_public_compatibility.py`：`no_behavioral_knockout_failure`。
  - `tests/nanolize_contracts/status/test_status_alias_contract.py`：`no_behavioral_knockout_failure`。
- 原因判断：HTTP API 提案使用静态分析无法确定目标的动态属性；兼容别名/状态表检查没有在叶节点函数敲除后触发行为失败，不能作为该节点有效验证。文档节点本轮未提供提案。
- 绕过：采用默认第二轮，将逐文件反馈交给新的独立设计调用；不关闭动态访问限制、不把 survived 算作有效敲除。
- 结果：第一轮认证、Cookie、异常的 4 份文件进入后续独立审阅；HTTP API、兼容层、状态码和文档进入第二轮。最终结果见下方记录。
- 验收放宽：无。

### 问题 6 最终设计结果
- 第二轮 compatibility/test_alias_behavior.py 和 status/test_status_runtime_lookup.py 仍为 `no_behavioral_knockout_failure`。
- HTTP API 第二轮文件 `tests/nanolize_contracts/http_api_64b92ffe/test_http_entry_contract.py` 被独立审阅退回：`reviewer_veto`；原文：`test_post_nonempty_data_takes_precedence_over_invalid_json checks only the prepared method representation. It would pass if preparation skipped JSON but discarded the supplied data, so it does not verify the claimed data precedence.`
- 原因：该断言没有验证宣称的数据优先级；不应仅凭原版通过/敲除失败接收不准确事实。
- 默认两轮加独立审阅共接受 4 份文件，覆盖 authentication、cookies、errors 三个节点；退回 6 份提案，runner_failures=0；文档两轮均无提案。接受文件共有 65 个 pytest 用例。
- 绕过：保留全部通过独立审阅的文件，继续默认组合重跑及完整基线冻结；没有取消审阅，也没有补改被拒绝文件后绕过审阅。

## 7. 任务评估仍拒绝带尾斜杠的仓库内目录链接
- 步骤：prepare_tasks / 创建独立任务成本基线。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 报错原文：`Task snapshots cannot isolate a directory symlink whose text is not a plain relative path (any .. first, then names)`；reason=`unsupported_repository_layout`，status=`unverified`。
- 原因判断：分支已支持规范相对目录链接，但 Requests 的真实 Git 跟踪链接 `tests/certs/mtls/client/ca -> ../../expired/ca/` 带尾斜杠。`effort._directory_link` 拒绝末尾空路径分量，现有 `test_effort_directory_links.py` 也明确把 `v1/` 列为拒绝情况；仅不带尾斜杠的另一条 `tests/certs/valid/ca -> ../expired/ca` 不触发该规则。昨天同类目录布局问题仍在此具体变体上复现。
- 绕过：沿用 nanolize 内建的 unsupported/unverified 记录继续完整压缩流程。未修改原版链接文本、任务快照边界规则、冻结的检查或任务评估开启状态；没有传 --no-task-effort。
- 结果：最终 completed_with_gaps 并已交付；任务比较为 unverified / behavior_acceptance_pending，原版准备为 unsupported_repository_layout。没有有效任务基线，不能声称任务成本改善；未启动任务模型调用。
- 验收放宽：无；任务评估缺口明确保留。

## 8. 第一版候选的六个公开状态码别名漂移
- 步骤：candidate-1 正式验证及独立公开常量核对；原有 11 项行为检查已通过。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`；候选提交 `e24e680bda2d`。
- 报错原文（独立审计 JSON 差异）：`EARLY-HINTS` / `early-hints` expected=102、actual=missing；`REQUEST_URI_TOO_LONG` / `request_uri_too_long` expected=122、actual=414；`RESET` / `reset` expected=205、actual=missing。完整结果在 `run/public-values-candidate-1-diff.json`。
- 原因判断：原版包含特殊历史别名和非通常值；接口已经声明保留全表及全部别名，但自动抽取的符号名没有列出这些常量，状态码补测又缺少有效函数敲除证据而被退回。作者重建表时遗漏/改写了其中三对大小写别名；现有保留检查未覆盖它们。
- 绕过：使用官方 `job-call run_agent`，role=repair、capabilities=[status]，仅向独立作者补充上述六个公开行为值（参数文件 `run/repair-status-values.json`），然后 `save_candidate`；不由协调者直接改写候选、不暴露隐藏测试或原版实现、不改变任何冻结检查/预算。
- 结果：独立作者已修复并提交，随后重跑全部冻结验收；全部 243 个公开数值别名、元数据和 Session 默认值核对一致，详见下方修复结果。
- 验收放宽：无；这是修复已声明外部契约的行为偏差。

### 问题 8 修复结果
- 官方独立 repair 调用正常退出，只修改 `src/requests/status_codes.py`；修复提交 `26564c93d294`。
- 修复后全部 243 个公开数值状态别名、9 项元数据及 Session 默认配置与原版逐项相同；证据 `run/public-values-validation.json`。候选内部数据结构未被固定，审计通过公开属性访问取值。
- 控制器与排队的显式保存分别记录了 candidate-2 和 candidate-3，二者提交及内容相同；3 个候选记录仅有 2 个不同的实现提交。重复 request-id 的第二次显式保存返回已有回执，没有再次执行。
- 最终候选 candidate-3 的 11 项冻结检查全部通过：126 个 pytest 用例通过、0 失败、1 个原版跳过；3 项隔离安装检查全部通过。修复提交修改 1 个文件、增加 5 行、删除 2 行。交付提交 `313024bf805bb0243f51e4976a697efdedd09cce` 再次通过全部公开值核对。
- 最终状态 completed_with_gaps，仍保留 compatibility、documentation、http-api、status 四个有效叶节点验证缺口；独立公开值审计不冒充状态码节点的敲除证据。没有修改 nanolize 源码、原版测试或任何验收规则。
