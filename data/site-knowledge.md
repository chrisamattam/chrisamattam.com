# Chris Mattam — site knowledge base

This document is the ENTIRE universe of information the assistant may draw on. Every section header links to the page it came from; cite that path for any claim. If something is not written here, it is not known.

## [Work → Analytics & Data Pipeline](/work/analytics)
Associate PM · Butter Money · July 2025 – May 2026 · Status: shipped

Built and maintained analytics dashboards for all major customer funnels using PostHog. Supplemented with a Python and GitHub Actions data pipeline with an LLM-based data quality layer feeding custom Metabase dashboards.

## [Work → Business Rules Engine](/work/bre)
Associate PM · Butter Money · July 2025 – May 2026 · Status: shipped

Lender eligibility engine powering real-time loan offer generation. The consumer-facing expression is the eligibility calculator; advanced versions are used internally by the ops team and within the partner portal. Encodes lender-specific credit, income, and property rules.

## [Work → B2B Partner Portal](/work/butter-access)
Associate PM · Butter Money · July 2025 – May 2026 · Status: shipped

Replaced WhatsApp-based lead submissions with a structured portal, a 0→1 build that grew partner-submitted leads by 50% within 60 days of launch.

## [Work → Chatbots](/work/chatbots)
Associate PM · Butter Money · July 2025 – May 2026 · Status: shipped

Built and maintained chatbots across WhatsApp, the website, and the channel-partner portal for home loan applicants: status updates, document requests, and onboarding nudges across the application lifecycle.

## [Work → Home Loan Origination System](/work/hlos)
Associate PM · Butter Money · July 2025 – May 2026 · Status: shipped

End-to-end mortgage platform for customers to discover personalised home loan offers and apply digitally. Built for RBI DLG and DPDP Act 2023 compliance while maximising conversion across the application funnel. Backend systems and internal ops tooling handled the full loan processing pipeline.

## [Work → chrisamattam.com](/work/personal-website)
Design & build (solo) · Independent · 2026 · Status: active

The site you're on, designed in Claude Design and built end-to-end with AI tooling. Custom design-token system, MDX content engine, and a mouse-reactive hero.

## Why build it this way

A portfolio should be evidence, not just description. So instead of a template, the site is a from-scratch build that doubles as a working sample of how I ship: tight feedback loops with AI tooling, a real design system, and obsessive attention to the small stuff: empty states, theme transitions, reveal timing, social-share metadata.

## How it's built

- **Next.js (App Router) + TypeScript**, statically prerendered for speed and crawlability.
- **A bespoke design-token system** (colour, type, spacing, motion, radius, shadow) exported from Claude Design and wired into Tailwind. Light mode is a warm paper cream; dark mode mirrors a code-editor charcoal.
- **MDX via Contentlayer** powers the projects, writing, and a 167-book reading library.
- **A canvas hero animation:** flowing, mouse-velocity-reactive contour lines that read the current theme on every frame.
- **Full technical SEO**: sitemap, robots, JSON-LD person schema, and a generated OG share image.

## What it demonstrates

The reconciliation-flow mindset from fintech, applied to a personal site: every page has a back path, every external link is a labelled trust marker, every image has a real cover (not a placeholder), and nothing ships with a broken or `undefined` state.

## [Work → Stable Money Dashboard](/work/stable-money-dashboard)
Solo build · Independent · 2026 · Status: learned

AUM decomposition dashboard tracking Net AUM Growth across Activation, Retention, and Leakage. Built overnight as a proof-of-work artifact.

## [Writing → Why does this website exist?](/writing/why-does-this-website-exist)
2026-07-04

A place to document what I'm learning from building products and companies — why I chose not to automate the writing, and the small agent framework that keeps the rest of the site current.

Building this website has been a long-time goal of mine — a place to document what I'm learning from building products and companies, and a record I can look back on to see how far I've come.

The biggest thing that kept me from starting was writer's block. I've always struggled with perfectionism, and at one point I considered just building an agentic workflow to publish blog posts consistently. I decided against it, for two reasons:

1. **Taste.** I want to be intentional about what I write and share here. I don't want to publish for the sake of publishing — I'd rather share genuine learnings from my work, even if that means publishing less often.
2. **AI is a means, not the end.** The end objective is sharing my learnings and ideas with the world. Agents make that easier, not automatic. Right now, agents handle the repetitive parts of running this site such as updating my reading list, pulling book covers, and so on. The content published to this site aims to be genuine learnings — still figuring out how AI can help in that.

This article isn't perfect, and it doesn't need to be. My last startup taught me one thing above all: build, ship, gather feedback, and rebuild fast. Writing in a vacuum, with no feedback, is pointless. So my goal here is simply to publish something on this site every week.

## How was this website built?

Here's the machinery behind it, for the curious.

The site was built with Claude Code and deployed on Vercel. It's split into four sections:

- **Home** — a summary of what I've done and the projects that have shaped me.
- **Writing** — this blog: learnings and lessons from building products and companies.
- **Reading** — the books and audiobooks I'm currently working through.
- **Work** — my projects, with live links, GitHub repos, and current status.

A small agentic framework keeps the site up to date. One parent agent oversees two sub-agents:

1. **Reading agent** — checks Gmail via the Google Workspace MCP for newly purchased books, confirms they're not already listed, pulls a cover from Google Books or Open Library, and verifies the cover actually matches the title. New books get passed to the parent agent, which opens a GitHub pull request for my review.
2. **Uptime agent** — pings every project link to confirm it's still live and hasn't been retired.

## [Hiking → Gaumukh Glacier](/hiking/gaumukh-glacier)
himalaya · Uttarkashi, Uttarakhand · Difficulty: hard

The snout of the Gangotri glacier — and the climb that humbled me on the way to it.

## Act 1 — The Approach

The journey to Gaumukh Glacier began in Delhi, from where we headed to Rishikesh. The group was mostly my college seniors — and me, the lone junior.

In Rishikesh we spent the evening exploring the city: the famous Ram and Lakshman Jhulas, dinner at the wonderful Chotiwala restaurant, and then rest, already dreading the long travel ahead.

From Rishikesh we switched between two different four-wheel-drive vehicles over a nine-hour drive, and eventually reached Gangotri — a Char Dham site, and the base camp for our trek.

## Act 2 — Basecamp

We spent half a day at Gangotri, resting and mentally preparing for the gruelling trek ahead. We attended the aartis and pujas at the main temple and the ghats, offered our prayers, and headed back to the hotel across the bridge — beneath which an early-monsoon Bhagirathi was raging.

Around evening we met our trek guide, Kamal Bhaiya — Nepali by origin, but who spends the pre-monsoon months here in Uttarakhand guiding hikes like ours. A guide and forestry-department permits were mandatory to go beyond Gaumukh Glacier to Tapovan. We tried to prepare ourselves for the climb the next day — but nothing could actually prepare us for it.

## Act 3 — Rise to the Occasion

The plan was to climb to Bhojbasa, about 4 km short of Gaumukh Glacier, rest there for the night, start early for the glacier where we'd spend an hour or so, and then push on to Tapovan. The route to Bhojbasa had a midpoint — Chirbasa — where we planned to break and recoup.

The climb opened with a brutally steep set of stairs that completely winded me. Five minutes in, I still remember wishing I'd never come — not knowing why I was doing this to myself, or what I stood to gain. The initial effect on my psyche was heavy: we were in a valley climbing what looked like never-ending stairs, surrounded by even taller mountains etching into the heavens — and this was barely a kilometre of the trek.

Kamal Bhaiya knew exactly what these first stretches do to people. He picked the weakest member of the five — me — because he knew that if he got me up the mountain, the others would follow. Somehow I made it past that stretch, and thankfully the next 7–8 km to Chirbasa weren't as much of a mental battle. The initial staircase ended at the entrance to the Gangotri National Park.

At Chirbasa I started showing early signs of AMS (Acute Mountain Sickness) — a splitting headache and real trouble breathing. Kamal Bhaiya called a long break. I'm not exaggerating: I collapsed there, barely able to drink tea, let alone touch the Maggi at the stall. My head was splitting, I could hardly breathe, and I felt like I might throw up at any moment — but I knew not to, because vomiting is a hard red flag that even the guides turn people back for. One of my seniors was in trouble too, showing early AMS signs. The others suggested I turn back to Gangotri with him and wait out the trek — but Kamal Bhaiya said I'd make it.

I really didn't want to give up. I decided to head out first, taking a five-minute head start on the rest of the group. I knew I needed to be alone.

The Himalayas have a way of humbling you — no matter how high you climb, there's always a higher peak.

I walked a long way, crossed groups heading back down, and — oddly — overtook several groups that had started before us. My pace had completely changed: I could barely move at lower altitudes, yet now I was hiking comfortably. It was just me, my thoughts, the wind, my own breathing, and the Bhagirathi raging in the ravine below.

Why had I struggled lower down? Was my body already acclimatising? I doubt it — I still had the headache; it just wasn't my main concern anymore. In that moment I realised the real reason I hadn't slowed down: I had no safety net. No one around me, rocks tumbling somewhere below, a sharp wind cutting through me, and just me. Some 3,600-odd metres above sea level, I realised it was the safety net that had been pulling me down all along — here I had no one, and the choice was to sit and cry or pull up my socks and move. I chose the latter.

Eventually the group reunited at Bhojbasa, and we spent the night at the government guest house.

I was out like a log for hours, until the last call for dinner. Somehow I dragged myself there — I don't even remember what it was, but warm food felt incredible. We hit the bed again soon after, and I had what was probably my soundest sleep in over a year.

## [Hiking → Hemkund Sahib](/hiking/hemkund-sahib)
himalaya · Chamoli, Uttarakhand · Difficulty: hard

A glacial lake and Sikh shrine at 4,300 m, earned by a lung-burning climb.

A steep climb from Ghangaria to a glacial lake and gurudwara at ~4,300 m. The thin air on the final switchbacks is the real test.

_Draft — write-up to come._

## [Hiking → Irshalgad Fort](/hiking/irshalgad-fort)
sahyadri · Raigad, Maharashtra · Difficulty: moderate

A needle-topped pinnacle fort with wide views over Prabalmachi.

A pinnacle fort with a needle-like formation near the summit and wide views over the Prabalmachi region.

_Draft — write-up to come._

## [Hiking → Kalavantin Durg](/hiking/kalavantin-durg)
sahyadri · Raigad, Maharashtra · Difficulty: hard

Rock-cut steps up a near-vertical pinnacle, with nothing but air on either side.

Steps carved straight into a near-vertical pinnacle, no railings. Exposed and thrilling near the top.

_Draft — write-up to come._

## [Hiking → Karnala Fort & Bird Sanctuary](/hiking/karnala-fort)
sahyadri · Raigad, Maharashtra · Difficulty: easy

The home hike — a short forest climb to a thumb-shaped pinnacle, done more times than I can count.

The one I keep coming back to — a short, familiar climb through a bird sanctuary to a fort crowned by its distinctive thumb-shaped pinnacle.

_Draft — write-up to come._

## [Hiking → Mrugagad Fort](/hiking/mrugagad-fort)
sahyadri · Raigad, Maharashtra · Difficulty: easy

A quiet, overgrown fort tucked in the Raigad hills.

A small, lesser-visited fort in the Raigad hills with a quiet, overgrown approach.

_Draft — write-up to come._

## [Hiking → Peb Fort (Vikatgad)](/hiking/peb-fort)
sahyadri · Raigad, Maharashtra · Difficulty: moderate

A forested fort near Matheran where we lost the trail short of the summit.

A forested fort near Matheran. On this attempt we lost the trail and never reached the actual summit — a good reason to go back.

_Draft — write-up to come._

## [Hiking → Prabalgad Fort](/hiking/prabalgad-fort)
sahyadri · Raigad, Maharashtra · Difficulty: moderate

A forested plateau fort neighbouring Kalavantin's pinnacle.

The plateau fort beside Kalavantin, reached through dense forest and a boulder-strewn final stretch.

_Draft — write-up to come._

## [Hiking → Sarasgad Fort](/hiking/sarasgad-fort)
sahyadri · Raigad, Maharashtra · Difficulty: moderate

A steep little fort above Pali, guarded by rock-cut steps.

A steep fort above Pali, guarded by rock-cut steps and bastions.

_Draft — write-up to come._

## [Hiking → Tapovan](/hiking/tapovan-gangotri)
himalaya · Uttarkashi, Uttarakhand · Difficulty: strenuous

A high meadow at the foot of Shivling, above the Gaumukh glacier.

A steep scramble up the glacial moraine beyond Gaumukh to the meadow of Tapovan, in the shadow of Shivling.

_Draft — write-up to come._

## [Hiking → Valley of Flowers](/hiking/valley-of-flowers)
himalaya · Chamoli, Uttarakhand · Difficulty: moderate

A monsoon-fed alpine valley in Uttarakhand that blooms into a carpet of wildflowers.

The trail into the Valley of Flowers starts at Ghangaria and follows the Pushpawati river up a glacial hanging valley. For the first hour it's all forest and river-noise; then the trees fall away and the valley opens into something that doesn't look real — a tilted meadow running for kilometres, stitched with blue poppies, marsh marigolds, and a hundred flowers I couldn't name.

It's a UNESCO World Heritage site, and the rules that come with that are part of what keeps it the way it is: you can walk in for the day, but you can't stay. So the rhythm is a long, unhurried morning up, a few hours in the bloom, and back down to Ghangaria before the light goes.

We paired it with the climb to Hemkund Sahib the next day — the two share Ghangaria as a basecamp, and doing both back to back is the classic way to see this corner of the Garhwal Himalaya.

_This is a reference entry — rewrite it in your own voice._

## [Journey & experience](/)
Career and education timeline

- Jul 2025 – May 2026 — Associate Product Manager at Butter Money: Built a business-rules engine (+47% conversion), launched the ButterAccess B2B portal (60% partner scale-up), and shipped a 0→1 LOS MVP that cut onboarding from 3 hours to 20 minutes.
- Aug – Dec 2024 — R&D Intern — L-CVD Reactor Design & CFD Simulation at Hind High Vacuum (HHV): Ran computational fluid-dynamics simulations for advanced vacuum systems.
- 2024 — Graduated — B.E. Mechanical Engineering at BITS Pilani: Completed the degree.
- 2023 – 2024 — Team ThriveForce at BITS Pilani: Raised ₹30 lakhs in sponsorships; placed 2nd internationally at IIT Bombay Tech Fest 2024.
- Jul 2023 – Jan 2024 — Technical Product Management Intern at Schneider Electric: User & market research for a €200M/yr vertical; BOM optimisation drove a 4% profit lift.
- 2022 – 2024 — Member at Corroboration & Review Committee, BITS Pilani: Selected from 1,000+ students to audit the Student Union's finances.
- Jun – Jul 2022 — Business Analyst Intern at Sriram Automall (SAMIL): Business analysis for India's largest used-vehicle auction marketplace.
- 2020 — Started B.E. Mechanical Engineering at BITS Pilani: Began undergrad at one of India's top engineering institutes.

## [Reading → Library](/reading)
168 books

Chris has logged 168 books (Kindle, Audible, and physical) — the full list with covers is on the reading page. A sample of authors he's read: Albert Camus, Rolf Dobelli, H. G. Wells, Herman Melville, Mark Twain, Roxie Noir, Sun Tzu, Dan Brown, Chris Voss, Tahl Raz, Teresa Torres, Lokesh Kannaiyan, Gagandeep Singh, Bradley J. Edwards, Sean Patrick, Rob Fitzpatrick, René Descartes, Jack Schafer, Sigmund Freud, James Edward Austen-Leigh, Leo Tolstoy, Fyodor Dostoyevsky, Fyodor Mikhailovich Dostoyevsky, Charlotte Brontë, Charlotte Bronte, Emily Brontë, Charles Dickens, William Shakespeare, Andrew Jackson George, William Shakespeare, Ebenezer Charlton Black, Jeff Keller, Adam Smith.
