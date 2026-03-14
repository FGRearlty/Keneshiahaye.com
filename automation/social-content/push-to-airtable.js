/**
 * Push social media content to Airtable Social Media Content table
 *
 * Usage:
 *   AIRTABLE_PAT=pat_xxxx node push-to-airtable.js
 *
 * Or set PAT in .env file:
 *   AIRTABLE_PAT=pat_xxxx
 */

const BASE_ID = 'appTFBJkeI2RrA14P';
const TABLE_NAME = 'Social Media Content';
const SITE_URL = 'https://keneshiahaye.com';

const PAT = process.env.AIRTABLE_PAT;
if (!PAT) {
  console.error('ERROR: Set AIRTABLE_PAT environment variable');
  console.error('  AIRTABLE_PAT=pat_xxxx node push-to-airtable.js');
  process.exit(1);
}

// ── Social content for all 7 blogs ──────────────────────
const posts = [
  {
    blog_title: '2026 VA Loan Changes: What Jacksonville Veterans Need to Know',
    blog_slug: 'va-loan-changes-2026',
    image_url: `${SITE_URL}/images/stock/va-loan-guide-banner.jpg`,
    facebook: `Attention Jacksonville veterans — the VA loan program just got better in 2026, and I want to make sure you know what changed.\n\nThe conforming loan limit jumped to $832,750. VA funding fees are now tax-deductible (on a $300K home, that's roughly $6,900 you can write off). And following the NAR settlement, veterans can now pay their own buyer-agent commissions directly.\n\nFor those with full VA entitlement? Still no loan limit at all. Zero down anywhere in Duval, Clay, St. Johns, or Nassau County. Current VA rates are around 5.625% — 0.25 to 0.50% lower than conventional.\n\nI'm a veteran and a REALTOR. I've been through this process myself. Call me at (254) 449-5299 or read the full breakdown at keneshiahaye.com.`,
    instagram: `The VA loan got better in 2026 — and Jacksonville veterans need to know.\n\nNew loan limit: $832,750. VA funding fee now tax-deductible. Veterans can pay their own buyer-agent fee. VA rates still beating conventional by 0.25-0.50%.\n\nFull entitlement = zero down, no limit, no PMI. Still the most powerful homebuying tool in the country.\n\nLink in bio for the full guide.\n\n#VeteranHomebuyer #VALoan #JacksonvilleVeterans #NASJacksonville #MilitaryRealEstate #VALoan2026 #ZeroDown #JacksonvilleFL #FloridaVeterans #KeneshiaHaye`,
    tiktok: `HOOK (0-3s): If you're a veteran and you haven't heard about the 2026 VA loan changes — stop what you're doing.\n\nVALUE (3-55s): Three things changed that impact your buying power in Jacksonville.\n\nFirst — the loan limit went up to $832,750. But if you have full entitlement, the VA has no limit on you at all. Zero down at any price.\n\nSecond — VA funding fees are now tax-deductible. On a $300,000 home, that's a $6,900 deduction.\n\nThird — veterans can now pay their own buyer-agent commissions. In Jacksonville, most sellers still cover it. But now you always have options.\n\nVA rates around 5.625%. Zero down. No PMI. Florida has no state income tax.\n\nCTA (55-60s): I'm Keneshia Haye, veteran and REALTOR in Jacksonville. Call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `2026 VA Loan Changes: What Jacksonville Veterans Need to Know | Keneshia Haye Real Estate\n\nMajor VA loan updates for 2026 — new $832,750 conforming loan limit, NAR settlement changes to buyer-agent commission rules, brand-new federal tax deduction for VA funding fees, and current VA rates around 5.625%.\n\nTimestamps: 0:00 Overview | 1:20 New Loan Limits | 3:00 Commission Changes | 5:15 Tax Deduction | 7:30 What It Means for Jacksonville | 9:00 Next Steps\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#VALoan #JacksonvilleFL #VeteranHomebuyer #NASJacksonville #MilitaryRelocation`,
    linkedin: `The VA loan program made three significant changes in 2026 that Jacksonville-area veterans should understand.\n\nFirst, the conforming loan limit rose to $832,750 — though veterans with full entitlement face no limit at all.\n\nSecond, following the NAR settlement, veterans can now pay buyer-agent commissions directly — closing a gap that had briefly put VA buyers at a disadvantage.\n\nThird, VA funding fees are now deductible on federal returns. On a $300,000 purchase, roughly $6,900 in deductions.\n\nCombined with VA rates near 5.625%, zero PMI, and Florida's zero state income tax, the financial case for VA homeownership in Jacksonville remains exceptionally strong.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `2026 VA loan update for Jacksonville veterans: loan limit now $832,750, funding fee is tax-deductible, veterans can pay their own buyer-agent fee. VA rates still ~5.625% — below conventional. Zero down, no PMI. keneshiahaye.com`,
  },
  {
    blog_title: 'Jacksonville FL Real Estate Market Update — Spring 2026',
    blog_slug: 'jacksonville-real-estate-market',
    image_url: `${SITE_URL}/images/stock/jacksonville-market.jpg`,
    facebook: `Spring 2026 Jacksonville market update — here's the honest picture.\n\n~$300K median home price. 47-54 days on market. ~5 months of inventory. Rates just dipped below 6% for the first time in over a year.\n\nFor buyers: real negotiating power — request closing cost credits, rate buydowns. Only 12% of homes are selling over asking right now.\n\nFor sellers: price right from day one. Overpriced homes are sitting.\n\nJacksonville also just landed on NAR's Top Markets to Watch for 2026. Good fundamentals for the long game.\n\nCall (254) 449-5299 or visit keneshiahaye.com.`,
    instagram: `Spring 2026 Jacksonville snapshot:\n\n~$300K median. 47-54 days on market. ~5 months inventory. Rates just dipped below 6%.\n\nBalanced market — buyers have leverage they haven't had in years. Jacksonville named NAR Top Market to Watch 2026.\n\nFull breakdown on the blog — link in bio.\n\n#JacksonvilleRealEstate #JaxRealEstate #JacksonvilleFL #SpringMarket #RealEstateMarket2026 #JaxHomes #FloridaRealEstate #KeneshiaHaye #HomeValues #JacksonvilleHousing`,
    tiktok: `HOOK (0-3s): Honest Jacksonville real estate update for spring 2026 — no spin, just data.\n\nVALUE (3-55s): Median home price around $300,000. Homes averaging 47 to 54 days on market. About 5 months of inventory — the most balanced market we've seen in years.\n\nRates briefly dipped below 6% this week — first time in over a year. Only 12% of homes are selling over asking price. Buyers can negotiate closing cost credits and rate buydowns.\n\nJacksonville just made NAR's Top Markets to Watch list for 2026 — driven by job growth and population gains.\n\nCTA (55-60s): I'm Keneshia Haye. Call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `Jacksonville Real Estate Market Update — Spring 2026 | Keneshia Haye\n\nData-driven look at Jacksonville's housing market this spring. ~$300K median, 47-54 days on market, ~5 months inventory, rates dipping below 6%, and Jacksonville's NAR Top Markets recognition.\n\nTimestamps: 0:00 Overview | 1:30 Key Stats | 3:00 For Buyers | 5:00 For Sellers | 7:00 2026 Outlook\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#JacksonvilleRealEstate #JaxMarket #HomeValues2026 #JacksonvilleFL #FloridaHousing`,
    linkedin: `Jacksonville real estate is in a balanced market for the first time in years.\n\nSpring 2026: median home price ~$300,000, average 47-54 days on market, ~5 months of inventory. Rates briefly dipped below 6% — the first time in over a year.\n\nJacksonville was named one of NAR's Top Markets to Watch in 2026, driven by job growth, population gains, and strong price-to-income ratios in Florida.\n\nSellers who price correctly are still closing deals. Buyers now have negotiating leverage that was absent two years ago — closing cost credits, rate buydowns, inspection contingencies.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `Jacksonville spring 2026: ~$300K median, 47-54 days on market, ~5 months inventory. Rates just dipped below 6%. Only 12% of homes selling over asking. Balanced market — buyers have real leverage. NAR Top Market to Watch. keneshiahaye.com`,
  },
  {
    blog_title: 'Best Jacksonville Neighborhoods for First-Time Homebuyers (2026)',
    blog_slug: 'jacksonville-neighborhoods-first-time-buyers',
    image_url: `${SITE_URL}/images/stock/jacksonville-neighborhoods.jpg`,
    facebook: `First-time buyer figuring out where to live in Jacksonville? My honest 2026 breakdown:\n\nRiverside/Avondale ($280K-$400K) — walkable, historic, great community feel.\nMandarin ($280K-$380K) — top-rated schools, family-friendly, St. Johns River.\nOrange Park ($220K-$300K) — military-friendly, lower Clay County taxes. Best for VA buyers near NAS Jax.\nArlington ($180K-$260K) — most underrated. 20 min to beach, best value in the city.\nMurray Hill ($175K-$250K) — best upside potential, up-and-coming corridor.\n\nDrive the neighborhood different times of day. Check flood maps. Research schools even without kids.\n\nCall (254) 449-5299 or visit keneshiahaye.com.`,
    instagram: `First home in Jacksonville? My 2026 neighborhood shortlist:\n\nRiverside/Avondale — walkable + historic, $280K-$400K\nMandarin — best schools, $280K-$380K\nOrange Park — military-friendly, lower taxes, $220K-$300K\nArlington — most underrated, $180K-$260K\nMurray Hill — best upside, $175K-$250K\n\nJax is massive. Where you buy shapes your life. Full guide at the link in bio.\n\n#JacksonvilleFL #FirstTimeHomeBuyer #JaxNeighborhoods #Riverside #Mandarin #OrangePark #Arlington #MurrayHill #JacksonvilleRealEstate #KeneshiaHaye`,
    tiktok: `HOOK (0-3s): Buying your first home in Jacksonville and don't know where to start? This is for you.\n\nVALUE (3-55s): Jacksonville is the largest city by land area in the continental US. Where you live shapes commute, schools, and resale value.\n\nRiverside and Avondale — walkable, $280K to $400K. Great community. Budget for older home repairs.\nMandarin — top schools, St. Johns River, around $340K median. Moves fast.\nOrange Park — my go-to for military families near NAS Jax. Clay County taxes are lower, $220K to $300K.\nArlington — most underrated. Under $250K, 20 minutes from the beach.\nMurray Hill — highest upside, entry around $175K.\n\nCTA (55-60s): I'm Keneshia Haye. Call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `Best Jacksonville Neighborhoods for First-Time Homebuyers 2026 | Keneshia Haye Real Estate\n\nTop 5 Jacksonville neighborhoods for first-time buyers — price ranges, schools, lifestyle, appreciation potential. Plus 3 critical tips: flood zones, school ratings, commute research.\n\nTimestamps: 0:00 Intro | 1:00 Riverside/Avondale | 2:30 Mandarin | 3:45 Orange Park | 5:00 Arlington | 6:15 Murray Hill | 7:30 How to Choose\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#JacksonvilleNeighborhoods #FirstTimeHomeBuyer #JaxRealEstate #OrangePark #Mandarin`,
    linkedin: `Jacksonville's geographic scale makes neighborhood selection a critical variable for first-time buyers.\n\nFor 2026, strongest value: Orange Park/Clay County ($220K-$300K, lower property taxes, military-friendly) and Arlington ($180K-$260K, underrated, improving infrastructure).\n\nBest appreciation upside: Murray Hill — entry near $175K with active commercial revitalization.\n\nBest schools: Mandarin consistently ranks among Duval County's highest-rated zones.\n\nThree things I tell every first-time buyer: check FEMA flood maps before you fall in love, drive your commute during rush hour, research school ratings regardless of whether you have children.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `First home in Jacksonville? Orange Park ($220K-$300K, best for NAS Jax families), Arlington ($180K-$260K, most underrated), Murray Hill ($175K+, highest upside). Jax is huge — where you buy matters. keneshiahaye.com`,
  },
  {
    blog_title: 'VA Loan Guide: Buying a Home in Jacksonville, FL (2026)',
    blog_slug: 'va-loan-guide-jacksonville',
    image_url: `${SITE_URL}/images/stock/va-benefits-banner.jpg`,
    facebook: `If you've served this country and you're thinking about buying a home in Jacksonville — your VA loan benefit is the most powerful tool you have.\n\nZero down. No PMI. Rates beating conventional by 0.25-0.50%. No loan limit with full entitlement.\n\nThe VA has backed 28 million home loans since 1944. My clients near NAS Jacksonville, Naval Station Mayport, and Camp Blanding use this benefit because Jacksonville's housing costs align perfectly with military pay and BAH rates.\n\nI'm a veteran. I've been through this personally.\n\nCall (254) 449-5299 or visit keneshiahaye.com for the full guide.`,
    instagram: `Your VA benefit: $0 down, no PMI, rates that beat the market.\n\nJacksonville is one of the best cities in the country to use it. NAS Jax. Mayport. Camp Blanding. Your BAH goes further here.\n\n28 million VA home loans backed since 1944. Let's make yours the next one.\n\nI'm a veteran. This benefit is personal to me. Full guide at the link in bio.\n\n#VALoan #VeteranHomebuyer #JacksonvilleVeterans #ZeroDown #NASJacksonville #NavalStationMayport #MilitaryRealEstate #JAXHomes #KeneshiaHaye #FloridaVeterans`,
    tiktok: `HOOK (0-3s): If you're a veteran not using your VA loan benefit, I need you to hear this.\n\nVALUE (3-55s): Zero down. No PMI. Rates 0.25 to 0.50% below conventional. No loan limit with full entitlement.\n\nJacksonville is one of the best cities to use it. NAS Jax, Naval Station Mayport, Camp Blanding — all in the metro. Your BAH is calibrated here. Housing is 30 to 40 percent cheaper than San Diego.\n\nMyths: VA loans are slow — false. Sellers don't want VA buyers — false. You can only use it once — absolutely false. Entitlement restores when you sell.\n\nCTA (55-60s): I'm Keneshia Haye, veteran and REALTOR. Call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `VA Loan Guide: Buying a Home in Jacksonville FL (2026) | Keneshia Haye Real Estate\n\nComplete VA loan guide for Jacksonville veterans and active-duty service members. Eligibility, COE, loan limits, myths debunked, lender selection, and why Jacksonville is one of the best markets for military buyers.\n\nTimestamps: 0:00 What Is a VA Loan | 2:00 Eligibility | 3:30 Benefits | 5:00 Loan Limits | 6:15 Getting Your COE | 7:45 Finding a Lender | 9:00 Myths | 11:00 Why Jacksonville\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#VALoan #JacksonvilleFL #MilitaryHomeBuyer #NASJacksonville #VeteranRealEstate`,
    linkedin: `The VA home loan remains one of the most underutilized financial tools available to American veterans — and Jacksonville is one of the best markets to deploy it.\n\nZero down, no PMI, rates 0.25-0.50% below conventional, no loan limit with full entitlement. BAH rates are well-calibrated to local home prices. Florida's zero state income tax amplifies every dollar of compensation.\n\nHousing costs run 30-40% below San Diego and 25-35% below Hampton Roads. The VA has backed over 28 million home loans since 1944.\n\nThe myths — slow closings, seller resistance — don't hold up in 2026 with an experienced agent and lender.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `Jacksonville veterans: $0 down, no PMI, rates 0.25-0.50% below conventional, no limit with full entitlement. BAH goes further here than San Diego or Norfolk. Zero state income tax. The math is hard to beat. keneshiahaye.com`,
  },
  {
    blog_title: 'PCS to Jacksonville? Your Complete Military Relocation Guide (2026)',
    blog_slug: 'moving-to-jacksonville-military',
    image_url: `${SITE_URL}/images/stock/military-relocation.jpg`,
    facebook: `Got PCS orders to Jacksonville? Welcome to one of the best military duty stations in the country.\n\nNAS Jax families → Orange Park/Clay County. 10-15 min south, great schools, lower taxes, $250K-$350K.\nMayport families → Atlantic Beach, Neptune Beach. Or Arlington for more budget.\nCamp Blanding → Green Cove Springs, Middleburg. Most affordable in the metro.\n\nJacksonville housing costs 30-40% less than San Diego. Zero state income tax. Your BAH stretches here.\n\nI'm a veteran who's helped dozens of military families relocate to Jacksonville. Let's connect before your move. Call (254) 449-5299 or visit keneshiahaye.com.`,
    instagram: `PCS orders to Jacksonville? I've got you.\n\nNAS Jax? Orange Park is calling.\nMayport? The Beaches are right there.\nCamp Blanding? Green Cove Springs has room.\n\n30-40% cheaper than San Diego. Zero state income tax. BAH works hard here.\n\nI'm a veteran. I know PCS pressure firsthand. Full relocation guide at the link in bio.\n\n#PCSmove #JacksonvilleFL #NASJacksonville #NavalStationMayport #CampBlanding #MilitaryRelocation #MilSpouse #VALoan #PCS2026 #KeneshiaHaye`,
    tiktok: `HOOK (0-3s): PCS orders to Jacksonville? Let me save you months of research in 60 seconds.\n\nVALUE (3-55s): Three installations: NAS Jacksonville on the west side, Naval Station Mayport near the beaches, Camp Blanding about 45 minutes southwest.\n\nNAS Jax families — Orange Park and Clay County. 10-15 minutes south, great schools, lower property taxes, $250K to $350K.\n\nMayport families — Atlantic Beach and Neptune Beach are 5-15 minutes away. Arlington is 15-20 minutes west and significantly more affordable.\n\nCamp Blanding — Green Cove Springs, Middleburg, south Orange Park. Most affordable housing in the metro.\n\n30-40% cheaper than San Diego. Zero state income tax. VA loans work perfectly here.\n\nCTA (55-60s): I'm Keneshia Haye, veteran and REALTOR. Call (254) 449-5299 or visit keneshiahaye.com. Welcome to Jax.`,
    youtube: `PCS to Jacksonville FL? Complete Military Relocation Guide 2026 | Keneshia Haye Real Estate\n\nAll three installations covered — NAS Jacksonville, Naval Station Mayport, Camp Blanding — with best neighborhoods near each, BAH rates, school comparisons, and cost of living vs. San Diego and Hampton Roads.\n\nTimestamps: 0:00 Intro | 1:30 NAS Jacksonville | 3:00 Naval Station Mayport | 4:15 Camp Blanding | 5:30 Best Neighborhoods | 7:30 BAH Rates | 9:00 Schools | 10:30 Cost of Living | 12:00 Buy vs. Rent\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#PCSmove #JacksonvilleFL #MilitaryRelocation #NASJacksonville #NavyPCS`,
    linkedin: `Service members receiving PCS orders to Jacksonville have one of the most financially advantageous duty station assignments in the country.\n\nJacksonville hosts NAS Jacksonville, Naval Station Mayport, and Camp Blanding. Housing costs run 30-40% below San Diego and 25-35% below Hampton Roads, with Florida's zero state income tax amplifying every dollar of compensation.\n\nBAH rates support $280K-$350K mortgages for most enlisted grades — and with a VA loan, building equity rather than paying rent is often the smarter move even on a shorter tour.\n\nClay County (Orange Park, Fleming Island) tops the list for NAS Jax families. Beaches communities serve Mayport well. Green Cove Springs offers strong affordability for Camp Blanding personnel.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `PCS to Jacksonville? NAS Jax: Orange Park. Mayport: Atlantic Beach or Arlington. Camp Blanding: Green Cove Springs. Housing 30-40% cheaper than San Diego. Zero state income tax. Your BAH works hard here. keneshiahaye.com`,
  },
  {
    blog_title: 'How to Sell Your Home Fast in Jacksonville, FL (2026 Guide)',
    blog_slug: 'sell-your-home-fast-jacksonville',
    image_url: `${SITE_URL}/images/stock/hero-real-estate.jpg`,
    facebook: `Selling your Jacksonville home in 2026? Here's what actually works now.\n\n1. Price right from day one — homes priced correctly sell 50% faster.\n2. Curb appeal — pressure wash, paint the door, fresh mulch. Under $500, big return.\n3. Professional photos — 95% of buyers start online. Your photos are the first showing.\n4. Stage it — staged homes sell 73% faster per NAR.\n5. Pre-listing inspection — roof, HVAC, water heater, moisture. Fix it before buyers find it.\n\nThe market has normalized. Overpriced homes are sitting. Well-prepared homes are still moving.\n\nFree home valuation — call (254) 449-5299 or visit keneshiahaye.com.`,
    instagram: `Selling in Jacksonville 2026? Here's what works.\n\nPrice right from day one → 50% faster sale\nPro photos → 95% of buyers start online\nStage it → 73% faster per NAR\nFix issues before inspection → surprises kill deals\n\nOverpriced homes are sitting. Well-prepared homes move.\n\nFree home valuation — link in bio.\n\n#SellYourHome #JacksonvilleFL #JaxRealEstate #HomeSellingTips #PriceItRight #KeneshiaHaye #FloridaRealEstate #SellFast #HomeStagingTips #JacksonvilleHomeSeller`,
    tiktok: `HOOK (0-3s): Selling your Jacksonville home in 2026? What worked in 2022 doesn't work the same way now.\n\nVALUE (3-55s): Price right from day one — correct pricing means 50% faster sales on average. Curb appeal — pressure wash, paint the door, fresh mulch. Under $500 investment, real return.\n\nProfessional photos — 95% of buyers start online. Your listing photos are the first showing. Stage it — staged homes sell 73% faster per NAR.\n\nPre-listing inspection in Florida — check the roof, HVAC, and moisture. Surprises at inspection cost sellers far more in concessions than fixing the issues upfront.\n\nCTA (55-60s): I'm Keneshia Haye. Free home evaluation — call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `How to Sell Your Home Fast in Jacksonville FL (2026 Guide) | Keneshia Haye Real Estate\n\nProven strategies: price correctly (50% faster sales), professional photography (95% start online), staging (73% faster per NAR), curb appeal, multi-channel marketing including military PCS networks, Florida-specific pre-listing repairs.\n\nTimestamps: 0:00 Intro | 1:00 Price It Right | 2:30 Curb Appeal | 3:45 Declutter | 4:30 Photos | 5:45 Staging | 7:00 Marketing | 8:30 Showings | 9:30 Pre-Listing Repairs\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#SellYourHome #JacksonvilleFL #HomeSelling2026 #JaxRealEstate #HomeSellingTips`,
    linkedin: `Selling in Jacksonville in 2026 requires a different approach than 2022.\n\nFour principles drive faster sales and stronger prices: pricing precision (correct from day one = 50% faster), professional presentation (photography + staging = 73% faster per NAR), multi-channel marketing including military PCS networks unique to Jacksonville, and proactive repair management (pre-listing inspection: roof, HVAC, moisture).\n\nOverpriced homes are sitting. Well-prepared, well-priced homes are still moving.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `Selling in Jacksonville 2026: Price right (50% faster). Pro photos (95% start online). Stage it (73% faster per NAR). Fix roof/HVAC/moisture before inspection. Overpriced homes are sitting. keneshiahaye.com`,
  },
  {
    blog_title: '7 Mistakes First-Time Homebuyers Make (And How to Avoid Them)',
    blog_slug: 'first-time-homebuyer-mistakes',
    image_url: `${SITE_URL}/images/stock/first-time-homebuyer.jpg`,
    facebook: `After guiding many first-time buyers through Jacksonville, I've seen the same costly mistakes over and over. Here are the 7 — all avoidable.\n\n1. House hunting before pre-approval\n2. Ignoring hidden costs — property taxes (0.8-1.1% in Duval), Florida insurance, flood coverage\n3. Waiving the home inspection ($350-$500 protects you from a money pit)\n4. Big purchases before closing — lenders re-check your credit\n5. Not researching the neighborhood — drive the commute, check flood maps\n6. Letting emotions override your budget\n7. Going without a local expert\n\nRead the full breakdown at keneshiahaye.com or call (254) 449-5299.`,
    instagram: `7 first-time homebuyer mistakes in Jacksonville — all avoidable.\n\n1. No pre-approval before shopping\n2. Forgetting hidden costs (taxes, insurance, flood)\n3. Waiving the inspection\n4. Big purchases before closing\n5. Not researching the neighborhood\n6. Emotions over budget\n7. No local agent\n\nFree homebuyer guide at the link in bio.\n\n#FirstTimeHomeBuyer #JacksonvilleFL #HomeBuyingTips #JaxRealEstate #NewHomeowner #HomeBuying2026 #RealEstateTips #KeneshiaHaye #FloridaRealEstate #FirstHome`,
    tiktok: `HOOK (0-3s): First home in Jacksonville? These 7 mistakes can cost you tens of thousands. Let's skip them all.\n\nVALUE (3-55s): Mistake one — touring homes without pre-approval. Talk to a lender first.\n\nMistake two — forgetting hidden costs. Property taxes in Duval run 0.8 to 1.1% annually. Florida insurance is rising. Flood insurance is real here.\n\nMistake three — waiving the inspection. $350-$500 protects you from a nightmare. Also get wind mitigation and WDO in Florida.\n\nMistake four — big purchases before closing. No new car, no new credit card. Lenders re-check right before funding.\n\nMistake five — not researching the neighborhood. Drive it during rush hour. Check FEMA flood maps.\n\nMistake six — emotional buying. Set a hard budget ceiling before you start.\n\nMistake seven — no local agent. Experienced Jacksonville REALTOR saves more than they cost.\n\nCTA (55-60s): I'm Keneshia Haye. Call (254) 449-5299 or visit keneshiahaye.com.`,
    youtube: `7 Mistakes First-Time Homebuyers Make in Jacksonville FL | Keneshia Haye Real Estate\n\n7 costly mistakes with Jacksonville-specific advice: flood zones, WDO inspections, Duval County property tax rates, evaluating neighborhoods in a city this size.\n\nTimestamps: 0:00 Intro | 1:00 No Pre-Approval | 2:30 Hidden Costs | 4:15 Skipping Inspection | 5:45 Pre-Closing Purchases | 7:00 Neighborhood Research | 8:30 Emotional Decisions | 9:45 No Local Agent\n\nKeneshia Haye | Florida Gateway Realty | (254) 449-5299 | keneshiahaye.com\n\n#FirstTimeHomeBuyer #JacksonvilleFL #HomeBuyingMistakes #JaxRealEstate #FloridaRealEstate`,
    linkedin: `First-time homebuyers in Jacksonville face a learning curve that can be expensive without guidance. Seven mistakes I see consistently — all avoidable.\n\nMost consequential: touring without pre-approval, ignoring true ownership costs in Florida (property taxes 0.8-1.1%, rising insurance, flood coverage), and waiving the inspection to compete.\n\nEqually damaging: large purchases between pre-approval and closing, inadequate neighborhood research in a city this large, emotional decisions overriding budget constraints, and proceeding without experienced local representation.\n\nAll seven are avoidable with the right preparation.\n\nDedicated. Determined. Dependable. | keneshiahaye.com | (254) 449-5299`,
    twitter: `First-time buyer in Jacksonville: no pre-approval = you'll lose the home. No inspection = you'll buy a money pit. Big purchase before closing = your lender will catch it. Check the flood map before you fall in love. keneshiahaye.com`,
  },
];

// ── Airtable API helper ──────────────────────────────────
async function airtable(path, method = 'GET', body = null) {
  const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ── Main ─────────────────────────────────────────────────
const PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter/X'];
const PLATFORM_MAP = { Facebook: 'facebook', Instagram: 'instagram', TikTok: 'tiktok', YouTube: 'youtube', LinkedIn: 'linkedin', 'Twitter/X': 'twitter' };

async function run() {
  console.log(`Pushing ${posts.length * PLATFORMS.length} records to Airtable...`);
  let created = 0;

  for (const post of posts) {
    const records = PLATFORMS.map(platform => ({
      fields: {
        'Topic / Title': `${post.blog_title} — ${platform}`,
        'Content Type': 'Social Post',
        'Platform': platform,
        'Source Blog': post.blog_slug,
        'Blog URL': `https://keneshiahaye.com/blog/${post.blog_slug}`,
        'Image URL': post.image_url,
        [`${platform} Copy`]: post[PLATFORM_MAP[platform]] || '',
        'Content': post[PLATFORM_MAP[platform]] || '',
        'Status': 'Ready for Review',
        'Scheduled Date': null,
      },
    }));

    // Airtable batch create: max 10 per request
    for (let i = 0; i < records.length; i += 10) {
      const batch = records.slice(i, i + 10);
      try {
        const result = await airtable('', 'POST', { records: batch });
        created += result.records.length;
        console.log(`  ✓ ${post.blog_slug} — ${batch.map(r => r.fields['Platform']).join(', ')}`);
      } catch (e) {
        console.error(`  ✗ ${post.blog_slug}: ${e.message}`);
      }
    }
  }

  console.log(`\nDone. ${created} records created in Airtable.`);
}

run().catch(console.error);
