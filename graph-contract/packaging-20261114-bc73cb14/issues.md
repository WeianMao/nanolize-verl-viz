# 需要修改 nanolize 分支的缺陷

本节只列经核对确定需要修改 nanolize 分支的 1 项。

仅列 claude/graph-contract-field-fixes @ 9413138 的分支代码缺陷。运行现象另见 [observations.md](observations.md)。

## B1. 验证包对参数化测试 ID 的路径误判（已知设计限制）

- 步骤：seal_contract 导出可移植验证包。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 对应原记录：#16；与昨天 #14 属于相似的产品值/宿主位置混淆，本次发生在验证包导出路径。
- 分支代码位置：src/nanolize/verification_bundle.py::_safe_metadata / _local；src/nanolize/job_tools/freeze.py 捕获导出异常。
- 报错原文：Portable metadata contains an absolute path (baseline.results[0].case_status key); use relative check inputs。bundle-receipt.json 的 status 为 unavailable。
- 分支问题：case_status 的键是参数化测试 ID，包含被测产品的输入值；导出器对整段键使用绝对路径正则。首个被拒用例是 test_error_invalid_marker_malformed_quoted_string，参数中的 C:\ 文本是语法解析输入，不是宿主路径。要求改相对 check inputs 无法解决这个问题。
- 需要修改：为此类用例键生成可移植标识并保留私有证据绑定，或在结构化字段中正确区分产品输入与宿主位置；继续拒绝真实宿主路径。
- 本次处理与结果：默认流程捕获 ValueError，保留 unavailable 回执，并以本地冻结基线完成 27/27 组行为检查和 2/2 项安装检查。public_safe 报告正常生成；可移植验证包仍不可用。
- 性质与影响：这是 bundle v1 已说明的设计限制，不是本次新引入的回归。合法静态测试参数也会触发它；解决需要修改导出器。影响限于可移植验证包，不能将整体 unverified 全部归因于此项。
- 修复状态：本次未修改分支；未删除用例、未放松路径过滤或行为验收。
