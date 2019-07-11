
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Check children selectors had generated class names replaced correctly', () => {
  const styles = createStyles({
    referenceMe: {
      left: '100px',
    },
    root: {
      $nested: {
        '& > $referenceMe': {
          border: '1px solid black',
        },
      },
      opacity: 0.5,
    },
  });
  const [sheet] = getAll();
  const rendered = sheet.getStyles();
  expect(styles.referenceMe).toBeDefined();
  expect(styles.root).toBeDefined();
  expect(rendered).not.toContain('$referenceMe');
  expect(rendered.indexOf(`.${styles.root} > .${styles.referenceMe} {border:1px solid black;}`)).toBeGreaterThan(-1);
});
