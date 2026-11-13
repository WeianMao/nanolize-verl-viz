# Tomli graph-contract 运行问题记录

## I01 — 安装源码：HTTPS 克隆缺少认证
- 步骤：安装 WeianMao/nanolize 的 claude/graph-contract 分支。
- 作业 ID：尚未创建。
- 报错原文：`fatal: could not read Username for 'https://github.com': No such device or address`
- 原因判断：此环境的 HTTPS Git 没有可用凭证，仓库需要认证。
- 绕过：改用已配置的 GitHub SSH 凭据克隆同一分支；未修改代码或验收标准。
- 结果：成功，分支提交 eb54c4328809d3e37b83301d8a934e520aa84234。

## I02 — 依赖安装：附加包索引 DNS 失败
- 步骤：pip 安装分支源码与 pytest。
- 作业 ID：尚未创建。
- 报错原文：`Failed to establish a new connection: [Errno -2] Name or service not known`，目标 `pypi.ngc.nvidia.com`。
- 原因判断：环境默认附加 NVIDIA 包索引无法解析，每个包重复重试；PyPI 正常。
- 绕过：终止本次 pip，使用 `PIP_CONFIG_FILE=/dev/null PIP_EXTRA_INDEX_URL=''`，仅从 https://pypi.org/simple 安装。未修改依赖要求或验收标准。
- 结果：成功安装 nanolize 0.8.0（分支 editable 安装）及测试依赖。

## I03 — 旧清单：类型标记不是生产源码
- 步骤：contract-propose 清单规范化。
- 作业 ID：尚未创建。
- 报错原文：`ValueError: Capability path matches no production source: src/tomli/py.typed`
- 原因判断：py.typed 是空的 PEP 561 标记文件，不能放入生产源码路径映射。
- 绕过：从 typing 节点的 paths 删除该标记，仅映射 _types.py；在对应 interface 保留包必须带 py.typed 的要求，启动时原样 carry 标记。旧清单生成脚本 run/prepare_manifest.py 已更新。
- 结果：重新转换成功，输出文件此前未创建。未放宽功能或检查。

## I04 — 执行器选择：后台环境无法发现 Slurm 控制器
- 步骤：作业准备阶段，默认 auto 检查执行器探测。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9
- 报错原文：
```
Scheduler command failed: sinfo: sinfo: error: resolve_ctls_from_dns_srv: res_nsearch error: Unknown host
sinfo: error: fetch_config: DNS SRV lookup failed
sinfo: error: _establish_config_source: failed to fetch config
sinfo: fatal: Could not establish a configuration source
```
- 原因判断：交互 shell 的 sinfo 正常，后台作业的环境过滤后缺少 Slurm 配置来源，DNS SRV 查询失败。
- 绕过：使用 nanolize 默认 auto 自带的本机回退；未修改源码、检查、预算或验收要求。原版与候选都在同一本机环境运行。
- 结果：成功进入 controller 冻结流程。

## I05 — 报告发布：Sites 服务未启用
- 步骤：检查公开报告网站的发布通道。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9（作业仍正常运行）。
- 报错原文：`SitesConnectorError: Sites is not yet enabled for this workspace.`；`error_code: NOT_FOUND`, `type: sites_access_disabled`, `code: 404`。
- 原因判断：当前账号工作区没有 Sites 服务权限。
- 绕过：改用其他公开静态托管通道，仅发布汇总报告与经过路径脱敏的问题记录。
- 结果：本次报告改用既有 GitHub Pages 仓库的独立路径 tomli-graph-contract-fc9bf606/ 发布；公开访问状态另由运行目录的 publish-verification.json 保存。压缩验收不受影响。

## I06 — 报告发布：GitHub 连接器搜索超时
- 步骤：寻找可用报告托管仓库。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：`ReadTimeout:`，`error_code: UNKNOWN`。
- 原因判断：GitHub 连接器仓库搜索请求超时。
- 绕过：直接读取 GitHub 公共仓库元数据以寻找现有报告仓库；不读取凭据或发布原版代码。
- 结果：找到 WeianMao/nanolize-verl-viz 的既有 GitHub Pages 站点；本地 SSH 克隆和 dry-run 推送通过。

## I07 — 辅助监控：扫描到正在清理的临时目录
- 步骤：读取测试设计器运行结果（辅助监控脚本）。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：`FileNotFoundError: [Errno 2] No such file or directory: 'run/state/jobs/jobs/fc9bf606822f4ace8cf4c229518838d9/design/round-1/packaging/workspace/.git'`
- 原因判断：递归 glob 遍历了设计器工作副本，与设计器正常清理副本发生竞争；nanolize 作业未报错。
- 绕过：监控改用固定深度路径 `design/round-*/*/runner/run.json`，不遍历 workspace；未修改 nanolize 或验收标准。
- 结果：可继续读取设计结果，主作业正常运行。

## I08 — 设计器在无 Git 元数据的工作副本中查询 Git 状态
- 步骤：测试设计 round-1/packaging。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：
```text
fatal: not a git repository (or any parent up to mount point <工作区用户目录>/weian/project/graph-contract-runs/iso)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```
- 原因判断：设计器临时源码副本不提供可用 Git 仓库，git status 属于辅助查询。
- 绕过：设计器继续通过结构化 tests 输出提交测试，不依赖 Git 状态；无文件或参数变更。
- 结果：设计器正常完成；打包检查通过审阅并在原版与最终候选中通过。

### I08 再次发生 — 任务设计器的 Git 状态查询
- 步骤：task-effort/examiner（2026-11-13）；作业 ID 同上。
- 报错原文：
```text
fatal: not a git repository (or any parent up to mount point <工作区用户目录>/weian/project/graph-contract-runs/iso)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```
- 原因与绕过：与 I08 相同，任务设计的普通源码副本没有 Git 元数据；完成源码阅读后继续输出任务契约，无需 Git 状态，未改代码或验收。
- 结果：任务设计器 completed，耗时 546.1 秒，已进入原版任务成本测量。
- 同会话另一条 `rg --files -g AGENTS.md ...` 返回 1 且无输出，表示没有匹配文件，属于正常诊断查询而非项目错误。


### I08 再次发生 — 原版任务求解者查询 Git 状态
- 步骤：task-effort/original/development/modify/0；作业 ID 同上。
- 报错原文：
```text
fatal: not a git repository (or any parent up to mount point /lustre)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```
- 原因与绕过：任务源码副本没有 Git 元数据，求解者继续用文件比较与行为检查记录修改；未改变验收。
- 结果：完成修改及本地测试；任务最终未验证的原因见 I16。

## I09 — 模糊测试设计器探测错误输入类型
- 步骤：测试设计 round-1/fuzz。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：
```text
INFO: Instrumenting tomli_w
INFO: Instrumenting tomli_w._writer
INFO: Instrumenting __future__
INFO: Instrumenting datetime
INFO: Instrumenting tomli
INFO: Instrumenting tomli._parser
INFO: Instrumenting tomli._re
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "<工作区用户目录>/weian/project/graph-contract-runs/iso/tomli/run/state/jobs/jobs/fc9bf606822f4ace8cf4c229518838d9/design/round-1/fuzz/workspace/fuzzer/fuzz.py", line 22, in test_one_input
    fdp = atheris.FuzzedDataProvider(input_bytes)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: __init__(): incompatible constructor arguments. The following argument types are supported:
    1. atheris.native.FuzzedDataProvider(arg0: bytes)

Invoked with: 'x'
None
None
```
- 原因判断：这是刻意以 str 调用要求 bytes 的 Atheris 接口的负例探测，TypeError 是原版行为，不是作业失败。
- 绕过：保留 bytes 输入契约及非法输入的异常行为；没有绕过、关闭或放宽断言。
- 结果：设计器正常完成并提出两个测试文件。

## I10 — 基准测试设计器试探导入时未设置源码路径
- 步骤：测试设计 round-1/benchmark。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：
```text
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "<工作区用户目录>/weian/project/graph-contract-runs/iso/tomli/run/state/jobs/jobs/fc9bf606822f4ace8cf4c229518838d9/design/round-1/benchmark/workspace/benchmark/run.py", line 12, in <module>
    import tomli
ModuleNotFoundError: No module named 'tomli'
```
- 原因判断：仓库使用 src 布局且未安装目标包，试探命令未传 PYTHONPATH=src。
- 绕过：正式冻结检查沿用 run/check-validation.json 中已配置的 PYTHONPATH=src；不额外安装或影射原版包。
- 结果：设计器正常完成；基准测试检查通过审阅，并捕获 I18 回归；修复后 9 个用例通过。

## I11 — 辅助源码定位：查询了不存在的模块路径
- 步骤：阅读 nanolize 的服务、费用和报告实现（辅助定位）。
- 作业 ID：创建前与 fc9bf606822f4ace8cf4c229518838d9 运行期间；均未影响主作业。
- 报错原文：`rg: nanolize/src/nanolize/review_service.py: IO error for operation on nanolize/src/nanolize/review_service.py: No such file or directory (os error 2)`；`sed: can't read nanolize/src/nanolize/execution_service.py: No such file or directory`；`rg: nanolize/src/nanolize/*cost*: No such file or directory (os error 2)`；`rg: nanolize/src/nanolize/reporting.py: No such file or directory (os error 2)`；`rg: nanolize/src/nanolize/functional_report.py: No such file or directory (os error 2)`。
- 原因判断：辅助查询时猜测的模块名不符合当前分支的文件布局。
- 绕过：通过实际文件清单和符号搜索，定位 execution_server.py、execution.py、code_quality.py 与 job_tools/deliver.py。未修改任何代码、作业参数或验收标准。
- 结果：完成所需源码阅读，主作业继续正常运行。

### I11 再次发生 — 汇总阶段辅助模块定位
- 步骤：只读定位验证包导出逻辑；作业 ID 同上。
- 报错原文：`rg: nanolize/src/nanolize/bundle.py: No such file or directory (os error 2)`；`ImportError: cannot import name 'scoped' from 'nanolize'`；另一次辅助查询 `nanolize/src/nanolize/review_server.py` 也不存在（实际为 public_review.py）。
- 原因与绕过：辅助分析猜测了错误文件名和内部别名；阅读 verification_bundle.py 的实际导入，改用 capability_verification 模块。未修改 nanolize 或冻结作业。
- 结果：成功定位 I19 的绝对路径字段。

## I12 — 测试设计审阅否决：fuzz
- 步骤：冻结阶段，对 tests/nanolize_contracts/fuzz/test_fuzz_callback.py 做独立审阅。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/否决原文：
```text
reviewer_veto
Would pass if the callback constructed FuzzedDataProvider and immediately returned, skipping parsing, serialization, normalization, and round-trip comparison entirely.
```
- 原因判断：回调即使只创建 FuzzedDataProvider 后直接返回，也会通过所提断言；无法保护解析与往返比较。
- 绕过：维持 reviewer_veto，不把无效提案加入冻结检查；按默认非 strict 策略继续剩余流程，未修改任何验收断言。
- 结果：fuzz 节点保留另一项通过审阅的 normalize 测试；回调主体没有因此获得完整验证结论。

## I13 — 测试设计审阅否决：profile
- 步骤：冻结阶段，对 tests/nanolize_contracts/profile/test_profile_workload.py 做独立审阅。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/否决原文：
```text
reviewer_veto
Counts every profiled function named loads, regardless of its module or identity. An unrelated loads function called 1000 times could satisfy the assertion without invoking the TOML parser.
```
- 原因判断：仅按函数名 loads 统计调用次数，无法证明调用的是 Tomli 解析器。
- 绕过：维持 reviewer_veto，不把无效提案加入冻结检查；按默认非 strict 策略继续剩余流程，未修改任何验收断言。
- 结果：profile 节点保留为未验证；其功能接口和全选范围仍保留，未关闭检查或改 strict 默认值。

## I14 — 补测后原版检查的来源记账降级
- 步骤：合并设计测试后重新捕获基线与叶节点覆盖。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/诊断原文：`role_not_proven`；`check_role_mismatch`；`referenced_files_changed`；`The original role lacks byte-identical files at provenance_ref, or runs inline program text.`
- 原因判断：旧清单三个 pytest 检查都声明 `inputs: ["tests"]`；设计器向 tests/nanolize_contracts 添加三个文件后，来源审计把这些新增输入视为 original 检查的 referenced_files_changed，同时把新测试导入的节点归到原版检查。原版测试本身未改变：独立逐文件核对 979 个原版测试/数据文件，差异 0 个。
- 绕过：没有修改已封存契约或强制改写来源结论。继续执行全部七项冻结检查，保留默认非 strict 策略及来源警告；报告单列“检查运行通过”和“有效测试来源证明不足”。后续清单应把原版测试文件、辅助文件和 data 目录列为精确 inputs，避免纳入新增测试目录。
- 结果：原版七项基线均通过；当前 leaf_coverage 缺口为 api、parse、profile 共三个外部叶节点；scalars、typing 为内部节点，按外部调用验证规则统计。无检查被关闭或断言放宽。

## I15 — 自定义内联输出检查被标为 original
- 步骤：输出对比检查的来源审计。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/诊断原文：`check_role_mismatch`；`provenance: unknown`；`provenance_reasons: ["inline_program", "no_referenced_files"]`。
- 原因判断：本次写入旧清单的 public-output-contract 是内联 Python 输出契约，清单将其 role 标为 original，但它不是仓库原有测试文件。
- 绕过：保留该检查及冻结输出对比，不将来源 unknown 伪报为 original 已证明；不改动已封存清单。后续清单应给自定义输出契约使用 contract 角色。
- 结果：该输出对比基线通过并继续作为候选验收检查，但不能贡献有效叶测试来源证明。

## I16 — 原版任务成本基线缺少验收程序
- 步骤：task-effort/original/development/modify/0。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/诊断原文：`task_environment_unavailable`；solver `status: blocked`, `blocker: data`；`Required acceptance could not run because accept.py is absent.`
- 原因判断：生成的修改任务要求求解者运行未交付到其工作区的 accept.py；求解者完成代码修改及本地回归，但无法完成被要求的独立验收，故原版任务基线未成立。
- 绕过：保持任务测量结果 unverified，不伪造成功、不关闭 task-effort；默认 controller 继续独立重写与全部行为/安装验收。未修改 nanolize、冻结任务或验收标准。
- 结果：prepare_tasks 返回 unverified、tasks=0；开始作者 run_agent。最终不宣称任务成本改善。

## I17 — 原版任务沙箱内安装构建依赖失败
- 步骤：任务求解者运行 `.venv/bin/python -m pip install --no-cache-dir -e .`。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文（末段）：
```text
Looking in indexes: https://pypi.org/simple, https://pypi.ngc.nvidia.com
Obtaining file://<工作区用户目录>/.cache/nanolize/task-workspaces/tmp8b4t984u/workspace
  Installing build dependencies: started
  Installing build dependencies: finished with status 'error'
  error: subprocess-exited-with-error
  
  × pip subprocess to install build dependencies did not run successfully.
  │ exit code: 1
  ╰─> [13 lines of output]
      Looking in indexes: https://pypi.org/simple, https://pypi.ngc.nvidia.com, https://pypi.ngc.nvidia.com
      WARNING: Retrying (Retry(total=4, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e09778f6870>: Failed to establish a new connection: [Errno -2] Name or service not known')': /simple/flit-core/
      WARNING: Retrying (Retry(total=3, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e097733fb90>: Failed to establish a new connection: [Errno -2] Name or service not known')': /simple/flit-core/
      WARNING: Retrying (Retry(total=2, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e097733ff20>: Failed to establish a new connection: [Errno -2] Name or service not known')': /simple/flit-core/
      WARNING: Retrying (Retry(total=1, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e097733ff80>: Failed to establish a new connection: [Errno -2] Name or service not known')': /simple/flit-core/
      WARNING: Retrying (Retry(total=0, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364380>: Failed to establish a new connection: [Errno -2] Name or service not known')': /simple/flit-core/
      WARNING: Retrying (Retry(total=4, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364500>: Failed to establish a new connection: [Errno -2] Name or service not known')': /flit-core/
      WARNING: Retrying (Retry(total=3, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364890>: Failed to establish a new connection: [Errno -2] Name or service not known')': /flit-core/
      WARNING: Retrying (Retry(total=2, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364aa0>: Failed to establish a new connection: [Errno -2] Name or service not known')': /flit-core/
      WARNING: Retrying (Retry(total=1, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364cb0>: Failed to establish a new connection: [Errno -2] Name or service not known')': /flit-core/
      WARNING: Retrying (Retry(total=0, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x7e0977364ec0>: Failed to establish a new connection: [Errno -2] Name or service not known')': /flit-core/
      ERROR: Could not find a version that satisfies the requirement flit_core<5,>=3.12 (from versions: none)
      ERROR: No matching distribution found for flit_core<5,>=3.12
      [end of output]
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
error: subprocess-exited-with-error

× pip subprocess to install build dependencies did not run successfully.
│ exit code: 1
╰─> See above for output.

note: This error originates from a subprocess, and is likely not a problem with pip.
```
- 原因判断：独立任务沙箱无法从网络获取 Flit 构建依赖（包含环境附带的包索引），已有目标源码并未缺失。
- 绕过：求解者用其工作区 `.venv` 并设置 `PYTHONPATH=src` 运行原有 unittest 和自检；未替换为系统已安装的 Tomli，未跳过行为断言。正式交付的安装检查仍保留。
- 结果：本地回归与样例探测通过，但由于 I16，完整任务验收仍为 blocked/unverified。

## I18 — 首轮候选的基准测试输出回归
- 步骤：candidate-1 / attempt 1 的完整行为比较，检查 contract-benchmark-fc9bf6-1。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：
```text
E       AssertionError: assert ['Parsing ben...------------'] == ['Parsing dat...------------']
E         
E         At index 0 diff: 'Parsing benchmark/data.toml 1 times' != 'Parsing data.toml 1 times:'
E         Use -v to get more diff
FAILED tests/nanolize_contracts/benchmark/test_benchmark_public.py::test_run_reports_all_parsers_in_order
1 failed, 8 passed in 0.57s
```
- 原因判断：候选 benchmark/run.py 改变了固定输出标题，把 `Parsing data.toml 1 times:` 写成 `Parsing benchmark/data.toml 1 times`，还可能有表头排版差异。其他六项检查通过，包括原版解析数据的 744 个子测试。
- 绕过：由 controller 调用独立作者修复 benchmark 外部输出契约，然后重新跑完整检查；保留原有断言，不改测试。
- 结果：第二轮候选 fb2299a21e83b5df7ebfa6cc05e67b7794cafe80 修复 benchmark/run.py 的固定标题及表头排版；7 项冻结行为检查全通过（35 个 pytest 用例、744 个数据子测试、1 个原有条件跳过，另加内联输出对比），2 项独立安装检查通过。体积 6192 / 14587 tokens（42.45%）。默认失败节点源码参考机制向修复作者提供了原版 benchmark/run.py；未修改测试或验收标准。

## I19 — 可移植验证包导出拒绝绝对路径
- 步骤：冻结基线的验证包导出；交付时核查 bundle-receipt.json。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错原文：`Portable metadata contains an absolute path; use relative check inputs`；`status: unavailable`。
- 原因判断：只读复查确认 portable manifest 正常；绝对路径出现在 `validity.policy.test_template.argv[0]`，值为本次 venv 的绝对 Python 路径。导出器转换主检查 argv，却将 validity 策略原样复制进 portable 元数据，随后被其隐私防护拒绝。
- 绕过：保留导出器拒绝结果，不删除审计字段、不修改冻结策略、不关闭路径防护。用已生成的本地交付源码和完整本地验证记录交付；公开网站只发布脱敏汇总，明确没有可移植验证包。未修改 nanolize 代码。
- 结果：作业正常到达 completed_with_gaps，源码导出到 tomli-nanolized-20261113-081043；7 项行为检查和 2 项安装检查通过，portable verification bundle 仍 unavailable。

## I20 — 收尾停止审阅服务时已不可用
- 步骤：终态交付之后，调用 `nanolize review-stop 74a2b407cceb40f882a187943dc0c858 --state-root run/state --json`。
- 作业 ID：fc9bf606822f4ace8cf4c229518838d9。
- 报错/返回原文：`status: unavailable`，命令退出码 1。
- 原因判断：随后直接连接原 loopback 审阅端口 41199 返回 ECONNREFUSED（111），该服务已不在监听。终态作业与交付文件仍完整。
- 绕过：确认端口关闭后不重启服务，也不终止其他进程；未修改文件、参数、源码或验收标准。
- 结果：没有需要继续停止的审阅监听端口；最终交付和静态报告发布不受影响。
