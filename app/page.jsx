import fs from "node:fs";
import path from "node:path";
import Landing from "@/components/Landing";

// Recomputed hourly so the countdown does not freeze at build time.
export const revalidate = 3600;

export const metadata = {
  title: "TrustLabel — 사용후기 정보공개, 90초면 끝납니다",
  description:
    "Korean online sellers must publish how they handle customer reviews by 22 October 2026. TrustLabel turns that into five questions, a public page, and one line of HTML.",
};

const DEADLINE = Date.UTC(2026, 9, 22); // 22 October 2026
const SHOT_FILES = ["wizard.png", "public-page.png", "embed.png"];

function daysUntilDeadline() {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((DEADLINE - today) / 86_400_000);
}

export default function HomePage() {
  // The screenshots are dropped into public/shots/ by hand. Checking here lets
  // the section render a placeholder instead of three broken images.
  const dir = path.join(process.cwd(), "public", "shots");
  const shots = Object.fromEntries(
    SHOT_FILES.map((file) => [file, fs.existsSync(path.join(dir, file))])
  );

  return <Landing daysLeft={daysUntilDeadline()} shots={shots} />;
}
