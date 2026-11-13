# Tomli graph-contract 运行问题记录

本页问题列表只保留经核对确定由 nanolize 自身引起的 7 项。

## I12 — 测试设计审阅否决：fuzz
- 步骤：冻结阶段，对 tests/nanolize_contracts/fuzz/test_fuzz_callback.py 做独立审阅。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/否决原文：
```text
reviewer_veto
Would pass if the callback constructed FuzzedDataProvider and immediately returned, skipping parsing, serialization, normalization, and round-trip comparison entirely.
```
- 原因判断：回调即使只创建 FuzzedDataProvider 后直接返回，也会通过所提断言；无法保护解析与往返比较。
- 绕过：维持 reviewer_veto，不把无效提案加入冻结检查；按默认非 strict 策略继续剩余流程，未修改任何验收断言。
- 结果：fuzz 节点保留另一项通过审阅的 normalize 测试；回调主体没有因此获得完整验证结论。

## I13 — 测试设计审阅否决：profile
- 步骤：冻结阶段，对 tests/nanolize_contracts/profile/test_profile_workload.py 做独立审阅。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/否决原文：
```text
reviewer_veto
Counts every profiled function named loads, regardless of its module or identity. An unrelated loads function called 1000 times could satisfy the assertion without invoking the TOML parser.
```
- 原因判断：仅按函数名 loads 统计调用次数，无法证明调用的是 Tomli 解析器。
- 绕过：维持 reviewer_veto，不把无效提案加入冻结检查；按默认非 strict 策略继续剩余流程，未修改任何验收断言。
- 结果：profile 节点保留为未验证；其功能接口和全选范围仍保留，未关闭检查或改 strict 默认值。

## I14 — 补测后原版检查的来源记账降级
- 步骤：合并设计测试后重新捕获基线与叶节点覆盖。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/诊断原文：`role_not_proven`；`check_role_mismatch`；`referenced_files_changed`；`The original role lacks byte-identical files at provenance_ref, or runs inline program text.`
- 原因判断：旧清单三个 pytest 检查都声明 `inputs: ["tests"]`；设计器向 tests/nanolize_contracts 添加三个文件后，来源审计把这些新增输入视为 original 检查的 referenced_files_changed，同时把新测试导入的节点归到原版检查。原版测试本身未改变：独立逐文件核对 979 个原版测试/数据文件，差异 0 个。
- 绕过：没有修改已封存契约或强制改写来源结论。继续执行全部七项冻结检查，保留默认非 strict 策略及来源警告；报告单列“检查运行通过”和“有效测试来源证明不足”。后续清单应把原版测试文件、辅助文件和 data 目录列为精确 inputs，避免纳入新增测试目录。
- 结果：原版七项基线均通过；当前 leaf_coverage 缺口为 api、parse、profile 共三个外部叶节点；scalars、typing 为内部节点，按外部调用验证规则统计。无检查被关闭或断言放宽。

## I16 — 原版任务成本基线缺少验收程序
- 步骤：task-effort/original/development/modify/0。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/诊断原文：`task_environment_unavailable`；solver `status: blocked`, `blocker: data`；`Required acceptance could not run because accept.py is absent.`
- 原因判断：生成的修改任务要求求解者运行未交付到其工作区的 accept.py；求解者完成代码修改及本地回归，但无法完成被要求的独立验收，故原版任务基线未成立。
- 绕过：保持任务测量结果 unverified，不伪造成功、不关闭 task-effort；默认 controller 继续独立重写与全部行为/安装验收。未修改 nanolize、冻结任务或验收标准。
- 结果：prepare_tasks 返回 unverified、tasks=0；开始作者 run_agent。最终不宣称任务成本改善。

## I18 — 首轮候选的基准测试输出回归
- 步骤：candidate-1 / attempt 1 的完整行为比较，检查 contract-benchmark-fc9bf6-1。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：
```text
E       AssertionError: assert ['Parsing ben...------------'] == ['Parsing dat...------------']
E         
E         At index 0 diff: 'Parsing benchmark/data.toml 1 times' != 'Parsing data.toml 1 times:'
E         Use -v to get more diff
FAILED tests/nanolize_contracts/benchmark/test_benchmark_public.py::test_run_reports_all_parsers_in_order
1 failed, 8 passed in 0.57s
```
- 原因判断：候选 benchmark/run.py 改变了固定输出标题，把 `Parsing data.toml 1 times:` 写成 `Parsing benchmark/data.toml 1 times`，还可能有表头排版差异。其他六项检查通过，包括原版解析数据的 744 个子测试。
- 绕过：由 controller 调用独立作者修复 benchmark 外部输出契约，然后重新跑完整检查；保留原有断言，不改测试。
- 结果：第二轮候选 fb2299a21e83b5df7ebfa6cc05e67b7794cafe80 修复 benchmark/run.py 的固定标题及表头排版；7 项冻结行为检查全通过（35 个 pytest 用例、744 个数据子测试、1 个原有条件跳过，另加内联输出对比），2 项独立安装检查通过。体积 6192 / 14587 tokens（42.45%）。默认失败节点源码参考机制向修复作者提供了原版 benchmark/run.py；未修改测试或验收标准。

## I19 — 可移植验证包导出拒绝绝对路径
- 步骤：冻结基线的验证包导出；交付时核查 bundle-receipt.json。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：`Portable metadata contains an absolute path; use relative check inputs`；`status: unavailable`。
- 原因判断：只读复查确认 portable manifest 正常；绝对路径出现在 `validity.policy.test_template.argv[0]`，值为本次 venv 的绝对 Python 路径。导出器转换主检查 argv，却将 validity 策略原样复制进 portable 元数据，随后被其隐私防护拒绝。
- 绕过：保留导出器拒绝结果，不删除审计字段、不修改冻结策略、不关闭路径防护。用已生成的本地交付源码和完整本地验证记录交付；公开网站只发布脱敏汇总，明确没有可移植验证包。未修改 nanolize 代码。
- 结果：作业正常到达 completed_with_gaps，源码导出到 tomli-nanolized-20261113-081043；7 项行为检查和 2 项安装检查通过，portable verification bundle 仍 unavailable。

## I20 — 收尾停止审阅服务时已不可用
- 步骤：终态交付之后，调用 `nanolize review-stop 74a2b407cceb40f882a187943dc0c858 --state-root run/state --json`。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/返回原文：`status: unavailable`，命令退出码 1。
- 原因判断：随后直接连接原 loopback 审阅端口 41199 返回 ECONNREFUSED（111），该服务已不在监听。终态作业与交付文件仍完整。
- 绕过：确认端口关闭后不重启服务，也不终止其他进程；未修改文件、参数、源码或验收标准。
- 结果：没有需要继续停止的审阅监听端口；最终交付和静态报告发布不受影响。
