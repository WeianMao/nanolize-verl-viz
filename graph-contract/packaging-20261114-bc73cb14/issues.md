# packaging graph-contract 第二次实验问题记录

基准：nanolize claude/graph-contract-field-fixes @ 9413138036b515f119ff63fa6db082a6148103f0。
记录所有实际遇到的错误；未启动作业的记录明确标记，不将环境问题算作 nanolize 缺陷。

## 1. HTTPS 拉取私有 nanolize 仓库缺少凭据（环境）
- 步骤：获取指定分支。
- 作业 ID：尚未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`。
- 判断原因：当前环境未配置 HTTPS Git 凭据，已配置 SSH 访问。
- 绕过：将仓库 URL 改为 `git@github.com:WeianMao/nanolize.git`，未修改代码。
- 结果：成功获取指定分支，HEAD 精确等于 9413138036b515f119ff63fa6db082a6148103f0。
- 验收放宽：无。

## 2. 浏览工具无法读取昨天的网站（环境）
- 步骤：读取昨天公开报告。
- 作业 ID：尚未创建。
- 报错原文：`Internal Error`；`URL ... is not accessible via this tool.`。
- 判断原因：浏览工具抓取失败，页面本身可访问。
- 绕过：使用 curl 下载原页面、report.json、issues.md 到本地保存。
- 结果：完整读取昨天报告与 7 项问题记录。
- 验收放宽：无。

## 3. 默认 pip 索引无法解析（环境）
- 步骤：安装指定 nanolize 和测试依赖。
- 作业 ID：尚未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`；原安装任务被终止时为 `Terminated`（exit 143）。
- 判断原因：宿主配置的额外软件包索引无法解析；只指定 --index-url 仍保留额外索引并反复等待。
- 绕过：终止本目录下旧安装进程；改为 `PIP_CONFIG_FILE=/dev/null PIP_INDEX_URL=https://pypi.org/simple PIP_EXTRA_INDEX_URL=`，使用独立 venv 安装。清理旧安装进程过程中首个新安装任务也退出，单独重新启动。
- 结果：公共 PyPI 安装成功；已验证 nanolize 0.8.0 的模块来自本地指定提交，依赖锁定于 requirements.lock.txt。
- 验收放宽：无。

## 4. 默认检查执行器缺少 Slurm account，自动回退本机（环境）
- 步骤：作业准备 / 选择检查执行器。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`Scheduler command failed: sbatch: sbatch: error: You forgot to specify which account you want to use.`；`sbatch: error: Batch job submission failed: Invalid account or account/partition combination specified`。
- 判断原因：当前会话没有为 Slurm 配置默认 account；不是 packaging 或测试失败。
- 绕过：nanolize 的默认 auto 执行器自行回退为 local，没有改动文件或参数，也未禁用检查。
- 结果：作业继续，已创建隔离原版/候选工作树并开始提取测试行为事实。
- 验收放宽：无。

## 5. 编排脚本最初使用了错误的作业记录路径（编排）
- 步骤：提交后的只读状态读取；前期也有 rg 探测不存在的文档/模块文件名。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`FileNotFoundError: [Errno 2] No such file or directory: 'run/state/jobs/bc73cb142f814dd8b90647ddbb10cd4a'`；探测命令为 `No such file or directory`。
- 判断原因：执行状态实际在 state/jobs/jobs/JOB_ID，首次诊断脚本漏了一层 jobs；静态导航中猜测的若干文件名不存在。
- 绕过：先用 rg --files 和目录清单确认真实路径，更新 run/monitor.py 为正确路径并读取 public.json。
- 结果：正常读取状态，未影响正在执行的作业。
- 验收放宽：无。

## 6. 原版 requirements 大型检查在部分敲除运行中超时（验证缺口）
- 步骤：原版叶测试有效性验证。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：baseline-result.json 的 validity.matrix.test_requirements 对 markers、parser、range_engine、requirements、specifiers、utils 返回 `{"outcome":"error","reason":"timed_out"}`；叶缺口原因 `no_behavioral_knockout_failure`。
- 判断原因：正常原版运行通过（5405 passed、1 skipped，约 7 秒），但敲除后的大量失败/回溯运行触及默认时限；这是有效性验证超时，不是原版本身检查失败。耗时放大原因属于推断。
- 绕过：保留默认时限和全部原版检查，不把超时计作有效敲除；按默认流程为 requirements 另外设计行为测试。
- 结果：requirements 的新增 test_public_requirement_errors.py 最终被接受并通过原版有效性验证，requirements 的叶覆盖缺口已补上；原大型检查的敲除超时记录仍保留。
- 验收放宽：无。

## 7. 原版检查映射及内联快照来源审计警告（清单准备）
- 步骤：原版检查来源与映射审计。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`mapping_omits_imported_capability`、`undeclared_dependency`；public-behavior-snapshot 出现 `mapping_without_static_evidence`、`check_role_mismatch`，`The original role lacks byte-identical files at provenance_ref, or runs inline program text.`。
- 判断原因：旧检查按主要功能映射，实际还依赖邻接节点；自编内联公开快照跨三个能力且未声明 role，转换按文档保留其默认 original 角色，无法证明是上游原版测试。
- 绕过：保留这些警告和原版检查，不伪造来源，不改已提交清单；快照继续作为冻结输出比较，不能作为有效叶覆盖证据，缺口由独立设计者补测试。
- 结果：4/4 基线检查通过；其中仅 dependency_groups、utils 的上游检查算有效叶测试，其余 13 个外部叶节点进入测试设计。
- 验收放宽：无。

## 8. errors 首轮提案无法通过功能敲除有效性验证（测试设计）
- 步骤：首轮新增测试有效性验证。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`tests/nanolize_contracts/errors/test_exception_group_contract.py` 被拒，原因为 `no_behavioral_knockout_failure`。
- 判断原因：当前 Python 3.11 使用内置 ExceptionGroup；只断言该重导出类型的行为没有触达 packaging.errors 自身可敲除的实现。需要覆盖项目实际提供的兼容实现，或经公开校验进入其分组逻辑。
- 绕过：没有修改敲除规则、测试断言或外部契约，沿用默认第二轮设计，向独立设计会话提供已有拒绝反馈。
- 结果：第二轮提案通过模拟 Python 3.10 版本条件加载公开兼容类；3 个用例在原版通过并稳定，在 errors 敲除后均出现行为失败，进入独立复核。首轮另 26 个提案也进入复核；errors 第二轮最终被接受，缺口已补上。
- 验收放宽：无。

## 9. 独立复核拒绝四个提案，复核后的两个叶缺口没有再设计机会（测试设计流程）
- 步骤：全部设计轮次结束后的独立复核。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：version/test_version_contract.py：`test_pickle_roundtrip asserts the exact six-item __getstate__ layout, coupling the test to internal serialization representation rather than observable round-trip behavior. Stating that layout as a fact does not remove this implementation dependency.`；requirements/test_public_requirement_values.py：`The distinct inner-specifier identity assertion constrains object allocation rather than testing observable independence through mutation.`；maintenance/test_benchmark_contract.py：`Timing methods could become no-ops returning None and these tests would still pass. Setup samples and timing attributes do not establish that the benchmark operations execute correctly.`；tags/test_tag_values.py：`Requiring Tag hashes to equal tuple hashes fixes an implementation choice; valid hashing behavior only requires equal Tags to hash equally.`（均位于 tests/nanolize_contracts）。
- 判断原因：设计提案包含独立复核认为依赖内部布局/分配方式的断言；leaf_test_design.design_tests 在所有默认设计轮次之后才执行 _review，复核拒绝后不再给相应叶设计替代测试，导致 version、maintenance 的唯一提案被删后留下缺口。requirements、tags 另有已接受提案。另查明复核 payload 只提供 path/capability/label/facts，没有 surface/interface；本次契约其实声明了 Version.__getstate__ 的公开调用及六元组返回类型，因此 version 的“内部表示”判定存在缺少契约上下文的疑点，不能把该拒绝直接解释为该接口不在用户契约内。
- 绕过：沿用默认非严格流程继续，不推翻独立复核、不手改测试、不修改设计轮次或检查标准。已检查冻结阶段顺序约束，design_leaf_tests 每个作业只执行一次，因此没有重复调用冻结步骤。
- 结果：共接受 23 个文件 / 11 个节点，拒绝 5 个提案（1 个敲除拒绝、4 个复核拒绝），运行器失败 0；maintenance、version 保留有效叶测试缺口，另 2 个叶节点有有效原版测试，13/15 个外部叶节点有有效测试。candidate-5 最终 27/27 组通过，但这两个有效叶测试缺口仍然存在。
- 验收放宽：无；默认允许带缺口交付不等于 maintenance、version 已验证。

## 10. 模型验收者在默认 120 秒超时，任务成本基线仍未验证（任务评估）
- 步骤：task_effort_original / development / modify / repeat 0 的独立验收。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：judge/run.json：`status: timeout`、`exit_code: -15`、`duration_seconds: 120.5097`；record.json：`status: unverified`、`reason: judge_execution_unavailable`；usage：`status: unavailable`、`reason: missing_usage`。
- 判断原因：求解者已正常完成（blocker: none），验收者执行冻结 acceptance.py / accept_deep.py 命令返回 0，之后继续读源码、验证环境等，未能在默认 120 秒内返回结构化最终判定。其间还尝试在无 Git 仓库的评估导出中执行 git diff，返回 129（`warning: Not a git repository. Use --no-index to compare two paths outside a working tree`）；它随后继续直接检查源码和输入，没有最终结论。模型进程被终止，因此没有完整 turn usage。
- 绕过：保持默认 judge_timeout 和所有验收条件，不把脚本 exit=0 擅自提升为完整验收通过；沿用默认非致命路径继续压缩实现。保留本次 unverified 基线和缺失 usage，费用汇总不把未知用量当成 0。
- 结果：原版任务基线 ready=false，未继续更多重复评估；控制器第 2 轮开始作者实现。昨天的“求解者被缺失隐藏脚本阻塞”没有在本次首轮求解复现，但任务成本比较仍存在新的未验证原因。
- 验收放宽：无。未增加预算、时限或修改冻结任务。

## 11. 首个候选有 requirements / markers 行为回归（候选实现）
- 步骤：candidate-1 的全量冻结检查，23/27 通过，4 组回归；安装 2/2 通过。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：requirements 原版检查出现 `Expected version after ===`（例如 `Package [ a , b ] ( === arbitrarystring )`）；新增 requirements 检查 `AssertionError: assert 'Expected mat...      ~~~~~~^' == 'Expected mat...     ~~~~~~~^'`；markers 的固定提示在 `"<name>"` 两侧多输出了反斜杠，`assert str(caught.value) == message` 失败。
- 判断原因：候选解析器没有正确处理任意版本操作符之后的空白；未闭合括号的诊断起点偏移一位；markers 固定提示字符串转义错误。具体根因以自动修复者复验为准。
- 绕过：保留所有冻结检查，控制器第 6 轮先派发 requirements 的独立修复会话，修改候选源码，随后保存和复验；未修改 nanolize。
- 结果：candidate-2 的新增 requirements 检查通过，原版 requirements 原先的解析/诊断失败已消除；这次完整跑到结尾后暴露 3 个旧 pickle 兼容失败（见 #14）。candidate-3 的 markers 定向修复通过，修改 src/packaging/markers.py 的集合比较、类型验证及固定提示，冻结检查达到 25/27。
- 验收放宽：无。

## 12. dependency_groups 的私有调用形状仍受保留检查约束（昨天 #24 部分复现）
- 步骤：candidate-1 / test_dependency_groups。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`AssertionError: _resolve('leaf') call not found`；实际调用为 `call('leaf', 'root', [], set(), [])`，公共返回值的 4 个 attrs 已通过断言；该检查 1 failed、44 passed。
- 判断原因：转换器已将 `_resolve` / `_validate` 私有名称列为接口，但原测试还要求 `_resolve` 内部递归调用的单参数形状。声明名称不能完全消除实现耦合。昨天的 specifiers / pylock 私有类型约束已通过剔除相应旧检查避免，本次 dependency_groups 子项仍复现。
- 绕过：保留原检查并让默认修复流程兼容其明确要求，不删除 spy 断言或改测试。
- 结果：candidate-4 中修改 src/packaging/dependency_groups.py，恢复单参数 `_resolve(group)` 递归分派，保留完成展开缓存、循环检测和错误收集；test_dependency_groups 全部 45 个用例通过，全图 26/27 组通过。
- 验收放宽：无。

## 13. 控制器失败摘要仍缺少断言差异（昨天 #23 部分复现）
- 步骤：candidate-1 失败进入 controller/0006。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：控制器对 check-11 / check-21 只收到 `{"cases":1,"origin":"verifier","type":"AssertionError"}`；check-3 为 `{"cases":1,"origin":"other","type":"AssertionError"}`；没有 failure_digest 或 stdout/stderr 的具体差异。
- 判断原因：完整 verification.json 确有详细 traceback，但控制器 issues.jsonl 的脱敏摘要只留下类型/数量/部分候选位置和 knowledge_ids。可定位能力与事实，却不能从摘要直接判断转义、插入符或私有调用参数差异。
- 绕过：先沿用默认修复者的冻结事实、允许的本地复现和失败后源码参考机制；尚未补丁 nanolize，也没有向作者直接传递隐藏测试源码。
- 结果：控制器能启动定向修复，最终解决全部观察到的回归。本次没有遇到昨天的测试收集/启动失败分支，不能声称那个分支已修好。
- 最终结果：所有 4 条控制器行为问题均已修复，经过 4 次定向修复、5 个候选达到 27/27 组通过。不能从这次单次实验量化摘要缺失额外造成了几轮；本次没有为摘要问题改 nanolize。
- 验收放宽：无。

## 14. 完整跑到 requirements 尾部后发现三个旧 pickle 兼容失败（候选实现）
- 步骤：candidate-2 / test_requirements；3 failed、5402 passed、1 skipped。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`TypeError: can only join an iterable`（Specifier 处理 `(None, {...})`）；`TypeError: expected string or bytes-like object, got 'tuple'`（Marker 将旧状态当字符串解析）；`TypeError: invalid Version state`（Version 旧属性字典）。
- 判断原因：候选的反序列化没有兼容 packaging 26.0 / <=26.1 保存的状态形式。首候选 requirements 在前面的 100 个失败处提前结束，所以这些尾部失败此前没有被执行观察到；不是证据表明修复引入了这三项回归。
- 绕过：保持原有序列化兼容检查与默认测试配置，通过控制器继续修复相关候选实现，不剔除旧格式要求。
- 结果：candidate-5 新增 src/packaging/_pickle.py，并修改 _parser.py、markers.py、specifiers.py、version.py 及报告映射，支持旧 slot 状态封装、值节点和版本组件状态恢复。原版 requirements 达到 5405 passed、1 skipped，所有 27 组冻结检查通过；1 skipped 是要求 Python 3.13 的 copy.replace 用例，原版与候选相同。
- 验收放宽：无。

## 15. 分阶段实现期间的全图自检返回未完成项（过程记录，非交付缺陷）
- 步骤：前三个作者调用完成全图实现之前的 selfcheck。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：5 次 selfcheck 命令 exit=1；作者调用 1 的第 1/2/3 次分别均有 11 项 `missing_imports`、157 项 missing_names（其中输出 100 项，`missing_names_not_listed: 57`）；作者调用 2 的第 4/5 次分别均有 8 项 missing_imports、96 项 missing_names。
- 判断原因：控制器将 18 个节点拆成三个作者调用顺序实现，全图自检在前两段自然发现尚未实现的其他能力；这不是已保存候选的五次验收失败。
- 绕过：不削减自检范围，继续原定后续作者调用，补齐其负责的模块、公共名称和 nanolize-report-mapping.json。
- 结果：第三个初次实现调用后全图自检通过，首次 candidate-1 才进入正式冻结行为比较。另外作者日志中的若干 rg exit=1 是空工作区/未找到 AGENTS.md 或 pyc 的普通无匹配结果，无需修复；不将其误计为行为错误。
- 验收放宽：无。

## 16. 验证包导出误把参数化测试 ID 中的产品输入当宿主绝对路径（新增过滤问题）
- 步骤：seal_contract 时导出可移植验证包；完成作业后的交付审计发现该回执。
- 作业 ID：bc73cb142f814dd8b90647ddbb10cd4a。
- 报错原文：`Portable metadata contains an absolute path (baseline.results[0].case_status key); use relative check inputs`；bundle-receipt.json 的 status 为 `unavailable`。
- 判断原因：verification_bundle._safe_metadata 对 case_status 的字典键使用非 prose 的绝对路径正则。首个被拒的键为 `tests.test_requirements.TestRequirementParsing::test_error_invalid_marker_malformed_quoted_string[name; os_name == "C:\\"-expected0]`，其中 Windows 风格文本是产品解析测试的输入，不是宿主工作区路径。不是检查输入路径没有写成相对路径。该误判和昨天 #14 同属产品值/宿主位置混淆，但本次发生在另一条验证包导出路径，事实提取和设计过滤未复现昨天的拒绝。
- 绕过：freeze.py 内置捕获 ValueError 并保留 unavailable 回执，继续以本地冻结基线完成全部验证；本次未补丁、未删除该用例、未放松导出器过滤，也没有声称存在可移植验证包。
- 结果：作业完整交付 candidate-5，27/27 行为检查与 2/2 安装检查通过，本地记录和 public_safe 报告生成成功；可移植验证包不可用的限制仍存在。
- 验收放宽：无；本地行为验证未被替代，缺失包未计为成功。
