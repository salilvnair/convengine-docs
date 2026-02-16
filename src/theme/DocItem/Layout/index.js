import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useWindowSize } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import ContentVisibility from '@theme/ContentVisibility';
import styles from './styles.module.css';

function flattenToc(items = []) {
  const result = [];
  for (const item of items) {
    if (item?.id && item?.value) {
      result.push({ id: item.id, value: item.value, level: item.level || 2 });
    }
    if (Array.isArray(item?.children) && item.children.length > 0) {
      result.push(...flattenToc(item.children));
    }
  }
  return result;
}

function useDocTOC() {
  const { toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = false;
  const canRender = toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;
  const desktop = canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? <DocItemTOCDesktop /> : undefined;

  return {
    hidden,
    mobile,
    desktop,
    headings: flattenToc(toc),
  };
}

export default function DocItemLayout({ children }) {
  const docTOC = useDocTOC();
  const { metadata } = useDoc();
  const [openSections, setOpenSections] = useState(false);
  const hasToc = docTOC.headings.length > 0;

  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && 'ce-main-column')}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}

            {hasToc && (
              <>
                <button
                  type="button"
                  className="ce-sections-fab"
                  onClick={() => setOpenSections((v) => !v)}
                  aria-label="Toggle section menu"
                  title="Sections"
                >
                  <span className="ce-sections-fab-icon">☰</span>
                  <span>Sections</span>
                </button>
                <aside className={clsx('ce-sections-drawer', openSections && 'ce-sections-drawer-open')}>
                  <div className="ce-sections-drawer-head">
                    <strong>Jump To Section</strong>
                    <button type="button" onClick={() => setOpenSections(false)} aria-label="Close sections menu">✕</button>
                  </div>
                  <div className="ce-sections-drawer-body">
                    {docTOC.headings.map((h, idx) => (
                      <a
                        key={`${h.id}-${idx}`}
                        href={`#${h.id}`}
                        className="ce-sections-link"
                        onClick={() => setOpenSections(false)}
                        style={{ paddingLeft: `${10 + Math.max(0, h.level - 2) * 14}px` }}
                      >
                        <span className="ce-sections-link-index">{idx + 1}</span>
                        <span>{h.value}</span>
                      </a>
                    ))}
                  </div>
                </aside>
              </>
            )}

            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && <div className="col col--3 ce-toc-container">{docTOC.desktop}</div>}
    </div>
  );
}
