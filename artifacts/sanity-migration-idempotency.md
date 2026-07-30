# Sanity migration idempotency

Generated: 2026-07-30T10:08:05.232Z

Target: `xcfqfknc/production`

## First apply

- Assets created: 123 (122 images and one file)
- Assets reused: 0
- Draft documents created: 58
- Draft documents updated: 0

## Second apply

- Assets created: 0
- Assets reused: 123
- Draft documents created: 0
- Draft documents updated: 2
- Draft documents unchanged: 56

The two legitimate updates attached the live Instagram grid's green portrait, restored its exact
four-tile order, and attached the existing black portrait as the brand-film fallback image.

## Convergence apply

- Assets created: 0
- Assets reused: 123
- Draft documents created: 0
- Draft documents updated: 0
- Draft documents unchanged: 58
- Duplicate documents: 0
- Duplicate exact-content assets: 0

The final verification passed with all 393 references resolved.
