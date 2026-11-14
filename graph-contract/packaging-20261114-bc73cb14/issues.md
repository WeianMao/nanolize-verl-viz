# packaging graph-contract 第二次实验问题记录

基准：nanolize claude/graph-contract-field-fixes @ 9413138036b515f119ff63fa6db082a6148103f0。
本页问题列表只保留经核对确定由 nanolize 自身引起的 1 项。


## 16. 验证包导出误把参数化测试 ID 中的产品输入当宿主绝对路径（已知设计限制）
- 步骤：seal_contract 时导出可移植验证包；完成作业后的交付审计发现该回执。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`Portable metadata contains an absolute path (baseline.results[0].case_status key); use relative check inputs`；bundle-receipt.json 的 status 为 `unavailable`。
- 判断原因：verification_bundle._safe_metadata 对 case_status 的字典键使用非 prose 的绝对路径正则。首个被拒的键为 `tests.test_requirements.TestRequirementParsing::test_error_invalid_marker_malformed_quoted_string[name; os_name == "C:\\"-expected0]`，其中 Windows 风格文本是产品解析测试的输入，不是宿主工作区路径。不是检查输入路径没有写成相对路径。该误判和昨天 #14 同属产品值/宿主位置混淆，但本次发生在另一条验证包导出路径，事实提取和设计过滤未复现昨天的拒绝。这是 bundle v1 文档已说明的设计限制，不是新回归；合法的静态测试参数在普通环境中也会阻止导出。
- 绕过：freeze.py 内置捕获 ValueError 并保留 unavailable 回执，继续以本地冻结基线完成全部验证；本次未补丁、未删除该用例、未放松导出器过滤，也没有声称存在可移植验证包。
- 结果：作业完整交付 candidate-5，27/27 行为检查与 2/2 安装检查通过，本地记录和 public_safe 报告生成成功；可移植验证包不可用的限制仍存在。影响限于 portable bundle；整体验证仍为 unverified，不能将整体未验证全部归因于此项。
- 验收放宽：无；本地行为验证未被替代，缺失包未计为成功。
