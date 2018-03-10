"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require("rxjs");

var _type = require("./type");

var _immutable = require("immutable");

var _entity = require("./entity");

var _changeset = require("./changeset");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataStorage = function () {
    function DataStorage(values) {
        var _this = this;

        var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, DataStorage);

        this.schema = schema;
        this.primaryKey = schema.primaryKey;
        this.innerList = this.buildImmutableList(values);
        this.onChanges = new _rxjs.BehaviorSubject({ type: _type.ChangeType.none });
        this.changeSet = new _changeset.ChangeSet();
        this.index = 0;
        this.index$ = new _rxjs.BehaviorSubject(this.index);
        this.index$.subscribe(function (newIndex) {
            return _this.onIndexChanged(newIndex);
        });
    }

    _createClass(DataStorage, [{
        key: "buildImmutableList",
        value: function buildImmutableList() {
            var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var dataArray = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var value = _step.value;

                    var item = this.createEntityWithDefaultValue(value);
                    dataArray.push(this.buildEntity(item));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return (0, _immutable.List)(dataArray);
        }
    }, {
        key: "buildEntity",
        value: function buildEntity(data) {
            var _this2 = this;

            if (data instanceof _entity.Entity) {
                return data;
            }
            var entity = new _entity.Entity(data, this.primaryKey);
            entity.fieldChange.subscribe(function (changeLog) {
                _this2.processRecordChange(changeLog);
            });
            return entity;
        }
    }, {
        key: "load",
        value: function load(value) {
            this.innerList = this.buildImmutableList(value);
            if (value.length) {
                this.updateIndex(0);
            }
        }
    }, {
        key: "addRecord",
        value: function addRecord() {
            var _this3 = this;

            var initData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            initData = this.createEntityWithDefaultValue(initData);
            initData[this.primaryKey] = this.createGuid();
            var newEntity = new _entity.Entity(initData, this.primaryKey);

            newEntity.fieldChange.subscribe(function (changeLog) {
                _this3.processRecordChange(changeLog);
            });
            this.innerList = this.innerList.push(newEntity);
            newEntity.fieldChange.next({
                type: _type.ChangeType.added,
                latestEntity: newEntity
            });
        }
    }, {
        key: "removeRecord",
        value: function removeRecord(primaryValue) {
            var self = this;
            var index = this.innerList.findIndex(function (value, index) {
                return value[self.primaryKey] === primaryValue;
            });
            var changeLog = {
                type: _type.ChangeType.removed,
                latestEntity: this.innerList.get(index)
            };
            this.innerList = this.innerList.delete(index);
            this.processRecordChange(changeLog);
        }
    }, {
        key: "updateIndex",
        value: function updateIndex(newIndex) {
            this.index$.next(newIndex);
        }
    }, {
        key: "onIndexChanged",
        value: function onIndexChanged(newIndex) {
            this.index = newIndex;
            this.notifyChanges({
                latestEntity: this.innerList.get(newIndex),
                type: _type.ChangeType.currentChanged
            });
        }
    }, {
        key: "processRecordChange",
        value: function processRecordChange(changeLog) {
            var latestRecord = changeLog.latestEntity;
            if (!latestRecord) {
                return;
            }
            this.recordChangeLog(changeLog);
            this.notifyChanges(changeLog);
        }
    }, {
        key: "recordChangeLog",
        value: function recordChangeLog(changeLog) {
            var fieldName = changeLog.fieldName;
            var latestValue = changeLog.latestValue;
            var latestEntity = changeLog.latestEntity;

            switch (changeLog.type) {
                case _type.ChangeType.modified:
                    this.changeSet.recordModified(latestEntity.identify, fieldName, latestValue);
                    break;
                case _type.ChangeType.added:
                    this.changeSet.recordAdded(latestEntity.identify, latestEntity);
                    break;
                case _type.ChangeType.removed:
                    this.changeSet.recordRemoved(latestEntity.identify, latestEntity);
                    break;
                default:
                    throw new Error("未处理变更类型。");
            }
        }
    }, {
        key: "notifyChanges",
        value: function notifyChanges(changeLog) {
            this.onChanges.next({
                type: changeLog.type,
                latestEntity: changeLog.latestEntity,
                fieldName: changeLog.fieldName
            });
        }
    }, {
        key: "toArray",
        value: function toArray() {
            return this.innerList.toArray();
        }
    }, {
        key: "getChanges",
        value: function getChanges() {
            return this.changeSet;
        }
    }, {
        key: "createEntityWithDefaultValue",
        value: function createEntityWithDefaultValue(initData) {
            if (this.schema.columns) {
                this.schema.columns.forEach(function (column) {
                    var name = column.name;
                    initData[name] = initData[name] ? initData[name] : column.defaultValue;
                });
            }
            return initData;
        }
    }, {
        key: "createGuid",
        value: function createGuid() {
            var S4 = function S4() {
                return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
            };
            return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        }
    }]);

    return DataStorage;
}();

exports.default = DataStorage;