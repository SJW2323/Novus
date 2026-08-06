import { createClient } from "@/lib/supabase/server";
import { CONTENT_FIELDS, getSiteContent } from "@/lib/site-content";
import { AdminContentEditor } from "@/components/admin-content-editor";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const content = await getSiteContent(supabase);

  const fields = CONTENT_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    value: content[f.key],
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Content</h1>
      <p className="mt-1 text-muted-foreground">
        Edit the copy shown on the public site. Changes go live immediately.
      </p>

      <div className="mt-8">
        <AdminContentEditor fields={fields} />
      </div>
    </div>
  );
}
