# 问题记录：需要修改 nanolize 分支代码的 Bug

本节只列经核对确定需要修改 nanolize 分支的 10 项。

FACT-01～FACT-10 是同一事实过滤缺陷的 10 条记录，包含第二轮重试；合并计为 1 个根因。该缺陷位于 claude/graph-contract-field-fixes 分支，提交 9413138，本次尚未修复。

共同原因：src/nanolize/leaf_test_design.py 的 _test_terms 遍历整个 AST，将名称以 test 开头的嵌套 CLI 回调和被测辅助类型也收集为测试标识；_fact_reasons 再按词边界匹配事实全文，因而误拒合法输入、输出和对象值。FACT-01～09 命中普通值 test，FACT-10 命中被测类型名 TestType。

影响与处理：沿用默认第二轮改写，部分上下文事实补充成功；custom_parser 和 paramtype_no_name 两个测试仍有事实覆盖缺口。原版测试始终保留并在最终验收通过，事实缺口不等于跳过测试。

需要修改：修正测试入口识别和事实文本匹配边界，区分被测回调、辅助类型与真实测试标识，并覆盖这些误判场景；继续阻止真实测试名和节点 ID 泄露。证据为 test-facts.json 的 dropped[0..9]。

## FACT-01：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：合法子命令名 test 被整文件 AST 收集为测试标识，精确输入输出事实因 fact_names_a_test 被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[0]。

## FACT-02：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：帮助输出 Usage: foo test [OPTIONS] 中的合法命令名 test 被误认成测试标识。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[1]。

## FACT-03：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：第二轮已将合法命令描述为 subcommand named test，仍命中无上下文的禁词匹配。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[2]。

## FACT-04：test_commands 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_commands.py::test_custom_parser`。
- 原因判断：第二轮精确帮助事实中的 test --help 和 Usage: foo test [OPTIONS] 再次被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[3]。

## FACT-05：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_get_context_objects`, `tests/test_context.py::test_get_context_objects_no_ensuring`。
- 原因判断：对象标题及输出值 test 与同文件嵌套回调名碰撞，正常对象传递事实被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[4]。

## FACT-06：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_pass_obj`。
- 原因判断：pass_obj 传入并打印的普通字符串值 test 被误认成测试标识。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[5]。

## FACT-07：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_make_pass_meta_decorator_doc`。
- 原因判断：普通描述 the test value 命中同文件其他测试内的 CLI 回调名，属于整文件禁词污染。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[6]。

## FACT-08：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_pop`。
- 原因判断：context 弹栈前 close 回调读取的正常对象值 test 被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[7]。

## FACT-09：test_context 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_context.py::test_close_before_exit`。
- 原因判断：显式 context exit 时 close 回调读取的正常对象值 test 被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮改写后通过复核；对应检查保持不变。证据：test-facts.json dropped[8]。

## FACT-10：test_info_dict 事实提议被剔除

- 步骤：冻结前测试事实生成；作业 ID：`553492f6820c472fb1724aa6f94d5f6b`。
- 原始诊断：`["fact_names_a_test"]`。
- 涉及检查：`tests/test_info_dict.py::test_paramtype_no_name`。
- 原因判断：被测辅助类 TestType 仅因名称前缀被识别成测试类，其可观察类型名称事实被误过滤。
- 绕过：由框架默认第二轮自动改写并独立复核；未修改清单、检查、nanolize 代码或参数，没有关闭事实过滤。
- 结果：默认第二轮仍未形成覆盖该测试的有效事实；相应原版测试继续作为完整验收约束，事实缺口保留。证据：test-facts.json dropped[9]。
