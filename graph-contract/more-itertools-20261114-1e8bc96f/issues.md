# more-itertools graph-contract 9413138 运行问题

本页问题列表只保留经核对确定由 nanolize 自身引起的 1 项。

所有时间使用 UTC；未明确标出的检查、验收规则和预算均未放宽。

## N02 — contract-propose 的实例字段追踪混淆不同测试函数的局部作用域，漏写保留检查需要的字段

- 步骤：graph-contract 转换；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 确定根因：nanolize 的 `src/nanolize/graph_contract.py:391` 中 `private_structure()` 同时用于转换和冻结审计；第515–528行遍历整份测试 AST，以变量名字符串建立 `made`、`stored`，要求该名字在全文件只对应一个构造对象。不同测试函数各自使用局部变量 `it` 构造不同公开类时，被错误合并为不确定对象，随后无法识别这些实例的私有字段。本次漏掉 `callback_iter._executor`、`serialize._iterator` 和 `serialize._lock`。
- 独立核验：从指定提交抽取原样的纯 AST 分析函数，在内存中比较两个互不相关测试函数各自用 `it` 直接构造 `pkg.First()`、`pkg.Second()` 并访问 `_executor`、`_iterator` 的输入。原输入返回 `{}`；仅把第二个函数的局部变量改名为 `second`，即返回 `{'pkg.First._executor': 'instance', 'pkg.Second._iterator': 'instance'}`。核验没有导入或执行目标库、创建测试文件、修改清单或运行作业，不涉及环境负载、网络或模型输出。
- 真实证据：原版 `tests/test_more.py:5050`、`:5086` 直接构造 `callback_iter`，`:5071`、`:5089` 访问 `_executor`；`:7107–7109` 直接构造 `serialize` 并读取 `_lock`、替换 `_iterator`。整份文件分析仅找到 `more_itertools.bucket._cache`；分别取上述测试方法连同原导入分析，则能找到对应遗漏字段。`run/graph-manifest.proposed.json` 与最终 `run/graph-manifest.json` 均缺失这些字段，`run/conversion-report.json` 的 `truncated={}`，排除了外层 finalize 删除或条目限额的解释。
- 触发条件：同一测试文件的不同函数，用相同局部名字直接构造不同的已知公开类，并访问需要保留的实例字段。直接构造已知类属于转换器明示支持的形式；不同函数的局部重命名不应改变其他函数的检测结果。
- 绕过：通过官方 `nanolize.job_debug.diagnose` 登记 `diagnostics-1`，绑定 `verification-20` / `candidate-6`，补充字段及替换协议；回执为 `run/candidate-6-diagnostics-receipt.json`。未改 nanolize 源码、冻结清单、测试、合同、策略、预算或通过/失败状态。
- 结果：收到诊断的后续作者修复后，`verification-25` 中相关实例字段失败消失，总失败由9降至5；这4项改善还包括另行补充的 `concurrent_tee.lock` 行为，不能全部归为此作用域缺陷。最终 `verification-35` 的7组功能检查全过。转换器本身没有修复，后续同类输入仍会漏检。
- 上报边界：只保留上述已复现的局部作用域处理缺陷。函数返回对象的共享 `lock`、错误摘要限制及其他候选失败不计为该根因；默认 `on_failed_check` 源码参考仍可用，不能声称作者完全无法取得字段信息。
