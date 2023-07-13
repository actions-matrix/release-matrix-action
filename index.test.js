const process = require('process');
const cp = require('child_process');
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test query=nginx', () => {
  process.env['INPUT_SEARCH'] = 'nginx';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

test('test query=nginx, limit=10', () => {
  process.env['INPUT_SEARCH'] = 'nginx';
  process.env['INPUT_LIMIT'] = '10';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

test('test query=nginx, date=2022', () => {
  process.env['INPUT_SEARCH'] = 'nginx';
  process.env['INPUT_DATE'] = "2022";
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

test('test query=nginx, version=1.22', () => {
  process.env['INPUT_SEARCH'] = 'nginx';
  process.env['INPUT_VERSION'] = "1.22";
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

test('test query=nginx, date=2022, version=1.22', () => {
  process.env['INPUT_SEARCH'] = 'nginx';
  process.env['INPUT_DATE'] = "2022";
  process.env['INPUT_VERSION'] = "1.22";
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})
