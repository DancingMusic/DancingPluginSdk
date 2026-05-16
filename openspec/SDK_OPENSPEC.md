# OpenSpec: DancingPluginSdk

- Spec-ID: `dancing-plugin-sdk-openspec`
- Version: `1.0.0`
- Status: `Active`
- Last-Updated: `2026-05-16`

## Scope

Defines plugin SDK boundary, compatibility policy, and release process.

## MUST

- Keep package independently buildable with `npm run build`.
- Keep plugin-facing types and lifecycle contracts backward compatible under SemVer.
- Keep public exports centralized in `src/index.ts`.

## MUST NOT

- Include host runtime/UI implementation.
- Depend on `DancingStoreSdk` or `MusicStoreSdk` internals.

## Release

1. Run `npm run typecheck && npm run build`.
2. Update README and changelog.
3. Publish version tag and package.
