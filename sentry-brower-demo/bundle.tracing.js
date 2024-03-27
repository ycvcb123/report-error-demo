/*! @sentry/browser & @sentry/tracing 7.101.1 (e4696dc) | https://github.com/getsentry/sentry-javascript */
var Sentry = (function (exports) {

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const objectToString = Object.prototype.toString;
  
    /**
     * Checks whether given value's type is one of a few Error or Error-like
     * {@link isError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isError(wat) {
      switch (objectToString.call(wat)) {
        case '[object Error]':
        case '[object Exception]':
        case '[object DOMException]':
          return true;
        default:
          return isInstanceOf(wat, Error);
      }
    }
    /**
     * Checks whether given value is an instance of the given built-in class.
     *
     * @param wat The value to be checked
     * @param className
     * @returns A boolean representing the result.
     */
    function isBuiltin(wat, className) {
      return objectToString.call(wat) === `[object ${className}]`;
    }
  
    /**
     * Checks whether given value's type is ErrorEvent
     * {@link isErrorEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isErrorEvent$1(wat) {
      return isBuiltin(wat, 'ErrorEvent');
    }
  
    /**
     * Checks whether given value's type is DOMError
     * {@link isDOMError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMError(wat) {
      return isBuiltin(wat, 'DOMError');
    }
  
    /**
     * Checks whether given value's type is DOMException
     * {@link isDOMException}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMException(wat) {
      return isBuiltin(wat, 'DOMException');
    }
  
    /**
     * Checks whether given value's type is a string
     * {@link isString}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isString(wat) {
      return isBuiltin(wat, 'String');
    }
  
    /**
     * Checks whether given string is parameterized
     * {@link isParameterizedString}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isParameterizedString(wat) {
      return (
        typeof wat === 'object' &&
        wat !== null &&
        '__sentry_template_string__' in wat &&
        '__sentry_template_values__' in wat
      );
    }
  
    /**
     * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
     * {@link isPrimitive}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPrimitive(wat) {
      return wat === null || isParameterizedString(wat) || (typeof wat !== 'object' && typeof wat !== 'function');
    }
  
    /**
     * Checks whether given value's type is an object literal, or a class instance.
     * {@link isPlainObject}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPlainObject(wat) {
      return isBuiltin(wat, 'Object');
    }
  
    /**
     * Checks whether given value's type is an Event instance
     * {@link isEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isEvent(wat) {
      return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
    }
  
    /**
     * Checks whether given value's type is an Element instance
     * {@link isElement}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isElement(wat) {
      return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
    }
  
    /**
     * Checks whether given value's type is an regexp
     * {@link isRegExp}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isRegExp(wat) {
      return isBuiltin(wat, 'RegExp');
    }
  
    /**
     * Checks whether given value has a then function.
     * @param wat A value to be checked.
     */
    function isThenable(wat) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return Boolean(wat && wat.then && typeof wat.then === 'function');
    }
  
    /**
     * Checks whether given value's type is a SyntheticEvent
     * {@link isSyntheticEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isSyntheticEvent(wat) {
      return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
    }
  
    /**
     * Checks whether given value is NaN
     * {@link isNaN}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isNaN$1(wat) {
      return typeof wat === 'number' && wat !== wat;
    }
  
    /**
     * Checks whether given value's type is an instance of provided constructor.
     * {@link isInstanceOf}.
     *
     * @param wat A value to be checked.
     * @param base A constructor to be used in a check.
     * @returns A boolean representing the result.
     */
    function isInstanceOf(wat, base) {
      try {
        return wat instanceof base;
      } catch (_e) {
        return false;
      }
    }
  
    /**
     * Checks whether given value's type is a Vue ViewModel.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isVueViewModel(wat) {
      // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
      return !!(typeof wat === 'object' && wat !== null && ((wat ).__isVue || (wat )._isVue));
    }
  
    /**
     * Truncates given string to the maximum characters count
     *
     * @param str An object that contains serializable values
     * @param max Maximum number of characters in truncated string (0 = unlimited)
     * @returns string Encoded
     */
    function truncate(str, max = 0) {
      if (typeof str !== 'string' || max === 0) {
        return str;
      }
      return str.length <= max ? str : `${str.slice(0, max)}...`;
    }
  
    /**
     * Join values in array
     * @param input array of values to be joined together
     * @param delimiter string to be placed in-between values
     * @returns Joined values
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function safeJoin(input, delimiter) {
      if (!Array.isArray(input)) {
        return '';
      }
  
      const output = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < input.length; i++) {
        const value = input[i];
        try {
          // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
          // console warnings. This happens when a Vue template is rendered with
          // an undeclared variable, which we try to stringify, ultimately causing
          // Vue to issue another warning which repeats indefinitely.
          // see: https://github.com/getsentry/sentry-javascript/pull/8981
          if (isVueViewModel(value)) {
            output.push('[VueViewModel]');
          } else {
            output.push(String(value));
          }
        } catch (e) {
          output.push('[value cannot be serialized]');
        }
      }
  
      return output.join(delimiter);
    }
  
    /**
     * Checks if the given value matches a regex or string
     *
     * @param value The string to test
     * @param pattern Either a regex or a string against which `value` will be matched
     * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
     * `pattern` if it contains `pattern`. Only applies to string-type patterns.
     */
    function isMatchingPattern(
      value,
      pattern,
      requireExactStringMatch = false,
    ) {
      if (!isString(value)) {
        return false;
      }
  
      if (isRegExp(pattern)) {
        return pattern.test(value);
      }
      if (isString(pattern)) {
        return requireExactStringMatch ? value === pattern : value.includes(pattern);
      }
  
      return false;
    }
  
    /**
     * Test the given string against an array of strings and regexes. By default, string matching is done on a
     * substring-inclusion basis rather than a strict equality basis
     *
     * @param testString The string to test
     * @param patterns The patterns against which to test the string
     * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
     * count. If false, `testString` will match a string pattern if it contains that pattern.
     * @returns
     */
    function stringMatchesSomePattern(
      testString,
      patterns = [],
      requireExactStringMatch = false,
    ) {
      return patterns.some(pattern => isMatchingPattern(testString, pattern, requireExactStringMatch));
    }
  
    /**
     * Creates exceptions inside `event.exception.values` for errors that are nested on properties based on the `key` parameter.
     */
    function applyAggregateErrorsToEvent(
      exceptionFromErrorImplementation,
      parser,
      maxValueLimit = 250,
      key,
      limit,
      event,
      hint,
    ) {
      if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) {
        return;
      }
  
      // Generally speaking the last item in `event.exception.values` is the exception originating from the original Error
      const originalException =
        event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : undefined;
  
      // We only create exception grouping if there is an exception in the event.
      if (originalException) {
        event.exception.values = truncateAggregateExceptions(
          aggregateExceptionsFromError(
            exceptionFromErrorImplementation,
            parser,
            limit,
            hint.originalException ,
            key,
            event.exception.values,
            originalException,
            0,
          ),
          maxValueLimit,
        );
      }
    }
  
    function aggregateExceptionsFromError(
      exceptionFromErrorImplementation,
      parser,
      limit,
      error,
      key,
      prevExceptions,
      exception,
      exceptionId,
    ) {
      if (prevExceptions.length >= limit + 1) {
        return prevExceptions;
      }
  
      let newExceptions = [...prevExceptions];
  
      if (isInstanceOf(error[key], Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, error[key]);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(
          exceptionFromErrorImplementation,
          parser,
          limit,
          error[key],
          key,
          [newException, ...newExceptions],
          newException,
          newExceptionId,
        );
      }
  
      // This will create exception grouping for AggregateErrors
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
      if (Array.isArray(error.errors)) {
        error.errors.forEach((childError, i) => {
          if (isInstanceOf(childError, Error)) {
            applyExceptionGroupFieldsForParentException(exception, exceptionId);
            const newException = exceptionFromErrorImplementation(parser, childError);
            const newExceptionId = newExceptions.length;
            applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
            newExceptions = aggregateExceptionsFromError(
              exceptionFromErrorImplementation,
              parser,
              limit,
              childError,
              key,
              [newException, ...newExceptions],
              newException,
              newExceptionId,
            );
          }
        });
      }
  
      return newExceptions;
    }
  
    function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
      // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
      exception.mechanism = exception.mechanism || { type: 'generic', handled: true };
  
      exception.mechanism = {
        ...exception.mechanism,
        is_exception_group: true,
        exception_id: exceptionId,
      };
    }
  
    function applyExceptionGroupFieldsForChildException(
      exception,
      source,
      exceptionId,
      parentId,
    ) {
      // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
      exception.mechanism = exception.mechanism || { type: 'generic', handled: true };
  
      exception.mechanism = {
        ...exception.mechanism,
        type: 'chained',
        source,
        exception_id: exceptionId,
        parent_id: parentId,
      };
    }
  
    /**
     * Truncate the message (exception.value) of all exceptions in the event.
     * Because this event processor is ran after `applyClientOptions`,
     * we need to truncate the message of the added exceptions here.
     */
    function truncateAggregateExceptions(exceptions, maxValueLength) {
      return exceptions.map(exception => {
        if (exception.value) {
          exception.value = truncate(exception.value, maxValueLength);
        }
        return exception;
      });
    }
  
    /** Internal global with common properties and Sentry extensions  */
  
    // The code below for 'isGlobalObj' and 'GLOBAL_OBJ' was copied from core-js before modification
    // https://github.com/zloirock/core-js/blob/1b944df55282cdc99c90db5f49eb0b6eda2cc0a3/packages/core-js/internals/global.js
    // core-js has the following licence:
    //
    // Copyright (c) 2014-2022 Denis Pushkarev
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.
  
    /** Returns 'obj' if it's the global object, otherwise returns undefined */
    function isGlobalObj(obj) {
      return obj && obj.Math == Math ? obj : undefined;
    }
  
    /** Get's the global object for the current JavaScript runtime */
    const GLOBAL_OBJ =
      (typeof globalThis == 'object' && isGlobalObj(globalThis)) ||
      // eslint-disable-next-line no-restricted-globals
      (typeof window == 'object' && isGlobalObj(window)) ||
      (typeof self == 'object' && isGlobalObj(self)) ||
      (typeof global == 'object' && isGlobalObj(global)) ||
      (function () {
        return this;
      })() ||
      {};
  
    /**
     * @deprecated Use GLOBAL_OBJ instead or WINDOW from @sentry/browser. This will be removed in v8
     */
    function getGlobalObject() {
      return GLOBAL_OBJ ;
    }
  
    /**
     * Returns a global singleton contained in the global `__SENTRY__` object.
     *
     * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
     * function and added to the `__SENTRY__` object.
     *
     * @param name name of the global singleton on __SENTRY__
     * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
     * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
     * @returns the singleton
     */
    function getGlobalSingleton(name, creator, obj) {
      const gbl = (obj || GLOBAL_OBJ) ;
      const __SENTRY__ = (gbl.__SENTRY__ = gbl.__SENTRY__ || {});
      const singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
      return singleton;
    }
  
    // eslint-disable-next-line deprecation/deprecation
    const WINDOW$7 = getGlobalObject();
  
    const DEFAULT_MAX_STRING_LENGTH = 80;
  
    /**
     * Given a child DOM element, returns a query-selector statement describing that
     * and its ancestors
     * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function htmlTreeAsString(
      elem,
      options = {},
    ) {
      if (!elem) {
        return '<unknown>';
      }
  
      // try/catch both:
      // - accessing event.target (see getsentry/raven-js#838, #768)
      // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
      // - can throw an exception in some circumstances.
      try {
        let currentElem = elem ;
        const MAX_TRAVERSE_HEIGHT = 5;
        const out = [];
        let height = 0;
        let len = 0;
        const separator = ' > ';
        const sepLength = separator.length;
        let nextStr;
        const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
        const maxStringLength = (!Array.isArray(options) && options.maxStringLength) || DEFAULT_MAX_STRING_LENGTH;
  
        while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
          nextStr = _htmlElementAsString(currentElem, keyAttrs);
          // bail out if
          // - nextStr is the 'html' element
          // - the length of the string that would be created exceeds maxStringLength
          //   (ignore this limit if we are on the first iteration)
          if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength)) {
            break;
          }
  
          out.push(nextStr);
  
          len += nextStr.length;
          currentElem = currentElem.parentNode;
        }
  
        return out.reverse().join(separator);
      } catch (_oO) {
        return '<unknown>';
      }
    }
  
    /**
     * Returns a simple, query-selector representation of a DOM element
     * e.g. [HTMLElement] => input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function _htmlElementAsString(el, keyAttrs) {
      const elem = el
  
    ;
  
      const out = [];
      let className;
      let classes;
      let key;
      let attr;
      let i;
  
      if (!elem || !elem.tagName) {
        return '';
      }
  
      // @ts-expect-error WINDOW has HTMLElement
      if (WINDOW$7.HTMLElement) {
        // If using the component name annotation plugin, this value may be available on the DOM node
        if (elem instanceof HTMLElement && elem.dataset && elem.dataset['sentryComponent']) {
          return elem.dataset['sentryComponent'];
        }
      }
  
      out.push(elem.tagName.toLowerCase());
  
      // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
      const keyAttrPairs =
        keyAttrs && keyAttrs.length
          ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)])
          : null;
  
      if (keyAttrPairs && keyAttrPairs.length) {
        keyAttrPairs.forEach(keyAttrPair => {
          out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
        });
      } else {
        if (elem.id) {
          out.push(`#${elem.id}`);
        }
  
        // eslint-disable-next-line prefer-const
        className = elem.className;
        if (className && isString(className)) {
          classes = className.split(/\s+/);
          for (i = 0; i < classes.length; i++) {
            out.push(`.${classes[i]}`);
          }
        }
      }
      const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
      for (i = 0; i < allowedAttrs.length; i++) {
        key = allowedAttrs[i];
        attr = elem.getAttribute(key);
        if (attr) {
          out.push(`[${key}="${attr}"]`);
        }
      }
      return out.join('');
    }
  
    /**
     * A safe form of location.href
     */
    function getLocationHref() {
      try {
        return WINDOW$7.document.location.href;
      } catch (oO) {
        return '';
      }
    }
  
    /**
     * Gets a DOM element by using document.querySelector.
     *
     * This wrapper will first check for the existance of the function before
     * actually calling it so that we don't have to take care of this check,
     * every time we want to access the DOM.
     *
     * Reason: DOM/querySelector is not available in all environments.
     *
     * We have to cast to any because utils can be consumed by a variety of environments,
     * and we don't want to break TS users. If you know what element will be selected by
     * `document.querySelector`, specify it as part of the generic call. For example,
     * `const element = getDomElement<Element>('selector');`
     *
     * @param selector the selector string passed on to document.querySelector
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getDomElement(selector) {
      if (WINDOW$7.document && WINDOW$7.document.querySelector) {
        return WINDOW$7.document.querySelector(selector) ;
      }
      return null;
    }
  
    /**
     * Given a DOM element, traverses up the tree until it finds the first ancestor node
     * that has the `data-sentry-component` attribute. This attribute is added at build-time
     * by projects that have the component name annotation plugin installed.
     *
     * @returns a string representation of the component for the provided DOM element, or `null` if not found
     */
    function getComponentName(elem) {
      // @ts-expect-error WINDOW has HTMLElement
      if (!WINDOW$7.HTMLElement) {
        return null;
      }
  
      let currentElem = elem ;
      const MAX_TRAVERSE_HEIGHT = 5;
      for (let i = 0; i < MAX_TRAVERSE_HEIGHT; i++) {
        if (!currentElem) {
          return null;
        }
  
        if (currentElem instanceof HTMLElement && currentElem.dataset['sentryComponent']) {
          return currentElem.dataset['sentryComponent'];
        }
  
        currentElem = currentElem.parentNode;
      }
  
      return null;
    }
  
    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    const DEBUG_BUILD$3 = (true);
  
    /** Prefix for logging strings */
    const PREFIX = 'Sentry Logger ';
  
    const CONSOLE_LEVELS = [
      'debug',
      'info',
      'warn',
      'error',
      'log',
      'assert',
      'trace',
    ] ;
  
    /** This may be mutated by the console instrumentation. */
    const originalConsoleMethods
  
     = {};
  
    /** JSDoc */
  
    /**
     * Temporarily disable sentry console instrumentations.
     *
     * @param callback The function to run against the original `console` messages
     * @returns The results of the callback
     */
    function consoleSandbox(callback) {
      if (!('console' in GLOBAL_OBJ)) {
        return callback();
      }
  
      const console = GLOBAL_OBJ.console ;
      const wrappedFuncs = {};
  
      const wrappedLevels = Object.keys(originalConsoleMethods) ;
  
      // Restore all wrapped console methods
      wrappedLevels.forEach(level => {
        const originalConsoleMethod = originalConsoleMethods[level] ;
        wrappedFuncs[level] = console[level] ;
        console[level] = originalConsoleMethod;
      });
  
      try {
        return callback();
      } finally {
        // Revert restoration to wrapped state
        wrappedLevels.forEach(level => {
          console[level] = wrappedFuncs[level] ;
        });
      }
    }
  
    function makeLogger() {
      let enabled = false;
      const logger = {
        enable: () => {
          enabled = true;
        },
        disable: () => {
          enabled = false;
        },
        isEnabled: () => enabled,
      };
  
      {
        CONSOLE_LEVELS.forEach(name => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger[name] = (...args) => {
            if (enabled) {
              consoleSandbox(() => {
                GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
              });
            }
          };
        });
      }
  
      return logger ;
    }
  
    const logger = makeLogger();
  
    /** Regular expression used to parse a Dsn. */
    const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
  
    function isValidProtocol(protocol) {
      return protocol === 'http' || protocol === 'https';
    }
  
    /**
     * Renders the string representation of this Dsn.
     *
     * By default, this will render the public representation without the password
     * component. To get the deprecated private representation, set `withPassword`
     * to true.
     *
     * @param withPassword When set to true, the password will be included.
     */
    function dsnToString(dsn, withPassword = false) {
      const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
      return (
        `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` +
        `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`
      );
    }
  
    /**
     * Parses a Dsn from a given string.
     *
     * @param str A Dsn as string
     * @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
     */
    function dsnFromString(str) {
      const match = DSN_REGEX.exec(str);
  
      if (!match) {
        // This should be logged to the console
        consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.error(`Invalid Sentry Dsn: ${str}`);
        });
        return undefined;
      }
  
      const [protocol, publicKey, pass = '', host, port = '', lastPath] = match.slice(1);
      let path = '';
      let projectId = lastPath;
  
      const split = projectId.split('/');
      if (split.length > 1) {
        path = split.slice(0, -1).join('/');
        projectId = split.pop() ;
      }
  
      if (projectId) {
        const projectMatch = projectId.match(/^\d+/);
        if (projectMatch) {
          projectId = projectMatch[0];
        }
      }
  
      return dsnFromComponents({ host, pass, path, projectId, port, protocol: protocol , publicKey });
    }
  
    function dsnFromComponents(components) {
      return {
        protocol: components.protocol,
        publicKey: components.publicKey || '',
        pass: components.pass || '',
        host: components.host,
        port: components.port || '',
        path: components.path || '',
        projectId: components.projectId,
      };
    }
  
    function validateDsn(dsn) {
  
      const { port, projectId, protocol } = dsn;
  
      const requiredComponents = ['protocol', 'publicKey', 'host', 'projectId'];
      const hasMissingRequiredComponent = requiredComponents.find(component => {
        if (!dsn[component]) {
          logger.error(`Invalid Sentry Dsn: ${component} missing`);
          return true;
        }
        return false;
      });
  
      if (hasMissingRequiredComponent) {
        return false;
      }
  
      if (!projectId.match(/^\d+$/)) {
        logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
        return false;
      }
  
      if (!isValidProtocol(protocol)) {
        logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
        return false;
      }
  
      if (port && isNaN(parseInt(port, 10))) {
        logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
        return false;
      }
  
      return true;
    }
  
    /**
     * Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
     * @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
     */
    function makeDsn(from) {
      const components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
      if (!components || !validateDsn(components)) {
        return undefined;
      }
      return components;
    }
  
    /** An error emitted by Sentry SDKs and related utilities. */
    class SentryError extends Error {
      /** Display name of this error instance. */
  
       constructor( message, logLevel = 'warn') {
        super(message);this.message = message;
        this.name = new.target.prototype.constructor.name;
        // This sets the prototype to be `Error`, not `SentryError`. It's unclear why we do this, but commenting this line
        // out causes various (seemingly totally unrelated) playwright tests consistently time out. FYI, this makes
        // instances of `SentryError` fail `obj instanceof SentryError` checks.
        Object.setPrototypeOf(this, new.target.prototype);
        this.logLevel = logLevel;
      }
    }
  
    /**
     * Replace a method in an object with a wrapped version of itself.
     *
     * @param source An object that contains a method to be wrapped.
     * @param name The name of the method to be wrapped.
     * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
     * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
     * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
     * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
     * @returns void
     */
    function fill(source, name, replacementFactory) {
      if (!(name in source)) {
        return;
      }
  
      const original = source[name] ;
      const wrapped = replacementFactory(original) ;
  
      // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
      // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
      if (typeof wrapped === 'function') {
        markFunctionWrapped(wrapped, original);
      }
  
      source[name] = wrapped;
    }
  
    /**
     * Defines a non-enumerable property on the given object.
     *
     * @param obj The object on which to set the property
     * @param name The name of the property to be set
     * @param value The value to which to set the property
     */
    function addNonEnumerableProperty(obj, name, value) {
      try {
        Object.defineProperty(obj, name, {
          // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
          value: value,
          writable: true,
          configurable: true,
        });
      } catch (o_O) {
        DEBUG_BUILD$3 && logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
      }
    }
  
    /**
     * Remembers the original function on the wrapped function and
     * patches up the prototype.
     *
     * @param wrapped the wrapper function
     * @param original the original function that gets wrapped
     */
    function markFunctionWrapped(wrapped, original) {
      try {
        const proto = original.prototype || {};
        wrapped.prototype = original.prototype = proto;
        addNonEnumerableProperty(wrapped, '__sentry_original__', original);
      } catch (o_O) {} // eslint-disable-line no-empty
    }
  
    /**
     * This extracts the original function if available.  See
     * `markFunctionWrapped` for more information.
     *
     * @param func the function to unwrap
     * @returns the unwrapped version of the function if available.
     */
    function getOriginalFunction(func) {
      return func.__sentry_original__;
    }
  
    /**
     * Encodes given object into url-friendly format
     *
     * @param object An object that contains serializable values
     * @returns string Encoded
     */
    function urlEncode(object) {
      return Object.keys(object)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`)
        .join('&');
    }
  
    /**
     * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
     * non-enumerable properties attached.
     *
     * @param value Initial source that we have to transform in order for it to be usable by the serializer
     * @returns An Event or Error turned into an object - or the value argurment itself, when value is neither an Event nor
     *  an Error.
     */
    function convertToPlainObject(
      value,
    )
  
     {
      if (isError(value)) {
        return {
          message: value.message,
          name: value.name,
          stack: value.stack,
          ...getOwnProperties(value),
        };
      } else if (isEvent(value)) {
        const newObj
  
     = {
          type: value.type,
          target: serializeEventTarget(value.target),
          currentTarget: serializeEventTarget(value.currentTarget),
          ...getOwnProperties(value),
        };
  
        if (typeof CustomEvent !== 'undefined' && isInstanceOf(value, CustomEvent)) {
          newObj.detail = value.detail;
        }
  
        return newObj;
      } else {
        return value;
      }
    }
  
    /** Creates a string representation of the target of an `Event` object */
    function serializeEventTarget(target) {
      try {
        return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
      } catch (_oO) {
        return '<unknown>';
      }
    }
  
    /** Filters out all but an object's own properties */
    function getOwnProperties(obj) {
      if (typeof obj === 'object' && obj !== null) {
        const extractedProps = {};
        for (const property in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, property)) {
            extractedProps[property] = (obj )[property];
          }
        }
        return extractedProps;
      } else {
        return {};
      }
    }
  
    /**
     * Given any captured exception, extract its keys and create a sorted
     * and truncated list that will be used inside the event message.
     * eg. `Non-error exception captured with keys: foo, bar, baz`
     */
    function extractExceptionKeysForMessage(exception, maxLength = 40) {
      const keys = Object.keys(convertToPlainObject(exception));
      keys.sort();
  
      if (!keys.length) {
        return '[object has no keys]';
      }
  
      if (keys[0].length >= maxLength) {
        return truncate(keys[0], maxLength);
      }
  
      for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
        const serialized = keys.slice(0, includedKeys).join(', ');
        if (serialized.length > maxLength) {
          continue;
        }
        if (includedKeys === keys.length) {
          return serialized;
        }
        return truncate(serialized, maxLength);
      }
  
      return '';
    }
  
    /**
     * Given any object, return a new object having removed all fields whose value was `undefined`.
     * Works recursively on objects and arrays.
     *
     * Attention: This function keeps circular references in the returned object.
     */
    function dropUndefinedKeys(inputValue) {
      // This map keeps track of what already visited nodes map to.
      // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
      // references as the input object.
      const memoizationMap = new Map();
  
      // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
      return _dropUndefinedKeys(inputValue, memoizationMap);
    }
  
    function _dropUndefinedKeys(inputValue, memoizationMap) {
      if (isPojo(inputValue)) {
        // If this node has already been visited due to a circular reference, return the object it was mapped to in the new object
        const memoVal = memoizationMap.get(inputValue);
        if (memoVal !== undefined) {
          return memoVal ;
        }
  
        const returnValue = {};
        // Store the mapping of this value in case we visit it again, in case of circular data
        memoizationMap.set(inputValue, returnValue);
  
        for (const key of Object.keys(inputValue)) {
          if (typeof inputValue[key] !== 'undefined') {
            returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
          }
        }
  
        return returnValue ;
      }
  
      if (Array.isArray(inputValue)) {
        // If this node has already been visited due to a circular reference, return the array it was mapped to in the new object
        const memoVal = memoizationMap.get(inputValue);
        if (memoVal !== undefined) {
          return memoVal ;
        }
  
        const returnValue = [];
        // Store the mapping of this value in case we visit it again, in case of circular data
        memoizationMap.set(inputValue, returnValue);
  
        inputValue.forEach((item) => {
          returnValue.push(_dropUndefinedKeys(item, memoizationMap));
        });
  
        return returnValue ;
      }
  
      return inputValue;
    }
  
    function isPojo(input) {
      if (!isPlainObject(input)) {
        return false;
      }
  
      try {
        const name = (Object.getPrototypeOf(input) ).constructor.name;
        return !name || name === 'Object';
      } catch (e) {
        return true;
      }
    }
  
    const STACKTRACE_FRAME_LIMIT = 50;
    // Used to sanitize webpack (error: *) wrapped stack errors
    const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
    const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
  
    /**
     * Creates a stack parser with the supplied line parsers
     *
     * StackFrames are returned in the correct order for Sentry Exception
     * frames and with Sentry SDK internal frames removed from the top and bottom
     *
     */
    function createStackParser(...parsers) {
      const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
  
      return (stack, skipFirst = 0) => {
        const frames = [];
        const lines = stack.split('\n');
  
        for (let i = skipFirst; i < lines.length; i++) {
          const line = lines[i];
          // Ignore lines over 1kb as they are unlikely to be stack frames.
          // Many of the regular expressions use backtracking which results in run time that increases exponentially with
          // input size. Huge strings can result in hangs/Denial of Service:
          // https://github.com/getsentry/sentry-javascript/issues/2286
          if (line.length > 1024) {
            continue;
          }
  
          // https://github.com/getsentry/sentry-javascript/issues/5459
          // Remove webpack (error: *) wrappers
          const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;
  
          // https://github.com/getsentry/sentry-javascript/issues/7813
          // Skip Error: lines
          if (cleanedLine.match(/\S*Error: /)) {
            continue;
          }
  
          for (const parser of sortedParsers) {
            const frame = parser(cleanedLine);
  
            if (frame) {
              frames.push(frame);
              break;
            }
          }
  
          if (frames.length >= STACKTRACE_FRAME_LIMIT) {
            break;
          }
        }
  
        return stripSentryFramesAndReverse(frames);
      };
    }
  
    /**
     * Gets a stack parser implementation from Options.stackParser
     * @see Options
     *
     * If options contains an array of line parsers, it is converted into a parser
     */
    function stackParserFromStackParserOptions(stackParser) {
      if (Array.isArray(stackParser)) {
        return createStackParser(...stackParser);
      }
      
      return stackParser;
    }
  
    /**
     * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
     * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
     * function that caused the crash is the last frame in the array.
     * @hidden
     */
    function stripSentryFramesAndReverse(stack) {
      if (!stack.length) {
        return [];
      }
  
      const localStack = Array.from(stack);
  
      // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
      if (/sentryWrapped/.test(localStack[localStack.length - 1].function || '')) {
        localStack.pop();
      }
  
      // Reversing in the middle of the procedure allows us to just pop the values off the stack
      localStack.reverse();
  
      // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
      if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
        localStack.pop();
  
        // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
        // is produced within the hub itself, making it:
        //
        //   Sentry.captureException()
        //   getCurrentHub().captureException()
        //
        // instead of just the top `Sentry` call itself.
        // This forces us to possibly strip an additional frame in the exact same was as above.
        if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
          localStack.pop();
        }
      }
  
      return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(frame => ({
        ...frame,
        filename: frame.filename || localStack[localStack.length - 1].filename,
        function: frame.function || '?',
      }));
    }
  
    const defaultFunctionName = '<anonymous>';
  
    /**
     * Safely extract function name from itself
     */
    function getFunctionName(fn) {
      try {
        if (!fn || typeof fn !== 'function') {
          return defaultFunctionName;
        }
        return fn.name || defaultFunctionName;
      } catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        return defaultFunctionName;
      }
    }
  
    // We keep the handlers globally
    const handlers$1 = {};
    const instrumented$1 = {};
  
    /** Add a handler function. */
    function addHandler$1(type, handler) {
      handlers$1[type] = handlers$1[type] || [];
      (handlers$1[type] ).push(handler);
    }
  
    /** Maybe run an instrumentation function, unless it was already called. */
    function maybeInstrument(type, instrumentFn) {
      if (!instrumented$1[type]) {
        instrumentFn();
        instrumented$1[type] = true;
      }
    }
  
    /** Trigger handlers for a given instrumentation type. */
    function triggerHandlers$1(type, data) {
      const typeHandlers = type && handlers$1[type];
      if (!typeHandlers) {
        return;
      }
  
      for (const handler of typeHandlers) {
        try {
          handler(data);
        } catch (e) {
          logger.error(
              `Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError:`,
              e,
            );
        }
      }
    }
  
    /**
     * Add an instrumentation handler for when a console.xxx method is called.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addConsoleInstrumentationHandler(handler) {
      const type = 'console';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentConsole);
    }
  
    function instrumentConsole() {
      if (!('console' in GLOBAL_OBJ)) {
        return;
      }
  
      CONSOLE_LEVELS.forEach(function (level) {
        if (!(level in GLOBAL_OBJ.console)) {
          return;
        }
  
        fill(GLOBAL_OBJ.console, level, function (originalConsoleMethod) {
          originalConsoleMethods[level] = originalConsoleMethod;
  
          return function (...args) {
            const handlerData = { args, level };
            triggerHandlers$1('console', handlerData);
  
            const log = originalConsoleMethods[level];
            log && log.apply(GLOBAL_OBJ.console, args);
          };
        });
      });
    }
  
    /**
     * UUID4 generator
     *
     * @returns string Generated UUID4.
     */
    function uuid4() {
      const gbl = GLOBAL_OBJ ;
      const crypto = gbl.crypto || gbl.msCrypto;
  
      let getRandomByte = () => Math.random() * 16;
      try {
        if (crypto && crypto.randomUUID) {
          return crypto.randomUUID().replace(/-/g, '');
        }
        if (crypto && crypto.getRandomValues) {
          getRandomByte = () => {
            // crypto.getRandomValues might return undefined instead of the typed array
            // in old Chromium versions (e.g. 23.0.1235.0 (151422))
            // However, `typedArray` is still filled in-place.
            // @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#typedarray
            const typedArray = new Uint8Array(1);
            crypto.getRandomValues(typedArray);
            return typedArray[0];
          };
        }
      } catch (_) {
        // some runtimes can crash invoking crypto
        // https://github.com/getsentry/sentry-javascript/issues/8935
      }
  
      // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
      // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
      return (([1e7] ) + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
        // eslint-disable-next-line no-bitwise
        ((c ) ^ ((getRandomByte() & 15) >> ((c ) / 4))).toString(16),
      );
    }
  
    function getFirstException(event) {
      return event.exception && event.exception.values ? event.exception.values[0] : undefined;
    }
  
    /**
     * Extracts either message or type+value from an event that can be used for user-facing logs
     * @returns event's description
     */
    function getEventDescription(event) {
      const { message, event_id: eventId } = event;
      if (message) {
        return message;
      }
  
      const firstException = getFirstException(event);
      if (firstException) {
        if (firstException.type && firstException.value) {
          return `${firstException.type}: ${firstException.value}`;
        }
        return firstException.type || firstException.value || eventId || '<unknown>';
      }
      return eventId || '<unknown>';
    }
  
    /**
     * Adds exception values, type and value to an synthetic Exception.
     * @param event The event to modify.
     * @param value Value of the exception.
     * @param type Type of the exception.
     * @hidden
     */
    function addExceptionTypeValue(event, value, type) {
      const exception = (event.exception = event.exception || {});
      const values = (exception.values = exception.values || []);
      const firstException = (values[0] = values[0] || {});
      if (!firstException.value) {
        firstException.value = value || '';
      }
      if (!firstException.type) {
        firstException.type = type || 'Error';
      }
    }
  
    /**
     * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
     *
     * @param event The event to modify.
     * @param newMechanism Mechanism data to add to the event.
     * @hidden
     */
    function addExceptionMechanism(event, newMechanism) {
      const firstException = getFirstException(event);
      if (!firstException) {
        return;
      }
  
      const defaultMechanism = { type: 'generic', handled: true };
      const currentMechanism = firstException.mechanism;
      firstException.mechanism = { ...defaultMechanism, ...currentMechanism, ...newMechanism };
  
      if (newMechanism && 'data' in newMechanism) {
        const mergedData = { ...(currentMechanism && currentMechanism.data), ...newMechanism.data };
        firstException.mechanism.data = mergedData;
      }
    }
  
    /**
     * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
     * in question), and marks it captured if not.
     *
     * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
     * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
     * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
     * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
     * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
     * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
     * see it.
     *
     * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
     * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
     * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
     * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
     * must be done before the exception captured.
     *
     * @param A thrown exception to check or flag as having been seen
     * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
     */
    function checkOrSetAlreadyCaught(exception) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (exception && (exception ).__sentry_captured__) {
        return true;
      }
  
      try {
        // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
        // `ExtraErrorData` integration
        addNonEnumerableProperty(exception , '__sentry_captured__', true);
      } catch (err) {
        // `exception` is a primitive, so we can't mark it seen
      }
  
      return false;
    }
  
    /**
     * Checks whether the given input is already an array, and if it isn't, wraps it in one.
     *
     * @param maybeArray Input to turn into an array, if necessary
     * @returns The input, if already an array, or an array with the input as the only element, if not
     */
    function arrayify(maybeArray) {
      return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
    }
  
    const WINDOW$6 = GLOBAL_OBJ ;
    const DEBOUNCE_DURATION = 1000;
  
    let debounceTimerID;
    let lastCapturedEventType;
    let lastCapturedEventTargetId;
  
    /**
     * Add an instrumentation handler for when a click or a keypress happens.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addClickKeypressInstrumentationHandler(handler) {
      const type = 'dom';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentDOM);
    }
  
    /** Exported for tests only. */
    function instrumentDOM() {
      if (!WINDOW$6.document) {
        return;
      }
  
      // Make it so that any click or keypress that is unhandled / bubbled up all the way to the document triggers our dom
      // handlers. (Normally we have only one, which captures a breadcrumb for each click or keypress.) Do this before
      // we instrument `addEventListener` so that we don't end up attaching this handler twice.
      const triggerDOMHandler = triggerHandlers$1.bind(null, 'dom');
      const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
      WINDOW$6.document.addEventListener('click', globalDOMEventHandler, false);
      WINDOW$6.document.addEventListener('keypress', globalDOMEventHandler, false);
  
      // After hooking into click and keypress events bubbled up to `document`, we also hook into user-handled
      // clicks & keypresses, by adding an event listener of our own to any element to which they add a listener. That
      // way, whenever one of their handlers is triggered, ours will be, too. (This is needed because their handler
      // could potentially prevent the event from bubbling up to our global listeners. This way, our handler are still
      // guaranteed to fire at least once.)
      ['EventTarget', 'Node'].forEach((target) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const proto = (WINDOW$6 )[target] && (WINDOW$6 )[target].prototype;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
          return;
        }
  
        fill(proto, 'addEventListener', function (originalAddEventListener) {
          return function (
  
            type,
            listener,
            options,
          ) {
            if (type === 'click' || type == 'keypress') {
              try {
                const el = this ;
                const handlers = (el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {});
                const handlerForType = (handlers[type] = handlers[type] || { refCount: 0 });
  
                if (!handlerForType.handler) {
                  const handler = makeDOMEventHandler(triggerDOMHandler);
                  handlerForType.handler = handler;
                  originalAddEventListener.call(this, type, handler, options);
                }
  
                handlerForType.refCount++;
              } catch (e) {
                // Accessing dom properties is always fragile.
                // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
              }
            }
  
            return originalAddEventListener.call(this, type, listener, options);
          };
        });
  
        fill(
          proto,
          'removeEventListener',
          function (originalRemoveEventListener) {
            return function (
  
              type,
              listener,
              options,
            ) {
              if (type === 'click' || type == 'keypress') {
                try {
                  const el = this ;
                  const handlers = el.__sentry_instrumentation_handlers__ || {};
                  const handlerForType = handlers[type];
  
                  if (handlerForType) {
                    handlerForType.refCount--;
                    // If there are no longer any custom handlers of the current type on this element, we can remove ours, too.
                    if (handlerForType.refCount <= 0) {
                      originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                      handlerForType.handler = undefined;
                      delete handlers[type]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
                    }
  
                    // If there are no longer any custom handlers of any type on this element, cleanup everything.
                    if (Object.keys(handlers).length === 0) {
                      delete el.__sentry_instrumentation_handlers__;
                    }
                  }
                } catch (e) {
                  // Accessing dom properties is always fragile.
                  // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
                }
              }
  
              return originalRemoveEventListener.call(this, type, listener, options);
            };
          },
        );
      });
    }
  
    /**
     * Check whether the event is similar to the last captured one. For example, two click events on the same button.
     */
    function isSimilarToLastCapturedEvent(event) {
      // If both events have different type, then user definitely performed two separate actions. e.g. click + keypress.
      if (event.type !== lastCapturedEventType) {
        return false;
      }
  
      try {
        // If both events have the same type, it's still possible that actions were performed on different targets.
        // e.g. 2 clicks on different buttons.
        if (!event.target || (event.target )._sentryId !== lastCapturedEventTargetId) {
          return false;
        }
      } catch (e) {
        // just accessing `target` property can throw an exception in some rare circumstances
        // see: https://github.com/getsentry/sentry-javascript/issues/838
      }
  
      // If both events have the same type _and_ same `target` (an element which triggered an event, _not necessarily_
      // to which an event listener was attached), we treat them as the same action, as we want to capture
      // only one breadcrumb. e.g. multiple clicks on the same button, or typing inside a user input box.
      return true;
    }
  
    /**
     * Decide whether an event should be captured.
     * @param event event to be captured
     */
    function shouldSkipDOMEvent(eventType, target) {
      // We are only interested in filtering `keypress` events for now.
      if (eventType !== 'keypress') {
        return false;
      }
  
      if (!target || !target.tagName) {
        return true;
      }
  
      // Only consider keypress events on actual input elements. This will disregard keypresses targeting body
      // e.g.tabbing through elements, hotkeys, etc.
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return false;
      }
  
      return true;
    }
  
    /**
     * Wraps addEventListener to capture UI breadcrumbs
     */
    function makeDOMEventHandler(
      handler,
      globalListener = false,
    ) {
      return (event) => {
        // It's possible this handler might trigger multiple times for the same
        // event (e.g. event propagation through node ancestors).
        // Ignore if we've already captured that event.
        if (!event || event['_sentryCaptured']) {
          return;
        }
  
        const target = getEventTarget(event);
  
        // We always want to skip _some_ events.
        if (shouldSkipDOMEvent(event.type, target)) {
          return;
        }
  
        // Mark event as "seen"
        addNonEnumerableProperty(event, '_sentryCaptured', true);
  
        if (target && !target._sentryId) {
          // Add UUID to event target so we can identify if
          addNonEnumerableProperty(target, '_sentryId', uuid4());
        }
  
        const name = event.type === 'keypress' ? 'input' : event.type;
  
        // If there is no last captured event, it means that we can safely capture the new event and store it for future comparisons.
        // If there is a last captured event, see if the new event is different enough to treat it as a unique one.
        // If that's the case, emit the previous event and store locally the newly-captured DOM event.
        if (!isSimilarToLastCapturedEvent(event)) {
          const handlerData = { event, name, global: globalListener };
          handler(handlerData);
          lastCapturedEventType = event.type;
          lastCapturedEventTargetId = target ? target._sentryId : undefined;
        }
  
        // Start a new debounce timer that will prevent us from capturing multiple events that should be grouped together.
        clearTimeout(debounceTimerID);
        debounceTimerID = WINDOW$6.setTimeout(() => {
          lastCapturedEventTargetId = undefined;
          lastCapturedEventType = undefined;
        }, DEBOUNCE_DURATION);
      };
    }
  
    function getEventTarget(event) {
      try {
        return event.target ;
      } catch (e) {
        // just accessing `target` property can throw an exception in some rare circumstances
        // see: https://github.com/getsentry/sentry-javascript/issues/838
        return null;
      }
    }
  
    // eslint-disable-next-line deprecation/deprecation
    const WINDOW$5 = getGlobalObject();
  
    /**
     * Tells whether current environment supports Fetch API
     * {@link supportsFetch}.
     *
     * @returns Answer to the given question.
     */
    function supportsFetch() {
      if (!('fetch' in WINDOW$5)) {
        return false;
      }
  
      try {
        new Headers();
        new Request('http://www.example.com');
        new Response();
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * isNativeFetch checks if the given function is a native implementation of fetch()
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    function isNativeFetch(func) {
      return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
    }
  
    /**
     * Tells whether current environment supports Fetch API natively
     * {@link supportsNativeFetch}.
     *
     * @returns true if `window.fetch` is natively implemented, false otherwise
     */
    function supportsNativeFetch() {
      if (typeof EdgeRuntime === 'string') {
        return true;
      }
  
      if (!supportsFetch()) {
        return false;
      }
  
      // Fast path to avoid DOM I/O
      // eslint-disable-next-line @typescript-eslint/unbound-method
      if (isNativeFetch(WINDOW$5.fetch)) {
        return true;
      }
  
      // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
      // so create a "pure" iframe to see if that has native fetch
      let result = false;
      const doc = WINDOW$5.document;
      // eslint-disable-next-line deprecation/deprecation
      if (doc && typeof (doc.createElement ) === 'function') {
        try {
          const sandbox = doc.createElement('iframe');
          sandbox.hidden = true;
          doc.head.appendChild(sandbox);
          if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            result = isNativeFetch(sandbox.contentWindow.fetch);
          }
          doc.head.removeChild(sandbox);
        } catch (err) {
          logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
        }
      }
  
      return result;
    }
  
    /**
     * Add an instrumentation handler for when a fetch request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addFetchInstrumentationHandler(handler) {
      const type = 'fetch';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentFetch);
    }
  
    function instrumentFetch() {
      if (!supportsNativeFetch()) {
        return;
      }
  
      fill(GLOBAL_OBJ, 'fetch', function (originalFetch) {
        return function (...args) {
          const { method, url } = parseFetchArgs(args);
  
          const handlerData = {
            args,
            fetchData: {
              method,
              url,
            },
            startTimestamp: Date.now(),
          };
  
          triggerHandlers$1('fetch', {
            ...handlerData,
          });
  
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return originalFetch.apply(GLOBAL_OBJ, args).then(
            (response) => {
              const finishedHandlerData = {
                ...handlerData,
                endTimestamp: Date.now(),
                response,
              };
  
              triggerHandlers$1('fetch', finishedHandlerData);
              return response;
            },
            (error) => {
              const erroredHandlerData = {
                ...handlerData,
                endTimestamp: Date.now(),
                error,
              };
  
              triggerHandlers$1('fetch', erroredHandlerData);
              // NOTE: If you are a Sentry user, and you are seeing this stack frame,
              //       it means the sentry.javascript SDK caught an error invoking your application code.
              //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
              throw error;
            },
          );
        };
      });
    }
  
    function hasProp(obj, prop) {
      return !!obj && typeof obj === 'object' && !!(obj )[prop];
    }
  
    function getUrlFromResource(resource) {
      if (typeof resource === 'string') {
        return resource;
      }
  
      if (!resource) {
        return '';
      }
  
      if (hasProp(resource, 'url')) {
        return resource.url;
      }
  
      if (resource.toString) {
        return resource.toString();
      }
  
      return '';
    }
  
    /**
     * Parses the fetch arguments to find the used Http method and the url of the request.
     * Exported for tests only.
     */
    function parseFetchArgs(fetchArgs) {
      if (fetchArgs.length === 0) {
        return { method: 'GET', url: '' };
      }
  
      if (fetchArgs.length === 2) {
        const [url, options] = fetchArgs ;
  
        return {
          url: getUrlFromResource(url),
          method: hasProp(options, 'method') ? String(options.method).toUpperCase() : 'GET',
        };
      }
  
      const arg = fetchArgs[0];
      return {
        url: getUrlFromResource(arg ),
        method: hasProp(arg, 'method') ? String(arg.method).toUpperCase() : 'GET',
      };
    }
  
    let _oldOnErrorHandler = null;
  
    /**
     * Add an instrumentation handler for when an error is captured by the global error handler.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addGlobalErrorInstrumentationHandler(handler) {
      const type = 'error';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentError);
    }
  
    function instrumentError() {
      _oldOnErrorHandler = GLOBAL_OBJ.onerror;
  
      GLOBAL_OBJ.onerror = function (
        msg,
        url,
        line,
        column,
        error,
      ) {
        const handlerData = {
          column,
          error,
          line,
          msg,
          url,
        };
        triggerHandlers$1('error', handlerData);
  
        if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) {
          // eslint-disable-next-line prefer-rest-params
          return _oldOnErrorHandler.apply(this, arguments);
        }
  
        return false;
      };
  
      GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
    }
  
    let _oldOnUnhandledRejectionHandler = null;
  
    /**
     * Add an instrumentation handler for when an unhandled promise rejection is captured.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addGlobalUnhandledRejectionInstrumentationHandler(
      handler,
    ) {
      const type = 'unhandledrejection';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentUnhandledRejection);
    }
  
    function instrumentUnhandledRejection() {
      _oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
  
      GLOBAL_OBJ.onunhandledrejection = function (e) {
        const handlerData = e;
        triggerHandlers$1('unhandledrejection', handlerData);
  
        if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) {
          // eslint-disable-next-line prefer-rest-params
          return _oldOnUnhandledRejectionHandler.apply(this, arguments);
        }
  
        return true;
      };
  
      GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
    }
  
    // Based on https://github.com/angular/angular.js/pull/13945/files
  
    // eslint-disable-next-line deprecation/deprecation
    const WINDOW$4 = getGlobalObject();
  
    /**
     * Tells whether current environment supports History API
     * {@link supportsHistory}.
     *
     * @returns Answer to the given question.
     */
    function supportsHistory() {
      // NOTE: in Chrome App environment, touching history.pushState, *even inside
      //       a try/catch block*, will cause Chrome to output an error to console.error
      // borrowed from: https://github.com/angular/angular.js/pull/13945/files
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chrome = (WINDOW$4 ).chrome;
      const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      const hasHistoryApi = 'history' in WINDOW$4 && !!WINDOW$4.history.pushState && !!WINDOW$4.history.replaceState;
  
      return !isChromePackagedApp && hasHistoryApi;
    }
  
    const WINDOW$3 = GLOBAL_OBJ ;
  
    let lastHref;
  
    /**
     * Add an instrumentation handler for when a fetch request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addHistoryInstrumentationHandler(handler) {
      const type = 'history';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentHistory);
    }
  
    function instrumentHistory() {
      if (!supportsHistory()) {
        return;
      }
  
      const oldOnPopState = WINDOW$3.onpopstate;
      WINDOW$3.onpopstate = function ( ...args) {
        const to = WINDOW$3.location.href;
        // keep track of the current URL state, as we always receive only the updated state
        const from = lastHref;
        lastHref = to;
        const handlerData = { from, to };
        triggerHandlers$1('history', handlerData);
        if (oldOnPopState) {
          // Apparently this can throw in Firefox when incorrectly implemented plugin is installed.
          // https://github.com/getsentry/sentry-javascript/issues/3344
          // https://github.com/bugsnag/bugsnag-js/issues/469
          try {
            return oldOnPopState.apply(this, args);
          } catch (_oO) {
            // no-empty
          }
        }
      };
  
      function historyReplacementFunction(originalHistoryFunction) {
        return function ( ...args) {
          const url = args.length > 2 ? args[2] : undefined;
          if (url) {
            // coerce to string (this is what pushState does)
            const from = lastHref;
            const to = String(url);
            // keep track of the current URL state, as we always receive only the updated state
            lastHref = to;
            const handlerData = { from, to };
            triggerHandlers$1('history', handlerData);
          }
          return originalHistoryFunction.apply(this, args);
        };
      }
  
      fill(WINDOW$3.history, 'pushState', historyReplacementFunction);
      fill(WINDOW$3.history, 'replaceState', historyReplacementFunction);
    }
  
    const WINDOW$2 = GLOBAL_OBJ ;
  
    const SENTRY_XHR_DATA_KEY = '__sentry_xhr_v3__';
  
    /**
     * Add an instrumentation handler for when an XHR request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addXhrInstrumentationHandler(handler) {
      const type = 'xhr';
      addHandler$1(type, handler);
      maybeInstrument(type, instrumentXHR);
    }
  
    /** Exported only for tests. */
    function instrumentXHR() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(WINDOW$2 ).XMLHttpRequest) {
        return;
      }
  
      const xhrproto = XMLHttpRequest.prototype;
  
      fill(xhrproto, 'open', function (originalOpen) {
        return function ( ...args) {
          const startTimestamp = Date.now();
  
          // open() should always be called with two or more arguments
          // But to be on the safe side, we actually validate this and bail out if we don't have a method & url
          const method = isString(args[0]) ? args[0].toUpperCase() : undefined;
          const url = parseUrl$1(args[1]);
  
          if (!method || !url) {
            return originalOpen.apply(this, args);
          }
  
          this[SENTRY_XHR_DATA_KEY] = {
            method,
            url,
            request_headers: {},
          };
  
          // if Sentry key appears in URL, don't capture it as a request
          if (method === 'POST' && url.match(/sentry_key/)) {
            this.__sentry_own_request__ = true;
          }
  
          const onreadystatechangeHandler = () => {
            // For whatever reason, this is not the same instance here as from the outer method
            const xhrInfo = this[SENTRY_XHR_DATA_KEY];
  
            if (!xhrInfo) {
              return;
            }
  
            if (this.readyState === 4) {
              try {
                // touching statusCode in some platforms throws
                // an exception
                xhrInfo.status_code = this.status;
              } catch (e) {
                /* do nothing */
              }
  
              const handlerData = {
                args: [method, url],
                endTimestamp: Date.now(),
                startTimestamp,
                xhr: this,
              };
              triggerHandlers$1('xhr', handlerData);
            }
          };
  
          if ('onreadystatechange' in this && typeof this.onreadystatechange === 'function') {
            fill(this, 'onreadystatechange', function (original) {
              return function ( ...readyStateArgs) {
                onreadystatechangeHandler();
                return original.apply(this, readyStateArgs);
              };
            });
          } else {
            this.addEventListener('readystatechange', onreadystatechangeHandler);
          }
  
          // Intercepting `setRequestHeader` to access the request headers of XHR instance.
          // This will only work for user/library defined headers, not for the default/browser-assigned headers.
          // Request cookies are also unavailable for XHR, as `Cookie` header can't be defined by `setRequestHeader`.
          fill(this, 'setRequestHeader', function (original) {
            return function ( ...setRequestHeaderArgs) {
              const [header, value] = setRequestHeaderArgs;
  
              const xhrInfo = this[SENTRY_XHR_DATA_KEY];
  
              if (xhrInfo && isString(header) && isString(value)) {
                xhrInfo.request_headers[header.toLowerCase()] = value;
              }
  
              return original.apply(this, setRequestHeaderArgs);
            };
          });
  
          return originalOpen.apply(this, args);
        };
      });
  
      fill(xhrproto, 'send', function (originalSend) {
        return function ( ...args) {
          const sentryXhrData = this[SENTRY_XHR_DATA_KEY];
  
          if (!sentryXhrData) {
            return originalSend.apply(this, args);
          }
  
          if (args[0] !== undefined) {
            sentryXhrData.body = args[0];
          }
  
          const handlerData = {
            args: [sentryXhrData.method, sentryXhrData.url],
            startTimestamp: Date.now(),
            xhr: this,
          };
          triggerHandlers$1('xhr', handlerData);
  
          return originalSend.apply(this, args);
        };
      });
    }
  
    function parseUrl$1(url) {
      if (isString(url)) {
        return url;
      }
  
      try {
        // url can be a string or URL
        // but since URL is not available in IE11, we do not check for it,
        // but simply assume it is an URL and return `toString()` from it (which returns the full URL)
        // If that fails, we just return undefined
        return (url ).toString();
      } catch (e2) {} // eslint-disable-line no-empty
  
      return undefined;
    }
  
    /*
     * This module exists for optimizations in the build process through rollup and terser.  We define some global
     * constants, which can be overridden during build. By guarding certain pieces of code with functions that return these
     * constants, we can control whether or not they appear in the final bundle. (Any code guarded by a false condition will
     * never run, and will hence be dropped during treeshaking.) The two primary uses for this are stripping out calls to
     * `logger` and preventing node-related code from appearing in browser bundles.
     *
     * Attention:
     * This file should not be used to define constants/flags that are intended to be used for tree-shaking conducted by
     * users. These flags should live in their respective packages, as we identified user tooling (specifically webpack)
     * having issues tree-shaking these constants across package boundaries.
     * An example for this is the true constant. It is declared in each package individually because we want
     * users to be able to shake away expressions that it guards.
     */
  
    /**
     * Get source of SDK.
     */
    function getSDKSource() {
      // @ts-expect-error "npm" is injected by rollup during build process
      return "npm";
    }
  
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-explicit-any */
  
    /**
     * Helper to decycle json objects
     */
    function memoBuilder() {
      const hasWeakSet = typeof WeakSet === 'function';
      const inner = hasWeakSet ? new WeakSet() : [];
      function memoize(obj) {
        if (hasWeakSet) {
          if (inner.has(obj)) {
            return true;
          }
          inner.add(obj);
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < inner.length; i++) {
          const value = inner[i];
          if (value === obj) {
            return true;
          }
        }
        inner.push(obj);
        return false;
      }
  
      function unmemoize(obj) {
        if (hasWeakSet) {
          inner.delete(obj);
        } else {
          for (let i = 0; i < inner.length; i++) {
            if (inner[i] === obj) {
              inner.splice(i, 1);
              break;
            }
          }
        }
      }
      return [memoize, unmemoize];
    }
  
    /**
     * Recursively normalizes the given object.
     *
     * - Creates a copy to prevent original input mutation
     * - Skips non-enumerable properties
     * - When stringifying, calls `toJSON` if implemented
     * - Removes circular references
     * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
     * - Translates known global objects/classes to a string representations
     * - Takes care of `Error` object serialization
     * - Optionally limits depth of final output
     * - Optionally limits number of properties/elements included in any single object/array
     *
     * @param input The object to be normalized.
     * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
     * @param maxProperties The max number of elements or properties to be included in any single array or
     * object in the normallized output.
     * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function normalize(input, depth = 100, maxProperties = +Infinity) {
      try {
        // since we're at the outermost level, we don't provide a key
        return visit('', input, depth, maxProperties);
      } catch (err) {
        return { ERROR: `**non-serializable** (${err})` };
      }
    }
  
    /** JSDoc */
    function normalizeToSize(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      object,
      // Default Node.js REPL depth
      depth = 3,
      // 100kB, as 200kB is max payload size, so half sounds reasonable
      maxSize = 100 * 1024,
    ) {
      const normalized = normalize(object, depth);
  
      if (jsonSize(normalized) > maxSize) {
        return normalizeToSize(object, depth - 1, maxSize);
      }
  
      return normalized ;
    }
  
    /**
     * Visits a node to perform normalization on it
     *
     * @param key The key corresponding to the given node
     * @param value The node to be visited
     * @param depth Optional number indicating the maximum recursion depth
     * @param maxProperties Optional maximum number of properties/elements included in any single object/array
     * @param memo Optional Memo class handling decycling
     */
    function visit(
      key,
      value,
      depth = +Infinity,
      maxProperties = +Infinity,
      memo = memoBuilder(),
    ) {
      const [memoize, unmemoize] = memo;
  
      // Get the simple cases out of the way first
      if (
        value == null || // this matches null and undefined -> eqeq not eqeqeq
        (['number', 'boolean', 'string'].includes(typeof value) && !isNaN$1(value))
      ) {
        return value ;
      }
  
      const stringified = stringifyValue(key, value);
  
      // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
      // Everything else will have already been serialized, so if we don't see that pattern, we're done.
      if (!stringified.startsWith('[object ')) {
        return stringified;
      }
  
      // From here on, we can assert that `value` is either an object or an array.
  
      // Do not normalize objects that we know have already been normalized. As a general rule, the
      // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
      // have already been normalized.
      if ((value )['__sentry_skip_normalization__']) {
        return value ;
      }
  
      // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
      // We keep a certain amount of depth.
      // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
      const remainingDepth =
        typeof (value )['__sentry_override_normalization_depth__'] === 'number'
          ? ((value )['__sentry_override_normalization_depth__'] )
          : depth;
  
      // We're also done if we've reached the max depth
      if (remainingDepth === 0) {
        // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
        return stringified.replace('object ', '');
      }
  
      // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
      if (memoize(value)) {
        return '[Circular ~]';
      }
  
      // If the value has a `toJSON` method, we call it to extract more information
      const valueWithToJSON = value ;
      if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
        try {
          const jsonValue = valueWithToJSON.toJSON();
          // We need to normalize the return value of `.toJSON()` in case it has circular references
          return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
        } catch (err) {
          // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
        }
      }
  
      // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
      // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
      // property/entry, and keep track of the number of items we add to it.
      const normalized = (Array.isArray(value) ? [] : {}) ;
      let numAdded = 0;
  
      // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
      // properties are non-enumerable and otherwise would get missed.
      const visitable = convertToPlainObject(value );
  
      for (const visitKey in visitable) {
        // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
        if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
          continue;
        }
  
        if (numAdded >= maxProperties) {
          normalized[visitKey] = '[MaxProperties ~]';
          break;
        }
  
        // Recursively visit all the child nodes
        const visitValue = visitable[visitKey];
        normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
  
        numAdded++;
      }
  
      // Once we've visited all the branches, remove the parent from memo storage
      unmemoize(value);
  
      // Return accumulated values
      return normalized;
    }
  
    /* eslint-disable complexity */
    /**
     * Stringify the given value. Handles various known special values and types.
     *
     * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
     * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
     *
     * @param value The value to stringify
     * @returns A stringified representation of the given value
     */
    function stringifyValue(
      key,
      // this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
      // our internal use, it'll do
      value,
    ) {
      try {
        if (key === 'domain' && value && typeof value === 'object' && (value )._events) {
          return '[Domain]';
        }
  
        if (key === 'domainEmitter') {
          return '[DomainEmitter]';
        }
  
        // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
        // which won't throw if they are not present.
  
        if (typeof global !== 'undefined' && value === global) {
          return '[Global]';
        }
  
        // eslint-disable-next-line no-restricted-globals
        if (typeof window !== 'undefined' && value === window) {
          return '[Window]';
        }
  
        // eslint-disable-next-line no-restricted-globals
        if (typeof document !== 'undefined' && value === document) {
          return '[Document]';
        }
  
        if (isVueViewModel(value)) {
          return '[VueViewModel]';
        }
  
        // React's SyntheticEvent thingy
        if (isSyntheticEvent(value)) {
          return '[SyntheticEvent]';
        }
  
        if (typeof value === 'number' && value !== value) {
          return '[NaN]';
        }
  
        if (typeof value === 'function') {
          return `[Function: ${getFunctionName(value)}]`;
        }
  
        if (typeof value === 'symbol') {
          return `[${String(value)}]`;
        }
  
        // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
        if (typeof value === 'bigint') {
          return `[BigInt: ${String(value)}]`;
        }
  
        // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
        // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
        // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
        // we can make sure that only plain objects come out that way.
        const objName = getConstructorName(value);
  
        // Handle HTML Elements
        if (/^HTML(\w*)Element$/.test(objName)) {
          return `[HTMLElement: ${objName}]`;
        }
  
        return `[object ${objName}]`;
      } catch (err) {
        return `**non-serializable** (${err})`;
      }
    }
    /* eslint-enable complexity */
  
    function getConstructorName(value) {
      const prototype = Object.getPrototypeOf(value);
  
      return prototype ? prototype.constructor.name : 'null prototype';
    }
  
    /** Calculates bytes size of input string */
    function utf8Length(value) {
      // eslint-disable-next-line no-bitwise
      return ~-encodeURI(value).split(/%..|./).length;
    }
  
    /** Calculates bytes size of input object */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function jsonSize(value) {
      return utf8Length(JSON.stringify(value));
    }
  
    /* eslint-disable @typescript-eslint/explicit-function-return-type */
  
    /** SyncPromise internal states */
    var States; (function (States) {
      /** Pending */
      const PENDING = 0; States[States["PENDING"] = PENDING] = "PENDING";
      /** Resolved / OK */
      const RESOLVED = 1; States[States["RESOLVED"] = RESOLVED] = "RESOLVED";
      /** Rejected / Error */
      const REJECTED = 2; States[States["REJECTED"] = REJECTED] = "REJECTED";
    })(States || (States = {}));
  
    // Overloads so we can call resolvedSyncPromise without arguments and generic argument
  
    /**
     * Creates a resolved sync promise.
     *
     * @param value the value to resolve the promise with
     * @returns the resolved sync promise
     */
    function resolvedSyncPromise(value) {
      return new SyncPromise(resolve => {
        resolve(value);
      });
    }
  
    /**
     * Creates a rejected sync promise.
     *
     * @param value the value to reject the promise with
     * @returns the rejected sync promise
     */
    function rejectedSyncPromise(reason) {
      return new SyncPromise((_, reject) => {
        reject(reason);
      });
    }
  
    /**
     * Thenable class that behaves like a Promise and follows it's interface
     * but is not async internally
     */
    class SyncPromise {
  
       constructor(
        executor,
      ) {SyncPromise.prototype.__init.call(this);SyncPromise.prototype.__init2.call(this);SyncPromise.prototype.__init3.call(this);SyncPromise.prototype.__init4.call(this);
        this._state = States.PENDING;
        this._handlers = [];
  
        try {
          executor(this._resolve, this._reject);
        } catch (e) {
          this._reject(e);
        }
      }
  
      /** JSDoc */
       then(
        onfulfilled,
        onrejected,
      ) {
        return new SyncPromise((resolve, reject) => {
          this._handlers.push([
            false,
            result => {
              if (!onfulfilled) {
                // TODO: ¯\_(ツ)_/¯
                // TODO: FIXME
                resolve(result );
              } else {
                try {
                  resolve(onfulfilled(result));
                } catch (e) {
                  reject(e);
                }
              }
            },
            reason => {
              if (!onrejected) {
                reject(reason);
              } else {
                try {
                  resolve(onrejected(reason));
                } catch (e) {
                  reject(e);
                }
              }
            },
          ]);
          this._executeHandlers();
        });
      }
  
      /** JSDoc */
       catch(
        onrejected,
      ) {
        return this.then(val => val, onrejected);
      }
  
      /** JSDoc */
       finally(onfinally) {
        return new SyncPromise((resolve, reject) => {
          let val;
          let isRejected;
  
          return this.then(
            value => {
              isRejected = false;
              val = value;
              if (onfinally) {
                onfinally();
              }
            },
            reason => {
              isRejected = true;
              val = reason;
              if (onfinally) {
                onfinally();
              }
            },
          ).then(() => {
            if (isRejected) {
              reject(val);
              return;
            }
  
            resolve(val );
          });
        });
      }
  
      /** JSDoc */
        __init() {this._resolve = (value) => {
        this._setResult(States.RESOLVED, value);
      };}
  
      /** JSDoc */
        __init2() {this._reject = (reason) => {
        this._setResult(States.REJECTED, reason);
      };}
  
      /** JSDoc */
        __init3() {this._setResult = (state, value) => {
        if (this._state !== States.PENDING) {
          return;
        }
  
        if (isThenable(value)) {
          void (value ).then(this._resolve, this._reject);
          return;
        }
  
        this._state = state;
        this._value = value;
  
        this._executeHandlers();
      };}
  
      /** JSDoc */
        __init4() {this._executeHandlers = () => {
        if (this._state === States.PENDING) {
          return;
        }
  
        const cachedHandlers = this._handlers.slice();
        this._handlers = [];
  
        cachedHandlers.forEach(handler => {
          if (handler[0]) {
            return;
          }
  
          if (this._state === States.RESOLVED) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handler[1](this._value );
          }
  
          if (this._state === States.REJECTED) {
            handler[2](this._value);
          }
  
          handler[0] = true;
        });
      };}
    }
  
    /**
     * Creates an new PromiseBuffer object with the specified limit
     * @param limit max number of promises that can be stored in the buffer
     */
    function makePromiseBuffer(limit) {
      const buffer = [];
  
      function isReady() {
        return limit === undefined || buffer.length < limit;
      }
  
      /**
       * Remove a promise from the queue.
       *
       * @param task Can be any PromiseLike<T>
       * @returns Removed promise.
       */
      function remove(task) {
        return buffer.splice(buffer.indexOf(task), 1)[0];
      }
  
      /**
       * Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
       *
       * @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
       *        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
       *        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
       *        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
       *        limit check.
       * @returns The original promise.
       */
      function add(taskProducer) {
        if (!isReady()) {
          return rejectedSyncPromise(new SentryError('Not adding Promise because buffer limit was reached.'));
        }
  
        // start the task and add its promise to the queue
        const task = taskProducer();
        if (buffer.indexOf(task) === -1) {
          buffer.push(task);
        }
        void task
          .then(() => remove(task))
          // Use `then(null, rejectionHandler)` rather than `catch(rejectionHandler)` so that we can use `PromiseLike`
          // rather than `Promise`. `PromiseLike` doesn't have a `.catch` method, making its polyfill smaller. (ES5 didn't
          // have promises, so TS has to polyfill when down-compiling.)
          .then(null, () =>
            remove(task).then(null, () => {
              // We have to add another catch here because `remove()` starts a new promise chain.
            }),
          );
        return task;
      }
  
      /**
       * Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
       *
       * @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
       * not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
       * `true`.
       * @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
       * `false` otherwise
       */
      function drain(timeout) {
        return new SyncPromise((resolve, reject) => {
          let counter = buffer.length;
  
          if (!counter) {
            return resolve(true);
          }
  
          // wait for `timeout` ms and then resolve to `false` (if not cancelled first)
          const capturedSetTimeout = setTimeout(() => {
            if (timeout && timeout > 0) {
              resolve(false);
            }
          }, timeout);
  
          // if all promises resolve in time, cancel the timer and resolve to `true`
          buffer.forEach(item => {
            void resolvedSyncPromise(item).then(() => {
              if (!--counter) {
                clearTimeout(capturedSetTimeout);
                resolve(true);
              }
            }, reject);
          });
        });
      }
  
      return {
        $: buffer,
        add,
        drain,
      };
    }
  
    /**
     * Parses string form of URL into an object
     * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
     * // intentionally using regex and not <a/> href parsing trick because React Native and other
     * // environments where DOM might not be available
     * @returns parsed URL object
     */
    function parseUrl(url) {
      if (!url) {
        return {};
      }
  
      const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  
      if (!match) {
        return {};
      }
  
      // coerce to undefined values to empty string so we don't get 'undefined'
      const query = match[6] || '';
      const fragment = match[8] || '';
      return {
        host: match[4],
        path: match[5],
        protocol: match[2],
        search: query,
        hash: fragment,
        relative: match[5] + query + fragment, // everything minus origin
      };
    }
  
    // Note: Ideally the `SeverityLevel` type would be derived from `validSeverityLevels`, but that would mean either
    //
    // a) moving `validSeverityLevels` to `@sentry/types`,
    // b) moving the`SeverityLevel` type here, or
    // c) importing `validSeverityLevels` from here into `@sentry/types`.
    //
    // Option A would make `@sentry/types` a runtime dependency of `@sentry/utils` (not good), and options B and C would
    // create a circular dependency between `@sentry/types` and `@sentry/utils` (also not good). So a TODO accompanying the
    // type, reminding anyone who changes it to change this list also, will have to do.
  
    const validSeverityLevels = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];
  
    /**
     * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
     *
     * @param level String representation of desired `SeverityLevel`.
     * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
     */
    function severityLevelFromString(level) {
      return (level === 'warn' ? 'warning' : validSeverityLevels.includes(level) ? level : 'log') ;
    }
  
    const ONE_SECOND_IN_MS = 1000;
  
    /**
     * A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
     * for accessing a high-resolution monotonic clock.
     */
  
    /**
     * Returns a timestamp in seconds since the UNIX epoch using the Date API.
     *
     * TODO(v8): Return type should be rounded.
     */
    function dateTimestampInSeconds() {
      return Date.now() / ONE_SECOND_IN_MS;
    }
  
    /**
     * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
     * support the API.
     *
     * Wrapping the native API works around differences in behavior from different browsers.
     */
    function createUnixTimestampInSecondsFunc() {
      const { performance } = GLOBAL_OBJ ;
      if (!performance || !performance.now) {
        return dateTimestampInSeconds;
      }
  
      // Some browser and environments don't have a timeOrigin, so we fallback to
      // using Date.now() to compute the starting time.
      const approxStartingTimeOrigin = Date.now() - performance.now();
      const timeOrigin = performance.timeOrigin == undefined ? approxStartingTimeOrigin : performance.timeOrigin;
  
      // performance.now() is a monotonic clock, which means it starts at 0 when the process begins. To get the current
      // wall clock time (actual UNIX timestamp), we need to add the starting time origin and the current time elapsed.
      //
      // TODO: This does not account for the case where the monotonic clock that powers performance.now() drifts from the
      // wall clock time, which causes the returned timestamp to be inaccurate. We should investigate how to detect and
      // correct for this.
      // See: https://github.com/getsentry/sentry-javascript/issues/2590
      // See: https://github.com/mdn/content/issues/4713
      // See: https://dev.to/noamr/when-a-millisecond-is-not-a-millisecond-3h6
      return () => {
        return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
      };
    }
  
    /**
     * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
     * availability of the Performance API.
     *
     * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
     * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
     * skew can grow to arbitrary amounts like days, weeks or months.
     * See https://github.com/getsentry/sentry-javascript/issues/2590.
     */
    const timestampInSeconds = createUnixTimestampInSecondsFunc();
  
    /**
     * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
     * performance API is available.
     */
    const browserPerformanceTimeOrigin = (() => {
      // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
      // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
      // data as reliable if they are within a reasonable threshold of the current time.
  
      const { performance } = GLOBAL_OBJ ;
      if (!performance || !performance.now) {
        return undefined;
      }
  
      const threshold = 3600 * 1000;
      const performanceNow = performance.now();
      const dateNow = Date.now();
  
      // if timeOrigin isn't available set delta to threshold so it isn't used
      const timeOriginDelta = performance.timeOrigin
        ? Math.abs(performance.timeOrigin + performanceNow - dateNow)
        : threshold;
      const timeOriginIsReliable = timeOriginDelta < threshold;
  
      // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
      // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
      // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
      // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
      // Date API.
      // eslint-disable-next-line deprecation/deprecation
      const navigationStart = performance.timing && performance.timing.navigationStart;
      const hasNavigationStart = typeof navigationStart === 'number';
      // if navigationStart isn't available set delta to threshold so it isn't used
      const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
      const navigationStartIsReliable = navigationStartDelta < threshold;
  
      if (timeOriginIsReliable || navigationStartIsReliable) {
        // Use the more reliable time origin
        if (timeOriginDelta <= navigationStartDelta) {
          return performance.timeOrigin;
        } else {
          return navigationStart;
        }
      }
      return dateNow;
    })();
  
    const BAGGAGE_HEADER_NAME = 'baggage';
  
    const SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
  
    const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
  
    /**
     * Max length of a serialized baggage string
     *
     * https://www.w3.org/TR/baggage/#limits
     */
    const MAX_BAGGAGE_STRING_LENGTH = 8192;
  
    /**
     * Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
     * from it.
     *
     * @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
     * @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
     */
    function baggageHeaderToDynamicSamplingContext(
      // Very liberal definition of what any incoming header might look like
      baggageHeader,
    ) {
      if (!isString(baggageHeader) && !Array.isArray(baggageHeader)) {
        return undefined;
      }
  
      // Intermediary object to store baggage key value pairs of incoming baggage headers on.
      // It is later used to read Sentry-DSC-values from.
      let baggageObject = {};
  
      if (Array.isArray(baggageHeader)) {
        // Combine all baggage headers into one object containing the baggage values so we can later read the Sentry-DSC-values from it
        baggageObject = baggageHeader.reduce((acc, curr) => {
          const currBaggageObject = baggageHeaderToObject(curr);
          for (const key of Object.keys(currBaggageObject)) {
            acc[key] = currBaggageObject[key];
          }
          return acc;
        }, {});
      } else {
        // Return undefined if baggage header is an empty string (technically an empty baggage header is not spec conform but
        // this is how we choose to handle it)
        if (!baggageHeader) {
          return undefined;
        }
  
        baggageObject = baggageHeaderToObject(baggageHeader);
      }
  
      // Read all "sentry-" prefixed values out of the baggage object and put it onto a dynamic sampling context object.
      const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
        if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
          const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
          acc[nonPrefixedKey] = value;
        }
        return acc;
      }, {});
  
      // Only return a dynamic sampling context object if there are keys in it.
      // A keyless object means there were no sentry values on the header, which means that there is no DSC.
      if (Object.keys(dynamicSamplingContext).length > 0) {
        return dynamicSamplingContext ;
      } else {
        return undefined;
      }
    }
  
    /**
     * Turns a Dynamic Sampling Object into a baggage header by prefixing all the keys on the object with "sentry-".
     *
     * @param dynamicSamplingContext The Dynamic Sampling Context to turn into a header. For convenience and compatibility
     * with the `getDynamicSamplingContext` method on the Transaction class ,this argument can also be `undefined`. If it is
     * `undefined` the function will return `undefined`.
     * @returns a baggage header, created from `dynamicSamplingContext`, or `undefined` either if `dynamicSamplingContext`
     * was `undefined`, or if `dynamicSamplingContext` didn't contain any values.
     */
    function dynamicSamplingContextToSentryBaggageHeader(
      // this also takes undefined for convenience and bundle size in other places
      dynamicSamplingContext,
    ) {
      if (!dynamicSamplingContext) {
        return undefined;
      }
  
      // Prefix all DSC keys with "sentry-" and put them into a new object
      const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce(
        (acc, [dscKey, dscValue]) => {
          if (dscValue) {
            acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
          }
          return acc;
        },
        {},
      );
  
      return objectToBaggageHeader(sentryPrefixedDSC);
    }
  
    /**
     * Will parse a baggage header, which is a simple key-value map, into a flat object.
     *
     * @param baggageHeader The baggage header to parse.
     * @returns a flat object containing all the key-value pairs from `baggageHeader`.
     */
    function baggageHeaderToObject(baggageHeader) {
      return baggageHeader
        .split(',')
        .map(baggageEntry => baggageEntry.split('=').map(keyOrValue => decodeURIComponent(keyOrValue.trim())))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }
  
    /**
     * Turns a flat object (key-value pairs) into a baggage header, which is also just key-value pairs.
     *
     * @param object The object to turn into a baggage header.
     * @returns a baggage header string, or `undefined` if the object didn't have any values, since an empty baggage header
     * is not spec compliant.
     */
    function objectToBaggageHeader(object) {
      if (Object.keys(object).length === 0) {
        // An empty baggage header is not spec compliant: We return undefined.
        return undefined;
      }
  
      return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
        const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
        const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
        if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
          logger.warn(
              `Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`,
            );
          return baggageHeader;
        } else {
          return newBaggageHeader;
        }
      }, '');
    }
  
    // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- RegExp is used for readability here
    const TRACEPARENT_REGEXP = new RegExp(
      '^[ \\t]*' + // whitespace
        '([0-9a-f]{32})?' + // trace_id
        '-?([0-9a-f]{16})?' + // span_id
        '-?([01])?' + // sampled
        '[ \\t]*$', // whitespace
    );
  
    /**
     * Extract transaction context data from a `sentry-trace` header.
     *
     * @param traceparent Traceparent string
     *
     * @returns Object containing data from the header, or undefined if traceparent string is malformed
     */
    function extractTraceparentData(traceparent) {
      if (!traceparent) {
        return undefined;
      }
  
      const matches = traceparent.match(TRACEPARENT_REGEXP);
      if (!matches) {
        return undefined;
      }
  
      let parentSampled;
      if (matches[3] === '1') {
        parentSampled = true;
      } else if (matches[3] === '0') {
        parentSampled = false;
      }
  
      return {
        traceId: matches[1],
        parentSampled,
        parentSpanId: matches[2],
      };
    }
  
    /**
     * Create tracing context from incoming headers.
     *
     * @deprecated Use `propagationContextFromHeaders` instead.
     */
    // TODO(v8): Remove this function
    function tracingContextFromHeaders(
      sentryTrace,
      baggage,
    )
  
     {
      const traceparentData = extractTraceparentData(sentryTrace);
      const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
  
      const { traceId, parentSpanId, parentSampled } = traceparentData || {};
  
      if (!traceparentData) {
        return {
          traceparentData,
          dynamicSamplingContext: undefined,
          propagationContext: {
            traceId: traceId || uuid4(),
            spanId: uuid4().substring(16),
          },
        };
      } else {
        return {
          traceparentData,
          dynamicSamplingContext: dynamicSamplingContext || {}, // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
          propagationContext: {
            traceId: traceId || uuid4(),
            parentSpanId: parentSpanId || uuid4().substring(16),
            spanId: uuid4().substring(16),
            sampled: parentSampled,
            dsc: dynamicSamplingContext || {}, // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
          },
        };
      }
    }
  
    /**
     * Create a propagation context from incoming headers.
     */
    function propagationContextFromHeaders(
      sentryTrace,
      baggage,
    ) {
      const traceparentData = extractTraceparentData(sentryTrace);
      const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
  
      const { traceId, parentSpanId, parentSampled } = traceparentData || {};
  
      if (!traceparentData) {
        return {
          traceId: traceId || uuid4(),
          spanId: uuid4().substring(16),
        };
      } else {
        return {
          traceId: traceId || uuid4(),
          parentSpanId: parentSpanId || uuid4().substring(16),
          spanId: uuid4().substring(16),
          sampled: parentSampled,
          dsc: dynamicSamplingContext || {}, // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
        };
      }
    }
  
    /**
     * Create sentry-trace header from span context values.
     */
    function generateSentryTraceHeader(
      traceId = uuid4(),
      spanId = uuid4().substring(16),
      sampled,
    ) {
      let sampledString = '';
      if (sampled !== undefined) {
        sampledString = sampled ? '-1' : '-0';
      }
      return `${traceId}-${spanId}${sampledString}`;
    }
  
    /**
     * Creates an envelope.
     * Make sure to always explicitly provide the generic to this function
     * so that the envelope types resolve correctly.
     */
    function createEnvelope(headers, items = []) {
      return [headers, items] ;
    }
  
    /**
     * Add an item to an envelope.
     * Make sure to always explicitly provide the generic to this function
     * so that the envelope types resolve correctly.
     */
    function addItemToEnvelope(envelope, newItem) {
      const [headers, items] = envelope;
      return [headers, [...items, newItem]] ;
    }
  
    /**
     * Convenience function to loop through the items and item types of an envelope.
     * (This function was mostly created because working with envelope types is painful at the moment)
     *
     * If the callback returns true, the rest of the items will be skipped.
     */
    function forEachEnvelopeItem(
      envelope,
      callback,
    ) {
      const envelopeItems = envelope[1];
  
      for (const envelopeItem of envelopeItems) {
        const envelopeItemType = envelopeItem[0].type;
        const result = callback(envelopeItem, envelopeItemType);
  
        if (result) {
          return true;
        }
      }
  
      return false;
    }
  
    /**
     * Encode a string to UTF8.
     */
    function encodeUTF8(input, textEncoder) {
      const utf8 = textEncoder || new TextEncoder();
      return utf8.encode(input);
    }
  
    /**
     * Serializes an envelope.
     */
    function serializeEnvelope(envelope, textEncoder) {
      const [envHeaders, items] = envelope;
  
      // Initially we construct our envelope as a string and only convert to binary chunks if we encounter binary data
      let parts = JSON.stringify(envHeaders);
  
      function append(next) {
        if (typeof parts === 'string') {
          parts = typeof next === 'string' ? parts + next : [encodeUTF8(parts, textEncoder), next];
        } else {
          parts.push(typeof next === 'string' ? encodeUTF8(next, textEncoder) : next);
        }
      }
  
      for (const item of items) {
        const [itemHeaders, payload] = item;
  
        append(`\n${JSON.stringify(itemHeaders)}\n`);
  
        if (typeof payload === 'string' || payload instanceof Uint8Array) {
          append(payload);
        } else {
          let stringifiedPayload;
          try {
            stringifiedPayload = JSON.stringify(payload);
          } catch (e) {
            // In case, despite all our efforts to keep `payload` circular-dependency-free, `JSON.strinify()` still
            // fails, we try again after normalizing it again with infinite normalization depth. This of course has a
            // performance impact but in this case a performance hit is better than throwing.
            stringifiedPayload = JSON.stringify(normalize(payload));
          }
          append(stringifiedPayload);
        }
      }
  
      return typeof parts === 'string' ? parts : concatBuffers(parts);
    }
  
    function concatBuffers(buffers) {
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of buffers) {
        merged.set(buffer, offset);
        offset += buffer.length;
      }
  
      return merged;
    }
  
    /**
     * Creates attachment envelope items
     */
    function createAttachmentEnvelopeItem(
      attachment,
      textEncoder,
    ) {
      const buffer = typeof attachment.data === 'string' ? encodeUTF8(attachment.data, textEncoder) : attachment.data;
  
      return [
        dropUndefinedKeys({
          type: 'attachment',
          length: buffer.length,
          filename: attachment.filename,
          content_type: attachment.contentType,
          attachment_type: attachment.attachmentType,
        }),
        buffer,
      ];
    }
  
    const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
      session: 'session',
      sessions: 'session',
      attachment: 'attachment',
      transaction: 'transaction',
      event: 'error',
      client_report: 'internal',
      user_report: 'default',
      profile: 'profile',
      replay_event: 'replay',
      replay_recording: 'replay',
      check_in: 'monitor',
      feedback: 'feedback',
      // TODO: This is a temporary workaround until we have a proper data category for metrics
      statsd: 'unknown',
    };
  
    /**
     * Maps the type of an envelope item to a data category.
     */
    function envelopeItemTypeToDataCategory(type) {
      return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
    }
  
    /** Extracts the minimal SDK info from from the metadata or an events */
    function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
      if (!metadataOrEvent || !metadataOrEvent.sdk) {
        return;
      }
      const { name, version } = metadataOrEvent.sdk;
      return { name, version };
    }
  
    /**
     * Creates event envelope headers, based on event, sdk info and tunnel
     * Note: This function was extracted from the core package to make it available in Replay
     */
    function createEventEnvelopeHeaders(
      event,
      sdkInfo,
      tunnel,
      dsn,
    ) {
      const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
      return {
        event_id: event.event_id ,
        sent_at: new Date().toISOString(),
        ...(sdkInfo && { sdk: sdkInfo }),
        ...(!!tunnel && dsn && { dsn: dsnToString(dsn) }),
        ...(dynamicSamplingContext && {
          trace: dropUndefinedKeys({ ...dynamicSamplingContext }),
        }),
      };
    }
  
    /**
     * Creates client report envelope
     * @param discarded_events An array of discard events
     * @param dsn A DSN that can be set on the header. Optional.
     */
    function createClientReportEnvelope(
      discarded_events,
      dsn,
      timestamp,
    ) {
      const clientReportItem = [
        { type: 'client_report' },
        {
          timestamp: timestamp || dateTimestampInSeconds(),
          discarded_events,
        },
      ];
      return createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
    }
  
    // Intentionally keeping the key broad, as we don't know for sure what rate limit headers get returned from backend
  
    const DEFAULT_RETRY_AFTER = 60 * 1000; // 60 seconds
  
    /**
     * Extracts Retry-After value from the request header or returns default value
     * @param header string representation of 'Retry-After' header
     * @param now current unix timestamp
     *
     */
    function parseRetryAfterHeader(header, now = Date.now()) {
      const headerDelay = parseInt(`${header}`, 10);
      if (!isNaN(headerDelay)) {
        return headerDelay * 1000;
      }
  
      const headerDate = Date.parse(`${header}`);
      if (!isNaN(headerDate)) {
        return headerDate - now;
      }
  
      return DEFAULT_RETRY_AFTER;
    }
  
    /**
     * Gets the time that the given category is disabled until for rate limiting.
     * In case no category-specific limit is set but a general rate limit across all categories is active,
     * that time is returned.
     *
     * @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
     */
    function disabledUntil(limits, category) {
      return limits[category] || limits.all || 0;
    }
  
    /**
     * Checks if a category is rate limited
     */
    function isRateLimited(limits, category, now = Date.now()) {
      return disabledUntil(limits, category) > now;
    }
  
    /**
     * Update ratelimits from incoming headers.
     *
     * @return the updated RateLimits object.
     */
    function updateRateLimits(
      limits,
      { statusCode, headers },
      now = Date.now(),
    ) {
      const updatedRateLimits = {
        ...limits,
      };
  
      // "The name is case-insensitive."
      // https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
      const rateLimitHeader = headers && headers['x-sentry-rate-limits'];
      const retryAfterHeader = headers && headers['retry-after'];
  
      if (rateLimitHeader) {
        /**
         * rate limit headers are of the form
         *     <header>,<header>,..
         * where each <header> is of the form
         *     <retry_after>: <categories>: <scope>: <reason_code>
         * where
         *     <retry_after> is a delay in seconds
         *     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
         *         <category>;<category>;...
         *     <scope> is what's being limited (org, project, or key) - ignored by SDK
         *     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
         */
        for (const limit of rateLimitHeader.trim().split(',')) {
          const [retryAfter, categories] = limit.split(':', 2);
          const headerDelay = parseInt(retryAfter, 10);
          const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000; // 60sec default
          if (!categories) {
            updatedRateLimits.all = now + delay;
          } else {
            for (const category of categories.split(';')) {
              updatedRateLimits[category] = now + delay;
            }
          }
        }
      } else if (retryAfterHeader) {
        updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
      } else if (statusCode === 429) {
        updatedRateLimits.all = now + 60 * 1000;
      }
  
      return updatedRateLimits;
    }
  
    /**
     * Extracts stack frames from the error.stack string
     */
    function parseStackFrames$1(stackParser, error) {
    
      const res = stackParser(error.stack || '', 1);
      
      return res;
    }
  
    /**
     * Extracts stack frames from the error and builds a Sentry Exception
     */
    function exceptionFromError$1(stackParser, error) {
      const exception = {
        type: error.name || error.constructor.name,
        value: error.message,
      };
  
      const frames = parseStackFrames$1(stackParser, error);
      if (frames.length) {
        exception.stacktrace = { frames };
      }
  
      return exception;
    }
  
    /**
     * This is a shim for the Feedback integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove feedback
     * from it, without changing their config. This is necessary for the loader mechanism.
     *
     * @deprecated Use `feedbackIntegration()` instead.
     */
    class FeedbackShim  {
      /**
       * @inheritDoc
       */
       static __initStatic() {this.id = 'Feedback';}
  
      /**
       * @inheritDoc
       */
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       constructor(_options) {
        // eslint-disable-next-line deprecation/deprecation
        this.name = FeedbackShim.id;
  
        consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.warn('You are using new Feedback() even though this bundle does not include Feedback.');
        });
      }
  
      /** jsdoc */
       setupOnce() {
        // noop
      }
  
      /** jsdoc */
       openDialog() {
        // noop
      }
  
      /** jsdoc */
       closeDialog() {
        // noop
      }
  
      /** jsdoc */
       attachTo() {
        // noop
      }
  
      /** jsdoc */
       createWidget() {
        // noop
      }
  
      /** jsdoc */
       removeWidget() {
        // noop
      }
  
      /** jsdoc */
       getWidget() {
        // noop
      }
      /** jsdoc */
       remove() {
        // noop
      }
    } FeedbackShim.__initStatic();
  
    /**
     * This is a shim for the Feedback integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove feedback
     * from it, without changing their config. This is necessary for the loader mechanism.
     */
    function feedbackIntegration(_options) {
      // eslint-disable-next-line deprecation/deprecation
      return new FeedbackShim({});
    }
  
    /**
     * This is a shim for the Replay integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove replay
     * from it, without changing their config. This is necessary for the loader mechanism.
     *
     * @deprecated Use `replayIntegration()` instead.
     */
    class ReplayShim  {
      /**
       * @inheritDoc
       */
       static __initStatic() {this.id = 'Replay';}
  
      /**
       * @inheritDoc
       */
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       constructor(_options) {
        // eslint-disable-next-line deprecation/deprecation
        this.name = ReplayShim.id;
  
        consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.warn('You are using new Replay() even though this bundle does not include replay.');
        });
      }
  
      /** jsdoc */
       setupOnce() {
        // noop
      }
  
      /** jsdoc */
       start() {
        // noop
      }
  
      /** jsdoc */
       stop() {
        // noop
      }
  
      /** jsdoc */
       flush() {
        // noop
      }
    } ReplayShim.__initStatic();
  
    /**
     * This is a shim for the Replay integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove replay
     * from it, without changing their config. This is necessary for the loader mechanism.
     */
    function replayIntegration(_options) {
      // eslint-disable-next-line deprecation/deprecation
      return new ReplayShim({});
    }
  
    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    const DEBUG_BUILD$2 = (true);
  
    const DEFAULT_ENVIRONMENT = 'production';
  
    /**
     * Returns the global event processors.
     * @deprecated Global event processors will be removed in v8.
     */
    function getGlobalEventProcessors() {
      return getGlobalSingleton('globalEventProcessors', () => []);
    }
  
    /**
     * Add a EventProcessor to be kept globally.
     * @deprecated Use `addEventProcessor` instead. Global event processors will be removed in v8.
     */
    function addGlobalEventProcessor(callback) {
      // eslint-disable-next-line deprecation/deprecation
      getGlobalEventProcessors().push(callback);
    }
  
    /**
     * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
     */
    function notifyEventProcessors(
      processors,
      event,
      hint,
      index = 0,
    ) {
      return new SyncPromise((resolve, reject) => {
        const processor = processors[index];
        if (event === null || typeof processor !== 'function') {
          resolve(event);
        } else {
          const result = processor({ ...event }, hint) ;
  
          processor.id && result === null && logger.log(`Event processor "${processor.id}" dropped event`);
  
          if (isThenable(result)) {
            void result
              .then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve))
              .then(null, reject);
          } else {
            void notifyEventProcessors(processors, result, hint, index + 1)
              .then(resolve)
              .then(null, reject);
          }
        }
      });
    }
  
    /**
     * Creates a new `Session` object by setting certain default parameters. If optional @param context
     * is passed, the passed properties are applied to the session object.
     *
     * @param context (optional) additional properties to be applied to the returned session object
     *
     * @returns a new `Session` object
     */
    function makeSession(context) {
      // Both timestamp and started are in seconds since the UNIX epoch.
      const startingTime = timestampInSeconds();
  
      const session = {
        sid: uuid4(),
        init: true,
        timestamp: startingTime,
        started: startingTime,
        duration: 0,
        status: 'ok',
        errors: 0,
        ignoreDuration: false,
        toJSON: () => sessionToJSON(session),
      };
  
      if (context) {
        updateSession(session, context);
      }
  
      return session;
    }
  
    /**
     * Updates a session object with the properties passed in the context.
     *
     * Note that this function mutates the passed object and returns void.
     * (Had to do this instead of returning a new and updated session because closing and sending a session
     * makes an update to the session after it was passed to the sending logic.
     * @see BaseClient.captureSession )
     *
     * @param session the `Session` to update
     * @param context the `SessionContext` holding the properties that should be updated in @param session
     */
    // eslint-disable-next-line complexity
    function updateSession(session, context = {}) {
      if (context.user) {
        if (!session.ipAddress && context.user.ip_address) {
          session.ipAddress = context.user.ip_address;
        }
  
        if (!session.did && !context.did) {
          session.did = context.user.id || context.user.email || context.user.username;
        }
      }
  
      session.timestamp = context.timestamp || timestampInSeconds();
  
      if (context.abnormal_mechanism) {
        session.abnormal_mechanism = context.abnormal_mechanism;
      }
  
      if (context.ignoreDuration) {
        session.ignoreDuration = context.ignoreDuration;
      }
      if (context.sid) {
        // Good enough uuid validation. — Kamil
        session.sid = context.sid.length === 32 ? context.sid : uuid4();
      }
      if (context.init !== undefined) {
        session.init = context.init;
      }
      if (!session.did && context.did) {
        session.did = `${context.did}`;
      }
      if (typeof context.started === 'number') {
        session.started = context.started;
      }
      if (session.ignoreDuration) {
        session.duration = undefined;
      } else if (typeof context.duration === 'number') {
        session.duration = context.duration;
      } else {
        const duration = session.timestamp - session.started;
        session.duration = duration >= 0 ? duration : 0;
      }
      if (context.release) {
        session.release = context.release;
      }
      if (context.environment) {
        session.environment = context.environment;
      }
      if (!session.ipAddress && context.ipAddress) {
        session.ipAddress = context.ipAddress;
      }
      if (!session.userAgent && context.userAgent) {
        session.userAgent = context.userAgent;
      }
      if (typeof context.errors === 'number') {
        session.errors = context.errors;
      }
      if (context.status) {
        session.status = context.status;
      }
    }
  
    /**
     * Closes a session by setting its status and updating the session object with it.
     * Internally calls `updateSession` to update the passed session object.
     *
     * Note that this function mutates the passed session (@see updateSession for explanation).
     *
     * @param session the `Session` object to be closed
     * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
     *               this function will keep the previously set status, unless it was `'ok'` in which case
     *               it is changed to `'exited'`.
     */
    function closeSession(session, status) {
      let context = {};
      if (status) {
        context = { status };
      } else if (session.status === 'ok') {
        context = { status: 'exited' };
      }
  
      updateSession(session, context);
    }
  
    /**
     * Serializes a passed session object to a JSON object with a slightly different structure.
     * This is necessary because the Sentry backend requires a slightly different schema of a session
     * than the one the JS SDKs use internally.
     *
     * @param session the session to be converted
     *
     * @returns a JSON object of the passed session
     */
    function sessionToJSON(session) {
      return dropUndefinedKeys({
        sid: `${session.sid}`,
        init: session.init,
        // Make sure that sec is converted to ms for date constructor
        started: new Date(session.started * 1000).toISOString(),
        timestamp: new Date(session.timestamp * 1000).toISOString(),
        status: session.status,
        errors: session.errors,
        did: typeof session.did === 'number' || typeof session.did === 'string' ? `${session.did}` : undefined,
        duration: session.duration,
        abnormal_mechanism: session.abnormal_mechanism,
        attrs: {
          release: session.release,
          environment: session.environment,
          ip_address: session.ipAddress,
          user_agent: session.userAgent,
        },
      });
    }
  
    // These are aligned with OpenTelemetry trace flags
    const TRACE_FLAG_NONE = 0x0;
    const TRACE_FLAG_SAMPLED = 0x1;
  
    /**
     * Convert a span to a trace context, which can be sent as the `trace` context in an event.
     */
    function spanToTraceContext(span) {
      const { spanId: span_id, traceId: trace_id } = span.spanContext();
      const { data, op, parent_span_id, status, tags, origin } = spanToJSON(span);
  
      return dropUndefinedKeys({
        data,
        op,
        parent_span_id,
        span_id,
        status,
        tags,
        trace_id,
        origin,
      });
    }
  
    /**
     * Convert a Span to a Sentry trace header.
     */
    function spanToTraceHeader(span) {
      const { traceId, spanId } = span.spanContext();
      const sampled = spanIsSampled(span);
      return generateSentryTraceHeader(traceId, spanId, sampled);
    }
  
    /**
     * Convert a span time input intp a timestamp in seconds.
     */
    function spanTimeInputToSeconds(input) {
      if (typeof input === 'number') {
        return ensureTimestampInSeconds(input);
      }
  
      if (Array.isArray(input)) {
        // See {@link HrTime} for the array-based time format
        return input[0] + input[1] / 1e9;
      }
  
      if (input instanceof Date) {
        return ensureTimestampInSeconds(input.getTime());
      }
  
      return timestampInSeconds();
    }
  
    /**
     * Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
     */
    function ensureTimestampInSeconds(timestamp) {
      const isMs = timestamp > 9999999999;
      return isMs ? timestamp / 1000 : timestamp;
    }
  
    /**
     * Convert a span to a JSON representation.
     * Note that all fields returned here are optional and need to be guarded against.
     *
     * Note: Because of this, we currently have a circular type dependency (which we opted out of in package.json).
     * This is not avoidable as we need `spanToJSON` in `spanUtils.ts`, which in turn is needed by `span.ts` for backwards compatibility.
     * And `spanToJSON` needs the Span class from `span.ts` to check here.
     * TODO v8: When we remove the deprecated stuff from `span.ts`, we can remove the circular dependency again.
     */
    function spanToJSON(span) {
      if (spanIsSpanClass(span)) {
        return span.getSpanJSON();
      }
  
      // Fallback: We also check for `.toJSON()` here...
      // eslint-disable-next-line deprecation/deprecation
      if (typeof span.toJSON === 'function') {
        // eslint-disable-next-line deprecation/deprecation
        return span.toJSON();
      }
  
      return {};
    }
  
    /**
     * Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
     * :( So instead we approximate this by checking if it has the `getSpanJSON` method.
     */
    function spanIsSpanClass(span) {
      return typeof (span ).getSpanJSON === 'function';
    }
  
    /**
     * Returns true if a span is sampled.
     * In most cases, you should just use `span.isRecording()` instead.
     * However, this has a slightly different semantic, as it also returns false if the span is finished.
     * So in the case where this distinction is important, use this method.
     */
    function spanIsSampled(span) {
      // We align our trace flags with the ones OpenTelemetry use
      // So we also check for sampled the same way they do.
      const { traceFlags } = span.spanContext();
      // eslint-disable-next-line no-bitwise
      return Boolean(traceFlags & TRACE_FLAG_SAMPLED);
    }
  
    /**
     * This type makes sure that we get either a CaptureContext, OR an EventHint.
     * It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
     * { user: { id: '123' }, mechanism: { handled: false } }
     */
  
    /**
     * Adds common information to events.
     *
     * The information includes release and environment from `options`,
     * breadcrumbs and context (extra, tags and user) from the scope.
     *
     * Information that is already present in the event is never overwritten. For
     * nested objects, such as the context, keys are merged.
     *
     * Note: This also triggers callbacks for `addGlobalEventProcessor`, but not `beforeSend`.
     *
     * @param event The original event.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A new event with more information.
     * @hidden
     */
    function prepareEvent(
      options,
      event,
      hint,
      scope,
      client,
      isolationScope,
    ) {
      const { normalizeDepth = 3, normalizeMaxBreadth = 1000 } = options;
      const prepared = {
        ...event,
        event_id: event.event_id || hint.event_id || uuid4(),
        timestamp: event.timestamp || dateTimestampInSeconds(),
      };

    //   console.log('prepareEventprepareEventprepareEvent:', event);

      const integrations = hint.integrations || options.integrations.map(i => i.name);

    //   console.log('integrationsintegrationsintegrations:', integrations);
  
      applyClientOptions(prepared, options);
      applyIntegrationsMetadata(prepared, integrations);

      console.log('prepared111111:::', prepared);
  
      // Only put debug IDs onto frames for error events.
      if (event.type === undefined) {
        applyDebugIds(prepared, options.stackParser);
      }
      console.log('prepared222222:::', prepared);
      // If we have scope given to us, use it as the base for further modifications.
      // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
      const finalScope = getFinalScope(scope, hint.captureContext);
  
      if (hint.mechanism) {
        addExceptionMechanism(prepared, hint.mechanism);
      }

      console.log('prepared3333333:::', prepared);
  
      const clientEventProcessors = client && client.getEventProcessors ? client.getEventProcessors() : [];
  
      // This should be the last thing called, since we want that
      // {@link Hub.addEventProcessor} gets the finished prepared event.
      // Merge scope data together
      const data = getGlobalScope().getScopeData();
  
      if (isolationScope) {
        const isolationData = isolationScope.getScopeData();
        mergeScopeData(data, isolationData);
      }
  
      if (finalScope) {
        const finalScopeData = finalScope.getScopeData();
        mergeScopeData(data, finalScopeData);
      }
  
      const attachments = [...(hint.attachments || []), ...data.attachments];
      if (attachments.length) {
        hint.attachments = attachments;
      }
  
      applyScopeDataToEvent(prepared, data);

      console.log('prepared4444444:::', prepared);
  
  
      // TODO (v8): Update this order to be: Global > Client > Scope
      const eventProcessors = [
        ...clientEventProcessors,
        // eslint-disable-next-line deprecation/deprecation
        ...getGlobalEventProcessors(),
        // Run scope event processors _after_ all other processors
        ...data.eventProcessors,
      ];
  
      const result = notifyEventProcessors(eventProcessors, prepared, hint);
      console.log('prepared555555:::', prepared);
      return result.then(evt => {
        if (evt) {
            console.log('prepare6666666:::', evt);
          // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
          // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
          // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
          // any new data
          applyDebugMeta(evt);
        }
  
        if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
          return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
        }
        return evt;
      });
    }
  
    /**
     *  Enhances event using the client configuration.
     *  It takes care of all "static" values like environment, release and `dist`,
     *  as well as truncating overly long values.
     * @param event event instance to be enhanced
     */
    function applyClientOptions(event, options) {
      const { environment, release, dist, maxValueLength = 250 } = options;
  
      if (!('environment' in event)) {
        event.environment = 'environment' in options ? environment : DEFAULT_ENVIRONMENT;
      }
  
      if (event.release === undefined && release !== undefined) {
        event.release = release;
      }
  
      if (event.dist === undefined && dist !== undefined) {
        event.dist = dist;
      }
  
      if (event.message) {
        event.message = truncate(event.message, maxValueLength);
      }
  
      const exception = event.exception && event.exception.values && event.exception.values[0];
      if (exception && exception.value) {
        exception.value = truncate(exception.value, maxValueLength);
      }
  
      const request = event.request;
      if (request && request.url) {
        request.url = truncate(request.url, maxValueLength);
      }
    }
  
    const debugIdStackParserCache = new WeakMap();
  
    /**
     * Puts debug IDs into the stack frames of an error event.
     */
    function applyDebugIds(event, stackParser) {
      const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
  
      if (!debugIdMap) {
        return;
      }
  
      let debugIdStackFramesCache;
      const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
      if (cachedDebugIdStackFrameCache) {
        debugIdStackFramesCache = cachedDebugIdStackFrameCache;
      } else {
        debugIdStackFramesCache = new Map();
        debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
      }
  
      // Build a map of filename -> debug_id
      const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
        let parsedStack;
        const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
        if (cachedParsedStack) {
          parsedStack = cachedParsedStack;
        } else {
            
          parsedStack = stackParser(debugIdStackTrace);
          debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
        }
  
        for (let i = parsedStack.length - 1; i >= 0; i--) {
          const stackFrame = parsedStack[i];
          if (stackFrame.filename) {
            acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
            break;
          }
        }
        return acc;
      }, {});
  
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        event.exception.values.forEach(exception => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          exception.stacktrace.frames.forEach(frame => {
            if (frame.filename) {
              frame.debug_id = filenameDebugIdMap[frame.filename];
            }
          });
        });
      } catch (e) {
        // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
      }
    }
  
    /**
     * Moves debug IDs from the stack frames of an error event into the debug_meta field.
     */
    function applyDebugMeta(event) {
      // Extract debug IDs and filenames from the stack frames on the event.
      const filenameDebugIdMap = {};
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        event.exception.values.forEach(exception => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          exception.stacktrace.frames.forEach(frame => {
            if (frame.debug_id) {
              if (frame.abs_path) {
                filenameDebugIdMap[frame.abs_path] = frame.debug_id;
              } else if (frame.filename) {
                filenameDebugIdMap[frame.filename] = frame.debug_id;
              }
              delete frame.debug_id;
            }
          });
        });
      } catch (e) {
        // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
      }
  
      if (Object.keys(filenameDebugIdMap).length === 0) {
        return;
      }
  
      // Fill debug_meta information
      event.debug_meta = event.debug_meta || {};
      event.debug_meta.images = event.debug_meta.images || [];
      const images = event.debug_meta.images;
      Object.keys(filenameDebugIdMap).forEach(filename => {
        images.push({
          type: 'sourcemap',
          code_file: filename,
          debug_id: filenameDebugIdMap[filename],
        });
      });
    }
  
    /**
     * This function adds all used integrations to the SDK info in the event.
     * @param event The event that will be filled with all integrations.
     */
    function applyIntegrationsMetadata(event, integrationNames) {
      if (integrationNames.length > 0) {
        event.sdk = event.sdk || {};
        event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames];
      }
    }
  
    /**
     * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
     * Normalized keys:
     * - `breadcrumbs.data`
     * - `user`
     * - `contexts`
     * - `extra`
     * @param event Event
     * @returns Normalized event
     */
    function normalizeEvent(event, depth, maxBreadth) {
      if (!event) {
        return null;
      }
  
      const normalized = {
        ...event,
        ...(event.breadcrumbs && {
          breadcrumbs: event.breadcrumbs.map(b => ({
            ...b,
            ...(b.data && {
              data: normalize(b.data, depth, maxBreadth),
            }),
          })),
        }),
        ...(event.user && {
          user: normalize(event.user, depth, maxBreadth),
        }),
        ...(event.contexts && {
          contexts: normalize(event.contexts, depth, maxBreadth),
        }),
        ...(event.extra && {
          extra: normalize(event.extra, depth, maxBreadth),
        }),
      };
  
      // event.contexts.trace stores information about a Transaction. Similarly,
      // event.spans[] stores information about child Spans. Given that a
      // Transaction is conceptually a Span, normalization should apply to both
      // Transactions and Spans consistently.
      // For now the decision is to skip normalization of Transactions and Spans,
      // so this block overwrites the normalized event to add back the original
      // Transaction information prior to normalization.
      if (event.contexts && event.contexts.trace && normalized.contexts) {
        normalized.contexts.trace = event.contexts.trace;
  
        // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
        if (event.contexts.trace.data) {
          normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
        }
      }
  
      // event.spans[].data may contain circular/dangerous data so we need to normalize it
      if (event.spans) {
        normalized.spans = event.spans.map(span => {
          const data = spanToJSON(span).data;
  
          if (data) {
            // This is a bit weird, as we generally have `Span` instances here, but to be safe we do not assume so
            // eslint-disable-next-line deprecation/deprecation
            span.data = normalize(data, depth, maxBreadth);
          }
  
          return span;
        });
      }
  
      return normalized;
    }
  
    function getFinalScope(scope, captureContext) {
      if (!captureContext) {
        return scope;
      }
  
      const finalScope = scope ? scope.clone() : new Scope();
      finalScope.update(captureContext);
      return finalScope;
    }
  
    /**
     * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
     * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
     */
    function parseEventHintOrCaptureContext(
      hint,
    ) {
      if (!hint) {
        return undefined;
      }
  
      // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
      if (hintIsScopeOrFunction(hint)) {
        return { captureContext: hint };
      }
  
      if (hintIsScopeContext(hint)) {
        return {
          captureContext: hint,
        };
      }
  
      return hint;
    }
  
    function hintIsScopeOrFunction(
      hint,
    ) {
      return hint instanceof Scope || typeof hint === 'function';
    }
  
    const captureContextKeys = [
      'user',
      'level',
      'extra',
      'contexts',
      'tags',
      'fingerprint',
      'requestSession',
      'propagationContext',
    ] ;
  
    function hintIsScopeContext(hint) {
      return Object.keys(hint).some(key => captureContextKeys.includes(key ));
    }
  
    /**
     * Captures an exception event and sends it to Sentry.
     *
     * @param exception The exception to capture.
     * @param hint Optional additional data to attach to the Sentry event.
     * @returns the id of the captured Sentry event.
     */
    function captureException(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exception,
      hint,
    ) {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().captureException(exception, parseEventHintOrCaptureContext(hint));
    }
  
    /**
     * Captures a message event and sends it to Sentry.
     *
     * @param exception The exception to capture.
     * @param captureContext Define the level of the message or pass in additional data to attach to the message.
     * @returns the id of the captured message.
     */
    function captureMessage(
      message,
      // eslint-disable-next-line deprecation/deprecation
      captureContext,
    ) {
      // This is necessary to provide explicit scopes upgrade, without changing the original
      // arity of the `captureMessage(message, level)` method.
      const level = typeof captureContext === 'string' ? captureContext : undefined;
      const context = typeof captureContext !== 'string' ? { captureContext } : undefined;
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().captureMessage(message, level, context);
    }
  
    /**
     * Captures a manually created event and sends it to Sentry.
     *
     * @param exception The event to send to Sentry.
     * @param hint Optional additional data to attach to the Sentry event.
     * @returns the id of the captured event.
     */
    function captureEvent(event, hint) {
        console.log('经过hub处理前的event', event);
    
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().captureEvent(event, hint);
    }
  
    /**
     * Callback to set context information onto the scope.
     * @param callback Callback function that receives Scope.
     *
     * @deprecated Use getCurrentScope() directly.
     */
    function configureScope(callback) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().configureScope(callback);
    }
  
    /**
     * Records a new breadcrumb which will be attached to future events.
     *
     * Breadcrumbs will be added to subsequent events to provide more context on
     * user's actions prior to an error or crash.
     *
     * @param breadcrumb The breadcrumb to record.
     */
    function addBreadcrumb(breadcrumb, hint) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().addBreadcrumb(breadcrumb, hint);
    }
  
    /**
     * Sets context data with the given name.
     * @param name of the context
     * @param context Any kind of data. This data will be normalized.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setContext(name, context) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setContext(name, context);
    }
  
    /**
     * Set an object that will be merged sent as extra data with the event.
     * @param extras Extras object to merge into current context.
     */
    function setExtras(extras) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setExtras(extras);
    }
  
    /**
     * Set key:value that will be sent as extra data with the event.
     * @param key String of extra
     * @param extra Any kind of data. This data will be normalized.
     */
    function setExtra(key, extra) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setExtra(key, extra);
    }
  
    /**
     * Set an object that will be merged sent as tags data with the event.
     * @param tags Tags context object to merge into current context.
     */
    function setTags(tags) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setTags(tags);
    }
  
    /**
     * Set key:value that will be sent as tags data with the event.
     *
     * Can also be used to unset a tag, by passing `undefined`.
     *
     * @param key String key of tag
     * @param value Value of tag
     */
    function setTag(key, value) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setTag(key, value);
    }
  
    /**
     * Updates user context information for future events.
     *
     * @param user User context object to be set in the current context. Pass `null` to unset the user.
     */
    function setUser(user) {
      // eslint-disable-next-line deprecation/deprecation
      getCurrentHub().setUser(user);
    }
  
    /**
     * Creates a new scope with and executes the given operation within.
     * The scope is automatically removed once the operation
     * finishes or throws.
     *
     * This is essentially a convenience function for:
     *
     *     pushScope();
     *     callback();
     *     popScope();
     */
  
    /**
     * Either creates a new active scope, or sets the given scope as active scope in the given callback.
     */
    function withScope(
      ...rest
    ) {
      // eslint-disable-next-line deprecation/deprecation
      const hub = getCurrentHub();
  
      // If a scope is defined, we want to make this the active scope instead of the default one
      if (rest.length === 2) {
        const [scope, callback] = rest;
        if (!scope) {
          // eslint-disable-next-line deprecation/deprecation
          return hub.withScope(callback);
        }
  
        // eslint-disable-next-line deprecation/deprecation
        return hub.withScope(() => {
          // eslint-disable-next-line deprecation/deprecation
          hub.getStackTop().scope = scope ;
          return callback(scope );
        });
      }
  
      // eslint-disable-next-line deprecation/deprecation
      return hub.withScope(rest[0]);
    }
  
    /**
     * Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
     * async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
     * case, for example, in the browser).
     *
     * Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
     *
     * This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
     * applications directly because it comes with pitfalls. Use at your own risk!
     *
     * @param callback The callback in which the passed isolation scope is active. (Note: In environments without async
     * context strategy, the currently active isolation scope may change within execution of the callback.)
     * @returns The same value that `callback` returns.
     */
    function withIsolationScope(callback) {
      return runWithAsyncContext(() => {
        return callback(getIsolationScope());
      });
    }
  
    /**
     * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
     *
     * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
     * new child span within the transaction or any span, call the respective `.startChild()` method.
     *
     * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
     *
     * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
     * finished child spans will be sent to Sentry.
     *
     * NOTE: This function should only be used for *manual* instrumentation. Auto-instrumentation should call
     * `startTransaction` directly on the hub.
     *
     * @param context Properties of the new `Transaction`.
     * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
     * default values). See {@link Options.tracesSampler}.
     *
     * @returns The transaction which was just started
     *
     * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
     */
    function startTransaction(
      context,
      customSamplingContext,
    ) {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().startTransaction({ ...context }, customSamplingContext);
    }
  
    /**
     * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
     *
     * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
     * the client to wait until all events are sent before resolving the promise.
     * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
     * doesn't (or if there's no client defined).
     */
    async function flush(timeout) {
      const client = getClient();
      if (client) {
        return client.flush(timeout);
      }
      DEBUG_BUILD$2 && logger.warn('Cannot flush events. No client defined.');
      return Promise.resolve(false);
    }
  
    /**
     * Call `close()` on the current client, if there is one. See {@link Client.close}.
     *
     * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
     * parameter will cause the client to wait until all events are sent before disabling itself.
     * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
     * doesn't (or if there's no client defined).
     */
    async function close(timeout) {
      const client = getClient();
      if (client) {
        return client.close(timeout);
      }
      DEBUG_BUILD$2 && logger.warn('Cannot flush events and disable SDK. No client defined.');
      return Promise.resolve(false);
    }
  
    /**
     * This is the getter for lastEventId.
     *
     * @returns The last event id of a captured event.
     * @deprecated This function will be removed in the next major version of the Sentry SDK.
     */
    function lastEventId() {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().lastEventId();
    }
  
    /**
     * Get the currently active client.
     */
    function getClient() {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().getClient();
    }
  
    /**
     * Returns true if Sentry has been properly initialized.
     */
    function isInitialized() {
      return !!getClient();
    }
  
    /**
     * Get the currently active scope.
     */
    function getCurrentScope() {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().getScope();
    }
  
    /**
     * Start a session on the current isolation scope.
     *
     * @param context (optional) additional properties to be applied to the returned session object
     *
     * @returns the new active session
     */
    function startSession(context) {
      const client = getClient();
      const isolationScope = getIsolationScope();
      const currentScope = getCurrentScope();
  
      const { release, environment = DEFAULT_ENVIRONMENT } = (client && client.getOptions()) || {};
  
      // Will fetch userAgent if called from browser sdk
      const { userAgent } = GLOBAL_OBJ.navigator || {};
  
      const session = makeSession({
        release,
        environment,
        user: currentScope.getUser() || isolationScope.getUser(),
        ...(userAgent && { userAgent }),
        ...context,
      });
  
      // End existing session if there's one
      const currentSession = isolationScope.getSession();
      if (currentSession && currentSession.status === 'ok') {
        updateSession(currentSession, { status: 'exited' });
      }
  
      endSession();
  
      // Afterwards we set the new session on the scope
      isolationScope.setSession(session);
  
      // TODO (v8): Remove this and only use the isolation scope(?).
      // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
      currentScope.setSession(session);
  
      return session;
    }
  
    /**
     * End the session on the current isolation scope.
     */
    function endSession() {
      const isolationScope = getIsolationScope();
      const currentScope = getCurrentScope();
  
      const session = currentScope.getSession() || isolationScope.getSession();
      if (session) {
        closeSession(session);
      }
      _sendSessionUpdate();
  
      // the session is over; take it off of the scope
      isolationScope.setSession();
  
      // TODO (v8): Remove this and only use the isolation scope(?).
      // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
      currentScope.setSession();
    }
  
    /**
     * Sends the current Session on the scope
     */
    function _sendSessionUpdate() {
      const isolationScope = getIsolationScope();
      const currentScope = getCurrentScope();
      const client = getClient();
      // TODO (v8): Remove currentScope and only use the isolation scope(?).
      // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
      const session = currentScope.getSession() || isolationScope.getSession();
      if (session && client && client.captureSession) {
        console.log('captureSession11:::', session)
        client.captureSession(session);
      }
    }
  
    /**
     * Sends the current session on the scope to Sentry
     *
     * @param end If set the session will be marked as exited and removed from the scope.
     *            Defaults to `false`.
     */
    function captureSession(end = false) {
      // both send the update and pull the session from the scope
      if (end) {
        endSession();
        return;
      }
  
      // only send the update
      _sendSessionUpdate();
    }
  
    /**
     * Returns the root span of a given span.
     *
     * As long as we use `Transaction`s internally, the returned root span
     * will be a `Transaction` but be aware that this might change in the future.
     *
     * If the given span has no root span or transaction, `undefined` is returned.
     */
    function getRootSpan(span) {
      // TODO (v8): Remove this check and just return span
      // eslint-disable-next-line deprecation/deprecation
      return span.transaction;
    }
  
    /**
     * Creates a dynamic sampling context from a client.
     *
     * Dispatches the `createDsc` lifecycle hook as a side effect.
     */
    function getDynamicSamplingContextFromClient(
      trace_id,
      client,
      scope,
    ) {
      const options = client.getOptions();
  
      const { publicKey: public_key } = client.getDsn() || {};
      // TODO(v8): Remove segment from User
      // eslint-disable-next-line deprecation/deprecation
      const { segment: user_segment } = (scope && scope.getUser()) || {};
  
      const dsc = dropUndefinedKeys({
        environment: options.environment || DEFAULT_ENVIRONMENT,
        release: options.release,
        user_segment,
        public_key,
        trace_id,
      }) ;
  
      client.emit && client.emit('createDsc', dsc);
  
      return dsc;
    }
  
    /**
     * A Span with a frozen dynamic sampling context.
     */
  
    /**
     * Creates a dynamic sampling context from a span (and client and scope)
     *
     * @param span the span from which a few values like the root span name and sample rate are extracted.
     *
     * @returns a dynamic sampling context
     */
    function getDynamicSamplingContextFromSpan(span) {
      const client = getClient();
      if (!client) {
        return {};
      }
  
      // passing emit=false here to only emit later once the DSC is actually populated
      const dsc = getDynamicSamplingContextFromClient(spanToJSON(span).trace_id || '', client, getCurrentScope());
  
      // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
      const txn = getRootSpan(span) ;
      if (!txn) {
        return dsc;
      }
  
      // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
      // For now we need to avoid breaking users who directly created a txn with a DSC, where this field is still set.
      // @see Transaction class constructor
      const v7FrozenDsc = txn && txn._frozenDynamicSamplingContext;
      if (v7FrozenDsc) {
        return v7FrozenDsc;
      }
  
      // TODO (v8): Replace txn.metadata with txn.attributes[]
      // We can't do this yet because attributes aren't always set yet.
      // eslint-disable-next-line deprecation/deprecation
      const { sampleRate: maybeSampleRate, source } = txn.metadata;
      if (maybeSampleRate != null) {
        dsc.sample_rate = `${maybeSampleRate}`;
      }
  
      // We don't want to have a transaction name in the DSC if the source is "url" because URLs might contain PII
      const jsonSpan = spanToJSON(txn);
  
      // after JSON conversion, txn.name becomes jsonSpan.description
      if (source && source !== 'url') {
        dsc.transaction = jsonSpan.description;
      }
  
      dsc.sampled = String(spanIsSampled(txn));
  
      client.emit && client.emit('createDsc', dsc);
  
      return dsc;
    }
  
    /**
     * Applies data from the scope to the event and runs all event processors on it.
     */
    function applyScopeDataToEvent(event, data) {
      const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
  
      // Apply general data
      applyDataToEvent(event, data);
  
      // We want to set the trace context for normal events only if there isn't already
      // a trace context on the event. There is a product feature in place where we link
      // errors with transaction and it relies on that.
      if (span) {
        applySpanToEvent(event, span);
      }
  
      applyFingerprintToEvent(event, fingerprint);
      applyBreadcrumbsToEvent(event, breadcrumbs);
      applySdkMetadataToEvent(event, sdkProcessingMetadata);
    }
  
    /** Merge data of two scopes together. */
    function mergeScopeData(data, mergeData) {
      const {
        extra,
        tags,
        user,
        contexts,
        level,
        sdkProcessingMetadata,
        breadcrumbs,
        fingerprint,
        eventProcessors,
        attachments,
        propagationContext,
        // eslint-disable-next-line deprecation/deprecation
        transactionName,
        span,
      } = mergeData;
  
      mergeAndOverwriteScopeData(data, 'extra', extra);
      mergeAndOverwriteScopeData(data, 'tags', tags);
      mergeAndOverwriteScopeData(data, 'user', user);
      mergeAndOverwriteScopeData(data, 'contexts', contexts);
      mergeAndOverwriteScopeData(data, 'sdkProcessingMetadata', sdkProcessingMetadata);
  
      if (level) {
        data.level = level;
      }
  
      if (transactionName) {
        // eslint-disable-next-line deprecation/deprecation
        data.transactionName = transactionName;
      }
  
      if (span) {
        data.span = span;
      }
  
      if (breadcrumbs.length) {
        data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
      }
  
      if (fingerprint.length) {
        data.fingerprint = [...data.fingerprint, ...fingerprint];
      }
  
      if (eventProcessors.length) {
        data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
      }
  
      if (attachments.length) {
        data.attachments = [...data.attachments, ...attachments];
      }
  
      data.propagationContext = { ...data.propagationContext, ...propagationContext };
    }
  
    /**
     * Merges certain scope data. Undefined values will overwrite any existing values.
     * Exported only for tests.
     */
    function mergeAndOverwriteScopeData
  
    (data, prop, mergeVal) {
      if (mergeVal && Object.keys(mergeVal).length) {
        // Clone object
        data[prop] = { ...data[prop] };
        for (const key in mergeVal) {
          if (Object.prototype.hasOwnProperty.call(mergeVal, key)) {
            data[prop][key] = mergeVal[key];
          }
        }
      }
    }
  
    function applyDataToEvent(event, data) {
      const {
        extra,
        tags,
        user,
        contexts,
        level,
        // eslint-disable-next-line deprecation/deprecation
        transactionName,
      } = data;
  
      const cleanedExtra = dropUndefinedKeys(extra);
      if (cleanedExtra && Object.keys(cleanedExtra).length) {
        event.extra = { ...cleanedExtra, ...event.extra };
      }
  
      const cleanedTags = dropUndefinedKeys(tags);
      if (cleanedTags && Object.keys(cleanedTags).length) {
        event.tags = { ...cleanedTags, ...event.tags };
      }
  
      const cleanedUser = dropUndefinedKeys(user);
      if (cleanedUser && Object.keys(cleanedUser).length) {
        event.user = { ...cleanedUser, ...event.user };
      }
  
      const cleanedContexts = dropUndefinedKeys(contexts);
      if (cleanedContexts && Object.keys(cleanedContexts).length) {
        event.contexts = { ...cleanedContexts, ...event.contexts };
      }
  
      if (level) {
        event.level = level;
      }
  
      if (transactionName) {
        event.transaction = transactionName;
      }
    }
  
    function applyBreadcrumbsToEvent(event, breadcrumbs) {
      const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
      event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
    }
  
    function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
      event.sdkProcessingMetadata = {
        ...event.sdkProcessingMetadata,
        ...sdkProcessingMetadata,
      };
    }
  
    function applySpanToEvent(event, span) {
      event.contexts = { trace: spanToTraceContext(span), ...event.contexts };
      const rootSpan = getRootSpan(span);
      if (rootSpan) {
        event.sdkProcessingMetadata = {
          dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
          ...event.sdkProcessingMetadata,
        };
        const transactionName = spanToJSON(rootSpan).description;
        if (transactionName) {
          event.tags = { transaction: transactionName, ...event.tags };
        }
      }
    }
  
    /**
     * Applies fingerprint from the scope to the event if there's one,
     * uses message if there's one instead or get rid of empty fingerprint
     */
    function applyFingerprintToEvent(event, fingerprint) {
      // Make sure it's an array first and we actually have something in place
      event.fingerprint = event.fingerprint ? arrayify(event.fingerprint) : [];
  
      // If we have something on the scope, then merge it with event
      if (fingerprint) {
        event.fingerprint = event.fingerprint.concat(fingerprint);
      }
  
      // If we have no data at all, remove empty array default
      if (event.fingerprint && !event.fingerprint.length) {
        delete event.fingerprint;
      }
    }
  
    /**
     * Default value for maximum number of breadcrumbs added to an event.
     */
    const DEFAULT_MAX_BREADCRUMBS = 100;
  
    /**
     * The global scope is kept in this module.
     * When accessing this via `getGlobalScope()` we'll make sure to set one if none is currently present.
     */
    let globalScope;
  
    /**
     * Holds additional event information. {@link Scope.applyToEvent} will be
     * called by the client before an event will be sent.
     */
    class Scope  {
      /** Flag if notifying is happening. */
  
      /** Callback for client to receive scope changes. */
  
      /** Callback list that will be called after {@link applyToEvent}. */
  
      /** Array of breadcrumbs. */
  
      /** User */
  
      /** Tags */
  
      /** Extra */
  
      /** Contexts */
  
      /** Attachments */
  
      /** Propagation Context for distributed tracing */
  
      /**
       * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
       * sent to Sentry
       */
  
      /** Fingerprint */
  
      /** Severity */
      // eslint-disable-next-line deprecation/deprecation
  
      /**
       * Transaction Name
       */
  
      /** Span */
  
      /** Session */
  
      /** Request Mode Session Status */
  
      /** The client on this scope */
  
      // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
  
       constructor() {
        this._notifyingListeners = false;
        this._scopeListeners = [];
        this._eventProcessors = [];
        this._breadcrumbs = [];
        this._attachments = [];
        this._user = {};
        this._tags = {};
        this._extra = {};
        this._contexts = {};
        this._sdkProcessingMetadata = {};
        this._propagationContext = generatePropagationContext();
      }
  
      /**
       * Inherit values from the parent scope.
       * @deprecated Use `scope.clone()` and `new Scope()` instead.
       */
       static clone(scope) {
        return scope ? scope.clone() : new Scope();
      }
  
      /**
       * Clone this scope instance.
       */
       clone() {
        const newScope = new Scope();
        newScope._breadcrumbs = [...this._breadcrumbs];
        newScope._tags = { ...this._tags };
        newScope._extra = { ...this._extra };
        newScope._contexts = { ...this._contexts };
        newScope._user = this._user;
        newScope._level = this._level;
        newScope._span = this._span;
        newScope._session = this._session;
        newScope._transactionName = this._transactionName;
        newScope._fingerprint = this._fingerprint;
        newScope._eventProcessors = [...this._eventProcessors];
        newScope._requestSession = this._requestSession;
        newScope._attachments = [...this._attachments];
        newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
        newScope._propagationContext = { ...this._propagationContext };
        newScope._client = this._client;
  
        return newScope;
      }
  
      /** Update the client on the scope. */
       setClient(client) {
        this._client = client;
      }
  
      /**
       * Get the client assigned to this scope.
       *
       * It is generally recommended to use the global function `Sentry.getClient()` instead, unless you know what you are doing.
       */
       getClient() {
        return this._client;
      }
  
      /**
       * Add internal on change listener. Used for sub SDKs that need to store the scope.
       * @hidden
       */
       addScopeListener(callback) {
        this._scopeListeners.push(callback);
      }
  
      /**
       * @inheritDoc
       */
       addEventProcessor(callback) {
        this._eventProcessors.push(callback);
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setUser(user) {
        // If null is passed we want to unset everything, but still define keys,
        // so that later down in the pipeline any existing values are cleared.
        this._user = user || {
          email: undefined,
          id: undefined,
          ip_address: undefined,
          segment: undefined,
          username: undefined,
        };
  
        if (this._session) {
          updateSession(this._session, { user });
        }
  
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       getUser() {
        return this._user;
      }
  
      /**
       * @inheritDoc
       */
       getRequestSession() {
        return this._requestSession;
      }
  
      /**
       * @inheritDoc
       */
       setRequestSession(requestSession) {
        this._requestSession = requestSession;
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setTags(tags) {
        this._tags = {
          ...this._tags,
          ...tags,
        };
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setTag(key, value) {
        this._tags = { ...this._tags, [key]: value };
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setExtras(extras) {
        this._extra = {
          ...this._extra,
          ...extras,
        };
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setExtra(key, extra) {
        this._extra = { ...this._extra, [key]: extra };
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setFingerprint(fingerprint) {
        this._fingerprint = fingerprint;
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setLevel(
        // eslint-disable-next-line deprecation/deprecation
        level,
      ) {
        this._level = level;
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * Sets the transaction name on the scope for future events.
       * @deprecated Use extra or tags instead.
       */
       setTransactionName(name) {
        this._transactionName = name;
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setContext(key, context) {
        if (context === null) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this._contexts[key];
        } else {
          this._contexts[key] = context;
        }
  
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * Sets the Span on the scope.
       * @param span Span
       * @deprecated Instead of setting a span on a scope, use `startSpan()`/`startSpanManual()` instead.
       */
       setSpan(span) {
        this._span = span;
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * Returns the `Span` if there is one.
       * @deprecated Use `getActiveSpan()` instead.
       */
       getSpan() {
        return this._span;
      }
  
      /**
       * Returns the `Transaction` attached to the scope (if there is one).
       * @deprecated You should not rely on the transaction, but just use `startSpan()` APIs instead.
       */
       getTransaction() {
        // Often, this span (if it exists at all) will be a transaction, but it's not guaranteed to be. Regardless, it will
        // have a pointer to the currently-active transaction.
        const span = this._span;
        // Cannot replace with getRootSpan because getRootSpan returns a span, not a transaction
        // Also, this method will be removed anyway.
        // eslint-disable-next-line deprecation/deprecation
        return span && span.transaction;
      }
  
      /**
       * @inheritDoc
       */
       setSession(session) {
        if (!session) {
          delete this._session;
        } else {
          this._session = session;
        }
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       getSession() {
        return this._session;
      }
  
      /**
       * @inheritDoc
       */
       update(captureContext) {
        if (!captureContext) {
          return this;
        }
  
        if (typeof captureContext === 'function') {
          const updatedScope = (captureContext )(this);
          return updatedScope instanceof Scope ? updatedScope : this;
        }
  
        if (captureContext instanceof Scope) {
          this._tags = { ...this._tags, ...captureContext._tags };
          this._extra = { ...this._extra, ...captureContext._extra };
          this._contexts = { ...this._contexts, ...captureContext._contexts };
          if (captureContext._user && Object.keys(captureContext._user).length) {
            this._user = captureContext._user;
          }
          if (captureContext._level) {
            this._level = captureContext._level;
          }
          if (captureContext._fingerprint) {
            this._fingerprint = captureContext._fingerprint;
          }
          if (captureContext._requestSession) {
            this._requestSession = captureContext._requestSession;
          }
          if (captureContext._propagationContext) {
            this._propagationContext = captureContext._propagationContext;
          }
        } else if (isPlainObject(captureContext)) {
          // eslint-disable-next-line no-param-reassign
          captureContext = captureContext ;
          this._tags = { ...this._tags, ...captureContext.tags };
          this._extra = { ...this._extra, ...captureContext.extra };
          this._contexts = { ...this._contexts, ...captureContext.contexts };
          if (captureContext.user) {
            this._user = captureContext.user;
          }
          if (captureContext.level) {
            this._level = captureContext.level;
          }
          if (captureContext.fingerprint) {
            this._fingerprint = captureContext.fingerprint;
          }
          if (captureContext.requestSession) {
            this._requestSession = captureContext.requestSession;
          }
          if (captureContext.propagationContext) {
            this._propagationContext = captureContext.propagationContext;
          }
        }
  
        return this;
      }
  
      /**
       * @inheritDoc
       */
       clear() {
        this._breadcrumbs = [];
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._contexts = {};
        this._level = undefined;
        this._transactionName = undefined;
        this._fingerprint = undefined;
        this._requestSession = undefined;
        this._span = undefined;
        this._session = undefined;
        this._notifyScopeListeners();
        this._attachments = [];
        this._propagationContext = generatePropagationContext();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       addBreadcrumb(breadcrumb, maxBreadcrumbs) {
        const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
  
        // No data has been changed, so don't notify scope listeners
        if (maxCrumbs <= 0) {
          return this;
        }
  
        const mergedBreadcrumb = {
          timestamp: dateTimestampInSeconds(),
          ...breadcrumb,
        };
  
        const breadcrumbs = this._breadcrumbs;
        breadcrumbs.push(mergedBreadcrumb);
        this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
  
        this._notifyScopeListeners();
  
        return this;
      }
  
      /**
       * @inheritDoc
       */
       getLastBreadcrumb() {
        return this._breadcrumbs[this._breadcrumbs.length - 1];
      }
  
      /**
       * @inheritDoc
       */
       clearBreadcrumbs() {
        this._breadcrumbs = [];
        this._notifyScopeListeners();
        return this;
      }
  
      /**
       * @inheritDoc
       */
       addAttachment(attachment) {
        this._attachments.push(attachment);
        return this;
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `getScopeData()` instead.
       */
       getAttachments() {
        const data = this.getScopeData();
  
        return data.attachments;
      }
  
      /**
       * @inheritDoc
       */
       clearAttachments() {
        this._attachments = [];
        return this;
      }
  
      /** @inheritDoc */
       getScopeData() {
        const {
          _breadcrumbs,
          _attachments,
          _contexts,
          _tags,
          _extra,
          _user,
          _level,
          _fingerprint,
          _eventProcessors,
          _propagationContext,
          _sdkProcessingMetadata,
          _transactionName,
          _span,
        } = this;
  
        return {
          breadcrumbs: _breadcrumbs,
          attachments: _attachments,
          contexts: _contexts,
          tags: _tags,
          extra: _extra,
          user: _user,
          level: _level,
          fingerprint: _fingerprint || [],
          eventProcessors: _eventProcessors,
          propagationContext: _propagationContext,
          sdkProcessingMetadata: _sdkProcessingMetadata,
          transactionName: _transactionName,
          span: _span,
        };
      }
  
      /**
       * Applies data from the scope to the event and runs all event processors on it.
       *
       * @param event Event
       * @param hint Object containing additional information about the original exception, for use by the event processors.
       * @hidden
       * @deprecated Use `applyScopeDataToEvent()` directly
       */
       applyToEvent(
        event,
        hint = {},
        additionalEventProcessors = [],
      ) {
        applyScopeDataToEvent(event, this.getScopeData());
  
        // TODO (v8): Update this order to be: Global > Client > Scope
        const eventProcessors = [
          ...additionalEventProcessors,
          // eslint-disable-next-line deprecation/deprecation
          ...getGlobalEventProcessors(),
          ...this._eventProcessors,
        ];
  
        return notifyEventProcessors(eventProcessors, event, hint);
      }
  
      /**
       * Add data which will be accessible during event processing but won't get sent to Sentry
       */
       setSDKProcessingMetadata(newData) {
        this._sdkProcessingMetadata = { ...this._sdkProcessingMetadata, ...newData };
  
        return this;
      }
  
      /**
       * @inheritDoc
       */
       setPropagationContext(context) {
        this._propagationContext = context;
        return this;
      }
  
      /**
       * @inheritDoc
       */
       getPropagationContext() {
        return this._propagationContext;
      }
  
      /**
       * Capture an exception for this scope.
       *
       * @param exception The exception to capture.
       * @param hint Optinal additional data to attach to the Sentry event.
       * @returns the id of the captured Sentry event.
       */
       captureException(exception, hint) {
        const eventId = hint && hint.event_id ? hint.event_id : uuid4();
  
        if (!this._client) {
          logger.warn('No client configured on scope - will not capture exception!');
          return eventId;
        }
  
        const syntheticException = new Error('Sentry syntheticException');
        // console.log('client前的exception');
        // console.dir(exception);
        this._client.captureException(
          exception,
          {
            originalException: exception,
            syntheticException,
            ...hint,
            event_id: eventId,
          },
          this,
        );
  
        return eventId;
      }
  
      /**
       * Capture a message for this scope.
       *
       * @param message The message to capture.
       * @param level An optional severity level to report the message with.
       * @param hint Optional additional data to attach to the Sentry event.
       * @returns the id of the captured message.
       */
       captureMessage(message, level, hint) {
        const eventId = hint && hint.event_id ? hint.event_id : uuid4();
  
        if (!this._client) {
          logger.warn('No client configured on scope - will not capture message!');
          return eventId;
        }
  
        const syntheticException = new Error(message);
  
        this._client.captureMessage(
          message,
          level,
          {
            originalException: message,
            syntheticException,
            ...hint,
            event_id: eventId,
          },
          this,
        );
  
        return eventId;
      }
  
      /**
       * Captures a manually created event for this scope and sends it to Sentry.
       *
       * @param exception The event to capture.
       * @param hint Optional additional data to attach to the Sentry event.
       * @returns the id of the captured event.
       */
       captureEvent(event, hint) {
        const eventId = hint && hint.event_id ? hint.event_id : uuid4();
  
        if (!this._client) {
          logger.warn('No client configured on scope - will not capture event!');
          return eventId;
        }
    
        this._client.captureEvent(event, { ...hint, event_id: eventId }, this);
  
        return eventId;
      }
  
      /**
       * This will be called on every set call.
       */
       _notifyScopeListeners() {
        // We need this check for this._notifyingListeners to be able to work on scope during updates
        // If this check is not here we'll produce endless recursion when something is done with the scope
        // during the callback.
        if (!this._notifyingListeners) {
          this._notifyingListeners = true;
          this._scopeListeners.forEach(callback => {
            callback(this);
          });
          this._notifyingListeners = false;
        }
      }
    }
  
    /**
     * Get the global scope.
     * This scope is applied to _all_ events.
     */
    function getGlobalScope() {
      if (!globalScope) {
        globalScope = new Scope();
      }
  
      return globalScope;
    }
  
    function generatePropagationContext() {
      return {
        traceId: uuid4(),
        spanId: uuid4().substring(16),
      };
    }
  
    const SDK_VERSION = '7.101.1';
  
    /**
     * API compatibility version of this hub.
     *
     * WARNING: This number should only be increased when the global interface
     * changes and new methods are introduced.
     *
     * @hidden
     */
    const API_VERSION = parseFloat(SDK_VERSION);
  
    /**
     * Default maximum number of breadcrumbs added to an event. Can be overwritten
     * with {@link Options.maxBreadcrumbs}.
     */
    const DEFAULT_BREADCRUMBS = 100;
  
    /**
     * @inheritDoc
     */
    class Hub  {
      /** Is a {@link Layer}[] containing the client and scope */
  
      /** Contains the last event id of a captured event.  */
  
      /**
       * Creates a new instance of the hub, will push one {@link Layer} into the
       * internal stack on creation.
       *
       * @param client bound to the hub.
       * @param scope bound to the hub.
       * @param version number, higher number means higher priority.
       *
       * @deprecated Instantiation of Hub objects is deprecated and the constructor will be removed in version 8 of the SDK.
       *
       * If you are currently using the Hub for multi-client use like so:
       *
       * ```
       * // OLD
       * const hub = new Hub();
       * hub.bindClient(client);
       * makeMain(hub)
       * ```
       *
       * instead initialize the client as follows:
       *
       * ```
       * // NEW
       * Sentry.withIsolationScope(() => {
       *    Sentry.setCurrentClient(client);
       *    client.init();
       * });
       * ```
       *
       * If you are using the Hub to capture events like so:
       *
       * ```
       * // OLD
       * const client = new Client();
       * const hub = new Hub(client);
       * hub.captureException()
       * ```
       *
       * instead capture isolated events as follows:
       *
       * ```
       * // NEW
       * const client = new Client();
       * const scope = new Scope();
       * scope.setClient(client);
       * scope.captureException();
       * ```
       */
       constructor(
        client,
        scope,
        isolationScope,
          _version = API_VERSION,
      ) {this._version = _version;
        let assignedScope;
        if (!scope) {
          assignedScope = new Scope();
          assignedScope.setClient(client);
        } else {
          assignedScope = scope;
        }
        
        let assignedIsolationScope;
        if (!isolationScope) {
          assignedIsolationScope = new Scope();
          assignedIsolationScope.setClient(client);
        } else {
          assignedIsolationScope = isolationScope;
        }
  
        this._stack = [{ scope: assignedScope }];
        
        if (client) {
            
          // eslint-disable-next-line deprecation/deprecation
          this.bindClient(client);
        }
  
        this._isolationScope = assignedIsolationScope;
      }
  
      /**
       * Checks if this hub's version is older than the given version.
       *
       * @param version A version number to compare to.
       * @return True if the given version is newer; otherwise false.
       *
       * @deprecated This will be removed in v8.
       */
       isOlderThan(version) {
        return this._version < version;
      }
  
      /**
       * This binds the given client to the current scope.
       * @param client An SDK client (client) instance.
       *
       * @deprecated Use `initAndBind()` directly, or `setCurrentClient()` and/or `client.init()` instead.
       */
       bindClient(client) {
        
        // eslint-disable-next-line deprecation/deprecation
        const top = this.getStackTop();
        top.client = client;
        top.scope.setClient(client);
        // eslint-disable-next-line deprecation/deprecation
        if (client && client.setupIntegrations) {
          // eslint-disable-next-line deprecation/deprecation
          client.setupIntegrations();
        }
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `withScope` instead.
       */
       pushScope() {
        // We want to clone the content of prev scope
        // eslint-disable-next-line deprecation/deprecation
        const scope = this.getScope().clone();
        // eslint-disable-next-line deprecation/deprecation
        this.getStack().push({
          // eslint-disable-next-line deprecation/deprecation
          client: this.getClient(),
          scope,
        });
        return scope;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `withScope` instead.
       */
       popScope() {
        // eslint-disable-next-line deprecation/deprecation
        if (this.getStack().length <= 1) return false;
        // eslint-disable-next-line deprecation/deprecation
        return !!this.getStack().pop();
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `Sentry.withScope()` instead.
       */
       withScope(callback) {
        // eslint-disable-next-line deprecation/deprecation
        const scope = this.pushScope();
  
        let maybePromiseResult;
        try {
          maybePromiseResult = callback(scope);
        } catch (e) {
          // eslint-disable-next-line deprecation/deprecation
          this.popScope();
          throw e;
        }
  
        if (isThenable(maybePromiseResult)) {
          // @ts-expect-error - isThenable returns the wrong type
          return maybePromiseResult.then(
            res => {
              // eslint-disable-next-line deprecation/deprecation
              this.popScope();
              return res;
            },
            e => {
              // eslint-disable-next-line deprecation/deprecation
              this.popScope();
              throw e;
            },
          );
        }
  
        // eslint-disable-next-line deprecation/deprecation
        this.popScope();
        return maybePromiseResult;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `Sentry.getClient()` instead.
       */
       getClient() {
        // eslint-disable-next-line deprecation/deprecation
        return this.getStackTop().client ;
      }
  
      /**
       * Returns the scope of the top stack.
       *
       * @deprecated Use `Sentry.getCurrentScope()` instead.
       */
       getScope() {
        // eslint-disable-next-line deprecation/deprecation
        return this.getStackTop().scope;
      }
  
      /**
       * @deprecated Use `Sentry.getIsolationScope()` instead.
       */
       getIsolationScope() {
        return this._isolationScope;
      }
  
      /**
       * Returns the scope stack for domains or the process.
       * @deprecated This will be removed in v8.
       */
       getStack() {
        return this._stack;
      }
  
      /**
       * Returns the topmost scope layer in the order domain > local > process.
       * @deprecated This will be removed in v8.
       */
       getStackTop() {
        return this._stack[this._stack.length - 1];
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `Sentry.captureException()` instead.
       */
       captureException(exception, hint) {
        const eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : uuid4());
        const syntheticException = new Error('Sentry syntheticException');
        // eslint-disable-next-line deprecation/deprecation
        console.log('scope前的exception', hint);
        console.dir(exception);
        this.getScope().captureException(exception, {
          originalException: exception,
          syntheticException,
          ...hint,
          event_id: eventId,
        });
  
        return eventId;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use  `Sentry.captureMessage()` instead.
       */
       captureMessage(
        message,
        // eslint-disable-next-line deprecation/deprecation
        level,
        hint,
      ) {
        const eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : uuid4());
        const syntheticException = new Error(message);
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().captureMessage(message, level, {
          originalException: message,
          syntheticException,
          ...hint,
          event_id: eventId,
        });
  
        return eventId;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `Sentry.captureEvent()` instead.
       */
       captureEvent(event, hint) {
        const eventId = hint && hint.event_id ? hint.event_id : uuid4();
        if (!event.type) {
          this._lastEventId = eventId;
        }
       
        
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().captureEvent(event, { ...hint, event_id: eventId });
        return eventId;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated This will be removed in v8.
       */
       lastEventId() {
        return this._lastEventId;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `Sentry.addBreadcrumb()` instead.
       */
       addBreadcrumb(breadcrumb, hint) {
        // eslint-disable-next-line deprecation/deprecation
        const { scope, client } = this.getStackTop();
  
        if (!client) return;
  
        const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } =
          (client.getOptions && client.getOptions()) || {};
  
        if (maxBreadcrumbs <= 0) return;
  
        const timestamp = dateTimestampInSeconds();
        const mergedBreadcrumb = { timestamp, ...breadcrumb };
        const finalBreadcrumb = beforeBreadcrumb
          ? (consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) )
          : mergedBreadcrumb;
  
        if (finalBreadcrumb === null) return;
  
        if (client.emit) {
          client.emit('beforeAddBreadcrumb', finalBreadcrumb, hint);
        }
  
        // TODO(v8): I know this comment doesn't make much sense because the hub will be deprecated but I still wanted to
        // write it down. In theory, we would have to add the breadcrumbs to the isolation scope here, however, that would
        // duplicate all of the breadcrumbs. There was the possibility of adding breadcrumbs to both, the isolation scope
        // and the normal scope, and deduplicating it down the line in the event processing pipeline. However, that would
        // have been very fragile, because the breadcrumb objects would have needed to keep their identity all throughout
        // the event processing pipeline.
        // In the new implementation, the top level `Sentry.addBreadcrumb()` should ONLY write to the isolation scope.
  
        scope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setUser()` instead.
       */
       setUser(user) {
        // TODO(v8): The top level `Sentry.setUser()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setUser(user);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setUser(user);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setTags()` instead.
       */
       setTags(tags) {
        // TODO(v8): The top level `Sentry.setTags()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setTags(tags);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setTags(tags);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setExtras()` instead.
       */
       setExtras(extras) {
        // TODO(v8): The top level `Sentry.setExtras()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setExtras(extras);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setExtras(extras);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setTag()` instead.
       */
       setTag(key, value) {
        // TODO(v8): The top level `Sentry.setTag()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setTag(key, value);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setTag(key, value);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setExtra()` instead.
       */
       setExtra(key, extra) {
        // TODO(v8): The top level `Sentry.setExtra()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setExtra(key, extra);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setExtra(key, extra);
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.setContext()` instead.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       setContext(name, context) {
        // TODO(v8): The top level `Sentry.setContext()` function should write ONLY to the isolation scope.
        // eslint-disable-next-line deprecation/deprecation
        this.getScope().setContext(name, context);
        // eslint-disable-next-line deprecation/deprecation
        this.getIsolationScope().setContext(name, context);
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `getScope()` directly.
       */
       configureScope(callback) {
        // eslint-disable-next-line deprecation/deprecation
        const { scope, client } = this.getStackTop();
        if (client) {
          callback(scope);
        }
      }
  
      /**
       * @inheritDoc
       */
       run(callback) {
        // eslint-disable-next-line deprecation/deprecation
        const oldHub = makeMain(this);
        try {
          callback(this);
        } finally {
          // eslint-disable-next-line deprecation/deprecation
          makeMain(oldHub);
        }
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `Sentry.getClient().getIntegrationByName()` instead.
       */
       getIntegration(integration) {
        // eslint-disable-next-line deprecation/deprecation
        const client = this.getClient();
        if (!client) return null;
        try {
          // eslint-disable-next-line deprecation/deprecation
          return client.getIntegration(integration);
        } catch (_oO) {
          DEBUG_BUILD$2 && logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
          return null;
        }
      }
  
      /**
       * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
       *
       * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
       * new child span within the transaction or any span, call the respective `.startChild()` method.
       *
       * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
       *
       * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
       * finished child spans will be sent to Sentry.
       *
       * @param context Properties of the new `Transaction`.
       * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
       * default values). See {@link Options.tracesSampler}.
       *
       * @returns The transaction which was just started
       *
       * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
       */
       startTransaction(context, customSamplingContext) {
        const result = this._callExtensionMethod('startTransaction', context, customSamplingContext);
  
        if (DEBUG_BUILD$2 && !result) {
          // eslint-disable-next-line deprecation/deprecation
          const client = this.getClient();
          if (!client) {
            logger.warn(
              "Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'",
            );
          } else {
            logger.warn(`Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':
  Sentry.addTracingExtensions();
  Sentry.init({...});
  `);
          }
        }
  
        return result;
      }
  
      /**
       * @inheritDoc
       * @deprecated Use `spanToTraceHeader()` instead.
       */
       traceHeaders() {
        return this._callExtensionMethod('traceHeaders');
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use top level `captureSession` instead.
       */
       captureSession(endSession = false) {
        // both send the update and pull the session from the scope
        if (endSession) {
          // eslint-disable-next-line deprecation/deprecation
          return this.endSession();
        }
  
        // only send the update
        this._sendSessionUpdate();
      }
  
      /**
       * @inheritDoc
       * @deprecated Use top level `endSession` instead.
       */
       endSession() {
        // eslint-disable-next-line deprecation/deprecation
        const layer = this.getStackTop();
        const scope = layer.scope;
        const session = scope.getSession();
        if (session) {
          closeSession(session);
        }
        this._sendSessionUpdate();
  
        // the session is over; take it off of the scope
        scope.setSession();
      }
  
      /**
       * @inheritDoc
       * @deprecated Use top level `startSession` instead.
       */
       startSession(context) {
        // eslint-disable-next-line deprecation/deprecation
        const { scope, client } = this.getStackTop();
        const { release, environment = DEFAULT_ENVIRONMENT } = (client && client.getOptions()) || {};
  
        // Will fetch userAgent if called from browser sdk
        const { userAgent } = GLOBAL_OBJ.navigator || {};
  
        const session = makeSession({
          release,
          environment,
          user: scope.getUser(),
          ...(userAgent && { userAgent }),
          ...context,
        });
  
        // End existing session if there's one
        const currentSession = scope.getSession && scope.getSession();
        if (currentSession && currentSession.status === 'ok') {
          updateSession(currentSession, { status: 'exited' });
        }
        // eslint-disable-next-line deprecation/deprecation
        this.endSession();
  
        // Afterwards we set the new session on the scope
        scope.setSession(session);
  
        return session;
      }
  
      /**
       * Returns if default PII should be sent to Sentry and propagated in ourgoing requests
       * when Tracing is used.
       *
       * @deprecated Use top-level `getClient().getOptions().sendDefaultPii` instead. This function
       * only unnecessarily increased API surface but only wrapped accessing the option.
       */
       shouldSendDefaultPii() {
        // eslint-disable-next-line deprecation/deprecation
        const client = this.getClient();
        const options = client && client.getOptions();
        return Boolean(options && options.sendDefaultPii);
      }
  
      /**
       * Sends the current Session on the scope
       */
       _sendSessionUpdate() {
        // eslint-disable-next-line deprecation/deprecation
        const { scope, client } = this.getStackTop();
  
        const session = scope.getSession();
        if (session && client && client.captureSession) {
            console.log('captureSession22:::', session)
          client.captureSession(session);
        }
      }
  
      /**
       * Calls global extension method and binding current instance to the function call
       */
      // @ts-expect-error Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       _callExtensionMethod(method, ...args) {
        const carrier = getMainCarrier();
        const sentry = carrier.__SENTRY__;
        if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
          return sentry.extensions[method].apply(this, args);
        }
        DEBUG_BUILD$2 && logger.warn(`Extension method ${method} couldn't be found, doing nothing.`);
      }
    }
  
    /**
     * Returns the global shim registry.
     *
     * FIXME: This function is problematic, because despite always returning a valid Carrier,
     * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
     * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
     **/
    function getMainCarrier() {
      GLOBAL_OBJ.__SENTRY__ = GLOBAL_OBJ.__SENTRY__ || {
        extensions: {},
        hub: undefined,
      };
      return GLOBAL_OBJ;
    }
  
    /**
     * Replaces the current main hub with the passed one on the global object
     *
     * @returns The old replaced hub
     *
     * @deprecated Use `setCurrentClient()` instead.
     */
    function makeMain(hub) {
      const registry = getMainCarrier();
      const oldHub = getHubFromCarrier(registry);
      setHubOnCarrier(registry, hub);
      return oldHub;
    }
  
    /**
     * Returns the default hub instance.
     *
     * If a hub is already registered in the global carrier but this module
     * contains a more recent version, it replaces the registered version.
     * Otherwise, the currently registered hub will be returned.
     *
     * @deprecated Use the respective replacement method directly instead.
     */
    function getCurrentHub() {
      // Get main carrier (global for every environment)
    //   function getMainCarrier() {
    //     GLOBAL_OBJ.__SENTRY__ = GLOBAL_OBJ.__SENTRY__ || {
    //       extensions: {},
    //       hub: undefined,
    //     };
    //     return GLOBAL_OBJ;
    //   }
      const registry = getMainCarrier();
      if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
        const hub = registry.__SENTRY__.acs.getCurrentHub();
  
        if (hub) {
          return hub;
        }
      }
      // Return hub that lives on a global object
      return getGlobalHub(registry);
    }
  
    /**
     * Get the currently active isolation scope.
     * The isolation scope is active for the current exection context,
     * meaning that it will remain stable for the same Hub.
     */
    function getIsolationScope() {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentHub().getIsolationScope();
    }
  
    function getGlobalHub(registry = getMainCarrier()) {
      // If there's no hub, or its an old API, assign a new one
  
      if (
        !hasHubOnCarrier(registry) ||
        // eslint-disable-next-line deprecation/deprecation
        getHubFromCarrier(registry).isOlderThan(API_VERSION)
      ) {
        // eslint-disable-next-line deprecation/deprecation
        setHubOnCarrier(registry, new Hub());
      }
  
      // Return hub that lives on a global object
      return getHubFromCarrier(registry);
    }
  
    /**
     * Runs the supplied callback in its own async context. Async Context strategies are defined per SDK.
     *
     * @param callback The callback to run in its own async context
     * @param options Options to pass to the async context strategy
     * @returns The result of the callback
     */
    function runWithAsyncContext(callback, options = {}) {
      const registry = getMainCarrier();
  
      if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
        return registry.__SENTRY__.acs.runWithAsyncContext(callback, options);
      }
  
      // if there was no strategy, fallback to just calling the callback
      return callback();
    }
  
    /**
     * This will tell whether a carrier has a hub on it or not
     * @param carrier object
     */
    function hasHubOnCarrier(carrier) {
      return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
    }
  
    /**
     * This will create a new {@link Hub} and add to the passed object on
     * __SENTRY__.hub.
     * @param carrier object
     * @hidden
     */
    function getHubFromCarrier(carrier) {
      // eslint-disable-next-line deprecation/deprecation
      return getGlobalSingleton('hub', () => new Hub(), carrier);
    }
  
    /**
     * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
     * @param carrier object
     * @param hub Hub
     * @returns A boolean indicating success or failure
     */
    function setHubOnCarrier(carrier, hub) {
      if (!carrier) return false;
      const __SENTRY__ = (carrier.__SENTRY__ = carrier.__SENTRY__ || {});
      __SENTRY__.hub = hub;
      return true;
    }
  
    /**
     * Grabs active transaction off scope.
     *
     * @deprecated You should not rely on the transaction, but just use `startSpan()` APIs instead.
     */
    function getActiveTransaction(maybeHub) {
      // eslint-disable-next-line deprecation/deprecation
      const hub = maybeHub || getCurrentHub();
      // eslint-disable-next-line deprecation/deprecation
      const scope = hub.getScope();
      // eslint-disable-next-line deprecation/deprecation
      return scope.getTransaction() ;
    }
  
    let errorsInstrumented = false;
  
    /**
     * Configures global error listeners
     */
    function registerErrorInstrumentation() {
      if (errorsInstrumented) {
        return;
      }
  
      errorsInstrumented = true;
      addGlobalErrorInstrumentationHandler(errorCallback);
      addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
    }
  
    /**
     * If an error or unhandled promise occurs, we mark the active transaction as failed
     */
    function errorCallback() {
      // eslint-disable-next-line deprecation/deprecation
      const activeTransaction = getActiveTransaction();
      if (activeTransaction) {
        const status = 'internal_error';
        logger.log(`[Tracing] Transaction: ${status} -> Global error occured`);
        activeTransaction.setStatus(status);
      }
    }
  
    // The function name will be lost when bundling but we need to be able to identify this listener later to maintain the
    // node.js default exit behaviour
    errorCallback.tag = 'sentry_tracingErrorCallback';
  
    /** The status of an Span.
     *
     * @deprecated Use string literals - if you require type casting, cast to SpanStatusType type
     */
    var SpanStatus; (function (SpanStatus) {
      /** The operation completed successfully. */
      const Ok = 'ok'; SpanStatus["Ok"] = Ok;
      /** Deadline expired before operation could complete. */
      const DeadlineExceeded = 'deadline_exceeded'; SpanStatus["DeadlineExceeded"] = DeadlineExceeded;
      /** 401 Unauthorized (actually does mean unauthenticated according to RFC 7235) */
      const Unauthenticated = 'unauthenticated'; SpanStatus["Unauthenticated"] = Unauthenticated;
      /** 403 Forbidden */
      const PermissionDenied = 'permission_denied'; SpanStatus["PermissionDenied"] = PermissionDenied;
      /** 404 Not Found. Some requested entity (file or directory) was not found. */
      const NotFound = 'not_found'; SpanStatus["NotFound"] = NotFound;
      /** 429 Too Many Requests */
      const ResourceExhausted = 'resource_exhausted'; SpanStatus["ResourceExhausted"] = ResourceExhausted;
      /** Client specified an invalid argument. 4xx. */
      const InvalidArgument = 'invalid_argument'; SpanStatus["InvalidArgument"] = InvalidArgument;
      /** 501 Not Implemented */
      const Unimplemented = 'unimplemented'; SpanStatus["Unimplemented"] = Unimplemented;
      /** 503 Service Unavailable */
      const Unavailable = 'unavailable'; SpanStatus["Unavailable"] = Unavailable;
      /** Other/generic 5xx. */
      const InternalError = 'internal_error'; SpanStatus["InternalError"] = InternalError;
      /** Unknown. Any non-standard HTTP status code. */
      const UnknownError = 'unknown_error'; SpanStatus["UnknownError"] = UnknownError;
      /** The operation was cancelled (typically by the user). */
      const Cancelled = 'cancelled'; SpanStatus["Cancelled"] = Cancelled;
      /** Already exists (409) */
      const AlreadyExists = 'already_exists'; SpanStatus["AlreadyExists"] = AlreadyExists;
      /** Operation was rejected because the system is not in a state required for the operation's */
      const FailedPrecondition = 'failed_precondition'; SpanStatus["FailedPrecondition"] = FailedPrecondition;
      /** The operation was aborted, typically due to a concurrency issue. */
      const Aborted = 'aborted'; SpanStatus["Aborted"] = Aborted;
      /** Operation was attempted past the valid range. */
      const OutOfRange = 'out_of_range'; SpanStatus["OutOfRange"] = OutOfRange;
      /** Unrecoverable data loss or corruption */
      const DataLoss = 'data_loss'; SpanStatus["DataLoss"] = DataLoss;
    })(SpanStatus || (SpanStatus = {}));
  
    /**
     * Converts a HTTP status code into a {@link SpanStatusType}.
     *
     * @param httpStatus The HTTP response status code.
     * @returns The span status or unknown_error.
     */
    function getSpanStatusFromHttpCode(httpStatus) {
      if (httpStatus < 400 && httpStatus >= 100) {
        return 'ok';
      }
  
      if (httpStatus >= 400 && httpStatus < 500) {
        switch (httpStatus) {
          case 401:
            return 'unauthenticated';
          case 403:
            return 'permission_denied';
          case 404:
            return 'not_found';
          case 409:
            return 'already_exists';
          case 413:
            return 'failed_precondition';
          case 429:
            return 'resource_exhausted';
          default:
            return 'invalid_argument';
        }
      }
  
      if (httpStatus >= 500 && httpStatus < 600) {
        switch (httpStatus) {
          case 501:
            return 'unimplemented';
          case 503:
            return 'unavailable';
          case 504:
            return 'deadline_exceeded';
          default:
            return 'internal_error';
        }
      }
  
      return 'unknown_error';
    }
  
    /**
     * Sets the Http status attributes on the current span based on the http code.
     * Additionally, the span's status is updated, depending on the http code.
     */
    function setHttpStatus(span, httpStatus) {
      // TODO (v8): Remove these calls
      // Relay does not require us to send the status code as a tag
      // For now, just because users might expect it to land as a tag we keep sending it.
      // Same with data.
      // In v8, we replace both, simply with
      // span.setAttribute('http.response.status_code', httpStatus);
  
      // eslint-disable-next-line deprecation/deprecation
      span.setTag('http.status_code', String(httpStatus));
      // eslint-disable-next-line deprecation/deprecation
      span.setData('http.response.status_code', httpStatus);
  
      const spanStatus = getSpanStatusFromHttpCode(httpStatus);
      if (spanStatus !== 'unknown_error') {
        span.setStatus(spanStatus);
      }
    }
  
    /**
     * Wrap a callback function with error handling.
     * If an error is thrown, it will be passed to the `onError` callback and re-thrown.
     *
     * If the return value of the function is a promise, it will be handled with `maybeHandlePromiseRejection`.
     *
     * If an `onFinally` callback is provided, this will be called when the callback has finished
     * - so if it returns a promise, once the promise resolved/rejected,
     * else once the callback has finished executing.
     * The `onFinally` callback will _always_ be called, no matter if an error was thrown or not.
     */
    function handleCallbackErrors
  
    (
      fn,
      onError,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onFinally = () => {},
    ) {
      let maybePromiseResult;
      try {
        maybePromiseResult = fn();
      } catch (e) {
        onError(e);
        onFinally();
        throw e;
      }
  
      return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally);
    }
  
    /**
     * Maybe handle a promise rejection.
     * This expects to be given a value that _may_ be a promise, or any other value.
     * If it is a promise, and it rejects, it will call the `onError` callback.
     * Other than this, it will generally return the given value as-is.
     */
    function maybeHandlePromiseRejection(
      value,
      onError,
      onFinally,
    ) {
      if (isThenable(value)) {
        // @ts-expect-error - the isThenable check returns the "wrong" type here
        return value.then(
          res => {
            onFinally();
            return res;
          },
          e => {
            onError(e);
            onFinally();
            throw e;
          },
        );
      }
  
      onFinally();
      return value;
    }
  
    // Treeshakable guard to remove all code related to tracing
  
    /**
     * Determines if tracing is currently enabled.
     *
     * Tracing is enabled when at least one of `tracesSampleRate` and `tracesSampler` is defined in the SDK config.
     */
    function hasTracingEnabled(
      maybeOptions,
    ) {
      if (typeof __SENTRY_TRACING__ === 'boolean' && !__SENTRY_TRACING__) {
        return false;
      }
  
      const client = getClient();
      const options = maybeOptions || (client && client.getOptions());
      return !!options && (options.enableTracing || 'tracesSampleRate' in options || 'tracesSampler' in options);
    }
  
    /**
     * Wraps a function with a transaction/span and finishes the span after the function is done.
     * The created span is the active span and will be used as parent by other spans created inside the function
     * and can be accessed via `Sentry.getSpan()`, as long as the function is executed while the scope is active.
     *
     * If you want to create a span that is not set as active, use {@link startInactiveSpan}.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startSpan(context, callback) {
      const ctx = normalizeContext(context);
  
      return runWithAsyncContext(() => {
        return withScope(context.scope, scope => {
          // eslint-disable-next-line deprecation/deprecation
          const hub = getCurrentHub();
          // eslint-disable-next-line deprecation/deprecation
          const parentSpan = scope.getSpan();
  
          const shouldSkipSpan = context.onlyIfParent && !parentSpan;
          const activeSpan = shouldSkipSpan ? undefined : createChildSpanOrTransaction(hub, parentSpan, ctx);
  
          // eslint-disable-next-line deprecation/deprecation
          scope.setSpan(activeSpan);
  
          return handleCallbackErrors(
            () => callback(activeSpan),
            () => {
              // Only update the span status if it hasn't been changed yet
              if (activeSpan) {
                const { status } = spanToJSON(activeSpan);
                if (!status || status === 'ok') {
                  activeSpan.setStatus('internal_error');
                }
              }
            },
            () => activeSpan && activeSpan.end(),
          );
        });
      });
    }
  
    /**
     * Similar to `Sentry.startSpan`. Wraps a function with a transaction/span, but does not finish the span
     * after the function is done automatically. You'll have to call `span.end()` manually.
     *
     * The created span is the active span and will be used as parent by other spans created inside the function
     * and can be accessed via `Sentry.getActiveSpan()`, as long as the function is executed while the scope is active.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startSpanManual(
      context,
      callback,
    ) {
      const ctx = normalizeContext(context);
  
      return runWithAsyncContext(() => {
        return withScope(context.scope, scope => {
          // eslint-disable-next-line deprecation/deprecation
          const hub = getCurrentHub();
          // eslint-disable-next-line deprecation/deprecation
          const parentSpan = scope.getSpan();
  
          const shouldSkipSpan = context.onlyIfParent && !parentSpan;
          const activeSpan = shouldSkipSpan ? undefined : createChildSpanOrTransaction(hub, parentSpan, ctx);
  
          // eslint-disable-next-line deprecation/deprecation
          scope.setSpan(activeSpan);
  
          function finishAndSetSpan() {
            activeSpan && activeSpan.end();
          }
  
          return handleCallbackErrors(
            () => callback(activeSpan, finishAndSetSpan),
            () => {
              // Only update the span status if it hasn't been changed yet, and the span is not yet finished
              if (activeSpan && activeSpan.isRecording()) {
                const { status } = spanToJSON(activeSpan);
                if (!status || status === 'ok') {
                  activeSpan.setStatus('internal_error');
                }
              }
            },
          );
        });
      });
    }
  
    /**
     * Creates a span. This span is not set as active, so will not get automatic instrumentation spans
     * as children or be able to be accessed via `Sentry.getSpan()`.
     *
     * If you want to create a span that is set as active, use {@link startSpan}.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate` or `tracesSampler`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startInactiveSpan(context) {
      if (!hasTracingEnabled()) {
        return undefined;
      }
  
      const ctx = normalizeContext(context);
      // eslint-disable-next-line deprecation/deprecation
      const hub = getCurrentHub();
      const parentSpan = context.scope
        ? // eslint-disable-next-line deprecation/deprecation
          context.scope.getSpan()
        : getActiveSpan();
  
      const shouldSkipSpan = context.onlyIfParent && !parentSpan;
  
      if (shouldSkipSpan) {
        return undefined;
      }
  
      const isolationScope = getIsolationScope();
      const scope = getCurrentScope();
  
      let span;
  
      if (parentSpan) {
        // eslint-disable-next-line deprecation/deprecation
        span = parentSpan.startChild(ctx);
      } else {
        const { traceId, dsc, parentSpanId, sampled } = {
          ...isolationScope.getPropagationContext(),
          ...scope.getPropagationContext(),
        };
  
        // eslint-disable-next-line deprecation/deprecation
        span = hub.startTransaction({
          traceId,
          parentSpanId,
          parentSampled: sampled,
          ...ctx,
          metadata: {
            dynamicSamplingContext: dsc,
            // eslint-disable-next-line deprecation/deprecation
            ...ctx.metadata,
          },
        });
      }
  
      setCapturedScopesOnSpan(span, scope, isolationScope);
  
      return span;
    }
  
    /**
     * Returns the currently active span.
     */
    function getActiveSpan() {
      // eslint-disable-next-line deprecation/deprecation
      return getCurrentScope().getSpan();
    }
  
    const continueTrace = (
      {
        sentryTrace,
        baggage,
      }
  
    ,
      callback,
    ) => {
      // TODO(v8): Change this function so it doesn't do anything besides setting the propagation context on the current scope:
      /*
        return withScope((scope) => {
          const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
          scope.setPropagationContext(propagationContext);
          return callback();
        })
      */
  
      const currentScope = getCurrentScope();
  
      // eslint-disable-next-line deprecation/deprecation
      const { traceparentData, dynamicSamplingContext, propagationContext } = tracingContextFromHeaders(
        sentryTrace,
        baggage,
      );
  
      currentScope.setPropagationContext(propagationContext);
  
      if (DEBUG_BUILD$2 && traceparentData) {
        logger.log(`[Tracing] Continuing trace ${traceparentData.traceId}.`);
      }
  
      const transactionContext = {
        ...traceparentData,
        metadata: dropUndefinedKeys({
          dynamicSamplingContext,
        }),
      };
  
      if (!callback) {
        return transactionContext;
      }
  
      return runWithAsyncContext(() => {
        return callback(transactionContext);
      });
    };
  
    function createChildSpanOrTransaction(
      hub,
      parentSpan,
      ctx,
    ) {
      if (!hasTracingEnabled()) {
        return undefined;
      }
  
      const isolationScope = getIsolationScope();
      const scope = getCurrentScope();
  
      let span;
      if (parentSpan) {
        // eslint-disable-next-line deprecation/deprecation
        span = parentSpan.startChild(ctx);
      } else {
        const { traceId, dsc, parentSpanId, sampled } = {
          ...isolationScope.getPropagationContext(),
          ...scope.getPropagationContext(),
        };
  
        // eslint-disable-next-line deprecation/deprecation
        span = hub.startTransaction({
          traceId,
          parentSpanId,
          parentSampled: sampled,
          ...ctx,
          metadata: {
            dynamicSamplingContext: dsc,
            // eslint-disable-next-line deprecation/deprecation
            ...ctx.metadata,
          },
        });
      }
  
      setCapturedScopesOnSpan(span, scope, isolationScope);
  
      return span;
    }
  
    /**
     * This converts StartSpanOptions to TransactionContext.
     * For the most part (for now) we accept the same options,
     * but some of them need to be transformed.
     *
     * Eventually the StartSpanOptions will be more aligned with OpenTelemetry.
     */
    function normalizeContext(context) {
      if (context.startTime) {
        const ctx = { ...context };
        ctx.startTimestamp = spanTimeInputToSeconds(context.startTime);
        delete ctx.startTime;
        return ctx;
      }
  
      return context;
    }
  
    const SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
    const ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';
  
    function setCapturedScopesOnSpan(span, scope, isolationScope) {
      if (span) {
        addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, isolationScope);
        addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
      }
    }
  
    /**
     * Grabs the scope and isolation scope off a span that were active when the span was started.
     */
    function getCapturedScopesOnSpan(span) {
      return {
        scope: (span )[SCOPE_ON_START_SPAN_FIELD],
        isolationScope: (span )[ISOLATION_SCOPE_ON_START_SPAN_FIELD],
      };
    }
  
    /**
     * key: bucketKey
     * value: [exportKey, MetricSummary]
     */
  
    let SPAN_METRIC_SUMMARY;
  
    function getMetricStorageForSpan(span) {
      return SPAN_METRIC_SUMMARY ? SPAN_METRIC_SUMMARY.get(span) : undefined;
    }
  
    /**
     * Fetches the metric summary if it exists for the passed span
     */
    function getMetricSummaryJsonForSpan(span) {
      const storage = getMetricStorageForSpan(span);
  
      if (!storage) {
        return undefined;
      }
      const output = {};
  
      for (const [, [exportKey, summary]] of storage) {
        if (!output[exportKey]) {
          output[exportKey] = [];
        }
  
        output[exportKey].push(dropUndefinedKeys(summary));
      }
  
      return output;
    }
  
    /**
     * Updates the metric summary on the currently active span
     */
    function updateMetricSummaryOnActiveSpan(
      metricType,
      sanitizedName,
      value,
      unit,
      tags,
      bucketKey,
    ) {
      const span = getActiveSpan();
      if (span) {
        const storage = getMetricStorageForSpan(span) || new Map();
  
        const exportKey = `${metricType}:${sanitizedName}@${unit}`;
        const bucketItem = storage.get(bucketKey);
  
        if (bucketItem) {
          const [, summary] = bucketItem;
          storage.set(bucketKey, [
            exportKey,
            {
              min: Math.min(summary.min, value),
              max: Math.max(summary.max, value),
              count: (summary.count += 1),
              sum: (summary.sum += value),
              tags: summary.tags,
            },
          ]);
        } else {
          storage.set(bucketKey, [
            exportKey,
            {
              min: value,
              max: value,
              count: 1,
              sum: value,
              tags,
            },
          ]);
        }
  
        if (!SPAN_METRIC_SUMMARY) {
          SPAN_METRIC_SUMMARY = new WeakMap();
        }
  
        SPAN_METRIC_SUMMARY.set(span, storage);
      }
    }
  
    /**
     * Use this attribute to represent the source of a span.
     * Should be one of: custom, url, route, view, component, task, unknown
     *
     */
    const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = 'sentry.source';
  
    /**
     * Use this attribute to represent the sample rate used for a span.
     */
    const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = 'sentry.sample_rate';
  
    /**
     * Use this attribute to represent the operation of a span.
     */
    const SEMANTIC_ATTRIBUTE_SENTRY_OP = 'sentry.op';
  
    /**
     * Use this attribute to represent the origin of a span.
     */
    const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = 'sentry.origin';
  
    /**
     * Keeps track of finished spans for a given transaction
     * @internal
     * @hideconstructor
     * @hidden
     */
    class SpanRecorder {
  
       constructor(maxlen = 1000) {
        this._maxlen = maxlen;
        this.spans = [];
      }
  
      /**
       * This is just so that we don't run out of memory while recording a lot
       * of spans. At some point we just stop and flush out the start of the
       * trace tree (i.e.the first n spans with the smallest
       * start_timestamp).
       */
       add(span) {
        if (this.spans.length > this._maxlen) {
          // eslint-disable-next-line deprecation/deprecation
          span.spanRecorder = undefined;
        } else {
          this.spans.push(span);
        }
      }
    }
  
    /**
     * Span contains all data about a span
     */
    class Span  {
      /**
       * Tags for the span.
       * @deprecated Use `spanToJSON(span).atttributes` instead.
       */
  
      /**
       * Data for the span.
       * @deprecated Use `spanToJSON(span).atttributes` instead.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  
      /**
       * List of spans that were finalized
       *
       * @deprecated This property will no longer be public. Span recording will be handled internally.
       */
  
      /**
       * @inheritDoc
       * @deprecated Use top level `Sentry.getRootSpan()` instead
       */
  
      /**
       * The instrumenter that created this span.
       *
       * TODO (v8): This can probably be replaced by an `instanceOf` check of the span class.
       *            the instrumenter can only be sentry or otel so we can check the span instance
       *            to verify which one it is and remove this field entirely.
       *
       * @deprecated This field will be removed.
       */
  
      /** Epoch timestamp in seconds when the span started. */
  
      /** Epoch timestamp in seconds when the span ended. */
  
      /** Internal keeper of the status */
  
      /**
       * You should never call the constructor manually, always use `Sentry.startTransaction()`
       * or call `startChild()` on an existing span.
       * @internal
       * @hideconstructor
       * @hidden
       */
       constructor(spanContext = {}) {
        this._traceId = spanContext.traceId || uuid4();
        this._spanId = spanContext.spanId || uuid4().substring(16);
        this._startTime = spanContext.startTimestamp || timestampInSeconds();
        // eslint-disable-next-line deprecation/deprecation
        this.tags = spanContext.tags ? { ...spanContext.tags } : {};
        // eslint-disable-next-line deprecation/deprecation
        this.data = spanContext.data ? { ...spanContext.data } : {};
        // eslint-disable-next-line deprecation/deprecation
        this.instrumenter = spanContext.instrumenter || 'sentry';
  
        this._attributes = {};
        this.setAttributes({
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanContext.origin || 'manual',
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op,
          ...spanContext.attributes,
        });
  
        // eslint-disable-next-line deprecation/deprecation
        this._name = spanContext.name || spanContext.description;
  
        if (spanContext.parentSpanId) {
          this._parentSpanId = spanContext.parentSpanId;
        }
        // We want to include booleans as well here
        if ('sampled' in spanContext) {
          this._sampled = spanContext.sampled;
        }
        if (spanContext.status) {
          this._status = spanContext.status;
        }
        if (spanContext.endTimestamp) {
          this._endTime = spanContext.endTimestamp;
        }
      }
  
      // This rule conflicts with another eslint rule :(
      /* eslint-disable @typescript-eslint/member-ordering */
  
      /**
       * An alias for `description` of the Span.
       * @deprecated Use `spanToJSON(span).description` instead.
       */
       get name() {
        return this._name || '';
      }
  
      /**
       * Update the name of the span.
       * @deprecated Use `spanToJSON(span).description` instead.
       */
       set name(name) {
        this.updateName(name);
      }
  
      /**
       * Get the description of the Span.
       * @deprecated Use `spanToJSON(span).description` instead.
       */
       get description() {
        return this._name;
      }
  
      /**
       * Get the description of the Span.
       * @deprecated Use `spanToJSON(span).description` instead.
       */
       set description(description) {
        this._name = description;
      }
  
      /**
       * The ID of the trace.
       * @deprecated Use `spanContext().traceId` instead.
       */
       get traceId() {
        return this._traceId;
      }
  
      /**
       * The ID of the trace.
       * @deprecated You cannot update the traceId of a span after span creation.
       */
       set traceId(traceId) {
        this._traceId = traceId;
      }
  
      /**
       * The ID of the span.
       * @deprecated Use `spanContext().spanId` instead.
       */
       get spanId() {
        return this._spanId;
      }
  
      /**
       * The ID of the span.
       * @deprecated You cannot update the spanId of a span after span creation.
       */
       set spanId(spanId) {
        this._spanId = spanId;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `startSpan` functions instead.
       */
       set parentSpanId(string) {
        this._parentSpanId = string;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `spanToJSON(span).parent_span_id` instead.
       */
       get parentSpanId() {
        return this._parentSpanId;
      }
  
      /**
       * Was this span chosen to be sent as part of the sample?
       * @deprecated Use `isRecording()` instead.
       */
       get sampled() {
        return this._sampled;
      }
  
      /**
       * Was this span chosen to be sent as part of the sample?
       * @deprecated You cannot update the sampling decision of a span after span creation.
       */
       set sampled(sampled) {
        this._sampled = sampled;
      }
  
      /**
       * Attributes for the span.
       * @deprecated Use `spanToJSON(span).atttributes` instead.
       */
       get attributes() {
        return this._attributes;
      }
  
      /**
       * Attributes for the span.
       * @deprecated Use `setAttributes()` instead.
       */
       set attributes(attributes) {
        this._attributes = attributes;
      }
  
      /**
       * Timestamp in seconds (epoch time) indicating when the span started.
       * @deprecated Use `spanToJSON()` instead.
       */
       get startTimestamp() {
        return this._startTime;
      }
  
      /**
       * Timestamp in seconds (epoch time) indicating when the span started.
       * @deprecated In v8, you will not be able to update the span start time after creation.
       */
       set startTimestamp(startTime) {
        this._startTime = startTime;
      }
  
      /**
       * Timestamp in seconds when the span ended.
       * @deprecated Use `spanToJSON()` instead.
       */
       get endTimestamp() {
        return this._endTime;
      }
  
      /**
       * Timestamp in seconds when the span ended.
       * @deprecated Set the end time via `span.end()` instead.
       */
       set endTimestamp(endTime) {
        this._endTime = endTime;
      }
  
      /**
       * The status of the span.
       *
       * @deprecated Use `spanToJSON().status` instead to get the status.
       */
       get status() {
        return this._status;
      }
  
      /**
       * The status of the span.
       *
       * @deprecated Use `.setStatus()` instead to set or update the status.
       */
       set status(status) {
        this._status = status;
      }
  
      /**
       * Operation of the span
       *
       * @deprecated Use `spanToJSON().op` to read the op instead.
       */
       get op() {
        return this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] ;
      }
  
      /**
       * Operation of the span
       *
       * @deprecated Use `startSpan()` functions to set or `span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, 'op')
       *             to update the span instead.
       */
       set op(op) {
        this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, op);
      }
  
      /**
       * The origin of the span, giving context about what created the span.
       *
       * @deprecated Use `spanToJSON().origin` to read the origin instead.
       */
       get origin() {
        return this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] ;
      }
  
      /**
       * The origin of the span, giving context about what created the span.
       *
       * @deprecated Use `startSpan()` functions to set the origin instead.
       */
       set origin(origin) {
        this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
      }
  
      /* eslint-enable @typescript-eslint/member-ordering */
  
      /** @inheritdoc */
       spanContext() {
        const { _spanId: spanId, _traceId: traceId, _sampled: sampled } = this;
        return {
          spanId,
          traceId,
          traceFlags: sampled ? TRACE_FLAG_SAMPLED : TRACE_FLAG_NONE,
        };
      }
  
      /**
       * Creates a new `Span` while setting the current `Span.id` as `parentSpanId`.
       * Also the `sampled` decision will be inherited.
       *
       * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
       */
       startChild(
        spanContext,
      ) {
        const childSpan = new Span({
          ...spanContext,
          parentSpanId: this._spanId,
          sampled: this._sampled,
          traceId: this._traceId,
        });
  
        // eslint-disable-next-line deprecation/deprecation
        childSpan.spanRecorder = this.spanRecorder;
        // eslint-disable-next-line deprecation/deprecation
        if (childSpan.spanRecorder) {
          // eslint-disable-next-line deprecation/deprecation
          childSpan.spanRecorder.add(childSpan);
        }
  
        const rootSpan = getRootSpan(this);
        // TODO: still set span.transaction here until we have a more permanent solution
        // Probably similarly to the weakmap we hold in node-experimental
        // eslint-disable-next-line deprecation/deprecation
        childSpan.transaction = rootSpan ;
  
        if (DEBUG_BUILD$2 && rootSpan) {
          const opStr = (spanContext && spanContext.op) || '< unknown op >';
          const nameStr = spanToJSON(childSpan).description || '< unknown name >';
          const idStr = rootSpan.spanContext().spanId;
  
          const logMessage = `[Tracing] Starting '${opStr}' span on transaction '${nameStr}' (${idStr}).`;
          logger.log(logMessage);
          this._logMessage = logMessage;
        }
  
        return childSpan;
      }
  
      /**
       * Sets the tag attribute on the current span.
       *
       * Can also be used to unset a tag, by passing `undefined`.
       *
       * @param key Tag key
       * @param value Tag value
       * @deprecated Use `setAttribute()` instead.
       */
       setTag(key, value) {
        // eslint-disable-next-line deprecation/deprecation
        this.tags = { ...this.tags, [key]: value };
        return this;
      }
  
      /**
       * Sets the data attribute on the current span
       * @param key Data key
       * @param value Data value
       * @deprecated Use `setAttribute()` instead.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       setData(key, value) {
        // eslint-disable-next-line deprecation/deprecation
        this.data = { ...this.data, [key]: value };
        return this;
      }
  
      /** @inheritdoc */
       setAttribute(key, value) {
        if (value === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this._attributes[key];
        } else {
          this._attributes[key] = value;
        }
      }
  
      /** @inheritdoc */
       setAttributes(attributes) {
        Object.keys(attributes).forEach(key => this.setAttribute(key, attributes[key]));
      }
  
      /**
       * @inheritDoc
       */
       setStatus(value) {
        this._status = value;
        return this;
      }
  
      /**
       * @inheritDoc
       * @deprecated Use top-level `setHttpStatus()` instead.
       */
       setHttpStatus(httpStatus) {
        setHttpStatus(this, httpStatus);
        return this;
      }
  
      /**
       * @inheritdoc
       *
       * @deprecated Use `.updateName()` instead.
       */
       setName(name) {
        this.updateName(name);
      }
  
      /**
       * @inheritDoc
       */
       updateName(name) {
        this._name = name;
        return this;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `spanToJSON(span).status === 'ok'` instead.
       */
       isSuccess() {
        return this._status === 'ok';
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `.end()` instead.
       */
       finish(endTimestamp) {
        return this.end(endTimestamp);
      }
  
      /** @inheritdoc */
       end(endTimestamp) {
        // If already ended, skip
        if (this._endTime) {
          return;
        }
        const rootSpan = getRootSpan(this);
        if (
          DEBUG_BUILD$2 &&
          // Don't call this for transactions
          rootSpan &&
          rootSpan.spanContext().spanId !== this._spanId
        ) {
          const logMessage = this._logMessage;
          if (logMessage) {
            logger.log((logMessage ).replace('Starting', 'Finishing'));
          }
        }
  
        this._endTime = spanTimeInputToSeconds(endTimestamp);
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `spanToTraceHeader()` instead.
       */
       toTraceparent() {
        return spanToTraceHeader(this);
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `spanToJSON()` or access the fields directly instead.
       */
       toContext() {
        return dropUndefinedKeys({
          data: this._getData(),
          description: this._name,
          endTimestamp: this._endTime,
          // eslint-disable-next-line deprecation/deprecation
          op: this.op,
          parentSpanId: this._parentSpanId,
          sampled: this._sampled,
          spanId: this._spanId,
          startTimestamp: this._startTime,
          status: this._status,
          // eslint-disable-next-line deprecation/deprecation
          tags: this.tags,
          traceId: this._traceId,
        });
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Update the fields directly instead.
       */
       updateWithContext(spanContext) {
        // eslint-disable-next-line deprecation/deprecation
        this.data = spanContext.data || {};
        // eslint-disable-next-line deprecation/deprecation
        this._name = spanContext.name || spanContext.description;
        this._endTime = spanContext.endTimestamp;
        // eslint-disable-next-line deprecation/deprecation
        this.op = spanContext.op;
        this._parentSpanId = spanContext.parentSpanId;
        this._sampled = spanContext.sampled;
        this._spanId = spanContext.spanId || this._spanId;
        this._startTime = spanContext.startTimestamp || this._startTime;
        this._status = spanContext.status;
        // eslint-disable-next-line deprecation/deprecation
        this.tags = spanContext.tags || {};
        this._traceId = spanContext.traceId || this._traceId;
  
        return this;
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use `spanToTraceContext()` util function instead.
       */
       getTraceContext() {
        return spanToTraceContext(this);
      }
  
      /**
       * Get JSON representation of this span.
       *
       * @hidden
       * @internal This method is purely for internal purposes and should not be used outside
       * of SDK code. If you need to get a JSON representation of a span,
       * use `spanToJSON(span)` instead.
       */
       getSpanJSON() {
        return dropUndefinedKeys({
          data: this._getData(),
          description: this._name,
          op: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] ,
          parent_span_id: this._parentSpanId,
          span_id: this._spanId,
          start_timestamp: this._startTime,
          status: this._status,
          // eslint-disable-next-line deprecation/deprecation
          tags: Object.keys(this.tags).length > 0 ? this.tags : undefined,
          timestamp: this._endTime,
          trace_id: this._traceId,
          origin: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] ,
          _metrics_summary: getMetricSummaryJsonForSpan(this),
        });
      }
  
      /** @inheritdoc */
       isRecording() {
        return !this._endTime && !!this._sampled;
      }
  
      /**
       * Convert the object to JSON.
       * @deprecated Use `spanToJSON(span)` instead.
       */
       toJSON() {
        return this.getSpanJSON();
      }
  
      /**
       * Get the merged data for this span.
       * For now, this combines `data` and `attributes` together,
       * until eventually we can ingest `attributes` directly.
       */
       _getData()
  
     {
        // eslint-disable-next-line deprecation/deprecation
        const { data, _attributes: attributes } = this;
  
        const hasData = Object.keys(data).length > 0;
        const hasAttributes = Object.keys(attributes).length > 0;
  
        if (!hasData && !hasAttributes) {
          return undefined;
        }
  
        if (hasData && hasAttributes) {
          return {
            ...data,
            ...attributes,
          };
        }
  
        return hasData ? data : attributes;
      }
    }
  
    /** JSDoc */
    class Transaction extends Span  {
      /**
       * The reference to the current hub.
       */
  
      // DO NOT yet remove this property, it is used in a hack for v7 backwards compatibility.
  
      /**
       * This constructor should never be called manually. Those instrumenting tracing should use
       * `Sentry.startTransaction()`, and internal methods should use `hub.startTransaction()`.
       * @internal
       * @hideconstructor
       * @hidden
       *
       * @deprecated Transactions will be removed in v8. Use spans instead.
       */
       constructor(transactionContext, hub) {
        super(transactionContext);
        this._measurements = {};
        this._contexts = {};
  
        // eslint-disable-next-line deprecation/deprecation
        this._hub = hub || getCurrentHub();
  
        this._name = transactionContext.name || '';
  
        this._metadata = {
          // eslint-disable-next-line deprecation/deprecation
          ...transactionContext.metadata,
        };
  
        this._trimEnd = transactionContext.trimEnd;
  
        // this is because transactions are also spans, and spans have a transaction pointer
        // TODO (v8): Replace this with another way to set the root span
        // eslint-disable-next-line deprecation/deprecation
        this.transaction = this;
  
        // If Dynamic Sampling Context is provided during the creation of the transaction, we freeze it as it usually means
        // there is incoming Dynamic Sampling Context. (Either through an incoming request, a baggage meta-tag, or other means)
        const incomingDynamicSamplingContext = this._metadata.dynamicSamplingContext;
        if (incomingDynamicSamplingContext) {
          // We shallow copy this in case anything writes to the original reference of the passed in `dynamicSamplingContext`
          this._frozenDynamicSamplingContext = { ...incomingDynamicSamplingContext };
        }
      }
  
      // This sadly conflicts with the getter/setter ordering :(
      /* eslint-disable @typescript-eslint/member-ordering */
  
      /**
       * Getter for `name` property.
       * @deprecated Use `spanToJSON(span).description` instead.
       */
       get name() {
        return this._name;
      }
  
      /**
       * Setter for `name` property, which also sets `source` as custom.
       * @deprecated Use `updateName()` and `setMetadata()` instead.
       */
       set name(newName) {
        // eslint-disable-next-line deprecation/deprecation
        this.setName(newName);
      }
  
      /**
       * Get the metadata for this transaction.
       * @deprecated Use `spanGetMetadata(transaction)` instead.
       */
       get metadata() {
        // We merge attributes in for backwards compatibility
        return {
          // Defaults
          // eslint-disable-next-line deprecation/deprecation
          source: 'custom',
          spanMetadata: {},
  
          // Legacy metadata
          ...this._metadata,
  
          // From attributes
          ...(this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] && {
            source: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] ,
          }),
          ...(this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE] && {
            sampleRate: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE] ,
          }),
        };
      }
  
      /**
       * Update the metadata for this transaction.
       * @deprecated Use `spanGetMetadata(transaction)` instead.
       */
       set metadata(metadata) {
        this._metadata = metadata;
      }
  
      /* eslint-enable @typescript-eslint/member-ordering */
  
      /**
       * Setter for `name` property, which also sets `source` on the metadata.
       *
       * @deprecated Use `.updateName()` and `.setAttribute()` instead.
       */
       setName(name, source = 'custom') {
        this._name = name;
        this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, source);
      }
  
      /** @inheritdoc */
       updateName(name) {
        this._name = name;
        return this;
      }
  
      /**
       * Attaches SpanRecorder to the span itself
       * @param maxlen maximum number of spans that can be recorded
       */
       initSpanRecorder(maxlen = 1000) {
        // eslint-disable-next-line deprecation/deprecation
        if (!this.spanRecorder) {
          // eslint-disable-next-line deprecation/deprecation
          this.spanRecorder = new SpanRecorder(maxlen);
        }
        // eslint-disable-next-line deprecation/deprecation
        this.spanRecorder.add(this);
      }
  
      /**
       * Set the context of a transaction event.
       * @deprecated Use either `.setAttribute()`, or set the context on the scope before creating the transaction.
       */
       setContext(key, context) {
        if (context === null) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this._contexts[key];
        } else {
          this._contexts[key] = context;
        }
      }
  
      /**
       * @inheritDoc
       *
       * @deprecated Use top-level `setMeasurement()` instead.
       */
       setMeasurement(name, value, unit = '') {
        this._measurements[name] = { value, unit };
      }
  
      /**
       * Store metadata on this transaction.
       * @deprecated Use attributes or store data on the scope instead.
       */
       setMetadata(newMetadata) {
        this._metadata = { ...this._metadata, ...newMetadata };
      }
  
      /**
       * @inheritDoc
       */
       end(endTimestamp) {
        const timestampInS = spanTimeInputToSeconds(endTimestamp);
        const transaction = this._finishTransaction(timestampInS);
        if (!transaction) {
          return undefined;
        }
        // eslint-disable-next-line deprecation/deprecation
        return this._hub.captureEvent(transaction);
      }
  
      /**
       * @inheritDoc
       */
       toContext() {
        // eslint-disable-next-line deprecation/deprecation
        const spanContext = super.toContext();
  
        return dropUndefinedKeys({
          ...spanContext,
          name: this._name,
          trimEnd: this._trimEnd,
        });
      }
  
      /**
       * @inheritDoc
       */
       updateWithContext(transactionContext) {
        // eslint-disable-next-line deprecation/deprecation
        super.updateWithContext(transactionContext);
  
        this._name = transactionContext.name || '';
        this._trimEnd = transactionContext.trimEnd;
  
        return this;
      }
  
      /**
       * @inheritdoc
       *
       * @experimental
       *
       * @deprecated Use top-level `getDynamicSamplingContextFromSpan` instead.
       */
       getDynamicSamplingContext() {
        return getDynamicSamplingContextFromSpan(this);
      }
  
      /**
       * Override the current hub with a new one.
       * Used if you want another hub to finish the transaction.
       *
       * @internal
       */
       setHub(hub) {
        this._hub = hub;
      }
  
      /**
       * Finish the transaction & prepare the event to send to Sentry.
       */
       _finishTransaction(endTimestamp) {
        // This transaction is already finished, so we should not flush it again.
        if (this._endTime !== undefined) {
          return undefined;
        }
  
        if (!this._name) {
          logger.warn('Transaction has no name, falling back to `<unlabeled transaction>`.');
          this._name = '<unlabeled transaction>';
        }
  
        // just sets the end timestamp
        super.end(endTimestamp);
  
        // eslint-disable-next-line deprecation/deprecation
        const client = this._hub.getClient();
        if (client && client.emit) {
          client.emit('finishTransaction', this);
        }
  
        if (this._sampled !== true) {
          // At this point if `sampled !== true` we want to discard the transaction.
          logger.log('[Tracing] Discarding transaction because its trace was not chosen to be sampled.');
  
          if (client) {
            client.recordDroppedEvent('sample_rate', 'transaction');
          }
  
          return undefined;
        }
  
        // eslint-disable-next-line deprecation/deprecation
        const finishedSpans = this.spanRecorder
          ? // eslint-disable-next-line deprecation/deprecation
            this.spanRecorder.spans.filter(span => span !== this && spanToJSON(span).timestamp)
          : [];
  
        if (this._trimEnd && finishedSpans.length > 0) {
          const endTimes = finishedSpans.map(span => spanToJSON(span).timestamp).filter(Boolean) ;
          this._endTime = endTimes.reduce((prev, current) => {
            return prev > current ? prev : current;
          });
        }
  
        const { scope: capturedSpanScope, isolationScope: capturedSpanIsolationScope } = getCapturedScopesOnSpan(this);
  
        // eslint-disable-next-line deprecation/deprecation
        const { metadata } = this;
        // eslint-disable-next-line deprecation/deprecation
        const { source } = metadata;
  
        const transaction = {
          contexts: {
            ...this._contexts,
            // We don't want to override trace context
            trace: spanToTraceContext(this),
          },
          // TODO: Pass spans serialized via `spanToJSON()` here instead in v8.
          spans: finishedSpans,
          start_timestamp: this._startTime,
          // eslint-disable-next-line deprecation/deprecation
          tags: this.tags,
          timestamp: this._endTime,
          transaction: this._name,
          type: 'transaction',
          sdkProcessingMetadata: {
            ...metadata,
            capturedSpanScope,
            capturedSpanIsolationScope,
            dynamicSamplingContext: getDynamicSamplingContextFromSpan(this),
          },
          _metrics_summary: getMetricSummaryJsonForSpan(this),
          ...(source && {
            transaction_info: {
              source,
            },
          }),
        };
  
        const hasMeasurements = Object.keys(this._measurements).length > 0;
  
        if (hasMeasurements) {
          logger.log(
              '[Measurements] Adding measurements to transaction',
              JSON.stringify(this._measurements, undefined, 2),
            );
          transaction.measurements = this._measurements;
        }
  
        // eslint-disable-next-line deprecation/deprecation
        logger.log(`[Tracing] Finishing ${this.op} transaction: ${this._name}.`);
  
        return transaction;
      }
    }
  
    const TRACING_DEFAULTS = {
      idleTimeout: 1000,
      finalTimeout: 30000,
      heartbeatInterval: 5000,
    };
  
    const FINISH_REASON_TAG = 'finishReason';
  
    const IDLE_TRANSACTION_FINISH_REASONS = [
      'heartbeatFailed',
      'idleTimeout',
      'documentHidden',
      'finalTimeout',
      'externalFinish',
      'cancelled',
    ];
  
    /**
     * @inheritDoc
     */
    class IdleTransactionSpanRecorder extends SpanRecorder {
       constructor(
          _pushActivity,
          _popActivity,
         transactionSpanId,
        maxlen,
      ) {
        super(maxlen);this._pushActivity = _pushActivity;this._popActivity = _popActivity;this.transactionSpanId = transactionSpanId;  }
  
      /**
       * @inheritDoc
       */
       add(span) {
        // We should make sure we do not push and pop activities for
        // the transaction that this span recorder belongs to.
        if (span.spanContext().spanId !== this.transactionSpanId) {
          // We patch span.end() to pop an activity after setting an endTimestamp.
          // eslint-disable-next-line @typescript-eslint/unbound-method
          const originalEnd = span.end;
          span.end = (...rest) => {
            this._popActivity(span.spanContext().spanId);
            return originalEnd.apply(span, rest);
          };
  
          // We should only push new activities if the span does not have an end timestamp.
          if (spanToJSON(span).timestamp === undefined) {
            this._pushActivity(span.spanContext().spanId);
          }
        }
  
        super.add(span);
      }
    }
  
    /**
     * An IdleTransaction is a transaction that automatically finishes. It does this by tracking child spans as activities.
     * You can have multiple IdleTransactions active, but if the `onScope` option is specified, the idle transaction will
     * put itself on the scope on creation.
     */
    class IdleTransaction extends Transaction {
      // Activities store a list of active spans
  
      // Track state of activities in previous heartbeat
  
      // Amount of times heartbeat has counted. Will cause transaction to finish after 3 beats.
  
      // We should not use heartbeat if we finished a transaction
  
      // Idle timeout was canceled and we should finish the transaction with the last span end.
  
      /**
       * Timer that tracks Transaction idleTimeout
       */
  
      /**
       * @deprecated Transactions will be removed in v8. Use spans instead.
       */
       constructor(
        transactionContext,
          _idleHub,
        /**
         * The time to wait in ms until the idle transaction will be finished. This timer is started each time
         * there are no active spans on this transaction.
         */
          _idleTimeout = TRACING_DEFAULTS.idleTimeout,
        /**
         * The final value in ms that a transaction cannot exceed
         */
          _finalTimeout = TRACING_DEFAULTS.finalTimeout,
          _heartbeatInterval = TRACING_DEFAULTS.heartbeatInterval,
        // Whether or not the transaction should put itself on the scope when it starts and pop itself off when it ends
          _onScope = false,
        /**
         * When set to `true`, will disable the idle timeout (`_idleTimeout` option) and heartbeat mechanisms (`_heartbeatInterval`
         * option) until the `sendAutoFinishSignal()` method is called. The final timeout mechanism (`_finalTimeout` option)
         * will not be affected by this option, meaning the transaction will definitely be finished when the final timeout is
         * reached, no matter what this option is configured to.
         *
         * Defaults to `false`.
         */
        delayAutoFinishUntilSignal = false,
      ) {
        super(transactionContext, _idleHub);this._idleHub = _idleHub;this._idleTimeout = _idleTimeout;this._finalTimeout = _finalTimeout;this._heartbeatInterval = _heartbeatInterval;this._onScope = _onScope;
        this.activities = {};
        this._heartbeatCounter = 0;
        this._finished = false;
        this._idleTimeoutCanceledPermanently = false;
        this._beforeFinishCallbacks = [];
        this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[4];
        this._autoFinishAllowed = !delayAutoFinishUntilSignal;
  
        if (_onScope) {
          // We set the transaction here on the scope so error events pick up the trace
          // context and attach it to the error.
          logger.log(`Setting idle transaction on scope. Span ID: ${this.spanContext().spanId}`);
          // eslint-disable-next-line deprecation/deprecation
          _idleHub.getScope().setSpan(this);
        }
  
        if (!delayAutoFinishUntilSignal) {
          this._restartIdleTimeout();
        }
  
        setTimeout(() => {
          if (!this._finished) {
            this.setStatus('deadline_exceeded');
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[3];
            this.end();
          }
        }, this._finalTimeout);
      }
  
      /** {@inheritDoc} */
       end(endTimestamp) {
        const endTimestampInS = spanTimeInputToSeconds(endTimestamp);
  
        this._finished = true;
        this.activities = {};
  
        // eslint-disable-next-line deprecation/deprecation
        if (this.op === 'ui.action.click') {
          this.setAttribute(FINISH_REASON_TAG, this._finishReason);
        }
  
        // eslint-disable-next-line deprecation/deprecation
        if (this.spanRecorder) {
          // eslint-disable-next-line deprecation/deprecation
            logger.log('[Tracing] finishing IdleTransaction', new Date(endTimestampInS * 1000).toISOString(), this.op);
  
          for (const callback of this._beforeFinishCallbacks) {
            callback(this, endTimestampInS);
          }
  
          // eslint-disable-next-line deprecation/deprecation
          this.spanRecorder.spans = this.spanRecorder.spans.filter((span) => {
            // If we are dealing with the transaction itself, we just return it
            if (span.spanContext().spanId === this.spanContext().spanId) {
              return true;
            }
  
            // We cancel all pending spans with status "cancelled" to indicate the idle transaction was finished early
            if (!spanToJSON(span).timestamp) {
              span.setStatus('cancelled');
              span.end(endTimestampInS);
              logger.log('[Tracing] cancelling span since transaction ended early', JSON.stringify(span, undefined, 2));
            }
  
            const { start_timestamp: startTime, timestamp: endTime } = spanToJSON(span);
            const spanStartedBeforeTransactionFinish = startTime && startTime < endTimestampInS;
  
            // Add a delta with idle timeout so that we prevent false positives
            const timeoutWithMarginOfError = (this._finalTimeout + this._idleTimeout) / 1000;
            const spanEndedBeforeFinalTimeout = endTime && startTime && endTime - startTime < timeoutWithMarginOfError;
  
            {
              const stringifiedSpan = JSON.stringify(span, undefined, 2);
              if (!spanStartedBeforeTransactionFinish) {
                logger.log('[Tracing] discarding Span since it happened after Transaction was finished', stringifiedSpan);
              } else if (!spanEndedBeforeFinalTimeout) {
                logger.log('[Tracing] discarding Span since it finished after Transaction final timeout', stringifiedSpan);
              }
            }
  
            return spanStartedBeforeTransactionFinish && spanEndedBeforeFinalTimeout;
          });
  
          logger.log('[Tracing] flushing IdleTransaction');
        } else {
          logger.log('[Tracing] No active IdleTransaction');
        }
  
        // if `this._onScope` is `true`, the transaction put itself on the scope when it started
        if (this._onScope) {
          // eslint-disable-next-line deprecation/deprecation
          const scope = this._idleHub.getScope();
          // eslint-disable-next-line deprecation/deprecation
          if (scope.getTransaction() === this) {
            // eslint-disable-next-line deprecation/deprecation
            scope.setSpan(undefined);
          }
        }
  
        return super.end(endTimestamp);
      }
  
      /**
       * Register a callback function that gets executed before the transaction finishes.
       * Useful for cleanup or if you want to add any additional spans based on current context.
       *
       * This is exposed because users have no other way of running something before an idle transaction
       * finishes.
       */
       registerBeforeFinishCallback(callback) {
        this._beforeFinishCallbacks.push(callback);
      }
  
      /**
       * @inheritDoc
       */
       initSpanRecorder(maxlen) {
        // eslint-disable-next-line deprecation/deprecation
        if (!this.spanRecorder) {
          const pushActivity = (id) => {
            if (this._finished) {
              return;
            }
            this._pushActivity(id);
          };
          const popActivity = (id) => {
            if (this._finished) {
              return;
            }
            this._popActivity(id);
          };
  
          // eslint-disable-next-line deprecation/deprecation
          this.spanRecorder = new IdleTransactionSpanRecorder(pushActivity, popActivity, this.spanContext().spanId, maxlen);
  
          // Start heartbeat so that transactions do not run forever.
          logger.log('Starting heartbeat');
          this._pingHeartbeat();
        }
        // eslint-disable-next-line deprecation/deprecation
        this.spanRecorder.add(this);
      }
  
      /**
       * Cancels the existing idle timeout, if there is one.
       * @param restartOnChildSpanChange Default is `true`.
       *                                 If set to false the transaction will end
       *                                 with the last child span.
       */
       cancelIdleTimeout(
        endTimestamp,
        {
          restartOnChildSpanChange,
        }
  
     = {
          restartOnChildSpanChange: true,
        },
      ) {
        this._idleTimeoutCanceledPermanently = restartOnChildSpanChange === false;
        if (this._idleTimeoutID) {
          clearTimeout(this._idleTimeoutID);
          this._idleTimeoutID = undefined;
  
          if (Object.keys(this.activities).length === 0 && this._idleTimeoutCanceledPermanently) {
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[5];
            this.end(endTimestamp);
          }
        }
      }
  
      /**
       * Temporary method used to externally set the transaction's `finishReason`
       *
       * ** WARNING**
       * This is for the purpose of experimentation only and will be removed in the near future, do not use!
       *
       * @internal
       *
       */
       setFinishReason(reason) {
        this._finishReason = reason;
      }
  
      /**
       * Permits the IdleTransaction to automatically end itself via the idle timeout and heartbeat mechanisms when the `delayAutoFinishUntilSignal` option was set to `true`.
       */
       sendAutoFinishSignal() {
        if (!this._autoFinishAllowed) {
          logger.log('[Tracing] Received finish signal for idle transaction.');
          this._restartIdleTimeout();
          this._autoFinishAllowed = true;
        }
      }
  
      /**
       * Restarts idle timeout, if there is no running idle timeout it will start one.
       */
       _restartIdleTimeout(endTimestamp) {
        this.cancelIdleTimeout();
        this._idleTimeoutID = setTimeout(() => {
          if (!this._finished && Object.keys(this.activities).length === 0) {
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[1];
            this.end(endTimestamp);
          }
        }, this._idleTimeout);
      }
  
      /**
       * Start tracking a specific activity.
       * @param spanId The span id that represents the activity
       */
       _pushActivity(spanId) {
        this.cancelIdleTimeout(undefined, { restartOnChildSpanChange: !this._idleTimeoutCanceledPermanently });
        logger.log(`[Tracing] pushActivity: ${spanId}`);
        this.activities[spanId] = true;
        logger.log('[Tracing] new activities count', Object.keys(this.activities).length);
      }
  
      /**
       * Remove an activity from usage
       * @param spanId The span id that represents the activity
       */
       _popActivity(spanId) {
        if (this.activities[spanId]) {
          logger.log(`[Tracing] popActivity ${spanId}`);
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.activities[spanId];
          logger.log('[Tracing] new activities count', Object.keys(this.activities).length);
        }
  
        if (Object.keys(this.activities).length === 0) {
          const endTimestamp = timestampInSeconds();
          if (this._idleTimeoutCanceledPermanently) {
            if (this._autoFinishAllowed) {
              this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[5];
              this.end(endTimestamp);
            }
          } else {
            // We need to add the timeout here to have the real endtimestamp of the transaction
            // Remember timestampInSeconds is in seconds, timeout is in ms
            this._restartIdleTimeout(endTimestamp + this._idleTimeout / 1000);
          }
        }
      }
  
      /**
       * Checks when entries of this.activities are not changing for 3 beats.
       * If this occurs we finish the transaction.
       */
       _beat() {
        // We should not be running heartbeat if the idle transaction is finished.
        if (this._finished) {
          return;
        }
  
        const heartbeatString = Object.keys(this.activities).join('');
  
        if (heartbeatString === this._prevHeartbeatString) {
          this._heartbeatCounter++;
        } else {
          this._heartbeatCounter = 1;
        }
  
        this._prevHeartbeatString = heartbeatString;
  
        if (this._heartbeatCounter >= 3) {
          if (this._autoFinishAllowed) {
            logger.log('[Tracing] Transaction finished because of no change for 3 heart beats');
            this.setStatus('deadline_exceeded');
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[0];
            this.end();
          }
        } else {
          this._pingHeartbeat();
        }
      }
  
      /**
       * Pings the heartbeat
       */
       _pingHeartbeat() {
        logger.log(`pinging Heartbeat -> current counter: ${this._heartbeatCounter}`);
        setTimeout(() => {
          this._beat();
        }, this._heartbeatInterval);
      }
    }
  
    /**
     * Makes a sampling decision for the given transaction and stores it on the transaction.
     *
     * Called every time a transaction is created. Only transactions which emerge with a `sampled` value of `true` will be
     * sent to Sentry.
     *
     * This method muttes the given `transaction` and will set the `sampled` value on it.
     * It returns the same transaction, for convenience.
     */
    function sampleTransaction(
      transaction,
      options,
      samplingContext,
    ) {
      // nothing to do if tracing is not enabled
      if (!hasTracingEnabled(options)) {
        // eslint-disable-next-line deprecation/deprecation
        transaction.sampled = false;
        return transaction;
      }
  
      // if the user has forced a sampling decision by passing a `sampled` value in their transaction context, go with that
      // eslint-disable-next-line deprecation/deprecation
      if (transaction.sampled !== undefined) {
        // eslint-disable-next-line deprecation/deprecation
        transaction.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, Number(transaction.sampled));
        return transaction;
      }
  
      // we would have bailed already if neither `tracesSampler` nor `tracesSampleRate` nor `enableTracing` were defined, so one of these should
      // work; prefer the hook if so
      let sampleRate;
      if (typeof options.tracesSampler === 'function') {
        sampleRate = options.tracesSampler(samplingContext);
        transaction.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, Number(sampleRate));
      } else if (samplingContext.parentSampled !== undefined) {
        sampleRate = samplingContext.parentSampled;
      } else if (typeof options.tracesSampleRate !== 'undefined') {
        sampleRate = options.tracesSampleRate;
        transaction.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, Number(sampleRate));
      } else {
        // When `enableTracing === true`, we use a sample rate of 100%
        sampleRate = 1;
        transaction.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, sampleRate);
      }
  
      // Since this is coming from the user (or from a function provided by the user), who knows what we might get. (The
      // only valid values are booleans or numbers between 0 and 1.)
      if (!isValidSampleRate(sampleRate)) {
        logger.warn('[Tracing] Discarding transaction because of invalid sample rate.');
        // eslint-disable-next-line deprecation/deprecation
        transaction.sampled = false;
        return transaction;
      }
  
      // if the function returned 0 (or false), or if `tracesSampleRate` is 0, it's a sign the transaction should be dropped
      if (!sampleRate) {
        logger.log(
            `[Tracing] Discarding transaction because ${
            typeof options.tracesSampler === 'function'
              ? 'tracesSampler returned 0 or false'
              : 'a negative sampling decision was inherited or tracesSampleRate is set to 0'
          }`,
          );
        // eslint-disable-next-line deprecation/deprecation
        transaction.sampled = false;
        return transaction;
      }
  
      // Now we roll the dice. Math.random is inclusive of 0, but not of 1, so strict < is safe here. In case sampleRate is
      // a boolean, the < comparison will cause it to be automatically cast to 1 if it's true and 0 if it's false.
      // eslint-disable-next-line deprecation/deprecation
      transaction.sampled = Math.random() < (sampleRate );
  
      // if we're not going to keep it, we're done
      // eslint-disable-next-line deprecation/deprecation
      if (!transaction.sampled) {
        logger.log(
            `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
            sampleRate,
          )})`,
          );
        return transaction;
      }
  
      // eslint-disable-next-line deprecation/deprecation
        logger.log(`[Tracing] starting ${transaction.op} transaction - ${spanToJSON(transaction).description}`);
      return transaction;
    }
  
    /**
     * Checks the given sample rate to make sure it is valid type and value (a boolean, or a number between 0 and 1).
     */
    function isValidSampleRate(rate) {
      // we need to check NaN explicitly because it's of type 'number' and therefore wouldn't get caught by this typecheck
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isNaN$1(rate) || !(typeof rate === 'number' || typeof rate === 'boolean')) {
        logger.warn(
            `[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
            rate,
          )} of type ${JSON.stringify(typeof rate)}.`,
          );
        return false;
      }
  
      // in case sampleRate is a boolean, it will get automatically cast to 1 if it's true and 0 if it's false
      if (rate < 0 || rate > 1) {
        logger.warn(`[Tracing] Given sample rate is invalid. Sample rate must be between 0 and 1. Got ${rate}.`);
        return false;
      }
      return true;
    }
  
    /** Returns all trace headers that are currently on the top scope. */
    function traceHeaders() {
      // eslint-disable-next-line deprecation/deprecation
      const scope = this.getScope();
      // eslint-disable-next-line deprecation/deprecation
      const span = scope.getSpan();
  
      return span
        ? {
            'sentry-trace': spanToTraceHeader(span),
          }
        : {};
    }
  
    /**
     * Creates a new transaction and adds a sampling decision if it doesn't yet have one.
     *
     * The Hub.startTransaction method delegates to this method to do its work, passing the Hub instance in as `this`, as if
     * it had been called on the hub directly. Exists as a separate function so that it can be injected into the class as an
     * "extension method."
     *
     * @param this: The Hub starting the transaction
     * @param transactionContext: Data used to configure the transaction
     * @param CustomSamplingContext: Optional data to be provided to the `tracesSampler` function (if any)
     *
     * @returns The new transaction
     *
     * @see {@link Hub.startTransaction}
     */
    function _startTransaction(
  
      transactionContext,
      customSamplingContext,
    ) {
      // eslint-disable-next-line deprecation/deprecation
      const client = this.getClient();
      const options = (client && client.getOptions()) || {};
  
      const configInstrumenter = options.instrumenter || 'sentry';
      const transactionInstrumenter = transactionContext.instrumenter || 'sentry';
  
      if (configInstrumenter !== transactionInstrumenter) {
        logger.error(
            `A transaction was started with instrumenter=\`${transactionInstrumenter}\`, but the SDK is configured with the \`${configInstrumenter}\` instrumenter.
  The transaction will not be sampled. Please use the ${configInstrumenter} instrumentation to start transactions.`,
          );
  
        // eslint-disable-next-line deprecation/deprecation
        transactionContext.sampled = false;
      }
  
      // eslint-disable-next-line deprecation/deprecation
      let transaction = new Transaction(transactionContext, this);
      transaction = sampleTransaction(transaction, options, {
        name: transactionContext.name,
        parentSampled: transactionContext.parentSampled,
        transactionContext,
        attributes: {
          // eslint-disable-next-line deprecation/deprecation
          ...transactionContext.data,
          ...transactionContext.attributes,
        },
        ...customSamplingContext,
      });
      if (transaction.isRecording()) {
        transaction.initSpanRecorder(options._experiments && (options._experiments.maxSpans ));
      }
      if (client && client.emit) {
        client.emit('startTransaction', transaction);
      }
      return transaction;
    }
  
    /**
     * Create new idle transaction.
     */
    function startIdleTransaction(
      hub,
      transactionContext,
      idleTimeout,
      finalTimeout,
      onScope,
      customSamplingContext,
      heartbeatInterval,
      delayAutoFinishUntilSignal = false,
    ) {
      // eslint-disable-next-line deprecation/deprecation
      const client = hub.getClient();
      const options = (client && client.getOptions()) || {};
  
      // eslint-disable-next-line deprecation/deprecation
      let transaction = new IdleTransaction(
        transactionContext,
        hub,
        idleTimeout,
        finalTimeout,
        heartbeatInterval,
        onScope,
        delayAutoFinishUntilSignal,
      );
      transaction = sampleTransaction(transaction, options, {
        name: transactionContext.name,
        parentSampled: transactionContext.parentSampled,
        transactionContext,
        attributes: {
          // eslint-disable-next-line deprecation/deprecation
          ...transactionContext.data,
          ...transactionContext.attributes,
        },
        ...customSamplingContext,
      });
      if (transaction.isRecording()) {
        transaction.initSpanRecorder(options._experiments && (options._experiments.maxSpans ));
      }
      if (client && client.emit) {
        client.emit('startTransaction', transaction);
      }
      return transaction;
    }
  
    /**
     * Adds tracing extensions to the global hub.
     */
    function addTracingExtensions() {
      const carrier = getMainCarrier();
      if (!carrier.__SENTRY__) {
        return;
      }
      carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
      if (!carrier.__SENTRY__.extensions.startTransaction) {
        carrier.__SENTRY__.extensions.startTransaction = _startTransaction;
      }
      if (!carrier.__SENTRY__.extensions.traceHeaders) {
        carrier.__SENTRY__.extensions.traceHeaders = traceHeaders;
      }
  
      registerErrorInstrumentation();
    }
  
    /**
     * Adds a measurement to the current active transaction.
     */
    function setMeasurement(name, value, unit) {
      // eslint-disable-next-line deprecation/deprecation
      const transaction = getActiveTransaction();
      if (transaction) {
        // eslint-disable-next-line deprecation/deprecation
        transaction.setMeasurement(name, value, unit);
      }
    }
  
    /**
     * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
     * Merge with existing data if any.
     **/
    function enhanceEventWithSdkInfo(event, sdkInfo) {
      if (!sdkInfo) {
        return event;
      }
      event.sdk = event.sdk || {};
      event.sdk.name = event.sdk.name || sdkInfo.name;
      event.sdk.version = event.sdk.version || sdkInfo.version;
      event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
      event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
      return event;
    }
  
    /** Creates an envelope from a Session */
    function createSessionEnvelope(
      session,
      dsn,
      metadata,
      tunnel,
    ) {
      const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
      const envelopeHeaders = {
        sent_at: new Date().toISOString(),
        ...(sdkInfo && { sdk: sdkInfo }),
        ...(!!tunnel && dsn && { dsn: dsnToString(dsn) }),
      };
  
      const envelopeItem =
        'aggregates' in session ? [{ type: 'sessions' }, session] : [{ type: 'session' }, session.toJSON()];
  
      return createEnvelope(envelopeHeaders, [envelopeItem]);
    }
  
    /**
     * Create an Envelope from an event.
     */
    function createEventEnvelope(
      event,
      dsn,
      metadata,
      tunnel,
    ) {
      const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  
      /*
        Note: Due to TS, event.type may be `replay_event`, theoretically.
        In practice, we never call `createEventEnvelope` with `replay_event` type,
        and we'd have to adjut a looot of types to make this work properly.
        We want to avoid casting this around, as that could lead to bugs (e.g. when we add another type)
        So the safe choice is to really guard against the replay_event type here.
      */
      const eventType = event.type && event.type !== 'replay_event' ? event.type : 'event';
  
      enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  
      const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  
      // Prevent this data (which, if it exists, was used in earlier steps in the processing pipeline) from being sent to
      // sentry. (Note: Our use of this property comes and goes with whatever we might be debugging, whatever hacks we may
      // have temporarily added, etc. Even if we don't happen to be using it at some point in the future, let's not get rid
      // of this `delete`, lest we miss putting it back in the next time the property is in use.)
      delete event.sdkProcessingMetadata;
  
      const eventItem = [{ type: eventType }, event];
      return createEnvelope(envelopeHeaders, [eventItem]);
    }
  
    const SENTRY_API_VERSION = '7';
  
    /** Returns the prefix to construct Sentry ingestion API endpoints. */
    function getBaseApiEndpoint(dsn) {
      const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
      const port = dsn.port ? `:${dsn.port}` : '';
      return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ''}/api/`;
    }
  
    /** Returns the ingest API endpoint for target. */
    function _getIngestEndpoint(dsn) {
      return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
    }
  
    /** Returns a URL-encoded string with auth config suitable for a query string. */
    function _encodedAuth(dsn, sdkInfo) {
      return urlEncode({
        // We send only the minimum set of required information. See
        // https://github.com/getsentry/sentry-javascript/issues/2572.
        sentry_key: dsn.publicKey,
        sentry_version: SENTRY_API_VERSION,
        ...(sdkInfo && { sentry_client: `${sdkInfo.name}/${sdkInfo.version}` }),
      });
    }
  
    /**
     * Returns the envelope endpoint URL with auth in the query string.
     *
     * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
     */
    function getEnvelopeEndpointWithUrlEncodedAuth(
      dsn,
      // TODO (v8): Remove `tunnelOrOptions` in favor of `options`, and use the substitute code below
      // options: ClientOptions = {} as ClientOptions,
      tunnelOrOptions = {} ,
    ) {
      // TODO (v8): Use this code instead
      // const { tunnel, _metadata = {} } = options;
      // return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, _metadata.sdk)}`;
  
      const tunnel = typeof tunnelOrOptions === 'string' ? tunnelOrOptions : tunnelOrOptions.tunnel;
      const sdkInfo =
        typeof tunnelOrOptions === 'string' || !tunnelOrOptions._metadata ? undefined : tunnelOrOptions._metadata.sdk;
  
      return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
    }
  
    /** Returns the url to the report dialog endpoint. */
    function getReportDialogEndpoint(
      dsnLike,
      dialogOptions
  
    ,
    ) {
      const dsn = makeDsn(dsnLike);
      if (!dsn) {
        return '';
      }
  
      const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;
  
      let encodedOptions = `dsn=${dsnToString(dsn)}`;
      for (const key in dialogOptions) {
        if (key === 'dsn') {
          continue;
        }
  
        if (key === 'onClose') {
          continue;
        }
  
        if (key === 'user') {
          const user = dialogOptions.user;
          if (!user) {
            continue;
          }
          if (user.name) {
            encodedOptions += `&name=${encodeURIComponent(user.name)}`;
          }
          if (user.email) {
            encodedOptions += `&email=${encodeURIComponent(user.email)}`;
          }
        } else {
          encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key] )}`;
        }
      }
  
      return `${endpoint}?${encodedOptions}`;
    }
  
    const installedIntegrations = [];
  
    /** Map of integrations assigned to a client */
  
    /**
     * Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
     * preseve the order of integrations in the array.
     *
     * @private
     */
    function filterDuplicates(integrations) {
      const integrationsByName = {};
  
      integrations.forEach(currentInstance => {
        const { name } = currentInstance;
  
        const existingInstance = integrationsByName[name];
  
        // We want integrations later in the array to overwrite earlier ones of the same type, except that we never want a
        // default instance to overwrite an existing user instance
        if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
          return;
        }
  
        integrationsByName[name] = currentInstance;
      });
  
      return Object.keys(integrationsByName).map(k => integrationsByName[k]);
    }
  
    /** Gets integrations to install */
    function getIntegrationsToSetup(options) {
      const defaultIntegrations = options.defaultIntegrations || [];
      const userIntegrations = options.integrations;
  
      // We flag default instances, so that later we can tell them apart from any user-created instances of the same class
      defaultIntegrations.forEach(integration => {
        integration.isDefaultInstance = true;
      });
  
      let integrations;
  
      if (Array.isArray(userIntegrations)) {
        integrations = [...defaultIntegrations, ...userIntegrations];
      } else if (typeof userIntegrations === 'function') {
        integrations = arrayify(userIntegrations(defaultIntegrations));
      } else {
        integrations = defaultIntegrations;
      }
  
      const finalIntegrations = filterDuplicates(integrations);
  
      // The `Debug` integration prints copies of the `event` and `hint` which will be passed to `beforeSend` or
      // `beforeSendTransaction`. It therefore has to run after all other integrations, so that the changes of all event
      // processors will be reflected in the printed values. For lack of a more elegant way to guarantee that, we therefore
      // locate it and, assuming it exists, pop it out of its current spot and shove it onto the end of the array.
      const debugIndex = findIndex(finalIntegrations, integration => integration.name === 'Debug');
      if (debugIndex !== -1) {
        const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
        finalIntegrations.push(debugInstance);
      }
  
      return finalIntegrations;
    }
  
    /**
     * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
     * integrations are added unless they were already provided before.
     * @param integrations array of integration instances
     * @param withDefault should enable default integrations
     */
    function setupIntegrations(client, integrations) {
      const integrationIndex = {};
  
      integrations.forEach(integration => {
        // guard against empty provided integrations
        if (integration) {
          setupIntegration(client, integration, integrationIndex);
        }
      });
  
      return integrationIndex;
    }
  
    /**
     * Execute the `afterAllSetup` hooks of the given integrations.
     */
    function afterSetupIntegrations(client, integrations) {
      for (const integration of integrations) {
        // guard against empty provided integrations
        if (integration && integration.afterAllSetup) {
          integration.afterAllSetup(client);
        }
      }
    }
  
    /** Setup a single integration.  */
    function setupIntegration(client, integration, integrationIndex) {
      if (integrationIndex[integration.name]) {
        logger.log(`Integration skipped because it was already installed: ${integration.name}`);
        return;
      }
      integrationIndex[integration.name] = integration;
  
      // `setupOnce` is only called the first time
      if (installedIntegrations.indexOf(integration.name) === -1) {
        // eslint-disable-next-line deprecation/deprecation
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        installedIntegrations.push(integration.name);
      }
  
      // `setup` is run for each client
      if (integration.setup && typeof integration.setup === 'function') {
        integration.setup(client);
      }
  
      if (client.on && typeof integration.preprocessEvent === 'function') {
        const callback = integration.preprocessEvent.bind(integration) ;
        client.on('preprocessEvent', (event, hint) => callback(event, hint, client));
      }
  
      if (client.addEventProcessor && typeof integration.processEvent === 'function') {
        const callback = integration.processEvent.bind(integration) ;
  
        const processor = Object.assign((event, hint) => callback(event, hint, client), {
          id: integration.name,
        });
  
        client.addEventProcessor(processor);
      }
  
      logger.log(`Integration installed: ${integration.name}`);
    }
  
    /** Add an integration to the current hub's client. */
    function addIntegration(integration) {
      const client = getClient();
  
      if (!client || !client.addIntegration) {
        DEBUG_BUILD$2 && logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
        return;
      }
  
      client.addIntegration(integration);
    }
  
    // Polyfill for Array.findIndex(), which is not supported in ES5
    function findIndex(arr, callback) {
      for (let i = 0; i < arr.length; i++) {
        if (callback(arr[i]) === true) {
          return i;
        }
      }
  
      return -1;
    }
  
    /**
     * Convert a new integration function to the legacy class syntax.
     * In v8, we can remove this and instead export the integration functions directly.
     *
     * @deprecated This will be removed in v8!
     */
    function convertIntegrationFnToClass(
      name,
      fn,
    ) {
      return Object.assign(
        function ConvertedIntegration(...args) {
          return fn(...args);
        },
        { id: name },
      ) ;
    }
  
    /**
     * Define an integration function that can be used to create an integration instance.
     * Note that this by design hides the implementation details of the integration, as they are considered internal.
     */
    function defineIntegration(fn) {
      return fn;
    }
  
    const COUNTER_METRIC_TYPE = 'c' ;
    const GAUGE_METRIC_TYPE = 'g' ;
    const SET_METRIC_TYPE = 's' ;
    const DISTRIBUTION_METRIC_TYPE = 'd' ;
  
    /**
     * Normalization regex for metric names and metric tag names.
     *
     * This enforces that names and tag keys only contain alphanumeric characters,
     * underscores, forward slashes, periods, and dashes.
     *
     * See: https://develop.sentry.dev/sdk/metrics/#normalization
     */
    const NAME_AND_TAG_KEY_NORMALIZATION_REGEX = /[^a-zA-Z0-9_/.-]+/g;
  
    /**
     * Normalization regex for metric tag values.
     *
     * This enforces that values only contain words, digits, or the following
     * special characters: _:/@.{}[\]$-
     *
     * See: https://develop.sentry.dev/sdk/metrics/#normalization
     */
    const TAG_VALUE_NORMALIZATION_REGEX = /[^\w\d\s_:/@.{}[\]$-]+/g;
  
    /**
     * This does not match spec in https://develop.sentry.dev/sdk/metrics
     * but was chosen to optimize for the most common case in browser environments.
     */
    const DEFAULT_BROWSER_FLUSH_INTERVAL = 5000;
  
    /**
     * Generate bucket key from metric properties.
     */
    function getBucketKey(
      metricType,
      name,
      unit,
      tags,
    ) {
      const stringifiedTags = Object.entries(dropUndefinedKeys(tags)).sort((a, b) => a[0].localeCompare(b[0]));
      return `${metricType}${name}${unit}${stringifiedTags}`;
    }
  
    /* eslint-disable no-bitwise */
    /**
     * Simple hash function for strings.
     */
    function simpleHash(s) {
      let rv = 0;
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        rv = (rv << 5) - rv + c;
        rv &= rv;
      }
      return rv >>> 0;
    }
    /* eslint-enable no-bitwise */
  
    /**
     * Serialize metrics buckets into a string based on statsd format.
     *
     * Example of format:
     * metric.name@second:1:1.2|d|#a:value,b:anothervalue|T12345677
     * Segments:
     * name: metric.name
     * unit: second
     * value: [1, 1.2]
     * type of metric: d (distribution)
     * tags: { a: value, b: anothervalue }
     * timestamp: 12345677
     */
    function serializeMetricBuckets(metricBucketItems) {
      let out = '';
      for (const item of metricBucketItems) {
        const tagEntries = Object.entries(item.tags);
        const maybeTags = tagEntries.length > 0 ? `|#${tagEntries.map(([key, value]) => `${key}:${value}`).join(',')}` : '';
        out += `${item.name}@${item.unit}:${item.metric}|${item.metricType}${maybeTags}|T${item.timestamp}\n`;
      }
      return out;
    }
  
    /**
     * Sanitizes tags.
     */
    function sanitizeTags(unsanitizedTags) {
      const tags = {};
      for (const key in unsanitizedTags) {
        if (Object.prototype.hasOwnProperty.call(unsanitizedTags, key)) {
          const sanitizedKey = key.replace(NAME_AND_TAG_KEY_NORMALIZATION_REGEX, '_');
          tags[sanitizedKey] = String(unsanitizedTags[key]).replace(TAG_VALUE_NORMALIZATION_REGEX, '');
        }
      }
      return tags;
    }
  
    /**
     * Create envelope from a metric aggregate.
     */
    function createMetricEnvelope(
      metricBucketItems,
      dsn,
      metadata,
      tunnel,
    ) {
      const headers = {
        sent_at: new Date().toISOString(),
      };
  
      if (metadata && metadata.sdk) {
        headers.sdk = {
          name: metadata.sdk.name,
          version: metadata.sdk.version,
        };
      }
  
      if (!!tunnel && dsn) {
        headers.dsn = dsnToString(dsn);
      }
  
      const item = createMetricEnvelopeItem(metricBucketItems);
      return createEnvelope(headers, [item]);
    }
  
    function createMetricEnvelopeItem(metricBucketItems) {
      const payload = serializeMetricBuckets(metricBucketItems);
      const metricHeaders = {
        type: 'statsd',
        length: payload.length,
      };
      return [metricHeaders, payload];
    }
  
    const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
  
    /**
     * Base implementation for all JavaScript SDK clients.
     *
     * Call the constructor with the corresponding options
     * specific to the client subclass. To access these options later, use
     * {@link Client.getOptions}.
     *
     * If a Dsn is specified in the options, it will be parsed and stored. Use
     * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
     * invalid, the constructor will throw a {@link SentryException}. Note that
     * without a valid Dsn, the SDK will not send any events to Sentry.
     *
     * Before sending an event, it is passed through
     * {@link BaseClient._prepareEvent} to add SDK information and scope data
     * (breadcrumbs and context). To add more custom information, override this
     * method and extend the resulting prepared event.
     *
     * To issue automatically created events (e.g. via instrumentation), use
     * {@link Client.captureEvent}. It will prepare the event and pass it through
     * the callback lifecycle. To issue auto-breadcrumbs, use
     * {@link Client.addBreadcrumb}.
     *
     * @example
     * class NodeClient extends BaseClient<NodeOptions> {
     *   public constructor(options: NodeOptions) {
     *     super(options);
     *   }
     *
     *   // ...
     * }
     */
    class BaseClient {
      /**
       * A reference to a metrics aggregator
       *
       * @experimental Note this is alpha API. It may experience breaking changes in the future.
       */
  
      /** Options passed to the SDK. */
  
      /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
  
      /** Array of set up integrations. */
  
      /** Indicates whether this client's integrations have been set up. */
  
      /** Number of calls being processed */
  
      /** Holds flushable  */
  
      // eslint-disable-next-line @typescript-eslint/ban-types
  
      /**
       * Initializes this client instance.
       *
       * @param options Options for the client.
       */
       constructor(options) {
        this._options = options;
        this._integrations = {};
        this._integrationsInitialized = false;
        this._numProcessing = 0;
        this._outcomes = {};
        this._hooks = {};
        this._eventProcessors = [];
  
        if (options.dsn) {
          this._dsn = makeDsn(options.dsn);
        } else {
          logger.warn('No DSN provided, client will not send events.');
        }
  
        if (this._dsn) {
          const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options);
          this._transport = options.transport({
            recordDroppedEvent: this.recordDroppedEvent.bind(this),
            ...options.transportOptions,
            url,
          });
        }
      }
  
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
       captureException(exception, hint, scope) {
        // ensure we haven't captured this very object before
        if (checkOrSetAlreadyCaught(exception)) {
          logger.log(ALREADY_SEEN_ERROR);
          return;
        }
  
        let eventId = hint && hint.event_id;
  
        this._process(
          this.eventFromException(exception, hint)
            .then(event =>  {
                console.log('client处理后从exception得到的event:', event);
                this._captureEvent(event, hint, scope)
            })
            .then(result => {
              eventId = result;
            }),
        );
  
        return eventId;
      }
  
      /**
       * @inheritDoc
       */
       captureMessage(
        message,
        // eslint-disable-next-line deprecation/deprecation
        level,
        hint,
        scope,
      ) {
        let eventId = hint && hint.event_id;
  
        const eventMessage = isParameterizedString(message) ? message : String(message);
  
        const promisedEvent = isPrimitive(message)
          ? this.eventFromMessage(eventMessage, level, hint)
          : this.eventFromException(message, hint);
  
        this._process(
          promisedEvent
            .then(event => this._captureEvent(event, hint, scope))
            .then(result => {
              eventId = result;
            }),
        );
  
        return eventId;
      }
  
      /**
       * @inheritDoc
       */
       captureEvent(event, hint, scope) {
        // ensure we haven't captured this very object before
        if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
          logger.log(ALREADY_SEEN_ERROR);
          return;
        }
  
        let eventId = hint && hint.event_id;
  
        const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
        const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
        
        console.log('__captureEvent前的event:', event);
        
        this._process(
          this._captureEvent(event, hint, capturedSpanScope || scope).then(result => {
            eventId = result;
          }),
        );
  
        return eventId;
      }
  
      /**
       * @inheritDoc
       */
       captureSession(session) {
        if (!(typeof session.release === 'string')) {
          logger.warn('Discarded session because of missing or non-string release');
        } else {
          
          this.sendSession(session);
          // After sending, we set init false to indicate it's not the first occurrence
          updateSession(session, { init: false });
        }
      }
  
      /**
       * @inheritDoc
       */
       getDsn() {
        return this._dsn;
      }
  
      /**
       * @inheritDoc
       */
       getOptions() {
        return this._options;
      }
  
      /**
       * @see SdkMetadata in @sentry/types
       *
       * @return The metadata of the SDK
       */
       getSdkMetadata() {
        return this._options._metadata;
      }
  
      /**
       * @inheritDoc
       */
       getTransport() {
        return this._transport;
      }
  
      /**
       * @inheritDoc
       */
       flush(timeout) {
        const transport = this._transport;
        if (transport) {
          if (this.metricsAggregator) {
            this.metricsAggregator.flush();
          }
          return this._isClientDoneProcessing(timeout).then(clientFinished => {
            return transport.flush(timeout).then(transportFlushed => clientFinished && transportFlushed);
          });
        } else {
          return resolvedSyncPromise(true);
        }
      }
  
      /**
       * @inheritDoc
       */
       close(timeout) {
        return this.flush(timeout).then(result => {
          this.getOptions().enabled = false;
          if (this.metricsAggregator) {
            this.metricsAggregator.close();
          }
          return result;
        });
      }
  
      /** Get all installed event processors. */
       getEventProcessors() {
        return this._eventProcessors;
      }
  
      /** @inheritDoc */
       addEventProcessor(eventProcessor) {
        this._eventProcessors.push(eventProcessor);
      }
  
      /**
       * This is an internal function to setup all integrations that should run on the client.
       * @deprecated Use `client.init()` instead.
       */
       setupIntegrations(forceInitialize) {
        if ((forceInitialize && !this._integrationsInitialized) || (this._isEnabled() && !this._integrationsInitialized)) {
          this._setupIntegrations();
        }
      }
  
      /** @inheritdoc */
       init() {
        if (this._isEnabled()) {
          this._setupIntegrations();
        }
      }
  
      /**
       * Gets an installed integration by its `id`.
       *
       * @returns The installed integration or `undefined` if no integration with that `id` was installed.
       * @deprecated Use `getIntegrationByName()` instead.
       */
       getIntegrationById(integrationId) {
        return this.getIntegrationByName(integrationId);
      }
  
      /**
       * Gets an installed integration by its name.
       *
       * @returns The installed integration or `undefined` if no integration with that `name` was installed.
       */
       getIntegrationByName(integrationName) {
        return this._integrations[integrationName] ;
      }
  
      /**
       * Returns the client's instance of the given integration class, it any.
       * @deprecated Use `getIntegrationByName()` instead.
       */
       getIntegration(integration) {
        try {
          return (this._integrations[integration.id] ) || null;
        } catch (_oO) {
          logger.warn(`Cannot retrieve integration ${integration.id} from the current Client`);
          return null;
        }
      }
  
      /**
       * @inheritDoc
       */
       addIntegration(integration) {
        const isAlreadyInstalled = this._integrations[integration.name];
  
        // This hook takes care of only installing if not already installed
        setupIntegration(this, integration, this._integrations);
        // Here we need to check manually to make sure to not run this multiple times
        if (!isAlreadyInstalled) {
          afterSetupIntegrations(this, [integration]);
        }
      }
  
      /**
       * @inheritDoc
       */
       sendEvent(event, hint = {}) {
        
        this.emit('beforeSendEvent', event, hint);
        
        let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
        
        for (const attachment of hint.attachments || []) {
          env = addItemToEnvelope(
            env,
            createAttachmentEnvelopeItem(
              attachment,
              this._options.transportOptions && this._options.transportOptions.textEncoder,
            ),
          );
        }
        console.log('EventEnvelope::', env);
        const promise = this._sendEnvelope(env);
    
        if (promise) {
          promise.then(sendResponse => this.emit('afterSendEvent', event, sendResponse), null);
        }
      }
  
      /**
       * @inheritDoc
       */
       sendSession(session) {
        const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
  
        // _sendEnvelope should not throw
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._sendEnvelope(env);
      }
  
      /**
       * @inheritDoc
       */
       recordDroppedEvent(reason, category, _event) {
        // Note: we use `event` in replay, where we overwrite this hook.
  
        if (this._options.sendClientReports) {
          // We want to track each category (error, transaction, session, replay_event) separately
          // but still keep the distinction between different type of outcomes.
          // We could use nested maps, but it's much easier to read and type this way.
          // A correct type for map-based implementation if we want to go that route
          // would be `Partial<Record<SentryRequestType, Partial<Record<Outcome, number>>>>`
          // With typescript 4.1 we could even use template literal types
          const key = `${reason}:${category}`;
          logger.log(`Adding outcome: "${key}"`);
  
          // The following works because undefined + 1 === NaN and NaN is falsy
          this._outcomes[key] = this._outcomes[key] + 1 || 1;
        }
      }
  
      /**
       * @inheritDoc
       */
       captureAggregateMetrics(metricBucketItems) {
        logger.log(`Flushing aggregated metrics, number of metrics: ${metricBucketItems.length}`);
        const metricsEnvelope = createMetricEnvelope(
          metricBucketItems,
          this._dsn,
          this._options._metadata,
          this._options.tunnel,
        );
  
        // _sendEnvelope should not throw
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._sendEnvelope(metricsEnvelope);
      }
  
      // Keep on() & emit() signatures in sync with types' client.ts interface
      /* eslint-disable @typescript-eslint/unified-signatures */
  
      /** @inheritdoc */
  
      /** @inheritdoc */
       on(hook, callback) {
        if (!this._hooks[hook]) {
          this._hooks[hook] = [];
        }
  
        // @ts-expect-error We assue the types are correct
        this._hooks[hook].push(callback);
      }
  
      /** @inheritdoc */
  
      /** @inheritdoc */
       emit(hook, ...rest) {
        if (this._hooks[hook]) {
          this._hooks[hook].forEach(callback => callback(...rest));
        }
      }
  
      /* eslint-enable @typescript-eslint/unified-signatures */
  
      /** Setup integrations for this client. */
       _setupIntegrations() {
        const { integrations } = this._options;
        this._integrations = setupIntegrations(this, integrations);
        afterSetupIntegrations(this, integrations);
  
        // TODO v8: We don't need this flag anymore
        this._integrationsInitialized = true;
      }
  
      /** Updates existing session based on the provided event */
       _updateSessionFromEvent(session, event) {
        let crashed = false;
        let errored = false;
        const exceptions = event.exception && event.exception.values;
  
        if (exceptions) {
          errored = true;
  
          for (const ex of exceptions) {
            const mechanism = ex.mechanism;
            if (mechanism && mechanism.handled === false) {
              crashed = true;
              break;
            }
          }
        }
  
        // A session is updated and that session update is sent in only one of the two following scenarios:
        // 1. Session with non terminal status and 0 errors + an error occurred -> Will set error count to 1 and send update
        // 2. Session with non terminal status and 1 error + a crash occurred -> Will set status crashed and send update
        const sessionNonTerminal = session.status === 'ok';
        const shouldUpdateAndSend = (sessionNonTerminal && session.errors === 0) || (sessionNonTerminal && crashed);
  
        if (shouldUpdateAndSend) {
          updateSession(session, {
            ...(crashed && { status: 'crashed' }),
            errors: session.errors || Number(errored || crashed),
          });
          console.log('captureSession33:::', session)
          this.captureSession(session);
        }
      }
  
      /**
       * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
       * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
       *
       * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
       * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
       * `true`.
       * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
       * `false` otherwise
       */
       _isClientDoneProcessing(timeout) {
        return new SyncPromise(resolve => {
          let ticked = 0;
          const tick = 1;
  
          const interval = setInterval(() => {
            if (this._numProcessing == 0) {
              clearInterval(interval);
              resolve(true);
            } else {
              ticked += tick;
              if (timeout && ticked >= timeout) {
                clearInterval(interval);
                resolve(false);
              }
            }
          }, tick);
        });
      }
  
      /** Determines whether this SDK is enabled and a transport is present. */
       _isEnabled() {
        return this.getOptions().enabled !== false && this._transport !== undefined;
      }
  
      /**
       * Adds common information to events.
       *
       * The information includes release and environment from `options`,
       * breadcrumbs and context (extra, tags and user) from the scope.
       *
       * Information that is already present in the event is never overwritten. For
       * nested objects, such as the context, keys are merged.
       *
       * @param event The original event.
       * @param hint May contain additional information about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A new event with more information.
       */
       _prepareEvent(
        event,
        hint,
        scope,
        isolationScope = getIsolationScope(),
      ) {
        const options = this.getOptions();
        const integrations = Object.keys(this._integrations);
        if (!hint.integrations && integrations.length > 0) {
          hint.integrations = integrations;
        }
  
        this.emit('preprocessEvent', event, hint);
  
        return prepareEvent(options, event, hint, scope, this, isolationScope).then(evt => {
          if (evt === null) {
            return evt;
          }
  
          const propagationContext = {
            ...isolationScope.getPropagationContext(),
            ...(scope ? scope.getPropagationContext() : undefined),
          };
  
          const trace = evt.contexts && evt.contexts.trace;
          if (!trace && propagationContext) {
            const { traceId: trace_id, spanId, parentSpanId, dsc } = propagationContext;
            evt.contexts = {
              trace: {
                trace_id,
                span_id: spanId,
                parent_span_id: parentSpanId,
              },
              ...evt.contexts,
            };
  
            const dynamicSamplingContext = dsc ? dsc : getDynamicSamplingContextFromClient(trace_id, this, scope);
  
            evt.sdkProcessingMetadata = {
              dynamicSamplingContext,
              ...evt.sdkProcessingMetadata,
            };
          }

          console.log('evt::', evt)
          return evt;
        });
      }
  
      /**
       * Processes the event and logs an error in case of rejection
       * @param event
       * @param hint
       * @param scope
       */
       _captureEvent(event, hint = {}, scope) {
        return this._processEvent(event, hint, scope).then(
          finalEvent => {
            return finalEvent.event_id;
          },
          reason => {
            {
              // If something's gone wrong, log the error as a warning. If it's just us having used a `SentryError` for
              // control flow, log just the message (no stack) as a log-level log.
              const sentryError = reason ;
              if (sentryError.logLevel === 'log') {
                logger.log(sentryError.message);
              } else {
                logger.warn(sentryError);
              }
            }
            return undefined;
          },
        );
      }
  
      /**
       * Processes an event (either error or message) and sends it to Sentry.
       *
       * This also adds breadcrumbs and context information to the event. However,
       * platform specific meta data (such as the User's IP address) must be added
       * by the SDK implementor.
       *
       *
       * @param event The event to send to Sentry.
       * @param hint May contain additional information about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
       */
       _processEvent(event, hint, scope) {
        const options = this.getOptions();
        const { sampleRate } = options;
  
        const isTransaction = isTransactionEvent(event);
        const isError = isErrorEvent(event);
        const eventType = event.type || 'error';
        const beforeSendLabel = `before send for type \`${eventType}\``;
  
        // 1.0 === 100% events are sent
        // 0.0 === 0% events are sent
        // Sampling for transaction happens somewhere else
        if (isError && typeof sampleRate === 'number' && Math.random() > sampleRate) {
          this.recordDroppedEvent('sample_rate', 'error', event);
          return rejectedSyncPromise(
            new SentryError(
              `Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`,
              'log',
            ),
          );
        }
  
        const dataCategory = eventType === 'replay_event' ? 'replay' : eventType;
  
        const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
        const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
        console.log('_prepareEvent前的event：', event)
        
        return this._prepareEvent(event, hint, scope, capturedSpanIsolationScope)
          .then(prepared => {
            console.log('_prepareEvent处理后的prepared:', prepared);
            if (prepared === null) {
              this.recordDroppedEvent('event_processor', dataCategory, event);
              throw new SentryError('An event processor returned `null`, will not send event.', 'log');
            }
  
            const isInternalException = hint.data && (hint.data ).__sentry__ === true;
            if (isInternalException) {
              return prepared;
            }
  
            const result = processBeforeSend(options, prepared, hint);
            console.log('processBeforeSend处理后:', result, options);
            return _validateBeforeSendResult(result, beforeSendLabel);
          })
          .then(processedEvent => {
            if (processedEvent === null) {
              this.recordDroppedEvent('before_send', dataCategory, event);
              throw new SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, 'log');
            }
  
            const session = scope && scope.getSession();
            if (!isTransaction && session) {
              this._updateSessionFromEvent(session, processedEvent);
            }
  
            // None of the Sentry built event processor will update transaction name,
            // so if the transaction name has been changed by an event processor, we know
            // it has to come from custom event processor added by a user
            const transactionInfo = processedEvent.transaction_info;
            if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
              const source = 'custom';
              processedEvent.transaction_info = {
                ...transactionInfo,
                source,
              };
            }
            console.log('processedEvent:', processedEvent);
            this.sendEvent(processedEvent, hint);
            return processedEvent;
          })
          .then(null, reason => {
            if (reason instanceof SentryError) {
              throw reason;
            }
  
            this.captureException(reason, {
              data: {
                __sentry__: true,
              },
              originalException: reason,
            });
            throw new SentryError(
              `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`,
            );
          });
      }
  
      /**
       * Occupies the client with processing and event
       */
       _process(promise) {
        this._numProcessing++;
        void promise.then(
          value => {
            this._numProcessing--;
            return value;
          },
          reason => {
            this._numProcessing--;
            return reason;
          },
        );
      }
  
      /**
       * @inheritdoc
       */
       _sendEnvelope(envelope) {
        this.emit('beforeEnvelope', envelope);
        console.log('envelopeenvelopeenvelopeenvelope:::', envelope);
        if (this._isEnabled() && this._transport) {
          return this._transport.send(envelope).then(null, reason => {
            logger.error('Error while sending event:', reason);
          });
        } else {
          logger.error('Transport disabled');
        }
      }
  
      /**
       * Clears outcomes on this client and returns them.
       */
       _clearOutcomes() {
        const outcomes = this._outcomes;
        this._outcomes = {};
        return Object.keys(outcomes).map(key => {
          const [reason, category] = key.split(':') ;
          return {
            reason,
            category,
            quantity: outcomes[key],
          };
        });
      }
  
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  
    }
  
    /**
     * Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
     */
    function _validateBeforeSendResult(
      beforeSendResult,
      beforeSendLabel,
    ) {
      const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
      if (isThenable(beforeSendResult)) {
        return beforeSendResult.then(
          event => {
            if (!isPlainObject(event) && event !== null) {
              throw new SentryError(invalidValueError);
            }
            return event;
          },
          e => {
            throw new SentryError(`${beforeSendLabel} rejected with ${e}`);
          },
        );
      } else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) {
        throw new SentryError(invalidValueError);
      }
      return beforeSendResult;
    }
  
    /**
     * Process the matching `beforeSendXXX` callback.
     */
    function processBeforeSend(
      options,
      event,
      hint,
    ) {
      const { beforeSend, beforeSendTransaction } = options;
  
      if (isErrorEvent(event) && beforeSend) {
        return beforeSend(event, hint);
      }
  
      if (isTransactionEvent(event) && beforeSendTransaction) {
        return beforeSendTransaction(event, hint);
      }
  
      return event;
    }
  
    function isErrorEvent(event) {
      return event.type === undefined;
    }
  
    function isTransactionEvent(event) {
      return event.type === 'transaction';
    }
  
    /**
     * Add an event processor to the current client.
     * This event processor will run for all events processed by this client.
     */
    function addEventProcessor(callback) {
      const client = getClient();
  
      if (!client || !client.addEventProcessor) {
        return;
      }
  
      client.addEventProcessor(callback);
    }
  
    /**
     * A metric instance representing a counter.
     */
    class CounterMetric  {
       constructor( _value) {this._value = _value;}
  
      /** @inheritDoc */
       get weight() {
        return 1;
      }
  
      /** @inheritdoc */
       add(value) {
        this._value += value;
      }
  
      /** @inheritdoc */
       toString() {
        return `${this._value}`;
      }
    }
  
    /**
     * A metric instance representing a gauge.
     */
    class GaugeMetric  {
  
       constructor(value) {
        this._last = value;
        this._min = value;
        this._max = value;
        this._sum = value;
        this._count = 1;
      }
  
      /** @inheritDoc */
       get weight() {
        return 5;
      }
  
      /** @inheritdoc */
       add(value) {
        this._last = value;
        if (value < this._min) {
          this._min = value;
        }
        if (value > this._max) {
          this._max = value;
        }
        this._sum += value;
        this._count++;
      }
  
      /** @inheritdoc */
       toString() {
        return `${this._last}:${this._min}:${this._max}:${this._sum}:${this._count}`;
      }
    }
  
    /**
     * A metric instance representing a distribution.
     */
    class DistributionMetric  {
  
       constructor(first) {
        this._value = [first];
      }
  
      /** @inheritDoc */
       get weight() {
        return this._value.length;
      }
  
      /** @inheritdoc */
       add(value) {
        this._value.push(value);
      }
  
      /** @inheritdoc */
       toString() {
        return this._value.join(':');
      }
    }
  
    /**
     * A metric instance representing a set.
     */
    class SetMetric  {
  
       constructor( first) {this.first = first;
        this._value = new Set([first]);
      }
  
      /** @inheritDoc */
       get weight() {
        return this._value.size;
      }
  
      /** @inheritdoc */
       add(value) {
        this._value.add(value);
      }
  
      /** @inheritdoc */
       toString() {
        return Array.from(this._value)
          .map(val => (typeof val === 'string' ? simpleHash(val) : val))
          .join(':');
      }
    }
  
    const METRIC_MAP = {
      [COUNTER_METRIC_TYPE]: CounterMetric,
      [GAUGE_METRIC_TYPE]: GaugeMetric,
      [DISTRIBUTION_METRIC_TYPE]: DistributionMetric,
      [SET_METRIC_TYPE]: SetMetric,
    };
  
    /** A class object that can instantiate Client objects. */
  
    /**
     * Internal function to create a new SDK client instance. The client is
     * installed and then bound to the current scope.
     *
     * @param clientClass The client class to instantiate.
     * @param options Options to pass to the client.
     */
    function initAndBind(
      clientClass,
      options,
    ) {
      if (options.debug === true) {
        if (DEBUG_BUILD$2) {
          logger.enable();
        } else {
          // use `console.warn` rather than `logger.warn` since by non-debug bundles have all `logger.x` statements stripped
          consoleSandbox(() => {
            // eslint-disable-next-line no-console
            console.warn('[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.');
          });
        }
      }
      const scope = getCurrentScope();
      scope.update(options.initialScope);
      const client = new clientClass(options);
      setCurrentClient(client);
      initializeClient(client);
    }
  
    /**
     * Make the given client the current client.
     */
    function setCurrentClient(client) {
      // eslint-disable-next-line deprecation/deprecation
      const hub = getCurrentHub();
      // eslint-disable-next-line deprecation/deprecation
      const top = hub.getStackTop();
      top.client = client;
      top.scope.setClient(client);
    }
  
    /**
     * Initialize the client for the current scope.
     * Make sure to call this after `setCurrentClient()`.
     */
    function initializeClient(client) {
      if (client.init) {
        client.init();
        // TODO v8: Remove this fallback
        // eslint-disable-next-line deprecation/deprecation
      } else if (client.setupIntegrations) {
        // eslint-disable-next-line deprecation/deprecation
        client.setupIntegrations();
      }
    }
  
    const DEFAULT_TRANSPORT_BUFFER_SIZE = 30;
  
    /**
     * Creates an instance of a Sentry `Transport`
     *
     * @param options
     * @param makeRequest
     */
    function createTransport(
      options,
      makeRequest,
      buffer = makePromiseBuffer(
        options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE,
      ),
    ) {
      let rateLimits = {};
      const flush = (timeout) => buffer.drain(timeout);
  
      function send(envelope) {
        const filteredEnvelopeItems = [];
  
        // Drop rate limited items from envelope
        forEachEnvelopeItem(envelope, (item, type) => {
          const envelopeItemDataCategory = envelopeItemTypeToDataCategory(type);
          if (isRateLimited(rateLimits, envelopeItemDataCategory)) {
            const event = getEventForEnvelopeItem(item, type);
            options.recordDroppedEvent('ratelimit_backoff', envelopeItemDataCategory, event);
          } else {
            filteredEnvelopeItems.push(item);
          }
        });
        console.log('filteredEnvelopeItems:', filteredEnvelopeItems);
        // Skip sending if envelope is empty after filtering out rate limited events
        if (filteredEnvelopeItems.length === 0) {
          return resolvedSyncPromise();
        }
  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems );
        console.log('filteredEnvelope:', filteredEnvelope);
        // Creates client report for each item in an envelope
        const recordEnvelopeLoss = (reason) => {
          forEachEnvelopeItem(filteredEnvelope, (item, type) => {
            const event = getEventForEnvelopeItem(item, type);
            options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
          });
        };
        // console.log('serializeEnvelope(filteredEnvelope, options.textEncoder)::', serializeEnvelope(filteredEnvelope, options.textEncoder));
        
        const requestTask = () =>
          makeRequest({ body: serializeEnvelope(filteredEnvelope, options.textEncoder) }).then(
            response => {
                
              // We don't want to throw on NOK responses, but we want to at least log them
              if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
                logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
              }
  
              rateLimits = updateRateLimits(rateLimits, response);
              return response;
            },
            error => {
              recordEnvelopeLoss('network_error');
              throw error;
            },
          );
        
        return buffer.add(requestTask).then(
          result => result,
          error => {
            if (error instanceof SentryError) {
              logger.error('Skipped sending event because buffer is full.');
              recordEnvelopeLoss('queue_overflow');
              return resolvedSyncPromise();
            } else {
              throw error;
            }
          },
        );
      }
  
      // We use this to identifify if the transport is the base transport
      // TODO (v8): Remove this again as we'll no longer need it
      send.__sentry__baseTransport__ = true;
  
      return {
        send,
        flush,
      };
    }
  
    function getEventForEnvelopeItem(item, type) {
      if (type !== 'event' && type !== 'transaction') {
        return undefined;
      }
  
      return Array.isArray(item) ? (item )[1] : undefined;
    }
  
    /**
     * Tagged template function which returns paramaterized representation of the message
     * For example: parameterize`This is a log statement with ${x} and ${y} params`, would return:
     * "__sentry_template_string__": 'This is a log statement with %s and %s params',
     * "__sentry_template_values__": ['first', 'second']
     * @param strings An array of string values splitted between expressions
     * @param values Expressions extracted from template string
     * @returns String with template information in __sentry_template_string__ and __sentry_template_values__ properties
     */
    function parameterize(strings, ...values) {
      const formatted = new String(String.raw(strings, ...values)) ;
      formatted.__sentry_template_string__ = strings.join('\x00').replace(/%/g, '%%').replace(/\0/g, '%s');
      formatted.__sentry_template_values__ = values;
      return formatted;
    }
  
    /**
     * A builder for the SDK metadata in the options for the SDK initialization.
     *
     * Note: This function is identical to `buildMetadata` in Remix and NextJS and SvelteKit.
     * We don't extract it for bundle size reasons.
     * @see https://github.com/getsentry/sentry-javascript/pull/7404
     * @see https://github.com/getsentry/sentry-javascript/pull/4196
     *
     * If you make changes to this function consider updating the others as well.
     *
     * @param options SDK options object that gets mutated
     * @param names list of package names
     */
    function applySdkMetadata(options, name, names = [name], source = 'npm') {
      const metadata = options._metadata || {};
  
      if (!metadata.sdk) {
        metadata.sdk = {
          name: `sentry.javascript.${name}`,
          packages: names.map(name => ({
            name: `${source}:@sentry/${name}`,
            version: SDK_VERSION,
          })),
          version: SDK_VERSION,
        };
      }
  
      options._metadata = metadata;
    }
  
    // "Script error." is hard coded into browsers for errors that it can't read.
    // this is the result of a script being pulled in from an external domain and CORS.
    const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
  
    const DEFAULT_IGNORE_TRANSACTIONS = [
      /^.*\/healthcheck$/,
      /^.*\/healthy$/,
      /^.*\/live$/,
      /^.*\/ready$/,
      /^.*\/heartbeat$/,
      /^.*\/health$/,
      /^.*\/healthz$/,
    ];
  
    /** Options for the InboundFilters integration */
  
    const INTEGRATION_NAME$9 = 'InboundFilters';
    const _inboundFiltersIntegration = ((options = {}) => {
      return {
        name: INTEGRATION_NAME$9,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        processEvent(event, _hint, client) {
          const clientOptions = client.getOptions();
          const mergedOptions = _mergeOptions(options, clientOptions);
          return _shouldDropEvent$1(event, mergedOptions) ? null : event;
        },
      };
    }) ;
  
    const inboundFiltersIntegration = defineIntegration(_inboundFiltersIntegration);
  
    /**
     * Inbound filters configurable by the user.
     * @deprecated Use `inboundFiltersIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const InboundFilters = convertIntegrationFnToClass(
      INTEGRATION_NAME$9,
      inboundFiltersIntegration,
    )
  
  ;
  
    function _mergeOptions(
      internalOptions = {},
      clientOptions = {},
    ) {
      return {
        allowUrls: [...(internalOptions.allowUrls || []), ...(clientOptions.allowUrls || [])],
        denyUrls: [...(internalOptions.denyUrls || []), ...(clientOptions.denyUrls || [])],
        ignoreErrors: [
          ...(internalOptions.ignoreErrors || []),
          ...(clientOptions.ignoreErrors || []),
          ...(internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS),
        ],
        ignoreTransactions: [
          ...(internalOptions.ignoreTransactions || []),
          ...(clientOptions.ignoreTransactions || []),
          ...(internalOptions.disableTransactionDefaults ? [] : DEFAULT_IGNORE_TRANSACTIONS),
        ],
        ignoreInternal: internalOptions.ignoreInternal !== undefined ? internalOptions.ignoreInternal : true,
      };
    }
  
    function _shouldDropEvent$1(event, options) {
      if (options.ignoreInternal && _isSentryError(event)) {
        logger.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${getEventDescription(event)}`);
        return true;
      }
      if (_isIgnoredError(event, options.ignoreErrors)) {
        logger.warn(
            `Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`,
          );
        return true;
      }
      if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
        logger.warn(
            `Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${getEventDescription(event)}`,
          );
        return true;
      }
      if (_isDeniedUrl(event, options.denyUrls)) {
        logger.warn(
            `Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${getEventDescription(
            event,
          )}.\nUrl: ${_getEventFilterUrl(event)}`,
          );
        return true;
      }
      if (!_isAllowedUrl(event, options.allowUrls)) {
        logger.warn(
            `Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(
            event,
          )}.\nUrl: ${_getEventFilterUrl(event)}`,
          );
        return true;
      }
      return false;
    }
  
    function _isIgnoredError(event, ignoreErrors) {
      // If event.type, this is not an error
      if (event.type || !ignoreErrors || !ignoreErrors.length) {
        return false;
      }
  
      return _getPossibleEventMessages(event).some(message => stringMatchesSomePattern(message, ignoreErrors));
    }
  
    function _isIgnoredTransaction(event, ignoreTransactions) {
      if (event.type !== 'transaction' || !ignoreTransactions || !ignoreTransactions.length) {
        return false;
      }
  
      const name = event.transaction;
      return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
    }
  
    function _isDeniedUrl(event, denyUrls) {
      // TODO: Use Glob instead?
      if (!denyUrls || !denyUrls.length) {
        return false;
      }
      const url = _getEventFilterUrl(event);
      return !url ? false : stringMatchesSomePattern(url, denyUrls);
    }
  
    function _isAllowedUrl(event, allowUrls) {
      // TODO: Use Glob instead?
      if (!allowUrls || !allowUrls.length) {
        return true;
      }
      const url = _getEventFilterUrl(event);
      return !url ? true : stringMatchesSomePattern(url, allowUrls);
    }
  
    function _getPossibleEventMessages(event) {
      const possibleMessages = [];
  
      if (event.message) {
        possibleMessages.push(event.message);
      }
  
      let lastException;
      try {
        // @ts-expect-error Try catching to save bundle size
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        lastException = event.exception.values[event.exception.values.length - 1];
      } catch (e) {
        // try catching to save bundle size checking existence of variables
      }
  
      if (lastException) {
        if (lastException.value) {
          possibleMessages.push(lastException.value);
          if (lastException.type) {
            possibleMessages.push(`${lastException.type}: ${lastException.value}`);
          }
        }
      }
  
      if (possibleMessages.length === 0) {
        logger.error(`Could not extract message for event ${getEventDescription(event)}`);
      }
  
      return possibleMessages;
    }
  
    function _isSentryError(event) {
      try {
        // @ts-expect-error can't be a sentry error if undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return event.exception.values[0].type === 'SentryError';
      } catch (e) {
        // ignore
      }
      return false;
    }
  
    function _getLastValidUrl(frames = []) {
      for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];
  
        if (frame && frame.filename !== '<anonymous>' && frame.filename !== '[native code]') {
          return frame.filename || null;
        }
      }
  
      return null;
    }
  
    function _getEventFilterUrl(event) {
      try {
        let frames;
        try {
          // @ts-expect-error we only care about frames if the whole thing here is defined
          frames = event.exception.values[0].stacktrace.frames;
        } catch (e) {
          // ignore
        }
        return frames ? _getLastValidUrl(frames) : null;
      } catch (oO) {
        logger.error(`Cannot extract url for event ${getEventDescription(event)}`);
        return null;
      }
    }
  
    let originalFunctionToString;
  
    const INTEGRATION_NAME$8 = 'FunctionToString';
  
    const SETUP_CLIENTS = new WeakMap();
  
    const _functionToStringIntegration = (() => {
      return {
        name: INTEGRATION_NAME$8,
        setupOnce() {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          originalFunctionToString = Function.prototype.toString;
  
          // intrinsics (like Function.prototype) might be immutable in some environments
          // e.g. Node with --frozen-intrinsics, XS (an embedded JavaScript engine) or SES (a JavaScript proposal)
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Function.prototype.toString = function ( ...args) {
              const originalFunction = getOriginalFunction(this);
              const context =
                SETUP_CLIENTS.has(getClient() ) && originalFunction !== undefined ? originalFunction : this;
              return originalFunctionToString.apply(context, args);
            };
          } catch (e) {
            // ignore errors here, just don't patch this
          }
        },
        setup(client) {
          SETUP_CLIENTS.set(client, true);
        },
      };
    }) ;
  
    /**
     * Patch toString calls to return proper name for wrapped functions.
     *
     * ```js
     * Sentry.init({
     *   integrations: [
     *     functionToStringIntegration(),
     *   ],
     * });
     * ```
     */
    const functionToStringIntegration = defineIntegration(_functionToStringIntegration);
  
    /**
     * Patch toString calls to return proper name for wrapped functions.
     *
     * @deprecated Use `functionToStringIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const FunctionToString = convertIntegrationFnToClass(
      INTEGRATION_NAME$8,
      functionToStringIntegration,
    ) ;
  
    const DEFAULT_KEY$1 = 'cause';
    const DEFAULT_LIMIT$1 = 5;
  
    const INTEGRATION_NAME$7 = 'LinkedErrors';
  
    const _linkedErrorsIntegration$1 = ((options = {}) => {
      const limit = options.limit || DEFAULT_LIMIT$1;
      const key = options.key || DEFAULT_KEY$1;
  
      return {
        name: INTEGRATION_NAME$7,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        preprocessEvent(event, hint, client) {
          const options = client.getOptions();
  
          applyAggregateErrorsToEvent(
            exceptionFromError$1,
            options.stackParser,
            options.maxValueLength,
            key,
            limit,
            event,
            hint,
          );
        },
      };
    }) ;
  
    const linkedErrorsIntegration$1 = defineIntegration(_linkedErrorsIntegration$1);
  
    /**
     * Adds SDK info to an event.
     * @deprecated Use `linkedErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const LinkedErrors$1 = convertIntegrationFnToClass(INTEGRATION_NAME$7, linkedErrorsIntegration$1)
  
    ;
  
    /* eslint-disable deprecation/deprecation */
  
    var index = /*#__PURE__*/Object.freeze({
      __proto__: null,
      FunctionToString: FunctionToString,
      InboundFilters: InboundFilters,
      LinkedErrors: LinkedErrors$1
    });
  
    /**
     * A simple metrics aggregator that aggregates metrics in memory and flushes them periodically.
     * Default flush interval is 5 seconds.
     *
     * @experimental This API is experimental and might change in the future.
     */
    class BrowserMetricsAggregator  {
      // TODO(@anonrig): Use FinalizationRegistry to have a proper way of flushing the buckets
      // when the aggregator is garbage collected.
      // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
  
       constructor(  _client) {this._client = _client;
        this._buckets = new Map();
        this._interval = setInterval(() => this.flush(), DEFAULT_BROWSER_FLUSH_INTERVAL);
      }
  
      /**
       * @inheritDoc
       */
       add(
        metricType,
        unsanitizedName,
        value,
        unit = 'none',
        unsanitizedTags = {},
        maybeFloatTimestamp = timestampInSeconds(),
      ) {
        const timestamp = Math.floor(maybeFloatTimestamp);
        const name = unsanitizedName.replace(NAME_AND_TAG_KEY_NORMALIZATION_REGEX, '_');
        const tags = sanitizeTags(unsanitizedTags);
  
        const bucketKey = getBucketKey(metricType, name, unit, tags);
  
        let bucketItem = this._buckets.get(bucketKey);
        // If this is a set metric, we need to calculate the delta from the previous weight.
        const previousWeight = bucketItem && metricType === SET_METRIC_TYPE ? bucketItem.metric.weight : 0;
  
        if (bucketItem) {
          bucketItem.metric.add(value);
          // TODO(abhi): Do we need this check?
          if (bucketItem.timestamp < timestamp) {
            bucketItem.timestamp = timestamp;
          }
        } else {
          bucketItem = {
            // @ts-expect-error we don't need to narrow down the type of value here, saves bundle size.
            metric: new METRIC_MAP[metricType](value),
            timestamp,
            metricType,
            name,
            unit,
            tags,
          };
          this._buckets.set(bucketKey, bucketItem);
        }
  
        // If value is a string, it's a set metric so calculate the delta from the previous weight.
        const val = typeof value === 'string' ? bucketItem.metric.weight - previousWeight : value;
        updateMetricSummaryOnActiveSpan(metricType, name, val, unit, unsanitizedTags, bucketKey);
      }
  
      /**
       * @inheritDoc
       */
       flush() {
        // short circuit if buckets are empty.
        if (this._buckets.size === 0) {
          return;
        }
        if (this._client.captureAggregateMetrics) {
          // TODO(@anonrig): Use Object.values() when we support ES6+
          const metricBuckets = Array.from(this._buckets).map(([, bucketItem]) => bucketItem);
          this._client.captureAggregateMetrics(metricBuckets);
        }
        this._buckets.clear();
      }
  
      /**
       * @inheritDoc
       */
       close() {
        clearInterval(this._interval);
        this.flush();
      }
    }
  
    const INTEGRATION_NAME$6 = 'MetricsAggregator';
  
    const _metricsAggregatorIntegration = (() => {
      return {
        name: INTEGRATION_NAME$6,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        setup(client) {
          client.metricsAggregator = new BrowserMetricsAggregator(client);
        },
      };
    }) ;
  
    const metricsAggregatorIntegration = defineIntegration(_metricsAggregatorIntegration);
  
    /**
     * Enables Sentry metrics monitoring.
     *
     * @experimental This API is experimental and might having breaking changes in the future.
     * @deprecated Use `metricsAggegratorIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const MetricsAggregator = convertIntegrationFnToClass(
      INTEGRATION_NAME$6,
      metricsAggregatorIntegration,
    ) ;
  
    function addToMetricsAggregator(
      metricType,
      name,
      value,
      data = {},
    ) {
      const client = getClient();
      const scope = getCurrentScope();
      if (client) {
        if (!client.metricsAggregator) {
          logger.warn('No metrics aggregator enabled. Please add the MetricsAggregator integration to use metrics APIs');
          return;
        }
        const { unit, tags, timestamp } = data;
        const { release, environment } = client.getOptions();
        // eslint-disable-next-line deprecation/deprecation
        const transaction = scope.getTransaction();
        const metricTags = {};
        if (release) {
          metricTags.release = release;
        }
        if (environment) {
          metricTags.environment = environment;
        }
        if (transaction) {
          metricTags.transaction = spanToJSON(transaction).description || '';
        }
  
        logger.log(`Adding value of ${value} to ${metricType} metric ${name}`);
        client.metricsAggregator.add(metricType, name, value, unit, { ...metricTags, ...tags }, timestamp);
      }
    }
  
    /**
     * Adds a value to a counter metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function increment(name, value = 1, data) {
      addToMetricsAggregator(COUNTER_METRIC_TYPE, name, value, data);
    }
  
    /**
     * Adds a value to a distribution metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function distribution(name, value, data) {
      addToMetricsAggregator(DISTRIBUTION_METRIC_TYPE, name, value, data);
    }
  
    /**
     * Adds a value to a set metric. Value must be a string or integer.
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function set(name, value, data) {
      addToMetricsAggregator(SET_METRIC_TYPE, name, value, data);
    }
  
    /**
     * Adds a value to a gauge metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function gauge(name, value, data) {
      addToMetricsAggregator(GAUGE_METRIC_TYPE, name, value, data);
    }
  
    const metrics = {
      increment,
      distribution,
      set,
      gauge,
      /** @deprecated Use `metrics.metricsAggregratorIntegration()` instead. */
      // eslint-disable-next-line deprecation/deprecation
      MetricsAggregator,
      metricsAggregatorIntegration,
    };
  
    /** @deprecated Import the integration function directly, e.g. `inboundFiltersIntegration()` instead of `new Integrations.InboundFilter(). */
    const Integrations = index;
  
    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    const DEBUG_BUILD$1 = (true);
  
    const WINDOW$1 = GLOBAL_OBJ ;
  
    /**
     * Add a listener that cancels and finishes a transaction when the global
     * document is hidden.
     */
    function registerBackgroundTabDetection() {
      if (WINDOW$1 && WINDOW$1.document) {
        WINDOW$1.document.addEventListener('visibilitychange', () => {
          // eslint-disable-next-line deprecation/deprecation
          const activeTransaction = getActiveTransaction() ;
          if (WINDOW$1.document.hidden && activeTransaction) {
            const statusType = 'cancelled';
  
            const { op, status } = spanToJSON(activeTransaction);
  
            logger.log(`[Tracing] Transaction: ${statusType} -> since tab moved to the background, op: ${op}`);
            // We should not set status if it is already set, this prevent important statuses like
            // error or data loss from being overwritten on transaction.
            if (!status) {
              activeTransaction.setStatus(statusType);
            }
            // TODO: Can we rewrite this to an attribute?
            // eslint-disable-next-line deprecation/deprecation
            activeTransaction.setTag('visibilitychange', 'document.hidden');
            activeTransaction.end();
          }
        });
      } else {
        logger.warn('[Tracing] Could not set up background tab detection due to lack of global document');
      }
    }
  
    const bindReporter = (
      callback,
      metric,
      reportAllChanges,
    ) => {
      let prevValue;
      let delta;
      return (forceReport) => {
        if (metric.value >= 0) {
          if (forceReport || reportAllChanges) {
            delta = metric.value - (prevValue || 0);
  
            // Report the metric if there's a non-zero delta or if no previous
            // value exists (which can happen in the case of the document becoming
            // hidden when the metric value is 0).
            // See: https://github.com/GoogleChrome/web-vitals/issues/14
            if (delta || prevValue === undefined) {
              prevValue = metric.value;
              metric.delta = delta;
              callback(metric);
            }
          }
        }
      };
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    /**
     * Performantly generate a unique, 30-char string by combining a version
     * number, the current timestamp with a 13-digit number integer.
     * @return {string}
     */
    const generateUniqueID = () => {
      return `v3-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
    };
  
    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    const getNavigationEntryFromPerformanceTiming = () => {
      // eslint-disable-next-line deprecation/deprecation
      const timing = WINDOW$1.performance.timing;
      // eslint-disable-next-line deprecation/deprecation
      const type = WINDOW$1.performance.navigation.type;
  
      const navigationEntry = {
        entryType: 'navigation',
        startTime: 0,
        type: type == 2 ? 'back_forward' : type === 1 ? 'reload' : 'navigate',
      };
  
      for (const key in timing) {
        if (key !== 'navigationStart' && key !== 'toJSON') {
          // eslint-disable-next-line deprecation/deprecation
          navigationEntry[key] = Math.max((timing[key ] ) - timing.navigationStart, 0);
        }
      }
      return navigationEntry ;
    };
  
    const getNavigationEntry = () => {
      if (WINDOW$1.__WEB_VITALS_POLYFILL__) {
        return (
          WINDOW$1.performance &&
          ((performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) ||
            getNavigationEntryFromPerformanceTiming())
        );
      } else {
        return WINDOW$1.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      }
    };
  
    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    const getActivationStart = () => {
      const navEntry = getNavigationEntry();
      return (navEntry && navEntry.activationStart) || 0;
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    const initMetric = (name, value) => {
      const navEntry = getNavigationEntry();
      let navigationType = 'navigate';
  
      if (navEntry) {
        if (WINDOW$1.document.prerendering || getActivationStart() > 0) {
          navigationType = 'prerender';
        } else {
          navigationType = navEntry.type.replace(/_/g, '-') ;
        }
      }
  
      return {
        name,
        value: typeof value === 'undefined' ? -1 : value,
        rating: 'good', // Will be updated if the value changes.
        delta: 0,
        entries: [],
        id: generateUniqueID(),
        navigationType,
      };
    };
  
    /**
     * Takes a performance entry type and a callback function, and creates a
     * `PerformanceObserver` instance that will observe the specified entry type
     * with buffering enabled and call the callback _for each entry_.
     *
     * This function also feature-detects entry support and wraps the logic in a
     * try/catch to avoid errors in unsupporting browsers.
     */
    const observe = (
      type,
      callback,
      opts,
    ) => {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(type)) {
          const po = new PerformanceObserver(list => {
            callback(list.getEntries() );
          });
          po.observe(
            Object.assign(
              {
                type,
                buffered: true,
              },
              opts || {},
            ) ,
          );
          return po;
        }
      } catch (e) {
        // Do nothing.
      }
      return;
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    const onHidden = (cb, once) => {
      const onHiddenOrPageHide = (event) => {
        if (event.type === 'pagehide' || WINDOW$1.document.visibilityState === 'hidden') {
          cb(event);
          if (once) {
            removeEventListener('visibilitychange', onHiddenOrPageHide, true);
            removeEventListener('pagehide', onHiddenOrPageHide, true);
          }
        }
      };
      addEventListener('visibilitychange', onHiddenOrPageHide, true);
      // Some browsers have buggy implementations of visibilitychange,
      // so we use pagehide in addition, just to be safe.
      addEventListener('pagehide', onHiddenOrPageHide, true);
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    /**
     * Calculates the [CLS](https://web.dev/cls/) value for the current page and
     * calls the `callback` function once the value is ready to be reported, along
     * with all `layout-shift` performance entries that were used in the metric
     * value calculation. The reported value is a `double` (corresponding to a
     * [layout shift score](https://web.dev/cls/#layout-shift-score)).
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called as soon as the value is initially
     * determined as well as any time the value changes throughout the page
     * lifespan.
     *
     * _**Important:** CLS should be continually monitored for changes throughout
     * the entire lifespan of a page—including if the user returns to the page after
     * it's been hidden/backgrounded. However, since browsers often [will not fire
     * additional callbacks once the user has backgrounded a
     * page](https://developer.chrome.com/blog/page-lifecycle-api/#advice-hidden),
     * `callback` is always called when the page's visibility state changes to
     * hidden. As a result, the `callback` function might be called multiple times
     * during the same page load._
     */
    const onCLS = (onReport) => {
      const metric = initMetric('CLS', 0);
      let report;
  
      let sessionValue = 0;
      let sessionEntries = [];
  
      // const handleEntries = (entries: Metric['entries']) => {
      const handleEntries = (entries) => {
        entries.forEach(entry => {
          // Only count layout shifts without recent user input.
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
  
            // If the entry occurred less than 1 second after the previous entry and
            // less than 5 seconds after the first entry in the session, include the
            // entry in the current session. Otherwise, start a new session.
            if (
              sessionValue &&
              sessionEntries.length !== 0 &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
  
            // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.
            if (sessionValue > metric.value) {
              metric.value = sessionValue;
              metric.entries = sessionEntries;
              if (report) {
                report();
              }
            }
          }
        });
      };
  
      const po = observe('layout-shift', handleEntries);
      if (po) {
        report = bindReporter(onReport, metric);
  
        const stopListening = () => {
          handleEntries(po.takeRecords() );
          report(true);
        };
  
        onHidden(stopListening);
  
        return stopListening;
      }
  
      return;
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    let firstHiddenTime = -1;
  
    const initHiddenTime = () => {
      // If the document is hidden and not prerendering, assume it was always
      // hidden and the page was loaded in the background.
      return WINDOW$1.document.visibilityState === 'hidden' && !WINDOW$1.document.prerendering ? 0 : Infinity;
    };
  
    const trackChanges = () => {
      // Update the time if/when the document becomes hidden.
      onHidden(({ timeStamp }) => {
        firstHiddenTime = timeStamp;
      }, true);
    };
  
    const getVisibilityWatcher = (
  
    ) => {
      if (firstHiddenTime < 0) {
        // If the document is hidden when this code runs, assume it was hidden
        // since navigation start. This isn't a perfect heuristic, but it's the
        // best we can do until an API is available to support querying past
        // visibilityState.
        firstHiddenTime = initHiddenTime();
        trackChanges();
      }
      return {
        get firstHiddenTime() {
          return firstHiddenTime;
        },
      };
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    /**
     * Calculates the [FID](https://web.dev/fid/) value for the current page and
     * calls the `callback` function once the value is ready, along with the
     * relevant `first-input` performance entry used to determine the value. The
     * reported value is a `DOMHighResTimeStamp`.
     *
     * _**Important:** since FID is only reported after the user interacts with the
     * page, it's possible that it will not be reported for some page loads._
     */
    const onFID = (onReport) => {
      const visibilityWatcher = getVisibilityWatcher();
      const metric = initMetric('FID');
      // eslint-disable-next-line prefer-const
      let report;
  
      const handleEntry = (entry) => {
        // Only report if the page wasn't hidden prior to the first input.
        if (entry.startTime < visibilityWatcher.firstHiddenTime) {
          metric.value = entry.processingStart - entry.startTime;
          metric.entries.push(entry);
          report(true);
        }
      };
  
      const handleEntries = (entries) => {
        (entries ).forEach(handleEntry);
      };
  
      const po = observe('first-input', handleEntries);
      report = bindReporter(onReport, metric);
  
      if (po) {
        onHidden(() => {
          handleEntries(po.takeRecords() );
          po.disconnect();
        }, true);
      }
    };
  
    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
  
    const reportedMetricIDs = {};
  
    /**
     * Calculates the [LCP](https://web.dev/lcp/) value for the current page and
     * calls the `callback` function once the value is ready (along with the
     * relevant `largest-contentful-paint` performance entry used to determine the
     * value). The reported value is a `DOMHighResTimeStamp`.
     */
    const onLCP = (onReport) => {
      const visibilityWatcher = getVisibilityWatcher();
      const metric = initMetric('LCP');
      let report;
  
      const handleEntries = (entries) => {
        const lastEntry = entries[entries.length - 1] ;
        if (lastEntry) {
          // The startTime attribute returns the value of the renderTime if it is
          // not 0, and the value of the loadTime otherwise. The activationStart
          // reference is used because LCP should be relative to page activation
          // rather than navigation start if the page was prerendered.
          const value = Math.max(lastEntry.startTime - getActivationStart(), 0);
  
          // Only report if the page wasn't hidden prior to LCP.
          if (value < visibilityWatcher.firstHiddenTime) {
            metric.value = value;
            metric.entries = [lastEntry];
            report();
          }
        }
      };
  
      const po = observe('largest-contentful-paint', handleEntries);
  
      if (po) {
        report = bindReporter(onReport, metric);
  
        const stopListening = () => {
          if (!reportedMetricIDs[metric.id]) {
            handleEntries(po.takeRecords() );
            po.disconnect();
            reportedMetricIDs[metric.id] = true;
            report(true);
          }
        };
  
        // Stop listening after input. Note: while scrolling is an input that
        // stop LCP observation, it's unreliable since it can be programmatically
        // generated. See: https://github.com/GoogleChrome/web-vitals/issues/75
        ['keydown', 'click'].forEach(type => {
          addEventListener(type, stopListening, { once: true, capture: true });
        });
  
        onHidden(stopListening, true);
  
        return stopListening;
      }
  
      return;
    };
  
    const handlers = {};
    const instrumented = {};
  
    let _previousCls;
    let _previousFid;
    let _previousLcp;
  
    /**
     * Add a callback that will be triggered when a CLS metric is available.
     * Returns a cleanup callback which can be called to remove the instrumentation handler.
     *
     * Pass `stopOnCallback = true` to stop listening for CLS when the cleanup callback is called.
     * This will lead to the CLS being finalized and frozen.
     */
    function addClsInstrumentationHandler(
      callback,
      stopOnCallback = false,
    ) {
      return addMetricObserver('cls', callback, instrumentCls, _previousCls, stopOnCallback);
    }
  
    /**
     * Add a callback that will be triggered when a LCP metric is available.
     * Returns a cleanup callback which can be called to remove the instrumentation handler.
     *
     * Pass `stopOnCallback = true` to stop listening for LCP when the cleanup callback is called.
     * This will lead to the LCP being finalized and frozen.
     */
    function addLcpInstrumentationHandler(
      callback,
      stopOnCallback = false,
    ) {
      return addMetricObserver('lcp', callback, instrumentLcp, _previousLcp, stopOnCallback);
    }
  
    /**
     * Add a callback that will be triggered when a FID metric is available.
     * Returns a cleanup callback which can be called to remove the instrumentation handler.
     */
    function addFidInstrumentationHandler(callback) {
      return addMetricObserver('fid', callback, instrumentFid, _previousFid);
    }
  
    /**
     * Add a callback that will be triggered when a performance observer is triggered,
     * and receives the entries of the observer.
     * Returns a cleanup callback which can be called to remove the instrumentation handler.
     */
    function addPerformanceInstrumentationHandler(
      type,
      callback,
    ) {
      addHandler(type, callback);
  
      if (!instrumented[type]) {
        instrumentPerformanceObserver(type);
        instrumented[type] = true;
      }
  
      return getCleanupCallback(type, callback);
    }
  
    /** Trigger all handlers of a given type. */
    function triggerHandlers(type, data) {
      const typeHandlers = handlers[type];
  
      if (!typeHandlers || !typeHandlers.length) {
        return;
      }
  
      for (const handler of typeHandlers) {
        try {
          handler(data);
        } catch (e) {
          logger.error(
              `Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError:`,
              e,
            );
        }
      }
    }
  
    function instrumentCls() {
      return onCLS(metric => {
        triggerHandlers('cls', {
          metric,
        });
        _previousCls = metric;
      });
    }
  
    function instrumentFid() {
      return onFID(metric => {
        triggerHandlers('fid', {
          metric,
        });
        _previousFid = metric;
      });
    }
  
    function instrumentLcp() {
      return onLCP(metric => {
        triggerHandlers('lcp', {
          metric,
        });
        _previousLcp = metric;
      });
    }
  
    function addMetricObserver(
      type,
      callback,
      instrumentFn,
      previousValue,
      stopOnCallback = false,
    ) {
      addHandler(type, callback);
  
      let stopListening;
  
      if (!instrumented[type]) {
        stopListening = instrumentFn();
        instrumented[type] = true;
      }
  
      if (previousValue) {
        callback({ metric: previousValue });
      }
  
      return getCleanupCallback(type, callback, stopOnCallback ? stopListening : undefined);
    }
  
    function instrumentPerformanceObserver(type) {
      const options = {};
  
      // Special per-type options we want to use
      if (type === 'event') {
        options.durationThreshold = 0;
      }
  
      observe(
        type,
        entries => {
          triggerHandlers(type, { entries });
        },
        options,
      );
    }
  
    function addHandler(type, handler) {
      handlers[type] = handlers[type] || [];
      (handlers[type] ).push(handler);
    }
  
    // Get a callback which can be called to remove the instrumentation handler
    function getCleanupCallback(
      type,
      callback,
      stopListening,
    ) {
      return () => {
        if (stopListening) {
          stopListening();
        }
  
        const typeHandlers = handlers[type];
  
        if (!typeHandlers) {
          return;
        }
  
        const index = typeHandlers.indexOf(callback);
        if (index !== -1) {
          typeHandlers.splice(index, 1);
        }
      };
    }
  
    /**
     * Checks if a given value is a valid measurement value.
     */
    function isMeasurementValue(value) {
      return typeof value === 'number' && isFinite(value);
    }
  
    /**
     * Helper function to start child on transactions. This function will make sure that the transaction will
     * use the start timestamp of the created child span if it is earlier than the transactions actual
     * start timestamp.
     *
     * Note: this will not be possible anymore in v8,
     * unless we do some special handling for browser here...
     */
    function _startChild(transaction, { startTimestamp, ...ctx }) {
      // eslint-disable-next-line deprecation/deprecation
      if (startTimestamp && transaction.startTimestamp > startTimestamp) {
        // eslint-disable-next-line deprecation/deprecation
        transaction.startTimestamp = startTimestamp;
      }
  
      // eslint-disable-next-line deprecation/deprecation
      return transaction.startChild({
        startTimestamp,
        ...ctx,
      });
    }
  
    const MAX_INT_AS_BYTES = 2147483647;
  
    /**
     * Converts from milliseconds to seconds
     * @param time time in ms
     */
    function msToSec(time) {
      return time / 1000;
    }
  
    function getBrowserPerformanceAPI() {
      // @ts-expect-error we want to make sure all of these are available, even if TS is sure they are
      return WINDOW$1 && WINDOW$1.addEventListener && WINDOW$1.performance;
    }
  
    let _performanceCursor = 0;
  
    let _measurements = {};
    let _lcpEntry;
    let _clsEntry;
  
    /**
     * Start tracking web vitals.
     * The callback returned by this function can be used to stop tracking & ensure all measurements are final & captured.
     *
     * @returns A function that forces web vitals collection
     */
    function startTrackingWebVitals() {
      const performance = getBrowserPerformanceAPI();
      if (performance && browserPerformanceTimeOrigin) {
        // @ts-expect-error we want to make sure all of these are available, even if TS is sure they are
        if (performance.mark) {
          WINDOW$1.performance.mark('sentry-tracing-init');
        }
        const fidCallback = _trackFID();
        const clsCallback = _trackCLS();
        const lcpCallback = _trackLCP();
  
        return () => {
          fidCallback();
          clsCallback();
          lcpCallback();
        };
      }
  
      return () => undefined;
    }
  
    /**
     * Start tracking long tasks.
     */
    function startTrackingLongTasks() {
      addPerformanceInstrumentationHandler('longtask', ({ entries }) => {
        for (const entry of entries) {
          // eslint-disable-next-line deprecation/deprecation
          const transaction = getActiveTransaction() ;
          if (!transaction) {
            return;
          }
          const startTime = msToSec((browserPerformanceTimeOrigin ) + entry.startTime);
          const duration = msToSec(entry.duration);
  
          // eslint-disable-next-line deprecation/deprecation
          transaction.startChild({
            description: 'Main UI thread blocked',
            op: 'ui.long-task',
            origin: 'auto.ui.browser.metrics',
            startTimestamp: startTime,
            endTimestamp: startTime + duration,
          });
        }
      });
    }
  
    /**
     * Start tracking interaction events.
     */
    function startTrackingInteractions() {
      addPerformanceInstrumentationHandler('event', ({ entries }) => {
        for (const entry of entries) {
          // eslint-disable-next-line deprecation/deprecation
          const transaction = getActiveTransaction() ;
          if (!transaction) {
            return;
          }
  
          if (entry.name === 'click') {
            const startTime = msToSec((browserPerformanceTimeOrigin ) + entry.startTime);
            const duration = msToSec(entry.duration);
  
            const span = {
              description: htmlTreeAsString(entry.target),
              op: `ui.interaction.${entry.name}`,
              origin: 'auto.ui.browser.metrics',
              startTimestamp: startTime,
              endTimestamp: startTime + duration,
            };
  
            const componentName = getComponentName(entry.target);
            if (componentName) {
              span.attributes = { 'ui.component_name': componentName };
            }
  
            // eslint-disable-next-line deprecation/deprecation
            transaction.startChild(span);
          }
        }
      });
    }
  
    /** Starts tracking the Cumulative Layout Shift on the current page. */
    function _trackCLS() {
      return addClsInstrumentationHandler(({ metric }) => {
        const entry = metric.entries[metric.entries.length - 1];
        if (!entry) {
          return;
        }
  
        logger.log('[Measurements] Adding CLS');
        _measurements['cls'] = { value: metric.value, unit: '' };
        _clsEntry = entry ;
      }, true);
    }
  
    /** Starts tracking the Largest Contentful Paint on the current page. */
    function _trackLCP() {
      return addLcpInstrumentationHandler(({ metric }) => {
        const entry = metric.entries[metric.entries.length - 1];
        if (!entry) {
          return;
        }
  
        logger.log('[Measurements] Adding LCP');
        _measurements['lcp'] = { value: metric.value, unit: 'millisecond' };
        _lcpEntry = entry ;
      }, true);
    }
  
    /** Starts tracking the First Input Delay on the current page. */
    function _trackFID() {
      return addFidInstrumentationHandler(({ metric }) => {
        const entry = metric.entries[metric.entries.length - 1];
        if (!entry) {
          return;
        }
  
        const timeOrigin = msToSec(browserPerformanceTimeOrigin );
        const startTime = msToSec(entry.startTime);
        logger.log('[Measurements] Adding FID');
        _measurements['fid'] = { value: metric.value, unit: 'millisecond' };
        _measurements['mark.fid'] = { value: timeOrigin + startTime, unit: 'second' };
      });
    }
  
    /** Add performance related spans to a transaction */
    function addPerformanceEntries(transaction) {
      const performance = getBrowserPerformanceAPI();
      if (!performance || !WINDOW$1.performance.getEntries || !browserPerformanceTimeOrigin) {
        // Gatekeeper if performance API not available
        return;
      }
  
      logger.log('[Tracing] Adding & adjusting spans using Performance API');
      const timeOrigin = msToSec(browserPerformanceTimeOrigin);
  
      const performanceEntries = performance.getEntries();
  
      let responseStartTimestamp;
      let requestStartTimestamp;
  
      const { op, start_timestamp: transactionStartTime } = spanToJSON(transaction);
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      performanceEntries.slice(_performanceCursor).forEach((entry) => {
        const startTime = msToSec(entry.startTime);
        const duration = msToSec(entry.duration);
  
        // eslint-disable-next-line deprecation/deprecation
        if (transaction.op === 'navigation' && transactionStartTime && timeOrigin + startTime < transactionStartTime) {
          return;
        }
  
        switch (entry.entryType) {
          case 'navigation': {
            _addNavigationSpans(transaction, entry, timeOrigin);
            responseStartTimestamp = timeOrigin + msToSec(entry.responseStart);
            requestStartTimestamp = timeOrigin + msToSec(entry.requestStart);
            break;
          }
          case 'mark':
          case 'paint':
          case 'measure': {
            _addMeasureSpans(transaction, entry, startTime, duration, timeOrigin);
  
            // capture web vitals
            const firstHidden = getVisibilityWatcher();
            // Only report if the page wasn't hidden prior to the web vital.
            const shouldRecord = entry.startTime < firstHidden.firstHiddenTime;
  
            if (entry.name === 'first-paint' && shouldRecord) {
              logger.log('[Measurements] Adding FP');
              _measurements['fp'] = { value: entry.startTime, unit: 'millisecond' };
            }
            if (entry.name === 'first-contentful-paint' && shouldRecord) {
              logger.log('[Measurements] Adding FCP');
              _measurements['fcp'] = { value: entry.startTime, unit: 'millisecond' };
            }
            break;
          }
          case 'resource': {
            _addResourceSpans(transaction, entry, entry.name , startTime, duration, timeOrigin);
            break;
          }
          // Ignore other entry types.
        }
      });
  
      _performanceCursor = Math.max(performanceEntries.length - 1, 0);
  
      _trackNavigator(transaction);
  
      // Measurements are only available for pageload transactions
      if (op === 'pageload') {
        _addTtfbToMeasurements(_measurements, responseStartTimestamp, requestStartTimestamp, transactionStartTime);
  
        ['fcp', 'fp', 'lcp'].forEach(name => {
          if (!_measurements[name] || !transactionStartTime || timeOrigin >= transactionStartTime) {
            return;
          }
          // The web vitals, fcp, fp, lcp, and ttfb, all measure relative to timeOrigin.
          // Unfortunately, timeOrigin is not captured within the transaction span data, so these web vitals will need
          // to be adjusted to be relative to transaction.startTimestamp.
          const oldValue = _measurements[name].value;
          const measurementTimestamp = timeOrigin + msToSec(oldValue);
  
          // normalizedValue should be in milliseconds
          const normalizedValue = Math.abs((measurementTimestamp - transactionStartTime) * 1000);
          const delta = normalizedValue - oldValue;
  
          logger.log(`[Measurements] Normalized ${name} from ${oldValue} to ${normalizedValue} (${delta})`);
          _measurements[name].value = normalizedValue;
        });
  
        const fidMark = _measurements['mark.fid'];
        if (fidMark && _measurements['fid']) {
          // create span for FID
          _startChild(transaction, {
            description: 'first input delay',
            endTimestamp: fidMark.value + msToSec(_measurements['fid'].value),
            op: 'ui.action',
            origin: 'auto.ui.browser.metrics',
            startTimestamp: fidMark.value,
          });
  
          // Delete mark.fid as we don't want it to be part of final payload
          delete _measurements['mark.fid'];
        }
  
        // If FCP is not recorded we should not record the cls value
        // according to the new definition of CLS.
        if (!('fcp' in _measurements)) {
          delete _measurements.cls;
        }
  
        Object.keys(_measurements).forEach(measurementName => {
          setMeasurement(measurementName, _measurements[measurementName].value, _measurements[measurementName].unit);
        });
  
        _tagMetricInfo(transaction);
      }
  
      _lcpEntry = undefined;
      _clsEntry = undefined;
      _measurements = {};
    }
  
    /** Create measure related spans */
    function _addMeasureSpans(
      transaction,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entry,
      startTime,
      duration,
      timeOrigin,
    ) {
      const measureStartTimestamp = timeOrigin + startTime;
      const measureEndTimestamp = measureStartTimestamp + duration;
  
      _startChild(transaction, {
        description: entry.name ,
        endTimestamp: measureEndTimestamp,
        op: entry.entryType ,
        origin: 'auto.resource.browser.metrics',
        startTimestamp: measureStartTimestamp,
      });
  
      return measureStartTimestamp;
    }
  
    /** Instrument navigation entries */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _addNavigationSpans(transaction, entry, timeOrigin) {
      ['unloadEvent', 'redirect', 'domContentLoadedEvent', 'loadEvent', 'connect'].forEach(event => {
        _addPerformanceNavigationTiming(transaction, entry, event, timeOrigin);
      });
      _addPerformanceNavigationTiming(transaction, entry, 'secureConnection', timeOrigin, 'TLS/SSL', 'connectEnd');
      _addPerformanceNavigationTiming(transaction, entry, 'fetch', timeOrigin, 'cache', 'domainLookupStart');
      _addPerformanceNavigationTiming(transaction, entry, 'domainLookup', timeOrigin, 'DNS');
      _addRequest(transaction, entry, timeOrigin);
    }
  
    /** Create performance navigation related spans */
    function _addPerformanceNavigationTiming(
      transaction,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entry,
      event,
      timeOrigin,
      description,
      eventEnd,
    ) {
      const end = eventEnd ? (entry[eventEnd] ) : (entry[`${event}End`] );
      const start = entry[`${event}Start`] ;
      if (!start || !end) {
        return;
      }
      _startChild(transaction, {
        op: 'browser',
        origin: 'auto.browser.browser.metrics',
        description: description || event,
        startTimestamp: timeOrigin + msToSec(start),
        endTimestamp: timeOrigin + msToSec(end),
      });
    }
  
    /** Create request and response related spans */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _addRequest(transaction, entry, timeOrigin) {
      if (entry.responseEnd) {
        // It is possible that we are collecting these metrics when the page hasn't finished loading yet, for example when the HTML slowly streams in.
        // In this case, ie. when the document request hasn't finished yet, `entry.responseEnd` will be 0.
        // In order not to produce faulty spans, where the end timestamp is before the start timestamp, we will only collect
        // these spans when the responseEnd value is available. The backend (Relay) would drop the entire transaction if it contained faulty spans.
        _startChild(transaction, {
          op: 'browser',
          origin: 'auto.browser.browser.metrics',
          description: 'request',
          startTimestamp: timeOrigin + msToSec(entry.requestStart ),
          endTimestamp: timeOrigin + msToSec(entry.responseEnd ),
        });
  
        _startChild(transaction, {
          op: 'browser',
          origin: 'auto.browser.browser.metrics',
          description: 'response',
          startTimestamp: timeOrigin + msToSec(entry.responseStart ),
          endTimestamp: timeOrigin + msToSec(entry.responseEnd ),
        });
      }
    }
  
    /** Create resource-related spans */
    function _addResourceSpans(
      transaction,
      entry,
      resourceUrl,
      startTime,
      duration,
      timeOrigin,
    ) {
      // we already instrument based on fetch and xhr, so we don't need to
      // duplicate spans here.
      if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
        return;
      }
  
      const parsedUrl = parseUrl(resourceUrl);
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = {};
      setResourceEntrySizeData(data, entry, 'transferSize', 'http.response_transfer_size');
      setResourceEntrySizeData(data, entry, 'encodedBodySize', 'http.response_content_length');
      setResourceEntrySizeData(data, entry, 'decodedBodySize', 'http.decoded_response_content_length');
  
      if ('renderBlockingStatus' in entry) {
        data['resource.render_blocking_status'] = entry.renderBlockingStatus;
      }
      if (parsedUrl.protocol) {
        data['url.scheme'] = parsedUrl.protocol.split(':').pop(); // the protocol returned by parseUrl includes a :, but OTEL spec does not, so we remove it.
      }
  
      if (parsedUrl.host) {
        data['server.address'] = parsedUrl.host;
      }
  
      data['url.same_origin'] = resourceUrl.includes(WINDOW$1.location.origin);
  
      const startTimestamp = timeOrigin + startTime;
      const endTimestamp = startTimestamp + duration;
  
      _startChild(transaction, {
        description: resourceUrl.replace(WINDOW$1.location.origin, ''),
        endTimestamp,
        op: entry.initiatorType ? `resource.${entry.initiatorType}` : 'resource.other',
        origin: 'auto.resource.browser.metrics',
        startTimestamp,
        data,
      });
    }
  
    /**
     * Capture the information of the user agent.
     */
    function _trackNavigator(transaction) {
      const navigator = WINDOW$1.navigator ;
      if (!navigator) {
        return;
      }
  
      // track network connectivity
      const connection = navigator.connection;
      if (connection) {
        if (connection.effectiveType) {
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag('effectiveConnectionType', connection.effectiveType);
        }
  
        if (connection.type) {
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag('connectionType', connection.type);
        }
  
        if (isMeasurementValue(connection.rtt)) {
          _measurements['connection.rtt'] = { value: connection.rtt, unit: 'millisecond' };
        }
      }
  
      if (isMeasurementValue(navigator.deviceMemory)) {
        // TODO: Can we rewrite this to an attribute?
        // eslint-disable-next-line deprecation/deprecation
        transaction.setTag('deviceMemory', `${navigator.deviceMemory} GB`);
      }
  
      if (isMeasurementValue(navigator.hardwareConcurrency)) {
        // TODO: Can we rewrite this to an attribute?
        // eslint-disable-next-line deprecation/deprecation
        transaction.setTag('hardwareConcurrency', String(navigator.hardwareConcurrency));
      }
    }
  
    /** Add LCP / CLS data to transaction to allow debugging */
    function _tagMetricInfo(transaction) {
      if (_lcpEntry) {
        logger.log('[Measurements] Adding LCP Data');
  
        // Capture Properties of the LCP element that contributes to the LCP.
  
        if (_lcpEntry.element) {
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag('lcp.element', htmlTreeAsString(_lcpEntry.element));
        }
  
        if (_lcpEntry.id) {
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag('lcp.id', _lcpEntry.id);
        }
  
        if (_lcpEntry.url) {
          // Trim URL to the first 200 characters.
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag('lcp.url', _lcpEntry.url.trim().slice(0, 200));
        }
  
        // TODO: Can we rewrite this to an attribute?
        // eslint-disable-next-line deprecation/deprecation
        transaction.setTag('lcp.size', _lcpEntry.size);
      }
  
      // See: https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift
      if (_clsEntry && _clsEntry.sources) {
        logger.log('[Measurements] Adding CLS Data');
        _clsEntry.sources.forEach((source, index) =>
          // TODO: Can we rewrite this to an attribute?
          // eslint-disable-next-line deprecation/deprecation
          transaction.setTag(`cls.source.${index + 1}`, htmlTreeAsString(source.node)),
        );
      }
    }
  
    function setResourceEntrySizeData(
      data,
      entry,
      key,
      dataKey,
    ) {
      const entryVal = entry[key];
      if (entryVal != null && entryVal < MAX_INT_AS_BYTES) {
        data[dataKey] = entryVal;
      }
    }
  
    /**
     * Add ttfb information to measurements
     *
     * Exported for tests
     */
    function _addTtfbToMeasurements(
      _measurements,
      responseStartTimestamp,
      requestStartTimestamp,
      transactionStartTime,
    ) {
      // Generate TTFB (Time to First Byte), which measured as the time between the beginning of the transaction and the
      // start of the response in milliseconds
      if (typeof responseStartTimestamp === 'number' && transactionStartTime) {
        logger.log('[Measurements] Adding TTFB');
        _measurements['ttfb'] = {
          // As per https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/responseStart,
          // responseStart can be 0 if the request is coming straight from the cache.
          // This might lead us to calculate a negative ttfb if we don't use Math.max here.
          //
          // This logic is the same as what is in the web-vitals library to calculate ttfb
          // https://github.com/GoogleChrome/web-vitals/blob/2301de5015e82b09925238a228a0893635854587/src/onTTFB.ts#L92
          // TODO(abhi): We should use the web-vitals library instead of this custom calculation.
          value: Math.max(responseStartTimestamp - transactionStartTime, 0) * 1000,
          unit: 'millisecond',
        };
  
        if (typeof requestStartTimestamp === 'number' && requestStartTimestamp <= responseStartTimestamp) {
          // Capture the time spent making the request and receiving the first byte of the response.
          // This is the time between the start of the request and the start of the response in milliseconds.
          _measurements['ttfb.requestTime'] = {
            value: (responseStartTimestamp - requestStartTimestamp) * 1000,
            unit: 'millisecond',
          };
        }
      }
    }
  
    /**
     * Create and track fetch request spans for usage in combination with `addInstrumentationHandler`.
     *
     * @returns Span if a span was created, otherwise void.
     */
    function instrumentFetchRequest(
      handlerData,
      shouldCreateSpan,
      shouldAttachHeaders,
      spans,
      spanOrigin = 'auto.http.browser',
    ) {
      if (!hasTracingEnabled() || !handlerData.fetchData) {
        return undefined;
      }
  
      const shouldCreateSpanResult = shouldCreateSpan(handlerData.fetchData.url);
  
      if (handlerData.endTimestamp && shouldCreateSpanResult) {
        const spanId = handlerData.fetchData.__span;
        if (!spanId) return;
  
        const span = spans[spanId];
        if (span) {
          if (handlerData.response) {
            setHttpStatus(span, handlerData.response.status);
  
            const contentLength =
              handlerData.response && handlerData.response.headers && handlerData.response.headers.get('content-length');
  
            if (contentLength) {
              const contentLengthNum = parseInt(contentLength);
              if (contentLengthNum > 0) {
                span.setAttribute('http.response_content_length', contentLengthNum);
              }
            }
          } else if (handlerData.error) {
            span.setStatus('internal_error');
          }
          span.end();
  
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete spans[spanId];
        }
        return undefined;
      }
  
      const scope = getCurrentScope();
      const client = getClient();
  
      const { method, url } = handlerData.fetchData;
  
      const span = shouldCreateSpanResult
        ? startInactiveSpan({
            name: `${method} ${url}`,
            onlyIfParent: true,
            attributes: {
              url,
              type: 'fetch',
              'http.method': method,
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
            },
            op: 'http.client',
          })
        : undefined;
  
      if (span) {
        handlerData.fetchData.__span = span.spanContext().spanId;
        spans[span.spanContext().spanId] = span;
      }
  
      if (shouldAttachHeaders(handlerData.fetchData.url) && client) {
        const request = handlerData.args[0];
  
        // In case the user hasn't set the second argument of a fetch call we default it to `{}`.
        handlerData.args[1] = handlerData.args[1] || {};
  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options = handlerData.args[1];
  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        options.headers = addTracingHeadersToFetchRequest(request, client, scope, options, span);
      }
  
      return span;
    }
  
    /**
     * Adds sentry-trace and baggage headers to the various forms of fetch headers
     */
    function addTracingHeadersToFetchRequest(
      request, // unknown is actually type Request but we can't export DOM types from this package,
      client,
      scope,
      options
  
    ,
      requestSpan,
    ) {
      // eslint-disable-next-line deprecation/deprecation
      const span = requestSpan || scope.getSpan();
  
      const isolationScope = getIsolationScope();
  
      const { traceId, spanId, sampled, dsc } = {
        ...isolationScope.getPropagationContext(),
        ...scope.getPropagationContext(),
      };
  
      const sentryTraceHeader = span ? spanToTraceHeader(span) : generateSentryTraceHeader(traceId, spanId, sampled);
  
      const sentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader(
        dsc ||
          (span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromClient(traceId, client, scope)),
      );
  
      const headers =
        options.headers ||
        (typeof Request !== 'undefined' && isInstanceOf(request, Request) ? (request ).headers : undefined);
  
      if (!headers) {
        return { 'sentry-trace': sentryTraceHeader, baggage: sentryBaggageHeader };
      } else if (typeof Headers !== 'undefined' && isInstanceOf(headers, Headers)) {
        const newHeaders = new Headers(headers );
  
        newHeaders.append('sentry-trace', sentryTraceHeader);
  
        if (sentryBaggageHeader) {
          // If the same header is appended multiple times the browser will merge the values into a single request header.
          // Its therefore safe to simply push a "baggage" entry, even though there might already be another baggage header.
          newHeaders.append(BAGGAGE_HEADER_NAME, sentryBaggageHeader);
        }
  
        return newHeaders ;
      } else if (Array.isArray(headers)) {
        const newHeaders = [...headers, ['sentry-trace', sentryTraceHeader]];
  
        if (sentryBaggageHeader) {
          // If there are multiple entries with the same key, the browser will merge the values into a single request header.
          // Its therefore safe to simply push a "baggage" entry, even though there might already be another baggage header.
          newHeaders.push([BAGGAGE_HEADER_NAME, sentryBaggageHeader]);
        }
  
        return newHeaders ;
      } else {
        const existingBaggageHeader = 'baggage' in headers ? headers.baggage : undefined;
        const newBaggageHeaders = [];
  
        if (Array.isArray(existingBaggageHeader)) {
          newBaggageHeaders.push(...existingBaggageHeader);
        } else if (existingBaggageHeader) {
          newBaggageHeaders.push(existingBaggageHeader);
        }
  
        if (sentryBaggageHeader) {
          newBaggageHeaders.push(sentryBaggageHeader);
        }
  
        return {
          ...(headers ),
          'sentry-trace': sentryTraceHeader,
          baggage: newBaggageHeaders.length > 0 ? newBaggageHeaders.join(',') : undefined,
        };
      }
    }
  
    /* eslint-disable max-lines */
  
    const DEFAULT_TRACE_PROPAGATION_TARGETS = ['localhost', /^\/(?!\/)/];
  
    /** Options for Request Instrumentation */
  
    const defaultRequestInstrumentationOptions = {
      traceFetch: true,
      traceXHR: true,
      enableHTTPTimings: true,
      // TODO (v8): Remove this property
      tracingOrigins: DEFAULT_TRACE_PROPAGATION_TARGETS,
      tracePropagationTargets: DEFAULT_TRACE_PROPAGATION_TARGETS,
    };
  
    /** Registers span creators for xhr and fetch requests  */
    function instrumentOutgoingRequests(_options) {
      const {
        traceFetch,
        traceXHR,
        // eslint-disable-next-line deprecation/deprecation
        tracePropagationTargets,
        // eslint-disable-next-line deprecation/deprecation
        tracingOrigins,
        shouldCreateSpanForRequest,
        enableHTTPTimings,
      } = {
        traceFetch: defaultRequestInstrumentationOptions.traceFetch,
        traceXHR: defaultRequestInstrumentationOptions.traceXHR,
        ..._options,
      };
  
      const shouldCreateSpan =
        typeof shouldCreateSpanForRequest === 'function' ? shouldCreateSpanForRequest : (_) => true;
  
      // TODO(v8) Remove tracingOrigins here
      // The only reason we're passing it in here is because this instrumentOutgoingRequests function is publicly exported
      // and we don't want to break the API. We can remove it in v8.
      const shouldAttachHeadersWithTargets = (url) =>
        shouldAttachHeaders(url, tracePropagationTargets || tracingOrigins);
  
      const spans = {};
  
      if (traceFetch) {
        addFetchInstrumentationHandler(handlerData => {
          const createdSpan = instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
          if (enableHTTPTimings && createdSpan) {
            addHTTPTimings(createdSpan);
          }
        });
      }
  
      if (traceXHR) {
        addXhrInstrumentationHandler(handlerData => {
          const createdSpan = xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
          if (enableHTTPTimings && createdSpan) {
            addHTTPTimings(createdSpan);
          }
        });
      }
    }
  
    function isPerformanceResourceTiming(entry) {
      return (
        entry.entryType === 'resource' &&
        'initiatorType' in entry &&
        typeof (entry ).nextHopProtocol === 'string' &&
        (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest')
      );
    }
  
    /**
     * Creates a temporary observer to listen to the next fetch/xhr resourcing timings,
     * so that when timings hit their per-browser limit they don't need to be removed.
     *
     * @param span A span that has yet to be finished, must contain `url` on data.
     */
    function addHTTPTimings(span) {
      const { url } = spanToJSON(span).data || {};
  
      if (!url || typeof url !== 'string') {
        return;
      }
  
      const cleanup = addPerformanceInstrumentationHandler('resource', ({ entries }) => {
        entries.forEach(entry => {
          if (isPerformanceResourceTiming(entry) && entry.name.endsWith(url)) {
            const spanData = resourceTimingEntryToSpanData(entry);
            spanData.forEach(data => span.setAttribute(...data));
            // In the next tick, clean this handler up
            // We have to wait here because otherwise this cleans itself up before it is fully done
            setTimeout(cleanup);
          }
        });
      });
    }
  
    /**
     * Converts ALPN protocol ids to name and version.
     *
     * (https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids)
     * @param nextHopProtocol PerformanceResourceTiming.nextHopProtocol
     */
    function extractNetworkProtocol(nextHopProtocol) {
      let name = 'unknown';
      let version = 'unknown';
      let _name = '';
      for (const char of nextHopProtocol) {
        // http/1.1 etc.
        if (char === '/') {
          [name, version] = nextHopProtocol.split('/');
          break;
        }
        // h2, h3 etc.
        if (!isNaN(Number(char))) {
          name = _name === 'h' ? 'http' : _name;
          version = nextHopProtocol.split(_name)[1];
          break;
        }
        _name += char;
      }
      if (_name === nextHopProtocol) {
        // webrtc, ftp, etc.
        name = _name;
      }
      return { name, version };
    }
  
    function getAbsoluteTime(time = 0) {
      return ((browserPerformanceTimeOrigin || performance.timeOrigin) + time) / 1000;
    }
  
    function resourceTimingEntryToSpanData(resourceTiming) {
      const { name, version } = extractNetworkProtocol(resourceTiming.nextHopProtocol);
  
      const timingSpanData = [];
  
      timingSpanData.push(['network.protocol.version', version], ['network.protocol.name', name]);
  
      if (!browserPerformanceTimeOrigin) {
        return timingSpanData;
      }
      return [
        ...timingSpanData,
        ['http.request.redirect_start', getAbsoluteTime(resourceTiming.redirectStart)],
        ['http.request.fetch_start', getAbsoluteTime(resourceTiming.fetchStart)],
        ['http.request.domain_lookup_start', getAbsoluteTime(resourceTiming.domainLookupStart)],
        ['http.request.domain_lookup_end', getAbsoluteTime(resourceTiming.domainLookupEnd)],
        ['http.request.connect_start', getAbsoluteTime(resourceTiming.connectStart)],
        ['http.request.secure_connection_start', getAbsoluteTime(resourceTiming.secureConnectionStart)],
        ['http.request.connection_end', getAbsoluteTime(resourceTiming.connectEnd)],
        ['http.request.request_start', getAbsoluteTime(resourceTiming.requestStart)],
        ['http.request.response_start', getAbsoluteTime(resourceTiming.responseStart)],
        ['http.request.response_end', getAbsoluteTime(resourceTiming.responseEnd)],
      ];
    }
  
    /**
     * A function that determines whether to attach tracing headers to a request.
     * This was extracted from `instrumentOutgoingRequests` to make it easier to test shouldAttachHeaders.
     * We only export this fuction for testing purposes.
     */
    function shouldAttachHeaders(url, tracePropagationTargets) {
      return stringMatchesSomePattern(url, tracePropagationTargets || DEFAULT_TRACE_PROPAGATION_TARGETS);
    }
  
    /**
     * Create and track xhr request spans
     *
     * @returns Span if a span was created, otherwise void.
     */
    // eslint-disable-next-line complexity
    function xhrCallback(
      handlerData,
      shouldCreateSpan,
      shouldAttachHeaders,
      spans,
    ) {
      const xhr = handlerData.xhr;
      const sentryXhrData = xhr && xhr[SENTRY_XHR_DATA_KEY];
  
      if (!hasTracingEnabled() || !xhr || xhr.__sentry_own_request__ || !sentryXhrData) {
        return undefined;
      }
  
      const shouldCreateSpanResult = shouldCreateSpan(sentryXhrData.url);
  
      // check first if the request has finished and is tracked by an existing span which should now end
      if (handlerData.endTimestamp && shouldCreateSpanResult) {
        const spanId = xhr.__sentry_xhr_span_id__;
        if (!spanId) return;
  
        const span = spans[spanId];
        if (span && sentryXhrData.status_code !== undefined) {
          setHttpStatus(span, sentryXhrData.status_code);
          span.end();
  
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete spans[spanId];
        }
        return undefined;
      }
  
      const scope = getCurrentScope();
      const isolationScope = getIsolationScope();
  
      const span = shouldCreateSpanResult
        ? startInactiveSpan({
            name: `${sentryXhrData.method} ${sentryXhrData.url}`,
            onlyIfParent: true,
            attributes: {
              type: 'xhr',
              'http.method': sentryXhrData.method,
              url: sentryXhrData.url,
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.http.browser',
            },
            op: 'http.client',
          })
        : undefined;
  
      if (span) {
        xhr.__sentry_xhr_span_id__ = span.spanContext().spanId;
        spans[xhr.__sentry_xhr_span_id__] = span;
      }
  
      const client = getClient();
  
      if (xhr.setRequestHeader && shouldAttachHeaders(sentryXhrData.url) && client) {
        const { traceId, spanId, sampled, dsc } = {
          ...isolationScope.getPropagationContext(),
          ...scope.getPropagationContext(),
        };
  
        const sentryTraceHeader = span ? spanToTraceHeader(span) : generateSentryTraceHeader(traceId, spanId, sampled);
  
        const sentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader(
          dsc ||
            (span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromClient(traceId, client, scope)),
        );
  
        setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader);
      }
  
      return span;
    }
  
    function setHeaderOnXhr(
      xhr,
      sentryTraceHeader,
      sentryBaggageHeader,
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        xhr.setRequestHeader('sentry-trace', sentryTraceHeader);
        if (sentryBaggageHeader) {
          // From MDN: "If this method is called several times with the same header, the values are merged into one single request header."
          // We can therefore simply set a baggage header without checking what was there before
          // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          xhr.setRequestHeader(BAGGAGE_HEADER_NAME, sentryBaggageHeader);
        }
      } catch (_) {
        // Error: InvalidStateError: Failed to execute 'setRequestHeader' on 'XMLHttpRequest': The object's state must be OPENED.
      }
    }
  
    /**
     * Default function implementing pageload and navigation transactions
     */
    function instrumentRoutingWithDefaults(
      customStartTransaction,
      startTransactionOnPageLoad = true,
      startTransactionOnLocationChange = true,
    ) {
      if (!WINDOW$1 || !WINDOW$1.location) {
        logger.warn('Could not initialize routing instrumentation due to invalid location');
        return;
      }
  
      let startingUrl = WINDOW$1.location.href;
  
      let activeTransaction;
      if (startTransactionOnPageLoad) {
        activeTransaction = customStartTransaction({
          name: WINDOW$1.location.pathname,
          // pageload should always start at timeOrigin (and needs to be in s, not ms)
          startTimestamp: browserPerformanceTimeOrigin ? browserPerformanceTimeOrigin / 1000 : undefined,
          op: 'pageload',
          origin: 'auto.pageload.browser',
          metadata: { source: 'url' },
        });
      }
  
      if (startTransactionOnLocationChange) {
        addHistoryInstrumentationHandler(({ to, from }) => {
          /**
           * This early return is there to account for some cases where a navigation transaction starts right after
           * long-running pageload. We make sure that if `from` is undefined and a valid `startingURL` exists, we don't
           * create an uneccessary navigation transaction.
           *
           * This was hard to duplicate, but this behavior stopped as soon as this fix was applied. This issue might also
           * only be caused in certain development environments where the usage of a hot module reloader is causing
           * errors.
           */
          if (from === undefined && startingUrl && startingUrl.indexOf(to) !== -1) {
            startingUrl = undefined;
            return;
          }
  
          if (from !== to) {
            startingUrl = undefined;
            if (activeTransaction) {
              logger.log(`[Tracing] Finishing current transaction with op: ${activeTransaction.op}`);
              // If there's an open transaction on the scope, we need to finish it before creating an new one.
              activeTransaction.end();
            }
            activeTransaction = customStartTransaction({
              name: WINDOW$1.location.pathname,
              op: 'navigation',
              origin: 'auto.navigation.browser',
              metadata: { source: 'url' },
            });
          }
        });
      }
    }
  
    const BROWSER_TRACING_INTEGRATION_ID = 'BrowserTracing';
  
    /** Options for Browser Tracing integration */
  
    const DEFAULT_BROWSER_TRACING_OPTIONS = {
      ...TRACING_DEFAULTS,
      markBackgroundTransactions: true,
      routingInstrumentation: instrumentRoutingWithDefaults,
      startTransactionOnLocationChange: true,
      startTransactionOnPageLoad: true,
      enableLongTask: true,
      _experiments: {},
      ...defaultRequestInstrumentationOptions,
    };
  
    /**
     * The Browser Tracing integration automatically instruments browser pageload/navigation
     * actions as transactions, and captures requests, metrics and errors as spans.
     *
     * The integration can be configured with a variety of options, and can be extended to use
     * any routing library. This integration uses {@see IdleTransaction} to create transactions.
     *
     * @deprecated Use `browserTracingIntegration()` instead.
     */
    class BrowserTracing  {
      // This class currently doesn't have a static `id` field like the other integration classes, because it prevented
      // @sentry/tracing from being treeshaken. Tree shakers do not like static fields, because they behave like side effects.
      // TODO: Come up with a better plan, than using static fields on integration classes, and use that plan on all
      // integrations.
  
      /** Browser Tracing integration options */
  
      /**
       * @inheritDoc
       */
  
       constructor(_options) {
        this.name = BROWSER_TRACING_INTEGRATION_ID;
        this._hasSetTracePropagationTargets = false;
  
        addTracingExtensions();
  
        if (DEBUG_BUILD$1) {
          this._hasSetTracePropagationTargets = !!(
            _options &&
            // eslint-disable-next-line deprecation/deprecation
            (_options.tracePropagationTargets || _options.tracingOrigins)
          );
        }
  
        this.options = {
          ...DEFAULT_BROWSER_TRACING_OPTIONS,
          ..._options,
        };
  
        // Special case: enableLongTask can be set in _experiments
        // TODO (v8): Remove this in v8
        if (this.options._experiments.enableLongTask !== undefined) {
          this.options.enableLongTask = this.options._experiments.enableLongTask;
        }
  
        // TODO (v8): remove this block after tracingOrigins is removed
        // Set tracePropagationTargets to tracingOrigins if specified by the user
        // In case both are specified, tracePropagationTargets takes precedence
        // eslint-disable-next-line deprecation/deprecation
        if (_options && !_options.tracePropagationTargets && _options.tracingOrigins) {
          // eslint-disable-next-line deprecation/deprecation
          this.options.tracePropagationTargets = _options.tracingOrigins;
        }
  
        this._collectWebVitals = startTrackingWebVitals();
        if (this.options.enableLongTask) {
          startTrackingLongTasks();
        }
        if (this.options._experiments.enableInteractions) {
          startTrackingInteractions();
        }
      }
  
      /**
       * @inheritDoc
       */
       setupOnce(_, getCurrentHub) {
        this._getCurrentHub = getCurrentHub;
        const hub = getCurrentHub();
        // eslint-disable-next-line deprecation/deprecation
        const client = hub.getClient();
        const clientOptions = client && client.getOptions();
  
        const {
          routingInstrumentation: instrumentRouting,
          startTransactionOnLocationChange,
          startTransactionOnPageLoad,
          markBackgroundTransactions,
          traceFetch,
          traceXHR,
          shouldCreateSpanForRequest,
          enableHTTPTimings,
          _experiments,
        } = this.options;
  
        const clientOptionsTracePropagationTargets = clientOptions && clientOptions.tracePropagationTargets;
        // There are three ways to configure tracePropagationTargets:
        // 1. via top level client option `tracePropagationTargets`
        // 2. via BrowserTracing option `tracePropagationTargets`
        // 3. via BrowserTracing option `tracingOrigins` (deprecated)
        //
        // To avoid confusion, favour top level client option `tracePropagationTargets`, and fallback to
        // BrowserTracing option `tracePropagationTargets` and then `tracingOrigins` (deprecated).
        // This is done as it minimizes bundle size (we don't have to have undefined checks).
        //
        // If both 1 and either one of 2 or 3 are set (from above), we log out a warning.
        // eslint-disable-next-line deprecation/deprecation
        const tracePropagationTargets = clientOptionsTracePropagationTargets || this.options.tracePropagationTargets;
        if (DEBUG_BUILD$1 && this._hasSetTracePropagationTargets && clientOptionsTracePropagationTargets) {
          logger.warn(
            '[Tracing] The `tracePropagationTargets` option was set in the BrowserTracing integration and top level `Sentry.init`. The top level `Sentry.init` value is being used.',
          );
        }
  
        instrumentRouting(
          (context) => {
            const transaction = this._createRouteTransaction(context);
  
            this.options._experiments.onStartRouteTransaction &&
              this.options._experiments.onStartRouteTransaction(transaction, context, getCurrentHub);
  
            return transaction;
          },
          startTransactionOnPageLoad,
          startTransactionOnLocationChange,
        );
  
        if (markBackgroundTransactions) {
          registerBackgroundTabDetection();
        }
  
        if (_experiments.enableInteractions) {
          this._registerInteractionListener();
        }
  
        instrumentOutgoingRequests({
          traceFetch,
          traceXHR,
          tracePropagationTargets,
          shouldCreateSpanForRequest,
          enableHTTPTimings,
        });
      }
  
      /** Create routing idle transaction. */
       _createRouteTransaction(context) {
        if (!this._getCurrentHub) {
          DEBUG_BUILD$1 &&
            logger.warn(`[Tracing] Did not create ${context.op} transaction because _getCurrentHub is invalid.`);
          return undefined;
        }
  
        const hub = this._getCurrentHub();
  
        const { beforeNavigate, idleTimeout, finalTimeout, heartbeatInterval } = this.options;
  
        const isPageloadTransaction = context.op === 'pageload';
  
        let expandedContext;
        if (isPageloadTransaction) {
          const sentryTrace = isPageloadTransaction ? getMetaContent('sentry-trace') : '';
          const baggage = isPageloadTransaction ? getMetaContent('baggage') : undefined;
          const { traceId, dsc, parentSpanId, sampled } = propagationContextFromHeaders(sentryTrace, baggage);
          expandedContext = {
            traceId,
            parentSpanId,
            parentSampled: sampled,
            ...context,
            metadata: {
              // eslint-disable-next-line deprecation/deprecation
              ...context.metadata,
              dynamicSamplingContext: dsc,
            },
            trimEnd: true,
          };
        } else {
          expandedContext = {
            trimEnd: true,
            ...context,
          };
        }
  
        const modifiedContext = typeof beforeNavigate === 'function' ? beforeNavigate(expandedContext) : expandedContext;
  
        // For backwards compatibility reasons, beforeNavigate can return undefined to "drop" the transaction (prevent it
        // from being sent to Sentry).
        const finalContext = modifiedContext === undefined ? { ...expandedContext, sampled: false } : modifiedContext;
  
        // If `beforeNavigate` set a custom name, record that fact
        // eslint-disable-next-line deprecation/deprecation
        finalContext.metadata =
          finalContext.name !== expandedContext.name
            ? // eslint-disable-next-line deprecation/deprecation
              { ...finalContext.metadata, source: 'custom' }
            : // eslint-disable-next-line deprecation/deprecation
              finalContext.metadata;
  
        this._latestRouteName = finalContext.name;
        this._latestRouteSource = getSource(finalContext);
  
        // eslint-disable-next-line deprecation/deprecation
        if (finalContext.sampled === false) {
          DEBUG_BUILD$1 && logger.log(`[Tracing] Will not send ${finalContext.op} transaction because of beforeNavigate.`);
        }
  
        DEBUG_BUILD$1 && logger.log(`[Tracing] Starting ${finalContext.op} transaction on scope`);
  
        const { location } = WINDOW$1;
  
        const idleTransaction = startIdleTransaction(
          hub,
          finalContext,
          idleTimeout,
          finalTimeout,
          true,
          { location }, // for use in the tracesSampler
          heartbeatInterval,
          isPageloadTransaction, // should wait for finish signal if it's a pageload transaction
        );
  
        if (isPageloadTransaction) {
          WINDOW$1.document.addEventListener('readystatechange', () => {
            if (['interactive', 'complete'].includes(WINDOW$1.document.readyState)) {
              idleTransaction.sendAutoFinishSignal();
            }
          });
  
          if (['interactive', 'complete'].includes(WINDOW$1.document.readyState)) {
            idleTransaction.sendAutoFinishSignal();
          }
        }
  
        idleTransaction.registerBeforeFinishCallback(transaction => {
          this._collectWebVitals();
          addPerformanceEntries(transaction);
        });
  
        return idleTransaction ;
      }
  
      /** Start listener for interaction transactions */
       _registerInteractionListener() {
        let inflightInteractionTransaction;
        const registerInteractionTransaction = () => {
          const { idleTimeout, finalTimeout, heartbeatInterval } = this.options;
          const op = 'ui.action.click';
  
          // eslint-disable-next-line deprecation/deprecation
          const currentTransaction = getActiveTransaction();
          if (currentTransaction && currentTransaction.op && ['navigation', 'pageload'].includes(currentTransaction.op)) {
            logger.warn(
                `[Tracing] Did not create ${op} transaction because a pageload or navigation transaction is in progress.`,
              );
            return undefined;
          }
  
          if (inflightInteractionTransaction) {
            inflightInteractionTransaction.setFinishReason('interactionInterrupted');
            inflightInteractionTransaction.end();
            inflightInteractionTransaction = undefined;
          }
  
          if (!this._getCurrentHub) {
            logger.warn(`[Tracing] Did not create ${op} transaction because _getCurrentHub is invalid.`);
            return undefined;
          }
  
          if (!this._latestRouteName) {
            logger.warn(`[Tracing] Did not create ${op} transaction because _latestRouteName is missing.`);
            return undefined;
          }
  
          const hub = this._getCurrentHub();
          const { location } = WINDOW$1;
  
          const context = {
            name: this._latestRouteName,
            op,
            trimEnd: true,
            data: {
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: this._latestRouteSource || 'url',
            },
          };
  
          inflightInteractionTransaction = startIdleTransaction(
            hub,
            context,
            idleTimeout,
            finalTimeout,
            true,
            { location }, // for use in the tracesSampler
            heartbeatInterval,
          );
        };
  
        ['click'].forEach(type => {
          addEventListener(type, registerInteractionTransaction, { once: false, capture: true });
        });
      }
    }
  
    /** Returns the value of a meta tag */
    function getMetaContent(metaName) {
      // Can't specify generic to `getDomElement` because tracing can be used
      // in a variety of environments, have to disable `no-unsafe-member-access`
      // as a result.
      const metaTag = getDomElement(`meta[name=${metaName}]`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return metaTag ? metaTag.getAttribute('content') : undefined;
    }
  
    function getSource(context) {
      const sourceFromAttributes = context.attributes && context.attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
      // eslint-disable-next-line deprecation/deprecation
      const sourceFromData = context.data && context.data[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
      // eslint-disable-next-line deprecation/deprecation
      const sourceFromMetadata = context.metadata && context.metadata.source;
  
      return sourceFromAttributes || sourceFromData || sourceFromMetadata;
    }
  
    /**
     * This patches the global object and injects the Tracing extensions methods
     */
    function addExtensionMethods() {
      addTracingExtensions();
    }
  
    const WINDOW = GLOBAL_OBJ ;
  
    let ignoreOnError = 0;
  
    /**
     * @hidden
     */
    function shouldIgnoreOnError() {
      return ignoreOnError > 0;
    }
  
    /**
     * @hidden
     */
    function ignoreNextOnError() {
      // onerror should trigger before setTimeout
      ignoreOnError++;
      setTimeout(() => {
        ignoreOnError--;
      });
    }
  
    /**
     * Instruments the given function and sends an event to Sentry every time the
     * function throws an exception.
     *
     * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
     * has a correct `this` context.
     * @returns The wrapped function.
     * @hidden
     */
    function wrap$1(
      fn,
      options
  
     = {},
      before,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
      // for future readers what this does is wrap a function and then create
      // a bi-directional wrapping between them.
      //
      // example: wrapped = wrap(original);
      //  original.__sentry_wrapped__ -> wrapped
      //  wrapped.__sentry_original__ -> original
  
      if (typeof fn !== 'function') {
        return fn;
      }
  
      try {
        // if we're dealing with a function that was previously wrapped, return
        // the original wrapper.
        const wrapper = fn.__sentry_wrapped__;
        if (wrapper) {
          return wrapper;
        }
  
        // We don't wanna wrap it twice
        if (getOriginalFunction(fn)) {
          return fn;
        }
      } catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        // Bail on wrapping and return the function as-is (defers to window.onerror).
        return fn;
      }
  
      /* eslint-disable prefer-rest-params */
      // It is important that `sentryWrapped` is not an arrow function to preserve the context of `this`
      const sentryWrapped = function () {
        const args = Array.prototype.slice.call(arguments);
  
        try {
          if (before && typeof before === 'function') {
            before.apply(this, arguments);
          }
  
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          const wrappedArguments = args.map((arg) => wrap$1(arg, options));
  
          // Attempt to invoke user-land function
          // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
          //       means the sentry.javascript SDK caught an error invoking your application code. This
          //       is expected behavior and NOT indicative of a bug with sentry.javascript.
          return fn.apply(this, wrappedArguments);
        } catch (ex) {
          ignoreNextOnError();
  
          withScope(scope => {
            scope.addEventProcessor(event => {
              if (options.mechanism) {
                addExceptionTypeValue(event, undefined, undefined);
                addExceptionMechanism(event, options.mechanism);
              }
  
              event.extra = {
                ...event.extra,
                arguments: args,
              };
  
              return event;
            });
  
            captureException(ex);
          });
  
          throw ex;
        }
      };
      /* eslint-enable prefer-rest-params */
  
      // Accessing some objects may throw
      // ref: https://github.com/getsentry/sentry-javascript/issues/1168
      try {
        for (const property in fn) {
          if (Object.prototype.hasOwnProperty.call(fn, property)) {
            sentryWrapped[property] = fn[property];
          }
        }
      } catch (_oO) {} // eslint-disable-line no-empty
  
      // Signal that this function has been wrapped/filled already
      // for both debugging and to prevent it to being wrapped/filled twice
      markFunctionWrapped(sentryWrapped, fn);
  
      addNonEnumerableProperty(fn, '__sentry_wrapped__', sentryWrapped);
  
      // Restore original function name (not all browsers allow that)
      try {
        const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name') ;
        if (descriptor.configurable) {
          Object.defineProperty(sentryWrapped, 'name', {
            get() {
              return fn.name;
            },
          });
        }
        // eslint-disable-next-line no-empty
      } catch (_oO) {}
  
      return sentryWrapped;
    }
  
    /**
     * All properties the report dialog supports
     *
     * @deprecated This type will be removed in the next major version of the Sentry SDK. `showReportDialog` will still be around, however the `eventId` option will now be required.
     */
  
    /**
     * This is a slim shim of `browserTracingIntegration` for the CDN bundles.
     * Since the actual functional integration uses a different code from `BrowserTracing`,
     * we want to avoid shipping both of them in the CDN bundles, as that would blow up the size.
     * Instead, we provide a functional integration with the same API, but the old implementation.
     * This means that it's not possible to register custom routing instrumentation, but that's OK for now.
     * We also don't expose the utilities for this anyhow in the CDN bundles.
     * For users that need custom routing in CDN bundles, they have to continue using `new BrowserTracing()` until v8.
     */
    function bundleBrowserTracingIntegration(
      options = {},
    ) {
      // Migrate some options from the old integration to the new one
      // eslint-disable-next-line deprecation/deprecation
      const opts = options;
  
      if (typeof options.markBackgroundSpan === 'boolean') {
        opts.markBackgroundTransactions = options.markBackgroundSpan;
      }
  
      if (typeof options.instrumentPageLoad === 'boolean') {
        opts.startTransactionOnPageLoad = options.instrumentPageLoad;
      }
  
      if (typeof options.instrumentNavigation === 'boolean') {
        opts.startTransactionOnLocationChange = options.instrumentNavigation;
      }
  
      // eslint-disable-next-line deprecation/deprecation
      return new BrowserTracing(opts);
    }
  
    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    const DEBUG_BUILD = true;
  
    /**
     * This function creates an exception from a JavaScript Error
     */
    function exceptionFromError(stackParser, ex) {
        
      // Get the frames first since Opera can lose the stack if we touch anything else first
      const frames = parseStackFrames(stackParser, ex);
  
      const exception = {
        type: ex && ex.name,
        value: extractMessage(ex),
      };
  
      if (frames.length) {
        exception.stacktrace = { frames };
      }
  
      if (exception.type === undefined && exception.value === '') {
        exception.value = 'Unrecoverable error caught';
      }
  
      return exception;
    }
  
    /**
     * @hidden
     */
    function eventFromPlainObject(
      stackParser,
      exception,
      syntheticException,
      isUnhandledRejection,
    ) {
      const client = getClient();
      const normalizeDepth = client && client.getOptions().normalizeDepth;
  
      const event = {
        exception: {
          values: [
            {
              type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? 'UnhandledRejection' : 'Error',
              value: getNonErrorObjectExceptionValue(exception, { isUnhandledRejection }),
            },
          ],
        },
        extra: {
          __serialized__: normalizeToSize(exception, normalizeDepth),
        },
      };
  
      if (syntheticException) {
        const frames = parseStackFrames(stackParser, syntheticException);
        if (frames.length) {
          // event.exception.values[0] has been set above
          (event.exception ).values[0].stacktrace = { frames };
        }
      }
  
      return event;
    }
  
    /**
     * @hidden
     */
    function eventFromError(stackParser, ex) {
      return {
        exception: {
          values: [exceptionFromError(stackParser, ex)],
        },
      };
    }
  
    /** Parses stack frames from an error */
    function parseStackFrames(
      stackParser,
      ex,
    ) {
      // Access and store the stacktrace property before doing ANYTHING
      // else to it because Opera is not very good at providing it
      // reliably in other circumstances.
      const stacktrace = ex.stacktrace || ex.stack || '';
  
      const popSize = getPopSize(ex);
  
      try {
        
        const res = stackParser(stacktrace, popSize);
        
        return res;
      } catch (e) {
        // no-empty
      }
  
      return [];
    }
  
    // Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
    const reactMinifiedRegexp = /Minified React error #\d+;/i;
  
    function getPopSize(ex) {
      if (ex) {
        if (typeof ex.framesToPop === 'number') {
          return ex.framesToPop;
        }
  
        if (reactMinifiedRegexp.test(ex.message)) {
          return 1;
        }
      }
  
      return 0;
    }
  
    /**
     * There are cases where stacktrace.message is an Event object
     * https://github.com/getsentry/sentry-javascript/issues/1949
     * In this specific case we try to extract stacktrace.message.error.message
     */
    function extractMessage(ex) {
      const message = ex && ex.message;
      if (!message) {
        return 'No error message';
      }
      if (message.error && typeof message.error.message === 'string') {
        return message.error.message;
      }
      return message;
    }
  
    /**
     * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
     * @hidden
     */
    function eventFromException(
      stackParser,
      exception,
      hint,
      attachStacktrace,
    ) {
      const syntheticException = (hint && hint.syntheticException) || undefined;
      const event = eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace);
      addExceptionMechanism(event); // defaults to { type: 'generic', handled: true }
      event.level = 'error';
      if (hint && hint.event_id) {
        event.event_id = hint.event_id;
      }
      return resolvedSyncPromise(event);
    }
  
    /**
     * Builds and Event from a Message
     * @hidden
     */
    function eventFromMessage(
      stackParser,
      message,
      // eslint-disable-next-line deprecation/deprecation
      level = 'info',
      hint,
      attachStacktrace,
    ) {
      const syntheticException = (hint && hint.syntheticException) || undefined;
      const event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
      event.level = level;
      if (hint && hint.event_id) {
        event.event_id = hint.event_id;
      }
      return resolvedSyncPromise(event);
    }
  
    /**
     * @hidden
     */
    function eventFromUnknownInput(
      stackParser,
      exception,
      syntheticException,
      attachStacktrace,
      isUnhandledRejection,
    ) {
      let event;
  
      if (isErrorEvent$1(exception ) && (exception ).error) {
        // If it is an ErrorEvent with `error` property, extract it to get actual Error
        const errorEvent = exception ;
        return eventFromError(stackParser, errorEvent.error );
      }
  
      // If it is a `DOMError` (which is a legacy API, but still supported in some browsers) then we just extract the name
      // and message, as it doesn't provide anything else. According to the spec, all `DOMExceptions` should also be
      // `Error`s, but that's not the case in IE11, so in that case we treat it the same as we do a `DOMError`.
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
      // https://webidl.spec.whatwg.org/#es-DOMException-specialness
      if (isDOMError(exception) || isDOMException(exception )) {
        const domException = exception ;
  
        if ('stack' in (exception )) {
          event = eventFromError(stackParser, exception );
        } else {
          const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
          const message = domException.message ? `${name}: ${domException.message}` : name;
          event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
          addExceptionTypeValue(event, message);
        }
        if ('code' in domException) {
          // eslint-disable-next-line deprecation/deprecation
          event.tags = { ...event.tags, 'DOMException.code': `${domException.code}` };
        }
  
        return event;
      }
      if (isError(exception)) {
        // we have a real Error object, do nothing
        return eventFromError(stackParser, exception);
      }
      if (isPlainObject(exception) || isEvent(exception)) {
        // If it's a plain object or an instance of `Event` (the built-in JS kind, not this SDK's `Event` type), serialize
        // it manually. This will allow us to group events based on top-level keys which is much better than creating a new
        // group on any key/value change.
        const objectException = exception ;
        event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
        addExceptionMechanism(event, {
          synthetic: true,
        });
        return event;
      }
  
      // If none of previous checks were valid, then it means that it's not:
      // - an instance of DOMError
      // - an instance of DOMException
      // - an instance of Event
      // - an instance of Error
      // - a valid ErrorEvent (one with an error property)
      // - a plain Object
      //
      // So bail out and capture it as a simple message:
      event = eventFromString(stackParser, exception , syntheticException, attachStacktrace);
      addExceptionTypeValue(event, `${exception}`, undefined);
      addExceptionMechanism(event, {
        synthetic: true,
      });
  
      return event;
    }
  
    /**
     * @hidden
     */
    function eventFromString(
      stackParser,
      message,
      syntheticException,
      attachStacktrace,
    ) {
      const event = {};
  
      if (attachStacktrace && syntheticException) {
        const frames = parseStackFrames(stackParser, syntheticException);
        if (frames.length) {
          event.exception = {
            values: [{ value: message, stacktrace: { frames } }],
          };
        }
      }
  
      if (isParameterizedString(message)) {
        const { __sentry_template_string__, __sentry_template_values__ } = message;
  
        event.logentry = {
          message: __sentry_template_string__,
          params: __sentry_template_values__,
        };
        return event;
      }
  
      event.message = message;
      return event;
    }
  
    function getNonErrorObjectExceptionValue(
      exception,
      { isUnhandledRejection },
    ) {
      const keys = extractExceptionKeysForMessage(exception);
      const captureType = isUnhandledRejection ? 'promise rejection' : 'exception';
  
      // Some ErrorEvent instances do not have an `error` property, which is why they are not handled before
      // We still want to try to get a decent message for these cases
      if (isErrorEvent$1(exception)) {
        return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
      }
  
      if (isEvent(exception)) {
        const className = getObjectClassName(exception);
        return `Event \`${className}\` (type=${exception.type}) captured as ${captureType}`;
      }
  
      return `Object captured as ${captureType} with keys: ${keys}`;
    }
  
    function getObjectClassName(obj) {
      try {
        const prototype = Object.getPrototypeOf(obj);
        return prototype ? prototype.constructor.name : undefined;
      } catch (e) {
        // ignore errors here
      }
    }
  
    /**
     * Creates an envelope from a user feedback.
     */
    function createUserFeedbackEnvelope(
      feedback,
      {
        metadata,
        tunnel,
        dsn,
      }
  
    ,
    ) {
      const headers = {
        event_id: feedback.event_id,
        sent_at: new Date().toISOString(),
        ...(metadata &&
          metadata.sdk && {
            sdk: {
              name: metadata.sdk.name,
              version: metadata.sdk.version,
            },
          }),
        ...(!!tunnel && !!dsn && { dsn: dsnToString(dsn) }),
      };
      const item = createUserFeedbackEnvelopeItem(feedback);
  
      return createEnvelope(headers, [item]);
    }
  
    function createUserFeedbackEnvelopeItem(feedback) {
      const feedbackHeaders = {
        type: 'user_report',
      };
      return [feedbackHeaders, feedback];
    }
  
    /**
     * Configuration options for the Sentry Browser SDK.
     * @see @sentry/types Options for more information.
     */
  
    /**
     * The Sentry Browser SDK Client.
     *
     * @see BrowserOptions for documentation on configuration options.
     * @see SentryClient for usage documentation.
     */
    class BrowserClient extends BaseClient {
      /**
       * Creates a new Browser SDK instance.
       *
       * @param options Configuration options for this SDK.
       */
       constructor(options) {
        const sdkSource = WINDOW.SENTRY_SDK_SOURCE || getSDKSource();
        applySdkMetadata(options, 'browser', ['browser'], sdkSource);
  
        super(options);
  
        if (options.sendClientReports && WINDOW.document) {
          WINDOW.document.addEventListener('visibilitychange', () => {
            if (WINDOW.document.visibilityState === 'hidden') {
              this._flushOutcomes();
            }
          });
        }
      }
  
      /**
       * @inheritDoc
       */
       eventFromException(exception, hint) {
        return eventFromException(this._options.stackParser, exception, hint, this._options.attachStacktrace);
      }
  
      /**
       * @inheritDoc
       */
       eventFromMessage(
        message,
        // eslint-disable-next-line deprecation/deprecation
        level = 'info',
        hint,
      ) {
        return eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
      }
  
      /**
       * Sends user feedback to Sentry.
       */
       captureUserFeedback(feedback) {
        if (!this._isEnabled()) {
          DEBUG_BUILD && logger.warn('SDK not enabled, will not capture user feedback.');
          return;
        }
  
        const envelope = createUserFeedbackEnvelope(feedback, {
          metadata: this.getSdkMetadata(),
          dsn: this.getDsn(),
          tunnel: this.getOptions().tunnel,
        });
  
        // _sendEnvelope should not throw
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._sendEnvelope(envelope);
      }
  
      /**
       * @inheritDoc
       */
       _prepareEvent(event, hint, scope) {
        event.platform = event.platform || 'javascript';
        return super._prepareEvent(event, hint, scope);
      }
  
      /**
       * Sends client reports as an envelope.
       */
       _flushOutcomes() {
        const outcomes = this._clearOutcomes();
  
        if (outcomes.length === 0) {
          DEBUG_BUILD && logger.log('No outcomes to send');
          return;
        }
  
        // This is really the only place where we want to check for a DSN and only send outcomes then
        if (!this._dsn) {
          DEBUG_BUILD && logger.log('No dsn provided, will not send outcomes');
          return;
        }
  
        DEBUG_BUILD && logger.log('Sending outcomes:', outcomes);
  
        const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
  
        // _sendEnvelope should not throw
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._sendEnvelope(envelope);
      }
    }
  
    let cachedFetchImpl = undefined;
  
    /**
     * A special usecase for incorrectly wrapped Fetch APIs in conjunction with ad-blockers.
     * Whenever someone wraps the Fetch API and returns the wrong promise chain,
     * this chain becomes orphaned and there is no possible way to capture it's rejections
     * other than allowing it bubble up to this very handler. eg.
     *
     * const f = window.fetch;
     * window.fetch = function () {
     *   const p = f.apply(this, arguments);
     *
     *   p.then(function() {
     *     console.log('hi.');
     *   });
     *
     *   return p;
     * }
     *
     * `p.then(function () { ... })` is producing a completely separate promise chain,
     * however, what's returned is `p` - the result of original `fetch` call.
     *
     * This mean, that whenever we use the Fetch API to send our own requests, _and_
     * some ad-blocker blocks it, this orphaned chain will _always_ reject,
     * effectively causing another event to be captured.
     * This makes a whole process become an infinite loop, which we need to somehow
     * deal with, and break it in one way or another.
     *
     * To deal with this issue, we are making sure that we _always_ use the real
     * browser Fetch API, instead of relying on what `window.fetch` exposes.
     * The only downside to this would be missing our own requests as breadcrumbs,
     * but because we are already not doing this, it should be just fine.
     *
     * Possible failed fetch error messages per-browser:
     *
     * Chrome:  Failed to fetch
     * Edge:    Failed to Fetch
     * Firefox: NetworkError when attempting to fetch resource
     * Safari:  resource blocked by content blocker
     */
    function getNativeFetchImplementation() {
      if (cachedFetchImpl) {
        return cachedFetchImpl;
      }
  
      /* eslint-disable @typescript-eslint/unbound-method */
  
      // Fast path to avoid DOM I/O
      if (isNativeFetch(WINDOW.fetch)) {
        return (cachedFetchImpl = WINDOW.fetch.bind(WINDOW));
      }
  
      const document = WINDOW.document;
      let fetchImpl = WINDOW.fetch;
      // eslint-disable-next-line deprecation/deprecation
      if (document && typeof document.createElement === 'function') {
        try {
          const sandbox = document.createElement('iframe');
          sandbox.hidden = true;
          document.head.appendChild(sandbox);
          const contentWindow = sandbox.contentWindow;
          if (contentWindow && contentWindow.fetch) {
            fetchImpl = contentWindow.fetch;
          }
          document.head.removeChild(sandbox);
        } catch (e) {
          logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', e);
        }
      }
  
      return (cachedFetchImpl = fetchImpl.bind(WINDOW));
      /* eslint-enable @typescript-eslint/unbound-method */
    }
  
    /** Clears cached fetch impl */
    function clearCachedFetchImplementation() {
      cachedFetchImpl = undefined;
    }
  
    /**
     * Creates a Transport that uses the Fetch API to send events to Sentry.
     */
    function makeFetchTransport(
      options,
      nativeFetch = getNativeFetchImplementation(),
    ) {
      let pendingBodySize = 0;
      let pendingCount = 0;
  
      function makeRequest(request) {
        const requestSize = request.body.length;
        console.log('requestSize::', requestSize);
        pendingBodySize += requestSize;
        pendingCount++;
  
        const requestOptions = {
          body: request.body,
          method: 'POST',
          referrerPolicy: 'origin',
          headers: options.headers,
          // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
          // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
          // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
          // frequently sending events right before the user is switching pages (eg. whenfinishing navigation transactions).
          // Gotchas:
          // - `keepalive` isn't supported by Firefox
          // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
          //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
          //   We will therefore only activate the flag when we're below that limit.
          // There is also a limit of requests that can be open at the same time, so we also limit this to 15
          // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
          keepalive: pendingBodySize <= 60000 && pendingCount < 15,
          ...options.fetchOptions,
        };
  
        try {
          return nativeFetch(options.url, requestOptions).then(response => {
            pendingBodySize -= requestSize;
            pendingCount--;
            return {
              statusCode: response.status,
              headers: {
                'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
                'retry-after': response.headers.get('Retry-After'),
              },
            };
          });
        } catch (e) {
          clearCachedFetchImplementation();
          pendingBodySize -= requestSize;
          pendingCount--;
          return rejectedSyncPromise(e);
        }
      }
  
      return createTransport(options, makeRequest);
    }
  
    /**
     * The DONE ready state for XmlHttpRequest
     *
     * Defining it here as a constant b/c XMLHttpRequest.DONE is not always defined
     * (e.g. during testing, it is `undefined`)
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState}
     */
    const XHR_READYSTATE_DONE = 4;
  
    /**
     * Creates a Transport that uses the XMLHttpRequest API to send events to Sentry.
     */
    function makeXHRTransport(options) {
      function makeRequest(request) {
        return new SyncPromise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
  
          xhr.onerror = reject;
  
          xhr.onreadystatechange = () => {
            if (xhr.readyState === XHR_READYSTATE_DONE) {
              resolve({
                statusCode: xhr.status,
                headers: {
                  'x-sentry-rate-limits': xhr.getResponseHeader('X-Sentry-Rate-Limits'),
                  'retry-after': xhr.getResponseHeader('Retry-After'),
                },
              });
            }
          };
  
          xhr.open('POST', options.url);
  
          for (const header in options.headers) {
            if (Object.prototype.hasOwnProperty.call(options.headers, header)) {
              xhr.setRequestHeader(header, options.headers[header]);
            }
          }
  
          xhr.send(request.body);
        });
      }
  
      return createTransport(options, makeRequest);
    }
  
    // global reference to slice
    const UNKNOWN_FUNCTION = '?';
  
    const OPERA10_PRIORITY = 10;
    const OPERA11_PRIORITY = 20;
    const CHROME_PRIORITY = 30;
    const WINJS_PRIORITY = 40;
    const GECKO_PRIORITY = 50;
  
    function createFrame(filename, func, lineno, colno) {
      const frame = {
        filename,
        function: func,
        in_app: true, // All browser frames are considered in_app
      };
  
      if (lineno !== undefined) {
        frame.lineno = lineno;
      }
  
      if (colno !== undefined) {
        frame.colno = colno;
      }
  
      return frame;
    }
  
    // Chromium based browsers: Chrome, Brave, new Opera, new Edge
    const chromeRegex =
      /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  
    const chrome = line => {
      const parts = chromeRegex.exec(line);
  
      if (parts) {
        const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
  
        if (isEval) {
          const subMatch = chromeEvalRegex.exec(parts[2]);
  
          if (subMatch) {
            // throw out eval line/column and use top-most line/column number
            parts[2] = subMatch[1]; // url
            parts[3] = subMatch[2]; // line
            parts[4] = subMatch[3]; // column
          }
        }
  
        // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
        // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
        const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);
  
        return createFrame(filename, func, parts[3] ? +parts[3] : undefined, parts[4] ? +parts[4] : undefined);
      }
  
      return;
    };
  
    const chromeStackLineParser = [CHROME_PRIORITY, chrome];
  
    // gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
    // generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
    // We need this specific case for now because we want no other regex to match.
    const geckoREgex =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
    const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  
    const gecko = line => {
      const parts = geckoREgex.exec(line);
  
      if (parts) {
        const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
        if (isEval) {
          const subMatch = geckoEvalRegex.exec(parts[3]);
  
          if (subMatch) {
            // throw out eval line/column and use top-most line number
            parts[1] = parts[1] || 'eval';
            parts[3] = subMatch[1];
            parts[4] = subMatch[2];
            parts[5] = ''; // no column when eval
          }
        }
  
        let filename = parts[3];
        let func = parts[1] || UNKNOWN_FUNCTION;
        [func, filename] = extractSafariExtensionDetails(func, filename);
  
        return createFrame(filename, func, parts[4] ? +parts[4] : undefined, parts[5] ? +parts[5] : undefined);
      }
  
      return;
    };
  
    const geckoStackLineParser = [GECKO_PRIORITY, gecko];
  
    const winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  
    const winjs = line => {
      const parts = winjsRegex.exec(line);
  
      return parts
        ? createFrame(parts[2], parts[1] || UNKNOWN_FUNCTION, +parts[3], parts[4] ? +parts[4] : undefined)
        : undefined;
    };
  
    const winjsStackLineParser = [WINJS_PRIORITY, winjs];
  
    const opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
  
    const opera10 = line => {
      const parts = opera10Regex.exec(line);
      return parts ? createFrame(parts[2], parts[3] || UNKNOWN_FUNCTION, +parts[1]) : undefined;
    };
  
    const opera10StackLineParser = [OPERA10_PRIORITY, opera10];
  
    const opera11Regex =
      / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;
  
    const opera11 = line => {
      const parts = opera11Regex.exec(line);
      return parts ? createFrame(parts[5], parts[3] || parts[4] || UNKNOWN_FUNCTION, +parts[1], +parts[2]) : undefined;
    };
  
    const opera11StackLineParser = [OPERA11_PRIORITY, opera11];
  
    const defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser, winjsStackLineParser];
  
    const defaultStackParser = createStackParser(...defaultStackLineParsers);
  
    /**
     * Safari web extensions, starting version unknown, can produce "frames-only" stacktraces.
     * What it means, is that instead of format like:
     *
     * Error: wat
     *   at function@url:row:col
     *   at function@url:row:col
     *   at function@url:row:col
     *
     * it produces something like:
     *
     *   function@url:row:col
     *   function@url:row:col
     *   function@url:row:col
     *
     * Because of that, it won't be captured by `chrome` RegExp and will fall into `Gecko` branch.
     * This function is extracted so that we can use it in both places without duplicating the logic.
     * Unfortunately "just" changing RegExp is too complicated now and making it pass all tests
     * and fix this case seems like an impossible, or at least way too time-consuming task.
     */
    const extractSafariExtensionDetails = (func, filename) => {
      const isSafariExtension = func.indexOf('safari-extension') !== -1;
      const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
  
      return isSafariExtension || isSafariWebExtension
        ? [
            func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION,
            isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`,
          ]
        : [func, filename];
    };
  
    /* eslint-disable max-lines */
  
    /** maxStringLength gets capped to prevent 100 breadcrumbs exceeding 1MB event payload size */
    const MAX_ALLOWED_STRING_LENGTH = 1024;
  
    const INTEGRATION_NAME$5 = 'Breadcrumbs';
  
    const _breadcrumbsIntegration = ((options = {}) => {
      const _options = {
        console: true,
        dom: true,
        fetch: true,
        history: true,
        sentry: true,
        xhr: true,
        ...options,
      };
  
      return {
        name: INTEGRATION_NAME$5,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        setup(client) {
          if (_options.console) {
            addConsoleInstrumentationHandler(_getConsoleBreadcrumbHandler(client));
          }
          if (_options.dom) {
            addClickKeypressInstrumentationHandler(_getDomBreadcrumbHandler(client, _options.dom));
          }
          if (_options.xhr) {
            addXhrInstrumentationHandler(_getXhrBreadcrumbHandler(client));
          }
          if (_options.fetch) {
            addFetchInstrumentationHandler(_getFetchBreadcrumbHandler(client));
          }
          if (_options.history) {
            addHistoryInstrumentationHandler(_getHistoryBreadcrumbHandler(client));
          }
          if (_options.sentry && client.on) {
            client.on('beforeSendEvent', _getSentryBreadcrumbHandler(client));
          }
        },
      };
    }) ;
  
    const breadcrumbsIntegration = defineIntegration(_breadcrumbsIntegration);
  
    /**
     * Default Breadcrumbs instrumentations
     *
     * @deprecated Use `breadcrumbsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const Breadcrumbs = convertIntegrationFnToClass(INTEGRATION_NAME$5, breadcrumbsIntegration)
  
  ;
  
    /**
     * Adds a breadcrumb for Sentry events or transactions if this option is enabled.
     */
    function _getSentryBreadcrumbHandler(client) {
      return function addSentryBreadcrumb(event) {
        if (getClient() !== client) {
          return;
        }
  
        addBreadcrumb(
          {
            category: `sentry.${event.type === 'transaction' ? 'transaction' : 'event'}`,
            event_id: event.event_id,
            level: event.level,
            message: getEventDescription(event),
          },
          {
            event,
          },
        );
      };
    }
  
    /**
     * A HOC that creaes a function that creates breadcrumbs from DOM API calls.
     * This is a HOC so that we get access to dom options in the closure.
     */
    function _getDomBreadcrumbHandler(
      client,
      dom,
    ) {
      return function _innerDomBreadcrumb(handlerData) {
        if (getClient() !== client) {
          return;
        }
  
        let target;
        let componentName;
        let keyAttrs = typeof dom === 'object' ? dom.serializeAttribute : undefined;
  
        let maxStringLength =
          typeof dom === 'object' && typeof dom.maxStringLength === 'number' ? dom.maxStringLength : undefined;
        if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
          logger.warn(
              `\`dom.maxStringLength\` cannot exceed ${MAX_ALLOWED_STRING_LENGTH}, but a value of ${maxStringLength} was configured. Sentry will use ${MAX_ALLOWED_STRING_LENGTH} instead.`,
            );
          maxStringLength = MAX_ALLOWED_STRING_LENGTH;
        }
  
        if (typeof keyAttrs === 'string') {
          keyAttrs = [keyAttrs];
        }
  
        // Accessing event.target can throw (see getsentry/raven-js#838, #768)
        try {
          const event = handlerData.event ;
          const element = _isEvent(event) ? event.target : event;
  
          target = htmlTreeAsString(element, { keyAttrs, maxStringLength });
          componentName = getComponentName(element);
        } catch (e) {
          target = '<unknown>';
        }
  
        if (target.length === 0) {
          return;
        }
  
        const breadcrumb = {
          category: `ui.${handlerData.name}`,
          message: target,
        };
  
        if (componentName) {
          breadcrumb.data = { 'ui.component_name': componentName };
        }
  
        addBreadcrumb(breadcrumb, {
          event: handlerData.event,
          name: handlerData.name,
          global: handlerData.global,
        });
      };
    }
  
    /**
     * Creates breadcrumbs from console API calls
     */
    function _getConsoleBreadcrumbHandler(client) {
      return function _consoleBreadcrumb(handlerData) {
        if (getClient() !== client) {
          return;
        }
  
        const breadcrumb = {
          category: 'console',
          data: {
            arguments: handlerData.args,
            logger: 'console',
          },
          level: severityLevelFromString(handlerData.level),
          message: safeJoin(handlerData.args, ' '),
        };
  
        if (handlerData.level === 'assert') {
          if (handlerData.args[0] === false) {
            breadcrumb.message = `Assertion failed: ${safeJoin(handlerData.args.slice(1), ' ') || 'console.assert'}`;
            breadcrumb.data.arguments = handlerData.args.slice(1);
          } else {
            // Don't capture a breadcrumb for passed assertions
            return;
          }
        }
  
        addBreadcrumb(breadcrumb, {
          input: handlerData.args,
          level: handlerData.level,
        });
      };
    }
  
    /**
     * Creates breadcrumbs from XHR API calls
     */
    function _getXhrBreadcrumbHandler(client) {
      return function _xhrBreadcrumb(handlerData) {
        if (getClient() !== client) {
          return;
        }
  
        const { startTimestamp, endTimestamp } = handlerData;
  
        const sentryXhrData = handlerData.xhr[SENTRY_XHR_DATA_KEY];
  
        // We only capture complete, non-sentry requests
        if (!startTimestamp || !endTimestamp || !sentryXhrData) {
          return;
        }
  
        const { method, url, status_code, body } = sentryXhrData;
  
        const data = {
          method,
          url,
          status_code,
        };
  
        const hint = {
          xhr: handlerData.xhr,
          input: body,
          startTimestamp,
          endTimestamp,
        };
  
        addBreadcrumb(
          {
            category: 'xhr',
            data,
            type: 'http',
          },
          hint,
        );
      };
    }
  
    /**
     * Creates breadcrumbs from fetch API calls
     */
    function _getFetchBreadcrumbHandler(client) {
      return function _fetchBreadcrumb(handlerData) {
        if (getClient() !== client) {
          return;
        }
  
        const { startTimestamp, endTimestamp } = handlerData;
  
        // We only capture complete fetch requests
        if (!endTimestamp) {
          return;
        }
  
        if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
          // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
          return;
        }
  
        if (handlerData.error) {
          const data = handlerData.fetchData;
          const hint = {
            data: handlerData.error,
            input: handlerData.args,
            startTimestamp,
            endTimestamp,
          };
  
          addBreadcrumb(
            {
              category: 'fetch',
              data,
              level: 'error',
              type: 'http',
            },
            hint,
          );
        } else {
          const response = handlerData.response ;
          const data = {
            ...handlerData.fetchData,
            status_code: response && response.status,
          };
          const hint = {
            input: handlerData.args,
            response,
            startTimestamp,
            endTimestamp,
          };
          addBreadcrumb(
            {
              category: 'fetch',
              data,
              type: 'http',
            },
            hint,
          );
        }
      };
    }
  
    /**
     * Creates breadcrumbs from history API calls
     */
    function _getHistoryBreadcrumbHandler(client) {
      return function _historyBreadcrumb(handlerData) {
        if (getClient() !== client) {
          return;
        }
  
        let from = handlerData.from;
        let to = handlerData.to;
        const parsedLoc = parseUrl(WINDOW.location.href);
        let parsedFrom = from ? parseUrl(from) : undefined;
        const parsedTo = parseUrl(to);
  
        // Initial pushState doesn't provide `from` information
        if (!parsedFrom || !parsedFrom.path) {
          parsedFrom = parsedLoc;
        }
  
        // Use only the path component of the URL if the URL matches the current
        // document (almost all the time when using pushState)
        if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
          to = parsedTo.relative;
        }
        if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
          from = parsedFrom.relative;
        }
  
        addBreadcrumb({
          category: 'navigation',
          data: {
            from,
            to,
          },
        });
      };
    }
  
    function _isEvent(event) {
      return !!event && !!(event ).target;
    }
  
    const INTEGRATION_NAME$4 = 'Dedupe';
  
    const _dedupeIntegration = (() => {
      let previousEvent;
  
      return {
        name: INTEGRATION_NAME$4,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        processEvent(currentEvent) {
          // We want to ignore any non-error type events, e.g. transactions or replays
          // These should never be deduped, and also not be compared against as _previousEvent.
          if (currentEvent.type) {
            return currentEvent;
          }
  
          // Juuust in case something goes wrong
          try {
            if (_shouldDropEvent(currentEvent, previousEvent)) {
              logger.warn('Event dropped due to being a duplicate of previously captured event.');
              return null;
            }
          } catch (_oO) {} // eslint-disable-line no-empty
  
          return (previousEvent = currentEvent);
        },
      };
    }) ;
  
    const dedupeIntegration = defineIntegration(_dedupeIntegration);
  
    /**
     * Deduplication filter.
     * @deprecated Use `dedupeIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const Dedupe = convertIntegrationFnToClass(INTEGRATION_NAME$4, dedupeIntegration)
  
  ;
  
    function _shouldDropEvent(currentEvent, previousEvent) {
      if (!previousEvent) {
        return false;
      }
  
      if (_isSameMessageEvent(currentEvent, previousEvent)) {
        return true;
      }
  
      if (_isSameExceptionEvent(currentEvent, previousEvent)) {
        return true;
      }
  
      return false;
    }
  
    function _isSameMessageEvent(currentEvent, previousEvent) {
      const currentMessage = currentEvent.message;
      const previousMessage = previousEvent.message;
  
      // If neither event has a message property, they were both exceptions, so bail out
      if (!currentMessage && !previousMessage) {
        return false;
      }
  
      // If only one event has a stacktrace, but not the other one, they are not the same
      if ((currentMessage && !previousMessage) || (!currentMessage && previousMessage)) {
        return false;
      }
  
      if (currentMessage !== previousMessage) {
        return false;
      }
  
      if (!_isSameFingerprint(currentEvent, previousEvent)) {
        return false;
      }
  
      if (!_isSameStacktrace(currentEvent, previousEvent)) {
        return false;
      }
  
      return true;
    }
  
    function _isSameExceptionEvent(currentEvent, previousEvent) {
      const previousException = _getExceptionFromEvent(previousEvent);
      const currentException = _getExceptionFromEvent(currentEvent);
  
      if (!previousException || !currentException) {
        return false;
      }
  
      if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
        return false;
      }
  
      if (!_isSameFingerprint(currentEvent, previousEvent)) {
        return false;
      }
  
      if (!_isSameStacktrace(currentEvent, previousEvent)) {
        return false;
      }
  
      return true;
    }
  
    function _isSameStacktrace(currentEvent, previousEvent) {
      let currentFrames = _getFramesFromEvent(currentEvent);
      let previousFrames = _getFramesFromEvent(previousEvent);
  
      // If neither event has a stacktrace, they are assumed to be the same
      if (!currentFrames && !previousFrames) {
        return true;
      }
  
      // If only one event has a stacktrace, but not the other one, they are not the same
      if ((currentFrames && !previousFrames) || (!currentFrames && previousFrames)) {
        return false;
      }
  
      currentFrames = currentFrames ;
      previousFrames = previousFrames ;
  
      // If number of frames differ, they are not the same
      if (previousFrames.length !== currentFrames.length) {
        return false;
      }
  
      // Otherwise, compare the two
      for (let i = 0; i < previousFrames.length; i++) {
        const frameA = previousFrames[i];
        const frameB = currentFrames[i];
  
        if (
          frameA.filename !== frameB.filename ||
          frameA.lineno !== frameB.lineno ||
          frameA.colno !== frameB.colno ||
          frameA.function !== frameB.function
        ) {
          return false;
        }
      }
  
      return true;
    }
  
    function _isSameFingerprint(currentEvent, previousEvent) {
      let currentFingerprint = currentEvent.fingerprint;
      let previousFingerprint = previousEvent.fingerprint;
  
      // If neither event has a fingerprint, they are assumed to be the same
      if (!currentFingerprint && !previousFingerprint) {
        return true;
      }
  
      // If only one event has a fingerprint, but not the other one, they are not the same
      if ((currentFingerprint && !previousFingerprint) || (!currentFingerprint && previousFingerprint)) {
        return false;
      }
  
      currentFingerprint = currentFingerprint ;
      previousFingerprint = previousFingerprint ;
  
      // Otherwise, compare the two
      try {
        return !!(currentFingerprint.join('') === previousFingerprint.join(''));
      } catch (_oO) {
        return false;
      }
    }
  
    function _getExceptionFromEvent(event) {
      return event.exception && event.exception.values && event.exception.values[0];
    }
  
    function _getFramesFromEvent(event) {
      const exception = event.exception;
  
      if (exception) {
        try {
          // @ts-expect-error Object could be undefined
          return exception.values[0].stacktrace.frames;
        } catch (_oO) {
          return undefined;
        }
      }
      return undefined;
    }
  
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  
    const INTEGRATION_NAME$3 = 'GlobalHandlers';
  
    const _globalHandlersIntegration = ((options = {}) => {
      const _options = {
        onerror: true,
        onunhandledrejection: true,
        ...options,
      };
  
      return {
        name: INTEGRATION_NAME$3,
        setupOnce() {
          Error.stackTraceLimit = 50;
        },
        setup(client) {
          if (_options.onerror) {
            _installGlobalOnErrorHandler(client);
            globalHandlerLog('onerror');
          }
          if (_options.onunhandledrejection) {
            _installGlobalOnUnhandledRejectionHandler(client);
            globalHandlerLog('onunhandledrejection');
          }
        },
      };
    }) ;
  
    const globalHandlersIntegration = defineIntegration(_globalHandlersIntegration);
  
    /**
     * Global handlers.
     * @deprecated Use `globalHandlersIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const GlobalHandlers = convertIntegrationFnToClass(
      INTEGRATION_NAME$3,
      globalHandlersIntegration,
    )
  
  ;
  
    function _installGlobalOnErrorHandler(client) {
      addGlobalErrorInstrumentationHandler(data => {
        const { stackParser, attachStacktrace } = getOptions();
  
        if (getClient() !== client || shouldIgnoreOnError()) {
          return;
        }
  
        const { msg, url, line, column, error } = data;
  
        const event =
          error === undefined && isString(msg)
            ? _eventFromIncompleteOnError(msg, url, line, column)
            : _enhanceEventWithInitialFrame(
                eventFromUnknownInput(stackParser, error || msg, undefined, attachStacktrace, false),
                url,
                line,
                column,
              );
  
        event.level = 'error';
  
        captureEvent(event, {
          originalException: error,
          mechanism: {
            handled: false,
            type: 'onerror',
          },
        });
      });
    }
  
    function _installGlobalOnUnhandledRejectionHandler(client) {
      addGlobalUnhandledRejectionInstrumentationHandler(e => {
        const { stackParser, attachStacktrace } = getOptions();
  
        if (getClient() !== client || shouldIgnoreOnError()) {
          return;
        }
  
        const error = _getUnhandledRejectionError(e );
  
        const event = isPrimitive(error)
          ? _eventFromRejectionWithPrimitive(error)
          : eventFromUnknownInput(stackParser, error, undefined, attachStacktrace, true);
  
        event.level = 'error';
  
        captureEvent(event, {
          originalException: error,
          mechanism: {
            handled: false,
            type: 'onunhandledrejection',
          },
        });
      });
    }
  
    function _getUnhandledRejectionError(error) {
      if (isPrimitive(error)) {
        return error;
      }
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = error ;
  
      // dig the object of the rejection out of known event types
      try {
        // PromiseRejectionEvents store the object of the rejection under 'reason'
        // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
        if ('reason' in e) {
          return e.reason;
        }
  
        // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
        // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
        // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
        // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
        // https://github.com/getsentry/sentry-javascript/issues/2380
        else if ('detail' in e && 'reason' in e.detail) {
          return e.detail.reason;
        }
      } catch (e2) {} // eslint-disable-line no-empty
  
      return error;
    }
  
    /**
     * Create an event from a promise rejection where the `reason` is a primitive.
     *
     * @param reason: The `reason` property of the promise rejection
     * @returns An Event object with an appropriate `exception` value
     */
    function _eventFromRejectionWithPrimitive(reason) {
      return {
        exception: {
          values: [
            {
              type: 'UnhandledRejection',
              // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
              value: `Non-Error promise rejection captured with value: ${String(reason)}`,
            },
          ],
        },
      };
    }
  
    /**
     * This function creates a stack from an old, error-less onerror handler.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _eventFromIncompleteOnError(msg, url, line, column) {
      const ERROR_TYPES_RE =
        /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
  
      // If 'message' is ErrorEvent, get real message from inside
      let message = isErrorEvent$1(msg) ? msg.message : msg;
      let name = 'Error';
  
      const groups = message.match(ERROR_TYPES_RE);
      if (groups) {
        name = groups[1];
        message = groups[2];
      }
  
      const event = {
        exception: {
          values: [
            {
              type: name,
              value: message,
            },
          ],
        },
      };
  
      return _enhanceEventWithInitialFrame(event, url, line, column);
    }
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _enhanceEventWithInitialFrame(event, url, line, column) {
      // event.exception
      const e = (event.exception = event.exception || {});
      // event.exception.values
      const ev = (e.values = e.values || []);
      // event.exception.values[0]
      const ev0 = (ev[0] = ev[0] || {});
      // event.exception.values[0].stacktrace
      const ev0s = (ev0.stacktrace = ev0.stacktrace || {});
      // event.exception.values[0].stacktrace.frames
      const ev0sf = (ev0s.frames = ev0s.frames || []);
  
      const colno = isNaN(parseInt(column, 10)) ? undefined : column;
      const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
      const filename = isString(url) && url.length > 0 ? url : getLocationHref();
  
      // event.exception.values[0].stacktrace.frames
      if (ev0sf.length === 0) {
        ev0sf.push({
          colno,
          filename,
          function: '?',
          in_app: true,
          lineno,
        });
      }
  
      return event;
    }
  
    function globalHandlerLog(type) {
      logger.log(`Global Handler attached: ${type}`);
    }
  
    function getOptions() {
      const client = getClient();
      const options = (client && client.getOptions()) || {
        stackParser: () => [],
        attachStacktrace: false,
      };
      return options;
    }
  
    const INTEGRATION_NAME$2 = 'HttpContext';
  
    const _httpContextIntegration = (() => {
      return {
        name: INTEGRATION_NAME$2,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        preprocessEvent(event) {
          // if none of the information we want exists, don't bother
          if (!WINDOW.navigator && !WINDOW.location && !WINDOW.document) {
            return;
          }
  
          // grab as much info as exists and add it to the event
          const url = (event.request && event.request.url) || (WINDOW.location && WINDOW.location.href);
          const { referrer } = WINDOW.document || {};
          const { userAgent } = WINDOW.navigator || {};
  
          const headers = {
            ...(event.request && event.request.headers),
            ...(referrer && { Referer: referrer }),
            ...(userAgent && { 'User-Agent': userAgent }),
          };
          const request = { ...event.request, ...(url && { url }), headers };
  
          event.request = request;
        },
      };
    }) ;
  
    const httpContextIntegration = defineIntegration(_httpContextIntegration);
  
    /**
     * HttpContext integration collects information about HTTP request headers.
     * @deprecated Use `httpContextIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const HttpContext = convertIntegrationFnToClass(INTEGRATION_NAME$2, httpContextIntegration)
  
  ;
  
    const DEFAULT_KEY = 'cause';
    const DEFAULT_LIMIT = 5;
  
    const INTEGRATION_NAME$1 = 'LinkedErrors';
  
    const _linkedErrorsIntegration = ((options = {}) => {
      const limit = options.limit || DEFAULT_LIMIT;
      const key = options.key || DEFAULT_KEY;
  
      return {
        name: INTEGRATION_NAME$1,
        // TODO v8: Remove this
        setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
        preprocessEvent(event, hint, client) {
          const options = client.getOptions();
  
          applyAggregateErrorsToEvent(
            // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
            exceptionFromError,
            options.stackParser,
            options.maxValueLength,
            key,
            limit,
            event,
            hint,
          );
        },
      };
    }) ;
  
    const linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
  
    /**
     * Aggregrate linked errors in an event.
     * @deprecated Use `linkedErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const LinkedErrors = convertIntegrationFnToClass(INTEGRATION_NAME$1, linkedErrorsIntegration)
  
  ;
  
    const DEFAULT_EVENT_TARGET = [
      'EventTarget',
      'Window',
      'Node',
      'ApplicationCache',
      'AudioTrackList',
      'BroadcastChannel',
      'ChannelMergerNode',
      'CryptoOperation',
      'EventSource',
      'FileReader',
      'HTMLUnknownElement',
      'IDBDatabase',
      'IDBRequest',
      'IDBTransaction',
      'KeyOperation',
      'MediaController',
      'MessagePort',
      'ModalWindow',
      'Notification',
      'SVGElementInstance',
      'Screen',
      'SharedWorker',
      'TextTrack',
      'TextTrackCue',
      'TextTrackList',
      'WebSocket',
      'WebSocketWorker',
      'Worker',
      'XMLHttpRequest',
      'XMLHttpRequestEventTarget',
      'XMLHttpRequestUpload',
    ];
  
    const INTEGRATION_NAME = 'TryCatch';
  
    const _browserApiErrorsIntegration = ((options = {}) => {
      const _options = {
        XMLHttpRequest: true,
        eventTarget: true,
        requestAnimationFrame: true,
        setInterval: true,
        setTimeout: true,
        ...options,
      };
  
      return {
        name: INTEGRATION_NAME,
        // TODO: This currently only works for the first client this is setup
        // We may want to adjust this to check for client etc.
        setupOnce() {
          if (_options.setTimeout) {
            fill(WINDOW, 'setTimeout', _wrapTimeFunction);
          }
  
          if (_options.setInterval) {
            fill(WINDOW, 'setInterval', _wrapTimeFunction);
          }
  
          if (_options.requestAnimationFrame) {
            fill(WINDOW, 'requestAnimationFrame', _wrapRAF);
          }
  
          if (_options.XMLHttpRequest && 'XMLHttpRequest' in WINDOW) {
            fill(XMLHttpRequest.prototype, 'send', _wrapXHR);
          }
  
          const eventTargetOption = _options.eventTarget;
          if (eventTargetOption) {
            const eventTarget = Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET;
            eventTarget.forEach(_wrapEventTarget);
          }
        },
      };
    }) ;
  
    const browserApiErrorsIntegration = defineIntegration(_browserApiErrorsIntegration);
  
    /**
     * Wrap timer functions and event targets to catch errors and provide better meta data.
     * @deprecated Use `browserApiErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    const TryCatch = convertIntegrationFnToClass(
      INTEGRATION_NAME,
      browserApiErrorsIntegration,
    )
  
  ;
  
    function _wrapTimeFunction(original) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function ( ...args) {
        const originalCallback = args[0];
        args[0] = wrap$1(originalCallback, {
          mechanism: {
            data: { function: getFunctionName(original) },
            handled: false,
            type: 'instrument',
          },
        });
        return original.apply(this, args);
      };
    }
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _wrapRAF(original) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function ( callback) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return original.apply(this, [
          wrap$1(callback, {
            mechanism: {
              data: {
                function: 'requestAnimationFrame',
                handler: getFunctionName(original),
              },
              handled: false,
              type: 'instrument',
            },
          }),
        ]);
      };
    }
  
    function _wrapXHR(originalSend) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function ( ...args) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const xhr = this;
        const xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
  
        xmlHttpRequestProps.forEach(prop => {
          if (prop in xhr && typeof xhr[prop] === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fill(xhr, prop, function (original) {
              const wrapOptions = {
                mechanism: {
                  data: {
                    function: prop,
                    handler: getFunctionName(original),
                  },
                  handled: false,
                  type: 'instrument',
                },
              };
  
              // If Instrument integration has been called before TryCatch, get the name of original function
              const originalFunction = getOriginalFunction(original);
              if (originalFunction) {
                wrapOptions.mechanism.data.handler = getFunctionName(originalFunction);
              }
  
              // Otherwise wrap directly
              return wrap$1(original, wrapOptions);
            });
          }
        });
  
        return originalSend.apply(this, args);
      };
    }
  
    function _wrapEventTarget(target) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalObject = WINDOW ;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const proto = globalObject[target] && globalObject[target].prototype;
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
      if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
        return;
      }
  
      fill(proto, 'addEventListener', function (original,)
  
     {
        return function (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
  
          eventName,
          fn,
          options,
        ) {
          try {
            if (typeof fn.handleEvent === 'function') {
              // ESlint disable explanation:
              //  First, it is generally safe to call `wrap` with an unbound function. Furthermore, using `.bind()` would
              //  introduce a bug here, because bind returns a new function that doesn't have our
              //  flags(like __sentry_original__) attached. `wrap` checks for those flags to avoid unnecessary wrapping.
              //  Without those flags, every call to addEventListener wraps the function again, causing a memory leak.
              // eslint-disable-next-line @typescript-eslint/unbound-method
              fn.handleEvent = wrap$1(fn.handleEvent, {
                mechanism: {
                  data: {
                    function: 'handleEvent',
                    handler: getFunctionName(fn),
                    target,
                  },
                  handled: false,
                  type: 'instrument',
                },
              });
            }
          } catch (err) {
            // can sometimes get 'Permission denied to access property "handle Event'
          }
  
          return original.apply(this, [
            eventName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wrap$1(fn , {
              mechanism: {
                data: {
                  function: 'addEventListener',
                  handler: getFunctionName(fn),
                  target,
                },
                handled: false,
                type: 'instrument',
              },
            }),
            options,
          ]);
        };
      });
  
      fill(
        proto,
        'removeEventListener',
        function (
          originalRemoveEventListener,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) {
          return function (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
  
            eventName,
            fn,
            options,
          ) {
            /**
             * There are 2 possible scenarios here:
             *
             * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
             * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
             * as a pass-through, and call original `removeEventListener` with it.
             *
             * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
             * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
             * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
             * in order for us to make a distinction between wrapped/non-wrapped functions possible.
             * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
             *
             * When someone adds a handler prior to initialization, and then do it again, but after,
             * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
             * to get rid of the initial handler and it'd stick there forever.
             */
            const wrappedEventHandler = fn ;
            try {
              const originalEventHandler = wrappedEventHandler && wrappedEventHandler.__sentry_wrapped__;
              if (originalEventHandler) {
                originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
              }
            } catch (e) {
              // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
            }
            return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
          };
        },
      );
    }
  
    /** @deprecated Use `getDefaultIntegrations(options)` instead. */
    const defaultIntegrations = [
      inboundFiltersIntegration(),
      functionToStringIntegration(),
      browserApiErrorsIntegration(),
      breadcrumbsIntegration(),
      globalHandlersIntegration(),
      linkedErrorsIntegration(),
      dedupeIntegration(),
      httpContextIntegration(),
    ];
  
    /** Get the default integrations for the browser SDK. */
    function getDefaultIntegrations(_options) {
      // We return a copy of the defaultIntegrations here to avoid mutating this
      return [
        // eslint-disable-next-line deprecation/deprecation
        ...defaultIntegrations,
      ];
    }
  
    /**
     * A magic string that build tooling can leverage in order to inject a release value into the SDK.
     */
  
    /**
     * The Sentry Browser SDK Client.
     *
     * To use this SDK, call the {@link init} function as early as possible when
     * loading the web page. To set context information or send manual events, use
     * the provided methods.
     *
     * @example
     *
     * ```
     *
     * import { init } from '@sentry/browser';
     *
     * init({
     *   dsn: '__DSN__',
     *   // ...
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { configureScope } from '@sentry/browser';
     * configureScope((scope: Scope) => {
     *   scope.setExtra({ battery: 0.7 });
     *   scope.setTag({ user_mode: 'admin' });
     *   scope.setUser({ id: '4711' });
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { addBreadcrumb } from '@sentry/browser';
     * addBreadcrumb({
     *   message: 'My Breadcrumb',
     *   // ...
     * });
     * ```
     *
     * @example
     *
     * ```
     *
     * import * as Sentry from '@sentry/browser';
     * Sentry.captureMessage('Hello, world!');
     * Sentry.captureException(new Error('Good bye'));
     * Sentry.captureEvent({
     *   message: 'Manual',
     *   stacktrace: [
     *     // ...
     *   ],
     * });
     * ```
     *
     * @see {@link BrowserOptions} for documentation on configuration options.
     */
    function init(options = {}) {
        
      if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = getDefaultIntegrations();
      }
      if (options.release === undefined) {
        // This allows build tooling to find-and-replace __SENTRY_RELEASE__ to inject a release value
        if (typeof __SENTRY_RELEASE__ === 'string') {
          options.release = __SENTRY_RELEASE__;
        }
  
        // This supports the variable that sentry-webpack-plugin injects
        if (WINDOW.SENTRY_RELEASE && WINDOW.SENTRY_RELEASE.id) {
          options.release = WINDOW.SENTRY_RELEASE.id;
        }
      }
      if (options.autoSessionTracking === undefined) {
        options.autoSessionTracking = true;
      }
      if (options.sendClientReports === undefined) {
        options.sendClientReports = true;
      }
  
      const clientOptions = {
        ...options,
        stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
        integrations: getIntegrationsToSetup(options),
        transport: options.transport || (supportsFetch() ? makeFetchTransport : makeXHRTransport),
      };
  
      initAndBind(BrowserClient, clientOptions);
  
      if (options.autoSessionTracking) {
        startSessionTracking();
      }
    }
  
    const showReportDialog = (
      // eslint-disable-next-line deprecation/deprecation
      options = {},
      // eslint-disable-next-line deprecation/deprecation
      hub = getCurrentHub(),
    ) => {
      // doesn't work without a document (React Native)
      if (!WINDOW.document) {
        DEBUG_BUILD && logger.error('Global document not defined in showReportDialog call');
        return;
      }
  
      // eslint-disable-next-line deprecation/deprecation
      const { client, scope } = hub.getStackTop();
      const dsn = options.dsn || (client && client.getDsn());
      if (!dsn) {
        DEBUG_BUILD && logger.error('DSN not configured for showReportDialog call');
        return;
      }
  
      if (scope) {
        options.user = {
          ...scope.getUser(),
          ...options.user,
        };
      }
  
      // TODO(v8): Remove this entire if statement. `eventId` will be a required option.
      // eslint-disable-next-line deprecation/deprecation
      if (!options.eventId) {
        // eslint-disable-next-line deprecation/deprecation
        options.eventId = hub.lastEventId();
      }
  
      const script = WINDOW.document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = getReportDialogEndpoint(dsn, options);
  
      if (options.onLoad) {
        script.onload = options.onLoad;
      }
  
      const { onClose } = options;
      if (onClose) {
        const reportDialogClosedMessageHandler = (event) => {
          if (event.data === '__sentry_reportdialog_closed__') {
            try {
              onClose();
            } finally {
              WINDOW.removeEventListener('message', reportDialogClosedMessageHandler);
            }
          }
        };
        WINDOW.addEventListener('message', reportDialogClosedMessageHandler);
      }
  
      const injectionPoint = WINDOW.document.head || WINDOW.document.body;
      if (injectionPoint) {
        injectionPoint.appendChild(script);
      } else {
        DEBUG_BUILD && logger.error('Not injecting report dialog. No injection point found in HTML');
      }
    };
  
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function forceLoad() {
      // Noop
    }
  
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function onLoad(callback) {
      callback();
    }
  
    /**
     * Wrap code within a try/catch block so the SDK is able to capture errors.
     *
     * @deprecated This function will be removed in v8.
     * It is not part of Sentry's official API and it's easily replaceable by using a try/catch block
     * and calling Sentry.captureException.
     *
     * @param fn A function to wrap.
     *
     * @returns The result of wrapped function call.
     */
    // TODO(v8): Remove this function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function wrap(fn) {
      return wrap$1(fn)();
    }
  
    /**
     * Enable automatic Session Tracking for the initial page load.
     */
    function startSessionTracking() {
      if (typeof WINDOW.document === 'undefined') {
        DEBUG_BUILD && logger.warn('Session tracking in non-browser environment with @sentry/browser is not supported.');
        return;
      }
  
      // The session duration for browser sessions does not track a meaningful
      // concept that can be used as a metric.
      // Automatically captured sessions are akin to page views, and thus we
      // discard their duration.
      startSession({ ignoreDuration: true });
      console.log('captureSession44:::')
      captureSession();
  
      // We want to create a session for every navigation as well
      addHistoryInstrumentationHandler(({ from, to }) => {
        // Don't create an additional session for the initial route or if the location did not change
        if (from !== undefined && from !== to) {
          startSession({ ignoreDuration: true });
          console.log('captureSession55:::')
          captureSession();
        }
      });
    }
  
    /**
     * Captures user feedback and sends it to Sentry.
     */
    function captureUserFeedback(feedback) {
      const client = getClient();
      if (client) {
        client.captureUserFeedback(feedback);
      }
    }
  
    /* eslint-disable deprecation/deprecation */
  
    var BrowserIntegrations = /*#__PURE__*/Object.freeze({
      __proto__: null,
      GlobalHandlers: GlobalHandlers,
      TryCatch: TryCatch,
      Breadcrumbs: Breadcrumbs,
      LinkedErrors: LinkedErrors,
      HttpContext: HttpContext,
      Dedupe: Dedupe
    });
  
    let windowIntegrations = {};
  
    // This block is needed to add compatibility with the integrations packages when used with a CDN
    if (WINDOW.Sentry && WINDOW.Sentry.Integrations) {
      windowIntegrations = WINDOW.Sentry.Integrations;
    }
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const INTEGRATIONS = {
      ...windowIntegrations,
      // eslint-disable-next-line deprecation/deprecation
      ...Integrations,
      ...BrowserIntegrations,
    };
  
    // This is exported so the loader does not fail when switching off Replay
  
    // TODO (v8): Remove this as it was only needed for backwards compatibility
    // We want replay to be available under Sentry.Replay, to be consistent
    // with the NPM package version.
    // eslint-disable-next-line deprecation/deprecation
    INTEGRATIONS.Replay = ReplayShim;
  
    // eslint-disable-next-line deprecation/deprecation
    INTEGRATIONS.BrowserTracing = BrowserTracing;
  
    // We are patching the global object with our hub extension methods
    addExtensionMethods();
  
    exports.Breadcrumbs = Breadcrumbs;
    exports.BrowserClient = BrowserClient;
    exports.BrowserTracing = BrowserTracing;
    exports.Dedupe = Dedupe;
    exports.Feedback = FeedbackShim;
    exports.FunctionToString = FunctionToString;
    exports.GlobalHandlers = GlobalHandlers;
    exports.HttpContext = HttpContext;
    exports.Hub = Hub;
    exports.InboundFilters = InboundFilters;
    exports.Integrations = INTEGRATIONS;
    exports.LinkedErrors = LinkedErrors;
    exports.Replay = ReplayShim;
    exports.SDK_VERSION = SDK_VERSION;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = SEMANTIC_ATTRIBUTE_SENTRY_OP;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
    exports.Scope = Scope;
    exports.Span = Span;
    exports.TryCatch = TryCatch;
    exports.WINDOW = WINDOW;
    exports.addBreadcrumb = addBreadcrumb;
    exports.addEventProcessor = addEventProcessor;
    exports.addExtensionMethods = addExtensionMethods;
    exports.addGlobalEventProcessor = addGlobalEventProcessor;
    exports.addIntegration = addIntegration;
    exports.breadcrumbsIntegration = breadcrumbsIntegration;
    exports.browserApiErrorsIntegration = browserApiErrorsIntegration;
    exports.browserTracingIntegration = bundleBrowserTracingIntegration;
    exports.captureEvent = captureEvent;
    exports.captureException = captureException;
    exports.captureMessage = captureMessage;
    exports.captureUserFeedback = captureUserFeedback;
    exports.chromeStackLineParser = chromeStackLineParser;
    exports.close = close;
    exports.configureScope = configureScope;
    exports.continueTrace = continueTrace;
    exports.createTransport = createTransport;
    exports.createUserFeedbackEnvelope = createUserFeedbackEnvelope;
    exports.dedupeIntegration = dedupeIntegration;
    exports.defaultIntegrations = defaultIntegrations;
    exports.defaultStackLineParsers = defaultStackLineParsers;
    exports.defaultStackParser = defaultStackParser;
    exports.eventFromException = eventFromException;
    exports.eventFromMessage = eventFromMessage;
    exports.exceptionFromError = exceptionFromError;
    exports.feedbackIntegration = feedbackIntegration;
    exports.flush = flush;
    exports.forceLoad = forceLoad;
    exports.functionToStringIntegration = functionToStringIntegration;
    exports.geckoStackLineParser = geckoStackLineParser;
    exports.getActiveSpan = getActiveSpan;
    exports.getClient = getClient;
    exports.getCurrentHub = getCurrentHub;
    exports.getCurrentScope = getCurrentScope;
    exports.getDefaultIntegrations = getDefaultIntegrations;
    exports.getHubFromCarrier = getHubFromCarrier;
    exports.globalHandlersIntegration = globalHandlersIntegration;
    exports.httpContextIntegration = httpContextIntegration;
    exports.inboundFiltersIntegration = inboundFiltersIntegration;
    exports.init = init;
    exports.isInitialized = isInitialized;
    exports.lastEventId = lastEventId;
    exports.linkedErrorsIntegration = linkedErrorsIntegration;
    exports.makeFetchTransport = makeFetchTransport;
    exports.makeMain = makeMain;
    exports.makeXHRTransport = makeXHRTransport;
    exports.metrics = metrics;
    exports.onLoad = onLoad;
    exports.opera10StackLineParser = opera10StackLineParser;
    exports.opera11StackLineParser = opera11StackLineParser;
    exports.parameterize = parameterize;
    exports.replayIntegration = replayIntegration;
    exports.setContext = setContext;
    exports.setCurrentClient = setCurrentClient;
    exports.setExtra = setExtra;
    exports.setExtras = setExtras;
    exports.setTag = setTag;
    exports.setTags = setTags;
    exports.setUser = setUser;
    exports.showReportDialog = showReportDialog;
    exports.startInactiveSpan = startInactiveSpan;
    exports.startSpan = startSpan;
    exports.startSpanManual = startSpanManual;
    exports.startTransaction = startTransaction;
    exports.winjsStackLineParser = winjsStackLineParser;
    exports.withIsolationScope = withIsolationScope;
    exports.withScope = withScope;
    exports.wrap = wrap;
  
    return exports;
  
  })({});
  //# sourceMappingURL=bundle.tracing.js.map