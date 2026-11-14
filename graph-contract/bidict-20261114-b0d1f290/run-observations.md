# 运行现象与处理记录

以下18条记录未认定为nanolize实现bug；防默写退回0个文件，集成拒绝0次。

## N01 — GitHub HTTPS 无凭据

- 步骤：安装前远程版本核对；作业 ID：尚未提交。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`。
- 原因判断：仓库 HTTPS 访问需要认证，当前环境未配置 HTTPS 凭据。
- 绕过：克隆协议改为 `git@github.com:WeianMao/nanolize.git`，没有修改代码或验证参数。
- 结果：SSH 克隆成功；指定分支 HEAD 精确匹配 9413138。

## N02 — pip 配置的索引无法解析

- 步骤：安装工具与测试环境；作业 ID：尚未提交。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`，多个包触发重试。
- 原因判断：默认 pip 配置含当前网络不可解析的索引。
- 绕过：停止本次安装进程，以 `PIP_CONFIG_FILE=/dev/null` 重跑同一依赖安装；独立安装检查也使用该环境设置。
- 结果：公开 PyPI 安装成功；版本清单保存在 environment-freeze.txt。

## N03 — 报告仓库没有 gh-pages 分支

- 步骤：准备公开报告发布；作业 ID：尚未提交。
- 报错原文：`fatal: Remote branch gh-pages not found in upstream origin`。
- 原因判断：昨天的公开站点使用 main 分支。
- 绕过：只读核对远程分支后，克隆现有 main；最终只提交本次新报告目录。
- 结果：报告仓库克隆成功，昨天的三份公开报告文件已归档。

## N04 — 手写旧清单的路径和必选根节点不符合 schema

- 步骤：作业前静态转换；作业 ID：尚未提交。
- 报错原文：`Capability path matches no production source: docs/_static/build-bidict-types-diagram`；`Mark at least one capability required to define a usable core`。
- 原因判断：无扩展名的文档辅助脚本不在工具生产源码库存内；旧清单未指定 required 根节点。
- 绕过：只调整 run/manifest-old.json 的文档路径为实际库存，并设置根节点 required=true；同时按 schema 将 pytest 检查 compare 从 tests 校正为 exit，仍保留 JUnit 用例报告与全部断言。
- 结果：转换成功，13 节点、9 外部节点、4 内部节点；剔除检查 1，未读取检查 3，缺检查外部节点 2，未到达内部节点 0，未解析导出 0，carry 0。失败时未生成输出文件，成功输出使用此前不存在的路径；未使用 --keep-checks。

## N05 — 默认 Slurm 检查执行器缺少账户

- 步骤：提交后的检查执行环境准备；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`Scheduler command failed: sbatch: sbatch: error: You forgot to specify which account you want to use.`
- 原因判断：自动执行器发现 Slurm，但当前环境没有默认账户。
- 绕过：工具的 auto 策略自动回退本机；未修改参数或文件，未跳过检查。
- 结果：创建隔离工作区成功，进入测试事实冻结；执行器使用本机 CPU。

## N07 — 原版核心节点的基准禁用试验超时

- 步骤：capture_baseline 的叶节点禁用验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`original-benchmarks / core: {outcome: error, reason: timed_out}`。
- 原因判断：核心被禁用后的基准运行未在默认单检查时限内完成；同一核心节点的 public-behavior 探针为 `kill_kind=behavior, outcome=killed`，未出现昨天的导入破坏。
- 绕过：不延长默认时限，不把超时算作有效行为失败；默认设计器继续为 core 补测。
- 结果：4 组正常原版检查通过，9 个外部节点进入独立设计。

## N08 — 重复策略首轮补测的缩进语法错误

- 步骤：冻结期第一轮独立测试提案静态验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`tests/nanolize_contracts/duplicates/test_duplicate_policies.py: does_not_parse; IndentationError: unindent does not match any outer indentation level (line 31)`。
- 原因判断：设计器返回的测试源码缩进不一致，尚未执行便被验证器拒绝；属于生成提案错误。
- 绕过：默认流程将完整解析错误反馈给独立第二轮 duplicates 设计器；未手工改断言，未降低语法或有效性要求。
- 结果：第二轮语法修正通过；最终10份提案被接受、2份被拒绝（另1份为comparison），覆盖8个外部节点。

## N10 — 便携验证包拒绝 pytest 的 /dev/null 配置参数

- 步骤：seal_contract 生成便携验证包；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`Portable metadata contains an absolute path (plan.manifest.checks[0].argv[5]); use relative check inputs`。
- 原因判断：该位置是原基准命令 `pytest -c /dev/null` 中的 `/dev/null`，用于按项目原有基准流程隔离 pytest 配置；便携元数据扫描把它作为绝对路径拒绝。
- 绕过：默认流程保留 status=unavailable 的 bundle-receipt，继续使用作业本地冻结基线执行和验收；不修改命令、基准、已冻结测试或可移植性检查。
- 结果：契约封存成功并进入 task-effort；便携验证包未生成，最终报告保留此交付限制。没有放宽行为或安装验收标准。

## N11 — 辅助诊断读取的路径假设不成立

- 步骤：安装准备、源码定位、报告准备和运行诊断；作业 ID：准备期无作业，后续为 b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`No such file or directory` / `IO error for operation ... No such file or directory (os error 2)`。
- 涉及路径：昨天本地 iso/bidict/run 目录不可见；猜测的 nanolize 模块 review_server.py、review.py、live_review.py、execution_review.py、reviews.py、test_facts.py、agent_runner.py、usage.py 不存在；运行器文件实际为 processes.json 而非 process.json；报告仓库没有 .github/workflows 目录。
- 原因判断：辅助定位沿用了其他版本的文件布局和昨日运行路径，属于协调脚本的路径假设错误。
- 绕过：使用 rg --files、实际目录和公开的昨日 JSON/问题报告定位；不改动目标项目、工具代码或验收配置。
- 结果：所需源码、运行证据和公开报告均已找到，任务继续；这些读取失败未影响作业检查结果。

## N12 — 修改任务的两个变体提示相同，任务设计被拒

- 步骤：prepare_tasks 的 examiner 结果验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`Held-out task must have a distinct input variant`；reason=`invalid_task_design`，status=`unverified`，ready=false。
- 原因判断：设计器生成了1个 modify 任务“Handle zero instruction baselines in comparison reports”，development 和 heldout 的 JSON 夹具确实不同，但两个 prompt 字符串完全相同；effort_schema.validate_suite 明确拒绝相同 prompt，因此正式任务集未被接受，tasks=0、original_runs={}。
- 绕过：默认控制器保留失败任务基线并继续作者改写；未改任务提示、夹具、隐藏验收脚本或验证规则，未把未执行求解的任务算作已评估。
- 结果：examiner 正常退出，用时591.5668秒、674396 tokens；solver/judge均0次。02:22:15 UTC 作者启动，后续任务成本结果待交付记录。
- 验收标准：未放宽。正式任务工具可以保存新任务集供另行试验，但不会替换本次已冻结的一次性 task-effort 基线；本次默认作业保留这一缺口并如实报告。

## N13 — 首个候选缺少 callgrind.ACTIVE，基准无法收集

- 步骤：候选1的 original-benchmarks 比较（verification-5）；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`AttributeError: module 'callgrind' has no attribute 'ACTIVE'`；`Interrupted: 1 error during collection`。
- 原因判断：原基准在收集时读取公开模块常量 ACTIVE；转换未读到该基准（N06），作者只实现了环境激活语义，未保留被基准读取的这个名称。140个原用例因收集失败未执行，不能称为140个行为断言失败。
- 绕过：默认修复流程继续；正式 job-diagnose（diagnostics-1，verification-5）说明 ACTIVE 与 CALLGRIND_PY_ACTIVE 的可观察约定，不发送测试源码或改写断言。
- 结果：首轮安装3/3通过；作者第二次调用修复 callgrind.py，最终全量复验140项基准全部通过。

## N14 — 比较 CLI 的位置参数名称改变

- 步骤：候选1的 comparison-help 输出比较（verification-5）；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：原版 usage 为 `baseline current`，候选为 `baseline revision`；stdout_sha256 不同，status=`regressed`。
- 原因判断：作者保留了选项及说明文字，但重命名第二个位置参数，改变完整 --help 输出。
- 绕过：diagnostics-1 明确要求保留位置参数名 current；默认 source-reference=on_failed_check 可开放失败节点的生产参考，未修改输出比较方式。
- 结果：最终已由作者修复，全量复验通过；各轮进展见下文。

## N15 — pickle 恢复后逆向映射迭代顺序不兼容

- 步骤：候选1的核心复制/序列化补测（verification-5）；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`AssertionError: assert [(1, 'a'), (2, 'd'), (3, 'c')] == [(1, 'a'), (3, 'c'), (2, 'd')]`；`3 failed, 3 passed`，protocol 0/2/5 均失败。
- 原因判断：强制值覆盖后，候选序列化保留旧逆向插入顺序；原版在反序列化时按恢复的正向项目顺序重建逆向映射。
- 绕过：diagnostics-1 描述此行为差异，默认作者修复自身序列化实现；不改补测期望或原版。
- 结果：最终已由作者修复，全量复验通过；各轮进展见下文。

### N13 / N14 / N15 的第二次候选复验
- verification-9：作者第二次调用仅修改 callgrind.py；original-benchmarks 已全部140例通过，N13解决。
- comparison-help 的位置参数名仍不一致；核心 pickle 的 protocol 0/2/5 仍3例失败，N14与N15尚未解决。
- 默认控制器继续第三次作者调用；diagnostics-1 已在这次调用前正式记录。未修改检查或验收条件。

### N14 / N15 的第三次候选复验
- verification-12：第三次作者调用修改 bidict/_mapping.py，pickle 的 protocol 0/2/5 全部通过；N15解决，原140个基准及其余补测保持通过。
- comparison-help 仍为 output_mismatch，累计三次候选观察到同一位置参数文字差异；默认控制器第四次调用专门修复 comparison。

### N14 最终复验
- 第四次作者调用修改 compare_instructions.py，候选4的 verification-14 全部14组检查通过，包含 comparison-help；installation-15 三组安装检查也通过。N14解决。
- N13、N15 的修复在最终全量复验中保持通过；本次共4次作者调用（1次实现、3次修复），未发生集成退回或防默写退回。

### N12 默认控制器的追加设计
- 02:44:59 UTC，控制器在最终行为和安装检查通过后主动调用 design_tasks，尝试生成可用的新任务集；本次不是外层协调器关闭任务评估或提前交付。追加结果后续记录。

### N12 追加设计成功
- 02:54:27 UTC：默认 design_tasks 成功保存 task_suite-18，任务为“Handle zero counts and empty overlap in instruction comparisons”；development/heldout 提示不同，通过原校验。
- 02:54:40 UTC：控制器调用 run_task_trial，分别对 original 与 candidate 的 development / modify / repeat=0 做匹配试验；没有改动主候选或既有行为验收。
- 这是默认控制器主动重设计与正式工具试验，未放宽“distinct input variant”规则；首次失败设计的费用和耗时仍计入。

## N16 — 追加任务求解器假设工作区有 Git 元数据

- 步骤：追加 development 任务的 original 与 candidate 求解；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`fatal: not a git repository (or any parent up to mount point /lustre)`；`Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).`；两次 git status 均退出128。
- 原因判断：任务试验使用独立源码快照，未包含 .git；求解器沿用了常规仓库操作习惯。原版求解器同时确认 nix 不可用，相关组合探测命令退出1。
- 绕过：两边求解器自动继续读取文件并在隔离任务工作区修改 compare_instructions.py；原版使用 Python venv 路线，没有初始化 Git 或改变主作业。
- 结果：original 和 candidate 求解器均正常完成；原版末尾 diff 退出1表示存在预期修改，不是运行失败。候选独立评分通过；原版评分器超时（N18）。候选评分器也重复了无.git探测，并对不存在的.venv/venv/.git执行ls退出2；随后使用Python 3.12标准库环境正确验收。

## N17 — 候选任务求解器的自建探针写错合计

- 步骤：追加 candidate/development 修改任务的自检；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`AssertionError: ('stable_sort', ... '1,500 → 1,403 (-6.47%)' ... '1,500 → 1,503 (+0.20%)' ...)`，自建 `.task-effort/scratch/probe_comparison.py` 首次退出1。
- 原因判断：探针把当前计数之和手算为1503，正确和为1403；这是求解器自己编写的临时校验错误。
- 绕过：求解器修正 scratch/probe_comparison.py 的合计和百分比期望后重跑；未修改 examiner 提供的隐藏验收、主候选或冻结行为检查。
- 结果：临时探针重跑通过；候选求解器正常完成。正式隐藏评分仍由独立工具完成，修正自建探针不等于降低正式验收标准。

## N18 — 追加任务的原版评分器超时

- 步骤：grade_task_trial(task_trial-19)；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`status=timeout`、`exit_code=-15`、`duration_seconds=120.3547`；正式结果 `unverified / judge_execution_unavailable`；用量 `unavailable / missing_usage`。
- 原因判断：评分器已执行冻结验收脚本，输出 `validated 9 instruction-comparison cases` 和 `{"nanolize_acceptance":"passed","assertions":336}`，随后继续检查环境和额外边界，在默认120秒评分时限内未返回结构化结论。
- 绕过：保留默认时限，不把脚本通过冒充正式评分通过，继续控制器后续配对和交付流程；未改任务或评分规则。
- 结果：该原版试验正式评分未验证，已观察的脚本336项断言通过仅作为局部证据。超时调用没有turn.completed用量，最终token总数只能是可观测下界。

## N19 — 评分器将自建探针传给冻结验收入口

- 步骤：追加 original 评分的额外探针；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`Acceptance check rejected: Acceptance input must be a frozen Python check in this workspace`。
- 原因判断：评分器把自己写的 `.task-effort/scratch/acceptance_review_edges.py` 交给只允许冻结检查的 `.task-effort/runner/acceptance.py`；保护机制按设计拒绝。
- 绕过：评分器继续直接运行比较CLI观察额外输入；没有把scratch文件加入冻结检查或放宽入口限制。
- 结果：额外CLI命令退出0，但评分器随后达到时限（N18）；正式冻结9例检查在此之前已执行通过。原版评分器亦重复了无.git工作区的git status错误（N16）。

## N20 — 追加任务配对仍引用未评分工件

- 步骤：控制器第13轮 compare_task_trials；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：task_pair-23 的 `original_status=not_run`、`candidate_status=not_run`、`outcome=inconclusive`。
- 原因判断：同一轮先grade两边再compare，但compare传入的是原始task_trial-19/task_trial-20，而评分结果保存为新的graded_trial-21/graded_trial-22；原始工件仍为grading_deferred。工具明确支持graded_trial，控制器没有使用返回的新ID。
- 绕过：不改写不可变工件或正式结论；报告直接分别核对graded_trial-21（unverified）与graded_trial-22（passed）。即使比较新工件，原版超时和只有一对试验仍不足以证明整体成本改善。
- 结果：默认控制器在第14轮选择candidate-4并完成交付，保留task_effort_not_passed缺口。未降低验收条件；这是完成但有缺口，而非完整通过。

## 环境说明

- 当前没有 Nix 命令；使用项目 CONTRIBUTING.rst 所述手动环境方案，在独立 Python 3.11 venv 安装所需测试依赖。原版工作树不修改。
- 公开网页读取工具访问昨天页面失败，curl 匿名 HTTPS 成功，原始页面和 JSON/问题记录均已归档。
- 两次辅助源码定位猜测了不存在的模块文件名；改为 rg --files 查找实际文件，无作业或验收影响。

## 最终交付与记录完整性

- 2026-11-14T03:04:26.731853+00:00，作业以completed_with_gaps终态交付candidate-4，提交db42e1b2a4d397f3498b2c86d8cae3407c5ed44b。
- 最终14/14行为检查（250个pytest用例和3个输出检查）、3/3安装检查通过；8个节点获得有效补测，comparison仍缺有效叶节点测试（N09）；功能账本13/13保留。
- N12追加任务：原版和候选solver正常完成；候选正式judge通过，原版judge超时。两边冻结development脚本均观察到9例、336项断言通过；正式任务成本评估仍未验证，没有完成heldout/重复实验。
- 主候选共1次实现、3次修复；防默写退回0文件、集成拒绝0次。未关闭检查、未放宽标准；没有修改nanolize代码，因此没有本地工具绕过分支或修复提交。
- nanolize保持9413138、原版bidict保持299fedc且均干净。上述全部问题含环境、生成提案、候选回归、工具缺陷和评估流程问题，不能全部归因于本次分支代码。
- 实际38次模型调用中37次有完整用量，共7,818,951 tokens；原版judge超时调用用量缺失，不计为0，真实总量高于或等于已记录值。金额账单不可用。
