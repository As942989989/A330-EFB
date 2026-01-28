// ==========================================
// ✈️ TK A330 Dispatch Scenarios (30-Day Data)
// ==========================================

window.flightDB = {
    "LX250": { 
        day: "Day 01-1", type: "PAX", profile: "BIZ", dist: 805, r: "LSZH-LEMD", ci: 48, 
        pax: 378, cgoF: 6274, cgoA: 5135,
        d: "Stand E26 -> 377 | 🇪🇺 客運 [分配至 Remote/Apron 300]" 
    },
    "LX117": { 
        day: "Day 01-2", type: "PAX", profile: "BIZ", dist: 805, r: "LEMD-LSZH", ci: 45, 
        pax: 420, cgoF: 3644, cgoA: 2982,
        d: "Stand 377 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX462": { 
        day: "Day 02-1", type: "PAX", profile: "BIZ", dist: 380, r: "LSZH-LIRF", ci: 38, 
        pax: 385, cgoF: 5069, cgoA: 4148,
        d: "Stand B 35 -> 206 | 🇪🇺 客運 [分配至 Remote/Apron 200]" 
    },
    "LX545": { 
        day: "Day 02-2", type: "PAX", profile: "BIZ", dist: 380, r: "LIRF-LSZH", ci: 45, 
        pax: 349, cgoF: 5981, cgoA: 4895,
        d: "Stand 206 -> B 43 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX115": { 
        day: "Day 03-1", type: "PAX", profile: "BIZ", dist: 265, r: "LSZH-LFPG", ci: 33, 
        pax: 331, cgoF: 6482, cgoA: 5304,
        d: "Stand B 43 -> E 10 | 🇪🇺 客運 [分配至 Concourse E]" 
    },
    "LX448": { 
        day: "Day 03-2", type: "PAX", profile: "BIZ", dist: 265, r: "LFPG-LSZH", ci: 45, 
        pax: 403, cgoF: 4345, cgoA: 3555,
        d: "Stand E 10 -> B 38 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX340": { 
        day: "Day 04-1", type: "PAX", profile: "BIZ", dist: 3950, r: "LSZH-KORD", ci: 14, 
        pax: 331, cgoF: 3746, cgoA: 3065,
        d: "Stand B 38 -> H 15 | 🇪🇺 客運 [分配至 Concourse H]" 
    },
    "LX993": { 
        day: "Day 04-2", type: "PAX", profile: "BIZ", dist: 3950, r: "KORD-LSZH", ci: 45, 
        pax: 339, cgoF: 3934, cgoA: 3219,
        d: "Stand H 15 -> E 56 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX341": { 
        day: "Day 05-1", type: "PAX", profile: "BIZ", dist: 265, r: "LSZH-LFPG", ci: 41, 
        pax: 436, cgoF: 9268, cgoA: 7584,
        d: "Stand E 56 -> A 3 | 🇪🇺 客運 [分配至 Concourse A]" 
    },
    "LX650": { 
        day: "Day 05-2", type: "PAX", profile: "BIZ", dist: 265, r: "LFPG-LSZH", ci: 45, 
        pax: 347, cgoF: 8214, cgoA: 6721,
        d: "Stand A 3 -> B 38 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX331": { 
        day: "Day 06-1", type: "CGO", profile: "MEDICAL", dist: 805, r: "LSZH-LEMD", ci: 44, 
        pax: 268, cgoF: 9988, cgoA: 8172,
        d: "Stand B 38 -> 211 | 📦 客改貨 [分配至 Remote/Apron 200]" 
    },
    "LX932": { 
        day: "Day 06-2", type: "PAX", profile: "BIZ", dist: 805, r: "LEMD-LSZH", ci: 45, 
        pax: 365, cgoF: 7756, cgoA: 6347,
        d: "Stand 211 -> B 43 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX908": { 
        day: "Day 07-1", type: "PAX", profile: "BIZ", dist: 380, r: "LSZH-LIRF", ci: 38, 
        pax: 374, cgoF: 7623, cgoA: 6238,
        d: "Stand B 43 -> 607 | 🇪🇺 客運 [分配至 Remote/Apron 600]" 
    },
    "LX569": { 
        day: "Day 07-2", type: "PAX", profile: "BIZ", dist: 380, r: "LIRF-LSZH", ci: 45, 
        pax: 412, cgoF: 3821, cgoA: 3127,
        d: "Stand 607 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX947": { 
        day: "Day 08-1", type: "PAX", profile: "BIZ", dist: 4400, r: "LSZH-ZBAA", ci: 10, 
        pax: 395, cgoF: 6786, cgoA: 5553,
        d: "Stand B 35 -> W 111 | 🇪🇺 客運 [分配至 Concourse W]" 
    },
    "LX494": { 
        day: "Day 08-2", type: "PAX", profile: "BIZ", dist: 4400, r: "ZBAA-LSZH", ci: 45, 
        pax: 421, cgoF: 4300, cgoA: 3519,
        d: "Stand W 111 -> E 27 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX168": { 
        day: "Day 09-1", type: "PAX", profile: "BIZ", dist: 330, r: "LSZH-EHAM", ci: 31, 
        pax: 322, cgoF: 10440, cgoA: 8542,
        d: "Stand E 27 -> G 79 | 🇪🇺 客運 [Concourse G 星盟/國際區]" 
    },
    "LX527": { 
        day: "Day 09-2", type: "PAX", profile: "BIZ", dist: 330, r: "EHAM-LSZH", ci: 45, 
        pax: 318, cgoF: 6929, cgoA: 5670,
        d: "Stand G 79 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX495": { 
        day: "Day 10-1", type: "CGO", profile: "MEDICAL", dist: 805, r: "LSZH-LEMD", ci: 33, 
        pax: 345, cgoF: 9894, cgoA: 9895,
        d: "Stand B 35 -> 604 | 📦 客改貨 [分配至 Remote/Apron 600]" 
    },
    "LX511": { 
        day: "Day 10-2", type: "PAX", profile: "BIZ", dist: 805, r: "LEMD-LSZH", ci: 45, 
        pax: 367, cgoF: 3424, cgoA: 2802,
        d: "Stand 604 -> B 39 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX355": { 
        day: "Day 11-1", type: "PAX", profile: "BIZ", dist: 330, r: "LSZH-EHAM", ci: 50, 
        pax: 422, cgoF: 4029, cgoA: 3298,
        d: "Stand B 39 -> G 9 | 🇪🇺 客運 [Concourse G 星盟/國際區]" 
    },
    "LX778": { 
        day: "Day 11-2", type: "PAX", profile: "BIZ", dist: 330, r: "EHAM-LSZH", ci: 45, 
        pax: 403, cgoF: 4620, cgoA: 3780,
        d: "Stand G 9 -> B 38 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX276": { 
        day: "Day 12-1", type: "CGO", profile: "CARGO", dist: 3950, r: "LSZH-KORD", ci: 14, 
        pax: 255, cgoF: 10018, cgoA: 8197,
        d: "Stand B 38 -> SW 2 | 📦 客改貨 [分配至 Concourse S]" 
    },
    "LX519": { 
        day: "Day 12-2", type: "PAX", profile: "BIZ", dist: 3950, r: "KORD-LSZH", ci: 45, 
        pax: 371, cgoF: 4033, cgoA: 3300,
        d: "Stand SW 2 -> E 19 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX979": { 
        day: "Day 13-1", type: "PAX", profile: "BIZ", dist: 805, r: "LSZH-LEMD", ci: 50, 
        pax: 412, cgoF: 8559, cgoA: 7004,
        d: "Stand E 19 -> 73 | 🇪🇺 客運 [分配至 Apron]" 
    },
    "LX768": { 
        day: "Day 13-2", type: "PAX", profile: "BIZ", dist: 805, r: "LEMD-LSZH", ci: 45, 
        pax: 305, cgoF: 4500, cgoA: 3682,
        d: "Stand 73 -> B 38 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX462": { 
        day: "Day 14-1", type: "PAX", profile: "BIZ", dist: 330, r: "LSZH-EHAM", ci: 48, 
        pax: 302, cgoF: 3931, cgoA: 3218,
        d: "Stand B 38 -> G 3 | 🇪🇺 客運 [Concourse G 星盟/國際區]" 
    },
    "LX846": { 
        day: "Day 14-2", type: "PAX", profile: "BIZ", dist: 330, r: "EHAM-LSZH", ci: 45, 
        pax: 419, cgoF: 7525, cgoA: 6157,
        d: "Stand G 3 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX267": { 
        day: "Day 15-1", type: "CGO", profile: "MEDICAL", dist: 330, r: "LSZH-EHAM", ci: 47, 
        pax: 216, cgoF: 10415, cgoA: 8523,
        d: "Stand B 35 -> G 73 | 📦 客改貨 [Concourse G 星盟/國際區]" 
    },
    "LX204": { 
        day: "Day 15-2", type: "PAX", profile: "BIZ", dist: 330, r: "EHAM-LSZH", ci: 45, 
        pax: 343, cgoF: 6307, cgoA: 5162,
        d: "Stand G 73 -> B 34 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX641": { 
        day: "Day 16-1", type: "PAX", profile: "BIZ", dist: 3950, r: "LSZH-KORD", ci: 5, 
        pax: 289, cgoF: 9857, cgoA: 8065,
        d: "Stand B 34 -> M 12 | 🇪🇺 客運 [分配至 Concourse M]" 
    },
    "LX996": { 
        day: "Day 16-2", type: "PAX", profile: "BIZ", dist: 3950, r: "KORD-LSZH", ci: 45, 
        pax: 334, cgoF: 6633, cgoA: 5427,
        d: "Stand M 12 -> E 57 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX486": { 
        day: "Day 17-1", type: "CGO", profile: "MEDICAL", dist: 420, r: "LSZH-EGLL", ci: 33, 
        pax: 226, cgoF: 10424, cgoA: 8530,
        d: "Stand E 57 -> 233 | 📦 客改貨 [Terminal 2B 星盟/國際區]" 
    },
    "LX446": { 
        day: "Day 17-2", type: "PAX", profile: "BIZ", dist: 420, r: "EGLL-LSZH", ci: 45, 
        pax: 417, cgoF: 3511, cgoA: 2873,
        d: "Stand 233 -> B 39 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX351": { 
        day: "Day 18-1", type: "PAX", profile: "BIZ", dist: 265, r: "LSZH-LFPG", ci: 32, 
        pax: 391, cgoF: 8025, cgoA: 6566,
        d: "Stand B 39 -> A 1 | 🇪🇺 客運 [分配至 Concourse A]" 
    },
    "LX841": { 
        day: "Day 18-2", type: "PAX", profile: "BIZ", dist: 265, r: "LFPG-LSZH", ci: 45, 
        pax: 377, cgoF: 7348, cgoA: 6012,
        d: "Stand A 1 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX621": { 
        day: "Day 19-1", type: "PAX", profile: "BIZ", dist: 805, r: "LSZH-LEMD", ci: 43, 
        pax: 419, cgoF: 9941, cgoA: 9941,
        d: "Stand B 35 -> 159 | 🇪🇺 客運 [分配至 Remote/Apron 100]" 
    },
    "LX120": { 
        day: "Day 19-2", type: "PAX", profile: "BIZ", dist: 805, r: "LEMD-LSZH", ci: 45, 
        pax: 405, cgoF: 7727, cgoA: 6323,
        d: "Stand 159 -> B 34 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX818": { 
        day: "Day 20-1", type: "PAX", profile: "LEISURE", dist: 4200, r: "LSZH-KMIA", ci: 14, 
        pax: 352, cgoF: 4627, cgoA: 3786,
        d: "Stand B 34 -> H 12 | 🇪🇺 客運 [分配至 Concourse H]" 
    },
    "LX398": { 
        day: "Day 20-2", type: "PAX", profile: "BIZ", dist: 4200, r: "KMIA-LSZH", ci: 45, 
        pax: 305, cgoF: 5322, cgoA: 4356,
        d: "Stand H 12 -> E 56 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX360": { 
        day: "Day 21-1", type: "PAX", profile: "BIZ", dist: 160, r: "LSZH-EDDF", ci: 37, 
        pax: 304, cgoF: 6361, cgoA: 5205,
        d: "Stand E 56 -> B 48 | 🇪🇺 客運 [Concourse B 星盟/國際區]" 
    },
    "LX517": { 
        day: "Day 21-2", type: "PAX", profile: "BIZ", dist: 160, r: "EDDF-LSZH", ci: 45, 
        pax: 313, cgoF: 7005, cgoA: 5733,
        d: "Stand B 48 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX136": { 
        day: "Day 22-1", type: "CGO", profile: "MEDICAL", dist: 265, r: "LSZH-LFPG", ci: 36, 
        pax: 229, cgoF: 10195, cgoA: 8343,
        d: "Stand B 35 -> E 32 | 📦 客改貨 [分配至 Concourse E]" 
    },
    "LX166": { 
        day: "Day 22-2", type: "PAX", profile: "BIZ", dist: 265, r: "LFPG-LSZH", ci: 45, 
        pax: 334, cgoF: 5507, cgoA: 4507,
        d: "Stand E 32 -> B 43 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX108": { 
        day: "Day 23-1", type: "PAX", profile: "BIZ", dist: 910, r: "LSZH-LGAV", ci: 49, 
        pax: 354, cgoF: 3310, cgoA: 2709,
        d: "Stand B 43 -> A 42 | 🇪🇺 客運 [分配至 Concourse A]" 
    },
    "LX871": { 
        day: "Day 23-2", type: "PAX", profile: "BIZ", dist: 910, r: "LGAV-LSZH", ci: 45, 
        pax: 436, cgoF: 5778, cgoA: 4729,
        d: "Stand A 42 -> B 34 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX937": { 
        day: "Day 24-1", type: "PAX", profile: "BIZ", dist: 4400, r: "LSZH-ZBAA", ci: 8, 
        pax: 407, cgoF: 7150, cgoA: 5851,
        d: "Stand B 34 -> 611 | 🇪🇺 客運 [分配至 Remote/Apron 600]" 
    },
    "LX856": { 
        day: "Day 24-2", type: "PAX", profile: "BIZ", dist: 4400, r: "ZBAA-LSZH", ci: 45, 
        pax: 319, cgoF: 3400, cgoA: 2782,
        d: "Stand 611 -> E 35 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX110": { 
        day: "Day 25-1", type: "PAX", profile: "BIZ", dist: 265, r: "LSZH-LFPG", ci: 48, 
        pax: 416, cgoF: 9372, cgoA: 7669,
        d: "Stand E 35 -> C 2 | 🇪🇺 客運 [分配至 Concourse C]" 
    },
    "LX602": { 
        day: "Day 25-2", type: "PAX", profile: "BIZ", dist: 265, r: "LFPG-LSZH", ci: 45, 
        pax: 372, cgoF: 6747, cgoA: 5522,
        d: "Stand C 2 -> B 38 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX193": { 
        day: "Day 26-1", type: "PAX", profile: "BIZ", dist: 910, r: "LSZH-LGAV", ci: 49, 
        pax: 315, cgoF: 7835, cgoA: 6411,
        d: "Stand B 38 -> A 50 | 🇪🇺 客運 [分配至 Concourse A]" 
    },
    "LX866": { 
        day: "Day 26-2", type: "PAX", profile: "BIZ", dist: 910, r: "LGAV-LSZH", ci: 45, 
        pax: 352, cgoF: 6216, cgoA: 5087,
        d: "Stand A 50 -> B 35 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX332": { 
        day: "Day 27-1", type: "PAX", profile: "BIZ", dist: 420, r: "LSZH-EGLL", ci: 44, 
        pax: 373, cgoF: 8268, cgoA: 6766,
        d: "Stand B 35 -> 251 | 🇪🇺 客運 [Terminal 2B 星盟/國際區]" 
    },
    "LX405": { 
        day: "Day 27-2", type: "PAX", profile: "BIZ", dist: 420, r: "EGLL-LSZH", ci: 45, 
        pax: 399, cgoF: 4261, cgoA: 3487,
        d: "Stand 251 -> B 39 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX383": { 
        day: "Day 28-1", type: "PAX", profile: "LEISURE", dist: 4200, r: "LSZH-KMIA", ci: 9, 
        pax: 320, cgoF: 8456, cgoA: 6919,
        d: "Stand B 39 -> E 30 | 🇪🇺 客運 [分配至 Concourse E]" 
    },
    "LX282": { 
        day: "Day 28-2", type: "PAX", profile: "BIZ", dist: 4200, r: "KMIA-LSZH", ci: 45, 
        pax: 317, cgoF: 6460, cgoA: 5286,
        d: "Stand E 30 -> E 43 | 🇪🇺 返程 [Dock E 首選]" 
    },
    "LX321": { 
        day: "Day 29-1", type: "CGO", profile: "MEDICAL", dist: 910, r: "LSZH-LGAV", ci: 33, 
        pax: 294, cgoF: 9628, cgoA: 9629,
        d: "Stand E 43 -> 2F | 📦 客改貨 [分配至 Apron]" 
    },
    "LX604": { 
        day: "Day 29-2", type: "PAX", profile: "BIZ", dist: 910, r: "LGAV-LSZH", ci: 45, 
        pax: 376, cgoF: 7009, cgoA: 5736,
        d: "Stand 2F -> B 39 | 🇪🇺 返程 [Dock B 首選]" 
    },
    "LX244": { 
        day: "Day 30-1", type: "CGO", profile: "MEDICAL", dist: 380, r: "LSZH-LIRF", ci: 36, 
        pax: 203, cgoF: 9861, cgoA: 9862,
        d: "Stand B 39 -> 822 | 📦 客改貨 [分配至 Remote/Apron 800]" 
    },
    "LX568": { 
        day: "Day 30-2", type: "PAX", profile: "BIZ", dist: 380, r: "LIRF-LSZH", ci: 45, 
        pax: 376, cgoF: 7327, cgoA: 5995,
        d: "Stand 822 -> B 43 | 🇪🇺 返程 [Dock B 首選]" 
    }
};
