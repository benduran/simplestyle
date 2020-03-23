
import createStyles from '../src/createStyles';
import { SimpleStyleRules } from '../src/types';

describe('createStyles tests', () => {
  it('Should generate some basic styles', () => {
    const styles: SimpleStyleRules = {
      one: {
        display: 'flex',
      },
      two: {
        '& > div': {
          color: 'pink',
        },
        backgroundColor: 'red',
      },
    };
    createStyles(styles);
  });
});
