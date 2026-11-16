# tqdm nanolize 问题简表

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 4 项。

### I09 — nanolize 文档 bug

技能写固定默认预算 7,200/3,600 秒，实际按体积分档，本项目为 43,200/7,200 秒；需更新说明。对应 skills/simplify-code/SKILL.md:307–312 与 src/nanolize/execution.py:310–321。

### I13 — nanolize 诊断记录 bug

重复运行用全部轮次判断稳定，却只保存末轮摘要，丢失中间失败证据；受控 pass/fail/pass 已复现，需保留逐轮记录。对应 src/nanolize/verification.py:923–946 的 _repeat_stability。

### I17 — nanolize 迁移账本 bug

局部内部断言排除被记为整项 excluded，即使公共部分的替代文件已被复核拒绝；本次涉及13项，工具账本为1迁移、13排除、9未验证，22/23没有完整迁移证据。对应 src/nanolize/leaf_test_design.py:480–482、609–612 及 src/nanolize/execution.py:3731–3738，应保留未获替代的公共迁移义务。

### I19 — nanolize bug（确认）

pytest setup 包装消息未被异常解析器识别，丢失允许传递的 FileNotFoundError 类型，使修复反馈缺少异常摘要；已有最小复现。对应 src/nanolize/failure_digest.py:124–153 与 src/nanolize/leaf_test_validity.py:204–209。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

### I10 — 事实复核现象

接受200条行为事实、覆盖18检查组，6条被复核拒绝，4个测试未形成接受事实；原测试仍参与执行。

### I16 — 模型产物/复核现象

部分测试提案虽执行通过，仍因改变公开输入、调用顺序或遗漏断言被独立复核拒绝；共退回15个测试提案和14个场景提案。执行通过不等于最终接受，未迁移缺口继续保留。

### I18 — 生成实现/修复现象

生成实现前7版有行为差异或遗漏必需资产；第8版全部56组通过、908用例通过、4跳过，独立安装通过，共8候选、9次作者调用。冻结验收保持不变，终态仍为 completed_with_gaps，不能宣称完全等价。

### I20 — 生成实现/证据缺口现象

旧测试回放有8个函数回归，其中尚存的公共差异是 tqdm.cli.main 将 TqdmKeyError 转成 SystemExit(1)；其余7个函数涉及内部依赖，不能一概称作公共功能回归。该回放属于交付后的额外度量，不改变56组冻结验收与 completed_with_gaps 终态。

### 现象-1 — 验证方法适用范围

bells 自身源码只有模块级导入和调用，无法做函数体 knockout；检查通过且稳定，但没有自身函数体的动态 knockout 证据。21/22有效叶节点不表示21个节点均完成动态失效验证（src/nanolize/leaf_test_validity.py:399–408）。
