# bidict 运行问题记录

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 3 项。

- **01｜文档资源审计漏掉三个目录入口**　原版 Sphinx 目录的 12 项均可解析。交付版保留了正文，却缺少由 Git 符号链接提供的 `changelog`、`contributors-guide`、`code-of-conduct` 三个入口，nanolize 的资源审计和冻结检查均未发现。
- **02｜原版预跑指引漏了发行元数据**　nanolize 的原版预跑指引未说明如何处理测试收集依赖本项目发行元数据的情况。bidict 的 `docs/conf.py` 读取 `metadata('bidict')` 时出现 5 个收集错误，仅补齐 `.dist-info` 后，原版 1,236 项测试全部通过。
- **10｜外部契约与测试设计漏判子类扩展属性**　bidict 文档允许子类覆盖 `BidictBase._fwdm_cls` 和 `_invm_cls`，但 nanolize 提取外部契约时跳过了这两个类属性。测试设计的静态规则又将这种子类写法标为 `private_name`，限制了相应后备映射变体的迁移验证。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

- **03｜JavaScript 索引只生成了文件节点**　codegraph 1.6.4 提示 JavaScript 未产生符号。`docs/_static/custom.js` 主要由顶层 DOM 操作和匿名回调组成，索引保留了文件节点，脚本已绑定到文档能力。
- **09｜有序映射经过一轮修复通过完整比较**　第一版有序映射批量更新的 4 个参数化用例未触发预期的哈希异常，完整比较通过 63/64 组。经过 1 轮实现修复，候选版 2 通过了相同冻结检查的全部 64/64 组。
