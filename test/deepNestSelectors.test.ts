
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Test deeply nested psuedo selectors (fun stuff!)', () => {
  const styles = createStyles({
    deep: {
      $nested: {
        '& > span.nest1': {
          $nested: {
            '&:hover > svg.nest2': {
              $nested: {
                '&:before': {
                  content: '"deep"',
                },
              },
            },
          },
        },
      },
    },
  });
  const [sheet] = getAll();
  const rendered = sheet.getStyles();
  expect(rendered.length).toBeGreaterThan(0);
  expect(rendered.indexOf(styles.deep)).toBeGreaterThan(-1);
});
