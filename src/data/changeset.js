"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChangeSet = exports.ChangeSet = function () {
    function ChangeSet() {
        _classCallCheck(this, ChangeSet);

        this.modified = {};

        this.added = {};

        this.removed = {};
    }

    _createClass(ChangeSet, [{
        key: "recordModified",
        value: function recordModified(identity, field, value) {
            if (this.added[identity]) {
                var addedData = this.added[identity];
                addedData[field] = value;
                return;
            }

            this.modified[identity] = this.modified[identity] || {};
            this.modified[identity][field] = value;
        }
    }, {
        key: "recordAdded",
        value: function recordAdded(identity, data) {
            this.added[identity] = data.innerMap.toJS();
        }
    }, {
        key: "recordRemoved",
        value: function recordRemoved(identity, data) {
            this.removed[identity] = data.innerMap.toJS();
            if (this.added[identity]) {
                delete this.added[identity];
            }
            if (this.modified[identity]) {
                delete this.modified[identity];
            }
        }
    }]);

    return ChangeSet;
}();