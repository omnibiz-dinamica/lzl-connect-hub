<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use URL language segments as the source of truth for shared Dutch/French page components, so navigation and copy remain consistent.
- Keep business data and indicative pricing in the shared configuration module; unapproved example rates must remain explicitly labelled.
- Submit quote, contact and job requests through validated, rate-limited server functions and service-role-only tables; CVs stay in private storage to protect personal data.
- Store optional n8n delivery status alongside each lead; an external delivery failure must not discard a saved request.
- Keep all visual tokens and custom layout classes in the global stylesheet, so the brand stays consistent across pages.
