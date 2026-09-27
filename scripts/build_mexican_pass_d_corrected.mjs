import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const details = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_mexican_place_details.json'), 'utf8'));

const correctedData = {
  schema_version: 'weshnakul_restaurant_research_v3',
  dataset: {
    name: 'WeshNakul Mexican - Jeddah',
    version: 'V3-PassD-Corrected',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    mode: 'food',
    primary_category: 'mexican',
    display_category: 'Mexican',
    verified_date: '2026-09-27',
    last_verified_at: '2026-09-27',
    brand_count: 14,
    status: 'PASS_WITH_FIELD_VALIDATION_COMPLETE',
    research_standard: 'WeshNakul Restaurant Discovery & Research Requirements V3',
    principles: [
      'recommendation_quality_over_catalog_size',
      'verified_reality_over_completeness',
      'unknown_is_better_than_wrong',
      'delivery_distance_policy_strict_nearby_branch',
      'going_out_distance_policy_mix_nearby_and_destination',
      'branch_count_does_not_equal_recommendation_weight'
    ],
    deck_rules: {
      deck_size: 7,
      guaranteed_anchor_count: 1,
      guaranteed_anchor_pool: ['firegrill'],
      rotating_strong_count: 1,
      rotating_strong_pool: [
        'cocina_la_cantina',
        'eds_taco',
        'speakeasy',
        'chilis',
        'taqado_mexican_kitchen'
      ],
      remaining_slots: 5,
      remaining_selection: 'randomized_from_eligible_nearby_brands_and_branches',
      rules: [
        'Every Mexican deck must contain at least one proven anchor/staple.',
        'Normally FireGrill satisfies the guaranteed anchor slot.',
        'At least one additional strong/popular brand should rotate randomly when eligible.',
        'A deck must not consist entirely of lesser-known/hidden-gem brands.',
        'Anchor and strong-brand card positions should be randomized.',
        'Physical branch selection should use verified geography and favor nearby branches, especially for delivery-oriented restaurants.',
        'The UI must not hard-code a specific branch when a closer verified branch is eligible.',
        'Branch count must NOT create recommendation weight: select brand -> resolve appropriate nearby branch.'
      ]
    },
    summary: {
      total_brands: 14,
      production_ready_brands: 13,
      usable_with_caution_brands: 1,
      manual_review_brands: 0,
      excluded_brands: 0,
      total_candidate_branches: 23,
      total_verified_active_branches: 19,
      production_ready_branches: 15,
      usable_with_caution_branches: 4,
      manual_review_branches: 1,
      excluded_branches: 3,
      canonical_district_active_branches: 17,
      outer_caution_branches: 2,
      canonical_district_total_candidates: 19,
      null_district_total_candidates: 4,
      place_id_completeness: '100.0% (19/19)',
      coordinate_completeness: '100.0% (19/19)',
      maps_url_completeness: '100.0% (19/19)',
      address_completeness: '100.0% (19/19)',
      operating_status_completeness: '100.0% (19/19)',
      rating_completeness: '100.0% (19/19)',
      review_count_completeness: '100.0% (19/19)',
      hours_completeness: '100.0% (19/19)'
    }
  },
  deck_rules: {
    deck_size: 7,
    guaranteed_anchor_count: 1,
    guaranteed_anchor_pool: ['firegrill'],
    rotating_strong_count: 1,
    rotating_strong_pool: [
      'cocina_la_cantina',
      'eds_taco',
      'speakeasy',
      'chilis',
      'taqado_mexican_kitchen'
    ],
    remaining_slots: 5,
    remaining_selection: 'randomized_from_eligible_nearby_brands_and_branches',
    rules: [
      'Every Mexican deck must contain at least one proven anchor/staple.',
      'Normally FireGrill satisfies the guaranteed anchor slot.',
      'At least one additional strong/popular brand should rotate randomly when eligible.',
      'A deck must not consist entirely of lesser-known/hidden-gem brands.',
      'Anchor and strong-brand card positions should be randomized.',
      'Physical branch selection should use verified geography and favor nearby branches, especially for delivery-oriented restaurants.',
      'The UI must not hard-code a specific branch when a closer verified branch is eligible.',
      'Branch count must NOT create recommendation weight: select brand -> resolve appropriate nearby branch.'
    ]
  },
  brands: [
    {
      id: 'firegrill',
      canonical_name: 'FireGrill',
      arabic_name: 'فاير جريل',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tex_mex', 'burritos', 'bowls', 'tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'staple',
      classification_evidence: 'Multiple active Jeddah branches with substantial review volume; primary anchor of the Mexican category.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite', 'delivery_strong', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['burritos', 'bowls', 'tacos', 'quesadillas'],
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Zahra',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_zahra.data.formattedAddress,
          raw_district: 'al_zahra',
          canonical_district: 'al_zahra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJOU1E5unawxURfjHoaCoVOyY',
          google_place_id: 'ChIJOU1E5unawxURfjHoaCoVOyY',
          latitude: details.firegrill_zahra.data.location.latitude,
          longitude: details.firegrill_zahra.data.location.longitude,
          google_rating: details.firegrill_zahra.data.rating,
          google_review_count: details.firegrill_zahra.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_zahra.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.firegrill_zahra.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_zahra.'
        },
        {
          branch_name: 'Al Naeem',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_naeem.data.formattedAddress,
          raw_district: 'al_naeem',
          canonical_district: 'al_naeem',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJIc20ZovZwxURTkdtk-agTQg',
          google_place_id: 'ChIJIc20ZovZwxURTkdtk-agTQg',
          latitude: details.firegrill_naeem.data.location.latitude,
          longitude: details.firegrill_naeem.data.location.longitude,
          google_rating: details.firegrill_naeem.data.rating,
          google_review_count: details.firegrill_naeem.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_naeem.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.firegrill_naeem.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_naeem.'
        },
        {
          branch_name: 'Al Ruwais',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_ruwais.data.formattedAddress,
          raw_district: 'al_ruwais',
          canonical_district: 'al_ruwais',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJl_oaFLvPwxURfuENAVij11w',
          google_place_id: 'ChIJl_oaFLvPwxURfuENAVij11w',
          latitude: details.firegrill_ruwais.data.location.latitude,
          longitude: details.firegrill_ruwais.data.location.longitude,
          google_rating: details.firegrill_ruwais.data.rating,
          google_review_count: details.firegrill_ruwais.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_ruwais.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.firegrill_ruwais.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_ruwais.'
        },
        {
          branch_name: 'Ash Shati',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_shati.data.formattedAddress,
          raw_district: 'ash_shati',
          canonical_district: 'al_shati',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJ93xpUA7bwxURpUX58ciaRkQ',
          google_place_id: 'ChIJ93xpUA7bwxURpUX58ciaRkQ',
          latitude: details.firegrill_shati.data.location.latitude,
          longitude: details.firegrill_shati.data.location.longitude,
          google_rating: details.firegrill_shati.data.rating,
          google_review_count: details.firegrill_shati.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_shati.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.firegrill_shati.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_shati.'
        },
        {
          branch_name: 'Al Asalah',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_asalah.data.formattedAddress,
          raw_district: 'al_asalah',
          canonical_district: null,
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJb0Loqsl9wRURSzQb0G1oEb0',
          google_place_id: 'ChIJb0Loqsl9wRURSzQb0G1oEb0',
          latitude: details.firegrill_asalah.data.location.latitude,
          longitude: details.firegrill_asalah.data.location.longitude,
          google_rating: details.firegrill_asalah.data.rating,
          google_review_count: details.firegrill_asalah.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_asalah.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.firegrill_asalah.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'usable_with_caution',
          geographic_notes: 'Located in outer Jeddah district Al Asalah; outside canonical 30 districts, hence canonical_district is null.'
        },
        {
          branch_name: 'Mall of Arabia',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_mall_of_arabia.data.formattedAddress,
          raw_district: 'an_nuzhah',
          canonical_district: 'an_nuzhah',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJ1Y8Uyb_XwxURC-5gpZtpJ20',
          google_place_id: 'ChIJ1Y8Uyb_XwxURC-5gpZtpJ20',
          latitude: details.firegrill_mall_of_arabia.data.location.latitude,
          longitude: details.firegrill_mall_of_arabia.data.location.longitude,
          google_rating: details.firegrill_mall_of_arabia.data.rating,
          google_review_count: details.firegrill_mall_of_arabia.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_mall_of_arabia.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district an_nuzhah (Mall of Arabia, 2nd floor). Normalized source typo An Nuzahah -> an_nuzhah.'
        },
        {
          branch_name: 'Al Shiraa',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_shiraa.data.formattedAddress,
          raw_district: 'al_shiraa',
          canonical_district: 'al_sheraa',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJU8Frhv9jwRUROxy5aP6Qa_U',
          google_place_id: 'ChIJU8Frhv9jwRUROxy5aP6Qa_U',
          latitude: details.firegrill_shiraa.data.location.latitude,
          longitude: details.firegrill_shiraa.data.location.longitude,
          google_rating: details.firegrill_shiraa.data.rating,
          google_review_count: details.firegrill_shiraa.data.userRatingCount,
          operating_status: 'open',
          hours: details.firegrill_shiraa.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_sheraa (Al Shiraa).'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [
        {
          branch_name: 'Al Fayha',
          physical_existence: false,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.firegrill_fayha_closed.data.formattedAddress,
          raw_district: 'al_fayha',
          canonical_district: 'al_faiha',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJM1awNyLPwxURFcrxEe8fq8Y',
          google_place_id: 'ChIJM1awNyLPwxURFcrxEe8fq8Y',
          latitude: details.firegrill_fayha_closed.data.location.latitude,
          longitude: details.firegrill_fayha_closed.data.location.longitude,
          operating_status: 'closed',
          reason: 'Google Places confirms location is CLOSED_PERMANENTLY.',
          production_eligibility: 'excluded'
        }
      ],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'cocina_la_cantina',
      canonical_name: 'Cocina La Cantina',
      arabic_name: 'كوتشينا لا كانتينا',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'local_favorite',
      classification_evidence: 'Strong current rating/review volume (4.7, 1897 reviews) and established Jeddah Mexican positioning on Sari Branch Rd.',
      recommendation_use_case: 'going_out',
      distance_behavior: {
        going_out: 'destination_and_nearby'
      },
      context_tags: ['dine_in_strong', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: null,
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Zahra',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.cocina_zahra.data.formattedAddress,
          raw_district: 'al_zahra',
          canonical_district: 'al_zahra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJnXiuyYTbwxURksI859BDH9M',
          google_place_id: 'ChIJnXiuyYTbwxURksI859BDH9M',
          latitude: details.cocina_zahra.data.location.latitude,
          longitude: details.cocina_zahra.data.location.longitude,
          google_rating: details.cocina_zahra.data.rating,
          google_review_count: details.cocina_zahra.data.userRatingCount,
          operating_status: 'open',
          hours: details.cocina_zahra.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.cocina_zahra.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_zahra on Sari Branch Rd.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'eds_taco',
      canonical_name: "ED'S Taco",
      arabic_name: 'إيدز تاكو',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'mainstream',
      classification_evidence: 'Substantial Jeddah review volume (1601 reviews) and credible local food coverage, including prominent birria taco positioning.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['birria tacos'],
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Zahra',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.eds_taco_zahra.data.formattedAddress,
          raw_district: 'al_zahra',
          canonical_district: 'al_zahra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJAfLe4yjbwxURJRHjzYoQA58',
          google_place_id: 'ChIJAfLe4yjbwxURJRHjzYoQA58',
          latitude: details.eds_taco_zahra.data.location.latitude,
          longitude: details.eds_taco_zahra.data.location.longitude,
          google_rating: details.eds_taco_zahra.data.rating,
          google_review_count: details.eds_taco_zahra.data.userRatingCount,
          operating_status: 'open',
          hours: details.eds_taco_zahra.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.eds_taco_zahra.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27',
            'Arab News food coverage (2026)'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_zahra on Al Batarji.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'speakeasy',
      canonical_name: 'Speakeasy',
      arabic_name: 'سبيك إيزي',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['latin', 'tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'mainstream',
      classification_evidence: 'High review volume (2225 reviews on Al Naeem branch) and established Latin/Mexican menu focus.',
      recommendation_use_case: 'going_out',
      distance_behavior: {
        going_out: 'destination_and_nearby'
      },
      context_tags: ['dine_in_strong', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['tacos', 'burritos', 'barbacoa'],
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Naeem',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.speakeasy_naeem.data.formattedAddress,
          raw_district: 'al_naeem',
          canonical_district: 'al_naeem',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJf9RLrLnbwxUR4OhTyqJ5iCQ',
          google_place_id: 'ChIJf9RLrLnbwxUR4OhTyqJ5iCQ',
          latitude: details.speakeasy_naeem.data.location.latitude,
          longitude: details.speakeasy_naeem.data.location.longitude,
          google_rating: details.speakeasy_naeem.data.rating,
          google_review_count: details.speakeasy_naeem.data.userRatingCount,
          operating_status: 'open',
          hours: details.speakeasy_naeem.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.speakeasy_naeem.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27',
            'Official Speakeasy channel'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_naeem on Amna Bint Wahb St.'
        }
      ],
      manual_review_branches: [
        {
          branch_name: 'Al Khalidiyyah',
          physical_existence: false,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: 'Prince Sultan Rd, Al Khalidiyyah, Jeddah 23423, Saudi Arabia',
          raw_district: 'al_khalidiyyah',
          canonical_district: 'al_khalidiyyah',
          google_maps_url: null,
          google_place_id: null,
          latitude: null,
          longitude: null,
          google_rating: null,
          google_review_count: null,
          operating_status: 'unknown',
          hours: null,
          phone: null,
          verification_date: '2026-09-27',
          production_eligibility: 'manual_review',
          reason: 'No independent Google Place entity or physical storefront identity could be verified in Al Khalidiyyah. Held in manual_review to protect strict production catalog standards.'
        }
      ],
      excluded_branches: [
        {
          branch_name: 'Obhur',
          physical_existence: false,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.speakeasy_obhur_closed.data.formattedAddress,
          raw_district: 'al_lulu',
          canonical_district: null,
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJW72IxmRjwRUR1fQvaT7IfsI',
          google_place_id: 'ChIJW72IxmRjwRUR1fQvaT7IfsI',
          latitude: details.speakeasy_obhur_closed.data.location.latitude,
          longitude: details.speakeasy_obhur_closed.data.location.longitude,
          google_rating: details.speakeasy_obhur_closed.data.rating,
          google_review_count: details.speakeasy_obhur_closed.data.userRatingCount,
          operating_status: 'closed',
          reason: 'Google Places confirms location Speakeasy - سبيك إيزي in Al Lulu (Obhur) is CLOSED_PERMANENTLY / temporarily_closed.',
          production_eligibility: 'excluded'
        }
      ],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'chilis',
      canonical_name: "Chili's",
      arabic_name: 'تشيليز',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tex_mex', 'american'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'mainstream',
      classification_evidence: 'Highly recognizable mainstream Tex-Mex/American option with very high Jeddah review volume (7929 reviews).',
      recommendation_use_case: 'going_out',
      distance_behavior: {
        going_out: 'destination_and_nearby'
      },
      context_tags: ['dine_in_strong', 'family_friendly'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: null,
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Hamra',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.chilis_hamra.data.formattedAddress,
          raw_district: 'al_hamra',
          canonical_district: 'al_hamra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJpREyco3PwxUR_uqfIhqhJi0',
          google_place_id: 'ChIJpREyco3PwxUR_uqfIhqhJi0',
          latitude: details.chilis_hamra.data.location.latitude,
          longitude: details.chilis_hamra.data.location.longitude,
          google_rating: details.chilis_hamra.data.rating,
          google_review_count: details.chilis_hamra.data.userRatingCount,
          operating_status: 'open',
          hours: details.chilis_hamra.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.chilis_hamra.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_hamra at intersection of Palestine St and Al Andalus Rd.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [
        {
          branch_name: 'Roshan Mall',
          physical_existence: false,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.chilis_roshan_mall_closed.data.formattedAddress,
          raw_district: 'al_murjan',
          canonical_district: 'al_murjan',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJue7ZegnZwxUR9P6egcVGDVg',
          google_place_id: 'ChIJue7ZegnZwxUR9P6egcVGDVg',
          latitude: details.chilis_roshan_mall_closed.data.location.latitude,
          longitude: details.chilis_roshan_mall_closed.data.location.longitude,
          operating_status: 'closed',
          reason: 'Google Places confirms branch is CLOSED_PERMANENTLY.',
          production_eligibility: 'excluded'
        }
      ],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'taqado_mexican_kitchen',
      canonical_name: 'Taqado Mexican Kitchen',
      arabic_name: 'تاكادو المطبخ المكسيكي',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos', 'burritos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'mainstream',
      classification_evidence: 'Active Jeddah delivery presence with a full Mexican menu including tacos, burritos, quesadillas, bowls and birria. Verified delivery-only operation in Az Zahra / Jeddah service area.',
      recommendation_use_case: 'delivery',
      distance_behavior: {
        delivery: 'strict_nearby_branch'
      },
      context_tags: ['delivery_strong', 'quick_bite'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['birria', 'tacos', 'burritos', 'quesadillas'],
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'usable_with_caution',
      branches: [],
      delivery_only_note: 'Jeddah/Az Zahra delivery presence is verified via HungerStation, but no independently verified physical storefront branch record exists in Jeddah. Not valid for physical nearby distance calculations.',
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'yes',
          listing_name: 'Taqado Mexican Kitchen',
          service_area: 'Az Zahra / Jeddah',
          confidence: 'high',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'casa_twist',
      canonical_name: 'Casa Twist',
      arabic_name: 'كازا تويست',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: [],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'local_favorite',
      classification_evidence: 'Strong rating with several hundred reviews (4.5, 409 reviews); distinctive local alternative to mainstream brands.',
      recommendation_use_case: 'going_out',
      distance_behavior: {
        going_out: 'destination_and_nearby'
      },
      context_tags: ['casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: null,
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Muhammadiyyah',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.casa_twist_muhammadiyyah.data.formattedAddress,
          raw_district: 'al_muhammadiyyah',
          canonical_district: 'al_mohammadiyyah',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_7LBUQDZwxURx4YyTVfAw5Q',
          google_place_id: 'ChIJ_7LBUQDZwxURx4YyTVfAw5Q',
          latitude: details.casa_twist_muhammadiyyah.data.location.latitude,
          longitude: details.casa_twist_muhammadiyyah.data.location.longitude,
          google_rating: details.casa_twist_muhammadiyyah.data.rating,
          google_review_count: details.casa_twist_muhammadiyyah.data.userRatingCount,
          operating_status: 'open',
          hours: details.casa_twist_muhammadiyyah.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'usable_with_caution',
          geographic_notes: 'Located in canonical district al_mohammadiyyah. Google Places formatted address is district-level without street name; exact coordinates and operating hours verified.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'chiii',
      canonical_name: 'Chiii',
      arabic_name: 'تشي',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: [],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'local_favorite',
      classification_evidence: 'Strong rating and verified local review count (4.5, 323 reviews) on Amna Bint Wahb St.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: null,
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Naeem',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.chiii_naeem.data.formattedAddress,
          raw_district: 'al_naeem',
          canonical_district: 'al_naeem',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJn4qafwDZwxURfJ4Hq3FSk5c',
          google_place_id: 'ChIJn4qafwDZwxURfJ4Hq3FSk5c',
          latitude: details.chiii_naeem.data.location.latitude,
          longitude: details.chiii_naeem.data.location.longitude,
          google_rating: details.chiii_naeem.data.rating,
          google_review_count: details.chiii_naeem.data.userRatingCount,
          operating_status: 'open',
          hours: details.chiii_naeem.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.chiii_naeem.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_naeem on Amna Bint Wahb St.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'chalcos_mexican_grill',
      canonical_name: 'Chalcos Mexican Grill',
      arabic_name: 'شالكوس مكسيكان جريل',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos', 'burritos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'local_favorite',
      classification_evidence: 'Established local Mexican option with 280 reviews and clear Mexican menu focus in Al Zahra.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite', 'casual_hangout'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['birria tacos', 'burritos'],
      confidence: 'high',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Zahra',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.chalcos_zahra.data.formattedAddress,
          raw_district: 'al_zahra',
          canonical_district: 'al_zahra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJ4-Sos8HbwxURGll1LNwCxko',
          google_place_id: 'ChIJ4-Sos8HbwxURGll1LNwCxko',
          latitude: details.chalcos_zahra.data.location.latitude,
          longitude: details.chalcos_zahra.data.location.longitude,
          google_rating: details.chalcos_zahra.data.rating,
          google_review_count: details.chalcos_zahra.data.userRatingCount,
          operating_status: 'open',
          hours: details.chalcos_zahra.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.chalcos_zahra.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_zahra near Al Batarji.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'tacomole',
      canonical_name: 'Tacomole',
      arabic_name: 'تاكومولي',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'hidden_gem',
      classification_evidence: 'Very high current rating (5.0) but small review sample (41 reviews); kept as an exploration/hidden-gem candidate rather than a guaranteed staple.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: null,
      signature_dishes: null,
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Ash Shati',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.tacomole_shati.data.formattedAddress,
          raw_district: 'ash_shati',
          canonical_district: 'al_shati',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJH_2-MwDZwxURevswJ3aqm5w',
          google_place_id: 'ChIJH_2-MwDZwxURevswJ3aqm5w',
          latitude: details.tacomole_shati.data.location.latitude,
          longitude: details.tacomole_shati.data.location.longitude,
          google_rating: details.tacomole_shati.data.rating,
          google_review_count: details.tacomole_shati.data.userRatingCount,
          operating_status: 'open',
          hours: details.tacomole_shati.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'usable_with_caution',
          geographic_notes: 'Located in canonical district al_shati. Formatted address is district-level on Google Places; exact coordinates and operating hours verified.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'el_taco_loco',
      canonical_name: 'EL TACO LOCO',
      arabic_name: 'التاكو المجنون',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'hidden_gem',
      classification_evidence: 'Strong current rating (4.7) with a small local review base (48 reviews); suitable for randomized exploration slots.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: null,
      signature_dishes: null,
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Qryniah',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.el_taco_loco_qryniah.data.formattedAddress,
          raw_district: 'al_qryniah',
          canonical_district: null,
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJOwRQLwC1wxURWZDE_FtRdeE',
          google_place_id: 'ChIJOwRQLwC1wxURWZDE_FtRdeE',
          latitude: details.el_taco_loco_qryniah.data.location.latitude,
          longitude: details.el_taco_loco_qryniah.data.location.longitude,
          google_rating: details.el_taco_loco_qryniah.data.rating,
          google_review_count: details.el_taco_loco_qryniah.data.userRatingCount,
          operating_status: 'open',
          hours: details.el_taco_loco_qryniah.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.el_taco_loco_qryniah.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'usable_with_caution',
          geographic_notes: 'Located in outer Jeddah district Al Qryniah; outside canonical 30 districts, hence canonical_district is null.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'gyb_taco',
      canonical_name: 'Gyb Taco',
      arabic_name: 'جي واي بي تاكو',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'hidden_gem',
      classification_evidence: 'High rating (4.8) with small review volume (32 reviews); useful exploration option in Al Rehab.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: null,
      signature_dishes: null,
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'Al Rehab',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.gyb_taco_rehab.data.formattedAddress,
          raw_district: 'al_rehab',
          canonical_district: 'al_rehab',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJo7aD9b3RwxUR6vfK_4kvdUM',
          google_place_id: 'ChIJo7aD9b3RwxUR6vfK_4kvdUM',
          latitude: details.gyb_taco_rehab.data.location.latitude,
          longitude: details.gyb_taco_rehab.data.location.longitude,
          google_rating: details.gyb_taco_rehab.data.rating,
          google_review_count: details.gyb_taco_rehab.data.userRatingCount,
          operating_status: 'open',
          hours: details.gyb_taco_rehab.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.gyb_taco_rehab.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_rehab on Sharurah St.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'taco_in',
      canonical_name: 'Taco In',
      arabic_name: 'تاكو ان',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['tacos'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'hidden_gem',
      classification_evidence: 'High rating (4.8) with small review base (20 reviews); suitable for randomized exploration slots in An Naseem.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: null,
      signature_dishes: null,
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'An Naseem',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.taco_in_naseem.data.formattedAddress,
          raw_district: 'an_naseem',
          canonical_district: 'al_naseem',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJq29kOwDPwxURX0eW9sWErz0',
          google_place_id: 'ChIJq29kOwDPwxURX0eW9sWErz0',
          latitude: details.taco_in_naseem.data.location.latitude,
          longitude: details.taco_in_naseem.data.location.longitude,
          google_rating: details.taco_in_naseem.data.rating,
          google_review_count: details.taco_in_naseem.data.userRatingCount,
          operating_status: 'open',
          hours: details.taco_in_naseem.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: details.taco_in_naseem.data.internationalPhoneNumber || null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_naseem on Al Naseem St.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    },
    {
      id: 'kakt',
      canonical_name: 'KAKT',
      arabic_name: 'كاكت',
      modes: ['food'],
      primary_category: 'mexican',
      secondary_categories: ['burritos', 'bowls'],
      jeddah_presence: true,
      operating_status: 'open',
      editorial_classification: 'rising',
      classification_evidence: 'Strong rating (4.8, 67 reviews) and verified Mexican menu evidence (birria brisket burrito, chipotle chicken burrito, barbacoa bowl) in U Walk.',
      recommendation_use_case: 'both',
      distance_behavior: {
        delivery: 'strict_nearby_branch',
        going_out: 'destination_and_nearby'
      },
      context_tags: ['quick_bite', 'delivery_strong'],
      meal_fit: ['lunch', 'dinner'],
      healthy: null,
      price_positioning: 'mid-range',
      signature_dishes: ['birria brisket burrito', 'chipotle chicken burrito', 'barbacoa bowl'],
      confidence: 'medium',
      last_verified_at: '2026-09-27',
      production_eligibility: 'production_ready',
      branches: [
        {
          branch_name: 'U Walk',
          physical_existence: true,
          city: 'Jeddah',
          country: 'Saudi Arabia',
          formatted_address: details.kakt_uwalk.data.formattedAddress,
          raw_district: 'al_zahra',
          canonical_district: 'al_zahra',
          google_maps_url: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJm4HefLfZwxURWEFXlUqNX00',
          google_place_id: 'ChIJm4HefLfZwxURWEFXlUqNX00',
          latitude: details.kakt_uwalk.data.location.latitude,
          longitude: details.kakt_uwalk.data.location.longitude,
          google_rating: details.kakt_uwalk.data.rating,
          google_review_count: details.kakt_uwalk.data.userRatingCount,
          operating_status: 'open',
          hours: details.kakt_uwalk.data.regularOpeningHours.weekdayDescriptions.join('; '),
          phone: null,
          verification_date: '2026-09-27',
          source_provenance: [
            'Google Maps verified Place ID entity',
            'Google Places API (New) verification pass — 2026-09-27',
            'HungerStation Mexican menu evidence'
          ],
          production_eligibility: 'production_ready',
          geographic_notes: 'Located in canonical district al_zahra in U Walk on Prince Sultan Rd.'
        }
      ],
      manual_review_branches: [],
      excluded_branches: [],
      delivery_platforms: {
        hungerstation: {
          presence: 'yes',
          listing_name: 'KAKT',
          confidence: 'high',
          verification_date: '2026-09-27'
        },
        jahez: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        },
        keeta: {
          presence: 'unknown',
          listing_name: null,
          confidence: 'low',
          verification_date: '2026-09-27'
        }
      }
    }
  ],
  validation_summary: {
    locked_brand_count: 14,
    physical_brands_with_verified_jeddah_presence: 13,
    delivery_only_or_non_physical_verified_brands: 1,
    total_active_physical_branches: 19,
    production_ready_branches: 15,
    usable_with_caution_branches: 4,
    manual_review_branches: 1,
    excluded_branches: 3,
    notes: [
      'Taqado remains locked at brand level as delivery-only; verified on HungerStation in Az Zahra / Jeddah service area, but has no physical storefront branch and is not eligible for physical Nearby distance calculations.',
      'Speakeasy Al Khalidiyyah is held in manual_review because no independent Google Place identity could be verified.',
      'Speakeasy Obhur is verified closed (CLOSED_PERMANENTLY / temporarily_closed on Google Places ChIJW72IxmRjwRUR1fQvaT7IfsI) and excluded from active recommendations.',
      'FireGrill Al Fayha is verified closed (CLOSED_PERMANENTLY on Google Places ChIJM1awNyLPwxURFcrxEe8fq8Y) and excluded.',
      'Chili\'s Roshan Mall is verified closed (CLOSED_PERMANENTLY on Google Places ChIJue7ZegnZwxUR9P6egcVGDVg) and excluded.',
      'All 19 active usable branches have 100% verified physical existence, 100% Place IDs, 100% direct Maps URLs, 100% exact coordinates, 100% operating hours, 100% verified ratings and review counts.',
      'FireGrill guaranteed anchor rule preserved; rotating strong pool (Cocina La Cantina, ED\'S Taco, Speakeasy, Chili\'s, Taqado) preserved; 7-card deck preserved; branch count weighting not introduced (select brand -> resolve branch).'
    ]
  }
};

const targetPath = path.join(rootDir, 'docs', 'research', 'jeddah-mexican-pass-d-corrected.json');
fs.writeFileSync(targetPath, JSON.stringify(correctedData, null, 2), 'utf8');
console.log('Successfully written corrected JSON to:', targetPath);
