export function getAdminAccess(roles: readonly string[]) {
  const isAdmin = roles.includes("admin");
  const isArticleEditor = roles.includes("article_editor") && !isAdmin;
  return { isAdmin, isArticleEditor, canAccessAdmin: isAdmin || isArticleEditor };
}
export function isArticleEditorPath(path: string) {
  return /^\/admin\/articles(?:\/[^/]+)?\/?$/.test(path);
}
