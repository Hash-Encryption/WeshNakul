-- Google-verified Jeddah Pizza production catalog.
-- Source: docs/research/jeddah-pizza-pass-d-corrected.json
-- 18 approved brands, 105 verified physical branches (86 canonical, 19 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and ratings directly from Google Places API (New) & Maps.
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, Shawarma, or Saudi Rice catalogs.
-- Apply after 20260926000400_jeddah_saudi_rice_kabsa_catalog.sql.
BEGIN;

-- 0. Reconcile legacy orphan placeholder 'vera_pizza' (spelling variant) if present without branches
DELETE FROM public.restaurants WHERE id = 'vera_pizza' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'vera_pizza'
);

CREATE TEMP TABLE _pizza_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _pizza_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Pizza Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-26",
    "brand_count": 18,
    "branch_count": 105,
    "canonical_branch_count": 86,
    "outer_caution_branch_count": 19
  },
  "brands": [
    {
      "brand_id": "dominos",
      "canonical_name": "Domino's",
      "arabic_name": "دومينوز",
      "categories": [
        "pizza",
        "american_pizza",
        "mainstream_chain"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "subcategories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "Pepperoni pizza",
      "signature_dish_en": "Pepperoni pizza",
      "vibe_tags_ar": [
        "سريع وسفري",
        "سهرات وأفلام",
        "عروض وتوفير",
        "توصيل قوي"
      ],
      "vibe_tags_en": [
        "Fast & Takeaway",
        "Movie Night",
        "Deals & Value",
        "Late Night Delivery"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 29,
      "canonical_districts": [
        "al_andalus",
        "al_bawadi",
        "al_faiha",
        "al_faisaliyyah",
        "al_khalidiyyah",
        "al_marwah",
        "al_mohammadiyyah",
        "al_murjan",
        "al_naeem",
        "al_naseem",
        "al_rehab",
        "al_ruwais",
        "al_safa",
        "al_salamah",
        "al_samer",
        "al_zahra",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pepperoni pizza",
          "name_ar": "Pepperoni pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "American-style specialty pizzas",
          "name_ar": "American-style specialty pizzas",
          "is_signature": false,
          "sort_order": 1
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Safa — Umm Al Qoura",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "St, 7156 Umm Al Qoura, Al-Safa, Jeddah 23453, Saudi Arabia",
          "latitude": 21.5725761,
          "longitude": 39.2199099,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJiwLjuXXRwxUR9zR13OUp-ws",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJiwLjuXXRwxUR9zR13OUp-ws",
          "google_rating": 4,
          "google_review_count": 1193,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–03:00; Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Rabwah — Al Makarunah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "7335 Al Makarunah Rd, AR Rabwah District, Jeddah 23448, Saudi Arabia",
          "latitude": 21.591919,
          "longitude": 39.186071999999996,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJkyIi8eXQwxUR3yPjx0qpQPQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkyIi8eXQwxUR3yPjx0qpQPQ",
          "google_rating": 3.9,
          "google_review_count": 434,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–02:00; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "Al Ajawad St, Al Samer, Jeddah 23462, Saudi Arabia",
          "latitude": 21.591359999999998,
          "longitude": 39.231535,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJS2CVwlvRwxURR2grlVnDfAE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJS2CVwlvRwxURR2grlVnDfAE",
          "google_rating": 3.9,
          "google_review_count": 877,
          "operating_status": "open",
          "hours": null,
          "phone": null,
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Salamah — Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "3469 Saqer Qouraish, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5840517,
          "longitude": 39.1575148,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJdYGKqX_QwxURQ1Mw5oaPMj4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdYGKqX_QwxURQ1Mw5oaPMj4",
          "google_rating": 4.1,
          "google_review_count": 1396,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–03:00; Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Zahra — Al Batarji",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "3910 Al Batarji, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.598128000000003,
          "longitude": 39.136610999999995,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ0dK4okPbwxURLj2cJTpkO5w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ0dK4okPbwxURLj2cJTpkO5w",
          "google_rating": 3.9,
          "google_review_count": 569,
          "operating_status": "open",
          "hours": null,
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Khalidiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "St, Prince Saud Al Faisal, Al Khalidiyyah, Jeddah 23421, Saudi Arabia",
          "latitude": 21.558754,
          "longitude": 39.13995,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ6zBa3rDawxURfXxWiHOLtqY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ6zBa3rDawxURfXxWiHOLtqY",
          "google_rating": 3.9,
          "google_review_count": 379,
          "operating_status": "open",
          "hours": "Sat–Tue 12:00–02:00; Wed–Thu 12:00–02:30; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "St, 3740 AL Maadi, Al-Ruwais, Jeddah 23212, Saudi Arabia",
          "latitude": 21.516914,
          "longitude": 39.169319,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJvVRnR5HPwxURFEh-xLB_4ds",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJvVRnR5HPwxURFEh-xLB_4ds",
          "google_rating": 4,
          "google_review_count": 831,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–02:00; Fri 12:30–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Prince Fawwaz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "دومينوز، طريق مكة جدة السريع، الامير فواز الجنوبي، جدة 22431",
          "latitude": 21.440780999999998,
          "longitude": 39.280069,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJUwTOkIfMwxURSLylyDE8hHU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUwTOkIfMwxURSLylyDE8hHU",
          "google_rating": 3.7,
          "google_review_count": 938,
          "operating_status": "open",
          "hours": "Daily 12:00–00:30",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Amir Fawwaz Al Janoubi), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Safa — Bin Baz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "2661 Al Sheikh Abdul Aziz Bin Baz St-8381 Jeddah SA, الصفا، جدة 23452, Saudi Arabia",
          "latitude": 21.60138,
          "longitude": 39.198544,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJf1tFGyfRwxURTVLD_0bBXm8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJf1tFGyfRwxURTVLD_0bBXm8",
          "google_rating": 4.1,
          "google_review_count": 1257,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–03:00; Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Rabwah — Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "Hira St, Ar Rabwah, Jeddah 23533, Saudi Arabia",
          "latitude": 21.617504,
          "longitude": 39.175286,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJFeeEibXQwxURmVCM5DY5wvA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJFeeEibXQwxURmVCM5DY5wvA",
          "google_rating": 4.1,
          "google_review_count": 1065,
          "operating_status": "open",
          "hours": "Sat–Tue 12:00–01:00; Wed–Thu 12:00–02:00; Fri 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Al, An Naeem St, Al Naeem, Jeddah 23526, Saudi Arabia",
          "latitude": 21.621019999999998,
          "longitude": 39.148897,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ_VaJE5bbwxURHAnvfFS3RRc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_VaJE5bbwxURHAnvfFS3RRc",
          "google_rating": 4,
          "google_review_count": 659,
          "operating_status": "open",
          "hours": null,
          "phone": null,
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "King Abdulaziz International Airport",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "M5C9+5W4, King Abdulaziz International Airport, Jeddah 23635, Saudi Arabia",
          "latitude": 21.670437500000002,
          "longitude": 39.169812500000006,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJn_mzIJTXwxURekOOuP5IBhg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJn_mzIJTXwxURekOOuP5IBhg",
          "google_rating": 3.7,
          "google_review_count": 224,
          "operating_status": "open",
          "hours": "24 hours",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (King Abdulaziz International Airport), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "St, 8841 Abd Al Majid Shoubakshi, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5488812,
          "longitude": 39.1626918,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJGxRkdgPQwxURtRWc390P7fA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJGxRkdgPQwxURtRWc390P7fA",
          "google_rating": 4,
          "google_review_count": 575,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–02:00; Fri 12:30–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Marwah — Al Manini",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "St, Al Manini, Al Marwah, Jeddah 23543, Saudi Arabia",
          "latitude": 21.622121,
          "longitude": 39.202524,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJyapgsNrWwxUR5fJJPmndcBE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJyapgsNrWwxUR5fJJPmndcBE",
          "google_rating": 3.7,
          "google_review_count": 462,
          "operating_status": "open",
          "hours": "Current official locator: opens around 12:00, closes around 01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Marwah 2",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "7541 Abdul Rahman Al Khuzaay St, Al Marwah, Jeddah 23545, Saudi Arabia",
          "latitude": 21.613941999999998,
          "longitude": 39.209196999999996,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ25VWVczWwxUR5tUMoX-b30E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ25VWVczWwxUR5tUMoX-b30E",
          "google_rating": 3.8,
          "google_review_count": 428,
          "operating_status": "open",
          "hours": "Current official locator: opens around 13:00, closes around 01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "3380 Sari Br Rd, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.583728,
          "longitude": 39.173372,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJg6vQ5IrQwxUR6CuPOtcUA3I",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJg6vQ5IrQwxUR6CuPOtcUA3I",
          "google_rating": 4,
          "google_review_count": 943,
          "operating_status": "open",
          "hours": "Sat–Tue 13:00–01:00; Wed–Thu 13:00–02:00; Fri 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "An Nuzhah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "7489 King Fahd Rd, النزهة، جدة 23534, Saudi Arabia",
          "latitude": 21.627458000000004,
          "longitude": 39.163008999999995,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJAwztRFLXwxURKBMwS-yMmIU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAwztRFLXwxURKBMwS-yMmIU",
          "google_rating": 4,
          "google_review_count": 730,
          "operating_status": "open",
          "hours": "Current official locator: opens around 12:00",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Faisaliyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "Panda Supermarket, St, 7515 الامام عبدالعزيز، الفيصلية، جدة 62929, Saudi Arabia",
          "latitude": 21.569733499999998,
          "longitude": 39.1746169,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ2WfbOmjQwxURxtAx9XnHz4U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2WfbOmjQwxURxtAx9XnHz4U",
          "google_rating": 3.9,
          "google_review_count": 719,
          "operating_status": "open",
          "hours": "Sat–Thu 11:00–02:00; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "6802 Abi Dharr Al Ghifari St, An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.51651,
          "longitude": 39.239529,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJJ2uQr_3NwxUR1Lf4pbMN6fI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJ2uQr_3NwxUR1Lf4pbMN6fI",
          "google_rating": 3.7,
          "google_review_count": 957,
          "operating_status": "open",
          "hours": "Current official store page: Sat–Thu 12:00–03:00; Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Ar Rehab",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rehab",
          "address_en": "7951 Prince Mutaib bin Abdulaziz Rd, Al-Rehab, Jeddah 23344, Saudi Arabia",
          "latitude": 21.551935999999998,
          "longitude": 39.215235,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJc-u5tL_RwxUR5qfR97Q8pvw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc-u5tL_RwxUR5qfR97Q8pvw",
          "google_rating": 3.8,
          "google_review_count": 650,
          "operating_status": "open",
          "hours": "Current official store page: Sat–Tue/Sun/Mon 12:00–02:00; Wed/Thu to 02:30; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_rehab.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Fayha'a",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "JAFA4258، 4258 عبدالله سليمان الفرعي، 6863، حي الفيحاء, F6QF+XQ، الفيحاء، جدة 22246, Saudi Arabia",
          "latitude": 21.490063,
          "longitude": 39.225015,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ2TxHGmfOwxUREdPgha_es_4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2TxHGmfOwxUREdPgha_es_4",
          "google_rating": 3.8,
          "google_review_count": 1115,
          "operating_status": "open",
          "hours": "Current official store page: Sat–Tue/Sun/Mon 12:00–02:00; Wed/Thu to 02:30; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "9195 Al Mourjan, Al Murjan, Jeddah 23714, Saudi Arabia",
          "latitude": 21.688122399999997,
          "longitude": 39.106940699999996,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJWZysBfHYwxURgI02W6v7Uu0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWZysBfHYwxURgI02W6v7Uu0",
          "google_rating": 4.1,
          "google_review_count": 918,
          "operating_status": "open",
          "hours": "Current official store page: daily roughly 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Samer 2",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "6855-6879 Al Samer, St, Jeddah 23464, Saudi Arabia",
          "latitude": 21.575747,
          "longitude": 39.241002,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJT3tPENnTwxURonj5U_EVb0s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJT3tPENnTwxURonj5U_EVb0s",
          "google_rating": 4,
          "google_review_count": 855,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–03:00; Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Fadeylah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Beside Hyper Panda, Prince Abdulmajeed, Jeddah 22443, Saudi Arabia",
          "latitude": 21.400168,
          "longitude": 39.284648,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJb1583gXLwxURpkogsrSQPNM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJb1583gXLwxURpkogsrSQPNM",
          "google_rating": 3.9,
          "google_review_count": 995,
          "operating_status": "open",
          "hours": "Current official store page: Sat–Tue/Sun/Mon 12:00–02:00; Wed/Thu to 02:30; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Fadeylah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "2120, JEMA7301, 7301 طريق الامير سلطان، المحمدية، جدة 23625, Saudi Arabia",
          "latitude": 21.663553,
          "longitude": 39.122561,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ1bV-LBvZwxURre1W1NShVxA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ1bV-LBvZwxURre1W1NShVxA",
          "google_rating": 4.3,
          "google_review_count": 190,
          "operating_status": "open",
          "hours": "Current official store page: around 12:00–01:00; Thu/Fri later",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Sulaymaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Plaza, 2645 King Abdallah Rd, Al Sulaymaniyah, Jeddah 22253, Saudi Arabia",
          "latitude": 21.509733,
          "longitude": 39.246151,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJWdn9dOXNwxURjiij40tutnU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWdn9dOXNwxURjiij40tutnU",
          "google_rating": 3.8,
          "google_review_count": 684,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–01:00; Fri 12:30–01:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Sulaymaniyah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Al Andalus Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Al Andalus Mall، Prince Majid Rd, Al Fayha, Jeddah 22245, Saudi Arabia",
          "latitude": 21.505834999999998,
          "longitude": 39.21819,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ954D5qjPwxUR524Hrzid7R4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ954D5qjPwxUR524Hrzid7R4",
          "google_rating": 3.6,
          "google_review_count": 112,
          "operating_status": "open",
          "hours": "Sat–Tue 12:00–00:01; Wed–Thu 12:00–00:30; Fri 13:00–00:01",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "2636، 6125, G6P5+87 حي, 2636 الأمير ماجد، مشرفة، جدة 23341, Saudi Arabia",
          "latitude": 21.535795,
          "longitude": 39.208207,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJ2xS9aRDRwxURmBy1vm8Btwk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2xS9aRDRwxURmBy1vm8Btwk",
          "google_rating": 3.9,
          "google_review_count": 811,
          "operating_status": "open",
          "hours": "Daily 13:00–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Mishrifah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dominos",
          "branch_name_en": "Abruq Ar Rughamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Jac St, Abruq Ar Rughamah, Jeddah 22262, Saudi Arabia",
          "latitude": 21.4977,
          "longitude": 39.273492999999995,
          "maps_business_name": "Domino's",
          "google_place_id": "ChIJl8TMN5nNwxUR7e6GuDNZvTA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJl8TMN5nNwxUR7e6GuDNZvTA",
          "google_rating": 4,
          "google_review_count": 885,
          "operating_status": "open",
          "hours": "Sat–Tue 12:00–02:00; Wed–Thu 12:00–03:00; Fri 12:30–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Abruq Ar Rughamah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "maestro_pizza",
      "canonical_name": "Maestro Pizza",
      "arabic_name": "مايسترو بيتزا",
      "categories": [
        "pizza",
        "american_pizza",
        "saudi_chain"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "saudi_chain"
      ],
      "subcategories": [
        "american_pizza",
        "saudi_chain"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "Dynamite Chicken Pizza",
      "signature_dish_en": "Dynamite Chicken Pizza",
      "vibe_tags_ar": [
        "بيتزا سعودية",
        "سريع وسفري",
        "نكهات محلية",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Saudi Pizza Chain",
        "Fast Casual",
        "Local Flavors",
        "Late Night"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "delivery_strong",
        "quick_bite"
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
      "verified_jeddah_branch_count": 20,
      "canonical_districts": [
        "abhur_al_janoubiyah",
        "abhur_al_shamaliyah",
        "al_aziziyah",
        "al_faiha",
        "al_faisaliyyah",
        "al_hamdaniyah",
        "al_marwah",
        "al_mohammadiyyah",
        "al_murjan",
        "al_naseem",
        "al_ruwais",
        "al_salamah",
        "al_samer",
        "al_zahra",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Dynamite Chicken Pizza",
          "name_ar": "Dynamite Chicken Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Ranch Pizza",
          "name_ar": "Ranch Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Margherita",
          "name_ar": "Margherita",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Ranchy Original",
          "name_ar": "Ranchy Original",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "AL Maadi, Al-Ruwais, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5167781,
          "longitude": 39.1690277,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJgciHjR7PwxURnrG4HDikVjo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJgciHjR7PwxURnrG4HDikVjo",
          "google_rating": 4.7,
          "google_review_count": 29,
          "operating_status": "open",
          "hours": "Sat 13:00–02:00; Sun–Wed 12:00–02:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Salamah 2 — Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Sari Br Rd, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5783834,
          "longitude": 39.154623,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJZdA9zRbRwxUR8XJLjgj-vfg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJZdA9zRbRwxUR8XJLjgj-vfg",
          "google_rating": 4.1,
          "google_review_count": 682,
          "operating_status": "open",
          "hours": "Sun–Wed 12:00–02:00; Thu 11:00–04:00; Fri 12:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Muhammadiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Al-Madinah Al-Munawarah Rd, Al Mohammadiyyah, Jeddah 23624, Saudi Arabia",
          "latitude": 21.657145,
          "longitude": 39.133983099999995,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJSe8TU8fZwxURhiFqS-v5IGM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJSe8TU8fZwxURhiFqS-v5IGM",
          "google_rating": 4,
          "google_review_count": 809,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "Al Oudabaa, Aziziyah, Jeddah 23342, Saudi Arabia",
          "latitude": 21.5597887,
          "longitude": 39.2125643,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJQ1_UuLzRwxURH5EzgphbLxw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQ1_UuLzRwxURH5EzgphbLxw",
          "google_rating": 4.2,
          "google_review_count": 2661,
          "operating_status": "open",
          "hours": "Sat–Wed 11:00–02:00; Thu–Fri 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Nuzhah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "Umran Ibn Essam St, An Nuzhah, Jeddah 23534, Saudi Arabia",
          "latitude": 21.617714799999998,
          "longitude": 39.1745729,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJbcTnkbXQwxURTRMK7TBa6mc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJbcTnkbXQwxURTRMK7TBa6mc",
          "google_rating": 4.2,
          "google_review_count": 1884,
          "operating_status": "open",
          "hours": "Sun–Wed 12:00–02:00; Thu 11:00–04:00; Fri 12:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Salamah — Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "6608 Prince Sultan Rd, As Salamah, Jeddah 23525, Saudi Arabia",
          "latitude": 21.5991179,
          "longitude": 39.14476,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJwYm1KUPbwxURuBCkws5ZrpQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwYm1KUPbwxURuBCkws5ZrpQ",
          "google_rating": 4.2,
          "google_review_count": 456,
          "operating_status": "open",
          "hours": "Current listing shows extended hours; verify in-app before displaying exact time",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Taiba",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Prince Naif Rod - Next Spring، Primary School، Ibn Ziyad، Taiba, Jeddah 23831, Saudi Arabia",
          "latitude": 21.799872399999998,
          "longitude": 39.1425908,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJo5lBv7pkwRURbOCt8wtfAxM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJo5lBv7pkwRURbOCt8wtfAxM",
          "google_rating": 4.1,
          "google_review_count": 910,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Taiba), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Golden Miral, شارع حراء، المروة، جدة 23544, Saudi Arabia",
          "latitude": 21.6229801,
          "longitude": 39.202001599999996,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJB50rntDWwxUR99F7HxGYZqE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJB50rntDWwxUR99F7HxGYZqE",
          "google_rating": 4,
          "google_review_count": 1314,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Madaen Al Fahd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Istad Ar Riyadi, Mada'en Al-Fahd, Jeddah 22347, Saudi Arabia",
          "latitude": 21.454269999999998,
          "longitude": 39.257107999999995,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJv8YPZhPMwxURMcvFjQKPpHQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJv8YPZhPMwxURMcvFjQKPpHQ",
          "google_rating": 4.2,
          "google_review_count": 1694,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Mada'en Al Fahd), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Abdullah Sulayman St, Al Fayha, Jeddah 22246, Saudi Arabia",
          "latitude": 21.4919624,
          "longitude": 39.220144999999995,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJ2603DmHOwxURZI1Rlzb3y-w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2603DmHOwxURZI1Rlzb3y-w",
          "google_rating": 4.1,
          "google_review_count": 855,
          "operating_status": "open",
          "hours": "Current listing shows extended hours; verify in-app before displaying exact time",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "Ismail Alansari, Al Rabi', Jeddah 23462, Saudi Arabia",
          "latitude": 21.5913337,
          "longitude": 39.2320491,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJgQdB2VvRwxURmYrkcAbRsTM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJgQdB2VvRwxURmYrkcAbRsTM",
          "google_rating": 4.1,
          "google_review_count": 1589,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Faisaliyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "Maestro Pizza، 7528 الامام عبدالعزيز، الفيصلية، جدة 23442",
          "latitude": 21.569249799999998,
          "longitude": 39.1747709,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJfWSaIcTRwxURBGZ25fXoURQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJfWSaIcTRwxURBGZ25fXoURQ",
          "google_rating": 4.5,
          "google_review_count": 175,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun 11:00–02:00; Mon–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Noor / Abhur South",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_janoubiyah",
          "address_en": "Al Madinah Al Munawara Rd - Amro، Malek Ibn Anas, Urwah، Jeddah 23734, Saudi Arabia",
          "latitude": 21.7511078,
          "longitude": 39.14849590000001,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJh86BbyljwRURo8uZ2z0wvBQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJh86BbyljwRURo8uZ2z0wvBQ",
          "google_rating": 4.1,
          "google_review_count": 615,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_janoubiyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "Al Murjan, Jeddah 23714, Saudi Arabia",
          "latitude": 21.6862361,
          "longitude": 39.107094599999996,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJIb1DZnjQwxUR9QU-Hwud6fQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJIb1DZnjQwxUR9QU-Hwud6fQ",
          "google_rating": 4.1,
          "google_review_count": 2794,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun 11:00–02:00; Mon–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "مايستروا، شارع الحمدانية، الحمدانية، جدة 23743",
          "latitude": 21.7417794,
          "longitude": 39.191610499999996,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJsa_AQvl8wRURuemKWXGPApw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJsa_AQvl8wRURuemKWXGPApw",
          "google_rating": 4.1,
          "google_review_count": 1231,
          "operating_status": "open",
          "hours": "Open 24 hours (current listing)",
          "phone": null,
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Rabwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "Prince Majid Branch Rd, Ar Rabwah, Jeddah 23448, Saudi Arabia",
          "latitude": 21.592293299999998,
          "longitude": 39.1941518,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJASR3uuHQwxURGY5044pW7jk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJASR3uuHQwxURGY5044pW7jk",
          "google_rating": 4,
          "google_review_count": 1039,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun 11:00–02:00; Mon–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "King Abdallah Rd, An Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.5105672,
          "longitude": 39.2351647,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJ2ynmmAnOwxURf_dsul7SMwk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2ynmmAnOwxURf_dsul7SMwk",
          "google_rating": 4.2,
          "google_review_count": 2347,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23817, Saudi Arabia",
          "latitude": 21.760498899999998,
          "longitude": 39.1177184,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJqxKTWQFjwRUR3LQxnV9gw9o",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJqxKTWQFjwRUR3LQxnV9gw9o",
          "google_rating": 4.1,
          "google_review_count": 779,
          "operating_status": "open",
          "hours": "Sat–Wed 12:00–02:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Al Tarikh Square, Hira St, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.6095543,
          "longitude": 39.1363469,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJR7-ffJgaLz4Rcs-g4eqmwxg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJR7-ffJgaLz4Rcs-g4eqmwxg",
          "google_rating": 4.2,
          "google_review_count": 1300,
          "operating_status": "open",
          "hours": "Sat 12:00–01:00; Sun 11:00–02:00; Mon–Wed 11:00–01:00; Thu 11:00–02:00; Fri 12:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maestro_pizza",
          "branch_name_en": "Ajaweed",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "رضي الله عنه, Alajaweed, Jeddah 22442, Saudi Arabia",
          "latitude": 21.4149667,
          "longitude": 39.3000456,
          "maps_business_name": "Maestro Pizza",
          "google_place_id": "ChIJuRXdgRrLwxUREzo19H8LOTc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJuRXdgRrLwxUREzo19H8LOTc",
          "google_rating": 4.1,
          "google_review_count": 1453,
          "operating_status": "open",
          "hours": "Current exact branch hours not independently verified; Maestro publishes branch directory and general service hours, but current listings vary by branch.",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Ajaweed), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "papa_johns",
      "canonical_name": "Papa Johns",
      "arabic_name": "بابا جونز",
      "categories": [
        "pizza",
        "american_pizza",
        "mainstream_chain"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "subcategories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "Super Papa's",
      "signature_dish_en": "Super Papa's",
      "vibe_tags_ar": [
        "صلصة ثوم شهيرة",
        "عجينة طازجة",
        "جلسات عائلية",
        "سفري"
      ],
      "vibe_tags_en": [
        "Famous Garlic Dip",
        "Fresh Dough",
        "Family Casual",
        "Takeaway"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 12,
      "canonical_districts": [
        "al_hamdaniyah",
        "al_marwah",
        "al_mohammadiyyah",
        "al_naseem",
        "al_rehab",
        "al_samer",
        "al_shati",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Super Papa's",
          "name_ar": "Super Papa's",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "All The Meats",
          "name_ar": "All The Meats",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Pepperoni",
          "name_ar": "Pepperoni",
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
          "restaurant_id": "papa_johns",
          "branch_name_en": "Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23616, Saudi Arabia",
          "latitude": 21.6342458,
          "longitude": 39.1322896,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJFaZuhB_awxURzRkehvb9ogw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJFaZuhB_awxURzRkehvb9ogw",
          "google_rating": 4.3,
          "google_review_count": 803,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Foodcourt, Red Sea Mall, طريق الملك عبدالعزيز الفرعي، الشاطئ، جدة 23612, Saudi Arabia",
          "latitude": 21.6289552,
          "longitude": 39.111891299999996,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJY_e3nAnbwxURmLhUmg4LHjM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJY_e3nAnbwxURmLhUmg4LHjM",
          "google_rating": 4,
          "google_review_count": 206,
          "operating_status": "open",
          "hours": "Daily 11:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "Al-Madinah Al-Munawarah Rd, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6327165,
          "longitude": 39.1554803,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJ44H7BwDXwxURAgGSUXH9U0E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ44H7BwDXwxURAgGSUXH9U0E",
          "google_rating": 3.9,
          "google_review_count": 110,
          "operating_status": "open",
          "hours": "Daily 11:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Hira / An Nahdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Hira St, An Nahdah, Jeddah 23523, Saudi Arabia",
          "latitude": 21.6095016,
          "longitude": 39.1341456,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJEy6DjKTbwxURIN7ddXwTxp4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJEy6DjKTbwxURIN7ddXwTxp4",
          "google_rating": 4.1,
          "google_review_count": 344,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (An Nahdah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Al Rabwah — Makarunah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "Al Makarouna Street, Ar Rabwah, Jeddah 23448, Saudi Arabia",
          "latitude": 21.5929455,
          "longitude": 39.1858141,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJXSlM8uXQwxURR4ARD0U5fgg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXSlM8uXQwxURR4ARD0U5fgg",
          "google_rating": 4.1,
          "google_review_count": 866,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Yasser Bin Amer, Al Kinany St, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7665693,
          "longitude": 39.202377999999996,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJU-Z3J9Z9wRURtImWaJZlN8U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJU-Z3J9Z9wRURtImWaJZlN8U",
          "google_rating": 4.3,
          "google_review_count": 406,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Marwah / Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "J5CR+862, Hira St, Al Marwah, Jeddah 23542, Saudi Arabia",
          "latitude": 21.62077,
          "longitude": 39.190509999999996,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJGcuDACHXwxUR2hQ-Etq19ak",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJGcuDACHXwxUR2hQ-Etq19ak",
          "google_rating": 4.7,
          "google_review_count": 87,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "King Abdullah / Baghdadiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Sariah Square, King Abdullah Rd, Al-Baghdadiyah Al-Gharbiyah, Jeddah 22234, Saudi Arabia",
          "latitude": 21.5100439,
          "longitude": 39.1777175,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJV16v9lHPwxURPhAngy6kbPI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJV16v9lHPwxURPhAngy6kbPI",
          "google_rating": 4.5,
          "google_review_count": 415,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Baghdadiyah Al Gharbiyah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Ajaweed Park Square",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Park square, Alajaweed, Jeddah 22442, Saudi Arabia",
          "latitude": 21.409917999999998,
          "longitude": 39.298139,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJhWngsQHLwxURMK3r1eIo4v8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhWngsQHLwxURMK3r1eIo4v8",
          "google_rating": 4.2,
          "google_review_count": 147,
          "operating_status": "open",
          "hours": "Sat–Wed 11:00–04:00; Thu–Fri 11:00–05:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Ajaweed), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Tahlia / Al Rehab",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rehab",
          "address_en": "H679+XX4 Papa Johns - Tahliyah JED, شارع الأمير محمد بن عبدالعزيز، الرحاب، جدة 23345",
          "latitude": 21.5651488,
          "longitude": 39.2195995,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJK47dwj3RwxURFLOtOEx2QD8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJK47dwj3RwxURFLOtOEx2QD8",
          "google_rating": 4.2,
          "google_review_count": 209,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_rehab.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "JDSA4561، 4561 الاجواد، 7378, حي السامر, جدة 23462, Saudi Arabia",
          "latitude": 21.595053,
          "longitude": 39.245900999999996,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJ55PQJyXTwxURIgY0VtgBulw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ55PQJyXTwxURIgY0VtgBulw",
          "google_rating": 4.2,
          "google_review_count": 271,
          "operating_status": "open",
          "hours": "Sun–Wed 11:00–04:00; Thu–Sat 11:00–05:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "papa_johns",
          "branch_name_en": "Al Naseem — Salem Plaza",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "G66J+GHP, Abo Al Qassem Al Nasseri, An Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.511333,
          "longitude": 39.231444,
          "maps_business_name": "Papa Johns",
          "google_place_id": "ChIJAynHAvzPwxURip4X1Tr_8zQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAynHAvzPwxURip4X1Tr_8zQ",
          "google_rating": 4.8,
          "google_review_count": 22,
          "operating_status": "open",
          "hours": "Daily 11:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "little_caesars",
      "canonical_name": "Little Caesars",
      "arabic_name": "ليتل سيزرز",
      "categories": [
        "pizza",
        "american_pizza",
        "value_chain"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "value_chain"
      ],
      "subcategories": [
        "american_pizza",
        "value_chain"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "Pepperoni pizza",
      "signature_dish_en": "Pepperoni pizza",
      "vibe_tags_ar": [
        "بيتزا سريعة",
        "اقتصادي وتوفير",
        "جاهز وفوري",
        "وجبة سريعة"
      ],
      "vibe_tags_en": [
        "Hot-N-Ready",
        "Budget Friendly",
        "Quick Bite",
        "Grab & Go"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong"
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
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_bawadi",
        "al_hamdaniyah",
        "al_safa"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pepperoni pizza",
          "name_ar": "Pepperoni pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Crazy Bread",
          "name_ar": "Crazy Bread",
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
          "restaurant_id": "little_caesars",
          "branch_name_en": "Hira / An Nahdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Hira St , An Nahdah, شارع حراء، حي النهضة, جدة 23522, Saudi Arabia",
          "latitude": 21.606661,
          "longitude": 39.123548899999996,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJY9RKZ0XawxURbgy7HRekpf8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJY9RKZ0XawxURbgy7HRekpf8",
          "google_rating": 3.7,
          "google_review_count": 797,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (An Nahdah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "little_caesars",
          "branch_name_en": "Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "حي, Sari Br Rd, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.581473799999998,
          "longitude": 39.1661401,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJI8SB8mLQwxURZ1asL60c0HQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJI8SB8mLQwxURZ1asL60c0HQ",
          "google_rating": 3.9,
          "google_review_count": 1229,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–02:00; Thu–Fri 13:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "little_caesars",
          "branch_name_en": "Prince Mohammed / Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "Prince Moh'd Ibn Abdulaziz, Al-Safa, Jeddah 23432, Saudi Arabia",
          "latitude": 21.5661606,
          "longitude": 39.220675799999995,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJT6aRAp_RwxURpgLn4mQMfJE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJT6aRAp_RwxURpgLn4mQMfJE",
          "google_rating": 3.9,
          "google_review_count": 1708,
          "operating_status": "open",
          "hours": "Sat–Wed 11:00–02:00; Thu–Fri 11:00–03:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "little_caesars",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "حي, Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.763243,
          "longitude": 39.114151899999996,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJpfcGxWxjwRUR_R4FNERZ7kQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJpfcGxWxjwRUR_R4FNERZ7kQ",
          "google_rating": 3,
          "google_review_count": 115,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "little_caesars",
          "branch_name_en": "Prince Fawwaz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Ahmad Ibn Abd Al Samd - Al Amir Fawaz حمد بن عبد الصمد, الامير فواز الجنوبي، جدة 22441, Saudi Arabia",
          "latitude": 21.427663,
          "longitude": 39.2978164,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJwzCX15_MwxUR_yWZG5DOYnk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwzCX15_MwxUR_yWZG5DOYnk",
          "google_rating": 3.8,
          "google_review_count": 1045,
          "operating_status": "open",
          "hours": "Daily 13:00–02:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Amir Fawwaz Al Janoubi), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "little_caesars",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamdaniah St - Alhamdaniah, حي, شارع الحمدانية، الحمدانية، جدة 23761, Saudi Arabia",
          "latitude": 21.7547516,
          "longitude": 39.1970544,
          "maps_business_name": "Little Caesars",
          "google_place_id": "ChIJkb52BkR9wRURFylOgT9o60o",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkb52BkR9wRURFylOgT9o60o",
          "google_rating": 3.8,
          "google_review_count": 238,
          "operating_status": "open",
          "hours": "Daily 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "pizza_hut",
      "canonical_name": "Pizza Hut",
      "arabic_name": "بيتزا هت",
      "categories": [
        "pizza",
        "american_pizza",
        "mainstream_chain"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "subcategories": [
        "american_pizza",
        "mainstream_chain"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pan pizza",
      "signature_dish_en": "Pan pizza",
      "vibe_tags_ar": [
        "بان بيتزا أصلية",
        "أطراف جبنة",
        "عائلي وكلاسيك",
        "سفري"
      ],
      "vibe_tags_en": [
        "Original Pan Pizza",
        "Stuffed Crust",
        "Family Classic",
        "Dine-In & Delivery"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 20,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_andalus",
        "al_bawadi",
        "al_faisaliyyah",
        "al_marwah",
        "al_murjan",
        "al_naseem",
        "al_safa",
        "al_salamah",
        "al_samer",
        "al_shati",
        "al_sheraa",
        "an_nuzhah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pan pizza",
          "name_ar": "Pan pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Pepperoni pizza",
          "name_ar": "Pepperoni pizza",
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
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Sari / Al Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "H4GX+JC8, Sari Br Rd, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.576539699999998,
          "longitude": 39.1485796,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJO6i_epvawxURRPcq6CKom40",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJO6i_epvawxURRPcq6CKom40",
          "google_rating": 3.9,
          "google_review_count": 3128,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Tahlia / Nojoud Center",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "شارع التحلية، Nojoud Center, Prince Mohammed Bin Abdulaziz Branch Rd, غرب طريق المدينة، Opp، Jeddah 23432, Saudi Arabia",
          "latitude": 21.5534563,
          "longitude": 39.1638069,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJxxeFRAXQwxUR5k_ix59BNVA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJxxeFRAXQwxUR5k_ix59BNVA",
          "google_rating": 4,
          "google_review_count": 4067,
          "operating_status": "open",
          "hours": "Sun–Fri 13:00–01:00; Sat 13:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Corniche / Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "H4F6+G7V، Corniche Street، Ash Shati, Jeddah 23415, Saudi Arabia",
          "latitude": 21.5738541,
          "longitude": 39.1106824,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ_fZBLCfbwxURwozY_PIcgk8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_fZBLCfbwxURwozY_PIcgk8",
          "google_rating": 4.1,
          "google_review_count": 3489,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Hira / Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "J587+5M3, Hira St, Al Bawadi, Jeddah 23531, Saudi Arabia",
          "latitude": 21.615388499999998,
          "longitude": 39.1641785,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJL7E5Y6_QwxURt79wwS51I2o",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJL7E5Y6_QwxURt79wwS51I2o",
          "google_rating": 3.9,
          "google_review_count": 1269,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Faisaliyyah / N2 Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "ان تو مول، حي، Al Faisaliyyah, Jeddah 23442, Saudi Arabia",
          "latitude": 21.5675472,
          "longitude": 39.180256899999996,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJvVk0fEPQwxURmqa_nFq2TSE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJvVk0fEPQwxURmqa_nFq2TSE",
          "google_rating": 3.6,
          "google_review_count": 1284,
          "operating_status": "open",
          "hours": "Sun–Fri 13:00–01:00; Sat 13:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Saud Bin Abdulaziz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Pizza hut, 3320 سعود بن عبدالعزيز, JHNA3320, جدة 23827",
          "latitude": 21.810577499999997,
          "longitude": 39.071325699999996,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ_-S7EwBlwRURhXE2mYqyLcM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_-S7EwBlwRURhXE2mYqyLcM",
          "google_rating": 4,
          "google_review_count": 63,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (North Jeddah / Saud Bin Abdulaziz area), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "M4R4+CCP حي, Al Mourjan, Al Murjan, Jeddah 23715, Saudi Arabia",
          "latitude": 21.6910754,
          "longitude": 39.106064599999996,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJcUEnDPHYwxURIayymO93BHo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJcUEnDPHYwxURIayymO93BHo",
          "google_rating": 3.9,
          "google_review_count": 299,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Obhur North — Aabir Al Qarath",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Q449+XQ8, Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.757409499999998,
          "longitude": 39.1194585,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJzWbyRgJjwRURDnnjo_uJZXU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJzWbyRgJjwRURDnnjo_uJZXU",
          "google_rating": 4,
          "google_review_count": 361,
          "operating_status": "open",
          "hours": "Daily 13:00–00:30",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Abraj / Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "مركز أبراج فاون، Al Kurnaysh Br Rd, Ash Shati, Jeddah 23411, Saudi Arabia",
          "latitude": 21.559226,
          "longitude": 39.116119,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ69ct79TawxURycsupg873e0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ69ct79TawxURycsupg873e0",
          "google_rating": 3.9,
          "google_review_count": 630,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "J56W+3GC, Al Marwah, Jeddah 23541, Saudi Arabia",
          "latitude": 21.6101928,
          "longitude": 39.196255199999996,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJC65l_tXQwxURfspcI40SECs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJC65l_tXQwxURfspcI40SECs",
          "google_rating": 3.8,
          "google_review_count": 302,
          "operating_status": "open",
          "hours": "Daily 13:00–00:30",
          "phone": null,
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Essam Nass / Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Yahya Husayn, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.589588,
          "longitude": 39.165676000000005,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJkQJJFo_QwxURajrJpT19u80",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkQJJFo_QwxURajrJpT19u80",
          "google_rating": 3.8,
          "google_review_count": 442,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Falah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Q5GQ+X8C Pizza Hut, الفلاح، جدة 23762",
          "latitude": 21.7775729,
          "longitude": 39.1882321,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJA-zoawB7wRURd58rCgxmE1c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJA-zoawB7wRURd58rCgxmE1c",
          "google_rating": 4.2,
          "google_review_count": 47,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Falah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Obhur North — Al Yaqout",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Q3RR+M77 بيتزاهت، الياقوت، ابحر الشمالية،، جدة 23826",
          "latitude": 21.791661599999998,
          "longitude": 39.0906806,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJAZqjr5NjwRURm7dm84Enf4g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAZqjr5NjwRURm7dm84Enf4g",
          "google_rating": 3.8,
          "google_review_count": 448,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Prince Saud Al Faisal",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "Sumeisi Center Prince Abdullah Street، H6G5+6CJ, Prince Saud Al Faisal, Al-Safa, Jeddah 23451, Saudi Arabia",
          "latitude": 21.5755969,
          "longitude": 39.2085241,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ3wKt3QjRwxURmbQ6CvCQXK0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ3wKt3QjRwxURmbQ6CvCQXK0",
          "google_rating": 4,
          "google_review_count": 1784,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "An Nuzhah / King Fahd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "حي النزهة،، JFNA7070، 7070 King Fahad Rd, 3183، حي النزهة، Jeddah 23532, Saudi Arabia",
          "latitude": 21.623560299999998,
          "longitude": 39.163238799999995,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJPy2TSa3QwxURdhcGwAqLgks",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJPy2TSa3QwxURdhcGwAqLgks",
          "google_rating": 3.9,
          "google_review_count": 744,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "G68Q+WR2, Abu Thar Al-Ghifari, An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.517256,
          "longitude": 39.2395206,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ6dYJuP3NwxURWP9WNgUepZo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ6dYJuP3NwxURWP9WNgUepZo",
          "google_rating": 3.8,
          "google_review_count": 894,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Prince Naif / Rehily",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Prince Naif Street، Al Rehily Car Rentals, Taiba, Jeddah 23832, Saudi Arabia",
          "latitude": 21.792791299999998,
          "longitude": 39.131707999999996,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJrz3wxJ9kwRURbZD2_SRdUTA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJrz3wxJ9kwRURbZD2_SRdUTA",
          "google_rating": 3.9,
          "google_review_count": 632,
          "operating_status": "open",
          "hours": "Mon–Tue 12:00–01:00; Wed–Sun mostly 13:30–00:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Taiba), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "حي, Al Samer, Jeddah 23462, Saudi Arabia",
          "latitude": 21.592817699999998,
          "longitude": 39.2371754,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ0UbcDljRwxURvvkh3u81Ddo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ0UbcDljRwxURvvkh3u81Ddo",
          "google_rating": 3.9,
          "google_review_count": 1240,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "An Nahdah / Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "An Nahdah District 9175 3967 الامير سلطان، 9175, An Nahdah, Jeddah 23523, Saudi Arabia",
          "latitude": 21.6192894,
          "longitude": 39.1369483,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ7Tt5HBfawxUR2f_uTvsgbYs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ7Tt5HBfawxUR2f_uTvsgbYs",
          "google_rating": 4,
          "google_review_count": 914,
          "operating_status": "open",
          "hours": "Daily 13:00–00:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (An Nahdah), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "pizza_hut",
          "branch_name_en": "Al Sheraa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sheraa",
          "address_en": "Q482+CHP، شارع أسامة عبدالمجيد شبكشي، Al Shera'a, Jeddah 23816, Saudi Arabia",
          "latitude": 21.766096800000003,
          "longitude": 39.1014482,
          "maps_business_name": "Pizza Hut",
          "google_place_id": "ChIJ-1O6RABjwRURhPImuLG2iXM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ-1O6RABjwRURhPImuLG2iXM",
          "google_rating": 3.8,
          "google_review_count": 16,
          "operating_status": "open",
          "hours": "Official Jeddah locator schedule: weekdays 13:00–02:00; weekends/public holidays 13:00–03:00 (branch-specific current match unavailable).",
          "phone": null,
          "geographic_notes": "Located in canonical district al_sheraa.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "white_wood_pizzeria",
      "canonical_name": "White Wood Pizzeria",
      "arabic_name": "وايت وود بيتزيريا",
      "categories": [
        "pizza",
        "neapolitan",
        "artisan"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "neapolitan",
        "artisan"
      ],
      "subcategories": [
        "neapolitan",
        "artisan"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Burrata Pizza",
      "signature_dish_en": "Burrata Pizza",
      "vibe_tags_ar": [
        "بيتزا حطب",
        "إيطالي راقي",
        "جلسات رايقة",
        "عجينة نابولية"
      ],
      "vibe_tags_en": [
        "Wood-Fired Pizza",
        "Artisan Italian",
        "Cozy Ambience",
        "Neapolitan Crust"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Burrata Pizza",
          "name_ar": "Burrata Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Pepperoni",
          "name_ar": "Pepperoni",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Marinara",
          "name_ar": "Marinara",
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
          "restaurant_id": "white_wood_pizzeria",
          "branch_name_en": "White Wood Pizzeria",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "3362, الشاطئ، جدة 23514, Saudi Arabia",
          "latitude": 21.6060645,
          "longitude": 39.118846999999995,
          "maps_business_name": "White Wood Pizzeria",
          "google_place_id": "ChIJ11olmlzbwxUR8h5FbFDe7ZM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ11olmlzbwxUR8h5FbFDe7ZM",
          "google_rating": 4.6,
          "google_review_count": 7226,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:45; Thu 13:00–02:45; Fri 14:00–02:45",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "il_postino_pizzeria",
      "canonical_name": "il Postino Pizzeria",
      "arabic_name": "إل بوستينو بيتزيريا",
      "categories": [
        "pizza",
        "neapolitan",
        "italian"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "neapolitan",
        "italian"
      ],
      "subcategories": [
        "neapolitan",
        "italian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Truffle Pizza",
      "signature_dish_en": "Truffle Pizza",
      "vibe_tags_ar": [
        "إيطالي أصيل",
        "بيتزا حطب",
        "أجواء أوروبية",
        "عجينة مخمرة"
      ],
      "vibe_tags_en": [
        "Authentic Italian",
        "Wood-Fired",
        "European Vibe",
        "Fermented Dough"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_khalidiyyah",
        "al_murjan"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Truffle Pizza",
          "name_ar": "Truffle Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Diavola Pizza",
          "name_ar": "Diavola Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Margherita Pizza",
          "name_ar": "Margherita Pizza",
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
          "restaurant_id": "il_postino_pizzeria",
          "branch_name_en": "Al Khalidiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "3803 Sari Br Rd, Al Khalidiyyah, Jeddah 23423, Saudi Arabia",
          "latitude": 21.574147600000003,
          "longitude": 39.142584299999996,
          "maps_business_name": "il Postino Pizzeria",
          "google_place_id": "ChIJOd4ucWnbwxUREsfKPgbPHMc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOd4ucWnbwxUREsfKPgbPHMc",
          "google_rating": 4.6,
          "google_review_count": 5278,
          "operating_status": "open",
          "hours": "Sat–Thu approx. 13:00–01:00; Fri later opening / Thu-Fri later close",
          "phone": null,
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "il_postino_pizzeria",
          "branch_name_en": "Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "JEJB6434، 6434 طريق الملك عبدالعزيز فرعي، 4299, Al Murjan District, جدة 23715, Saudi Arabia",
          "latitude": 21.694570199999998,
          "longitude": 39.1081393,
          "maps_business_name": "il Postino Pizzeria",
          "google_place_id": "ChIJhfNya6HZwxURtxSMFrcWVnE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhfNya6HZwxURtxSMFrcWVnE",
          "google_rating": 4.7,
          "google_review_count": 5343,
          "operating_status": "open",
          "hours": "Approx. 13:00–01:00; Thu/Fri later",
          "phone": null,
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "verra_pizza",
      "canonical_name": "Verra Pizza",
      "arabic_name": "ڤيرا",
      "categories": [
        "pizza",
        "wood_fired",
        "italian"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "wood_fired",
        "italian"
      ],
      "subcategories": [
        "wood_fired",
        "italian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pizza",
      "signature_dish_en": "Pizza",
      "vibe_tags_ar": [
        "بيتزا حطب",
        "نابولية أصيلة",
        "مكونات إيطالية",
        "راقي"
      ],
      "vibe_tags_en": [
        "Wood-Fired Pizza",
        "True Neapolitan",
        "Imported Italian",
        "Chic Dining"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pizza",
          "name_ar": "Pizza",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "branches": [
        {
          "restaurant_id": "verra_pizza",
          "branch_name_en": "Al Zahra / Batarji",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "4144, 6849 Batterjie Street, الزهراء، District, جدة 23522, Saudi Arabia",
          "latitude": 21.5979474,
          "longitude": 39.138719699999996,
          "maps_business_name": "Verra Pizza",
          "google_place_id": "ChIJc_9rnWbawxURdqShiels-ow",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc_9rnWbawxURdqShiels-ow",
          "google_rating": 4.5,
          "google_review_count": 4060,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "verra_pizza",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23826, Saudi Arabia",
          "latitude": 21.7608222,
          "longitude": 39.117422499999996,
          "maps_business_name": "Verra Pizza",
          "google_place_id": "ChIJUyizioNjwRURBwf0xqdZ0P4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUyizioNjwRURBwf0xqdZ0P4",
          "google_rating": 4.7,
          "google_review_count": 918,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "napoli_blu",
      "canonical_name": "NAPOLI BLU",
      "arabic_name": "نابولي بلو",
      "categories": [
        "pizza",
        "italian",
        "artisan"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian",
        "artisan"
      ],
      "subcategories": [
        "italian",
        "artisan"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pizza",
      "signature_dish_en": "Pizza",
      "vibe_tags_ar": [
        "بيتزا نابولية",
        "حطب ومختصة",
        "جلسات شبابية",
        "عصرية"
      ],
      "vibe_tags_en": [
        "Neapolitan Style",
        "Artisan Oven",
        "Trendy Spot",
        "Modern Pizzeria"
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
          "name_en": "Pizza",
          "name_ar": "Pizza",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "napoli_blu",
          "branch_name_en": "NAPOLI BLU",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Hamad Al Jaser, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5769558,
          "longitude": 39.156721499999996,
          "maps_business_name": "NAPOLI BLU",
          "google_place_id": "ChIJM2DnNgDRwxUR2Z5xk02gukQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJM2DnNgDRwxUR2Z5xk02gukQ",
          "google_rating": 4.7,
          "google_review_count": 2920,
          "operating_status": "open",
          "hours": "Sat–Thu 07:00–03:00; Fri 13:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "wood_fire_pizza_lenuo",
      "canonical_name": "Wood Fire Pizza Lenuo",
      "arabic_name": "لينو بيتزا الحطب",
      "categories": [
        "pizza",
        "wood_fired",
        "italian"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "wood_fired",
        "italian"
      ],
      "subcategories": [
        "wood_fired",
        "italian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Jeddah Special",
      "signature_dish_en": "Jeddah Special",
      "vibe_tags_ar": [
        "فرن حطب",
        "بيتزا مميزة",
        "عجينة خفيفة",
        "محلي محبوب"
      ],
      "vibe_tags_en": [
        "Wood Fire Oven",
        "Signature Pies",
        "Light Crust",
        "Local Favorite"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_hamra"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Jeddah Special",
          "name_ar": "Jeddah Special",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lenuo Pesto",
          "name_ar": "Lenuo Pesto",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Margherita",
          "name_ar": "Margherita",
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
          "restaurant_id": "wood_fire_pizza_lenuo",
          "branch_name_en": "Wood Fire Pizza Lenuo",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "Al Maadi, Al-Hamra'a, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5138481,
          "longitude": 39.161190100000006,
          "maps_business_name": "Wood Fire Pizza Lenuo",
          "google_place_id": "ChIJwyXLvoXPwxURmPwwIPOhNPk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwyXLvoXPwxURmPwwIPOhNPk",
          "google_rating": 4.4,
          "google_review_count": 4040,
          "operating_status": "open",
          "hours": "Sat–Wed 12:00–00:45; Thu 12:00–01:45; Fri 13:00–01:45",
          "phone": null,
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "blu_pizzeria",
      "canonical_name": "Blu Pizzeriá",
      "arabic_name": "بلو بيتزيريا",
      "categories": [
        "pizza",
        "neapolitan",
        "artisan"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "neapolitan",
        "artisan"
      ],
      "subcategories": [
        "neapolitan",
        "artisan"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pizza",
      "signature_dish_en": "Pizza",
      "vibe_tags_ar": [
        "بيتزا حطب نابولية",
        "مختصة وراقية",
        "عجينة مقرمشة",
        "جلسات مميزة"
      ],
      "vibe_tags_en": [
        "Neapolitan Pizza",
        "Artisan Craft",
        "Crispy Crust",
        "Cozy Spot"
      ],
      "reputation_tags": [
        "rising"
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_mohammadiyyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pizza",
          "name_ar": "Pizza",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "blu_pizzeria",
          "branch_name_en": "Blu Pizzeriá — Penta Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "7119 Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23621, Saudi Arabia",
          "latitude": 21.6328355,
          "longitude": 39.13399,
          "maps_business_name": "Blu Pizzeriá",
          "google_place_id": "ChIJ__UN-yjZwxURYjudgF60jfE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ__UN-yjZwxURYjudgF60jfE",
          "google_rating": 4.8,
          "google_review_count": 908,
          "operating_status": "open",
          "hours": "Sat 13:00–01:00; Sun–Wed 16:00–01:00; Thu 16:00–02:00; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "mazencito_pizzeria",
      "canonical_name": "Mazencito Pizzeria",
      "arabic_name": "مازينسيتو",
      "categories": [
        "pizza",
        "italian",
        "artisan"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian",
        "artisan"
      ],
      "subcategories": [
        "italian",
        "artisan"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Mini Pizza Gathering Box",
      "signature_dish_en": "Mini Pizza Gathering Box",
      "vibe_tags_ar": [
        "بيتزا ميني ولمات",
        "إيطالي عصري",
        "جمعات وسهرات",
        "نكهات مبتكرة"
      ],
      "vibe_tags_en": [
        "Mini Pizza Boxes",
        "Gathering Platters",
        "Modern Italian",
        "Creative Flavors"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Mini Pizza Gathering Box",
          "name_ar": "Mini Pizza Gathering Box",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Palla Di Burrata",
          "name_ar": "Palla Di Burrata",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Margherita / pepperoni mini-pizza selection",
          "name_ar": "Margherita / pepperoni mini-pizza selection",
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
          "restaurant_id": "mazencito_pizzeria",
          "branch_name_en": "Mazencito Pizzeria",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "King Abdulaziz Branch Rd, Ash Shati, Jeddah 23514, Saudi Arabia",
          "latitude": 21.6132074,
          "longitude": 39.1179485,
          "maps_business_name": "Mazencito Pizzeria",
          "google_place_id": "ChIJtbf_C3_bwxURV-Wtiz83ax4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJtbf_C3_bwxURV-Wtiz83ax4",
          "google_rating": 4.5,
          "google_review_count": 2264,
          "operating_status": "open",
          "hours": "Sat–Wed 12:00–01:00; Thu 12:00–02:00; Fri 13:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "impasto_seven",
      "canonical_name": "Impasto Seven",
      "arabic_name": "إمباستو سفن",
      "categories": [
        "pizza",
        "italian",
        "artisan"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian",
        "artisan"
      ],
      "subcategories": [
        "italian",
        "artisan"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Margherita pizza",
      "signature_dish_en": "Margherita pizza",
      "vibe_tags_ar": [
        "عجينة تخمير طويل",
        "بيتزا نابولية",
        "مختصة بحرية",
        "أبحر الشمالية"
      ],
      "vibe_tags_en": [
        "Long-Ferment Dough",
        "Neapolitan Pizza",
        "Artisan Obhur Spot",
        "Coastal Dining"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Margherita pizza",
          "name_ar": "Margherita pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Burrata",
          "name_ar": "Burrata",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Pepperoni pizza",
          "name_ar": "frequently mentioned",
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
          "restaurant_id": "impasto_seven",
          "branch_name_en": "Impasto Seven",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Impasto seven, الأمير عبدالمجيد، اللؤلؤ، جدة 23821",
          "latitude": 21.759947999999998,
          "longitude": 39.0715287,
          "maps_business_name": "Impasto Seven",
          "google_place_id": "ChIJM5eZJzhjwRURDf1kn8DtpHU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJM5eZJzhjwRURDf1kn8DtpHU",
          "google_rating": 4.8,
          "google_review_count": 2004,
          "operating_status": "open",
          "hours": "Sat–Thu 12:00–01:00; Fri 14:00–01:00",
          "phone": null,
          "geographic_notes": "Legitimate Jeddah location in outer district (Al Lulu), outside current 30 canonical districts.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "locos_pizza",
      "canonical_name": "Locos Pizza",
      "arabic_name": "لوكوز بيتزا",
      "categories": [
        "pizza",
        "american_pizza",
        "local_pizzeria"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "american_pizza",
        "local_pizzeria"
      ],
      "subcategories": [
        "american_pizza",
        "local_pizzeria"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "Locos Pepperoni Pizza",
      "signature_dish_en": "Locos Pepperoni Pizza",
      "vibe_tags_ar": [
        "بيتزا أمريكية",
        "أطراف مقرمشة",
        "سريع وسفري",
        "سهرات"
      ],
      "vibe_tags_en": [
        "American Style Pizza",
        "Crispy Crust",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
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
          "name_en": "Locos Pepperoni Pizza",
          "name_ar": "Locos Pepperoni Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Supreme Pizza",
          "name_ar": "Supreme Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Chicken Pizza",
          "name_ar": "Chicken Pizza",
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
          "restaurant_id": "locos_pizza",
          "branch_name_en": "Locos Pizza — Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Helmi Koutbi, Al Zahra, Jeddah 23425, Saudi Arabia",
          "latitude": 21.5912169,
          "longitude": 39.139444999999995,
          "maps_business_name": "Locos Pizza",
          "google_place_id": "ChIJgeX7W9XbwxURk-5WzcNKNxI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJgeX7W9XbwxURk-5WzcNKNxI",
          "google_rating": 4.6,
          "google_review_count": 1318,
          "operating_status": "open",
          "hours": "Sat 12:00–07:30; Sun 17:30–06:30; Mon–Thu 12:00–06:30; Fri 14:00–06:30",
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "jon_and_vinnys",
      "canonical_name": "Jon & Vinny's",
      "arabic_name": "جون آند فينيز",
      "categories": [
        "pizza",
        "italian_american",
        "premium_dining"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian_american",
        "premium_dining"
      ],
      "subcategories": [
        "italian_american",
        "premium_dining"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 65,
      "estimated_spend_max_sar": 160,
      "signature_dish_ar": "The Margherita",
      "signature_dish_en": "The Margherita",
      "vibe_tags_ar": [
        "أيقونة لوس أنجلوس",
        "إيطالي أمريكي فاخر",
        "أجواء عصرية",
        "جلسات راقية"
      ],
      "vibe_tags_en": [
        "LA Icon",
        "Upscale Italian-American",
        "Trendy Hotspot",
        "Premium Dining"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_salamah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "The Margherita",
          "name_ar": "The Margherita",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Brooklyn Dodger",
          "name_ar": "Brooklyn Dodger",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "L.A. Woman",
          "name_ar": "L.A. Woman",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Jersey Marinara",
          "name_ar": "Jersey Marinara",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "jon_and_vinnys",
          "branch_name_en": "Jon & Vinny's — La Paz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "As Salamah, Jeddah 23525, Saudi Arabia",
          "latitude": 21.6036875,
          "longitude": 39.1430625,
          "maps_business_name": "Jon & Vinny's",
          "google_place_id": "ChIJL1hhI4zbwxURYcBSwlTBhLo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJL1hhI4zbwxURYcBSwlTBhLo",
          "google_rating": 4.5,
          "google_review_count": 5189,
          "operating_status": "open",
          "hours": "Sat–Tue 08:00–23:30; Wed–Fri 08:00–01:30",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "bread_ahead",
      "canonical_name": "Bread Ahead",
      "arabic_name": "بريد أهيد",
      "categories": [
        "pizza",
        "bakery",
        "artisan_pizza"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "bakery",
        "artisan_pizza"
      ],
      "subcategories": [
        "bakery",
        "artisan_pizza"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Margherita pizza",
      "signature_dish_en": "Margherita pizza",
      "vibe_tags_ar": [
        "مخبز لندني عريق",
        "عجينة سوردو مميزة",
        "بيتزا حرفية",
        "جلسات رايقة"
      ],
      "vibe_tags_en": [
        "London Bakery Legend",
        "Sourdough Pizza",
        "Artisan Craft",
        "Chic Cafe"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_shati",
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Margherita pizza",
          "name_ar": "Margherita pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Mushroom pizza",
          "name_ar": "brand recipe/workshop evidence; Jeddah menu availability should be rechecked",
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
          "restaurant_id": "bread_ahead",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "بريد أهيد المخبز والمدرسة، طريق الملك عبدالعزيز الخدمة، الزهراء، جدة 23424",
          "latitude": 21.576656999999997,
          "longitude": 39.127314299999995,
          "maps_business_name": "Bread Ahead",
          "google_place_id": "ChIJIYbp4trbwxURseJD7d4cWtg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJIYbp4trbwxURseJD7d4cWtg",
          "google_rating": 4.6,
          "google_review_count": 7604,
          "operating_status": "open",
          "hours": "Sat–Wed 07:00–00:00; Thu–Fri 07:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "bread_ahead",
          "branch_name_en": "King's College Hospital",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Bread Ahead Bakery & School (Kings College Hospital), طريق الملك عبدالعزيز، الشاطئ، جدة 23416",
          "latitude": 21.581225099999997,
          "longitude": 39.1262519,
          "maps_business_name": "Bread Ahead",
          "google_place_id": "ChIJszLICgbbwxUR93EJ3wcGjh4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJszLICgbbwxUR93EJ3wcGjh4",
          "google_rating": 4.9,
          "google_review_count": 479,
          "operating_status": "open",
          "hours": "Sat–Thu 07:00–00:00; Fri 12:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "bread_ahead",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "بريد أهيد, Prince Abdullah Alfaisal street، أبحر الشمالية، جدة 23817",
          "latitude": 21.7653872,
          "longitude": 39.1286591,
          "maps_business_name": "Bread Ahead",
          "google_place_id": "ChIJCTvpJABjwRUR3BeAR3FK2uQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCTvpJABjwRUR3BeAR3FK2uQ",
          "google_rating": 4.8,
          "google_review_count": 2979,
          "operating_status": "open",
          "hours": "Mostly 07:00–00:00; Thu/Fri to 01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "bread_ahead",
          "branch_name_en": "Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Bread Ahead Red Sea Mall, طريق الملك عبدالعزيز، الشاطئ، جدة 21146",
          "latitude": 21.627415199999998,
          "longitude": 39.111073399999995,
          "maps_business_name": "Bread Ahead",
          "google_place_id": "ChIJO7c88FXbwxURmXJz6pQq0GI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJO7c88FXbwxURmXJz6pQq0GI",
          "google_rating": 4.9,
          "google_review_count": 638,
          "operating_status": "open",
          "hours": "Sat–Thu 08:00–00:00; Fri 13:00–00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "pizzalio",
      "canonical_name": "Pizzalio",
      "arabic_name": "بيتزاليو",
      "categories": [
        "pizza",
        "italian",
        "local_pizzeria"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian",
        "local_pizzeria"
      ],
      "subcategories": [
        "italian",
        "local_pizzeria"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pizza",
      "signature_dish_en": "Pizza",
      "vibe_tags_ar": [
        "بيتزا نابولية أصيلة",
        "إيطالي حيوي",
        "مكونات طازجة",
        "جلسات ممتعة"
      ],
      "vibe_tags_en": [
        "Authentic Neapolitan",
        "Vibrant Pizzeria",
        "Fresh Ingredients",
        "Casual Dining"
      ],
      "reputation_tags": [
        "hidden_gem"
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_salamah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pizza",
          "name_ar": "Pizza",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "pizzalio",
          "branch_name_en": "Pizzalio — Al Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Rami street, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5823848,
          "longitude": 39.1542442,
          "maps_business_name": "Pizzalio",
          "google_place_id": "ChIJc-aQA9PbwxUR2cOZdM6POTE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc-aQA9PbwxUR2cOZdM6POTE",
          "google_rating": 4.7,
          "google_review_count": 709,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 14:00–02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "pastola_italian_restaurant",
      "canonical_name": "Pastola Italian Restaurant",
      "arabic_name": "باستولا",
      "categories": [
        "pizza",
        "italian"
      ],
      "primary_category": "pizza",
      "secondary_categories": [
        "italian"
      ],
      "subcategories": [
        "italian"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 75,
      "signature_dish_ar": "Pizza",
      "signature_dish_en": "Pizza",
      "vibe_tags_ar": [
        "إيطالي كلاسيك",
        "بيتزا وباستا",
        "جلسات عائلية",
        "أجواء دافئة"
      ],
      "vibe_tags_en": [
        "Classic Italian",
        "Pizza & Pasta",
        "Family Friendly",
        "Warm Ambience"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "dine_in_strong",
        "delivery_strong",
        "late_night"
      ],
      "time_slots": [
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_mohammadiyyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Pizza",
          "name_ar": "Pizza",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "pastola_italian_restaurant",
          "branch_name_en": "Pastola Italian Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23621, Saudi Arabia",
          "latitude": 21.6348399,
          "longitude": 39.132944099999996,
          "maps_business_name": "Pastola Italian Restaurant",
          "google_place_id": "ChIJkY9_Nd_ZwxURal00gRBpt24",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkY9_Nd_ZwxURal00gRBpt24",
          "google_rating": 4.8,
          "google_review_count": 515,
          "operating_status": "open",
          "hours": "Daily 14:00–04:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _pizza_catalog);
BEGIN
  -- Verify total brands count = 18
  IF jsonb_array_length(p->'brands') <> 18 THEN
    RAISE EXCEPTION 'Pizza catalog must contain exactly 18 brands';
  END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 18 THEN
    RAISE EXCEPTION 'Duplicate Pizza brand IDs';
  END IF;

  -- Verify total branches count = 105
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 105 THEN
    RAISE EXCEPTION 'Pizza catalog must contain exactly 105 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 105 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in Pizza branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 105 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in Pizza branches';
  END IF;

  -- Verify all branches have non-null coordinates, addresses, maps URLs, and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in Pizza payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Pizza catalog contains an unknown canonical district'; END IF;

  -- Verify exactly 19 branches outside 30-district canonical whitelist have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 19 THEN
    RAISE EXCEPTION 'Pizza catalog must contain exactly 19 caution branches with null district';
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
WITH catalog AS (SELECT payload FROM _pizza_catalog), brands AS (
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
  20,
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

-- 2. Cleanup stale best sellers and sources for these 18 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _pizza_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _pizza_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _pizza_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _pizza_catalog), sellers AS (
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
  'Certified Pizza Pass D dataset signature item',
  '2026-09-26T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _pizza_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _pizza_catalog), branches AS (
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
