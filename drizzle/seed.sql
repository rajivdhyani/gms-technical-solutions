-- Demo content for GMS Technical Solutions.
-- Resets courses, internships, modules, lessons, batches, centres and instructors.
-- Enquiries are NOT deleted: their course and batch references are cleared first
-- so that real leads survive a reseed. Replace all of this with your own data.

UPDATE enquiries SET course_id = NULL, batch_id = NULL;

DELETE FROM path_courses;
DELETE FROM paths;
DELETE FROM lessons;
DELETE FROM modules;
DELETE FROM batches;
DELETE FROM courses;
DELETE FROM instructors;
DELETE FROM centres;

-- ---------------------------------------------------------------- centres

INSERT INTO centres (id, slug, name, address, city, phone, whatsapp, lat, lng, maps_url) VALUES
 (1,'dehradun','GMS Dehradun centre','62/2 B, Vijay Colony, Hathibarkala','Dehradun','+919027252242','919027252242',30.3441,78.0522,'https://maps.google.com/?q=62%2F2+B+Vijay+Colony+Hathibarkala+Dehradun');

-- ------------------------------------------------------------ instructors

INSERT INTO instructors (id, name, bio) VALUES
 (1,'Rahul Mehta','Eight years building Node and React systems; previously at Paytm.'),
 (2,'Priya Nair','Data engineer turned trainer. Teaches Python, SQL and analytics.'),
 (4,'Neha Rawat','Placement trainer for Java and data structures; 600+ students placed.'),
 (5,'Vikram Singh','Cloud and DevOps engineer, AWS certified Solutions Architect.'),
 (6,'Sana Qureshi','QA lead; builds automation suites for fintech products.'),
 (7,'Imran Khan','Java backend engineer; builds Spring Boot services for banking clients.');

-- ---------------------------------------------------------- courses

INSERT INTO courses (id, slug, title, tagline, description, level, kind, duration_weeks, duration_label, lesson_count, self_paced_price) VALUES
 (1,'full-stack-web-development','Full-stack web development',
  'Become job-ready in 6 months, building real projects from week one.',
  'You will build and deploy complete web applications, front end to database. The course covers HTML, CSS, JavaScript, React, Node, Express and SQL, and every module ends with a project you can put on a CV. No prior programming experience is assumed.',
  'beginner','course',24,NULL,31,12500),

 (2,'python-data-analytics','Python and data analytics',
  'Go from spreadsheets to Python, SQL and dashboards.',
  'For anyone who has outgrown Excel. You will learn Python from scratch, clean and analyse real datasets with pandas, query databases with SQL, and present findings that non-technical colleagues can act on.',
  'beginner','course',16,NULL,23,9000),

 (3,'java-dsa-placements','Java and data structures for placements',
  'Clear the coding rounds that campus and off-campus hiring actually set.',
  'Built around what interviewers ask. You will learn Java properly, work through every core data structure and algorithm by hand, then practise under interview conditions with mock rounds, complexity analysis and aptitude preparation.',
  'intermediate','course',20,NULL,22,11500),

 (4,'cloud-computing-aws','Cloud computing with AWS',
  'Deploy, secure and automate real infrastructure on AWS.',
  'Hands-on from the first week, using a real AWS account within free-tier limits. Covers compute, storage, networking, identity and automation, and maps directly to the Solutions Architect Associate syllabus if you want the certification.',
  'intermediate','course',14,NULL,16,12000),

 (5,'sql-database-fundamentals','SQL and database fundamentals',
  'Write queries you can defend, and design tables that hold up.',
  'A short, practical course for developers, analysts and testers. You will move from your first SELECT to window functions and query performance, and learn enough database design to avoid the mistakes that are expensive to undo later.',
  'beginner','course',8,NULL,13,5000),

 (6,'data-science-machine-learning','Data science and machine learning',
  'Train models that hold up outside a notebook.',
  'For people who already write Python and want the modelling layer. Covers the maths you genuinely need, feature engineering, the supervised and unsupervised methods used in practice, a first neural network in PyTorch, and what it takes to serve and monitor a model in production.',
  'advanced','course',20,NULL,18,14500),

 (7,'software-testing-qa','Software testing and QA automation',
  'Move from manual testing into automation, the fastest route into IT.',
  'One of the most reliable entry points into a software career. You will learn manual testing properly, automate browsers with Selenium and Playwright, test APIs, run suites in CI, and prepare for QA interviews with a portfolio of working test code.',
  'intermediate','course',12,NULL,16,8500),

 (8,'android-kotlin','Android app development with Kotlin',
  'Ship an app to the Play Store before the course ends.',
  'Build real Android applications in Kotlin, the language Google recommends. Covers Jetpack Compose, local storage with Room, talking to REST APIs, offline behaviour, testing, and the full Play Store release process.',
  'intermediate','course',14,NULL,15,10500),

 (9,'c-cpp-programming','C and C++ programming',
  'The language foundation every CS syllabus assumes you have.',
  'Built for first and second year students and anyone whose fundamentals are shaky. Covers C from first principles, then pointers and memory slowly and properly, before moving into C++ classes, inheritance and the standard library.',
  'beginner','course',10,NULL,15,5000),

 (10,'devops-engineering','DevOps engineering',
  'Containers, pipelines and infrastructure that recovers on its own.',
  'For developers and system administrators moving into DevOps. Covers Docker, Kubernetes, Terraform, CI/CD pipelines and observability, building one deployment pipeline end to end across the course.',
  'advanced','course',16,NULL,19,13500),

 (13,'spring-boot-backend','Spring Boot backend development',
  'Build the Java backends that enterprise teams actually hire for.',
  'Spring Boot runs a large share of enterprise Java, and most Java job descriptions in India name it directly. You will build REST APIs from scratch, persist data with JPA and Hibernate, secure endpoints with Spring Security and JWT, write tests that run in CI, and deploy a containerised service. Assumes you already write Java.',
  'intermediate','course',14,NULL,24,11000),

 (14,'data-structures-algorithms','Data structures and algorithms',
  'Build the problem-solving foundation every other CS subject leans on.',
  'A language-agnostic deep dive — work in C++, Java or Python. Covers complexity analysis, every core data structure implemented by hand rather than imported, the classic algorithm design families, and the advanced structures that turn up in competitive programming. Pairs with our placement course, which adds interview technique and aptitude on top.',
  'intermediate','course',16,NULL,27,8500),

-- ------------------------------------------------------------ internships

 (11,'short-term-internship','Short-term internship (1 to 2 months)',
  'A real project, a mentor, and a certificate that stands up to questions.',
  'For second and third year students, and anyone who needs a summer or winter internship with something to show for it. Pick a track — web development, Python, data analytics, testing or app development — and spend four to eight weeks building one real project under a working engineer, ending with a demo and a verifiable certificate.',
  'beginner','internship',8,'1 to 2 months',16,NULL),

 (12,'six-month-industrial-training','Six-month industrial training',
  'The full-length industrial training your university asks for, on a real team.',
  'Designed for final-year B.Tech, BCA and MCA students who must complete six months of industrial training. You join a project team, work to sprint deadlines, and finish with production experience, a complete project, every document your university requires, and placement support.',
  'intermediate','internship',24,'6 months',22,NULL);

-- ---------------------------------------------------------------- modules

INSERT INTO modules (id, course_id, title, position) VALUES
 (1,1,'Foundations of the web',1),
 (2,1,'JavaScript in depth',2),
 (3,1,'React and the front end',3),
 (4,1,'Back end with Node and Express',4),
 (5,1,'Databases with SQL',5),
 (6,1,'Shipping your work',6),
 (7,1,'Capstone project',7),

 (8,2,'Python fundamentals',1),
 (9,2,'Working with data in pandas',2),
 (10,2,'SQL for analysts',3),
 (11,2,'Visualisation and storytelling',4),
 (12,2,'Statistics for decisions',5),
 (13,2,'Analytics capstone',6),

 (14,3,'Java fundamentals',1),
 (15,3,'Core data structures',2),
 (16,3,'Trees and graphs',3),
 (17,3,'Algorithms that come up in interviews',4),
 (18,3,'Interview preparation',5),

 (19,4,'Cloud fundamentals',1),
 (20,4,'Core AWS services',2),
 (21,4,'Identity and security',3),
 (22,4,'Automation and deployment',4),
 (23,4,'Certification preparation',5),

 (24,5,'Getting started with SQL',1),
 (25,5,'Querying with confidence',2),
 (26,5,'Designing a database',3),
 (27,5,'Working with real systems',4),

 (28,6,'The maths you actually need',1),
 (29,6,'Data preparation at scale',2),
 (30,6,'Supervised learning',3),
 (31,6,'Unsupervised and deep learning',4),
 (32,6,'Putting models into production',5),

 (33,7,'Testing foundations',1),
 (34,7,'Automation with Selenium',2),
 (35,7,'API and performance testing',3),
 (36,7,'Modern tooling and CI',4),
 (37,7,'Career preparation',5),

 (38,8,'Kotlin foundations',1),
 (39,8,'Building your first app',2),
 (40,8,'Data and networking',3),
 (41,8,'Polish and release',4),

 (42,9,'Getting started with C',1),
 (43,9,'Memory and pointers',2),
 (44,9,'Moving to C++',3),
 (45,9,'The standard library',4),

 (46,10,'DevOps foundations',1),
 (47,10,'Containers',2),
 (48,10,'Orchestration with Kubernetes',3),
 (49,10,'Automation and delivery',4),
 (50,10,'Observability and reliability',5),

 (51,11,'Week 1 — onboarding and fundamentals',1),
 (52,11,'Weeks 2 to 3 — guided build',2),
 (53,11,'Weeks 4 to 6 — independent work',3),
 (54,11,'Final week — demo and certification',4),

 (55,12,'Month 1 — foundations and tooling',1),
 (56,12,'Month 2 — core technical training',2),
 (57,12,'Months 3 and 4 — live project work',3),
 (58,12,'Month 5 — specialisation',4),
 (59,12,'Month 6 — documentation and placement',5),

 (60,13,'Spring foundations',1),
 (61,13,'Building REST APIs',2),
 (62,13,'Data with JPA and Hibernate',3),
 (63,13,'Security',4),
 (64,13,'Testing and quality',5),
 (65,13,'Running it in production',6),

 (66,14,'Thinking about efficiency',1),
 (67,14,'Linear structures',2),
 (68,14,'Hashing and sorting',3),
 (69,14,'Trees',4),
 (70,14,'Graphs',5),
 (71,14,'Algorithm design',6),
 (72,14,'Advanced structures',7);

-- ---------------------------------------------------------------- lessons

INSERT INTO lessons (module_id, title, free_preview, position) VALUES
 -- Full-stack web development
 (1,'How the web actually works',1,1),
 (1,'Your first HTML page',1,2),
 (1,'Semantic HTML and accessible forms',0,3),
 (1,'CSS layout and flexbox',0,4),
 (1,'CSS grid and responsive design',0,5),
 (2,'Variables, types and scope',0,1),
 (2,'Functions and the call stack',0,2),
 (2,'Arrays, objects and destructuring',0,3),
 (2,'Asynchronous JavaScript and promises',0,4),
 (2,'Working with the DOM',0,5),
 (3,'Thinking in components',0,1),
 (3,'State, props and events',0,2),
 (3,'Hooks in practice',0,3),
 (3,'Routing and data fetching',0,4),
 (3,'Forms, validation and error states',0,5),
 (4,'HTTP, REST and status codes',0,1),
 (4,'Building an Express API',0,2),
 (4,'Middleware, authentication and sessions',0,3),
 (4,'File uploads and error handling',0,4),
 (5,'Relational modelling from a real brief',0,1),
 (5,'Writing queries that scale',0,2),
 (5,'Joins, indexes and transactions',0,3),
 (5,'Connecting a database to your API',0,4),
 (6,'Git and GitHub for teams',0,1),
 (6,'Deploying a full-stack application',0,2),
 (6,'Environment variables and secrets',0,3),
 (6,'Reading logs and debugging production',0,4),
 (7,'Planning your capstone',0,1),
 (7,'Build week with daily reviews',0,2),
 (7,'Code review and refactoring',0,3),
 (7,'Presenting your project to an interviewer',0,4),

 -- Python and data analytics
 (8,'Setting up Python and your editor',1,1),
 (8,'Variables, types and control flow',1,2),
 (8,'Functions, modules and packages',0,3),
 (8,'Files, errors and the standard library',0,4),
 (9,'Series and DataFrames',0,1),
 (9,'Cleaning messy real-world data',0,2),
 (9,'Grouping and aggregation',0,3),
 (9,'Merging and reshaping datasets',0,4),
 (10,'Querying with SELECT and WHERE',0,1),
 (10,'Joins and subqueries',0,2),
 (10,'Window functions for analysts',0,3),
 (10,'Writing queries colleagues can trust',0,4),
 (11,'Choosing a chart that answers the question',0,1),
 (11,'Matplotlib and seaborn in practice',0,2),
 (11,'Building a dashboard with Streamlit',0,3),
 (11,'Presenting findings to non-analysts',0,4),
 (12,'Descriptive statistics that matter',0,1),
 (12,'Distributions and sampling',0,2),
 (12,'A/B testing from first principles',0,3),
 (12,'Common statistical traps',0,4),
 (13,'Choosing a dataset and a question',0,1),
 (13,'Analysis and written report',0,2),
 (13,'Final presentation',0,3),

 -- Java and data structures for placements
 (14,'Java syntax and how the JVM runs your code',1,1),
 (14,'Objects, classes and inheritance',1,2),
 (14,'The collections framework',0,3),
 (14,'Exceptions and generics',0,4),
 (15,'Arrays and string manipulation',0,1),
 (15,'Linked lists',0,2),
 (15,'Stacks and queues',0,3),
 (15,'Hash maps and sets',0,4),
 (16,'Binary trees and traversal',0,1),
 (16,'Binary search trees',0,2),
 (16,'Heaps and priority queues',0,3),
 (16,'Representing graphs',0,4),
 (16,'Breadth-first and depth-first search',0,5),
 (17,'Sorting and searching',0,1),
 (17,'Two pointers and sliding window',0,2),
 (17,'Recursion and backtracking',0,3),
 (17,'Dynamic programming foundations',0,4),
 (17,'Greedy problems and when they fail',0,5),
 (18,'Complexity analysis under pressure',0,1),
 (18,'Mock interview technique',0,2),
 (18,'Building a portfolio that gets read',0,3),
 (18,'Aptitude and HR rounds',0,4),

 -- Cloud computing with AWS
 (19,'What the cloud actually is',1,1),
 (19,'Regions, availability zones and pricing',1,2),
 (19,'The shared responsibility model',0,3),
 (20,'EC2 and compute',0,1),
 (20,'S3 and object storage',0,2),
 (20,'VPC and networking basics',0,3),
 (20,'RDS and managed databases',0,4),
 (21,'IAM users, roles and policies',0,1),
 (21,'Securing an account properly',0,2),
 (21,'Secrets and key management',0,3),
 (22,'Infrastructure as code with Terraform',0,1),
 (22,'CI/CD pipelines',0,2),
 (22,'Running containers on AWS',0,3),
 (22,'Monitoring and alerting with CloudWatch',0,4),
 (23,'Mapping to Solutions Architect Associate',0,1),
 (23,'Practice exam technique',0,2),

 -- SQL and database fundamentals
 (24,'Why databases exist',1,1),
 (24,'Your first SELECT query',1,2),
 (24,'Filtering and sorting results',0,3),
 (25,'Aggregation and GROUP BY',0,1),
 (25,'Joins explained properly',0,2),
 (25,'Subqueries and common table expressions',0,3),
 (25,'Window functions',0,4),
 (26,'Tables, keys and relationships',0,1),
 (26,'Normalisation without the jargon',0,2),
 (26,'Indexes and query performance',0,3),
 (27,'Transactions and consistency',0,1),
 (27,'Backups and migrations',0,2),
 (27,'Connecting SQL to an application',0,3),

 -- Data science and machine learning
 (28,'Linear algebra for machine learning',1,1),
 (28,'Probability and statistics refresher',1,2),
 (28,'The calculus behind gradient descent',0,3),
 (29,'Feature engineering',0,1),
 (29,'Missing and imbalanced data',0,2),
 (29,'Encoding and scaling',0,3),
 (29,'Reproducible data pipelines',0,4),
 (30,'Linear and logistic regression',0,1),
 (30,'Decision trees and random forests',0,2),
 (30,'Gradient boosting',0,3),
 (30,'Evaluation and cross-validation',0,4),
 (31,'Clustering and dimensionality reduction',0,1),
 (31,'Neural network foundations',0,2),
 (31,'Training your first network in PyTorch',0,3),
 (31,'Working with text and embeddings',0,4),
 (32,'Serving a model behind an API',0,1),
 (32,'Monitoring drift in production',0,2),
 (32,'Bias, ethics and model review',0,3),

 -- Software testing and QA automation
 (33,'What QA actually does',1,1),
 (33,'Test cases, plans and coverage',1,2),
 (33,'Manual testing in practice',0,3),
 (33,'Bug reports developers act on',0,4),
 (34,'Setting up Selenium WebDriver',0,1),
 (34,'Locators and the page object model',0,2),
 (34,'Waits and fixing flaky tests',0,3),
 (34,'Data-driven test suites',0,4),
 (35,'Testing APIs with Postman',0,1),
 (35,'Automating API tests',0,2),
 (35,'Load testing fundamentals',0,3),
 (36,'Playwright for modern web apps',0,1),
 (36,'Running tests in CI',0,2),
 (36,'Reporting and test metrics',0,3),
 (37,'QA interview questions',0,1),
 (37,'Building a testing portfolio',0,2),

 -- Android app development with Kotlin
 (38,'Kotlin syntax and null safety',1,1),
 (38,'Classes, data classes and collections',1,2),
 (38,'Coroutines and asynchronous code',0,3),
 (39,'Android Studio and project structure',0,1),
 (39,'Activities, fragments and navigation',0,2),
 (39,'Layouts and Jetpack Compose basics',0,3),
 (39,'Handling user input',0,4),
 (40,'Room database and local storage',0,1),
 (40,'Calling REST APIs with Retrofit',0,2),
 (40,'State management and ViewModels',0,3),
 (40,'Offline-first behaviour',0,4),
 (41,'Material design and theming',0,1),
 (41,'Testing an Android app',0,2),
 (41,'Permissions and privacy',0,3),
 (41,'Publishing to the Play Store',0,4),

 -- C and C++ programming
 (42,'Your first C program',1,1),
 (42,'Variables, types and operators',1,2),
 (42,'Control flow and loops',0,3),
 (42,'Functions and scope',0,4),
 (43,'How memory actually works',0,1),
 (43,'Pointers, explained slowly',0,2),
 (43,'Arrays and strings in C',0,3),
 (43,'Dynamic memory and the classic mistakes',0,4),
 (44,'Classes and objects',0,1),
 (44,'Constructors and destructors',0,2),
 (44,'Inheritance and polymorphism',0,3),
 (44,'References and const correctness',0,4),
 (45,'Vectors, maps and iterators',0,1),
 (45,'Templates',0,2),
 (45,'File handling and streams',0,3),

 -- DevOps engineering
 (46,'What DevOps actually changes',1,1),
 (46,'Linux for engineers',1,2),
 (46,'Networking for DevOps',0,3),
 (46,'Scripting with Bash and Python',0,4),
 (47,'Docker fundamentals',0,1),
 (47,'Writing good Dockerfiles',0,2),
 (47,'Docker Compose for local stacks',0,3),
 (47,'Container registries',0,4),
 (48,'Pods, deployments and services',0,1),
 (48,'Configuration and secrets',0,2),
 (48,'Scaling and self-healing',0,3),
 (48,'Helm basics',0,4),
 (49,'CI/CD with GitHub Actions',0,1),
 (49,'Infrastructure as code with Terraform',0,2),
 (49,'Secrets management',0,3),
 (49,'Blue-green and canary releases',0,4),
 (50,'Metrics, logs and traces',0,1),
 (50,'Alerting that people act on',0,2),
 (50,'Running an incident review',0,3),

 -- Short-term internship
 (51,'Choosing your track',1,1),
 (51,'Setting up a professional environment',1,2),
 (51,'Git and collaborative workflow',0,3),
 (51,'How to read a project brief',0,4),
 (52,'Breaking a brief into tasks',0,1),
 (52,'Daily stand-ups with your mentor',0,2),
 (52,'Building the core feature',0,3),
 (52,'Your first code review',0,4),
 (53,'Owning a feature end to end',0,1),
 (53,'Testing what you built',0,2),
 (53,'Fixing bugs raised in review',0,3),
 (53,'Writing documentation',0,4),
 (54,'Preparing a project demo',0,1),
 (54,'Presenting to the review panel',0,2),
 (54,'Internship certificate and letter',0,3),
 (54,'Adding the project to your CV',0,4),

 -- Six-month industrial training
 (55,'Track selection and skill assessment',1,1),
 (55,'Professional development environment',1,2),
 (55,'Version control on a shared repository',0,3),
 (55,'Agile and sprint basics',0,4),
 (56,'Deep dive into your chosen stack',0,1),
 (56,'Databases and API design',0,2),
 (56,'Writing tests that catch regressions',0,3),
 (56,'Debugging and profiling',0,4),
 (57,'Joining a project team',0,1),
 (57,'Sprint planning and estimation',0,2),
 (57,'Building your assigned modules',0,3),
 (57,'Code review in a team setting',0,4),
 (57,'Integration and release',0,5),
 (58,'Choosing a specialisation',0,1),
 (58,'Advanced topics in your track',0,2),
 (58,'Performance and security review',0,3),
 (58,'Deployment and monitoring',0,4),
 (59,'Writing the university training report',0,1),
 (59,'Project viva preparation',0,2),
 (59,'Resume and portfolio review',0,3),
 (59,'Mock interviews',0,4),
 (59,'Placement assistance',0,5),

 -- Spring Boot backend development
 (60,'Why Spring exists',1,1),
 (60,'Dependency injection and beans',1,2),
 (60,'Spring Boot project structure',0,3),
 (60,'Configuration and profiles',0,4),
 (61,'Controllers and request mapping',0,1),
 (61,'Validation and error handling',0,2),
 (61,'DTOs and mapping',0,3),
 (61,'Versioning and OpenAPI documentation',0,4),
 (62,'Entities and relationships',0,1),
 (62,'Repositories and query methods',0,2),
 (62,'Transactions and the persistence context',0,3),
 (62,'Schema migrations with Flyway',0,4),
 (63,'Authentication with Spring Security',0,1),
 (63,'JWT and stateless sessions',0,2),
 (63,'Roles, permissions and method security',0,3),
 (63,'The mistakes that leak data',0,4),
 (64,'Unit testing services',0,1),
 (64,'Integration tests with Testcontainers',0,2),
 (64,'Mocking and test data',0,3),
 (64,'Running the suite in CI',0,4),
 (65,'Packaging and Dockerising a service',0,1),
 (65,'Configuration and secrets',0,2),
 (65,'Logging, metrics and health checks',0,3),
 (65,'Talking to other services',0,4),

 -- Data structures and algorithms
 (66,'Why complexity matters',1,1),
 (66,'Big-O, and what it hides',1,2),
 (66,'Measuring instead of guessing',0,3),
 (66,'Recursion and recurrence relations',0,4),
 (67,'Dynamic arrays',0,1),
 (67,'Linked lists in depth',0,2),
 (67,'Stacks and queues',0,3),
 (67,'Deques and circular buffers',0,4),
 (68,'Hash tables from scratch',0,1),
 (68,'Collision handling',0,2),
 (68,'Comparison sorts',0,3),
 (68,'Non-comparison sorts',0,4),
 (69,'Binary trees and traversals',0,1),
 (69,'Balanced trees and rotations',0,2),
 (69,'Heaps and priority queues',0,3),
 (69,'Tries and prefix structures',0,4),
 (70,'Representations and their trade-offs',0,1),
 (70,'BFS, DFS and topological sort',0,2),
 (70,'Shortest path algorithms',0,3),
 (70,'Minimum spanning trees',0,4),
 (71,'Divide and conquer',0,1),
 (71,'Greedy strategies, and proving them',0,2),
 (71,'Dynamic programming',0,3),
 (71,'Backtracking and pruning',0,4),
 (72,'Segment trees and Fenwick trees',0,1),
 (72,'Disjoint set union',0,2),
 (72,'Practice contest and review',0,3);

-- ---------------------------------------------------------------- batches

INSERT INTO batches (course_id, mode, centre_id, instructor_id, label, start_date, schedule, capacity, seats_taken, price, installment_count, status) VALUES
 (1,'classroom',1,1,'Morning batch','2026-10-06','Mon to Fri, 9:00 to 11:00 am',20,16,36000,3,'upcoming'),
 (1,'classroom',1,2,'Weekend batch','2026-10-20','Sat and Sun, 10:00 am to 1:00 pm',24,5,36000,3,'upcoming'),
 (1,'live_online',NULL,1,'Evening live batch','2026-10-13','Mon, Wed, Fri, 7:30 to 9:00 pm',40,11,25500,3,'upcoming'),

 (2,'classroom',1,2,'Evening batch','2026-10-09','Mon to Thu, 6:00 to 8:00 pm',20,18,26000,2,'upcoming'),
 (2,'live_online',NULL,2,'Weekend live batch','2026-11-01','Sat and Sun, 11:00 am to 1:00 pm',40,7,18000,2,'upcoming'),

 (3,'classroom',1,4,'Morning batch','2026-10-12','Mon to Fri, 7:00 to 9:00 am',24,20,33000,3,'upcoming'),
 (3,'classroom',1,4,'Evening batch','2026-11-03','Mon to Thu, 6:30 to 8:30 pm',20,4,33000,3,'upcoming'),
 (3,'live_online',NULL,4,'Weekend live batch','2026-10-25','Sat and Sun, 9:00 to 11:30 am',45,14,24000,2,'upcoming'),

 (4,'classroom',1,5,'Weekend batch','2026-11-15','Sat and Sun, 10:00 am to 1:00 pm',18,2,34000,2,'upcoming'),
 (4,'live_online',NULL,5,'Evening live batch','2026-10-28','Tue, Thu, Sat, 8:00 to 9:30 pm',40,9,24000,2,'upcoming'),

 (5,'classroom',1,2,'Evening batch','2026-10-16','Mon, Wed, Fri, 6:00 to 7:30 pm',20,11,14000,1,'upcoming'),
 (5,'live_online',NULL,2,'Weekend live batch','2026-11-07','Sat, 10:00 am to 1:00 pm',50,6,10000,1,'upcoming'),

 (6,'classroom',1,2,'Weekend batch','2026-11-22','Sat and Sun, 2:00 to 5:00 pm',16,3,42000,3,'upcoming'),
 (6,'live_online',NULL,2,'Evening live batch','2026-11-09','Mon, Wed, Fri, 8:00 to 9:30 pm',40,12,30000,2,'upcoming'),

 (7,'classroom',1,6,'Morning batch','2026-10-14','Mon to Fri, 10:00 am to 12:00 pm',22,15,24000,2,'upcoming'),
 (7,'live_online',NULL,6,'Evening live batch','2026-11-04','Tue and Thu, 7:00 to 9:00 pm',40,8,17000,2,'upcoming'),

 (8,'classroom',1,5,'Evening batch','2026-10-21','Mon to Thu, 6:00 to 8:00 pm',20,6,30000,2,'upcoming'),
 (8,'live_online',NULL,7,'Weekend live batch','2026-11-14','Sat and Sun, 3:00 to 5:30 pm',40,5,21000,2,'upcoming'),

 (9,'classroom',1,7,'Morning batch','2026-10-07','Mon to Thu, 8:00 to 10:00 am',24,19,14000,1,'upcoming'),
 (9,'live_online',NULL,7,'Evening live batch','2026-10-30','Tue and Thu, 8:30 to 10:00 pm',45,10,10000,1,'upcoming'),

 (10,'classroom',1,5,'Weekend batch','2026-12-06','Sat and Sun, 10:00 am to 1:00 pm',18,4,39000,3,'upcoming'),
 (10,'live_online',NULL,5,'Evening live batch','2026-11-23','Mon, Wed, Fri, 8:30 to 10:00 pm',40,13,28000,2,'upcoming'),

 -- Short-term internship
 (11,'classroom',1,1,'Winter batch','2026-12-08','Mon to Fri, 10:00 am to 1:00 pm',25,9,12000,1,'upcoming'),
 (11,'classroom',1,1,'Winter afternoon batch','2026-12-15','Mon to Fri, 2:00 to 5:00 pm',20,3,12000,1,'upcoming'),
 (11,'live_online',NULL,6,'Winter live batch','2026-12-15','Mon to Fri, 6:00 to 8:00 pm',40,13,8500,1,'upcoming'),

 -- Six-month industrial training
 (12,'classroom',1,4,'January batch','2027-01-05','Mon to Fri, 10:00 am to 4:00 pm',30,22,44000,4,'upcoming'),
 (12,'classroom',1,5,'Mid-January batch','2027-01-12','Mon to Fri, 10:00 am to 4:00 pm',25,6,44000,4,'upcoming'),
 (12,'live_online',NULL,4,'January live batch','2027-01-05','Mon to Fri, 7:00 to 10:00 pm',50,17,32000,4,'upcoming'),

 -- Spring Boot backend development
 (13,'classroom',1,7,'Evening batch','2026-11-02','Mon to Thu, 6:30 to 8:30 pm',20,12,32000,2,'upcoming'),
 (13,'live_online',NULL,7,'Weekend live batch','2026-11-21','Sat and Sun, 10:00 am to 12:30 pm',40,9,22000,2,'upcoming'),

 -- Data structures and algorithms
 (14,'classroom',1,4,'Morning batch','2026-10-26','Mon, Wed, Fri, 8:00 to 10:00 am',22,17,24000,2,'upcoming'),
 (14,'classroom',1,4,'Evening batch','2026-11-16','Tue and Thu, 6:00 to 8:30 pm',20,5,24000,2,'upcoming'),
 (14,'live_online',NULL,4,'Evening live batch','2026-11-09','Mon, Wed, Fri, 8:00 to 9:30 pm',45,21,16000,2,'upcoming'),

 -- Weekend batches
 (7,'classroom',1,6,'Weekend batch','2026-11-07','Sat and Sun, 8:00 to 10:30 am',20,3,24000,2,'upcoming'),
 (9,'classroom',1,4,'Weekend batch','2026-11-14','Sat and Sun, 2:00 to 4:30 pm',24,5,14000,1,'upcoming'),
 (14,'classroom',1,4,'Weekend batch','2026-11-21','Sat and Sun, 4:30 to 7:00 pm',22,2,24000,2,'upcoming'),

 -- Weekend batches, both modes
 (1,'live_online',NULL,1,'Weekend live batch','2026-11-07','Sat and Sun, 8:00 to 10:30 am',40,2,25500,3,'upcoming'),
 (2,'classroom',1,2,'Weekend batch','2026-11-14','Sat and Sun, 5:30 to 8:00 pm',20,3,26000,2,'upcoming'),
 (3,'classroom',1,4,'Weekend batch','2026-11-21','Sat and Sun, 11:30 am to 2:00 pm',20,4,33000,3,'upcoming'),
 (5,'classroom',1,1,'Weekend batch','2026-11-28','Sat and Sun, 11:30 am to 2:00 pm',20,5,14000,1,'upcoming'),
 (6,'live_online',NULL,NULL,'Weekend live batch','2026-12-05','Sat and Sun, 2:00 to 4:30 pm',40,6,30000,2,'upcoming'),
 (7,'live_online',NULL,6,'Weekend live batch','2026-12-12','Sat and Sun, 11:30 am to 2:00 pm',40,2,17000,2,'upcoming'),
 (8,'classroom',1,NULL,'Weekend batch','2026-12-19','Sat and Sun, 2:00 to 4:30 pm',20,3,30000,2,'upcoming'),
 (9,'live_online',NULL,7,'Weekend live batch','2026-12-26','Sat and Sun, 5:30 to 8:00 pm',40,4,10000,1,'upcoming'),
 (10,'live_online',NULL,5,'Weekend live batch','2027-01-02','Sat and Sun, 4:30 to 7:00 pm',40,5,28000,2,'upcoming'),
 (13,'classroom',1,NULL,'Weekend batch','2027-01-09','Sat and Sun, 4:30 to 7:00 pm',20,6,32000,2,'upcoming'),
 (14,'live_online',NULL,4,'Weekend live batch','2027-01-16','Sat and Sun, 7:30 to 9:30 pm',40,2,16000,2,'upcoming');

-- ------------------------------------------------------------ career paths

INSERT INTO paths (id, slug, title, tagline, description, outcome, position) VALUES
 (1,'web-developer','Web developer',
  'Build and ship complete websites and web apps.',
  'The most common first job in software, and the one with the widest range of employers. You start with the database layer so the rest makes sense, build full-stack applications in JavaScript, then learn to deploy and run them properly.',
  'Front-end developer, back-end developer, full-stack developer',1),

 (2,'software-engineer','Software engineer (campus placements)',
  'Clear the coding rounds that product companies set.',
  'Built for students targeting campus and off-campus hiring. Language fundamentals first, then data structures and algorithms properly, then Java with interview technique, mock rounds and aptitude preparation.',
  'Software engineer, SDE-1, graduate trainee',2),

 (3,'data-analyst','Data analyst',
  'Turn raw data into answers a business can act on.',
  'For anyone who has outgrown spreadsheets. SQL first, because every analyst job tests it, then Python, pandas and dashboards that non-technical colleagues can actually read.',
  'Data analyst, business analyst, MIS executive',3),

 (4,'data-scientist','Data scientist',
  'Train and ship models, not just notebooks.',
  'Continues where the analyst path ends. You move from describing data to predicting with it, covering the maths that matters, the model families used in practice, and what it takes to serve a model in production.',
  'Data scientist, machine learning engineer',4),

 (5,'qa-engineer','QA automation engineer',
  'The fastest route into a software team.',
  'Testing hires more entry-level people than any other software role, and needs less prior programming. SQL first so you can verify data, then manual testing done properly, then browser and API automation running in CI.',
  'QA engineer, test automation engineer, SDET',5),

 (6,'cloud-devops','Cloud and DevOps engineer',
  'Run the infrastructure everything else depends on.',
  'For developers and system administrators moving into infrastructure. AWS fundamentals and certification first, then containers, Kubernetes, pipelines and observability, building one deployment pipeline end to end.',
  'Cloud engineer, DevOps engineer, site reliability engineer',6),

 (7,'java-backend','Java backend developer',
  'The stack most enterprise job descriptions name.',
  'Java remains the default in banking, insurance and enterprise IT across India. Core Java and data structures first, because interviews test them, then Spring Boot, REST APIs, JPA and security.',
  'Java developer, backend developer, API developer',7),

 (8,'android-developer','Android developer',
  'Ship an app to the Play Store.',
  'Android hiring still asks JVM questions in interviews, so you cover Java and data structures first, then build real Kotlin applications with Jetpack Compose, local storage, APIs and the full release process.',
  'Android developer, mobile application developer',8);

INSERT INTO path_courses (path_id, course_id, position, note) VALUES
 (1,5,1,'Start here — every web app is a database with a front end'),
 (1,1,2,'The main build: HTML, CSS, JavaScript, React and Node'),
 (1,10,3,'Optional, but this is what separates you from other juniors'),

 (2,9,1,'Language fundamentals, pointers and memory'),
 (2,14,2,'Every structure implemented by hand'),
 (2,3,3,'Java, mock interviews, aptitude and HR rounds'),

 (3,5,1,'Every analyst interview tests SQL'),
 (3,2,2,'Python, pandas and dashboards'),

 (4,2,1,'Python and data handling first'),
 (4,6,2,'Modelling, neural networks and production'),

 (5,5,1,'Testers query databases every day'),
 (5,7,2,'Manual testing, Selenium, Playwright and CI'),

 (6,4,1,'AWS fundamentals and certification'),
 (6,10,2,'Docker, Kubernetes, Terraform and pipelines'),

 (7,3,1,'Core Java and the data structures interviews ask about'),
 (7,13,2,'Spring Boot, JPA, security and deployment'),

 (8,3,1,'Java foundations that Android interviews still test'),
 (8,8,2,'Kotlin, Jetpack Compose and the Play Store');
