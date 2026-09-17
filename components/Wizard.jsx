"use client";

import { useState } from "react";
import LabelPreview from "@/components/LabelPreview";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { publish, save } from "@/lib/disclosures";
import { supabase } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

const AI_CRITERIA = ["detail", "photo", "recency", "helpful", "purchase"];

const STEPS = [
  { key: "q1", field: "reviewer_scope", options: ["verified", "members", "anyone"] },
  { key: "q2", field: "posting_period", options: ["permanent", "until_requested", "3years", "1year"] },
  { key: "q3", field: "uses_ai_ranking", options: [true, false] },
  { key: "q4", field: "deletion_criteria", options: ["policy", "ads", "defamation", "onrequest"] },
  { key: "q5", field: "external_choice", options: [true, false] },
];

const INITIAL = {
  reviewer_scope: null,
  posting_period: null,
  uses_ai_ranking: null,
  ai_criteria: [],
  deletion_criteria: null,
  external_choice: null, // yes/no — the platform name lives in external_name
  external_name: "",
};

/** A saved row → wizard state, for /wizard?id=… */
function fromRow(row) {
  if (!row) return INITIAL;
  return {
    reviewer_scope: row.reviewer_scope,
    posting_period: row.posting_period,
    uses_ai_ranking: row.uses_ai_ranking,
    ai_criteria: row.ai_criteria ?? [],
    deletion_criteria: row.deletion_criteria,
    external_choice: Boolean(row.external_sources),
    external_name: row.external_sources ?? "",
  };
}

/** Wizard state → the shape lib/generate.js expects. */
function toAnswers(state) {
  return {
    reviewer_scope: state.reviewer_scope,
    posting_period: state.posting_period,
    uses_ai_ranking: state.uses_ai_ranking,
    ai_criteria: state.ai_criteria,
    deletion_criteria: state.deletion_criteria,
    external_sources:
      state.external_choice === true && state.external_name.trim()
        ? state.external_name.trim()
        : null,
  };
}

function canAdvance(step, state) {
  switch (step) {
    case 0:
      return Boolean(state.reviewer_scope);
    case 1:
      return Boolean(state.posting_period);
    case 2:
      return (
        state.uses_ai_ranking === false ||
        (state.uses_ai_ranking === true && state.ai_criteria.length > 0)
      );
    case 3:
      return Boolean(state.deletion_criteria);
    case 4:
      return (
        state.external_choice === false ||
        (state.external_choice === true && state.external_name.trim().length > 0)
      );
    default:
      return true;
  }
}

function OptionCard({ label, note, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[56px] w-full flex-col justify-center gap-0.5 rounded-card border-[1.5px] px-4 py-3 text-left transition-colors ${
        selected
          ? "border-ink bg-seal-tint"
          : "border-rule bg-card hover:border-rule-strong"
      }`}
    >
      <span className="text-[15px] font-medium text-ink">{label}</span>
      <span className="text-[13px] leading-snug text-ink-muted">{note}</span>
    </button>
  );
}

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 rounded-full transition-all ${
            index === current
              ? "w-6 bg-ink"
              : index < current
                ? "w-1.5 bg-ink-muted"
                : "w-1.5 bg-rule-strong"
          }`}
        />
      ))}
    </div>
  );
}

export default function Wizard({ initial = null }) {
  const { t } = useLang();
  const [state, setState] = useState(() => fromRow(initial));
  // Editing opens on the finished label with Save in reach; Back still walks
  // every question. Starting a returning seller at question one would make
  // changing one answer cost five clicks.
  const [step, setStep] = useState(initial ? STEPS.length : 0);
  const [shopName, setShopName] = useState(initial?.shop_name ?? "");
  const [record, setRecord] = useState(initial);
  const [status, setStatus] = useState("idle"); // idle | saving | publishing
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const answers = toAnswers(state);
  const done = step >= STEPS.length;
  const current = done ? null : STEPS[step];

  function choose(field, value) {
    setState((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    setStatus("saving");
    setError("");

    const { data, error: saveError } = await save(supabase, {
      id: record?.id,
      shopName,
      answers,
    });

    setStatus("idle");
    if (saveError) {
      setError(saveError.message ?? String(saveError));
      return;
    }
    setRecord(data);
  }

  async function handlePublish() {
    setStatus("publishing");
    setError("");

    const { data, error: publishError } = await publish(supabase, record.id);

    setStatus("idle");
    if (publishError) {
      setError(publishError.message ?? String(publishError));
      return;
    }
    setRecord(data);
  }

  async function handleCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the URL is on screen to copy by hand */
    }
  }

  function toggleCriterion(value) {
    setState((previous) => {
      const picked = previous.ai_criteria.includes(value)
        ? previous.ai_criteria.filter((item) => item !== value)
        : [...previous.ai_criteria, value];
      // Keep the canonical order so the generated Korean reads the same way
      // however the seller clicked.
      return { ...previous, ai_criteria: AI_CRITERIA.filter((item) => picked.includes(item)) };
    });
  }

  return (
    <>
      <SiteHeader width="max-w-6xl" />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          {done ? (
            <div>
              <h1 className="font-display text-[28px] leading-tight font-semibold text-ink">
                {t("wizard_done_title")}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                {t("wizard_done_body")}
              </p>

              <div className="mt-8">
                <label htmlFor="shop-name" className="block text-[15px] font-medium text-ink">
                  {t("final_shop_label")}
                </label>
                <input
                  id="shop-name"
                  type="text"
                  value={shopName}
                  onChange={(event) => setShopName(event.target.value)}
                  placeholder={t("final_shop_placeholder")}
                  autoComplete="organization"
                  className="mt-2 w-full rounded-lg border border-rule bg-card px-4 py-3 text-base text-ink outline-none focus:border-ink"
                />
                <p className="mt-2 text-[13px] text-ink-muted">{t("final_shop_help")}</p>
              </div>

              {error ? (
                <p role="alert" className="mt-4 text-[13px] leading-relaxed text-brick">
                  {t("final_error")} {error}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!shopName.trim() || status !== "idle"}
                  className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
                >
                  {status === "saving" ? t("final_saving") : t("final_save")}
                </button>

                {record && !record.published ? (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={status !== "idle"}
                    className="rounded-lg border-[1.5px] border-rule-strong bg-card px-5 py-2.5 text-sm text-ink disabled:opacity-40"
                  >
                    {status === "publishing" ? t("final_publishing") : t("final_publish")}
                  </button>
                ) : null}
              </div>

              {record ? (
                <div className="mt-6 rounded-card border border-rule bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        record.published
                          ? "rounded-full bg-seal-tint px-2.5 py-1 text-[12px] font-medium text-seal"
                          : "rounded-full border border-rule bg-paper px-2.5 py-1 text-[12px] font-medium text-ink-muted"
                      }
                    >
                      {record.published ? t("status_live") : t("status_draft")}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      {record.published ? t("final_live") : t("final_saved")}
                    </span>
                  </div>

                  <p className="mt-4 text-[12px] text-ink-muted">{t("final_url_label")}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <code className="rounded-lg bg-paper px-3 py-2 text-[13px] break-all text-ink">
                      {`${window.location.origin}/d/${record.slug}`}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/d/${record.slug}`)}
                      className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
                    >
                      {copied ? t("final_copied") : t("final_copy")}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule pt-6">
                <button
                  type="button"
                  onClick={() => setStep(STEPS.length - 1)}
                  className="rounded-lg border-[1.5px] border-rule-strong bg-card px-5 py-2.5 text-sm text-ink"
                >
                  {t("wizard_back")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setState(INITIAL);
                    setStep(0);
                    setShopName("");
                    setRecord(null);
                    setError("");
                  }}
                  className="rounded-lg border-[1.5px] border-rule-strong bg-card px-5 py-2.5 text-sm text-ink"
                >
                  {t("wizard_restart")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <ProgressDots total={STEPS.length} current={step} />

              <p className="mt-6 text-[12px] text-ink-muted">
                {t("wizard_step", { n: step + 1, total: STEPS.length })}
              </p>
              <h1 className="mt-2 font-display text-[28px] leading-tight font-semibold text-ink">
                {t(`${current.key}_title`)}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                {t(`${current.key}_help`)}
              </p>

              <div className="mt-6 grid gap-3">
                {current.options.map((option) => (
                  <OptionCard
                    key={String(option)}
                    label={t(`${current.key}_${option}`)}
                    note={t(`${current.key}_${option}_note`)}
                    selected={state[current.field] === option}
                    onSelect={() => choose(current.field, option)}
                  />
                ))}
              </div>

              {step === 2 && state.uses_ai_ranking === true ? (
                <div className="mt-8 border-t border-rule pt-6">
                  <h2 className="text-[17px] font-semibold text-ink">
                    {t("q3_criteria_title")}
                  </h2>
                  <p className="mt-1 text-[13px] text-ink-muted">{t("q3_criteria_help")}</p>
                  <div className="mt-4 grid gap-3">
                    {AI_CRITERIA.map((criterion) => (
                      <OptionCard
                        key={criterion}
                        label={t(`q3_${criterion}`)}
                        note={t(`q3_${criterion}_note`)}
                        selected={state.ai_criteria.includes(criterion)}
                        onSelect={() => toggleCriterion(criterion)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 4 && state.external_choice === true ? (
                <div className="mt-8 border-t border-rule pt-6">
                  <label
                    htmlFor="external-name"
                    className="block text-[15px] font-medium text-ink"
                  >
                    {t("q5_name_label")}
                  </label>
                  <input
                    id="external-name"
                    type="text"
                    value={state.external_name}
                    onChange={(event) => choose("external_name", event.target.value)}
                    placeholder={t("q5_name_placeholder")}
                    autoComplete="off"
                    className="mt-2 w-full rounded-lg border border-rule bg-card px-4 py-3 text-base text-ink outline-none focus:border-ink"
                  />
                  <p className="mt-2 text-[13px] text-ink-muted">{t("q5_name_help")}</p>
                </div>
              ) : null}

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep((n) => Math.max(0, n - 1))}
                  disabled={step === 0}
                  className="rounded-lg border-[1.5px] border-rule-strong bg-card px-5 py-2.5 text-sm text-ink disabled:opacity-40"
                >
                  {t("wizard_back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep((n) => n + 1)}
                  disabled={!canAdvance(step, state)}
                  className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
                >
                  {step === STEPS.length - 1 ? t("wizard_finish") : t("wizard_next")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="mb-3 text-[12px] text-ink-muted">{t("preview_caption")}</p>
          <LabelPreview
            answers={answers}
            shopName={shopName}
            shopPlaceholder={t("preview_shop_placeholder")}
          />
        </div>
      </div>
      </main>
      <SiteFooter width="max-w-6xl" />
    </>
  );
}
