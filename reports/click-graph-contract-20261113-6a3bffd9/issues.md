# Click graph-contract 完整运行问题记录

原版：Click e38188e9e205005d5af5f9e59df51904c984586a。
Nanolize：WeianMao/nanolize claude/graph-contract，初始提交 eb54c4328809d3e37b83301d8a934e520aa84234。
所有问题均保留原始日志；未通过的检查不会记为通过。

本页问题列表只保留经核对确定由 nanolize 自身引起的 5 个主要问题，以及与 008 对应的 17 次补测提议拒绝记录。

## 008 — 三个节点的整叶敲除破坏导入，无法判定行为覆盖
- 步骤：原版基线有效性验证与首轮设计测试验证；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 报错/诊断原文：`no_behavioral_knockout_failure`；验证矩阵中对应项为 `{"outcome": "not_assessable", "reason": "knockout_breaks_import"}`。
- 原因判断：commands、types、utilities 叶节点映射到被包初始化依赖的生产模块；整叶函数敲除导致导入阶段失败，无法作为测试检测到行为退化的证据。相关测试在未敲除的原版上通过。
- 绕过：框架按默认流程进入第二轮设计；保持有效性验证和 design 开启，保持原始默认 strict=false，未修改验证器，也未把导入失败记为有效覆盖；所有保留的原版检查继续作为候选验收约束。
- 结果：第二轮后这 3 个节点仍没有有效补测，作为未验证缺口保留；另外 3 个节点接纳了 8 份测试。没有更改 strict 默认值或放宽验收标准。证据位于作业的 `design/baseline-1.json` / `design/baseline-2.json` 所引用原始基线的 `validity.matrix`。

## 补测拒绝的逐条记录

以下为与 008 对应的 17 次拒绝记录；这些记录不会被算作通过。

### R03 — commands / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/commands/test_binding_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R04 — commands / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/commands/test_context_help_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R05 — types / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_scalar_dates.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R06 — types / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_range_boundaries.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R07 — types / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_choices_composites.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R08 — types / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_file_path_behavior.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R09 — utilities / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/utilities/test_echo_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R10 — utilities / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/utilities/test_filename_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R11 — utilities / 第 1 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/utilities/test_open_file_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R12 — commands / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/commands/test_public_binding_values.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R13 — commands / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/commands/test_public_invocation_results.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R14 — commands / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/commands/test_public_context_and_help.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R15 — types / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_scalar_date_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R16 — types / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_numeric_range_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R17 — types / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_choice_tuple_custom_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R18 — types / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/types/test_filesystem_conversion_contract.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

### R19 — utilities / 第 2 轮
- 步骤：补测校验；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 文件：`tests/nanolize_contracts/utilities/test_stream_file_observables.py`。
- 报错原文：`["no_behavioral_knockout_failure"]`。
- 原因判断：整叶敲除破坏包导入，无法证明行为测试覆盖。
- 绕过及结果：首轮诊断反馈到第二轮；第二轮仍无有效敲除证据的提议保持拒绝，节点列为缺口。 未修改 nanolize 代码、检查参数或验收标准。

## 010 — 任务提示要求运行未提供的私有验收脚本
- 步骤：原版任务成本首轮测量；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 报错原文：`task_environment_unavailable`；解题者报告 `Required acceptance validation is blocked because the supplied accept.py is missing from the workspace.`，solver 结果为 `status=blocked, blocker=data`。
- 原因判断：任务设计提示要求执行 `accept.py`，但框架把验收脚本留在验证端，没有提供到解题者工作区；解题者完成了修改和自己的回归检查，却因无法执行提示要求的脚本报告阻塞。
- 绕过：遵守现有隔离边界与冻结记录，不把私有验收脚本泄露给作者/解题者，不把 blocked 改成 passed；框架默认将任务成本基线记为 unverified，继续完整的代码重写、行为与安装验证流程。没有关闭任务评估或修改验收阈值。
- 结果：原版任务仅完成 1 次筛选运行，没有形成可比较的原版成本基线；第 1 轮重写已启动。最终报告须保留任务成本比较不可验证这一限制。证据：`task-effort/baseline.json`、`task-effort/original/development/modify/0/record.json`。

## 015 — 元数据注入装饰器缺少运行时文档字符串
- 步骤：candidate-1 的完整冻结行为比较；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 报错原文：`test_make_pass_meta_decorator_doc`，`TypeError: argument of type 'NoneType' is not iterable`。
- 原因判断：pass_meta_key 返回装饰器的 __doc__ 为 None；冻结检查将可在运行时观察到的说明文字视为受保护行为。
- 绕过：作者收到的脱敏反馈仅为 TypeError 和整组上下文事实，未指向文档字符串。协调者阅读失败证据后，通过分支自带 job-diagnose 接口提交 candidate-1-owner-diagnostics.json，绑定 evidence-id=verification-8、expected-revision=initial，说明 pass_meta_key 返回装饰器的 __doc__ 应含冻结检查要求的语义短语，实际为 None。没有提供测试函数正文或原版实现，没有改变清单、检查、预期值或通过状态；后续由作者修改 src/click/decorators.py，待复测。回执为 candidate-1-owner-diagnostics-receipt.json。
- 结果：candidate-2 仍为同一 TypeError；作者随后根据 owner 诊断修改 src/click/decorators.py，随 candidate-3 提交 f6013592bb1a6bdc1bcf83b1ccc8259689fc09b1 保存。candidate-3 中 __doc__ 不再为 None，默认键说明断言通过；同一个测试继续检查自定义说明时暴露另一处固定文字差异，单列问题 019，未将整个检查记为通过。

## 019 — 自定义装饰器说明的固定措辞不一致
- 步骤：candidate-3 的完整冻结行为比较；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 报错原文：`test_make_pass_meta_decorator_doc`，`AssertionError: assert 'passes the test value' in 'Pass the test value as the first callback argument.'`。
- 原因判断：问题 015 的 None 文档字符串已修复，但 doc_description 自定义说明的公开运行时文本仍使用不同的动词和大小写，未满足冻结检查保护的固定短语。
- 绕过：通过 job-diagnose 提交 candidate-3-owner-diagnostics.json，绑定 evidence-id=verification-17、expected-revision=initial，说明实际与预期的语义短语；不提供测试函数或原版实现，不改变检查、预期值或通过状态。回执 candidate-3-owner-diagnostics-receipt.json；后续由作者修复 decorators.py 的运行时说明生成。
- 结果：作者修改 src/click/decorators.py，随 candidate-4 提交 48868f3f1323b1806bfc4c99d75937aa83202865 保存；candidate-4 全部 28 组冻结检查通过，796 用例通过、1 跳过、0 失败，安装通过。原始诊断位于 attempts/3/verification.json 的 test_context/current/stdout。

## 024 — 合同修订后任务成本评估仍引用旧基线，作业异常退出
- 步骤：authorization-25 / contract-26 完整重新冻结后，candidate-4 的 compare_task_effort；作业 ID：`6a3bffd9e02945f1ae679c7c3217caeb`。
- 报错原文：`BenchmarkIntegrityError: Task baseline belongs to different scope or runner settings`，记录于 failure.json；操作 task-effort-authorized-contract-candidate-4。
- 原因判断：追加根节点检查改变了 plan 摘要；行为与安装证据已重新采集，但框架仍把旧 task-effort/baseline.json 传给新合同的任务评估。完整性拒绝正确，缺失的是修订后的任务基线重建流程。
- 绕过：在 nanolize 独立本地分支 workaround/click-task-baseline-revision-20261113 修复。新合同在 task-effort/contracts/<plan+settings digest>/ 独立准备原版基线，默认调度先准备再比较；旧基线及其证据保留，所有版本的任务用量合并计入原有预算。未改 config.json、验收标准、范围、检查或预算，没有伪造摘要或吞掉完整性错误。涉及 execution.py、job_tools/{freeze,verify,authoring,tasks}.py、strategies/advice.py 和回归测试。
- 结果：本地修复 14da386 及 177 项关联测试通过；完成显式运行时迁移后，新合同成功准备独立任务基线 task_baseline-35，不再复用旧 plan 的基线。该子流程因默认累计预算耗尽而未验证（问题 029），未伪造通过；候选保持 48868f3f1323b1806bfc4c99d75937aa83202865，新运行时上 29 组行为与 5 项安装检查再次通过。
- 补丁开发测试记录：首次已启动的测试进程仍加载早期辅助代码，以 _read_sealed 误读普通 settings.json，报 `AssertionError: "different scope" does not match "Frozen task evidence has changed"`。改用普通 records.read_json，未修改生产完整性判断；最终代码的两个新增回归测试随后独立通过（76.2 秒），见 patch-024-regression.log。

- 本地代码提交：`14da386`（分支 `workaround/click-task-baseline-revision-20261113`），只包含上述修复与回归测试，未推送任何 nanolize 分支。两个新增回归以及本机临时目录重跑中的任务评估、合同修订、证据等测试组已通过；最后一组通用修复调度测试仍在后台完成，未宣称整体测试已通过。
