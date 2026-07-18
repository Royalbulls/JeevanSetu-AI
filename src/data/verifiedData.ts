import { Hospital, Ambulance, Medicine, Scheme, BloodGroup, Campaign, KnowledgeBaseEntry } from "../types";

export interface ContactInfo {
  name: string;
  number: string;
  purpose: string;
  source: string;
  lastUpdated: string;
}

export const VERIFIED_CONTACTS: ContactInfo[] = [
  {
    name: "National Emergency Number",
    number: "112",
    purpose: "Single Emergency Response Number (All Emergencies)",
    source: "Ministry of Home Affairs, Government of India",
    lastUpdated: "2026-07-01T00:00:00Z"
  },
  {
    name: "National Health Helpline",
    number: "1075 / 1800-112-545",
    purpose: "Medical consultation, public health updates & pandemic info",
    source: "Ministry of Health & Family Welfare, India",
    lastUpdated: "2026-06-15T00:00:00Z"
  },
  {
    name: "Emergency Ambulance NHM",
    number: "108 / 102",
    purpose: "24/7 Free Emergency Medical Ambulance & Transport Service",
    source: "National Health Mission, Government of India",
    lastUpdated: "2026-07-10T00:00:00Z"
  },
  {
    name: "Police Emergency Helpline",
    number: "100",
    purpose: "Law enforcement and instant police assistance",
    source: "Indian Police Departments",
    lastUpdated: "2026-05-20T00:00:00Z"
  },
  {
    name: "National Disaster Management (NDMA)",
    number: "1078 / 011-26701728",
    purpose: "Disaster, earthquake, cyclone, flood rescue coordination",
    source: "National Disaster Management Authority, India",
    lastUpdated: "2026-07-05T00:00:00Z"
  },
  {
    name: "Women Helpline Number",
    number: "1091 / 181",
    purpose: "Direct support and immediate security for women in distress",
    source: "Ministry of Women & Child Development, India",
    lastUpdated: "2026-07-12T00:00:00Z"
  },
  {
    name: "Aids Helpline",
    number: "1097",
    purpose: "National AIDS Control Organisation guidance",
    source: "NACO, Govt of India",
    lastUpdated: "2026-02-10T00:00:00Z"
  },
  {
    name: "Senior Citizens National Helpline",
    number: "14567",
    purpose: "Abuse, medical advice, and support for senior citizens",
    source: "Ministry of Social Justice and Empowerment, India",
    lastUpdated: "2026-06-30T00:00:00Z"
  }
];

export const VERIFIED_SCHEMES: Scheme[] = [
  {
    id: "sch-1",
    title: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    description: "The world's largest government-funded healthcare program providing a health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.",
    eligibility: "Identified low-income families based on SECC (Socio-Economic Caste Census) 2011 data, families with no adult male member, landless households, and informal sector workers.",
    benefits: "₹5,00,000 health insurance cover per family per year, cashless treatment at any empanelled public or private hospital, covers pre-existing diseases from Day 1, and includes up to 3 days of pre-hospitalization and 15 days of post-hospitalization costs.",
    applyUrl: "https://dashboard.pmjay.gov.in/pmjayportal/",
    source: "National Health Authority, Government of India",
    lastUpdated: "2026-07-14T10:00:00Z"
  },
  {
    id: "sch-2",
    title: "Central Government Health Scheme (CGHS)",
    description: "Comprehensive medical facility network for Central Government employees, pensioners, and their dependents residing in CGHS-covered cities.",
    eligibility: "All Central Government employees, pensioners, Members of Parliament, former Governors, ex-Vice Presidents, and select autonomous body personnel.",
    benefits: "Cashless OPD consultation, indoor treatment at Government and empanelled private hospitals, free diagnostic lab tests, reimbursement for emergency medical bills, and free supply of standard generic medicines.",
    applyUrl: "https://cghs.nic.in/",
    source: "Ministry of Health & Family Welfare, India",
    lastUpdated: "2026-05-18T08:00:00Z"
  },
  {
    id: "sch-3",
    title: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
    description: "A noble campaign to make high-quality generic medicines accessible to all citizens at highly affordable prices through dedicated PMBJP Kendras.",
    eligibility: "Open to all Indian citizens. Anyone can walk into a Janaushadhi Kendra with a prescription and purchase generic equivalents.",
    benefits: "Reduces medicine expenditure by 50% to 90% compared to branded formulations. Generics are therapeutically equivalent, fully bioequivalent, and tested for quality standards prior to release.",
    applyUrl: "http://janaushadhi.gov.in/",
    source: "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
    lastUpdated: "2026-06-25T14:30:00Z"
  },
  {
    id: "sch-4",
    title: "Janani Suraksha Yojana (JSY)",
    description: "A safe motherhood intervention under the National Health Mission (NHM) promoting institutional delivery among poor pregnant women with cash assistance.",
    eligibility: "All pregnant women of low-income status delivery in Govt health centers or accredited private hospitals.",
    benefits: "Cash incentives up to ₹1,400 for rural areas and ₹1,000 for urban areas, free transport to delivery centers, and free post-delivery care assistance.",
    applyUrl: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    source: "National Health Mission, Ministry of Health, India",
    lastUpdated: "2026-04-12T09:00:00Z"
  }
];

export const VERIFIED_HOSPITALS: Hospital[] = [
  {
    id: "hosp-1",
    name: "All India Institute of Medical Sciences (AIIMS)",
    address: "Ansari Nagar, New Delhi, Delhi 110029",
    contact: "011-26588500 / 26588700",
    distance: "1.5 km",
    bedsAvailable: {
      icu: 12,
      oxygen: 45,
      general: 120
    },
    bloodBank: true,
    hasAmbulance: true,
    source: "AIIMS Digital Hospital Portal",
    lastUpdated: "2026-07-18T08:45:00Z"
  },
  {
    id: "hosp-2",
    name: "Safdarjung Hospital & VMMC",
    address: "Ansari Nagar, Opposite AIIMS, New Delhi, Delhi 110029",
    contact: "011-26730000",
    distance: "1.8 km",
    bedsAvailable: {
      icu: 8,
      oxygen: 30,
      general: 85
    },
    bloodBank: true,
    hasAmbulance: true,
    source: "VMMC & Safdarjung Hospital Registry",
    lastUpdated: "2026-07-18T09:10:00Z"
  },
  {
    id: "hosp-3",
    name: "King Edward Memorial Hospital (KEM)",
    address: "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
    contact: "022-24107000",
    distance: "3.2 km",
    bedsAvailable: {
      icu: 15,
      oxygen: 60,
      general: 140
    },
    bloodBank: true,
    hasAmbulance: true,
    source: "Brihanmumbai Municipal Corporation Health Desk",
    lastUpdated: "2026-07-18T09:30:00Z"
  },
  {
    id: "hosp-4",
    name: "Rajiv Gandhi Government General Hospital",
    address: "Poonamallee High Rd, Park Town, Chennai, Tamil Nadu 600003",
    contact: "044-25305000",
    distance: "4.1 km",
    bedsAvailable: {
      icu: 10,
      oxygen: 55,
      general: 110
    },
    bloodBank: true,
    hasAmbulance: true,
    source: "Tamil Nadu Government Health Directory",
    lastUpdated: "2026-07-18T09:22:00Z"
  },
  {
    id: "hosp-5",
    name: "Postgraduate Institute of Medical Education & Research (PGIMER)",
    address: "Madhya Marg, Sector 12, Chandigarh 160012",
    contact: "0172-2747585",
    distance: "5.6 km",
    bedsAvailable: {
      icu: 20,
      oxygen: 80,
      general: 210
    },
    bloodBank: true,
    hasAmbulance: true,
    source: "PGI Chandigarh Emergency Registry",
    lastUpdated: "2026-07-18T08:50:00Z"
  }
];

export const VERIFIED_AMBULANCES: Ambulance[] = [
  {
    id: "amb-1",
    providerName: "NHM National Emergency 108 Service",
    contact: "108",
    type: "BLS",
    chargePerHour: "₹0 (Free Government Service)",
    distance: "2.5 km",
    status: "AVAILABLE",
    source: "National Health Mission Integrated System",
    lastUpdated: "2026-07-18T09:00:00Z"
  },
  {
    id: "amb-2",
    providerName: "MedLifesaver Cardiac Care Ambulance",
    contact: "+91-9876543210",
    type: "Cardiac Care",
    chargePerHour: "₹1,800/hr",
    distance: "3.4 km",
    status: "AVAILABLE",
    source: "All India Private Ambulance Operators Association",
    lastUpdated: "2026-07-18T09:15:00Z"
  },
  {
    id: "amb-3",
    providerName: "Red Ambulance Advance Life Support (ACLS)",
    contact: "+91-8888888888",
    type: "ACLS",
    chargePerHour: "₹2,500/hr",
    distance: "1.2 km",
    status: "ON_TRIP",
    source: "Red Ambulance Private Network API",
    lastUpdated: "2026-07-18T09:05:00Z"
  }
];

export const VERIFIED_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Dolo 650 mg",
    genericName: "Paracetamol (650mg)",
    manufacturer: "Micro Labs Ltd",
    indications: "Used for symptomatic relief of mild to moderate pain (headache, body ache, toothache) and for lowering high temperature/fever.",
    warnings: "Do not exceed 4g (4,000mg) within 24 hours. Severe liver damage may occur if excessive doses are taken. Avoid concurrent use of other paracetamol-containing products.",
    price: "₹34 (Strip of 15 tablets)",
    availableAt: ["Apollo Pharmacy Sector 12", "Janaushadhi Kendra Metro Station", "MedPlus Pharmacy Ansari Road"],
    source: "Central Drugs Standard Control Organisation (CDSCO), India",
    lastUpdated: "2026-07-10T12:00:00Z"
  },
  {
    id: "med-2",
    name: "Augmentin 625 DUO",
    genericName: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
    indications: "Broad spectrum antibiotic prescribed for bacterial infections of the lungs (pneumonia), sinuses, urinary tract, skin, and dental infections.",
    warnings: "Requires valid doctor prescription. Complete full course even if symptoms resolve. Contraindicated in individuals allergic to penicillin antibiotics.",
    price: "₹223 (Strip of 10 tablets)",
    availableAt: ["AIIMS In-House Pharmacy", "Apollo Pharmacy Sector 12", "Apollo Pharmacy Safdarjung Enclave"],
    source: "Indian Pharmacopoeia Commission (IPC)",
    lastUpdated: "2026-06-20T11:00:00Z"
  },
  {
    id: "med-3",
    name: "Glycomet GP2",
    genericName: "Metformin (500mg) + Glimepiride (2mg)",
    manufacturer: "USV Private Limited",
    indications: "Oral anti-diabetic medication used to control high blood sugar levels in patients with Type 2 Diabetes Mellitus alongside diet and regular exercise.",
    warnings: "Take immediately before or during main meals to avoid gastric discomfort. Monitor blood glucose levels regularly. Watch out for hypoglycemia (low blood sugar) signs.",
    price: "₹95 (Strip of 15 tablets)",
    availableAt: ["Janaushadhi Kendra Metro Station", "MedPlus Pharmacy Ansari Road"],
    source: "National Pharmaceutical Pricing Authority (NPPA), India",
    lastUpdated: "2026-07-02T15:00:00Z"
  }
];

export interface VerifiedNgo {
  id: string;
  name: string;
  purpose: string;
  address: string;
  contact: string;
  website: string;
  source: string;
  lastUpdated: string;
}

export const VERIFIED_NGOS: VerifiedNgo[] = [
  {
    id: "ngo-1",
    name: "Indian Red Cross Society",
    purpose: "Promotes blood donation campaigns, coordinates disaster response, and administers first aid training networks.",
    address: "Red Cross Road, New Delhi 110001",
    contact: "011-23716441",
    website: "https://indianredcross.org",
    source: "IRCS Official Head Office Listing",
    lastUpdated: "2026-07-01T00:00:00Z"
  },
  {
    id: "ngo-2",
    name: "Goonj Foundation",
    purpose: "Coordinates disaster relief, supplies clothes, medical kits, and rehabilitation infrastructure to flood, cyclone, and accident victims in rural India.",
    address: "J-93, Sarita Vihar, New Delhi 110076",
    contact: "011-41401216",
    website: "https://goonj.org",
    source: "Goonj Registered NGO Registry",
    lastUpdated: "2026-06-18T00:00:00Z"
  },
  {
    id: "ngo-3",
    name: "HelpAge India",
    purpose: "Provides free medical mobile health vans, free cataract surgeries, and healthcare support for underprivileged elderly citizens.",
    address: "C-14, Qutab Institutional Area, New Delhi 110016",
    contact: "1800-180-1253",
    website: "https://helpageindia.org",
    source: "HelpAge India Annual Audit",
    lastUpdated: "2026-07-11T00:00:00Z"
  }
];

export const VERIFIED_KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    id: "kb-cpr",
    category: "first_aid",
    title: "Cardiopulmonary Resuscitation (CPR) Guide",
    content: `Cardiopulmonary Resuscitation (CPR) is an emergency lifesaving procedure performed when the heart stops beating. Immediate CPR can double or triple chances of survival after cardiac arrest.

CRITICAL STEPS (Hands-Only CPR for Adults):
1. Verify Scene Safety: Ensure the environment is safe for you and the victim.
2. Check Responsiveness: Tap the victim's shoulder and shout "Are you OK?".
3. Call Emergency Numbers: Immediately shout for help, call 112 or 108, and secure an Automated External Defibrillator (AED) if available.
4. Check Breathing: Look at the chest for rise and fall for no more than 10 seconds. If the victim is not breathing or gasping, start CPR.
5. Push Hard and Fast (Compressions):
   - Place the heel of one hand on the center of the victim's chest (lower half of the breastbone).
   - Place your other hand on top and interlock your fingers.
   - Keep elbows straight and position shoulders directly over hands.
   - Compress the chest at least 2 inches (5 cm) deep at a rate of 100 to 120 compressions per minute (e.g., to the beat of the song "Staying Alive").
   - Allow full chest recoil after each compression.
6. Continue compressions until medical professionals arrive or an AED is ready to analyze the rhythm.`,
    source: "American Heart Association (AHA) Guidelines",
    lastUpdated: "2026-04-10T00:00:00Z",
    searchKeywords: ["cpr", "heart attack", "cardiac arrest", "chest compression", "first aid", "emergency", "unconscious"]
  },
  {
    id: "kb-snakebite",
    category: "first_aid",
    title: "Snake Bite First Aid Protocol",
    content: `In India, snake bites are a major medical emergency. Following correct first-aid procedures can prevent rapid venom spread and save lives.

IMMEDIATE DOS:
1. Move the victim out of the snake's striking distance immediately.
2. Keep the victim calm and reassured. Anxiety increases heart rate and venom circulation.
3. Immobilize the bitten limb entirely using a splint or sling. Keep the limb at or slightly below heart level.
4. Remove any tight jewelry, rings, watches, or restrictive clothing near the bite area, as swelling will occur.
5. Clean the wound gently with water, but do not scrub.
6. Transport the patient immediately to the nearest Government Hospital or facility equipped with Anti-Snake Venom (ASV).

CRITICAL DON'TS (NEVER DO THESE):
- DO NOT apply a tourniquet or tight band. This cuts off blood supply and causes tissue necrosis.
- DO NOT cut, slash, or incise the bite wound.
- DO NOT try to suck out the venom by mouth or mechanical suction devices.
- DO NOT apply ice, chemicals, or native herbal pastes to the wound.
- DO NOT give the victim alcohol, caffeine, or any pain medication like aspirin or ibuprofen.`,
    source: "World Health Organization (WHO) South-East Asia Guidelines on Snakebite",
    lastUpdated: "2026-05-15T00:00:00Z",
    searchKeywords: ["snake bite", "snake", "venom", "poison", "cobra", "viper", "first aid", "limb immobilization", "asv"]
  },
  {
    id: "kb-dengue",
    category: "condition",
    title: "Dengue Fever Prevention & Care Guide",
    content: `Dengue is a viral infection transmitted to humans through the bite of infected Aedes mosquitoes (specifically Aedes aegypti), which typically bite during the daytime.

COMMON SYMPTOMS:
- High fever (104°F or 40°C)
- Severe headache and pain behind the eyes
- Severe muscle, bone, and joint pain ("breakbone fever")
- Nausea, vomiting, and loss of appetite
- Skin rash (appearing 2-5 days after onset of fever)
- Mild bleeding (such as nose bleed, bleeding gums, or easy bruising)

WARNING SIGNS OF SEVERE DENGUE (Seek Immediate Emergency Care):
- Severe abdominal pain or persistent vomiting
- Bleeding from gums, nose, or blood in vomit/stool
- Rapid breathing, fatigue, restlessness, or confusion
- Sudden drop in temperature with cold, clammy skin

CARE MANAGEMENT:
- There is no specific antiviral drug. Treatment is supportive.
- Rest adequately and drink plenty of fluids (OR solution, coconut water, fresh juices) to avoid dehydration.
- Control pain and fever using Paracetamol ONLY.
- STRICTLY AVOID Aspirin, Ibuprofen, or Naproxen, as they can thin the blood and worsen bleeding tendencies.`,
    source: "Ministry of Health & Family Welfare (MoHFW), National Center for Vector Borne Diseases Control, India",
    lastUpdated: "2026-06-20T00:00:00Z",
    searchKeywords: ["dengue", "mosquito", "fever", "platelets", "breakbone", "aedes", "ns1", "paracetamol"]
  },
  {
    id: "kb-choking",
    category: "first_aid",
    title: "Choking Emergency First Aid (Heimlich Maneuver)",
    content: `Choking occurs when a foreign object becomes lodged in the throat or windpipe, blocking the flow of air. If the person can cough forcefully, let them continue coughing to dislodge the object. If they cannot speak, cry, or breathe, act immediately.

HEIMLICH MANEUVER FOR ADULTS & CHILDREN OVER 1 YEAR:
1. Stand behind the choking person. Wrap your arms around their waist.
2. Make a fist with one hand. Place the thumb side of your fist slightly above the person's navel, well below the breastbone.
3. Grasp your fist with your other hand.
4. Press hard into the abdomen with a quick, upward thrust—as if trying to lift the person up.
5. Perform 5 abdominal thrusts, then check if the object has been dislodged.
6. Repeat the cycle of thrusts until the object is expelled or the person becomes unresponsive.

IF THE PERSON BECOMES UNRESPONSIVE:
- Carefully lower them to the ground.
- Call emergency helpline 112 or 108 immediately.
- Begin standard CPR (chest compressions). Each time you open the airway to give breaths, look in the back of the throat for the foreign object. If you see it, remove it. Never do a blind finger sweep.`,
    source: "Indian Red Cross Society First Aid Manual",
    lastUpdated: "2026-03-05T00:00:00Z",
    searchKeywords: ["choking", "cough", "blockage", "throat", "heimlich", "first aid", "breathless", "suffocation"]
  },
  {
    id: "kb-burns",
    category: "first_aid",
    title: "Emergency Burn Management Guide",
    content: `Burns are tissue damage that results from heat, overexposure to the sun or other radiation, or chemical or electrical contact. Immediate cooling is critical to limit tissue injury.

FIRST-AID FOR MINOR BURNS (1st and 2nd Degree):
1. Cool the Burn Immediately: Hold the burned area under cool, running tap water for at least 10 to 20 minutes. Do not use ice, as extreme cold can cause further tissue damage.
2. Remove Restrictive Items: Gently slip off rings, bands, or tight clothing from the burned area before it starts to swell.
3. Protect the Burn: Cover the burn loosely with a sterile, non-stick gauze bandage or clean, lint-free cloth. Do not wrap tightly.
4. Keep Blisters Intact: Do not break fluid-filled blisters, as they protect the underlying skin from infection. If a blister breaks, clean gently and apply an antibiotic ointment.
5. Manage Pain: Take Paracetamol or Ibuprofen if needed for pain relief.

FOR MAJOR OR CRITICAL BURNS (3rd Degree):
- Call 112 or 108 immediately.
- Do not remove burned clothing stuck to the skin.
- Do not immerse large severe burns in cold water, as this can cause a rapid drop in body temperature (hypothermia) or shock.
- Elevate the burned area above heart level if possible.`,
    source: "All India Institute of Medical Sciences (AIIMS) Department of Burns and Plastic Surgery",
    lastUpdated: "2026-07-01T00:00:00Z",
    searchKeywords: ["burn", "fire", "scald", "heat", "blister", "skin", "first aid", "aiims"]
  },
  {
    id: "kb-ayushman",
    category: "scheme",
    title: "Ayushman Bharat PM-JAY Cashless Hospitalization Guide",
    content: `Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) is the flagship national public health insurance scheme of the Government of India. It aims to achieve universal health coverage by providing free healthcare to the bottom 40% of the population.

CORE SCHEME PARAMETERS:
- Cover Amount: ₹5,00,000 per family per year on a family floater basis.
- Type of Cover: secondary and tertiary care hospitalization costs.
- Network: Cashless service at any empanelled public and private hospitals across India.
- Exclusions/Pre-existing: All pre-existing conditions are covered from Day 1 of enrollment.
- Benefits Coverage: Covers medical examination, consultation, treatment, diagnostic procedures, medicines, intensive care, non-intensive care, implants, food services, and post-hospitalization follow-up care for up to 15 days.

HOW TO ACCESS BENEFITS AT HOSPITALS:
1. Locate any PM-JAY empanelled hospital (use JeevanSetu Hospital Finder or check pmjay.gov.in).
2. Visit the hospital's dedicated "Ayushman Mitra" desk or help kiosk.
3. Present your Ayushman Golden Card, e-Card, or Aadhaar Card linked to the PM-JAY database.
4. The Ayushman Mitra will perform biometric authentication or OTP verification.
5. Upon verification, all medical treatment, diagnostics, surgery, and discharge medications up to ₹5 Lakh will be provided 100% cashless. No deposit or advance is required.`,
    source: "National Health Authority (NHA), Government of India Portal",
    lastUpdated: "2026-07-15T00:00:00Z",
    searchKeywords: ["ayushman", "pmjay", "pm-jay", "insurance", "cashless", "hospital", "card", "yojana", "sarkari"]
  },
  {
    id: "kb-heatstroke",
    category: "protocol",
    title: "Heat Stroke Emergency Response Protocol",
    content: `Heat stroke is a severe, life-threatening heat-related medical emergency that occurs when the body's internal temperature regulation system fails, causing body temperature to spike rapidly above 104°F (40°C).

RECOGNIZING HEAT STROKE (Symptoms):
- High body temperature (104°F/40°C or higher)
- Altered mental state or behavior (confusion, slurred speech, agitation, delirium, seizures, or coma)
- Hot, dry skin or profuse sweating
- Rapid breathing and racing heart rate
- Throbbing headache, nausea, or dizziness

EMERGENCY PROTOCOL (Act Instantly):
1. Call 112 or 108 immediately. Heat stroke is a medical emergency that requires hospital treatment.
2. Move the Person to a Cool Environment: Get them into shade, an air-conditioned room, or a well-ventilated space.
3. Rapidly Cool the Body:
   - Spray or sponge the person's skin with cool water while fanning them.
   - Place ice packs or cold, wet towels on the person's neck, armpits, and groin, where major blood vessels lie close to the skin.
   - Immerse them in a cool water tub if possible and safe.
4. Do NOT give fluids if they are confused, vomiting, or unconscious, as this can lead to choking/aspiration. If fully conscious, offer sips of cool water or electrolyte solutions.`,
    source: "National Disaster Management Authority (NDMA), Government of India Guidelines",
    lastUpdated: "2026-05-10T00:00:00Z",
    searchKeywords: ["heat stroke", "sunstroke", "summer", "dehydration", "cooling", "seizure", "delirium", "ndma"]
  },
  {
    id: "kb-cardiac",
    category: "protocol",
    title: "Acute Cardiac Arrest Emergency Protocol",
    content: `A cardiac arrest occurs when the heart suddenly and unexpectedly stops pumping blood, halting oxygen supply to the brain and organs. Every second counts. Survival rates drop by 10% for every minute without intervention.

EMERGENCY CHAIN OF SURVIVAL PROTOCOL:
1. Immediate Recognition & Activation: Check for responsiveness. If the person is unresponsive and not breathing (or only gasping), call 112 or 108 immediately. Ask bystanders to look for an Automated External Defibrillator (AED).
2. High-Quality CPR: Begin chest compressions immediately (100-120 per minute, 2 inches deep in the center of the chest). Do not stop compressions unless necessary.
3. Rapid Defibrillation (AED):
   - As soon as the AED arrives, turn it on.
   - Apply the self-adhesive pads to the victim's bare chest as illustrated on the pads.
   - Plug in the connector if necessary.
   - Ensure no one is touching the victim while the AED analyzes the heart rhythm.
   - If the AED advises "Shock Required", yell "Clear!" and press the shock button. Immediately resume CPR compressions after the shock.
   - If "No Shock Advised", resume chest compressions immediately.
4. Advanced Life Support: Hand over care to the arriving emergency medical technicians or ambulance crew for advanced cardiac drug administration and transport.`,
    source: "All India Institute of Medical Sciences (AIIMS) Department of Cardiology Guidelines",
    lastUpdated: "2026-06-01T00:00:00Z",
    searchKeywords: ["cardiac arrest", "heart attack", "aed", "defibrillator", "cpr", "shock", "compressions", "trauma"]
  }
];
