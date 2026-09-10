-- Google-verified Jeddah burger catalog. Source SHA-256: C90868219C47FAA8AD6B07096A73C01C5720AA53F065F9FBBB977857A70FD3F3
-- Apply after 20260910000100_jeddah_geography_intelligence.sql.
BEGIN;

ALTER TABLE public.restaurants ALTER COLUMN rating DROP NOT NULL;
ALTER TABLE public.restaurant_branches
  ADD COLUMN IF NOT EXISTS google_price_level text CHECK (google_price_level IS NULL OR length(trim(google_price_level)) > 0),
  ADD COLUMN IF NOT EXISTS google_price_range_display text CHECK (google_price_range_display IS NULL OR length(trim(google_price_range_display)) > 0);

CREATE TEMP TABLE _burger_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _burger_catalog(payload) VALUES ($catalog${
  "section_1_brand_intelligence": [
    {
      "brand_id_hint": "section_b",
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "beef_burger",
          "chicken_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Official menu is burger-led."
        ]
      },
      "positioning": {
        "editorial_role": "staple",
        "reputation_tags": [
          "jeddah_staple",
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 25,
        "estimated_spend_max_sar": 85
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout",
        "dine_in_strong"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [
        {
          "name_en": "B",
          "name_ar": null,
          "signature": true,
          "confidence": "high",
          "source_urls": [
            "https://section-b4.wixsite.com/section-b"
          ]
        },
        {
          "name_en": "B Double",
          "name_ar": null,
          "signature": false,
          "confidence": "high",
          "source_urls": [
            "https://section-b4.wixsite.com/section-b"
          ]
        }
      ],
      "official_sources": {
        "website": "https://section-b4.wixsite.com/section-b",
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Founded in Jeddah in 2015 according to current/historical first-party material.",
        "Google inventory confirms multiple distinct Jeddah storefront/kitchen identities."
      ]
    },
    {
      "brand_id_hint": "california_burger",
      "brand_name_en": "The California Burger",
      "brand_name_ar": "ذا كاليفورنيا برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "beef_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Brand identity and current restaurant listings are burger-specific."
        ]
      },
      "positioning": {
        "editorial_role": "staple",
        "reputation_tags": [
          "jeddah_staple",
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 35,
        "estimated_spend_max_sar": 65
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout",
        "dine_in_strong"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [],
      "official_sources": {
        "website": "https://www.thecaliforniaburger.com",
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Saudi family-owned brand launched in Jeddah in 2016 according to company profile evidence."
      ]
    },
    {
      "brand_id_hint": "century_burger",
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "beef_burger",
          "brisket_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Official Century menu and locations are burger-focused."
        ]
      },
      "positioning": {
        "editorial_role": "staple",
        "reputation_tags": [
          "jeddah_staple",
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 25,
        "estimated_spend_max_sar": 70
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout",
        "dine_in_strong"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [
        {
          "name_en": "The Original CB",
          "name_ar": null,
          "signature": true,
          "confidence": "high",
          "source_urls": [
            "https://www.centuryburger.com/"
          ]
        },
        {
          "name_en": "Brisket Burger",
          "name_ar": null,
          "signature": false,
          "confidence": "high",
          "source_urls": [
            "https://www.centuryburger.com/"
          ]
        }
      ],
      "official_sources": {
        "website": "https://www.centuryburger.com/",
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Established in Saudi Arabia in 2011 according to company/brand material."
      ]
    },
    {
      "brand_id_hint": "chefs_burger",
      "brand_name_en": "Chef's Homemade Burger Gourmet",
      "brand_name_ar": "شيفز برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "gourmet_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Current Google and first-party identities are Chef's Burger storefronts."
        ]
      },
      "positioning": {
        "editorial_role": "staple",
        "reputation_tags": [
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 30,
        "estimated_spend_max_sar": 65
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout",
        "dine_in_strong"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [],
      "official_sources": {
        "website": null,
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Three Jeddah Google storefronts are currently verified."
      ]
    },
    {
      "brand_id_hint": "sign_burger",
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "fast_food"
        ],
        "subcategories": [
          "beef_burger",
          "chicken_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Official menu and Google listings are burger-led."
        ]
      },
      "positioning": {
        "editorial_role": "popular",
        "reputation_tags": [
          "local_favorite",
          "mainstream"
        ],
        "trend_status": "none",
        "price_position": "budget",
        "estimated_spend_min_sar": 15,
        "estimated_spend_max_sar": 35
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout"
      ],
      "meal_period_strength": {
        "breakfast": true,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [
        {
          "name_en": "Sign Beef",
          "name_ar": null,
          "signature": true,
          "confidence": "high",
          "source_urls": [
            "https://signsa.com/"
          ]
        },
        {
          "name_en": "Sign Chicken",
          "name_ar": null,
          "signature": false,
          "confidence": "high",
          "source_urls": [
            "https://signsa.com/"
          ]
        },
        {
          "name_en": "Sign Spicy Chicken",
          "name_ar": null,
          "signature": false,
          "confidence": "high",
          "source_urls": [
            "https://signsa.com/"
          ]
        }
      ],
      "official_sources": {
        "website": "https://signsa.com/",
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Official locator contains additional branch claims, but only Google-listed physical storefronts are production eligible under the new standard."
      ]
    },
    {
      "brand_id_hint": "nora_burger",
      "brand_name_en": "Nora Burger",
      "brand_name_ar": "نورا برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "fast_food"
        ],
        "subcategories": [
          "smash_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Current Google identities and Nora app/brand material describe a smash-burger concept."
        ]
      },
      "positioning": {
        "editorial_role": "popular",
        "reputation_tags": [
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 20,
        "estimated_spend_max_sar": 45
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [
        {
          "name_en": "Double Cheeseburger",
          "name_ar": null,
          "signature": true,
          "confidence": "medium",
          "source_urls": []
        },
        {
          "name_en": "Triple Cheeseburger",
          "name_ar": null,
          "signature": false,
          "confidence": "medium",
          "source_urls": []
        }
      ],
      "official_sources": {
        "website": null,
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Old Abhur production candidate fails the new Google storefront gate.",
        "A current operational Google-listed Al Muhammadiyyah storefront is a new inventory candidate and should supersede the assumption that the old two-branch set was complete."
      ]
    },
    {
      "brand_id_hint": "wbj",
      "brand_name_en": "WBJ",
      "brand_name_ar": "واقيو برجر جوينت",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "wagyu_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Official ordering and coverage identify WBJ as Wagyu Burger Joint."
        ]
      },
      "positioning": {
        "editorial_role": "popular",
        "reputation_tags": [
          "local_favorite",
          "mainstream"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 30,
        "estimated_spend_max_sar": 45
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout",
        "dine_in_strong"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [],
      "official_sources": {
        "website": null,
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Three exact operational Jeddah Google storefronts verified."
      ]
    },
    {
      "brand_id_hint": "lou_burger",
      "brand_name_en": "Lou Burger",
      "brand_name_ar": "لو برجر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "beef_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Both current Jeddah Google storefronts are burger restaurants."
        ]
      },
      "positioning": {
        "editorial_role": "popular",
        "reputation_tags": [
          "local_favorite"
        ],
        "trend_status": "none",
        "price_position": "standard",
        "estimated_spend_min_sar": 35,
        "estimated_spend_max_sar": 65
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [],
      "official_sources": {
        "website": null,
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Al Andalus and Al Shera'a are both exact operational Google storefronts."
      ]
    },
    {
      "brand_id_hint": "pplr",
      "brand_name_en": "PPLR",
      "brand_name_ar": "بي بي إل آر",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "american"
        ],
        "subcategories": [
          "burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Exact Google storefront is a burger restaurant."
        ]
      },
      "positioning": {
        "editorial_role": "discovery",
        "reputation_tags": [
          "rising"
        ],
        "trend_status": "rising",
        "price_position": "standard",
        "estimated_spend_min_sar": 40,
        "estimated_spend_max_sar": 60
      },
      "context_tags": [
        "quick_bite",
        "casual_hangout"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": false,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": null,
        "delivery": null,
        "dining_mode_summary": "dine_in_only"
      },
      "best_sellers": [],
      "official_sources": {
        "website": null,
        "instagram": null,
        "tiktok": null
      },
      "research_use": "usable_with_caution",
      "confidence": "medium",
      "notes": [
        "Exact Google storefront is strong; brand-level first-party intelligence remains comparatively thin."
      ]
    },
    {
      "brand_id_hint": "smash_me",
      "brand_name_en": "Smash Me",
      "brand_name_ar": "سماش مي",
      "category": {
        "primary_category": "burger",
        "secondary_categories": [
          "fast_food"
        ],
        "subcategories": [
          "smash_burger"
        ],
        "category_fit_confidence": "high",
        "evidence": [
          "Official site and Google storefronts are smash-burger focused."
        ]
      },
      "positioning": {
        "editorial_role": "discovery",
        "reputation_tags": [
          "rising"
        ],
        "trend_status": "rising",
        "price_position": "budget",
        "estimated_spend_min_sar": 20,
        "estimated_spend_max_sar": 40
      },
      "context_tags": [
        "late_night",
        "quick_bite",
        "casual_hangout"
      ],
      "meal_period_strength": {
        "breakfast": false,
        "lunch": true,
        "dinner": true,
        "late_night": true
      },
      "dining": {
        "dine_in": true,
        "takeaway": true,
        "delivery": true,
        "dining_mode_summary": "both"
      },
      "best_sellers": [
        {
          "name_en": "Smash Me Style Burger",
          "name_ar": null,
          "signature": true,
          "confidence": "medium",
          "source_urls": [
            "https://www.smashmerestaurant.com/"
          ]
        },
        {
          "name_en": "Double Smash Burger",
          "name_ar": null,
          "signature": false,
          "confidence": "medium",
          "source_urls": [
            "https://www.smashmerestaurant.com/"
          ]
        }
      ],
      "official_sources": {
        "website": "https://www.smashmerestaurant.com/",
        "instagram": null,
        "tiktok": null
      },
      "research_use": "production_ready",
      "confidence": "high",
      "notes": [
        "Originates from Doha/Qatar and expanded to Jeddah.",
        "Rawdah now has an exact current Google business identity, resolving the old storefront-identity blocker."
      ]
    }
  ],
  "section_2_google_physical_branch_inventory": [
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "S Square",
      "branch_name_ar": "إس سكوير",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section B",
        "google_place_id": "ChIJXYv7rVPawxURq9tp8iVXvQU",
        "google_maps_url": "https://maps.google.com/?cid=413582561280383915&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
      },
      "location": {
        "latitude": 21.6060577,
        "longitude": 39.1188028,
        "formatted_address": "3362 Hira St, Ash Shati, 7750, Jeddah 23514, Saudi Arabia",
        "district_normalized": "al_shati",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.3,
        "review_count": 13778,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=413582561280383915&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "Tahlia",
      "branch_name_ar": "التحلية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section-B",
        "google_place_id": "ChIJIf4HeczFwxUR7--yVh3sdTQ",
        "google_maps_url": "https://maps.google.com/?cid=3780187073000173551&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5498501,
        "longitude": 39.1435337,
        "formatted_address": "Fayfa Avenue, طريق الامير سلطان، الروضة، جدة 23431, Saudi Arabia",
        "district_normalized": "al_rawdah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 6171,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=3780187073000173551&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "Hiraa",
      "branch_name_ar": "حراء",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section B",
        "google_place_id": "ChIJYRlUaADbwxURxSYPglOTQqw",
        "google_maps_url": "https://maps.google.com/?cid=12412645509860107973&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6048265,
        "longitude": 39.1162703,
        "formatted_address": "Hira St, Ash Shati, Jeddah 23513, Saudi Arabia",
        "district_normalized": "al_shati",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 2043,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=12412645509860107973&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "Obhur",
      "branch_name_ar": "أبحر",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section-B",
        "google_place_id": "ChIJcSxas8PZwxURGFMKn_l_xSM",
        "google_maps_url": "https://maps.google.com/?cid=2577607071831315224&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.717134,
        "longitude": 39.0829822,
        "formatted_address": "Prince Abdullah AlFiasal St, Obhur Al-Shamaliyah, Jeddah 23811, Saudi Arabia",
        "district_normalized": null,
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.4,
        "review_count": 1486,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=2577607071831315224&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": [
          "Google formatted address says Obhur Al-Shamaliyah while an earlier normalization mapped this coordinate to south Obhur; leave canonical district null pending geography-model reconciliation."
        ]
      }
    },
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "Al Faisaliyyah",
      "branch_name_ar": "الفيصلية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section-B - BOH | سكشن-بي - بي أو أيتش",
        "google_place_id": "ChIJe8h28QDRwxURjt3oMZeDt6w",
        "google_maps_url": "https://maps.google.com/?cid=12445560780662300046&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5811982,
        "longitude": 39.1924063,
        "formatted_address": "Street, Al Sourouri, Al Faisaliyyah, Jeddah 23447, Saudi Arabia",
        "district_normalized": "al_faisaliyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 3.9,
        "review_count": 434,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=12445560780662300046&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Section-B",
      "brand_name_ar": "سكشن بي",
      "branch_name_en": "Al Murjan",
      "branch_name_ar": "المرجان",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Section-B - BOH |",
        "google_place_id": "ChIJBYiGaiTZwxURV7u8ZZ838Jg",
        "google_maps_url": "https://maps.google.com/?cid=11020369445921798999&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6924144,
        "longitude": 39.1055389,
        "formatted_address": "Al Murjan, Jeddah 23714, Saudi Arabia",
        "district_normalized": "al_murjan",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 3.8,
        "review_count": 281,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=11020369445921798999&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "The California Burger",
      "brand_name_ar": "ذا كاليفورنيا برجر",
      "branch_name_en": "Khalidiyyah",
      "branch_name_ar": "الخالدية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "The California Burger",
        "google_place_id": "ChIJb-U82bDawxURLQMsTI8xk1U",
        "google_maps_url": "https://maps.google.com/?cid=6166326806328378157&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5587573,
        "longitude": 39.1396798,
        "formatted_address": "شارع الامير سعود الفيصل، حي الخالدية مجمع المطاعم امام، بوبا للتامين، Al Khalidiyyah, Jeddah 23421, Saudi Arabia",
        "district_normalized": "al_khalidiyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 9259,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=6166326806328378157&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "The California Burger",
      "brand_name_ar": "ذا كاليفورنيا برجر",
      "branch_name_en": "Muhammadiyyah",
      "branch_name_ar": "المحمدية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "The California Burger",
        "google_place_id": "ChIJaRQT16TZwxURsne__gycq6M",
        "google_maps_url": "https://maps.google.com/?cid=11793691628827277234&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6669148,
        "longitude": 39.1219788,
        "formatted_address": "Prince Sultan Branch Road, المحمدية، جدة 23625, Saudi Arabia",
        "district_normalized": "al_mohammadiyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 8482,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=11793691628827277234&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "The California Burger",
      "brand_name_ar": "ذا كاليفورنيا برجر",
      "branch_name_en": "Al Marwah / Hira Street",
      "branch_name_ar": "المروة / شارع حراء",
      "google_identity": {
        "status": "verified",
        "google_business_name": "The California Burger",
        "google_place_id": "ChIJV4JrDtfWwxURcb-1hYI-7-Q",
        "google_maps_url": "https://maps.google.com/?cid=16496472690391367537&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
      },
      "location": {
        "latitude": 21.6224516,
        "longitude": 39.1991904,
        "formatted_address": "شارع حراء، امام ماندرين افينيو، Hira St, Al Marwah, Jeddah 23544, Saudi Arabia",
        "district_normalized": "al_marwah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 4057,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 40–60"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=16496472690391367537&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Muhammadiyyah",
      "branch_name_ar": "المحمدية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJK3j3HNvZwxURw2BfjRFcnDo",
        "google_maps_url": "https://maps.google.com/?cid=4223351781022720195&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6414789,
        "longitude": 39.1302451,
        "formatted_address": "8099 Prince Sultan Rd, Jeddah 23623, Saudi Arabia",
        "district_normalized": "al_mohammadiyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.3,
        "review_count": 6554,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=4223351781022720195&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Rawdah",
      "branch_name_ar": "الروضة",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJL9fpbrLawxURkzvsBWdEPV4",
        "google_maps_url": "https://maps.google.com/?cid=6790659022416264083&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.55499,
        "longitude": 39.1432296,
        "formatted_address": "Prince Sultan Rd, Ar Rawdah, Jeddah 23431, Saudi Arabia",
        "district_normalized": "al_rawdah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.5,
        "review_count": 20072,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=6790659022416264083&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Red Sea Mall",
      "branch_name_ar": "رد سي مول",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJ97vtaM3bwxUR3mbHQZ9pzTA",
        "google_maps_url": "https://maps.google.com/?cid=3516583016770528990&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6278698,
        "longitude": 39.1112101,
        "formatted_address": "King Abdul Aziz Rd, Ash Shati, Jeddah 23612, Saudi Arabia",
        "district_normalized": "al_shati",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.1,
        "review_count": 694,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=3516583016770528990&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Obhur Plaza",
      "branch_name_ar": "أبحر بلازا",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJ1WB-XoRjwRURlMetn79Bz8Q",
        "google_maps_url": "https://maps.google.com/?cid=14181626042886506388&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7627605,
        "longitude": 39.1142786,
        "formatted_address": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
        "district_normalized": "abhur_al_shamaliyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.1,
        "review_count": 686,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=14181626042886506388&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "King Abdulaziz International Airport",
      "branch_name_ar": "مطار الملك عبدالعزيز الدولي",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJXw7KLmbXwxURRPeNM_tNTsU",
        "google_maps_url": "https://maps.google.com/?cid=14217386814952306500&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6620427,
        "longitude": 39.1733833,
        "formatted_address": "Prince Majid Rd, King Abdulaziz International Airport, Jeddah 23635, Saudi Arabia",
        "district_normalized": null,
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.0,
        "review_count": 490,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=14217386814952306500&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Jeddah Park",
      "branch_name_ar": "جدة بارك",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger",
        "google_place_id": "ChIJTYhSq_LRwxURKXuDXjsVkc4",
        "google_maps_url": "https://maps.google.com/?cid=14884701588169128745&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5577229,
        "longitude": 39.1850956,
        "formatted_address": "Aziziyah, Jeddah 23334, Saudi Arabia",
        "district_normalized": null,
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 5907,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=14884701588169128745&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Century Burger",
      "brand_name_ar": "سنشري برجر",
      "branch_name_en": "Al Fayha",
      "branch_name_ar": "الفيحاء",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Century Burger | سنشري برجر",
        "google_place_id": "ChIJMRcGBwDPwxUR_EBJHsXuiJg",
        "google_maps_url": "https://maps.google.com/?cid=10991297420981780732&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.4891967,
        "longitude": 39.225325,
        "formatted_address": "6782 عبدالله سليمان الفرعي, حي الفيحاء, جدة 22246, Saudi Arabia",
        "district_normalized": "al_faiha",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.5,
        "review_count": 2795,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=10991297420981780732&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Chef's Homemade Burger Gourmet",
      "brand_name_ar": "شيفز برجر",
      "branch_name_en": "Sari Road",
      "branch_name_ar": "طريق صاري",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Chef's Burger",
        "google_place_id": "ChIJAaO4eTTbwxURzAzORGCvlIo",
        "google_maps_url": "https://maps.google.com/?cid=9985799101793307852&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5731048,
        "longitude": 39.1370841,
        "formatted_address": "Sari Br Rd, Jeddah 23424, Saudi Arabia",
        "district_normalized": "al_zahra",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 9926,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=9985799101793307852&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Chef's Homemade Burger Gourmet",
      "brand_name_ar": "شيفز برجر",
      "branch_name_en": "Prince Sultan Road",
      "branch_name_ar": "طريق الأمير سلطان",
      "google_identity": {
        "status": "verified",
        "google_business_name": "شيفز برجر | Chef's Burger",
        "google_place_id": "ChIJnz7V_3bZwxURGti6VJjD8uA",
        "google_maps_url": "https://maps.google.com/?cid=16209233067883812890&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.646264,
        "longitude": 39.128461,
        "formatted_address": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23623, Saudi Arabia",
        "district_normalized": "al_mohammadiyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.3,
        "review_count": 11644,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=16209233067883812890&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Chef's Homemade Burger Gourmet",
      "brand_name_ar": "شيفز برجر",
      "branch_name_en": "Al Ruwais",
      "branch_name_ar": "الرويس",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Chef's Burger",
        "google_place_id": "ChIJo1uDjmrPwxURbkRN9JTjs4U",
        "google_maps_url": "https://maps.google.com/?cid=9634294256768992366&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5109116,
        "longitude": 39.1815989,
        "formatted_address": "King Abdullah Branch Rd, Al-Ruwais, Jeddah 23214, Saudi Arabia",
        "district_normalized": "al_ruwais",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.5,
        "review_count": 5496,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=9634294256768992366&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Obhur",
      "branch_name_ar": "أبحر",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJX5D-EwBjwRURQt-yfrn_xtQ",
        "google_maps_url": "https://maps.google.com/?cid=15332223153589116738&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7553408,
        "longitude": 39.1210114,
        "formatted_address": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
        "district_normalized": "abhur_al_shamaliyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 2806,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=15332223153589116738&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Al Thaghr / Abdullah Suleiman",
      "branch_name_ar": "الثغر / عبدالله سليمان",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJXXQ5GQDNwxURjJlLXQDlKoE",
        "google_maps_url": "https://maps.google.com/?cid=9307503369642547596&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.4829241,
        "longitude": 39.2387763,
        "formatted_address": "5229 Abdullah Sulayman St, Ath Thaghr District, Jeddah 22338, Saudi Arabia",
        "district_normalized": "al_thaghr",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 3550,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=9307503369642547596&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Corniche",
      "branch_name_ar": "الكورنيش",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJWRksoQ7bwxURKWwHjz8iutQ",
        "google_maps_url": "https://maps.google.com/?cid=15328601938086816809&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5928661,
        "longitude": 39.1058653,
        "formatted_address": "Al Kurnaysh Br Rd, Ash Shati, Jeddah 23510, Saudi Arabia",
        "district_normalized": "al_shati",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.3,
        "review_count": 289,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=15328601938086816809&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Al Hamdaniyah",
      "branch_name_ar": "الحمدانية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJeWOe2kx9wRUR6mhEV5ZRBls",
        "google_maps_url": "https://maps.google.com/?cid=6559019613462751466&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7580092,
        "longitude": 39.1972303,
        "formatted_address": "Q54W+QQ5, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
        "district_normalized": "al_hamdaniyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.8,
        "review_count": 5717,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=6559019613462751466&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Al Bawadi",
      "branch_name_ar": "البوادي",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJMcIDdTXRwxUR13YaNc6VY7I",
        "google_maps_url": "https://maps.google.com/?cid=12854282474332255959&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6078028,
        "longitude": 39.1689496,
        "formatted_address": "J559+3H8, King Fahad Rd, Al Bawadi, Jeddah 23531, Saudi Arabia",
        "district_normalized": "al_bawadi",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 17269,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 20–40"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=12854282474332255959&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Sign Burger",
      "brand_name_ar": "ساين برجر",
      "branch_name_en": "Al Muhammadiyyah",
      "branch_name_ar": "المحمدية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Sign",
        "google_place_id": "ChIJA-s4bTXZwxUR-oILNZt2NPc",
        "google_maps_url": "https://maps.google.com/?cid=17812992835139109626&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.6588716,
        "longitude": 39.1235101,
        "formatted_address": "Near Royal Pavillion Traffic Light North, Prince Sultan Branch Rd, Al Mohammadiyyah, Jeddah 23624, Saudi Arabia",
        "district_normalized": "al_mohammadiyyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 15232,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=17812992835139109626&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Nora Burger",
      "brand_name_ar": "نورا برجر",
      "branch_name_en": "Rawdah",
      "branch_name_ar": "الروضة",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Nora Smash Burger - نورا سماش برجر",
        "google_place_id": "ChIJzUvkcADbwxURdhzQI192mCs",
        "google_maps_url": "https://maps.google.com/?cid=3141390891085732982&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5727624,
        "longitude": 39.154183,
        "formatted_address": "Imam Malik, Ar Rawdah, Jeddah 23436, Saudi Arabia",
        "district_normalized": "al_rawdah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.1,
        "review_count": 2174,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 20–40"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=3141390891085732982&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "WBJ",
      "brand_name_ar": "واقيو برجر جوينت",
      "branch_name_en": "Al Zahra",
      "branch_name_ar": "الزهراء",
      "google_identity": {
        "status": "verified",
        "google_business_name": "WBJ",
        "google_place_id": "ChIJdXODDQDbwxURMprErPxcdZA",
        "google_maps_url": "https://maps.google.com/?cid=10409328354036849202&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5934114,
        "longitude": 39.1435025,
        "formatted_address": "6398 Prince Sultan Rd, Al Zahra, Jeddah 23521, Saudi Arabia",
        "district_normalized": "al_zahra",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.5,
        "review_count": 6067,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=10409328354036849202&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "WBJ",
      "brand_name_ar": "واقيو برجر جوينت",
      "branch_name_en": "Abhur",
      "branch_name_ar": "أبحر",
      "google_identity": {
        "status": "verified",
        "google_business_name": "WBJ restaurant",
        "google_place_id": "ChIJh6NBPABjwRUR2J7qkihn5ZA",
        "google_maps_url": "https://maps.google.com/?cid=10440864735089565400&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7509304,
        "longitude": 39.134722,
        "formatted_address": "2281 King Abdul Aziz Rd, Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
        "district_normalized": "abhur_al_janoubiyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.8,
        "review_count": 1901,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 20–40"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=10440864735089565400&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "WBJ",
      "brand_name_ar": "واقيو برجر جوينت",
      "branch_name_en": "Al Hamdaniyah",
      "branch_name_ar": "الحمدانية",
      "google_identity": {
        "status": "verified",
        "google_business_name": "WBJ",
        "google_place_id": "ChIJ5YGoIwB9wRURBfdRIt_DL-k",
        "google_maps_url": "https://maps.google.com/?cid=16802864097863530245&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7582831,
        "longitude": 39.1981764,
        "formatted_address": "4161 شارع الحمدانية الفرعي، حي الحمدانية، Jeddah 23761, Saudi Arabia",
        "district_normalized": "al_hamdaniyah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.9,
        "review_count": 1115,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=16802864097863530245&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Lou Burger",
      "brand_name_ar": "لو برجر",
      "branch_name_en": "Al Andalus",
      "branch_name_ar": "الأندلس",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Lou Burger لو برجر",
        "google_place_id": "ChIJz5WXPQDFwxURrnvjQpZYHiU",
        "google_maps_url": "https://maps.google.com/?cid=2674672631095196590&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.547443,
        "longitude": 39.1495432,
        "formatted_address": "G4XX+2VC، عبدالله المطري، Al Andalus, Jeddah 23322, Saudi Arabia",
        "district_normalized": "al_andalus",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 4164,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": "$$",
        "price_range_display": null
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=2674672631095196590&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Lou Burger",
      "brand_name_ar": "لو برجر",
      "branch_name_en": "Al Shera'a",
      "branch_name_ar": "الشراع",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Lou Burger لو برجر",
        "google_place_id": "ChIJ_Q7U0epjwRURHCXYMCGpfeo",
        "google_maps_url": "https://maps.google.com/?cid=16896847336982455580&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.7639295,
        "longitude": 39.109079,
        "formatted_address": "7014 الامير مشعل ابن ماجد ابن عبدالله, الشراع، جدة 23816, Saudi Arabia",
        "district_normalized": "al_sheraa",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.7,
        "review_count": 222,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 40–60"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=16896847336982455580&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "PPLR",
      "brand_name_ar": "بي بي إل آر",
      "branch_name_en": "Rawdah",
      "branch_name_ar": "الروضة",
      "google_identity": {
        "status": "verified",
        "google_business_name": "PPLR",
        "google_place_id": "ChIJ44H7RgDbwxURnuuuzb7m5iY",
        "google_maps_url": "https://maps.google.com/?cid=2803181525253680030&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.5732069,
        "longitude": 39.1481774,
        "formatted_address": "عبدالصمد خوجة، Ar Rawdah, Jeddah 23435, Saudi Arabia",
        "district_normalized": "al_rawdah",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 525,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 40–60"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=2803181525253680030&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    },
    {
      "brand_name_en": "Smash Me",
      "brand_name_ar": "سماش مي",
      "branch_name_en": "Al Naeem",
      "branch_name_ar": "النعيم",
      "google_identity": {
        "status": "verified",
        "google_business_name": "Smash Me",
        "google_place_id": "ChIJpTCKfADbwxUR2FepmjWNfRM",
        "google_maps_url": "https://maps.google.com/?cid=1404433920177035224&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
      },
      "location": {
        "latitude": 21.615326,
        "longitude": 39.13984,
        "formatted_address": "Prince Sultan Branch Rd, Al Naeem, Jeddah 23526, Saudi Arabia",
        "district_normalized": "al_naeem",
        "city": "Jeddah",
        "country": "Saudi Arabia",
        "location_confidence": "high"
      },
      "google_reputation": {
        "rating": 4.6,
        "review_count": 649,
        "retrieved_at": "2026-09-10"
      },
      "google_price": {
        "price_level": null,
        "price_range_display": "SAR 20–40"
      },
      "business_status": "OPERATIONAL",
      "research": {
        "research_use": "production_ready",
        "identity_confidence": "high",
        "source_urls": [
          "https://maps.google.com/?cid=1404433920177035224&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA"
        ],
        "last_verified": "2026-09-10",
        "notes": []
      }
    }
  ],
  "section_3_branch_audit": [
    {
      "brand": "Section-B",
      "google_branch_candidates_found": 6,
      "production_ready_google_branches": 6,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "S Square",
        "Tahlia",
        "Hiraa",
        "Obhur",
        "Al Faisaliyyah",
        "Al Murjan"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "The California Burger",
      "google_branch_candidates_found": 3,
      "production_ready_google_branches": 3,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Khalidiyyah",
        "Muhammadiyyah",
        "Al Marwah / Hira Street"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Century Burger",
      "google_branch_candidates_found": 7,
      "production_ready_google_branches": 7,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Muhammadiyyah",
        "Rawdah",
        "Red Sea Mall",
        "Obhur Plaza",
        "King Abdulaziz International Airport",
        "Jeddah Park",
        "Al Fayha"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Chef's Homemade Burger Gourmet",
      "google_branch_candidates_found": 3,
      "production_ready_google_branches": 3,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Sari Road",
        "Prince Sultan Road",
        "Al Ruwais"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Sign Burger",
      "google_branch_candidates_found": 6,
      "production_ready_google_branches": 6,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Obhur",
        "Al Thaghr / Abdullah Suleiman",
        "Corniche",
        "Al Hamdaniyah",
        "Al Bawadi",
        "Al Muhammadiyyah"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Nora Burger",
      "google_branch_candidates_found": 1,
      "production_ready_google_branches": 1,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Rawdah"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "WBJ",
      "google_branch_candidates_found": 3,
      "production_ready_google_branches": 3,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Al Zahra",
        "Abhur",
        "Al Hamdaniyah"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Lou Burger",
      "google_branch_candidates_found": 2,
      "production_ready_google_branches": 2,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Al Andalus",
        "Al Shera'a"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "PPLR",
      "google_branch_candidates_found": 1,
      "production_ready_google_branches": 1,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Rawdah"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    },
    {
      "brand": "Smash Me",
      "google_branch_candidates_found": 1,
      "production_ready_google_branches": 1,
      "manual_review_branches": 0,
      "rejected_duplicate_branches": 0,
      "production_ready": [
        "Al Naeem"
      ],
      "manual_review": [],
      "rejected_or_duplicate": []
    }
  ],
  "section_4_final_completion_report": {
    "brands_researched": 10,
    "brands_production_ready": 9,
    "brands_usable_with_caution": 1,
    "brands_manual_review_only": 0,
    "brands_rejected": 0,
    "google_listed_physical_branch_candidates_found": 33,
    "total_physical_branch_claims_investigated": 33,
    "production_ready_google_branches": 33,
    "manual_review_branches": 0,
    "rejected_duplicate_branches": 0,
    "production_branch_completeness": {
      "maps_url": {
        "count": 33,
        "denominator": 33
      },
      "usable_coordinates": {
        "count": 33,
        "denominator": 33
      },
      "formatted_address": {
        "count": 33,
        "denominator": 33
      },
      "canonical_district": {
        "count": 30,
        "denominator": 33
      },
      "rating_review_count": {
        "count": 33,
        "denominator": 33
      },
      "place_id": {
        "count": 33,
        "denominator": 33
      },
      "google_price_data": {
        "count": 8,
        "denominator": 33
      }
    },
    "production_branches_missing": {
      "rating_review_count": [],
      "place_id": [],
      "district": [
        "Section-B — Obhur",
        "Century Burger — King Abdulaziz International Airport",
        "Century Burger — Jeddah Park"
      ],
      "price_data": [
        "Section-B — S Square",
        "Section-B — Tahlia",
        "Section-B — Hiraa",
        "Section-B — Obhur",
        "Section-B — Al Faisaliyyah",
        "Section-B — Al Murjan",
        "The California Burger — Khalidiyyah",
        "The California Burger — Muhammadiyyah",
        "Century Burger — Muhammadiyyah",
        "Century Burger — Rawdah",
        "Century Burger — Red Sea Mall",
        "Century Burger — Obhur Plaza",
        "Century Burger — King Abdulaziz International Airport",
        "Century Burger — Jeddah Park",
        "Century Burger — Al Fayha",
        "Chef's Homemade Burger Gourmet — Sari Road",
        "Chef's Homemade Burger Gourmet — Prince Sultan Road",
        "Chef's Homemade Burger Gourmet — Al Ruwais",
        "Sign Burger — Obhur",
        "Sign Burger — Al Thaghr / Abdullah Suleiman",
        "Sign Burger — Corniche",
        "Sign Burger — Al Hamdaniyah",
        "Sign Burger — Al Muhammadiyyah",
        "WBJ — Al Zahra",
        "WBJ — Al Hamdaniyah"
      ]
    },
    "inventory_revisions": [
      "Nora Burger — Al Muhammadiyyah: added as a current Google-listed physical candidate (Place ID ChIJT1MDl8fZwxUR_vHQ-hK0Txw); pending exact raw Maps URL/coordinates before production.",
      "Smash Me — Rawdah: upgraded from unresolved identity to exact current Google-listed branch (Place ID ChIJWfYB_jfNwxURaGe5zleARjs); pending exact raw Maps URL/coordinates before production.",
      "Sign Burger — Al Zahra: retained only as manual-review official claim, not production.",
      "Sign Burger — Al Balad: retained only as manual-review official claim, not production.",
      "Lou Burger — Al Shera'a: upgraded to production-ready because full exact Google Places identity exists.",
      "Century Burger — Al Fayha: confirmed operational exact Google Places branch; production-ready.",
      "Smash Me — An Naseem: newly discovered current Google-listed storefront (Place ID ChIJbQTq4TnPwxURHiIADOFuJho); manual-review pending exact Maps URL/coordinates."
    ],
    "status": {
      "burger_brand_research": "COMPLETE",
      "google_branch_inventory": "COMPLETE",
      "production_dataset": "READY"
    },
    "removed_not_google_maps_verified": [
      {
        "brand_name_en": "Sign Burger",
        "branch_name_en": "Al Zahra",
        "reason": "Removed from branch inventory: no exact usable Google Maps branch URL was verified."
      },
      {
        "brand_name_en": "Sign Burger",
        "branch_name_en": "Al Balad",
        "reason": "Removed from branch inventory: no exact usable Google Maps branch URL was verified."
      },
      {
        "brand_name_en": "Nora Burger",
        "branch_name_en": "Al Muhammadiyyah",
        "reason": "Removed from branch inventory: no exact usable Google Maps branch URL was verified."
      },
      {
        "brand_name_en": "Smash Me",
        "branch_name_en": "Rawdah",
        "reason": "Removed from branch inventory: no exact usable Google Maps branch URL was verified."
      },
      {
        "brand_name_en": "Smash Me",
        "branch_name_en": "An Naseem",
        "reason": "Removed from branch inventory: no exact usable Google Maps branch URL was verified."
      }
    ],
    "inventory_rule": "Only exact Google Maps-listed physical branches with a verified usable Google Maps URL are included. Unverified/manual-review branch claims are excluded entirely."
  }
}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _burger_catalog);
BEGIN
  IF jsonb_array_length(p->'section_1_brand_intelligence') <> 10 THEN RAISE EXCEPTION 'Burger catalog must contain 10 brands'; END IF;
  IF jsonb_array_length(p->'section_2_google_physical_branch_inventory') <> 33 THEN RAISE EXCEPTION 'Burger catalog must contain 33 branches'; END IF;
  IF (SELECT count(DISTINCT b->>'brand_id_hint') FROM jsonb_array_elements(p->'section_1_brand_intelligence') b) <> 10 THEN RAISE EXCEPTION 'Duplicate burger brand IDs'; END IF;
  IF (SELECT count(DISTINCT b->'google_identity'->>'google_place_id') FROM jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b) <> 33 THEN RAISE EXCEPTION 'Duplicate or missing Google Place IDs'; END IF;
  IF (SELECT count(DISTINCT b->'google_identity'->>'google_maps_url') FROM jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b) <> 33 THEN RAISE EXCEPTION 'Duplicate or missing Google Maps URLs'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b
    WHERE b->'google_identity'->>'status' <> 'verified'
       OR b->'google_identity'->>'google_place_id' IS NULL
       OR b->'google_identity'->>'google_maps_url' IS NULL
       OR b->'location'->>'latitude' IS NULL OR b->'location'->>'longitude' IS NULL
       OR b->'location'->>'formatted_address' IS NULL
       OR b->>'business_status' <> 'OPERATIONAL'
       OR b->'google_reputation'->>'rating' IS NULL OR b->'google_reputation'->>'review_count' IS NULL
       OR b->'research'->>'research_use' <> 'production_ready'
  ) THEN RAISE EXCEPTION 'Incomplete or ineligible production branch'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b
    WHERE b->'location'->>'district_normalized' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = b->'location'->>'district_normalized')
  ) THEN RAISE EXCEPTION 'Burger catalog contains an unknown canonical district'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b
      ON old.google_place_id = b->'google_identity'->>'google_place_id'
      OR old.google_maps_url = b->'google_identity'->>'google_maps_url'
    JOIN jsonb_array_elements(p->'section_1_brand_intelligence') brand ON brand->>'brand_name_en' = b->>'brand_name_en'
    WHERE old.restaurant_id <> brand->>'brand_id_hint'
  ) THEN RAISE EXCEPTION 'Google branch identity is already assigned to another brand'; END IF;
END $$;

WITH catalog AS (SELECT payload FROM _burger_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') b
), shaped AS (
  SELECT
    b->>'brand_id_hint' id,
    b->>'brand_name_ar' name_ar,
    b->>'brand_name_en' name_en,
    ARRAY[b->'category'->>'primary_category'] || ARRAY(SELECT jsonb_array_elements_text(b->'category'->'secondary_categories')) categories,
    ARRAY(SELECT jsonb_array_elements_text(b->'category'->'secondary_categories')) secondary_categories,
    ARRAY(SELECT jsonb_array_elements_text(b->'category'->'subcategories')) subcategories,
    ARRAY(SELECT key FROM jsonb_each(b->'meal_period_strength') WHERE value = 'true'::jsonb) time_slots,
    ARRAY(SELECT jsonb_array_elements_text(b->'positioning'->'reputation_tags')) reputation_tags,
    ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')) context_tags,
    ARRAY(SELECT jsonb_array_elements_text(b->'notes')) notes,
    b
  FROM brands
)
INSERT INTO public.restaurants (
  id,name_ar,name_en,categories,is_city_wide,branches,dining_mode,time_slots,closing_time_ar,is_open_late,is_24_hours,
  avg_prep_minutes,tier,price_tier,signature_dish_ar,signature_dish_en,vibe_tags_ar,vibe_tags_en,rating,platforms,links,
  city,primary_category,secondary_categories,subcategories,category_fit_confidence,category_fit_evidence,editorial_role,
  reputation_tags,context_tags,context_tag_evidence,business_type,operating_status,brand_status_confidence,
  verified_jeddah_branch_count,branch_list_completeness,meal_period_strength,serves_breakfast_menu,dining_mode_summary,
  price_position,estimated_sar_per_person_min,estimated_sar_per_person_max,official_website,official_instagram,official_tiktok,
  trend_status,trend_confidence,overall_confidence,research_use,last_verified_at,menu_last_verified_at,manual_review_required,
  manual_review_reasons,intelligence_origin
)
SELECT
  s.id,s.name_ar,s.name_en,s.categories,false,
  ARRAY(SELECT DISTINCT branch->'location'->>'district_normalized' FROM _burger_catalog c CROSS JOIN LATERAL jsonb_array_elements(c.payload->'section_2_google_physical_branch_inventory') branch WHERE branch->>'brand_name_en'=s.name_en AND branch->'location'->>'district_normalized' IS NOT NULL ORDER BY 1),
  s.b->'dining'->>'dining_mode_summary',s.time_slots,'',('late_night'=ANY(s.time_slots)),false,20,
  CASE s.b->'positioning'->>'editorial_role' WHEN 'staple' THEN 'staple' ELSE 'trend' END,
  CASE s.b->'positioning'->>'price_position' WHEN 'budget' THEN '$' WHEN 'premium' THEN '$$$' ELSE '$$' END,
  coalesce(s.b->'best_sellers'->0->>'name_ar',''),coalesce(s.b->'best_sellers'->0->>'name_en',''),'{}'::text[],s.context_tags,NULL,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb,'{}'::jsonb,
  'jeddah',s.b->'category'->>'primary_category',s.secondary_categories,s.subcategories,
  (s.b->'category'->>'category_fit_confidence')::public.intelligence_confidence,
  array_to_string(ARRAY(SELECT jsonb_array_elements_text(s.b->'category'->'evidence')), E'\n'),
  (s.b->'positioning'->>'editorial_role')::public.editorial_role,s.reputation_tags,s.context_tags,NULL,'restaurant','open',
  (s.b->>'confidence')::public.intelligence_confidence,
  (SELECT count(*) FROM _burger_catalog c CROSS JOIN LATERAL jsonb_array_elements(c.payload->'section_2_google_physical_branch_inventory') branch WHERE branch->>'brand_name_en'=s.name_en),
  'complete',NULL,(s.b->'meal_period_strength'->>'breakfast')::boolean,s.b->'dining'->>'dining_mode_summary',
  (s.b->'positioning'->>'price_position')::public.price_position,(s.b->'positioning'->>'estimated_spend_min_sar')::numeric,
  (s.b->'positioning'->>'estimated_spend_max_sar')::numeric,s.b->'official_sources'->>'website',s.b->'official_sources'->>'instagram',s.b->'official_sources'->>'tiktok',
  (s.b->'positioning'->>'trend_status')::public.trend_status,'unknown',(s.b->>'confidence')::public.intelligence_confidence,
  (s.b->>'research_use')::public.research_use,
  (SELECT max((branch->'research'->>'last_verified')::timestamptz) FROM _burger_catalog c CROSS JOIN LATERAL jsonb_array_elements(c.payload->'section_2_google_physical_branch_inventory') branch WHERE branch->>'brand_name_en'=s.name_en),
  NULL,(s.b->>'research_use') <> 'production_ready',CASE WHEN s.b->>'research_use' <> 'production_ready' THEN s.notes ELSE '{}'::text[] END,'research'
FROM shaped s
ON CONFLICT (id) DO UPDATE SET
  name_ar=excluded.name_ar,name_en=excluded.name_en,categories=excluded.categories,is_city_wide=excluded.is_city_wide,branches=excluded.branches,
  dining_mode=excluded.dining_mode,time_slots=excluded.time_slots,closing_time_ar=excluded.closing_time_ar,is_open_late=excluded.is_open_late,
  is_24_hours=excluded.is_24_hours,avg_prep_minutes=excluded.avg_prep_minutes,tier=excluded.tier,price_tier=excluded.price_tier,
  signature_dish_ar=excluded.signature_dish_ar,signature_dish_en=excluded.signature_dish_en,vibe_tags_ar=excluded.vibe_tags_ar,
  vibe_tags_en=excluded.vibe_tags_en,rating=excluded.rating,platforms=excluded.platforms,links=excluded.links,city=excluded.city,
  primary_category=excluded.primary_category,secondary_categories=excluded.secondary_categories,subcategories=excluded.subcategories,
  category_fit_confidence=excluded.category_fit_confidence,category_fit_evidence=excluded.category_fit_evidence,editorial_role=excluded.editorial_role,
  reputation_tags=excluded.reputation_tags,context_tags=excluded.context_tags,context_tag_evidence=excluded.context_tag_evidence,
  business_type=excluded.business_type,operating_status=excluded.operating_status,brand_status_confidence=excluded.brand_status_confidence,
  verified_jeddah_branch_count=excluded.verified_jeddah_branch_count,branch_list_completeness=excluded.branch_list_completeness,
  meal_period_strength=excluded.meal_period_strength,serves_breakfast_menu=excluded.serves_breakfast_menu,dining_mode_summary=excluded.dining_mode_summary,
  price_position=excluded.price_position,estimated_sar_per_person_min=excluded.estimated_sar_per_person_min,
  estimated_sar_per_person_max=excluded.estimated_sar_per_person_max,official_website=excluded.official_website,
  official_instagram=excluded.official_instagram,official_tiktok=excluded.official_tiktok,trend_status=excluded.trend_status,
  trend_confidence=excluded.trend_confidence,overall_confidence=excluded.overall_confidence,research_use=excluded.research_use,
  last_verified_at=excluded.last_verified_at,menu_last_verified_at=excluded.menu_last_verified_at,
  manual_review_required=excluded.manual_review_required,manual_review_reasons=excluded.manual_review_reasons,intelligence_origin=excluded.intelligence_origin;

DO $$
DECLARE p jsonb := (SELECT payload FROM _burger_catalog);
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'section_1_brand_intelligence') brand ON old.restaurant_id=brand->>'brand_id_hint'
    WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p->'section_2_google_physical_branch_inventory') b WHERE b->'google_identity'->>'google_place_id'=old.google_place_id)
      AND (EXISTS (SELECT 1 FROM private.room_restaurant_deck_items i WHERE i.branch_id=old.id)
        OR EXISTS (SELECT 1 FROM public.delivery_platform_listings l WHERE l.matched_branch_id=old.id))
  ) THEN RAISE EXCEPTION 'A stale burger branch is referenced by a deck or delivery listing'; END IF;
END $$;

DELETE FROM public.restaurant_sources s USING _burger_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(c.payload->'section_1_brand_intelligence') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');
DELETE FROM public.restaurant_best_sellers s USING _burger_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(c.payload->'section_1_brand_intelligence') b);
DELETE FROM public.restaurant_branches old USING _burger_catalog c
WHERE old.restaurant_id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(c.payload->'section_1_brand_intelligence') b)
  AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(c.payload->'section_2_google_physical_branch_inventory') branch WHERE branch->'google_identity'->>'google_place_id'=old.google_place_id);

WITH catalog AS (SELECT payload FROM _burger_catalog), branches AS (
  SELECT b, brand->>'brand_id_hint' restaurant_id
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_2_google_physical_branch_inventory') b
  JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') brand ON brand->>'brand_name_en'=b->>'brand_name_en'
)
INSERT INTO public.restaurant_branches (
  restaurant_id,branch_name_ar,branch_name_en,branch_status,branch_status_confidence,branch_type,district,address_en,latitude,longitude,
  maps_business_name,google_place_id,maps_lookup_status,google_maps_url,google_rating,google_review_count,rating_source,
  maps_last_verified_at,place_last_synced_at,branch_identity_confidence,geographic_notes,last_verified_at,
  google_price_level,google_price_range_display
)
SELECT restaurant_id,b->>'branch_name_ar',b->>'branch_name_en','open',(b->'research'->>'identity_confidence')::public.intelligence_confidence,
  CASE WHEN b->>'branch_name_en'='King Abdulaziz International Airport' THEN 'airport'::public.branch_type ELSE 'unknown'::public.branch_type END,
  b->'location'->>'district_normalized',b->'location'->>'formatted_address',(b->'location'->>'latitude')::double precision,(b->'location'->>'longitude')::double precision,
  b->'google_identity'->>'google_business_name',b->'google_identity'->>'google_place_id','verified',b->'google_identity'->>'google_maps_url',
  (b->'google_reputation'->>'rating')::numeric,(b->'google_reputation'->>'review_count')::integer,'google_maps_direct',
  (b->'research'->>'last_verified')::timestamptz,(b->'google_reputation'->>'retrieved_at')::timestamptz,
  (b->'research'->>'identity_confidence')::public.intelligence_confidence,
  nullif(array_to_string(ARRAY(SELECT jsonb_array_elements_text(b->'research'->'notes')), E'\n'),''),
  (b->'research'->>'last_verified')::timestamptz,b->'google_price'->>'price_level',b->'google_price'->>'price_range_display'
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id=excluded.restaurant_id,branch_name_ar=excluded.branch_name_ar,branch_name_en=excluded.branch_name_en,
  branch_status=excluded.branch_status,branch_status_confidence=excluded.branch_status_confidence,branch_type=excluded.branch_type,
  district=excluded.district,address_ar=NULL,address_en=excluded.address_en,latitude=excluded.latitude,longitude=excluded.longitude,
  maps_business_name=excluded.maps_business_name,maps_lookup_status=excluded.maps_lookup_status,google_maps_url=excluded.google_maps_url,
  google_rating=excluded.google_rating,google_review_count=excluded.google_review_count,rating_source=excluded.rating_source,
  opening_hours=NULL,hours_last_verified_at=NULL,maps_last_verified_at=excluded.maps_last_verified_at,
  place_last_synced_at=excluded.place_last_synced_at,is_24_hours=NULL,late_night=NULL,dine_in=NULL,takeaway=NULL,
  google_delivery_indicator=NULL,branch_identity_confidence=excluded.branch_identity_confidence,
  geographic_notes=excluded.geographic_notes,last_verified_at=excluded.last_verified_at,
  google_price_level=excluded.google_price_level,google_price_range_display=excluded.google_price_range_display;

WITH catalog AS (SELECT payload FROM _burger_catalog), sellers AS (
  SELECT brand->>'brand_id_hint' restaurant_id,seller,ordinality-1 sort_order
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') brand
  CROSS JOIN LATERAL jsonb_array_elements(brand->'best_sellers') WITH ORDINALITY item(seller,ordinality)
)
INSERT INTO public.restaurant_best_sellers (restaurant_id,name_ar,name_en,is_signature,sort_order,confidence,evidence_summary,last_verified_at)
SELECT restaurant_id,seller->>'name_ar',seller->>'name_en',(seller->>'signature')::boolean,sort_order,
  (seller->>'confidence')::public.intelligence_confidence,'Certified dataset best seller',
  (SELECT max(last_verified_at) FROM public.restaurant_branches b WHERE b.restaurant_id=s.restaurant_id)
FROM sellers s;

WITH catalog AS (SELECT payload FROM _burger_catalog), branches AS (
  SELECT branch,brand->>'brand_id_hint' restaurant_id
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_2_google_physical_branch_inventory') branch
  JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') brand ON brand->>'brand_name_en'=branch->>'brand_name_en'
)
INSERT INTO public.restaurant_sources (restaurant_id,branch_id,source_type,source_url,supports,source_date,date_checked,evidence_quality,notes)
SELECT x.restaurant_id,b.id,'google_maps',x.branch->'google_identity'->>'google_maps_url',
  ARRAY['google_identity','location','business_status','google_reputation','google_price'],
  (x.branch->'google_reputation'->>'retrieved_at')::date,(x.branch->'research'->>'last_verified')::timestamptz,'strong_secondary','Exact Google Maps physical branch listing'
FROM branches x JOIN public.restaurant_branches b ON b.google_place_id=x.branch->'google_identity'->>'google_place_id';

WITH catalog AS (SELECT payload FROM _burger_catalog), brands AS (
  SELECT brand FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') brand
)
INSERT INTO public.restaurant_sources (restaurant_id,source_type,source_url,supports,date_checked,evidence_quality,notes)
SELECT brand->>'brand_id_hint','official_website',brand->'official_sources'->>'website',ARRAY['brand_identity','category','best_sellers'],
  (SELECT max(last_verified_at) FROM public.restaurant_branches b WHERE b.restaurant_id=brand->>'brand_id_hint'),'primary','Official brand website'
FROM brands WHERE brand->'official_sources'->>'website' IS NOT NULL;

WITH catalog AS (SELECT payload FROM _burger_catalog), seller_sources AS (
  SELECT brand->>'brand_id_hint' restaurant_id,seller,source_url
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'section_1_brand_intelligence') brand
  CROSS JOIN LATERAL jsonb_array_elements(brand->'best_sellers') seller
  CROSS JOIN LATERAL jsonb_array_elements_text(seller->'source_urls') source_url
)
INSERT INTO public.restaurant_sources (restaurant_id,best_seller_id,source_type,source_url,supports,date_checked,evidence_quality,notes)
SELECT x.restaurant_id,s.id,'official_menu',x.source_url,ARRAY['best_sellers'],
  (SELECT max(last_verified_at) FROM public.restaurant_branches b WHERE b.restaurant_id=x.restaurant_id),'primary','Dataset best-seller evidence'
FROM seller_sources x JOIN public.restaurant_best_sellers s ON s.restaurant_id=x.restaurant_id AND s.name_en=x.seller->>'name_en';

DO $$
DECLARE p jsonb := (SELECT payload FROM _burger_catalog);
BEGIN
  IF (SELECT count(*) FROM public.restaurants r WHERE r.id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(p->'section_1_brand_intelligence') b)) <> 10 THEN RAISE EXCEPTION 'Burger brand load failed'; END IF;
  IF (SELECT count(*) FROM public.restaurant_branches r WHERE r.restaurant_id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(p->'section_1_brand_intelligence') b)) <> 33 THEN RAISE EXCEPTION 'Burger branch load failed'; END IF;
  IF (SELECT count(*) FROM public.restaurant_best_sellers s WHERE s.restaurant_id IN (SELECT b->>'brand_id_hint' FROM jsonb_array_elements(p->'section_1_brand_intelligence') b)) <> 11 THEN RAISE EXCEPTION 'Burger best-seller load failed'; END IF;
END $$;

COMMIT;
