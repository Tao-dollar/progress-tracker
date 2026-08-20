const HTML_PROGRESS_KEY = 'html-progress-state-v1';
const USERS_KEY = 'skillforge-users';
const CURRENT_USER_KEY = 'skillforge-current-user';

const levelNames = ['Beginner', 'Beginner +', 'Intermediate', 'Intermediate +', 'Advanced'];
const LEVEL_STEP_XP = 200;
const XP_PER_SUCCESS = 50;
const XP_PER_FAILURE = 25;
const XP_FAIL_STREAK_PENALTY = 10;
const xpThresholds = Array.from({ length: levelNames.length }, (_, index) => index * LEVEL_STEP_XP);

const firebaseConfig = {
    apiKey: 'AIzaSyDt-OCQ2Tr4O4no1O_AmBzlVbFz9O3EwIU',
    authDomain: 'skill-forge-academy.firebaseapp.com',
    projectId: 'skill-forge-academy',
    storageBucket: 'skill-forge-academy.firebasestorage.app',
    messagingSenderId: '1081814181931',
    appId: '1:1081814181931:web:fc1c99304337caeb18626e'
};

let firebaseAuth = null;
let firebaseReady = false;

function initFirebaseAuth() {
    if (!window.firebase || !firebase) {
        return;
    }

    const hasPlaceholderValues = Object.values(firebaseConfig).some((value) => {
        return typeof value === 'string' && value.startsWith('YOUR_');
    });

    if (hasPlaceholderValues) {
        console.info('Firebase config is not active yet. Google sign-in will not run until the keys are replaced.');
        return;
    }

    firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseReady = true;

    firebaseAuth.onAuthStateChanged((user) => {
        if (!user) {
            return;
        }

        const googleUser = normalizeUser({
            name: user.displayName || 'Google User',
            email: user.email,
            password: 'google-auth',
            xp: 0,
            htmlTasks: 0,
            cssTests: 0,
            bestScore: 0,
            cssBestScore: 0,
            failedStreak: 0
        });

        const existingUser = users.find((account) => account.email.toLowerCase() === googleUser.email.toLowerCase());
        if (!existingUser) {
            users.push(googleUser);
            saveUsers();
        } else {
            Object.assign(existingUser, googleUser);
            saveUsers();
        }

        setCurrentUser(googleUser.email);
    });
}

const htmlProjectBank = [
    {
        level: 0,
        title: 'Personal Bio Page',
        description: 'Create a simple profile page with your name, short bio, image, and a few links.',
        tasks: [
            'Use a heading for your name.',
            'Add a short paragraph about yourself.',
            'Insert an image and a link to your social profile.',
            'Use at least one list and one paragraph.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Bio</title>
  </head>
  <body>
    <h1>Jane Doe</h1>
    <img src="profile.jpg" alt="Jane Doe" width="200" />
    <p>I am a beginner web developer who enjoys learning HTML and CSS.</p>
    <h2>Skills</h2>
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
    <a href="https://github.com/yourname">GitHub</a>
  </body>
</html>`
    },
    {
        level: 0,
        title: 'School Landing Page',
        description: 'Make a one-page school website with a hero section, courses, and contact details.',
        tasks: [
            'Add a main heading and supporting text.',
            'Create a navigation bar.',
            'Add course cards using lists or divs.',
            'Include a contact section.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>School Landing Page</title>
  </head>
  <body>
    <nav>
      <a href="#home">Home</a>
      <a href="#courses">Courses</a>
      <a href="#contact">Contact</a>
    </nav>
    <h1>Welcome to Bright Academy</h1>
    <p>Learn skills that prepare you for the future.</p>
    <h2>Courses</h2>
    <ul>
      <li>Web Design</li>
      <li>Computer Science</li>
      <li>Graphic Design</li>
    </ul>
    <h2>Contact</h2>
    <p>Email: info@brightacademy.com</p>
  </body>
</html>`
    },
    {
        level: 0,
        title: 'Favorite Food Blog Card',
        description: 'Create a mini blog card with a title, recipe summary, ingredients, and a call to action.',
        tasks: [
            'Use proper headings and paragraph text.',
            'Add an ingredients list.',
            'Include a button-like link.',
            'Keep the content clean and readable.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Favorite Food</title>
  </head>
  <body>
    <h1>Easy Pasta Recipe</h1>
    <p>A quick and delicious meal for busy afternoons.</p>
    <h2>Ingredients</h2>
    <ul>
      <li>Pasta</li>
      <li>Tomato sauce</li>
      <li>Garlic</li>
      <li>Parmesan</li>
    </ul>
    <a href="#recipe">View Recipe</a>
  </body>
</html>`
    },
    {
        level: 1,
        title: 'Portfolio Homepage',
        description: 'Build a mini portfolio homepage with a header, about section, work examples, and contact section.',
        tasks: [
            'Add a logo or brand name.',
            'Use semantic tags like header, main, and footer.',
            'Create sections for about, projects, and contact.',
            'Add navigation links to each section.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <section id="about">
        <h1>Hi, I am Alex</h1>
        <p>I design and build websites.</p>
      </section>
      <section id="projects">
        <h2>Projects</h2>
        <p>Portfolio site, coffee shop page, and blog layout.</p>
      </section>
    </main>
    <footer id="contact">
      <p>Email: alex@example.com</p>
    </footer>
  </body>
</html>`
    },
    {
        level: 1,
        title: 'Restaurant Landing Page',
        description: 'Create a restaurant home page with a hero, menu highlights, and reservation section.',
        tasks: [
            'Set up an attractive hero section.',
            'List popular meals or categories.',
            'Add a reservation button or contact text.',
            'Use semantic structure for readability.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FreshBite Restaurant</title>
  </head>
  <body>
    <header>
      <h1>FreshBite</h1>
      <nav>
        <a href="#menu">Menu</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <section id="about">
        <h2>Fresh meals, warm atmosphere</h2>
        <p>Enjoy chef-made meals in a friendly environment.</p>
      </section>
      <section id="menu">
        <h3>Popular Meals</h3>
        <ul>
          <li>Grilled Chicken</li>
          <li>Garden Pasta</li>
          <li>Fruit Smoothie</li>
        </ul>
      </section>
    </main>
    <footer id="contact">
      <p>Book a table: 0800-123-456</p>
    </footer>
  </body>
</html>`
    },
    {
        level: 1,
        title: 'Event Promotion Page',
        description: 'Build a page for an upcoming event with speaker details, schedule highlights, and a register button.',
        tasks: [
            'Use headings for event title and sections.',
            'Add a schedule list with time and activity.',
            'Include a clear call-to-action button.',
            'Add a speaker or venue block.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dev Summit</title>
  </head>
  <body>
    <header>
      <h1>Dev Summit 2026</h1>
      <p>Learn from industry experts.</p>
      <a href="#register">Register Now</a>
    </header>
    <main>
      <section>
        <h2>Agenda</h2>
        <ul>
          <li>9:00 AM – Welcome</li>
          <li>10:00 AM – Frontend Talks</li>
          <li>12:00 PM – Networking</li>
        </ul>
      </section>
      <section>
        <h2>Speakers</h2>
        <p>Jane Johnson, UI Designer</p>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 2,
        title: 'Product Landing Page',
        description: 'Design a product landing page with a top banner, benefits, price plan, and a final call to action.',
        tasks: [
            'Use structured sections for features and pricing.',
            'Add a hero banner with a product summary.',
            'Create at least three feature points.',
            'Include a final CTA section.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloudFlow</title>
  </head>
  <body>
    <header>
      <h1>CloudFlow</h1>
      <nav>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
      </nav>
    </header>
    <main>
      <section>
        <h2>Work faster and smarter</h2>
        <p>Organize projects, tasks, and teams in one place.</p>
        <a href="#pricing">Get Started</a>
      </section>
      <section id="features">
        <h3>Why teams choose us</h3>
        <ul>
          <li>Easy collaboration</li>
          <li>Smart dashboards</li>
          <li>Fast deployment</li>
        </ul>
      </section>
      <section id="pricing">
        <h3>$25/month</h3>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 2,
        title: 'Blog Homepage',
        description: 'Build a personal blog homepage with multiple posts, featured article, and subscribe form.',
        tasks: [
            'Write a blog title and introduction.',
            'Include an article preview list.',
            'Add a subscription form with inputs.',
            'Use clear section separation.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daily Journal</title>
  </head>
  <body>
    <header>
      <h1>Daily Journal</h1>
    </header>
    <main>
      <section>
        <h2>Featured Story</h2>
        <p>Learning new skills every day unlocks bigger opportunities.</p>
      </section>
      <section>
        <h2>Latest Posts</h2>
        <ul>
          <li>How to Plan Your Week</li>
          <li>Designing Better Websites</li>
        </ul>
      </section>
      <section>
        <h2>Subscribe</h2>
        <form>
          <input type="email" placeholder="Your email" />
          <button type="submit">Submit</button>
        </form>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 2,
        title: 'Travel Agency Landing Page',
        description: 'Create a travel website with destinations, offers, and booking callouts.',
        tasks: [
            'Add a travel features section.',
            'List at least three destinations.',
            'Include a booking prompt or call to action.',
            'Use a good content hierarchy.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blue Sky Travel</title>
  </head>
  <body>
    <header>
      <h1>Blue Sky Travel</h1>
      <nav>
        <a href="#offers">Offers</a>
        <a href="#destinations">Destinations</a>
      </nav>
    </header>
    <main>
      <section>
        <h2>Book your dream getaway</h2>
        <p>Explore beaches, mountains, and cities.</p>
      </section>
      <section id="destinations">
        <ul>
          <li>Paris</li>
          <li>Tokyo</li>
          <li>Bali</li>
        </ul>
      </section>
      <section id="offers">
        <h3>Special deals</h3>
        <p>Save up to 30% on selected destinations.</p>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 3,
        title: 'Responsive Portfolio Layout',
        description: 'Build a portfolio with a header, hero section, projects grid, and an about section that looks clean on mobile screens.',
        tasks: [
            'Use a modern section layout.',
            'Build a project grid with cards.',
            'Add a responsive meta tag and mobile-friendly layout.',
            'Use semantic markup for readability.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Responsive Portfolio</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="#home">Home</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
      </nav>
    </header>
    <main>
      <section id="home">
        <h1>Build Better Experiences</h1>
      </section>
      <section id="projects">
        <div>Project One</div>
        <div>Project Two</div>
        <div>Project Three</div>
      </section>
      <section id="about">
        <h2>About Me</h2>
        <p>I build accessible and responsive interfaces.</p>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 3,
        title: 'Service Company Website',
        description: 'Create a service business home page with services, testimonials, and a contact form section.',
        tasks: [
            'Use headings and a clear central theme.',
            'Add a list of services and short descriptions.',
            'Include a simple contact form.',
            'Add testimonial or client feedback area.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nova Services</title>
  </head>
  <body>
    <header>
      <h1>Nova Services</h1>
      <nav>
        <a href="#services">Services</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <section id="services">
        <h2>Our Services</h2>
        <ul>
          <li>Web Design</li>
          <li>Brand Strategy</li>
          <li>SEO</li>
        </ul>
      </section>
      <section id="testimonials">
        <p>"Professional and easy to work with."</p>
      </section>
      <section id="contact">
        <form>
          <input type="text" placeholder="Your name" />
          <input type="email" placeholder="Your email" />
          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  </body>
</html>`
    },
    {
        level: 3,
        title: 'Dashboard Layout Wireframe',
        description: 'Design a dashboard-like page with summary cards, activity info, and a sidebar layout.',
        tasks: [
            'Add a top header and sidebar menu.',
            'Create 3 or 4 summary cards.',
            'Include a task or report area.',
            'Arrange the layout in a clean structure.'
        ],
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
  </head>
  <body>
    <aside>
      <h2>Menu</h2>
      <ul>
        <li>Overview</li>
        <li>Reports</li>
        <li>Settings</li>
      </ul>
    </aside>
    <main>
      <header>
        <h1>Dashboard</h1>
      </header>
      <section>
        <div>Sales</div>
        <div>Visitors</div>
        <div>Orders</div>
      </section>
      <section>
        <h3>Latest Activity</h3>
        <p>New signups are trending upward.</p>
      </section>
    </main>
  </body>
</html>`
    }
];

const cssChallenges = [
    {
        title: 'Profile Card',
        description: 'Create a clean profile card with a circular avatar, title, and button-like action.',
        tasks: [
            'Use a card container with padding and rounded corners.',
            'Style the avatar as a circle.',
            'Set a contrasting button or action area.',
            'Apply a soft shadow and readable text colors.'
        ],
        preview: `
      <div class="demo-card">
        <div class="demo-avatar">JD</div>
        <h2>Jane Doe</h2>
        <p>Frontend Developer</p>
        <button>View Profile</button>
      </div>
    `,
        solution: `
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: #e2e8f0;
        font-family: Arial, sans-serif;
      }
      .demo-card {
        width: 280px;
        background: white;
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
        text-align: center;
      }
      .demo-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, #38bdf8, #4f46e5);
        color: white;
        display: grid;
        place-items: center;
        margin: 0 auto 16px;
        font-weight: 700;
      }
      button {
        background: #0ea5e9;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 999px;
        margin-top: 12px;
      }
    `
    },
    {
        title: 'Pricing Section',
        description: 'Style a pricing card group with highlighted featured plan and balanced spacing.',
        tasks: [
            'Use a flex row for multiple pricing cards.',
            'Highlight one plan using a stronger border or background.',
            'Keep spacing consistent and readable.',
            'Style the action button clearly.'
        ],
        preview: `
      <div class="pricing-wrap">
        <div class="price-card">
          <h3>Starter</h3>
          <p>$9</p>
          <button>Choose</button>
        </div>
        <div class="price-card featured">
          <h3>Pro</h3>
          <p>$19</p>
          <button>Choose</button>
        </div>
      </div>
    `,
        solution: `
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: #f8fafc;
        font-family: Arial, sans-serif;
      }
      .pricing-wrap {
        display: flex;
        gap: 16px;
      }
      .price-card {
        background: white;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 24px;
        width: 180px;
        text-align: center;
      }
      .featured {
        background: #eff6ff;
        border: 2px solid #60a5fa;
      }
      button {
        background: #1d4ed8;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 10px;
      }
    `
    },
    {
        title: 'Hero Banner',
        description: 'Build a colorful landing-style hero section with a headline, paragraph, and primary CTA.',
        tasks: [
            'Set a gradient or strong colored background.',
            'Use large heading text with spacing.',
            'Add a call-to-action button.',
            'Keep the layout centered and readable.'
        ],
        preview: `
      <div class="hero">
        <h1>Learn faster</h1>
        <p>Build skills with guided projects and real feedback.</p>
        <button>Start Now</button>
      </div>
    `,
        solution: `
      body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1e293b, #0ea5e9);
        font-family: Arial, sans-serif;
      }
      .hero {
        width: 80%;
        background: rgba(255,255,255,0.12);
        padding: 30px;
        border-radius: 18px;
        text-align: center;
        color: white;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 2.5rem;
      }
      button {
        padding: 12px 20px;
        border: none;
        border-radius: 999px;
        background: white;
        color: #0f172a;
        font-weight: 700;
      }
    `
    }
];

function generateProjectForLevel(levelIndex, taskSeed) {
    const level = Math.max(0, Number(levelIndex) || 0);
    const seed = Math.max(0, Number(taskSeed) || 0);
    const themes = ['Portfolio', 'Business', 'Course', 'Product', 'Magazine', 'Agency', 'Travel', 'Startup'];
    const theme = themes[seed % themes.length];
    const sectionNames = ['About', 'Features', 'Highlights', 'Services', 'Results', 'Reviews'];
    const primarySection = sectionNames[(seed + level) % sectionNames.length];
    const secondarySection = sectionNames[(seed + 2 + level) % sectionNames.length];
    const taskCount = (level + 1) * 200;

    const tasks = [
        `Use a clear page title and a strong introductory headline.`,
        `Create a semantic layout with ${2 + level} main sections or containers.`,
        `Add a navigation bar or a primary call-to-action link.`,
        `Include ${Math.min(6, 2 + level)} content blocks such as lists, cards, or feature details.`,
        `Use at least ${Math.min(4, 2 + level)} paragraphs or descriptive text elements.`,
        `Add a form, testimonial, or contact area for stronger structure.`
    ];

    while (tasks.length < taskCount) {
        tasks.push(`Add a polished ${secondarySection.toLowerCase()} section with stronger content hierarchy and a ${level + 2}-part layout.`);
    }

    const sectionMarkup = Array.from({ length: 2 + level }, (_, index) => {
        const name = sectionNames[(index + seed) % sectionNames.length];
        const itemCount = Math.min(6, 2 + level + index);
        const listItems = Array.from({ length: itemCount }, (_, itemIndex) => `<li>${name} point ${itemIndex + 1}</li>`).join('');
        return `
      <section id="${name.toLowerCase()}-${index + 1}">
        <h2>${name}</h2>
        <p>Build a clear summary for this ${name.toLowerCase()} area.</p>
        <ul>${listItems}</ul>
      </section>`;
    }).join('');

    const solution = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${theme} Studio</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="#home">Home</a>
        <a href="#${primarySection.toLowerCase()}">${primarySection}</a>
        <a href="#contact">Contact</a>
      </nav>
      <h1>${theme} ${level > 0 ? 'Challenge' : 'Landing Page'}</h1>
      <p>Create a polished layout for a modern web project.</p>
      <a href="#contact">Start learning</a>
    </header>
    <main>
      <section id="home">
        <h2>Welcome</h2>
        <p>Design a focused experience with strong structure and readable content.</p>
      </section>
      ${sectionMarkup}
      <section id="contact">
        <h2>Contact</h2>
        <form>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <button type="submit">Submit</button>
        </form>
      </section>
    </main>
    <footer>
      <p>Practice and improve every day.</p>
    </footer>
  </body>
</html>`;

    return {
        id: `generated-${level}-${seed}-${theme}`,
        level,
        title: `${theme} Challenge ${seed + 1}`,
        description: `Build a ${theme.toLowerCase()} page with deeper structure, stronger hierarchy, and more advanced sections as you reach level ${level + 1}.`,
        tasks,
        solution,
        requirements: [
            { pattern: /<header|<nav|<main|<section|<footer/gi, weight: 18 },
            { pattern: /<h1|<h2|<h3/gi, weight: 18 },
            { pattern: /<ul|<ol/gi, weight: 16 },
            { pattern: /<a\s+href=/gi, weight: 14 },
            { pattern: /<form|<input|<button/gi, weight: 14 },
            { pattern: /<p\s*>|<p\s+[^>]*>/gi, weight: 10 },
            { pattern: /id=\"[a-z-]+\"/gi, weight: 10 }
        ]
    };
}

function buildLevelProjectPool(levelIndex) {
    const generatedCount = (Math.max(0, Number(levelIndex) || 0) + 1) * 10;
    const pool = [];
    for (let index = 0; index < generatedCount; index += 1) {
        pool.push(generateProjectForLevel(levelIndex, index));
    }
    return pool;
}

function getLevelProjects(levelIndex) {
    const bankProjects = htmlProjectBank.filter((project) => project.level === levelIndex);
    if (bankProjects.length > 0) {
        return bankProjects;
    }
    return buildLevelProjectPool(levelIndex);
}

function getCurrentProject() {
    const currentLevel = getCurrentLevelIndex();
    const levelProjects = getLevelProjects(currentLevel);
    const safeIndex = ((state.currentProjectIndex % levelProjects.length) + levelProjects.length) % levelProjects.length;
    return levelProjects[safeIndex];
}

function getPerformanceScore(submittedCode, project) {
    const cleanCode = (submittedCode || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const projectText = (project && project.solution ? project.solution : '').replace(/\s+/g, ' ').trim().toLowerCase();

    if (!cleanCode) {
        return 0;
    }

    const requirements = Array.isArray(project && project.requirements) && project.requirements.length
        ? project.requirements
        : [
            { pattern: /<header|<nav|<main|<section|<footer/gi, weight: 18 },
            { pattern: /<h1|<h2|<h3/gi, weight: 18 },
            { pattern: /<ul|<ol/gi, weight: 16 },
            { pattern: /<a\s+href=/gi, weight: 14 },
            { pattern: /<form|<input|<button/gi, weight: 14 },
            { pattern: /<p\s*>|<p\s+[^>]*>/gi, weight: 10 },
            { pattern: /id=\"[a-z-]+\"/gi, weight: 10 }
        ];

    const totalWeight = requirements.reduce((sum, item) => sum + Number(item.weight || 0), 0) || 1;
    const matches = requirements.reduce((score, item) => {
        const pattern = new RegExp(item.pattern);
        return score + (pattern.test(cleanCode) ? Number(item.weight || 0) : 0);
    }, 0);

    const structureScore = (matches / totalWeight) * 100;
    const textDensity = cleanCode.split(/<\/?[a-z0-9-]+\b[^>]*>/).join(' ').match(/\b\w{4,}\b/g)?.length || 0;

    const contentBonus = Math.min(20, Math.max(0, Math.round(textDensity / 12)));
    const semanticBonus = ((cleanCode.match(/<header|<nav|<main|<section|<footer|<aside/gi) || []).length * 4);
    const formBonus = ((cleanCode.match(/<form|<input|<button/gi) || []).length * 3);
    const similarity = Math.min((cleanCode.length / Math.max(projectText.length, 1)) * 100, 100);
    const total = Math.round((structureScore * 0.7) + (similarity * 0.2) + ((contentBonus + semanticBonus + formBonus) * 0.6));

    return Math.max(0, Math.min(100, total));
}

function normalizeHtmlProgress(rawState) {
    if (!rawState) {
        return {
            xp: 0,
            projectsDone: 0,
            currentProjectIndex: 0,
            submittedProjectIds: [],
            lastLevel: 0,
            bestScore: 0,
            lastScore: 0
        };
    }

    return {
        xp: Number(rawState.xp) || 0,
        projectsDone: Number(rawState.projectsDone) || 0,
        currentProjectIndex: Number(rawState.currentProjectIndex) || 0,
        submittedProjectIds: Array.isArray(rawState.submittedProjectIds) ? rawState.submittedProjectIds : [],
        lastLevel: Number(rawState.lastLevel) || 0,
        bestScore: Number(rawState.bestScore) || 0,
        lastScore: Number(rawState.lastScore) || 0
    };
}

const state = normalizeHtmlProgress(loadHtmlProgress());
const users = loadUsers();
let currentCssIndex = 0;

const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const taskList = document.getElementById('taskList');
const levelValue = document.getElementById('levelValue');
const xpValue = document.getElementById('xpValue');
const projectValue = document.getElementById('projectsValue');
const scoreValue = document.getElementById('scoreValue');
const statusPill = document.getElementById('statusPill');
const levelBadge = document.getElementById('levelBadge');
const levelList = document.getElementById('levelList');
const progressFill = document.getElementById('progressFill');
const statusMessage = document.getElementById('statusMessage');
const solutionBox = document.getElementById('solutionBox');
const solutionOutput = document.getElementById('solutionOutput');
const projectPreview = document.getElementById('projectPreview');
const codeInput = document.getElementById('codeInput');

const cssChallengeTitle = document.getElementById('cssChallengeTitle');
const cssChallengeDescription = document.getElementById('cssChallengeDescription');
const cssTaskList = document.getElementById('cssTaskList');
const cssStatusMessage = document.getElementById('cssStatusMessage');
const cssCodeInput = document.getElementById('cssCodeInput');
const cssPreviewFrame = document.getElementById('cssPreviewFrame');
const cssSolutionBox = document.getElementById('cssSolutionBox');
const cssSolutionOutput = document.getElementById('cssSolutionOutput');

const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const cssView = document.getElementById('cssView');
const profileView = document.getElementById('profileView');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileLevelBadge = document.getElementById('profileLevelBadge');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileXp = document.getElementById('profileXp');
const profileHtmlTasks = document.getElementById('profileHtmlTasks');
const profileCssTasks = document.getElementById('profileCssTasks');
const profileBestScore = document.getElementById('profileBestScore');

function loadHtmlProgress() {
    const savedState = localStorage.getItem(HTML_PROGRESS_KEY);
    return savedState ? JSON.parse(savedState) : null;
}

function loadUsers() {
    const savedUsers = localStorage.getItem(USERS_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
}

function saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveHtmlProgress() {
    localStorage.setItem(HTML_PROGRESS_KEY, JSON.stringify(state));
}

function normalizeUser(account) {
    return {
        name: account.name || 'Student',
        email: account.email || '',
        password: account.password || '',
        xp: Number(account.xp) || 0,
        htmlTasks: Number(account.htmlTasks) || 0,
        cssTests: Number(account.cssTests) || 0,
        bestScore: Number(account.bestScore) || 0,
        cssBestScore: Number(account.cssBestScore) || 0,
        failedStreak: Number(account.failedStreak) || 0
    };
}

function getCurrentUser() {
    const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
    return users.find((user) => user.email.toLowerCase() === (currentEmail || '').toLowerCase()) || null;
}

function setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
}

function getLevelFromXp(totalXp) {
    const safeXp = Number(totalXp) || 0;
    if (safeXp < LEVEL_STEP_XP) {
        return 0;
    }

    const levelIndex = Math.floor(safeXp / LEVEL_STEP_XP);
    return Math.min(levelIndex, levelNames.length - 1);
}

function updateProfileUI() {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const levelIndex = getLevelFromXp(user.xp || 0);
    const levelName = levelNames[levelIndex];

    profileLevelBadge.textContent = `Level ${levelIndex + 1} • ${levelName}`;
    profileName.textContent = user.name;
    profileEmail.textContent = user.email;
    profileXp.textContent = `${user.xp || 0} XP`;
    profileHtmlTasks.textContent = `${user.htmlTasks || 0}`;
    profileCssTasks.textContent = `${user.cssTests || 0}`;
    profileBestScore.textContent = `${user.bestScore || 0}%`;
}

function showView(viewName) {
    const allViews = [authView, dashboardView, cssView, profileView];
    allViews.forEach((view) => {
        view.classList.add('hidden');
    });

    const target = {
        authView,
        dashboardView,
        cssView,
        profileView
    }[viewName];

    if (target) {
        target.classList.remove('hidden');
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.view === viewName);
    });

    logoutBtn.classList.toggle('hidden', !getCurrentUser());
}

function getCurrentLevelIndex() {
    const user = getCurrentUser();
    const totalXp = user ? (user.xp || 0) : (state.xp || 0);
    return getLevelFromXp(totalXp);
}

function isProjectSubmitted(project) {
    return state.submittedProjectIds.includes(project.title);
}

function renderRoadmap() {
    levelList.innerHTML = '';
    levelNames.forEach((levelName, index) => {
        const item = document.createElement('li');
        const currentLevelIndex = getCurrentLevelIndex();
        item.textContent = `${index + 1}. ${levelName}${index === currentLevelIndex ? ' • Current' : ''}`;
        levelList.appendChild(item);
    });
}

function getPerformanceScore(submittedCode, project) {
    const cleanCode = (submittedCode || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const solutionText = (project.solution || '').replace(/\s+/g, ' ').trim().toLowerCase();

    if (!cleanCode) {
        return 0;
    }

    const requiredChecks = [
        /<h1|<h2/i,
        /<p/i,
        /<ul|<ol/i,
        /<a\s+href=/i,
        /<img|<form|<nav|<header|<main|<footer|<section/i
    ];

    let matches = 0;
    requiredChecks.forEach((pattern) => {
        if (pattern.test(cleanCode)) {
            matches += 1;
        }
    });

    const similarity = Math.min((cleanCode.length / Math.max(solutionText.length, 1)) * 100, 100);
    const structureScore = (matches / requiredChecks.length) * 100;
    const performance = Math.round((similarity * 0.45) + (structureScore * 0.55));

    return Math.max(0, Math.min(100, performance));
}

function refreshDashboard() {
    const user = getCurrentUser();
    const totalXp = user ? (user.xp || 0) : (state.xp || 0);
    const currentLevel = getCurrentLevelIndex();
    const project = getCurrentProject();

    if (!project) {
        return;
    }

    const levelName = levelNames[currentLevel];
    projectTitle.textContent = project.title;
    projectDescription.textContent = project.description;
    projectPreview.srcdoc = project.solution;

    taskList.innerHTML = '';
    project.tasks.forEach((task) => {
        const item = document.createElement('li');
        item.textContent = task;
        taskList.appendChild(item);
    });

    levelValue.textContent = levelName;
    levelBadge.textContent = levelName;
    statusPill.textContent = `Level ${currentLevel + 1} • ${levelName}`;
    xpValue.textContent = `${totalXp} XP`;
    projectValue.textContent = String(user ? (user.htmlTasks || 0) : (state.projectsDone || 0));
    scoreValue.textContent = `${user ? (user.bestScore || 0) : (state.bestScore || 0)}%`;

    const totalXpCap = xpThresholds[xpThresholds.length - 1] + LEVEL_STEP_XP;
    const progress = Math.min((totalXp / totalXpCap) * 100, 100);
    progressFill.style.width = `${progress}%`;

    if (isProjectSubmitted(project)) {
        solutionBox.classList.add('visible');
        solutionOutput.textContent = project.solution;
        statusMessage.textContent = 'Nice work — the solution is unlocked.';
    } else {
        solutionBox.classList.remove('visible');
        solutionOutput.textContent = '';
        statusMessage.textContent = 'Submit your code to earn XP and get reviewed.';
    }

    renderRoadmap();
    saveHtmlProgress();
}

function buildProtectedCodeMarkup(code) {
    const safeText = `Protected solution\nCopying and screenshots are disabled.`;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="880" height="520" viewBox="0 0 880 520">
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="36" y="52" fill="#38bdf8" font-size="26" font-family="Consolas, monospace" font-weight="700">Solution hidden</text>
      <text x="36" y="92" fill="#fbbf24" font-size="18" font-family="Consolas, monospace">Protected review mode</text>
      <rect x="30" y="120" width="820" height="350" rx="16" fill="#111827" stroke="#334155"/>
      <text x="56" y="170" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">██████████████████</text>
      <text x="56" y="210" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">███████ protected ███████</text>
      <text x="56" y="250" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">██████████████████</text>
      <text x="56" y="290" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">████████ no copy ████████</text>
      <text x="56" y="330" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">████████ no screenshot ███████</text>
      <text x="56" y="370" fill="#7dd3fc" font-size="16" font-family="Consolas, monospace">██████████████████</text>
      <text x="56" y="430" fill="#f1f5f9" font-size="16" font-family="Consolas, monospace">${safeText}</text>
    </svg>
  `;

    const encoded = encodeURIComponent(svg);
    return `<div class="obscured-solution"><img src="data:image/svg+xml;charset=utf-8,${encoded}" alt="Protected solution" draggable="false" /></div>`;
}

function applyTaskOutcome(isSuccess) {
    const user = getCurrentUser();
    if (!user) {
        statusMessage.textContent = 'Login first to track XP and level progress.';
        return;
    }

    const currentMisses = Number(user.failedStreak) || 0;

    if (isSuccess) {
        user.failedStreak = 0;
        user.xp = (user.xp || 0) + XP_PER_SUCCESS;
        user.htmlTasks = (user.htmlTasks || 0) + 1;
        statusMessage.textContent = `Task passed. +${XP_PER_SUCCESS} XP awarded.`;
    } else {
        user.failedStreak = currentMisses + 1;
        user.xp = (user.xp || 0) + XP_PER_FAILURE;

        if (user.failedStreak >= 3) {
            user.xp = Math.max(0, (user.xp || 0) - XP_FAIL_STREAK_PENALTY);
            statusMessage.textContent = `Three failed tasks in a row. -${XP_FAIL_STREAK_PENALTY} XP penalty.`;
            user.failedStreak = 0;
        } else {
            statusMessage.textContent = `Task failed. +${XP_PER_FAILURE} XP awarded for trying.`;
        }
    }

    const previousLevel = getLevelFromXp((state.xp || 0));
    state.xp = user.xp;
    const nextLevel = getLevelFromXp(user.xp || 0);
    if (nextLevel > previousLevel && user.xp >= LEVEL_STEP_XP) {
        statusMessage.textContent += ` Level up to ${levelNames[nextLevel]}.`;
    }

    if (user.xp < LEVEL_STEP_XP && previousLevel !== 0) {
        statusMessage.textContent += ' Level stays locked until 100 XP is reached.';
    }

    saveUsers();
    saveHtmlProgress();
    updateProfileUI();
    refreshDashboard();
}

function awardHtmlXp(project) {
    const user = getCurrentUser();
    if (!project || !user) {
        if (!user) {
            statusMessage.textContent = 'Login first to submit your code.';
        }
        return;
    }

    const submittedCode = codeInput.value.trim();
    if (!submittedCode) {
        statusMessage.textContent = 'Paste your HTML first, then submit it for review.';
        return;
    }

    const score = getPerformanceScore(submittedCode, project);
    const passed = score >= 70;

    if (passed) {
        user.bestScore = Math.max(user.bestScore || 0, score);
        state.bestScore = user.bestScore;
        if (!state.submittedProjectIds.includes(project.title)) {
            state.submittedProjectIds.push(project.title);
        }
        applyTaskOutcome(true);
        solutionBox.classList.add('visible');
        solutionOutput.textContent = project.solution;
        return;
    }

    user.bestScore = Math.max(user.bestScore || 0, score);
    state.bestScore = user.bestScore;
    applyTaskOutcome(false);
    solutionBox.classList.add('visible');
    solutionOutput.innerHTML = buildProtectedCodeMarkup(project.solution);
    statusMessage.textContent = `Wrong code submitted. The solution is protected and cannot be copied or captured. ${statusMessage.textContent}`;

    document.addEventListener('contextmenu', (event) => {
        if (solutionBox.classList.contains('visible') && solutionOutput.innerHTML.includes('Protected solution')) {
            event.preventDefault();
        }
    }, { once: true });
}

function revealHtmlSolution() {
    const project = getCurrentProject();
    if (!project) {
        return;
    }

    solutionBox.classList.add('visible');
    solutionOutput.textContent = project.solution;
    statusMessage.textContent = 'Solution revealed for review.';
}

function advanceProject() {
    const currentLevel = getCurrentLevelIndex();
    const levelProjects = getLevelProjects(currentLevel);

    if (!levelProjects.length) {
        return;
    }

    state.currentProjectIndex = (state.currentProjectIndex + 1) % levelProjects.length;
    solutionBox.classList.remove('visible');
    solutionOutput.textContent = '';
    statusMessage.textContent = 'A new challenge is ready.';
    refreshDashboard();
}

function resetProgress() {
    const user = getCurrentUser();
    const resetState = {
        xp: 0,
        projectsDone: 0,
        currentProjectIndex: 0,
        submittedProjectIds: [],
        lastLevel: 0,
        lastScore: 0,
        bestScore: 0
    };

    Object.assign(state, resetState);
    if (user) {
        user.xp = 0;
        user.htmlTasks = 0;
        user.bestScore = 0;
        user.failedStreak = 0;
        saveUsers();
    }

    codeInput.value = '';
    statusMessage.textContent = 'Progress reset. Start again from Beginner.';
    refreshDashboard();
    updateProfileUI();
}

function renderCssChallenge() {
    const challenge = cssChallenges[currentCssIndex % cssChallenges.length];
    cssChallengeTitle.textContent = challenge.title;
    cssChallengeDescription.textContent = challenge.description;
    cssTaskList.innerHTML = '';
    challenge.tasks.forEach((task) => {
        const item = document.createElement('li');
        item.textContent = task;
        cssTaskList.appendChild(item);
    });
    cssPreviewFrame.srcdoc = `<!DOCTYPE html><html><body>${challenge.preview}</body><style>${cssCodeInput.value || challenge.solution}</style></html>`;
    cssSolutionBox.classList.remove('visible');
    cssSolutionOutput.textContent = '';
    cssStatusMessage.textContent = 'Build a clean card layout using CSS.';
}

function evaluateCssSubmission() {
    const user = getCurrentUser();
    if (!user) {
        cssStatusMessage.textContent = 'Login first to submit a CSS test.';
        return;
    }

    const cssCode = cssCodeInput.value.trim();
    if (!cssCode) {
        cssStatusMessage.textContent = 'Write some CSS before submitting the test.';
        return;
    }

    const challenge = cssChallenges[currentCssIndex % cssChallenges.length];
    const normalized = cssCode.toLowerCase();
    const checks = [
        { pattern: /display\s*:\s*flex/i, points: 20 },
        { pattern: /border-radius\s*:/i, points: 15 },
        { pattern: /padding\s*:/i, points: 15 },
        { pattern: /background(?:-color)?\s*:/i, points: 15 },
        { pattern: /box-shadow\s*:/i, points: 15 },
        { pattern: /color\s*:/i, points: 10 },
        { pattern: /width\s*:\s*\d+px|max-width\s*:/i, points: 10 }
    ];

    let score = 0;
    checks.forEach(({ pattern, points }) => {
        if (pattern.test(normalized)) {
            score += points;
        }
    });

    const similarityBonus = normalized.includes('card') || normalized.includes('pricing') || normalized.includes('hero') ? 10 : 0;
    const finalScore = Math.min(100, Math.round(score + similarityBonus));
    const xpAward = Math.round((finalScore / 100) * 140) + 30;

    user.xp = (user.xp || 0) + xpAward;
    user.cssTests = (user.cssTests || 0) + 1;
    user.cssBestScore = Math.max(user.cssBestScore || 0, finalScore);
    user.bestScore = Math.max(user.bestScore || 0, finalScore);

    cssStatusMessage.textContent = `CSS review: ${finalScore}% accuracy. +${xpAward} XP awarded.`;
    cssSolutionBox.classList.add('visible');
    cssSolutionOutput.textContent = challenge.solution;
    saveUsers();
    updateProfileUI();
    refreshDashboard();
}

function revealCssSolution() {
    const challenge = cssChallenges[currentCssIndex % cssChallenges.length];
    cssSolutionBox.classList.add('visible');
    cssSolutionOutput.textContent = challenge.solution;
    cssStatusMessage.textContent = 'CSS solution revealed for review.';
}

function nextCssChallenge() {
    currentCssIndex += 1;
    cssCodeInput.value = '';
    renderCssChallenge();
}

function handleAuthToggle(event) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.auth === event.target.dataset.auth);
    });

    const isLogin = event.target.dataset.auth === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    registerForm.classList.toggle('hidden', isLogin);
}

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const user = normalizeUser(users.find((item) => item.email.toLowerCase() === email.toLowerCase()));

    if (!user.email || user.password !== password) {
        statusMessage.textContent = 'Incorrect email or password.';
        return;
    }

    setCurrentUser(user.email);
    showView('dashboardView');
    refreshDashboard();
    updateProfileUI();
    loginForm.reset();
}

function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
        statusMessage.textContent = 'Please complete all registration fields.';
        return;
    }

    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        statusMessage.textContent = 'An account with this email already exists.';
        return;
    }

    const newUser = normalizeUser({
        name,
        email,
        password,
        xp: 0,
        htmlTasks: 0,
        cssTests: 0,
        bestScore: 0,
        cssBestScore: 0,
        failedStreak: 0
    });

    users.push(newUser);
    saveUsers();
    setCurrentUser(newUser.email);
    showView('dashboardView');
    updateProfileUI();
    refreshDashboard();
    registerForm.reset();
}

function logoutUser() {
    if (firebaseReady && firebaseAuth) {
        firebaseAuth.signOut().catch(() => { });
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    showView('authView');
}

function handleGoogleSignIn() {
    if (!firebaseReady || !firebaseAuth) {
        statusMessage.textContent = 'Google sign-in is not configured yet. Add your Firebase config values in script.js.';
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    firebaseAuth.signInWithPopup(provider)
        .then((result) => {
            const googleUser = result.user;
            const profile = normalizeUser({
                name: googleUser.displayName || 'Google User',
                email: googleUser.email,
                password: 'google-auth',
                xp: 0,
                htmlTasks: 0,
                cssTests: 0,
                bestScore: 0,
                cssBestScore: 0,
                failedStreak: 0
            });

            const existing = users.find((user) => user.email.toLowerCase() === profile.email.toLowerCase());
            if (!existing) {
                users.push(profile);
            } else {
                Object.assign(existing, profile);
            }

            saveUsers();
            setCurrentUser(profile.email);
            showView('dashboardView');
            refreshDashboard();
            updateProfileUI();
            loginForm.reset();
            registerForm.reset();
        })
        .catch((error) => {
            statusMessage.textContent = `Google sign-in failed: ${error.message}`;
        });
}

document.getElementById('nextProjectBtn').addEventListener('click', advanceProject);
document.getElementById('submitProjectBtn').addEventListener('click', () => {
    awardHtmlXp(getCurrentProject());
});
document.getElementById('revealSolutionBtn').addEventListener('click', revealHtmlSolution);
document.getElementById('resetBtn').addEventListener('click', resetProgress);

document.getElementById('newCssBtn').addEventListener('click', nextCssChallenge);
document.getElementById('submitCssBtn').addEventListener('click', evaluateCssSubmission);
document.getElementById('revealCssBtn').addEventListener('click', revealCssSolution);

document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const user = getCurrentUser();
        if (!user && button.dataset.view !== 'authView') {
            showView('authView');
            return;
        }
        showView(button.dataset.view);
    });
});

document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', handleAuthToggle);
});

loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);
logoutBtn.addEventListener('click', logoutUser);
document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleSignIn);
document.getElementById('googleRegisterBtn').addEventListener('click', handleGoogleSignIn);

initFirebaseAuth();
renderCssChallenge();
refreshDashboard();
updateProfileUI();

const savedUser = getCurrentUser();
if (savedUser) {
    showView('dashboardView');
    updateProfileUI();
    refreshDashboard();
} else {
    showView('dashboardView');
    statusMessage.textContent = 'Preview ready. Log in to save progress and earn XP.';
    refreshDashboard();
}