// src/theme/Root.js
import React, { useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useLocation } from '@docusaurus/router';

// Important: Import Mantine styles
import '@mantine/core/styles.css';
import DocsCommandPalette from '@site/src/components/search/DocsCommandPalette';
import GlobalTermLookup from '@site/src/components/search/GlobalTermLookup';
import docsIndexV1 from '@site/src/data/docs-index-v1.json';
import docsIndexV2 from '@site/src/data/docs-index-v2.json';

const theme = createTheme({
  /** Your custom theme overrides **/
  primaryColor: 'blue',
});

const DOC_PERMALINKS = {
  v1: new Set((docsIndexV1 || []).map((d) => d?.permalink).filter(Boolean)),
  v2: new Set((docsIndexV2 || []).map((d) => d?.permalink).filter(Boolean)),
};

function normalizePath(path = '') {
  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

function hasDocPath(version, path) {
  const normalized = normalizePath(path);
  return DOC_PERMALINKS[version]?.has(normalized) || false;
}

function mapCurrentPageToVersion(pathname, targetVersion) {
  const normalized = normalizePath(pathname || '');
  if (!normalized.startsWith('/docs/')) {
    return `/docs/${targetVersion}/overview`;
  }

  const fromV1 = normalized.startsWith('/docs/v1');
  const fromV2 = normalized.startsWith('/docs/v2');
  if (!fromV1 && !fromV2) {
    return `/docs/${targetVersion}/overview`;
  }

  const sourcePrefix = fromV1 ? '/docs/v1' : '/docs/v2';
  const targetPrefix = `/docs/${targetVersion}`;
  const suffix = normalized.slice(sourcePrefix.length) || '';
  const candidate = `${targetPrefix}${suffix}`;
  if (hasDocPath(targetVersion, candidate)) {
    return candidate;
  }
  return `${targetPrefix}/overview`;
}

export default function Root({ children }) {
  const location = useLocation();

  function isVersionSwitcherLink(anchor) {
    if (!(anchor instanceof Element)) return false;
    return (
      anchor.classList.contains('ce-version-item-v1') ||
      anchor.classList.contains('ce-version-item-v2')
    );
  }

  function toVersionedDocsPath(href, version) {
    if (!href || typeof href !== 'string' || !href.startsWith('/docs')) {
      return href;
    }
    const queryIdx = href.indexOf('?');
    const hashIdx = href.indexOf('#');
    const cutIdx = [queryIdx, hashIdx].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? href.length;
    const base = href.slice(0, cutIdx);
    const suffix = href.slice(cutIdx);

    let normalized = base;
    if (normalized.startsWith('/docs/v1/')) {
      normalized = '/docs/v2/' + normalized.slice('/docs/v1/'.length);
    } else if (normalized === '/docs/v1') {
      normalized = '/docs/v2';
    } else if (normalized === '/docs') {
      normalized = '/docs/v2';
    }

    if (version === 'v1') {
      if (normalized === '/docs/v2') {
        return '/docs/v1' + suffix;
      }
      return '/docs/v1' + normalized.slice('/docs/v2'.length) + suffix;
    }
    return normalized + suffix;
  }

  function syncVersionDropdownUi(activeVersion) {
    const dropdownTrigger = document.querySelector('.ce-version-dropdown');
    if (dropdownTrigger) {
      if (activeVersion === 'v1' || activeVersion === 'v2') {
        dropdownTrigger.innerHTML = `<span class="ce-doc-version-chip ce-doc-version-chip-${activeVersion}">${activeVersion}<svg class="ce-doc-version-chip-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>`;
        dropdownTrigger.classList.add('ce-version-has-chip');
      } else {
        dropdownTrigger.textContent = 'Version';
        dropdownTrigger.classList.remove('ce-version-has-chip');
      }
    }

    const versionItems = document.querySelectorAll('.navbar a.ce-version-item-v1, .navbar a.ce-version-item-v2');
    versionItems.forEach((item) => {
      const isV1 = item.classList.contains('ce-version-item-v1');
      const selected = activeVersion === (isV1 ? 'v1' : 'v2');
      item.classList.toggle('ce-version-item-selected', selected);
      item.setAttribute('aria-current', selected ? 'page' : 'false');
    });
  }

  useEffect(() => {
    function readShowToc() {
      try {
        return window.localStorage.getItem('ce.docs.showToc') === 'true';
      } catch (e) {
        return false;
      }
    }

    function writeShowToc(next) {
      try {
        window.localStorage.setItem('ce.docs.showToc', next ? 'true' : 'false');
      } catch (e) {
        // ignore
      }
      document.documentElement.classList.toggle('ce-show-toc', next);
    }

    function updateButtonState(btn) {
      const show = readShowToc();
      btn.setAttribute('title', show ? 'Hide TOC' : 'Show TOC');
      btn.setAttribute('aria-label', show ? 'Hide table of contents' : 'Show table of contents');
      btn.classList.toggle('ce-navbar-toc-btn-active', show);
    }

    function bindButtons() {
      const buttons = document.querySelectorAll('.ce-navbar-toc-btn');
      if (!buttons.length) return;
      buttons.forEach((btn) => {
        if (!btn.dataset.bound) {
          btn.addEventListener('click', () => {
            const next = !readShowToc();
            writeShowToc(next);
            document.querySelectorAll('.ce-navbar-toc-btn').forEach(updateButtonState);
          });
          btn.dataset.bound = '1';
        }
      });
      const initialShow = readShowToc();
      document.documentElement.classList.toggle('ce-show-toc', initialShow);
      buttons.forEach(updateButtonState);
    }

    bindButtons();
    const observer = new MutationObserver(() => bindButtons());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pathname = location?.pathname || '';
    const search = location?.search || '';
    const params = new URLSearchParams(search);
    const queryVersion = (params.get('version') || '').toLowerCase();

    let activeVersion = 'v2';
    if (pathname.startsWith('/docs/v1')) {
      activeVersion = 'v1';
    } else if (pathname.startsWith('/docs/v2') || pathname === '/docs') {
      activeVersion = 'v2';
    } else if (queryVersion === 'v1' || queryVersion === 'v2') {
      activeVersion = queryVersion;
    } else {
      try {
        const stored = (window.localStorage.getItem('ce.docs.version') || '').toLowerCase();
        if (stored === 'v1' || stored === 'v2') {
          activeVersion = stored;
        }
      } catch (e) {
        // ignore
      }
    }

    try {
      window.localStorage.setItem('ce.docs.version', activeVersion);
    } catch (e) {
      // ignore
    }

    document.documentElement.setAttribute('data-docs-version', activeVersion);
    syncVersionDropdownUi(activeVersion);

    const navDocLinks = document.querySelectorAll('.navbar a[href]');
    navDocLinks.forEach((link) => {
      if (isVersionSwitcherLink(link)) {
        return;
      }
      const href = link.getAttribute('href');
      if (!href) return;
      let path = href;
      try {
        path = new URL(href, window.location.origin).pathname;
      } catch (e) {
        // keep raw href
      }
      if (!path.startsWith('/docs')) return;
      const nextHref = toVersionedDocsPath(path, activeVersion);
      if (nextHref && nextHref !== href) {
        link.setAttribute('href', nextHref);
      }
    });

    const handleNavClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = event.target instanceof Element
        ? event.target.closest('.navbar a[href]')
        : null;
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (!href) {
        return;
      }
      if (isVersionSwitcherLink(anchor)) {
        const switchTo = anchor.classList.contains('ce-version-item-v1') ? 'v1' : 'v2';
        event.preventDefault();
        event.stopPropagation();
        try {
          window.localStorage.setItem('ce.docs.version', switchTo);
        } catch (e) {
          // ignore
        }
        const mappedPath = mapCurrentPageToVersion(window.location.pathname, switchTo);
        if (mappedPath && mappedPath !== window.location.pathname) {
          window.location.assign(mappedPath);
        }
        return;
      }
      let path = href;
      try {
        path = new URL(href, window.location.origin).pathname;
      } catch (e) {
        // keep raw href
      }
      if (!path.startsWith('/docs')) {
        return;
      }
      const nextHref = toVersionedDocsPath(path, activeVersion);
      if (!nextHref || nextHref === href) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(nextHref);
    };

    document.addEventListener('click', handleNavClick, true);
    return () => {
      document.removeEventListener('click', handleNavClick, true);
    };
  }, [location?.pathname, location?.search]);

  return (
    <MantineProvider theme={theme}>
      {children}
      <DocsCommandPalette />
      <GlobalTermLookup />
    </MantineProvider>
  );
}
