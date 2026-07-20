import { ProductNav } from "@/components/product-nav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ProductNav />
      <main className="flex-1 bg-secondary/20">{children}</main>
    </div>
  );
}
