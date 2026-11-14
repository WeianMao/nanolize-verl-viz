# 问题记录：需要修改 nanolize 分支代码的 Bug

问题记录仅收录已有源码与复现证据、需要修改 claude/graph-contract-field-fixes 分支代码的缺陷；正常策略结果、模型输出失误、候选代码回归、配置及环境问题归入运行现象。是否在本次运行中打过补丁，不作为是否属于 bug 的判断条件。

本次确认 1 个需要修复 nanolize 分支代码的 bug，由 10 条事实过滤记录合并。它未在本次运行中修复；没有工具补丁提交，也没有向指定工具分支推送。候选最终通过检查不代表该工具缺陷已修复。

## NANO-001：事实过滤器将嵌套回调和辅助类型误识别为测试入口

步骤：冻结前测试事实生成；作业 ID：553492f6820c472fb1724aa6f94d5f6b；分支 claude/graph-contract-field-fixes，提交 9413138。

原始诊断：fact_names_a_test。对应 10 条过滤记录，合并为 1 个分支缺陷。FACT-11 是独立复核正确拒绝过度概括的事实，不属于这个 bug。

源码原因：src/nanolize/leaf_test_design.py 的 _test_terms（978–994 行）遍历整个 AST，把任何以 test 开头的函数或类名收集为测试标识，没有区分真实测试入口与嵌套的被测回调、辅助类型；_fact_reasons 随后把这些名字当作全文禁词。普通行为值 test 也因此被拒绝。

复现：在测试函数内定义普通回调 def test(value)，事实 The context user object is the string 'test'. 被拒绝；在测试函数内定义辅助类 TestType，描述其可观察名称的事实同样被拒绝。两者都不是可收集的测试入口。对真正的 test_outer 测试标识的拒绝则应保留。复现仅调用静态解析和事实校验函数，没有执行 Click 或修改源码。

影响：custom_parser 和 paramtype_no_name 两个测试最终没有形成有效事实；原版测试本身始终保留。后者相关候选检查发生回归后，协调者通过原生 job-diagnose 补充语义诊断，候选最终通过。事实缺口不能被当作测试已跳过。

需要修改：修正 _test_terms 的测试入口识别及其与事实文本匹配的边界，区分被测回调/辅助类型和真实测试标识，并覆盖上述误判场景；继续阻止真实测试名和节点 ID 泄露，不能通过关闭事实过滤来处理。

本次处理及结果：运行时沿用默认第二轮改写；上下文相关事实得到补充，两个事实缺口仍保留。类型回归通过语义诊断及候选代码修复解决。nanolize 分支仍为干净的 9413138，本次没有修改该过滤器，也没有工具修复提交。

证据：test-facts.json 的 dropped[0..9]；logs/report-classification-reproduction.json；下方保留对应 10 条原始记录。

### 原始证据

### FACT-01：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[0]。

### FACT-02：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[1]。

### FACT-03：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[2]。

### FACT-04：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[3]。

### FACT-05：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_get_context_objects`, `tests/test_context.py::test_get_context_objects_no_ensuring`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[4]。

### FACT-06：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_pass_obj`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[5]。

### FACT-07：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_make_pass_meta_decorator_doc`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[6]。

### FACT-08：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_pop`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[7]。

### FACT-09：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_exit`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[8]。

### FACT-10：test_info_dict 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_info_dict.py::test_paramtype_no_name`。
- 原因判断：提议包含测试侧名称或固定样例文字，被事实隔离规则拒绝；普通值 test 及 TestType 等样例名称也受到此限制。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[9]。
