
import createStyles, { getAllSheets } from '../src';

test('Super simple media query', () => {
  const styles = createStyles({
    queryThis: {
      '@media (max-width: 960px)': {
        width: '100%',
      },
      width: '400px',
    },
  }, false);
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered.indexOf(`.${styles.queryThis}{width:400px;}`)).toBeGreaterThan(-1);
  expect(rendered.indexOf(`@media (max-width: 960px){.${styles.queryThis}{width:100%;}}`)).toBeGreaterThan(-1);
});
