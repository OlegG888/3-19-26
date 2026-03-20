import { useState, useEffect, useCallback, useRef } from "react";
import { track, captureUser, saveUserProgress } from "./analytics";

const DC = {core:"#22c55e",business:"#3b82f6",personal:"#a855f7"};

const F = [
{id:"three-buckets",name:"Three Buckets of Stuck",author:"Seth Godin",domain:"core",bundles:["free"],tagline:"Why you're REALLY stuck (hint: it's not what you think)",teaser:"Diagnose whether you're stuck from skill gaps, misalignment, or fear.",steps:[
{type:"info",id:"intro",title:"The Three Buckets",text:"🏴‍☠️ Most people think they're stuck because they don't know what to do. That's almost never the real reason. There are exactly three buckets: Don't Know How (10%), No Energy / Wrong Thing (30%), and Fear / Avoidance (60%). Let's find yours."},
{type:"question",id:"stuck-on",title:"What's got you stuck?",text:"Describe what you're stuck on right now. Be specific -- not 'my business' but 'I can't get myself to send cold emails.'",inputType:"textarea"},
{type:"choice",id:"bucket",title:"Pick your bucket",text:"Be honest. Which one fits best?",options:["Don't Know How (I literally don't know the steps)","No Energy (I know how but I can't make myself care)","Fear / Avoidance (I know how but something stops me)"]},
{type:"branch",sourceId:"bucket",branches:{
"Don't Know How (I literally don't know the steps)":[
{type:"info",id:"bucket1",title:"Skill Gap",text:"Good news. Easiest bucket to fix. It's just information. Bad news: most people who think they're here are actually in bucket 3."},
{type:"question",id:"skill-gap",title:"What specifically?",text:"What specific skill or piece of information are you missing? Name the exact thing.",inputType:"textarea"},
{type:"action",id:"bucket1-action",title:"Your move",text:"Find ONE resource that teaches {skill-gap}. Schedule 1 hour this week to learn it. Just one hour on the specific gap.",isCommitment:true}
],
"No Energy (I know how but I can't make myself care)":[
{type:"info",id:"bucket2",title:"Misalignment",text:"Your energy is telling you something. You're doing the wrong thing, or the right thing for wrong reasons."},
{type:"question",id:"if-money",title:"The real question",text:"If money weren't an issue and nobody was watching, what would you spend your time on?",inputType:"textarea"},
{type:"action",id:"bucket2-action",title:"Your move",text:"Compare {if-money} to what you're actually doing. If they don't match, that's misalignment. This week: spend 2 hours on {if-money}.",isCommitment:true}
],
"Fear / Avoidance (I know how but something stops me)":[
{type:"info",id:"bucket3",title:"Fear (the real one)",text:"60% of stuck people are here. You know what to do. You have the skills. But something won't let you. Let's find it."},
{type:"question",id:"afraid-of",title:"Name the fear",text:"What specifically are you afraid will happen if you try and fail? Not 'failure' -- what exact scenario scares you?",inputType:"textarea"},
{type:"reflection",id:"bucket3-reflect",title:"The pattern",text:"Your fear is: {afraid-of}. You already know this. The fear isn't the problem. Avoiding it is. Every day you avoid it, fear gets stronger."},
{type:"action",id:"bucket3-action",title:"Your move",text:"Do the smallest possible version of the thing you're avoiding. Send one email. Write one paragraph. Make one call. Today.",isCommitment:true}
]}}
]},
{id:"gap-gain",name:"Gap / Gain",author:"Hardy & Sullivan",domain:"core",bundles:["free"],tagline:"Stop measuring against the ideal. Measure backward.",teaser:"Frustrated despite real progress? You're measuring wrong.",steps:[
{type:"info",id:"intro",title:"The Gap vs The Gain",text:"🏴‍☠️ The Gap is measuring against an ideal you haven't reached. Always feels bad. The Gain is measuring backward from where you started. Always feels good. Most achievers live in the Gap. That's why they're miserable despite winning."},
{type:"question",id:"frustrated-goal",title:"The frustration",text:"What goal are you frustrated about not reaching yet?",inputType:"textarea"},
{type:"question",id:"90-days-ago",title:"90 days ago",text:"Where were you on this exact thing 90 days ago? Be specific with numbers.",inputType:"textarea"},
{type:"reflection",id:"gain-reflect",title:"The Gain",text:"You moved from '{90-days-ago}' to where you are now. That's the Gain. You didn't see it because you were staring at where you're NOT."},
{type:"choice",id:"gap-or-gain",title:"Which one?",text:"Right now -- Gap or Gain?",options:["Gap (I keep comparing to where I should be)","Gain (I see progress from where I started)"]},
{type:"action",id:"three-wins",title:"Your move",text:"Every night this week, write down 3 wins from the day. Not goals. Wins. Do this 7 days and watch your motivation.",isCommitment:true}
]},
{id:"pareto",name:"Pareto 80/20",author:"Pareto",domain:"core",bundles:["free"],tagline:"20% of what you do creates 80% of your results. Find it.",teaser:"You're busy. But most of it doesn't matter.",steps:[
{type:"info",id:"intro",title:"The 80/20 Rule",text:"🏴‍☠️ 20% of what you do produces 80% of your results. The other 80% is noise that feels productive. The fastest path isn't doing more -- it's doing less of the wrong things."},
{type:"question",id:"activities",title:"List everything",text:"List your top 5 activities, projects, or revenue streams. What takes up most of your time?",inputType:"textarea"},
{type:"question",id:"top-one",title:"The one that matters",text:"Which ONE of those 5 drives the most results?",inputType:"text"},
{type:"reflection",id:"pareto-reflect",title:"Your 20%",text:"'{top-one}' is your 20%. What happens if you stop the other 80% and pour that time into '{top-one}'?"},
{type:"question",id:"stop-doing",title:"The hard question",text:"Name ONE thing you could stop doing this week to free up time for '{top-one}'.",inputType:"text"},
{type:"action",id:"pareto-action",title:"Your move",text:"This week: stop doing '{stop-doing}'. Spend that freed time on '{top-one}'. Not gradually. This week.",isCommitment:true}
]},
{id:"five-whys",name:"5 Whys",author:"Toyota / Ohno",domain:"core",bundles:["free"],tagline:"The first stated problem is never the real problem.",teaser:"Surface problems are symptoms. This finds the root cause in 5 questions.",steps:[
{type:"info",id:"intro",title:"Root Cause Analysis",text:"🏴‍☠️ Every problem you state is a symptom. 'I can't get clients' might really be 'I'm afraid of rejection.' We're going 5 levels deep."},
{type:"question",id:"problem",title:"The surface problem",text:"What's the problem you're facing right now?",inputType:"textarea"},
{type:"question",id:"why1",title:"Why #1",text:"Why is that happening?",inputType:"textarea"},
{type:"question",id:"why2",title:"Why #2",text:"And why is THAT happening?",inputType:"textarea"},
{type:"question",id:"why3",title:"Why #3",text:"Go deeper. Why?",inputType:"textarea"},
{type:"question",id:"why4",title:"Why #4",text:"One more. Why?",inputType:"textarea"},
{type:"question",id:"why5",title:"Why #5 (the root)",text:"Last one. This is where the real answer lives. Why?",inputType:"textarea"},
{type:"reflection",id:"root-reflect",title:"Surface vs Root",text:"Surface: '{problem}'. Root: '{why5}'. Most people spend years treating '{problem}' when the real issue is '{why5}'."},
{type:"action",id:"why-action",title:"Your move",text:"One action this week that addresses '{why5}' directly. Not the surface. The root.",isCommitment:true}
]},
{id:"grow",name:"GROW Model",author:"Whitmore",domain:"core",bundles:["free"],tagline:"Four questions that structure any goal conversation.",teaser:"Goal, Reality, Options, Will. The simplest framework that works.",steps:[
{type:"info",id:"intro",title:"The GROW Framework",text:"🏴‍☠️ Four questions. Goal: what do you want? Reality: where are you now? Options: what could you do? Will: what WILL you do? Most people skip to options without clarity on goal or honesty about reality."},
{type:"question",id:"goal",title:"G -- Goal",text:"What do you want to achieve? Be specific. Number and deadline.",inputType:"textarea"},
{type:"question",id:"reality",title:"R -- Reality",text:"Where are you right now? Honest assessment. Numbers, not feelings.",inputType:"textarea"},
{type:"question",id:"options",title:"O -- Options",text:"List 3 possible ways to move from Reality to Goal.",inputType:"textarea"},
{type:"question",id:"will",title:"W -- Will",text:"Which ONE will you commit to THIS WEEK?",inputType:"text"},
{type:"action",id:"grow-action",title:"Your move",text:"'I will work on {will} at [specific time] in [specific place] this week.' Write the time and place. Vague plans fail.",isCommitment:true}
]},
{id:"weekly-planning",name:"Weekly Planning Template",author:"AIBOS",domain:"core",bundles:["free"],tagline:"Plan your week in 5 minutes.",teaser:"A simple weekly planning template.",steps:[
{type:"info",id:"intro",title:"Weekly Reset",text:"🏴‍☠️ Before you plan forward, look backward. Five fields. Five minutes. One focused week."},
{type:"template",id:"weekly",title:"Your Week",fields:[
{label:"Top 3 wins from last week",placeholder:"What went right? Measure in the Gain."},
{label:"#1 goal this week",placeholder:"If you could only accomplish ONE thing..."},
{label:"3 tasks that move the needle",placeholder:"The 20% that creates 80% of results"},
{label:"What I will say NO to this week",placeholder:"What are you stopping or declining?"},
{label:"Accountability: Who am I telling?",placeholder:"Name + how you'll report back"}
]}
]},
{id:"value-equation",name:"Hormozi Value Equation",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Your offer isn't expensive. It's not valuable enough.",teaser:"Four levers that multiply perceived value by 10x.",steps:[
{type:"info",id:"intro",title:"The Value Equation",text:"🏴‍☠️ Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort). Most people only work on Dream Outcome. The denominators often matter more."},
{type:"question",id:"dream-outcome",title:"Dream Outcome",text:"What specific, measurable result does your customer get?",inputType:"textarea"},
{type:"question",id:"likelihood",title:"Perceived Likelihood",text:"Why should they believe it'll work for THEM? What proof?",inputType:"textarea"},
{type:"question",id:"time-delay",title:"Time to First Result",text:"How fast do they get their FIRST result after paying?",inputType:"text"},
{type:"question",id:"effort",title:"Effort Required",text:"How much work does the customer put in? DIY, done-with-you, or done-for-you?",inputType:"text"},
{type:"choice",id:"weakest",title:"Weakest Lever",text:"Which is weakest?",options:["Dream Outcome (unclear or boring)","Likelihood (no proof)","Time Delay (takes too long)","Effort (too hard)"]},
{type:"branch",sourceId:"weakest",branches:{
"Dream Outcome (unclear or boring)":[{type:"action",id:"fix-outcome",title:"Fix it",text:"Rewrite your headline: 'Get [specific result] in [timeframe] without [biggest objection].'",isCommitment:true}],
"Likelihood (no proof)":[{type:"action",id:"fix-proof",title:"Fix it",text:"This week: collect 3 testimonials. If none exist, offer your service free to 3 people for case studies.",isCommitment:true}],
"Time Delay (takes too long)":[{type:"action",id:"fix-speed",title:"Fix it",text:"Add a 'Quick Win' component. What result can they get in 48 hours?",isCommitment:true}],
"Effort (too hard)":[{type:"action",id:"fix-effort",title:"Fix it",text:"Move one step closer to done-for-you. Create templates, swipe files, or automation.",isCommitment:true}]
}}
]},
{id:"grand-slam-offer",name:"Grand Slam Offer",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Make your offer so good people feel stupid saying no.",teaser:"Six components that turn a forgettable offer into one impossible to refuse.",steps:[
{type:"info",id:"intro",title:"The Grand Slam Offer",text:"🏴‍☠️ Six components: dream outcome, high likelihood, fast value, low effort, killer bonuses, risk-removing guarantee. Most offers nail one or two. We're nailing all six."},
{type:"question",id:"current-offer",title:"Your current offer",text:"Describe it in one sentence. What do people get and pay?",inputType:"textarea"},
{type:"question",id:"problems-list",title:"Problems you solve",text:"List every problem your customer has BEFORE, DURING, and AFTER using your product.",inputType:"textarea"},
{type:"question",id:"solutions",title:"Solutions to each",text:"For each problem, what solution could you offer? Templates, tools, access, done-for-you?",inputType:"textarea"},
{type:"question",id:"bonuses",title:"Bonus stack",text:"Which solutions could become bonuses? Name 3-5 that cost you little but feel valuable.",inputType:"textarea"},
{type:"choice",id:"guarantee-type",title:"Guarantee",text:"Which fits your business?",options:["Unconditional (full refund, no questions)","Conditional (refund if they do X and don't get Y)","Anti-guarantee (all sales final, premium)","Performance (we work until you hit the result)"]},
{type:"action",id:"rewrite",title:"Your move",text:"Rewrite your offer with all six components. {bonuses} as bonuses, {guarantee-type} guarantee. Price on value, not cost.",isCommitment:true}
]},
{id:"fast-cash",name:"Fast Cash System",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Need revenue this week? There's money in your existing business.",teaser:"Cash is hiding in your current business. This finds it fast.",steps:[
{type:"info",id:"intro",title:"The Fast Cash System",text:"🏴‍☠️ When revenue is urgent, don't build new things. Four places money hides: past customers, unconverted leads, underpriced offers, and unfulfilled promises."},
{type:"question",id:"past-customers",title:"Past customers",text:"How many past customers? When did you last offer them something new?",inputType:"textarea"},
{type:"question",id:"dead-leads",title:"Unconverted leads",text:"How many leads ghosted in the last 90 days? What was their objection?",inputType:"textarea"},
{type:"question",id:"current-prices",title:"Pricing",text:"When did you last raise prices? What if you raised them 20% tomorrow?",inputType:"textarea"},
{type:"choice",id:"fastest-play",title:"Fastest play",text:"Which can you execute THIS WEEK?",options:["Re-engage past customers","Follow up dead leads (new angle)","Raise prices on next 5 sales","Create a limited-time premium package"]},
{type:"action",id:"fast-cash-action",title:"Your move",text:"Execute your fastest play this week. Set a revenue target. Cash in hand by Friday.",isCommitment:true}
]},
{id:"toc-five-steps",name:"TOC 5 Focusing Steps",author:"Goldratt",domain:"business",bundles:["business-domain"],tagline:"Any improvement not at the bottleneck is an illusion.",teaser:"Your business has ONE constraint. Fix the wrong thing and nothing changes.",steps:[
{type:"info",id:"intro",title:"Theory of Constraints",text:"🏴‍☠️ Your business is a chain. Weakest link determines everything. Identify the constraint. Exploit it. Subordinate everything to it. Elevate it. Repeat."},
{type:"question",id:"revenue-goal",title:"Your goal",text:"Monthly revenue target? And current?",inputType:"text"},
{type:"question",id:"stages",title:"The chain",text:"Map: Lead Gen → Nurture → Sales → Delivery → Retention. Where does flow break?",inputType:"textarea"},
{type:"choice",id:"constraint",title:"The bottleneck",text:"Where is YOUR constraint?",options:["Not enough leads","Leads don't convert to calls","Sales calls don't close","Can't deliver at volume","Customers churn too fast"]},
{type:"branch",sourceId:"constraint",branches:{
"Not enough leads":[{type:"action",id:"fix-leads",title:"Exploit + Elevate",text:"Before new sources: are you maximizing current ones? Post daily? Follow up every inbound? Ask for referrals?",isCommitment:true}],
"Leads don't convert to calls":[{type:"action",id:"fix-nurture",title:"Exploit + Elevate",text:"Following up within 5 minutes? Multiple channels? Add urgency and proof to your booking page.",isCommitment:true}],
"Sales calls don't close":[{type:"action",id:"fix-close",title:"Exploit + Elevate",text:"Record next 5 calls. Listen back. Better qualifying, stronger pain discovery, more proof.",isCommitment:true}],
"Can't deliver at volume":[{type:"action",id:"fix-delivery",title:"Exploit + Elevate",text:"You need systems, not more sales. Write the SOP for your biggest time drain this week.",isCommitment:true}],
"Customers churn too fast":[{type:"action",id:"fix-churn",title:"Exploit + Elevate",text:"Call last 5 churned customers. 'What would have made you stay?' Fix the top reason.",isCommitment:true}]
}}
]},
{id:"kennedy-usp",name:"Kennedy USP Formula",author:"Dan Kennedy",domain:"business",bundles:["business-domain","kennedy"],tagline:"If you can't explain why you're different in one sentence, you're a commodity.",teaser:"Your USP is the reason someone buys from YOU.",steps:[
{type:"info",id:"intro",title:"USP Formula",text:"🏴‍☠️ 'Why should I buy from you instead of anyone else?' If your answer is 'great quality and service,' you don't have a USP."},
{type:"question",id:"competitors",title:"Your competitors",text:"Name top 3 competitors. What do they all claim?",inputType:"textarea"},
{type:"question",id:"different",title:"Your difference",text:"What do you do that NONE of them do?",inputType:"textarea"},
{type:"question",id:"proof",title:"Prove it",text:"What evidence proves your difference is real?",inputType:"textarea"},
{type:"action",id:"usp-write",title:"Write your USP",text:"'Unlike [competitors who {competitors}], we [{different}], which means you [benefit]. Proof: {proof}.' Put this everywhere.",isCommitment:true}
]},
{id:"value-ladder",name:"Brunson Value Ladder",author:"Russell Brunson",domain:"business",bundles:["business-domain","brunson"],tagline:"Don't sell one thing. Build a ladder.",teaser:"Every business needs a path from free to premium.",steps:[
{type:"info",id:"intro",title:"The Value Ladder",text:"🏴‍☠️ One product is a business. A value ladder is an empire. Free → Low → Mid → High → Premium. Each rung solves a bigger problem."},
{type:"question",id:"free-offer",title:"Free (Lead Magnet)",text:"What can you give free that solves a small but real problem?",inputType:"textarea"},
{type:"question",id:"low-ticket",title:"Low Ticket ($7-47)",text:"Low-cost product that solves the NEXT problem?",inputType:"textarea"},
{type:"question",id:"mid-ticket",title:"Mid Ticket ($97-497)",text:"More comprehensive solution?",inputType:"textarea"},
{type:"question",id:"high-ticket",title:"High Ticket ($997+)",text:"Premium done-with-you or done-for-you?",inputType:"textarea"},
{type:"reflection",id:"ladder-reflect",title:"Your ladder",text:"Free: {free-offer} → $7-47: {low-ticket} → $97-497: {mid-ticket} → $997+: {high-ticket}. Each rung leads to the next."},
{type:"action",id:"ladder-action",title:"Your move",text:"Which rung is missing? Build that one this month.",isCommitment:true}
]},
{id:"closer-framework",name:"CLOSER Sales Framework",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Stop pitching. Start diagnosing.",teaser:"A sales framework that feels like coaching, not selling.",steps:[
{type:"info",id:"intro",title:"The CLOSER Framework",text:"🏴‍☠️ C=Clarify why they're here. L=Label the problem. O=Overview past. S=Sell the vacation (outcome). E=Explain concerns. R=Reinforce."},
{type:"question",id:"clarify",title:"C - Clarify",text:"What's the #1 reason prospects reach out? What pain?",inputType:"textarea"},
{type:"question",id:"label",title:"L - Label",text:"How do you label their problem back to them?",inputType:"textarea"},
{type:"question",id:"past-attempts",title:"O - Overview",text:"What have they tried before you? Why did it fail?",inputType:"textarea"},
{type:"question",id:"vacation",title:"S - Sell the vacation",text:"What dream outcome do you paint? Not the process -- the destination.",inputType:"textarea"},
{type:"question",id:"objections",title:"E - Explain",text:"Top 3 objections you hear?",inputType:"textarea"},
{type:"action",id:"closer-action",title:"Your move",text:"Write a one-page CLOSER script. Practice out loud. Use on your next call.",isCommitment:true}
]},
{id:"direction-deficit",name:"Direction Deficit + Mark Protocol",author:"Seth Godin",domain:"business",bundles:["business-domain"],tagline:"You're not tired. You're scattered.",teaser:"Multiple projects at 20% instead of 1 at 100%.",steps:[
{type:"info",id:"intro",title:"Direction Deficit",text:"🏴‍☠️ Performance = Capacity x Regulation x Direction / Load. Imagine a steel wall. Most people try 5 walls and break none."},
{type:"question",id:"initiatives",title:"Current initiatives",text:"How many projects are you working on? List them.",inputType:"textarea"},
{type:"question",id:"committed-to",title:"True commitment",text:"Which ONE if you could only do one for 90 days?",inputType:"text"},
{type:"reflection",id:"deficit-reflect",title:"The deficit",text:"You listed multiple. You chose '{committed-to}'. The gap is your Direction Deficit."},
{type:"action",id:"mark-action",title:"The Mark Protocol",text:"ONE goal: {committed-to}. ONE approach. 90 days. No switching. Tell someone. Pause everything else.",isCommitment:true}
]},
{id:"seven-forces",name:"7 Forces of Business Mastery",author:"Tony Robbins",domain:"business",bundles:["business-domain","robbins"],tagline:"7 systems. One broken = business broken.",teaser:"Rate 7 forces and find the breakdown.",steps:[
{type:"info",id:"intro",title:"The 7 Forces",text:"🏴‍☠️ Like a wheel with 7 spokes. One weak spoke and the whole wheel wobbles."},
{type:"template",id:"seven-forces-audit",title:"Rate each force (1-10)",fields:[
{label:"1. Leadership & Vision",placeholder:"1-10"},{label:"2. Culture & Standards",placeholder:"1-10"},{label:"3. Systems & Processes",placeholder:"1-10"},{label:"4. Raving Fans",placeholder:"1-10"},{label:"5. Strategic Innovation",placeholder:"1-10"},{label:"6. Financial Strategies",placeholder:"1-10"},{label:"7. Meaning & Purpose",placeholder:"1-10"}
]},
{type:"question",id:"lowest-force",title:"The weak spoke",text:"Which scored lowest? What's broken?",inputType:"textarea"},
{type:"action",id:"forces-action",title:"Your move",text:"This month: focus on {lowest-force}. What's the single biggest improvement?",isCommitment:true}
]},
{id:"core-four-leads",name:"Core Four (Lead Generation)",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Four ways to get customers. You need two working.",teaser:"Warm outreach, cold outreach, content, paid ads.",steps:[
{type:"info",id:"intro",title:"The Core Four",text:"🏴‍☠️ Four ways: (1) Warm Outreach (2) Cold Outreach (3) Content (4) Paid Ads. Everything else is a flavor of these."},
{type:"template",id:"core-four-audit",title:"Rate your Core Four",fields:[
{label:"Warm Outreach (referrals, network)",placeholder:"1-10"},{label:"Cold Outreach (DMs, emails, calls)",placeholder:"1-10"},{label:"Content (social, newsletter)",placeholder:"1-10"},{label:"Paid Ads (Meta, Google)",placeholder:"1-10"}
]},
{type:"question",id:"weakest-channel",title:"The gap",text:"Which scored lowest? Why?",inputType:"textarea"},
{type:"choice",id:"next-channel",title:"Rule of 100",text:"Which channel will you commit to?",options:["Warm Outreach (100 messages/day)","Cold Outreach (100 prospects/day)","Content (100 min creating/day)","Paid Ads ($100/day)"]},
{type:"action",id:"core-four-action",title:"Your move",text:"Start the Rule of 100 this week. Track daily.",isCommitment:true}
]},
{id:"hormozi-9-stages",name:"Hormozi 9 Stages of Growth",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Where are you on the growth ladder?",teaser:"Nine stages from $0 to $100M+.",steps:[
{type:"info",id:"intro",title:"The 9 Stages",text:"🏴‍☠️ Every business passes through stages. Each has a different bottleneck. Let's find yours."},
{type:"question",id:"revenue",title:"Current revenue",text:"Current monthly revenue? Be honest.",inputType:"text"},
{type:"question",id:"team-size",title:"Team size",text:"How many people work in your business?",inputType:"text"},
{type:"choice",id:"stage",title:"Your stage",text:"Which stage?",options:["$0-$10K (figuring out what works)","$10K-$100K (it works, now scale it)","$100K-$1M (building systems and team)","$1M+ (leadership and leverage)"]},
{type:"branch",sourceId:"stage",branches:{
"$0-$10K (figuring out what works)":[{type:"info",id:"s1",title:"Your job: sell manually",text:"No funnels. No automation. Direct outreach, direct sales, direct delivery. Prove you can sell."},{type:"action",id:"s1a",title:"Your move",text:"This week: 100 direct outreach attempts. Track every response.",isCommitment:true}],
"$10K-$100K (it works, now scale it)":[{type:"info",id:"s2",title:"Your job: systematize",text:"Document every process. The bottleneck is YOU doing everything."},{type:"action",id:"s2a",title:"Your move",text:"Write SOPs for top 3 tasks. Hire for the one that drains you most.",isCommitment:true}],
"$100K-$1M (building systems and team)":[{type:"info",id:"s3",title:"Your job: build the machine",text:"Your constraint is management and systems."},{type:"action",id:"s3a",title:"Your move",text:"Identify the ONE role that frees the most of your time. Start hiring.",isCommitment:true}],
"$1M+ (leadership and leverage)":[{type:"info",id:"s4",title:"Your job: vision and leverage",text:"Work ON the business, not in it."},{type:"action",id:"s4a",title:"Your move",text:"Block 50% of calendar for strategic work. Delegate operational tasks.",isCommitment:true}]
}}
]},
{id:"magic-naming",name:"MAGIC Naming Formula",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Name your offer so it sells itself.",teaser:"Make a Magnetic Alluring Goal-focused Irresistible Claim.",steps:[
{type:"info",id:"intro",title:"MAGIC Naming",text:"🏴‍☠️ Your offer name does 80% of the selling. MAGIC = Magnetic, Alluring, Goal-focused, Irresistible, Claim. Let's build yours."},
{type:"question",id:"current-name",title:"Current name",text:"What do you currently call your offer?",inputType:"text"},
{type:"question",id:"m-magnetic",title:"M - Magnetic",text:"What word would STOP your ideal customer from scrolling?",inputType:"text"},
{type:"question",id:"a-alluring",title:"A - Alluring",text:"What creates curiosity? Makes them think 'I need to know more'?",inputType:"text"},
{type:"question",id:"g-goal",title:"G - Goal-focused",text:"What specific outcome does the customer want in their words?",inputType:"text"},
{type:"question",id:"timeframe",title:"Timeframe + Method",text:"In what timeframe? Using what unique method?",inputType:"text"},
{type:"action",id:"magic-action",title:"Your move",text:"Combine: '{m-magnetic} {g-goal} {a-alluring}' with {timeframe}. Write 5 variations. Replace '{current-name}' this week.",isCommitment:true}
]},
{id:"hormozi-guarantees",name:"4 Types of Guarantees",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Remove all risk. Watch sales climb.",teaser:"Unconditional, conditional, anti-guarantee, performance.",steps:[
{type:"info",id:"intro",title:"Risk Reversal",text:"🏴‍☠️ Every transaction has risk. Who holds it? The more risk you absorb, the easier the sale."},
{type:"question",id:"current-guarantee",title:"Current guarantee",text:"What guarantee do you offer now?",inputType:"text"},
{type:"question",id:"buyer-fear",title:"Buyer's #1 fear",text:"What's the biggest risk your buyer fears?",inputType:"textarea"},
{type:"choice",id:"gtype",title:"Best fit",text:"Which addresses their fear?",options:["Unconditional (full refund, no questions)","Conditional (refund if they do X, don't get Y)","Anti-guarantee (all sales final, premium)","Performance (keep working until result)"]},
{type:"branch",sourceId:"gtype",branches:{
"Unconditional (full refund, no questions)":[{type:"action",id:"g1",title:"Write it",text:"Draft: 'Try [offer] for [timeframe]. Not thrilled? Full refund.' Put it on your sales page this week.",isCommitment:true}],
"Conditional (refund if they do X, don't get Y)":[{type:"action",id:"g2",title:"Write it",text:"Draft: 'Complete [actions] within [timeframe]. No [result]? Full refund.' Protects you from tire-kickers.",isCommitment:true}],
"Anti-guarantee (all sales final, premium)":[{type:"action",id:"g3",title:"Write it",text:"Draft: 'All sales final. We only work with committed people.' Only works with bulletproof proof.",isCommitment:true}],
"Performance (keep working until result)":[{type:"action",id:"g4",title:"Write it",text:"Draft: 'We don't stop until you hit [result].' Ultimate guarantee. Price accordingly.",isCommitment:true}]
}}
]},
{id:"hormozi-bonuses",name:"Bonus Stacking",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Bonuses worth more than the core offer.",teaser:"Stack bonuses that solve adjacent problems.",steps:[
{type:"info",id:"intro",title:"The Bonus Stack",text:"🏴‍☠️ Great bonuses solve specific problems BEFORE, DURING, or AFTER your core offer."},
{type:"question",id:"core-offer",title:"Core offer",text:"What's your core offer?",inputType:"textarea"},
{type:"question",id:"before-problems",title:"BEFORE problems",text:"Problems before they start? (Prep, mindset, organization)",inputType:"textarea"},
{type:"question",id:"during-problems",title:"DURING problems",text:"Problems while using your product? (Stuck, slow, confused)",inputType:"textarea"},
{type:"question",id:"after-problems",title:"AFTER problems",text:"Problems after? (Maintaining, next steps, advanced)",inputType:"textarea"},
{type:"question",id:"bonus-ideas",title:"Bonus solutions",text:"For each problem, what bonus could you create? Name 3-5.",inputType:"textarea"},
{type:"action",id:"bonus-action",title:"Your move",text:"Create top 3 bonuses from {bonus-ideas}. Name, value, one-line description each. Stack on sales page.",isCommitment:true}
]},
{id:"rule-of-100",name:"Rule of 100",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"100 outreach/day or $100/day in ads.",teaser:"The minimum volume that moves the needle.",steps:[
{type:"info",id:"intro",title:"The Rule of 100",text:"🏴‍☠️ Every day: 100 outreach OR $100 on ads. Not 10. Not 30. 100. Volume solves most lead gen problems."},
{type:"choice",id:"channel",title:"Your channel",text:"Which will you commit to?",options:["100 outreach per day (DMs, emails, calls)","$100/day in paid ads"]},
{type:"branch",sourceId:"channel",branches:{
"100 outreach per day (DMs, emails, calls)":[
{type:"question",id:"conv-rate",title:"Conversion",text:"Of last 100 outreach, how many became sales?",inputType:"text"},
{type:"question",id:"outreach-method",title:"Method",text:"How will you reach 100 daily? Platform?",inputType:"textarea"},
{type:"action",id:"outreach-action",title:"Your move",text:"Tomorrow: 100 via {outreach-method}. Block 2 hours. Track sent/replied/booked/sold. 30 days straight.",isCommitment:true}
],
"$100/day in paid ads":[
{type:"question",id:"ad-platform",title:"Platform",text:"Where? Meta, Google, YouTube, TikTok?",inputType:"text"},
{type:"question",id:"cpl-target",title:"Target CPL",text:"Acceptable cost per lead?",inputType:"text"},
{type:"action",id:"ads-action",title:"Your move",text:"$100/day on {ad-platform}. 3 ad variations. Kill losers after 48h. Scale winners. 14 days minimum.",isCommitment:true}
]}}
]},
{id:"kennedy-10-questions",name:"10 Smart Market Questions",author:"Dan Kennedy",domain:"business",bundles:["business-domain","kennedy"],tagline:"Know your market better than they know themselves.",teaser:"Ten diagnostic questions revealing desires and fears.",steps:[
{type:"info",id:"intro",title:"Market Intelligence",text:"🏴‍☠️ Most businesses guess. Kennedy's questions eliminate guessing. Answer these and you'll know your customer better than their spouse does."},
{type:"question",id:"q1",title:"#1: Up at night",text:"What's their #1 worry or fear RIGHT NOW?",inputType:"textarea"},
{type:"question",id:"q2",title:"#2: Angry about",text:"What makes them furious? What injustice?",inputType:"textarea"},
{type:"question",id:"q3",title:"#3: Daily frustrations",text:"Top 3 daily annoyances related to your market?",inputType:"textarea"},
{type:"question",id:"q4",title:"#4: Secret desire",text:"What do they want but won't admit publicly?",inputType:"textarea"},
{type:"question",id:"q5",title:"#5: Past failures",text:"What have they tried and been disappointed by?",inputType:"textarea"},
{type:"question",id:"q6",title:"#6: Their language",text:"What words do THEY use for their problem? Not your jargon.",inputType:"textarea"},
{type:"reflection",id:"market-reflect",title:"Market profile",text:"Fear: {q1}. Anger: {q2}. Frustration: {q3}. Desire: {q4}. Failures: {q5}. Their words: {q6}. Use THEIR language."},
{type:"action",id:"market-action",title:"Your move",text:"Rewrite homepage headline using {q6}, addressing {q1}, promising {q4}. This week.",isCommitment:true}
]},
{id:"kennedy-ascension",name:"Product Ascension Ladder",author:"Dan Kennedy",domain:"business",bundles:["business-domain","kennedy"],tagline:"Backend revenue is where the real money lives.",teaser:"Map from first purchase to premium backend.",steps:[
{type:"info",id:"intro",title:"The Ascension Ladder",text:"🏴‍☠️ Frontend gets them in. Backend gets you rich. Most businesses have a frontend and... nothing."},
{type:"question",id:"frontend",title:"Frontend offer",text:"Entry-point product? What does it cost?",inputType:"textarea"},
{type:"question",id:"backend",title:"Backend offers",text:"What do you offer AFTER first purchase? (If nothing, say 'nothing.')",inputType:"textarea"},
{type:"question",id:"lifetime-value",title:"Customer lifetime value",text:"Average total spend per customer? Over what period?",inputType:"text"},
{type:"question",id:"gaps",title:"The gaps",text:"Where do customers fall off your ladder?",inputType:"textarea"},
{type:"action",id:"ascension-action",title:"Your move",text:"Create ONE backend offer at 3-5x frontend price. Offer to every buyer within 7 days. Fill the gap at {gaps}.",isCommitment:true}
]},
{id:"kennedy-authority",name:"Authority Roadmap",author:"Dan Kennedy",domain:"business",bundles:["business-domain","kennedy"],tagline:"Build credibility before offers.",teaser:"Step-by-step from unknown to authority.",steps:[
{type:"info",id:"intro",title:"Authority Building",text:"🏴‍☠️ Nobody buys from nobodies. Authority isn't earned over decades -- it's built strategically."},
{type:"question",id:"current-authority",title:"Current credibility",text:"What credentials, results, or proof do you have?",inputType:"textarea"},
{type:"question",id:"niche",title:"Authority niche",text:"What specific topic? (Not 'marketing' -- 'email marketing for SaaS.')",inputType:"text"},
{type:"choice",id:"auth-gap",title:"Biggest gap",text:"What's missing?",options:["Published content (book, articles)","Speaking (podcasts, stages)","Social proof (case studies)","Media / PR (features, press)"]},
{type:"branch",sourceId:"auth-gap",branches:{
"Published content (book, articles)":[{type:"action",id:"pub-action",title:"Your move",text:"One authoritative piece per week on {niche} for 90 days. Consistency > perfection.",isCommitment:true}],
"Speaking (podcasts, stages)":[{type:"action",id:"speak-action",title:"Your move",text:"Pitch 10 podcasts this week. One-page speaker sheet: topic, bio, 3 points.",isCommitment:true}],
"Social proof (case studies)":[{type:"action",id:"proof-action",title:"Your move",text:"Contact 5 best clients. Detailed case study: before, after, numbers.",isCommitment:true}],
"Media / PR (features, press)":[{type:"action",id:"media-action",title:"Your move",text:"Media page on site. Sign up for HARO. 3 journalist queries per week in {niche}.",isCommitment:true}]
}}
]},
{id:"brunson-expert",name:"Expert Development Path",author:"Russell Brunson",domain:"business",bundles:["business-domain","brunson"],tagline:"Where are you on the credibility ladder?",teaser:"Curious → Self-Educated → Tested → Proven → Authority.",steps:[
{type:"info",id:"intro",title:"The Expert Path",text:"🏴‍☠️ Five stages. Most try to sell at stage 2. The money is at stage 4+."},
{type:"question",id:"topic",title:"Your expertise",text:"What topic are you building expertise in?",inputType:"text"},
{type:"choice",id:"stage",title:"Honest assessment",text:"Where are you?",options:["Curious (interested, haven't studied deeply)","Self-Educated (studied, limited practice)","Tested (done it myself, some results)","Proven (results for others, documented)","Authority (market recognizes me)"]},
{type:"branch",sourceId:"stage",branches:{
"Curious (interested, haven't studied deeply)":[{type:"action",id:"e1",title:"Your move",text:"Top 5 books/courses in {topic} in 30 days. Learning journal. Don't sell yet.",isCommitment:true}],
"Self-Educated (studied, limited practice)":[{type:"action",id:"e2",title:"Your move",text:"Get your first real result in {topic}. Document everything. Before/after. Numbers.",isCommitment:true}],
"Tested (done it myself, some results)":[{type:"action",id:"e3",title:"Your move",text:"Help 3 people get results free/cheap. Document each case study.",isCommitment:true}],
"Proven (results for others, documented)":[{type:"action",id:"e4",title:"Your move",text:"Package your method. Name it. Create a framework. Publish everywhere. Pitch podcasts.",isCommitment:true}],
"Authority (market recognizes me)":[{type:"action",id:"e5",title:"Your move",text:"Build a movement. Create a certification. Write the book. Scale through others.",isCommitment:true}]
}}
]},
{id:"brunson-new-opp",name:"New Opportunity vs Improvement",author:"Russell Brunson",domain:"business",bundles:["business-domain","brunson"],tagline:"People want something NEW, not improved.",teaser:"Position as new opportunity, not improvement.",steps:[
{type:"info",id:"intro",title:"New Opportunity",text:"🏴‍☠️ 'Improvement' competes on price. 'New opportunity' creates its own category."},
{type:"question",id:"current-pos",title:"Current positioning",text:"How do you describe your offer? Write the pitch.",inputType:"textarea"},
{type:"choice",id:"pos-type",title:"Honest check",text:"Is your offer...",options:["Improvement (better version of what they've tried)","New Opportunity (completely different approach)","Not sure"]},
{type:"question",id:"old-way",title:"The old way",text:"What's the 'old way' they've tried and failed?",inputType:"textarea"},
{type:"question",id:"new-mechanism",title:"Your new mechanism",text:"What's YOUR unique approach that's different from {old-way}?",inputType:"textarea"},
{type:"reflection",id:"opp-reflect",title:"The reposition",text:"Old: {old-way} (tried, failed). New: {new-mechanism}. Your offer isn't 'better {old-way}.' It's entirely new."},
{type:"action",id:"opp-action",title:"Your move",text:"Rewrite pitch: 'Forget {old-way}. {new-mechanism} is different because [result].' Use this week.",isCommitment:true}
]},
{id:"brunson-movement",name:"Movement Building",author:"Russell Brunson",domain:"business",bundles:["business-domain","brunson"],tagline:"Build a tribe, not a customer list.",teaser:"Identity-based loyalty around one belief.",steps:[
{type:"info",id:"intro",title:"Building a Movement",text:"🏴‍☠️ Customers buy once. Movements buy forever. Three things: a leader with a cause, a Big Domino belief, and an identity shift."},
{type:"question",id:"cause",title:"Your cause",text:"What injustice are you fighting? What's broken?",inputType:"textarea"},
{type:"question",id:"big-domino",title:"Big Domino",text:"ONE belief that makes them buy everything you sell?",inputType:"textarea"},
{type:"question",id:"identity-before",title:"Identity: Before",text:"Who are they BEFORE joining?",inputType:"text"},
{type:"question",id:"identity-after",title:"Identity: After",text:"Who do they BECOME after?",inputType:"text"},
{type:"reflection",id:"move-reflect",title:"Your movement",text:"Fighting: {cause}. Belief: {big-domino}. Shift: '{identity-before}' → '{identity-after}'. They don't leave. They recruit."},
{type:"action",id:"move-action",title:"Your move",text:"Write a 3-paragraph manifesto. Broken status quo → new belief → invitation to become {identity-after}. Publish this week.",isCommitment:true}
]},
{id:"model-of-reality",name:"Model of Reality",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"Every objection is a belief problem.",teaser:"Change the model, change the sale.",steps:[
{type:"info",id:"intro",title:"Model of Reality",text:"🏴‍☠️ They say no because their mental model doesn't include your solution working. Change the model, change the sale."},
{type:"question",id:"top-objection",title:"Top objection",text:"#1 objection? Write it exactly.",inputType:"textarea"},
{type:"question",id:"their-model",title:"Their model",text:"What belief makes that objection logical to THEM?",inputType:"textarea"},
{type:"question",id:"new-model",title:"Better model",text:"What do they need to believe instead?",inputType:"textarea"},
{type:"question",id:"proof-bridge",title:"The bridge",text:"What story or proof shifts them from {their-model} to {new-model}?",inputType:"textarea"},
{type:"action",id:"mor-action",title:"Your move",text:"Next time: don't counter logically. Tell {proof-bridge}. Practice 3 times before your next call.",isCommitment:true}
]},
{id:"persuasional-relativity",name:"Theory of Persuasional Relativity",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"Compared to what?",teaser:"'Too expensive' compared to what?",steps:[
{type:"info",id:"intro",title:"Persuasional Relativity",text:"🏴‍☠️ Nothing is expensive in isolation. Everything is relative. '$1,000 course' vs '$50K in lost revenue.' The frame determines the conclusion."},
{type:"question",id:"price-obj",title:"The objection",text:"Most common price objection? Write it exactly.",inputType:"textarea"},
{type:"question",id:"cost-of-not",title:"Cost of not buying",text:"What does NOT solving this cost per month/year?",inputType:"textarea"},
{type:"question",id:"alt-cost",title:"Alternative costs",text:"What do they spend on inferior alternatives?",inputType:"textarea"},
{type:"action",id:"pr-action",title:"Your move",text:"Write 3 reframes: (1) 'Compared to {cost-of-not}...' (2) 'You already spend {alt-cost} on what doesn't work...' (3) 'Can you afford NOT to?' Use one next call.",isCommitment:true}
]},
{id:"ten-eighty-ten",name:"10-80-10 Theory",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"Price is never the real objection.",teaser:"80% need belief addressed, not budget.",steps:[
{type:"info",id:"intro",title:"The 10-80-10 Split",text:"🏴‍☠️ 10% buy anything. 10% never buy. 80% are persuadable by BELIEFS, not discounts. If you're discounting, you're talking to the wrong segment."},
{type:"question",id:"current-focus",title:"Where's your energy?",text:"Convincing skeptics, serving fans, or nurturing the 80%?",inputType:"textarea"},
{type:"question",id:"beliefs-80",title:"The 80%'s beliefs",text:"What belief stops the persuadable 80%?",inputType:"textarea"},
{type:"question",id:"proof-for-80",title:"Proof that shifts them",text:"What proof or story addresses {beliefs-80}?",inputType:"textarea"},
{type:"action",id:"1080-action",title:"Your move",text:"Stop discounting. Create one piece addressing {beliefs-80} using {proof-for-80}. This week.",isCommitment:true}
]},
{id:"objection-tiers",name:"3 Objection Tiers",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"Price, time, or belief.",teaser:"80% of lost sales are Tier 3 (belief).",steps:[
{type:"info",id:"intro",title:"Objection Tiers",text:"🏴‍☠️ Tier 1: Price. Tier 2: Time. Tier 3: Belief. 80% of 'too expensive' is really 'I don't believe it'll work for ME.'"},
{type:"question",id:"obj1",title:"Top objection",text:"Most common objection? Exact words.",inputType:"textarea"},
{type:"choice",id:"real-tier",title:"Real tier",text:"What are they REALLY saying?",options:["Tier 1: genuinely can't afford it","Tier 2: timing is bad","Tier 3: don't believe it'll work for THEM"]},
{type:"branch",sourceId:"real-tier",branches:{
"Tier 1: genuinely can't afford it":[{type:"action",id:"t1",title:"Your move",text:"Payment plan or smaller entry product. But test: 'If free, would you do it?' Hesitation = Tier 3.",isCommitment:true}],
"Tier 2: timing is bad":[{type:"action",id:"t2",title:"Your move",text:"'What changes in 30 days?' Usually nothing. Offer lock-in-now-start-later. Follow up in 7 days.",isCommitment:true}],
"Tier 3: don't believe it'll work for THEM":[{type:"action",id:"t3",title:"Your move",text:"Proof from someone LIKE THEM. Prepare 3 'someone like you' stories this week.",isCommitment:true}]
}}
]},
{id:"webinar-14-step",name:"14-Step Webinar Framework",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"The $500M+ webinar structure.",teaser:"Fourteen steps from hook to close.",steps:[
{type:"info",id:"intro",title:"14-Step Webinar",text:"🏴‍☠️ Content IS the pitch. Every section reframes beliefs toward the sale."},
{type:"question",id:"topic",title:"Topic",text:"What will you teach? What transformation?",inputType:"textarea"},
{type:"question",id:"big-promise",title:"Big promise",text:"'By the end, you'll know how to [result] without [objection].'",inputType:"textarea"},
{type:"question",id:"three-beliefs",title:"3 belief shifts",text:"3 beliefs they must accept for your offer to be a no-brainer?",inputType:"textarea"},
{type:"question",id:"stack",title:"Offer stack",text:"Core product + bonuses. List with values.",inputType:"textarea"},
{type:"question",id:"close-urgency",title:"Urgency",text:"Limited time? Spots? Bonus deadline?",inputType:"text"},
{type:"action",id:"webinar-action",title:"Your move",text:"Outline: Hook ({big-promise}) → 3 sections ({three-beliefs}) → Stack ({stack}) → Close ({close-urgency}). Slides this week. First run in 14 days.",isCommitment:true}
]},
{id:"fear-of-success",name:"Fear of Success Close",author:"Jason Fladlien",domain:"business",bundles:["business-domain","fladlien"],tagline:"The real block isn't failure.",teaser:"Some sabotage because success changes identity.",steps:[
{type:"info",id:"intro",title:"Fear of Success",text:"🏴‍☠️ Some want the result but sabotage unconsciously. Success changes who they are. Identity change is terrifying."},
{type:"question",id:"prospect-type",title:"Who does this?",text:"Describe the prospect who seems perfect but never buys.",inputType:"textarea"},
{type:"question",id:"identity-threat",title:"Identity threat",text:"If they succeeded, what identity would they lose?",inputType:"textarea"},
{type:"question",id:"social-cost",title:"Social cost",text:"Who might react negatively to their success?",inputType:"textarea"},
{type:"action",id:"fos-action",title:"Your move",text:"When you sense it, name it: 'I think you believe this will work. That's what scares you. Because {identity-threat} is comfortable.' Practice this week.",isCommitment:true}
]},
// ═══ PERSONAL ═══
{id:"future-self",name:"Future Self Visualization",author:"Benjamin Hardy",domain:"personal",bundles:["personal-domain","sullivan"],tagline:"Who do you want to become?",teaser:"Picture yourself 3 years from now.",steps:[
{type:"info",id:"intro",title:"Be Your Future Self Now",text:"🏴‍☠️ Your future self is the most important person in your life. If you can't picture them, you can't become them."},
{type:"question",id:"three-years",title:"3 years from now",text:"Everything went right. Where are you?",inputType:"textarea"},
{type:"question",id:"typical-day",title:"Typical Tuesday",text:"Walk through hour by hour.",inputType:"textarea"},
{type:"question",id:"says-no",title:"What they refuse",text:"What does future-you say NO to that you say YES to now?",inputType:"textarea"},
{type:"question",id:"effortless",title:"Easy for them",text:"What feels hard now but is effortless for future-you?",inputType:"textarea"},
{type:"reflection",id:"future-reflect",title:"The gap",text:"They refuse: {says-no}. They find {effortless} easy. The distance isn't time -- it's decisions."},
{type:"action",id:"future-action",title:"Your move",text:"This week: ONE decision your future self would make. Say no to something from {says-no}.",isCommitment:true}
]},
{id:"robbins-triad",name:"Robbins Triad (State Management)",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Change body, focus, or words -- shift everything.",teaser:"Three levers for instant state change.",steps:[
{type:"info",id:"intro",title:"The Triad",text:"🏴‍☠️ State runs on: physiology, focus, language. Change any one. Fastest? Body."},
{type:"question",id:"energy",title:"Energy check",text:"Energy now, 1-10?",inputType:"text"},
{type:"question",id:"body-now",title:"Physiology",text:"Posture, breathing, tension?",inputType:"textarea"},
{type:"question",id:"focus-now",title:"Focus",text:"What story are you telling yourself?",inputType:"textarea"},
{type:"info",id:"quick-shift",title:"30-Second Shift",text:"NOW: (1) 3 breaths -- inhale 4, hold 4, exhale 8. (2) Stand, shoulders back. (3) Say what you're grateful for."},
{type:"question",id:"after-shift",title:"After",text:"Energy now, 1-10?",inputType:"text"},
{type:"action",id:"triad-action",title:"Your move",text:"30-second protocol before every important task this week.",isCommitment:true}
]},
{id:"six-needs",name:"6 Human Needs Diagnostic",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Every behavior meets a need. Redirect.",teaser:"Can't stop a habit by willpower. Redirect the vehicle.",steps:[
{type:"info",id:"intro",title:"The 6 Needs",text:"🏴‍☠️ Certainty, Variety, Significance, Connection, Growth, Contribution. Any behavior meeting 3+ becomes addictive."},
{type:"question",id:"behavior",title:"The behavior",text:"What do you want to change?",inputType:"text"},
{type:"question",id:"what-it-gives",title:"What it gives",text:"What does {behavior} give you? What would you LOSE?",inputType:"textarea"},
{type:"choice",id:"top-need",title:"Top need",text:"Which need does {behavior} meet most?",options:["Certainty","Variety","Significance","Connection","Growth","Contribution"]},
{type:"question",id:"replacement",title:"The swap",text:"What empowering activity meets {top-need} without the downside?",inputType:"textarea"},
{type:"action",id:"needs-action",title:"Your move",text:"2 weeks: every urge for {behavior}, do {replacement}. Same need, better vehicle.",isCommitment:true}
]},
{id:"dickens-process",name:"Dickens Process (Belief Demolition)",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Feel the cost until change is inevitable.",teaser:"Walk through costs -- past, present, 20 years.",steps:[
{type:"info",id:"intro",title:"The Dickens Process",text:"🏴‍☠️ You know a belief is wrong. But you keep acting on it. We'll make the cost so painful that letting go is easier."},
{type:"question",id:"belief",title:"The belief",text:"What's the limiting belief?",inputType:"textarea"},
{type:"question",id:"past-cost",title:"Past cost",text:"How has it already cost you?",inputType:"textarea"},
{type:"question",id:"present-cost",title:"Present cost",text:"How is it costing you NOW?",inputType:"textarea"},
{type:"question",id:"future-5",title:"5 years forward",text:"Nothing changes. What does life look like?",inputType:"textarea"},
{type:"question",id:"future-20",title:"20 years",text:"Twenty years. What did you give up?",inputType:"textarea"},
{type:"info",id:"interrupt",title:"Break state",text:"Breathe. Stand up. Shake it off. Now comes possibility."},
{type:"question",id:"new-belief",title:"New belief",text:"What's the opposite of '{belief}'?",inputType:"textarea"},
{type:"action",id:"dickens-action",title:"Your move",text:"Write and sign: 'I choose {new-belief}. Starting today.'",isCommitment:true}
]},
{id:"ten-x-thinking",name:"10x Thinking / 80-20 Elimination",author:"Sullivan & Hardy",domain:"personal",bundles:["personal-domain","sullivan"],tagline:"10x is easier than 2x.",teaser:"10x forces elimination. That's where gains hide.",steps:[
{type:"info",id:"intro",title:"The 10x Paradox",text:"🏴‍☠️ 2x: do more. 10x: what would I STOP? Elimination is where gains hide."},
{type:"question",id:"current-20",title:"Your 20%",text:"What 20% produces 80% of results?",inputType:"textarea"},
{type:"question",id:"if-10x",title:"10x question",text:"If goal were 10x bigger, what would you STOP?",inputType:"textarea"},
{type:"question",id:"freedoms",title:"Freedom audit",text:"Rate 1-10: Time? Money? Relationships? Purpose?",inputType:"textarea"},
{type:"reflection",id:"10x-reflect",title:"Elimination list",text:"20%: {current-20}. Stop: {if-10x}. That gap is your list."},
{type:"action",id:"10x-action",title:"Your move",text:"Eliminate ONE thing from {if-10x} this week. Pour time into {current-20}.",isCommitment:true}
]},
{id:"who-not-how",name:"Who Not How",author:"Dan Sullivan",domain:"personal",bundles:["personal-domain","sullivan"],tagline:"Stop asking 'how?' Ask 'who?'",teaser:"Find the Who. Hand them the vision.",steps:[
{type:"info",id:"intro",title:"Who Not How",text:"🏴‍☠️ 'How do I do this?' is a trap. Better: 'Who already knows?'"},
{type:"question",id:"procrastinating",title:"What you're avoiding",text:"What have you procrastinated 2+ weeks?",inputType:"textarea"},
{type:"choice",id:"why-stuck",title:"Why",text:"Why stuck?",options:["Skill gap","Energy drain","Avoidance"]},
{type:"question",id:"who-could",title:"The Who",text:"Who could do this better?",inputType:"text"},
{type:"question",id:"vision",title:"Impact Filter",text:"SUCCESS looks like? FAILURE looks like?",inputType:"textarea"},
{type:"action",id:"who-action",title:"Your move",text:"Reach out to {who-could} this week. Share the vision.",isCommitment:true}
]},
{id:"delusional-confidence",name:"Delusional Confidence",author:"AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"Belief + action = flywheel.",teaser:"Build the belief-action flywheel.",steps:[
{type:"info",id:"intro",title:"Belief-Action Flywheel",text:"🏴‍☠️ Belief → Action → Evidence → Stronger Belief → Bolder Action. Breaks: evidence too slow, or doubt kills belief."},
{type:"question",id:"belief-level",title:"Belief check",text:"1-10, how achievable is your goal?",inputType:"text"},
{type:"question",id:"daily-action",title:"Daily action",text:"Acting EVERY DAY? What does it look like?",inputType:"textarea"},
{type:"question",id:"doubt-trigger",title:"Doubt trigger",text:"When does doubt hit? What triggers it?",inputType:"textarea"},
{type:"question",id:"small-evidence",title:"Evidence",text:"Smallest proof your goal is possible?",inputType:"textarea"},
{type:"reflection",id:"dc-reflect",title:"The distinction",text:"Evidence: {small-evidence}. Doubt: {doubt-trigger}. The doubt is fear in a suit."},
{type:"action",id:"dc-action",title:"Your move",text:"Daily: one growth-zone action. Post, pitch, raise price, call. Every day.",isCommitment:true}
]},
{id:"wheel-of-life",name:"Wheel of Life Assessment",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"One flat tire = can't drive.",teaser:"Rate 10 domains. Find the flat tire.",steps:[
{type:"info",id:"intro",title:"The Wheel of Life",text:"🏴‍☠️ You feel 'off' but can't explain why. The Wheel shows the flat tire."},
{type:"template",id:"wheel-scores",title:"Rate each (1-10)",fields:[
{label:"Health & Fitness",placeholder:"1-10"},{label:"Relationships",placeholder:"1-10"},{label:"Family",placeholder:"1-10"},{label:"Career / Business",placeholder:"1-10"},{label:"Finances",placeholder:"1-10"},{label:"Personal Growth",placeholder:"1-10"},{label:"Fun & Recreation",placeholder:"1-10"},{label:"Physical Environment",placeholder:"1-10"},{label:"Contribution",placeholder:"1-10"},{label:"Spirituality",placeholder:"1-10"}
]},
{type:"question",id:"flat-tire",title:"Flat tire",text:"Lowest? Surprising?",inputType:"textarea"},
{type:"question",id:"ripple",title:"Ripple",text:"If {flat-tire} improved to 7, what else changes?",inputType:"textarea"},
{type:"action",id:"wheel-action",title:"Your move",text:"90-day focus on {flat-tire}. One action by Sunday.",isCommitment:true}
]},
{id:"commitment-deficit",name:"Commitment Deficit Diagnosis",author:"Hormozi / AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"Not strategy. Commitment.",teaser:"Start, boring middle, restart. Sound familiar?",steps:[
{type:"info",id:"intro",title:"Commitment Deficit",text:"🏴‍☠️ Starting feels like progress. Every restart resets compound interest to zero."},
{type:"question",id:"started-stopped",title:"The audit",text:"Started and stopped in 6 months? List them.",inputType:"textarea"},
{type:"question",id:"longest-sustained",title:"Longest streak",text:"Longest effort on one goal?",inputType:"text"},
{type:"question",id:"current-urge",title:"Current urge",text:"Something new calling? Running TOWARD or AWAY from the middle?",inputType:"textarea"},
{type:"reflection",id:"commit-reflect",title:"Pattern",text:"Started/stopped: {started-stopped}. Longest: {longest-sustained}. Committed to zero things five times."},
{type:"action",id:"commit-action",title:"90-Day Lock",text:"ONE thing. Write it. Tell someone. 90 days, no switching.",isCommitment:true}
]},
{id:"priming-ritual",name:"Robbins Priming Ritual",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Manufacture state every morning.",teaser:"10 minutes that rewire your day.",steps:[
{type:"info",id:"intro",title:"Priming",text:"🏴‍☠️ Most let the day happen. Priming: manufacture state before the world touches you."},
{type:"choice",id:"version",title:"Version",text:"Start with?",options:["5-min (breath + gratitude + outcome)","10-15 min full","30-min extended"]},
{type:"info",id:"steps-detail",title:"Protocol",text:"1. BREATH (3 min): 3x30 sharp breaths. 2. GRATITUDE (3 min): 3 moments. 3. HEALING (3 min): Light visualization. 4. THREE TO THRIVE (3 min): 3 outcomes as DONE."},
{type:"question",id:"when-where",title:"When/where",text:"Specific time and place tomorrow?",inputType:"text"},
{type:"action",id:"priming-action",title:"Your move",text:"Tomorrow at {when-where}. Set alarm. 7 days before judging.",isCommitment:true}
]},
{id:"seven-threats",name:"7 Threats to Future Self",author:"Benjamin Hardy",domain:"personal",bundles:["personal-domain","sullivan"],tagline:"Seven things killing the person you're becoming.",teaser:"Identity, past, environment, clarity, emotion, priority, circle.",steps:[
{type:"info",id:"intro",title:"7 Threats",text:"🏴‍☠️ Your future self has seven enemies working right now. Most people only fight one."},
{type:"template",id:"threat-audit",title:"Rate each threat (1-10, how active?)",fields:[
{label:"1. Unclear identity",placeholder:"1-10"},{label:"2. Past narratives",placeholder:"1-10"},{label:"3. Toxic environment",placeholder:"1-10"},{label:"4. Lack of clarity",placeholder:"1-10"},{label:"5. Emotional reactivity",placeholder:"1-10"},{label:"6. Wrong priorities",placeholder:"1-10"},{label:"7. Wrong circle",placeholder:"1-10"}
]},
{type:"question",id:"top-threat",title:"Biggest threat",text:"Highest score? How is it holding you back?",inputType:"textarea"},
{type:"action",id:"threat-action",title:"Your move",text:"One action to neutralize {top-threat} this week.",isCommitment:true}
]},
{id:"frame-floor-focus",name:"Frame / Floor / Focus",author:"Benjamin Hardy",domain:"personal",bundles:["personal-domain","sullivan"],tagline:"Impossible goal. Raise your minimum.",teaser:"Set impossible destination, raise floor, narrow paths.",steps:[
{type:"info",id:"intro",title:"Frame / Floor / Focus",text:"🏴‍☠️ FRAME: impossibly big destination. FLOOR: raise your minimum. FOCUS: fewer paths."},
{type:"question",id:"frame",title:"Frame (impossible goal)",text:"Your 10x goal? So big it scares you.",inputType:"textarea"},
{type:"question",id:"floor",title:"Floor (minimum standard)",text:"What behaviors are now non-negotiable daily?",inputType:"textarea"},
{type:"question",id:"current-paths",title:"Current paths",text:"How many strategies are you pursuing?",inputType:"textarea"},
{type:"question",id:"focus",title:"Focus (one path)",text:"If only ONE path toward {frame}, which?",inputType:"text"},
{type:"reflection",id:"fff-reflect",title:"FFR Statement",text:"FRAME: {frame}. FLOOR: {floor}. FOCUS: {focus}."},
{type:"action",id:"fff-action",title:"Your move",text:"Enforce {floor} daily. Pause everything that isn't {focus}. Write FFR statement and post it.",isCommitment:true}
]},
{id:"robbins-rpm",name:"RPM (Result/Purpose/MAP)",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Plan from outcome backward.",teaser:"Result → Purpose → Massive Action Plan.",steps:[
{type:"info",id:"intro",title:"RPM",text:"🏴‍☠️ Most plan by listing tasks. Backward. Start with RESULT, connect to PURPOSE, THEN action. Purpose fuels follow-through."},
{type:"question",id:"result",title:"Result",text:"Specific outcome? Measurable, deadline.",inputType:"textarea"},
{type:"question",id:"purpose",title:"Purpose",text:"WHY? Emotional reason. How will you FEEL?",inputType:"textarea"},
{type:"question",id:"map-actions",title:"Massive Action Plan",text:"List every possible action. At least 10.",inputType:"textarea"},
{type:"question",id:"top-3",title:"Top 3 leverage actions",text:"Which 3 create most progress with least effort?",inputType:"textarea"},
{type:"reflection",id:"rpm-reflect",title:"Your RPM",text:"RESULT: {result}. PURPOSE: {purpose}. ACTIONS: {top-3}. When motivation fades, re-read Purpose."},
{type:"action",id:"rpm-action",title:"Your move",text:"Execute action #1 from {top-3} TODAY. Tape RPM to wall.",isCommitment:true}
]},
{id:"robbins-nac",name:"Neuro-Associative Conditioning",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Rewire at the neurological level.",teaser:"Six steps: decide, leverage, interrupt, create, condition, test.",steps:[
{type:"info",id:"intro",title:"NAC",text:"🏴‍☠️ Six steps: Decide. Leverage (make pain of staying > pain of changing). Interrupt. Create alternative. Condition. Test."},
{type:"question",id:"nac-behavior",title:"Behavior to change",text:"What specific behavior?",inputType:"text"},
{type:"question",id:"leverage-pain",title:"Pain of staying",text:"Cost in 1, 5, 10 years if you DON'T change?",inputType:"textarea"},
{type:"question",id:"leverage-pleasure",title:"Pleasure of changing",text:"Gain in 1, 5, 10 years if you DO?",inputType:"textarea"},
{type:"question",id:"pattern-interrupt",title:"Pattern interrupt",text:"What breaks the pattern the MOMENT the urge hits?",inputType:"textarea"},
{type:"question",id:"new-behavior",title:"New behavior",text:"What INSTEAD of {nac-behavior}? Must feel good.",inputType:"textarea"},
{type:"action",id:"nac-action",title:"Your move",text:"21 days: trigger → {pattern-interrupt} → {new-behavior}. Track daily. Day 1 is today.",isCommitment:true}
]},
{id:"identity-protection",name:"Procrastination as Identity Protection",author:"AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"Not lazy. Protecting self-image.",teaser:"Never try = never fail publicly.",steps:[
{type:"info",id:"intro",title:"Identity Armor",text:"🏴‍☠️ You're not lazy. You're procrastinating because trying and failing threatens your identity. If you never launch, you never fail."},
{type:"question",id:"avoiding",title:"What you're avoiding",text:"What should you do that you keep putting off?",inputType:"textarea"},
{type:"question",id:"identity-at-risk",title:"Protected identity",text:"If you tried {avoiding} and FAILED publicly, what would that mean about you?",inputType:"textarea"},
{type:"reflection",id:"ip-reflect",title:"The real game",text:"You're not avoiding {avoiding}. You're avoiding: {identity-at-risk}. The armor holds but keeps you stuck."},
{type:"question",id:"beginner-ok",title:"Permission to be bad",text:"Can you be a BEGINNER? Fail publicly and survive?",inputType:"textarea"},
{type:"action",id:"ip-action",title:"Your move",text:"Do the WORST version of {avoiding}. Not good. Rough. Ship it. Prove you survive.",isCommitment:true}
]},
{id:"ambition-calibrator",name:"Ambition Calibrator",author:"AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"10x destination. 0.1x next step.",teaser:"Dream big. Step tiny.",steps:[
{type:"info",id:"intro",title:"Calibration",text:"🏴‍☠️ Most goals are boringly realistic AND next steps are overwhelmingly big. Flip both."},
{type:"question",id:"10x-dream",title:"10x dream",text:"Biggest, most audacious version of your goal?",inputType:"textarea"},
{type:"question",id:"current-next",title:"Current next step",text:"The step you've been avoiding because it's too big?",inputType:"textarea"},
{type:"question",id:"01x-step",title:"0.1x version",text:"Shrink it to 5 minutes or less. Laughably small.",inputType:"textarea"},
{type:"reflection",id:"cal-reflect",title:"Calibrated",text:"Dream: {10x-dream}. Next step: {01x-step}. Dream pulls. Tiny step moves."},
{type:"action",id:"cal-action",title:"Your move",text:"Do {01x-step} RIGHT NOW. Then tomorrow. Stack tiny wins.",isCommitment:true}
]},
// ═══ REMAINING STUBS ═══
{id:"eca-method",name:"ECA Method",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"External, Customer, Assessment.",teaser:"Three lenses to audit any offer.",steps:[]},
{id:"business-genie",name:"Business Genie Framework",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"How do you double revenue?",teaser:"Find your next revenue doubling lever.",steps:[]},
{id:"onion-of-blame",name:"Onion of Blame",author:"Alex Hormozi",domain:"business",bundles:["business-domain","hormozi"],tagline:"Peel back why sales aren't closing.",teaser:"Five layers: market, offer, leads, process, salesperson.",steps:[]},
{id:"kennedy-referral",name:"Referral System",author:"Dan Kennedy",domain:"business",bundles:["business-domain","kennedy"],tagline:"Customers as sales force.",teaser:"Referral generation on autopilot.",steps:[]},
{id:"brunson-big-domino",name:"Big Domino",author:"Russell Brunson",domain:"business",bundles:["business-domain","brunson"],tagline:"One belief makes all objections fall.",teaser:"The master belief.",steps:[]},
{id:"robbins-money-psych",name:"Money Psychology 80/20",author:"Tony Robbins",domain:"business",bundles:["business-domain","robbins"],tagline:"80% psychology. 20% mechanics.",teaser:"Income ceiling = belief problem.",steps:[]},
{id:"throughput-accounting",name:"Throughput Accounting",author:"Goldratt",domain:"business",bundles:["business-domain"],tagline:"Revenue minus variable costs.",teaser:"Three numbers that matter.",steps:[]},
{id:"robbins-incantations",name:"Incantations",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"Full-body power declarations.",teaser:"Physical intensity bypasses resistance.",steps:[]},
{id:"robbins-values",name:"Values / Rules / Beliefs Redesign",author:"Tony Robbins",domain:"personal",bundles:["personal-domain","robbins"],tagline:"What must happen to feel successful?",teaser:"Discover hidden rules. Rewrite them.",steps:[]},
{id:"cbt-reframing",name:"CBT Cognitive Reframing",author:"Beck",domain:"personal",bundles:["personal-domain"],tagline:"Challenge the thought.",teaser:"Find distortions. Replace with evidence.",steps:[]},
{id:"comfort-zone-map",name:"Comfort Zone Map",author:"AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"Comfort, growth, panic.",teaser:"Map your zone.",steps:[]},
{id:"edison-principle",name:"Edison Principle",author:"AIBOS",domain:"personal",bundles:["personal-domain"],tagline:"Step so small you can't say no.",teaser:"Stuck = step too big. Shrink it.",steps:[]},
{id:"implementation-intentions",name:"91% Rule",author:"Gollwitzer",domain:"personal",bundles:["personal-domain"],tagline:"WHEN and WHERE, not just WHAT.",teaser:"Specify when/where = 91% follow-through.",steps:[]}
];

const CODES={"CC-BIZ-8K3Q":["business-domain"],"CC-PRS-2M7J":["personal-domain"],"CC-HRM-7X9K":["hormozi"],"CC-RBN-4M2P":["robbins"],"CC-SLV-5N8R":["sullivan"],"CC-FLD-3P6W":["fladlien"],"CC-KND-9Q4T":["kennedy"],"CC-BRN-6V2L":["brunson"],"CC-ALL-1A8Z":["business-domain","personal-domain","hormozi","robbins","sullivan","fladlien","kennedy","brunson"]};
const BUNDLES=[
{id:"business-domain",name:"Business Premium",price:37,desc:"25+ business frameworks from Hormozi, Kennedy, Brunson, Robbins.",color:"#3b82f6",url:"https://cyber-corsairs.beehiiv.com/upgrade/business-premium"},
{id:"personal-domain",name:"Personal Premium",price:37,desc:"20+ personal frameworks from Robbins, Sullivan, Hardy.",color:"#a855f7",url:"https://cyber-corsairs.beehiiv.com/upgrade/personal-premium"},
{id:"hormozi",name:"Hormozi Pack",price:19,desc:"All Hormozi frameworks.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/hormozi-pack"},
{id:"robbins",name:"Robbins Pack",price:19,desc:"All Robbins frameworks.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/robbins-pack"},
{id:"sullivan",name:"Sullivan / Hardy Pack",price:15,desc:"Future Self, 10x, Who Not How.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/sullivan-pack"},
{id:"fladlien",name:"Fladlien Pack",price:15,desc:"Model of Reality, Persuasion, Objections.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/fladlien-pack"},
{id:"kennedy",name:"Kennedy Pack",price:15,desc:"Market Questions, USP, Authority.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/kennedy-pack"},
{id:"brunson",name:"Brunson Pack",price:15,desc:"Value Ladder, Expert Path, Movement.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/brunson-pack"},
{id:"all-access",name:"All-Access Bundle",price:79,desc:"Everything. All frameworks. All future additions.",color:"#f59e0b",url:"https://cyber-corsairs.beehiiv.com/upgrade/all-access",highlight:true}
];

const initState=()=>{try{const s=JSON.parse(localStorage.getItem("aibos-state")||"null");if(s)return{...s,unlockedBundles:[...new Set(["free",...(s.unlockedBundles||[])])]}}catch{}return{unlockedBundles:["free"],completedFrameworks:[],userResponses:{},commitments:[]}};

export default function App(){
  const[tab,_setTab]=useState("dashboard");
  const setTab=(t:string)=>{track("tab_switch",{tab:t});_setTab(t)};
  const[state,setState]=useState(initState);
  const[activeF,setActiveF]=useState(null);
  const[stepIdx,setStepIdx]=useState(0);
  const[filter,setFilter]=useState("all");
  const[code,setCode]=useState("");
  const[toast,setToast]=useState("");
  const[codeErr,setCErr]=useState(false);
  const[waitEmail,setWaitEmail]=useState("");
  const[userEmail,setUserEmail]=useState<string|null>(null);
  const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:400);
  const scrollRef=useRef(null);

  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
  useEffect(()=>{captureUser().then(e=>{if(e)setUserEmail(e)})},[]);

  const desk=w>=768;
  const wide=w>=1024;

  const upd=useCallback(fn=>{setState(prev=>{const next=fn(prev);localStorage.setItem("aibos-state",JSON.stringify(next));return next})},[]);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=0},[stepIdx,activeF]);

  const isUnlocked=fw=>fw.bundles.some(b=>state.unlockedBundles.includes(b));
  const isComplete=fw=>state.completedFrameworks.includes(fw.id);
  const isStub=fw=>fw.steps.length===0;
  const resolve=(txt,fid)=>txt?txt.replace(/\{([^}]+)\}/g,(m,id)=>state.userResponses[fid]?.[id]||m):txt;
  const flatSteps=fw=>{const out=[];const p=steps=>{for(const s of steps){if(s.type==="branch"){const a=state.userResponses[fw.id]?.[s.sourceId];if(a&&s.branches[a])p(s.branches[a])}else out.push(s)}};p(fw.steps);return out};
  const setResp=(fid,sid,val)=>upd(p=>({...p,userResponses:{...p.userResponses,[fid]:{...(p.userResponses[fid]||{}),[sid]:val}}}));
  const addCommitment=(fid,txt)=>upd(p=>({...p,commitments:[...p.commitments,{frameworkId:fid,text:txt,date:new Date().toISOString().slice(0,10)}]}));
  const completeF=fid=>{const fw=F.find(f=>f.id===fid);track("framework_completed",{framework_id:fid,framework_name:fw?.name||fid,domain:fw?.domain||"",author:fw?.author||""});if(userEmail)saveUserProgress(userEmail,fid,fw?.name||fid);upd(p=>({...p,completedFrameworks:[...new Set([...p.completedFrameworks,fid])]}));};
  const restartF=fid=>{track("framework_restarted",{framework_id:fid});upd(p=>{const ur={...p.userResponses};delete ur[fid];return{...p,completedFrameworks:p.completedFrameworks.filter(x=>x!==fid),userResponses:ur}});};

  const unlockCode=()=>{const c=code.trim().toUpperCase();if(CODES[c]){track("unlock_code_success",{code:c,bundles:CODES[c].join(",")});upd(p=>({...p,unlockedBundles:[...new Set([...p.unlockedBundles,...CODES[c]])]}));setToast("🎉 Unlocked!");setCode("");setCErr(false);setTimeout(()=>setToast(""),3000)}else{track("unlock_code_failed");setCErr(true);setTimeout(()=>setCErr(false),1500)}};

  const openF=fw=>{if(!isUnlocked(fw)){track("framework_locked_click",{framework_id:fw.id,framework_name:fw.name,domain:fw.domain});setTab("store");return}if(isStub(fw))return;track("framework_started",{framework_id:fw.id,framework_name:fw.name,domain:fw.domain,author:fw.author,is_free:fw.bundles.includes("free")});setActiveF(fw);const steps=flatSteps(fw);let resume=0;for(let i=0;i<steps.length;i++){const s=steps[i];if(s.type==="question"||s.type==="choice"){if(state.userResponses[fw.id]?.[s.id])resume=i+1;else break}else if(s.type==="template"){if(state.userResponses[fw.id]?.[s.id+"_field_0"])resume=i+1;else break}else resume=i}if(isComplete(fw))resume=0;setStepIdx(Math.min(resume,steps.length-1))};

  // ─── STEP RENDERER ───
  const renderStep=fw=>{
    const steps=flatSteps(fw),s=steps[stepIdx];if(!s)return null;
    const total=steps.length,isLast=stepIdx===total-1,fid=fw.id,col=DC[fw.domain],resp=state.userResponses[fid]||{};
    const canNext=()=>{if(s.type==="info"||s.type==="reflection"||s.type==="action")return true;if(s.type==="question")return!!resp[s.id]?.trim();if(s.type==="choice")return!!resp[s.id];if(s.type==="template")return s.fields.some((_,i)=>resp[s.id+"_field_"+i]?.trim());return true};
    const goNext=()=>{track("step_completed",{framework_id:fid,step_id:s.id,step_type:s.type,step_number:stepIdx+1,total_steps:total});if(s.type==="action"&&s.isCommitment)addCommitment(fid,resolve(s.text,fid));if(isLast){completeF(fid);setActiveF(null);return}setStepIdx(stepIdx+1)};
    const maxW=desk?640:480;
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",maxWidth:maxW,margin:"0 auto",width:"100%"}}>
        <div style={{height:4,background:"#334155",flexShrink:0}}><div style={{height:4,background:col,width:`${((stepIdx+1)/total)*100}%`,transition:"width 0.3s"}}/></div>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #334155",flexShrink:0}}>
          <button onClick={()=>setActiveF(null)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:20,cursor:"pointer",padding:0}}>←</button>
          <span style={{color:"#94a3b8",fontSize:13}}>Step {stepIdx+1} of {total}</span>
          <span style={{marginLeft:"auto",fontSize:12,color:col,fontWeight:600}}>{fw.name}</span>
        </div>
        <div ref={scrollRef} style={{flex:1,overflow:"auto",padding:desk?"24px 32px":"16px"}}>
          <h3 style={{color:"#f1f5f9",margin:"0 0 12px",fontSize:desk?20:18}}>{s.title}</h3>
          {(s.type==="info"||s.type==="reflection"||s.type==="action")&&<div style={{borderLeft:`4px solid ${col}`,paddingLeft:14,color:"#cbd5e1",lineHeight:1.7,fontSize:15,whiteSpace:"pre-wrap"}}>{resolve(s.text,fid)}</div>}
          {s.type==="question"&&<><p style={{color:"#cbd5e1",lineHeight:1.6,fontSize:15,margin:"0 0 12px"}}>{resolve(s.text,fid)}</p>
          {s.inputType==="textarea"?<textarea value={resp[s.id]||""} onChange={e=>setResp(fid,s.id,e.target.value)} placeholder="Type your answer..." rows={4} style={{width:"100%",background:"#0f172a",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",padding:12,fontSize:15,resize:"vertical",boxSizing:"border-box"}}/>
          :<input value={resp[s.id]||""} onChange={e=>setResp(fid,s.id,e.target.value)} placeholder="Type your answer..." style={{width:"100%",background:"#0f172a",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",padding:12,fontSize:15,boxSizing:"border-box"}}/>}</>}
          {s.type==="choice"&&<><p style={{color:"#cbd5e1",lineHeight:1.6,fontSize:15,margin:"0 0 12px"}}>{resolve(s.text,fid)}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{s.options.map(o=><button key={o} onClick={()=>setResp(fid,s.id,o)} style={{padding:"12px 14px",borderRadius:8,border:resp[s.id]===o?`2px solid ${col}`:"2px solid #475569",background:resp[s.id]===o?col+"18":"#0f172a",color:"#f1f5f9",textAlign:"left",fontSize:14,cursor:"pointer",lineHeight:1.4}}>{o}</button>)}</div></>}
          {s.type==="template"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>{s.fields.map((f,i)=><div key={i}><label style={{color:"#94a3b8",fontSize:13,fontWeight:600,marginBottom:4,display:"block"}}>{f.label}</label><textarea value={resp[s.id+"_field_"+i]||""} onChange={e=>setResp(fid,s.id+"_field_"+i,e.target.value)} placeholder={f.placeholder} rows={2} style={{width:"100%",background:"#0f172a",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",padding:10,fontSize:14,resize:"vertical",boxSizing:"border-box"}}/></div>)}</div>}
        </div>
        <div style={{padding:16,borderTop:"1px solid #334155",flexShrink:0}}>
          <button onClick={goNext} disabled={!canNext()} style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",fontWeight:700,fontSize:16,cursor:canNext()?"pointer":"not-allowed",background:canNext()?(isLast?col:`linear-gradient(135deg,${col},${col}cc)`):"#475569",color:canNext()?"#fff":"#94a3b8",opacity:canNext()?1:0.6}}>{isLast?"🏁 Finish":"Next →"}</button>
        </div>
      </div>
    );
  };

  // ─── CARD ───
  const FCard=({fw})=>{const unlocked=isUnlocked(fw),complete=isComplete(fw),stub=isStub(fw),col=DC[fw.domain];return(
    <div style={{background:"#1e293b",borderRadius:12,padding:desk?20:16,border:`1px solid ${unlocked?"#334155":"#47556980"}`,opacity:unlocked?1:0.7}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:14}}>{unlocked?(complete?"✅":"🔓"):"🔒"}</span>
        <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99,background:col+"22",color:col,textTransform:"uppercase"}}>{fw.domain}</span>
        <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>{fw.author}</span>
      </div>
      <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontSize:desk?17:16}}>{fw.name}</h3>
      <p style={{color:"#94a3b8",margin:"0 0 8px",fontSize:13,fontStyle:"italic"}}>{fw.tagline}</p>
      {!unlocked&&<p style={{color:"#64748b",margin:"0 0 10px",fontSize:13}}>{fw.teaser}</p>}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {stub?<span style={{fontSize:12,color:"#64748b",fontWeight:600}}>Coming Soon</span>
        :unlocked?<button onClick={()=>openF(fw)} style={{padding:"8px 18px",borderRadius:8,border:"none",background:col,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>{complete?"Review":"Start"}</button>
        :<button onClick={()=>setTab("store")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#f59e0b",color:"#0f172a",fontWeight:700,fontSize:13,cursor:"pointer"}}>Unlock</button>}
        {complete&&<button onClick={()=>restartF(fw.id)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Restart</button>}
      </div>
    </div>
  )};

  // ─── PAGES ───
  const renderDashboard=()=>{
    const completed=state.completedFrameworks.length,total=F.filter(f=>isUnlocked(f)&&!isStub(f)).length,has=completed>0;
    return(
    <div style={{padding:desk?32:20,maxWidth:wide?900:640,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:desk?32:24}}>
        <h1 style={{color:"#f1f5f9",margin:"0 0 4px",fontSize:desk?32:26}}>AIBOS Coach 🏴‍☠️</h1>
        <p style={{color:"#94a3b8",margin:0,fontSize:desk?16:14}}>You know what to do. This helps you do it.</p>
      </div>
      {has&&<div style={{background:"#1e293b",borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#94a3b8",fontSize:13}}>Progress</span><span style={{color:"#22c55e",fontSize:13,fontWeight:700}}>{completed} / {total}</span></div>
        <div style={{height:6,background:"#334155",borderRadius:3}}><div style={{height:6,background:"#22c55e",borderRadius:3,width:`${total?((completed/total)*100):0}%`}}/></div>
      </div>}
      {!has&&<button onClick={()=>{setTab("frameworks");openF(F[0])}} style={{width:"100%",padding:"16px 0",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:20}}>🚀 Start Here — Three Buckets of Stuck</button>}
      <div style={{display:"grid",gridTemplateColumns:desk?"1fr 1fr 1fr":"1fr",gap:10,marginBottom:20}}>
        {[["core","Core",DC.core,"⚡"],["business","Business",DC.business,"💼"],["personal","Personal",DC.personal,"🧠"]].map(([d,n,cl,ico])=>(
          <div key={d} onClick={()=>{setFilter(d);setTab("frameworks")}} style={{background:"#1e293b",borderRadius:10,padding:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:`1px solid ${cl}33`}}>
            <div style={{width:40,height:40,borderRadius:8,background:cl+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{ico}</div>
            <div><div style={{color:"#f1f5f9",fontWeight:600,fontSize:15}}>{n}</div><div style={{color:"#94a3b8",fontSize:12}}>{F.filter(f=>f.domain===d).length} frameworks</div></div>
            <span style={{marginLeft:"auto",color:cl,fontSize:11,fontWeight:600}}>{state.unlockedBundles.includes(d+"-domain")||d==="core"?"UNLOCKED":"LOCKED"}</span>
          </div>
        ))}
      </div>
      {state.commitments.length>0&&<div style={{background:"#1e293b",borderRadius:12,padding:16}}>
        <h3 style={{color:"#f1f5f9",margin:"0 0 10px",fontSize:15}}>📋 Your Commitments</h3>
        {state.commitments.slice(-5).reverse().map((c,i)=><div key={i} style={{borderLeft:"3px solid #22c55e",paddingLeft:10,marginBottom:10}}>
          <p style={{color:"#cbd5e1",margin:0,fontSize:13,lineHeight:1.5}}>{c.text.slice(0,150)}{c.text.length>150?"...":""}</p>
          <span style={{color:"#64748b",fontSize:11}}>{c.date} · {F.find(f=>f.id===c.frameworkId)?.name}</span>
        </div>)}
      </div>}
      <p style={{textAlign:"center",color:"#475569",fontSize:11,marginTop:24}}>Built by the AI system behind a 215K+ subscriber newsletter</p>
    </div>)
  };

  const renderFrameworks=()=>{
    const filtered=F.filter(fw=>filter==="all"||fw.domain===filter);
    return(
    <div style={{padding:desk?24:16,maxWidth:wide?1000:640,margin:"0 auto"}}>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {["all","core","business","personal"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:99,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",background:filter===f?(f==="all"?"#f1f5f9":DC[f]):"#1e293b",color:filter===f?(f==="all"?"#0f172a":"#fff"):"#94a3b8"}}>{f==="all"?"All":f[0].toUpperCase()+f.slice(1)}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:wide?"1fr 1fr":desk?"1fr 1fr":"1fr",gap:12}}>{filtered.map(fw=><FCard key={fw.id} fw={fw}/>)}</div>
    </div>)
  };

  const renderStore=()=>(
    <div style={{padding:desk?24:16,maxWidth:wide?900:640,margin:"0 auto"}}>
      <h2 style={{color:"#f1f5f9",margin:"0 0 16px",fontSize:desk?24:20}}>🏪 Framework Store</h2>
      <div style={{background:"#1e293b",borderRadius:12,padding:16,marginBottom:20,border:"1px solid #334155"}}>
        <h3 style={{color:"#f1f5f9",margin:"0 0 8px",fontSize:15}}>🔑 Got a code?</h3>
        <div style={{display:"flex",gap:8,maxWidth:400}}>
          <input value={code} onChange={e=>{setCode(e.target.value);setCErr(false)}} placeholder="Enter unlock code" onKeyDown={e=>e.key==="Enter"&&unlockCode()} style={{flex:1,background:"#0f172a",border:`1px solid ${codeErr?"#ef4444":"#475569"}`,borderRadius:8,color:"#f1f5f9",padding:10,fontSize:14,animation:codeErr?"shake 0.3s":""}}/>
          <button onClick={unlockCode} style={{padding:"10px 18px",borderRadius:8,border:"none",background:"#f59e0b",color:"#0f172a",fontWeight:700,fontSize:14,cursor:"pointer"}}>Unlock</button>
        </div>
        {codeErr&&<p style={{color:"#ef4444",fontSize:12,margin:"6px 0 0"}}>Invalid code.</p>}
      </div>
      {BUNDLES.filter(b=>b.highlight).map(b=><div key={b.id} style={{background:"#1e293b",borderRadius:12,padding:desk?20:16,marginBottom:16,border:"2px solid #f59e0b"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{color:"#f59e0b",margin:0,fontSize:desk?20:17}}>⭐ {b.name}</h3><span style={{color:"#f59e0b",fontWeight:800,fontSize:desk?26:22}}>${b.price}</span></div>
        <p style={{color:"#cbd5e1",fontSize:14,margin:"8px 0 12px"}}>{b.desc}</p>
        <a href={b.url} target="_blank" rel="noopener noreferrer" onClick={()=>track("buy_link_clicked",{bundle_id:b.id,bundle_name:b.name,price:b.price})} style={{display:"inline-block",padding:"12px 32px",borderRadius:8,background:"#f59e0b",color:"#0f172a",fontWeight:700,fontSize:14,textDecoration:"none"}}>Buy on Beehiiv →</a>
      </div>)}
      <h3 style={{color:"#94a3b8",fontSize:13,fontWeight:700,margin:"20px 0 10px",textTransform:"uppercase",letterSpacing:1}}>Domain Bundles</h3>
      <div style={{display:"grid",gridTemplateColumns:desk?"1fr 1fr":"1fr",gap:10,marginBottom:20}}>
        {BUNDLES.filter(b=>["business-domain","personal-domain"].includes(b.id)).map(b=>{const owned=state.unlockedBundles.includes(b.id);return(
          <div key={b.id} style={{background:"#1e293b",borderRadius:12,padding:14,border:`1px solid ${b.color}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h4 style={{color:b.color,margin:0,fontSize:15}}>{owned?"✅ ":""}{b.name}</h4><span style={{color:b.color,fontWeight:700}}>${b.price}</span></div>
            <p style={{color:"#94a3b8",fontSize:12,margin:"4px 0 8px"}}>{b.desc}</p>
            {!owned&&<a href={b.url} target="_blank" rel="noopener noreferrer" onClick={()=>track("buy_link_clicked",{bundle_id:b.id,bundle_name:b.name,price:b.price})} style={{color:b.color,fontSize:13,fontWeight:600,textDecoration:"none"}}>Buy on Beehiiv →</a>}
          </div>)})}
      </div>
      <h3 style={{color:"#94a3b8",fontSize:13,fontWeight:700,margin:"20px 0 10px",textTransform:"uppercase",letterSpacing:1}}>Author Packs</h3>
      <div style={{display:"grid",gridTemplateColumns:wide?"1fr 1fr 1fr":desk?"1fr 1fr":"1fr",gap:8}}>
        {BUNDLES.filter(b=>!["business-domain","personal-domain","all-access"].includes(b.id)).map(b=>{const owned=state.unlockedBundles.includes(b.id);return(
          <div key={b.id} style={{background:"#1e293b",borderRadius:10,padding:14,border:"1px solid #334155"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h4 style={{color:"#f1f5f9",margin:0,fontSize:14}}>{owned?"✅ ":""}{b.name}</h4><span style={{color:"#f59e0b",fontWeight:700,fontSize:14}}>${b.price}</span></div>
            <p style={{color:"#94a3b8",fontSize:12,margin:"4px 0 6px"}}>{b.desc}</p>
            {!owned&&<a href={b.url} target="_blank" rel="noopener noreferrer" onClick={()=>track("buy_link_clicked",{bundle_id:b.id,bundle_name:b.name,price:b.price})} style={{color:"#f59e0b",fontSize:12,fontWeight:600,textDecoration:"none"}}>Buy →</a>}
          </div>)})}
      </div>
    </div>
  );

  const renderCoach=()=>(
    <div style={{padding:desk?32:20,maxWidth:540,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:16}}>🏴‍☠️</div>
      <h2 style={{color:"#f1f5f9",margin:"0 0 8px"}}>AI Coach Chat</h2>
      <p style={{color:"#f59e0b",fontWeight:700,margin:"0 0 16px"}}>Coming Soon</p>
      <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.6,margin:"0 auto 20px"}}>We're building a live AI coach that knows every framework. Describe what's going on and the coach diagnoses, pulls frameworks, walks you through them.</p>
      <div style={{background:"#1e293b",borderRadius:12,padding:16,maxWidth:400,margin:"0 auto",border:"1px solid #334155",textAlign:"left"}}>
        <h3 style={{color:"#f1f5f9",margin:"0 0 10px",fontSize:15}}>What you'll get</h3>
        {["Describe your situation in plain language","Get matched to the right framework","Receive analysis — Hormozi, TOC, or Dickens","Walk away with a concrete action plan"].map((t,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><span style={{color:"#a855f7",flexShrink:0}}>→</span><span style={{color:"#cbd5e1",fontSize:13,lineHeight:1.5}}>{t}</span></div>)}
        <p style={{color:"#94a3b8",fontSize:12,margin:"12px 0 8px"}}>Drop your email for early access.</p>
        <input value={waitEmail} onChange={e=>setWaitEmail(e.target.value)} placeholder="your@email.com" style={{width:"100%",background:"#0f172a",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",padding:10,fontSize:14,marginBottom:8,boxSizing:"border-box"}}/>
        <button onClick={()=>{if(waitEmail.includes("@")){track("waitlist_signup");setToast("🎉 You're on the early access list!");setWaitEmail("")}}} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"none",background:"#a855f7",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Get Early Access</button>
      </div>
    </div>
  );

  // ─── NAV DATA ───
  const tabs=[["dashboard","🏠","Home"],["frameworks","📚","Frameworks"],["store","🏪","Store"],["coach","💬","Coach"]];

  // ─── DESKTOP SIDEBAR ───
  const Sidebar=()=>(
    <div style={{width:220,background:"#1e293b",borderRight:"1px solid #334155",display:"flex",flexDirection:"column",flexShrink:0,height:"100%"}}>
      <div style={{padding:"20px 16px 12px",borderBottom:"1px solid #334155"}}>
        <h2 style={{color:"#f1f5f9",margin:0,fontSize:18}}>🏴‍☠️ AIBOS Coach</h2>
      </div>
      <nav style={{flex:1,padding:"12px 8px"}}>
        {tabs.map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",background:tab===id?"#334155":"transparent",color:tab===id?"#f1f5f9":"#94a3b8",fontSize:14,fontWeight:tab===id?600:400,cursor:"pointer",marginBottom:2,textAlign:"left"}}>
            <span style={{fontSize:16}}>{icon}</span>{label}
          </button>
        ))}
      </nav>
      <div style={{padding:16,borderTop:"1px solid #334155"}}>
        <p style={{color:"#475569",fontSize:10,margin:0,lineHeight:1.4}}>Built by the AI system behind a 215K+ subscriber newsletter</p>
      </div>
    </div>
  );

  // ─── MOBILE BOTTOM TABS ───
  const BottomTabs=()=>(
    <div style={{display:"flex",borderTop:"1px solid #334155",background:"#1e293b",flexShrink:0}}>
      {tabs.map(([id,icon,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0 8px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:18}}>{icon}</span>
          <span style={{fontSize:10,fontWeight:tab===id?700:400,color:tab===id?"#f1f5f9":"#64748b"}}>{label}</span>
        </button>
      ))}
    </div>
  );

  // ─── ACTIVE FRAMEWORK FULLSCREEN ───
  if(activeF){
    return(
      <div style={{height:"100vh",background:"#0f172a",display:"flex",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#f1f5f9"}}>
        {desk&&<Sidebar/>}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {renderStep(activeF)}
        </div>
        {!desk&&<BottomTabs/>}
        {toast&&<div style={{position:"fixed",bottom:desk?20:80,left:"50%",transform:"translateX(-50%)",background:"#22c55e",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,zIndex:99}}>{toast}</div>}
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    );
  }

  // ─── MAIN LAYOUT ───
  return(
    <div style={{height:"100vh",background:"#0f172a",display:"flex",flexDirection:desk?"row":"column",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#f1f5f9"}}>
      {desk&&<Sidebar/>}
      <div style={{flex:1,overflow:"auto"}}>
        {tab==="dashboard"&&renderDashboard()}
        {tab==="frameworks"&&renderFrameworks()}
        {tab==="store"&&renderStore()}
        {tab==="coach"&&renderCoach()}
      </div>
      {!desk&&<BottomTabs/>}
      {toast&&<div style={{position:"fixed",bottom:desk?20:80,left:"50%",transform:"translateX(-50%)",background:"#22c55e",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,zIndex:99}}>{toast}</div>}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  );
}
