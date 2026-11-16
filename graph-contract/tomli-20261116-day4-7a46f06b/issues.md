# 本次运行的公开问题与现象

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 6 项。

### I06

动态导入私有 _types 被恢复器归为 public，导致内部模块路径成为不必要的重写约束。graph_contract.py:769–787 未解析该 f-string 拼接，应识别可解析的拼接或保守标为未知。

### I10

controller 的实际 argv 已指定模型/effort，settings 却记为 null；controller.py:626–632 与 effort_runner.py:125–147 的配置传递未统一。需让命令构建与元数据记录共用解析后的设置。

### I13

profile 有 Program 程序入口契约，设计代理却连续两轮因没有 callable、无法做函数 knockout 而不生成测试，最终该叶节点未验证。test_designer 提示词遗漏了 no_function_bodies/not_assessable 的有效例外，需修正提示词并明确 Program 的测试入口。

### I14

OriginAudit 与 Atheris finder 相互递归，导致 2 个测试文件和 1 个场景文件被拒绝，fuzz 最终只验证归一化。runtime_guard.py:419–434 遍历整个 sys.meta_path 并重新调用之前的 finder，需补充委托边界或重入保护。

### I16

rewrite.integrate 恢复 tox 配置段，却未保留其中引用的 profiler/requirements.txt、fuzzer/requirements.txt，最终交付配置存在悬空路径；scripts/requirements.txt 也缺失。rewrite.py:1211–1215、1225、1247–1250 需补齐引用资源保留或一致性检查。

### I17

便携验证包未生成：verification_bundle.py:366–396 的 _portable_manifest() 转换了 manifest.checks 的 Python 解释器引用，却遗漏 graph-contract 自动归档的 original_checks[*].check，随后元数据安全检查拒绝该归档。需对归档检查执行相应便携转换，并保留其他不安全路径的拒绝规则。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

### I12

基线中 4 组检查出现 mapping_without_static_evidence；动态 knockout 发现 original-errors、recovered-test_misc 对 scalars 的未声明依赖。静态映射与间接导入的实际依赖存在差异，parse/scalars 均有有效检查。

### I15

首轮 benchmark 有 2 个失败检查组、3 个失败项，控制器自动完成 1 轮行为修复；第二轮恢复 benchmark/data.toml 后，最终 9/9 检查组通过。这次行为修复不属于防默写退回。

### 现象-2

原始 invalid 数据的 516 个样本中实际执行 505 个，11 个非 UTF-8 样本由保留的上游测试跳过。这是继承原始检查的验证边界，未执行样本不能计为通过。

### 现象-3

额外原始测试回放为 0 文件、0 用例，1 文件未回放；8 项已由恢复检查承担，1 项留置。流程不重复回放已恢复或留置的测试，不能记成额外通过。

### 现象-4

tasks=off，任务成本改善实验默认关闭，本次未开展。不能宣称已经测出任务成本下降。

