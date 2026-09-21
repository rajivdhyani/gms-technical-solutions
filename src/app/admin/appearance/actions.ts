"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isThemeId, setTheme } from "@/lib/theme";

export async function chooseThemeAction(formData: FormData) {
  // Checked here as well as on the page — every mutation guards itself, so a
  // missing check on one route cannot expose an action.
  await requireAdmin();

  const id = formData.get("theme");
  if (!isThemeId(id)) return;

  await setTheme(id);

  // The theme lives on <html> in the root layout, so every page has to be
  // revalidated, not just this one.
  revalidatePath("/", "layout");
}
