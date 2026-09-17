import LoginForm from "@/components/LoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Sign in · TrustLabel" };

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;   // a Promise in Next 15+

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <LoginForm linkFailed={error === "auth"} />
      </main>
      <SiteFooter />
    </>
  );
}
