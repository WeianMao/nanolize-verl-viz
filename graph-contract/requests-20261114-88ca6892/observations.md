# Requests graph-contract day2：运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。保留原编号 6、8 及防默写记录；需要修改分支代码的缺陷见 [问题记录](issues.md)。

## 6. HTTP API 提案退回（原记录 6 的现象部分）
- 步骤：design_leaf_tests 的提案筛选与独立审阅。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`。
- 首轮原始反馈：`outside_external_contract`；`not in the external contract: requests.(dynamic attribute)`。
- 第二轮原始反馈：`reviewer_veto`；`test_post_nonempty_data_takes_precedence_over_invalid_json checks only the prepared method representation. It would pass if preparation skipped JSON but discarded the supplied data, so it does not verify the claimed data precedence.`
- 原因判断：首轮使用无法静态确定契约目标的动态属性；第二轮只检查 method，不能证明宣称的 data 优先级。现有证据未将这两次退回定位为 nanolize 误判。
- 处理与结果：按默认第二轮及独立审阅反馈继续，未绕过审阅、未放宽验收。最终接受 4 份文件、65 个用例；HTTP API 补测未被接受。
- 分类说明：总计 6 份退回中的另 4 份涉及 compatibility/status，其函数敲除机制与事实保留支持缺口属于需要修改分支的缺陷，单列在 [问题 6](issues.md)。文档两轮均无提案，这一现象没有单独定位到代码 bug。


## 8. 第一版候选的六个公开状态码别名漂移
- 步骤：candidate-1 正式验证及独立公开常量核对；原有 11 项行为检查已通过。
- 作业 ID：`88ca6892f1c0415f96920528b764771e`；候选提交 `e24e680bda2d`。
- 报错原文（独立审计 JSON 差异）：`EARLY-HINTS` / `early-hints` expected=102、actual=missing；`REQUEST_URI_TOO_LONG` / `request_uri_too_long` expected=122、actual=414；`RESET` / `reset` expected=205、actual=missing。
- 原因判断：原版包含特殊历史别名和非通常值；接口已经声明保留全表及全部别名，但自动抽取的符号名没有列出这些常量，状态码补测又缺少有效函数敲除证据而被退回。作者重建表时遗漏/改写了其中三对大小写别名；现有保留检查未覆盖它们。
- 绕过：使用官方 `job-call run_agent`，role=repair、capabilities=[status]，仅向独立作者补充上述六个公开行为值，然后 `save_candidate`；不由协调者直接改写候选、不暴露隐藏测试或原版实现、不改变任何冻结检查。
- 结果：独立作者已修复并提交，随后重跑全部冻结验收；全部 243 个公开数值别名、元数据和 Session 默认值核对一致，详见下方修复结果。
- 验收放宽：无；这是修复已声明外部契约的行为偏差。

### 记录 8 修复结果
- 官方独立 repair 调用正常退出，只修改 `src/requests/status_codes.py`；修复提交 `26564c93d294`。
- 修复后全部 243 个公开数值状态别名、9 项元数据及 Session 默认配置与原版逐项相同；证据见 [公开值核对](public-values-validation.json)。候选内部数据结构未被固定，审计通过公开属性访问取值。
- 控制器与排队的显式保存分别记录了 candidate-2 和 candidate-3，二者提交及内容相同；3 个候选记录仅有 2 个不同的实现提交。重复 request-id 的第二次显式保存返回已有回执，没有再次执行。
- 最终候选 candidate-3 的 11 项冻结检查全部通过：126 个 pytest 用例通过、0 失败、1 个原版跳过；3 项隔离安装检查全部通过。修复提交修改 1 个文件、增加 5 行、删除 2 行。交付提交 `313024bf805bb0243f51e4976a697efdedd09cce` 再次通过全部公开值核对。
- 最终状态 completed_with_gaps，仍保留 compatibility、documentation、http-api、status 四个有效叶节点验证缺口；独立公开值审计不冒充状态码节点的敲除证据。没有修改 nanolize 源码、原版测试或任何验收规则。

## 防默写记录

防默写本次退回 0 个文件、0 次；默认 auto 下最终逻辑重合 22%，未达到全局 40% 触发线。这是过程指标，不是分支缺陷。
