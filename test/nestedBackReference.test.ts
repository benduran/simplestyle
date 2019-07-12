
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Check children selectors had generated class names replaced correctly', () => {
  const styles = createStyles({
    reference: {
      bottom: '1000px',
    },
    referenceMe: {
      left: '100px',
    },
    root: {
      $nested: {
        '&:hover > $referenceMe': {
          borderColor: 'blue',
        },
        '& > $reference': {
          border: '1px solid black',
        },
      },
      opacity: 0.5,
    },
    zebra: {
      transform: 'translateY(-50%)',
    },
  });
  const [sheet] = getAll();
  const rendered = sheet.getStyles();
  expect(styles.referenceMe).toBeDefined();
  expect(styles.root).toBeDefined();
  expect(rendered).not.toContain('$referenceMe');
  expect(rendered).not.toContain('$reference');
  expect(rendered.indexOf(`.${styles.root}:hover > .${styles.referenceMe}{border-color:blue;}`)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`.${styles.root} > .${styles.reference}{border:1px solid black;}`)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`.${styles.zebra}{transform:translateY(-50%);}`)).toBeGreaterThan(-1);
});
