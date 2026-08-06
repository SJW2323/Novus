import { ProductNav } from "@/components/product-nav";
import { createClient } from "@/lib/supabase/server";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ProductNav isAdmin={isAdmin} />
      <main className="flex-1 bg-secondary/20">{children}</main>
    </div>
  );
}
