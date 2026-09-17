export const LABELS = {
  reviewer_scope: {
    verified: "실제 구매(결제)가 확인된 고객",
    members:  "회원 가입을 완료한 고객",
    anyone:   "누구나",
  },
  posting_period: {
    permanent:       "삭제 요청 전까지 영구히",
    until_requested: "작성자가 삭제를 요청하기 전까지",
    "3years":        "작성일로부터 3년간",
    "1year":         "작성일로부터 1년간",
  },
  ai_criteria: {
    detail:   "후기의 구체성 및 분량",
    photo:    "사진·영상 첨부 여부",
    recency:  "작성 시점",
    helpful:  "다른 고객의 도움돼요 수",
    purchase: "실제 구매 확인 여부",
  },
  deletion_criteria: {
    policy:     "운영정책을 위반한 경우",
    ads:        "광고·홍보성 내용인 경우",
    defamation: "욕설·비방·명예훼손에 해당하는 경우",
    onrequest:  "작성자가 삭제를 요청한 경우",
  },
};

export const HEADING = "사용후기 수집·처리 정보공개";

/** Always Korean. Takes no language argument — that is the point. */
export function generateLines(a = {}) {
  const L = (group, key) => LABELS[group][key] ?? "미입력";
  const lines = [];

  lines.push(`1. 사용후기 작성 권한: ${L("reviewer_scope", a.reviewer_scope)}에게 작성 권한이 있습니다.`);
  lines.push(`2. 게시기간: 등록된 후기는 ${L("posting_period", a.posting_period)} 게시됩니다.`);

  if (a.uses_ai_ranking) {
    const picked = (a.ai_criteria ?? []).map((k) => L("ai_criteria", k)).join(", ") || "기준 미입력";
    lines.push(`3. 평가·순위 기준: 알고리즘이 다음 기준에 따라 후기의 노출 순서를 정합니다 — ${picked}.`);
  } else {
    lines.push(`3. 평가·순위 기준: 별도의 알고리즘 기반 순위 조정 없이 최신순으로 표시합니다.`);
  }

  lines.push(
    `4. 삭제 기준 및 이의제기: ${L("deletion_criteria", a.deletion_criteria)} 해당 후기를 삭제하거나 비공개 처리할 수 있으며, ` +
    `작성자는 고객센터를 통해 이의를 제기할 수 있습니다.`
  );

  if (a.external_sources) {
    lines.push(`5. 외부 플랫폼 후기: ${a.external_sources}의 후기를 함께 표시하고 있습니다.`);
  }
  return lines;
}

export function toPlainText(lines) {
  return [HEADING, "", ...lines].join("\n");
}

export function toHtml(lines) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  return [
    `<section class="trustlabel">`,
    `  <h2>${esc(HEADING)}</h2>`,
    ...lines.map((l) => `  <p>${esc(l)}</p>`),
    `</section>`,
  ].join("\n");
}
