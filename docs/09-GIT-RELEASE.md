# Actual PRD Git/GitHub workflow — current user authorization
Source: original PDF p3 §§10–11, p4 §§14/16. The old all-Git-later/HOLD is superseded.
The PDF requires meaningful development history, not a number of pushes, mandatory PRs,
signed commits or CI product choices. Normal safe pushing is now requested when the user
supplies the intended repository and credentials/access are available.

## Before writes
First audit: inspect actual root, status, branches, log, remotes, permissions and whether
private references/secrets are tracked. Do not leak credentials in reports/commands.
A new repository can have a minimal master bootstrap (ignore/README/current instructions),
not a finished application dump. All actual feature/audit corrections are on feature/*.
If an existing repository uses main/protection/unrelated history, agree a non-destructive
integration plan before changing defaults; preserve history and dirty user work. Obtain
missing commit identity from the user; never invent identity or set global config.

## During real development
1. Feature branch from current working integrated master, e.g. feature/ui-requirements-audit.
2. One coherent logical change with relevant tests/docs per commit, convention:
   <type>(<scope>): <short description>. No arbitrary count or backdated history.
3. Test and review feature; log requirement IDs and actual command results.
4. Push the explicit branch when the user-supplied remote/access is verified. Report
   exact refs/commit range and dependencies. Do not wait to create history at the end.
5. Integrate passing feature into master using repo policy; preserve meaningful commits.
   --no-ff is a useful proposal, not a PDF mandate. A protected branch may require PR
   review; don't bypass it. Re-run relevant checks on the merge result before pushing
   integrated master. The next feature starts from this integrated baseline.

Examples: feature/project-foundation, feature/i18n-theme-shell,
feature/passenger-auth, feature/ride-requests, feature/tesla-pooling,
feature/driver-flow, feature/ride-history-charts, feature/ui-api-integration.
Names are examples; natural feature/test slices matter more than cosmetic branches.

## Remote setup and pushing
Read GITHUB_REPOSITORY.md. No repo URL exists in this package. Do not guess a destination.
User pastes intended URL; inspect remote history/default/protected branches and actual
write access. If mismatch with existing origin, pause rather than overwrite it. Do not
initialize GitHub with conflicting generated history automatically. Repo creation or
visibility changes are separate actions, not implicit permission from a project name.

User authorizes normal scoped branch/integration pushes to the supplied verified repo;
no repeated blanket HOLD or needless per-commit permission loops. Still honor runtime
approval dialogs and pause on conflicts or material scope change. Use explicit refs;
no --all/--mirror/force-push/delete. Fetch/inspect before syncing; never an unreviewed
pull/rebase of unrelated changes. Ancestor commits can accompany a push; explain their
scope. Record failed pushes honestly; local commits are not proof of remote publication.

Before every publication: staged diff/secret scan, reference/license/privacy review,
actual relevant tests, expected remote/ref, and safe commit boundary. Ignore private
PDF/archives by default. Copy permitted artwork into runtime-owned assets. Public demo
credentials are explicit fixtures, never real passwords or hidden auto-production seeds.

## Final integration, audit and release
All requested core+extras integrated -> full original-PDF/user-scope audit -> pre-release
for integration fixes/docs/Docker/deployment checks -> clean retest -> release/v1.0.0
from verified pre-release. Push actual branches to the correct repo with evidence.
Tags alone don't replace the required release branch. No invented GitHub/video URLs.
Optional scale discussion follows core/extras, without building that infrastructure.
Video remains deferred until the user requests it after implementation. Release may be
ready for later recording, but final full submission is not complete until its required
video/access/docs checks are satisfied. Record human understanding as human validation.
