// src/theme/Root.js
import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

// Important: Import Mantine styles
import '@mantine/core/styles.css';

const theme = createTheme({
  /** Your custom theme overrides **/
  primaryColor: 'blue',
});

export default function Root({ children }) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}