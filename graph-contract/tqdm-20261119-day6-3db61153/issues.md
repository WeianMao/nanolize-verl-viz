# tqdm 双作业运行问题清单

## 需要对 nanolize 改动的 bugs

本页问题列表只保留经核对确定由 nanolize 自身引起的 1 项。

- **问题-1　有原版基线失败时，自动交付图报告无法生成。** 主作业按有效准则写入 `behavior_acceptance=passed`，但报告校验器（`src/nanolize/public_view.py:745–749`）要求所有保留组均为 `passed`，遇到 `preexisting_failure` 就报错 `Behavior acceptance requires full passing comparison evidence`。

## 遇到的现象

本节只列由 nanolize 流程本身产生的现象；我们运行环境造成的情况未列入。

- **现象-4　测试设计及迁移有缺口。** 补测后有有效测试的叶节点从 12/17 增至 16/17，文档与打包资源生成节点仍无有效测试，24 个待迁移原测试函数中有 10 个取得替代检查、14 个仍未验证。
- **现象-5　配置引用缺文件。** 草稿首次保存时缺少 `pyproject.toml` 引用的 `README.rst` 和 `.meta/nbval.ini`，随后补齐了 README；最终候选仍缺供 tox 的 nbval 命令使用的 ini 文件，两次集成都记录了 `unresolved_configuration_references`。
- **现象-6　首次比较的 9 项回归及重放的 1 项差异。** 1 轮修复消除了 9 项冻结比较回归，额外重放中依赖私有 `_executor_map` 的 `test_chunksize_warning` 仍失败，对应的公开行为测试 `test_default_chunksize_warning` 在原版和候选上均通过。
