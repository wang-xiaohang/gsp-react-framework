"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dataStorage = require("../data/dataStorage");

var _dataStorage2 = _interopRequireDefault(_dataStorage);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewModel = function () {
    function ViewModel() {
        var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, ViewModel);

        this.data = [];
        this.state = _immutable2.default.fromJS({});
        this.dataStorage = new _dataStorage2.default([], schema);
    }
    //state转为immutable类型


    _createClass(ViewModel, [{
        key: "setState",
        value: function setState(object) {
            var state = this.getState();
            Object.getOwnPropertyNames(object).forEach(function (name) {
                state[name] = object[name];
            });
            this.state = _immutable2.default.fromJS(state);
        }

        //获取Object类型的state数据,若指定key值则返回key值对应的数据

    }, {
        key: "getState",
        value: function getState(key) {
            var obj = this.state.toJS();
            if (!key || key === "") {
                return obj;
            } else {
                return obj[key];
            }
        }
        //根据初始数据和数据源对象构建storage

    }, {
        key: "initDataStorage",
        value: function initDataStorage(data) {
            this.dataStorage.load(data);
        }
        //绑定data和storage

    }, {
        key: "bindDataToStorage",
        value: function bindDataToStorage() {
            var self = this;
            this.dataStorage.onChanges.subscribe(function (changeLog) {
                self.data = self.dataStorage.toArray();
            });
        }
        //获取数据

    }, {
        key: "getData",
        value: function getData() {
            return this.dataStorage.toArray();
        }
        //重新构建数据集

    }, {
        key: "loadData",
        value: function loadData(data) {
            this.dataStorage.load(data);
        }
        //新增记录

    }, {
        key: "addRecord",
        value: function addRecord(initData) {
            this.dataStorage.addRecord(initData);
        }
        //删除单个记录

    }, {
        key: "removeRecord",
        value: function removeRecord(primaryValue) {
            this.dataStorage.removeRecord(primaryValue);
        }
        //提交changes

    }, {
        key: "getChanges",
        value: function getChanges() {
            return this.dataStorage.getChanges();
        }
        //根据子组件上的ref标识来获取子组件增量

    }, {
        key: "getSubChanges",
        value: function getSubChanges(component) {
            var refObject = component.refs;
            var subChangeSets = {};
            Object.getOwnPropertyNames(refObject).forEach(function (refName) {
                subChangeSets[refName] = refObject[refName].viewModel.dataStorage.getChanges();
            });
            return subChangeSets;
        }
        //根据子组件上的ref标识来获取子组件data数据

    }, {
        key: "getSubData",
        value: function getSubData(component) {
            var refObject = component.refs;
            var subDatas = {};
            Object.getOwnPropertyNames(refObject).forEach(function (refName) {
                subDatas[refName] = refObject[refName].viewModel.dataStorage.toArray();
            });
            return subDatas;
        }
    }]);

    return ViewModel;
}();

exports.default = ViewModel;