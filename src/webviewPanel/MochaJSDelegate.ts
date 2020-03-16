//
//  MochaJSDelegate.js
//  MochaJSDelegate
//
//  Created by Matt Curtis
//  Copyright (c) 2015. All rights reserved.
//

export function MochaJSDelegate(selectorHandlerDict) {
	let uniqueClassName = "MochaJSDelegate_DynamicClass_" + NSUUID.UUID().UUIDString();

	let delegateClassDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(uniqueClassName, NSObject);

	delegateClassDesc.registerClass();

	//	Handler storage

	let handlers = {};

	//	Define interface

	this.setHandlerForSelector = function (selectorString, func) {
		let handlerHasBeenSet = (selectorString in handlers);
		let selector = NSSelectorFromString(selectorString);

		handlers[selectorString] = func;

		if (!handlerHasBeenSet) {
			/*
				For some reason, Mocha acts weird about arguments:
				https://github.com/logancollins/Mocha/issues/28

				We have to basically create a dynamic handler with a likewise dynamic number of predefined arguments.
			*/

			let dynamicHandler = function () {
				let functionToCall = handlers[selectorString];

				if (!functionToCall) return;

				return functionToCall.apply(delegateClassDesc, arguments);
			};

			let args = [], regex = /:/g;
			let match: RegExpExecArray;
			while (match = regex.exec(selectorString)) args.push("arg" + args.length);

			let dynamicFunction = eval("(function(" + args.join(",") + "){ return dynamicHandler.apply(this, arguments); })");

			delegateClassDesc.addInstanceMethodWithSelector_function_(selector, dynamicFunction);
		}
	};

	this.removeHandlerForSelector = function (selectorString) {
		delete handlers[selectorString];
	};

	this.getHandlerForSelector = function (selectorString) {
		return handlers[selectorString];
	};

	this.getAllHandlers = function () {
		return handlers;
	};

	this.getClass = function () {
		return NSClassFromString(uniqueClassName);
	};

	this.getClassInstance = function () {
		return NSClassFromString(uniqueClassName).new();
	};

	//	Conveience

	if (typeof selectorHandlerDict == "object") {
		for (let selectorString in selectorHandlerDict) {
			this.setHandlerForSelector(selectorString, selectorHandlerDict[selectorString]);
		}
	}
};
