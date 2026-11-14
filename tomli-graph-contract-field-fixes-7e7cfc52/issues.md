# Tomli graph-contract field-fixes 运行问题记录

所有运行问题均记入此文件；没有关闭检查或放宽验收标准。

## I01 — 准备阶段 HTTPS 仓库访问缺少凭据
- 步骤：读取指定 nanolize 分支。
- 作业 ID：尚未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`。
- 原因判断：当前环境未配置 HTTPS GitHub 凭据，已有 SSH 身份。
- 绕过：将 clone/ls-remote URL 改为 `git@github.com:WeianMao/nanolize.git`；没有修改 nanolize 代码。
- 结果：SSH 确认分支 HEAD 为 `9413138036b515f119ff63fa6db082a6148103f0`，继续安装。

## I02 — 昨天公开页面无法经浏览工具读取
- 步骤：取得昨天报告。
- 作业 ID：尚未创建。
- 报错原文：`URL https://weianmao.github.io/nanolize-verl-viz/tomli-graph-contract-fc9bf606/ is not accessible via this tool.`
- 原因判断：浏览工具访问失败；公开站点本身可经普通 HTTPS 访问。
- 绕过：使用 curl 下载 index.html、report-data.json、issues.md，保存在 tmp/yesterday-*。
- 结果：成功取得昨天指标及 7 项问题；没有验收标准变更。

## I03 — pip 的附加索引 DNS 失败
- 步骤：安装指定分支与运行依赖。
- 作业 ID：尚未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`，请求 `/mcp/`。
- 原因判断：用户 pip 配置额外包含不可解析的 `pypi.ngc.nvidia.com`，公共 pypi.org 可访问。
- 绕过：安装命令设置 `PIP_CONFIG_FILE=/dev/null`，使用默认公共 PyPI；仍从本地指定分支安装 nanolize。
- 结果：公共索引成功安装 nanolize 0.8.0（editable 指向 9413138）及运行依赖；终止仍在无效索引重试的旧安装进程。没有修改检查或验收标准。

## I04 — 默认 Slurm 检查执行器缺少账户，自动回退本机
- 步骤：作业初始化检查执行器。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：
```text
fell back: the batch could not be submitted: Scheduler command failed: sbatch: sbatch: error: You forgot to specify which account you want to use.
sbatch: error: To see the list of accounts which you have access to:
sbatch: error:     sacctmgr -nP show assoc where user=$(whoami) format=account
sbatch: error: Batch job submission failed: Invalid account or account/partition combination specified
```
- 原因判断：auto 检测到 sbatch，但当前环境没有默认 Slurm account。
- 绕过：接受 nanolize 自带的 local fallback；没有更改配置文件、代码或命令参数。
- 结果：check-executor.json 记为 requested=auto、kind=local；冻结阶段继续执行所有检查，未放宽验收。

## I05 — 测试事实审阅拒绝内部类型模块的 API 归属
- 步骤：write_test_facts，test_misc 第 1 轮审阅。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错/否决原文：`Accurate import behavior, but importing an internal annotation module does not describe the listed public API capability.`；missing: `tests/test_misc.py::TestMiscellaneous::test_types_import`。
- 原因判断：原版检查含内部 `_types` 模块导入，事实被归入外部 api 节点，独立审阅认为归属不合适。
- 绕过：保留否决，由冻结器自动启动第 2 轮事实写入；不人工覆盖审阅或更改原版测试。
- 结果：冻结器最终记录 54 facts、1 dropped、0 tests not covered；继续捕获原版基线。原始审阅存于 facts/test_misc/tests_test_misc_py_56f87108/1/review/runner/result.json。

## I06 — 基线映射与动态 knockout 的验证局限
- 步骤：capture_baseline 原版检查有效性审计。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 诊断原文：`mapping_without_static_evidence` / `No test source imports these leaves' modules.`（4 项检查）；`leaf_knockout_not_assessable` / `No knockout of this leaf's own source is possible; the check counts for it without dynamic evidence.`（api）；`undeclared_dependency` / `Knocking out this undeclared leaf broke the check's behavior.`。
- 原因判断：原测试经 tests 包别名引用 tomli；api 文件只是重导出；原版检查还能触达直接声明外的 parse/scalars 依赖。
- 绕过：这些是默认审计警告，按规则记录并继续，没有变更检查、图、基线或标准。
- 结果：4 项检查均通过且稳定；3 项 pytest 来源为 original_verified，内联检查来源 contract；api/parse 为 valid，api 缺少自身动态 knockout 证据的局限保持可见。

## I07 — 补测审阅否决：fuzz（昨天同类问题重现）
- 步骤：design_leaf_tests 独立审阅，`tests/nanolize_contracts/fuzz/test_fuzz_behavior.py`。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错/否决原文：
```text
reviewer_veto
The fuzz callback tests would pass if test_one_input immediately returned None, skipping parsing, serialization, normalization, and roundtrip validation entirely.
```
- 原因判断：回调主体为空仍能满足测试；同文件中的 normalize 检查也随整文件否决，未获得独立接受的补测。
- 绕过：维持 reviewer_veto，由默认 strict:false 流程继续；没有修改文件、参数、验收断言或关闭任何检查；没有把被否决的提案加入冻结契约。
- 结果：该节点仍保留在全功能范围，补测缺口保留。设计总计接受 2 个文件/2 个节点（benchmark、packaging），否决 2 个，runner_failures=0。

## I08 — 补测审阅否决：profile（昨天同类问题重现）
- 步骤：design_leaf_tests 独立审阅，`tests/nanolize_contracts/profile/test_profile_workload.py`。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错/否决原文：
```text
reviewer_veto
Counts every profiled function named loads without identifying tomli.loads. A script calling an unrelated loads function 1000 times could pass without invoking the intended parser.
```
- 原因判断：只按 loads 函数名计数，没有确定其身份是 tomli.loads。
- 绕过：维持 reviewer_veto，由默认 strict:false 流程继续；没有修改文件、参数、验收断言或关闭任何检查；没有把被否决的提案加入冻结契约。
- 结果：该节点仍保留在全功能范围，补测缺口保留。设计总计接受 2 个文件/2 个节点（benchmark、packaging），否决 2 个，runner_failures=0。

## I09 — 进程结束时监控读取 /proc 的竞态（不影响作业）
- 步骤：诊断任务设计会话长时间没有落盘输出时，读取进程等待状态；两次诊断命令遇到同一竞态。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：`FileNotFoundError: [Errno 2] No such file or directory: '/proc/2385240/wchan'`。
- 原因判断：任务设计进程恰在监控读取前正常结束；不是任务崩溃或 Codex 启动失败。
- 绕过：改读持久化 run.json 和 public.json 确认状态；没有修改 nanolize 代码、任务参数或验收标准。
- 结果：examiner status=completed、exit_code=0、duration_seconds=600.1677、517432 tokens；已进入 task_effort_original。早先“可能启动异常”的排查假设不成立。

## I10 — 原版任务求解摘要出现异常重复文本
- 步骤：task-effort/original/development/modify/0 的 solver 结构化输出。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 异常原文（开头，完整原文保存在 solver/result.json）：
```text
[任务摘要前导省略；原文重复片段] .round .round .round .round .round …
```
- 观测：summary 长 32000 字符，其中 `.round` 出现 4538 次；solver 自报 status=completed、blocker=none，进程 exit_code=0。
- 原因判断：模型摘要字段出现重复生成，不能把摘要当作验收证据；没有证据表明这是 nanolize 改写了内容。
- 绕过：不修改运行回执或伪造结果，继续默认独立 judge 审阅实际修改和验收记录；没有修改代码、参数或降低标准。
- 结果：独立 judge 返回 passed、blocker=none；冻结 acceptance.py 实际调用 .task-effort/checks/accept.py 并通过 775 项断言，另验证 72 个跨解释器场景；异常摘要没有代替验收结论。

## I11 — 新格式仍保留动态导入内部模块的检查，首轮候选缺少 tomli._types
- 步骤：candidate-1 / attempt 1 完整行为比较，test_misc。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：
```text
E   ModuleNotFoundError: No module named 'tomli._types'
FAILED tests/test_misc.py::TestMiscellaneous::test_types_import - ModuleNotFo...
1 failed, 7 passed, 1 skipped in 0.30s
```
- 原因判断：原测试用 importlib.import_module 与 f-string 动态拼出内部模块名；转换未剔除此检查、未把该名字写进 interface，事实审阅又否决了内部模块导入事实（I05）。独立作者将类型支持合并到其他模块后，该原版检查仍固定要求旧模块可导入。
- 绕过：保留冻结的 test_misc，不删除测试、不变更清单；由 controller 调用作者修复兼容导入路径 src/tomli/_types.py，后续完整复验。没有修改 nanolize 代码。
- 结果：candidate-2 已修复该导入，candidate-3 完整复验继续通过；原始完整 traceback 存在 attempts/1/verification.json。

## I12 — 首轮 benchmark 固定输出排版回归（昨天同类问题重现）
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
- 原因判断：这次标题 Parsing data.toml 1 times: 已正确，但其后出现额外空行，预期分隔线的位置变了；与昨天标题文本不同属于同类固定输出兼容性回归。
- 绕过：由独立作者修复 benchmark/run.py 的固定输出空行和表格排版；保留补测文件和断言不变，后续完整复验。没有修改 nanolize 代码。
- 结果：candidate-2 因 I14 的空跑仍为同一失败；candidate-3 修复后该检查 5/5 通过，全部 6 项冻结检查与安装检查 2/2 均通过。没有修改冻结测试或验收标准。

## I13 — Controller 提交了含空格的 request_id
- 步骤：controller round 4 的修复批次。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错原文：`call 1 (run_agent): request_id is 1 to 100 letters, digits, - or _ and does not start with op-`；无效值为 `repair-api-import-first correction `；后两项收到 `An earlier call of this batch was invalid`。
- 原因判断：模型生成的幂等请求标识包含空格及末尾空格，不符合工具约束。
- 绕过：保留校验，框架拒绝该批次并按默认 advice 执行 compare_task_effort（返回 behavior_acceptance_pending）；下一轮 controller 自行改用有效 request_id 并发起两项修复。没有修改代码、参数或放宽 schema。
- 结果：round 5 修复正常开始；这次是 1 条 invalid 和 2 条 skipped，未执行无效批次中的作者调用。

## I14 — 连续两次修复之间未保存复验，第二次调用没有改动
- 步骤：controller round 5 连续调用 run_agent(api/parse)、run_agent(benchmark)，随后才 save_candidate。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 异常回执原文：第二个 run_agent 返回 `"changes": {"added": 0, "modified": 0, "removed": 0}`；随后 candidate-2 仍报 `At index 1 diff: '' != '------------------------------------------------------'`。该空跑耗时 168.099 秒，输入 451706、输出 3909、合计 455615 tokens。
- 原因判断：第一个修复改动草稿后，草稿不再等于被检查的候选。authoring.py/request_feedback 明确只在 draft_matches_candidate 时传递当前检查证据，因此第二次请求没有 failed_obligations 或 source_reference。旧问题历史仍可用，但本次作者没有据此修复。该状态绑定是有意的证据约束；连续修复的调度方式造成一次无效调用，不宜据此认定 source_reference 本身失效。
- 绕过：controller 保存并完整复验 candidate-2 后，round 8 单独调用 benchmark 修复，获得该候选绑定的失败证据和 benchmark/run.py 原文参考；未修改 nanolize 代码、策略或测试。
- 结果：第三次修复耗时 97.51 秒、231002 tokens，修改 1 个文件；candidate-3 的 benchmark 检查 5/5 通过，全部冻结检查通过。原始请求分别保存在 author-calls/author-request-5d962d2750e3.json（空跑）与 author-request-5159e513b613.json（成功修复）。

## I15 — 收尾核对脚本的目录与计量范围错误（仅报告工具）
- 步骤：终态后的仓库状态与逐行重合率核对。
- 作业 ID：7e7cfc52465a4afab149ca27aa5789c4。
- 报错/异常原文：工作目录直接执行 git status 得到 `fatal: not a git repository (or any parent up to mount point [运行父目录])` 及 `Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).`；首次重算得到 `compared_lines: 444`，与作业 code-quality.json 的 `compared_lines: 357` 不一致。
- 原因判断：顶层运行目录不是 Git 仓库，真正的仓库在子目录；重算若用初始源码清单扫描导出仓库，会把后来冻结的两个设计测试也算作新增代码。
- 绕过：状态核对改用 git -C 明确指定 tomli、nanolize-src、report-site；重合率重算改用最终 verification.json/actual_size/counted_files 的冻结计量范围，并断言分母等于作业记录。仅修改收尾核对方式，没有修改项目、nanolize、检查或验收标准。
- 结果：原版仓库及 nanolize 均干净且提交未变；最终重合 22/357 行（6.162465%），与内置报告四舍五入的 6% 一致。979 个原版测试/数据文件、2 个设计测试和 2 个 carry 文件均逐字节未变。
- 发布检查补记：git diff --check 报 `issues.md:122: trailing whitespace.`，来自 pytest 原始错误中的 `E` 后空格；公开副本统一去掉行尾空格后通过，运行目录原始错误仍保留。仅公开报告排版变更。
