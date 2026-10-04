import type { AIProvider } from './provider';
import type { ProjectGeneration } from '../../core/contracts/types';

/**
 * DemoProvider returns a deterministic, realistic generated website.
 * Used when DEMO_MODE=true or when no API key is configured.
 * This allows the entire product to be tested without external AI access.
 */
export class DemoProvider implements AIProvider {
  readonly name = 'demo';

  async generateProject(prompt: string): Promise<ProjectGeneration> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const projectName = this.extractProjectName(prompt);

    return {
      projectName,
      files: [
        {
          path: 'index.html',
          language: 'html',
          content: this.generateHTML(projectName, prompt),
        },
        {
          path: 'styles.css',
          language: 'css',
          content: this.generateCSS(),
        },
        {
          path: 'app.js',
          language: 'javascript',
          content: this.generateJS(),
        },
      ],
    };
  }

  private extractProjectName(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('burger') || lower.includes('restaurant')) {
      return 'Ember & Oak - Premium Burger House';
    }
    if (lower.includes('portfolio')) {
      return 'Creative Portfolio';
    }
    if (lower.includes('landing')) {
      return 'Modern Landing Page';
    }
    return 'Generated Application';
  }

  private generateHTML(name: string, _prompt: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="hero">
    <nav class="navbar">
      <div class="logo">🔥 ${name}</div>
      <ul class="nav-links">
        <li><a href="#menu">Menu</a></li>
        <li><a href="#specials">Specials</a></li>
        <li><a href="#testimonials">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <div class="hero-content">
      <h1>Crafted with Fire,<br>Served with Pride</h1>
      <p>Premium burgers made from locally-sourced ingredients, grilled over open flame.</p>
      <a href="#menu" class="cta-button">Explore Our Menu</a>
    </div>
  </header>

  <section id="menu" class="section">
    <h2 class="section-title">Our Menu</h2>
    <div class="menu-grid">
      <div class="menu-card">
        <div class="card-icon">🍔</div>
        <h3>The Classic Ember</h3>
        <p>Angus beef, aged cheddar, caramelized onions, house sauce</p>
        <span class="price">$14.99</span>
      </div>
      <div class="menu-card">
        <div class="card-icon">🔥</div>
        <h3>Inferno Stack</h3>
        <p>Double patty, pepper jack, jalapeños, chipotle aioli</p>
        <span class="price">$17.99</span>
      </div>
      <div class="menu-card">
        <div class="card-icon">🌿</div>
        <h3>Garden Flame</h3>
        <p>Plant-based patty, avocado, arugula, truffle mayo</p>
        <span class="price">$15.99</span>
      </div>
      <div class="menu-card">
        <div class="card-icon">🧀</div>
        <h3>Triple Smoke</h3>
        <p>Three cheese blend, smoked bacon, BBQ glaze</p>
        <span class="price">$18.99</span>
      </div>
    </div>
  </section>

  <section id="specials" class="section section-dark">
    <h2 class="section-title">Special Offers</h2>
    <div class="specials-grid">
      <div class="special-card">
        <span class="badge">Happy Hour</span>
        <h3>50% Off Appetizers</h3>
        <p>Every weekday from 4-6 PM. Perfect for after-work gatherings.</p>
      </div>
      <div class="special-card">
        <span class="badge">Weekend</span>
        <h3>Family Bundle</h3>
        <p>4 burgers + 4 sides + 4 drinks for $59.99. Save $20+.</p>
      </div>
    </div>
  </section>

  <section id="testimonials" class="section">
    <h2 class="section-title">What People Say</h2>
    <div class="testimonials-grid">
      <div class="testimonial">
        <p>"Best burger I've ever had. The Ember Classic is perfection."</p>
        <span class="author">— Sarah M.</span>
      </div>
      <div class="testimonial">
        <p>"The atmosphere is incredible and the food matches. We come every Friday."</p>
        <span class="author">— James T.</span>
      </div>
      <div class="testimonial">
        <p>"Finally, a place that takes plant-based burgers seriously. The Garden Flame is outstanding."</p>
        <span class="author">— Priya K.</span>
      </div>
    </div>
  </section>

  <section id="contact" class="section section-dark">
    <h2 class="section-title">Visit Us</h2>
    <div class="contact-grid">
      <div class="contact-item">
        <h3>📍 Location</h3>
        <p>142 Flame Street<br>Downtown District<br>Open Daily 11AM - 11PM</p>
      </div>
      <div class="contact-item">
        <h3>📞 Contact</h3>
        <p>Phone: (555) 234-5678<br>Email: hello@emberandoak.com<br>Reservations recommended</p>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>&copy; 2024 ${name}. All rights reserved.</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>`;
  }

  private generateCSS(): string {
    return `/* Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #d4451a;
  --color-dark: #1a1a1a;
  --color-darker: #111111;
  --color-light: #f8f5f0;
  --color-text: #333333;
  --color-text-light: #f0f0f0;
  --color-accent: #f5a623;
  --font-heading: Georgia, 'Times New Roman', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --max-width: 1200px;
  --radius: 12px;
  --shadow: 0 4px 20px rgba(0,0,0,0.1);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  line-height: 1.6;
  background: var(--color-light);
}

/* Navigation */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: var(--max-width);
  margin: 0 auto;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text-light);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--color-accent);
}

/* Hero */
.hero {
  background: linear-gradient(135deg, var(--color-darker) 0%, #2d1810 100%);
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-content {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-content p {
  font-size: 1.25rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 69, 26, 0.4);
}

/* Sections */
.section {
  padding: 5rem 2rem;
  max-width: var(--max-width);
  margin: 0 auto;
}

.section-dark {
  background: var(--color-dark);
  color: var(--color-text-light);
  max-width: 100%;
  padding: 5rem 2rem;
}

.section-dark > * {
  max-width: var(--max-width);
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.menu-card {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}

.menu-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.menu-card h3 {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.menu-card p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-primary);
}

/* Specials */
.specials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.special-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius);
  padding: 2rem;
}

.badge {
  display: inline-block;
  background: var(--color-accent);
  color: var(--color-dark);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.special-card h3 {
  font-family: var(--font-heading);
  margin-bottom: 0.5rem;
}

/* Testimonials */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.testimonial {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
}

.testimonial p {
  font-style: italic;
  font-size: 1.05rem;
  margin-bottom: 1rem;
  color: #555;
}

.author {
  font-weight: 600;
  color: var(--color-primary);
}

/* Contact */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  text-align: center;
}

.contact-item h3 {
  font-family: var(--font-heading);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.contact-item p {
  line-height: 1.8;
  color: #ccc;
}

/* Footer */
.footer {
  background: var(--color-darker);
  color: #888;
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .hero-content {
    padding: 2rem 1rem;
  }
  .section {
    padding: 3rem 1rem;
  }
}`;
  }

  private generateJS(): string {
    return `// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.menu-card, .special-card, .testimonial, .contact-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(17, 17, 17, 0.95)';
    navbar.style.backdropFilter = 'blur(10px)';
  } else {
    navbar.style.background = 'transparent';
    navbar.style.backdropFilter = 'none';
  }
});

console.log('🔥 Ember & Oak - Premium Burger House');
console.log('Welcome! Explore our menu and special offers.');`;
  }
}
