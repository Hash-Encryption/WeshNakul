import fs from 'node:fs';
import { normalizeJeddahDistrict, JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

console.log('Total Canonical Districts in TS:', JEDDAH_DISTRICT_LIST.length);

// 1. Manqousheh Hut Hira/King Abdulaziz:
// lat: 21.606694, lng: 39.122082, district: "النهضة" (Al Nahdah)
console.log('Normalize "النهضة":', normalizeJeddahDistrict('النهضة'));
console.log('Normalize "Al Nahdah":', normalizeJeddahDistrict('Al Nahdah'));
console.log('Normalize "Al Nahda":', normalizeJeddahDistrict('Al Nahda'));

// 2. Pie Box:
// lat: 21.4868497, lng: 39.23268
// address: "صندوق الفطيرة | Pie Box، طريق الملك عبدالله، &، الأمير ماجد، جدة"
// Intersection: King Abdullah Rd & Prince Majid Rd
// What district is King Abdullah Rd & Prince Majid Rd in Jeddah?
// Prince Majid Rd & King Abdullah Rd is next to Al Fayha / Al Sulaimaniyah / Al Wurud / Bani Malik / Al Sharafeyah / Al Naseem!
// In our raw data:
// Shobak Andalus Mall is at Prince Majid Rd, Al Fayha (lat 21.50696, lng 39.21797)
// Al Hatab Naseem is at King Abdullah Rd, An Naseem (lat 21.511237, lng 39.22709)
// Mathaq Al Manousheh Fayha is at Abdullah Sulayman St, Al Fayha (lat 21.48963, lng 39.22463)
// Fatayer Al Ameen Fayha is at Zainab bint Maslamah, Al Fayha (lat 21.48764, lng 39.22368)
// Let's check Pie Box coordinates: 21.4868497, 39.23268.
// Notice that 21.4868497, 39.23268 is less than 900 meters from Fatayer Al Ameen Fayha (21.48764, 39.22368)!
// Let's check what neighborhood is at 21.4868497, 39.23268!
