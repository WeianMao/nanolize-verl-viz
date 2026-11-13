# Graph-contract run issues

本页问题列表只保留经核对确定由 nanolize 自身引起的 3 项。

## 6. Public interfaces truncated at 300 entries
- Step: graph-contract conversion/report review.
- Job ID: not created yet.
- Original diagnostic: `"truncated": {"extended": 71}`.
- Cause: `graph_contract.MAX_ENTRIES = 300` cuts off a large public module with both package-level and module-level re-exports. This would omit required public names from the author contract.
- Workaround: on local branch `local/graph-contract-more-itertools`, increased the manifest interface representation capacity to 1000 entries and added a regression case for 180 operations with dual public exports; regenerate into a new output filename. No acceptance check or runtime budget was weakened.
- Changed files: `nanolize/src/nanolize/graph_contract.py`, `nanolize/tests/test_graph_contract.py`.
- Result: 11 ProposalTests passed; conversion preserved all 484 discovered entries with no truncation. Commit `ee875ec` on the local branch; no push.

## 21. Task benchmark requires a hidden acceptance script in the solver workspace
- Step: default independent task-effort original baseline, modify task repeat 0.
- Job ID: `d7e532e4f38c4536bf2b9562ca04deb9`.
- Original diagnostic: `"status": "blocked", "reason": "task_environment_unavailable"`; solver: `Acceptance is blocked because the supplied accept.py is absent.` The generated task says `Run the supplied accept.py from the repository root`, but this script belongs to hidden evaluator checks, not visible solver fixtures.
- Cause: generated task instructions incorrectly require the solver to run an acceptance script that the isolation design withholds. The solver reported its focused regression and self-check passed but could not complete the demanded acceptance step; no successful task result is inferred.
- Workaround: retain the frozen hidden checks, task result and default policy, and let nanolize continue its functional rewrite workflow with task-effort marked unverified. No hidden checks were exposed or removed, no source/code/parameter changes, and no budget increase.
- Result: task baseline `ready: false`, `status: unverified`, one blocked original run and no valid task-cost comparison. Recorded task overhead is 1,132,451 tokens (808,036 examiner + 324,415 solver), already above the default 1,000,000-token ceiling after the in-flight call completed. The full functional baseline remains ready; first compression author started at 08:34:20 UTC. Evidence: `artifacts/task_baseline-6.json` and `task-effort/original/development/modify/0/record.json`.

## 30. Task comparison crashes on a baseline sealed before an authorized contract revision
- Step: compare_task_effort after candidate-6 passed all16 behavior groups and3 installation checks.
- Job ID: `d7e532e4f38c4536bf2b9562ca04deb9`.
- Original diagnostic: operation seq132, tool compare_task_effort, status error, `BenchmarkIntegrityError: Task baseline belongs to different scope or runner settings`; public error `The execution pipeline could not complete.` at2026-11-13T10:16:44.991128+00:00. Resume remains available.
- Cause: the task baseline was sealed against contract-4. The owner-authorized documentation check produced contract-18 and a changed plan digest. Refreeze intentionally recaptures behavior facts/baseline but retains the pre-author task baseline; compare_task_effort passed the new plan to the old benchmark and raised instead of recording the legitimately stale task evidence as unavailable. Runner settings digests are identical.
- Workaround: on the existing local nanolize workaround branch, change src/nanolize/job_tools/verify.py so a recorded change of contract with a changed plan digest and unchanged runner settings produces an explicit unverified task-effort artifact (reason original_baseline_unavailable, with old/new contract IDs). Validate the baseline artifact hash first. Unexplained same-contract plan changes, changed runner settings and tampered artifacts retain their integrity failures. Keep task_effort_not_passed as a delivery gap; do not redesign hidden tasks after authoring, expose hidden checks, reset budgets or claim a pass. Added a real controller/refreeze regression in tests/test_next_task_effort.py. No job state or frozen evidence is edited.
- Result: local workaround commit059dd85b8c1004c3852600a7928f53cc0495a644. Tests passed:7 task-flow tests,2 refreeze tests,28 staged-task tests; the amended new integrity regression also passed separately. However the job correctly refuses a different runtime fingerprint (issue31), so this new code was NOT loaded into the running job. The fix is retained for future runs. To complete this job without bypassing version/integrity guards, use the exact original runtime and supported owner evaluate/select/deliver calls with task_effort_not_passed explicitly retained. The pre-existing original task-design failure in issue21 remains a distinct gap.
