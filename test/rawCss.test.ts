
import { getAllSheets, rawStyles } from '../src';

test('Check raw unprocessed CSS gets rendered correctly', () => {
  const fontFamily = 'Arial, Helvetica, sans-serif';
  const fontSize = '16px';
  rawStyles({
    body: {
      fontFamily,
      fontSize,
    },
    'body > p': {
      marginTop: '3em',
    },
  });
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered.indexOf('body{font-family:Arial, Helvetica, sans-serif;font-size:16px;}')).toBeGreaterThan(-1);
  expect(rendered.indexOf('body > p{margin-top:3em;}')).toBeGreaterThan(-1);
});
