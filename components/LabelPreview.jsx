import Label from "@/components/Label";
import { generateLines } from "@/lib/generate";

/**
 * The wizard's live Label. Unanswered lines are shown dimmed rather than
 * hidden, so the shape of the finished thing is visible from question one.
 */

// Derived from the generator itself so the placeholders cannot drift from the
// real output. Slots 1, 2 and 4 come out with 미입력 in them, which is exactly
// the placeholder we want.
const PLACEHOLDERS = generateLines({});

// Slot 3 is the exception: generateLines treats a missing uses_ai_ranking as
// false and renders "no algorithm, newest first", which asserts an answer the
// seller has not given yet. A neutral stand-in until they choose.
const PLACEHOLDER_RANKING = "3. 평가·순위 기준: 미입력";

const ANSWERED = [
  (a) => Boolean(a.reviewer_scope),
  (a) => Boolean(a.posting_period),
  // Saying "yes, we rank" is not a finished answer — the line still reads
  // 기준 미입력 until at least one criterion is picked, so keep it dimmed.
  (a) =>
    a.uses_ai_ranking === false ||
    (a.uses_ai_ranking === true && (a.ai_criteria?.length ?? 0) > 0),
  (a) => Boolean(a.deletion_criteria),
];

export default function LabelPreview({ answers = {}, shopName, shopPlaceholder }) {
  const generated = generateLines(answers);

  const lines = ANSWERED.map((isAnswered, index) => {
    if (isAnswered(answers)) return { text: generated[index], dim: false };
    return {
      text: index === 2 ? PLACEHOLDER_RANKING : PLACEHOLDERS[index],
      dim: true,
    };
  });

  // Line 5 exists only when the seller actually shows outside reviews, so it
  // arrives rather than sitting there as a placeholder that may never fill.
  if (answers.external_sources) {
    lines.push({ text: generated[4], dim: false });
  }

  return (
    <Label
      lines={lines}
      shopName={shopName}
      shopPlaceholder={shopPlaceholder}
      animate
    />
  );
}
