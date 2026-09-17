import { test } from "node:test";
import assert from "node:assert/strict";

import { generateLines, toHtml } from "./generate.js";

/** A fully answered wizard. Fictional shop data, per the working rules. */
const FULL = {
  reviewer_scope: "verified",
  posting_period: "permanent",
  uses_ai_ranking: true,
  ai_criteria: ["detail", "photo"],
  deletion_criteria: "policy",
  external_sources: "네이버 스마트스토어",
};

test("every answer present produces all five lines", () => {
  const lines = generateLines(FULL);

  assert.equal(lines.length, 5);
  assert.deepEqual(lines, [
    "1. 사용후기 작성 권한: 실제 구매(결제)가 확인된 고객에게 작성 권한이 있습니다.",
    "2. 게시기간: 등록된 후기는 삭제 요청 전까지 영구히 게시됩니다.",
    "3. 평가·순위 기준: 알고리즘이 다음 기준에 따라 후기의 노출 순서를 정합니다 — 후기의 구체성 및 분량, 사진·영상 첨부 여부.",
    "4. 삭제 기준 및 이의제기: 운영정책을 위반한 경우 해당 후기를 삭제하거나 비공개 처리할 수 있으며, 작성자는 고객센터를 통해 이의를 제기할 수 있습니다.",
    "5. 외부 플랫폼 후기: 네이버 스마트스토어의 후기를 함께 표시하고 있습니다.",
  ]);
});

test("AI ranking off declares newest-first instead of an algorithm", () => {
  const lines = generateLines({ ...FULL, uses_ai_ranking: false, ai_criteria: [] });

  assert.equal(lines.length, 5);
  assert.equal(
    lines[2],
    "3. 평가·순위 기준: 별도의 알고리즘 기반 순위 조정 없이 최신순으로 표시합니다."
  );
});

test("AI ranking on names every criterion the seller picked", () => {
  const lines = generateLines({ ...FULL, uses_ai_ranking: true, ai_criteria: ["recency", "helpful"] });

  assert.equal(
    lines[2],
    "3. 평가·순위 기준: 알고리즘이 다음 기준에 따라 후기의 노출 순서를 정합니다 — 작성 시점, 다른 고객의 도움돼요 수."
  );
});

test("no external sources produces four lines, not five", () => {
  const lines = generateLines({ ...FULL, external_sources: null });

  assert.equal(lines.length, 4);
  assert.ok(
    !lines.some((line) => line.startsWith("5.")),
    "the external-platform line must be absent entirely, not empty"
  );
});

test("toHtml escapes seller free text so it cannot break out of the markup", () => {
  const lines = generateLines({ ...FULL, external_sources: '<script>alert("xss")</script>' });
  const html = toHtml(lines);

  assert.ok(!html.includes("<script>"), "a raw <script> tag must never reach the output");
  assert.ok(html.includes("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"));
});
