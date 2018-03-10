"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Entity = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _rxjs = require("rxjs");

var _type = require("./type");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = exports.Entity = function () {
    function Entity(value, primary) {
        _classCallCheck(this, Entity);

        this.innerMap = (0, _immutable.Map)(value);
        this.innerPrimary = primary;
        this.fieldChange = new _rxjs.BehaviorSubject({ type: _type.ChangeType.none });
        this.buildProperties(value);
    }

    _createClass(Entity, [{
        key: "buildProperties",
        value: function buildProperties(value) {
            var _this = this;

            var _loop = function _loop(key) {
                Object.defineProperty(_this, key, {
                    get: function get() {
                        return this.get(key);
                    },
                    set: function set(newValue) {
                        this.set(key, newValue);
                    },
                    enumerable: true,
                    configurable: true
                });
            };

            for (var key in value) {
                _loop(key);
            }
        }
    }, {
        key: "get",
        value: function get(key) {
            return this.innerMap.get(key);
        }
    }, {
        key: "set",
        value: function set(key, value) {
            var preValue = this.innerMap.get(key);
            if (preValue === value) {
                return;
            }
            this.innerMap = this.innerMap.set(key, value);
            this.fieldChange.next({
                type: _type.ChangeType.modified,
                preValue: preValue,
                fieldName: key,
                latestValue: value,
                latestEntity: this
            });
        }
    }, {
        key: "primary",
        get: function get() {
            return this.innerPrimary;
        }
    }, {
        key: "identify",
        get: function get() {
            return this.innerMap.get(this.innerPrimary);
        }
    }]);

    return Entity;
}();