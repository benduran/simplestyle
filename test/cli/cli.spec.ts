import { execSync, spawn } from 'child_process';
import path from 'path';

describe('Simplestyle-js CLI tests', () => {
  let childProcess: ReturnType<typeof spawn>;
  let stdoutDataHandler: (d: any) => void;
  let exitHandler: (code: number) => void;
  beforeEach(() => {
    if (childProcess) {
      childProcess.stdout?.off('data', stdoutDataHandler);
      childProcess.off('exit', exitHandler);
      childProcess.kill();
    }
  });
  it('Should demand the glob option if not present', () => {
    try {
      execSync('yarn start:cli', { stdio: 'pipe' });
    } catch (error) {
      const e = error as Error & { status: number };
      expect(e.status).toBe(1);
    }
  });
  it('Should accept a glob and prompt to continue (and accept No as an answer)', () =>
    new Promise<void>((resolve, reject) => {
      let didWrite = false;
      childProcess = spawn('yarn', ['start:cli', '-g', path.join(__dirname, './testStyles/*.ts')]);
      stdoutDataHandler = (d: any) => {
        const processMessage = d.toString();
        if (!didWrite && processMessage.includes('Found the following')) {
          didWrite = true;
          childProcess.stdin?.write('Y\n');
          childProcess.stdin?.end();
        } else if (processMessage.includes('Done in')) resolve();
      };
      exitHandler = code => {
        try {
          expect(code).toBe(0);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      childProcess.on('exit', exitHandler);
      childProcess.stdout?.on('data', stdoutDataHandler);
    }));
});
