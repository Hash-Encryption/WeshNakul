import { FOOD_CATEGORIES, normalizeCategorySelection, toggleCategorySelection } from '../consensus';

const ids=FOOD_CATEGORIES.map(category=>category.id),wildcards=FOOD_CATEGORIES.filter(category=>category.isWildcard);
if(new Set(ids).size!==ids.length)throw new Error('Category identifiers must be unique');
if(wildcards.length!==1||wildcards[0].id!=='flexible')throw new Error('Flexible must remain the only wildcard');
const anything=toggleCategorySelection(['burger','pizza'],'flexible');
if(anything.join()!=='flexible')throw new Error('Anything must replace real categories');
const burger=toggleCategorySelection(anything,'burger');
if(burger.join()!=='burger')throw new Error('A real category must replace Anything');
if(normalizeCategorySelection(['pizza','flexible','burger']).join()!=='flexible')throw new Error('Submitted payload must keep Anything exclusive');
console.log('✓ Category catalog and exclusive wildcard contract passed; consensus is tested at the database boundary.');
