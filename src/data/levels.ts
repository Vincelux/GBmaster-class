import type { Cefr } from '../cefr';

// For each vocabulary pack: a default level plus exceptions, listed by term.
// Anything not listed takes the pack's default level.
type Spec = { base: Cefr } & Partial<Record<Cefr, string>>;

export const VOCAB_LEVELS: Record<string, Spec> = {
  legal: {
    base: 'C1',
    B1: `to sue;verdict;jury;sentence;fraud;alibi;testimony;oath;patent;trademark;copyright;community service;probation;prosecutor;bribery;custody;damages;charge;attorney;bail;mediation`,
    B2: `plaintiff;defendant;liability;breach;settlement;to appeal;statute;clause;negligence;ruling;binding;compliance;intellectual property;to file;to serve;to dismiss;costs;tribunal;conviction;to prosecute;magistrate;warrant;parole;manslaughter;forgery;libel;slander;embezzlement;money laundering;whistleblower;termination;warranty;schedule;assignment;grievance;unfair dismissal;non-compete clause;non-disclosure agreement;witness statement;incorporation;counsel;barrister;solicitor;claimant;expert witness;to enforce;to draft;to execute;in good faith;class action;addendum;memorandum of understanding;letter of intent;term sheet;jurisdiction;precedent;to plead;loophole;to waive;due diligence;power of attorney;freehold;leasehold;arbitration;to cross-examine;cease and desist;trade secret;data controller;indictment;arraignment;remand;bailiff;clerk of the court;notary public;duty of care;nuisance;trespass;fiduciary duty;force majeure;injunction;affidavit;admissible;insider trading;to acquit`,
    C2: `tort;subpoena;estoppel;res judicata;obiter dictum;ratio decidendi;prima facie;ultra vires;habeas corpus;quid pro quo;pro bono;hearsay;perjury;lien;probate;easement;conveyancing;piercing the corporate veil;novation;severability;liquidated damages;condition precedent;vicarious liability;strict liability;contributory negligence;stay of proceedings;summary judgment;default judgment;interim injunction;cause of action;standing;pleadings;receivership;winding up;recitals;to rescind;to indemnify;to overrule;counterclaim;deposition;disclosure;null and void;undue influence;duress;frustration;misrepresentation;consideration;causation;title deed;the bench;the bar;articles of association;entire agreement;governing law;limitation of liability;counterparty;shareholders' agreement;letter before action;statute of limitations;burden of proof;balance of probabilities;beyond reasonable doubt;circumstantial evidence;to seize;trustee;to adjourn;to strike out;in-house counsel`,
  },
  finance: {
    base: 'B2',
    B1: `invoice;mortgage;overdraft;inflation;recession;VAT;tax return;exchange rate;pension scheme;shareholder;merger;takeover;ISA;fiscal year;forecast;turnover;net profit;crowdfunding;fintech;deficit;surplus;margin;asset;portfolio;GDP;creditor;tax evasion;broker`,
    C1: `amortisation;collateral;to hedge;leverage;liquidity;yield;accrual;EBITDA;to underwrite;arrears;write-off;working capital;share buyback;blue chip;diversification;hedge fund;base rate;to default;bailout;headwinds;burn rate;break-even;receivables;payables;commodity;derivative;annuity;to short;tax haven;cost of capital;discount rate;compound interest;principal;maturity;coupon;face value;sovereign debt;public debt;retail banking;investment bank;wealth management;spread;limit order;index fund;mutual fund;unit trust;earnings per share;market capitalisation;penny stock;peer-to-peer lending;microfinance;term loan;bad debt;provision;fixed assets;current assets;retained earnings;operating profit;pre-tax profit;profit warning;guidance;corporation tax;tax relief;tax avoidance;offshore;shell company;financial statements;internal controls;administration;liquidation;restructuring;cash cow;unicorn;seed funding;exit strategy;valuation;synergies;management buyout;spin-off;divestment;controlling interest;minority shareholder;AGM;volatility;private equity;venture capital;IPO;credit rating;downturn;ROI;balance sheet;profit and loss account;equity;dividend;bond;bull market;bear market;capital gains;insolvency;cash flow;to audit;depreciation`,
    C2: `credit default swap;securitisation;subprime;junk bond;gilt;yield curve;quantitative easing;stagflation;haircut;covenant;revolving credit facility;factoring;bridging loan;transfer pricing;going concern;gearing;enterprise value;leveraged buyout;rights issue;stock split;free float;market maker;short squeeze;stop-loss;margin call;strike price;call option;put option;futures contract;swap;impairment;goodwill;intangible assets;consolidated accounts;withholding tax;net present value;internal rate of return;debt-to-equity ratio;price-to-earnings ratio;capital requirements;stress test;bank run;devaluation;deflation;consumer price index;monetary policy;fiscal policy;withholding tax`,
  },
  business: {
    base: 'B2',
    B1: `agenda;minutes;next steps;action items;to resign;pay rise;perks;annual leave;sick leave;overtime;small talk;to come up with;to recap;kind regards;please find attached;for your information;out of office;at your earliest convenience;apologies for the delay;I'm writing to;to follow up;to reach out;going forward;on track;ahead of schedule;behind schedule;tight deadline;to brainstorm;to be sacked;milestone;line manager;work-life balance;burnout;quote;supply chain;market share;back to square one;in the red;in the black;a lot on your plate;to break the ice;to make an impression;to go the extra mile;win-win;I'll get back to you;to sleep on it;to be on the same page;to touch base;to wrap up;to kick off;headcount;team building;notice period;probation period;terms and conditions;appraisal`,
    C1: `to circle back;ballpark figure;to take offline;to move the needle;low-hanging fruit;to drill down;to leverage;on the back burner;to hit the ground running;to table;to cut corners;deliverable;buy-in;to flag;to escalate;to streamline;scope creep;to ramp up;to iterate;to pivot;to disrupt;first-mover advantage;barrier to entry;SWOT analysis;elevator pitch;a double-edged sword;to jump through hoops;to move the goalposts;to read the room;to play devil's advocate;to run something by someone;to take on board;to bite the bullet;to hit the nail on the head;to put your foot down;to chime in;to take the floor;a show of hands;off the record;on the record;to dial in;AOB;apologies for absence;a sticking point;a non-starter;to drive a hard bargain;to cut a deal;the ball is in your court;to haggle;to headhunt;attrition;downsizing;to wind down;to fast-track;proof of concept;rollout;workaround;dependency;to slip;roadblock;upselling;cross-selling;churn;value proposition;unique selling point;cold call;tender;lead time;backlog;to source;niche;contingency plan;trade-off;game changer;to cut to the chase;to seal the deal;to get the green light;with all due respect;the bottom line;to be snowed under;to agree to disagree;up in the air;a steep learning curve;to raise the bar;to be on the ball;to chair;to delegate;chain of command;to micromanage;pipeline;lessons learned`,
  },
  phrasal: {
    base: 'B2',
    B1: `to give up;to carry on;to find out;to set up;to take off;to turn down;to work out;to pick up;to sort out;to show up;to sign up;to run out of;to put off;to figure out;to fill in;to take over;to turn out;to end up;to cut back;to deal with;to catch up;to hang on;to give in;to back up;to break down;to call off;to go over;to go through;to carry out;to get over;to put up with;to come across;to take on;to sell out;to count on;to pay off;to point out;to sum up`,
    C1: `to bring about;to bring forward;to drag on;to draw up;to follow through;to get around to;to hold off;to iron out;to lay off;to nail down;to opt out;to pan out;to phase out;to pull off;to rule out;to settle for;to tie up;to wear off;to weigh up;to wind up;to write off;to buckle down;to call for;to clamp down on;to crack down on;to die down;to dwell on;to fend off;to level with;to live up to;to own up to;to pencil in;to play down;to press ahead;to rein in;to roll out;to scale back;to shake up;to single out;to snap up;to spell out;to tap into;to tone down;to top up;to water down;to jot down;to line up;to look up to;to mix up;to hand over;to get across;to pass on;to stand for;to slip up`,
    C2: `to usher in;to whittle down;to lash out;to shy away from;to stem from;to weed out;to dawn on`,
  },
  falsefriends: {
    base: 'B1',
    A2: `to ask;to wait for;bread;pain;corner;dirty;factory;dress;shop;library;bookshop;nice;kind;luck;wide;exit;to stay;journey;coin;raw;rental;magazine;diary;boss;to shout;to cry;cardboard;petrol;chips;crisps;sale;warning;training`,
    B2: `to pretend;to claim;to demand;to assist;to realise;to achieve;to resume;to summarise;to prevent;to deceive;to disappoint;sensible;sensitive;eventually;actual;agenda;conference;college;lecture;stage;internship;issue;location;licence;degree;formation;to support;to sit an exam;harm;trouble;former;ancient;crude;gentle;grave;rude;harsh;sympathetic;fabric;to rob;to injure`,
    C1: `preservative;physician;physicist;prejudice;deception;patron;to bless;rubber`,
  },
  tech: {
    base: 'B2',
    B1: `bug;backup;server;database;hardware;cookies;router;hosting;domain name;chatbot;automation;dashboard;user interface;prototype;release;to crash;firewall;cloud computing;open source;malware;phishing`,
    C1: `latency;redundancy;scalability;technical debt;to refactor;legacy system;wireframe;interoperability;metadata;single sign-on;end-to-end;proof of work;smart contract;firmware;cache;merge conflict;to roll back;changelog;end of life;tech stack;minimum viable product;neural network;data mining;user story;pull request;on-premise;API;bottleneck`,
  },
  marketing: {
    base: 'B2',
    B1: `slogan;hashtag;press release;influencer;target market;market research;sponsorship;freebie;giveaway;flash sale;limited edition;billboard;loyalty programme;testimonial;case study;brand awareness;buzz;hype`,
    C1: `retargeting;omnichannel;thought leadership;buyer persona;touchpoint;market segmentation;brand equity;brand positioning;customer lifetime value;net promoter score;conversion rate;bounce rate;click-through rate;organic reach;search engine optimisation;pay-per-click;lead magnet;to nurture;open rate;A/B testing;sales funnel;media buying;affiliate marketing;guerrilla marketing;loss leader;premium pricing;user-generated content;white paper;product placement;endorsement;media kit;reputation management;ad spend;point of sale`,
  },
  hr: {
    base: 'B2',
    B1: `recruitment;job description;applicant;job offer;part-time;promotion;payroll;payslip;gross salary;net salary;health insurance;maternity leave;paternity leave;sick note;harassment;bullying;trade union;coaching;freelancer;contractor;resignation letter;dismissal;employment contract;permanent contract;fixed-term contract;performance review`,
    C1: `succession planning;talent pool;high-flyer;skills gap;upskilling;reskilling;360-degree feedback;performance improvement plan;gross misconduct;garden leave;severance pay;presenteeism;absenteeism;unconscious bias;glass ceiling;collective bargaining;industrial action;works council;HR business partner;applicant tracking system;secondment;job share;zero-hours contract;agency worker;demotion;assessment centre;interview panel;reference check;signing bonus;pension contribution;whistleblowing;underperformance;disciplinary action`,
  },
  medical: {
    base: 'B2',
    A2: `fever;sore throat;rash;GP;painkiller;wheelchair;crutches;bandage;check-up;wound;bruise;to throw up;to pass out;under the weather;to run a temperature`,
    B1: `prescription;allergy;blood pressure;heart attack;migraine;infection;vaccine;scar;stitches;syringe;ointment;fatigue;nausea;dizziness;insomnia;antibiotic;scan;X-ray;blood test;diabetes;asthma;arthritis;symptom;diagnosis;surgery;ward;waiting list;to prescribe;side effect;surgeon;pharmacist;paramedic;midwife;sprain;fracture;stroke;to come down with;to be on the mend;to discharge;intensive care;A&E;cholesterol;pulse;drip;life support`,
    C1: `prognosis;remission;relapse;biopsy;malignant;benign;tumour;hypertension;cardiac arrest;palliative care;concussion;anaesthetic;bedside manner`,
  },
};

const index = new Map<string, Map<string, Cefr>>();
for (const [pack, spec] of Object.entries(VOCAB_LEVELS)) {
  const m = new Map<string, Cefr>();
  for (const [lvl, list] of Object.entries(spec)) {
    if (lvl === 'base') continue;
    for (const t of (list as string).split(';')) m.set(t.trim(), lvl as Cefr);
  }
  index.set(pack, m);
}

export function vocabLevel(pack: string, term: string): Cefr {
  return index.get(pack)?.get(term) ?? VOCAB_LEVELS[pack].base;
}
