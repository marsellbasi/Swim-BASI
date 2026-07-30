# Storefront build-output comparison

Baseline commit: `13d02e46502b3ded04be6207ff2cb0c92ae4aad9`

Comparison build: feature branch with `PUBLIC_SANITY_CONTENT_ENABLED=true` against the empty public
dataset, exercising the remote query and complete local fallback path.

| Metric             |   Baseline | Feature branch | Difference |
| ------------------ | ---------: | -------------: | ---------: |
| Output files       |        162 |            162 |          0 |
| HTML bytes         |    259,418 |        258,836 |       -582 |
| CSS bytes          |     16,639 |         17,855 |     +1,216 |
| Total output bytes | 24,785,203 |     24,785,592 |       +389 |

The generated output increases by 389 bytes overall (approximately 0.0016%). No client-side Sanity
JavaScript bundle is emitted because content is queried at static build time. Sanity images use CDN
responsive transforms only when CMS content is enabled and available. Below-the-fold images remain
lazy, video defaults to `preload="metadata"`, and the fallback build retains the existing local media.
