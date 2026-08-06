import { createClient } from "@/lib/supabase/server";
import {
  CONTENT_FIELDS,
  THEME_FIELDS,
  getSiteContent,
  getSiteTheme,
} from "@/lib/site-content";
import { AdminContentEditor } from "@/components/admin-content-editor";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const [content, theme] = await Promise.all([
    getSiteContent(supabase),
    getSiteTheme(supabase),
  ]);

  const fields = CONTENT_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    value: content[f.key],
  }));

  const themeFields = THEME_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    value: theme[f.key],
    type: f.type,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Content</h1>
      <p className="mt-1 text-muted-foreground">
        Edit the copy and brand colours shown on the public site. Changes go
        live immediately.
      </p>

      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold">Brand colours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applied site-wide — buttons, links, and glow effects.
        </p>
        <div className="mt-4">
          <AdminContentEditor fields={themeFields} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold">Copy</h2>
        <div className="mt-4">
          <AdminContentEditor fields={fields} />
        </div>
      </div>
    </div>
  );
}
