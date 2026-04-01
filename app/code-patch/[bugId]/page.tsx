import { redirect } from "next/navigation";

export default async function CodePatchRedirectPage({
  params,
}: {
  params: Promise<{ bugId: string }>;
}) {
  const { bugId } = await params;
  redirect(`/issues/${bugId}`);
}
