-- Google-verified Jeddah Saudi / Rice / Kabsa production catalog.
-- Source: docs/research/jeddah-saudi-rice-kabsa-pass-d-corrected.json
-- 16 approved brands, 45 verified physical branches (31 canonical, 14 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and hours directly from Google Places API (New).
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, or Shawarma catalogs.
-- Apply after 20260926000300_jeddah_shawarma_catalog.sql.
BEGIN;

-- 0. Reconcile legacy orphan placeholder 'matam_baladi' if present without branches
DELETE FROM public.restaurants WHERE id = 'matam_baladi' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'matam_baladi'
);

CREATE TEMP TABLE _saudi_rice_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _saudi_rice_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Saudi / Rice / Kabsa Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-26",
    "brand_count": 16,
    "branch_count": 45,
    "canonical_branch_count": 31,
    "outer_caution_branch_count": 14
  },
  "brands": [
    {
      "brand_id": "raydan",
      "canonical_name": "Raydan",
      "arabic_name": "ريدان",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "madhbi",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "madhbi",
        "traditional_saudi"
      ],
      "subcategories": [
        "mandi",
        "madhbi",
        "traditional_saudi"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "مندي لحم",
      "signature_dish_en": "Mandi Lamb",
      "vibe_tags_ar": [
        "مندي ومظبي",
        "رز ولحم",
        "عائلي",
        "سفري"
      ],
      "vibe_tags_en": [
        "Mandi & Madhbi",
        "Traditional Rice",
        "Family Feast",
        "Takeaway"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "casual_hangout",
        "delivery_strong",
        "late_night",
        "group_dining"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_hamdaniyah",
        "al_naseem",
        "al_safa",
        "al_samer",
        "an_nuzhah"
      ],
      "official_website": "https://raydan.com.sa/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Mandi Lamb",
          "name_ar": "مندي لحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Madhbi Chicken",
          "name_ar": "مظبي دجاج",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Kabsa Chicken",
          "name_ar": "كبسة دجاج",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Saleeg Taifi",
          "name_ar": "سليق طائفي",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Hamdaniyah Al Majed",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "شارع الحمدانية، Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7622639,
          "longitude": 39.1994645,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJg9bwO2N8wRURHt_T0Rzf_9A",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJg9bwO2N8wRURHt_T0Rzf_9A",
          "google_rating": 3.6,
          "google_review_count": 1926,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "059 329 7288",
          "geographic_notes": "Located on Al Hamdaniyah Street near Al Majed commercial strip.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Hamdaniyah Al Falah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "7077 - حي - 2917، Al Falah, Jeddah 23762, Saudi Arabia",
          "latitude": 21.7748176,
          "longitude": 39.175249400000006,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJ08FVqph8wRUR_FdL0gaLmh8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ08FVqph8wRUR_FdL0gaLmh8",
          "google_rating": 3.6,
          "google_review_count": 2488,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "012 250 8600",
          "geographic_notes": "Located in Al Falah neighborhood just north of Al Hamdaniyah, outside the 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "حي، Abu Thar Al-Ghifari, An Naseem, Hail 55428, Saudi Arabia",
          "latitude": 21.522400899999997,
          "longitude": 39.239576899999996,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJh_8wm__NwxURCB3xm75aoTs",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJh_8wm__NwxURCB3xm75aoTs",
          "google_rating": 3.4,
          "google_review_count": 2438,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "9200 00043",
          "geographic_notes": "Located on Abu Dhar Al-Ghifari Street in Al Naseem district.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "8509، Obhur Al-Shamaliyah, Jeddah 23817, Saudi Arabia",
          "latitude": 21.7606622,
          "longitude": 39.1176037,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJG9SGUAFjwRURtnZvgfbECpw",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJG9SGUAFjwRURtnZvgfbECpw",
          "google_rating": 3.4,
          "google_review_count": 1274,
          "operating_status": "open",
          "hours": "11:00 AM – 1:30 AM",
          "phone": "012 250 8600",
          "geographic_notes": "Located on Aber Al Qarat Road in Abhur Al Shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "H6J6+QH5, Abdullah Al-Sharbatlee, Al-Safa, Jeddah 23454, Saudi Arabia",
          "latitude": 21.5823479,
          "longitude": 39.208858299999996,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJAQAAABTRwxURnjXuvVohR6I",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJAQAAABTRwxURnjXuvVohR6I",
          "google_rating": 3.8,
          "google_review_count": 8938,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "012 250 8600",
          "geographic_notes": "Flagship central branch located on Abdullah Al Sharbatli Street, Al Safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "طريق حي السامر, Al Rabi', Jeddah 22631, Saudi Arabia",
          "latitude": 21.5785184,
          "longitude": 39.2301761,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJLdb_U2TRwxUR_IuGLpMDYeU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJLdb_U2TRwxUR_IuGLpMDYeU",
          "google_rating": 3.6,
          "google_review_count": 1740,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "9200 00043",
          "geographic_notes": "Located on Al Samer Road (Al Rabie/Al Samer boundary).",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raydan",
          "branch_name_en": "Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "Hira St, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6151806,
          "longitude": 39.1613378,
          "maps_business_name": "Raydan",
          "google_place_id": "ChIJC02hBabQwxUR0ZYW3K24iBM",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJC02hBabQwxUR0ZYW3K24iBM",
          "google_rating": 3.6,
          "google_review_count": 7078,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "012 250 8600",
          "geographic_notes": "Located on Hira Street within An Nuzhah district.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "al_romansiah",
      "canonical_name": "Al Romansiah",
      "arabic_name": "الرومانسية",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "madhbi",
        "traditional_saudi",
        "haneeth"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "madhbi",
        "traditional_saudi",
        "haneeth"
      ],
      "subcategories": [
        "mandi",
        "madhbi",
        "traditional_saudi",
        "haneeth"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "مظبي دجاج",
      "signature_dish_en": "Madhbi Chicken",
      "vibe_tags_ar": [
        "كبسة ومندي",
        "مظبي",
        "عائلي",
        "ضيافة"
      ],
      "vibe_tags_en": [
        "Kabsa & Mandi",
        "Madhbi",
        "Family Feast",
        "Saudi Hospitality"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "group_dining",
        "dine_in_strong",
        "delivery_strong",
        "casual_hangout"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_bawadi",
        "al_hamdaniyah",
        "al_safa"
      ],
      "official_website": "https://alromansiah.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Madhbi Chicken",
          "name_ar": "مظبي دجاج",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Mandi Lamb",
          "name_ar": "مندي لحم",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Haneeth Lamb",
          "name_ar": "حنيذ لحم",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Kabsa Chicken",
          "name_ar": "كبسة دجاج",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "Kunafeh",
          "name_ar": "كنافة",
          "is_signature": false,
          "sort_order": 4
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "al_romansiah",
          "branch_name_en": "Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Qouraish, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.59782,
          "longitude": 39.161556999999995,
          "maps_business_name": "Al Romansiah",
          "google_place_id": "ChIJacUSc5DRwxURiis7IF3O_Ho",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJacUSc5DRwxURiis7IF3O_Ho",
          "google_rating": 4.2,
          "google_review_count": 27112,
          "operating_status": "open",
          "hours": "10:30 AM – 1:00 AM",
          "phone": "9200 00144",
          "geographic_notes": "Major multi-story dining complex on Quraysh Street, Al Bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_romansiah",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "8112 3346 جدة SA، حي الحمدانية، Jeddah 23761, Saudi Arabia",
          "latitude": 21.767585999999998,
          "longitude": 39.190273,
          "maps_business_name": "Al Romansiah",
          "google_place_id": "ChIJuye_rRJ9wRUR6yRl-SmRjQc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJuye_rRJ9wRUR6yRl-SmRjQc",
          "google_rating": 4.2,
          "google_review_count": 7151,
          "operating_status": "open",
          "hours": "10:30 AM – 1:00 AM",
          "phone": "9200 00144",
          "geographic_notes": "Located in Al Hamdaniyah commercial corridor.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_romansiah",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "3410 Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23452, Saudi Arabia",
          "latitude": 21.587661,
          "longitude": 39.205760999999995,
          "maps_business_name": "Al Romansiah",
          "google_place_id": "ChIJS2-RawDRwxURgWHa6QRNWMY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJS2-RawDRwxURgWHa6QRNWMY",
          "google_rating": 4.3,
          "google_review_count": 1266,
          "operating_status": "open",
          "hours": "10:30 AM – 1:00 AM",
          "phone": "9200 00144",
          "geographic_notes": "Located on Prince Mutaib bin Abdulaziz Road, Al Safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_romansiah",
          "branch_name_en": "Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "شارع خبيب بن عدي الأنصاري الفرعي، Al Sanabel, Jeddah 22444, Saudi Arabia",
          "latitude": 21.397427999999998,
          "longitude": 39.288182,
          "maps_business_name": "Al Romansiah",
          "google_place_id": "ChIJI8cwBADLwxURj9Vpqjl8n1k",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJI8cwBADLwxURj9Vpqjl8n1k",
          "google_rating": 4.1,
          "google_review_count": 828,
          "operating_status": "open",
          "hours": "10:30 AM – 1:00 AM",
          "phone": "9200 00144",
          "geographic_notes": "Located on Khubayb bin Adi Al Ansari Street in Al Sanabel (outer southern district outside the 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "al_saddah",
      "canonical_name": "Al Saddah",
      "arabic_name": "السدة",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "madfoon",
        "madhbi",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "madfoon",
        "madhbi",
        "traditional_saudi"
      ],
      "subcategories": [
        "mandi",
        "madfoon",
        "madhbi",
        "traditional_saudi"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "مندي لحم",
      "signature_dish_en": "Lamb Mandi",
      "vibe_tags_ar": [
        "مندي أصيل",
        "مدفون",
        "لحم بلدي",
        "عزائم"
      ],
      "vibe_tags_en": [
        "Authentic Mandi",
        "Madfoon",
        "Local Meat",
        "Group Feast"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "group_dining",
        "local_favorite"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_rawdah",
        "al_ruwais"
      ],
      "official_website": "https://alsaddah.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Lamb Mandi",
          "name_ar": "مندي لحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lamb Madfoon",
          "name_ar": "مدفون لحم",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Madhbi Chicken",
          "name_ar": "مظبي دجاج",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Saleeg",
          "name_ar": "سليق",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "al_saddah",
          "branch_name_en": "Tahlia",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Ar Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.553534199999998,
          "longitude": 39.162201499999995,
          "maps_business_name": "Al Saddah",
          "google_place_id": "ChIJI-3znwXQwxURN8ovm8z7GG4",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJI-3znwXQwxURN8ovm8z7GG4",
          "google_rating": 4.1,
          "google_review_count": 10898,
          "operating_status": "open",
          "hours": "11:30 AM – 12:00 AM",
          "phone": "012 667 7763",
          "geographic_notes": "Flagship destination located on Prince Mohammed bin Abdulaziz (Tahlia) Street, Al Rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_saddah",
          "branch_name_en": "Palestine",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "شارع فلسطين، مقابل مستشفى سليمان فقيه، Al-Ruwais, Jeddah 23215, Saudi Arabia",
          "latitude": 21.5255482,
          "longitude": 39.170310199999996,
          "maps_business_name": "Al Saddah",
          "google_place_id": "ChIJrz0lluvPwxURKf2w5x9PAJs",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJrz0lluvPwxURKf2w5x9PAJs",
          "google_rating": 4.1,
          "google_review_count": 15033,
          "operating_status": "open",
          "hours": "11:30 AM – 12:00 AM",
          "phone": "012 667 3545",
          "geographic_notes": "Located on Palestine Street opposite Dr. Soliman Fakeeh Hospital, Al Ruwais.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_saddah",
          "branch_name_en": "Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Hira St, An Nahdah, Jeddah 23523, Saudi Arabia",
          "latitude": 21.6093892,
          "longitude": 39.13383100000001,
          "maps_business_name": "Al Saddah",
          "google_place_id": "ChIJy7kH2EHawxUR5sCHxb9laV0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJy7kH2EHawxUR5sCHxb9laV0",
          "google_rating": 4.1,
          "google_review_count": 11000,
          "operating_status": "open",
          "hours": "11:30 AM – 12:00 AM",
          "phone": "012 622 8296",
          "geographic_notes": "Located on Hira Street in Al Nahdah district (outer north-central, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "almazaq_al_bukhari",
      "canonical_name": "Almazaq Al Bukhari",
      "arabic_name": "المذاق البخاري",
      "categories": [
        "saudi_rice",
        "rice",
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "subcategories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "دجاج شواية مع رز بخاري",
      "signature_dish_en": "Shawaya Chicken with Bukhari Rice",
      "vibe_tags_ar": [
        "بخاري أصيل",
        "شواية وفحم",
        "سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Authentic Bukhari",
        "Rotisserie & Charcoal",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
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
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "abhur_al_janoubiyah",
        "al_hamdaniyah",
        "al_naseem",
        "al_safa",
        "al_samer",
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Shawaya Chicken with Bukhari Rice",
          "name_ar": "دجاج شواية مع رز بخاري",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Faham Charcoal Chicken with Peshawari Rice",
          "name_ar": "دجاج فحم مع رز بشاور",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mixed Vegetable Edam",
          "name_ar": "إيدام مشكل",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.5185687,
          "longitude": 39.2394371,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJv_m5c3rPwxURwGzBoqNrKvQ",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJv_m5c3rPwxURwGzBoqNrKvQ",
          "google_rating": 4.5,
          "google_review_count": 3654,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 510 9134",
          "geographic_notes": "Located in Al Naseem district.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23453, Saudi Arabia",
          "latitude": 21.5711698,
          "longitude": 39.2108704,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJc_zD4gnRwxURlCOIQkK47ts",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJc_zD4gnRwxURlCOIQkK47ts",
          "google_rating": 4.2,
          "google_review_count": 2768,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 575 9733",
          "geographic_notes": "Flagship branch on Prince Mutaib bin Abdulaziz Road, Al Safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "حي، Al Samer, Jeddah 23462, Saudi Arabia",
          "latitude": 21.5813071,
          "longitude": 39.2389321,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJtXGnPzrTwxURnctgjBZCOII",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJtXGnPzrTwxURnctgjBZCOII",
          "google_rating": 4.1,
          "google_review_count": 886,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "053 855 8927",
          "geographic_notes": "Located in Al Samer district.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "حي، القاسم بن أمية(رضي الله عنه)، Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7581205,
          "longitude": 39.187743,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJk8bKM-R9wRURPYnmwFsnCSU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJk8bKM-R9wRURPYnmwFsnCSU",
          "google_rating": 4.2,
          "google_review_count": 710,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 587 3433",
          "geographic_notes": "Located on Al Qasim bin Umayyah Street, Al Hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "South Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_janoubiyah",
          "address_en": "3801-3823 Hazm Ibn Abi Kaab, Abhur Al Junoobiyah, Jeddah 23733, Saudi Arabia",
          "latitude": 21.7445743,
          "longitude": 39.1400113,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJ00v8XgBjwRURT3w1azRcnx8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ00v8XgBjwRURT3w1azRcnx8",
          "google_rating": 4.6,
          "google_review_count": 840,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 104 9639",
          "geographic_notes": "Located on Hazm bin Abi Kaab Street, Abhur Al Janoubiyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Shati / Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "JEZA7425, 7425, 2744 احمد العطاس، الزهراء، جدة 23425, Saudi Arabia",
          "latitude": 21.5849038,
          "longitude": 39.1313937,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJDWzcDwDbwxUR_S3kh1w1heA",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJDWzcDwDbwxUR_S3kh1w1heA",
          "google_rating": 4.5,
          "google_review_count": 587,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 600 2081",
          "geographic_notes": "Located on Ahmed Al Attas Street, Al Zahra (bordering Al Shati).",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almazaq_al_bukhari",
          "branch_name_en": "Harazat",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "الحرازات، Jeddah 22393, Saudi Arabia",
          "latitude": 21.4842962,
          "longitude": 39.3696638,
          "maps_business_name": "Almazaq Al Bukhari",
          "google_place_id": "ChIJT_QFpkUzwhURW9cSbPtroEE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJT_QFpkUzwhURW9cSbPtroEE",
          "google_rating": 3.9,
          "google_review_count": 457,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "055 509 5233",
          "geographic_notes": "Located in Al Harazat (outer eastern district outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "hashi_basha",
      "canonical_name": "Hashi Basha",
      "arabic_name": "حاشي باشا",
      "categories": [
        "saudi_rice",
        "rice",
        "kabsa",
        "hashi",
        "madghoot",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "kabsa",
        "hashi",
        "madghoot",
        "traditional_saudi"
      ],
      "subcategories": [
        "kabsa",
        "hashi",
        "madghoot",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "مضغوط حاشي",
      "signature_dish_en": "Madghoot Hashi",
      "vibe_tags_ar": [
        "مضغوط حاشي",
        "كبسة حاشي",
        "سريع",
        "جلسات شباب"
      ],
      "vibe_tags_en": [
        "Camel Madghoot",
        "Hashi Kabsa",
        "Quick Bite",
        "Casual Dining"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "casual_hangout",
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
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_naseem",
        "al_safa",
        "al_samer"
      ],
      "official_website": "https://hashibasha.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Madghoot Hashi",
          "name_ar": "مضغوط حاشي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Kabsa Hashi",
          "name_ar": "كبسة حاشي",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Madghoot Chicken",
          "name_ar": "مضغوط دجاج",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "hashi_basha",
          "branch_name_en": "Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "حي, شارع أبي ذر الغفاري، An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.521902,
          "longitude": 39.239560999999995,
          "maps_business_name": "Hashi Basha",
          "google_place_id": "ChIJ44xNNhHNwxUR6FXsE1JsUWg",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ44xNNhHNwxUR6FXsE1JsUWg",
          "google_rating": 3.7,
          "google_review_count": 1605,
          "operating_status": "open",
          "hours": "11:00 AM – 4:00 AM",
          "phone": "053 040 7666",
          "geographic_notes": "Branch HB51 located on Abu Dhar Al Ghifari Street, Al Naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "hashi_basha",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "حي, طريق الأمير متعب الفرعي، Al-Safa, Jeddah 23452, Saudi Arabia",
          "latitude": 21.583371,
          "longitude": 39.207259,
          "maps_business_name": "Hashi Basha",
          "google_place_id": "ChIJZZ_X7WLRwxUR6F4zRVLEIO8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJZZ_X7WLRwxUR6F4zRVLEIO8",
          "google_rating": 3.9,
          "google_review_count": 1657,
          "operating_status": "open",
          "hours": "11:30 AM – 12:30 AM",
          "phone": "050 004 3740",
          "geographic_notes": "Branch HB29 located on Prince Mutaib Branch Road, Al Safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "hashi_basha",
          "branch_name_en": "Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "حي، شارع الحسين السهواجي، Al Rabi', Jeddah 23461, Saudi Arabia",
          "latitude": 21.579162999999998,
          "longitude": 39.238138,
          "maps_business_name": "Hashi Basha",
          "google_place_id": "ChIJgdj9AZ7RwxURHFxBfC9KZZg",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJgdj9AZ7RwxURHFxBfC9KZZg",
          "google_rating": 4,
          "google_review_count": 1827,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "050 004 5762",
          "geographic_notes": "Branch HB25 located on Al Hussein Al Sahwaji Street, Al Rabie/Al Samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "hashi_basha",
          "branch_name_en": "Ajawid",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "حي, شارع سهل بن عمرو الفرعي، Alajaweed, Jeddah 22441, Saudi Arabia",
          "latitude": 21.417793,
          "longitude": 39.301088,
          "maps_business_name": "Hashi Basha",
          "google_place_id": "ChIJ5-sWd6bLwxURpBpOHi25buY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ5-sWd6bLwxURpBpOHi25buY",
          "google_rating": 3.9,
          "google_review_count": 954,
          "operating_status": "open",
          "hours": "11:00 AM – 12:00 AM",
          "phone": "050 054 5812",
          "geographic_notes": "Branch HB75 located on Sahl bin Amr Street in Al Ajawid (outer southern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "hashi_basha",
          "branch_name_en": "Muraikh",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Unnamed Road, Mraykh, Jeddah 23252, Saudi Arabia",
          "latitude": 21.548623,
          "longitude": 39.283328,
          "maps_business_name": "Hashi Basha",
          "google_place_id": "ChIJf03UKSbTwxURNAPKm8zzn2U",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJf03UKSbTwxURNAPKm8zzn2U",
          "google_rating": 3.9,
          "google_review_count": 464,
          "operating_status": "open",
          "hours": "11:00 AM – 3:00 AM",
          "phone": "053 002 2264",
          "geographic_notes": "Branch HB142 located in Muraikh/Taysir (outer eastern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "eleyk_al_bukhari",
      "canonical_name": "Eleyk Al Bukhari",
      "arabic_name": "إليك البخاري",
      "categories": [
        "saudi_rice",
        "rice",
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "subcategories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "دجاج شواية مع رز بخاري",
      "signature_dish_en": "Bukhari Chicken Shawaya",
      "vibe_tags_ar": [
        "بخاري مميز",
        "دجاج شواية",
        "سريع",
        "شعبي"
      ],
      "vibe_tags_en": [
        "Classic Bukhari",
        "Rotisserie Chicken",
        "Quick Bite",
        "Local Favorite"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "late_night",
        "local_favorite"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_faisaliyyah",
        "al_salamah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Bukhari Chicken Shawaya",
          "name_ar": "دجاج شواية مع رز بخاري",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Faham Chicken on Peshawari Rice",
          "name_ar": "دجاج فحم على رز بشاور",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Moussaka / Mixed Edam",
          "name_ar": "مسقعة / إيدام مشكل",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "eleyk_al_bukhari",
          "branch_name_en": "Faisaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "4327 Prince Saud Al Faisal, Al Faisaliyyah, 7487, Jeddah 23444, Saudi Arabia",
          "latitude": 21.569304499999998,
          "longitude": 39.1879028,
          "maps_business_name": "Eleyk Al Bukhari",
          "google_place_id": "ChIJ9QM1ksfRwxURtyB2fwrsAnM",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ9QM1ksfRwxURtyB2fwrsAnM",
          "google_rating": 3.9,
          "google_review_count": 1234,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "053 631 2235",
          "geographic_notes": "Located on Saud Al Faisal Street, Al Faisaliyyah (normalized from al_faisaliyah).",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "eleyk_al_bukhari",
          "branch_name_en": "Salamah / Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Sari Br Rd, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5803275,
          "longitude": 39.1619009,
          "maps_business_name": "Eleyk Al Bukhari",
          "google_place_id": "ChIJ407RJBTbwxURDnEblLv9uQw",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ407RJBTbwxURDnEblLv9uQw",
          "google_rating": 4.3,
          "google_review_count": 889,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "054 147 0332",
          "geographic_notes": "Located on Sari Branch Road, Al Salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "eleyk_al_bukhari",
          "branch_name_en": "Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "طريق السنابل درعه، Al Sanabel, Jeddah 22434, Saudi Arabia",
          "latitude": 21.4080866,
          "longitude": 39.2604543,
          "maps_business_name": "Eleyk Al Bukhari",
          "google_place_id": "ChIJG1kthrfLwxURtbIP3SEOSXo",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJG1kthrfLwxURtbIP3SEOSXo",
          "google_rating": 4.1,
          "google_review_count": 2140,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "054 503 7706",
          "geographic_notes": "Located on Sanabel Road, Al Sanabel (outer southern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "eleyk_al_bukhari",
          "branch_name_en": "Mada'en Al-Fahd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Mada'en Al-Fahd, Jeddah 22347, Saudi Arabia",
          "latitude": 21.4547506,
          "longitude": 39.2477921,
          "maps_business_name": "Eleyk Al Bukhari",
          "google_place_id": "ChIJnSVuCX7NwxUR5AlFnAscpp0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJnSVuCX7NwxUR5AlFnAscpp0",
          "google_rating": 4.4,
          "google_review_count": 164,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "054 867 7103",
          "geographic_notes": "Located in Mada'en Al-Fahd (outer southern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "kabset_elham",
      "canonical_name": "Kabset Elham",
      "arabic_name": "كبسة إلهام",
      "categories": [
        "saudi_rice",
        "rice",
        "kabsa",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "kabsa",
        "traditional_saudi"
      ],
      "subcategories": [
        "kabsa",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "كبسة إلهام دجاج",
      "signature_dish_en": "Kabset Elham Special Chicken",
      "vibe_tags_ar": [
        "كبسة بيتية",
        "دجاج ولحم",
        "نكهة أصيلة",
        "سريع"
      ],
      "vibe_tags_en": [
        "Home-Style Kabsa",
        "Chicken & Meat",
        "Authentic Flavor",
        "Quick Bite"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "quick_bite",
        "delivery_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Kabset Elham Special Chicken",
          "name_ar": "كبسة إلهام دجاج",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Meat Kabsa",
          "name_ar": "كبسة لحم",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Saleeg",
          "name_ar": "سليق",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "kabset_elham",
          "branch_name_en": "Al Batarji / Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "6849 Al Batarji, 4170، Jeddah 23522, Saudi Arabia",
          "latitude": 21.5980755,
          "longitude": 39.1388588,
          "maps_business_name": "Kabset Elham",
          "google_place_id": "ChIJKauhIgDbwxURMVenYDlDt9E",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJKauhIgDbwxURMVenYDlDt9E",
          "google_rating": 3.8,
          "google_review_count": 6418,
          "operating_status": "open",
          "hours": "12:00 PM – 2:00 AM",
          "phone": null,
          "geographic_notes": "Located on Al Batarji Street, Al Zahra district (postal code 23522).",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "sarmad",
      "canonical_name": "Sarmad",
      "arabic_name": "سرمد",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "traditional_saudi",
        "madhbi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "traditional_saudi",
        "madhbi"
      ],
      "subcategories": [
        "mandi",
        "traditional_saudi",
        "madhbi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "مندي لحم",
      "signature_dish_en": "Mandi Meat",
      "vibe_tags_ar": [
        "مندي ومظبي",
        "شعبي أصيل",
        "عزائم",
        "نكهة زمان"
      ],
      "vibe_tags_en": [
        "Mandi & Madhbi",
        "Traditional Kitchen",
        "Group Feast",
        "Old-School Flavor"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "group_dining",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Mandi Meat",
          "name_ar": "مندي لحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Madhbi Chicken",
          "name_ar": "مظبي دجاج",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Peshawari Rice with Meat",
          "name_ar": "رز بشاور باللحم",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "sarmad",
          "branch_name_en": "Al-Baghdadiyah Al-Sharqiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Muhammad Ibn Abdulwahab, Al-Baghdadiyah Al-Sharqiyah, Jeddah 22235, Saudi Arabia",
          "latitude": 21.492869199999998,
          "longitude": 39.1889999,
          "maps_business_name": "Sarmad",
          "google_place_id": "ChIJxf2GGBrPwxURJdsAMM7PORI",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJxf2GGBrPwxURJdsAMM7PORI",
          "google_rating": 4.3,
          "google_review_count": 7332,
          "operating_status": "open",
          "hours": "11:00 AM – 1:00 AM",
          "phone": "9200 35728",
          "geographic_notes": "Located on Mohammed bin Abdulwahab Street in Al Baghdadiyah Al Sharqiyah (historic central core, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "labbani_fakher",
      "canonical_name": "Labbani Fakher",
      "arabic_name": "لباني فاخر",
      "categories": [
        "saudi_rice",
        "rice",
        "haneeth",
        "mandi",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "haneeth",
        "mandi",
        "traditional_saudi"
      ],
      "subcategories": [
        "haneeth",
        "mandi",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "لحم لباني فاخر مع الرز",
      "signature_dish_en": "Labbani Meat with Rice",
      "vibe_tags_ar": [
        "لحم لباني",
        "حنيذ ومظبي",
        "طازج وفاخر",
        "عزائم"
      ],
      "vibe_tags_en": [
        "Prime Labbani Lamb",
        "Haneeth & Madhbi",
        "Premium Fresh Meat",
        "Group Feast"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "group_dining",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_samer"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Labbani Meat with Rice",
          "name_ar": "لحم لباني فاخر مع الرز",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Haneeth Labbani",
          "name_ar": "حنيذ لباني",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Madhbi Labbani",
          "name_ar": "مظبي لباني",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "labbani_fakher",
          "branch_name_en": "Samer / Al Rabie",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "انقره، Al Rabi', Jeddah 23462, Saudi Arabia",
          "latitude": 21.586602,
          "longitude": 39.2308904,
          "maps_business_name": "Labbani Fakher",
          "google_place_id": "ChIJGbh1lUTRwxURsgxasS7gRB0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJGbh1lUTRwxURsgxasS7gRB0",
          "google_rating": 4.4,
          "google_review_count": 3334,
          "operating_status": "open",
          "hours": "11:30 AM – 1:00 AM",
          "phone": "9200 06950",
          "geographic_notes": "Located on Ankara Street in Al Rabie bordering Al Samer; universally known locally as the Samer branch.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "labbani_fakher",
          "branch_name_en": "Al Rayaan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "6448، JFRB2266، 2266 أبو عبد الله بن الحارث، Al Rayaan, Jeddah 23643, Saudi Arabia",
          "latitude": 21.6694224,
          "longitude": 39.2062321,
          "maps_business_name": "Labbani Fakher",
          "google_place_id": "ChIJP8iEJwDXwxURlBl1fKn4OAc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJP8iEJwDXwxURlBl1fKn4OAc",
          "google_rating": 4.6,
          "google_review_count": 1600,
          "operating_status": "open",
          "hours": "11:00 AM – 1:00 AM",
          "phone": "9200 06950",
          "geographic_notes": "Located on Abu Abdullah bin Al Harith Street in Al Rayaan (outer northeastern district near airport, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "mandi_world",
      "canonical_name": "Mandi World",
      "arabic_name": "مندي ورلد",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "traditional_saudi"
      ],
      "subcategories": [
        "mandi",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "مندي لحم بلدي",
      "signature_dish_en": "Lamb Mandi",
      "vibe_tags_ar": [
        "مندي عصري",
        "لحم ودجاج",
        "نظيف ومرتب",
        "جلسات عائلية"
      ],
      "vibe_tags_en": [
        "Modern Mandi",
        "Meat & Chicken",
        "Contemporary Dine-In",
        "Family Friendly"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "casual_hangout",
        "dine_in_strong",
        "delivery_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_rawdah",
        "al_safa"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Lamb Mandi",
          "name_ar": "مندي لحم بلدي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Mandi",
          "name_ar": "مندي دجاج",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Kunafeh",
          "name_ar": "كنافة",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "mandi_world",
          "branch_name_en": "Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Hamad Al Jaser, Ar Rawdah, Jeddah 23434, Saudi Arabia",
          "latitude": 21.577047999999998,
          "longitude": 39.1571018,
          "maps_business_name": "Mandi World",
          "google_place_id": "ChIJZeUPAm3RwxUR5QVhnLtcZPU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJZeUPAm3RwxUR5QVhnLtcZPU",
          "google_rating": 4.2,
          "google_review_count": 4552,
          "operating_status": "open",
          "hours": "11:30 AM – 2:00 AM",
          "phone": "053 238 5217",
          "geographic_notes": "Located on Hamad Al Jasir Street, Al Rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mandi_world",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "As Safa, District, الشيخ عبدالعزيز بن باز، Rd, جدة 23456, Saudi Arabia",
          "latitude": 21.6047308,
          "longitude": 39.211001499999995,
          "maps_business_name": "Mandi World",
          "google_place_id": "ChIJ3aph_hPRwxURc2dm1zO9OPo",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ3aph_hPRwxURc2dm1zO9OPo",
          "google_rating": 4.7,
          "google_review_count": 2658,
          "operating_status": "open",
          "hours": "11:00 AM – 2:00 AM",
          "phone": "053 636 9797",
          "geographic_notes": "Located on Sheikh Abdulaziz bin Baz Road, Al Safa.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "hashi_bin_hamoud",
      "canonical_name": "Hashi Bin Hamoud",
      "arabic_name": "حاشي بن حمود",
      "categories": [
        "saudi_rice",
        "rice",
        "hashi",
        "kabsa",
        "madghoot",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "hashi",
        "kabsa",
        "madghoot",
        "traditional_saudi"
      ],
      "subcategories": [
        "hashi",
        "kabsa",
        "madghoot",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "مضغوط حاشي طازج",
      "signature_dish_en": "Madghoot Hashi",
      "vibe_tags_ar": [
        "حاشي بلدي",
        "مضغوط على أصوله",
        "طريق عسفان",
        "وجهة عشاق الحاشي"
      ],
      "vibe_tags_en": [
        "Local Camel Meat",
        "Authentic Madghoot",
        "Highway Destination",
        "Hashi Specialists"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "group_dining",
        "destination_dining",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Madghoot Hashi",
          "name_ar": "مضغوط حاشي طازج",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Kabsa Hashi Baladi",
          "name_ar": "كبسة حاشي بلدي",
          "is_signature": false,
          "sort_order": 1
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "hashi_bin_hamoud",
          "branch_name_en": "Al Madinah Rd / Usfan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Jeddah 23786, Saudi Arabia",
          "latitude": 21.8701367,
          "longitude": 39.234702,
          "maps_business_name": "Hashi Bin Hamoud",
          "google_place_id": "ChIJ_cocG7x7wRURd6BZrrKEtB8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ_cocG7x7wRURd6BZrrKEtB8",
          "google_rating": 4.3,
          "google_review_count": 6824,
          "operating_status": "open",
          "hours": "1:00 PM – 1:00 AM",
          "phone": "050 387 0863",
          "geographic_notes": "Located on Al Madinah Al Munawwarah Rd / Usfan corridor (postal code 23786, outer northern Jeddah, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "fnoon_al_shawaya",
      "canonical_name": "Fnoon Al Shawaya",
      "arabic_name": "فنون الشواية",
      "categories": [
        "saudi_rice",
        "rice",
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "subcategories": [
        "bukhari",
        "grilled_chicken",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "دجاج شواية مع رز بخاري",
      "signature_dish_en": "Shawaya Chicken with Bukhari Rice",
      "vibe_tags_ar": [
        "دجاج شواية",
        "بخاري سريع",
        "سفري",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Rotisserie Chicken",
        "Fast Bukhari",
        "Takeaway",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_samer",
        "al_sharafeyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Shawaya Chicken with Bukhari Rice",
          "name_ar": "دجاج شواية مع رز بخاري",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Faham Chicken with Rice",
          "name_ar": "دجاج فحم مع رز",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Edam Musaqaa",
          "name_ar": "إيدام مسقعة",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "fnoon_al_shawaya",
          "branch_name_en": "Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "Al Ajawad St, حي السامر، Jeddah 23462, Saudi Arabia",
          "latitude": 21.5922409,
          "longitude": 39.234899899999995,
          "maps_business_name": "Fnoon Al Shawaya",
          "google_place_id": "ChIJX3O3qFnRwxURS62jGEWbTws",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJX3O3qFnRwxURS62jGEWbTws",
          "google_rating": 3.9,
          "google_review_count": 527,
          "operating_status": "open",
          "hours": "11:30 AM – 1:00 AM",
          "phone": "055 139 6929",
          "geographic_notes": "Located on Al Ajwad Street, Al Samer district.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "fnoon_al_shawaya",
          "branch_name_en": "Sharafiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sharafeyah",
          "address_en": "الشرفية،، جدة 23216, Saudi Arabia",
          "latitude": 21.513224599999997,
          "longitude": 39.1890461,
          "maps_business_name": "Fnoon Al Shawaya",
          "google_place_id": "ChIJ33te927PwxURydH1EnLSA2o",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ33te927PwxURydH1EnLSA2o",
          "google_rating": 4,
          "google_review_count": 445,
          "operating_status": "open",
          "hours": "11:30 AM – 1:00 AM",
          "phone": "055 136 3539",
          "geographic_notes": "Located in Al Sharafeyah district (normalized from al_sharafiyah).",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "fnoon_al_shawaya",
          "branch_name_en": "Harazat",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "F9MC+26M, Jeddah 22393, Saudi Arabia",
          "latitude": 21.4822986,
          "longitude": 39.370682599999995,
          "maps_business_name": "Fnoon Al Shawaya",
          "google_place_id": "ChIJ3Zt-bQAzwhUR2jTU12Yave0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ3Zt-bQAzwhUR2jTU12Yave0",
          "google_rating": 4,
          "google_review_count": 50,
          "operating_status": "open",
          "hours": "11:30 AM – 1:00 AM",
          "phone": "050 183 0532",
          "geographic_notes": "Located in Al Harazat (outer eastern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "ali_hanash",
      "canonical_name": "Ali Hanash",
      "arabic_name": "علي حنش",
      "categories": [
        "saudi_rice",
        "rice",
        "haneeth",
        "traditional_saudi",
        "southern_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "haneeth",
        "traditional_saudi",
        "southern_saudi"
      ],
      "subcategories": [
        "haneeth",
        "traditional_saudi",
        "southern_saudi"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "حنيذ محنذ لحم تيس بلدي",
      "signature_dish_en": "Haneeth Muhannadh Meat",
      "vibe_tags_ar": [
        "حنيذ بالمرخ",
        "تيس بلدي",
        "جنوبي أصيل",
        "ميفا زمان"
      ],
      "vibe_tags_en": [
        "Pit-Smoked Haneeth",
        "Local Goat",
        "Southern Heritage",
        "Traditional Hearth"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "local_favorite",
        "hidden_gem",
        "group_dining",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Haneeth Muhannadh Meat",
          "name_ar": "حنيذ محنذ لحم تيس بلدي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Traditional Red Rice",
          "name_ar": "رز محنذ أحمر",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Haneeth Baladi Ribs",
          "name_ar": "أضلاع حنيذ بلدي",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "ali_hanash",
          "branch_name_en": "Muraikh",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "JBKA2866، 2866 موقق، 6658، حي مريخ، Jeddah 23253, Saudi Arabia",
          "latitude": 21.530351,
          "longitude": 39.3024123,
          "maps_business_name": "Ali Hanash",
          "google_place_id": "ChIJu0pOYQDTwxURcTye8bqlAG8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJu0pOYQDTwxURcTye8bqlAG8",
          "google_rating": 3.9,
          "google_review_count": 3584,
          "operating_status": "open",
          "hours": "12:00 PM – 12:00 AM",
          "phone": "055 212 2635",
          "geographic_notes": "Located on Mawqaq Street in Muraikh district (outer eastern Jeddah, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "ghamim",
      "canonical_name": "Ghamim",
      "arabic_name": "غميم",
      "categories": [
        "saudi_rice",
        "rice",
        "haneeth",
        "madghoot",
        "traditional_saudi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "haneeth",
        "madghoot",
        "traditional_saudi"
      ],
      "subcategories": [
        "haneeth",
        "madghoot",
        "traditional_saudi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "حنيذ بلدي بالمرخ",
      "signature_dish_en": "Haneeth Baladi",
      "vibe_tags_ar": [
        "حنيذ بلدي",
        "مضغوط مميز",
        "شعبي معروف",
        "عزائم"
      ],
      "vibe_tags_en": [
        "Baladi Haneeth",
        "Signature Madghoot",
        "Local Institution",
        "Group Dining"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "group_dining",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_hamdaniyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Haneeth Baladi",
          "name_ar": "حنيذ بلدي بالمرخ",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Madghoot Meat",
          "name_ar": "مضغوط لحم",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Chicken Haneeth",
          "name_ar": "حنيذ دجاج",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "ghamim",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "حي, JGAA7697، 7697 2445 ابو عمير بن انس، الحمدانية، جدة 23743، السعودية",
          "latitude": 21.7416174,
          "longitude": 39.1885067,
          "maps_business_name": "Ghamim",
          "google_place_id": "ChIJYVaVUwB9wRURQipxT8Qz2a4",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJYVaVUwB9wRURQipxT8Qz2a4",
          "google_rating": 4,
          "google_review_count": 4981,
          "operating_status": "open",
          "hours": "12:00 م – 1:00 ص",
          "phone": "055 894 3777",
          "geographic_notes": "Located on Abu Umayr bin Anas Street, Al Hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ghamim",
          "branch_name_en": "Muraikh",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "عبدالله بن ورقاء بن جناده, Mraykh, Jeddah 23253, Saudi Arabia",
          "latitude": 21.526866599999998,
          "longitude": 39.3050806,
          "maps_business_name": "Ghamim",
          "google_place_id": "ChIJG_F8XUjTwxURviMrQ58cAgU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJG_F8XUjTwxURviMrQ58cAgU",
          "google_rating": 4.1,
          "google_review_count": 9631,
          "operating_status": "open",
          "hours": "11:30 AM – 1:00 AM",
          "phone": "053 368 8588",
          "geographic_notes": "Located on Abdullah bin Warqaa bin Janadah Street, Muraikh (outer eastern district, outside 30 canonical districts).",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "mandi_al_hejaz",
      "canonical_name": "Mandi Al Hejaz",
      "arabic_name": "مندي الحجاز",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "traditional_saudi",
        "hejazi"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "traditional_saudi",
        "hejazi"
      ],
      "subcategories": [
        "mandi",
        "traditional_saudi",
        "hejazi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "مندي لحم حجازي",
      "signature_dish_en": "Hejazi Lamb Mandi",
      "vibe_tags_ar": [
        "مندي حجازي أصيل",
        "تاريخي بالروضة",
        "لحم بلدي",
        "عزائم زمان"
      ],
      "vibe_tags_en": [
        "Authentic Hejazi Mandi",
        "Historic Rawdah Landmark",
        "Fresh Lamb",
        "Heritage Feast"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local_favorite",
        "dine_in_strong",
        "group_dining"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Hejazi Lamb Mandi",
          "name_ar": "مندي لحم حجازي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Mandi",
          "name_ar": "مندي دجاج",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Taifi Rice with Meat",
          "name_ar": "رز طائفي",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "mandi_al_hejaz",
          "branch_name_en": "Rawdah — Qassem Zeinah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "3684 قاسم زينل، الروضة، جدة 23434، السعودية",
          "latitude": 21.5730061,
          "longitude": 39.1589303,
          "maps_business_name": "Mandi Al Hejaz",
          "google_place_id": "ChIJodYd2nbQwxURNtR0sXeSWjY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJodYd2nbQwxURNtR0sXeSWjY",
          "google_rating": 4.1,
          "google_review_count": 2503,
          "operating_status": "open",
          "hours": "11:00 ص – 1:00 ص",
          "phone": "012 613 3369",
          "geographic_notes": "Located on Qassem Zeinal Street, Al Rawdah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "al_shadawi_ras_al_mandi",
      "canonical_name": "Al Shadawi Ras Al Mandi",
      "arabic_name": "الشدوي لرأس المندي",
      "categories": [
        "saudi_rice",
        "rice",
        "mandi",
        "traditional_saudi",
        "folk_heritage"
      ],
      "primary_category": "saudi_rice",
      "secondary_categories": [
        "mandi",
        "traditional_saudi",
        "folk_heritage"
      ],
      "subcategories": [
        "mandi",
        "traditional_saudi",
        "folk_heritage"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "رأس مندي على الطريقة الحجازية",
      "signature_dish_en": "Ras Mandi - Sheep Head Mandi",
      "vibe_tags_ar": [
        "رأس مندي",
        "باب مكة التاريخي",
        "تراث حجازي",
        "شعبي أصيل"
      ],
      "vibe_tags_en": [
        "Sheep Head Mandi",
        "Historic Bab Makkah",
        "Hejazi Folk Heritage",
        "Old-School Gem"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "hidden_gem",
        "local_favorite",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_balad"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Ras Mandi - Sheep Head Mandi",
          "name_ar": "رأس مندي على الطريقة الحجازية",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lamb Mandi",
          "name_ar": "لحم مندي بلدي",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mandi Soup & Broth",
          "name_ar": "مرقة مندي",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "al_shadawi_ras_al_mandi",
          "branch_name_en": "Al-Balad / Historic Jeddah — Souq Bab Makkah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_balad",
          "address_en": "3541، حي، 7073 Suq Bab Makkah, Historic Jeddah, Jeddah 22236, Saudi Arabia",
          "latitude": 21.486242300000004,
          "longitude": 39.19045560000001,
          "maps_business_name": "Al Shadawi Ras Al Mandi",
          "google_place_id": "ChIJbR80WRvPwxURbD1TRq3Xx9A",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJbR80WRvPwxURbD1TRq3Xx9A",
          "google_rating": 4.3,
          "google_review_count": 2117,
          "operating_status": "open",
          "hours": "6:00 AM – 11:00 PM",
          "phone": "056 039 3900",
          "geographic_notes": "Located in Historic Jeddah at Souq Bab Makkah, Al Balad.",
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _saudi_rice_catalog);
BEGIN
  -- Verify total brands count = 16
  IF jsonb_array_length(p->'brands') <> 16 THEN
    RAISE EXCEPTION 'Saudi / Rice / Kabsa catalog must contain exactly 16 brands';
  END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 16 THEN
    RAISE EXCEPTION 'Duplicate Saudi / Rice brand IDs';
  END IF;

  -- Verify total branches count = 45
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 45 THEN
    RAISE EXCEPTION 'Saudi / Rice / Kabsa catalog must contain exactly 45 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 45 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in Saudi / Rice branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 45 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in Saudi / Rice branches';
  END IF;

  -- Verify all branches have non-null coordinates, addresses, maps URLs, and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in Saudi / Rice payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Saudi / Rice catalog contains an unknown canonical district'; END IF;

  -- Verify exactly 14 branches outside 30-district canonical whitelist have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 14 THEN
    RAISE EXCEPTION 'Saudi / Rice catalog must contain exactly 14 caution branches with null district';
  END IF;

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
WITH catalog AS (SELECT payload FROM _saudi_rice_catalog), brands AS (
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
  (b->>'trend_status')::public.trend_status,
  (b->>'trend_confidence')::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-26T00:00:00Z'::timestamptz,
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

-- 2. Cleanup stale best sellers and sources for these 16 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _saudi_rice_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _saudi_rice_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _saudi_rice_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-26T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _saudi_rice_catalog), sellers AS (
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
  'Certified Saudi / Rice / Kabsa Pass D dataset signature item',
  '2026-09-26T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _saudi_rice_catalog), brands AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _saudi_rice_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
