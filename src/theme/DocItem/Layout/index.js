import React, { useCallback, useEffect, useRef, useState } from 'react';
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

function isNumberedHeading(value = '') {
  const plain = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return /^\d+(?:\.\d+)*\s*[\)\.\-:]?\s+/.test(plain);
}

function stripHeadingNumberPrefix(value = '') {
  return value.replace(
    /^(\s*<[^>]+>\s*)*\s*\d+(?:\.\d+)*\s*[\)\.\-:]?\s+/,
    '$1'
  );
}

function buildHierarchicalMarkers(headings = []) {
  if (!headings.length) return [];
  const minLevel = Math.min(...headings.map((h) => Number(h.level) || 2));
  const counters = {};
  return headings.map((h) => {
    const level = Math.max(minLevel, Number(h.level) || minLevel);
    counters[level] = (counters[level] || 0) + 1;
    Object.keys(counters)
      .map(Number)
      .filter((l) => l > level)
      .forEach((l) => {
        delete counters[l];
      });
    const marker = [];
    for (let l = minLevel; l <= level; l += 1) {
      if (counters[l] != null) marker.push(counters[l]);
    }
    return marker.join('.');
  });
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
  const docPath = metadata?.permalink || '';
  const docsVersion = docPath.startsWith('/docs/v1') ? 'v1' : 'v2';
  const [openSections, setOpenSections] = useState(false);
  const flashTimerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);
  const drawerRef = useRef(null);
  const [activeHash, setActiveHash] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.location.hash ? window.location.hash.slice(1) : '';
  });
  const hasToc = docTOC.headings.length > 0;
  const markers = buildHierarchicalMarkers(docTOC.headings);

  const clearAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const scheduleAutoClose = useCallback(() => {
    if (typeof window === 'undefined' || !openSections || autoCloseTimerRef.current) {
      return;
    }
    autoCloseTimerRef.current = window.setTimeout(() => {
      setOpenSections(false);
      autoCloseTimerRef.current = null;
    }, 5000);
  }, [openSections]);

  const flashHeading = (headingId) => {
    if (typeof window === 'undefined' || !headingId) {
      return;
    }
    const target = document.getElementById(headingId);
    if (!target) {
      return;
    }

    target.classList.remove('ce-jump-target-flash');
    void target.offsetWidth;
    target.classList.add('ce-jump-target-flash');

    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      target.classList.remove('ce-jump-target-flash');
      flashTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    if (!openSections) {
      clearAutoCloseTimer();
      return undefined;
    }

    scheduleAutoClose();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenSections(false);
      }
    };

    const onMouseMove = (event) => {
      const drawer = drawerRef.current;
      if (!drawer) {
        return;
      }
      if (drawer.contains(event.target)) {
        clearAutoCloseTimer();
      } else {
        scheduleAutoClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      clearAutoCloseTimer();
    };
  }, [clearAutoCloseTimer, openSections, scheduleAutoClose]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const syncHash = () => {
      setActiveHash(window.location.hash ? window.location.hash.slice(1) : '');
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => () => {
    if (flashTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(flashTimerRef.current);
    }
    clearAutoCloseTimer();
  }, [clearAutoCloseTimer]);

  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && 'ce-main-column')}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <div className="ce-breadcrumb-row">
              <DocBreadcrumbs />
              <span className={clsx('ce-doc-version-chip', `ce-doc-version-chip-${docsVersion}`)}>
                {docsVersion}
              </span>
            </div>
            <DocVersionBadge />
            {docTOC.mobile}

            {hasToc && (
              <div
                className="ce-sections-wrap"
                onMouseEnter={clearAutoCloseTimer}
                onMouseLeave={scheduleAutoClose}
              >
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
                <aside
                  ref={drawerRef}
                  className={clsx('ce-sections-drawer', openSections && 'ce-sections-drawer-open')}
                  onMouseEnter={clearAutoCloseTimer}
                  onMouseLeave={scheduleAutoClose}
                >
                  <div className="ce-sections-drawer-head">
                    <strong>Jump To Section</strong>
                    <button type="button" onClick={() => setOpenSections(false)} aria-label="Close sections menu">✕</button>
                  </div>
                  <div className="ce-sections-drawer-body">
                    {docTOC.headings.map((h, idx) => (
                      (() => {
                        const numbered = isNumberedHeading(h.value);
                        const displayValue = numbered ? stripHeadingNumberPrefix(h.value) : h.value;
                        const marker = markers[idx] || String(idx + 1);
                        const isNestedMarker = marker.includes('.');
                        return (
                      <a
                        key={`${h.id}-${idx}`}
                        href={`#${h.id}`}
                        className={clsx('ce-sections-link', activeHash === h.id && 'ce-sections-link-active')}
                        onClick={() => {
                          setActiveHash(h.id);
                          flashHeading(h.id);
                        }}
                        style={{ paddingLeft: `${10 + Math.max(0, h.level - 2) * 14}px` }}
                      >
                        <span className={clsx('ce-sections-link-index', isNestedMarker && 'ce-sections-link-index-nested')}>
                          {marker}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: displayValue }} />
                      </a>
                        );
                      })()
                    ))}
                  </div>
                </aside>
              </div>
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
