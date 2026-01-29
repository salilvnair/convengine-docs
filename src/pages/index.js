import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>

        <p className="hero__subtitle">
          AI-native Conversational Engine for Intelligent Systems
        </p>

        <p style={{ maxWidth: 760, margin: '0 auto 28px', opacity: 0.9 }}>
          ConvEngine is a modular AI orchestration platform for building
          conversational systems, semantic search, embeddings, MCP-based tools,
          and LLM-driven workflows — designed for enterprise-grade architectures.
        </p>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/architecture">
            Architecture 🧠
          </Link>

          <Link
            className="button button--outline button--lg"
            to="/docs/mcp"
            style={{ marginLeft: 12 }}
          >
            MCP Integration 🔌
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`ConvEngine — ${siteConfig.tagline}`}
      description="ConvEngine is an AI-native conversational engine for MCP, embeddings, semantic search, LLM orchestration, and enterprise-grade intelligent systems.">

      <HomepageHeader />

      <main>
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6">
              <Heading as="h2">Why ConvEngine?</Heading>
              <ul>
                <li>🧠 AI-native by design (not AI-bolted-on)</li>
                <li>🔌 First-class MCP support</li>
                <li>📦 Modular, pluggable architecture</li>
                <li>🏗️ Enterprise-ready orchestration & workflows</li>
                <li>🧩 Works with LLMs, embeddings, tools, and data</li>
              </ul>
            </div>

            <div className="col col--6">
              <Heading as="h2">Start Exploring</Heading>
              <p>
                ConvEngine is intentionally minimal at the surface and powerful
                under the hood. Start with the architecture to understand the
                mental model, then move into MCP to see how tools and models
                connect.
              </p>

              <p>
                This project is built for engineers who want control,
                observability, and composability — not black boxes.
              </p>
            </div>
          </div>
        </section>
      </main>

    </Layout>
  );
}
