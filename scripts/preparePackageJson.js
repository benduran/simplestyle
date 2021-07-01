#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pjsonPath = path.join(__dirname, '../package.json');
const pjson = JSON.parse(fs.readFileSync(pjsonPath, 'utf8'));

pjson.main = './commonjs/index.js';
pjson.module = './esm/index.js';
pjson.esnext = './esm/index.js';
pjson.typings = './esm/index.d.ts';
pjson.types = './esm/index.d.ts';

fs.writeFileSync(path.join(__dirname, '../dist', 'package.json'), JSON.stringify(pjson, null, 2), 'utf8');
