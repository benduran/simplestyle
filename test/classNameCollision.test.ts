
import createStyles, { getAllSheets } from '../src';

test('Test that using the same classkey does not result in generating the same class names', () => {
  const s1 = createStyles({
    root: {
      backgroundColor: 'purple',
    },
  });
  const s2 = createStyles({
    root: {
      height: '100px',
    },
  });
  const s3 = createStyles({
    root: {
      color: 'yellow',
    },
  });
  const [sheet1, sheet2, sheet3] = getAllSheets();
  const r1 = sheet1.getStyles();
  const r2 = sheet2.getStyles();
  const r3 = sheet3.getStyles();

  expect(r1).toContain(`.${s1.root}{background-color:purple;}`);
  expect(r1).not.toContain(s2.root);
  expect(r1).not.toContain(s3.root);
  expect(r2).toContain(`.${s2.root}{height:100px;}`);
  expect(r2).not.toContain(s1.root);
  expect(r1).not.toContain(s3.root);
  expect(r3).toContain(`.${s3.root}{color:yellow;}`);
  expect(r3).not.toContain(s1.root);
  expect(r3).not.toContain(s2.root);
});
