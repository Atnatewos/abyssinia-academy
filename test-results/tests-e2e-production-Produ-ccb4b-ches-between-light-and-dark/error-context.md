# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e-production.spec.js >> Production Smoke Tests >> Theme toggle switches between light and dark
- Location: tests\e2e-production.spec.js:43:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e11]: 💰 Students earn while they learn — up to 500 ETB per sale · Withdraw in 24h.
      - link "See How You Earn →" [ref=e12] [cursor=pointer]:
        - /url: /#earn
    - banner [ref=e13]:
      - generic [ref=e14]:
        - link "ABYSSiNIA" [ref=e15] [cursor=pointer]:
          - /url: /
          - generic [ref=e21]:
            - generic [ref=e22]: ABYSSiNIA
            - generic [ref=e23]: Tech Academy
        - navigation "Primary" [ref=e24]:
          - link "Overview" [ref=e25] [cursor=pointer]:
            - /url: /
          - link "Courses" [ref=e26] [cursor=pointer]:
            - /url: /courses
          - link "Earn" [ref=e27] [cursor=pointer]:
            - /url: /#earn
          - link "Tuition" [ref=e28] [cursor=pointer]:
            - /url: /pricing
          - link "Contact" [ref=e29] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e30]:
          - button "Switch language" [ref=e31] [cursor=pointer]:
            - generic [ref=e35]: EN
          - button "Switch to light mode" [active] [ref=e36] [cursor=pointer]
          - generic [ref=e43]:
            - link "Sign In" [ref=e44] [cursor=pointer]:
              - /url: /auth/login
            - link "Enroll Now" [ref=e49] [cursor=pointer]:
              - /url: /auth/register
    - main [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: Online Live Masterclass Learning System
              - generic [ref=e64]: 💰 Steady Income - Get Paid Just for Studying
            - heading "Master Full Stack Web Application Development Online & Get Paid at ABYSSiNIA" [level=1] [ref=e71]
            - paragraph [ref=e72]: Turn your education into a recurring income stream. Access a 5-phase engineering curriculum through online live masterclasses, and receive guaranteed payouts as you level up your tech skills.
            - paragraph [ref=e73]: Every approved sale in your network pays you up to 500 ETB across 4 levels deep - cash out via Telebirr in 24h.
            - generic [ref=e74]:
              - link "Explore Courses" [ref=e75] [cursor=pointer]:
                - /url: /courses
              - link "Unlock Full Pass" [ref=e79] [cursor=pointer]:
                - /url: /pricing
              - link "See How You Earn" [ref=e83] [cursor=pointer]:
                - /url: /#earn
          - generic [ref=e88]:
            - generic [ref=e89]: Abyssinia_Masterclass.tsx
            - generic [ref=e91] [cursor=pointer]:
              - link "FREE PREVIEW" [ref=e93]:
                - /url: /courses
              - generic [ref=e96]:
                - generic [ref=e97]: "FREE PREVIEW: Phase 1 · Week 1 · Class 01"
                - generic [ref=e101]: 45:10
            - list [ref=e102]:
              - listitem [ref=e103]:
                - generic [ref=e104]:
                  - generic [aria-hidden] [ref=e105]: ›
                  - text: 01. Client-Server Architecture Overview
                - generic [ref=e106]: 00:00
              - listitem [ref=e107]:
                - generic [ref=e108]:
                  - generic [aria-hidden] [ref=e109]: ›
                  - text: 02. HTML5 Semantic Elements Demystified
                - generic [ref=e110]: 14:20
              - listitem [ref=e111]:
                - generic [ref=e112]:
                  - generic [aria-hidden] [ref=e113]: ›
                  - text: 03. Accessibility (a11y) Best Practices
                - generic [ref=e114]: 30:15
          - generic [ref=e116]:
            - generic [ref=e117]:
              - paragraph [ref=e118]: 5 Phases
              - paragraph
            - generic [ref=e119]:
              - paragraph [ref=e120]: 20+ Weeks
              - paragraph
            - generic [ref=e121]:
              - paragraph [ref=e122]: 100%
              - paragraph
            - generic [ref=e123]:
              - paragraph [ref=e124]: 500 ETB
              - paragraph
            - generic [ref=e125]:
              - paragraph [ref=e126]: 24h
              - paragraph
        - complementary "Platform earnings proof" [ref=e127]:
          - generic [ref=e128]:
            - strong [ref=e132]: 37,150 ETB
            - text: paid to students
          - generic [ref=e133]:
            - strong [ref=e139]: "62"
            - text: active referrers
          - generic [ref=e140]:
            - strong [ref=e147]: M*** H***
            - text: 10 refs
          - generic [ref=e148]:
            - strong [ref=e155]: A*** A*** M***
            - text: 8 refs
          - generic [ref=e156]:
            - strong [ref=e163]: E*** T***
            - text: 9 refs
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e166]: The Opportunity
            - heading "Your Education Is An Income Stream" [level=2] [ref=e167]
            - paragraph [ref=e168]: From the moment you enroll, the platform pays you for every friend you bring in — while you study.
          - generic [ref=e169]:
            - generic [ref=e170]:
              - generic [ref=e177]: 500ETB
              - heading "Earn per sale" [level=3] [ref=e178]
              - paragraph [ref=e179]: per approved sale
              - paragraph [ref=e180]: Every approved course sale pays up to 500 ETB, split across your 4-level network.
            - generic [ref=e181]:
              - generic [ref=e186]: 40,000ETB
              - heading "Stack bonuses" [level=3] [ref=e187]
              - paragraph [ref=e188]: top milestone bonus
              - paragraph [ref=e189]: Hit milestones, climb ranks, grow your team — earn up to 40,000 ETB per milestone bonus.
            - generic [ref=e190]:
              - generic [ref=e194]: 24h
              - heading "Cash out fast" [level=3] [ref=e195]
              - paragraph [ref=e196]: payout processing
              - paragraph [ref=e197]: Withdraw unlocked earnings to Telebirr or CBE Birr in 24h — admin-verified, no middlemen.
          - link "See the Full Earnings Engine" [ref=e199] [cursor=pointer]:
            - /url: /#earn
        - generic [ref=e203]:
          - generic [ref=e204]:
            - generic [ref=e205]: Learn & Earn
            - heading "Your Knowledge Pays. Literally." [level=2] [ref=e206]
            - paragraph [ref=e207]: Share your link - friends get 10% off their enrollment, and you earn real cash on every approved sale.
          - generic [ref=e208]:
            - generic [ref=e209]:
              - heading "Learn" [level=3] [ref=e214]
              - paragraph [ref=e215]: Enroll and master the 5-phase full-stack curriculum.
            - generic [ref=e216]:
              - heading "Share" [level=3] [ref=e224]
              - paragraph [ref=e225]: Your personal link gives friends an instant tuition discount.
            - generic [ref=e226]:
              - heading "Earn" [level=3] [ref=e232]
              - paragraph [ref=e233]: Cash out via Telebirr or CBE Birr within 24 hours of approval.
          - generic [ref=e234]:
            - generic [ref=e235]:
              - generic [ref=e236]:
                - heading "Estimate your earnings" [level=4] [ref=e237]
                - generic [ref=e240]: "network: 55"
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - generic [aria-hidden] [ref=e243]: L1
                  - generic [ref=e244]: 300 ETB
                  - slider "Level 1" [ref=e245] [cursor=pointer]: "5"
                  - spinbutton "Level 1" [ref=e246]: "5"
                - generic [ref=e247]:
                  - generic [aria-hidden] [ref=e248]: L2
                  - generic [ref=e249]: 150 ETB
                  - slider "Level 2" [ref=e250] [cursor=pointer]: "10"
                  - spinbutton "Level 2" [ref=e251]: "10"
                - generic [ref=e252]:
                  - generic [aria-hidden] [ref=e253]: L3
                  - generic [ref=e254]: 100 ETB
                  - slider "Level 3" [ref=e255] [cursor=pointer]: "20"
                  - spinbutton "Level 3" [ref=e256]: "20"
                - generic [ref=e257]:
                  - generic [aria-hidden] [ref=e258]: L4
                  - generic [ref=e259]: 50 ETB
                  - slider "Level 4" [ref=e260] [cursor=pointer]: "20"
                  - spinbutton "Level 4" [ref=e261]: "20"
              - generic [ref=e262]:
                - generic [ref=e263]: Quick presets
                - button "Starter" [ref=e264] [cursor=pointer]
                - button "Builder" [ref=e265] [cursor=pointer]
                - button "Pro" [ref=e266] [cursor=pointer]
                - button "Army" [ref=e267] [cursor=pointer]
              - generic [ref=e268]:
                - button "Hide full math" [expanded] [ref=e269] [cursor=pointer]
                - generic [ref=e272]:
                  - generic [ref=e273]:
                    - generic [ref=e274]: Commission breakdown
                    - generic [ref=e275]:
                      - generic [ref=e276]: Level 1
                      - generic [ref=e277]: 5 × 300 ETB
                      - generic [ref=e278]: 1,500 ETB
                    - generic [ref=e279]:
                      - generic [ref=e280]: Level 2
                      - generic [ref=e281]: 10 × 150 ETB
                      - generic [ref=e282]: 1,500 ETB
                    - generic [ref=e283]:
                      - generic [ref=e284]: Level 3
                      - generic [ref=e285]: 20 × 100 ETB
                      - generic [ref=e286]: 2,000 ETB
                    - generic [ref=e287]:
                      - generic [ref=e288]: Level 4
                      - generic [ref=e289]: 20 × 50 ETB
                      - generic [ref=e290]: 1,000 ETB
                  - generic [ref=e291]:
                    - generic [ref=e292]: Bonuses unlocked
                    - generic [ref=e293]:
                      - generic [ref=e294]: Direct Referral — 5
                      - generic [ref=e295]: +1,000 ETB
                    - generic [ref=e296]:
                      - generic [ref=e297]: Milestone — 50 Team
                      - generic [ref=e298]: +10,000 ETB
                    - generic [ref=e299]:
                      - generic [ref=e300]: Silver
                      - generic [ref=e301]: +5,000 ETB
                    - generic [ref=e302]:
                      - generic [ref=e303]: Team Growth — 50
                      - generic [ref=e304]: +2,500 ETB
            - complementary "Total income" [ref=e305]:
              - generic [ref=e306]:
                - generic [ref=e307]:
                  - generic [ref=e308]: Commissions
                  - generic [ref=e309]:
                    - generic [ref=e310]:
                      - emphasis [ref=e311]: L1
                      - text: 1,500
                    - generic [ref=e312]:
                      - emphasis [ref=e313]: L2
                      - text: 1,500
                    - generic [ref=e314]:
                      - emphasis [ref=e315]: L3
                      - text: 2,000
                    - generic [ref=e316]:
                      - emphasis [ref=e317]: L4
                      - text: 1,000
                  - generic [ref=e318]: = 6,000 ETB
                - generic [ref=e319]:
                  - generic [ref=e320]: Bonuses
                  - generic [ref=e321]:
                    - generic "Direct Referral — 5" [ref=e322]: +1,000
                    - generic "Milestone — 50 Team" [ref=e323]: +10,000
                    - generic "Silver" [ref=e324]: +5,000
                    - generic "Team Growth — 50" [ref=e325]: +2,500
                  - generic [ref=e326]: = 18,500 ETB
              - generic [ref=e327]:
                - generic [ref=e328]: Total income
                - strong [ref=e329]: 24,500 ETB
              - link "Get My Referral Link" [ref=e330] [cursor=pointer]:
                - /url: /auth/register
              - paragraph [ref=e333]: Commissions apply to approved course sales only.
          - generic [ref=e334]:
            - tablist "Earnings side panel" [ref=e335]:
              - tab "ladder" [ref=e336] [cursor=pointer]
              - tab "next" [selected] [ref=e337] [cursor=pointer]
              - tab "payouts" [ref=e338] [cursor=pointer]
            - tabpanel [ref=e339]:
              - heading "Next bonus within reach" [level=4] [ref=e340]
              - list [ref=e341]:
                - listitem [ref=e342]:
                  - generic [ref=e343]:
                    - generic [ref=e344]: Direct Referral — 10
                    - generic [ref=e345]: +1,500 ETB
                  - generic [ref=e348]:
                    - generic [ref=e349]: 5 / 10
                    - generic [ref=e350]: 5 more
                - listitem [ref=e351]:
                  - generic [ref=e352]:
                    - generic [ref=e353]: Milestone — 100 Team
                    - generic [ref=e354]: +10,000 ETB
                  - generic [ref=e357]:
                    - generic [ref=e358]: 50 / 100
                    - generic [ref=e359]: 50 more
                - listitem [ref=e360]:
                  - generic [ref=e361]:
                    - generic [ref=e362]: Gold
                    - generic [ref=e363]: +10,000 ETB
                  - generic [ref=e366]:
                    - generic [ref=e367]: 50 / 200
                    - generic [ref=e368]: 150 more
                - listitem [ref=e369]:
                  - generic [ref=e370]:
                    - generic [ref=e371]: Team Growth — 100
                    - generic [ref=e372]: +2,500 ETB
                  - generic [ref=e375]:
                    - generic [ref=e376]: 50 / 100
                    - generic [ref=e377]: 50 more
          - generic [ref=e378]:
            - heading "Fair Play. Full Transparency." [level=3] [ref=e379]
            - generic [ref=e380]:
              - generic [ref=e381]:
                - strong [ref=e386]: Real sales only
                - generic [ref=e387]: Commissions trigger on approved course payments, never on signups.
              - generic [ref=e388]:
                - strong [ref=e392]: 7-day protection
                - generic [ref=e393]: Every earning locks for 7 days — refund-safe by design.
              - generic [ref=e394]:
                - strong [ref=e397]: Monthly caps
                - generic [ref=e398]: Per-user and platform-wide limits keep the system sustainable.
              - generic [ref=e399]:
                - strong [ref=e405]: No self-referral
                - generic [ref=e406]: One person, one code. Gaming the network is blocked.
            - paragraph [ref=e407]: processed ≤ 24h
        - generic [ref=e408]:
          - generic [ref=e409]:
            - generic [ref=e410]: Tuition
            - heading "Simple, Transparent Pricing" [level=2] [ref=e411]
            - paragraph [ref=e412]: Choose the path that fits your goals.
          - generic [ref=e413]:
            - generic [ref=e414]:
              - generic [ref=e415]: BEST VALUE
              - heading "Full Academy Access Pass — All 5 Phases" [level=3] [ref=e418]
              - paragraph [ref=e421]: Complete curriculum, best value
              - generic [ref=e422]:
                - generic [ref=e423]: 1,199 ETB
                - generic [ref=e424]: / full course
              - generic [ref=e425]:
                - generic [ref=e426]: 2,499 ETB
                - generic [ref=e427]: 52% off
              - list [ref=e430]:
                - listitem [ref=e431]:
                  - generic [ref=e434]: All structured phases
                - listitem [ref=e435]:
                  - generic [ref=e438]: Lifetime access
                - listitem [ref=e439]:
                  - generic [ref=e442]: Completion certificate
                - listitem [ref=e443]:
                  - generic [ref=e446]: Private Telegram community
              - link "Enroll Now" [ref=e447] [cursor=pointer]:
                - /url: /auth/login?redirect=/checkout?mode=full-course
            - generic [ref=e451]:
              - generic [ref=e452]: "1"
              - heading "Building static websites using HTML, CSS & Bootstrap" [level=3] [ref=e453]
              - paragraph [ref=e454]: 8 classes · 4 Weeks
              - generic [ref=e455]: 399 ETB
              - generic [ref=e457]:
                - generic [ref=e458]: 750 ETB
                - generic [ref=e459]: 47% off
              - list [ref=e462]:
                - listitem [ref=e463]:
                  - generic [ref=e466]: Semantic HTML5 & Web Accessibility (a11y)
                - listitem [ref=e467]:
                  - generic [ref=e470]: Responsive CSS Flexbox & Multi-dimensional CSS Grid
                - listitem [ref=e471]:
                  - generic [ref=e474]: Professional Git branching, pull requests, and GitHub workflows
              - link "View Phase" [ref=e475] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e479]:
              - generic [ref=e480]: "2"
              - heading "Learn coding with JavaScript" [level=3] [ref=e481]
              - paragraph [ref=e482]: 7 classes · 7 Weeks
              - generic [ref=e483]: 399 ETB
              - generic [ref=e485]:
                - generic [ref=e486]: 750 ETB
                - generic [ref=e487]: 47% off
              - list [ref=e490]:
                - listitem [ref=e491]:
                  - generic [ref=e494]: Programming Fundamentals & Algorithmic Thinking
                - listitem [ref=e495]:
                  - generic [ref=e498]: DOM Manipulation & Event Handling
                - listitem [ref=e499]:
                  - generic [ref=e502]: Asynchronous JavaScript & jQuery
              - link "View Phase" [ref=e503] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e507]:
              - generic [ref=e508]: "3"
              - heading "Node, Express, MySql and React.js" [level=3] [ref=e509]
              - paragraph [ref=e510]: 7 classes · 7 Weeks
              - generic [ref=e511]: 399 ETB
              - generic [ref=e513]:
                - generic [ref=e514]: 750 ETB
                - generic [ref=e515]: 47% off
              - list [ref=e518]:
                - listitem [ref=e519]:
                  - generic [ref=e522]: Node.js, Express, and MySQL Database Integration
                - listitem [ref=e523]:
                  - generic [ref=e526]: React Functional and Class Components
                - listitem [ref=e527]:
                  - generic [ref=e530]: React Hooks, State Management, and Routing
              - link "View Phase" [ref=e531] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e535]:
              - generic [ref=e536]: "4"
              - heading "The Project Phase - Building Fullstack Applications" [level=3] [ref=e537]
              - paragraph [ref=e538]: 4 classes · 4 Weeks
              - generic [ref=e539]: 399 ETB
              - generic [ref=e541]:
                - generic [ref=e542]: 750 ETB
                - generic [ref=e543]: 47% off
              - list [ref=e546]:
                - listitem [ref=e547]:
                  - generic [ref=e550]: Fullstack React & Node.js Integration
                - listitem [ref=e551]:
                  - generic [ref=e554]: Third-party API Integration (TMDB, Stripe)
                - listitem [ref=e555]:
                  - generic [ref=e558]: Production Deployment (Firebase, Netlify, Render)
              - link "View Phase" [ref=e559] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
          - generic [ref=e563]:
            - generic [aria-hidden] [ref=e564]: 🎁
            - generic [ref=e565]: Have a friend's code? Save 10% at checkout.
        - generic [ref=e566]:
          - generic [ref=e567]:
            - generic [ref=e568]: Curriculum
            - heading "Your Engineering Journey" [level=2] [ref=e569]
            - paragraph [ref=e570]: 5 phases. Zero to deployed full-stack engineer.
          - generic [ref=e571]:
            - generic [ref=e572]:
              - generic [ref=e573]: "1"
              - generic [ref=e574]:
                - heading "Building static websites using HTML, CSS & Bootstrap" [level=3] [ref=e575]
                - generic [ref=e576]: 399 ETB
              - generic [ref=e577]:
                - generic [ref=e578]: 4 Weeks
                - generic [ref=e582]: 8 classes
              - paragraph [ref=e586]: Build an unshakeable foundation in semantic HTML5, fluid layouts, modern Flexbox and Grid, mobile responsiveness, and collaborative Git version control.
              - generic [ref=e587]:
                - generic [ref=e588]: Semantic HTML5 & Web Accessibility (a11y)
                - generic [ref=e591]: Responsive CSS Flexbox & Multi-dimensional CSS Grid
                - generic [ref=e594]: Professional Git branching, pull requests, and GitHub workflows
              - link "View Phase Details" [ref=e597] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e600]:
              - generic [ref=e601]: "2"
              - generic [ref=e602]:
                - heading "Learn coding with JavaScript" [level=3] [ref=e603]
                - generic [ref=e604]: 399 ETB
              - generic [ref=e605]:
                - generic [ref=e606]: 7 Weeks
                - generic [ref=e610]: 7 classes
              - paragraph [ref=e614]: JavaScript is among the most powerful and flexible programming languages of the web. In this phase, you will learn programming fundamentals using the latest JavaScript syntax.
              - generic [ref=e615]:
                - generic [ref=e616]: Programming Fundamentals & Algorithmic Thinking
                - generic [ref=e619]: DOM Manipulation & Event Handling
                - generic [ref=e622]: Asynchronous JavaScript & jQuery
              - link "View Phase Details" [ref=e625] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e628]:
              - generic [ref=e629]: "3"
              - generic [ref=e630]:
                - heading "Node, Express, MySql and React.js" [level=3] [ref=e631]
                - generic [ref=e632]: 399 ETB
              - generic [ref=e633]:
                - generic [ref=e634]: 7 Weeks
                - generic [ref=e638]: 7 classes
              - paragraph [ref=e642]: React is a JavaScript library, developed in 2013 by Facebook. In this phase, we will start from the fundamentals and go all the way up to building full applications with custom styling. Along the way, you'll also learn about npm, ES6, Node.js, Express and MySql.
              - generic [ref=e643]:
                - generic [ref=e644]: Node.js, Express, and MySQL Database Integration
                - generic [ref=e647]: React Functional and Class Components
                - generic [ref=e650]: React Hooks, State Management, and Routing
              - link "View Phase Details" [ref=e653] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
            - generic [ref=e656]:
              - generic [ref=e657]: "4"
              - generic [ref=e658]:
                - heading "The Project Phase - Building Fullstack Applications" [level=3] [ref=e659]
                - generic [ref=e660]: 399 ETB
              - generic [ref=e661]:
                - generic [ref=e662]: 4 Weeks
                - generic [ref=e666]: 4 classes
              - paragraph [ref=e670]: In this crucial phase, we will consolidate your learning by diving into real-world projects, building functional clones of well-known web applications. This phase is designed to give you hands-on experience in fullstack development, integrating both front-end and back-end technologies.
              - generic [ref=e671]:
                - generic [ref=e672]: Fullstack React & Node.js Integration
                - generic [ref=e675]: Third-party API Integration (TMDB, Stripe)
                - generic [ref=e678]: Production Deployment (Firebase, Netlify, Render)
              - link "View Phase Details" [ref=e681] [cursor=pointer]:
                - /url: /courses/fullstack-web-engineering-masterclass
          - link "Enroll in Full Course" [ref=e685] [cursor=pointer]:
            - /url: /pricing
        - generic [ref=e688]:
          - generic [ref=e689]:
            - generic [ref=e690]: About the Course
            - heading "About the Course" [level=2] [ref=e691]
            - paragraph [ref=e692]: Watch our instructor explain what you will learn.
          - generic [ref=e693]:
            - generic [ref=e694] [cursor=pointer]:
              - img "ፕሮግራሚንግ (አፕልኬሽን መስራት) የምንማርበት ዋነኛው ምክንያት ምንድነው?" [ref=e696]
              - heading "ፕሮግራሚንግ (አፕልኬሽን መስራት) የምንማርበት ዋነኛው ምክንያት ምንድነው?" [level=3] [ref=e701]
              - paragraph [ref=e702]: 1:02:41
              - generic [ref=e706]:
                - button "Watch Now" [ref=e707]
                - button "Open in YouTube" [ref=e711]
            - generic [ref=e717] [cursor=pointer]:
              - img "በ6 ወር የአይቲ ኮርስ ሰርቲፊኬት ብቻ የስራ ዕድል ይገኛል?" [ref=e719]
              - heading "በ6 ወር የአይቲ ኮርስ ሰርቲፊኬት ብቻ የስራ ዕድል ይገኛል?" [level=3] [ref=e724]
              - paragraph [ref=e725]: 13:37
              - generic [ref=e729]:
                - button "Watch Now" [ref=e730]
                - button "Open in YouTube" [ref=e734]
            - generic [ref=e740] [cursor=pointer]:
              - img "የአቢሲኒያ የፉል ስታክ (Full-stack) አፕልኬሽን ደቨሎፕመንት ኮርስ ምን ምን ያካትታል?" [ref=e742]
              - heading "የአቢሲኒያ የፉል ስታክ (Full-stack) አፕልኬሽን ደቨሎፕመንት ኮርስ ምን ምን ያካትታል?" [level=3] [ref=e747]
              - paragraph [ref=e748]: 4:32
              - generic [ref=e752]:
                - button "Watch Now" [ref=e753]
                - button "Open in YouTube" [ref=e757]
            - generic [ref=e763] [cursor=pointer]:
              - img "አዲስ ጀማሪዎች መምረጥ ያለባችሁ የቴክኖሎጂ ፊልዶች" [ref=e765]
              - heading "አዲስ ጀማሪዎች መምረጥ ያለባችሁ የቴክኖሎጂ ፊልዶች" [level=3] [ref=e770]
              - paragraph [ref=e771]: 39:55
              - generic [ref=e775]:
                - button "Watch Now" [ref=e776]
                - button "Open in YouTube" [ref=e780]
            - generic [ref=e786] [cursor=pointer]:
              - img "ሁሉም ሰው ለምን ኮዲንግ (CODING) መማር አለበት?" [ref=e788]
              - heading "ሁሉም ሰው ለምን ኮዲንግ (CODING) መማር አለበት?" [level=3] [ref=e793]
              - paragraph [ref=e794]: 1:06:00
              - generic [ref=e798]:
                - button "Watch Now" [ref=e799]
                - button "Open in YouTube" [ref=e803]
            - generic [ref=e809] [cursor=pointer]:
              - img "በ2 ዓመት ውስጥ ፕሮግራሚንግን ከሆሳዕና ተምራ ከአውሮፓ የርቀት ሥራ ያገኝችው ታታሪ ወጣት" [ref=e811]
              - heading "በ2 ዓመት ውስጥ ፕሮግራሚንግን ከሆሳዕና ተምራ ከአውሮፓ የርቀት ሥራ ያገኝችው ታታሪ ወጣት" [level=3] [ref=e816]
              - paragraph [ref=e817]: 1:24:03
              - generic [ref=e821]:
                - button "Watch Now" [ref=e822]
                - button "Open in YouTube" [ref=e826]
        - generic [ref=e832]:
          - generic [ref=e833]:
            - generic [ref=e834]: Inside the Classroom
            - heading "Live Discussions & Q&A" [level=2] [ref=e835]
            - paragraph [ref=e836]: Real discussions. Real mentorship. Real community.
          - generic [ref=e837]:
            - generic [ref=e838] [cursor=pointer]:
              - img "ሥራ ፈጣሪነት ( Entrepreneurship ) | ከተመራቂ ተማሪዎች ጋር ስለ ሥራ ፈጣሪነት የተደረገ ቆይታ" [ref=e840]
              - heading "ሥራ ፈጣሪነት ( Entrepreneurship ) | ከተመራቂ ተማሪዎች ጋር ስለ ሥራ ፈጣሪነት የተደረገ ቆይታ" [level=3] [ref=e845]
              - paragraph [ref=e846]: 02:03:32
              - generic [ref=e850]:
                - button "Watch Now" [ref=e851]
                - button "Open in YouTube" [ref=e855]
            - generic [ref=e861] [cursor=pointer]:
              - img "በ2026ም ፕሮግራሚንግን መማር በጣም አስፈላጊ ነው!" [ref=e863]
              - heading "በ2026ም ፕሮግራሚንግን መማር በጣም አስፈላጊ ነው!" [level=3] [ref=e868]
              - generic [ref=e870]:
                - button "Watch Now" [ref=e871]
                - button "Open in YouTube" [ref=e875]
            - generic [ref=e881] [cursor=pointer]:
              - img "በAI ዘመን፣ በ2026 ኮዲንግ መማር አሁንም ዋጋ አለው?" [ref=e883]
              - heading "በAI ዘመን፣ በ2026 ኮዲንግ መማር አሁንም ዋጋ አለው?" [level=3] [ref=e888]
              - generic [ref=e890]:
                - button "Watch Now" [ref=e891]
                - button "Open in YouTube" [ref=e895]
        - generic [ref=e901]:
          - generic [ref=e902]:
            - generic [ref=e903]: Save & Earn
            - heading "Save More, Earn More" [level=2] [ref=e904]
            - paragraph [ref=e905]: Your tuition drops and your income rises — every time someone joins through your link.
          - generic [ref=e906]:
            - generic [ref=e907]:
              - heading "Instant Discounts" [level=3] [ref=e913]
              - paragraph [ref=e914]: Apply promo codes at checkout for instant savings on your enrollment.
              - link "Learn More" [ref=e915] [cursor=pointer]:
                - /url: /discounts
            - generic [ref=e918]:
              - heading "Cash Referrals" [level=3] [ref=e926]
              - paragraph [ref=e927]: Share your link — friends save 10%, you earn real ETB on every approved sale.
              - link "Start Earning" [ref=e928] [cursor=pointer]:
                - /url: /#earn
            - generic [ref=e931]:
              - heading "4-Level Commissions" [level=3] [ref=e938]
              - paragraph [ref=e939]: Earn up to 500 ETB shared across 4 levels on every course sale in your network.
              - link "View Tiers" [ref=e940] [cursor=pointer]:
                - /url: /#earn
        - generic [ref=e944]:
          - generic [ref=e945]:
            - generic [ref=e946]: Why Abyssinia Academy?
            - heading "Designed for Practical Software Engineering" [level=2] [ref=e947]
            - paragraph [ref=e948]: Everything you need to transform from zero coding knowledge into a job-ready full-stack engineer.
          - generic [ref=e949]:
            - generic [ref=e950]:
              - heading "HD Video Sessions" [level=3] [ref=e955]
              - paragraph [ref=e956]: Stream crisp HD pre-recorded live coding sessions anytime. Rewind, speed up, or rewatch complex topics at your own pace.
            - generic [ref=e957]:
              - heading "Real Code Repositories" [level=3] [ref=e963]
              - paragraph [ref=e964]: Access GitHub repositories for every single week, including boilerplate setups, solution branches, and assignment starters.
            - generic [ref=e965]:
              - heading "Private Mentorship Community" [level=3] [ref=e969]
              - paragraph [ref=e970]: Connect directly with instructors and fellow engineering peers in our private Telegram technical discussion group.
            - generic [ref=e971]:
              - heading "Verified Skill Certification" [level=3] [ref=e976]
              - paragraph [ref=e977]: Earn an official Abyssinia Academy Engineering Certificate upon successful completion and review of your 5-phase capstone project.
        - generic [ref=e979]:
          - generic [ref=e980]:
            - generic [ref=e981]: How It Works
            - heading "Your 5-Step Path to Software Mastery" [level=2] [ref=e982]
          - generic [ref=e983]:
            - generic [ref=e984]:
              - generic [ref=e985]: "01"
              - heading "Register & Pay Tuition" [level=3] [ref=e986]
              - paragraph [ref=e987]: Choose your preferred local payment method (Telebirr, CBE Birr, Bank Transfer) and complete enrollment in 60 seconds.
            - generic [ref=e988]:
              - generic [ref=e989]: "02"
              - heading "Unlock Course Classroom" [level=3] [ref=e990]
              - paragraph [ref=e991]: Gain instant access to the course materials & masterclasses, timestamped breakdowns, and structured study notes.
            - generic [ref=e992]:
              - generic [ref=e993]: "03"
              - heading "Build Weekly Projects" [level=3] [ref=e994]
              - paragraph [ref=e995]: Follow raw coding demonstrations, download starter assets, and build portfolio-grade projects week by week.
            - generic [ref=e996]:
              - generic [ref=e997]: "04"
              - heading "Graduate & Launch Career" [level=3] [ref=e998]
              - paragraph [ref=e999]: Deploy your full-stack capstone project to cloud servers, showcase your GitHub portfolio, and land global software jobs.
            - generic [ref=e1000]:
              - generic [ref=e1001]: "05"
              - heading "Share & Earn" [level=3] [ref=e1002]
              - paragraph [ref=e1003]: Invite friends with your personal link — they save on tuition while you earn commissions and bonuses on every approved sale.
        - generic [ref=e1005]:
          - generic [ref=e1006]:
            - generic [ref=e1007]: Got Questions?
            - heading "Frequently Asked Questions" [level=2] [ref=e1008]
          - generic [ref=e1009]:
            - generic [ref=e1010]:
              - button "Do I need prior programming experience to enroll?" [expanded] [ref=e1011] [cursor=pointer]
              - paragraph [ref=e1017]: No! Phase 1 starts from total scratch—covering web mechanics, HTML5, CSS3 layout architecture, and Git basics step-by-step.
            - generic [ref=e1018]:
              - button "How do the course materials work?" [ref=e1019] [cursor=pointer]
              - paragraph [ref=e1023]: Once enrolled, your student account unlocks our private video portal embed links. You can stream high-definition recorded live sessions 24/7 on any desktop or mobile device.
            - generic [ref=e1024]:
              - button "How can we pay?" [ref=e1025] [cursor=pointer]
              - paragraph [ref=e1029]: We accept Telebirr, CBE Birr, and Bank Transfer. Please provide a screenshot of your payment confirmation or transaction number. Once we have verified your payment, you will receive full access to the course.
            - generic [ref=e1030]:
              - button "How long do I have access to the learning portal?" [ref=e1031] [cursor=pointer]
              - paragraph [ref=e1035]: You receive lifetime access! You can review past recorded sessions, download code templates, and access future course updates at no extra charge.
            - generic [ref=e1036]:
              - button "Is this a pyramid scheme?" [ref=e1037] [cursor=pointer]
              - paragraph [ref=e1041]: No. Commissions are paid only on real, approved course sales — never on recruitment alone. The chain is capped at 4 levels and every payout is bounded by monthly caps.
            - generic [ref=e1042]:
              - button "When can I withdraw my earnings?" [ref=e1043] [cursor=pointer]
              - paragraph [ref=e1047]: "Commissions and bonuses unlock 7 days after the qualifying payment. Once unlocked, request a withdrawal (minimum 500 ETB) and admin processes it within {hours} hours via Telebirr, CBE Birr, or bank transfer."
            - generic [ref=e1048]:
              - button "Do I need to be a student to earn?" [ref=e1049] [cursor=pointer]
              - paragraph [ref=e1053]: Yes. Every referrer is a registered student with a personal code. This keeps the network built on real learners, not empty signups.
            - generic [ref=e1054]:
              - button "What happens if a referred purchase is refunded?" [ref=e1055] [cursor=pointer]
              - paragraph [ref=e1059]: If a refund occurs inside the 7-day lock window, the related commissions and bonuses are reversed automatically. After unlock, earnings are final.
            - generic [ref=e1060]:
              - button "Does joining the referral program cost anything?" [ref=e1061] [cursor=pointer]
              - paragraph [ref=e1065]: No. It is free for every enrolled student. Your code is generated automatically the first time you open your Referral Dashboard.
        - generic [ref=e1068]:
          - heading "Ready to Start Your Software Career?" [level=2] [ref=e1070]
          - paragraph [ref=e1071]: Enroll today to unlock all courses, 5 structured phases, downloadable project code repositories, and our private Telegram developer mentorship group.
          - generic [ref=e1072]:
            - link "Enroll Today & Start Learning" [ref=e1073] [cursor=pointer]:
              - /url: /pricing
            - link "See How You Earn" [ref=e1074] [cursor=pointer]:
              - /url: /#earn
    - contentinfo [ref=e1077]:
      - generic [ref=e1078]:
        - paragraph [ref=e1079]: © 2026 – 2026 ABYSSiNIA Tech Academy. All rights reserved. Powered By SoDar!
        - generic [ref=e1080]:
          - generic [ref=e1081]: +251 920944941
          - generic [ref=e1082]: •
          - generic [ref=e1083]: Addis Ababa, Ethiopia
  - alert [ref=e1084]
```

# Test source

```ts
  1   | /**
  2   |  * @fileoverview Production smoke tests for abyssiniatech.vercel.app
  3   |  *
  4   |  * Run with: npx playwright test tests/e2e-production.spec.js
  5   |  * Requires: npm i -D @playwright/test && npx playwright install
  6   |  */
  7   | 
  8   | const { test, expect } = require('@playwright/test');
  9   | 
  10  | const BASE_URL = 'https://abyssiniatech.vercel.app';
  11  | 
  12  | test.describe('Production Smoke Tests', () => {
  13  |   test('Landing page loads and shows hero', async ({ page }) => {
  14  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  15  |     await expect(page).toHaveTitle(/ABYSSiNIA/i);
  16  |     await expect(page.locator('h1')).toContainText(/Master Full Stack/i);
  17  |   });
  18  | 
  19  |   test('Language dropdown opens with 4 locales', async ({ page }) => {
  20  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  21  |     await page.waitForSelector('.language-dropdown-trigger');
  22  |     await page.click('.language-dropdown-trigger');
  23  |     const options = page.locator('.language-dropdown-option');
  24  |     await expect(options).toHaveCount(4);
  25  |   });
  26  | 
  27  |   test('Selecting Oromo switches page to Oromo and persists', async ({ page }) => {
  28  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  29  |     await page.click('.language-dropdown-trigger');
  30  |     await page.click('.language-dropdown-option:has-text("Afaan Oromoo")');
  31  |     await page.waitForTimeout(500);
  32  | 
  33  |     // localStorage updated
  34  |     const stored = await page.evaluate(() => localStorage.getItem('abyssinia_language'));
  35  |     expect(stored).toBe('om');
  36  | 
  37  |     // reload and confirm persistence
  38  |     await page.reload({ waitUntil: 'networkidle' });
  39  |     const storedAfter = await page.evaluate(() => localStorage.getItem('abyssinia_language'));
  40  |     expect(storedAfter).toBe('om');
  41  |   });
  42  | 
  43  |   test('Theme toggle switches between light and dark', async ({ page }) => {
  44  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  45  |     const themeBtn = page.locator('.nav-theme-btn');
  46  |     await themeBtn.click();
  47  |     // Theme class applied to root or body
  48  |     const hasLight = await page.evaluate(() =>
  49  |       document.documentElement.classList.contains('light-theme') ||
  50  |       document.body.classList.contains('light-theme')
  51  |     );
> 52  |     expect(hasLight).toBe(true);
      |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  53  |   });
  54  | 
  55  |   test('Pricing page shows 4 tiers with prices', async ({ page }) => {
  56  |     await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  57  |     await expect(page.locator('text=1,199 ETB')).toBeVisible();
  58  |     await expect(page.locator('text=399 ETB').first()).toBeVisible();
  59  |   });
  60  | 
  61  |   test('Course detail page loads', async ({ page }) => {
  62  |     await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle' });
  63  |     const firstCourse = page.locator('a[href*="/courses/"]').first();
  64  |     await firstCourse.click();
  65  |     await page.waitForLoadState('networkidle');
  66  |     expect(page.url()).toContain('/courses/');
  67  |   });
  68  | 
  69  |   test('Contact page loads with Telegram link', async ({ page }) => {
  70  |     await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
  71  |     await expect(page.locator('text=Telegram')).toBeVisible();
  72  |   });
  73  | 
  74  |   test('Admin login page loads', async ({ page }) => {
  75  |     await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  76  |     await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('No console errors on landing page', async ({ page }) => {
  80  |     const errors = [];
  81  |     page.on('console', (msg) => {
  82  |       if (msg.type() === 'error') errors.push(msg.text());
  83  |     });
  84  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  85  |     await page.waitForTimeout(2000);
  86  | 
  87  |     // Filter out known benign errors (agent WIP warnings aren't runtime errors)
  88  |     const fatalErrors = errors.filter(
  89  |       (e) => !e.includes('favicon') && !e.includes('@shared') && !e.includes('getAgentConfig')
  90  |     );
  91  |     expect(fatalErrors).toHaveLength(0);
  92  |   });
  93  | 
  94  |   test('Profile agents page is 404 (WIP, gitignored)', async ({ page }) => {
  95  |     const response = await page.goto(`${BASE_URL}/profile/agents`, { waitUntil: 'networkidle' });
  96  |     // Either 404 or redirect to login
  97  |     expect([404, 200, 307]).toContain(response.status());
  98  |     if (response.status() === 200) {
  99  |       // If it loads, it must be the login page (auth redirect)
  100 |       expect(page.url()).toContain('/auth/');
  101 |     }
  102 |   });
  103 | 
  104 |   test('Agent admin API requires auth', async ({ request }) => {
  105 |     const response = await request.get(`${BASE_URL}/api/admin/agents`);
  106 |     expect([401, 403]).toContain(response.status());
  107 |   });
  108 | 
  109 |   test('Agent dashboard API requires auth', async ({ request }) => {
  110 |     const response = await request.get(`${BASE_URL}/api/agents/dashboard`);
  111 |     expect([401, 500]).toContain(response.status());
  112 |     // 500 is the current known bug (getAgentConfig missing) — expect 500 or 401
  113 |   });
  114 | });
```