
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Test two overlapping styles from separate parent selectors', () => {
  const styles = createStyles({
    root1: {
      $nested: {
        '& > img': {
          height: 'auto',
          width: '100%',
        },
      },
    },
    root2: {
      $nested: {
        '& > img': {
          background: 'red',
        },
      },
    },
  });
  const [sheet] = getAll();
  const rendered = sheet.getStyles();
  expect(styles.root1).toBeDefined();
  expect(styles.root2).toBeDefined();
  expect(rendered.length).toBeGreaterThan(0);
  expect(rendered.indexOf(`${styles.root1} > img {height:auto;width:100%;}`)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`${styles.root2} > img {background:red;}`)).toBeGreaterThan(-1);
});
