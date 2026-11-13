# Requests graph-contract 运行问题记录

本页问题列表只保留经核对确定由 nanolize 自身引起的 6 项。

## 5. nanolize 不支持仓库内测试目录符号链接
- 步骤：静态发现与启动准备，原版快照 `complete=false`。
- 作业 ID：尚未创建。
- 报错原文：`Skipped symbolic link into an excluded or non-file target: tests/certs/mtls/client/ca`；同样发生于 `tests/certs/valid/ca`。
- 原因判断：两个 Git 跟踪的证书目录链接指向仓库内 `tests/certs/expired/ca`，快照只支持指向普通文件的链接。
- 绕过：本地分支 `local/requests-graph-contract-workarounds` 修改 `src/nanolize/repository.py`：只对仓库及其导出副本内、当前扫描范围内、非排除目录的测试到测试目录链接记录原始 link text 哈希，目标文件继续在真实路径逐个哈希；外部链接和生产目录链接仍拒绝。增加回归测试。显式检查 inputs 改为证书的普通文件清单，链接自身由冻结测试快照保护。
- 结果：快照 13 项、计量 15 项和验证器回归测试全部通过；原版保留 pytest 预检 61 通过、1 跳过。没有关闭或放宽检查。

## 15. 测试设计器禁止导入本次被测项目 Requests
- 步骤：第三次作业 design_leaf_tests；检查补测规则时复现。
- 作业 ID：`59d50cd5d4c541dc8639c0063f8965c4`（重写前取消，证据保留）。
- 报错原文：对 `from requests.auth import HTTPBasicAuth` 的离线公开接口测试，`_static_reasons` 返回 `["forbidden_import"]`，而 `_contract_reasons` 返回 `[]`。复现记录 `run/requests-import-gate-repro.json`。
- 原因判断：固定网络工具禁导入列表含 requests，不区分其是第三方工具还是正在被压缩的项目；提示词也要求设计者遵循该禁令，使其无法直接测试契约内的 Requests 公开接口。
- 绕过：本地修改 `src/nanolize/leaf_test_design.py`：只在 graph-contract 模式，对“源码清单实际拥有且在外部契约出现”的模块根从禁导入列表中移除；提示词与静态检查使用同一列表。第三方网络库、私有名称、被禁调用、外部契约之外的访问仍会拒绝；CPU-only/no-network 指令与原版重复、敲除、独立审阅检查不变。冻结配置不改，准备新建作业。
- 规则变动说明：静态导入规则由无条件禁用 requests 改为允许契约内被测模块；没有关闭测试或降低行为验收要求。此处明确记录该针对性例外，供评估分支规则设计。
- 结果：2 项回归通过，证明被测 Requests 风格模块的测试能通过原版并识别敲除，同时未拥有的 requests、socket、httpx 与内部接口仍被拒绝。完整 graph-contract 28 项（227.870 秒）、测试设计 23 项（307.098 秒）与提示词 39 项回归全部通过；同步生成的提示词文档无变化（默认示例无此例外）。本地提交 `90ac959`；第四次作业 `4ca78143bbe441ad9de81322ca7b5501` 已启动。

## 18. 第一轮补测提案被事实规则与敲除证据门槛退回
- 步骤：第四次作业 design_leaf_tests 第一轮筛选。
- 作业 ID：`4ca78143bbe441ad9de81322ca7b5501`。
- 报错原文与文件：
  - authentication/test_digest_negotiation.py：`invalid_facts`、`fact contains an absolute location`。
  - compatibility/test_dependency_aliases.py：`invalid_facts`、`fact contains an absolute location`。
  - compatibility/test_public_annotations.py：`no_behavioral_knockout_failure`，矩阵为 `survived`。
  - utilities/test_proxy_size_contract.py：`fact_names_a_test`。
  - utilities/test_mapping_contract.py、test_header_uri_contract.py、test_encoding_contract.py：`no_behavioral_knockout_failure`，矩阵为 `not_assessable / knockout_breaks_import`。
  上述路径均位于 `tests/nanolize_contracts/`；完整反馈在 `design/round-2/*/runner/prompt.txt`。
- 原因判断：事实文本中的 URL 路径分量（如 '/a'）被绝对路径规则拒绝，IPv6 字面量 `::1` 被测试标识符分隔符规则拒绝。兼容性元数据测试没有触发被敲除函数；utilities 的整叶敲除破坏了包导入，不能把导入失败当行为失败（其 structures 中 LookupDict 被其他模块在导入时构造，而当前导入期保留分析仅查看被敲除的模块）。
- 绕过：不改静态门槛、不把 survived 或 import failure 算通过；默认第二轮将逐文件反馈交给全新的设计调用自行修改提案。未动已冻结的原版检查或接口范围。
- 结果：第一轮 14 个提案中，认证、Cookie、异常、HTTP API 四个节点的 7 个文件通过本轮执行与敲除验证；兼容性和工具函数进入第二轮。文档两轮均未提出测试，仍作为缺覆盖项保留。独立审阅接受全部 7 个文件，最终组合重跑通过。第二轮另有 4 个提案被拒绝：compatibility/test_compatibility_public_contract.py、utilities/test_public_headers_and_uri_values.py 因 `invalid_facts / fact contains an absolute location`；utilities/test_public_decoding_proxy_and_sizes.py 因 `fact_names_a_test`；utilities/test_public_mapping_values.py 因 `no_behavioral_knockout_failure`。共 18 个提案、7 个接受、11 个拒绝，runner_failures=0；兼容性、工具函数与文档仍保留缺覆盖状态，继续默认流程并在最终报告明确列出。

- 第五次作业追加记录（`e30ac08b63794c3991faa354391b9c85`）：两轮共 14 个提案，全部拒绝，runner_failures=0；此前 7 个已接受测试均保留。逐项原因：
  - 第 1 轮，`tests/nanolize_contracts/compatibility/test_dependency_compatibility.py`：`invalid_facts / fact contains an absolute location`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_proxy_contract.py`：`fact_names_a_test`。
  - 第 1 轮，`tests/nanolize_contracts/compatibility/test_public_typing_metadata.py`：`no_behavioral_knockout_failure`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_mapping_contract.py`：`no_behavioral_knockout_failure`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_header_contract.py`：`no_behavioral_knockout_failure`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_url_contract.py`：`no_behavioral_knockout_failure`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_encoding_contract.py`：`no_behavioral_knockout_failure`。
  - 第 1 轮，`tests/nanolize_contracts/utilities/test_stream_mapping_contract.py`：`no_behavioral_knockout_failure`。
  - 第 2 轮，`tests/nanolize_contracts/utilities/test_public_proxy_values.py`：`fact_names_a_test`。
  - 第 2 轮，`tests/nanolize_contracts/compatibility/test_alias_behavior_contract.py`：`no_behavioral_knockout_failure`。
  - 第 2 轮，`tests/nanolize_contracts/utilities/test_public_mapping_values.py`：`no_behavioral_knockout_failure`。
  - 第 2 轮，`tests/nanolize_contracts/utilities/test_public_headers_urls.py`：`no_behavioral_knockout_failure`。
  - 第 2 轮，`tests/nanolize_contracts/utilities/test_public_encoding_helpers.py`：`no_behavioral_knockout_failure`。
  - 第 2 轮，`tests/nanolize_contracts/utilities/test_public_local_file_helpers.py`：`no_behavioral_knockout_failure`。

## 20. 恢复运行的事实提取仍拒绝合法路径文字，留下一个未转述用例
- 步骤：第五次作业 write_test_facts 的提取、重写和独立审阅。
- 作业 ID：`e30ac08b63794c3991faa354391b9c85`。
- 报错原文：12 条退回记录为 `invalid_facts / fact contains an absolute location`；另 1 条审阅意见为 `The removal specifies the 'app' path, but the cookie and assertion use '/app'. Removal compares paths exactly; supplying 'app' would leave the 'deep' cookie present.`
- 原因判断：Cookie 路径和 URL 路径分量属于产品行为中的合法值，却触发了防止泄露绝对文件位置的事实过滤；将 '/app' 改写成 'app' 又改变了实际语义，独立审阅正确拒绝了这个不准确的改写。
- 绕过：使用默认重写与审阅流程，保留全部测试和断言，没有删除路径判断，也没有将不准确事实交给作者作为正确契约。
- 结果：本轮接受 87 条事实、涉及 12 个检查；共退回 24 条（上述 13 条，加上第 10 项同类的 11 条测试辅助服务器事实）。`contract-cookies-4ca781-3` 中 `test_assignment_and_filtered_removal` 仍列为未覆盖的事实说明；该测试仍被执行、仍参与验收，不是跳过测试。完整记录在本作业 test-facts.json；最终 14 项行为检查全部通过。

## 21. 可移植验证包不支持审计中真实依赖的绝对目录
- 步骤：第五次作业 seal_contract 导出 portable verification bundle。
- 作业 ID：`e30ac08b63794c3991faa354391b9c85`。
- 报错原文：`Bundle paths must remain repository-relative`；bundle-receipt.json 的 status 为 `unavailable`。
- 原因判断：`verification_bundle._portable_manifest` 对 runtime.allowed_roots 中每一项要求仓库相对路径；第 11 项修正需要列出测试环境中三个第三方依赖包的真实绝对目录，以正确审计 Requests 的兼容别名。核心验证支持这些路径，可移植 v1 导出不支持。
- 绕过：采用工具内建的降级记录，保留核心冻结基线和全部来源审计；没有删除允许根、没有禁用 runtime 审计，也没有把缺少的验证包标为通过。
- 结果：契约封存成功，作者正常启动；可移植验证包缺失将如实报告，实际行为检查继续执行。

## 22. 默认任务成本评估不支持目录符号链接
- 步骤：第五次作业 prepare_tasks，为原版准备独立任务成本基线。
- 作业 ID：`e30ac08b63794c3991faa354391b9c85`。
- 报错原文：`Task snapshots cannot isolate a submodule, directory symlink or special file`；reason=`unsupported_repository_layout`，status=`unverified`，tasks=0。
- 原因判断：task-effort 使用单独的快照隔离实现，仍明确不支持目录链接；Requests 中两个证书测试目录链接触发该限制。这不是产品行为检查失败。
- 绕过：没有传 --no-task-effort 或修改评估标准；使用默认流程保存 unsupported/unverified 证据并继续压缩与行为验证，不伪造任务基线、任务耗时改进或评估通过。
- 结果：作业最终以 completed_with_gaps 交付。任务比较为 unverified / behavior_acceptance_pending（行为义务仍有缺口），原版任务准备也因上述布局不受支持而没有有效基线。无法提供原版／压缩版任务成本对比；实际调用用量按回执统计。
