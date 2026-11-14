# 运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

以下6条记录属于核对结果的“可补强”，不列为已确认的分支 bug；防默写退回0个文件，集成拒绝0次。

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

## N13 — 首个候选缺少 callgrind.ACTIVE，基准无法收集

- 步骤：候选1的 original-benchmarks 比较（verification-5）；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`AttributeError: module 'callgrind' has no attribute 'ACTIVE'`；`Interrupted: 1 error during collection`。
- 原因判断：原基准在收集时读取公开模块常量 ACTIVE；候选定义的是 _ACTIVE，未保留被基准读取的 ACTIVE 名称。初始契约未固定该名称；现有验证和修复流程已处理这次候选回归。140个原用例因收集失败未执行，不能称为140个行为断言失败。
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

## N20 — 追加任务配对仍引用未评分工件

- 步骤：控制器第13轮 compare_task_trials；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：task_pair-23 的 `original_status=not_run`、`candidate_status=not_run`、`outcome=inconclusive`。
- 原因判断：同一轮先grade两边再compare，但compare传入的是原始task_trial-19/task_trial-20，而评分结果保存为新的graded_trial-21/graded_trial-22；原始工件仍为grading_deferred。工具明确支持graded_trial，控制器没有使用返回的新ID。
- 绕过：不改写不可变工件或正式结论；报告直接分别核对graded_trial-21（unverified）与graded_trial-22（passed）。即使比较新工件，原版超时和只有一对试验仍不足以证明整体成本改善。
- 结果：默认控制器在第14轮选择candidate-4并完成交付，保留task_effort_not_passed缺口。未降低验收条件；这是完成但有缺口，而非完整通过。

## 最终交付与记录完整性

- 2026-11-14T03:04:26.731853+00:00，作业以completed_with_gaps终态交付candidate-4，提交db42e1b2a4d397f3498b2c86d8cae3407c5ed44b。
- 最终14/14行为检查（250个pytest用例和3个输出检查）、3/3安装检查通过；8个节点获得有效补测，comparison仍缺有效叶节点测试（N09）；功能账本13/13保留。
- N12追加任务：原版和候选solver正常完成；候选正式judge通过，原版judge超时。两边冻结development脚本均观察到9例、336项断言通过；正式任务成本评估仍未验证，没有完成heldout/重复实验。
- 主候选共1次实现、3次修复；防默写退回0文件、集成拒绝0次。未关闭检查、未放宽标准；没有修改nanolize代码，因此没有本地工具绕过分支或修复提交。
- nanolize保持9413138、原版bidict保持299fedc且均干净。
- 实际38次模型调用中37次有完整用量，共7,818,951 tokens；原版judge超时调用用量缺失，不计为0，真实总量高于或等于已记录值。金额账单不可用。
