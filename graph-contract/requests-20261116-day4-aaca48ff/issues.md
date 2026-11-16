# Requests 问题记录与分类

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 7 项。

### #5 .ai 二进制资源识别漏项阻碍完整计量

PDF 格式的 .ai Logo 被归为文本配置，严格解码失败使体积测量 complete=false；二进制资源识别需补齐 .ai。将两个 Logo 原样携带后完整计量恢复，两端相同资源均排除于重写体积。

代码位置：`src/nanolize/code_size.py:38,96,279–296`。

### #8 暂停文案遗漏首个 checkpoint 前不能停的条件

hold_execution_job／job-hold 文案承诺在当前 step 后暂停，却未说明首个 checkpoint 前仍会继续冻结或测试设计子步骤。需要补齐工具说明与状态提示中的暂停边界。

代码位置：`src/nanolize/mcp_server.py:1184；src/nanolize/execution_server.py:950；src/nanolize/job_runner.py:161–177`。

### #14 迁移队列按叶截断，后续轮次无法处理尾部

design_leaf_tests 在设计开始前以每叶 MAX_MIGRATIONS=40 截断迁移队列，238 条中只分配 156 条，另 82 条始终未进入设计器。后续轮次只处理截断后的集合，需要按剩余队列分批补齐。

代码位置：`src/nanolize/leaf_test_design.py:136,323,328–338`。

### #15 无法验证的公开行为被结算为 excluded

自动迁移因工具设计约束无法验证部分公开 HTTP 行为，却将其结算为 excluded；提示词只允许排除仅涉及内部状态、没有公开行为的测试，结算代码仅核验编号和非空理由。应复核排除语义，将当前约束下无法验证的项目留为 unverified；账本中 47 条“有理由排除”不代表每条均已证明不涉及公开行为。

代码位置：`src/nanolize/prompts/prompts.json:720；src/nanolize/leaf_test_design.py:479–482；src/nanolize/execution.py:3731–3738`。

### #16 复核退回后，已有接受文件的叶不补迁移缺口

复核后的补轮条件只检查该叶是否没有任何接受文件，遗漏仍待迁移的义务；Cookie 迁移提案被否决后，因另有 2 个接受文件，8 条迁移留为 unverified。需要把待迁移缺口纳入复核后的补轮条件，正常提案拒绝本身不另计为 bug。

代码位置：`src/nanolize/leaf_test_design.py:549–552`。

### #18 迁移汇总事件混用分母

事件以“156 条已分配”引出 23 迁移、47 排除、168 未验证，后三项实际属于全量 238 条，账本数据未丢失。应分别报告全量 238＝23＋47＋168、已分配 156＝23＋47＋86，以及未分配 82 条。

代码位置：`src/nanolize/execution.py:3682–3683,3733–3748`。

### #19 可移植验证包漏处理旧检查路径

验证包导出只便携化活动 checks，遗漏 original_checks 中的绝对解释器路径，导致路径保护拒绝导出，状态为 unavailable。需要补齐旧检查元数据的便携化或私有承诺处理，并保留路径保护。

代码位置：`src/nanolize/verification_bundle.py:371,377–395`。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

### #11 测试事实的正常校验结果

write_test_facts 接受 103 条事实、拒绝 4 条候选事实：3 条包含不允许的真实 CR 控制字符，另 1 条描述不属于所列能力的测试服务器 helper。3 个原测试没有接受事实，但原 pytest 检查仍保留，候选事实拒绝数不等于原测试失败数。

代码位置：`src/nanolize/knowledge.py:239–243`。

### #12 保守静态恢复造成迁移量增加

恢复规则将文件顶层执行语句纳入每个测试的依赖，主测试文件 237 个函数全部进入迁移，其中 233 个列出的唯一名称为 requests.pyopenssl。可补强可审阅的可选探测分析，但不能直接删除顶层操作或认定这些函数均可安全恢复。

代码位置：`src/nanolize/recovered_tests.py:419–421；docs/graph-rewrite.md:1095–1102`。

### #21 中间候选差异被既有检查发现并修复

第一版候选在诊断输出、文档配置输出和 None URL 异常类型上出现三组冻结行为差异，29/32 检查组通过。修复后的第二版在同一冻结标准下 32/32 通过，属于既有候选生成与修复流程的结果。

### #23 默认输出策略伴随定义文档字符串覆盖下降

公开定义 docstring 覆盖从 183/225（81.3%）降至 0/208（0%）；源码＋配置保留 38.15%，剔除 Python 注释与 docstring 后保留 57.33%。默认 minimal_explanation 策略鼓励省略 docstring，这两个体积口径共同呈现其代价。

代码位置：`src/nanolize/prompts/prompts.json:881–882`。

### 现象-1 叶覆盖有效不等于每叶都有动态故障注入证据

documentation、packaging 无可 knockout 的自身函数，按既定叶覆盖规则仍为 valid，并有实际执行的输出检查。12/12 叶节点有效不代表每叶均有动态故障注入证明。

代码位置：`src/nanolize/leaf_test_validity.py:326–329,399–408`。
