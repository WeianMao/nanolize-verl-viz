# Click 全范围双作业运行问题清单

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 1 项。

- **1.** 路径转换失败时，原始诊断明确给出 `Path.convert` 触发的 `BytesWarning`，修复作者收到的 `case_errors` 和 `case_assertions` 仅留下 `AssertionError` 与 `assert 1 == 0`。nanolize 应在隐藏测试正文的前提下传递子进程异常类型及生产代码位置。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

- **3.** 转换器因 pytest 默认标记 `-m 'not stress'` 与动态参数化，无法静态拆分 23 个原检查中的 15 组。其余检查共恢复 29 个函数，写入 5 个文件。
- **7.** 交付前回放记录了 5 个内部函数退化，另有 4 个已排除的内部函数由通过转为失败，公开接口回放退化 0 个。另用 `click.echo` 向模拟 Jupyter 输出流的弱引用代理写入彩色文字时，原版保留 ANSI 颜色，交付版只输出纯文本。
