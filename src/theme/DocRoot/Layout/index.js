import React, {useState} from 'react';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme-original/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme-original/DocRoot/Layout/Main';
import styles from './styles.module.css';

export default function DocRootLayout(props) {
  const { children, sidebar: sidebarProp } = props;
  const sidebarFromHook = useDocsSidebar();
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const sidebarItems = Array.isArray(sidebarProp)
    ? sidebarProp
    : Array.isArray(sidebarProp?.items)
      ? sidebarProp.items
      : (Array.isArray(sidebarFromHook?.items) ? sidebarFromHook.items : null);

  return (
    <div className={styles.docsWrapper}>
      <BackToTopButton />
      <div className={styles.docRoot}>
        {sidebarItems && (
          <DocRootLayoutSidebar
            sidebar={sidebarItems}
            hiddenSidebarContainer={hiddenSidebarContainer}
            setHiddenSidebarContainer={setHiddenSidebarContainer}
          />
        )}
        <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
          {children}
        </DocRootLayoutMain>
      </div>
    </div>
  );
}
