> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Cyberdefense Hackathon #SFTechWeek: event intel

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Checked 8 Oct 2026, the day before the event. **[F]** = verified, with source. **[I]** = inference.

**Bottom line: no prize list, prize wording or event-specific judging criteria have been published anywhere I could reach.** That covers Pi, ClickHouse, Guild and Semgrep alike. The Devpost page probably exists but is private (see §6). Everything about prizes and judging below is either missing or inferred from past tokens& events.

## 1. Basics [F]

Source: https://luma.com/cyberhack (live fetch, 8 Oct 2026)

- **Date and time:** Friday 9 Oct 2026, 9:30 AM–7:30 PM PDT, San Francisco (FiDi). Venue is the **AWS Builder Loft**; exact address shown only after registering.
- **Hosts:** tokens&, AWS Builder Loft, Alessandro Amenta, Jacopo Piazza. Part of SF Tech Week (https://www.tech-week.com/calendar/sf/events/cyberdefense-hackathon-f2f44433-a204-4e98-a346-8cd17a7b97b6).
- **Admission:** host approval required, fully in person, "Solo Builders also" allowed, 18+ only, physical government photo ID required (digital IDs not accepted). The separate AWS registration at https://events.builder.aws.com/B79KK1 is required. No on-site parking; no bikes or scooters inside.
- **Prize pool:** "$30K+ in prizes, cash and credits", from the organizer's LinkedIn post (Alessandro Amenta, https://www.linkedin.com/posts/alessandro-amenta_hosting-a-cyberdefense-hack-next-week-in-activity-7511477658849931264-Qb_t).

## 2. Theme and tracks, verbatim [F]

> As AI gets more capable, so do the threats. AI is reshaping the economics of cyberattacks: vulnerabilities can be found faster, attacks automated, and sophisticated techniques deployed at unprecedented scale. Recent security tests also show frontier AI systems escaping controlled environments and reaching real-world systems.

What You're Building For:
1. **Threat discovery**: find vulnerabilities, misconfigurations, and attack paths before they're exploited
2. **Attack intelligence**: turn fragmented signals into a clear picture of what's happening
3. **Autonomous remediation**: patch, harden, and verify fixes with minimal human intervention
4. **Continuous defense**: systems that monitor, adapt, and respond as threats evolve

**[I]** Tracks 3 and 4 are almost word for word Pi's pitch: "remediate … verify" and "guardrails that adapt".

## 3. Agenda [F]

| Time | Item |
|---|---|
| 9:30 AM | Doors open and opening remarks |
| 11:00 AM | Kickoff and hacking starts |
| 1:30 PM | Lunch |
| **4:30 PM** | **Project submission deadline** (about 5.5 hours of hacking) |
| 5:00 PM | Finalist demos and judging |
| 7:00 PM | Awards and closing |

## 4. Sponsors and partners [F]

There are two slightly different lists.

**Luma "Our Partners"** (8), with each partner's tagline:
- OpenAI: frontier AI research and developer infrastructure
- MongoDB: AI-ready data platform (operational data, search, vectors)
- **Pi: "End to End Agentic Product Security"**
- Akash: open, decentralized GPU cloud
- ElevenLabs: voice and audio AI
- **Guild AI**: "AI infrastructure for building, evaluating, and deploying intelligent systems"
- **ClickHouse**: "High-performance analytics infrastructure … real time"
- **Semgrep**: "Code security tools that help teams find and fix vulnerabilities, exposed secrets, and risky dependencies"

**Organizer's LinkedIn post:**
- "Killer partners onboard": OpenAI · MongoDB · Semgrep · ElevenLabs
- "**Tools and mentorship from** Guild.ai · ClickHouse · Convex · **Pi Security** · Overclock Labs (Akash) · Induction Labs · AWS · Senso"

**[I]** The headline partners are probably prize or cash sponsors, and the "tools and mentorship" names may give credits or prizes only. Pi appears in the **mentorship** group. **I could not verify that a "Best use of Pi" prize exists.** The research brief assumes Pi offers a prize; check the Devpost and the kickoff announcement on the day.

## 5. Speakers and judges [F]

**Speakers:** Corbett Waddingham (Head of DevRel, Guild.ai), Greg Osuri (Founder, Akash), **Guy Arazi (Co-Founder and CEO, Pi)**, Zoe Steinkamp (Senior Developer Advocate, ClickHouse), Milan Williams (Product, Semgrep).

**Judges (11 listed, with more "Loading..."):**

| Judge | Affiliation | Sponsor relevance |
|---|---|---|
| **Mike Caballero** | Engineering @ Pi ("Applying AI in application security") | **Pi** |
| **Rishiraj Chandra** | Software Engineer @ Pi | **Pi** |
| Saptarshi Banerjee | Applied AI Specialist Architect @ OpenAI | OpenAI |
| Corbett Waddingham | Head of DevRel @ Guild.ai | Guild |
| Pradeep Dhananjaya | Tech lead @ AWS | AWS (host) |
| Greg Osuri | Founder @ Akash Network | Akash |
| Dustin Healy | Full Stack SWE @ ClickHouse | ClickHouse |
| Daghan Altas | Head of Product @ Semgrep | Semgrep |
| Pedro S. Lopez | Software Engineering @ Airbyte | General |
| Henry Heng | Co-Founder and CEO, FlowiseAI (Workday) | General |
| Bryce Neil | Co-Founder and CEO, Visibl Semiconductors | General |

**[I]** Pi sends two hands-on **engineers**, not marketing or DevRel. Expect them to look at whether the root-cause, variant and fix logic is real rather than mocked, and whether the fix is correct.

## 6. Devpost status [F, with inference]

- `https://cyberhack.devpost.com/` returns **HTTP 403**, not 404. Firecrawl with a stealth proxy also got 403.
- `https://cybersecurity-hackathon.devpost.com/` also returns **403**.
- 20 or so other slug guesses return 404: cyberdefense, cyberdefense-hackathon, cyber-defense-hackathon, cyberdefense-hack, and others.
- **[I]** On Devpost, a 403 usually means a draft or unpublished challenge. `cyberhack` matches the Luma slug, so it is probably this event's submission site and will open around kickoff.
- `tokensand.com/challenges` (the organizer's "Build Packet" and sponsor-brief page) had **no Cyberdefense sessions** as of 8 Oct. It only lists older Self-Evolving and Loop Engineering sponsor briefs.

## 7. Judging criteria and submission requirements (inferred from the same organizer)

**[F]** Every tokens& Devpost I checked uses the same five equal-weight criteria:
- https://loop-engineering-hackathon.devpost.com/
- https://harness-hack.devpost.com/
- https://ship-to-prod.devpost.com/

| Criterion (20% each) | Exact wording |
|---|---|
| Idea | "Does the solution have the potential to solve a meaningful problem or demonstrate real-world value?" |
| Technical Implementation | "How well was the solution implemented?" |
| Tool Use | "Did the solution effectively use sponsor tools?" (Ship to Prod's version: "use **at least 3** sponsor tools") |
| Presentation (Demo) | "Demonstration of the solution in 3 minutes" |
| Autonomy | "How well does the agent act on real-time data without manual intervention?" |

**[F]** Standard submission requirements: a "3-minute demo recording along with all details required from Devpost" and a **public GitHub repo**. Ship to Prod added "No previous projects allowed" and "Teams can either choose to build their project using the sponsor API models and try to win the prizes based on sponsor tracks."

**[F]** Past sponsor prizes at tokens& events:
- Loop Engineering: Pomerium $1,000 cash; Zero.xyz $2,000 / $500.
- Harness Hack: Guild.ai "Most Innovative Use of Agents" $2,000 (1 × $1,000 + 2 × $500).
- Self-Evolving Agents: Guild.ai $2,000 (1st $1,000, two 2nd places at $500 each).
- Sources: Devpost pages above; https://tokensand.com/challenges

**[I]** Expect this event to use the same five criteria. Sponsor prizes are probably "Best use of X" or "Most innovative use of X" at $500–$2,000 cash or credits. Each sponsor's judges pick their own winner, and an overall top 3 comes from the finalist demos.

## 8. ClickHouse, Guild and Semgrep prize wording at this event

**Not published as of 8 Oct 2026.** Nothing on Luma, LinkedIn, tech-week.com or tokensand.com/challenges, and the Devpost returns 403.

- Most likely wording, based on what each sponsor used at earlier tokens& events (see the other teams' `_TEAM_*.md` files):
  - ClickHouse: "Best Use of ClickHouse".
  - Guild: "Most Innovative Use of Agents (Guild.ai)".
  - Semgrep: "Best Use of Semgrep" was its prize at the AWS AI Agents hackathon.
- **Action for the day:** screenshot the Devpost prize section at kickoff and re-run this file.

## 9. Things to do at kickoff [I]

1. Confirm **whether Pi has a prize**, and its wording: does it say "use of Pi" or a theme such as "best remediation" or "best AppSec agent"?
2. Ask the Pi judges whether a Pi sandbox, API or Sloane access exists for hackers. If not, the prize is judged on thesis fit (see `_PI_WINNER_MODEL.md`).
3. Confirm whether "Tool Use" requires at least 3 sponsor tools, as at Ship to Prod. Then plan to stack ClickHouse, Guild and Semgrep in one project.
4. The submission deadline is 4:30 PM, about 5.5 hours of hacking. Scope accordingly.
