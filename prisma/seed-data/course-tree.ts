// Radiant Educations — course tree seed data
// Tree: Course -> Level (class / exam / program) -> Subject (or Stage) -> Chapter
//
// DATA SOURCES AND GAPS (read before trusting):
// - NCERT book names: 2026-27 list (Class 1-9 new NCF books; Class 10-12 existing books).
// - Chapter lists below come from third-party sites (tiwariacademy.com, ncertbooks.org),
//   not from NCERT directly. Spot-check against the printed book before publishing.
// - NOT filled (add later via admin bulk import): chapters for Class 1-5 (new books),
//   English / Hindi / Sanskrit / Social Science / Commerce / Humanities books,
//   Class 7 Social Science, Class 9 Maths chapters 9-14 (Part II), all ICSE chapters,
//   all Competitive-exam chapters, Skill Building lessons.

export type SeedNode = {
  name: string;
  kind: "COURSE" | "LEVEL" | "STAGE" | "SUBJECT" | "CHAPTER";
  bookName?: string;
  tags?: string[];
  contentTypes?: string[]; // only on COURSE nodes; children inherit
  chapters?: string[]; // shorthand: auto-numbered CHAPTER children
  children?: SeedNode[];
};

// Stream tags for Class 11-12 subjects (subjects live once under the class; the UI filters by tag)
const PCM = "SCIENCE_PCM";
const PCB = "SCIENCE_PCB";
const COM = "COMMERCE";
const ART = "ARTS";

const SCHOOL_TYPES = ["NOTES", "SOLUTION", "TEST", "MCQ_TEST", "PYQ", "DPP"];
const COMPETITIVE_TYPES = [...SCHOOL_TYPES, "MOCK_TEST"];
const VOCATIONAL_TYPES = ["LESSON", "NOTES", "VIDEO"];

function subject(name: string, bookName?: string, chapters?: string[], tags?: string[]): SeedNode {
  return { name, kind: "SUBJECT", bookName, chapters, tags };
}
function level(name: string, children: SeedNode[]): SeedNode {
  return { name, kind: "LEVEL", children };
}

// ---------- CBSE chapter lists ----------
const C6_MATHS = ["Patterns in Mathematics", "Lines and Angles", "Number Play", "Data Handling and Presentation", "Prime Time", "Perimeter and Area", "Fractions", "Playing with Constructions", "Symmetry", "The Other Side of Zero"];
const C6_SCIENCE = ["The Wonderful World of Science", "Diversity in the Living World", "Mindful Eating: A Path to a Healthy Body", "Exploring Magnets", "Measurement of Length and Motion", "Materials Around Us", "Temperature and its Measurement", "A Journey through States of Water", "Methods of Separation in Everyday Life", "Living Creatures: Exploring their Characteristics", "Nature's Treasures", "Beyond Earth"];

const C7_MATHS = ["Large Numbers Around Us", "Arithmetic Expressions", "A Peek Beyond the Point", "Expressions Using Letter-Numbers", "Parallel and Intersecting Lines", "Number Play", "A Tale of Three Intersecting Lines", "Working with Fractions", "Geometric Twins", "Operations with Integers", "Finding Common Ground", "Another Peek Beyond the Point", "Connecting the Dots", "Constructions and Tilings", "Finding the Unknown"];
const C7_SCIENCE = ["The Ever-Evolving World of Science", "Exploring Substances: Acidic, Basic and Neutral", "Electricity: Circuits and their Components", "The World of Metals and Non-metals", "Changes Around Us: Physical and Chemical", "Adolescence: A Stage of Growth and Change", "Heat Transfer in Nature", "Measurement of Time and Motion", "Life Processes in Animals", "Life Processes in Plants", "Light: Shadows and Reflections", "Earth, Moon and the Sun"];

const C8_MATHS = ["A Square and A Cube", "Power Play", "A Story of Numbers", "Quadrilaterals", "Number Play", "We Distribute, Yet Things Multiply", "Proportional Reasoning-1", "Fractions in Disguise", "The Baudhayana-Pythagoras Theorem", "Proportional Reasoning-2", "Exploring Some Geometric Themes", "Tales by Dots and Lines", "Algebra Play", "Area"];
const C8_SCIENCE = ["Exploring the Investigative World of Science", "The Invisible Living World", "Health: The Ultimate Treasure", "Electricity: Magnetic and Heating Effects", "Exploring Forces", "Pressure, Winds, Storms and Cyclones", "Particulate Nature of Matter", "Nature of Matter: Elements, Compounds and Mixtures", "The Amazing World of Solutes, Solvents and Solutions", "Light: Mirrors and Lenses", "Keeping Time with the Skies", "How Nature Works in Harmony", "Our Home: Earth, A Unique Life Sustaining Planet"];

// Class 9 Maths: only Part I (chapters 1-8) is confirmed. Part II (9-14) to be added.
const C9_MATHS = ["Orienting Yourself: The Use of Coordinates", "Introduction to Linear Polynomials", "The World of Numbers", "Exploring Algebraic Identities", "I'm Up and Down, and Round and Round", "Measuring Space: Perimeter and Area", "The Mathematics of Maybe: Introduction to Probability", "Predicting What Comes Next?: Exploring Sequences and Progressions"];
const C9_SCIENCE = ["Entering the World of Secondary Science", "Cell: The Building Block of Life", "Tissues in Action", "Describing Motion Around Us", "Exploring Mixtures and their Separation", "How Forces Affect Motion", "Work, Energy and Simple Machines", "Journey Inside the Atom", "Atomic Foundations of Matter", "Sound Waves: Characteristics and Applications", "Reproduction: How Life Continues", "Patterns in Life: Diversity and Classification", "Earth as a System: Energy, Matter and Life"];

// Class 10: "Constructions" is no longer in the book (14 chapters).
const C10_MATHS = ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"];
const C10_SCIENCE = ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity", "Light - Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Our Environment"];

const C11_MATHS = ["Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Statistics", "Probability"];
const C11_PHYSICS = ["Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves"];
const C11_CHEMISTRY = ["Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity in Properties", "Chemical Bonding and Molecular Structure", "Thermodynamics", "Equilibrium", "Redox Reactions", "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons"];
const C11_BIOLOGY = ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals", "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration"];

const C12_MATHS = ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Application of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability"];
const C12_PHYSICS = ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductor Electronics"];
const C12_CHEMISTRY = ["Solutions", "Electrochemistry", "Chemical Kinetics", "The d- and f-Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules"];
const C12_BIOLOGY = ["Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation"];

// ---------- CBSE ----------
const cbseClasses: SeedNode[] = [
  level("Class 1", [
    subject("English", "Mridang"),
    subject("Hindi", "Sarangi"),
    subject("Mathematics", "Joyful Mathematics"),
  ]),
  level("Class 2", [
    subject("English", "Mridang"),
    subject("Hindi", "Sarangi"),
    subject("Mathematics", "Joyful Mathematics"),
  ]),
  ...[3, 4, 5].map((n) =>
    level(`Class ${n}`, [
      subject("English", "Santoor"),
      subject("Hindi", "Veena"),
      subject("Mathematics", "Maths Mela"),
      subject("The World Around Us (EVS)", "Our Wondrous World"),
    ])
  ),
  level("Class 6", [
    subject("English", "Poorvi"),
    subject("Hindi", "Malhar"),
    subject("Mathematics", "Ganita Prakash", C6_MATHS),
    subject("Science", "Curiosity", C6_SCIENCE),
    subject("Social Science", "Exploring Society: India and Beyond"),
    subject("Sanskrit", "Deepakam"),
  ]),
  level("Class 7", [
    subject("English", "Poorvi"),
    subject("Hindi", "Malhar"),
    subject("Mathematics", "Ganita Prakash", C7_MATHS),
    subject("Science", "Curiosity", C7_SCIENCE),
    subject("Social Science", "Exploring Society: India and Beyond"),
    subject("Sanskrit", "Deepakam"),
  ]),
  level("Class 8", [
    subject("English", "Poorvi"),
    subject("Hindi", "Malhar"),
    subject("Mathematics", "Ganita Prakash", C8_MATHS),
    subject("Science", "Curiosity", C8_SCIENCE),
    subject("Social Science", "Exploring Society: India and Beyond"),
    subject("Sanskrit", "Deepakam"),
  ]),
  level("Class 9", [
    subject("English", "Kaveri"),
    subject("Hindi", "Ganga"),
    subject("Mathematics", "Ganita Manjari", C9_MATHS),
    subject("Science", "Exploration", C9_SCIENCE),
    subject("Social Science", "Understanding Society: India and Beyond"),
    subject("Sanskrit", "Sharada"),
  ]),
  level("Class 10", [
    subject("English", "First Flight; Footprints Without Feet"),
    subject("Hindi", "Kshitij 2; Kritika 2"),
    subject("Mathematics", "Mathematics", C10_MATHS),
    subject("Science", "Science", C10_SCIENCE),
    subject("Social Science", "India and the Contemporary World II; Contemporary India II; Democratic Politics II; Understanding Economic Development"),
    subject("Sanskrit", "Shemushi"),
  ]),
  level("Class 11", [
    subject("English", "Hornbill; Snapshots", undefined, [PCM, PCB, COM, ART]),
    subject("Hindi", "Aroh; Vitan", undefined, [PCM, PCB, COM, ART]),
    subject("Physics", "Physics Part I, II", C11_PHYSICS, [PCM, PCB]),
    subject("Chemistry", "Chemistry Part I, II", C11_CHEMISTRY, [PCM, PCB]),
    subject("Mathematics", "Mathematics", C11_MATHS, [PCM]),
    subject("Biology", "Biology", C11_BIOLOGY, [PCB]),
    subject("Computer Science", "Computer Science", undefined, [PCM, COM]),
    subject("Informatics Practices", "Informatics Practices", undefined, [PCM, COM]),
    subject("Accountancy", "Financial Accounting I; Accountancy II", undefined, [COM]),
    subject("Business Studies", "Business Studies", undefined, [COM]),
    subject("Economics", "Statistics for Economics; Indian Economic Development", undefined, [COM, ART]),
    subject("History", "Themes in World History", undefined, [ART]),
    subject("Geography", "Fundamentals of Physical Geography; India: Physical Environment", undefined, [ART]),
    subject("Political Science", "Political Theory; Indian Constitution at Work", undefined, [ART]),
    subject("Sociology", "Introducing Sociology; Understanding Society", undefined, [ART]),
    subject("Psychology", "Introduction to Psychology", undefined, [ART]),
  ]),
  level("Class 12", [
    subject("English", "Flamingo; Vistas", undefined, [PCM, PCB, COM, ART]),
    subject("Hindi", "Aroh; Vitan", undefined, [PCM, PCB, COM, ART]),
    subject("Physics", "Physics Part I, II", C12_PHYSICS, [PCM, PCB]),
    subject("Chemistry", "Chemistry Part I, II", C12_CHEMISTRY, [PCM, PCB]),
    subject("Mathematics", "Mathematics Part I, II", C12_MATHS, [PCM]),
    subject("Biology", "Biology", C12_BIOLOGY, [PCB]),
    subject("Computer Science", "Computer Science", undefined, [PCM, COM]),
    subject("Informatics Practices", "Informatics Practices", undefined, [PCM, COM]),
    subject("Accountancy", "Accountancy Part I, II; Computerised Accounting System", undefined, [COM]),
    subject("Business Studies", "Business Studies I, II", undefined, [COM]),
    subject("Economics", "Introductory Microeconomics; Introductory Macroeconomics", undefined, [COM, ART]),
    subject("History", "Themes in Indian History I, II, III", undefined, [ART]),
    subject("Geography", "Fundamentals of Human Geography; India: People and Economy", undefined, [ART]),
    subject("Political Science", "Contemporary World Politics; Politics in India Since Independence", undefined, [ART]),
    subject("Sociology", "Indian Society; Social Change and Development in India", undefined, [ART]),
    subject("Psychology", "Psychology", undefined, [ART]),
  ]),
];

// ---------- ICSE (CISCE) — subjects only; chapters depend on publisher/school ----------
const icseLower = ["English", "Hindi", "Mathematics", "Environmental Studies", "Computer Studies"];
const icseMiddle = ["English", "Hindi", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Studies"];
const icseSenior: [string, string][] = [
  ["English", "GROUP_I"],
  ["Hindi", "GROUP_I"],
  ["History & Civics", "GROUP_I"],
  ["Geography", "GROUP_I"],
  ["Mathematics", "GROUP_II"],
  ["Physics", "GROUP_II"],
  ["Chemistry", "GROUP_II"],
  ["Biology", "GROUP_II"],
  ["Economics", "GROUP_II"],
  ["Commercial Studies", "GROUP_II"],
  ["Computer Applications", "GROUP_III"],
];
const icseClasses: SeedNode[] = [];
for (let n = 1; n <= 10; n++) {
  let subjects: SeedNode[];
  if (n <= 5) subjects = icseLower.map((s) => subject(s));
  else if (n <= 8) subjects = icseMiddle.map((s) => subject(s));
  else subjects = icseSenior.map(([s, g]) => subject(s, undefined, undefined, [g]));
  icseClasses.push(level(`Class ${n}`, subjects));
}

// ---------- Competitive ----------
const competitiveExams: SeedNode[] = [
  level("JEE", [subject("Physics"), subject("Chemistry"), subject("Mathematics")]),
  level("NEET", [subject("Physics"), subject("Chemistry"), subject("Botany"), subject("Zoology")]),
  level("NET", [
    subject("Paper 1: Teaching and Research Aptitude"),
    subject("Paper 2: Subject Papers"),
  ]),
  level("SSC", [
    subject("Quantitative Aptitude"),
    subject("General Intelligence and Reasoning"),
    subject("English Language"),
    subject("General Awareness"),
  ]),
  level("UPSC", [
    {
      name: "Prelims",
      kind: "STAGE",
      children: [subject("General Studies Paper I"), subject("CSAT (General Studies Paper II)")],
    },
    {
      name: "Mains",
      kind: "STAGE",
      children: [
        subject("Essay"),
        subject("General Studies I"),
        subject("General Studies II"),
        subject("General Studies III"),
        subject("General Studies IV"),
      ],
    },
  ]),
];

// ---------- Vocational ----------
const GEETA = [
  "Arjuna Vishada Yoga", "Sankhya Yoga", "Karma Yoga", "Jnana Karma Sannyasa Yoga", "Karma Sannyasa Yoga", "Dhyana Yoga",
  "Jnana Vijnana Yoga", "Akshara Brahma Yoga", "Raja Vidya Raja Guhya Yoga", "Vibhuti Yoga", "Vishvarupa Darshana Yoga",
  "Bhakti Yoga", "Kshetra Kshetrajna Vibhaga Yoga", "Gunatraya Vibhaga Yoga", "Purushottama Yoga",
  "Daivasura Sampad Vibhaga Yoga", "Shraddhatraya Vibhaga Yoga", "Moksha Sannyasa Yoga",
];
const MAHABHARAT = [
  "Adi Parva", "Sabha Parva", "Vana Parva", "Virata Parva", "Udyoga Parva", "Bhishma Parva", "Drona Parva", "Karna Parva",
  "Shalya Parva", "Sauptika Parva", "Stri Parva", "Shanti Parva", "Anushasana Parva", "Ashvamedhika Parva",
  "Ashramavasika Parva", "Mausala Parva", "Mahaprasthanika Parva", "Svargarohana Parva",
];

export const COURSES: SeedNode[] = [
  { name: "CBSE", kind: "COURSE", contentTypes: SCHOOL_TYPES, children: cbseClasses },
  { name: "ICSE", kind: "COURSE", contentTypes: SCHOOL_TYPES, children: icseClasses },
  { name: "Competitive", kind: "COURSE", contentTypes: COMPETITIVE_TYPES, children: competitiveExams },
  {
    name: "Vocational",
    kind: "COURSE",
    contentTypes: VOCATIONAL_TYPES,
    children: [
      { name: "Skill Building", kind: "LEVEL" },
      { name: "Geeta", kind: "LEVEL", chapters: GEETA },
      { name: "Mahabharat", kind: "LEVEL", chapters: MAHABHARAT },
    ],
  },
];
