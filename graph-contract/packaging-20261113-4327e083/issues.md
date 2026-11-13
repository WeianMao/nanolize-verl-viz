# packaging graph-contract 完整运行问题记录

所有时间为 UTC。未创建作业时使用“准备阶段”标识；每条后续补充结果。验收设置未主动放宽。

本页问题列表只保留经核对确定由 nanolize 自身引起的 7 项。

## 8. nanolize 公共视图拒绝带 carry 的完整计量
- 步骤：review 启动，生成审核页面。
- 作业 ID：尚未提交；review 58e76f1b93664f2e883f3a937e64942e。
- 报错原文：`OSError: Review service failed to start; inspect its private service.log`；内层 `ValueError: Complete code token measurement omits source files`。
- 判断原因：public_view._public_measurement 要求计量源码路径与全部源码库存相等，未考虑已授权 carry、因此被排除计量的源码数据表。
- 绕过：在本地分支 local/packaging-graph-contract-fixes 修改 src/nanolize/public_view.py，公开视图保留已公开源码映射中的 carry 哈希/字节描述，并用已计量源码与 carry 的并集校验完整性；增加 tests/test_carry.py 回归，验证公开视图往返、遗漏文件和错误哈希仍拒绝。未改任何检查或计量数值。
- 结果：提交 8bf8144；携带相关 8 项、公共视图 12 项测试全部通过；review 44b3dfe8245b480db5ad4ccad19bd0e5 启动成功并提交作业 4327e083375146389cfcac988ca769cb。
- 验收放宽：无。

## 12. 行为事实首轮遗漏了部分原版测试节点
- 步骤：write_test_facts 的独立复核。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错原文：pylock 复核返回 `"missing":["tests/test_pylock.py::test_pylock_mixed_path_separators"]`；requirements 复核返回 `"missing":["tests/test_requirements.py::TestRequirementParsing::test_file_url","tests/test_requirements.py::test_basic_valid_requirement_parsing"]`，已有事实均 accept=true。
- 判断原因：事实编写者首轮归纳遗漏了三个测试节点，并非原版行为检查失败。
- 绕过：由 nanolize 默认流程自动启动第二轮事实编写和独立复核；未手工改事实、测试或验收标准。
- 结果：pylock 第二轮 missing=[] 且无事实被拒；requirements 第二轮仍缺 tests/test_requirements.py::test_basic_valid_requirement_parsing，保留缺口等待汇总；原始测试未删除。
- 验收放宽：无。

## 14. 事实安全过滤把合法 URL/路径示例视为绝对位置
- 步骤：验证写入知识包的行为事实。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错原文：`invalid_facts` / `fact contains an absolute location`，requirements 两轮 URL 示例事实和 pylock 首轮混合路径分隔符事实被过滤。
- 判断原因：用于阻止泄露宿主机路径的静态过滤器也命中了原测试中作为数据的文件 URL、仓库 URL 和 Windows 路径示例。
- 绕过：保留过滤器；由原有第二轮编写尝试改述。没有改动 frozen 检查、断言、外部契约或知识校验规则，允许默认非严格事实记录带缺口继续。
- 结果：最终 158 条事实进入契约、5 条历史提案被剔除、2 个测试节点未被事实覆盖；原版对应检查仍保留并将照常验证。详见 test-facts.json。
- 验收放宽：无（事实不完整的缺口显式保留，不作为通过证据）。

## 18. 其他测试提案被静态过滤或语法检查拒绝
- 步骤：第一轮补充测试的静态验收。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错原文：direct_url/test_record_contract.py、direct_url/test_credential_contract.py、metadata/test_validation_contract.py：`invalid_facts`, `fact contains an absolute location`；markers/test_marker_environment_contract.py：`forbidden_call`；specifiers/test_conjunction_behavior.py：`does_not_parse`，Python 解析详情 `unexpected indent (<unknown>, line 8)`。以上路径均在 tests/nanolize_contracts/ 下。
- 判断原因：合法 URL 示例触发绝对位置过滤；markers 提案使用 platform.system，静态规则按属性名 system 命中进程调用禁用项；specifiers 提案含错误缩进。拒绝发生在运行前。
- 绕过：沿用默认静态校验，剔除这些未满足标准的新增提案；对应节点另有有效测试，因此默认流程没有为这些文件再设计一轮。未删改原有检查、未放开过滤条件。
- 结果：direct_url 接受 1 个、metadata 2 个、markers 2 个、specifiers 2 个新增测试；拒绝记录保留于 designed-tests.json，测试覆盖只按实际接受项报告。
- 验收放宽：无。

## 19. 默认真实任务评估要求求解者运行隐藏脚本，导致原版基准未验证
- 步骤：task_effort_original，development/modify 第一次独立求解。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错原文：求解者结果 `status: blocked, blocker: data`，`Required verification remains blocked: the acceptance script is missing and pytest is unavailable.`；执行 `.venv/bin/python .task-effort/checks/development/accept.py` 返回 `can't open file '$TASK_WORKSPACE/.task-effort/checks/development/accept.py': [Errno 2] No such file or directory`；pytest 返回 `No module named pytest`。基准记录 `status: unverified, ready: false`；单次评估 `reason: task_environment_unavailable`。
- 判断原因：出题者在公开任务文字里明确要求运行 .task-effort/checks/development/accept.py，但独立求解阶段按隐藏验收隔离规则没有该脚本。任务又声明无需网络和第三方依赖；求解者创建的新 .venv 没有 pytest。它完成了源码修改并自报 7 个独立检查通过，但不能满足任务里那条不可执行的必需验证指令，故返回 blocked。
- 绕过：保留该评估的 blocked/unverified 结果，不把自报通过当作隐藏验收通过，不向求解者泄露隐藏验收脚本。按 nanolize 默认非致命路径继续完整压缩与功能验证；不修改冻结任务或增加预算。默认任务预算 1,000,000 tokens 在已开始的调用完成后记录为 1,113,829（出题 626,839，求解 486,990），未启动更多原版重复评估。
- 结果：最终任务成本比较仍为 unverified / behavior_acceptance_pending；原版任务基准未建立这一独立缺口也保留在报告中。不能据此宣称任务成本改善。
- 验收放宽：无人工放宽；沿用默认“评估未验证仍可继续、交付保留缺口”的行为。原版任务评估未通过是实际缺口。

## 23. 控制器缺少启动错误摘要，无法直接定位共享失败
- 步骤：candidate-2 完整比较及两个针对性复测后的控制器诊断。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错/请求原文：clarification-1：`The saved issue observations contain no failure_digest or diagnostic text. Please provide the sanitized startup/collection error for check-35 and check-7, including any missing import or candidate location...`。控制器只能看到全部 pytest exit=4，先复测两个检查，再启动一次只读 reviewer 会话。
- 判断原因：测试尚未完成收集，没有 JUnit 用例证据；现有反馈没有把可安全提供的 ImportError 摘要交给控制器，原始 stderr 只在 owner 的 verification.json 中。
- 绕过：核实两个检查均为同一 ImportError 后，把不含原版实现、测试正文或绝对路径的简短诊断保存到 run/clarification-1.txt，用 `nanolize job-answer ... clarification-1 --answer-file run/clarification-1.txt --expected-revision initial --json` 自动回答；不等待用户，不修改契约。
- 结果：09:19:42 UTC 答复成功写入；控制器第10轮据此修复 markers，约09:22完成，随后第11轮代表性检查通过、完整比较31/36通过。后续 check-1 的收集错误也缺少摘要，按同样方式回答 clarification-2；candidate-5 继续缺少 _TrimmedRelease 的收集摘要和 pylock 失败摘要时，回答 clarification-3（包括接口名字与调用签名，不包含实现或测试正文）。candidate-7 的61个 specifier 用例失败仍没有摘要时，再通过 clarification-4 提供按缓存30例、bound3例、pickle14例、惰性构造14例分类的实际错误，明确与收集错误区分。未等待用户介入。
- 验收放宽：无。

## 24. 转换保留的旧检查仍约束多个私有接口
- 步骤：candidate-3 完整比较。
- 作业 ID：4327e083375146389cfcac988ca769cb。
- 报错原文：test_specifiers 收集失败 `ModuleNotFoundError: No module named 'packaging._structures'`，收集依赖导入 Infinity、NegativeInfinity；test_dependency_groups 两例失败 `AttributeError: 'DependencyGroupResolver' object has no attribute '_resolve'` 和 `does not have the attribute '_validate'`；test_pylock 五例失败 `type object 'PackageVcs' has no attribute '_from_dict'`、PackageWheel/Package 同类错误。
- 判断原因：转换器保留的测试通过跨测试模块导入、实例私有方法 mock 以及私有反序列化入口，对新实现施加了外部契约之外的兼容要求。初次冻结时这些检查已被标为私有结构耦合，但仍保留为比较标准。
- 绕过：不删除、改写或跳过旧检查；由控制器逐能力修复候选兼容接口。缺少的 specifiers 收集诊断通过 clarification-2 自动提供，仅包含错误和需要存在的名字，不提供原版实现或测试正文。
- 结果：candidate-3 总计31/36检查组通过；candidate-4 的依赖组原版检查及两个新增契约检查共3项针对性复测全部通过。控制器随后补齐 _structures；candidate-5 完整比较32/36通过，但收集继续暴露 `ImportError: cannot import name '_TrimmedRelease' from 'packaging.version'`。已通过 clarification-3 一次性说明相关导入名称和 pylock 缺失的 classmethod 接口。candidate-7 的 pylock 检查已通过，完整比较35/36通过；specifiers 终于完成收集，2036例通过、61例失败、2例跳过，剩余失败涉及私有 `_spec_version`、`_canonical_spec_cache`、`_canonical_spec`、`_to_ranges` 以及相关缓存/惰性构造/反序列化接口。典型错误包括 `AttributeError: 'Specifier' object has no attribute '_spec_version'`、`assert None == ('>=', '1')`；candidate-8 补齐缓存与惰性状态兼容后，36/36项冻结检查组全部通过；没有删除私有接口相关用例，也没有改动断言。
- 验收放宽：无。
