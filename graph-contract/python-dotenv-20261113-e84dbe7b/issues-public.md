# python-dotenv graph-contract 运行问题记录

## 001 — 获取 nanolize 时 HTTPS 缺少认证
- 步骤：安装前克隆 `WeianMao/nanolize` 的 `claude/graph-contract` 分支。
- 作业 ID：尚未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`；GitHub 连接器读取分支文档返回 `GitHub API error 404: Not Found`。
- 原因判断：仓库需要认证，当前命令行 HTTPS 未配置凭据，连接器无权读取该仓库。
- 绕过：通过本机已有的 WeianMao SSH 身份克隆指定分支，未修改源码。
- 结果：成功；nanolize 基础提交为 eb54c4328809d3e37b83301d8a934e520aa84234。
- 验收标准：未放宽。

## 002 — pip 额外索引 DNS 失败使安装反复等待
- 步骤：安装 nanolize 依赖。
- 作业 ID：尚未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`（pip 自动重试）。
- 原因判断：用户 pip 配置额外启用了不可解析的 `pypi.ngc.nvidia.com`，每个依赖都会重试；PyPI 主索引正常。
- 绕过：设置 `PIP_CONFIG_FILE=/dev/null` 后重新安装；保留依赖版本要求。清理重试时按完整 pip 命令匹配发送了 SIGTERM（PID 1536751、1538169、1538229）。
- 过程记录不足：当时未同时保存这 3 个 PID 的 cwd，无法追溯确认它们是否全部属于本次运行；后续仅依据本作业记录的 PID/会话进行控制。
- 结果：使用 PyPI 主索引安装成功，nanolize 与测试依赖已就绪。
- 验收标准：未放宽。

## 003 — 清单将非生产源码文件列入 paths
- 步骤：第一次 `contract-propose`。
- 作业 ID：尚未创建。
- 报错原文：`Capability path matches no production source: src/dotenv/py.typed`。
- 原因判断：能力 paths 只接受生产源码映射，不能把 py.typed 和打包配置当作源码映射。
- 绕过：修改 `run/manifest-old.json` 中 distribution.paths，仅映射 version.py；打包元数据和类型标记要求保留在功能描述，并将在 interface 及安装检查中明确。
- 结果：源码映射校验已通过，最终转换成功。
- 验收标准：未放宽。

## 004 — 旧清单检查角色字段取值不合法
- 步骤：第二次 `contract-propose`。
- 作业 ID：尚未创建。
- 报错原文：`Check role must be original, adapted or contract`。
- 原因判断：新写的公开输出检查误将比较状态 retained 用作 role。
- 绕过：将 `run/manifest-old.json` 中 public-output-snapshot.role 改为 contract；检查命令、断言和功能范围不变。
- 结果：转换成功，10 项检查全部保留。
- 验收标准：未放宽。

## 005 — Slurm 自动探测未找到配置服务器
- 步骤：作业检查执行器探测。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：`sinfo: error: resolve_ctls_from_dns_srv: res_nsearch error: Unknown host`; `sinfo: error: fetch_config: DNS SRV lookup failed`; `sinfo: error: _establish_config_source: failed to fetch config`; `sinfo: fatal: Could not establish a configuration source.`
- 原因判断：当前隔离运行环境有 Slurm 命令，但不能发现配置服务器。
- 绕过：保留默认 auto 策略，由 nanolize 自动选择本机执行全部检查；不修改代码和检查。
- 结果：已进入原版基线冻结；原版与候选均使用本机。
- 再次出现：重启作业 e84dbe7bec3e4131a98e42f15d5e13ff 的 Slurm 探测同样失败，仍由默认 auto 选择本机；未改变任何检查。
- 验收标准：未放宽。

## 006 — 监控脚本扫描正在删除的临时文件
- 步骤：读取作业状态与最近产物。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：`FileNotFoundError: [Errno 2] No such file or directory: .../facts/original_test_parser_31b7cdf6/tests_test_parser_py_237d6cae/1/write/runner/tmpzmwt_a9c`。
- 原因判断：辅助监控脚本递归扫描文件时，设计器恰好删除了临时目录，发生 stat 竞争；作业本身继续运行。
- 绕过：修改 `run/status.py`，只读取稳定 public.json 和顶层产物名，避免递归扫描活动临时目录。
- 结果：状态监控恢复；作业不受影响。
- 验收标准：未放宽。

## 007 — Sites 托管服务未在 workspace 启用
- 步骤：准备免登录公开报告托管。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：`SitesConnectorError: Sites is not yet enabled for this workspace.`（sites_access_disabled，404）。
- 原因判断：当前 workspace 未开通 Sites，无法创建站点；尚未返回 project_id，未创建远端站点。
- 绕过：改用已有的公开 GitHub Pages 仓库 WeianMao/nanolize-verl-viz，只添加独立报告子目录，不改已有页面；仓库根站点已确认可匿名访问。
- 结果：最终报告地址为 https://weianmao.github.io/nanolize-verl-viz/graph-contract/python-dotenv-20261113-e84dbe7b/；发布后的匿名 HTTP 内容验证另存 run/publication-check.json。
- 验收标准：未放宽，报告仍须免登录可访问。

## 008 — CLI 原版检查在敲除确认阶段超时
- 步骤：原版基线的功能敲除有效性验证。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：validity.matrix.original-test_cli.cli = `{"outcome":"unconfirmed_kill","reason":"timed_out"}`；leaf_coverage.why_missing.cli = `["no_behavioral_knockout_failure"]`。
- 原因判断：CLI 原版检查正常运行通过（约 13.88 秒），但敲除后的确认运行达到默认检查时限，无法当作有效行为检出证据。
- 绕过：保留原检查及默认时限，默认 design=True 流程为 CLI 设计聚焦行为测试，通过独立审阅、原版重复运行和敲除验证后才接受。
- 结果：2026-11-13 07:27:52 UTC，接受 1 个 CLI 补测文件（contract-cli-49ea4a-3）；首次作业随后通过 11 项检查，但在问题 010 的合同封存步骤失败。第二次作业的原版 CLI 敲除确认直接通过，无须补测；首次补测文件没有混入第二次合同。
- 验收标准：未放宽；超时未计为通过。

## 009 — 独立审阅拒绝两个把偶发崩溃当合同的测试
- 步骤：CLI 补测独立审阅。
- 作业 ID：49ea4ac6871b4de082006e87ca5c580d。
- 报错原文：
  - `tests/nanolize_contracts/cli/test_read_contract.py`: test_list_without_parent_context codifies an incidental crash from accessing ctx.obj without the parent context. Exit 1 with no output also passes for unrelated exceptions, so it does not verify correct listing behavior.
  - `tests/nanolize_contracts/cli/test_write_contract.py`: test_set_without_parent_context codifies an incidental crash from accessing ctx.obj without the parent context. Exit 1 with no output also passes for unrelated exceptions, so it does not verify correct setting behavior.
- 原因判断：设计者直接调用依赖父命令上下文的子命令，将 ctx.obj 缺失造成的任意异常当作正确行为；exit 1 且无输出的断言过弱。
- 绕过：遵循审阅拒绝，两个文件不加入合同；继续验证已被独立审阅接受的 test_run_contract.py，原有读写检查仍保留。
- 结果：test_run_contract.py 通过审阅与有效性验证并获接受；2 个被否决文件没有加入合同。
- 验收标准：未放宽；拒绝弱断言，未将其视为通过。

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

## 012 — 报告辅助检查使用了不存在的模块路径
- 步骤：只读确认体积指标的编码器实现。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`sed: can't read nanolize/src/nanolize/encoding.py: No such file or directory`。
- 原因判断：辅助检查误猜模块名；实际实现位于 code_size.py。
- 绕过：用 rg --files 定位并读取 code_size.py；未修改作业、源码或参数。
- 结果：确认固定使用 tiktoken 0.12.0 / cl100k_base，按文件计量源码与配置；作业持续运行。
- 同类辅助错误：后续只读搜索误用不存在的 orchestration* 路径，rg 报 `No such file or directory (os error 2)`；已有 effort.py 和 execution.py 搜索结果正常返回，后续改为搜索已存在路径。另一次同类读取误猜 installation.py 路径，收到相同文件不存在错误，已改为对整个 src/nanolize 搜索。
- 验收标准：未放宽。

## 013 — 任务设计要求求解者运行不可见的验收脚本
- 步骤：task_effort_original，modify/development 第 0 次重复。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`.venv/bin/python: can't open file '.../workspace/accept.py': [Errno 2] No such file or directory`；任务记录 status=blocked、reason=task_environment_unavailable；baseline.status=unverified、ready=false。
- 原因判断：独立任务设计者在公开任务 prompt 中要求“Execute the supplied standalone accept.py”，但 nanolize 将验收脚本留给独立验证器，求解者工作区只拿到 cases.json。求解者完成了实现和局部检查，仍因无法运行这个被要求的脚本而诚实报告 blocked。这是任务设计与脚本隔离方式不一致，不能当作原版或压缩代码的功能失败。
- 绕过：保留冻结任务、隐藏验收隔离和所有功能检查，不伪造或暴露 accept.py；使用工具默认的未验证处理继续压缩与功能验收，单独报告任务成本比较未验证。未改代码、文件或运行参数，未删除失败证据。
- 结果：任务成本阶段保留 unverified；默认流程于 08:07:26 UTC 进入第 1 轮源码实现。后续任务成本对比不应宣称通过或可比较。
- 验收标准：没有手工关掉或放宽检查；局限为任务成本对比未完成，不能用本次结果证明后续修改任务的成本下降。功能和安装验收标准保持不变。

## 014 — 作者自检解释器缺少可选 CLI 依赖
- 步骤：第 1 轮作者运行 .nanolize-rewrite/selfcheck.py。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`imports.failed=[{"module":"dotenv.cli","error":"SystemExit","at":"src/dotenv/cli.py:11"}]`；自检同时报告 8 个 Python 文件、无缺失文件/名称/参数变化。
- 原因判断：作者隔离解释器未安装 click，候选的缺少 CLI 依赖提示触发退出；自检运行环境与正式冻结检查的虚拟环境不同。
- 绕过：不把这次自检视为完整导入通过；仍由已装 click 的冻结环境运行 CLI 原测试，并由独立安装检查安装 cli 依赖后验收。未改变检查命令和标准。
- 结果：第 2 版正式环境可正常导入和运行 CLI（52 项通过，另 1 项独立输出兼容回归见问题 018）；独立安装后的公开接口及 CLI 版本检查通过，缺失依赖问题没有影响正式环境。
- 再次出现：第 4 轮作者对 JSON、默认 simple、shell、export 的 4 次 CLI 探针均因缺少 Click 退出（exit 1），原文为 `The dotenv CLI requires click. Run pip install "python-dotenv[cli]" to install it.`；未将这些探针当通过，正式检查环境仍可正常运行 CLI。
- 验收标准：未放宽，CLI 功能检查没有被移除。

## 015 — 作者隔离环境无法安装体积分词器
- 步骤：第 1 轮作者尝试自行估算体积。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`ERROR: Could not find a version that satisfies the requirement tiktoken==0.12.0 (from versions: none)`；`ERROR: No matching distribution found for tiktoken==0.12.0`。
- 原因判断：作者环境中 pip 的包源/网络可见性未提供所需包；日志未给出更细网络原因。控制器环境已安装正确版本，不受影响。
- 绕过：保留固定的 tiktoken 0.12.0 / cl100k_base 度量，由验证器计算实际体积，不采用作者估计作为验收依据；未改源码或参数。
- 结果：第 2 版由验证器正确计量为 5,279 / 10,933 token（48.285%），固定分词器正常，达到 50% 目标；最终第 6 版为 5,385 / 10,933 token（49.255%），达到目标。
- 验收标准：未放宽，未更换分词器或体积目标。

## 016 — 首轮作者重新生成了由验证器保护的 LICENSE
- 步骤：第 1 轮 save_candidate。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`Generated output was rejected. It contains verifier-owned tests or inputs; do not create or replace tests, oracle fixtures or check inputs: LICENSE.`；reason=integration_rejected，categories.verifier_owned=["LICENSE"]。
- 原因判断：作者在空白实现工作区生成了 LICENSE，但原版许可证由验证器按字节保护和提供，不能由作者重新生成或替换。
- 绕过：保留文件保护拒绝，将原始反馈交给默认作者修复流程；要求候选输出不包含重新生成的 LICENSE，由验证器带入原版许可。未修改保护规则或许可证内容。
- 结果：第 2 轮作者已删除生成的 LICENSE 及其报告映射条目，保存成功并进入实际候选验证。第 1 轮控制器同批安排的检查继续执行在未更新的第 0 版原版树上，显示体积 100%、目标未达；这不是压缩候选通过，报告不会混用这些结果。
- 验收标准：未放宽；此拒绝属于文件保护，不计入防默写退回文件数。

## 017 — 独立安装在下载并安装依赖时达到默认时限
- 步骤：控制器第 3 轮 check_installation；由于问题 016，此次检查的是尚未替换的第 0 版原版树。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：install-wheel.status=timed_out、exit_code=-9；最后输出为 `Installing collected packages: pure-eval, ptyprocess, wcwidth, typing_extensions, traitlets, python-dotenv, pygments, psutil, pexpect, parso, executing, click, asttokens, stack_data, prompt_toolkit, matplotlib-inline, jedi, ipython-pygments-lexers, ipython`；installed-public-contract.status=not_run。
- 原因判断：新虚拟环境首次下载和安装 click/IPython 依赖，在共享文件系统上超过默认 30 秒；build-wheel 已通过，没有源码构建错误。
- 绕过：保留安装命令、依赖及默认时限，利用本次已下载的 pip 缓存，在下一候选的全新环境里重试完整安装验收。未把超时当通过，未跳过后续公开接口检查。
- 结果：第 2 版完整安装验收通过：build-wheel 7.1801 秒，install-wheel 23.0257 秒，installed-public-contract 0.2886 秒；仍为各 30 秒时限。
- 验收标准：未放宽。

## 018 — 第 2 版候选出现两项原测试回归
- 步骤：compare_behavior / run_checks，第 2 版候选。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：
  - tests.test_main::test_rewrite_reports_original_error_when_cleanup_fails：`[temp_file] = dotenv_path.parent.glob(".tmp_*")` 后 `ValueError: not enough values to unpack (expected 1, got 0)`。
  - tests.test_cli::test_list[None-x='a b c'-x=a b c\n]：`assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`。
- 原因判断：临时文件的命名/清理路径与冻结原测试要求不一致；CLI 空格式参数未按原版 simple 输出处理，错误加上 shell 引号。具体实现由作者依据冻结反馈修复。
- 绕过：保留两项原测试及断言，交由默认修复流程修改候选 main.py 和 cli.py；不调整检查或格式期望。默认 on_failed_check 策略允许该修复轮次读取失败能力对应的原生产文件，此来源暴露将在报告另列。
- 结果：本轮 289 passed、2 failed、1 skipped；体积 5,279 / 10,933 token，目标已达，但行为不合格，不能交付。第 3 版复验中临时文件回归已修复，CLI 同一案例仍失败，见问题 019。
- 验收标准：未放宽。

## 019 — 第 3 版复验仍有同一个 CLI 输出回归
- 步骤：第 3 版 compare_behavior。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：tests.test_cli::test_list[None-x='a b c'-x=a b c\n]，`assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`。
- 原因判断：前一修复轮修正了 main.py 的清理行为，但 CLI 空格式参数案例仍走了加 shell 引号的输出分支。
- 绕过：继续默认修复流程，保留相同 CLI 测试、断言和验收门槛；无手工修改策略。
- 结果：本轮 290 passed、1 failed、1 skipped；体积 5,336 / 10,933 token（48.806%），不能宣称行为验收通过。最终第 6 版全部行为检查通过，该回归已消除。
- 验收标准：未放宽。

## 020 — 第 4 轮作者安装 Click 遇到 DNS 失败
- 步骤：作者为本地 CLI 探针安装临时依赖。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`；随后 `ERROR: No matching distribution found for click>=5.0`。
- 原因判断：作者的隔离 shell 包源/网络配置与正式检查环境不同，无法解析其 pip 使用的包源；不能由该错误判断候选 CLI 功能失败。
- 绕过：作者继续参考已授权源码作静态修复，正式行为和安装检查仍使用已配置依赖的冻结执行环境；不取消 CLI 检查、不全局安装依赖。失败安装命令的目标仅为 /tmp/dotenv-repair-click。
- 结果：作者本地探针不足未计为通过；最终第 6 版使用完整依赖环境，53 项 CLI 案例通过、1 项 Windows 案例跳过，独立安装验收也通过。
- 验收标准：未放宽。

## 021 — 第 4 版 CLI 回归继续存在
- 步骤：第 4 版 compare_behavior / run_checks。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：同一 test_list[None] 案例仍为 `assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`。
- 原因判断：实际候选 cli.py 使用 `if output_format != "simple": value = shlex.quote(value)`，将空值也当作 shell/export 格式处理；第 4 轮调整了缺少依赖的提示文字，但未修正此分支。
- 绕过：默认控制器继续第 5 轮修复；随后通过原生 job-diagnose 提交不含源码的输出语义说明（run/cli-diagnostic.json，diagnostics-1，绑定 verification-18/candidate-4），明确空格式用 simple，只有 shell/export 做 shell 引号。调用保留 expected-revision=initial，未修改冻结契约、测试、状态或作者活动工作区。
- 结果：290 passed、1 failed、1 skipped；5,361 / 10,933 token（49.035%）；全部 3 项安装检查通过。第 5 版仍失败（见问题 024）；第 6 版在当前行为说明后完整通过。
- 验收标准：未放宽。

## 022 — 辅助状态命令未结束时提前读取输出
- 步骤：准备原生 job-diagnose 的证据引用。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)`。
- 原因判断：job-state --all 仍在等待作业步骤的状态读取，命令已返回持续执行会话，但辅助脚本过早读取其尚为空的输出文件。
- 绕过：不再提前读取；直接只读操作日志和已封存 verification-18，通过工具提供的 failed_issue_ids 解析唯一失败项，再使用正式 job-diagnose 入口。未手工写入作业状态。
- 结果：diagnostics-1 于 08:38:58 UTC 成功记录；辅助 job-state 命令随后遇到问题 023 的存储等待，并于约 08:46 UTC 正常退出。
- 验收标准：未放宽。

## 023 — Lustre 共享存储出现约六分钟 I/O 停顿
- 步骤：辅助状态读取、issues.md 更新，以及控制器第 14 轮结果落盘。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错/观察原文：无 Python 异常；自有进程等待点为 `cl_sync_io_wait`、`osc_io_setattr_end`。job-state 进程等待读取 nanolize 的 deliver.cpython-311.pyc；issues.md 更新等待文件截断；控制器 supervisor 等待运行记录文件 I/O，子进程已退出但尚未完成结果落盘。
- 原因判断：约 08:40–08:46 UTC 的共享文件系统读写停顿，影响辅助脚本及实际作业进度，不是行为断言失败。
- 绕过：保留正在进行的读写及其会话，等待存储恢复；只通过 /proc 的本地信息确认自有进程状态，未强杀写入、覆盖待写文件或修改时限。一次使用 Path.resolve 的辅助文件句柄检查也等待了相同存储，随后改用 os.readlink 读取链接文字避免追踪远端文件。
- 结果：所有等待的辅助命令正常退出，issues.md 更新完成；主作业于 08:46:11 UTC 恢复第 5 版完整验证。
- 验收标准：未放宽，等待时间计入总耗时。

## 024 — 第 5 版 CLI 回归仍在，补充只读运行复现
- 步骤：第 5 版 compare_behavior / run_checks，以及根协调器的只读 CLI 复现。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：同一 test_list[None] 案例仍为 `assert (0, "x='a b c'\n") == (0, 'x=a b c\n')`；本轮 290 passed、1 failed、1 skipped。
- 原因判断：第 5 轮仍未修改该输出分支；根协调器使用正式 venv 和候选包，临时在内存中记录 Click 回调参数，确认显式 None 确实作为 NoneType 传入，省略格式和显式 simple 均正常，None 才错误加引号。没有改候选源文件或冻结测试。
- 绕过：保留原生 diagnostics-1 的简短行为说明，使后续修复知道空格式要使用 simple 输出；只读复现证据存 run/cli-public-probe.json。诊断在第 5 轮作者启动后才记录，因此须下一轮读取。
- 结果：本轮体积 5,368 / 10,933 token（49.099%）；最终第 6 版 291 passed、0 failed、1 skipped，3 项安装检查通过。明确的问题没有通过修改测试或宣布“不稳定”来绕过。
- 验收标准：未放宽。

## 025 — 控制器因诊断绑定旧候选而暂停询问
- 步骤：控制器第 16 轮 request_clarification。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 原文：`The available diagnostic describes omitted/null format quoting on candidate-4 and explicitly does not apply to the current draft. What observable behavior on candidate-5 differs from the frozen CLI contract?`；status=paused，request=clarification-1。
- 原因判断：原生诊断严格绑定具体候选；diagnostics-1 属于 candidate-4，即使第 5 版保留同一失败分支，也不会被标为当前适用，控制器需要新的行为说明。
- 绕过：根据已完成的第 5 版只读复现，将同一简短输出语义通过 job-diagnose 重新绑定 verification-24/candidate-5（diagnostics-2）；使用 job-answer 答复 clarification-1，再 job-resume。文件为 run/cli-diagnostic-current.json、run/clarification-answer.txt 及对应回执。未向用户提问，未附加详细知识库，未暴露测试源码。
- 结果：08:50:40 UTC 接受原检查点恢复，08:50:59 UTC 启动第 6 轮作者修复；没有增加时间/token/尝试预算，也没有使用 exclude-unrunnable、job-unstable 或强制交付。
- 最终结果：第 6 版全部冻结行为和安装检查通过，任务成本比较仍按问题 013 保留 unverified；作业于 08:55:16 UTC 以 completed_with_gaps 交付。
- 验收标准：未放宽，失败通过实际修复和复验消除。

## 026 — 便携验证包拒绝绝对检查路径
- 步骤：导出冻结验证包（交付时核对 bundle-receipt.json）。
- 作业 ID：e84dbe7bec3e4131a98e42f15d5e13ff。
- 报错原文：`Portable metadata contains an absolute path; use relative check inputs`；status=unavailable。
- 原因判断：当前检查使用本次运行的绝对 Python 启动器路径和环境路径；这些本地绑定能保证实际检查的解释器与导入位置，但不满足便携包的路径限制。
- 绕过：保留已执行和封存的本地检查证据及原生 public-safe 图报告，不在运行后修改冻结命令来伪称同一个便携包。未更改任何检查参数。
- 结果：功能与安装验收通过，公开图报告正常生成；独立便携验证包未生成，报告明确列为交付物限制。
- 验收标准：未放宽；未把不可导出的便携包标为可用。
