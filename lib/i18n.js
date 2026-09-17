/**
 * UI copy. One flat object per language, identical keys in both.
 *
 * This is chrome only. The generated disclosure is ALWAYS Korean, whatever is
 * selected here — that is a legal requirement, not a preference, and it lives
 * in lib/generate.js, which takes no language argument.
 */

export const LANGS = ["ko", "en"];
export const DEFAULT_LANG = "ko";

export const COPY = {
  en: {
    brand: "TrustLabel",

    lang_toggle_label: "Language",
    lang_en: "EN",
    lang_ko: "KO",

    wizard_step: "Question {n} of {total}",
    wizard_back: "Back",
    wizard_next: "Next",
    wizard_finish: "Finish",
    wizard_restart: "Start over",
    wizard_skip_note: "Answer to continue.",
    wizard_done_title: "That's your disclosure.",
    wizard_done_body:
      "Five questions, done. Saving it and publishing a public page come next.",

    preview_caption: "Preview — always Korean, whatever language this page is in.",
    preview_shop_placeholder: "Your shop",

    q1_title: "Who can write a review?",
    q1_help: "The people you allow to post a review at all.",
    q1_verified: "Confirmed buyers only",
    q1_verified_note: "You can see the order behind the review.",
    q1_members: "Members",
    q1_members_note: "Anyone who has finished signing up.",
    q1_anyone: "Anyone",
    q1_anyone_note: "No account and no purchase required.",

    q2_title: "How long do reviews stay up?",
    q2_help: "How long a published review stays visible.",
    q2_permanent: "Indefinitely",
    q2_permanent_note: "Stays up until someone asks for it to come down.",
    q2_until_requested: "Until the writer asks",
    q2_until_requested_note: "Removed when the person who wrote it requests it.",
    q2_3years: "Three years",
    q2_3years_note: "Counted from the day it was written.",
    q2_1year: "One year",
    q2_1year_note: "Counted from the day it was written.",

    q3_title: "Does an algorithm decide which reviews show first?",
    q3_help: "If the order is not simply newest-first, you have to say so.",
    q3_true: "Yes, we rank them",
    q3_true_note: "Something decides what a shopper sees at the top.",
    q3_false: "No, newest first",
    q3_false_note: "Reviews appear in the order they were written.",
    q3_criteria_title: "What does the ranking use?",
    q3_criteria_help: "Pick every one that applies.",
    q3_detail: "How detailed it is",
    q3_detail_note: "Length and specificity of the text.",
    q3_photo: "Photos or video",
    q3_photo_note: "Whether the review has media attached.",
    q3_recency: "How recent it is",
    q3_recency_note: "When the review was written.",
    q3_helpful: "Helpful votes",
    q3_helpful_note: "How many shoppers marked it helpful.",
    q3_purchase: "Confirmed purchase",
    q3_purchase_note: "Whether the order behind it is verified.",

    q4_title: "When do you take a review down?",
    q4_help: "The reason you would remove or hide a review.",
    q4_policy: "It breaks your shop rules",
    q4_policy_note: "Against the operating policy you published.",
    q4_ads: "It's advertising",
    q4_ads_note: "Promotional content dressed up as a review.",
    q4_defamation: "It's abusive",
    q4_defamation_note: "Insults, slander or defamation.",
    q4_onrequest: "The writer asks",
    q4_onrequest_note: "Taken down at the request of whoever wrote it.",

    q5_title: "Do you show reviews from another platform?",
    q5_help: "Reviews pulled in from a marketplace or a review service.",
    q5_true: "Yes",
    q5_true_note: "You display reviews collected somewhere else.",
    q5_false: "No",
    q5_false_note: "Only reviews written on your own shop.",
    q5_name_label: "Which platform?",
    q5_name_placeholder: "e.g. Naver Smart Store",
    q5_name_help: "This appears in the disclosure exactly as you type it.",

    final_shop_label: "Shop name",
    final_shop_placeholder: "e.g. Happy Mall",
    final_shop_help: "Shown under the disclosure and on the public page.",
    final_save: "Save",
    final_saving: "Saving\u2026",
    final_saved: "Saved as a draft. Publish it to make the page readable.",
    final_publish: "Publish",
    final_publishing: "Publishing\u2026",
    final_live: "Live. Anyone with the link can read it.",
    final_url_label: "Public page",
    final_copy: "Copy",
    final_copied: "Copied",
    final_error: "Couldn't save.",
    status_draft: "Draft",
    status_live: "Live",

    dash_title: "Your disclosures",
    dash_new: "New disclosure",
    dash_signed_in: "Signed in as {email}",
    dash_load_error: "Couldn't load your disclosures.",
    dash_empty_line: "Nothing here yet. Five questions and you'll have one.",
    dash_empty_button: "Start the wizard",
    card_updated: "Updated {date}",
    card_edit: "Edit",
    card_publish: "Publish",
    card_unpublish: "Unpublish",
    card_delete: "Delete",
    card_delete_ask: "Delete this for good?",
    card_delete_yes: "Delete",
    card_delete_no: "Keep it",
    card_error: "That didn't work.",
    card_working: "Working\u2026",

    disclaimer:
      "This is a draft generated for demonstration. It is not legal advice and has not been reviewed by a lawyer.",

    landing_headline: "Your reviews policy, published in 90 seconds.",
    landing_sub:
      "Answer five questions. TrustLabel writes the Korean disclosure, publishes it at its own address, and gives you one line of HTML to paste into your shop.",
    landing_cta: "Join the waitlist",
    nav_signin: "Sign in",
    landing_countdown: "{days} days until 22 October 2026",
    landing_countdown_past: "The deadline has passed",

    problem_title: "What changes on 22 October 2026",
    problem_body:
      "Korean online sellers must publish how they handle customer reviews: who may write them, how long they stay up, whether an algorithm decides their order, and when they get removed. The requirement is 전자상거래법 제21조의4. Failing to meet it carries a penalty of up to ₩10,000,000.",

    solution_title: "What TrustLabel does",
    solution_body:
      "Five questions, then a disclosure written in Korean — whatever language you answered in, because it is Korean consumers who have to be able to read it.",
    solution_example: "An example, generated from a fictional shop's answers:",

    screens_title: "Three screens, start to finish",
    screen_wizard: "Answer five questions",
    screen_public: "Publish a public page",
    screen_embed: "Paste one line",
    screen_missing: "Screenshot not added yet",

    waitlist_title: "Join the waitlist",
    waitlist_body: "We'll email you when it opens up. Only the address is required.",
    waitlist_email: "Email",
    waitlist_email_placeholder: "you@example.com",
    waitlist_shop: "Shop name",
    waitlist_shop_optional: "Shop name (optional)",
    waitlist_shop_placeholder: "e.g. Happy Mall",
    waitlist_platform: "Platform (optional)",
    waitlist_platform_none: "Choose one",
    waitlist_platform_cafe24: "Cafe24",
    waitlist_platform_naver: "Naver",
    waitlist_platform_imweb: "Imweb",
    waitlist_platform_other: "Something else",
    waitlist_submit: "Join the waitlist",
    waitlist_submitting: "Joining\u2026",
    waitlist_done_title: "You're on the list.",
    waitlist_done_body: "We'll be in touch at {email}.",
    waitlist_already_title: "You're already on the list.",
    waitlist_invalid:
      "That doesn't look like an email address — check for a missing @ or a typo in the domain.",
    waitlist_error: "We couldn't add you just now. Try again in a moment.",
  },

  ko: {
    brand: "TrustLabel",

    lang_toggle_label: "언어",
    lang_en: "EN",
    lang_ko: "KO",

    wizard_step: "질문 {n} / {total}",
    wizard_back: "이전",
    wizard_next: "다음",
    wizard_finish: "완료",
    wizard_restart: "처음부터",
    wizard_skip_note: "답변을 선택하면 다음으로 넘어갑니다.",
    wizard_done_title: "정보공개 문안이 완성되었습니다.",
    wizard_done_body:
      "질문 다섯 개로 끝났습니다. 저장하고 공개 페이지를 만드는 것은 다음 단계입니다.",

    preview_caption: "미리보기 — 화면 언어와 관계없이 항상 한국어로 생성됩니다.",
    preview_shop_placeholder: "내 쇼핑몰",

    q1_title: "누가 후기를 작성할 수 있나요?",
    q1_help: "후기를 남길 수 있는 사람의 범위입니다.",
    q1_verified: "구매가 확인된 고객만",
    q1_verified_note: "결제 내역이 확인되는 고객만 작성합니다.",
    q1_members: "회원",
    q1_members_note: "회원 가입을 마친 고객이면 작성할 수 있습니다.",
    q1_anyone: "누구나",
    q1_anyone_note: "가입이나 구매 없이도 작성할 수 있습니다.",

    q2_title: "후기는 얼마 동안 게시되나요?",
    q2_help: "등록된 후기가 노출되는 기간입니다.",
    q2_permanent: "기간 제한 없이",
    q2_permanent_note: "삭제 요청이 있기 전까지 계속 게시됩니다.",
    q2_until_requested: "작성자가 요청할 때까지",
    q2_until_requested_note: "작성자가 삭제를 요청하면 내립니다.",
    q2_3years: "3년",
    q2_3years_note: "작성일로부터 3년간 게시됩니다.",
    q2_1year: "1년",
    q2_1year_note: "작성일로부터 1년간 게시됩니다.",

    q3_title: "알고리즘이 후기 노출 순서를 정하나요?",
    q3_help: "최신순이 아니라면 그 기준을 공개해야 합니다.",
    q3_true: "네, 순위를 조정합니다",
    q3_true_note: "상단에 보이는 후기를 별도 기준으로 정합니다.",
    q3_false: "아니요, 최신순입니다",
    q3_false_note: "작성된 순서대로 표시합니다.",
    q3_criteria_title: "어떤 기준을 사용하나요?",
    q3_criteria_help: "해당하는 항목을 모두 선택하세요.",
    q3_detail: "후기의 구체성",
    q3_detail_note: "글의 분량과 내용의 구체성입니다.",
    q3_photo: "사진·영상",
    q3_photo_note: "사진이나 영상이 첨부되었는지 봅니다.",
    q3_recency: "작성 시점",
    q3_recency_note: "얼마나 최근에 작성되었는지 봅니다.",
    q3_helpful: "도움돼요 수",
    q3_helpful_note: "다른 고객이 도움된다고 표시한 수입니다.",
    q3_purchase: "구매 확인 여부",
    q3_purchase_note: "실제 결제가 확인되었는지 봅니다.",

    q4_title: "어떤 경우에 후기를 삭제하나요?",
    q4_help: "후기를 삭제하거나 비공개로 전환하는 기준입니다.",
    q4_policy: "운영정책 위반",
    q4_policy_note: "쇼핑몰이 공지한 운영정책을 어긴 경우입니다.",
    q4_ads: "광고·홍보성 내용",
    q4_ads_note: "후기를 가장한 광고나 홍보입니다.",
    q4_defamation: "욕설·비방",
    q4_defamation_note: "욕설, 비방, 명예훼손에 해당하는 경우입니다.",
    q4_onrequest: "작성자의 삭제 요청",
    q4_onrequest_note: "작성자가 직접 삭제를 요청한 경우입니다.",

    q5_title: "외부 플랫폼의 후기도 함께 표시하나요?",
    q5_help: "다른 마켓이나 후기 서비스에서 가져온 후기입니다.",
    q5_true: "네",
    q5_true_note: "외부에서 수집한 후기를 함께 보여줍니다.",
    q5_false: "아니요",
    q5_false_note: "자사 쇼핑몰에 작성된 후기만 표시합니다.",
    q5_name_label: "어떤 플랫폼인가요?",
    q5_name_placeholder: "예: 네이버 스마트스토어",
    q5_name_help: "정보공개 문안에 입력한 그대로 표시됩니다.",

    final_shop_label: "쇼핑몰 이름",
    final_shop_placeholder: "예: 해피몰",
    final_shop_help: "정보공개 문안 아래와 공개 페이지에 표시됩니다.",
    final_save: "저장",
    final_saving: "저장 중\u2026",
    final_saved: "임시저장했습니다. 공개하면 페이지가 열립니다.",
    final_publish: "공개하기",
    final_publishing: "공개하는 중\u2026",
    final_live: "공개 중입니다. 링크가 있으면 누구나 볼 수 있습니다.",
    final_url_label: "공개 페이지",
    final_copy: "복사",
    final_copied: "복사됨",
    final_error: "저장하지 못했습니다.",
    status_draft: "임시저장",
    status_live: "공개",

    dash_title: "내 정보공개",
    dash_new: "새로 만들기",
    dash_signed_in: "{email} 계정으로 로그인했습니다",
    dash_load_error: "목록을 불러오지 못했습니다.",
    dash_empty_line: "아직 없습니다. 질문 다섯 개면 하나 만들 수 있습니다.",
    dash_empty_button: "시작하기",
    card_updated: "{date} 수정",
    card_edit: "수정",
    card_publish: "공개하기",
    card_unpublish: "비공개로",
    card_delete: "삭제",
    card_delete_ask: "정말 삭제할까요?",
    card_delete_yes: "삭제",
    card_delete_no: "그대로 두기",
    card_error: "처리하지 못했습니다.",
    card_working: "처리 중\u2026",

    disclaimer:
      "이 문서는 시연을 위해 생성된 초안입니다. 법률 자문이 아니며 변호사의 검토를 거치지 않았습니다.",

    landing_headline: "사용후기 정보공개, 90초면 끝납니다.",
    landing_sub:
      "질문 다섯 개에 답하면 한국어 정보공개 문안이 만들어지고, 공개 페이지가 생기고, 쇼핑몰에 붙여넣을 HTML 한 줄이 나옵니다.",
    landing_cta: "대기자 명단 신청",
    nav_signin: "로그인",
    landing_countdown: "2026년 10월 22일까지 {days}일",
    landing_countdown_past: "시행일이 지났습니다",

    problem_title: "2026년 10월 22일부터 달라지는 것",
    problem_body:
      "국내 온라인 판매자는 사용후기를 어떻게 다루는지 공개해야 합니다. 누가 작성할 수 있는지, 얼마나 게시되는지, 알고리즘이 노출 순서를 정하는지, 어떤 경우에 삭제하는지입니다. 근거는 전자상거래법 제21조의4이며, 이를 지키지 않으면 최대 1,000만 원의 과태료가 부과될 수 있습니다.",

    solution_title: "TrustLabel이 하는 일",
    solution_body:
      "질문 다섯 개에 답하면 한국어로 된 정보공개 문안이 만들어집니다. 어떤 언어로 답하든 결과는 한국어입니다. 읽어야 하는 사람이 한국 소비자이기 때문입니다.",
    solution_example: "가상의 쇼핑몰 답변으로 만든 예시입니다:",

    screens_title: "처음부터 끝까지, 화면 세 개",
    screen_wizard: "질문 다섯 개에 답하고",
    screen_public: "공개 페이지를 만들고",
    screen_embed: "한 줄을 붙여넣습니다",
    screen_missing: "스크린샷을 아직 넣지 않았습니다",

    waitlist_title: "대기자 명단 신청",
    waitlist_body: "준비되면 메일로 알려드립니다. 이메일만 필수입니다.",
    waitlist_email: "이메일",
    waitlist_email_placeholder: "you@example.com",
    waitlist_shop: "쇼핑몰 이름",
    waitlist_shop_optional: "쇼핑몰 이름 (선택)",
    waitlist_shop_placeholder: "예: 해피몰",
    waitlist_platform: "사용 중인 플랫폼 (선택)",
    waitlist_platform_none: "선택하세요",
    waitlist_platform_cafe24: "카페24",
    waitlist_platform_naver: "네이버",
    waitlist_platform_imweb: "아임웹",
    waitlist_platform_other: "기타",
    waitlist_submit: "신청하기",
    waitlist_submitting: "신청 중\u2026",
    waitlist_done_title: "신청이 완료되었습니다.",
    waitlist_done_body: "{email}로 연락드리겠습니다.",
    waitlist_already_title: "이미 신청하셨습니다.",
    waitlist_invalid: "이메일 주소 형식이 아닙니다. @가 빠졌거나 도메인에 오타가 없는지 확인해 주세요.",
    waitlist_error: "지금은 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  },
};

/** Look up a key, filling {placeholders} from `vars`. */
export function translate(lang, key, vars) {
  const table = COPY[lang] ?? COPY[DEFAULT_LANG];
  const value = table[key] ?? COPY[DEFAULT_LANG][key] ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (whole, name) =>
    name in vars ? String(vars[name]) : whole
  );
}
