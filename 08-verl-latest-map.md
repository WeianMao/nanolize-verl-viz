# 最新 verl 能力地图：供 nano-verl 保留/删除讨论

本轮已取得最新版主仓、生成静态能力地图；**核心方向是 RL（含 RLVR）+ SFT，RLHF 待议**。这是任务07的新范围，覆盖任务04曾提出的“只做单进程 GRPO、删除 SFT”以及任务06暂离 verl 的历史结论。本轮只分析和可视化，没有裁剪 verl、修改 LMA、安装训练依赖、运行上游训练/测试或使用 GPU。

建议讨论入口：[可视化首页](../viz/verl-latest/index.html)，其中可打开 [LMA Graph / Tree](../viz/verl-latest/graph-tree.html) 和 [原快照能力树](../viz/verl-latest/tree.html)。表格中的“删除”是未来 nano 范围建议，不是本次已删或已授权自动执行。

## 固定的版本与获取结果

- 上游：[verl-project/verl main](https://github.com/verl-project/verl)。本次查到的最新提交为 [`8df5baeed0f5ecdd7f870d83bc3d79194816e2a9`](https://github.com/verl-project/verl/commit/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9)，提交日期 **2026-10-31 09:16:04 UTC**；“最新”是此次读取 main 的快照，不是永久跟踪标签。
- 位置：`targets/verl-latest/`，被外层 `.gitignore` 的 `targets/` 规则排除。它有独立且匹配上游的 HEAD/tree，工作树干净；不是误用 nanolize 外层 HEAD 的文本目录。
- HTTPS clone 遇到 `Could not resolve host: github.com`。实际通过 GitHub 连接器取得完整树、blob 和签名 commit 元数据，恢复相同的 Git 对象，**1,302/1,302 blob 校验通过**，含原符号链接、logo、完整 `uv.lock`。保留单提交 shallow 边界。`recipe` 子模块 gitlink 原样保留、没有初始化，外部 recipe 源码不在本次分母中。
- 相对任务04的 `8e48d72`，只有 README、Ascend workflow 和 docker 描述三处文档/配置变化；**生产源码 blob 没有变化**。已重新核对最新树，不是将旧提交假称最新。
- LMA 固定为分支 `codex/understand-anything-planning`、提交 `e946bf13789f99b7648c186281226d1398912277`。读取其 README 和 Understand-Anything 流程，调用现有 Python 核心，不改 LMA。

网络失败、恢复步骤、完整性与联网替代命令见 [08-acquisition.md](08-acquisition.md)。

## 行数怎么读

全部使用物理行，包含空行、注释、docstring；不是去注释 SLOC。能力表为 **43 个互斥文件所有权集合**，每份生产源码只计一次。类别可多选，**RL、SFT、RLHF 等类别行数不能相加**；critic/value head、LoRA、并行、共享数值经常在同一文件，删除某个子功能不等于能删除整份文件。

| 口径 | 文件数 | 物理行 | 用途 |
|---|---:|---:|---|
| 本次真实 LMA capability inventory | 558 | **145,636** | HTML 预算与下表合计；含源码扩展名的 setup.py、示例和脚本 |
| `verl/` 包内全部非测试源码 | 394 | 118,529 | 包本身，包括实验 shell 脚本 |
| `verl/` 包内非测试 Python | 360 | **113,388** | 与任务04包内 Python 直接比较 |
| 测试可执行源码（Python/Shell） | 331 | 69,836 | 另计，没有运行，不计进生产源码百分比 |

任务04的145,531行使用 `repository.classify(path) == source`，漏掉该分类器视为 dependency 的 `setup.py` 105行。真实新版 LMA 的 `capabilities._source_inventory` 按源码扩展名及测试判定选取，包含 setup.py，因此本轮 **145,636 − 145,531 = 105** 是口径修正，不能当作上游增长。YAML、文档正文、lock、二进制资源均不混入这个源码分母；Hydra 配置仍是依赖与迁移审查对象，不能因不计行而忽视。

可复算的[精确能力清单](research-data/task08-capabilities.json)包含每个文件路径、行数、类别、保留建议、证据行号与固定 SHA 链接；[生成器](research-data/task08-build-map.py)逐项断言所有558文件恰好出现一次。实际 LMA 数据在 [static-evidence.json](../viz/verl-latest/static-evidence.json)。下列路径使用目录缩写，精确归属以 JSON 为准；例如 Megatron 行数包含其专用 utils，不能再和 utils 总目录重复相加。

## 模块 → 能力 → 行数 → 状态 → 取舍

“当前”表示当前源码/配置仍使用，不表示每个配置都经本轮验证。“不确定”表示没有找到整模块的明确弃用证据。“待议”也包括当前先进但首版不必承担的扩展。

### RL 训练与算法

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **RL 入口与 V1 同步训练**<br>`verl/trainer/main_ppo.py`、`verl/trainer/constants_ppo.py`等<br>main_ppo + V1 PPOTrainer/同步循环/TransferQueue/replay；统一 actor/ref/critic 编排。 | 3,576（8） | RL/RLVR/RLHF | 当前默认：use_v1=true、mode=sync。[verl/trainer/config/ppo_trainer.yaml:232](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/ppo_trainer.yaml#L232)；[verl/trainer/config/ppo_trainer.yaml:238](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/ppo_trainer.yaml#L238) | 保留：采用 V1 契约并简化；不承诺全部调度模式 |
| **V1 异步训练模式**<br>`verl/trainer/ppo/v1/trainer_colocate_async.py`、`verl/trainer/ppo/v1/trainer_separate_async.py`<br>colocate_async / separate_async：训练与生成流水、策略版本滞后与独立资源池。 | 503（2） | RL/RLVR/RLHF/并行 | 当前实现；异步训练≠异步推理 API。[docs/advance/v1_async_trainer.md:8](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/advance/v1_async_trainer.md#L8)；[verl/trainer/ppo/v1/__init__.py:17](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/v1/__init__.py#L17) | 待议：单一同步核心外扩展，不能因先进而全保留 |
| **RL 算法、损失与优势**<br>`verl/trainer/ppo/core_algos.py`、`verl/trainer/ppo/utils.py`等<br>GRPO/GAE/PPO 等 advantage、policy/value loss、KL、mask 与指标；新旧函数共享文件。 | 4,120（6） | RL/RLVR/RLHF | 混合：算法仍维护，旧 compute_policy_loss 被 vanilla 替代。[verl/trainer/ppo/core_algos.py:1209](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/core_algos.py#L1209)；[verl/trainer/ppo/utils.py:96](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/utils.py#L96) | 保留核心，变体待议；不能整文件当 legacy 删 |
| **采样校正与分组变体**<br>`verl/trainer/ppo/rollout_corr_helper.py`、`verl/trainer/ppo/score_centering.py`等<br>rollout correction、off-policy importance sampling、score centering、prefix grouping。 | 1,779（3） | RL/RLVR/算法变体 | 当前；不等同于过时实现。[docs/algo/rollout_corr.md:675](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/algo/rollout_corr.md#L675)；[verl/trainer/ppo/rollout_corr_helper.py:93](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/rollout_corr_helper.py#L93) | 待议：至少明确训练/采样 logprob 口径；只留选择配方 |
| **离线评估入口**<br>`verl/trainer/main_eval.py`<br>main_eval 独立评估入口；训练内验证仍在 trainer。 | 80（1） | RL/RLVR/评估 | 当前入口，未见整体弃用证据。[verl/trainer/main_eval.py:34](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/main_eval.py#L34) | 保留最小任务评估，统一入口待议 |

### 监督微调 SFT

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **SFT 引擎训练**<br>`verl/trainer/sft_trainer.py`<br>torchrun 多控制器 supervised token loss、数据载入、优化器、恢复。 | 488（1） | SFT | 当前 model-engine 路径。[verl/trainer/README.md:4](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/README.md#L4)；[verl/trainer/sft_trainer.py:44](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/sft_trainer.py#L44) | 保留：与 RL 共享训练引擎和 checkpoint |
| **SFT Ray 单控制器**<br>`verl/trainer/sft_trainer_ray.py`<br>Ray driver 协调 TrainingWorker 的另一种 SFT 编排。 | 415（1） | SFT/并行 | 明确 EXPERIMENTAL；未证实 deprecated。[verl/trainer/README.md:5](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/README.md#L5) | 待议：与 torchrun 二选一，首版可不含 |

### 奖励与 RLHF

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **当前 reward loop 与插件接口**<br>`verl/experimental/reward_loop/reward_loop.py`、`verl/experimental/reward_loop/__init__.py`等<br>异步奖励分发、rule/custom/RM 路由、naive/dapo/gdpo/remote/rate-limited manager；迁移函数仍在此。 | 1,817（12） | RL/RLVR/RLHF | 当前主路径虽位于 experimental；含 legacy 配置迁移。[verl/experimental/reward_loop/reward_loop.py:39](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/reward_loop/reward_loop.py#L39)；[verl/experimental/reward_loop/reward_loop.py:93](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/reward_loop/reward_loop.py#L93) | 保留规则奖励接口，远程/RM/限流扩展待议 |
| **代码与沙箱可验证奖励**<br>`verl/utils/reward_score/prime_code/`、`verl/utils/reward_score/sandbox_fusion/`<br>代码测试执行/远程 SandboxFusion；能力属于 RLVR，不是 learned RM。 | 1,528（5） | RLVR/外部服务 | 当前可验证奖励实现；未见整体弃用证据。[verl/utils/reward_score/prime_code/testing_util.py:39](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/reward_score/prime_code/testing_util.py#L39)；[verl/utils/reward_score/sandbox_fusion/__init__.py:28](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/reward_score/sandbox_fusion/__init__.py#L28) | 待议：首版可只留一种任务；有执行隔离与服务依赖 |
| **数学/答案规则奖励**<br>`verl/utils/reward_score/`<br>GSM8K、math/prime_math、答案匹配及 score 分发；RLVR 的可核验信号。 | 2,235（12） | RLVR | 主体当前；旧 _default_compute_score API 有弃用注解。[verl/utils/reward_score/__init__.py:117](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/reward_score/__init__.py#L117)；[verl/utils/reward_score/gsm8k.py:52](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/reward_score/gsm8k.py#L52) | 保留至少一个可验证任务与 callback；额外 verifier 待议 |
| **奖励模型与 critic 专用接口**<br>`verl/experimental/reward_loop/reward_model.py`、`verl/experimental/reward_loop/router/`等<br>RewardModelManager 的判别式/生成式 RM 推理与路由、RM dataset、critic config。critic 数值/训练/值头共享别的节点。 | 894（6） | RLHF/RL | 当前可选；RM enable 默认 false；critic 与奖励来源正交。[verl/trainer/config/reward/reward.yaml:29](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/reward/reward.yaml#L29)；[verl/trainer/ppo/utils.py:89](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/utils.py#L89) | 待议：RLHF 需求明确后再保留；此 LOC 不是完整 RLHF 成本 |

### 明确旧路径/兼容层

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **V0 / RayPPOTrainer**<br>`verl/trainer/main_ppo_v0.py`、`verl/trainer/ppo/ray_trainer.py`<br>旧 RL TaskRunner 与完整 RayPPOTrainer；仍承载 full_determinism 路径。 | 2,057（2） | RL/RLVR/RLHF/legacy | 明确 deprecated；计划 v0.9.0 移除。[verl/trainer/main_ppo.py:193](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/main_ppo.py#L193)；[verl/trainer/ppo/ray_trainer.py:285](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/ray_trainer.py#L285) | 删除候选：先确认不保留上游 full_determinism 行为 |
| **旧 reward manager 接口**<br>`verl/workers/reward_manager/`<br>批式 workers/reward_manager API；新 reward loop 同时保留部分兼容注册。 | 810（7） | RL/RLVR/RLHF/legacy | 局部明确 deprecated；仍存在兼容/调用关系。[verl/workers/reward_manager/abstract.py:52](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/reward_manager/abstract.py#L52)；[verl/experimental/reward_loop/reward_manager/limited.py:27](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/reward_loop/reward_manager/limited.py#L27) | 删除候选：迁移所有调用后去掉旧 API，不能仅删目录 |

### 训练后端、模型与精度

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **统一训练引擎与 worker**<br>`verl/workers/engine_workers.py`、`verl/workers/engine_workers_tinker.py`等<br>BaseEngine/registry/spec、TrainingWorker/ActorRolloutRefWorker、loss/padding/config；RL 与 SFT 共用。 | 2,709（9） | RL/SFT/RLHF/多后端 | 当前统一架构；旧独立 actor/critic worker 已移除。[docs/workers/engine_workers.rst:208](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/workers/engine_workers.rst#L208)；[verl/workers/engine_workers.py:110](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine_workers.py#L110) | 保留薄接口与一种引擎；Tinker split API 待议 |
| **FSDP / FSDP2 / Turbo**<br>`verl/workers/engine/fsdp/`、`verl/utils/fsdp_utils.py`<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 3,189（5） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/fsdp/transformer_impl.py:106](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/fsdp/transformer_impl.py#L106) | 保留候选：优先评估 FSDP2；FSDP1/Turbo 按真实需求取舍 |
| **Megatron 训练后端**<br>`verl/workers/engine/megatron/`、`verl/utils/megatron/`等<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 5,537（15） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/megatron/transformer_impl.py:163](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/megatron/transformer_impl.py#L163) | 待议：大模型 TP/PP/EP 才保留 |
| **AutoModel 训练后端**<br>`verl/workers/engine/automodel/`<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 989（3） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/automodel/transformer_impl.py:70](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/automodel/transformer_impl.py#L70) | 待议：不要为多后端矩阵默认保留 |
| **VeOmni 训练后端**<br>`verl/workers/engine/veomni/`、`verl/utils/veomni/`<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 1,825（5） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/veomni/transformer_impl.py:99](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/veomni/transformer_impl.py#L99) | 待议：与主后端二选一 |
| **TorchTitan 训练后端**<br>`verl/workers/engine/torchtitan/`<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 1,335（3） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/torchtitan/transformer_impl.py:105](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/torchtitan/transformer_impl.py#L105) | 待议：新后端不自动等于必需 |
| **MindSpeed / NPU 后端**<br>`verl/workers/engine/mindspeed/`<br>训练/推理 forward、优化器、并行布局、权重导出及对应后端工具。 | 155（3） | RL/SFT/RLHF/多后端/并行 | 当前受注册/导入支持；非整体 deprecated。[verl/workers/engine/mindspeed/transformer_impl.py:57](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/mindspeed/transformer_impl.py#L57) | 待议：只有 NPU 支持目标才保留 |
| **Transformers 模型与 kernel 适配**<br>`verl/models/transformers/`、`verl/models/__init__.py`等<br>Llama/Qwen/VLM 等 forward、padding、monkey patch；dense/MoE/多模态及版本兼容交织。 | 5,696（18） | RL/SFT/模型/多模态 | 当前与历史版本兼容混合，不能按文件年龄删。[verl/models/transformers/monkey_patch.py:545](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/models/transformers/monkey_patch.py#L545) | 待议：认证少数模型，删出额外模型/VLM/版本矩阵 |
| **Megatron 模型桥与补丁**<br>`verl/models/mcore/`<br>MCore 注册、HF bridge、MoE/MTP/融合 forward 与旧后端兼容。 | 3,373（9） | RL/SFT/模型/并行 | 混合；legacy fused-forward fallback 仍有兼容理由。[verl/models/mcore/model_forward_fused.py:54](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/models/mcore/model_forward_fused.py#L54) | 待议：只随 Megatron 保留；移除旧 fallback 要缩版本契约 |
| **量化与融合计算**<br>`verl/utils/qat/`、`verl/utils/kernel/`等<br>FP8/QAT/Triton/NPU CE、量化线性层与 kernel helper。 | 5,264（15） | RL/SFT/性能 | 当前/实验并存；没有整体 deprecated 证据。[verl/utils/qat/core.py:31](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/qat/core.py#L31)；[verl/utils/kernel/kernels.py:61](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/kernel/kernels.py#L61) | 待议：初版只认证一种精度，按硬件保留最少优化 |

### 推理生成与 Agent

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **服务化 rollout 与路由**<br>`verl/workers/rollout/base.py`、`verl/workers/rollout/llm_server.py`等<br>BaseRollout、LLM server、replica、router、load balance/utility；async API 可服务同步训练。 | 2,992（9） | RL/RLVR/RLHF | 当前注册只有 async server；旧 SPMD 已移除。[verl/workers/rollout/base.py:89](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/base.py#L89)；[docs/blog/v0.7.md:87](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/blog/v0.7.md#L87) | 保留一种服务化生成路径并精简路由 |
| **vLLM rollout**<br>`verl/workers/rollout/vllm_rollout/`、`verl/utils/vllm/`<br>生成服务器适配、weight refit/量化/设备兼容工具。 | 6,605（17） | RL/RLVR/RLHF/多后端 | 当前 async server 后端；非整体 legacy。[verl/workers/rollout/base.py:90](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/base.py#L90) | 待议：首版只选一个实测后端，其余删出范围 |
| **SGLang rollout**<br>`verl/workers/rollout/sglang_rollout/`、`verl/utils/sglang/`<br>生成服务器适配、weight refit/量化/设备兼容工具。 | 3,867（11） | RL/RLVR/RLHF/多后端 | 当前 async server 后端；非整体 legacy。[verl/workers/rollout/base.py:91](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/base.py#L91) | 待议：首版只选一个实测后端，其余删出范围 |
| **TensorRT-LLM rollout**<br>`verl/workers/rollout/trtllm_rollout/`、`verl/utils/trtllm/`<br>生成服务器适配、weight refit/量化/设备兼容工具。 | 1,420（5） | RL/RLVR/RLHF/多后端 | 当前 async server 后端；非整体 legacy。[verl/workers/rollout/base.py:92](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/base.py#L92) | 待议：首版只选一个实测后端，其余删出范围 |
| **HF / naive 本地 rollout**<br>`verl/workers/rollout/hf_rollout.py`、`verl/workers/rollout/naive/`<br>module.generate 与 naive sampling 参考实现；不在当前服务器注册表。 | 314（3） | RL/RLVR | 未证实整体弃用；HF 有 HybridShard hang TODO。[verl/workers/rollout/hf_rollout.py:16](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/hf_rollout.py#L16)；[verl/workers/rollout/__init__.py:16](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/__init__.py#L16) | 待议：小模型测试参考；不能称默认最新生产路径 |
| **Agent loop、多轮与工具**<br>`verl/experimental/agent_loop/`、`verl/tools/`<br>单轮/多轮 agent 请求、工具调用、gateway、轨迹/token stitching；单轮本身也是当前默认依赖。 | 3,455（11） | RL/RLVR/多轮 | experimental 名称下的当前调用路径，非整体遗留。[verl/trainer/ppo/v1/agent_loop_tq.py:15](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/v1/agent_loop_tq.py#L15)；[verl/experimental/agent_loop/agent_loop.py:79](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/agent_loop/agent_loop.py#L79) | 保留单轮薄路径；工具、多轮、复杂 gateway 待议 |

### 扩展实验

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **教师模型与在线蒸馏**<br>`verl/experimental/teacher_loop/`、`verl/trainer/distillation/`等<br>teacher loop、OPD/distillation loss、tail KL 与 FSDP/Megatron 适配。 | 1,926（11） | RL/蒸馏 | 当前扩展；不是 RLHF reward model。[verl/trainer/ppo/utils.py:82](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/utils.py#L82)；[verl/trainer/distillation/losses.py:41](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/distillation/losses.py#L41) | 待议：超出 RLVR+SFT 必需闭环 |
| **其它异步/分离实验训练器**<br>`verl/experimental/fully_async_policy/`、`verl/experimental/one_step_off_policy/`等<br>fully_async_policy、one_step_off_policy、separation：与 V1 存在能力重叠的独立实验线路。 | 11,092（55） | RL/RLVR/实验/并行 | 不确定：有局部 deprecated 方法，未找到整目录退役声明。[verl/experimental/fully_async_policy/message_queue.py:229](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/fully_async_policy/message_queue.py#L229)；[verl/experimental/fully_async_policy/fully_async_main.py:28](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/experimental/fully_async_policy/fully_async_main.py#L28) | 删除候选（nano 范围）：优先选 V1；不声称全是上游弃用代码 |

### 共享数据、配置与恢复

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **RL/SFT 数据与多模态预处理**<br>`verl/utils/dataset/`<br>RL prompt、SFT 对话/监督 mask、batch collator、图像视频预处理；RM dataset 另列。 | 1,281（5） | RL/RLVR/SFT | 当前；多轮 SFT 不等于 RL 多轮 agent。[verl/trainer/sft_trainer.py:37](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/sft_trainer.py#L37)；[verl/trainer/ppo/utils.py:110](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/utils.py#L110) | 保留 RL+SFT 数据契约；视觉/音频/视频按范围取舍 |
| **批协议、tokenizer 与配置**<br>`verl/protocol.py`、`verl/base_config.py`等<br>DataProto/TensorDict、tokenizer/chat template、基础/worker/trainer typed config；含兼容字段。 | 8,714（25） | RL/RLVR/SFT/RLHF/共享 | 混合：当前协议/配置 + legacy 别名；YAML 不计这里 LOC。[verl/trainer/config/ppo_trainer.yaml:17](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/ppo_trainer.yaml#L17)；[verl/trainer/config/ppo_trainer.yaml:34](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/ppo_trainer.yaml#L34) | 保留薄共享结构，旧配置迁移后删除；不要按 legacy 文件名盲删 |
| **训练 checkpoint、恢复与导出**<br>`verl/utils/checkpoint/`、`verl/model_merger/`<br>本地/远端模型+优化器/RNG/loader状态；FSDP/Megatron checkpoint、HF merger。 | 3,924（12） | RL/SFT/RLHF | 当前；Megatron v2 layout，legacy 数据迁移单列。[docs/advance/checkpoint.rst:381](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/advance/checkpoint.rst#L381)；[verl/utils/checkpoint/checkpoint_handler.py:49](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/checkpoint/checkpoint_handler.py#L49) | 保留恢复/导出核心；旧格式兼容与多后端合并待议 |
| **通用数值、文件与导入工具**<br>`verl/utils/`<br>torch mask/logprob/reduction 等共享数值，文件/HDFS、dtype、Python helper；不宜整包删除。 | 2,586（9） | RL/RLVR/SFT/RLHF/共享 | 当前共享实现含局部旧 API。[verl/utils/reward_score/__init__.py:16](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/reward_score/__init__.py#L16)；[verl/utils/torch_functional.py:50](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/torch_functional.py#L50) | 保留依赖闭包；HDFS/兼容分支待议 |

### 分布式、设备与权重同步

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **Ray 资源与 worker 调度**<br>`verl/single_controller/`、`verl/utils/ray_utils.py`等<br>资源池、worker group、RPC dispatch、rendezvous、TransferQueue helper。 | 2,993（11） | RL/SFT/并行 | 当前，部分旧 worker factory 有 deprecated 注释。[verl/single_controller/ray/base.py:943](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/single_controller/ray/base.py#L943)；[verl/trainer/main_ppo.py:141](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/main_ppo.py#L141) | 待议：保留 V1 必须考虑依赖；可简化部署范围 |
| **分布式与序列并行**<br>`verl/utils/distributed.py`、`verl/utils/ulysses.py`等<br>DP/collectives、Ulysses SP、动态 CP、sequence balancing、offload/memory。TP/PP/EP 在各后端也有代码。 | 2,452（6） | RL/SFT/并行 | 当前实现；并行策略不是任务算法。[verl/utils/ulysses.py:363](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/ulysses.py#L363)；[verl/utils/dynamic_cp_scheduler.py:112](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/dynamic_cp_scheduler.py#L112) | 待议：只保留所选后端必需策略，单卡/多卡边界需另定 |
| **训练→推理权重同步**<br>`verl/checkpoint_engine/`<br>checkpoint_engine 的 NCCL/HCCL/NIXL/Mooncake/Kimi/delta 同步；不是磁盘保存。 | 3,819（11） | RL/RLHF/并行 | 当前多传输实现，delta 是优化选择。[verl/checkpoint_engine/README.md:1](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/checkpoint_engine/README.md#L1)；[verl/checkpoint_engine/delta_checkpoint_engine.py:83](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/checkpoint_engine/delta_checkpoint_engine.py#L83) | 保留最小权重同步；远程/增量传输按选定拓扑待议 |
| **设备平台插件**<br>`verl/plugin/`、`verl/utils/device.py`<br>CUDA/NPU/ROCm 与平台发现、设备 helper；跨硬件兼容。 | 1,356（8） | RL/SFT/多设备 | 当前；legacy device API 为兼容层不等于平台废弃。[docs/hardware/multi_chip_support.rst:64](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/hardware/multi_chip_support.rst#L64) | 待议：明确目标设备后裁剪插件矩阵 |

### 运维、示例与构建

| 模块/作用 | 物理行（文件） | 归属 | 新旧与依据 | nano 建议 |
|---|---:|---|---|---|
| **日志、指标、profiler、skip**<br>`verl/utils/profiler/`、`verl/utils/debug/`等<br>tracking/logging、性能/精度调试、trajectory、skip/cache 工具。 | 6,692（27） | RL/SFT/运维 | 混合：debug/performance 明确旧；主 profiler/skip 仍当前。[verl/utils/debug/performance.py:16](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/debug/performance.py#L16)；[verl/utils/tracking.py:70](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/utils/tracking.py#L70) | 保留基本日志/指标；多监控集成/profiler/缓存待议 |
| **Vendored 第三方兼容实现**<br>`verl/third_party/`<br>torch distributed checkpoint 与 vLLM 版本兼容拷贝；仍是仓内源码。 | 2,667（7） | RL/SFT/兼容 | 混合；注释里的 deprecated 可能属于上游第三方 API。[verl/third_party/torch/distributed/checkpoint/state_dict.py:198](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/third_party/torch/distributed/checkpoint/state_dict.py#L198) | 待议：随依赖版本移除，不能当外部库漏计 |
| **训练示例、预处理与运维脚本**<br>`examples/`、`scripts/`等<br>examples 各算法/后端示例，scripts 安装/转换/CI辅助，manage_envs；展示矩阵并非独立核心。 | 26,395（159） | RL/RLVR/SFT/示例 | 新旧并存；例子名不证明 deprecated。[verl/trainer/README.md:3](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/README.md#L3) | 保留一套 RLVR+SFT 可复现实例，其余退出 nano 范围 |
| **文档可执行资源与构建入口**<br>`docs/`、`setup.py`<br>docs JS/CSS/Python/shell 与 setup.py；setup.py 被真实 LMA capability inventory 计入源码。 | 712（5） | 文档/构建 | 当前支持代码。[setup.py:82](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/setup.py#L82) | 保留最小安装/文档；不把构建源码从预算漏掉 |

所有能力文件集合合计：**558文件，145,636物理行**；无未映射源码，无重复所有权。依赖边是已审查的功能关系线索，不是完整 Python import、动态注册、运行时或测试覆盖证明。

## 讨论时最容易误判的地方

### 1. “先进实现”先按迁移证据判断，不按年份和目录名判断

明确可优先退休的对象是 **V0 trainer**、旧 reward manager API、旧 loss/metric/debug helper、配置别名与旧 checkpoint 格式兼容。V0的整文件所有权为2,057行，旧reward manager为810行；它们只是相应文件的体量，不能保证删掉即可省下所有这些行。`core_algos.py` 内旧 `compute_policy_loss` 与当前 `compute_policy_loss_vanilla` 共存，不应把4,120行算法节点全部标为历史包袱。实际替代证据见[旧loss注解](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/core_algos.py#L1209)。

**有一个保留契约例外：** 上游明确要求 `full_determinism` 使用 V0，因为 V1 TransferQueue 按完成顺序收集、V0按提交顺序收集。因此默认采用 V1 合理，但在承诺同等确定性之前，不能把 V0 当作没有功能差异的冗余。若 nano 不继承这个确定性开关，应明确记作不提供的能力。[确定性文档](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/advance/determinism.md#L104)

旧 `fsdp_workers.py`、`megatron_workers.py`、`workers/actor`、`workers/critic`、`sharding_manager` 已被上游移除，用统一 `engine_workers`/model engine 替代。它们**不在当前目录树中，没有待删行数**。SPMD rollout 同样已移除，不能再次计算削减收益。[worker迁移表](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/workers/engine_workers.rst#L206)、[v0.7 rollout迁移](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/blog/v0.7.md#L87)

`experimental/agent_loop` 和 `experimental/reward_loop` 已被当前 V1 调用；`legacy_data.yaml` 和 `legacy_reward_impl.yaml` 仍在默认 Hydra 组合中。Megatron-lite 文档所说的“legacy names”是预览版命名，不代表实现被弃用。**有 legacy/experimental 单词只是找证据的线索，不是删除结论。** [默认配置](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/config/ppo_trainer.yaml#L16)、[Megatron-lite命名](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/advance/megatron_lite_backend.rst#L14)

### 2. RLVR、RLHF、critic、reference 不是互斥目录

| 路径 | 作用/启用条件 | 对取舍的含义 |
|---|---|---|
| RLVR | 数学答案、代码测试等可验证 reward，经当前 reward loop 回到 RL batch | 优先保留一个离线任务和可扩展函数；RLVR仍需要真实生成/训练闭环 |
| Learned reward model | `reward.reward_model.enable`，默认 false；支持判别式/生成式模型评分与router | 是RLHF相关路径，也可用于其它模型打分；当前主仓地图不等于覆盖完整人类偏好数据收集和RM训练产品 |
| Critic/value model | `need_critic` 在显式配置外按 `adv_estimator == gae` 开启；默认 PPO 配置就是 GAE | critic不等于RLHF。RLVR也可用PPO/critic；GRPO通常不需要critic。是否删除须跟算法选择一起定 |
| Reference policy | actor KL loss或reward KL启用 | 是KL参照策略，不是奖励模型，不是critic；删除RLHF不能顺带无条件删除reference |
| Teacher/distillation | `need_teacher_policy` / distillation enable | 是蒸馏教师，不要当作RLHF reward model |

这些条件在 [`ppo/utils.py`](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/trainer/ppo/utils.py#L76) 可查。critic值头位于[FSDP实现](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/fsdp/transformer_impl.py#L1615)和[Megatron实现](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/engine/megatron/transformer_impl.py#L1482)，训练/恢复在V1 trainer和统一worker，GAE/value loss在算法模块。因此表中RLHF专有894行**不是移除RLHF全部能省多少行**；共享文件必须进一步按函数和调用关系审查。

### 3. 单一现代路径可以简化，不能将所有当前优化同时带上

建议 nano 首轮选择 **V1 RL + 当前 engine SFT + 统一训练引擎 + 单一 rollout server + 规则奖励**，把后端数量压到一条实测路径。FSDP2是优先评估候选，上游有明确迁移说明；FSDP1仍有当前兼容与使用场景，不能声称全库已废弃。`fsdp_turbo`、Megatron、VeOmni、AutoModel、TorchTitan、MindSpeed不是同一后端的简单新旧版本，而是适用范围、生态和并行能力不同的替代方案。[FSDP2迁移](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/docs/perf/perf_tuning.rst#L318)

并行策略应独立讨论：DP/FSDP分片、TP、PP、SP/Ulysses、CP、EP/MoE及train/rollout分离都在不同层发生。只保留一种训练引擎，不等于自动删除所有并行代码；只有选定模型规模、设备数和推理部署后，才能判断哪些策略是必需依赖。本轮不替负责人隐式决定“必须单进程”或“必须多机”。

`async` rollout是服务器异步请求API；V1的默认训练模式仍为 `sync`。删除异步训练，不代表可以删除当前推理服务的async调用。现存HF/naive rollout可作小模型语义参考，但HF文件仍有FSDP HybridShard hang TODO，且不在当前vLLM/SGLang/TRT-LLM server注册表，不应将其自动称作最先进的生产默认。[注册表](https://github.com/verl-project/verl/blob/8df5baeed0f5ecdd7f870d83bc3d79194816e2a9/verl/workers/rollout/base.py#L89)

多算法同理：PPO/GRPO/RLOO及更新的loss/校正方案不是简单“新替旧”的链条。优先保留一套经选择的RLVR算法及清楚的数值契约；其余记为范围外或待议。没有本轮训练结果支持某算法在目标任务上最优，也没有理由沿用任务04的4k–7k行目标去反推必须删除SFT。

## HTML 怎么打开

HTML是静态讨论页，默认不启动服务、不提交训练、不自动修改代码。推荐在集群的 `oci-ord-cs`、nanolize根目录执行：

```bash
cd /lustre/fs12/portfolios/nvr/projects/nvr_elm_llm/users/shyang/weian/project/nanolize
python3 -m http.server 8765 --bind 127.0.0.1 --directory viz/verl-latest
```

浏览器也在同一台机器时，打开 `http://127.0.0.1:8765/`。如果浏览器在自己的电脑上，在**本地电脑**另开终端：

```bash
ssh -N -L 8765:127.0.0.1:8765 <平时登录oci-ord-cs的SSH别名>
```

再打开 `http://127.0.0.1:8765/`。SSH目标必须是运行http.server的同一台主机；如已有跳板机配置，沿用原来的SSH别名/ProxyJump。本轮没有创建公网隧道，也没有声称服务已后台常驻。端口冲突时可换空闲端口，同时修改server、隧道和浏览器地址。`Ctrl-C`关闭server/隧道。

也可以把整个 `viz/verl-latest/` 下载到自己的电脑，直接打开 `index.html`；主要LMA视图自身为独立HTML，无需联网CDN。首页链接各文件，下载完整目录可保留导航。Graph/Tree切换展示同一能力选择；筛选、搜索、取舍标签方便讨论。百分比滑条是对上游文件规模的估计，不是重写nano后的最终行数；本轮不替负责人选择裁剪预算。导出的selection JSON只是选择记录，**没有配置可执行checks，不应将图上的选择理解为通过验证或允许训练/删除**。

## UA/LMA 实际运行范围与限制

UA固定为 [`4e6d3299017a7432da15957874992837a315c5b4`](https://github.com/Egonex-AI/Understand-Anything/commit/4e6d3299017a7432da15957874992837a315c5b4)。本机无现成完整UA，clone和npm均遇DNS失败；pnpm缺失，Node20也低于该版完整understand skill的Node22要求。已在 `tools/Understand-Anything/` 获取所需文档/skill/agent/扫描器，成功运行**真实UA轻量domain-context提取器**。该输出包含664候选文件、11入口、40采样文件，随后host agent结合完整源码库存与实际调用/弃用证据评审了43能力，生成UA格式图并交给LMA原生导入。**这不是完整UA安装或完整Tree-sitter多agent understand流水线**，也不是纯自动生成且未经审阅的依赖闭包。

原仓完整快照存在LMA当前界限：4个agent skill目录符号链接及2,352,526字节 `uv.lock` 被snapshot跳过，`complete=false`。没有删掉原仓这些文件或改LMA来掩盖它。原始诊断和普通静态树保留；Graph导入另用 `tools/verl-analysis-view` 的派生分析副本，显式排除这些非源码资源及未初始化recipe gitlink。该副本全部生产源码与测试保持原字节，拥有**自己的本地合成commit**，不冒称上游commit。Graph/Tree的绑定身份、排除清单与对应上游SHA随产物记录；这支持静态讨论，**不能当作完整上游安装/运行基线**。

LMA Graph/Tree已通过现有核心生成。另一个实际环境限制是Python环境缺少 `mcp` 包：公开CLI/产物wrapper计算 `operation_contract_digest` 时导入 `mcp_server` 并报 `ModuleNotFoundError: mcp`。实际使用未修改的 `import_understanding`、`collect_snapshot` / `_inventory` / `_plan_from_inventory`、`validate_understanding_source` 与原生 `write_capability_view`，显式复核绑定后输出静态页面；没有fake stub、猴子补丁或绕过执行门槛。静态页面不提供live execution或有效operation contract digest。分析镜像本地SHA为 `e3f6c9842c101dfa5290abbd63e7145c5d05bb5e`；上游仍为 `8df5bae…`，两者分别标注。

生成方式、准确工具命令、镜像身份和产物验证详见 [08-visualization.md](08-visualization.md)；源码判断进展见 [08-review.md](08-review.md)，获取证据见 [08-acquisition.md](08-acquisition.md)。主要可重算入口为：

```bash
# 重新按已保存的真实LMA inventory核对能力、行数、证据锚点
/usr/bin/python3 -B docs/research-data/task08-build-map.py

# 以新输出目录复现，保留本轮产物；不修改LMA、不运行verl
PYTHONDONTWRITEBYTECODE=1 UNDERSTAND_NO_WORKTREE_REDIRECT=1 \
  /opt/conda/bin/python -B scripts/build_verl_visualization.py --output viz/verl-latest-new

# 校验固定上游blob及本轮完整产物
/opt/conda/bin/python -B docs/research-data/task08-validate.py --full
```

当前验证是上游来源/字节、库存与映射、图数据和HTML的静态验证。没有捕获LMA行为baseline、没有宣布CPU/GPU训练或算法正确性测试通过。未知的运行依赖、后端功能差异、模型与数据资格、确定性/精度/性能均留在后续范围确定后的验证里。
