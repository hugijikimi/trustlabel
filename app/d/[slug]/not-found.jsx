export default function DisclosureNotFound() {
  // Centres itself rather than relying on the root layout's flex column, so it
  // lands in the middle whatever wraps it.
  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-[28px] leading-none font-semibold text-ink">404</p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          이 주소로 공개된 정보공개가 없습니다.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
          No disclosure is published at this address.
        </p>
      </div>
    </main>
  );
}
