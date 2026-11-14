# 运行现象与处理过程

环境、编排、验证现象和候选修复记录；已确认的分支缺陷另见 [issues.md](issues.md)。防默写本次退回 0 个不同文件、0 文件次。

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

## 9. 四个测试提案被独立复核拒绝

- 步骤：新增测试的独立复核；作业 bc73cb142f814dd8b90647ddbb10cd4a。
- 现象：version 提案被认为固定了六元组序列化表示；requirements 提案固定内部 Specifier 对象身份；maintenance 提案不能排除计时方法退化为 no-op；tags 提案要求 Tag 的哈希恰好等于 tuple 哈希。
- 处理与结果：保留四项拒绝，没有更改断言或强行接受提案。连同 errors 第一轮敲除拒绝，共 28 个提案、23 接受、5 拒绝。
- 分类：提案被拒是验证过程记录，不能单独算分支 bug。复核上下文和补测机会的疑点记录如下。
- 源码观察：复核 payload 没有 surface / interface；复核位于设计循环之后，删除唯一提案后不再回到补测。version 的六元组返回类型实际已列入 interface，因此复核是否获得充分契约上下文值得进一步检查。
- 判断边界：这些是本次发现的流程限制和待评估改进点；是否违反分支预期、以及补齐上下文能否改变裁决，尚未另行验证。沿用线上后续复核的分类，暂不列为已确认分支 bug。

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
- 分类说明：当前证据直接证明候选与保留测试的调用约定不兼容，且通过修改候选修复。它本身不足以证明 nanolize 分支有代码错误，列为兼容修复现象。

## 13. 控制器只看到受限的失败分类，断言差异不可见

- 步骤：candidate-1 的失败进入 controller/0006；作业 bc73cb142f814dd8b90647ddbb10cd4a。
- 观察原文：check-11 / check-21 为 {"cases":1,"origin":"verifier","type":"AssertionError"}，check-3 为 {"cases":1,"origin":"other","type":"AssertionError"}。私有 verification.json 保留详细 traceback，控制器不能直接看到转义、插入符或 spy 参数差异。
- 源码核对：failure_digest.py 明确采用封闭词汇表；rewrite.safe_feedback 只输出分类，以限制测试内容经异常通道返回作者。报告中没有名为 failure_digest 的字段，不等于摘要代码没有执行。
- 分类：这是已明确设计的信息边界及其运行影响；本次证据不足以认定分支实现错误，移入运行现象。昨天的测试收集/启动故障分支本次没有触发，不能据此确认修复或复现。
- 处理与结果：沿用冻结事实、本地复现与默认只读源码参考，4 次定向修复后 27/27 组通过；未改 nanolize、未向作者传递隐藏测试源码。无法量化受限摘要额外造成的轮次。

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
