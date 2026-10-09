# Local demo recording (2026-10-09)

`scopewatch-local-demo.mp4` (1440x900, 2:21) and `frame-*.png` were recorded by `tools/demo-record.ts` against the real
local server. **No native evidence**: replay scenes use synthetic seeds on local ClickHouse 25.8; contract-test scenes use
the real Guild adapter against the loopback mock Guild API (simulated human DENY in the mock). Native status: NATIVE_PENDING.

Correction: the 10.3–17.7 s caption and `frame-02` were patched with a corrected overlay (LabelSweeper had been called the
control; the control is ReleaseReview). Script and full scene table: [docs/demo/EVENT_DEMO.md](../../docs/demo/EVENT_DEMO.md).
