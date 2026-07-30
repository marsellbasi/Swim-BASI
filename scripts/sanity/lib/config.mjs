/* global process */
import { createClient } from '@sanity/client';

export const projectId = 'xcfqfknc';
export const dataset = 'production';
export const apiVersion = '2026-07-30';
export const tokenAvailable = Boolean(process.env.SANITY_API_WRITE_TOKEN?.trim());

export function parseMode(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const dryRun = argv.includes('--dry-run') || !apply;
  const resume = argv.includes('--resume');
  if (apply && dryRun) throw new Error('Choose either --dry-run or --apply.');
  return { apply, dryRun, resume };
}

export function assertMutationSafety(mode) {
  if (!mode.apply) return;
  if (!tokenAvailable) {
    throw new Error('SANITY_API_WRITE_TOKEN is unavailable. No remote mutation was attempted.');
  }
  assertExpectedTarget(projectId, dataset);
}

export function assertExpectedTarget(candidateProjectId, candidateDataset) {
  if (candidateProjectId !== 'xcfqfknc' || candidateDataset !== 'production') {
    throw new Error(
      `Refusing mutation: expected xcfqfknc/production, received ${candidateProjectId}/${candidateDataset}.`,
    );
  }
}

export function migrationClient() {
  if (!tokenAvailable) throw new Error('SANITY_API_WRITE_TOKEN is unavailable.');
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
    perspective: 'raw',
  });
}

export const draftId = (id) => (id.startsWith('drafts.') ? id : `drafts.${id}`);
export const ids = {
  singleton: (type) => type,
  category: (slug) => `swim-basi.productCategory.${slug}`,
  collection: (slug) => `swim-basi.productCollection.${slug}`,
  product: (slug) => `swim-basi.product.${slug}`,
  campaign: (slug) => `swim-basi.campaign.${slug}`,
  brandFilm: (slug) => `swim-basi.brandFilm.${slug}`,
};
