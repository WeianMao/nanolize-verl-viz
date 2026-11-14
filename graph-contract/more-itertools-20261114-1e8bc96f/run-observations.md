# 运行中观察到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。经核对保留 11 条原编号记录，另保留防默写检查结果；这些现象本身不作为 nanolize 代码 bug 的证据。

防默写：比较1602条有效代码行，函数体整体重合19%，低于auto整体40%启用门槛。side_effect 11行匹配73%，time_limited.__next__ 8行匹配75%，未因局部高重合触发退回。11次保存均成功，0文件/0次退回；这不等于零代码重合。

## Q01 — recipes 首轮事实摘要有两条过度概括

- 步骤：原版测试事实生成与独立复核；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 诊断原文（fact 18）：`The general equality guarantee is incorrect: random_derangement deranges input positions, so repeated values can still equal the original value at the same position. For example, input 'aa' returns ('a', 'a'). The stated results for distinct letters are confirmed.`
- 诊断原文（fact 21）：`The output-length claim needs a nonempty-kernel restriction. With signal [1, 2] and an empty kernel, the original yields two zeros, whereas m + k - 1 is one. The listed numeric examples and other assertions are accurate.`
- 判断原因：事实生成模型把针对特定输入的测试推广为一般保证，独立复核正确拒绝。
- 绕过：由默认事实复核流程拒绝不成立的事实，未人工改清单、代码或测试；完整原版检查不变。
- 结果：首轮40条中38条通过、2条拒绝，另有6项测试未被摘要覆盖；第二轮生成2条并全部通过复核，第二轮 missing=0；未改变原检查。证据：`facts/original_recipes_5bfdec93/tests_test_recipes_py_aae619f9/1/review/runner/result.json`。

## Q02 — extended 首轮事实摘要有错误和缺漏

- 步骤：原版测试事实生成与独立复核；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 诊断原文（fact 4）：`The final claim says infinite true input returns 'a-f'; exactly_n returns False for finite nonnegative n, not that value.`
- 诊断原文（fact 20）：`It claims to enumerate subfactorials for n=0 through 23 but supplies only the first 20 values followed by an undefined underscore placeholder.`
- 判断原因：事实生成模型输出了错误返回值描述及不完整数值序列；40条输入的首轮复核只返回39项 verdict，并列出51项摘要缺漏。
- 绕过：沿用默认复核/补充轮次，拒绝不可靠事实；没有改源码、检查、清单或预算。
- 后续诊断：第二轮也只返回39/40条判决，遗漏的索引两轮均为39；第二轮明确拒绝原文为 `The claimed error-message substring “maximum count must be greater than or” is incorrect; the source says “maximum count must be greater than zero”.` 和 `The claimed subfactorial list for indices 0 through 23 is incomplete and ends with 895014, whereas the value at index 20 is 895014631192902121.`。
- 核查：两轮 reviewer/prompt.txt 均包含完整40条事实（最后一条与作者原始输出一致），漏判并非输入丢失；截断式句子已经存在于模型原始 `write/runner/result.json` 中，长度1496至1500字符；不是读取或展示日志时截断。每文件40条、每条1500字符的输出约束下，模型压入过多信息，留下残句。`leaf_test_design._review_facts` 要求每条事实恰有一项判决，否则整轮按 `review_incomplete` 拒绝。
- 结果：两轮原始判决各37项赞成、2项明确拒绝、1项遗漏，但两轮均不完整，因此80条全部被框架丢弃，没有任何 extended 事实进入作者合同；全作业最终40条 recipes 事实接受、82条候选事实丢弃、617项 extended 测试未被事实摘要覆盖。原版检查仍全部保留，默认流程继续捕获基线；没有通过接受未复核事实来放宽规则。证据：`test-facts.json` 及两轮 `facts/original_extended_f66825eb/tests_test_more_py_49d53991/*/review/runner/result.json`。

## Q03 — 设计测试草案残留 diff 前缀

- 步骤：extended 第一轮测试设计；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`SyntaxError: invalid syntax`，第17行开头为 `+    assert mi.nth_permutation(...)`。
- 判断原因：模型提交的 `tests/nanolize_contracts/extended/test_combinations_and_transforms.py` 内容保留了补丁格式的 `+` 行前缀，不能作为 Python 源码解析。
- 绕过：保持设计验证开启，交由框架的静态拒绝及后续轮次处理；没有手工改动已冻结检查或降低语法/行为要求。
- 结果：第一轮共提交4个文件；该文件静态解析失败，其余3个文件共16个测试函数，正式设计结果接受其余3个文件、拒绝该文件，拒绝原因 `does_not_parse` / `SyntaxError: invalid syntax (line 17)`；框架按有效节点已覆盖结束设计，没有手工删除检查。证据：`design/round-1/extended/runner/result.json`。

## A01 — 首个候选有42个原版用例失败及2项接口/文档失败

- 步骤：candidate-1 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 4, failures: 44`；原版 extended 的唯一测试ID计数为 `41 failed, 585 passed`，recipes 为 `1 failed, 144 passed`。pytest 自带子测试摘要的计数不同，不重复累加。
- 代表诊断：`AttributeError: module 'more_itertools' has no attribute 'raise_'`；文档检查 `File "<string>", line 15 ... AssertionError`；recipes `RunningWindowSizeTests::test_index_protocol` 返回的两个 Stats 对象序列不相等；extended 涉及切片生命周期、并发锁、统计值、负数/空输入、默认诊断等多处行为偏差。完整原文保存在 `run/candidate-1-failures.json` 及原始 `artifacts/verification-8.json`。
- 判断原因：首轮独立重写尚未实现完整原版可观察语义；导出缺 raise_，文档 README 预处理内容与冻结预期不一致；不能归为单一共同根因。
- 绕过：控制器先启动 extended 作者修复，使用冻结合同与失败反馈；默认 `on_failed_check` 源码参考策略可按失败节点提供参考。未改冻结检查、接口、预算或 nanolize 代码。
- 结果：首轮修复只修改 `more_itertools/more.py`、`more_itertools/more.pyi`，candidate-2 复验后失败项从44降至17，公开导出通过，仍须继续修复；本轮设计新增16例全部通过，隔离安装3/3通过，但没有把这两个局部结果当成功能验收通过。下列为全部42个失败的原版测试ID：
  - `tests.test_more.CallbackIterTests::test_abort`
  - `tests.test_more.CallbackIterTests::test_basic`
  - `tests.test_more.CallbackIterTests::test_partial_consumption`
  - `tests.test_more.CircularShiftsTests::test_empty`
  - `tests.test_more.CircularShiftsTests::test_steps_negative`
  - `tests.test_more.CircularShiftsTests::test_steps_positive`
  - `tests.test_more.DerangementsTests::test_repeated_values`
  - `tests.test_more.DifferenceTest::test_initial`
  - `tests.test_more.ExactlyNTests::test_false`
  - `tests.test_more.ExtractTests::test_basics`
  - `tests.test_more.ExtractTests::test_early_free`
  - `tests.test_more.ExtractTests::test_monotonic`
  - `tests.test_more.ExtractTests::test_negative_one_bug`
  - `tests.test_more.GrayProductTests::test_basic`
  - `tests.test_more.GrayProductTests::test_errors`
  - `tests.test_more.InterleaveEvenlyTests::test_three_iters`
  - `tests.test_more.IntersperseTest::test_not_iterable`
  - `tests.test_more.IsSortedTests::test_basic`
  - `tests.test_more.IsliceExtendedTests::test_elements_lifecycle`
  - `tests.test_more.IterateTests::test_func_controls_iteration_stop`
  - `tests.test_more.MinMaxTests::test_default`
  - `tests.test_more.OnlyTests::test_default_exception_message`
  - `tests.test_more.PartitionsTest::test_empty`
  - `tests.test_more.PeekableTests::test_class_getitem`
  - `tests.test_more.PeekableTests::test_slicing_negative_step_omitted_stop`
  - `tests.test_more.PeekableTests::test_slicing_negative_step_omitted_stop_read_bound`
  - `tests.test_more.PowersetOfSetsTests::test_hash_count`
  - `tests.test_more.ReplaceTests::test_window_size_large`
  - `tests.test_more.SampleTests::test_counts`
  - `tests.test_more.SampleTests::test_specific_sample`
  - `tests.test_more.SampleTests::test_unit_case`
  - `tests.test_more.SlicedTests::test_negative`
  - `tests.test_more.SpyTests::test_immutable`
  - `tests.test_more.TestConcurrentTee::test_concurrent_consumers`
  - `tests.test_more.TestRunningStats::test_datatypes`
  - `tests.test_more.TestRunningStats::test_single_example`
  - `tests.test_more.TestRunningStats::test_stat_properties`
  - `tests.test_more.TestSerialize::test_serialize_generator_methods_locking`
  - `tests.test_more.TestSubfactorial::test_vs_derangements`
  - `tests.test_more.TestSynchronized::test_concurrent_calls`
  - `tests.test_more.UnzipTests::test_improperly_zipped`
  - `tests.test_recipes.RunningWindowSizeTests::test_index_protocol`

- 时限补充：本分支默认 `candidate_timeouts` 使用 `ceil(3 × original_duration + 10)`（最大4小时）放大候选检查的运行窗口；冻结原版 extended 耗时27.1153秒，因此候选获92秒，本轮实际38.1612秒并正常返回断言失败。原声明30秒未编辑，recipes 默认候选窗口44秒。与昨天附加完整套件30→180秒的时限口径不同。

## A02 — 第二个候选仍有16个原版用例及文档输出失败

- 步骤：candidate-2 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 3, failures: 17`；extended `15 failed, 611 passed`，recipes `1 failed, 144 passed`；`ExactlyNTests::test_false - ValueError: Indices ...`、`CallbackIterTests::test_basic - AttributeError`，文档仍 `File "<string>", line 15 ... AssertionError`。完整原文见 `run/candidate-2-failures.json` 和 `artifacts/verification-12.json`。
- 判断原因：前轮修复消除了26个 extended 测试ID失败和公开导出失败，但仍存在迭代器生命周期、并发协议、统计值等行为差异；recipes、文档尚未得到专门修复，原有错误仍在。
- 绕过：控制器读取 recipes 和 documentation 的冻结合同，并在原候选基础上再次启动 extended 作者；保持已通过的公开导出及3组设计测试。未改检查、预算或 nanolize 代码。
- 结果：第二次 extended 修复只修改 `more_itertools/more.py`；candidate-3 完整复验失败项17→14，未完全解决；此次 extended 11.7771秒返回，未超时。全部16个失败原版测试ID如下：
  - `tests.test_more.CallbackIterTests::test_basic`
  - `tests.test_more.CallbackIterTests::test_partial_consumption`
  - `tests.test_more.ExactlyNTests::test_false`
  - `tests.test_more.IsliceExtendedTests::test_elements_lifecycle`
  - `tests.test_more.IterateTests::test_func_controls_iteration_stop`
  - `tests.test_more.OnlyTests::test_default_exception_message`
  - `tests.test_more.PowersetOfSetsTests::test_hash_count`
  - `tests.test_more.SampleTests::test_specific_sample`
  - `tests.test_more.SampleTests::test_unit_case`
  - `tests.test_more.SpyTests::test_immutable`
  - `tests.test_more.TestConcurrentTee::test_concurrent_consumers`
  - `tests.test_more.TestRunningStats::test_datatypes`
  - `tests.test_more.TestRunningStats::test_single_example`
  - `tests.test_more.TestRunningStats::test_stat_properties`
  - `tests.test_more.TestSerialize::test_serialize_generator_methods_locking`
  - `tests.test_recipes.RunningWindowSizeTests::test_index_protocol`

## A03 — 第三个候选剩余13个原版用例及文档输出失败

- 步骤：candidate-3 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 3, failures: 14`；extended `12 failed, 614 passed`，recipes `1 failed, 144 passed`；文档仍为 `File "<string>", line 15 ... AssertionError`。完整原文见 `run/candidate-3-failures.json`、`artifacts/verification-14.json`。
- 判断原因：第二次 extended 修复解决 exactly_n、iterate、only 的失败，但回调迭代器协议、对象生命周期、随机抽样及统计结果等仍不一致。recipes 和文档的原有错误尚未专门修复，不能称其修复失败。
- 绕过：控制器转向 recipes，依据冻结整数索引协议事实及默认允许的生产源码参考修复统计行为；修改范围限该节点及必要的共享依赖。没有改变冻结测试、时限、预算或验收规则。
- 结果：作者修改 `more_itertools/recipes.py`、`more_itertools/recipes.pyi`；candidate-4 的 recipes 全部通过，并消除 extended 的3个统计用例失败，剩余总失败14→10；公开导出及16个设计用例仍全部通过。剩余13个原版测试ID如下：
  - `tests.test_more.CallbackIterTests::test_basic`
  - `tests.test_more.CallbackIterTests::test_partial_consumption`
  - `tests.test_more.IsliceExtendedTests::test_elements_lifecycle`
  - `tests.test_more.PowersetOfSetsTests::test_hash_count`
  - `tests.test_more.SampleTests::test_specific_sample`
  - `tests.test_more.SampleTests::test_unit_case`
  - `tests.test_more.SpyTests::test_immutable`
  - `tests.test_more.TestConcurrentTee::test_concurrent_consumers`
  - `tests.test_more.TestRunningStats::test_datatypes`
  - `tests.test_more.TestRunningStats::test_single_example`
  - `tests.test_more.TestRunningStats::test_stat_properties`
  - `tests.test_more.TestSerialize::test_serialize_generator_methods_locking`
  - `tests.test_recipes.RunningWindowSizeTests::test_index_protocol`

## A04 — 第四个候选剩余9个原版用例及文档输出失败

- 步骤：candidate-4 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 2, failures: 10`；extended `9 failed, 617 passed`；文档仍为 `File "<string>", line 15 ... AssertionError`。完整原文见 `run/candidate-4-failures.json`、`artifacts/verification-16.json`。
- 判断原因：recipes 修复同时修好了统计相关扩展用例，但其余迭代器、抽样、并发及文档行为差异仍在。
- 绕过：交由默认控制器继续针对剩余失败修复；冻结检查、scope all、默认预算及验收标准保持不变。
- 结果：文档作者修改{'added': ['docs/index.rst'], 'modified': ['docs/conf.py', 'docs/toctree.rst', 'nanolize-report-mapping.json'], 'removed': []}；candidate-5 文档检查通过，总失败10→9；本候选 recipes 145例、公开导出、16个设计用例通过，未将局部通过记为全量通过。剩余9个原版测试ID如下：
  - `tests.test_more.CallbackIterTests::test_basic`
  - `tests.test_more.CallbackIterTests::test_partial_consumption`
  - `tests.test_more.IsliceExtendedTests::test_elements_lifecycle`
  - `tests.test_more.PowersetOfSetsTests::test_hash_count`
  - `tests.test_more.SampleTests::test_specific_sample`
  - `tests.test_more.SampleTests::test_unit_case`
  - `tests.test_more.SpyTests::test_immutable`
  - `tests.test_more.TestConcurrentTee::test_concurrent_consumers`
  - `tests.test_more.TestSerialize::test_serialize_generator_methods_locking`

## A05 — 第五个候选仅剩9个扩展工具用例失败

- 步骤：candidate-5 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 1, failures: 9, failed_capabilities: [extended]`；extended `9 failed, 617 passed`。失败测试ID与 A04 所列9项一致；完整原文见 `run/candidate-5-failures.json`、`artifacts/verification-18.json`。
- 判断原因：文档专门修复解决了 README 预处理差异，扩展工具的9个剩余用例未因文档改动改变；此结果没有新的回归用例。
- 绕过：由控制器继续修复唯一失败的 extended 节点，冻结检查和合同保持原样，不把剩余失败豁免为通过。
- 结果：下一次作者仅修改 `more_itertools/more.py` 的 callback 生命周期，candidate-6 全量复验仍为同样9项失败，无验收改善；其余6/7组功能检查继续通过。

## A06 — 第六个候选的9项失败没有减少

- 步骤：candidate-6 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 1, failures: 9`；失败ID仍为 A04 的9项。作者说明：`serialize.send() still needs a reviewed diagnostic identifying the wrapped input; its required behavior includes raising AttributeError when that input lacks .send().` 完整原文见 `run/candidate-6-failures.json`、`artifacts/verification-20.json`。
- 判断原因：作者修正 callback 的退出后启动/永久耗尽行为，但9项失败未减少；有限错误摘要未说明 serialize._iterator 的替换关系。默认 on_failed_check 源码参考仍可用，不能据此认定作者完全无法取得字段信息；已确认的字段追踪缺陷只在 N02 上报。
- 绕过：核查 verifier 原始记录后，通过官方 `job-diagnose` 对应 API 给出仅描述行为的 owner 诊断，详见 N02；没有给作者测试源码或测试文件路径，没有修改目标代码、合同、检查或验收状态。
- 结果：诊断 `diagnostics-1` 已登记；控制器当时已经开始 attempt-7，已启动的会话不保证收到本次补充，后续控制器及作者上下文会读取；candidate-8 修复字段后失败9→5，candidate-11 最终全部功能检查通过。

## A07 — 第七个候选仍有相同9项失败，诊断后下一轮才定向修复

- 步骤：candidate-7 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 1, failures: 9`；完整原文见 `run/candidate-7-failures.json`、`artifacts/verification-23.json`，仍是 A04 的9项。
- 判断原因：attempt-7 在 N02 的诊断登记前已启动，仍基于此前不完整上下文尝试修复，修改 `more_itertools/more.py` 中 bucket 的缓存替换及哨兵处理，但当轮9项失败没有 bucket 用例，未命中剩余字段与行为问题；不能以此判定新增诊断无效。
- 绕过：不暂停或重启作业，等待原生控制器在下个安全边界读取官方诊断记录。04:16:48 UTC 的 attempt-8 明确要求修复 callback_iter._executor、serialize._iterator/_lock、concurrent_tee 返回对象的共享 lock，并保留其余失败供后续处理。
- 结果：已确认诊断进入控制器及作者指令；candidate-8 实际复验后4个字段相关用例通过，失败9→5。没有修改冻结合同、检查、预算或验收标准。

## A08 — 第八个候选修复实例字段，仍有5个行为用例失败

- 步骤：candidate-8 全量功能比较；作业 ID：`1e8bc96fa34349989d8596ed65fce375`。
- 报错原文：`outcome: regressed, failed_checks_total: 1, failures: 5`；原版 extended `5 failed, 621 passed`。完整原文见 `run/candidate-8-failures.json`、`artifacts/verification-25.json`。
- 判断原因：本次仅定向修复3类实例字段，4个相关用例已真实通过；其余5个差异尚待分别修复，非本轮新增回归。
- 绕过：作者在 `more_itertools/more.py` 实现既有字段兼容；控制器继续分别处理 spy 列表独立性、islice_extended 对象生命周期、powerset_of_sets 哈希次数及 sample 固定随机状态行为，并完整复验。
- 结果：作者修改 `more_itertools/more.py`，candidate-9 复验消除4个失败，仅剩 islice_extended 生命周期，总失败5→1；本次全套比较耗时95.331秒，各检查均正常返回，没有超时。剩余5个原版失败ID：
  - `tests.test_more.IsliceExtendedTests::test_elements_lifecycle`
  - `tests.test_more.PowersetOfSetsTests::test_hash_count`
  - `tests.test_more.SampleTests::test_specific_sample`
  - `tests.test_more.SampleTests::test_unit_case`
  - `tests.test_more.SpyTests::test_immutable`
