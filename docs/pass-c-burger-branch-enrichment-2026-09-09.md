# WeshNakul starter dataset — Pass C: burger branch enrichment

**Research date:** 2026-09-09  
**Scope:** Jeddah only; the ten brands specified by the research brief.  
**Method:** direct Google Maps business identities were checked branch by branch, then compared with current official branch pages and public delivery pages. A Google Maps feature identifier in a URL was not treated as a Google Place ID. Delivery-area labels were not treated as physical branches.

`null` means the fact was not safely established. Ratings and review counts are point-in-time snapshots. Every Maps field below is supported by the exact Maps URL stored in the same record.

## RESTAURANT — Section-B

Section-B's current official link page lists S Square, Tahlia, Hiraa, Obhur, and Al Faisaliyyah, and explicitly calls Al Faisaliyyah pickup/delivery only.[S1] The older official location page places Hiraa behind Jeddah Hilton.[S2]

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"S Square","branch_name_ar":null,"district_raw":"Ash Shati / S Square","district_normalized":"al_shati","recommended_new_district_id":null,"address_en":"3362 Hira St, Jeddah 23513","address_ar":null,"latitude":21.6060577,"longitude":39.1188028,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Section-B/@21.6060577,39.1188028,17z/data=!4m6!3m5!1s0x15c3da53adfb8b5d:0x5bd5725f269dbab!8m2!3d21.6060577!4d39.1188028!16s%2Fg%2F11bbt983kb","google_place_id":null,"google_rating":4.3,"google_review_count":13774,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Tahlia / Fayfa Avenue","branch_name_ar":null,"district_raw":"Tahlia, Fayfa Avenue","district_normalized":null,"recommended_new_district_id":null,"address_en":"Prince Sultan Rd, Fayfa Avenue, Jeddah","address_ar":null,"latitude":21.5498501,"longitude":39.1435337,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Section-B/@21.5498501,39.1435337,17z/data=!4m6!3m5!1s0x15c3c5cc7907fe21:0x3475ec1d56b2efef!8m2!3d21.5498501!4d39.1435337!16s%2Fg%2F11jyjbf09l","google_place_id":null,"google_rating":4.6,"google_review_count":6163,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Hiraa","branch_name_ar":null,"district_raw":"Hiraa Street / behind Jeddah Hilton","district_normalized":"al_shati","recommended_new_district_id":null,"address_en":"Hiraa St, Jeddah","address_ar":null,"latitude":21.6048265,"longitude":39.1162703,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Section-B/@21.6048265,39.1162703,17z/data=!4m6!3m5!1s0x15c3db0068541961:0xac429353820f26c5!8m2!3d21.6048265!4d39.1162703!16s%2Fg%2F11vptxxkjw","google_place_id":null,"google_rating":4.7,"google_review_count":2043,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Obhur","branch_name_ar":null,"district_raw":"Obhur","district_normalized":null,"recommended_new_district_id":null,"address_en":"Prince Abdullah Al Faisal St, Jeddah","address_ar":null,"latitude":21.717134,"longitude":39.0829822,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Section-B/@21.717134,39.0829822,17z/data=!4m6!3m5!1s0x15c3d9c3b35a2c71:0x23c57ff99f0a5318!8m2!3d21.717134!4d39.0829822!16s%2Fg%2F11k4_bszfx","google_place_id":null,"google_rating":4.4,"google_review_count":1486,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Faisaliyyah BOH","branch_name_ar":null,"district_raw":"Al Faisaliyyah","district_normalized":"al_faisaliyyah","recommended_new_district_id":null,"address_en":"Al Sururi St, Al Faisaliyyah, Jeddah","address_ar":null,"latitude":21.5811982,"longitude":39.1924063,"branch_status":"open","branch_type":"takeaway_only","dine_in":false,"pickup":true,"google_maps_url":"https://www.google.com/maps/place/Section-B+-+BOH/@21.5811982,39.1924063,17z/data=!4m6!3m5!1s0x15c3d100f176c87b:0xacb7839731e8dd8e!8m2!3d21.5811982!4d39.1924063!16s%2Fg%2F11sd9pyvpc","google_place_id":null,"google_rating":3.8,"google_review_count":433,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Al Murjan** — evidence: an older Section-B link-page resource described it as pickup/delivery only, but it is absent from the current visible Jeddah branch list and no exact current Maps identity was verified. **Decision:** `manual_review`; **confidence:** medium.
- **HungerStation “An Naeem”** — this is a delivery service-area label, not independent evidence of a physical branch. **Decision:** `reject` as a branch; **confidence:** high.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"Section-B","listing_url":"https://hungerstation.com/sa-en/restaurant/section-b/jeddah/an-naim/56474","service_area_or_label":"An Naim","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; label does not match a proven physical branch."},
  {"platform":"jahez","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result; this does not prove absence from the live app."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result; this does not prove absence from the live app."}
]
```

### D. Data Conflicts

The current official page supports Al Faisaliyyah but not Al Murjan. The delivery label “An Naim” conflicts with the proven physical-branch list, so it remains unmatched.

### E. Branch-Level Production Assessment

S Square, Tahlia, Hiraa, and Obhur are `production_ready`. Al Faisaliyyah is `usable_with_caution` because it is a BOH/pickup-delivery location rather than a normal dine-in branch. Al Murjan is `manual_review_only`.

## RESTAURANT — The California Burger

The three candidate identities resolve to three distinct Maps businesses. Hira Street is physically in Al Marwah and is corroborated by Waze.[S3]

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Khalidiyyah","branch_name_ar":null,"district_raw":"Al Khalidiyyah","district_normalized":"al_khalidiyyah","recommended_new_district_id":null,"address_en":"Prince Saud Al Faisal St, restaurant complex opposite Bupa, Jeddah","address_ar":null,"latitude":21.5587573,"longitude":39.1396798,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/%D9%83%D8%A7%D9%84%D9%8A%D9%81%D9%88%D8%B1%D9%86%D9%8A%D8%A7+%D8%A8%D8%B1%D8%AC%D8%B1/data=!4m7!3m6!1s0x15c3dab0d93ce56f:0x5593318f4c2c032d!8m2!3d21.5587573!4d39.1396798!16s%2Fg%2F11f3dnywtf","google_place_id":null,"google_rating":4.7,"google_review_count":9253,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Muhammadiyyah","branch_name_ar":null,"district_raw":"Al Muhammadiyyah","district_normalized":"al_mohammadiyyah","recommended_new_district_id":null,"address_en":"Prince Sultan Branch Rd, Al Muhammadiyyah, Jeddah","address_ar":null,"latitude":21.6669148,"longitude":39.1219788,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/%D9%83%D8%A7%D9%84%D9%8A%D9%81%D9%88%D8%B1%D9%86%D9%8A%D8%A7+%D8%A8%D8%B1%D8%AC%D8%B1/data=!4m7!3m6!1s0x15c3d9a4d7131469:0xa3ab9c0cfebf77b2!8m2!3d21.6669148!4d39.1219788!16s%2Fg%2F11c2pcgvf7","google_place_id":null,"google_rating":4.6,"google_review_count":8483,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Hira / Al Marwah","branch_name_ar":null,"district_raw":"Al Marwah, Hira St","district_normalized":"al_marwah","recommended_new_district_id":null,"address_en":"Hira St, opposite Mandarin Avenue, Al Marwah, Jeddah","address_ar":null,"latitude":21.6224516,"longitude":39.1991904,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/The+California+Burger+%7C+%D9%83%D8%A7%D9%84%D9%8A%D9%81%D9%88%D8%B1%D9%86%D9%8A%D8%A7+%D8%A8%D8%B1%D8%AC%D8%B1/data=!4m7!3m6!1s0x15c3d6d70e6b8257:0xe4ef3e8285b5bf71!8m2!3d21.6224516!4d39.1991904!16s%2Fg%2F11f547jk02","google_place_id":null,"google_rating":4.6,"google_review_count":4057,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"}
]
```

### B. Ambiguous / Rejected Branch Candidates

No candidate was merged. “Hira” and “Al Marwah” are two labels for the same confirmed branch, based on the exact Hira Street address and coordinates. **Decision:** `merge`; **confidence:** high.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"The California Burger","listing_url":"https://hungerstation.com/sa-en/restaurant/jeddah/jeddah-islamic-seaport/129104","service_area_or_label":"Jeddah Islamic Seaport","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing, but the service-area label matches none of the three physical branches."},
  {"platform":"jahez","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."}
]
```

### D. Data Conflicts

The HungerStation service-area label is geographically unrelated to the three verified storefronts and is not a fourth branch.

### E. Branch-Level Production Assessment

All three branches are `production_ready` for identity and geography. Dine-in and pickup flags remain nullable pending explicit amenity evidence.

## RESTAURANT — Century Burger

Century's current official directory supports six locations: Muhammadiyah, Rawdah, Red Sea Mall, Obhur Plaza, KAIA, and Jeddah Park.[S4] Official mall and airport pages independently confirm Red Sea Mall, Jeddah Park, and KAIA.[S5][S6][S7]

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Muhammadiyyah","branch_name_ar":null,"district_raw":"Al Muhammadiyyah","district_normalized":"al_mohammadiyyah","recommended_new_district_id":null,"address_en":"8099 Prince Sultan Branch Rd, Al Muhammadiyyah, Jeddah","address_ar":null,"latitude":21.6414789,"longitude":39.1302451,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.6414789,39.1302451,17z/data=!4m6!3m5!1s0x15c3d9db1cf7782b:0x3a9c5c118d5f60c3!8m2!3d21.6414789!4d39.1302451!16s%2Fg%2F11px86x1xk","google_place_id":null,"google_rating":4.3,"google_review_count":6551,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":{"daily":"11:00-04:00"},"hours_source":"official_website","hours_retrieved_at":"2026-09-09","hours_confidence":"high","retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Rawdah","branch_name_ar":null,"district_raw":"Al Rawdah","district_normalized":"al_rawdah","recommended_new_district_id":null,"address_en":"Prince Sultan Branch Rd, Al Rawdah, Jeddah","address_ar":null,"latitude":21.55499,"longitude":39.1432296,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.55499,39.1432296,17z/data=!4m6!3m5!1s0x15c3dab26ee9d72f:0x5e3d446705ec3b93!8m2!3d21.55499!4d39.1432296!16s%2Fg%2F11gzjcwl3","google_place_id":null,"google_rating":4.5,"google_review_count":20066,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":{"daily":"11:00-06:00"},"hours_source":"official_website","hours_retrieved_at":"2026-09-09","hours_confidence":"high","retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Red Sea Mall","branch_name_ar":null,"district_raw":"Red Sea Mall","district_normalized":"al_shati","recommended_new_district_id":null,"address_en":"Food Court, Red Sea Mall, King Abdulaziz Rd, Jeddah","address_ar":null,"latitude":21.6278698,"longitude":39.1112101,"branch_status":"open","branch_type":"food_court","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.6278698,39.1112101,17z/data=!4m6!3m5!1s0x15c3dbcd68edbbf7:0x30cd699f41c766de!8m2!3d21.6278698!4d39.1112101!16s%2Fg%2F11h9y5j798","google_place_id":null,"google_rating":4.1,"google_review_count":694,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":{"daily":"11:00-23:45"},"hours_source":"official_website","hours_retrieved_at":"2026-09-09","hours_confidence":"high","retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Obhur Plaza","branch_name_ar":null,"district_raw":"Obhur Al Shamaliyah / Obhur Plaza","district_normalized":"abhur_al_shamaliyah","recommended_new_district_id":null,"address_en":"Obhur Plaza, Aber Al Qarat St, Jeddah","address_ar":null,"latitude":21.7627605,"longitude":39.1142786,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.7627605,39.1142786,17z/data=!4m6!3m5!1s0x15c163845e7e60d5:0xc4cf41bf9fadc794!8m2!3d21.7627605!4d39.1142786!16s%2Fg%2F11p4nzmfmz","google_place_id":null,"google_rating":4.1,"google_review_count":684,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":{"daily":"11:00-04:00"},"hours_source":"official_website","hours_retrieved_at":"2026-09-09","hours_confidence":"high","retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"King Abdulaziz International Airport","branch_name_ar":null,"district_raw":"King Abdulaziz International Airport","district_normalized":null,"recommended_new_district_id":"king_abdulaziz_international_airport","address_en":"King Abdulaziz International Airport, Jeddah 21442","address_ar":null,"latitude":21.6620427,"longitude":39.1733833,"branch_status":"open","branch_type":"airport","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.6620427,39.1733833,17z/data=!4m6!3m5!1s0x15c3d7662eca0e5f:0xc54e4dfb338df744!8m2!3d21.6620427!4d39.1733833!16s%2Fg%2F11fkl9tdgj","google_place_id":null,"google_rating":4.0,"google_review_count":490,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"medium","opening_hours":{"daily":"24 hours"},"hours_source":"official_or_current_publication","hours_retrieved_at":"2026-09-09","hours_confidence":"medium","retrieved_at":"2026-09-09","production_state":"usable_with_caution"},
  {"branch_name_en":"Jeddah Park","branch_name_ar":null,"district_raw":"Jeddah Park / Al Aziziyah","district_normalized":null,"recommended_new_district_id":"al_aziziyah","address_en":"Level 0, Jeddah Park, Al Aziziyah, Jeddah","address_ar":null,"latitude":21.5577229,"longitude":39.1850956,"branch_status":"open","branch_type":"food_court","dine_in":true,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.5577229,39.1850956,17z/data=!4m6!3m5!1s0x15c3d1f2ab52884d:0xce91153b5e837b29!8m2!3d21.5577229!4d39.1850956!16s%2Fg%2F11sc7ywqb5","google_place_id":null,"google_rating":4.6,"google_review_count":5904,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":{"daily":"11:00-04:00"},"hours_source":"official_website","hours_retrieved_at":"2026-09-09","hours_confidence":"high","retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Fayha","branch_name_ar":null,"district_raw":"Al Fayha","district_normalized":"al_faiha","recommended_new_district_id":null,"address_en":"6782 Abdullah Suleiman Branch St, Al Fayha, Jeddah","address_ar":null,"latitude":21.4891967,"longitude":39.225325,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Century+Burger/@21.4891967,39.225325,17z/data=!4m6!3m5!1s0x15c3cf0007061731:0x9888eec51e4940fc!8m2!3d21.4891967!4d39.225325!16s%2Fg%2F11whh7kq78","google_place_id":null,"google_rating":4.5,"google_review_count":2790,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"medium","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Airport terminal identity** — official KAIA confirms the restaurant but does not state a terminal on the public page. **Decision:** retain with terminal `null`; **confidence:** medium.
- **Al Fayha** — current direct Maps identity is active, but the current Century directory omits it. **Decision:** retain; **confidence:** medium; require a later first-party status recheck.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"Century Burger","listing_url":"https://hungerstation.com/sa-en/restaurant/jeddah/ar-rahmanyah/5523","service_area_or_label":"Ar Rahmanyah","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; the label is not one of the seven verified branches."},
  {"platform":"jahez","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."}
]
```

### D. Data Conflicts

Al Fayha is present as a current Maps business but absent from the current official branch list. Maps is stronger for current physical existence; the omission prevents a high-confidence operating-status conclusion. The official site says the airport branch is 24 hours but does not establish the terminal.

### E. Branch-Level Production Assessment

Muhammadiyyah, Rawdah, Red Sea Mall, Obhur Plaza, and Jeddah Park are `production_ready`. Airport and Al Fayha are `usable_with_caution`.

## RESTAURANT — Chef’s Homemade Burger Gourmet

The current official Linktree lists Sari Road, Prince Sultan Road, and Al Ruwais.[S8] The operator page corroborates three Jeddah locations but labels the first two by nearby districts rather than roads.[S9]

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Sari Road","branch_name_ar":null,"district_raw":"Sari Road","district_normalized":null,"recommended_new_district_id":null,"address_en":"Sari Road, Jeddah","address_ar":null,"latitude":21.5731048,"longitude":39.1370841,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Chef's+Homemade+Burger+Gourmet/@21.5731048,39.1370841,17z/data=!4m6!3m5!1s0x15c3db3479b8a301:0x8a94af6044ce0ccc!8m2!3d21.5731048!4d39.1370841!16s%2Fg%2F11q1pl2wdt","google_place_id":null,"google_rating":4.6,"google_review_count":9911,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Prince Sultan Road","branch_name_ar":null,"district_raw":"Al Muhammadiyyah / Prince Sultan Road","district_normalized":"al_mohammadiyyah","recommended_new_district_id":null,"address_en":"Prince Sultan Branch Rd, Al Muhammadiyyah, Jeddah","address_ar":null,"latitude":21.646264,"longitude":39.128461,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Chef's+Homemade+Burger+Gourmet/@21.646264,39.128461,17z/data=!4m6!3m5!1s0x15c3d976ffd53e9f:0xe0f2c39854bad81a!8m2!3d21.646264!4d39.128461!16s%2Fg%2F11h23_9d2_","google_place_id":null,"google_rating":4.3,"google_review_count":11636,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Ruwais","branch_name_ar":null,"district_raw":"Al Ruwais","district_normalized":null,"recommended_new_district_id":"al_ruwais","address_en":"King Abdullah Branch Rd, Al Ruwais, Jeddah","address_ar":null,"latitude":21.5109116,"longitude":39.1815989,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Chef's+Homemade+Burger+Gourmet/@21.5109116,39.1815989,17z/data=!4m6!3m5!1s0x15c3cf6a8e835ba3:0x85b3e394f44d446e!8m2!3d21.5109116!4d39.1815989!16s%2Fg%2F11qg937w03","google_place_id":null,"google_rating":4.5,"google_review_count":5493,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Generic “Chef” Corniche result** — the identity does not reliably resolve to Chef’s Homemade Burger Gourmet. **Decision:** `reject`; **confidence:** high.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"Chef's Burger","listing_url":"https://hungerstation.com/sa-en/restaurants/regions/jeddah/mushrefa/chefs-burger-54102","service_area_or_label":"Mushrefa","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; Mushrefa does not establish a match to the three official branches."},
  {"platform":"jahez","listing_name":"Chef's Burger","listing_url":null,"service_area_or_label":null,"status":"probable","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"A secondary tourism page reports brand-level Jahez availability, without a branch identity."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."}
]
```

### D. Data Conflicts

The operator calls the Prince Sultan location “Muhamadeya” and the Sari-area location “Zahra”; the current official link page uses road names. The exact Maps identities resolve the physical locations, so the report preserves roads plus the independently supported Muhammadiyyah district and does not guess a district for Sari Road.

### E. Branch-Level Production Assessment

All three physical branches are `production_ready` for identity and geography.

## RESTAURANT — Sign Burger

The official directory exposes nine raw Jeddah rows, including two near-identical Al Thaghr/Abdullah Suleiman records.[S10] Direct Maps research resolves six current businesses; official-only Al Zahra and Al Balad remain valid candidates with thinner enrichment.

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Abhur Al Shamaliyah","branch_name_ar":null,"district_raw":"Abhur Al Shamaliyah","district_normalized":"abhur_al_shamaliyah","recommended_new_district_id":null,"address_en":"Aber Al Qarat St, Abhur Al Shamaliyah, Jeddah","address_ar":null,"latitude":21.7553408,"longitude":39.1210114,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.7553408,39.1210114,17z/data=!4m6!3m5!1s0x15c1630013fe905f:0xd4c6ffb97eb2df42!8m2!3d21.7553408!4d39.1210114!16s%2Fg%2F11w_zkfd4y","google_place_id":null,"google_rating":4.7,"google_review_count":2803,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Thaghr / Abdullah Suleiman","branch_name_ar":null,"district_raw":"Al Thaghr / KAU area","district_normalized":null,"recommended_new_district_id":"al_thaghr","address_en":"5229 Abdullah Suleiman St, Al Thaghr, Jeddah","address_ar":null,"latitude":21.4829241,"longitude":39.2387763,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.4829241,39.2387763,17z/data=!4m6!3m5!1s0x15c3cd001939745d:0x812ae5005d4b998c!8m2!3d21.4829241!4d39.2387763!16s%2Fg%2F11xybs61qx","google_place_id":null,"google_rating":4.7,"google_review_count":3546,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Zahra","branch_name_ar":null,"district_raw":"Al Zahra","district_normalized":"al_zahra","recommended_new_district_id":null,"address_en":"King Abdulaziz Road area, Al Zahra, Jeddah","address_ar":null,"latitude":null,"longitude":null,"branch_status":"unknown","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":null,"google_place_id":null,"google_rating":null,"google_review_count":null,"rating_source":null,"maps_lookup_status":"not_verified","branch_identity_confidence":"medium","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"},
  {"branch_name_en":"Corniche","branch_name_ar":null,"district_raw":"Corniche","district_normalized":null,"recommended_new_district_id":"al_corniche","address_en":"Corniche Branch Rd, Jeddah","address_ar":null,"latitude":21.5928661,"longitude":39.1058653,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.5928661,39.1058653,17z/data=!4m6!3m5!1s0x15c3db0ea12c1959:0xd4ba223f8f076c29!8m2!3d21.5928661!4d39.1058653!16s%2Fg%2F11ykm4fp5n","google_place_id":null,"google_rating":4.3,"google_review_count":287,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Balad","branch_name_ar":null,"district_raw":"Al Balad","district_normalized":null,"recommended_new_district_id":"al_balad","address_en":"Al Balad, Jeddah","address_ar":null,"latitude":null,"longitude":null,"branch_status":"unknown","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":null,"google_place_id":null,"google_rating":null,"google_review_count":null,"rating_source":null,"maps_lookup_status":"not_verified","branch_identity_confidence":"medium","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"},
  {"branch_name_en":"Al Hamdaniyah","branch_name_ar":null,"district_raw":"Al Hamdaniyah","district_normalized":null,"recommended_new_district_id":"al_hamdaniyah","address_en":"Q54W+QQ5, Al Hamdaniyah, Jeddah","address_ar":null,"latitude":21.7580092,"longitude":39.1972303,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.7580092,39.1972303,17z/data=!4m6!3m5!1s0x15c17d4cda9e6379:0x5b065196574468ea!8m2!3d21.7580092!4d39.1972303!16s%2Fg%2F11x1ljq4xw","google_place_id":null,"google_rating":4.8,"google_review_count":5712,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Bawadi","branch_name_ar":null,"district_raw":"Al Bawadi","district_normalized":"al_bawadi","recommended_new_district_id":null,"address_en":"King Fahd Rd, Al Bawadi, Jeddah","address_ar":null,"latitude":21.6078028,"longitude":39.1689496,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.6078028,39.1689496,17z/data=!4m6!3m5!1s0x15c3d1357503c231:0xb26395ce351a76d7!8m2!3d21.6078028!4d39.1689496!16s%2Fg%2F11l5f70c16","google_place_id":null,"google_rating":4.6,"google_review_count":17266,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Muhammadiyyah / Prince Sultan","branch_name_ar":null,"district_raw":"Al Muhammadiyyah","district_normalized":"al_mohammadiyyah","recommended_new_district_id":null,"address_en":"Prince Sultan Branch Rd, near Royal Pavilion, Al Muhammadiyyah, Jeddah","address_ar":null,"latitude":21.6588716,"longitude":39.1235101,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/Sign+Burger/@21.6588716,39.1235101,17z/data=!4m6!3m5!1s0x15c3d9356d38eb03:0xf734769b350b82fa!8m2!3d21.6588716!4d39.1235101!16s%2Fg%2F11l371jddx","google_place_id":null,"google_rating":4.6,"google_review_count":15220,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Record A:** `Al Thaghr / KAU area — JIJB5237`.
- **Record B:** `Al Thaghr / Abdullah Suleiman — JIJB5227`.
- **Reason they match:** same district, same Abdullah Suleiman corridor, near-identical government short-code/building identity, and only one exact direct Maps business at 5229 Abdullah Suleiman.
- **Final canonical branch:** `Al Thaghr / Abdullah Suleiman`; **decision:** `merge`; **confidence:** high.

### C. Delivery Listings

No branch-resolvable public HungerStation, Jahez, or Keeta listing was found. Each platform remains `not_found`, with `matched_physical_branch=null` and `branch_match_confidence=unmatched`; this does not assert absence from the live apps.

### D. Data Conflicts

The official directory contains duplicate/near-duplicate Al Thaghr rows and poor labels. Direct Maps resolves a single physical location. Al Zahra and Al Balad remain official-directory identities without current direct Maps enrichment.

### E. Branch-Level Production Assessment

The six Maps-verified branches are `production_ready`. Al Zahra and Al Balad are `usable_with_caution`. The duplicate Al Thaghr row is `rejected` after merge.

## RESTAURANT — Nora Burger / Nora Smash Burger

Nora's official branch page and its operator page both list exactly Rawdah and Abhur in Jeddah.[S11][S12] They do not list Muhammadiyyah.

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Rawdah","branch_name_ar":"نورا سماش برجر","district_raw":"Al Rawdah","district_normalized":"al_rawdah","recommended_new_district_id":null,"address_en":"Imam Malik, Al Rawdah, Jeddah","address_ar":null,"latitude":21.5727624,"longitude":39.154183,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":true,"google_maps_url":"https://www.google.com/maps/place/Nora+Smash+Burger+-+%D9%86%D9%88%D8%B1%D8%A7+%D8%B3%D9%85%D8%A7%D8%B4+%D8%A8%D8%B1%D8%AC%D8%B1/@21.5724625,39.1541406,15z/data=!4m6!3m5!1s0x15c3db0070e44bcd:0x2b98765f23d01c76!8m2!3d21.5727624!4d39.154183!16s%2Fg%2F11w3k87w5r","google_place_id":null,"google_rating":4.1,"google_review_count":2174,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Abhur","branch_name_ar":"نورا سماش برجر","district_raw":"Abhur","district_normalized":null,"recommended_new_district_id":null,"address_en":"King Abdulaziz Branch Rd, Jeddah","address_ar":null,"latitude":null,"longitude":null,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":true,"google_maps_url":"https://maps.app.goo.gl/kRAnnGDQM2RnyjGK8","google_place_id":null,"google_rating":4.8,"google_review_count":528,"rating_source":"google_derived_secondary","maps_lookup_status":"ambiguous","branch_identity_confidence":"medium","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"}
]
```

The Abhur rating/count is secondary Google-derived, not direct Maps.[S13]

### B. Ambiguous / Rejected Branch Candidates

- **Al Muhammadiyyah** — a structured third-party listing is not independently corroborated by either current first-party branch source or a distinct exact Maps identity. **Decision:** `manual_review`; **confidence:** low.
- **Abhur district label** — the official branch link resolves to the stored coordinates, but those coordinates create tension with the broad “Abhur” label. **Decision:** retain branch identity, leave normalized district `null`; **confidence:** medium.

### C. Delivery Listings

The official operator page says delivery apps are available but exposes no HungerStation, Jahez, or Keeta branch identity.[S12] All three platforms remain `unknown`, unmatched, and have no public branch URL.

### D. Data Conflicts

Official sources exclude Muhammadiyyah, so the third-party candidate cannot be promoted. The Abhur label/coordinates conflict should be checked once more in the Google Maps UI before SQL.

### E. Branch-Level Production Assessment

Rawdah is `production_ready`. Abhur is `usable_with_caution`. Muhammadiyyah is `manual_review_only`.

## RESTAURANT — WBJ

WBJ's official branch page links exactly Hamdaniyah, Abhur, and Zahra.[S14] The Abhur Maps address explicitly resolves to Abhur Al Janoubiyah.

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Hamdaniyah","branch_name_ar":null,"district_raw":"Al Hamdaniyah","district_normalized":null,"recommended_new_district_id":"al_hamdaniyah","address_en":"4161 Al Hamdaniyah Branch St, Al Hamdaniyah, Jeddah 23761","address_ar":null,"latitude":21.7582831,"longitude":39.1981764,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/WBJ+RESTAURANT/@21.7582831,39.1981764,17z/data=!4m6!3m5!1s0x15c17d0023a881e5:0xe92fc3df2251f705!8m2!3d21.7582831!4d39.1981764!16s%2Fg%2F11z3_q0xpd","google_place_id":null,"google_rating":4.9,"google_review_count":1107,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Abhur","branch_name_ar":null,"district_raw":"Abhur Al Janoubiyah","district_normalized":"abhur_al_janoubiyah","recommended_new_district_id":null,"address_en":"2281 King Abdulaziz Rd, Abhur Al Janoubiyah, Jeddah 23734","address_ar":null,"latitude":21.7509304,"longitude":39.134722,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/WBJ+restaurant/@21.7509304,39.134722,17z/data=!4m6!3m5!1s0x15c163003c41a387:0x90e5672892ea9ed8!8m2!3d21.7509304!4d39.134722!16s%2Fg%2F11mm6tv2m6","google_place_id":null,"google_rating":4.8,"google_review_count":1895,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Zahra","branch_name_ar":null,"district_raw":"Al Zahra","district_normalized":"al_zahra","recommended_new_district_id":null,"address_en":"6398 Prince Sultan Rd, Al Zahra, Jeddah 23521","address_ar":null,"latitude":21.5934114,"longitude":39.1435025,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://maps.app.goo.gl/Nj7bUk2Wxj46ik6e8?g_st=com.google.maps.preview.copy","google_place_id":null,"google_rating":4.5,"google_review_count":6041,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"}
]
```

### B. Ambiguous / Rejected Branch Candidates

No duplicate branch was found. **WBJ Abhur = Abhur Al Janoubiyah** with high confidence from its exact Maps address.

### C. Delivery Listings

A recent public Maps review for Zahra mentions HungerStation ordering, which supports brand/platform presence but is not a direct listing and does not prove a branch mapping. HungerStation is `probable`, Zahra match confidence is `medium`, listing URL is `null`; Jahez and Keeta are `not_found` and unmatched.

### D. Data Conflicts

The official page calls the branch simply “Abhur”; Maps supplies the more precise Abhur Al Janoubiyah district. There is no substantive conflict.

### E. Branch-Level Production Assessment

All three WBJ branches are `production_ready`; the official Zahra Maps identity resolves to exact coordinates.

## RESTAURANT — Lou Burger

Current direct Maps and recent local coverage corroborate Al Andalus.[S15][S16] No independent current evidence was found for Al Shera'a.

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Andalus","branch_name_ar":"لو برجر","district_raw":"Al Andalus","district_normalized":"al_andalus","recommended_new_district_id":null,"address_en":"Al Khayat Centre 2, Abdullah Al Matari, Al Andalus, Jeddah","address_ar":null,"latitude":21.547443,"longitude":39.1495432,"branch_status":"open","branch_type":"full_dine_in","dine_in":true,"pickup":true,"google_maps_url":"https://www.google.com/maps/place/Lou+Burger/@21.547443,39.1495432,17z/data=!4m6!3m5!1s0x15c3c5004e873f53:0xe9f6ad6d2a7f4ef8!8m2!3d21.547443!4d39.1495432!16s%2Fg%2F11vsw7sqm0","google_place_id":null,"google_rating":4.7,"google_review_count":4159,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Al Shera'a** — no exact Maps identity or independent current first-party corroboration was found. The district must not be forced into the whitelist. **Decision:** `manual_review`; **confidence:** low.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"Lou Burger","listing_url":"https://hungerstation.com/sa-en/restaurant/jeddah/jeddah-islamic-seaport/118308","service_area_or_label":"Jeddah Islamic Seaport","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; service-area label does not prove Al Andalus or Al Shera'a."},
  {"platform":"jahez","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."}
]
```

### D. Data Conflicts

The current evidence strongly supports Al Andalus but does not support promoting Al Shera'a. The HungerStation Seaport label is a service area, not a physical branch.

### E. Branch-Level Production Assessment

Al Andalus is `production_ready`. Al Shera'a is `manual_review_only`.

## RESTAURANT — PPLR

PPLR has a strong direct Maps identity in Rawdah, but public first-party branch evidence remains thin, matching the Pass B concern.

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Rawdah","branch_name_ar":"ببلر","district_raw":"Al Rawdah","district_normalized":"al_rawdah","recommended_new_district_id":null,"address_en":"Abdulsamad Khoja, Al Rawdah, Jeddah","address_ar":null,"latitude":21.5732069,"longitude":39.1481774,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/PPLR/@21.5732069,39.1481774,17z/data=!4m6!3m5!1s0x15c3db001d2890a3:0x42c413c119754dcb!8m2!3d21.5732069!4d39.1481774!16s%2Fg%2F11mrhlykq3","google_place_id":null,"google_rating":4.6,"google_review_count":524,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"usable_with_caution"}
]
```

### B. Ambiguous / Rejected Branch Candidates

No additional branch candidate was found.

### C. Delivery Listings

No branch-resolvable public HungerStation, Jahez, or Keeta listing was found. Each remains `not_found`, unmatched, with no listing URL.

### D. Data Conflicts

No branch conflict was found. The remaining weakness is source diversity: Maps is strong, but current public first-party branch documentation is thin.

### E. Branch-Level Production Assessment

Rawdah remains `usable_with_caution`; this pass does not promote the brand merely because Maps enrichment succeeded.

## RESTAURANT — Smash Me

The brand's official site identifies Prince Sultan/Al Naeem as its first Jeddah branch and Qassem Zeinah/Rawdah as the second location.[S17] A current local report states Rawdah is open.[S18]

### A. Confirmed Physical Branches

```json
[
  {"branch_name_en":"Al Naeem","branch_name_ar":"سماش مي","district_raw":"Al Naeem","district_normalized":"al_naeem","recommended_new_district_id":null,"address_en":"Prince Sultan Branch Rd, Al Naeem, Jeddah 23526","address_ar":null,"latitude":21.615326,"longitude":39.13984,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":"https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B4+%D9%85%D9%8A%E2%80%AD/@21.615326,39.13984,17z/data=!4m6!3m5!1s0x15c3db007c8a30a5:0x137d8d359aa957d8!8m2!3d21.615326!4d39.13984!16s%2Fg%2F11x2559s1r","google_place_id":null,"google_rating":4.6,"google_review_count":648,"rating_source":"google_maps_direct","maps_lookup_status":"verified","branch_identity_confidence":"high","opening_hours":null,"hours_source":null,"hours_retrieved_at":null,"hours_confidence":null,"retrieved_at":"2026-09-09","production_state":"production_ready"},
  {"branch_name_en":"Al Rawdah","branch_name_ar":"سماش مي","district_raw":"Al Rawdah / Qassem Zeinah","district_normalized":"al_rawdah","recommended_new_district_id":null,"address_en":"Qassem Zeinah St, Al Rawdah, Jeddah","address_ar":null,"latitude":null,"longitude":null,"branch_status":"open","branch_type":"unknown","dine_in":null,"pickup":null,"google_maps_url":null,"google_place_id":null,"google_rating":null,"google_review_count":null,"rating_source":null,"maps_lookup_status":"not_verified","branch_identity_confidence":"high","opening_hours":{"daily":"24 hours"},"hours_source":"official_or_current_publication","hours_retrieved_at":"2026-09-09","hours_confidence":"medium","retrieved_at":"2026-09-09","production_state":"usable_with_caution"}
]
```

### B. Ambiguous / Rejected Branch Candidates

- **Ar Rawdah delivery label** — merge conceptually with the independently proven Rawdah physical branch; the delivery row itself still remains unmatched until it exposes address identity. **Decision:** `merge` as a name candidate, no delivery-to-branch match; **confidence:** medium.
- **Jeddah Islamic Seaport** — delivery service area only. **Decision:** `reject` as a branch; **confidence:** high.
- **Al Marwah** — delivery service area only. **Decision:** `reject` as a branch; **confidence:** high.

### C. Delivery Listings

```json
[
  {"platform":"hungerstation","listing_name":"Smash Me","listing_url":"https://hungerstation.com/sa-en/restaurant/jeddah/jeddah-islamic-seaport/148710","service_area_or_label":"Jeddah Islamic Seaport","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; service-area label is not a physical branch."},
  {"platform":"hungerstation","listing_name":"Smash Me","listing_url":"https://hungerstation.com/sa-en/restaurant/jeddah/al-marwah/147683","service_area_or_label":"Al Marwah","status":"verified","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"Direct public listing; no independent Al Marwah storefront."},
  {"platform":"jahez","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."},
  {"platform":"keeta","listing_name":null,"listing_url":null,"service_area_or_label":null,"status":"not_found","matched_physical_branch":null,"branch_match_confidence":"unmatched","evidence":"No branch-resolvable public result."}
]
```

### D. Data Conflicts

Older first-party wording described Rawdah as upcoming; current reporting says it is open. The newer status is preferred. HungerStation's Seaport and Marwah labels do not create physical branches.

### E. Branch-Level Production Assessment

Al Naeem is `production_ready`. Rawdah is `usable_with_caution` until exact direct Maps identity and coordinates are captured.

## FINAL MASTER BRANCH TABLE

| Brand | Branch | District | Maps Verified | Coordinates | Rating | Reviews | Dine-in | Branch Status | Confidence | Production State |
|---|---|---|---:|---|---:|---:|---|---|---|---|
| Section-B | S Square | al_shati | Yes | 21.6060577, 39.1188028 | 4.3 | 13,774 | true | open | high | production_ready |
| Section-B | Tahlia / Fayfa Avenue | unmapped | Yes | 21.5498501, 39.1435337 | 4.6 | 6,163 | true | open | high | production_ready |
| Section-B | Hiraa | al_shati | Yes | 21.6048265, 39.1162703 | 4.7 | 2,043 | true | open | high | production_ready |
| Section-B | Obhur | unmapped | Yes | 21.7171340, 39.0829822 | 4.4 | 1,486 | true | open | high | production_ready |
| Section-B | Al Faisaliyyah BOH | al_faisaliyyah | Yes | 21.5811982, 39.1924063 | 3.8 | 433 | false | open | high | usable_with_caution |
| California Burger | Al Khalidiyyah | al_khalidiyyah | Yes | 21.5587573, 39.1396798 | 4.7 | 9,253 | null | open | high | production_ready |
| California Burger | Al Muhammadiyyah | al_mohammadiyyah | Yes | 21.6669148, 39.1219788 | 4.6 | 8,483 | null | open | high | production_ready |
| California Burger | Hira / Al Marwah | al_marwah | Yes | 21.6224516, 39.1991904 | 4.6 | 4,057 | null | open | high | production_ready |
| Century Burger | Al Muhammadiyyah | al_mohammadiyyah | Yes | 21.6414789, 39.1302451 | 4.3 | 6,551 | null | open | high | production_ready |
| Century Burger | Al Rawdah | al_rawdah | Yes | 21.5549900, 39.1432296 | 4.5 | 20,066 | null | open | high | production_ready |
| Century Burger | Red Sea Mall | al_shati | Yes | 21.6278698, 39.1112101 | 4.1 | 694 | true | open | high | production_ready |
| Century Burger | Obhur Plaza | abhur_al_shamaliyah | Yes | 21.7627605, 39.1142786 | 4.1 | 684 | null | open | high | production_ready |
| Century Burger | KAIA | proposed airport id | Yes | 21.6620427, 39.1733833 | 4.0 | 490 | null | open | medium | usable_with_caution |
| Century Burger | Jeddah Park | proposed al_aziziyah | Yes | 21.5577229, 39.1850956 | 4.6 | 5,904 | true | open | high | production_ready |
| Century Burger | Al Fayha | al_faiha | Yes | 21.4891967, 39.2253250 | 4.5 | 2,790 | null | open | medium | usable_with_caution |
| Chef's | Sari Road | unmapped | Yes | 21.5731048, 39.1370841 | 4.6 | 9,911 | null | open | high | production_ready |
| Chef's | Prince Sultan Road | al_mohammadiyyah | Yes | 21.6462640, 39.1284610 | 4.3 | 11,636 | null | open | high | production_ready |
| Chef's | Al Ruwais | proposed al_ruwais | Yes | 21.5109116, 39.1815989 | 4.5 | 5,493 | null | open | high | production_ready |
| Sign Burger | Abhur Al Shamaliyah | abhur_al_shamaliyah | Yes | 21.7553408, 39.1210114 | 4.7 | 2,803 | null | open | high | production_ready |
| Sign Burger | Al Thaghr / Abdullah Suleiman | proposed al_thaghr | Yes | 21.4829241, 39.2387763 | 4.7 | 3,546 | null | open | high | production_ready |
| Sign Burger | Al Zahra | al_zahra | No | null | null | null | null | unknown | medium | usable_with_caution |
| Sign Burger | Corniche | proposed al_corniche | Yes | 21.5928661, 39.1058653 | 4.3 | 287 | null | open | high | production_ready |
| Sign Burger | Al Balad | proposed al_balad | No | null | null | null | null | unknown | medium | usable_with_caution |
| Sign Burger | Al Hamdaniyah | proposed al_hamdaniyah | Yes | 21.7580092, 39.1972303 | 4.8 | 5,712 | null | open | high | production_ready |
| Sign Burger | Al Bawadi | al_bawadi | Yes | 21.6078028, 39.1689496 | 4.6 | 17,266 | null | open | high | production_ready |
| Sign Burger | Al Muhammadiyyah | al_mohammadiyyah | Yes | 21.6588716, 39.1235101 | 4.6 | 15,220 | null | open | high | production_ready |
| Nora Burger | Al Rawdah | al_rawdah | Yes | 21.5727624, 39.1541830 | 4.1 | 2,174 | true | open | high | production_ready |
| Nora Burger | Abhur | unmapped | Ambiguous | null | 4.8 secondary | 528 secondary | null | open | medium | usable_with_caution |
| WBJ | Al Hamdaniyah | proposed al_hamdaniyah | Yes | 21.7582831, 39.1981764 | 4.9 | 1,107 | null | open | high | production_ready |
| WBJ | Abhur | abhur_al_janoubiyah | Yes | 21.7509304, 39.1347220 | 4.8 | 1,895 | null | open | high | production_ready |
| WBJ | Al Zahra | al_zahra | Yes | 21.5934114, 39.1435025 | 4.5 | 6,041 | null | open | high | production_ready |
| Lou Burger | Al Andalus | al_andalus | Yes | 21.5474430, 39.1495432 | 4.7 | 4,159 | true | open | high | production_ready |
| PPLR | Al Rawdah | al_rawdah | Yes | 21.5732069, 39.1481774 | 4.6 | 524 | true | open | high | usable_with_caution |
| Smash Me | Al Naeem | al_naeem | Yes | 21.6153260, 39.1398400 | 4.6 | 648 | true | open | high | production_ready |
| Smash Me | Al Rawdah | al_rawdah | No | null | null | null | null | open | high | usable_with_caution |

## FINAL COUNTS

| Measure | Count |
|---|---:|
| Total brands researched | 10 |
| Total raw branch candidates | 42 |
| Confirmed unique physical branches | 35 |
| Production-ready branches | 27 |
| Usable-with-caution branches | 8 |
| Manual-review branch candidates | 3 |
| Rejected/duplicate raw records | 4 |
| Branches with exact coordinates | 31 |
| Branches with direct Maps URLs | 32 |
| Branches with direct Google ratings/review counts | 31 |
| HungerStation listings verified | 7 listing pages across 6 brands |
| Jahez listings verified | 0 |
| Keeta listings verified | 0 |
| Delivery listings safely matched to physical branches | 0 |
| Unmatched verified delivery listings | 7 |

The 42 raw-candidate count follows the supplied candidate set: 6 + 3 + 7 + 3 + 9 + 3 + 3 + 2 + 1 + 5. The four rejected/duplicate records are the second Sign Al Thaghr row and the three Smash delivery labels when evaluated as physical-branch candidates; Rawdah is merged into the confirmed Rawdah identity, while Seaport and Marwah are rejected as branches.

## SQL-READINESS AUDIT

| Brand | Ready for SQL | Blocker or condition |
|---|---|---|
| Section-B | YES | Insert five confirmed branches; preserve null district for Tahlia/Obhur as needed; hold Al Murjan. |
| The California Burger | YES | Three distinct physical branches have exact Maps identities and coordinates. |
| Century Burger | YES | Insert five ready branches; Airport and Fayha are safe with caution flags and explanatory notes. |
| Chef’s Homemade Burger Gourmet | YES | Three official, exact Maps-resolved branches; Sari district may remain null. |
| Sign Burger | PARTIAL | Six enriched branches are ready; Zahra/Balad are safe with nulls; merge duplicate Al Thaghr row. |
| Nora Burger | PARTIAL | Rawdah is ready; Abhur needs district/coordinate reconciliation; hold Muhammadiyyah. |
| WBJ | YES | All three identities have official links and direct Maps coordinates. |
| Lou Burger | PARTIAL | Al Andalus is ready; hold Al Shera'a. |
| PPLR | PARTIAL | Rawdah is safe with `usable_with_caution`; first-party evidence remains thin. |
| Smash Me | PARTIAL | Al Naeem is ready; Rawdah is safe with null enrichment; delivery labels remain unmatched. |

### READY FOR SQL

The 27 `production_ready` rows in the master table have sufficient identity and status evidence. Where `dine_in` or `pickup` is `null`, preserve it as `null`.

### SAFE TO INSERT WITH NULLS

The eight `usable_with_caution` rows are legitimate physical identities, but carry a documented limitation: Section-B Al Faisaliyyah; Century KAIA and Al Fayha; Sign Al Zahra and Al Balad; Nora Abhur; PPLR Rawdah; Smash Me Rawdah.

### HOLD FOR MANUAL REVIEW

Section-B Al Murjan, Nora Al Muhammadiyyah, and Lou Burger Al Shera'a. Do not insert the duplicate Sign Al Thaghr directory row or promote any delivery-area label to a branch.

## Delivery-research limitation

Public web indexing is much weaker than live, location-scoped delivery-app search. `not_found` for Jahez or Keeta means no branch-resolvable public result was found during this pass; it does not mean the restaurant is unavailable to a user at a given GPS point. The verified HungerStation pages prove platform presence only. None exposes enough exact address/branch identity for a safe physical-branch match.

## Sources

- [S1] [Section-B official link page](https://linktr.ee/sectionbsa)
- [S2] [Section-B official Hiraa location page](https://section-b4.wixsite.com/section-b/maps)
- [S3] [California Burger Hira/Al Marwah on Waze](https://www.waze.com/live-map/directions/sa/makkah-province/jeddah/the-california-burger?to=place.ChIJV4JrDtfWwxURcb-1hYI-7-Q)
- [S4] [Century Burger official locations](https://www.centuryburger.com/details)
- [S5] [Red Sea Mall official Century listing](https://www.redseamall.com/dining/century-burger)
- [S6] [Cenomi Jeddah Park official Century listing](https://centers.cenomi.com/sa-ar/malls/jeddah-park/dine/century-burger/)
- [S7] [King Abdulaziz International Airport official Century listing](https://www.kaia.sa/en/Shop-and-Dine/Century-Burger)
- [S8] [Chef’s official branch links](https://linktr.ee/chefs_sa)
- [S9] [Food Basics Hospitality — Chef’s](https://fbh.sa/chefs-restaurant/)
- [S10] [Sign Burger official locations](https://signsa.com/locations/)
- [S11] [Nora Burger official links](https://linktr.ee/noraburger)
- [S12] [Khayrat operator page — Nora Burger](https://www.khayratco.sa/noraburger/)
- [S13] [Restaurant Guru — Nora Abhur Google-derived snapshot](https://restaurantguru.com/amp/Nora-Smash-Burger-nwra-smash-brjr-Jeddah)
- [S14] [WBJ official branch links](https://linktr.ee/wbj_sa)
- [S15] [What’s On Saudi Arabia — Lou Burger Al Andalus](https://whatsonsaudiarabia.com/2026/05/best-burgers-in-jeddah/)
- [S16] [Arab News — Lou Burger in Jeddah](https://www.arabnews.com/node/2582572/food-health)
- [S17] [Smash Me official site](https://www.smashmerestaurant.com/)
- [S18] [New in Doha — Smash Me Saudi locations](https://newindoha.com/smash-me-the-beloved-qatar-born-burger-brand/)



