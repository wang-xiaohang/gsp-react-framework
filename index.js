'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _viewModel = require('./src/viewModel/viewModel');

Object.defineProperty(exports, 'ViewModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_viewModel).default;
  }
});

var _component = require('./src/viewModel/component');

Object.defineProperty(exports, 'Component', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_component).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }