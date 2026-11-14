# 需要修改 nanolize 分支的 bug

问题记录只收录已有源码定位或最小复现证据、需要修正 nanolize 实现的缺陷。环境配置、生成提案或候选错误、正常校验拒绝、超时及代理调用失误归入运行现象；可以改进提示或流程不等于已确认代码 bug。

分支：claude/graph-contract-field-fixes / 9413138036b515f119ff63fa6db082a6148103f0。

## N06 — microbenchmarks.py 仍未被转换和有效性审计读取

代码定位：src/nanolize/graph_contract.py::_check_files / contract-propose；src/nanolize/leaf_assignment.py 的检查来源映射

修复方向：修正命令显式指定测试文件的识别：不能仅因文件被生产源码库存收录就跳过其测试内容；转换与来源审计应一致识别并分析它。

- 步骤：contract-propose 与原版基线有效性审计；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`checks_not_inspected: [callgrind-help, comparison-help, original-benchmarks]`；基准检查 provenance=`unknown`、provenance_reasons=`[no_referenced_files]`、mapping_warnings 含 `check_role_mismatch`。
- 原因判断：本项目配置没有将 microbenchmarks.py 声明为 pytest 文件；虽然命令直接点名此文件，转换/映射阶段仍未将它当作可读的测试。因此其中 `bidict.BidictBase._write` 的明确私有结构依赖未被剔除或声明。与昨天 I18 现象相同，但本次有效性审计也没有识别该结构依赖。
- 绕过：遵照用户对 checks_not_inspected 的要求继续，保留原检查与所有断言；不把它计为有效叶节点覆盖，由独立设计器补测。
- 结果：原版 140 项基准用例通过；封存成功，工具将 microbenchmarks.py 列为 frozen_test_modules，原样保留且继续计量；最终候选140项基准用例全部通过。

## N09 — 比较工具补测仍因 knockout_breaks_import 无法验证

代码定位：src/nanolize/leaf_test_validity.py::_module_frames / _imports_knocked / _kill_kind

修复方向：区分 pytest 堆栈中的 runpy 入口与真实模块导入，并结合已执行用例的失败证据分类；保留对真实导入失败的拒绝。

- 步骤：第一轮 comparison 补测的动态禁用验证；作业 ID：b0d1f290452f4fc6a05b553949a766a0。
- 报告原文：`contract-comparison-b0d1f2-3 / comparison: {outcome: not_assessable, reason: knockout_breaks_import}`。
- 原因判断：该提案在原版上 14 个用例通过且重复稳定，但禁用比较工具函数后验证器判定导入破坏，不能归因为可接受的行为失败；与昨天 comparison 缺口相同。初始 CLI 帮助探针能被行为禁用击中，不能替代该补测的验证结论。
- 绕过：按默认规则拒绝该提案；该节点所有设计文件都呈现导入失败，工具不再为它重复请求第二轮。保留原 comparison-help 输出检查和完整功能范围，不放宽禁用验证标准。
- 结果：独立审阅接受其他 10 份提案，comparison 为最终冻结基线唯一缺少有效测试的外部节点；14组检查全部通过。
- 汇报纠正：中途更新曾将 CLI 探针的行为证据误扩展到 comparison 的新提案，读取原始矩阵后立即更正；最终报告以此记录为准。

### N09 的最小复现与原因核对
- 在运行目录 `diagnostics/runpy/` 建立最小独立复现：pytest 用例内部调用 `runpy.run_path(..., run_name='__main__')`，被调用程序 main 抛出 `RuntimeError('nanolize knockout')`。
- pytest 输出为 `1 failed`，没有 collection/import 错误，失败发生在已执行的测试函数内；nanolize `_kill_kind` 却返回 `import`。分类记录保存在 `diagnostics/runpy/classification.json`。
- 原因确认：`leaf_test_validity._module_frames` 将 pytest 短堆栈中的所有 `<module>` 帧当作导入，不区分 runpy 执行 CLI 的入口；`_kill_kind` 在读取已执行用例失败证据前就按这些帧返回 import。真实 comparison 提案同样在测试函数内调用 runpy，符合此误判路径。
- 此复现仅用于诊断，没有修改 nanolize、原版、已冻结测试或作业状态。作业可按默认策略继续，所以保留缺口，不把复现结论当作该节点正式验收通过，也没有为此放宽标准。
