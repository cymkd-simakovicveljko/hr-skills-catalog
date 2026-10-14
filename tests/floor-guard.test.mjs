import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const source = readFileSync(new URL('../engineering/define/constraint-driven-development/references/floor-guard.md', import.meta.url), 'utf8');
const script = source.match(/```js\n([\s\S]*?)\n```/)[1];
const directory = mkdtempSync(join(tmpdir(), 'floor-guard-check-'));
const repo = join(directory, 'repo');
const guard = join(directory, 'floor-guard.mjs');
const policy = '| Security: code | No high findings | scanner | CI |\n'
  + '| Coverage | >= 80% | coverage-tool --check | CI |\n';
const canary = 'SYNTHETIC_SECRET_REGRESSION_CANARY';

try {
  mkdirSync(repo);
  writeFileSync(guard, script);
  writeFileSync(join(repo, 'CONSTRAINTS.md'), policy);
  for (const args of [
    ['init', '--quiet'],
    ['add', 'CONSTRAINTS.md'],
    ['-c', 'user.name=Guard Check', '-c', 'user.email=check@example.invalid',
      '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false',
      'commit', '--quiet', '-m', 'Isolated policy baseline'],
  ]) {
    const result = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
  }

  const scenarios = [
    { name: 'suppressed credential stays out of diagnostics', policy, secret: true, status: 1 },
    { name: 'severity weakening requires review', policy: policy.replace('No high', 'No critical'), status: 1 },
    { name: 'checker removal beside an unchanged number requires review', policy: policy.replace('coverage-tool --check', 'echo passed'), status: 1 },
    { name: 'numeric loosening is blocked', policy: policy.replace('80%', '75%'), status: 1 },
    { name: 'numeric tightening remains allowed', policy: policy.replace('80%', '85%'), status: 0 },
  ];
  for (const scenario of scenarios) {
    writeFileSync(join(repo, 'CONSTRAINTS.md'), scenario.policy);
    const secretFile = join(repo, 'config.js');
    if (scenario.secret) writeFileSync(secretFile, `const apiKey = "${canary}"; // gitleaks:allow\n`);
    const result = spawnSync(process.execPath, [guard, '--base', 'HEAD'], { cwd: repo, encoding: 'utf8' });
    const output = (result.stdout ?? '') + (result.stderr ?? '');
    assert.ok(!output.includes(canary), `${scenario.name}: credential leaked`);
    assert.equal(result.status, scenario.status, scenario.name);
    if (scenario.status === 1) {
      assert.ok(output.includes(scenario.secret ? 'config.js' : 'CONSTRAINTS.md'), `${scenario.name}: missing file location`);
    }
    rmSync(secretFile, { force: true });
  }
  console.log(`floor-guard: ${scenarios.length} regression scenarios passed`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
