import React, {useEffect, useMemo, useState} from 'react';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme-original/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme-original/DocRoot/Layout/Main';
import styles from './styles.module.css';

function shouldAutoHideSidebar(pathname) {
  return typeof pathname === 'string' && pathname.startsWith('/docs/deep-dive/');
}

export default function DocRootLayout({children}) {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  const deepDiveRoute = useMemo(() => shouldAutoHideSidebar(pathname), [pathname]);
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(deepDiveRoute);

  useEffect(() => {
    setHiddenSidebarContainer(deepDiveRoute);
  }, [deepDiveRoute]);

  return (
    <div className={styles.docsWrapper}>
      <BackToTopButton />
      <div className={styles.docRoot}>
        {sidebar && (
          <DocRootLayoutSidebar
            sidebar={sidebar.items}
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
