import { getDb } from '../database/database';
import type { PremiumContent } from '../types';
import { mapPremium } from './mappers';

export function getActivePremiumContent(): PremiumContent[] {
  const rows = getDb()
    .prepare('SELECT * FROM premium_content WHERE active = 1 ORDER BY id ASC')
    .all() as Parameters<typeof mapPremium>[0][];
  return rows.map(mapPremium);
}
