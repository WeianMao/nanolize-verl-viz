# 需要修改 nanolize 分支的 bug

本节只列经核对确定需要修改 nanolize 分支的 3 项。

分支：claude/graph-contract-field-fixes / 9413138036b515f119ff63fa6db082a6148103f0。

## N06 — microbenchmarks.py 仍未被转换和有效性审计读取

代码定位：src/nanolize/graph_contract.py::_check_files / contract-propose；src/nanolize/leaf_assignment.py 的检查来源映射

修复方向：修正命令显式指定测试文件的识别：不能仅因文件被生产源码库存收录就跳过其测试内容；转换与来源审计应一致识别并分析它。

- 步骤：contract-propose 与原版基线有效性审计；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`checks_not_inspected: [callgrind-help, comparison-help, original-benchmarks]`；基准检查 provenance=`unknown`、provenance_reasons=`[no_referenced_files]`、mapping_warnings 含 `check_role_mismatch`。
- 原因判断：contract-propose 与 leaf test validity 在识别显式 pytest 文件参数前，先从候选测试文件中排除了 production inventory；因此命令和 inputs 已明确点名的 microbenchmarks.py 仍被漏审。其中 `bidict.BidictBase._write` 的明确私有结构依赖未被剔除或声明。与昨天 I18 现象相同，但本次有效性审计也没有识别该结构依赖。
- 绕过：遵照用户对 checks_not_inspected 的要求继续，保留原检查与所有断言；不把它计为有效叶节点覆盖，由独立设计器补测。
- 结果：原版 140 项基准用例通过；封存成功，工具将 microbenchmarks.py 列为 frozen_test_modules，原样保留且继续计量；最终候选140项基准用例全部通过。

## N09 — 比较工具补测仍因 knockout_breaks_import 无法验证

代码定位：src/nanolize/leaf_test_validity.py::_module_frames / _imports_knocked / _kill_kind

修复方向：区分 pytest 堆栈中的 runpy 入口与真实模块导入，并结合已执行用例的失败证据分类；保留对真实导入失败的拒绝。

- 步骤：第一轮 comparison 补测的动态禁用验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`contract-comparison-b0d1f2-3 / comparison: {outcome: not_assessable, reason: knockout_breaks_import}`。
- 原因判断：该提案在原版上 14 个用例通过且重复稳定；测试函数内通过 runpy 执行 CLI，禁用后的行为失败堆栈含脚本入口的 `<module>` 帧，验证器却优先将其判为导入破坏，漏掉已执行用例的失败证据。此误分类导致 comparison 补测被拒；初始 CLI 帮助探针的行为禁用证据不能替代该补测的验证结论。
- 绕过：按默认规则拒绝该提案；该节点所有设计文件都呈现导入失败，工具不再为它重复请求第二轮。保留原 comparison-help 输出检查和完整功能范围，不放宽禁用验证标准。
- 结果：独立审阅接受其他 10 份提案，comparison 为最终冻结基线唯一缺少有效测试的外部节点；14组检查全部通过。

### N09 的最小复现与原因核对
- 最小独立复现：pytest 用例内部调用 `runpy.run_path(..., run_name='__main__')`，被调用程序 main 抛出 `RuntimeError('nanolize knockout')`。
- pytest 输出为 `1 failed`，没有 collection/import 错误，失败发生在已执行的测试函数内；nanolize `_kill_kind` 却返回 `import`。
- 原因确认：`leaf_test_validity._module_frames` 将 pytest 短堆栈中的所有 `<module>` 帧当作导入，不区分 runpy 执行 CLI 的入口；`_kill_kind` 在读取已执行用例失败证据前就按这些帧返回 import。真实 comparison 提案同样在测试函数内调用 runpy，符合此误判路径。
- 此复现仅用于诊断，没有修改 nanolize、原版、已冻结测试或作业状态。作业可按默认策略继续，所以保留缺口，不把复现结论当作该节点正式验收通过，也没有为此放宽标准。

## N12 — 任务设计提示与输入变体校验约束不一致

代码定位：src/nanolize/prompts/prompts.json 的 examiner 任务设计提示；src/nanolize/effort_schema.py::validate_suite

修复方向：使任务设计提示、输出schema与输入变体校验一致：明确所有必需约束，并依据真实变体区分性验证；不能只更改prompt措辞就改变有效性结论。

- 步骤：prepare_tasks 的 examiner 结果验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报错原文：`Held-out task must have a distinct input variant`；reason=`invalid_task_design`，status=`unverified`，ready=false。
- 原因判断：examiner 提示只要求不同的输入变体，输出 schema 也未声明 prompt 文本必须不同；但 effort_schema.validate_suite 额外拒绝相同 prompt。设计器生成了1个 modify 任务“Handle zero instruction baselines in comparison reports”，development 和 heldout 的 JSON 夹具确实不同，却因两个 prompt 字符串完全相同而被拒，tasks=0、original_runs={}。仅改变 heldout.prompt 文字、保留夹具及检查即可通过，确认是提示与校验约束不一致。
- 绕过：默认控制器保留失败任务基线并继续作者改写；未改任务提示、夹具、隐藏验收脚本或验证规则，未把未执行求解的任务算作已评估。
- 结果：examiner 正常退出，用时591.5668秒、674396 tokens；solver/judge均0次。02:22:15 UTC 作者启动，后续任务成本结果待交付记录。
- 验收标准：未放宽。正式任务工具可以保存新任务集供另行试验，但不会替换本次已冻结的一次性 task-effort 基线；本次默认作业保留这一缺口并如实报告。

### N12 默认控制器的追加设计
- 02:44:59 UTC，控制器在最终行为和安装检查通过后主动调用 design_tasks，尝试生成可用的新任务集；本次不是外层协调器关闭任务评估或提前交付。追加结果后续记录。

### N12 追加设计成功
- 02:54:27 UTC：默认 design_tasks 成功保存 task_suite-18，任务为“Handle zero counts and empty overlap in instruction comparisons”；development/heldout 提示不同，通过原校验。
- 02:54:40 UTC：控制器调用 run_task_trial，分别对 original 与 candidate 的 development / modify / repeat=0 做匹配试验；没有改动主候选或既有行为验收。
- 这是默认控制器主动重设计与正式工具试验，未放宽“distinct input variant”规则；首次失败设计的费用和耗时仍计入。
