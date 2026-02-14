import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const sections = [
  {
    title: 'Overview',
    description: 'What ConvEngine is, what it is not, and the deterministic runtime model.',
    to: '/docs/overview',
  },
  {
    title: 'Architecture',
    description: 'Layer-by-layer flow from API to pipeline, rules, response, and persistence.',
    to: '/docs/architecture',
  },
  {
    title: 'Examples',
    description: 'Real request/response and turn-level scenarios for schema, collision, and reset.',
    to: '/docs/examples',
  },
  {
    title: 'Consumer',
    description: 'Configuration, extension points, hooks, transformers, and integration checklist.',
    to: '/docs/consumer',
  },
  {
    title: 'API',
    description: 'REST contracts, Java interfaces, and audit trace response model.',
    to: '/docs/api/rest-api',
  },
  {
    title: 'Deep Dive',
    description: 'File-level wiki mapped to actual source classes and current execution behavior.',
    to: '/docs/deep-dive',
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.eyebrow}>ConvEngine Documentation</div>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>
          Deterministic conversation runtime for enterprise workflows.
          Database-first behavior, auditable execution, and controlled LLM integration.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary button--lg" to="/docs/overview">
            Start Reading
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/deep-dive">
            Open Deep Dive
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionGrid() {
  return (
    <section className={styles.sectionWrap}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Documentation Map</Heading>
          <p>Structured for architecture, integration, and source-level debugging.</p>
        </div>
        <div className={styles.cardGrid}>
          {sections.map((item) => (
            <Link key={item.title} to={item.to} className={styles.cardLink}>
              <article className={styles.card}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>Read section</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  return (
    <section className={styles.valueWrap}>
      <div className="container">
        <div className={styles.valueGrid}>
          <div>
            <Heading as="h2">Why this docs rewrite</Heading>
            <p>
              This documentation is aligned to the latest runtime code: step hooks,
              reset semantics, intent lock behavior, and audit trace contracts.
            </p>
          </div>
          <ul className={styles.valueList}>
            <li>Current API DTOs and endpoint contracts</li>
            <li>Current pipeline sequence and annotation constraints</li>
            <li>Current rule/action/output type values</li>
            <li>Current extension points for consumers</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`ConvEngine — ${siteConfig.tagline}`}
      description="ConvEngine documentation for architecture, consumer integration, API contracts, and source-level deep dives."
    >
      <HomepageHeader />
      <main>
        <SectionGrid />
        <ValueSection />
      </main>
    </Layout>
  );
}
