"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var React = require("react");
var DefineMap = require("can-define/map/map");
var assign = require("can-util/js/assign/assign");
var Observer = require("./observer");
var makeEnumerable = require("./helpers/make-enumerable");
var autobindMethods = require("./helpers/autobind-methods");
var dev = require("can-util/js/dev/dev");
var namespace = require("can-namespace");

if (React) {
	var Component = function Component(props, viewModel) {
		React.Component.call(this);

		this._observer = new Observer();

		if (typeof this.shouldComponentUpdate === "function") {
			this._shouldComponentUpdate = this.shouldComponentUpdate;
		}
		this.shouldComponentUpdate = function () {
			return false;
		};

		//!steal-remove-start
		if (typeof process === "undefined" || process.env.NODE_ENV !== "production") {
			if (!viewModel || (typeof viewModel === "undefined" ? "undefined" : _typeof(viewModel)) !== "object") {
				dev.warn("The Component constructor was created without a ViewModel.");
				throw new Error("super(props,viewModel) must be called in constructor on " + this.constructor.name + "."); //added by wang-xh
			}

			var methods = ["componentWillMount", "componentDidMount", "componentWillUpdate", "componentDidUpdate", "componentWillUnmount"];

			methods.forEach(function (method) {
				var methodAsString = this[method].toString();
				if (this[method] !== Component.prototype[method] && !methodAsString.includes(method, methodAsString.indexOf(") {"))) {
					throw new Error("super." + method + "() must be called on " + this.constructor.name + ".");
				}
			}.bind(this));
		}
		//!steal-remove-end

		//modified by wang-xh: ViewModel转换成DefineMap对象;props属性放在props对象中
		if (viewModel && (typeof viewModel === "undefined" ? "undefined" : _typeof(viewModel)) === "object") {
			viewModel = getDefineObject(viewModel.constructor.name, viewModel);
			autobindMethods(viewModel, true);
			makeEnumerable(viewModel, true);
		}
		var ViewModel = viewModel || DefineMap;
		var originProp = {
			props: props
		};
		this.viewModel = new ViewModel(originProp);
	};

	Component.prototype = Object.create(React.Component.prototype);

	assign(Component.prototype, {
		constructor: Component,

		componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
			var props = {};

			for (var key in nextProps) {
				if (!(key in this.props) || nextProps[key] !== this.props[key]) {
					props[key] = nextProps[key];
				}
			}
			this._observer.ignores(function () {
				this.viewModel.props.assign(props); //modified by wang-xh
			}.bind(this));
		},

		componentWillMount: function componentWillMount() {
			this._observer.startLisening(function () {
				if (typeof this._shouldComponentUpdate !== "function" || this._shouldComponentUpdate()) {
					this.forceUpdate();
				}
			}.bind(this));
		},

		componentDidMount: function componentDidMount() {
			this._observer.stopListening();
		},

		componentWillUpdate: function componentWillUpdate() {
			this._observer.startLisening();
		},

		componentDidUpdate: function componentDidUpdate() {
			this._observer.stopListening();
		},

		componentWillUnmount: function componentWillUnmount() {
			this._observer.stop();
			this.viewModel = null;
		}
	});

	module.exports = namespace.ReactViewModelComponent = Component;
} else {
	module.exports = namespace.ReactViewModelComponent = function Component() {
		throw new Error("You must provide React before can.all.js");
	};
}

//added by wang-xh 
function getDefineObject(name, viewModel) {
	var defineObject = {};
	//抽取VM中的数据
	Object.getOwnPropertyNames(viewModel).forEach(function (propName) {
		defineObject[propName] = {
			value: function value() {
				return viewModel[propName];
			}
		};
	});
	//抽取VM中的方法
	Object.getOwnPropertyNames(Object.getPrototypeOf(viewModel)).forEach(function (funcName) {
		defineObject[funcName] = viewModel[funcName];
	});
	//抽取基类ViewModel中方法
	Object.getOwnPropertyNames(Object.getPrototypeOf(viewModel.__proto__)).forEach(function (funcName) {
		defineObject[funcName] = viewModel[funcName];
	});
	return DefineMap.extend(name + "Object", defineObject);
}