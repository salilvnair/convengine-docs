import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {useLocation} from '@docusaurus/router';
import styles from './index.module.css';

const sections = [
  {
    title: 'Overview',
    description: 'What ConvEngine is, what it is not, and the deterministic runtime model.',
    to: '/docs/v2/overview',
  },
  {
    title: 'Architecture',
    description: 'Layer-by-layer flow from API to pipeline, rules, response, and persistence.',
    to: '/docs/v2/architecture',
  },
  {
    title: 'Examples',
    description: 'Real request/response and turn-level scenarios for schema, collision, and reset.',
    to: '/docs/v2/examples',
  },
  {
    title: 'Consumer',
    description: 'Configuration, extension points, hooks, transformers, and integration checklist.',
    to: '/docs/v2/consumer',
  },
  {
    title: 'API',
    description: 'REST contracts, Java interfaces, and audit trace response model.',
    to: '/docs/v2/api/rest-api',
  },
  {
    title: 'Deep Dive',
    description: 'File-level wiki mapped to actual source classes and current execution behavior.',
    to: '/docs/v2/deep-dive',
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { pathname, search } = useLocation();
  const logoDarkUrl = useBaseUrl('/img/logo.png');
  const logoLightUrl = useBaseUrl('/img/logo_light.png');

  const params = new URLSearchParams(search || '');
  const selected = (params.get('version') || '').toLowerCase();
  const storedVersion =
    typeof window !== 'undefined' ? (window.localStorage.getItem('ce.docs.version') || '').toLowerCase() : '';
  const isV1 =
    selected === 'v1' ||
    (selected !== 'v2' &&
      (typeof pathname === 'string' && pathname.startsWith('/docs/v1') || storedVersion === 'v1'));
  const currentVersionLabel = isV1 ? 'v1' : 'v2';
  const switchTo = isV1 ? '/?version=v2' : '/?version=v1';
  const docsBase = isV1 ? '/docs/v1' : '/docs/v2';
  const versionedSections = sections.map((item) => ({
    ...item,
    to: isV1 ? item.to.replace('/docs/v2', '/docs/v1') : item.to,
  }));

  return (
    <header
      className={clsx('hero', styles.heroBanner)}
      style={{
        '--ce-hero-logo-light': `url("${logoLightUrl}")`,
        '--ce-hero-logo-dark': `url("${logoDarkUrl}")`,
      }}
    >
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroContent}>
          <div className={styles.titleRow}>
            <Heading as="h1" className={styles.heroTitle}>
              {siteConfig.title}
            </Heading>
            <div className={styles.versionChips}>
              <Link className={isV1 ? styles.versionChipV1 : styles.versionChipV2} to={switchTo}>
                {currentVersionLabel}
              </Link>
            </div>
          </div>
          <p className={styles.heroSubtitle}>
            Deterministic conversation runtime for enterprise workflows.
            Database-first behavior, auditable execution, and controlled LLM integration.
          </p>
          <div className={styles.heroActions}>
            <Link className="button button--primary button--lg" to={`${docsBase}/overview`}>
              Start Reading
            </Link>
            <Link className="button button--secondary button--lg" to={`${docsBase}/deep-dive`}>
              Open Deep Dive
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionGrid({ sections }) {
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

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search || '');
  const selected = (params.get('version') || '').toLowerCase();
  const storedVersion =
    typeof window !== 'undefined' ? (window.localStorage.getItem('ce.docs.version') || '').toLowerCase() : '';
  const isV1 =
    selected === 'v1' ||
    (selected !== 'v2' &&
      (typeof pathname === 'string' && pathname.startsWith('/docs/v1') || storedVersion === 'v1'));
  const docsBase = isV1 ? '/docs/v1' : '/docs/v2';
  const versionedSections = sections.map((item) => ({
    ...item,
    to: isV1 ? item.to.replace('/docs/v2', '/docs/v1') : item.to,
  }));

  return (
    <Layout
      title={`ConvEngine — ${siteConfig.tagline}`}
      description="ConvEngine documentation for architecture, consumer integration, API contracts, and source-level deep dives."
    >
      <HomepageHeader />
      <main>
        <SectionGrid sections={versionedSections} />
      </main>
    </Layout>
  );
}
