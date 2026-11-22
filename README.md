[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/TheNumbers-sys/makefun-tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/TheNumbers-sys/makefun-tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

TinyStack is a compact, deterministic interpreter for make.fun's 32-bit stack VM. It reads each `program.bin` and `input.bin` under `MAKEFUN_INPUT_DIR` (default `/input`) and writes `stdout.bin` plus `exit.txt` under `MAKEFUN_OUTPUT_DIR` (default `/output`).

Run locally with Node 24:

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out /usr/bin/node main.ts
```

Score the output with the kit's `program/scorer/score.ts`, setting `MAKEFUN_REFERENCE_DIR` to `practice/reference` and `MAKEFUN_SCORES_DIR` to a scores directory.
