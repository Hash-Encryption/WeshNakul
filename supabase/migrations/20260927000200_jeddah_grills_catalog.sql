-- Google-verified Jeddah Grills production catalog.
-- Source: docs/research/jeddah-grills-pass-d-corrected.json
-- 15 approved brands, 43 verified physical branches (29 canonical, 14 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and ratings directly from Google Places / Maps.
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, Shawarma, Saudi Rice, or Pizza catalogs.
-- Apply after 20260927000100_jeddah_pizza_catalog.sql.
BEGIN;

-- 0. Clean legacy orphan placeholders if present without branches
DELETE FROM public.restaurants WHERE id = 'khayal' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'khayal'
);
DELETE FROM public.restaurants WHERE id = 'saruja_restaurants' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'saruja_restaurants'
);
DELETE FROM public.restaurants WHERE id = 'al_bait_al_halabi' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'al_bait_al_halabi'
);

CREATE TEMP TABLE _grills_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _grills_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Grills Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-27",
    "brand_count": 15,
    "branch_count": 43,
    "canonical_branch_count": 29,
    "outer_caution_branch_count": 14
  },
  "brands": [
    {
      "brand_id": "khayal_restaurant",
      "canonical_name": "Khayal Restaurant",
      "arabic_name": "مطعم خيال",
      "categories": [
        "grills",
        "turkish",
        "middle_eastern"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish",
        "middle_eastern"
      ],
      "subcategories": [
        "turkish",
        "middle_eastern"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 65,
      "estimated_spend_max_sar": 130,
      "signature_dish_ar": "mixed grills",
      "signature_dish_en": "mixed grills",
      "vibe_tags_ar": [
        "مشاوي تركية فاخرة",
        "أجواء عائلية راقية",
        "إفطار ومشاوي",
        "جلسات مميزة"
      ],
      "vibe_tags_en": [
        "Luxury Turkish Grills",
        "Fine Family Dining",
        "Breakfast & Barbecue",
        "Premium Ambience"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_aziziyah",
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.khayalrest.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "khayal_restaurant",
          "branch_name_en": "Al Zahra / Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "مطعم خيال، طريق الامير سلطان، الزهراء، جدة 23522",
          "latitude": 21.6095822,
          "longitude": 39.1410604,
          "maps_business_name": "Khayal Restaurant",
          "google_place_id": "ChIJu1UW2WzawxUR8MSuy51UO3Q",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJu1UW2WzawxUR8MSuy51UO3Q",
          "google_rating": 4.2,
          "google_review_count": 38505,
          "operating_status": "open",
          "hours": "الأحد: ٦:٠٠ص–٣:٠٠ص",
          "phone": "9200 02223",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "khayal_restaurant",
          "branch_name_en": "Jeddah Park / Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "خيال، العزيزية، جدة 23334",
          "latitude": 21.5580008,
          "longitude": 39.185319199999995,
          "maps_business_name": "Khayal Restaurant",
          "google_place_id": "ChIJF4W9-KzRwxUR2-LSZrt8sDA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJF4W9-KzRwxUR2-LSZrt8sDA",
          "google_rating": 4.4,
          "google_review_count": 10460,
          "operating_status": "open",
          "hours": "الأحد: ٦:٠٠–١١:٣٠ص, ١٢:٣٠م–٣:٠٠ص",
          "phone": "9200 02223",
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grills",
          "name_ar": "mixed grills",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "kebabs",
          "name_ar": "kebabs",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "ennabi_grill",
      "canonical_name": "Ennabi Grill",
      "arabic_name": "المشوى العنابي",
      "categories": [
        "grills",
        "saudi",
        "middle_eastern"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "saudi",
        "middle_eastern"
      ],
      "subcategories": [
        "saudi",
        "middle_eastern"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "mixed grill",
      "signature_dish_en": "mixed grill",
      "vibe_tags_ar": [
        "مشاوي سعودية شهيرة",
        "توصيل سريع وسفري",
        "كباب حجازي وحلبي",
        "جمعات وسهرات"
      ],
      "vibe_tags_en": [
        "Saudi Grill Specialist",
        "Fast Delivery & Takeaway",
        "Hijazi & Halabi Kebab",
        "Gatherings"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 8,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_andalus",
        "al_faiha",
        "al_hamdaniyah",
        "al_marwah",
        "al_samer",
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.ennabigrill.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "المشوى العنابي | Ennabi Grill، الأندلس،، جدة 23326",
          "latitude": 21.5462709,
          "longitude": 39.163020599999996,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJ549UTufFwxURMG1R3-Scvo4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ549UTufFwxURMG1R3-Scvo4",
          "google_rating": 4.1,
          "google_review_count": 4983,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "المشوى العنابي, حي، انقره، السامر، جدة 23462",
          "latitude": 21.58768,
          "longitude": 39.2365715,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJ-9YjslTRwxUR8HJuFteQX-4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ-9YjslTRwxUR8HJuFteQX-4",
          "google_rating": 4,
          "google_review_count": 626,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "المشوى العنابي | Ennabi Grill, المروة، جدة 23545",
          "latitude": 21.6243285,
          "longitude": 39.2106722,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJ5y3aATfXwxURC3Xs4g56-Ws",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5y3aATfXwxURC3Xs4g56-Ws",
          "google_rating": 4,
          "google_review_count": 1773,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "H4RM+Q73 المشوى العنابي، حلمي كتبي، الزهراء، جدة 23521",
          "latitude": 21.5919375,
          "longitude": 39.1331875,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJcQ5Jy9rRwxURXDeHHmS0m4w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJcQ5Jy9rRwxURXDeHHmS0m4w",
          "google_rating": 3.9,
          "google_review_count": 643,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "المشوى العنابي، ، 9199،, حي السنابل،, JJSD3087، 3087 خبيب بن عدي الأنصاري(رضي الله عنه, 22444، جدة 22434",
          "latitude": 21.3997411,
          "longitude": 39.2819047,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJl21O157PwxURiYYWycsmS-s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJl21O157PwxURiYYWycsmS-s",
          "google_rating": 4.2,
          "google_review_count": 3189,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_sanabel'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Al Hamdaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "المشوي العنابي، القاسم بن أمية، حي، الحمدانية، جدة 23761",
          "latitude": 21.7611892,
          "longitude": 39.1966416,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJR83N66p9wRURTMgUCJ_n7WI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJR83N66p9wRURTMgUCJ_n7WI",
          "google_rating": 3.9,
          "google_review_count": 1824,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "North Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "المشوى العنابي، شارع عابر القرات، أبحر الشمالية، جدة 23817",
          "latitude": 21.7603457,
          "longitude": 39.1178082,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJDwjCFABjwRUReL_46Or69vM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJDwjCFABjwRUReL_46Or69vM",
          "google_rating": 4,
          "google_review_count": 238,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ennabi_grill",
          "branch_name_en": "Abdullah Bin Suleiman / Ivory Square",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "المشوى العنابي، طريق عبدالله بن سليمان, مجمع ايفوري اسكوير, جدة 24444",
          "latitude": 21.4962609,
          "longitude": 39.2190304,
          "maps_business_name": "Ennabi Grill",
          "google_place_id": "ChIJq0R91-LPwxURpAZC38FdHik",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJq0R91-LPwxURpAZC38FdHik",
          "google_rating": 4,
          "google_review_count": 2224,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–١:٠٠ص",
          "phone": "9200 06396",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grill",
          "name_ar": "mixed grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Hijazi kebab",
          "name_ar": "Hijazi kebab",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Halabi kebab",
          "name_ar": "Halabi kebab",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "meat awsal",
          "name_ar": "meat awsal",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "chicken kebab",
          "name_ar": "chicken kebab",
          "is_signature": false,
          "sort_order": 4
        },
        {
          "name_en": "shish tawook",
          "name_ar": "shish tawook",
          "is_signature": false,
          "sort_order": 5
        }
      ]
    },
    {
      "brand_id": "kabebo",
      "canonical_name": "Kabebo",
      "arabic_name": "كابيبو",
      "categories": [
        "grills",
        "saudi",
        "hijazi"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "saudi",
        "hijazi"
      ],
      "subcategories": [
        "saudi",
        "hijazi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "beef kebab",
      "signature_dish_en": "beef kebab",
      "vibe_tags_ar": [
        "كباب حجازي أصيل",
        "سريع وسفري",
        "مبشور حجازي",
        "أسعار اقتصادية"
      ],
      "vibe_tags_en": [
        "Authentic Hijazi Kebab",
        "Fast Casual",
        "Hijazi Mabshoor",
        "Value & Affordable"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "delivery_strong",
        "quick_bite",
        "casual_hangout",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 11,
      "canonical_districts": [
        "al_aziziyah",
        "al_hamdaniyah",
        "al_marwah",
        "al_naseem",
        "al_safa",
        "al_samer"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.kabebo.com/home",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "كابيبو | Kabebo (السامر)، حي، عبدالله بن عطاء، السامر، جدة 23462",
          "latitude": 21.590084299999997,
          "longitude": 39.251049699999996,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJhQIaw-_TwxURH5-Vf7mSzKw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhQIaw-_TwxURH5-Vf7mSzKw",
          "google_rating": 4,
          "google_review_count": 1469,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "050 628 2244",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "كابيبو | Kabebo (الصفا)، ام القرى، حي الصفا،، جدة",
          "latitude": 21.5735496,
          "longitude": 39.2198537,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJq_SWenTRwxUR_o3TqLNoU5c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJq_SWenTRwxUR_o3TqLNoU5c",
          "google_rating": 4.1,
          "google_review_count": 2295,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "050 271 0011",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "كابيبو | Kabebo ( حي المروة - مخطط الحرمين )، عبد الرحمن الخزاعي، المروة، جدة 23545",
          "latitude": 21.6153126,
          "longitude": 39.214456,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJJae5YsnWwxURaBnjOMv8IUE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJae5YsnWwxURaBnjOMv8IUE",
          "google_rating": 4.1,
          "google_review_count": 857,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "055 264 2211",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Ajaweed",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "C892+C66 كابيبو | Kabebo (الاجاويد)، الاجاويد، جدة 22441",
          "latitude": 21.4185315,
          "longitude": 39.3006039,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJjZM1b13LwxURj9VLTRHnN2U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJjZM1b13LwxURj9VLTRHnN2U",
          "google_rating": 4.1,
          "google_review_count": 1874,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "055 133 3288",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_ajaweed'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Falah / Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "كابيبو | Kabebo (الفلاح)، 5548 عمرو بن ابي وقاص(رضي الله عن، JGRB5548 6779، جدة 23762",
          "latitude": 21.7722203,
          "longitude": 39.2007124,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJXS31VWR9wRURBvp7q0lfI-c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXS31VWR9wRURBvp7q0lfI-c",
          "google_rating": 4.1,
          "google_review_count": 890,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "050 201 3020",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "كابيبو | Kabebo (النسيم)، 7252 أم المؤمنين صفية، حي النسيم، جدة 23234",
          "latitude": 21.5204959,
          "longitude": 39.2300664,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJkfumPMbPwxUR8qBdf82yC1g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkfumPMbPwxUR8qBdf82yC1g",
          "google_rating": 4.4,
          "google_review_count": 433,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "050 544 3381",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "كابيبو | Kabebo (العزيزية) اكسبرس، JCZB2749، 2749 الأدباء, 8622، جدة 23342",
          "latitude": 21.5586268,
          "longitude": 39.2091366,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJQSCTaADRwxURamovLcZbS30",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQSCTaADRwxURamovLcZbS30",
          "google_rating": 4,
          "google_review_count": 94,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "050 040 8054",
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Qurainiyah Express",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "كابيبو القرينية، JMYC7633، 7633 الشريف بركات بن محمد، 4013، جدة 22535",
          "latitude": 21.318415899999998,
          "longitude": 39.246595899999996,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJP0XPKQC1wxURqgFUxrUL_lk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJP0XPKQC1wxURqgFUxrUL_lk",
          "google_rating": 4.1,
          "google_review_count": 96,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "053 833 8320",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_qurainiyah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Sawari / Obhur Express",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "كابيبو | Kabebo (ابحر)، 4429 الملك فيصل بن عبدالعزيز، سعود، JHWA7429، 7429، جدة 23826",
          "latitude": 21.7890937,
          "longitude": 39.093672,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJ3TSFLQBjwRURH_-mddBpKJ4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ3TSFLQBjwRURH_-mddBpKJ4",
          "google_rating": 4.4,
          "google_review_count": 207,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "057 366 3655",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_sawari'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Al Riyadh Express",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "كابيبو | Kabebo (حي الرياض) إكسبرس، حي، شارع زين العابدين، الرياض، لي آوت الرياض، جدة 23839",
          "latitude": 21.848796099999998,
          "longitude": 39.1964736,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJ8-cfQzl7wRUR7WnjB13bLJU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8-cfQzl7wRUR7WnjB13bLJU",
          "google_rating": 4.2,
          "google_review_count": 104,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "057 957 9575",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_riyadh'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "kabebo",
          "branch_name_en": "Abruq Ar Rughamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "كابيبو | Kabebo ابرق الرغامه، حي، طريق الملك عبدالله، ابرق الرغامة، جدة 22272",
          "latitude": 21.505643799999998,
          "longitude": 39.3012379,
          "maps_business_name": "Kabebo",
          "google_place_id": "ChIJEWamoqrNwxURCm1ewxzpA6U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJEWamoqrNwxURCm1ewxzpA6U",
          "google_rating": 4,
          "google_review_count": 65,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص; الاثنين: ١:٠٠م–١:٠٠ص; الثلاثاء: ١:٠٠م–١:٠٠ص; الأربعاء: ١:٠٠م–١:٠٠ص; الخميس: ١:٠٠م–١:٠٠ص; الجمعة: ١:٠٠م–١:٠٠ص; السبت: ١:٠٠م–١٢:٣٠ص",
          "phone": "055 701 0504",
          "geographic_notes": "Outer Jeddah branch in physical district 'abruq_ar_rughamah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "beef kebab",
          "name_ar": "beef kebab",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken kebab",
          "name_ar": "chicken kebab",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "shish tawook",
          "name_ar": "shish tawook",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "beef awsal",
          "name_ar": "beef awsal",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "mabshoor",
          "name_ar": "mabshoor",
          "is_signature": false,
          "sort_order": 4
        },
        {
          "name_en": "mixed grill platters",
          "name_ar": "mixed grill platters",
          "is_signature": false,
          "sort_order": 5
        }
      ]
    },
    {
      "brand_id": "al_hamraa_barbecue_restaurant",
      "canonical_name": "Al Hamraa Barbecue Restaurant",
      "arabic_name": "مطاعم مشويات الحمراء",
      "categories": [
        "grills",
        "middle_eastern"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "middle_eastern"
      ],
      "subcategories": [
        "middle_eastern"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "chef mixed grill",
      "signature_dish_en": "chef mixed grill",
      "vibe_tags_ar": [
        "مشاوي جمعات وبوفيهات",
        "صحون عائلية مشكلة",
        "توصيل سفري",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Gathering & Event Grills",
        "Family Mixed Trays",
        "Takeaway & Delivery",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "delivery_strong",
        "casual_hangout",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "al_hamdaniyah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://linktr.ee/alhamraares",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Palestine / Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطاعم مشويات الحمراء فرع فلسطين، 4612 شارع فلسطين، مشرفة، جدة 23335",
          "latitude": 21.5334046,
          "longitude": 39.198993,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJGQtNZyrOwxUR6l_y-d7VMDs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJGQtNZyrOwxUR6l_y-d7VMDs",
          "google_rating": 4.5,
          "google_review_count": 6773,
          "operating_status": "open",
          "hours": "السبت: ١٢:٠٠م–٢:٠٠ص; الأحد: ١٢:٠٠م–٢:٠٠ص; الاثنين: ١٢:٠٠م–٢:٠٠ص; الثلاثاء: ١٢:٠٠م–٣:٠٠ص; الأربعاء: ١٢:٠٠م–٣:٠٠ص; الخميس: ١٢:٠٠م–٣:٠٠ص; الجمعة: ١٢:٠٠م–٣:٠٠ص",
          "phone": "055 650 6004",
          "geographic_notes": "Outer Jeddah branch in physical district 'mishrifah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Al Samer / Al Manar",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطعم مشويات الحمراء فرع السامر Alhamraaress، JDJB3776، 3776 7227 الأجواد، المنار، جدة 23462",
          "latitude": 21.593505099999998,
          "longitude": 39.2383374,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJ11K9xFHTwxURaYbRMNEJ8Uk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ11K9xFHTwxURaYbRMNEJ8Uk",
          "google_rating": 4.7,
          "google_review_count": 1868,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٠٠م–٢:٠٠ص",
          "phone": "055 670 2992",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_manar'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Al Hamdaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "مطاعم مشويات الحمراء فرع الحمدانية، غاز، الحمدانية، جدة 23743",
          "latitude": 21.736488899999998,
          "longitude": 39.1936213,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJGxgs4UF9wRURs5ouaoap7oo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJGxgs4UF9wRURs5ouaoap7oo",
          "google_rating": 4.5,
          "google_review_count": 1493,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "050 707 9130",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Al Harazat",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "F98F+JQ3 مطاعم مشويات الحمراء فرع الحرازات، حي الحرازات، جدة 22394",
          "latitude": 21.4661823,
          "longitude": 39.3748828,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJ9TC1uBgzwhURg8m59k5yo8A",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ9TC1uBgzwhURg8m59k5yo8A",
          "google_rating": 4.7,
          "google_review_count": 2459,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٠٠م–٢:٠٠ص",
          "phone": "053 454 7600",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_harazat'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Al Waziriyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطاعم مشويات الحمراء فرع الوزيرية، عمارة النعمان حي الوزيرية، مدائن الفهد، جدة 22343",
          "latitude": 21.4624269,
          "longitude": 39.2440053,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJq3PLLgDNwxURET5Jr3yuY28",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJq3PLLgDNwxURET5Jr3yuY28",
          "google_rating": 4.8,
          "google_review_count": 1369,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–٢:٠٠ص",
          "phone": "055 736 6595",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_waziriyah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_hamraa_barbecue_restaurant",
          "branch_name_en": "Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطاعم مشويات الحمراء فرع السنابل، خبيب بن عدي الأنصاري، السنابل، جدة 22436",
          "latitude": 21.4033055,
          "longitude": 39.2729527,
          "maps_business_name": "Al Hamraa Barbecue Restaurant",
          "google_place_id": "ChIJMZhtZgDLwxURdiOLDJBQMa0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJMZhtZgDLwxURdiOLDJBQMa0",
          "google_rating": 4.7,
          "google_review_count": 711,
          "operating_status": "open",
          "hours": "السبت: ١٢:٠٠م–٢:٠٠ص; الأحد: ١٢:٠٠م–٢:٠٠ص; الاثنين: ١٢:٠٠م–٢:٠٠ص; الثلاثاء: ١٢:٠٠م–٣:٠٠ص; الأربعاء: ١٢:٠٠م–٣:٠٠ص; الخميس: ١٢:٠٠م–٣:٠٠ص; الجمعة: ١٢:٠٠م–٣:٠٠ص",
          "phone": "055 368 6371",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_sanabel'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "chef mixed grill",
          "name_ar": "chef mixed grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Al Hamraa mixed grill",
          "name_ar": "Al Hamraa mixed grill",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "family grill trays",
          "name_ar": "family grill trays",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "taksim_point_restaurant",
      "canonical_name": "Taksim Point Restaurant",
      "arabic_name": "تقسيم بوينت",
      "categories": [
        "grills",
        "turkish"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "mixed grill",
      "signature_dish_en": "mixed grill",
      "vibe_tags_ar": [
        "مشاوي تركية على الواجهة",
        "كباب أضنة مميز",
        "جلسات كورنيش راقية",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Waterfront Turkish Grills",
        "Signature Adana Kebab",
        "Scenic Seaside Dining",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://taksimpoint.sa/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "taksim_point_restaurant",
          "branch_name_en": "Al Manar",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطعم تقسيم بوينت، طريق هدى الشام، حي المنار، جدة 23463",
          "latitude": 21.6117599,
          "longitude": 39.2351679,
          "maps_business_name": "Taksim Point Restaurant",
          "google_place_id": "ChIJ55Xb3bnXwxURGQYRKRPfdyY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ55Xb3bnXwxURGQYRKRPfdyY",
          "google_rating": 4.6,
          "google_review_count": 17497,
          "operating_status": "open",
          "hours": "السبت: ٥:٣٠ص–٣:٠٠ص; الأحد: ٥:٣٠ص–٣:٠٠ص; الاثنين: ٥:٣٠ص–٣:٠٠ص; الثلاثاء: ٥:٣٠ص–٣:٠٠ص; الأربعاء: ٥:٣٠ص–٣:٠٠ص; الخميس: ٥:٣٠ص–٣:٣٠ص; الجمعة: ٥:٣٠ص–٣:٣٠ص",
          "phone": "056 169 3333",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_manar'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "taksim_point_restaurant",
          "branch_name_en": "Waterfront / Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "مطعم تقسيم بوينت | Taksimpoint restaurants، داخل مركز المارينا بجوار منتزه عطا الله، الشاطئ، حي، الواجهة البحرية، جدة 23611",
          "latitude": 21.616094099999998,
          "longitude": 39.10841,
          "maps_business_name": "Taksim Point Restaurant",
          "google_place_id": "ChIJCfFzRgDbwxURiG14C-o4CqQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCfFzRgDbwxURiG14C-o4CqQ",
          "google_rating": 4.7,
          "google_review_count": 2175,
          "operating_status": "open",
          "hours": "الأحد: ١:٣٠م–٤:٠٠ص",
          "phone": "057 455 5000",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "taksim_point_restaurant",
          "branch_name_en": "Al Jawharah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطعم تقسيم بوينت، بجانب معارض السيارات، شارع المائة، الجوهرة، حي، جدة 22416",
          "latitude": 21.437376399999998,
          "longitude": 39.251687499999996,
          "maps_business_name": "Taksim Point Restaurant",
          "google_place_id": "ChIJleGZaADLwxURhUpfKIZ0yAs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJleGZaADLwxURhUpfKIZ0yAs",
          "google_rating": 4.7,
          "google_review_count": 3157,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٠٠م–٢:٠٠ص",
          "phone": "056 877 7222",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_jawharah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grill",
          "name_ar": "mixed grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Adana kebab",
          "name_ar": "Adana kebab",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "meat kebab",
          "name_ar": "meat kebab",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "chicken kebab",
          "name_ar": "chicken kebab",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "al_fairouz_restaurant",
      "canonical_name": "Al Fairouz Restaurant",
      "arabic_name": "مطعم الفيروز",
      "categories": [
        "grills",
        "turkish"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "Turkish kebabs",
      "signature_dish_en": "Turkish kebabs",
      "vibe_tags_ar": [
        "مطعم تركي عريق من ١٩٨٦",
        "مشاوي على الفحم",
        "إسكندر كباب",
        "عائلي وكلاسيك"
      ],
      "vibe_tags_en": [
        "Heritage Turkish Since 1986",
        "Charcoal Grills",
        "Iskander Kebab",
        "Family Classic"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "delivery_strong",
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_safa"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://alfairouzrestaurants.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "al_fairouz_restaurant",
          "branch_name_en": "Hira Street / An Nahdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مطعم الفيروز، مركز دانية التجاري، شارع حراء، center، جدة 23525",
          "latitude": 21.612467799999997,
          "longitude": 39.1509536,
          "maps_business_name": "Al Fairouz Restaurant",
          "google_place_id": "ChIJo8P85EPawxURYqMbgUkNMCE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJo8P85EPawxURYqMbgUkNMCE",
          "google_rating": 3.9,
          "google_review_count": 10365,
          "operating_status": "open",
          "hours": "السبت: ١٢:٠٠م–٢:٠٠ص; الأحد: ١٢:٠٠م–٢:٠٠ص; الاثنين: ١٢:٠٠م–٢:٠٠ص; الثلاثاء: ١٢:٠٠م–٢:٠٠ص; الأربعاء: ١٢:٠٠م–٢:٠٠ص; الخميس: ١٢:٠٠م–٢:٠٠ص; الجمعة: ٢:٠٠م–٢:٠٠ص",
          "phone": "054 893 0864",
          "geographic_notes": "Outer Jeddah branch in physical district 'an_nahdah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_fairouz_restaurant",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "مطعم الفيروز مطعم تركي، 3057 سعود الفيصل، الصفا، جدة 23451",
          "latitude": 21.5751199,
          "longitude": 39.2086775,
          "maps_business_name": "Al Fairouz Restaurant",
          "google_place_id": "ChIJXVPW4AjRwxURWQVxTn_rIck",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXVPW4AjRwxURWQVxTn_rIck",
          "google_rating": 3.9,
          "google_review_count": 4191,
          "operating_status": "open",
          "hours": "الأحد: ١١:٣٠ص–١:٣٠ص; الاثنين: ١١:٠٠ص–١:٠٠ص; الثلاثاء: ١١:٠٠ص–١:٠٠ص; الأربعاء: ١١:٣٠ص–١:٣٠ص; الخميس: ١١:٣٠ص–١:٠٠ص; الجمعة: ١١:٣٠ص–١:٣٠ص; السبت: ١١:٣٠ص–١:٠٠ص",
          "phone": "012 272 1067",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Turkish kebabs",
          "name_ar": "Turkish kebabs",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "charcoal grills",
          "name_ar": "charcoal grills",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Iskander",
          "name_ar": "Iskander",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "shami",
      "canonical_name": "Shami",
      "arabic_name": "مطاعم شامي",
      "categories": [
        "grills",
        "syrian",
        "levantine"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "syrian",
        "levantine"
      ],
      "subcategories": [
        "syrian",
        "levantine"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "مشاوي مشكلة",
      "signature_dish_en": "Mixed Grill",
      "vibe_tags_ar": [
        "مشاوي شامية عريقة",
        "فحم طبيعي",
        "فطور ومشاوي",
        "أجواء عائلية"
      ],
      "vibe_tags_en": [
        "Levantine Grill Heritage",
        "Natural Charcoal",
        "All-Day Dining",
        "Family Ambience"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_hamra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.shamirest.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shami",
          "branch_name_en": "Al Hamra / Palestine Street",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "شامي، السخاء، شارع فلسطين، جدة",
          "latitude": 21.519275999999998,
          "longitude": 39.1548781,
          "maps_business_name": "Shami",
          "google_place_id": "ChIJ3eLsLojPwxURcV7Mv5zJRWw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ3eLsLojPwxURcV7Mv5zJRWw",
          "google_rating": 3.7,
          "google_review_count": 7609,
          "operating_status": "open",
          "hours": "السبت: ٦:٠٠ص–٣:٠٠ص; الأحد: ٦:٠٠ص–٣:٠٠ص; الاثنين: ٦:٠٠ص–٣:٠٠ص; الثلاثاء: ٦:٠٠ص–٣:٠٠ص; الأربعاء: ٦:٠٠ص–٣:٠٠ص; الخميس: ٦:٠٠ص–٣:٠٠ص; الجمعة: ٦:٠٠ص–٣:٠٠ص",
          "phone": null,
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Mixed Grill",
          "name_ar": "مشاوي مشكلة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "skewers_grilled_restaurant",
      "canonical_name": "Skewers Grilled Restaurant",
      "arabic_name": "مطعم سكيوورز للمشويات",
      "categories": [
        "grills",
        "turkish"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "mixed grills",
      "signature_dish_en": "mixed grills",
      "vibe_tags_ar": [
        "كباب إسطنبول السريع",
        "سفري واقتصادي",
        "مشاوي طازجة",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Istanbul Kabab Skewers",
        "Quick & Affordable",
        "Fresh Charcoal Grills",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "casual_hangout",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_ruwais"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "skewers_grilled_restaurant",
          "branch_name_en": "Jeddah branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "شركة أسياخ كباب اسطنبول، شارع السيد، حي، جدة",
          "latitude": 21.5180924,
          "longitude": 39.177628399999996,
          "maps_business_name": "Skewers Grilled Restaurant",
          "google_place_id": "ChIJj7qVVL7PwxURFkiUNJEN8tY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJj7qVVL7PwxURFkiUNJEN8tY",
          "google_rating": 4.3,
          "google_review_count": 6425,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–٢:٠٠ص",
          "phone": "056 951 8413",
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grills",
          "name_ar": "mixed grills",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "meat kebab",
          "name_ar": "meat kebab",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "at_beirut_jeddah",
      "canonical_name": "At Beirut Jeddah",
      "arabic_name": "في بيروت جدة",
      "categories": [
        "grills",
        "lebanese"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "lebanese"
      ],
      "subcategories": [
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "mixed grills",
      "signature_dish_en": "mixed grills",
      "vibe_tags_ar": [
        "مشاوي لبنانية أصيلة",
        "شيش طاووق ومقبلات",
        "توصيل قوي",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Authentic Lebanese Grills",
        "Shish Tawook & Mezza",
        "Strong Delivery",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "at_beirut_jeddah",
          "branch_name_en": "Al Batarji / Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "مطعم في بيروت جدة | At Beirut Jeddah, البترجي فرعي، الزهراء، جدة 23521",
          "latitude": 21.5974832,
          "longitude": 39.129700799999995,
          "maps_business_name": "At Beirut Jeddah",
          "google_place_id": "ChIJgehFcwDbwxUR1kYn8vbT1rg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJgehFcwDbwxUR1kYn8vbT1rg",
          "google_rating": 4.5,
          "google_review_count": 2214,
          "operating_status": "open",
          "hours": "السبت: ٨:٠٠ص–٣:٠٠ص; الأحد: ١٢:٠٠م–٣:٠٠ص; الاثنين: ١٢:٠٠م–٣:٠٠ص; الثلاثاء: ١٢:٠٠م–٣:٠٠ص; الأربعاء: ١٢:٠٠م–٣:٠٠ص; الخميس: ١٢:٠٠م–٣:٠٠ص; الجمعة: ٨:٠٠ص–٣:٠٠ص",
          "phone": "050 054 7799",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grills",
          "name_ar": "mixed grills",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "al_nakheel_restaurant",
      "canonical_name": "Al Nakheel Restaurant",
      "arabic_name": "مطعم النخيل",
      "categories": [
        "grills",
        "middle_eastern"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "middle_eastern"
      ],
      "subcategories": [
        "middle_eastern"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "mixed grill",
      "signature_dish_en": "mixed grill",
      "vibe_tags_ar": [
        "أيقونة الكورنيش الحجازية",
        "مشاوي وأجواء بحرية",
        "ريش وكفتة ضأن",
        "سهرات كورنيش"
      ],
      "vibe_tags_en": [
        "Corniche Landmark",
        "Seaside Open-Air Dining",
        "Lamb Chops & Kofta",
        "Late Night Classic"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.alnakheel.group/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "al_nakheel_restaurant",
          "branch_name_en": "Corniche / Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "مطعم منتزه النخيل، حي، طريق الكورنيش الفرعي، الشاطئ، جدة 23413",
          "latitude": 21.5645709,
          "longitude": 39.1119218,
          "maps_business_name": "Al Nakheel Restaurant",
          "google_place_id": "ChIJh_DJ9inbwxUR0N9frVfFbdI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJh_DJ9inbwxUR0N9frVfFbdI",
          "google_rating": 3.9,
          "google_review_count": 9734,
          "operating_status": "open",
          "hours": "السبت: ٥:٠٠م–٤:٣٠ص; الأحد: ٥:٠٠م–٤:٣٠ص; الاثنين: ٥:٠٠م–٤:٣٠ص; الثلاثاء: ٥:٠٠م–٤:٣٠ص; الأربعاء: ٥:٠٠م–٤:٣٠ص; الخميس: ٥:٠٠م–٤:٣٠ص; الجمعة: ٥:٠٠م–٤:٣٠ص",
          "phone": "055 544 2969",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grill",
          "name_ar": "mixed grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "lamb kofta",
          "name_ar": "lamb kofta",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "lamb chops",
          "name_ar": "lamb chops",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "shish tawook",
          "name_ar": "shish tawook",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "shababik",
      "canonical_name": "Shababik",
      "arabic_name": "شبابيك",
      "categories": [
        "grills",
        "lebanese"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "lebanese"
      ],
      "subcategories": [
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "mixed grill",
      "signature_dish_en": "mixed grill",
      "vibe_tags_ar": [
        "لبناني فاخر وراقي",
        "مشاوي فحم استثنائية",
        "جلسات أنا سبيشال مول",
        "أجواء أنيقة"
      ],
      "vibe_tags_en": [
        "Upscale Lebanese Dining",
        "Artisan Charcoal Grills",
        "Ana Special Mall",
        "Chic Ambience"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://shababikrestaurant.com/menu",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shababik",
          "branch_name_en": "Ana Special Mall / Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Shababik Jeddah، طريق الامير سلطان، الروضة، Ana Special Mall، جدة 23431",
          "latitude": 21.551632899999998,
          "longitude": 39.143699999999995,
          "maps_business_name": "Shababik",
          "google_place_id": "ChIJ974aorLawxURF_Xer7kszfw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ974aorLawxURF_Xer7kszfw",
          "google_rating": 4.2,
          "google_review_count": 7879,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٣٠م–١:٠٠ص; الاثنين: ١٢:٣٠م–١:٠٠ص; الثلاثاء: ١٢:٣٠م–١:٠٠ص; الأربعاء: ١٢:٣٠م–١:٠٠ص; الخميس: ١٢:٣٠م–١:٠٠ص; الجمعة: ١٢:٣٠م–١:٠٠ص; السبت: ٩:٠٠ص–١:٠٠ص",
          "phone": "9200 03945",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grill",
          "name_ar": "mixed grill",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "burj_al_hamam",
      "canonical_name": "Burj Al Hamam",
      "arabic_name": "برج الحمام",
      "categories": [
        "grills",
        "lebanese"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "lebanese"
      ],
      "subcategories": [
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "mixed grill",
      "signature_dish_en": "mixed grill",
      "vibe_tags_ar": [
        "سلسلة لبنانية فاخرة",
        "ريش وكباب وموزات",
        "جلسات عائلية أنيقة",
        "ضيافة راقية"
      ],
      "vibe_tags_en": [
        "Luxury Lebanese Legend",
        "Cutlets & Premium Kebabs",
        "Elegant Family Dining",
        "Fine Hospitality"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_mohammadiyyah",
        "al_rawdah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.burjalhamamksa.com/en/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "burj_al_hamam",
          "branch_name_en": "Fayfa Avenue",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "مطعم برج الحمام، شارع الأمير محمد بن عبدالعزيز، الروضة، Prince Sultan Road - شارع الأمير سلطان District, جدة 23431",
          "latitude": 21.549478399999998,
          "longitude": 39.1435728,
          "maps_business_name": "Burj Al Hamam",
          "google_place_id": "ChIJR56rhurFwxURsM4S5VFie8w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJR56rhurFwxURsM4S5VFie8w",
          "google_rating": 4.7,
          "google_review_count": 3261,
          "operating_status": "open",
          "hours": "الأحد: ٩:٠٠ص–١٢:٣٠ص",
          "phone": "9200 08460",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "burj_al_hamam",
          "branch_name_en": "Penta Plaza",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Burj Al Hamam - Penta Plaza, طريق الامير سلطان، المحمدية، جدة 23621",
          "latitude": 21.632889499999997,
          "longitude": 39.1338131,
          "maps_business_name": "Burj Al Hamam",
          "google_place_id": "ChIJN7GNUADZwxURGwdB4eTwDkU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJN7GNUADZwxURGwdB4eTwDkU",
          "google_rating": 4.8,
          "google_review_count": 886,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٠٠م–١٢:٣٠ص",
          "phone": "9200 08460",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed grill",
          "name_ar": "mixed grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "beef cubes",
          "name_ar": "beef cubes",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "chicken tawook",
          "name_ar": "chicken tawook",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Halabi kebab",
          "name_ar": "Halabi kebab",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "lamb cutlets",
          "name_ar": "lamb cutlets",
          "is_signature": false,
          "sort_order": 4
        }
      ]
    },
    {
      "brand_id": "saraya_latif",
      "canonical_name": "Saraya Latif",
      "arabic_name": "سرايا لطيف",
      "categories": [
        "grills",
        "turkish"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 65,
      "estimated_spend_max_sar": 130,
      "signature_dish_ar": "Saraya Mix Grill",
      "signature_dish_en": "Saraya Mix Grill",
      "vibe_tags_ar": [
        "مشاوي تركية مختصة",
        "كباب أضنة وأورفا",
        "جلسات رايقة",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Artisan Turkish Grills",
        "Adana & Urfa Kebabs",
        "Warm Hospitality",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_hamra",
        "al_khalidiyyah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://ananinja.com/sa/en/restaurants/saraya-latif-20869",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "saraya_latif",
          "branch_name_en": "Palestine Street / Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "سرايا لطيف، مقابل مركز الجمجوم، شارع فلسطين، حي، G594+WHJ، جدة 23212",
          "latitude": 21.5198277,
          "longitude": 39.1563946,
          "maps_business_name": "Saraya Latif",
          "google_place_id": "ChIJgX0vu4nPwxURXh6srI6g3RE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJgX0vu4nPwxURXh6srI6g3RE",
          "google_rating": 4,
          "google_review_count": 7684,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "055 141 3721",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "saraya_latif",
          "branch_name_en": "Al Khalidiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "سرايا لطيف، سعود الفيصل، الخالدية، جدة 23421",
          "latitude": 21.5588224,
          "longitude": 39.1391329,
          "maps_business_name": "Saraya Latif",
          "google_place_id": "ChIJJZdf17bawxURiMma_86FOw8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJZdf17bawxURiMma_86FOw8",
          "google_rating": 4.4,
          "google_review_count": 6318,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١:٠٠ص",
          "phone": "055 141 7752",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Saraya Mix Grill",
          "name_ar": "Saraya Mix Grill",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Adana kebab",
          "name_ar": "Adana kebab",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Urfa kebab",
          "name_ar": "Urfa kebab",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "shish tawook",
          "name_ar": "shish tawook",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "yildizlar_restaurant",
      "canonical_name": "Yildizlar Restaurant",
      "arabic_name": "مطعم يلدزلار",
      "categories": [
        "grills",
        "lebanese",
        "middle_eastern"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "lebanese",
        "middle_eastern"
      ],
      "subcategories": [
        "lebanese",
        "middle_eastern"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "مشاوي مشكلة",
      "signature_dish_en": "Mixed Grill",
      "vibe_tags_ar": [
        "مطعم عريق وكلاسيك",
        "مشاوي شرقية ومقبلات",
        "أجواء تقليدية",
        "جلسات هادئة"
      ],
      "vibe_tags_en": [
        "Heritage Classic Restaurant",
        "Middle Eastern Grills & Mezza",
        "Traditional Charm",
        "Quiet Dining"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_hamra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "yildizlar_restaurant",
          "branch_name_en": "Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "مطعم يلدزلار، الحمراء، JCHA3274، 3274 المعادى، 7018، جدة 23212",
          "latitude": 21.5153705,
          "longitude": 39.1649408,
          "maps_business_name": "Yildizlar Restaurant",
          "google_place_id": "ChIJ8_XUIZDPwxURuDB1XWsSrVs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8_XUIZDPwxURuDB1XWsSrVs",
          "google_rating": 3.8,
          "google_review_count": 4386,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–١٢:٣٠ص",
          "phone": "012 653 1150",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Mixed Grill",
          "name_ar": "مشاوي مشكلة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "istanbul_grill_restaurant",
      "canonical_name": "Istanbul Grill Restaurant",
      "arabic_name": "مطعم اسطنبول جريل",
      "categories": [
        "grills",
        "turkish"
      ],
      "primary_category": "grills",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "مشاوي مشكلة",
      "signature_dish_en": "Mixed Grill",
      "vibe_tags_ar": [
        "مشاوي تركية سريعة",
        "سفري واقتصادي",
        "شارع حراء",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Fast Turkish Grills",
        "Budget & Quick Bite",
        "Hira Street",
        "Late Night Takeaway"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naeem"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "istanbul_grill_restaurant",
          "branch_name_en": "Al Naeem / Hira Street",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "الشيش للمشويات، النعيم، شارع حراء، حي، جدة",
          "latitude": 21.6129648,
          "longitude": 39.1498352,
          "maps_business_name": "Istanbul Grill Restaurant",
          "google_place_id": "ChIJpeROlxLawxURhEcynrnaKxY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJpeROlxLawxURhEcynrnaKxY",
          "google_rating": 4.2,
          "google_review_count": 2282,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–٢:٠٠ص",
          "phone": "055 676 5655",
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Mixed Grill",
          "name_ar": "مشاوي مشكلة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _grills_catalog;
  
  -- Verify brand count is exactly 15
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 15 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 15 brands';
  END IF;

  -- Verify branch count is exactly 43
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 43 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 43 branches';
  END IF;

  -- Verify canonical branch count is 29
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 29 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 29 canonical branches';
  END IF;

  -- Verify outer caution branch count is 14
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 14 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 14 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Grills catalog contains an unknown canonical district'; END IF;

  -- Verify all caution branches have non-null geographic notes
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NULL AND (br->>'geographic_notes' IS NULL OR length(trim(br->>'geographic_notes')) = 0)
  ) THEN RAISE EXCEPTION 'Caution branch without geographic notes detected'; END IF;

  -- Verify no place ID belongs to another brand in the existing database
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _grills_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode, time_slots, closing_time_ar, is_open_late, is_24_hours,
  avg_prep_minutes, tier, price_tier, signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, rating, platforms, links,
  city, primary_category, secondary_categories, subcategories, category_fit_confidence, category_fit_evidence, editorial_role,
  reputation_tags, context_tags, context_tag_evidence, business_type, operating_status, brand_status_confidence,
  verified_jeddah_branch_count, branch_list_completeness, meal_period_strength, serves_breakfast_menu, dining_mode_summary,
  price_position, estimated_sar_per_person_min, estimated_sar_per_person_max, official_website, trend_status, trend_confidence,
  overall_confidence, research_use, last_verified_at, menu_last_verified_at, manual_review_required, manual_review_reasons, intelligence_origin
)
SELECT
  b->>'brand_id',
  b->>'arabic_name',
  b->>'canonical_name',
  ARRAY(SELECT jsonb_array_elements_text(b->'categories')),
  (b->>'is_city_wide')::boolean,
  ARRAY(SELECT jsonb_array_elements_text(b->'canonical_districts')),
  'both',
  ARRAY(SELECT jsonb_array_elements_text(b->'time_slots')),
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 2:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  25,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  NULL,
  b->'delivery_platforms',
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'),
  'jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Verified by first-party operational presence and Google Places branch inventory',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  NULL,
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  NULL,
  false,
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-27T00:00:00Z'::timestamptz,
  NULL,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  categories=EXCLUDED.categories,
  is_city_wide=EXCLUDED.is_city_wide,
  branches=EXCLUDED.branches,
  dining_mode=EXCLUDED.dining_mode,
  time_slots=EXCLUDED.time_slots,
  closing_time_ar=EXCLUDED.closing_time_ar,
  is_open_late=EXCLUDED.is_open_late,
  is_24_hours=EXCLUDED.is_24_hours,
  avg_prep_minutes=EXCLUDED.avg_prep_minutes,
  tier=EXCLUDED.tier,
  price_tier=EXCLUDED.price_tier,
  signature_dish_ar=EXCLUDED.signature_dish_ar,
  signature_dish_en=EXCLUDED.signature_dish_en,
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  platforms=EXCLUDED.platforms,
  links=EXCLUDED.links,
  city=EXCLUDED.city,
  primary_category=EXCLUDED.primary_category,
  secondary_categories=EXCLUDED.secondary_categories,
  subcategories=EXCLUDED.subcategories,
  category_fit_confidence=EXCLUDED.category_fit_confidence,
  category_fit_evidence=EXCLUDED.category_fit_evidence,
  editorial_role=EXCLUDED.editorial_role,
  reputation_tags=EXCLUDED.reputation_tags,
  context_tags=EXCLUDED.context_tags,
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  dining_mode_summary=EXCLUDED.dining_mode_summary,
  price_position=EXCLUDED.price_position,
  estimated_sar_per_person_min=EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max=EXCLUDED.estimated_sar_per_person_max,
  official_website=EXCLUDED.official_website,
  trend_status=EXCLUDED.trend_status,
  trend_confidence=EXCLUDED.trend_confidence,
  overall_confidence=EXCLUDED.overall_confidence,
  research_use=EXCLUDED.research_use,
  last_verified_at=EXCLUDED.last_verified_at,
  manual_review_required=EXCLUDED.manual_review_required,
  manual_review_reasons=EXCLUDED.manual_review_reasons,
  intelligence_origin=EXCLUDED.intelligence_origin;

-- 2. Cleanup stale best sellers and sources for these 15 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _grills_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _grills_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _grills_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
)
INSERT INTO public.restaurant_branches (
  restaurant_id, branch_name_ar, branch_name_en, branch_status, branch_status_confidence, branch_type,
  district, address_en, latitude, longitude, maps_business_name, google_place_id, maps_lookup_status,
  google_maps_url, google_rating, google_review_count, rating_source, maps_last_verified_at,
  branch_identity_confidence, geographic_notes, last_verified_at
)
SELECT
  br->>'restaurant_id',
  br->>'branch_name_ar',
  br->>'branch_name_en',
  'open',
  'high'::public.intelligence_confidence,
  (br->>'branch_type')::public.branch_type,
  br->>'district',
  br->>'address_en',
  (br->>'latitude')::double precision,
  (br->>'longitude')::double precision,
  br->>'maps_business_name',
  br->>'google_place_id',
  'verified',
  br->>'google_maps_url',
  (br->>'google_rating')::numeric,
  (br->>'google_review_count')::integer,
  'google_maps_direct',
  '2026-09-27T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-27T00:00:00Z'::timestamptz
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id=EXCLUDED.restaurant_id,
  branch_name_ar=EXCLUDED.branch_name_ar,
  branch_name_en=EXCLUDED.branch_name_en,
  branch_status=EXCLUDED.branch_status,
  branch_status_confidence=EXCLUDED.branch_status_confidence,
  branch_type=EXCLUDED.branch_type,
  district=EXCLUDED.district,
  address_en=EXCLUDED.address_en,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  maps_business_name=EXCLUDED.maps_business_name,
  maps_lookup_status=EXCLUDED.maps_lookup_status,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  rating_source=EXCLUDED.rating_source,
  maps_last_verified_at=EXCLUDED.maps_last_verified_at,
  branch_identity_confidence=EXCLUDED.branch_identity_confidence,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert best sellers
WITH catalog AS (SELECT payload FROM _grills_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
)
INSERT INTO public.restaurant_best_sellers (
  restaurant_id, name_ar, name_en, is_signature, sort_order, confidence, evidence_summary, last_verified_at
)
SELECT
  restaurant_id,
  item->>'name_ar',
  item->>'name_en',
  (item->>'is_signature')::boolean,
  (item->>'sort_order')::integer,
  'high'::public.intelligence_confidence,
  'Certified Grills Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _grills_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL
)
INSERT INTO public.restaurant_sources (
  restaurant_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  b->>'brand_id',
  'official_website'::public.research_source_type,
  b->>'official_website',
  ARRAY['brand_identity', 'category', 'best_sellers']::text[],
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _grills_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
)
INSERT INTO public.restaurant_sources (
  restaurant_id, branch_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  br->>'restaurant_id',
  rb.id,
  'google_maps'::public.research_source_type,
  br->>'google_maps_url',
  ARRAY['google_identity', 'location', 'business_status', 'google_reputation']::text[],
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
