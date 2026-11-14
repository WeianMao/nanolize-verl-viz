# Click graph-contract 运行问题记录

本页问题列表只保留经核对确定由 nanolize 自身引起的 10 项。

开始：2026-11-14T01:34:47.743391+00:00

每项记录步骤、作业 ID、原始诊断、原因、绕过、结果；未另行注明则没有关闭检查或放宽标准。

## FACT-01：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[0]。

## FACT-02：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[1]。

## FACT-03：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[2]。

## FACT-04：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[3]。

## FACT-05：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_get_context_objects`, `tests/test_context.py::test_get_context_objects_no_ensuring`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[4]。

## FACT-06：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_pass_obj`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[5]。

## FACT-07：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_make_pass_meta_decorator_doc`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[6]。

## FACT-08：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_pop`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[7]。

## FACT-09：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_exit`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[8]。

## FACT-10：test_info_dict 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_info_dict.py::test_paramtype_no_name`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[9]。
