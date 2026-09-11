import { FOOD_CATEGORIES } from '../consensus';

const ids=FOOD_CATEGORIES.map(category=>category.id),wildcards=FOOD_CATEGORIES.filter(category=>category.isWildcard);
if(new Set(ids).size!==ids.length)throw new Error('Category identifiers must be unique');
if(wildcards.length!==1||wildcards[0].id!=='flexible')throw new Error('Flexible must remain the only wildcard');
console.log('✓ Category catalog and wildcard contract passed; consensus is tested at the database boundary.');
