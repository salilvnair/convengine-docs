// src/theme/Root.js
import React, { useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

// Important: Import Mantine styles
import '@mantine/core/styles.css';

const theme = createTheme({
  /** Your custom theme overrides **/
  primaryColor: 'blue',
});

export default function Root({ children }) {
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

  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
