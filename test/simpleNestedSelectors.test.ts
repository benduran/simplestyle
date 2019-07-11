
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Simple nested selectors test (no recursive references)', () => {
  const styles = createStyles({
    root: {
      $nested: {
        '& > span': {
          backgroundColor: 'blue',
        },
      },
      backgroundColor: 'pink',
    },
  });
  const [sheet] = getAll();
  const rendered = sheet.getStyles();
  expect(styles).toBeDefined();
  expect(rendered.indexOf(styles.root)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`.${styles.root} > span`)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`.${styles.root} > span {background-color:blue;}`)).toBeGreaterThan(-1);
});
