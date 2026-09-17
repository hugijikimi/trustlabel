import LoginForm from "@/components/LoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Sign in · TrustLabel" };

const LINK_FAILED =
  "That sign-in link didn't work. Links expire, can only be used once, and must be opened in the same browser you asked for them from. Send yourself a new one.";

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;   // a Promise in Next 15+

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <LoginForm initialError={error === "auth" ? LINK_FAILED : ""} />
      </main>
      <SiteFooter />
    </>
  );
}
