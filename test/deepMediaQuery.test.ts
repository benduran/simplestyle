
import createStyles, { getAllSheets } from '../src';

test('Deeply nested media query with backreferences', () => {
  const styles = createStyles({
    button: {
      padding: '1em',
    },
    deepQuery: {
      '@media (max-width: 600px)': {
        '& > $button': {
          '&:hover': {
            backgroundColor: 'purple',
          },
          padding: '2em',
        },
        width: '100%',
      },
      width: '100px',
    },
  }, false);
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered).toContain(`.${styles.button}{padding:1em;}`);
  expect(rendered).toContain(`.${styles.deepQuery}{width:100px;}`);
  // tslint:disable max-line-length
  expect(rendered).toContain(
    `@media (max-width: 600px){.${styles.deepQuery}{width:100%;}.${styles.deepQuery} > .${styles.button}{padding:2em;}.${styles.deepQuery} > .${styles.button}:hover{background-color:purple;}}`,
  );
});
