const D3Node = require('d3-node');
const d3 = require('d3');

const markup = '<div id="container"><h2>Bracket</h2><div id="chart"></div></div>';
const options = {
  selector: '#chart',
  container: markup
};

const d3n = new D3Node(options);

require('.output')('bracket', d3n);
