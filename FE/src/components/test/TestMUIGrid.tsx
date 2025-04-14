import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

// Trong MUI v5, cần sử dụng Grid2 từ @mui/material/Unstable_Grid2
// Không cần container hay item nữa

export const TestGrid1: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={6}>
        <div>Grid item 1</div>
      </Grid>
      <Grid xs={12} md={6}>
        <div>Grid item 2</div>
      </Grid>
    </Grid>
  );
};

export const TestGrid2: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={6}>
        <div>Grid item 1</div>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <div>Nested grid item 1.1</div>
          </Grid>
          <Grid xs={6}>
            <div>Nested grid item 1.2</div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}; 