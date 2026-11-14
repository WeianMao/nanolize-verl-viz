# 运行现象与处理

环境与配置问题、正常审阅重试、候选实现回归和报告脚本错误列在这里，不计为 nanolize 分支 bug。沿用原记录编号；原运行指标和处理结果保持不变。防默写退回为 0 文件 / 0 次，文件保护拒绝为 0 次；作者调用 3 次，其中定向修复 2 次。

## 001 — 私有 nanolize 仓库的 HTTPS 克隆缺少认证

- 出错步骤：安装指定分支，执行 `git clone --branch claude/graph-contract-field-fixes --single-branch https://github.com/WeianMao/nanolize.git nanolize`。
- 作业 ID：未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`。
- 原因判断：仓库需要 GitHub 身份认证，当前 HTTPS Git 没有配置可用的凭据助手。
- 绕过：检查现有 SSH/凭据配置，使用已有授权凭据获取指定分支；不改用 main。
- 结果：使用已有 SSH 密钥及已知主机记录成功克隆；HEAD 为指定提交 `9413138036b515f119ff63fa6db082a6148103f0`，分支为 `claude/graph-contract-field-fixes`。凭据未写入运行产物。
- 验收标准：未放宽。

## 002 — 系统 pip 额外索引 DNS 失败导致安装持续重试

- 出错步骤：安装 nanolize 与验证依赖。
- 作业 ID：未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`，路径 `/mcp/` 和 `/tiktoken/`；仅传 `--index-url https://pypi.org/simple` 后仍显示 `https://pypi.ngc.nvidia.com` 额外索引。
- 原因判断：系统 pip 配置带入了当前不可达的额外索引，pip 对各依赖重复等待。
- 绕过：仅终止本运行目录所属安装进程；用 `PIP_CONFIG_FILE=/dev/null PIP_EXTRA_INDEX_URL= PIP_INDEX_URL=https://pypi.org/simple` 重试，仍安装指定分支的相同依赖约束。记录见 logs/install-clean-index.log。
- 结果：指定提交的 nanolize 0.8.0、tiktoken 0.12.0 及 pytest/Click/IPython/build/wheel 安装成功。
- 验收标准：未放宽。

## 003 — 旧清单误把空的类型标记列为生产源码路径

- 出错步骤：第一次 contract-propose。
- 作业 ID：未创建。
- 报错原文：`ValueError: Capability path matches no production source: src/dotenv/py.typed`。
- 原因判断：空的 py.typed 属于分发类型标记，不在 nanolize 可计量生产源码清单内。
- 绕过：从旧清单的源码 paths 移除该标记；将分发需包含 py.typed 的要求写入新清单 distribution.interface；没有删除源仓库标记或验收要求。
- 结果：转换成功；分发节点 paths 只映射可计量的 version.py，配置由工具统一计量，类型标记的要求已补入 interface。
- 验收标准：未放宽。

## 004 — 旧清单使用了不支持的 case_report 字段

- 出错步骤：第二次 contract-propose；后续清单补充与 plan 因转换无输出而连带失败。
- 作业 ID：未创建。
- 报错原文：`ValueError: each check needs name/argv and only supported check fields`；后续为 `FileNotFoundError: ... run/graph-manifest.proposed.json` 和 `FileNotFoundError: ... run/graph-manifest.json`。
- 原因判断：准备脚本使用了自拟的 case_report 属性，而该分支会自动为 pytest 注入独立 JUnit 报告。
- 绕过：移除不支持的 case_report 属性与自拟固定 JUnit 输出参数，使用工具原生的逐检查报告；检查文件和断言不变。
- 结果：转换成功；全部 10 组检查保留，无检查剔除或无法读取。
- 验收标准：未放宽。

## 005 — 补充 interface 时重复声明版本导出

- 出错步骤：第一次全范围 plan。
- 作业 ID：未创建。
- 报错原文：`ValueError: Capability interface lists an entry twice: distribution`。
- 原因判断：人工补充的 `Public name dotenv.version.__version__` 已由转换器生成。
- 绕过：对每个节点 interface 做保持顺序的完全相同字符串去重；所有独立契约条目均保留。
- 结果：全范围规划成功，8 节点全部保留；原版基准为 10,933 源码加配置 token，作业已启动。
- 验收标准：未放宽。

## 006 — 默认 Slurm 探测缺少账户，自动回退本机

- 出错步骤：作业启动时 check executor 的空批次探测。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`Scheduler command failed: sbatch: sbatch: error: You forgot to specify which account you want to use.\nsbatch: error: To see the list of accounts which you have access to:\nsbatch: error:     sacctmgr -nP show assoc where user=$(whoami) format=account\nsbatch: error: Batch job submission failed: Invalid account or account/partition combination specified`。
- 原因判断：默认 auto 探测到 Slurm 命令，但集群要求显式计费账户。
- 绕过：采用工具自带 auto 回退，本机执行检查；没有修改参数、代码或验收标准，基线和候选将使用相同执行环境。
- 结果：check-executor.json 记录 requested=auto、kind=local；控制器已开始运行。
- 验收标准：未放宽。

## 007 — 独立审阅拒绝一条过度概括的文件编辑事实

- 出错步骤：write_test_facts 对原版 test_main.py 的第一轮事实审阅。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`The examples are correct, but preservation of all other text and blank lines is overstated. The parser includes leading whitespace in an assignment's original text, which replacement discards. For example, replacing a in '\\na=b' removes the leading blank line.`；missing 为 `tests/test_main.py::test_set_key` 和 `tests/test_main.py::test_set_key_round_trips`。
- 原因判断：事实撰写者把有限案例的文本保留行为概括得过强，独立审阅发现与原版行为不符。
- 绕过：采用工具原生第二轮事实撰写与审阅；保留原测试、断言及审阅规则，未手工修改事实或状态。
- 结果：第二轮完成；最终 109 条事实、2 条历史事实剔除、0 个测试未覆盖，01:48:13 UTC 进入基线与敲除验证。另一条剔除见分支缺陷 008。
- 验收标准：未放宽；这是验证流程正常捕获的模型输出问题。

## 009 — 便携验证包仍拒绝绝对检查启动器

- 出错步骤：seal_contract 阶段导出便携验证包。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`Portable checks need a PATH executable or repository-relative command`，bundle-receipt.json 的 status 为 unavailable。
- 原因判断：本次检查使用运行目录的绝对 check-python 启动器，以保证原版、候选及子进程均导入各自的源码；此命令绑定了本地验证环境，不满足便携命令约束。与昨天记录 026 属同一限制，错误文字更具体。
- 绕过：保留本地冻结检查与运行证据，继续完整作业和公开报告生成；不修改已冻结检查来伪称同一个便携包可用。
- 结果：本地契约封存成功，原版 291 passed、0 failed、1 skipped，7 个外部叶节点 valid、missing=[]；便携验证包不可用，报告将明确说明。
- 验收标准：未放宽；便携交付物缺口保留。

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

## 013 — 报告复核时误在非仓库目录执行 Git 状态检查

- 出错步骤：交付完成后的报告复核，在包含多个仓库的运行目录执行 `git status --short`。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab（已完成，此错误属于外层报告准备）。
- 报错原文（本机目录脱敏，完整原文保存在 report-verification-errors.log）：`fatal: not a git repository (or any parent up to mount point [运行目录父路径])`；`Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).`。
- 原因判断：运行目录是各仓库的容器，自身没有 .git；属于协调脚本工作目录选择错误。随后保存该错误时又误用不存在的 run/logs 目录，报 `FileNotFoundError: [Errno 2] No such file or directory: 'run/logs/report-verification-error.log'`，已将日志保存到现有 run 目录的 report-verification-errors.log。
- 绕过：改用 `git -C report-site status --short`，并分别用 `git -C nanolize`、`git -C python-dotenv` 核对源码仓库；未修改代码、参数或运行结果。
- 结果：各仓库状态核对成功，原版和 nanolize 源码均干净；报告继续发布。该步骤发生在已报告的交付时间之后。
- 验收标准：未放宽。
