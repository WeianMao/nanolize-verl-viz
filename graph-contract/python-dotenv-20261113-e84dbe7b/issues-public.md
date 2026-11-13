# python-dotenv graph-contract 运行问题记录

本页问题列表只保留经核对确定由 nanolize 自身引起的 8 项。

## 010 — 合同封存拒绝原版许可证符号链接
- 步骤：seal_contract。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：`ValueError: Rewrite files must be ordinary non-linked files: license.md`。
- 原因判断：原仓库 docs/license.md 是指向 ../LICENSE 的合法内部文档链接；nanolize 将其识别为需保留的许可证，再无区别套用普通文件检查，导致在作者启动前失败。
- 绕过：在 nanolize 本地独立分支 local/python-dotenv-graph-contract-fixes 修复对原版内部许可证链接的识别；只允许指向仓库内普通许可证文件的链接并同时保护目标，继续拒绝逃逸、源码目标和作者生成的链接。添加回归验证后单独提交。
- 结果：修复提交 ae4e61dae3d450374911551adba94c1c616ee146；5 项定向回归 + 17 项集成边界回归通过；在真实工作树验证 LICENSE 和 docs/license.md 同时被保护。首次作业无封存检查点（resume_available=false），保留全部失败证据后以修复版重启。
- 补充：旧 review 已自动退出，停止查询返回 status=unavailable；新 review c16a611bafab4fac8e9ce5facf346ec0 成功启动，新作业 e84dbe7bec3e4131a98e42f15d5e13ff 使用修复提交。
- 实际重跑结果：第二次作业于 07:51:46 UTC 完成合同封存并进入任务设计，checkpoint-seal.json 已生成。
- 验收标准：未放宽；许可证内容和测试仍完整保留。

## 011 — 广泛 tests 目录输入使补测后的原测试来源校验失效
- 步骤：接受补测后重捕原版基线。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：`role_not_proven` / `referenced_files_changed`，IPython 节点因此被列为 missing。
- 原因判断：我们声明的 inputs=["tests"] 包含后来新增的已授权补测；该新文件不存在于上游 provenance_ref，目录字节集合自然不同。原有 291 项测试仍通过，实际没有改写原测试。
- 绕过：后续清单将 inputs 展开为原版 tests 目录中每一个明确文件的完整列表，原测试及共享辅助文件仍逐字节冻结；新增补测由自己的检查独立冻结。不改变命令、断言、来源引用或检查策略。
- 结果：在已新增补测的真实作业工作树上进行只读来源验证，9 项原版 pytest 检查全部恢复 original_verified；新作业使用此清单，10 项基线检查全部通过，leaf_coverage.missing=[]，7 个外部叶节点均有效。
- 验收标准：未放宽，未修改 provenance 校验代码。

## 013 — 任务设计要求求解者运行不可见的验收脚本
- 步骤：task_effort_original，modify/development 第 0 次重复。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`.venv/bin/python: can't open file '.../workspace/accept.py': [Errno 2] No such file or directory`；任务记录 status=blocked、reason=task_environment_unavailable；baseline.status=unverified、ready=false。
- 原因判断：独立任务设计者在公开任务 prompt 中要求“Execute the supplied standalone accept.py”，但 nanolize 将验收脚本留给独立验证器，求解者工作区只拿到 cases.json。求解者完成了实现和局部检查，仍因无法运行这个被要求的脚本而诚实报告 blocked。这是任务设计与脚本隔离方式不一致，不能当作原版或压缩代码的功能失败。
- 绕过：保留冻结任务、隐藏验收隔离和所有功能检查，不伪造或暴露 accept.py；使用工具默认的未验证处理继续压缩与功能验收，单独报告任务成本比较未验证。未改代码、文件或运行参数，未删除失败证据。
- 结果：任务成本阶段保留 unverified；默认流程于 08:07:26 UTC 进入第 1 轮源码实现。后续任务成本对比不应宣称通过或可比较。
- 验收标准：没有手工关掉或放宽检查；局限为任务成本对比未完成，不能用本次结果证明后续修改任务的成本下降。功能和安装验收标准保持不变。

## 016 — 首轮作者重新生成了由验证器保护的 LICENSE
- 步骤：第 1 轮 save_candidate。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`Generated output was rejected. It contains verifier-owned tests or inputs; do not create or replace tests, oracle fixtures or check inputs: LICENSE.`；reason=integration_rejected，categories.verifier_owned=["LICENSE"]。
- 原因判断：作者在空白实现工作区生成了 LICENSE，但原版许可证由验证器按字节保护和提供，不能由作者重新生成或替换。
- 绕过：保留文件保护拒绝，将原始反馈交给默认作者修复流程；要求候选输出不包含重新生成的 LICENSE，由验证器带入原版许可。未修改保护规则或许可证内容。
- 结果：第 2 轮作者已删除生成的 LICENSE 及其报告映射条目，保存成功并进入实际候选验证。第 1 轮控制器同批安排的检查继续执行在未更新的第 0 版原版树上，显示体积 100%、目标未达；这不是压缩候选通过，报告不会混用这些结果。
- 验收标准：未放宽；此拒绝属于文件保护，不计入防默写退回文件数。

## 018 — 第 2 版候选出现两项原测试回归
- 步骤：compare_behavior / run_checks，第 2 版候选。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：
  - tests.test_main::test_rewrite_reports_original_error_when_cleanup_fails：`[temp_file] = dotenv_path.parent.glob(".tmp_*")` 后 `ValueError: not enough values to unpack (expected 1, got 0)`。
  - tests.test_cli::test_list[None-x='a b c'-x=a b c\n]：`assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`。
- 原因判断：临时文件的命名/清理路径与冻结原测试要求不一致；CLI 空格式参数未按原版 simple 输出处理，错误加上 shell 引号。具体实现由作者依据冻结反馈修复。
- 绕过：保留两项原测试及断言，交由默认修复流程修改候选 main.py 和 cli.py；不调整检查或格式期望。默认 on_failed_check 策略允许该修复轮次读取失败能力对应的原生产文件，此来源暴露将在报告另列。
- 结果：本轮 289 passed、2 failed、1 skipped；体积 5,279 / 10,933 token，目标已达，但行为不合格，不能交付。第 3 版复验中临时文件回归已修复，CLI 同一案例仍失败。
- 验收标准：未放宽。

## 021 — 第 4 版 CLI 回归继续存在
- 步骤：第 4 版 compare_behavior / run_checks。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：同一 test_list[None] 案例仍为 `assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`。
- 原因判断：实际候选 cli.py 使用 `if output_format != "simple": value = shlex.quote(value)`，将空值也当作 shell/export 格式处理；第 4 轮调整了缺少依赖的提示文字，但未修正此分支。
- 绕过：默认控制器继续第 5 轮修复；随后通过原生 job-diagnose 提交不含源码的输出语义说明（run/cli-diagnostic.json，diagnostics-1，绑定 verification-18/candidate-4），明确空格式用 simple，只有 shell/export 做 shell 引号。调用保留 expected-revision=initial，未修改冻结契约、测试、状态或作者活动工作区。
- 结果：290 passed、1 failed、1 skipped；5,361 / 10,933 token（49.035%）；全部 3 项安装检查通过。第 5 版仍失败（见问题 024）；第 6 版在当前行为说明后完整通过。
- 验收标准：未放宽。

## 024 — 第 5 版 CLI 回归仍在，补充只读运行复现
- 步骤：第 5 版 compare_behavior / run_checks，以及根协调器的只读 CLI 复现。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：同一 test_list[None] 案例仍为 `assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`；本轮 290 passed、1 failed、1 skipped。
- 原因判断：第 5 轮仍未修改该输出分支；根协调器使用正式 venv 和候选包，临时在内存中记录 Click 回调参数，确认显式 None 确实作为 NoneType 传入，省略格式和显式 simple 均正常，None 才错误加引号。没有改候选源文件或冻结测试。
- 绕过：保留原生 diagnostics-1 的简短行为说明，使后续修复知道空格式要使用 simple 输出；只读复现证据存 run/cli-public-probe.json。诊断在第 5 轮作者启动后才记录，因此须下一轮读取。
- 结果：本轮体积 5,368 / 10,933 token（49.099%）；最终第 6 版 291 passed、0 failed、1 skipped，3 项安装检查通过。明确的问题没有通过修改测试或宣布“不稳定”来绕过。
- 验收标准：未放宽。

## 026 — 便携验证包拒绝绝对检查路径
- 步骤：导出冻结验证包（交付时核对 bundle-receipt.json）。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`Portable metadata contains an absolute path; use relative check inputs`；status=unavailable。
- 原因判断：当前检查使用本次运行的绝对 Python 启动器路径和环境路径；这些本地绑定能保证实际检查的解释器与导入位置，但不满足便携包的路径限制。
- 绕过：保留已执行和封存的本地检查证据及原生 public-safe 图报告，不在运行后修改冻结命令来伪称同一个便携包。未更改任何检查参数。
- 结果：功能与安装验收通过，公开图报告正常生成；独立便携验证包未生成，报告明确列为交付物限制。
- 验收标准：未放宽；未把不可导出的便携包标为可用。
