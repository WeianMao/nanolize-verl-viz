# bidict graph-contract 运行问题记录

本页问题列表只保留经核对确定由 nanolize 自身引起的 10 项。

## I12 — 核心映射测试第一轮被验证器退回

- 步骤：冻结期第一轮测试候选验证。
- 作业 ID：895dac12aaf54ed7acf16382254aac7d。
- 报错原文：`tests/nanolize_contracts/core/test_mapping_contract.py: unknown_knowledge_id`；`test_inverse_views_contract.py: no_behavioral_knockout_failure`；`test_copy_policy_rollback_contract.py: no_behavioral_knockout_failure`。
- 原因判断：一份测试引用不在供给知识列表中的 ID，另两份未证明能捕获该节点函数被禁用后的行为变化。
- 绕过：nanolize 自动将三个原因反馈给独立设计器，开始 round-2/core；保持原先知识 ID 和验证要求。
- 结果：第二轮的 core/test_core_observable_contract.py 仍以 no_behavioral_knockout_failure 被拒绝；核心节点未获有效补测，已有输出比较继续保留。
- 验收标准：未放宽，没有把被退回测试计为有效覆盖。

## I13 — 报告比较工具的第二轮测试未通过行为禁用验证

- 步骤：冻结期第二轮测试候选验证。
- 作业 ID：895dac12aaf54ed7acf16382254aac7d。
- 报错原文：`tests/nanolize_contracts/comparison/test_instruction_reports.py: no_behavioral_knockout_failure`。
- 原因判断：提案未产生可接受的节点函数禁用后行为失败证据。
- 绕过：按默认策略保留原 CLI 输出检查，将该补测记为拒绝和覆盖缺口，作业继续。
- 结果：最终仅 api、duplicates、frozen 三节点的补测被接受；共 5 份测试提案拒绝，设计器进程失败 0 次。
- 验收标准：未放宽，未计为测试通过。

## I15 — 封存契约误把 pytest 基准测试当作生产源码

- 步骤：首轮 `seal_contract`，作者启动前。
- 作业 ID：895dac12aaf54ed7acf16382254aac7d（2026-11-13 07:30:11 UTC 失败）。
- 报错原文：`ValueError: Rewrite checks freeze production implementation as oracle input (microbenchmarks.py); separate the test contract first`。
- 原因判断：`microbenchmarks.py` 是包含 pytest 测试函数、夹具和断言的基准测试集，但静态分类器只按常规测试名判断，将它同时列为待改写源码和自动冻结的 pytest 输入；封存保护因此正确阻止了冲突。
- 绕过：本地新分支 `codex/bidict-graph-contract-workarounds` 修改 `nanolize/src/nanolize/repository.py`，把 `microbenchmarks.py` 识别为测试；新增体积和封存回归测试，确保文件被冻结且修改后仍计入候选源码体积。清单保留全部 13 节点，仅将 benchmarks 节点的生产 paths 置空，保留原基准测试执行和所有断言。重新转换到 `run/retry01/manifest-graph.json`，输出此前不存在，未使用 --keep-checks。
- 结果：重新转换仍保留 4 组检查；checks_not_inspected 从 3 降到 2；其余转换计数不变。73 项回归测试全部通过（体积 16、清单 17、改写执行 40）；修复提交 `d9416b163af1f167ad79b06ffff43cc7dc1fd1a9`，未推送。新基线为 16 个生产源码文件、136,633 tokens（源码 28,293、配置 108,340）。新作业 `363d1834a04142eb9e96dee3bb6517dc` 于 07:37:57 UTC 启动，独立 state-root 避免旧进程继续使用旧分类器；新作业已成功封存 8 组通过的检查，并于 07:55:35 UTC 进入独立任务验收设计，原封存错误未再出现。
- 验收标准：未放宽；没有取消封存冲突检查，没有改写或删除基准测试。体积分母将排除这份原版测试文件，最终使用修复后的口径，同时保留首轮记录。

### 本地诊断脚本补记

- 查找不存在的 `nanolize/tests/test_repository.py` 和 `nanolize/src/nanolize/author_usage.py`、`nanolize/src/nanolize/job_authorization.py` 返回 `No such file or directory`，已改为实际存在的 `test_rewrite_execution.py`。
- 汇总转换节点时再次遇到内部节点没有 `interface` 的 `KeyError: 'interface'`，改用可选字段读取；转换本身成功，清单内容不受影响。


### I12 / I13 的后续原因核对

- 核对首轮作业 `design/baseline-2.json` 引用的原始验证记录后，core 和 comparison 的禁用结果实际为 `{"outcome":"not_assessable","reason":"knockout_breaks_import"}`。
- 因此 `no_behavioral_knockout_failure` 不能直接解释为测试断言太弱：禁用节点函数后破坏了导入，使验证器不能得到可归因的行为失败证据。仍按原规则拒绝有效覆盖，不降低标准。

## I16 — 重跑第一轮测试提案的解析和禁用验证失败

- 步骤：重跑冻结期第一轮独立补测验证。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报错原文：`comparison/test_instruction_reports.py: does_not_parse`；`callgrind/test_cli_arguments.py: no_behavioral_knockout_failure`；`core/test_construction_and_union.py`、`test_inverse_and_views.py`、`test_atomic_updates.py` 均为 `no_behavioral_knockout_failure`。
- 原因判断：对提案内容做 ast.parse 核对得到 `IndentationError: unexpected indent (line 91)`；其余四份的原始禁用结果为 `not_assessable / knockout_breaks_import`，不能取得行为层面的失败证据。
- 绕过：保留默认两轮设计策略，将原始拒绝原因自动反馈给各自独立设计器，进行第二轮；未改测试断言、生产实现或有效性标准。
- 结果：api、duplicates、frozen 第一轮初步验证通过。第二轮 callgrind 的插件/计时器测试取得 `kill_kind=behavior / outcome=killed`，通过初步验证；comparison 的语法问题已修正，但它和 core 仍为 `not_assessable / knockout_breaks_import`。最终独立审阅接受 4 份补测，全部为不同节点；7 份提案被拒绝，设计器进程失败 0 次。
- 验收标准：未放宽。

## I17 — 重跑第二轮两个节点仍无可评估的禁用证据

- 步骤：重跑冻结期第二轮测试验证。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报错原文：`contract-comparison-363d18-5`、`contract-core-363d18-6` 的禁用结果均为 `{"outcome":"not_assessable","reason":"knockout_breaks_import"}`；对应有效性拒绝原因为 `no_behavioral_knockout_failure`。
- 原因判断：两节点函数体禁用后无法完成验证器的导入探测，不能计为测试行为失败。
- 绕过：按默认非 strict 策略保留缺口并继续独立审阅、封存和改写；所有已保留的原版检查仍执行，两节点仍在全量功能范围内。
- 结果：最终设计记录为接受 4 份、拒绝 7 份、runner_failures 0；保留 core/comparison 两个外部节点缺口，没有把未验证节点标记为验证通过。
- 验收标准：未放宽，没有更改 strict、design、knockout_scope 或禁用任何检查。

## I18 — 转换保留了包含私有写入钩子监视的基准检查

- 步骤：重跑原版基线的静态映射/有效性审计。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报告原文：`original-benchmarks` 的 `mapping_warnings` 包含 `mapping_omits_imported_capability`、`structure_coupled_test`，`structure_symbols` 为 `["bidict.BidictBase._write"]`。此时 `provenance=original_verified`、`role_mismatch=false`、`baseline_passed=true`、`stability=stable`。
- 原因判断：microbenchmarks.py 的一项测试读取并 monkeypatch 私有写入钩子 `_write`，而 contract-propose 未将整个基准检查剔除；转换静态扫描与后续结构耦合审计存在识别差异。另有 api/callgrind 导入未包含在此检查的原始 capability 映射里。
- 绕过：仍保留原检查及全部断言，不修改原测试、不重标有效覆盖。先让默认作者与修复流程处理，后续有实际失败再补充诊断。
- 结果：原版基准检查通过，但不计为有效外部叶节点覆盖。候选曾出现 I22 中的关键字调用回归，修复后全部 140 个基准用例通过。
- 验收标准：未放宽。

## I19 — 修改任务要求求解器运行未提供的隐藏验收脚本

- 步骤：默认 task-effort 的原版 development 任务评估。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报错原文：`python: can't open file '<task-workspace>/workspace/accept.py': [Errno 2] No such file or directory`；求解器结果为 `status=blocked, blocker=data`，任务记录为 `reason=task_environment_unavailable`，baseline 为 `status=unverified, ready=false`。
- 原因判断：examiner 生成的任务提示写着 `Run the supplied standalone accept.py ...`，但 accept.py 是检查方持有的隐藏验收脚本，没有放入求解器工作区。任务说明将隐藏文件误述为已提供，求解器虽提交了源码补丁并通过自己的探针，仍如实标记必需命令不可执行。
- 绕过：保留隐藏验收隔离、原任务说明和证据，由默认控制器继续压缩改写；不把求解器自测冒充独立验收，也不向求解器泄露隐藏验收脚本。未改任何文件或策略参数。
- 结果：原版任务评估耗时约 230 秒，未验证；08:08:20 UTC 作者开始实现。最终 task_effort-18 仍为 unverified，交付状态为 completed_with_gaps；没有得到可用的修改任务成本比较。
- 验收标准：未修改或放宽；这是默认流程保留的任务评估缺口，不是评估通过。

## I20 — 作者草稿试图替换受保护的 LICENSE

- 步骤：第 1 次作者输出的 save_candidate 集成，尚未执行候选行为检查。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报错原文：`Generated output was rejected. It contains verifier-owned tests or inputs; do not create or replace tests, oracle fixtures or check inputs: LICENSE.`；reason=`integration_rejected`，category=`verifier_owned`，路径 `LICENSE`。
- 原因判断：作者在空工作区新写了 LICENSE，但原版许可证属于验证器原样保留的受保护元数据；即便意图是保留许可，也不能用作者新文件覆盖。
- 绕过：默认控制器已发起第 2 次作者调用，要求仅删除或移走该草稿文件，保留其他独立实现；最终候选仍保留原版 LICENSE。
- 结果：第 2 次作者调用仅移除 authoring/LICENSE，自检再次通过，候选保存成功；08:23:49 UTC 控制器进入下一轮。作者另报告自身 Python 环境没有 tiktoken，故未自行计算体积；正式体积仍由 nanolize 已安装 tiktoken 的独立 venv 测量，不影响验收。
- 验收标准：未放宽。这是受保护文件集成退回，不是防默写退回，二者分别统计。

## I22 — 保留基准测试发现 unwrites 关键字调用不兼容

- 步骤：同一候选的 `original-benchmarks` 检查。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 报错原文：`TypeError: test_update_workloads_take_intended_path.<locals>.spy() missing 1 required keyword-only argument: 'unwrites'`；`12 failed, 128 passed in 1.88s`。
- 原因判断：候选已有写入钩子，但批量更新用位置参数传递回滚记录；冻结原测试的监视器要求以 unwrites 关键字接收并转发非 None 的回滚记录。这也证实了 I18 中转换遗漏的私有结构依赖会成为实际验收约束。
- 绕过：同一 `diagnostics-1` 中第三条只说明可观察的钩子调用约定与回滚要求；没有给作者原实现、测试源码或算法，也没有修改断言。
- 结果：第 4 次作者调用将钩子和四处调用统一为关键字 unwrites；verification-14 中完整 8 组行为检查通过（含全部 140 个基准用例），installation-16 三组安装检查再次通过。
- 验收标准：未放宽，不删除这 12 个用例，也不将其失败当作覆盖缺口跳过。

## I25 — 控制器把不可用的任务基线描述成零任务

- 步骤：最终选择和交付理由核对。
- 作业 ID：363d1834a04142eb9e96dee3bb6517dc。
- 记录原文：控制器第 10 轮写道 `baseline preparation produced zero tasks`。
- 原因判断：实际生成了 1 个修改任务，并执行了 1 次原版求解；因 I19 标记 blocked。控制器将“没有可用的任务成本基线”误述为“没有任务”。
- 绕过：保留原始记录，最终报告依据 suite.json 和 baseline.json 说明“1 个修改任务已设计，原版评估未验证”；未改引擎状态或检查。
- 结果：网站区分功能补测（4 个节点成功）与额外修改任务成本评估（1 个任务、未验证）。
- 验收标准：未放宽，只纠正报告说明。
