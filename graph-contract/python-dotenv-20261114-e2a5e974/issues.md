# nanolize 分支缺陷记录

仅记录需要修改 claude/graph-contract-field-fixes @ 9413138 的代码缺陷。沿用原记录编号；其余 11 条记录移至 observations.md。两项均已通过源码和本次持久化输入复核，本次没有修改 nanolize 源码。

## 008 — 位置过滤器未识别弯引号，误拒合法 Windows 字符串值

- 出错步骤：write_test_facts 对 test_set_key_round_trips 的事实静态校验。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`invalid_facts` / `fact contains an absolute location`；被拒陈述包括测试字面量 `C:\Users`、`C:\Users\` 以及普通反斜杠、引号转义值。
- 原因判断：有效 round-trip 事实用 Unicode 弯引号引用带尾随反斜杠的裸目录值 `“C:\Users\”`；事实位置过滤器把闭引号 `”` 当成 Windows 用户目录下的路径字符，误判为绝对位置。裸 `C:\Users`、`C:\Users\` 及 ASCII 引号形式不会触发本例误判；这些是原测试数据，并非本机路径。
- 绕过：采用工具原生第二轮改写事实，原始测试数据和断言保持不变；不关闭位置过滤、不手动注入被拒文本。
- 结果：第二轮生成替代表述并通过，最终 uncovered_tests=[]；原测试将在冻结检查中继续执行。
- 验收标准：未放宽。
- 分支缺陷复核：在原提交 9413138 上对第一轮原始 statement 调用 local_location，命中片段为 `C:\Users\”,`；仅将弯引号替换成 ASCII 双引号后结果为 None。错误来自过滤器的文本边界识别，而非正常事实审阅或防默写退回。
- 需要修改的位置：src/nanolize/knowledge.py 中 _PART / _REST 与 _WINDOWS 的边界处理；应允许带弯引号的裸目录测试值，同时继续拒绝真实用户目录，并补充该边界的回归测试。
- 本次代码处理：未修改 nanolize；运行中以事实文字改写绕过，代码缺陷仍待修复。

## 010 — 任务套件缺少必需输入仍通过校验并被封存

- 出错步骤：task_effort_original 的 modify/development 第 0 次独立验收。
- 作业 ID：e2a5e9741aa543f984ba5f5f1380a1ab。
- 报错原文：`Exit 1: required .task-effort/inputs/editor_development.env was missing. Behavioral and regression assertions were not reached.`；judge.status=blocked、blocker=data；baseline.status=unverified、ready=false。
- 原因判断：任务设计者的最终 JSON、持久化 suite.json 均只声明了 path=`unused`、content 为 U+001E 加 `will never be used` 的占位 fixture，而公开任务及隐藏验收均依赖 editor_development.env（heldout 同样依赖未提供的 editor_heldout.env）。已核对原始 agent_message：占位内容来自设计者的最终输出，并非工具落盘时丢失文件。工具的套件校验没有在冻结前发现这项不一致。
- 进一步定位：examiner/stdout.ndjson 第 46 个事件中的中间设计 JSON 实际含有 editor_development.env（110 字符）和 editor_heldout.env（124 字符），但最终结构化回答把两者都替换成 unused 占位项；中间设计文件随后被设计者自行清理。原始回执足以复现最终回答与中间设计的差异，但最终内容为何改变仍未知。核对确定的问题仅为 nanolize 的套件完整性校验缺口：必需输入未提供，套件仍被接受并封存。
- 绕过：保留已冻结套件、真实 blocked 回执和未验证状态，采用原生流程继续功能压缩；不事后补造 fixture、修改隐藏验收、关闭任务评估或把缺口计为通过。此时任务已封存且作者已启动，重写冻结输入会破坏比较的绑定。
- 结果：02:13:10 UTC 记录独立任务评估结束，02:13:12 UTC 进入第 1 次作者重写；修改任务成本比较仍未验证，不能据此声称后续修改成本下降。
- 与昨天的关系：昨天 013 的“要求求解者运行不可见 accept.py”没有复发；本次是新出现的“任务所需输入根本未提供”，两者都造成任务成本证据缺口。
- 验收标准：没有手动放宽；任务成本门槛的默认未验证处理使作业继续，最终报告必须明确保留这一缺口。
- 分支缺陷复核：原提交 9413138 的 validate_suite(..., designed=True) 仍接受持久化的缺失输入套件。effort_schema.py:289 只校验 fixture 字段、路径等约束，没有检查必需输入是否齐备；effort.py:1603 随后将其封存并进入原版评估。
- 需要修改的位置：任务设计验证与封存流程，应在绑定前验证公开任务和验收所需输入的可用性，并将这种缺失返回为可纠正的任务设计错误。可以使用显式输入依赖及输入就绪检查；不应靠关闭验收或把 blocked 计为通过。
- 归类依据：设计者漏交 fixture 是触发因素；此处记录的分支 bug 是不完整套件通过验证与封存的防护缺口，不把一般模型输出失败或默认 completed_with_gaps 状态另列为 bug。
- 本次代码处理：未修改 nanolize；保留已冻结证据，修改成本仍为未验证。
