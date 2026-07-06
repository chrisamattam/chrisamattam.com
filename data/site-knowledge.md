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

The snout of the Gangotri glacier — one of the sources of the Ganga.

The trail from Gangotri through the Gangotri National Park to the glacier snout, where the Bhagirathi emerges from the ice.

_Draft — write-up to come._

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

- The Fall — Albert Camus (Kindle)
- The Art of Thinking Clearly: The Secrets of Perfect Decision-Making — Rolf Dobelli (Kindle)
- The Invisible Man — H. G. Wells (Kindle)
- Moby Dick - classic — Herman Melville (Kindle)
- The Innocents Abroad — Mark Twain (Kindle)
- The Adventures of Tom Sawyer — Mark Twain (Kindle)
- Enemies With Benefits: An Enemies-to-Lovers Romance (Loveless Brothers Romance Book 1) — Roxie Noir (Kindle)
- The Art of War — Sun Tzu (Kindle)
- Deception Point — Dan Brown (Kindle)
- Never Split the Difference: Negotiating as if Your Life Depended on It — Chris Voss, Tahl Raz (Kindle)
- Continuous Discovery Habits — Teresa Torres (Kindle)
- Product Management Simplified: Toolkit to Become a PM — Lokesh Kannaiyan (Kindle)
- Product Management and Strategy: The Ultimate Guide That Creates Real Value — Gagandeep Singh (Kindle)
- Relentless Pursuit: My Fight for the Victims of Jeffrey Epstein — Bradley J. Edwards (Kindle)
- Nikola Tesla: Imagination and the Man That Invented the 20th Century — Sean Patrick (Kindle)
- The Mom Test — Rob Fitzpatrick (Kindle)
- Discourse on the Method of Rightly Conducting One's Reason and of Seeking Truth in the Sciences — René Descartes (Kindle)
- The Truth Detector: An Ex-FBI Agent's Guide for Getting People to Reveal the Truth — Jack Schafer (Kindle)
- Dream Psychology Psychoanalysis for Beginners — Sigmund Freud (Kindle)
- Leonardo da Vinci: A Psychosexual Study of an Infantile Reminiscence — Sigmund Freud (Kindle)
- A General Introduction to Psychoanalysis — Sigmund Freud (Kindle)
- Memoir of Jane Austen — James Edward Austen-Leigh (Kindle)
- War and Peace — Leo Tolstoy (Kindle)
- White Nights and Other Stories: The Novels of Fyodor Dostoevsky Volume X — Fyodor Dostoyevsky (Kindle)
- Notes from Underground — Fyodor Mikhailovich Dostoyevsky (Kindle)
- The Professor — Charlotte Brontë (Kindle)
- Jane Eyre: Enhanced with an Excerpt from The Madwoman Upstairs — Charlotte Bronte (Kindle)
- Wuthering Heights — Emily Brontë (Kindle)
- A Tale of Two Cities — Charles Dickens (Kindle)
- As You Like It — William Shakespeare (Kindle)
- The New Hudson Shakespeare: Julius Caesar — Andrew Jackson George, William Shakespeare, Ebenezer Charlton Black (Kindle)
- The Rape of Lucrece — William Shakespeare (Kindle)
- Venus and Adonis — William Shakespeare (Kindle)
- A Midsummer Night's Dream — William Shakespeare (Kindle)
- A Lover's Complaint — William Shakespeare (Kindle)
- The Winter's Tale — William Shakespeare (Kindle)
- Attitude Is Everything: Change Your Attitude Change Your Life! — Jeff Keller (Kindle)
- An Inquiry into the Nature and Causes of the Wealth of Nations — Adam Smith (Kindle)
- The Complete Novels – Mark Twain: American Classics of Humor Adventure & Social Satire — Mark Twain (Kindle)
- SHADOW OF POWER: A Corporate Conspiracy Thriller (Blackwood Saga Novel Part 1) — VAN BLURR (Kindle)
- Home Field Advantage (Bluestone Lakes Book 2) — Jenn McMahon (Kindle)
- On the Origin of Species — Charles Darwin (Kindle)
- Leo Tolstoy: The Complete Novels and Novellas (EverGreen Classics) — Leo Tolstoy, EverGreen Classics (Kindle)
- Meditations: A New Translation — Marcus Aurelius, Gregory Hays (Kindle)
- The Perfect Wife (A Jessie Hunt Psychological Suspense Thriller—Book One) — Blake Pierce (Kindle)
- The Undying Business: Lead Boldly Build Intelligently Endure Strategically — Mark Chiaravalloti (Kindle)
- Indian Property & Real Estate Law for A Common Man — Sree Krishna Seelam (Kindle)
- Girl Alone (An Ella Dark FBI Suspense Thriller—Book 1) — Blake Pierce (Kindle)
- Meditations — Marcus Aurelius (Kindle)
- Animal Farm — George Orwell (Kindle)
- The Richest Man in Babylon — George S. Clason (Kindle)
- Psychology: Learn Influence And Persuasion And Read Body Language (Advanced NLP Mindset) — Amanda Harvard (Kindle)
- Misunderstood: A Guide To Mental Wellness — Sree Krishna Seelam (Kindle)
- Indian Law For A Common Man — Sree Krishna Seelam (Kindle)
- Think and Grow Rich: The Classic Philosophy of Success and Mindset — Napoleon Hill (Kindle)
- A Teacher's Guide to The Alchemist — Paulo Coelho, Amy Jurskis (Kindle)
- The Girls in the Snow (Nikki Hunt Book 1) — Stacy Green (Kindle)
- Free Your Mind — M.P Neary, M.P Neary (Kindle)
- Pride and Prejudice — Jane Austen (Kindle)
- The Great Gatsby — F. Scott Fitzgerald (Kindle)
- The Art of War (AmazonClassics Edition) — Sun Tzu (Kindle)
- The Rules of Chess — Bruce Pandolfini (Kindle)
- 21 Days of Effective Communication — Ian Tuhovsky (Kindle)
- The Almanack of Naval Ravikant: A Guide to Wealth and Happiness — Eric Jorgenson (Kindle)
- The Agatha Christie Collection — Agatha Christie (Kindle)
- From the Earth to the Moon and Round the Moon — Jules Verne (Kindle)
- Either/Or: A Fragment of Life (Classics) — Soren Kierkegaard (Kindle)
- Myth of Sisyphus and Other Essays — Albert Camus (Kindle)
- Allen Carr's Easy Way to Stop Smoking — Allen Carr (Kindle)
- A Letter to a Hindu — Leo Tolstoy (Kindle)
- De Profundis — Oscar Wilde (Kindle)
- The Holy Bible English Standard Version (with Cross-References) — ESV Bibles (Kindle)
- 23 Minutes — Aleksandr Jarid (Kindle)
- I Will Teach You To Be Rich — Ramit Sethi (Kindle)
- The Definitive Book of Body Language — Allan Pease, Barbara Pease (Kindle)
- The 4-Hour Work Week — Timothy Ferriss (Kindle)
- The Complete Sherlock Holmes — Arthur Conan Doyle (Kindle)
- One Arranged Murder — Chetan Bhagat (Kindle)
- Meditations: A New Translation (Modern Library) — Marcus Aurelius (Kindle)
- The 48 Laws of Power — Robert Greene (Kindle)
- Night (The Night Trilogy Book 1) — Elie Wiesel, Marion Wiesel (Kindle)
- Letter to my Father — Bhagat Singh (Kindle)
- Digital Fortress — Dan Brown (Kindle)
- 12 Rules for Life: An Antidote to Chaos — Jordan B. Peterson (Kindle)
- Atomic Habits — James Clear (Kindle)
- Chanakya — Yagya Sharma (Kindle)
- Cracking the PM Career — Jackie Bavaro, Gayle McDowell (Kindle)
- Cracking the PM Interview — Gayle Laakmann McDowell, Jackie Bavaro (Kindle)
- The 5 AM Club — Robin Sharma (Kindle)
- Good Strategy/Bad Strategy — Richard Rumelt (Audible)
- Agentic Artificial Intelligence — Pascal Bornet, Jochen Wirtz, Thomas H. Davenport et al. (Audible)
- Storytelling with Data — Cole Nussbaumer Knaflic (Audible)
- Zero to One — Blake Masters, Peter Thiel (Audible)
- The Cold Start Problem — Andrew Chen (Audible)
- Escaping the Build Trap — Melissa Perri (Audible)
- The Lean Product Playbook — Dan Olsen (Audible)
- Product Management for Dummies — Brian Lawley, Pamela Schure (Audible)
- The Alignment Problem — Brian Christian (Audible)
- Steve Jobs — Walter Isaacson (Audible)
- Build — Tony Fadell (Audible)
- Read People like a Book — Patrick King (Audible)
- Sun and Steel — Yukio Mishima (Audible)
- Range — David Epstein (Audible)
- Fall in Love with the Problem Not the Solution (Updated Edition) — Uri Levine (Audible)
- Kissinger — Walter Isaacson (Audible)
- Storm Front — Jim Butcher (Audible)
- A Promised Land — Barack Obama (Audible)
- Allen Carr's Easy Way to Quit Smoking — Allen Carr (Audible)
- Barking up the Wrong Tree — Eric Barker (Audible)
- The Let Them Theory — Mel Robbins (Audible)
- The Real Anthony Fauci — Robert F. Kennedy Jr. (Audible)
- Visionary — Graham Hancock (Audible)
- Fingerprints of the Gods — Graham Hancock (Audible)
- Trump: The Art of the Deal — Donald J. Trump, Tony Schwartz (Audible)
- The Alchemist — Paulo Coelho (Audible)
- Discovery of India — Jawaharlal Nehru (Audible)
- Apprenticed to a Himalayan Master — Sri M. (Audible)
- Nuclear War — Annie Jacobsen (Audible)
- Life in the Uniform — Amit Lodha (Audible)
- Never Finished — David Goggins (Audible)
- Meditations — Marcus Aurelius, George Long, Duncan Steen (Audible)
- Endure — Cameron Hanes (Audible)
- Essentialism — Greg McKeown (Audible)
- Doglapan: The Hard Truth about Life and Start-Ups — Ashneer Grover (Audible)
- Living with a SEAL — Jesse Itzler (Audible)
- Challenging Destiny — Medha Deshmukh Bhaskaran (Audible)
- The Tatas — Girish Kuber, Vikrant Pande (Audible)
- 1962: The War That Wasn't — Shiv Kunal Verma (Audible)
- Dopamine Detox — Thibaut Meurisse (Audible)
- Chanakya Neeti (Hindi Edition) — Acharya Chanakya (Audible)
- The Power of Your Subconscious Mind — Joseph Murphy (Audible)
- An Indian Spy in Pakistan — Mohanlal Bhaskar (Audible)
- The Daily Stoic — Ryan Holiday, Stephen Hanselman (Audible)
- The Psychology of Selling — Brian Tracy (Audible)
- Sapiens — Yuval Noah Harari (Audible)
- Can't Hurt Me — David Goggins (Audible)
- The 5 AM Club — Robin Sharma (Audible)
- Rich Dad Poor Dad — Robert T. Kiyosaki (Audible)
- How to Change Your Mind — Michael Pollan (Audible)
- This Is Your Mind On Plants — Michael Pollan (Audible)
- The Courage to Be Disliked — Fumitake Koga, Ichiro Kishimi (Audible)
- Mossad — Michael Bar-Zohar, Nissim Mishal (Audible)
- Not Just an Accountant — Vinod Rai (Audible)
- The Godfather — Mario Puzo (Audible)
- Permanent Record — Edward Snowden (Audible)
- The Monk Who Sold His Ferrari — Robin Sharma (Audible)
- Thinking Fast and Slow — Daniel Kahneman (Audible)
- How to Talk to Anyone — Leil Lowndes (Audible)
- How to Win Friends and Influence People — Dale Carnegie (Audible)
- Atomic Habits — James Clear (Audible)
- Buildit: Building Blinkit in An Evolving India — Albinder Singh Dhindsa (Physical)
- The Unfair Advantage: How You Already Have What It Takes to Succeed —  (Physical)
- Unreasonable Hospitality: The Remarkable Power of Giving People More Than They Expect —  (Physical)
- Crime and Punishment — Fyodor Dostoyevsky (Physical)
- Man and His Symbols — Carl Jung (Physical)
- Passenger to Frankfurt — Agatha Christie (Physical)
- Allen Carr's Easy Way to Stop Smoking — Allen Carr (Physical)
- Bullet for Bullet — Julio Ribeiro (Physical)
- Encounters With Politicians — Anil Swarup (Physical)
- Madam Commissioner: The Extraordinary Life of an Indian Police Chief — Meeran Chadha Borwankar (Physical)
- The India Way: Strategies for an Uncertain World — S. Jaishankar (Physical)
- Cracking the PM Career — Jackie Bavaro, Gayle McDowell (Physical)
- How to Win Friends and Influence People — Dale Carnegie (Physical)
- Transforming the Steel Frame — Vinod Rai (Physical)
- Rethinking Good Governance: Holding to Account India's Public Institutions — Vinod Rai (Physical)
- Seven Decades of Independent India — Vinod Rai (Physical)
- Not Just an Accountant: The Diary of the Nation's Conscience Keeper — Vinod Rai (Physical)
- CULTure at Zomato : How to Rewire Your Brain for Greatness — Deepinder Goyal, Ashish Goel, Naina Sahni (Physical)
