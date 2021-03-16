/*! Tweakpane 2.0.1 (c) 2016 cocopon, licensed under the MIT license. */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Tweakpane = factory());
}(this, (function () { 'use strict';

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var Plugins = {
        inputs: [],
        monitors: [],
    };
    function getAllPlugins() {
        return __spreadArrays(Plugins.inputs, Plugins.monitors);
    }

    var PREFIX = 'tp';
    /**
     * A utility function for generating BEM-like class name.
     * @param viewName The name of the view. Used as part of the block name.
     * @return A class name generator function.
     */
    function ClassName(viewName) {
        /**
         * Generates a class name.
         * @param [opt_elementName] The name of the element.
         * @param [opt_modifier] The name of the modifier.
         * @return A class name.
         */
        var fn = function (opt_elementName, opt_modifier) {
            return [
                PREFIX,
                '-',
                viewName,
                'v',
                opt_elementName ? "_" + opt_elementName : '',
                opt_modifier ? "-" + opt_modifier : '',
            ].join('');
        };
        return fn;
    }

    var className$m = ClassName('lbl');
    function createLabelNode(doc, label) {
        var frag = doc.createDocumentFragment();
        var lineNodes = label.split('\n').map(function (line) {
            return doc.createTextNode(line);
        });
        lineNodes.forEach(function (lineNode, index) {
            if (index > 0) {
                frag.appendChild(doc.createElement('br'));
            }
            frag.appendChild(lineNode);
        });
        return frag;
    }
    /**
     * @hidden
     */
    var LabeledView = /** @class */ (function () {
        function LabeledView(doc, config) {
            this.label = config.label;
            this.elem_ = doc.createElement('div');
            this.elem_.classList.add(className$m());
            var labelElem = doc.createElement('div');
            labelElem.classList.add(className$m('l'));
            labelElem.appendChild(createLabelNode(doc, this.label));
            this.elem_.appendChild(labelElem);
            var viewElem = doc.createElement('div');
            viewElem.classList.add(className$m('v'));
            viewElem.appendChild(config.view.element);
            this.elem_.appendChild(viewElem);
        }
        Object.defineProperty(LabeledView.prototype, "element", {
            get: function () {
                return this.elem_;
            },
            enumerable: false,
            configurable: true
        });
        return LabeledView;
    }());

    function disposeElement(elem) {
        if (elem && elem.parentElement) {
            elem.parentElement.removeChild(elem);
        }
        return null;
    }

    function getAllBladePositions() {
        return ['first', 'last'];
    }

    var className$l = ClassName('');
    function setUpBladeView(view, model) {
        var elem = view.element;
        model.emitter.on('change', function (ev) {
            if (ev.propertyName === 'hidden') {
                var hiddenClass = className$l(undefined, 'hidden');
                if (model.hidden) {
                    elem.classList.add(hiddenClass);
                }
                else {
                    elem.classList.remove(hiddenClass);
                }
            }
            else if (ev.propertyName === 'positions') {
                getAllBladePositions().forEach(function (pos) {
                    elem.classList.remove(className$l(undefined, pos));
                });
                model.positions.forEach(function (pos) {
                    elem.classList.add(className$l(undefined, pos));
                });
            }
        });
        model.emitter.on('dispose', function () {
            if (view.onDispose) {
                view.onDispose();
            }
            disposeElement(elem);
        });
    }

    /**
     * @hidden
     */
    var InputBindingController = /** @class */ (function () {
        function InputBindingController(doc, config) {
            this.binding = config.binding;
            this.controller = config.controller;
            this.view = new LabeledView(doc, {
                label: config.label,
                view: this.controller.view,
            });
            this.blade = config.blade;
            setUpBladeView(this.view, this.blade);
        }
        return InputBindingController;
    }());

    /**
     * @hidden
     */
    var MonitorBindingController = /** @class */ (function () {
        function MonitorBindingController(doc, config) {
            var _this = this;
            this.binding = config.binding;
            this.controller = config.controller;
            this.view = new LabeledView(doc, {
                label: config.label,
                view: this.controller.view,
            });
            this.blade = config.blade;
            this.blade.emitter.on('dispose', function () {
                _this.binding.dispose();
            });
            setUpBladeView(this.view, this.blade);
        }
        return MonitorBindingController;
    }());

    function forceCast(v) {
        return v;
    }
    function isEmpty(value) {
        return value === null || value === undefined;
    }
    function deepEqualsArray(a1, a2) {
        if (a1.length !== a2.length) {
            return false;
        }
        for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * A type-safe event emitter.
     * @template E The interface that maps event names and event objects.
     */
    var Emitter = /** @class */ (function () {
        function Emitter() {
            this.observers_ = {};
        }
        /**
         * Adds an event listener to the emitter.
         * @param eventName The event name to listen.
         * @param handler The event handler.
         */
        Emitter.prototype.on = function (eventName, handler) {
            var observers = this.observers_[eventName];
            if (!observers) {
                observers = this.observers_[eventName] = [];
            }
            observers.push({
                handler: handler,
            });
            return this;
        };
        /**
         * Removes an event listener from the emitter.
         * @param eventName The event name.
         * @param handler The event handler to remove.
         */
        Emitter.prototype.off = function (eventName, handler) {
            var observers = this.observers_[eventName];
            if (observers) {
                this.observers_[eventName] = observers.filter(function (observer) {
                    return observer.handler !== handler;
                });
            }
            return this;
        };
        Emitter.prototype.emit = function (eventName, event) {
            var observers = this.observers_[eventName];
            if (!observers) {
                return;
            }
            observers.forEach(function (observer) {
                observer.handler(event);
            });
        };
        return Emitter;
    }());

    /**
     * @hidden
     */
    var Button = /** @class */ (function () {
        function Button(title) {
            this.emitter = new Emitter();
            this.title = title;
        }
        Button.prototype.click = function () {
            this.emitter.emit('click', {
                sender: this,
            });
        };
        return Button;
    }());

    var className$k = ClassName('btn');
    /**
     * @hidden
     */
    var ButtonView = /** @class */ (function () {
        function ButtonView(doc, config) {
            this.button = config.button;
            this.element = doc.createElement('div');
            this.element.classList.add(className$k());
            var buttonElem = doc.createElement('button');
            buttonElem.classList.add(className$k('b'));
            buttonElem.textContent = this.button.title;
            this.element.appendChild(buttonElem);
            this.buttonElement = buttonElem;
        }
        return ButtonView;
    }());

    /**
     * @hidden
     */
    var ButtonController = /** @class */ (function () {
        function ButtonController(doc, config) {
            this.onButtonClick_ = this.onButtonClick_.bind(this);
            this.button = new Button(config.title);
            this.blade = config.blade;
            this.view = new ButtonView(doc, {
                button: this.button,
            });
            this.view.buttonElement.addEventListener('click', this.onButtonClick_);
            setUpBladeView(this.view, this.blade);
        }
        ButtonController.prototype.onButtonClick_ = function () {
            this.button.click();
        };
        return ButtonController;
    }());

    /**
     * @hidden
     */
    var Disposable = /** @class */ (function () {
        function Disposable() {
            this.emitter = new Emitter();
            this.disposed_ = false;
        }
        Object.defineProperty(Disposable.prototype, "disposed", {
            get: function () {
                return this.disposed_;
            },
            enumerable: false,
            configurable: true
        });
        Disposable.prototype.dispose = function () {
            if (this.disposed_) {
                return false;
            }
            this.disposed_ = true;
            this.emitter.emit('dispose', {
                sender: this,
            });
            return true;
        };
        return Disposable;
    }());

    var Blade = /** @class */ (function () {
        function Blade() {
            this.onDispose_ = this.onDispose_.bind(this);
            this.emitter = new Emitter();
            this.positions_ = [];
            this.hidden_ = false;
            this.disposable_ = new Disposable();
            this.disposable_.emitter.on('dispose', this.onDispose_);
        }
        Object.defineProperty(Blade.prototype, "hidden", {
            get: function () {
                return this.hidden_;
            },
            set: function (hidden) {
                if (this.hidden_ === hidden) {
                    return;
                }
                this.hidden_ = hidden;
                this.emitter.emit('change', {
                    propertyName: 'hidden',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Blade.prototype, "positions", {
            get: function () {
                return this.positions_;
            },
            set: function (positions) {
                if (deepEqualsArray(positions, this.positions_)) {
                    return;
                }
                this.positions_ = positions;
                this.emitter.emit('change', {
                    propertyName: 'positions',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Blade.prototype, "disposed", {
            get: function () {
                return this.disposable_.disposed;
            },
            enumerable: false,
            configurable: true
        });
        Blade.prototype.dispose = function () {
            this.disposable_.dispose();
        };
        Blade.prototype.onDispose_ = function () {
            this.emitter.emit('dispose', {
                sender: this,
            });
        };
        return Blade;
    }());

    var SVG_NS = 'http://www.w3.org/2000/svg';
    function forceReflow(element) {
        element.offsetHeight;
    }
    function disableTransitionTemporarily(element, callback) {
        var t = element.style.transition;
        element.style.transition = 'none';
        callback();
        element.style.transition = t;
    }
    function supportsTouch(doc) {
        return doc.ontouchstart !== undefined;
    }
    function getGlobalObject() {
        return new Function('return this')();
    }
    function getWindowDocument() {
        var globalObj = forceCast(getGlobalObject());
        return globalObj.document;
    }
    function isBrowser() {
        return 'document' in getGlobalObject();
    }
    function getCanvasContext(canvasElement) {
        // HTMLCanvasElement.prototype.getContext is not defined on testing environment
        return isBrowser() ? canvasElement.getContext('2d') : null;
    }
    var ICON_ID_TO_INNER_HTML_MAP = {
        check: '<path d="M2 8l4 4l8 -8"/>',
        dropdown: '<path d="M5 7h6l-3 3 z"/>',
        p2dpad: '<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>',
    };
    function createSvgIconElement(document, iconId) {
        var elem = document.createElementNS(SVG_NS, 'svg');
        elem.innerHTML = ICON_ID_TO_INNER_HTML_MAP[iconId];
        return elem;
    }
    function insertElementAt(parentElement, element, index) {
        parentElement.insertBefore(element, parentElement.children[index]);
    }
    function findNextTarget(ev) {
        if (ev.relatedTarget) {
            return forceCast(ev.relatedTarget);
        }
        // Workaround for Firefox
        if ('explicitOriginalTarget' in ev) {
            return ev.explicitOriginalTarget;
        }
        // TODO: Workaround for Safari
        // Safari doesn't set next target for some elements
        // (e.g. button, input[type=checkbox], etc.)
        return null;
    }

    function updateAllItemsPositions(bladeRack) {
        var visibleItems = bladeRack.items.filter(function (bc) { return !bc.blade.hidden; });
        var firstVisibleItem = visibleItems[0];
        var lastVisibleItem = visibleItems[visibleItems.length - 1];
        bladeRack.items.forEach(function (bc) {
            var ps = [];
            if (bc === firstVisibleItem) {
                ps.push('first');
            }
            if (bc === lastVisibleItem) {
                ps.push('last');
            }
            bc.blade.positions = ps;
        });
    }
    /**
     * @hidden
     */
    function computeExpandedFolderHeight(folder, containerElement) {
        var height = 0;
        disableTransitionTemporarily(containerElement, function () {
            // Expand folder temporarily
            folder.expandedHeight = null;
            folder.temporaryExpanded = true;
            forceReflow(containerElement);
            // Compute height
            height = containerElement.clientHeight;
            // Restore expanded
            folder.temporaryExpanded = null;
            forceReflow(containerElement);
        });
        return height;
    }

    /**
     * @hidden
     */
    var List = /** @class */ (function () {
        function List() {
            this.emitter = new Emitter();
            this.items_ = [];
        }
        Object.defineProperty(List.prototype, "items", {
            get: function () {
                return this.items_;
            },
            enumerable: false,
            configurable: true
        });
        List.prototype.add = function (item, opt_index) {
            var index = opt_index !== undefined ? opt_index : this.items_.length;
            this.items_.splice(index, 0, item);
            this.emitter.emit('add', {
                index: index,
                item: item,
                sender: this,
            });
        };
        List.prototype.remove = function (item) {
            var index = this.items_.indexOf(item);
            if (index < 0) {
                return;
            }
            this.items_.splice(index, 1);
            this.emitter.emit('remove', {
                sender: this,
            });
        };
        return List;
    }());

    function findInputBindingController(bcs, b) {
        for (var i = 0; i < bcs.length; i++) {
            var bc = bcs[i];
            if (bc instanceof InputBindingController && bc.binding === b) {
                return bc;
            }
        }
        return null;
    }
    function findMonitorBindingController(bcs, b) {
        for (var i = 0; i < bcs.length; i++) {
            var bc = bcs[i];
            if (bc instanceof MonitorBindingController && bc.binding === b) {
                return bc;
            }
        }
        return null;
    }
    function findFolderController(bcs, f) {
        for (var i = 0; i < bcs.length; i++) {
            var bc = bcs[i];
            if (bc instanceof FolderController && bc.folder === f) {
                return bc;
            }
        }
        return null;
    }
    /**
     * @hidden
     */
    var BladeRack = /** @class */ (function () {
        function BladeRack() {
            this.onItemFolderFold_ = this.onItemFolderFold_.bind(this);
            this.onListItemLayout_ = this.onListItemLayout_.bind(this);
            this.onSubitemLayout_ = this.onSubitemLayout_.bind(this);
            this.onSubitemFolderFold_ = this.onSubitemFolderFold_.bind(this);
            this.onSubitemInputChange_ = this.onSubitemInputChange_.bind(this);
            this.onSubitemMonitorUpdate_ = this.onSubitemMonitorUpdate_.bind(this);
            this.onItemInputChange_ = this.onItemInputChange_.bind(this);
            this.onListAdd_ = this.onListAdd_.bind(this);
            this.onListItemDispose_ = this.onListItemDispose_.bind(this);
            this.onListRemove_ = this.onListRemove_.bind(this);
            this.onItemMonitorUpdate_ = this.onItemMonitorUpdate_.bind(this);
            this.bcList_ = new List();
            this.emitter = new Emitter();
            this.bcList_.emitter.on('add', this.onListAdd_);
            this.bcList_.emitter.on('remove', this.onListRemove_);
        }
        Object.defineProperty(BladeRack.prototype, "items", {
            get: function () {
                return this.bcList_.items;
            },
            enumerable: false,
            configurable: true
        });
        BladeRack.prototype.add = function (bc, opt_index) {
            this.bcList_.add(bc, opt_index);
        };
        BladeRack.prototype.find = function (controllerClass) {
            return this.items.reduce(function (results, bc) {
                if (bc instanceof FolderController) {
                    results.push.apply(results, bc.bladeRack.find(controllerClass));
                }
                if (bc instanceof controllerClass) {
                    results.push(bc);
                }
                return results;
            }, []);
        };
        BladeRack.prototype.onListAdd_ = function (ev) {
            var bc = ev.item;
            this.emitter.emit('add', {
                bladeController: bc,
                index: ev.index,
                sender: this,
            });
            bc.blade.emitter.on('dispose', this.onListItemDispose_);
            bc.blade.emitter.on('change', this.onListItemLayout_);
            if (bc instanceof InputBindingController) {
                bc.binding.emitter.on('change', this.onItemInputChange_);
            }
            else if (bc instanceof MonitorBindingController) {
                bc.binding.emitter.on('update', this.onItemMonitorUpdate_);
            }
            else if (bc instanceof FolderController) {
                bc.folder.emitter.on('change', this.onItemFolderFold_);
                var emitter = bc.bladeRack.emitter;
                emitter.on('itemfold', this.onSubitemFolderFold_);
                emitter.on('itemlayout', this.onSubitemLayout_);
                emitter.on('inputchange', this.onSubitemInputChange_);
                emitter.on('monitorupdate', this.onSubitemMonitorUpdate_);
            }
        };
        BladeRack.prototype.onListRemove_ = function (_) {
            this.emitter.emit('remove', {
                sender: this,
            });
        };
        BladeRack.prototype.onListItemLayout_ = function (ev) {
            if (ev.propertyName === 'hidden' || ev.propertyName === 'positions') {
                this.emitter.emit('itemlayout', {
                    sender: this,
                });
            }
        };
        BladeRack.prototype.onListItemDispose_ = function (_) {
            var _this = this;
            var disposedUcs = this.bcList_.items.filter(function (bc) {
                return bc.blade.disposed;
            });
            disposedUcs.forEach(function (bc) {
                _this.bcList_.remove(bc);
            });
        };
        BladeRack.prototype.onItemInputChange_ = function (ev) {
            var ibc = findInputBindingController(this.find(InputBindingController), ev.sender);
            if (!ibc) {
                return;
            }
            this.emitter.emit('inputchange', {
                bindingController: ibc,
                sender: this,
            });
        };
        BladeRack.prototype.onItemMonitorUpdate_ = function (ev) {
            var mbc = findMonitorBindingController(this.find(MonitorBindingController), ev.sender);
            if (!mbc) {
                return;
            }
            this.emitter.emit('monitorupdate', {
                bindingController: mbc,
                sender: this,
            });
        };
        BladeRack.prototype.onItemFolderFold_ = function (ev) {
            if (ev.propertyName !== 'expanded') {
                return;
            }
            var fc = findFolderController(this.find(FolderController), ev.sender);
            if (fc) {
                this.emitter.emit('itemfold', {
                    folderController: fc,
                    sender: this,
                });
            }
        };
        BladeRack.prototype.onSubitemLayout_ = function (_) {
            this.emitter.emit('itemlayout', {
                sender: this,
            });
        };
        BladeRack.prototype.onSubitemInputChange_ = function (ev) {
            this.emitter.emit('inputchange', {
                bindingController: ev.bindingController,
                sender: this,
            });
        };
        BladeRack.prototype.onSubitemMonitorUpdate_ = function (ev) {
            this.emitter.emit('monitorupdate', {
                bindingController: ev.bindingController,
                sender: this,
            });
        };
        BladeRack.prototype.onSubitemFolderFold_ = function (ev) {
            this.emitter.emit('itemfold', {
                folderController: ev.folderController,
                sender: this,
            });
        };
        return BladeRack;
    }());

    /**
     * @hidden
     */
    var Folder = /** @class */ (function () {
        function Folder(title, expanded) {
            this.emitter = new Emitter();
            this.expanded_ = expanded;
            this.expandedHeight_ = null;
            this.temporaryExpanded_ = null;
            this.shouldFixHeight_ = false;
            this.title = title;
        }
        Object.defineProperty(Folder.prototype, "expanded", {
            get: function () {
                return this.expanded_;
            },
            set: function (expanded) {
                var changed = this.expanded_ !== expanded;
                if (!changed) {
                    return;
                }
                this.emitter.emit('beforechange', {
                    propertyName: 'expanded',
                    sender: this,
                });
                this.expanded_ = expanded;
                this.emitter.emit('change', {
                    propertyName: 'expanded',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Folder.prototype, "temporaryExpanded", {
            get: function () {
                return this.temporaryExpanded_;
            },
            set: function (expanded) {
                var changed = this.temporaryExpanded_ !== expanded;
                if (!changed) {
                    return;
                }
                this.emitter.emit('beforechange', {
                    propertyName: 'temporaryExpanded',
                    sender: this,
                });
                this.temporaryExpanded_ = expanded;
                this.emitter.emit('change', {
                    propertyName: 'temporaryExpanded',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Folder.prototype, "expandedHeight", {
            get: function () {
                return this.expandedHeight_;
            },
            set: function (expandedHeight) {
                var changed = this.expandedHeight_ !== expandedHeight;
                if (!changed) {
                    return;
                }
                this.emitter.emit('beforechange', {
                    propertyName: 'expandedHeight',
                    sender: this,
                });
                this.expandedHeight_ = expandedHeight;
                this.emitter.emit('change', {
                    propertyName: 'expandedHeight',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Folder.prototype, "shouldFixHeight", {
            get: function () {
                return this.shouldFixHeight_;
            },
            set: function (shouldFixHeight) {
                var changed = this.shouldFixHeight_ !== shouldFixHeight;
                if (!changed) {
                    return;
                }
                this.emitter.emit('beforechange', {
                    propertyName: 'shouldFixHeight',
                    sender: this,
                });
                this.shouldFixHeight_ = shouldFixHeight;
                this.emitter.emit('change', {
                    propertyName: 'shouldFixHeight',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Folder.prototype, "styleExpanded", {
            get: function () {
                var _a;
                return (_a = this.temporaryExpanded) !== null && _a !== void 0 ? _a : this.expanded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Folder.prototype, "styleHeight", {
            get: function () {
                if (!this.styleExpanded) {
                    return '0';
                }
                if (this.shouldFixHeight && !isEmpty(this.expandedHeight)) {
                    return this.expandedHeight + "px";
                }
                return 'auto';
            },
            enumerable: false,
            configurable: true
        });
        return Folder;
    }());

    /**
     * @hidden
     */
    var FolderView = /** @class */ (function () {
        function FolderView(doc, config) {
            this.onFolderChange_ = this.onFolderChange_.bind(this);
            this.folder_ = config.folder;
            this.folder_.emitter.on('change', this.onFolderChange_);
            this.className_ = ClassName(config.viewName || 'fld');
            this.element = doc.createElement('div');
            this.element.classList.add(this.className_());
            var titleElem = doc.createElement('button');
            titleElem.classList.add(this.className_('t'));
            titleElem.textContent = this.folder_.title;
            if (config.hidesTitle) {
                titleElem.style.display = 'none';
            }
            this.element.appendChild(titleElem);
            this.titleElement = titleElem;
            var markElem = doc.createElement('div');
            markElem.classList.add(this.className_('m'));
            this.titleElement.appendChild(markElem);
            var containerElem = doc.createElement('div');
            containerElem.classList.add(this.className_('c'));
            this.element.appendChild(containerElem);
            this.containerElement = containerElem;
            this.applyModel_();
        }
        FolderView.prototype.applyModel_ = function () {
            var expanded = this.folder_.styleExpanded;
            var expandedClass = this.className_(undefined, 'expanded');
            if (expanded) {
                this.element.classList.add(expandedClass);
            }
            else {
                this.element.classList.remove(expandedClass);
            }
            this.containerElement.style.height = this.folder_.styleHeight;
        };
        FolderView.prototype.onFolderChange_ = function () {
            this.applyModel_();
        };
        return FolderView;
    }());

    /**
     * @hidden
     */
    var FolderController = /** @class */ (function () {
        function FolderController(doc, config) {
            var _a;
            this.onContainerTransitionEnd_ = this.onContainerTransitionEnd_.bind(this);
            this.onFolderBeforeChange_ = this.onFolderBeforeChange_.bind(this);
            this.onTitleClick_ = this.onTitleClick_.bind(this);
            this.onRackAdd_ = this.onRackAdd_.bind(this);
            this.onRackItemLayout_ = this.onRackItemLayout_.bind(this);
            this.onRackRemove_ = this.onRackRemove_.bind(this);
            this.blade = config.blade;
            this.folder = new Folder(config.title, (_a = config.expanded) !== null && _a !== void 0 ? _a : true);
            this.folder.emitter.on('beforechange', this.onFolderBeforeChange_);
            var rack = new BladeRack();
            rack.emitter.on('add', this.onRackAdd_);
            rack.emitter.on('itemlayout', this.onRackItemLayout_);
            rack.emitter.on('remove', this.onRackRemove_);
            this.bladeRack = rack;
            this.doc_ = doc;
            this.view = new FolderView(this.doc_, {
                folder: this.folder,
                hidesTitle: config.hidesTitle,
                viewName: config.viewName,
            });
            this.view.titleElement.addEventListener('click', this.onTitleClick_);
            this.view.containerElement.addEventListener('transitionend', this.onContainerTransitionEnd_);
            setUpBladeView(this.view, this.blade);
        }
        Object.defineProperty(FolderController.prototype, "document", {
            get: function () {
                return this.doc_;
            },
            enumerable: false,
            configurable: true
        });
        FolderController.prototype.onFolderBeforeChange_ = function (ev) {
            if (ev.propertyName !== 'expanded') {
                return;
            }
            if (isEmpty(this.folder.expandedHeight)) {
                this.folder.expandedHeight = computeExpandedFolderHeight(this.folder, this.view.containerElement);
            }
            this.folder.shouldFixHeight = true;
            forceReflow(this.view.containerElement);
        };
        FolderController.prototype.onTitleClick_ = function () {
            this.folder.expanded = !this.folder.expanded;
        };
        FolderController.prototype.applyRackChange_ = function () {
            updateAllItemsPositions(this.bladeRack);
        };
        FolderController.prototype.onRackAdd_ = function (ev) {
            insertElementAt(this.view.containerElement, ev.bladeController.view.element, ev.index);
            this.applyRackChange_();
        };
        FolderController.prototype.onRackRemove_ = function (_) {
            this.applyRackChange_();
        };
        FolderController.prototype.onRackItemLayout_ = function (_) {
            this.applyRackChange_();
        };
        FolderController.prototype.onContainerTransitionEnd_ = function (ev) {
            if (ev.propertyName !== 'height') {
                return;
            }
            this.folder.shouldFixHeight = false;
            this.folder.expandedHeight = null;
        };
        return FolderController;
    }());

    var className$j = ClassName('spt');
    /**
     * @hidden
     */
    var SeparatorView = /** @class */ (function () {
        function SeparatorView(doc) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$j());
            var hrElem = doc.createElement('hr');
            hrElem.classList.add(className$j('r'));
            this.element.appendChild(hrElem);
        }
        return SeparatorView;
    }());

    /**
     * @hidden
     */
    var SeparatorController = /** @class */ (function () {
        function SeparatorController(doc, config) {
            this.blade = config.blade;
            this.view = new SeparatorView(doc);
            setUpBladeView(this.view, this.blade);
        }
        return SeparatorController;
    }());

    var ButtonApi = /** @class */ (function () {
        /**
         * @hidden
         */
        function ButtonApi(buttonController) {
            this.controller = buttonController;
        }
        Object.defineProperty(ButtonApi.prototype, "hidden", {
            get: function () {
                return this.controller.blade.hidden;
            },
            set: function (hidden) {
                this.controller.blade.hidden = hidden;
            },
            enumerable: false,
            configurable: true
        });
        ButtonApi.prototype.dispose = function () {
            this.controller.blade.dispose();
        };
        ButtonApi.prototype.on = function (eventName, handler) {
            var emitter = this.controller.button.emitter;
            // TODO: Type-safe
            emitter.on(eventName, forceCast(handler.bind(this)));
            return this;
        };
        return ButtonApi;
    }());

    /**
     * A base class of Tweakpane API events.
     */
    var TpEvent = /** @class */ (function () {
        /**
         * @hidden
         */
        function TpEvent(target) {
            this.target = target;
        }
        return TpEvent;
    }());
    /**
     * An event class for value changes of input bindings.
     * @template T The type of the value.
     */
    var TpChangeEvent = /** @class */ (function (_super) {
        __extends(TpChangeEvent, _super);
        /**
         * @hidden
         */
        function TpChangeEvent(target, value, presetKey) {
            var _this = _super.call(this, target) || this;
            _this.value = value;
            _this.presetKey = presetKey;
            return _this;
        }
        return TpChangeEvent;
    }(TpEvent));
    /**
     * An event class for value updates of monitor bindings.
     * @template T The type of the value.
     */
    var TpUpdateEvent = /** @class */ (function (_super) {
        __extends(TpUpdateEvent, _super);
        /**
         * @hidden
         */
        function TpUpdateEvent(target, value, presetKey) {
            var _this = _super.call(this, target) || this;
            _this.value = value;
            _this.presetKey = presetKey;
            return _this;
        }
        return TpUpdateEvent;
    }(TpEvent));
    /**
     * An event class for folder.
     */
    var TpFoldEvent = /** @class */ (function (_super) {
        __extends(TpFoldEvent, _super);
        /**
         * @hidden
         */
        function TpFoldEvent(target, expanded) {
            var _this = _super.call(this, target) || this;
            _this.expanded = expanded;
            return _this;
        }
        return TpFoldEvent;
    }(TpEvent));

    /**
     * The API for the input binding between the parameter and the pane.
     * @template In The internal type.
     * @template Ex The external type (= parameter object).
     */
    var InputBindingApi = /** @class */ (function () {
        /**
         * @hidden
         */
        function InputBindingApi(bindingController) {
            this.onBindingChange_ = this.onBindingChange_.bind(this);
            this.emitter_ = new Emitter();
            this.controller = bindingController;
            this.controller.binding.emitter.on('change', this.onBindingChange_);
        }
        Object.defineProperty(InputBindingApi.prototype, "hidden", {
            get: function () {
                return this.controller.blade.hidden;
            },
            set: function (hidden) {
                this.controller.blade.hidden = hidden;
            },
            enumerable: false,
            configurable: true
        });
        InputBindingApi.prototype.dispose = function () {
            this.controller.blade.dispose();
        };
        InputBindingApi.prototype.on = function (eventName, handler) {
            var bh = handler.bind(this);
            this.emitter_.on(eventName, function (ev) {
                bh(ev.event);
            });
            return this;
        };
        InputBindingApi.prototype.refresh = function () {
            this.controller.binding.read();
        };
        InputBindingApi.prototype.onBindingChange_ = function (ev) {
            var value = ev.sender.target.read();
            this.emitter_.emit('change', {
                event: new TpChangeEvent(this, forceCast(value), this.controller.binding.target.presetKey),
            });
        };
        return InputBindingApi;
    }());

    var CREATE_MESSAGE_MAP = {
        alreadydisposed: function () { return 'View has been already disposed'; },
        invalidparams: function (context) { return "Invalid parameters for '" + context.name + "'"; },
        nomatchingcontroller: function (context) {
            return "No matching controller for '" + context.key + "'";
        },
        notbindable: function () { return "Value is not bindable"; },
        propertynotfound: function (context) { return "Property '" + context.name + "' not found"; },
        shouldneverhappen: function () { return 'This error should never happen'; },
    };
    var TpError = /** @class */ (function () {
        function TpError(config) {
            var _a;
            this.message = (_a = CREATE_MESSAGE_MAP[config.type](forceCast(config.context))) !== null && _a !== void 0 ? _a : 'Unexpected error';
            this.name = this.constructor.name;
            this.stack = new Error(this.message).stack;
            this.type = config.type;
        }
        TpError.alreadyDisposed = function () {
            return new TpError({ type: 'alreadydisposed' });
        };
        TpError.notBindable = function () {
            return new TpError({
                type: 'notbindable',
            });
        };
        TpError.propertyNotFound = function (name) {
            return new TpError({
                type: 'propertynotfound',
                context: {
                    name: name,
                },
            });
        };
        TpError.shouldNeverHappen = function () {
            return new TpError({ type: 'shouldneverhappen' });
        };
        return TpError;
    }());
    TpError.prototype = Object.create(Error.prototype);
    TpError.prototype.constructor = TpError;

    /**
     * @hidden
     */
    var InputBinding = /** @class */ (function () {
        function InputBinding(config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.reader = config.reader;
            this.writer = config.writer;
            this.emitter = new Emitter();
            this.value = config.value;
            this.value.emitter.on('change', this.onValueChange_);
            this.target = config.target;
            this.read();
        }
        InputBinding.prototype.read = function () {
            var targetValue = this.target.read();
            if (targetValue !== undefined) {
                this.value.rawValue = this.reader(targetValue);
            }
        };
        InputBinding.prototype.write_ = function (rawValue) {
            this.writer(this.target, rawValue);
        };
        InputBinding.prototype.onValueChange_ = function (ev) {
            this.write_(ev.rawValue);
            this.emitter.emit('change', {
                rawValue: ev.rawValue,
                sender: this,
            });
        };
        return InputBinding;
    }());

    /**
     * A model for handling value changes.
     * @template T The type of the raw value.
     */
    var Value = /** @class */ (function () {
        function Value(initialValue, config) {
            var _a;
            this.constraint_ = config === null || config === void 0 ? void 0 : config.constraint;
            this.equals_ = (_a = config === null || config === void 0 ? void 0 : config.equals) !== null && _a !== void 0 ? _a : (function (v1, v2) { return v1 === v2; });
            this.emitter = new Emitter();
            this.rawValue_ = initialValue;
        }
        Object.defineProperty(Value.prototype, "constraint", {
            get: function () {
                return this.constraint_;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Value.prototype, "rawValue", {
            /**
             * The raw value of the model.
             */
            get: function () {
                return this.rawValue_;
            },
            set: function (rawValue) {
                var constrainedValue = this.constraint_
                    ? this.constraint_.constrain(rawValue)
                    : rawValue;
                var changed = !this.equals_(this.rawValue_, constrainedValue);
                if (changed) {
                    this.rawValue_ = constrainedValue;
                    this.emitter.emit('change', {
                        rawValue: constrainedValue,
                        sender: this,
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        return Value;
    }());

    function createController$6(plugin, args) {
        var initialValue = plugin.accept(args.target.read(), args.params);
        if (initialValue === null) {
            return null;
        }
        var valueArgs = {
            target: args.target,
            initialValue: initialValue,
            params: args.params,
        };
        var reader = plugin.binding.reader(valueArgs);
        var constraint = plugin.binding.constraint
            ? plugin.binding.constraint(valueArgs)
            : undefined;
        var value = new Value(reader(initialValue), {
            constraint: constraint,
            equals: plugin.binding.equals,
        });
        var binding = new InputBinding({
            reader: reader,
            target: args.target,
            value: value,
            writer: plugin.binding.writer(valueArgs),
        });
        var controller = plugin.controller({
            document: args.document,
            initialValue: initialValue,
            params: args.params,
            value: binding.value,
        });
        return new InputBindingController(args.document, {
            binding: binding,
            controller: controller,
            label: args.params.label || args.target.key,
            blade: new Blade(),
        });
    }

    /**
     * @hidden
     */
    function createInputBindingController(document, target, params) {
        var initialValue = target.read();
        if (isEmpty(initialValue)) {
            throw new TpError({
                context: {
                    key: target.key,
                },
                type: 'nomatchingcontroller',
            });
        }
        var bc = Plugins.inputs.reduce(function (result, plugin) {
            return result ||
                createController$6(plugin, {
                    document: document,
                    target: target,
                    params: params,
                });
        }, null);
        if (bc) {
            return bc;
        }
        throw new TpError({
            context: {
                key: target.key,
            },
            type: 'nomatchingcontroller',
        });
    }

    /**
     * The API for the monitor binding between the parameter and the pane.
     */
    var MonitorBindingApi = /** @class */ (function () {
        /**
         * @hidden
         */
        function MonitorBindingApi(bindingController) {
            this.onBindingUpdate_ = this.onBindingUpdate_.bind(this);
            this.emitter_ = new Emitter();
            this.controller = bindingController;
            this.controller.binding.emitter.on('update', this.onBindingUpdate_);
        }
        Object.defineProperty(MonitorBindingApi.prototype, "hidden", {
            get: function () {
                return this.controller.blade.hidden;
            },
            set: function (hidden) {
                this.controller.blade.hidden = hidden;
            },
            enumerable: false,
            configurable: true
        });
        MonitorBindingApi.prototype.dispose = function () {
            this.controller.blade.dispose();
        };
        MonitorBindingApi.prototype.on = function (eventName, handler) {
            var bh = handler.bind(this);
            this.emitter_.on(eventName, function (ev) {
                bh(ev.event);
            });
            return this;
        };
        MonitorBindingApi.prototype.refresh = function () {
            this.controller.binding.read();
        };
        MonitorBindingApi.prototype.onBindingUpdate_ = function (ev) {
            var value = ev.sender.target.read();
            this.emitter_.emit('update', {
                event: new TpUpdateEvent(this, forceCast(value), this.controller.binding.target.presetKey),
            });
        };
        return MonitorBindingApi;
    }());

    var Constants = {
        monitor: {
            defaultInterval: 200,
            defaultLineCount: 3,
        },
    };

    function fillBuffer(buffer, bufferSize) {
        while (buffer.length < bufferSize) {
            buffer.push(undefined);
        }
    }
    /**
     * @hidden
     */
    function initializeBuffer(initialValue, bufferSize) {
        var buffer = [initialValue];
        fillBuffer(buffer, bufferSize);
        return new Value(buffer);
    }
    function createTrimmedBuffer(buffer) {
        var index = buffer.indexOf(undefined);
        return forceCast(index < 0 ? buffer : buffer.slice(0, index));
    }
    /**
     * @hidden
     */
    function createPushedBuffer(buffer, newValue) {
        var newBuffer = __spreadArrays(createTrimmedBuffer(buffer), [newValue]);
        if (newBuffer.length > buffer.length) {
            newBuffer.splice(0, newBuffer.length - buffer.length);
        }
        else {
            fillBuffer(newBuffer, buffer.length);
        }
        return newBuffer;
    }

    /**
     * @hidden
     */
    var MonitorBinding = /** @class */ (function () {
        function MonitorBinding(config) {
            this.onTick_ = this.onTick_.bind(this);
            this.reader_ = config.reader;
            this.target = config.target;
            this.emitter = new Emitter();
            this.value = config.value;
            this.ticker = config.ticker;
            this.ticker.emitter.on('tick', this.onTick_);
            this.read();
        }
        MonitorBinding.prototype.dispose = function () {
            this.ticker.disposable.dispose();
        };
        MonitorBinding.prototype.read = function () {
            var targetValue = this.target.read();
            if (targetValue === undefined) {
                return;
            }
            var buffer = this.value.rawValue;
            var newValue = this.reader_(targetValue);
            this.value.rawValue = createPushedBuffer(buffer, newValue);
            this.emitter.emit('update', {
                rawValue: newValue,
                sender: this,
            });
        };
        MonitorBinding.prototype.onTick_ = function (_) {
            this.read();
        };
        return MonitorBinding;
    }());

    /**
     * @hidden
     */
    var IntervalTicker = /** @class */ (function () {
        function IntervalTicker(doc, interval) {
            var _this = this;
            this.id_ = null;
            this.onTick_ = this.onTick_.bind(this);
            // this.onWindowBlur_ = this.onWindowBlur_.bind(this);
            // this.onWindowFocus_ = this.onWindowFocus_.bind(this);
            this.doc_ = doc;
            this.emitter = new Emitter();
            if (interval <= 0) {
                this.id_ = null;
            }
            else {
                var win = this.doc_.defaultView;
                if (win) {
                    this.id_ = win.setInterval(this.onTick_, interval);
                }
            }
            // TODO: Stop on blur?
            // const win = document.defaultView;
            // if (win) {
            //   win.addEventListener('blur', this.onWindowBlur_);
            //   win.addEventListener('focus', this.onWindowFocus_);
            // }
            this.disposable = new Disposable();
            this.disposable.emitter.on('dispose', function () {
                if (_this.id_ !== null) {
                    var win = _this.doc_.defaultView;
                    if (win) {
                        win.clearInterval(_this.id_);
                    }
                }
                _this.id_ = null;
            });
        }
        IntervalTicker.prototype.onTick_ = function () {
            // if (!this.active_) {
            // 	return;
            // }
            this.emitter.emit('tick', {
                sender: this,
            });
        };
        return IntervalTicker;
    }());

    /**
     * @hidden
     */
    var ManualTicker = /** @class */ (function () {
        function ManualTicker() {
            this.disposable = new Disposable();
            this.emitter = new Emitter();
        }
        ManualTicker.prototype.tick = function () {
            this.emitter.emit('tick', {
                sender: this,
            });
        };
        return ManualTicker;
    }());

    function createTicker(document, interval) {
        return interval === 0
            ? new ManualTicker()
            : new IntervalTicker(document, interval !== null && interval !== void 0 ? interval : Constants.monitor.defaultInterval);
    }
    function createController$5(plugin, args) {
        var _a, _b;
        var initialValue = plugin.accept(args.target.read(), args.params);
        if (initialValue === null) {
            return null;
        }
        var valueArgs = {
            target: args.target,
            initialValue: initialValue,
            params: args.params,
        };
        var reader = plugin.binding.reader(valueArgs);
        var bufferSize = (_b = (_a = args.params.bufferSize) !== null && _a !== void 0 ? _a : (plugin.binding.defaultBufferSize &&
            plugin.binding.defaultBufferSize(args.params))) !== null && _b !== void 0 ? _b : 1;
        var binding = new MonitorBinding({
            reader: reader,
            target: args.target,
            ticker: createTicker(args.document, args.params.interval),
            value: initializeBuffer(reader(initialValue), bufferSize),
        });
        return new MonitorBindingController(args.document, {
            binding: binding,
            controller: plugin.controller({
                document: args.document,
                params: args.params,
                value: binding.value,
            }),
            label: args.params.label || args.target.key,
            blade: new Blade(),
        });
    }

    /**
     * @hidden
     */
    function createMonitorBindingController(document, target, params) {
        var bc = Plugins.monitors.reduce(function (result, plugin) {
            return result ||
                createController$5(plugin, {
                    document: document,
                    params: params,
                    target: target,
                });
        }, null);
        if (bc) {
            return bc;
        }
        throw new TpError({
            context: {
                key: target.key,
            },
            type: 'nomatchingcontroller',
        });
    }

    var SeparatorApi = /** @class */ (function () {
        /**
         * @hidden
         */
        function SeparatorApi(controller) {
            this.controller = controller;
        }
        Object.defineProperty(SeparatorApi.prototype, "hidden", {
            get: function () {
                return this.controller.blade.hidden;
            },
            set: function (hidden) {
                this.controller.blade.hidden = hidden;
            },
            enumerable: false,
            configurable: true
        });
        SeparatorApi.prototype.dispose = function () {
            this.controller.blade.dispose();
        };
        return SeparatorApi;
    }());

    /**
     * A binding target.
     */
    var BindingTarget = /** @class */ (function () {
        function BindingTarget(obj, key, opt_id) {
            this.obj_ = obj;
            this.key_ = key;
            this.presetKey_ = opt_id !== null && opt_id !== void 0 ? opt_id : key;
        }
        BindingTarget.isBindable = function (obj) {
            if (obj === null) {
                return false;
            }
            if (typeof obj !== 'object') {
                return false;
            }
            return true;
        };
        Object.defineProperty(BindingTarget.prototype, "key", {
            /**
             * The property name of the binding.
             */
            get: function () {
                return this.key_;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BindingTarget.prototype, "presetKey", {
            /**
             * The key used for presets.
             */
            get: function () {
                return this.presetKey_;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Read a bound value.
         * @return A bound value
         */
        BindingTarget.prototype.read = function () {
            return this.obj_[this.key_];
        };
        /**
         * Write a value.
         * @param value The value to write to the target.
         */
        BindingTarget.prototype.write = function (value) {
            this.obj_[this.key_] = value;
        };
        /**
         * Write a value to the target property.
         * @param name The property name.
         * @param value The value to write to the target.
         */
        BindingTarget.prototype.writeProperty = function (name, value) {
            var valueObj = this.read();
            if (!BindingTarget.isBindable(valueObj)) {
                throw TpError.notBindable();
            }
            if (!(name in valueObj)) {
                throw TpError.propertyNotFound(name);
            }
            valueObj[name] = value;
        };
        return BindingTarget;
    }());

    function createBindingTarget(obj, key, opt_id) {
        if (!BindingTarget.isBindable(obj)) {
            throw TpError.notBindable();
        }
        return new BindingTarget(obj, key, opt_id);
    }

    var FolderApi = /** @class */ (function () {
        /**
         * @hidden
         */
        function FolderApi(controller) {
            this.onFolderChange_ = this.onFolderChange_.bind(this);
            this.onRackInputChange_ = this.onRackInputChange_.bind(this);
            this.onRackItemFold_ = this.onRackItemFold_.bind(this);
            this.onRackMonitorUpdate_ = this.onRackMonitorUpdate_.bind(this);
            this.controller = controller;
            this.emitter_ = new Emitter();
            this.controller.folder.emitter.on('change', this.onFolderChange_);
            var rack = this.controller.bladeRack;
            rack.emitter.on('inputchange', this.onRackInputChange_);
            rack.emitter.on('monitorupdate', this.onRackMonitorUpdate_);
            rack.emitter.on('itemfold', this.onRackItemFold_);
        }
        Object.defineProperty(FolderApi.prototype, "expanded", {
            get: function () {
                return this.controller.folder.expanded;
            },
            set: function (expanded) {
                this.controller.folder.expanded = expanded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FolderApi.prototype, "hidden", {
            get: function () {
                return this.controller.blade.hidden;
            },
            set: function (hidden) {
                this.controller.blade.hidden = hidden;
            },
            enumerable: false,
            configurable: true
        });
        FolderApi.prototype.dispose = function () {
            this.controller.blade.dispose();
        };
        FolderApi.prototype.addInput = function (object, key, opt_params) {
            var params = opt_params || {};
            var bc = createInputBindingController(this.controller.document, createBindingTarget(object, key, params.presetKey), params);
            this.controller.bladeRack.add(bc, params.index);
            return new InputBindingApi(forceCast(bc));
        };
        FolderApi.prototype.addMonitor = function (object, key, opt_params) {
            var params = opt_params || {};
            var bc = createMonitorBindingController(this.controller.document, createBindingTarget(object, key), params);
            this.controller.bladeRack.add(bc, params.index);
            return new MonitorBindingApi(forceCast(bc));
        };
        FolderApi.prototype.addFolder = function (params) {
            var bc = new FolderController(this.controller.document, __assign(__assign({}, params), { blade: new Blade() }));
            this.controller.bladeRack.add(bc, params.index);
            return new FolderApi(bc);
        };
        FolderApi.prototype.addButton = function (params) {
            var bc = new ButtonController(this.controller.document, __assign(__assign({}, params), { blade: new Blade() }));
            this.controller.bladeRack.add(bc, params.index);
            return new ButtonApi(bc);
        };
        FolderApi.prototype.addSeparator = function (opt_params) {
            var params = opt_params || {};
            var bc = new SeparatorController(this.controller.document, {
                blade: new Blade(),
            });
            this.controller.bladeRack.add(bc, params.index);
            return new SeparatorApi(bc);
        };
        /**
         * Adds a global event listener. It handles all events of child inputs/monitors.
         * @param eventName The event name to listen.
         * @return The API object itself.
         */
        FolderApi.prototype.on = function (eventName, handler) {
            var bh = handler.bind(this);
            this.emitter_.on(eventName, function (ev) {
                bh(ev.event);
            });
            return this;
        };
        FolderApi.prototype.onRackInputChange_ = function (ev) {
            var bapi = new InputBindingApi(ev.bindingController);
            var binding = ev.bindingController.binding;
            this.emitter_.emit('change', {
                event: new TpChangeEvent(bapi, forceCast(binding.target.read()), binding.target.presetKey),
            });
        };
        FolderApi.prototype.onRackMonitorUpdate_ = function (ev) {
            var bapi = new MonitorBindingApi(ev.bindingController);
            var binding = ev.bindingController.binding;
            this.emitter_.emit('update', {
                event: new TpUpdateEvent(bapi, forceCast(binding.target.read()), binding.target.presetKey),
            });
        };
        FolderApi.prototype.onRackItemFold_ = function (ev) {
            var fapi = new FolderApi(ev.folderController);
            this.emitter_.emit('fold', {
                event: new TpFoldEvent(fapi, ev.folderController.folder.expanded),
            });
        };
        FolderApi.prototype.onFolderChange_ = function (ev) {
            if (ev.propertyName !== 'expanded') {
                return;
            }
            this.emitter_.emit('fold', {
                event: new TpFoldEvent(this, ev.sender.expanded),
            });
        };
        return FolderApi;
    }());

    /**
     * @hidden
     */
    function exportPresetJson(targets) {
        return targets.reduce(function (result, target) {
            var _a;
            return Object.assign(result, (_a = {},
                _a[target.presetKey] = target.read(),
                _a));
        }, {});
    }
    /**
     * @hidden
     */
    function importPresetJson(targets, preset) {
        targets.forEach(function (target) {
            var value = preset[target.presetKey];
            if (value !== undefined) {
                target.write(value);
            }
        });
    }

    /**
     * The Tweakpane interface.
     *
     * ```
     * new Tweakpane(options: TweakpaneConfig): RootApi
     * ```
     *
     * See [[`TweakpaneConfig`]] interface for available options.
     */
    var RootApi = /** @class */ (function (_super) {
        __extends(RootApi, _super);
        /**
         * @hidden
         */
        function RootApi(controller) {
            return _super.call(this, controller) || this;
        }
        /**
         * Registers a plugin.
         * @template In The type of the internal value.
         * @template Ex The type of the external value.
         * @param r The configuration of the plugin.
         */
        RootApi.registerPlugin = function (r) {
            if (r.type === 'input') {
                Plugins.inputs.unshift(r.plugin);
            }
            else if (r.type === 'monitor') {
                Plugins.monitors.unshift(r.plugin);
            }
        };
        Object.defineProperty(RootApi.prototype, "element", {
            get: function () {
                return this.controller.view.element;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Imports a preset of all inputs.
         * @param preset The preset object to import.
         */
        RootApi.prototype.importPreset = function (preset) {
            var targets = this.controller.bladeRack
                .find(InputBindingController)
                .map(function (ibc) {
                return ibc.binding.target;
            });
            importPresetJson(targets, preset);
            this.refresh();
        };
        /**
         * Exports a preset of all inputs.
         * @return An exported preset object.
         */
        RootApi.prototype.exportPreset = function () {
            var targets = this.controller.bladeRack
                .find(InputBindingController)
                .map(function (ibc) {
                return ibc.binding.target;
            });
            return exportPresetJson(targets);
        };
        /**
         * Refreshes all bindings of the pane.
         */
        RootApi.prototype.refresh = function () {
            // Force-read all input bindings
            this.controller.bladeRack.find(InputBindingController).forEach(function (ibc) {
                ibc.binding.read();
            });
            // Force-read all monitor bindings
            this.controller.bladeRack.find(MonitorBindingController).forEach(function (mbc) {
                mbc.binding.read();
            });
        };
        return RootApi;
    }(FolderApi));

    /***
     * A simple semantic versioning perser.
     */
    var Semver = /** @class */ (function () {
        function Semver(text) {
            var comps = text.split('.');
            this.major = parseInt(comps[0], 10);
            this.minor = parseInt(comps[1], 10);
            this.patch = parseInt(comps[2], 10);
        }
        Semver.prototype.toString = function () {
            return [this.major, this.minor, this.patch].join('.');
        };
        return Semver;
    }());

    var RootController = /** @class */ (function (_super) {
        __extends(RootController, _super);
        function RootController(doc, config) {
            return _super.call(this, doc, {
                expanded: config.expanded,
                title: config.title || '',
                blade: config.blade,
                hidesTitle: config.title === undefined,
                viewName: 'rot',
            }) || this;
        }
        return RootController;
    }(FolderController));

    /**
     * A constraint to combine multiple constraints.
     * @template T The type of the value.
     */
    var CompositeConstraint = /** @class */ (function () {
        function CompositeConstraint(constraints) {
            this.constraints = constraints;
        }
        CompositeConstraint.prototype.constrain = function (value) {
            return this.constraints.reduce(function (result, c) {
                return c.constrain(result);
            }, value);
        };
        return CompositeConstraint;
    }());
    function findConstraint(c, constraintClass) {
        if (c instanceof constraintClass) {
            return c;
        }
        if (c instanceof CompositeConstraint) {
            var result = c.constraints.reduce(function (tmpResult, sc) {
                if (tmpResult) {
                    return tmpResult;
                }
                return sc instanceof constraintClass ? sc : null;
            }, null);
            if (result) {
                return result;
            }
        }
        return null;
    }

    /**
     * A list constranit.
     * @template T The type of the value.
     */
    var ListConstraint = /** @class */ (function () {
        function ListConstraint(options) {
            this.options = options;
        }
        ListConstraint.prototype.constrain = function (value) {
            var opts = this.options;
            if (opts.length === 0) {
                return value;
            }
            var matched = opts.filter(function (item) {
                return item.value === value;
            }).length > 0;
            return matched ? value : opts[0].value;
        };
        return ListConstraint;
    }());

    /**
     * @hidden
     */
    function boolToString(value) {
        return String(value);
    }
    /**
     * @hidden
     */
    function boolFromUnknown(value) {
        if (value === 'false') {
            return false;
        }
        return !!value;
    }
    /**
     * @hidden
     */
    function BooleanFormatter(value) {
        return boolToString(value);
    }

    /**
     * Compares two primitive values.
     * @param v1 The value.
     * @param v2 The another value.
     * @return true if equal, false otherwise.
     */
    function equalsPrimitive(v1, v2) {
        return v1 === v2;
    }
    /**
     * Writes the primitive value.
     * @param target The target to be written.
     * @param value The value to write.
     */
    function writePrimitive(target, value) {
        target.write(value);
    }

    /**
     * A number step range constraint.
     */
    var StepConstraint = /** @class */ (function () {
        function StepConstraint(step) {
            this.step = step;
        }
        StepConstraint.prototype.constrain = function (value) {
            var r = value < 0
                ? -Math.round(-value / this.step)
                : Math.round(value / this.step);
            return r * this.step;
        };
        return StepConstraint;
    }());

    function mapRange(value, start1, end1, start2, end2) {
        var p = (value - start1) / (end1 - start1);
        return start2 + p * (end2 - start2);
    }
    function getDecimalDigits(value) {
        var text = String(value.toFixed(10));
        var frac = text.split('.')[1];
        return frac.replace(/0+$/, '').length;
    }
    function constrainRange(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    function loopRange(value, max) {
        return ((value % max) + max) % max;
    }

    function normalizeInputParamsOptions(options, convert) {
        if (Array.isArray(options)) {
            return options.map(function (item) {
                return {
                    text: item.text,
                    value: convert(item.value),
                };
            });
        }
        var textToValueMap = options;
        var texts = Object.keys(textToValueMap);
        return texts.reduce(function (result, text) {
            return result.concat({
                text: text,
                value: convert(textToValueMap[text]),
            });
        }, []);
    }
    /**
     * Tries to create a list constraint.
     * @template T The type of the raw value.
     * @param params The input parameters object.
     * @param convert The converter that converts unknown value into T.
     * @return A constraint or null if not found.
     */
    function createListConstraint(params, convert) {
        if ('options' in params && params.options !== undefined) {
            return new ListConstraint(normalizeInputParamsOptions(params.options, convert));
        }
        return null;
    }
    /**
     * @hidden
     */
    function findListItems(constraint) {
        var c = constraint
            ? findConstraint(constraint, ListConstraint)
            : null;
        if (!c) {
            return null;
        }
        return c.options;
    }
    function findStep(constraint) {
        var c = constraint ? findConstraint(constraint, StepConstraint) : null;
        if (!c) {
            return null;
        }
        return c.step;
    }
    /**
     * @hidden
     */
    function getSuitableDecimalDigits(constraint, rawValue) {
        var sc = constraint && findConstraint(constraint, StepConstraint);
        if (sc) {
            return getDecimalDigits(sc.step);
        }
        return Math.max(getDecimalDigits(rawValue), 2);
    }
    /**
     * @hidden
     */
    function getBaseStep(constraint) {
        var step = findStep(constraint);
        return step !== null && step !== void 0 ? step : 1;
    }

    var className$i = ClassName('lst');
    /**
     * @hidden
     */
    var ListView = /** @class */ (function () {
        function ListView(doc, config) {
            var _this = this;
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.element = doc.createElement('div');
            this.element.classList.add(className$i());
            this.stringifyValue_ = config.stringifyValue;
            var selectElem = doc.createElement('select');
            selectElem.classList.add(className$i('s'));
            config.options.forEach(function (item, index) {
                var optionElem = doc.createElement('option');
                optionElem.dataset.index = String(index);
                optionElem.textContent = item.text;
                optionElem.value = _this.stringifyValue_(item.value);
                selectElem.appendChild(optionElem);
            });
            this.element.appendChild(selectElem);
            this.selectElement = selectElem;
            var markElem = doc.createElement('div');
            markElem.classList.add(className$i('m'));
            markElem.appendChild(createSvgIconElement(doc, 'dropdown'));
            this.element.appendChild(markElem);
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        ListView.prototype.update = function () {
            this.selectElement.value = this.stringifyValue_(this.value.rawValue);
        };
        ListView.prototype.onValueChange_ = function () {
            this.update();
        };
        return ListView;
    }());

    /**
     * @hidden
     */
    var ListController = /** @class */ (function () {
        function ListController(doc, config) {
            this.onSelectChange_ = this.onSelectChange_.bind(this);
            this.value = config.value;
            this.listItems_ = config.listItems;
            this.view = new ListView(doc, {
                options: this.listItems_,
                stringifyValue: config.stringifyValue,
                value: this.value,
            });
            this.view.selectElement.addEventListener('change', this.onSelectChange_);
        }
        ListController.prototype.onSelectChange_ = function (e) {
            var selectElem = forceCast(e.currentTarget);
            var optElem = selectElem.selectedOptions.item(0);
            if (!optElem) {
                return;
            }
            var itemIndex = Number(optElem.dataset.index);
            this.value.rawValue = this.listItems_[itemIndex].value;
            this.view.update();
        };
        return ListController;
    }());

    var className$h = ClassName('ckb');
    /**
     * @hidden
     */
    var CheckboxView = /** @class */ (function () {
        function CheckboxView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.element = doc.createElement('div');
            this.element.classList.add(className$h());
            var labelElem = doc.createElement('label');
            labelElem.classList.add(className$h('l'));
            this.element.appendChild(labelElem);
            var inputElem = doc.createElement('input');
            inputElem.classList.add(className$h('i'));
            inputElem.type = 'checkbox';
            labelElem.appendChild(inputElem);
            this.inputElement = inputElem;
            var wrapperElem = doc.createElement('div');
            wrapperElem.classList.add(className$h('w'));
            labelElem.appendChild(wrapperElem);
            var markElem = createSvgIconElement(doc, 'check');
            wrapperElem.appendChild(markElem);
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        CheckboxView.prototype.update = function () {
            this.inputElement.checked = this.value.rawValue;
        };
        CheckboxView.prototype.onValueChange_ = function () {
            this.update();
        };
        return CheckboxView;
    }());

    /**
     * @hidden
     */
    var CheckboxController = /** @class */ (function () {
        function CheckboxController(doc, config) {
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.value = config.value;
            this.view = new CheckboxView(doc, {
                value: this.value,
            });
            this.view.inputElement.addEventListener('change', this.onInputChange_);
        }
        CheckboxController.prototype.onInputChange_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            this.value.rawValue = inputElem.checked;
            this.view.update();
        };
        return CheckboxController;
    }());

    function createConstraint$4(params) {
        var constraints = [];
        var lc = createListConstraint(params, boolFromUnknown);
        if (lc) {
            constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
    }
    function createController$4(doc, value) {
        var _a;
        var c = value.constraint;
        if (c && findConstraint(c, ListConstraint)) {
            return new ListController(doc, {
                listItems: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : [],
                stringifyValue: boolToString,
                value: value,
            });
        }
        return new CheckboxController(doc, {
            value: value,
        });
    }
    /**
     * @hidden
     */
    var BooleanInputPlugin = {
        id: 'input-bool',
        accept: function (value) { return (typeof value === 'boolean' ? value : null); },
        binding: {
            reader: function (_args) { return boolFromUnknown; },
            constraint: function (args) { return createConstraint$4(args.params); },
            equals: equalsPrimitive,
            writer: function (_args) { return writePrimitive; },
        },
        controller: function (args) {
            return createController$4(args.document, args.value);
        },
    };

    var className$g = ClassName('txt');
    /**
     * @hidden
     */
    var TextView = /** @class */ (function () {
        function TextView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.formatter_ = config.formatter;
            this.element = doc.createElement('div');
            this.element.classList.add(className$g());
            var inputElem = doc.createElement('input');
            inputElem.classList.add(className$g('i'));
            inputElem.type = 'text';
            this.element.appendChild(inputElem);
            this.inputElement = inputElem;
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        TextView.prototype.update = function () {
            this.inputElement.value = this.formatter_(this.value.rawValue);
        };
        TextView.prototype.onValueChange_ = function () {
            this.update();
        };
        return TextView;
    }());

    /**
     * @hidden
     */
    var TextController = /** @class */ (function () {
        function TextController(doc, config) {
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.parser_ = config.parser;
            this.value = config.value;
            this.view = new TextView(doc, {
                formatter: config.formatter,
                value: this.value,
            });
            this.view.inputElement.addEventListener('change', this.onInputChange_);
        }
        TextController.prototype.onInputChange_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var value = inputElem.value;
            var parsedValue = this.parser_(value);
            if (!isEmpty(parsedValue)) {
                this.value.rawValue = parsedValue;
            }
            this.view.update();
        };
        return TextController;
    }());

    var className$f = ClassName('clswtxt');
    /**
     * @hidden
     */
    var ColorSwatchTextView = /** @class */ (function () {
        function ColorSwatchTextView(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$f());
            var swatchElem = doc.createElement('div');
            swatchElem.classList.add(className$f('s'));
            this.swatchView_ = config.swatchView;
            swatchElem.appendChild(this.swatchView_.element);
            this.element.appendChild(swatchElem);
            var textElem = doc.createElement('div');
            textElem.classList.add(className$f('t'));
            this.textView = config.textView;
            textElem.appendChild(this.textView.element);
            this.element.appendChild(textElem);
        }
        Object.defineProperty(ColorSwatchTextView.prototype, "value", {
            get: function () {
                return this.textView.value;
            },
            enumerable: false,
            configurable: true
        });
        ColorSwatchTextView.prototype.update = function () {
            this.swatchView_.update();
            this.textView.update();
        };
        return ColorSwatchTextView;
    }());

    var PickedColor = /** @class */ (function () {
        function PickedColor(value) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.mode_ = value.rawValue.mode;
            this.value = value;
            this.value.emitter.on('change', this.onValueChange_);
            this.emitter = new Emitter();
        }
        Object.defineProperty(PickedColor.prototype, "mode", {
            get: function () {
                return this.mode_;
            },
            set: function (mode) {
                if (this.mode_ === mode) {
                    return;
                }
                this.mode_ = mode;
                this.emitter.emit('change', {
                    propertyName: 'mode',
                    sender: this,
                });
            },
            enumerable: false,
            configurable: true
        });
        PickedColor.prototype.onValueChange_ = function () {
            this.emitter.emit('change', {
                propertyName: 'value',
                sender: this,
            });
        };
        return PickedColor;
    }());

    /**
     * @hidden
     */
    function parseNumber(text) {
        var num = parseFloat(text);
        if (isNaN(num)) {
            return null;
        }
        return num;
    }
    /**
     * @hidden
     */
    function numberFromUnknown(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            var pv = parseNumber(value);
            if (!isEmpty(pv)) {
                return pv;
            }
        }
        return 0;
    }
    /**
     * @hidden
     */
    function numberToString(value) {
        return String(value);
    }
    /**
     * @hidden
     */
    function createNumberFormatter(digits) {
        return function (value) {
            return value.toFixed(Math.max(Math.min(digits, 20), 0));
        };
    }

    var innerFormatter = createNumberFormatter(0);
    /**
     * @hidden
     */
    function formatPercentage(value) {
        return innerFormatter(value) + '%';
    }

    function rgbToHsl(r, g, b) {
        var rp = constrainRange(r / 255, 0, 1);
        var gp = constrainRange(g / 255, 0, 1);
        var bp = constrainRange(b / 255, 0, 1);
        var cmax = Math.max(rp, gp, bp);
        var cmin = Math.min(rp, gp, bp);
        var c = cmax - cmin;
        var h = 0;
        var s = 0;
        var l = (cmin + cmax) / 2;
        if (c !== 0) {
            s = l > 0.5 ? c / (2 - cmin - cmax) : c / (cmax + cmin);
            if (rp === cmax) {
                h = (gp - bp) / c;
            }
            else if (gp === cmax) {
                h = 2 + (bp - rp) / c;
            }
            else {
                h = 4 + (rp - gp) / c;
            }
            h = h / 6 + (h < 0 ? 1 : 0);
        }
        return [h * 360, s * 100, l * 100];
    }
    function hslToRgb(h, s, l) {
        var _a, _b, _c, _d, _e, _f;
        var hp = ((h % 360) + 360) % 360;
        var sp = constrainRange(s / 100, 0, 1);
        var lp = constrainRange(l / 100, 0, 1);
        var c = (1 - Math.abs(2 * lp - 1)) * sp;
        var x = c * (1 - Math.abs(((hp / 60) % 2) - 1));
        var m = lp - c / 2;
        var rp, gp, bp;
        if (hp >= 0 && hp < 60) {
            _a = [c, x, 0], rp = _a[0], gp = _a[1], bp = _a[2];
        }
        else if (hp >= 60 && hp < 120) {
            _b = [x, c, 0], rp = _b[0], gp = _b[1], bp = _b[2];
        }
        else if (hp >= 120 && hp < 180) {
            _c = [0, c, x], rp = _c[0], gp = _c[1], bp = _c[2];
        }
        else if (hp >= 180 && hp < 240) {
            _d = [0, x, c], rp = _d[0], gp = _d[1], bp = _d[2];
        }
        else if (hp >= 240 && hp < 300) {
            _e = [x, 0, c], rp = _e[0], gp = _e[1], bp = _e[2];
        }
        else {
            _f = [c, 0, x], rp = _f[0], gp = _f[1], bp = _f[2];
        }
        return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
    }
    function rgbToHsv(r, g, b) {
        var rp = constrainRange(r / 255, 0, 1);
        var gp = constrainRange(g / 255, 0, 1);
        var bp = constrainRange(b / 255, 0, 1);
        var cmax = Math.max(rp, gp, bp);
        var cmin = Math.min(rp, gp, bp);
        var d = cmax - cmin;
        var h;
        if (d === 0) {
            h = 0;
        }
        else if (cmax === rp) {
            h = 60 * (((((gp - bp) / d) % 6) + 6) % 6);
        }
        else if (cmax === gp) {
            h = 60 * ((bp - rp) / d + 2);
        }
        else {
            h = 60 * ((rp - gp) / d + 4);
        }
        var s = cmax === 0 ? 0 : d / cmax;
        var v = cmax;
        return [h, s * 100, v * 100];
    }
    /**
     * @hidden
     */
    function hsvToRgb(h, s, v) {
        var _a, _b, _c, _d, _e, _f;
        var hp = loopRange(h, 360);
        var sp = constrainRange(s / 100, 0, 1);
        var vp = constrainRange(v / 100, 0, 1);
        var c = vp * sp;
        var x = c * (1 - Math.abs(((hp / 60) % 2) - 1));
        var m = vp - c;
        var rp, gp, bp;
        if (hp >= 0 && hp < 60) {
            _a = [c, x, 0], rp = _a[0], gp = _a[1], bp = _a[2];
        }
        else if (hp >= 60 && hp < 120) {
            _b = [x, c, 0], rp = _b[0], gp = _b[1], bp = _b[2];
        }
        else if (hp >= 120 && hp < 180) {
            _c = [0, c, x], rp = _c[0], gp = _c[1], bp = _c[2];
        }
        else if (hp >= 180 && hp < 240) {
            _d = [0, x, c], rp = _d[0], gp = _d[1], bp = _d[2];
        }
        else if (hp >= 240 && hp < 300) {
            _e = [x, 0, c], rp = _e[0], gp = _e[1], bp = _e[2];
        }
        else {
            _f = [c, 0, x], rp = _f[0], gp = _f[1], bp = _f[2];
        }
        return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
    }
    /**
     * @hidden
     */
    function removeAlphaComponent(comps) {
        return [comps[0], comps[1], comps[2]];
    }
    /**
     * @hidden
     */
    function appendAlphaComponent(comps, alpha) {
        return [comps[0], comps[1], comps[2], alpha];
    }
    var MODE_CONVERTER_MAP = {
        hsl: {
            hsl: function (h, s, l) { return [h, s, l]; },
            hsv: function (h, s, l) {
                var _a = hslToRgb(h, s, l), r = _a[0], g = _a[1], b = _a[2];
                return rgbToHsv(r, g, b);
            },
            rgb: hslToRgb,
        },
        hsv: {
            hsl: function (h, s, v) {
                var _a = hsvToRgb(h, s, v), r = _a[0], g = _a[1], b = _a[2];
                return rgbToHsl(r, g, b);
            },
            hsv: function (h, s, v) { return [h, s, v]; },
            rgb: hsvToRgb,
        },
        rgb: {
            hsl: rgbToHsl,
            hsv: rgbToHsv,
            rgb: function (r, g, b) { return [r, g, b]; },
        },
    };
    /**
     * @hidden
     */
    function convertColorMode(components, fromMode, toMode) {
        var _a;
        return (_a = MODE_CONVERTER_MAP[fromMode])[toMode].apply(_a, components);
    }

    var CONSTRAINT_MAP = {
        hsl: function (comps) {
            var _a;
            return [
                loopRange(comps[0], 360),
                constrainRange(comps[1], 0, 100),
                constrainRange(comps[2], 0, 100),
                constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1),
            ];
        },
        hsv: function (comps) {
            var _a;
            return [
                loopRange(comps[0], 360),
                constrainRange(comps[1], 0, 100),
                constrainRange(comps[2], 0, 100),
                constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1),
            ];
        },
        rgb: function (comps) {
            var _a;
            return [
                constrainRange(comps[0], 0, 255),
                constrainRange(comps[1], 0, 255),
                constrainRange(comps[2], 0, 255),
                constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1),
            ];
        },
    };
    function isRgbColorComponent(obj, key) {
        if (typeof obj !== 'object' || isEmpty(obj)) {
            return false;
        }
        return key in obj && typeof obj[key] === 'number';
    }
    /**
     * @hidden
     */
    var Color = /** @class */ (function () {
        function Color(comps, mode) {
            this.mode_ = mode;
            this.comps_ = CONSTRAINT_MAP[mode](comps);
        }
        Color.black = function () {
            return new Color([0, 0, 0], 'rgb');
        };
        Color.fromObject = function (obj) {
            var comps = 'a' in obj ? [obj.r, obj.g, obj.b, obj.a] : [obj.r, obj.g, obj.b];
            return new Color(comps, 'rgb');
        };
        Color.toRgbaObject = function (color) {
            return color.toRgbaObject();
        };
        Color.isRgbColorObject = function (obj) {
            return (isRgbColorComponent(obj, 'r') &&
                isRgbColorComponent(obj, 'g') &&
                isRgbColorComponent(obj, 'b'));
        };
        Color.isRgbaColorObject = function (obj) {
            return this.isRgbColorObject(obj) && isRgbColorComponent(obj, 'a');
        };
        Color.isColorObject = function (obj) {
            return this.isRgbColorObject(obj);
        };
        Color.equals = function (v1, v2) {
            if (v1.mode_ !== v2.mode_) {
                return false;
            }
            var comps1 = v1.comps_;
            var comps2 = v2.comps_;
            for (var i = 0; i < comps1.length; i++) {
                if (comps1[i] !== comps2[i]) {
                    return false;
                }
            }
            return true;
        };
        Object.defineProperty(Color.prototype, "mode", {
            get: function () {
                return this.mode_;
            },
            enumerable: false,
            configurable: true
        });
        Color.prototype.getComponents = function (opt_mode) {
            return appendAlphaComponent(convertColorMode(removeAlphaComponent(this.comps_), this.mode_, opt_mode || this.mode_), this.comps_[3]);
        };
        Color.prototype.toRgbaObject = function () {
            var rgbComps = this.getComponents('rgb');
            return {
                r: rgbComps[0],
                g: rgbComps[1],
                b: rgbComps[2],
                a: rgbComps[3],
            };
        };
        return Color;
    }());

    function parseCssNumberOrPercentage(text, maxValue) {
        var m = text.match(/^(.+)%$/);
        if (!m) {
            return Math.min(parseFloat(text), maxValue);
        }
        return Math.min(parseFloat(m[1]) * 0.01 * maxValue, maxValue);
    }
    var ANGLE_TO_DEG_MAP = {
        deg: function (angle) { return angle; },
        grad: function (angle) { return (angle * 360) / 400; },
        rad: function (angle) { return (angle * 360) / (2 * Math.PI); },
        turn: function (angle) { return angle * 360; },
    };
    function parseCssNumberOrAngle(text) {
        var m = text.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);
        if (!m) {
            return parseFloat(text);
        }
        var angle = parseFloat(m[1]);
        var unit = m[2];
        return ANGLE_TO_DEG_MAP[unit](angle);
    }
    var NOTATION_TO_PARSER_MAP = {
        'func.rgb': function (text) {
            var m = text.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
            if (!m) {
                return null;
            }
            var comps = [
                parseCssNumberOrPercentage(m[1], 255),
                parseCssNumberOrPercentage(m[2], 255),
                parseCssNumberOrPercentage(m[3], 255),
            ];
            if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
                return null;
            }
            return new Color(comps, 'rgb');
        },
        'func.rgba': function (text) {
            var m = text.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
            if (!m) {
                return null;
            }
            var comps = [
                parseCssNumberOrPercentage(m[1], 255),
                parseCssNumberOrPercentage(m[2], 255),
                parseCssNumberOrPercentage(m[3], 255),
                parseCssNumberOrPercentage(m[4], 1),
            ];
            if (isNaN(comps[0]) ||
                isNaN(comps[1]) ||
                isNaN(comps[2]) ||
                isNaN(comps[3])) {
                return null;
            }
            return new Color(comps, 'rgb');
        },
        'func.hsl': function (text) {
            var m = text.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
            if (!m) {
                return null;
            }
            var comps = [
                parseCssNumberOrAngle(m[1]),
                parseCssNumberOrPercentage(m[2], 100),
                parseCssNumberOrPercentage(m[3], 100),
            ];
            if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
                return null;
            }
            return new Color(comps, 'hsl');
        },
        'func.hsla': function (text) {
            var m = text.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
            if (!m) {
                return null;
            }
            var comps = [
                parseCssNumberOrAngle(m[1]),
                parseCssNumberOrPercentage(m[2], 100),
                parseCssNumberOrPercentage(m[3], 100),
                parseCssNumberOrPercentage(m[4], 1),
            ];
            if (isNaN(comps[0]) ||
                isNaN(comps[1]) ||
                isNaN(comps[2]) ||
                isNaN(comps[3])) {
                return null;
            }
            return new Color(comps, 'hsl');
        },
        'hex.rgb': function (text) {
            var mRrggbb = text.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
            if (mRrggbb) {
                return new Color([
                    parseInt(mRrggbb[1] + mRrggbb[1], 16),
                    parseInt(mRrggbb[2] + mRrggbb[2], 16),
                    parseInt(mRrggbb[3] + mRrggbb[3], 16),
                ], 'rgb');
            }
            var mRgb = text.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
            if (mRgb) {
                return new Color([parseInt(mRgb[1], 16), parseInt(mRgb[2], 16), parseInt(mRgb[3], 16)], 'rgb');
            }
            return null;
        },
        'hex.rgba': function (text) {
            var mRrggbb = text.match(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
            if (mRrggbb) {
                return new Color([
                    parseInt(mRrggbb[1] + mRrggbb[1], 16),
                    parseInt(mRrggbb[2] + mRrggbb[2], 16),
                    parseInt(mRrggbb[3] + mRrggbb[3], 16),
                    mapRange(parseInt(mRrggbb[4] + mRrggbb[4], 16), 0, 255, 0, 1),
                ], 'rgb');
            }
            var mRgb = text.match(/^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
            if (mRgb) {
                return new Color([
                    parseInt(mRgb[1], 16),
                    parseInt(mRgb[2], 16),
                    parseInt(mRgb[3], 16),
                    mapRange(parseInt(mRgb[4], 16), 0, 255, 0, 1),
                ], 'rgb');
            }
            return null;
        },
    };
    /**
     * @hidden
     */
    function getColorNotation(text) {
        var notations = Object.keys(NOTATION_TO_PARSER_MAP);
        return notations.reduce(function (result, notation) {
            if (result) {
                return result;
            }
            var subparser = NOTATION_TO_PARSER_MAP[notation];
            return subparser(text) ? notation : null;
        }, null);
    }
    /**
     * @hidden
     */
    var CompositeColorParser = function (text) {
        var notation = getColorNotation(text);
        return notation ? NOTATION_TO_PARSER_MAP[notation](text) : null;
    };
    function hasAlphaComponent(notation) {
        return (notation === 'func.hsla' ||
            notation === 'func.rgba' ||
            notation === 'hex.rgba');
    }
    /**
     * @hidden
     */
    function colorFromString(value) {
        if (typeof value === 'string') {
            var cv = CompositeColorParser(value);
            if (cv) {
                return cv;
            }
        }
        return Color.black();
    }
    function zerofill(comp) {
        var hex = constrainRange(Math.floor(comp), 0, 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    /**
     * @hidden
     */
    function colorToHexRgbString(value) {
        var hexes = removeAlphaComponent(value.getComponents('rgb'))
            .map(zerofill)
            .join('');
        return "#" + hexes;
    }
    /**
     * @hidden
     */
    function colorToHexRgbaString(value) {
        var rgbaComps = value.getComponents('rgb');
        var hexes = [rgbaComps[0], rgbaComps[1], rgbaComps[2], rgbaComps[3] * 255]
            .map(zerofill)
            .join('');
        return "#" + hexes;
    }
    /**
     * @hidden
     */
    function colorToFunctionalRgbString(value) {
        var formatter = createNumberFormatter(0);
        var comps = removeAlphaComponent(value.getComponents('rgb')).map(function (comp) {
            return formatter(comp);
        });
        return "rgb(" + comps.join(', ') + ")";
    }
    /**
     * @hidden
     */
    function colorToFunctionalRgbaString(value) {
        var aFormatter = createNumberFormatter(2);
        var rgbFormatter = createNumberFormatter(0);
        var comps = value.getComponents('rgb').map(function (comp, index) {
            var formatter = index === 3 ? aFormatter : rgbFormatter;
            return formatter(comp);
        });
        return "rgba(" + comps.join(', ') + ")";
    }
    /**
     * @hidden
     */
    function colorToFunctionalHslString(value) {
        var formatters = [
            createNumberFormatter(0),
            formatPercentage,
            formatPercentage,
        ];
        var comps = removeAlphaComponent(value.getComponents('hsl')).map(function (comp, index) { return formatters[index](comp); });
        return "hsl(" + comps.join(', ') + ")";
    }
    /**
     * @hidden
     */
    function colorToFunctionalHslaString(value) {
        var formatters = [
            createNumberFormatter(0),
            formatPercentage,
            formatPercentage,
            createNumberFormatter(2),
        ];
        var comps = value
            .getComponents('hsl')
            .map(function (comp, index) { return formatters[index](comp); });
        return "hsla(" + comps.join(', ') + ")";
    }
    var NOTATION_TO_STRINGIFIER_MAP = {
        'func.hsl': colorToFunctionalHslString,
        'func.hsla': colorToFunctionalHslaString,
        'func.rgb': colorToFunctionalRgbString,
        'func.rgba': colorToFunctionalRgbaString,
        'hex.rgb': colorToHexRgbString,
        'hex.rgba': colorToHexRgbaString,
    };
    function getColorStringifier(notation) {
        return NOTATION_TO_STRINGIFIER_MAP[notation];
    }

    var className$e = ClassName('clsw');
    /**
     * @hidden
     */
    var ColorSwatchView = /** @class */ (function () {
        function ColorSwatchView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.element = doc.createElement('div');
            this.element.classList.add(className$e());
            var swatchElem = doc.createElement('div');
            swatchElem.classList.add(className$e('sw'));
            this.element.appendChild(swatchElem);
            this.swatchElem_ = swatchElem;
            var buttonElem = doc.createElement('button');
            buttonElem.classList.add(className$e('b'));
            this.element.appendChild(buttonElem);
            this.buttonElement = buttonElem;
            var pickerElem = doc.createElement('div');
            pickerElem.classList.add(className$e('p'));
            this.pickerView_ = config.pickerView;
            pickerElem.appendChild(this.pickerView_.element);
            this.element.appendChild(pickerElem);
            this.update();
        }
        ColorSwatchView.prototype.update = function () {
            var value = this.value.rawValue;
            this.swatchElem_.style.backgroundColor = colorToHexRgbaString(value);
        };
        ColorSwatchView.prototype.onValueChange_ = function () {
            this.update();
        };
        return ColorSwatchView;
    }());

    /**
     * @hidden
     */
    var Foldable = /** @class */ (function () {
        function Foldable() {
            this.emitter = new Emitter();
            this.expanded_ = false;
        }
        Object.defineProperty(Foldable.prototype, "expanded", {
            get: function () {
                return this.expanded_;
            },
            set: function (expanded) {
                var changed = this.expanded_ !== expanded;
                if (changed) {
                    this.expanded_ = expanded;
                    this.emitter.emit('change', {
                        sender: this,
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        return Foldable;
    }());

    /**
     * @hidden
     */
    function connect(_a) {
        var primary = _a.primary, secondary = _a.secondary, forward = _a.forward, backward = _a.backward;
        primary.emitter.on('change', function () {
            secondary.rawValue = forward(primary, secondary);
        });
        secondary.emitter.on('change', function () {
            primary.rawValue = backward(primary, secondary);
        });
        secondary.rawValue = forward(primary, secondary);
    }

    /**
     * @hidden
     */
    function getStepForKey(baseStep, keys) {
        var step = baseStep * (keys.altKey ? 0.1 : 1) * (keys.shiftKey ? 10 : 1);
        if (keys.upKey) {
            return +step;
        }
        else if (keys.downKey) {
            return -step;
        }
        return 0;
    }
    /**
     * @hidden
     */
    function getVerticalStepKeys(ev) {
        return {
            altKey: ev.altKey,
            downKey: ev.keyCode === 40,
            shiftKey: ev.shiftKey,
            upKey: ev.keyCode === 38,
        };
    }
    /**
     * @hidden
     */
    function getHorizontalStepKeys(ev) {
        return {
            altKey: ev.altKey,
            downKey: ev.keyCode === 37,
            shiftKey: ev.shiftKey,
            upKey: ev.keyCode === 39,
        };
    }
    /**
     * @hidden
     */
    function isVerticalArrowKey(keyCode) {
        return keyCode === 38 || keyCode === 40;
    }
    /**
     * @hidden
     */
    function isArrowKey(keyCode) {
        return isVerticalArrowKey(keyCode) || keyCode === 37 || keyCode === 39;
    }

    /**
     * @hidden
     */
    var NumberTextController = /** @class */ (function (_super) {
        __extends(NumberTextController, _super);
        function NumberTextController(doc, config) {
            var _this = _super.call(this, doc, config) || this;
            _this.onInputKeyDown_ = _this.onInputKeyDown_.bind(_this);
            _this.baseStep_ = config.baseStep;
            _this.view.inputElement.addEventListener('keydown', _this.onInputKeyDown_);
            return _this;
        }
        NumberTextController.prototype.onInputKeyDown_ = function (e) {
            var step = getStepForKey(this.baseStep_, getVerticalStepKeys(e));
            if (step !== 0) {
                this.value.rawValue += step;
                this.view.update();
            }
        };
        return NumberTextController;
    }(TextController));

    var className$d = ClassName('clp');
    /**
     * @hidden
     */
    var ColorPickerView = /** @class */ (function () {
        function ColorPickerView(doc, config) {
            this.alphaViews_ = null;
            this.onFoldableChange_ = this.onFoldableChange_.bind(this);
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.pickedColor = config.pickedColor;
            this.pickedColor.value.emitter.on('change', this.onValueChange_);
            this.foldable = config.foldable;
            this.foldable.emitter.on('change', this.onFoldableChange_);
            this.element = doc.createElement('div');
            this.element.classList.add(className$d());
            var hsvElem = doc.createElement('div');
            hsvElem.classList.add(className$d('hsv'));
            var svElem = doc.createElement('div');
            svElem.classList.add(className$d('sv'));
            this.svPaletteView_ = config.svPaletteView;
            svElem.appendChild(this.svPaletteView_.element);
            hsvElem.appendChild(svElem);
            var hElem = doc.createElement('div');
            hElem.classList.add(className$d('h'));
            this.hPaletteView_ = config.hPaletteView;
            hElem.appendChild(this.hPaletteView_.element);
            hsvElem.appendChild(hElem);
            this.element.appendChild(hsvElem);
            var rgbElem = doc.createElement('div');
            rgbElem.classList.add(className$d('rgb'));
            this.textView_ = config.textView;
            rgbElem.appendChild(this.textView_.element);
            this.element.appendChild(rgbElem);
            if (config.alphaViews) {
                this.alphaViews_ = {
                    palette: config.alphaViews.palette,
                    text: config.alphaViews.text,
                };
                var aElem = doc.createElement('div');
                aElem.classList.add(className$d('a'));
                var apElem = doc.createElement('div');
                apElem.classList.add(className$d('ap'));
                apElem.appendChild(this.alphaViews_.palette.element);
                aElem.appendChild(apElem);
                var atElem = doc.createElement('div');
                atElem.classList.add(className$d('at'));
                atElem.appendChild(this.alphaViews_.text.element);
                aElem.appendChild(atElem);
                this.element.appendChild(aElem);
            }
            this.update();
        }
        Object.defineProperty(ColorPickerView.prototype, "allFocusableElements", {
            get: function () {
                var elems = __spreadArrays([
                    this.svPaletteView_.element,
                    this.hPaletteView_.element
                ], this.textView_.inputElements);
                if (this.alphaViews_) {
                    elems.push(this.alphaViews_.palette.element, this.alphaViews_.text.inputElement);
                }
                return forceCast(elems);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ColorPickerView.prototype, "value", {
            get: function () {
                return this.pickedColor.value;
            },
            enumerable: false,
            configurable: true
        });
        ColorPickerView.prototype.update = function () {
            if (this.foldable.expanded) {
                this.element.classList.add(className$d(undefined, 'expanded'));
            }
            else {
                this.element.classList.remove(className$d(undefined, 'expanded'));
            }
        };
        ColorPickerView.prototype.onValueChange_ = function () {
            this.update();
        };
        ColorPickerView.prototype.onFoldableChange_ = function () {
            this.update();
        };
        return ColorPickerView;
    }());

    function computeOffset(ev, elem) {
        // NOTE: OffsetX/Y should be computed from page and window properties to capture mouse events
        var win = elem.ownerDocument.defaultView;
        var rect = elem.getBoundingClientRect();
        return [
            ev.pageX - (((win && win.scrollX) || 0) + rect.left),
            ev.pageY - (((win && win.scrollY) || 0) + rect.top),
        ];
    }
    /**
     * A utility class to handle both mouse and touch events.
     */
    var PointerHandler = /** @class */ (function () {
        function PointerHandler(element) {
            this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this);
            this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this);
            this.onMouseDown_ = this.onMouseDown_.bind(this);
            this.onTouchMove_ = this.onTouchMove_.bind(this);
            this.onTouchStart_ = this.onTouchStart_.bind(this);
            this.element = element;
            this.emitter = new Emitter();
            this.pressed_ = false;
            var doc = this.element.ownerDocument;
            if (supportsTouch(doc)) {
                element.addEventListener('touchstart', this.onTouchStart_);
                element.addEventListener('touchmove', this.onTouchMove_);
            }
            else {
                element.addEventListener('mousedown', this.onMouseDown_);
                doc.addEventListener('mousemove', this.onDocumentMouseMove_);
                doc.addEventListener('mouseup', this.onDocumentMouseUp_);
            }
        }
        PointerHandler.prototype.computePosition_ = function (offsetX, offsetY) {
            var rect = this.element.getBoundingClientRect();
            return {
                bounds: {
                    width: rect.width,
                    height: rect.height,
                },
                x: offsetX,
                y: offsetY,
            };
        };
        PointerHandler.prototype.onMouseDown_ = function (e) {
            var _a;
            // Prevent native text selection
            e.preventDefault();
            (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.focus();
            this.pressed_ = true;
            this.emitter.emit('down', {
                data: this.computePosition_.apply(this, computeOffset(e, this.element)),
                sender: this,
            });
        };
        PointerHandler.prototype.onDocumentMouseMove_ = function (e) {
            if (!this.pressed_) {
                return;
            }
            this.emitter.emit('move', {
                data: this.computePosition_.apply(this, computeOffset(e, this.element)),
                sender: this,
            });
        };
        PointerHandler.prototype.onDocumentMouseUp_ = function (e) {
            if (!this.pressed_) {
                return;
            }
            this.pressed_ = false;
            this.emitter.emit('up', {
                data: this.computePosition_.apply(this, computeOffset(e, this.element)),
                sender: this,
            });
        };
        PointerHandler.prototype.onTouchStart_ = function (e) {
            // Prevent native page scroll
            e.preventDefault();
            var touch = e.targetTouches[0];
            var rect = this.element.getBoundingClientRect();
            this.emitter.emit('down', {
                data: this.computePosition_(touch.clientX - rect.left, touch.clientY - rect.top),
                sender: this,
            });
        };
        PointerHandler.prototype.onTouchMove_ = function (e) {
            var touch = e.targetTouches[0];
            var rect = this.element.getBoundingClientRect();
            this.emitter.emit('move', {
                data: this.computePosition_(touch.clientX - rect.left, touch.clientY - rect.top),
                sender: this,
            });
        };
        return PointerHandler;
    }());

    /**
     * @hidden
     */
    function getBaseStepForColor(forAlpha) {
        return forAlpha ? 0.1 : 1;
    }

    var className$c = ClassName('apl');
    /**
     * @hidden
     */
    var APaletteView = /** @class */ (function () {
        function APaletteView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.value = config.value;
            this.value.emitter.on('change', this.onValueChange_);
            this.element = doc.createElement('div');
            this.element.classList.add(className$c());
            this.element.tabIndex = 0;
            var barElem = doc.createElement('div');
            barElem.classList.add(className$c('b'));
            this.element.appendChild(barElem);
            var colorElem = doc.createElement('div');
            colorElem.classList.add(className$c('c'));
            barElem.appendChild(colorElem);
            this.colorElem_ = colorElem;
            var markerElem = doc.createElement('div');
            markerElem.classList.add(className$c('m'));
            this.element.appendChild(markerElem);
            this.markerElem_ = markerElem;
            var previewElem = doc.createElement('div');
            previewElem.classList.add(className$c('p'));
            this.markerElem_.appendChild(previewElem);
            this.previewElem_ = previewElem;
            this.update();
        }
        APaletteView.prototype.update = function () {
            var c = this.value.rawValue;
            var rgbaComps = c.getComponents('rgb');
            var leftColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 0], 'rgb');
            var rightColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 255], 'rgb');
            var gradientComps = [
                'to right',
                colorToFunctionalRgbaString(leftColor),
                colorToFunctionalRgbaString(rightColor),
            ];
            this.colorElem_.style.background = "linear-gradient(" + gradientComps.join(',') + ")";
            this.previewElem_.style.backgroundColor = colorToFunctionalRgbaString(c);
            var left = mapRange(rgbaComps[3], 0, 1, 0, 100);
            this.markerElem_.style.left = left + "%";
        };
        APaletteView.prototype.onValueChange_ = function () {
            this.update();
        };
        return APaletteView;
    }());

    /**
     * @hidden
     */
    var APaletteController = /** @class */ (function () {
        function APaletteController(doc, config) {
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.view = new APaletteView(doc, {
                value: this.value,
            });
            this.ptHandler_ = new PointerHandler(this.view.element);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.element.addEventListener('keydown', this.onKeyDown_);
        }
        APaletteController.prototype.handlePointerEvent_ = function (d) {
            var alpha = d.x / d.bounds.width;
            var c = this.value.rawValue;
            var _a = c.getComponents('hsv'), h = _a[0], s = _a[1], v = _a[2];
            this.value.rawValue = new Color([h, s, v, alpha], 'hsv');
            this.view.update();
        };
        APaletteController.prototype.onPointerDown_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        APaletteController.prototype.onPointerMove_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        APaletteController.prototype.onPointerUp_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        APaletteController.prototype.onKeyDown_ = function (ev) {
            var step = getStepForKey(getBaseStepForColor(true), getHorizontalStepKeys(ev));
            var c = this.value.rawValue;
            var _a = c.getComponents('hsv'), h = _a[0], s = _a[1], v = _a[2], a = _a[3];
            this.value.rawValue = new Color([h, s, v, a + step], 'hsv');
        };
        return APaletteController;
    }());

    var className$b = ClassName('cltxt');
    var FORMATTER = createNumberFormatter(0);
    function createModeSelectElement(doc) {
        var selectElem = doc.createElement('select');
        var items = [
            { text: 'RGB', value: 'rgb' },
            { text: 'HSL', value: 'hsl' },
            { text: 'HSV', value: 'hsv' },
        ];
        selectElem.appendChild(items.reduce(function (frag, item) {
            var optElem = doc.createElement('option');
            optElem.textContent = item.text;
            optElem.value = item.value;
            frag.appendChild(optElem);
            return frag;
        }, doc.createDocumentFragment()));
        return selectElem;
    }
    /**
     * @hidden
     */
    var ColorTextView = /** @class */ (function () {
        function ColorTextView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.element = doc.createElement('div');
            this.element.classList.add(className$b());
            var modeElem = doc.createElement('div');
            modeElem.classList.add(className$b('m'));
            this.modeElem_ = createModeSelectElement(doc);
            this.modeElem_.classList.add(className$b('ms'));
            modeElem.appendChild(this.modeSelectElement);
            var modeMarkerElem = doc.createElement('div');
            modeMarkerElem.classList.add(className$b('mm'));
            modeMarkerElem.appendChild(createSvgIconElement(doc, 'dropdown'));
            modeElem.appendChild(modeMarkerElem);
            this.element.appendChild(modeElem);
            var wrapperElem = doc.createElement('div');
            wrapperElem.classList.add(className$b('w'));
            this.element.appendChild(wrapperElem);
            var inputElems = [0, 1, 2].map(function () {
                var inputElem = doc.createElement('input');
                inputElem.classList.add(className$b('i'));
                inputElem.type = 'text';
                return inputElem;
            });
            inputElems.forEach(function (elem) {
                wrapperElem.appendChild(elem);
            });
            this.inputElems_ = [inputElems[0], inputElems[1], inputElems[2]];
            this.pickedColor = config.pickedColor;
            this.pickedColor.emitter.on('change', this.onValueChange_);
            this.update();
        }
        Object.defineProperty(ColorTextView.prototype, "modeSelectElement", {
            get: function () {
                return this.modeElem_;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ColorTextView.prototype, "inputElements", {
            get: function () {
                return this.inputElems_;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ColorTextView.prototype, "value", {
            get: function () {
                return this.pickedColor.value;
            },
            enumerable: false,
            configurable: true
        });
        ColorTextView.prototype.update = function () {
            var _this = this;
            this.modeElem_.value = this.pickedColor.mode;
            var comps = this.pickedColor.value.rawValue.getComponents(this.pickedColor.mode);
            comps.forEach(function (comp, index) {
                var inputElem = _this.inputElems_[index];
                if (!inputElem) {
                    return;
                }
                inputElem.value = FORMATTER(comp);
            });
        };
        ColorTextView.prototype.onValueChange_ = function () {
            this.update();
        };
        return ColorTextView;
    }());

    /**
     * @hidden
     */
    var ColorTextController = /** @class */ (function () {
        function ColorTextController(doc, config) {
            var _this = this;
            this.onModeSelectChange_ = this.onModeSelectChange_.bind(this);
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
            this.parser_ = config.parser;
            this.pickedColor = config.pickedColor;
            this.view = new ColorTextView(doc, {
                pickedColor: this.pickedColor,
            });
            this.view.inputElements.forEach(function (inputElem) {
                inputElem.addEventListener('change', _this.onInputChange_);
                inputElem.addEventListener('keydown', _this.onInputKeyDown_);
            });
            this.view.modeSelectElement.addEventListener('change', this.onModeSelectChange_);
        }
        Object.defineProperty(ColorTextController.prototype, "value", {
            get: function () {
                return this.pickedColor.value;
            },
            enumerable: false,
            configurable: true
        });
        ColorTextController.prototype.findIndexOfInputElem_ = function (inputElem) {
            var inputElems = this.view.inputElements;
            for (var i = 0; i < inputElems.length; i++) {
                if (inputElems[i] === inputElem) {
                    return i;
                }
            }
            return null;
        };
        ColorTextController.prototype.updateComponent_ = function (index, newValue) {
            var mode = this.pickedColor.mode;
            var comps = this.value.rawValue.getComponents(mode);
            var newComps = comps.map(function (comp, i) {
                return i === index ? newValue : comp;
            });
            this.value.rawValue = new Color(newComps, mode);
            this.view.update();
        };
        ColorTextController.prototype.onInputChange_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            var compIndex = this.findIndexOfInputElem_(inputElem);
            if (isEmpty(compIndex)) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue);
        };
        ColorTextController.prototype.onInputKeyDown_ = function (e) {
            var compIndex = this.findIndexOfInputElem_(e.currentTarget);
            var step = getStepForKey(getBaseStepForColor(compIndex === 3), getVerticalStepKeys(e));
            if (step === 0) {
                return;
            }
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            if (isEmpty(compIndex)) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue + step);
        };
        ColorTextController.prototype.onModeSelectChange_ = function (ev) {
            var selectElem = ev.currentTarget;
            this.pickedColor.mode = selectElem.value;
        };
        return ColorTextController;
    }());

    var className$a = ClassName('hpl');
    /**
     * @hidden
     */
    var HPaletteView = /** @class */ (function () {
        function HPaletteView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.value = config.value;
            this.value.emitter.on('change', this.onValueChange_);
            this.element = doc.createElement('div');
            this.element.classList.add(className$a());
            this.element.tabIndex = 0;
            var colorElem = doc.createElement('div');
            colorElem.classList.add(className$a('c'));
            this.element.appendChild(colorElem);
            var markerElem = doc.createElement('div');
            markerElem.classList.add(className$a('m'));
            this.element.appendChild(markerElem);
            this.markerElem_ = markerElem;
            this.update();
        }
        HPaletteView.prototype.update = function () {
            var c = this.value.rawValue;
            var h = c.getComponents('hsv')[0];
            this.markerElem_.style.backgroundColor = colorToFunctionalRgbString(new Color([h, 100, 100], 'hsv'));
            var left = mapRange(h, 0, 360, 0, 100);
            this.markerElem_.style.left = left + "%";
        };
        HPaletteView.prototype.onValueChange_ = function () {
            this.update();
        };
        return HPaletteView;
    }());

    /**
     * @hidden
     */
    var HPaletteController = /** @class */ (function () {
        function HPaletteController(doc, config) {
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.view = new HPaletteView(doc, {
                value: this.value,
            });
            this.ptHandler_ = new PointerHandler(this.view.element);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.element.addEventListener('keydown', this.onKeyDown_);
        }
        HPaletteController.prototype.handlePointerEvent_ = function (d) {
            var hue = mapRange(d.x, 0, d.bounds.width, 0, 360);
            var c = this.value.rawValue;
            var _a = c.getComponents('hsv'), s = _a[1], v = _a[2], a = _a[3];
            this.value.rawValue = new Color([hue, s, v, a], 'hsv');
            this.view.update();
        };
        HPaletteController.prototype.onPointerDown_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        HPaletteController.prototype.onPointerMove_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        HPaletteController.prototype.onPointerUp_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        HPaletteController.prototype.onKeyDown_ = function (ev) {
            var step = getStepForKey(getBaseStepForColor(false), getHorizontalStepKeys(ev));
            var c = this.value.rawValue;
            var _a = c.getComponents('hsv'), h = _a[0], s = _a[1], v = _a[2], a = _a[3];
            this.value.rawValue = new Color([h + step, s, v, a], 'hsv');
        };
        return HPaletteController;
    }());

    var className$9 = ClassName('svp');
    var CANVAS_RESOL = 64;
    /**
     * @hidden
     */
    var SvPaletteView = /** @class */ (function () {
        function SvPaletteView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.value = config.value;
            this.value.emitter.on('change', this.onValueChange_);
            this.element = doc.createElement('div');
            this.element.classList.add(className$9());
            this.element.tabIndex = 0;
            var canvasElem = doc.createElement('canvas');
            canvasElem.height = CANVAS_RESOL;
            canvasElem.width = CANVAS_RESOL;
            canvasElem.classList.add(className$9('c'));
            this.element.appendChild(canvasElem);
            this.canvasElement = canvasElem;
            var markerElem = doc.createElement('div');
            markerElem.classList.add(className$9('m'));
            this.element.appendChild(markerElem);
            this.markerElem_ = markerElem;
            this.update();
        }
        SvPaletteView.prototype.update = function () {
            var ctx = getCanvasContext(this.canvasElement);
            if (!ctx) {
                return;
            }
            var c = this.value.rawValue;
            var hsvComps = c.getComponents('hsv');
            var width = this.canvasElement.width;
            var height = this.canvasElement.height;
            var imgData = ctx.getImageData(0, 0, width, height);
            var data = imgData.data;
            for (var iy = 0; iy < height; iy++) {
                for (var ix = 0; ix < width; ix++) {
                    var s = mapRange(ix, 0, width, 0, 100);
                    var v = mapRange(iy, 0, height, 100, 0);
                    var rgbComps = hsvToRgb(hsvComps[0], s, v);
                    var i = (iy * width + ix) * 4;
                    data[i] = rgbComps[0];
                    data[i + 1] = rgbComps[1];
                    data[i + 2] = rgbComps[2];
                    data[i + 3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
            var left = mapRange(hsvComps[1], 0, 100, 0, 100);
            this.markerElem_.style.left = left + "%";
            var top = mapRange(hsvComps[2], 0, 100, 100, 0);
            this.markerElem_.style.top = top + "%";
        };
        SvPaletteView.prototype.onValueChange_ = function () {
            this.update();
        };
        return SvPaletteView;
    }());

    /**
     * @hidden
     */
    var SvPaletteController = /** @class */ (function () {
        function SvPaletteController(doc, config) {
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.view = new SvPaletteView(doc, {
                value: this.value,
            });
            this.ptHandler_ = new PointerHandler(this.view.element);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.element.addEventListener('keydown', this.onKeyDown_);
        }
        SvPaletteController.prototype.handlePointerEvent_ = function (d) {
            var saturation = mapRange(d.x, 0, d.bounds.width, 0, 100);
            var value = mapRange(d.y, 0, d.bounds.height, 100, 0);
            var _a = this.value.rawValue.getComponents('hsv'), h = _a[0], a = _a[3];
            this.value.rawValue = new Color([h, saturation, value, a], 'hsv');
            this.view.update();
        };
        SvPaletteController.prototype.onPointerDown_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SvPaletteController.prototype.onPointerMove_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SvPaletteController.prototype.onPointerUp_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SvPaletteController.prototype.onKeyDown_ = function (ev) {
            if (isArrowKey(ev.keyCode)) {
                ev.preventDefault();
            }
            var _a = this.value.rawValue.getComponents('hsv'), h = _a[0], s = _a[1], v = _a[2], a = _a[3];
            var baseStep = getBaseStepForColor(false);
            this.value.rawValue = new Color([
                h,
                s + getStepForKey(baseStep, getHorizontalStepKeys(ev)),
                v + getStepForKey(baseStep, getVerticalStepKeys(ev)),
                a,
            ], 'hsv');
        };
        return SvPaletteController;
    }());

    /**
     * @hidden
     */
    var ColorPickerController = /** @class */ (function () {
        function ColorPickerController(doc, config) {
            var _this = this;
            this.triggerElement = null;
            this.onFocusableElementBlur_ = this.onFocusableElementBlur_.bind(this);
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.pickedColor = config.pickedColor;
            this.foldable = new Foldable();
            this.hPaletteIc_ = new HPaletteController(doc, {
                value: this.pickedColor.value,
            });
            this.svPaletteIc_ = new SvPaletteController(doc, {
                value: this.pickedColor.value,
            });
            this.alphaIcs_ = config.supportsAlpha
                ? {
                    palette: new APaletteController(doc, {
                        value: this.pickedColor.value,
                    }),
                    text: new NumberTextController(doc, {
                        formatter: createNumberFormatter(2),
                        parser: parseNumber,
                        baseStep: 0.1,
                        value: new Value(0),
                    }),
                }
                : null;
            if (this.alphaIcs_) {
                connect({
                    primary: this.pickedColor.value,
                    secondary: this.alphaIcs_.text.value,
                    forward: function (p) {
                        return p.rawValue.getComponents()[3];
                    },
                    backward: function (p, s) {
                        var comps = p.rawValue.getComponents();
                        comps[3] = s.rawValue;
                        return new Color(comps, p.rawValue.mode);
                    },
                });
            }
            this.textIc_ = new ColorTextController(doc, {
                parser: parseNumber,
                pickedColor: this.pickedColor,
            });
            this.view = new ColorPickerView(doc, {
                alphaViews: this.alphaIcs_
                    ? {
                        palette: this.alphaIcs_.palette.view,
                        text: this.alphaIcs_.text.view,
                    }
                    : null,
                foldable: this.foldable,
                hPaletteView: this.hPaletteIc_.view,
                pickedColor: this.pickedColor,
                supportsAlpha: config.supportsAlpha,
                svPaletteView: this.svPaletteIc_.view,
                textView: this.textIc_.view,
            });
            this.view.element.addEventListener('keydown', this.onKeyDown_);
            this.view.allFocusableElements.forEach(function (elem) {
                elem.addEventListener('blur', _this.onFocusableElementBlur_);
            });
        }
        Object.defineProperty(ColorPickerController.prototype, "value", {
            get: function () {
                return this.pickedColor.value;
            },
            enumerable: false,
            configurable: true
        });
        ColorPickerController.prototype.onFocusableElementBlur_ = function (ev) {
            var elem = this.view.element;
            var nextTarget = findNextTarget(ev);
            if (nextTarget && elem.contains(nextTarget)) {
                // Next target is in the picker
                return;
            }
            if (nextTarget &&
                nextTarget === this.triggerElement &&
                !supportsTouch(elem.ownerDocument)) {
                // Next target is the trigger button
                return;
            }
            this.foldable.expanded = false;
        };
        ColorPickerController.prototype.onKeyDown_ = function (ev) {
            if (ev.keyCode === 27) {
                this.foldable.expanded = false;
            }
        };
        return ColorPickerController;
    }());

    /**
     * @hidden
     */
    var ColorSwatchController = /** @class */ (function () {
        function ColorSwatchController(doc, config) {
            this.onButtonBlur_ = this.onButtonBlur_.bind(this);
            this.onButtonClick_ = this.onButtonClick_.bind(this);
            this.value = config.value;
            this.pickerIc_ = new ColorPickerController(doc, {
                pickedColor: new PickedColor(this.value),
                supportsAlpha: config.supportsAlpha,
            });
            this.view = new ColorSwatchView(doc, {
                pickerView: this.pickerIc_.view,
                value: this.value,
            });
            this.view.buttonElement.addEventListener('blur', this.onButtonBlur_);
            this.view.buttonElement.addEventListener('click', this.onButtonClick_);
            this.pickerIc_.triggerElement = this.view.buttonElement;
        }
        ColorSwatchController.prototype.onButtonBlur_ = function (e) {
            var elem = this.view.element;
            var nextTarget = forceCast(e.relatedTarget);
            if (!nextTarget || !elem.contains(nextTarget)) {
                this.pickerIc_.foldable.expanded = false;
            }
        };
        ColorSwatchController.prototype.onButtonClick_ = function () {
            this.pickerIc_.foldable.expanded = !this.pickerIc_.foldable.expanded;
            if (this.pickerIc_.foldable.expanded) {
                this.pickerIc_.view.allFocusableElements[0].focus();
            }
        };
        return ColorSwatchController;
    }());

    /**
     * @hidden
     */
    var ColorSwatchTextController = /** @class */ (function () {
        function ColorSwatchTextController(doc, config) {
            this.value = config.value;
            this.swatchIc_ = new ColorSwatchController(doc, {
                supportsAlpha: config.supportsAlpha,
                value: this.value,
            });
            this.textIc_ = new TextController(doc, {
                formatter: config.formatter,
                parser: config.parser,
                value: this.value,
            });
            this.view = new ColorSwatchTextView(doc, {
                swatchView: this.swatchIc_.view,
                textView: this.textIc_.view,
            });
        }
        return ColorSwatchTextController;
    }());

    /**
     * @hidden
     */
    function colorFromObject(value) {
        if (Color.isColorObject(value)) {
            return Color.fromObject(value);
        }
        return Color.black();
    }
    /**
     * @hidden
     */
    function colorToRgbNumber(value) {
        return removeAlphaComponent(value.getComponents('rgb')).reduce(function (result, comp) {
            return (result << 8) | (Math.floor(comp) & 0xff);
        }, 0);
    }
    /**
     * @hidden
     */
    function colorToRgbaNumber(value) {
        return (value.getComponents('rgb').reduce(function (result, comp, index) {
            var hex = Math.floor(index === 3 ? comp * 255 : comp) & 0xff;
            return (result << 8) | hex;
        }, 0) >>> 0);
    }
    /**
     * @hidden
     */
    function numberToRgbColor(num) {
        return new Color([(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff], 'rgb');
    }
    /**
     * @hidden
     */
    function numberToRgbaColor(num) {
        return new Color([
            (num >> 24) & 0xff,
            (num >> 16) & 0xff,
            (num >> 8) & 0xff,
            mapRange(num & 0xff, 0, 255, 0, 1),
        ], 'rgb');
    }
    /**
     * @hidden
     */
    function colorFromRgbNumber(value) {
        if (typeof value !== 'number') {
            return Color.black();
        }
        return numberToRgbColor(value);
    }
    /**
     * @hidden
     */
    function colorFromRgbaNumber(value) {
        if (typeof value !== 'number') {
            return Color.black();
        }
        return numberToRgbaColor(value);
    }

    function createColorStringWriter(notation) {
        var stringify = getColorStringifier(notation);
        return function (target, value) {
            writePrimitive(target, stringify(value));
        };
    }
    function createColorNumberWriter(supportsAlpha) {
        var colorToNumber = supportsAlpha ? colorToRgbaNumber : colorToRgbNumber;
        return function (target, value) {
            writePrimitive(target, colorToNumber(value));
        };
    }
    function writeRgbaColorObject(target, value) {
        var obj = value.toRgbaObject();
        target.writeProperty('r', obj.r);
        target.writeProperty('g', obj.g);
        target.writeProperty('b', obj.b);
        target.writeProperty('a', obj.a);
    }
    function writeRgbColorObject(target, value) {
        var obj = value.toRgbaObject();
        target.writeProperty('r', obj.r);
        target.writeProperty('g', obj.g);
        target.writeProperty('b', obj.b);
    }
    function createColorObjectWriter(supportsAlpha) {
        return supportsAlpha ? writeRgbaColorObject : writeRgbColorObject;
    }

    function shouldSupportAlpha$1(inputParams) {
        return 'input' in inputParams && inputParams.input === 'color.rgba';
    }
    /**
     * @hidden
     */
    var NumberColorInputPlugin = {
        id: 'input-color-number',
        accept: function (value, params) {
            if (typeof value !== 'number') {
                return null;
            }
            if (!('input' in params)) {
                return null;
            }
            if (params.input !== 'color' &&
                params.input !== 'color.rgb' &&
                params.input !== 'color.rgba') {
                return null;
            }
            return value;
        },
        binding: {
            reader: function (args) {
                return shouldSupportAlpha$1(args.params)
                    ? colorFromRgbaNumber
                    : colorFromRgbNumber;
            },
            equals: Color.equals,
            writer: function (args) {
                return createColorNumberWriter(shouldSupportAlpha$1(args.params));
            },
        },
        controller: function (args) {
            var supportsAlpha = shouldSupportAlpha$1(args.params);
            var formatter = supportsAlpha
                ? colorToHexRgbaString
                : colorToHexRgbString;
            return new ColorSwatchTextController(args.document, {
                formatter: formatter,
                parser: CompositeColorParser,
                supportsAlpha: supportsAlpha,
                value: args.value,
            });
        },
    };

    function shouldSupportAlpha(initialValue) {
        return Color.isRgbaColorObject(initialValue);
    }
    /**
     * @hidden
     */
    var ObjectColorInputPlugin = {
        id: 'input-color-object',
        accept: function (value, _params) { return (Color.isColorObject(value) ? value : null); },
        binding: {
            reader: function (_args) { return colorFromObject; },
            equals: Color.equals,
            writer: function (args) {
                return createColorObjectWriter(shouldSupportAlpha(args.initialValue));
            },
        },
        controller: function (args) {
            var supportsAlpha = Color.isRgbaColorObject(args.initialValue);
            var formatter = supportsAlpha
                ? colorToHexRgbaString
                : colorToHexRgbString;
            return new ColorSwatchTextController(args.document, {
                formatter: formatter,
                parser: CompositeColorParser,
                supportsAlpha: supportsAlpha,
                value: args.value,
            });
        },
    };

    /**
     * @hidden
     */
    var StringColorInputPlugin = {
        id: 'input-color-string',
        accept: function (value, params) {
            if (typeof value !== 'string') {
                return null;
            }
            if ('input' in params && params.input === 'string') {
                return null;
            }
            var notation = getColorNotation(value);
            if (!notation) {
                return null;
            }
            return value;
        },
        binding: {
            reader: function (_args) { return colorFromString; },
            equals: Color.equals,
            writer: function (args) {
                var notation = getColorNotation(args.initialValue);
                if (!notation) {
                    throw TpError.shouldNeverHappen();
                }
                return createColorStringWriter(notation);
            },
        },
        controller: function (args) {
            var notation = getColorNotation(args.initialValue);
            if (!notation) {
                throw TpError.shouldNeverHappen();
            }
            var stringifier = getColorStringifier(notation);
            return new ColorSwatchTextController(args.document, {
                formatter: stringifier,
                parser: CompositeColorParser,
                supportsAlpha: hasAlphaComponent(notation),
                value: args.value,
            });
        },
    };

    /**
     * A number range constraint.
     */
    var RangeConstraint = /** @class */ (function () {
        function RangeConstraint(config) {
            this.maxValue = config.max;
            this.minValue = config.min;
        }
        RangeConstraint.prototype.constrain = function (value) {
            var result = value;
            if (!isEmpty(this.minValue)) {
                result = Math.max(result, this.minValue);
            }
            if (!isEmpty(this.maxValue)) {
                result = Math.min(result, this.maxValue);
            }
            return result;
        };
        return RangeConstraint;
    }());

    var className$8 = ClassName('sldtxt');
    /**
     * @hidden
     */
    var SliderTextView = /** @class */ (function () {
        function SliderTextView(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$8());
            var sliderElem = doc.createElement('div');
            sliderElem.classList.add(className$8('s'));
            this.sliderView_ = config.sliderView;
            sliderElem.appendChild(this.sliderView_.element);
            this.element.appendChild(sliderElem);
            var textElem = doc.createElement('div');
            textElem.classList.add(className$8('t'));
            this.textView_ = config.textView;
            textElem.appendChild(this.textView_.element);
            this.element.appendChild(textElem);
        }
        Object.defineProperty(SliderTextView.prototype, "value", {
            get: function () {
                return this.sliderView_.value;
            },
            enumerable: false,
            configurable: true
        });
        SliderTextView.prototype.update = function () {
            this.sliderView_.update();
            this.textView_.update();
        };
        return SliderTextView;
    }());

    var className$7 = ClassName('sld');
    /**
     * @hidden
     */
    var SliderView = /** @class */ (function () {
        function SliderView(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.minValue_ = config.minValue;
            this.maxValue_ = config.maxValue;
            this.element = doc.createElement('div');
            this.element.classList.add(className$7());
            var trackElem = doc.createElement('div');
            trackElem.classList.add(className$7('t'));
            trackElem.tabIndex = 0;
            this.element.appendChild(trackElem);
            this.trackElement = trackElem;
            var knobElem = doc.createElement('div');
            knobElem.classList.add(className$7('k'));
            this.trackElement.appendChild(knobElem);
            this.knobElement = knobElem;
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        SliderView.prototype.update = function () {
            var p = constrainRange(mapRange(this.value.rawValue, this.minValue_, this.maxValue_, 0, 100), 0, 100);
            this.knobElement.style.width = p + "%";
        };
        SliderView.prototype.onValueChange_ = function () {
            this.update();
        };
        return SliderView;
    }());

    function findRange(value) {
        var c = value.constraint
            ? findConstraint(value.constraint, RangeConstraint)
            : null;
        if (!c) {
            return [undefined, undefined];
        }
        return [c.minValue, c.maxValue];
    }
    function estimateSuitableRange(value) {
        var _a = findRange(value), min = _a[0], max = _a[1];
        return [min !== null && min !== void 0 ? min : 0, max !== null && max !== void 0 ? max : 100];
    }
    /**
     * @hidden
     */
    var SliderController = /** @class */ (function () {
        function SliderController(doc, config) {
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.baseStep_ = config.baseStep;
            var _a = estimateSuitableRange(this.value), min = _a[0], max = _a[1];
            this.minValue_ = min;
            this.maxValue_ = max;
            this.view = new SliderView(doc, {
                maxValue: this.maxValue_,
                minValue: this.minValue_,
                value: this.value,
            });
            this.ptHandler_ = new PointerHandler(this.view.trackElement);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.trackElement.addEventListener('keydown', this.onKeyDown_);
        }
        SliderController.prototype.handlePointerEvent_ = function (d) {
            this.value.rawValue = mapRange(d.x, 0, d.bounds.width, this.minValue_, this.maxValue_);
        };
        SliderController.prototype.onPointerDown_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SliderController.prototype.onPointerMove_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SliderController.prototype.onPointerUp_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        SliderController.prototype.onKeyDown_ = function (ev) {
            this.value.rawValue += getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
        };
        return SliderController;
    }());

    /**
     * @hidden
     */
    var SliderTextController = /** @class */ (function () {
        function SliderTextController(doc, config) {
            this.value = config.value;
            this.sliderIc_ = new SliderController(doc, {
                baseStep: config.baseStep,
                value: config.value,
            });
            this.textIc_ = new NumberTextController(doc, {
                baseStep: config.baseStep,
                formatter: config.formatter,
                parser: config.parser,
                value: config.value,
            });
            this.view = new SliderTextView(doc, {
                sliderView: this.sliderIc_.view,
                textView: this.textIc_.view,
            });
        }
        return SliderTextController;
    }());

    /**
     * Tries to create a step constraint.
     * @param params The input parameters object.
     * @return A constraint or null if not found.
     */
    function createStepConstraint(params) {
        if ('step' in params && !isEmpty(params.step)) {
            return new StepConstraint(params.step);
        }
        return null;
    }
    /**
     * Tries to create a range constraint.
     * @param params The input parameters object.
     * @return A constraint or null if not found.
     */
    function createRangeConstraint(params) {
        if (('max' in params && !isEmpty(params.max)) ||
            ('min' in params && !isEmpty(params.min))) {
            return new RangeConstraint({
                max: params.max,
                min: params.min,
            });
        }
        return null;
    }
    function createConstraint$3(params) {
        var constraints = [];
        var sc = createStepConstraint(params);
        if (sc) {
            constraints.push(sc);
        }
        var rc = createRangeConstraint(params);
        if (rc) {
            constraints.push(rc);
        }
        var lc = createListConstraint(params, numberFromUnknown);
        if (lc) {
            constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
    }
    function createController$3(doc, value) {
        var _a;
        var c = value.constraint;
        if (c && findConstraint(c, ListConstraint)) {
            return new ListController(doc, {
                listItems: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : [],
                stringifyValue: numberToString,
                value: value,
            });
        }
        if (c && findConstraint(c, RangeConstraint)) {
            return new SliderTextController(doc, {
                baseStep: getBaseStep(c),
                formatter: createNumberFormatter(getSuitableDecimalDigits(value.constraint, value.rawValue)),
                parser: parseNumber,
                value: value,
            });
        }
        return new NumberTextController(doc, {
            baseStep: getBaseStep(c),
            formatter: createNumberFormatter(getSuitableDecimalDigits(value.constraint, value.rawValue)),
            parser: parseNumber,
            value: value,
        });
    }
    /**
     * @hidden
     */
    var NumberInputPlugin = {
        id: 'input-number',
        accept: function (value) { return (typeof value === 'number' ? value : null); },
        binding: {
            reader: function (_args) { return numberFromUnknown; },
            constraint: function (args) { return createConstraint$3(args.params); },
            equals: equalsPrimitive,
            writer: function (_args) { return writePrimitive; },
        },
        controller: function (args) {
            return createController$3(args.document, args.value);
        },
    };

    var Point2d = /** @class */ (function () {
        function Point2d(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Point2d.prototype.getComponents = function () {
            return [this.x, this.y];
        };
        Point2d.isObject = function (obj) {
            if (isEmpty(obj)) {
                return false;
            }
            var x = obj.x;
            var y = obj.y;
            if (typeof x !== 'number' || typeof y !== 'number') {
                return false;
            }
            return true;
        };
        Point2d.equals = function (v1, v2) {
            return v1.x === v2.x && v1.y === v2.y;
        };
        Point2d.prototype.toObject = function () {
            return {
                x: this.x,
                y: this.y,
            };
        };
        return Point2d;
    }());

    /**
     * @hidden
     */
    var Point2dConstraint = /** @class */ (function () {
        function Point2dConstraint(config) {
            this.x = config.x;
            this.y = config.y;
        }
        Point2dConstraint.prototype.constrain = function (value) {
            return new Point2d(this.x ? this.x.constrain(value.x) : value.x, this.y ? this.y.constrain(value.y) : value.y);
        };
        return Point2dConstraint;
    }());

    var className$6 = ClassName('p2dpadtxt');
    /**
     * @hidden
     */
    var Point2dPadTextView = /** @class */ (function () {
        function Point2dPadTextView(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$6());
            var padWrapperElem = doc.createElement('div');
            padWrapperElem.classList.add(className$6('w'));
            this.element.appendChild(padWrapperElem);
            var buttonElem = doc.createElement('button');
            buttonElem.classList.add(className$6('b'));
            buttonElem.appendChild(createSvgIconElement(doc, 'p2dpad'));
            padWrapperElem.appendChild(buttonElem);
            this.padButtonElem_ = buttonElem;
            var padElem = doc.createElement('div');
            padElem.classList.add(className$6('p'));
            padWrapperElem.appendChild(padElem);
            this.padView_ = config.padView;
            padElem.appendChild(this.padView_.element);
            var textElem = doc.createElement('div');
            textElem.classList.add(className$6('t'));
            this.textView_ = config.textView;
            textElem.appendChild(this.textView_.element);
            this.element.appendChild(textElem);
        }
        Object.defineProperty(Point2dPadTextView.prototype, "value", {
            get: function () {
                return this.textView_.value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Point2dPadTextView.prototype, "padButtonElement", {
            get: function () {
                return this.padButtonElem_;
            },
            enumerable: false,
            configurable: true
        });
        Point2dPadTextView.prototype.update = function () {
            this.padView_.update();
            this.textView_.update();
        };
        return Point2dPadTextView;
    }());

    var className$5 = ClassName('p2dpad');
    /**
     * @hidden
     */
    var Point2dPadView = /** @class */ (function () {
        function Point2dPadView(doc, config) {
            this.onFoldableChange_ = this.onFoldableChange_.bind(this);
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.foldable = config.foldable;
            this.foldable.emitter.on('change', this.onFoldableChange_);
            this.invertsY_ = config.invertsY;
            this.maxValue_ = config.maxValue;
            this.element = doc.createElement('div');
            this.element.classList.add(className$5());
            var padElem = doc.createElement('div');
            padElem.tabIndex = 0;
            padElem.classList.add(className$5('p'));
            this.element.appendChild(padElem);
            this.padElement = padElem;
            var svgElem = doc.createElementNS(SVG_NS, 'svg');
            svgElem.classList.add(className$5('g'));
            this.padElement.appendChild(svgElem);
            this.svgElem_ = svgElem;
            var xAxisElem = doc.createElementNS(SVG_NS, 'line');
            xAxisElem.classList.add(className$5('ax'));
            xAxisElem.setAttributeNS(null, 'x1', '0');
            xAxisElem.setAttributeNS(null, 'y1', '50%');
            xAxisElem.setAttributeNS(null, 'x2', '100%');
            xAxisElem.setAttributeNS(null, 'y2', '50%');
            this.svgElem_.appendChild(xAxisElem);
            var yAxisElem = doc.createElementNS(SVG_NS, 'line');
            yAxisElem.classList.add(className$5('ax'));
            yAxisElem.setAttributeNS(null, 'x1', '50%');
            yAxisElem.setAttributeNS(null, 'y1', '0');
            yAxisElem.setAttributeNS(null, 'x2', '50%');
            yAxisElem.setAttributeNS(null, 'y2', '100%');
            this.svgElem_.appendChild(yAxisElem);
            var lineElem = doc.createElementNS(SVG_NS, 'line');
            lineElem.classList.add(className$5('l'));
            lineElem.setAttributeNS(null, 'x1', '50%');
            lineElem.setAttributeNS(null, 'y1', '50%');
            this.svgElem_.appendChild(lineElem);
            this.lineElem_ = lineElem;
            var markerElem = doc.createElementNS(SVG_NS, 'circle');
            markerElem.classList.add(className$5('m'));
            markerElem.setAttributeNS(null, 'r', '2px');
            this.svgElem_.appendChild(markerElem);
            this.markerElem_ = markerElem;
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        Object.defineProperty(Point2dPadView.prototype, "allFocusableElements", {
            get: function () {
                return [this.padElement];
            },
            enumerable: false,
            configurable: true
        });
        Point2dPadView.prototype.update = function () {
            if (this.foldable.expanded) {
                this.element.classList.add(className$5(undefined, 'expanded'));
            }
            else {
                this.element.classList.remove(className$5(undefined, 'expanded'));
            }
            var _a = this.value.rawValue.getComponents(), x = _a[0], y = _a[1];
            var max = this.maxValue_;
            var px = mapRange(x, -max, +max, 0, 100);
            var py = mapRange(y, -max, +max, 0, 100);
            var ipy = this.invertsY_ ? 100 - py : py;
            this.lineElem_.setAttributeNS(null, 'x2', px + "%");
            this.lineElem_.setAttributeNS(null, 'y2', ipy + "%");
            this.markerElem_.setAttributeNS(null, 'cx', px + "%");
            this.markerElem_.setAttributeNS(null, 'cy', ipy + "%");
        };
        Point2dPadView.prototype.onValueChange_ = function () {
            this.update();
        };
        Point2dPadView.prototype.onFoldableChange_ = function () {
            this.update();
        };
        return Point2dPadView;
    }());

    /**
     * @hidden
     */
    var Point2dPadController = /** @class */ (function () {
        function Point2dPadController(doc, config) {
            var _this = this;
            this.triggerElement = null;
            this.onFocusableElementBlur_ = this.onFocusableElementBlur_.bind(this);
            this.onKeyDown_ = this.onKeyDown_.bind(this);
            this.onPadKeyDown_ = this.onPadKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.foldable = new Foldable();
            this.baseSteps_ = config.baseSteps;
            this.maxValue_ = config.maxValue;
            this.invertsY_ = config.invertsY;
            this.view = new Point2dPadView(doc, {
                foldable: this.foldable,
                invertsY: this.invertsY_,
                maxValue: this.maxValue_,
                value: this.value,
            });
            this.ptHandler_ = new PointerHandler(this.view.padElement);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.padElement.addEventListener('keydown', this.onPadKeyDown_);
            this.view.element.addEventListener('keydown', this.onKeyDown_);
            this.view.allFocusableElements.forEach(function (elem) {
                elem.addEventListener('blur', _this.onFocusableElementBlur_);
            });
        }
        Point2dPadController.prototype.handlePointerEvent_ = function (d) {
            var max = this.maxValue_;
            var px = mapRange(d.x, 0, d.bounds.width, -max, +max);
            var py = mapRange(this.invertsY_ ? d.bounds.height - d.y : d.y, 0, d.bounds.height, -max, +max);
            this.value.rawValue = new Point2d(px, py);
            this.view.update();
        };
        Point2dPadController.prototype.onPointerDown_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        Point2dPadController.prototype.onPointerMove_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        Point2dPadController.prototype.onPointerUp_ = function (ev) {
            this.handlePointerEvent_(ev.data);
        };
        Point2dPadController.prototype.onPadKeyDown_ = function (ev) {
            if (isArrowKey(ev.keyCode)) {
                ev.preventDefault();
            }
            this.value.rawValue = new Point2d(this.value.rawValue.x +
                getStepForKey(this.baseSteps_[0], getHorizontalStepKeys(ev)), this.value.rawValue.y +
                getStepForKey(this.baseSteps_[1], getVerticalStepKeys(ev)) *
                    (this.invertsY_ ? 1 : -1));
        };
        Point2dPadController.prototype.onFocusableElementBlur_ = function (ev) {
            var elem = this.view.element;
            var nextTarget = findNextTarget(ev);
            if (nextTarget && elem.contains(nextTarget)) {
                // Next target is in the picker
                return;
            }
            if (nextTarget &&
                nextTarget === this.triggerElement &&
                !supportsTouch(elem.ownerDocument)) {
                // Next target is the trigger button
                return;
            }
            this.foldable.expanded = false;
        };
        Point2dPadController.prototype.onKeyDown_ = function (ev) {
            if (ev.keyCode === 27) {
                this.foldable.expanded = false;
            }
        };
        return Point2dPadController;
    }());

    var className$4 = ClassName('p2dtxt');
    /**
     * @hidden
     */
    var Point2dTextView = /** @class */ (function () {
        function Point2dTextView(doc, config) {
            var _this = this;
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.formatters_ = config.formatters;
            this.element = doc.createElement('div');
            this.element.classList.add(className$4());
            var inputElems = [0, 1].map(function () {
                var inputElem = doc.createElement('input');
                inputElem.classList.add(className$4('i'));
                inputElem.type = 'text';
                return inputElem;
            });
            inputElems.forEach(function (inputElem) {
                _this.element.appendChild(inputElem);
            });
            this.inputElems_ = [inputElems[0], inputElems[1]];
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        Object.defineProperty(Point2dTextView.prototype, "inputElements", {
            get: function () {
                return this.inputElems_;
            },
            enumerable: false,
            configurable: true
        });
        Point2dTextView.prototype.update = function () {
            var _this = this;
            var xyComps = this.value.rawValue.getComponents();
            xyComps.forEach(function (comp, index) {
                var inputElem = _this.inputElems_[index];
                inputElem.value = _this.formatters_[index](comp);
            });
        };
        Point2dTextView.prototype.onValueChange_ = function () {
            this.update();
        };
        return Point2dTextView;
    }());

    /**
     * @hidden
     */
    var Point2dTextController = /** @class */ (function () {
        function Point2dTextController(doc, config) {
            var _this = this;
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
            this.parser_ = config.parser;
            this.value = config.value;
            this.baseSteps_ = [config.axes[0].baseStep, config.axes[1].baseStep];
            this.view = new Point2dTextView(doc, {
                formatters: [config.axes[0].formatter, config.axes[1].formatter],
                value: this.value,
            });
            this.view.inputElements.forEach(function (inputElem) {
                inputElem.addEventListener('change', _this.onInputChange_);
                inputElem.addEventListener('keydown', _this.onInputKeyDown_);
            });
        }
        Point2dTextController.prototype.findIndexOfInputElem_ = function (inputElem) {
            var inputElems = this.view.inputElements;
            for (var i = 0; i < inputElems.length; i++) {
                if (inputElems[i] === inputElem) {
                    return i;
                }
            }
            return null;
        };
        Point2dTextController.prototype.updateComponent_ = function (index, newValue) {
            var comps = this.value.rawValue.getComponents();
            var newComps = comps.map(function (comp, i) {
                return i === index ? newValue : comp;
            });
            this.value.rawValue = new Point2d(newComps[0], newComps[1]);
            this.view.update();
        };
        Point2dTextController.prototype.onInputChange_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            var compIndex = this.findIndexOfInputElem_(inputElem);
            if (isEmpty(compIndex)) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue);
        };
        Point2dTextController.prototype.onInputKeyDown_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            var compIndex = this.findIndexOfInputElem_(inputElem);
            if (isEmpty(compIndex)) {
                return;
            }
            var step = getStepForKey(this.baseSteps_[compIndex], getVerticalStepKeys(e));
            if (step === 0) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue + step);
        };
        return Point2dTextController;
    }());

    /**
     * @hidden
     */
    var Point2dPadTextController = /** @class */ (function () {
        function Point2dPadTextController(doc, config) {
            this.onPadButtonBlur_ = this.onPadButtonBlur_.bind(this);
            this.onPadButtonClick_ = this.onPadButtonClick_.bind(this);
            this.value = config.value;
            this.padIc_ = new Point2dPadController(doc, {
                baseSteps: [config.axes[0].baseStep, config.axes[1].baseStep],
                invertsY: config.invertsY,
                maxValue: config.maxValue,
                value: this.value,
            });
            this.textIc_ = new Point2dTextController(doc, {
                axes: config.axes,
                parser: config.parser,
                value: this.value,
            });
            this.view = new Point2dPadTextView(doc, {
                padView: this.padIc_.view,
                textView: this.textIc_.view,
            });
            this.view.padButtonElement.addEventListener('blur', this.onPadButtonBlur_);
            this.view.padButtonElement.addEventListener('click', this.onPadButtonClick_);
            this.padIc_.triggerElement = this.view.padButtonElement;
        }
        Point2dPadTextController.prototype.onPadButtonBlur_ = function (e) {
            var elem = this.view.element;
            var nextTarget = forceCast(e.relatedTarget);
            if (!nextTarget || !elem.contains(nextTarget)) {
                this.padIc_.foldable.expanded = false;
            }
        };
        Point2dPadTextController.prototype.onPadButtonClick_ = function () {
            this.padIc_.foldable.expanded = !this.padIc_.foldable.expanded;
            if (this.padIc_.foldable.expanded) {
                this.padIc_.view.allFocusableElements[0].focus();
            }
        };
        return Point2dPadTextController;
    }());

    /**
     * @hidden
     */
    function point2dFromUnknown(value) {
        return Point2d.isObject(value)
            ? new Point2d(value.x, value.y)
            : new Point2d();
    }

    function writePoint2d(target, value) {
        target.writeProperty('x', value.x);
        target.writeProperty('y', value.y);
    }

    function createDimensionConstraint$1(params) {
        if (!params) {
            return undefined;
        }
        var constraints = [];
        if (!isEmpty(params.step)) {
            constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
            constraints.push(new RangeConstraint({
                max: params.max,
                min: params.min,
            }));
        }
        return new CompositeConstraint(constraints);
    }
    function createConstraint$2(params) {
        return new Point2dConstraint({
            x: createDimensionConstraint$1('x' in params ? params.x : undefined),
            y: createDimensionConstraint$1('y' in params ? params.y : undefined),
        });
    }
    function getSuitableMaxDimensionValue(constraint, rawValue) {
        var rc = constraint && findConstraint(constraint, RangeConstraint);
        if (rc) {
            return Math.max(Math.abs(rc.minValue || 0), Math.abs(rc.maxValue || 0));
        }
        var step = getBaseStep(constraint);
        return Math.max(Math.abs(step) * 10, Math.abs(rawValue) * 10);
    }
    /**
     * @hidden
     */
    function getSuitableMaxValue(initialValue, constraint) {
        var xc = constraint instanceof Point2dConstraint ? constraint.x : undefined;
        var yc = constraint instanceof Point2dConstraint ? constraint.y : undefined;
        var xr = getSuitableMaxDimensionValue(xc, initialValue.x);
        var yr = getSuitableMaxDimensionValue(yc, initialValue.y);
        return Math.max(xr, yr);
    }
    function createController$2(document, value, invertsY) {
        var c = value.constraint;
        if (!(c instanceof Point2dConstraint)) {
            throw TpError.shouldNeverHappen();
        }
        return new Point2dPadTextController(document, {
            axes: [
                {
                    baseStep: getBaseStep(c.x),
                    formatter: createNumberFormatter(getSuitableDecimalDigits(c.x, value.rawValue.x)),
                },
                {
                    baseStep: getBaseStep(c.y),
                    formatter: createNumberFormatter(getSuitableDecimalDigits(c.y, value.rawValue.y)),
                },
            ],
            invertsY: invertsY,
            maxValue: getSuitableMaxValue(value.rawValue, value.constraint),
            parser: parseNumber,
            value: value,
        });
    }
    function shouldInvertY(params) {
        if (!('y' in params)) {
            return false;
        }
        var yParams = params.y;
        if (!yParams) {
            return false;
        }
        return 'inverted' in yParams ? !!yParams.inverted : false;
    }
    /**
     * @hidden
     */
    var Point2dInputPlugin = {
        id: 'input-point2d',
        accept: function (value, _params) { return (Point2d.isObject(value) ? value : null); },
        binding: {
            reader: function (_args) { return point2dFromUnknown; },
            constraint: function (args) { return createConstraint$2(args.params); },
            equals: Point2d.equals,
            writer: function (_args) { return writePoint2d; },
        },
        controller: function (args) {
            return createController$2(args.document, args.value, shouldInvertY(args.params));
        },
    };

    var Point3d = /** @class */ (function () {
        function Point3d(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Point3d.prototype.getComponents = function () {
            return [this.x, this.y, this.z];
        };
        Point3d.isObject = function (obj) {
            if (isEmpty(obj)) {
                return false;
            }
            var x = obj.x;
            var y = obj.y;
            var z = obj.z;
            if (typeof x !== 'number' ||
                typeof y !== 'number' ||
                typeof z !== 'number') {
                return false;
            }
            return true;
        };
        Point3d.equals = function (v1, v2) {
            return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
        };
        Point3d.prototype.toObject = function () {
            return {
                x: this.x,
                y: this.y,
                z: this.z,
            };
        };
        return Point3d;
    }());

    /**
     * @hidden
     */
    var Point3dConstraint = /** @class */ (function () {
        function Point3dConstraint(config) {
            this.x = config.x;
            this.y = config.y;
            this.z = config.z;
        }
        Point3dConstraint.prototype.constrain = function (value) {
            return new Point3d(this.x ? this.x.constrain(value.x) : value.x, this.y ? this.y.constrain(value.y) : value.y, this.z ? this.z.constrain(value.z) : value.z);
        };
        return Point3dConstraint;
    }());

    var className$3 = ClassName('p3dtxt');
    /**
     * @hidden
     */
    var Point3dTextView = /** @class */ (function () {
        function Point3dTextView(doc, config) {
            var _this = this;
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.formatters_ = config.formatters;
            this.element = doc.createElement('div');
            this.element.classList.add(className$3());
            var inputElems = [0, 1, 2].map(function () {
                var inputElem = doc.createElement('input');
                inputElem.classList.add(className$3('i'));
                inputElem.type = 'text';
                return inputElem;
            });
            inputElems.forEach(function (inputElem) {
                _this.element.appendChild(inputElem);
            });
            this.inputElems_ = [inputElems[0], inputElems[1], inputElems[2]];
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.update();
        }
        Object.defineProperty(Point3dTextView.prototype, "inputElements", {
            get: function () {
                return this.inputElems_;
            },
            enumerable: false,
            configurable: true
        });
        Point3dTextView.prototype.update = function () {
            var _this = this;
            var comps = this.value.rawValue.getComponents();
            comps.forEach(function (comp, index) {
                var inputElem = _this.inputElems_[index];
                inputElem.value = _this.formatters_[index](comp);
            });
        };
        Point3dTextView.prototype.onValueChange_ = function () {
            this.update();
        };
        return Point3dTextView;
    }());

    /**
     * @hidden
     */
    var Point3dTextController = /** @class */ (function () {
        function Point3dTextController(doc, config) {
            var _this = this;
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
            this.parser_ = config.parser;
            this.value = config.value;
            var axes = config.axes;
            this.baseSteps_ = [axes[0].baseStep, axes[1].baseStep, axes[2].baseStep];
            this.view = new Point3dTextView(doc, {
                formatters: [axes[0].formatter, axes[1].formatter, axes[2].formatter],
                value: this.value,
            });
            this.view.inputElements.forEach(function (inputElem) {
                inputElem.addEventListener('change', _this.onInputChange_);
                inputElem.addEventListener('keydown', _this.onInputKeyDown_);
            });
        }
        Point3dTextController.prototype.findIndexOfInputElem_ = function (inputElem) {
            var inputElems = this.view.inputElements;
            for (var i = 0; i < inputElems.length; i++) {
                if (inputElems[i] === inputElem) {
                    return i;
                }
            }
            return null;
        };
        Point3dTextController.prototype.updateComponent_ = function (index, newValue) {
            var comps = this.value.rawValue.getComponents();
            var newComps = comps.map(function (comp, i) {
                return i === index ? newValue : comp;
            });
            this.value.rawValue = new Point3d(newComps[0], newComps[1], newComps[2]);
            this.view.update();
        };
        Point3dTextController.prototype.onInputChange_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            var compIndex = this.findIndexOfInputElem_(inputElem);
            if (isEmpty(compIndex)) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue);
        };
        Point3dTextController.prototype.onInputKeyDown_ = function (e) {
            var inputElem = forceCast(e.currentTarget);
            var parsedValue = this.parser_(inputElem.value);
            if (isEmpty(parsedValue)) {
                return;
            }
            var compIndex = this.findIndexOfInputElem_(inputElem);
            if (isEmpty(compIndex)) {
                return;
            }
            var step = getStepForKey(this.baseSteps_[compIndex], getVerticalStepKeys(e));
            if (step === 0) {
                return;
            }
            this.updateComponent_(compIndex, parsedValue + step);
        };
        return Point3dTextController;
    }());

    /**
     * @hidden
     */
    function point3dFromUnknown(value) {
        return Point3d.isObject(value)
            ? new Point3d(value.x, value.y, value.z)
            : new Point3d();
    }

    function writePoint3d(target, value) {
        target.writeProperty('x', value.x);
        target.writeProperty('y', value.y);
        target.writeProperty('z', value.z);
    }

    function createDimensionConstraint(params) {
        if (!params) {
            return undefined;
        }
        var constraints = [];
        if (!isEmpty(params.step)) {
            constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
            constraints.push(new RangeConstraint({
                max: params.max,
                min: params.min,
            }));
        }
        return new CompositeConstraint(constraints);
    }
    function createConstraint$1(params) {
        return new Point3dConstraint({
            x: createDimensionConstraint('x' in params ? params.x : undefined),
            y: createDimensionConstraint('y' in params ? params.y : undefined),
            z: createDimensionConstraint('z' in params ? params.z : undefined),
        });
    }
    /**
     * @hidden
     */
    function getAxis(initialValue, constraint) {
        return {
            baseStep: getBaseStep(constraint),
            formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue)),
        };
    }
    function createController$1(document, value) {
        var c = value.constraint;
        if (!(c instanceof Point3dConstraint)) {
            throw TpError.shouldNeverHappen();
        }
        return new Point3dTextController(document, {
            axes: [
                getAxis(value.rawValue.x, c.x),
                getAxis(value.rawValue.y, c.y),
                getAxis(value.rawValue.z, c.z),
            ],
            parser: parseNumber,
            value: value,
        });
    }
    /**
     * @hidden
     */
    var Point3dInputPlugin = {
        id: 'input-point3d',
        accept: function (value, _params) { return (Point3d.isObject(value) ? value : null); },
        binding: {
            reader: function (_args) { return point3dFromUnknown; },
            constraint: function (args) { return createConstraint$1(args.params); },
            equals: Point3d.equals,
            writer: function (_args) { return writePoint3d; },
        },
        controller: function (args) {
            return createController$1(args.document, args.value);
        },
    };

    /**
     * @hidden
     */
    function stringFromUnknown(value) {
        return String(value);
    }
    /**
     * @hidden
     */
    function formatString(value) {
        return value;
    }

    function createConstraint(params) {
        var constraints = [];
        var lc = createListConstraint(params, stringFromUnknown);
        if (lc) {
            constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
    }
    function createController(doc, value) {
        var _a;
        var c = value.constraint;
        if (c && findConstraint(c, ListConstraint)) {
            return new ListController(doc, {
                listItems: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : [],
                stringifyValue: function (v) { return v; },
                value: value,
            });
        }
        return new TextController(doc, {
            formatter: formatString,
            parser: function (v) { return v; },
            value: value,
        });
    }
    /**
     * @hidden
     */
    var StringInputPlugin = {
        id: 'input-string',
        accept: function (value, _params) { return (typeof value === 'string' ? value : null); },
        binding: {
            reader: function (_args) { return stringFromUnknown; },
            constraint: function (args) { return createConstraint(args.params); },
            equals: equalsPrimitive,
            writer: function (_args) { return writePrimitive; },
        },
        controller: function (params) {
            return createController(params.document, params.value);
        },
    };

    var className$2 = ClassName('mll');
    /**
     * @hidden
     */
    var MultiLogView = /** @class */ (function () {
        function MultiLogView(doc, config) {
            this.onValueUpdate_ = this.onValueUpdate_.bind(this);
            this.formatter_ = config.formatter;
            this.element = doc.createElement('div');
            this.element.classList.add(className$2());
            var textareaElem = doc.createElement('textarea');
            textareaElem.classList.add(className$2('i'));
            textareaElem.style.height = "calc(var(--unit-size) * " + config.lineCount + ")";
            textareaElem.readOnly = true;
            this.element.appendChild(textareaElem);
            this.textareaElem_ = textareaElem;
            config.value.emitter.on('change', this.onValueUpdate_);
            this.value = config.value;
            this.update();
        }
        MultiLogView.prototype.update = function () {
            var _this = this;
            var elem = this.textareaElem_;
            var shouldScroll = elem.scrollTop === elem.scrollHeight - elem.clientHeight;
            elem.textContent = this.value.rawValue
                .map(function (value) {
                return value !== undefined ? _this.formatter_(value) : '';
            })
                .join('\n');
            if (shouldScroll) {
                elem.scrollTop = elem.scrollHeight;
            }
        };
        MultiLogView.prototype.onValueUpdate_ = function () {
            this.update();
        };
        return MultiLogView;
    }());

    /**
     * @hidden
     */
    var MultiLogController = /** @class */ (function () {
        function MultiLogController(doc, config) {
            this.value = config.value;
            this.view = new MultiLogView(doc, {
                formatter: config.formatter,
                lineCount: config.lineCount,
                value: this.value,
            });
        }
        return MultiLogController;
    }());

    var className$1 = ClassName('sgl');
    /**
     * @hidden
     */
    var SingleLogView = /** @class */ (function () {
        function SingleLogView(doc, config) {
            this.onValueUpdate_ = this.onValueUpdate_.bind(this);
            this.formatter_ = config.formatter;
            this.element = doc.createElement('div');
            this.element.classList.add(className$1());
            var inputElem = doc.createElement('input');
            inputElem.classList.add(className$1('i'));
            inputElem.readOnly = true;
            inputElem.type = 'text';
            this.element.appendChild(inputElem);
            this.inputElem_ = inputElem;
            config.value.emitter.on('change', this.onValueUpdate_);
            this.value = config.value;
            this.update();
        }
        SingleLogView.prototype.update = function () {
            var values = this.value.rawValue;
            var lastValue = values[values.length - 1];
            this.inputElem_.value =
                lastValue !== undefined ? this.formatter_(lastValue) : '';
        };
        SingleLogView.prototype.onValueUpdate_ = function () {
            this.update();
        };
        return SingleLogView;
    }());

    /**
     * @hidden
     */
    var SingleLogMonitorController = /** @class */ (function () {
        function SingleLogMonitorController(doc, config) {
            this.value = config.value;
            this.view = new SingleLogView(doc, {
                formatter: config.formatter,
                value: this.value,
            });
        }
        return SingleLogMonitorController;
    }());

    /**
     * @hidden
     */
    var BooleanMonitorPlugin = {
        id: 'monitor-bool',
        accept: function (value, _params) { return (typeof value === 'boolean' ? value : null); },
        binding: {
            reader: function (_args) { return boolFromUnknown; },
        },
        controller: function (args) {
            var _a;
            if (args.value.rawValue.length === 1) {
                return new SingleLogMonitorController(args.document, {
                    formatter: BooleanFormatter,
                    value: args.value,
                });
            }
            return new MultiLogController(args.document, {
                formatter: BooleanFormatter,
                lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
                value: args.value,
            });
        },
    };

    /**
     * @hidden
     */
    var GraphCursor = /** @class */ (function () {
        function GraphCursor() {
            this.emitter = new Emitter();
            this.index_ = -1;
        }
        Object.defineProperty(GraphCursor.prototype, "index", {
            get: function () {
                return this.index_;
            },
            set: function (index) {
                var changed = this.index_ !== index;
                if (changed) {
                    this.index_ = index;
                    this.emitter.emit('change', {
                        index: index,
                        sender: this,
                    });
                }
            },
            enumerable: false,
            configurable: true
        });
        return GraphCursor;
    }());

    var className = ClassName('grl');
    /**
     * @hidden
     */
    var GraphLogView = /** @class */ (function () {
        function GraphLogView(doc, config) {
            this.onCursorChange_ = this.onCursorChange_.bind(this);
            this.onValueUpdate_ = this.onValueUpdate_.bind(this);
            this.element = doc.createElement('div');
            this.element.classList.add(className());
            this.formatter_ = config.formatter;
            this.minValue_ = config.minValue;
            this.maxValue_ = config.maxValue;
            this.cursor_ = config.cursor;
            this.cursor_.emitter.on('change', this.onCursorChange_);
            var svgElem = doc.createElementNS(SVG_NS, 'svg');
            svgElem.classList.add(className('g'));
            svgElem.style.height = "calc(var(--unit-size) * " + config.lineCount + ")";
            this.element.appendChild(svgElem);
            this.svgElem_ = svgElem;
            var lineElem = doc.createElementNS(SVG_NS, 'polyline');
            this.svgElem_.appendChild(lineElem);
            this.lineElem_ = lineElem;
            var tooltipElem = doc.createElement('div');
            tooltipElem.classList.add(className('t'));
            this.element.appendChild(tooltipElem);
            this.tooltipElem_ = tooltipElem;
            config.value.emitter.on('change', this.onValueUpdate_);
            this.value = config.value;
            this.update();
        }
        Object.defineProperty(GraphLogView.prototype, "graphElement", {
            get: function () {
                return this.svgElem_;
            },
            enumerable: false,
            configurable: true
        });
        GraphLogView.prototype.update = function () {
            var bounds = this.svgElem_.getBoundingClientRect();
            // Graph
            var maxIndex = this.value.rawValue.length - 1;
            var min = this.minValue_;
            var max = this.maxValue_;
            var points = [];
            this.value.rawValue.forEach(function (v, index) {
                if (v === undefined) {
                    return;
                }
                var x = mapRange(index, 0, maxIndex, 0, bounds.width);
                var y = mapRange(v, min, max, bounds.height, 0);
                points.push([x, y].join(','));
            });
            this.lineElem_.setAttributeNS(null, 'points', points.join(' '));
            // Cursor
            var tooltipElem = this.tooltipElem_;
            var value = this.value.rawValue[this.cursor_.index];
            if (value === undefined) {
                tooltipElem.classList.remove(className('t', 'valid'));
                return;
            }
            tooltipElem.classList.add(className('t', 'valid'));
            var tx = mapRange(this.cursor_.index, 0, maxIndex, 0, bounds.width);
            var ty = mapRange(value, min, max, bounds.height, 0);
            tooltipElem.style.left = tx + "px";
            tooltipElem.style.top = ty + "px";
            tooltipElem.textContent = "" + this.formatter_(value);
        };
        GraphLogView.prototype.onValueUpdate_ = function () {
            this.update();
        };
        GraphLogView.prototype.onCursorChange_ = function () {
            this.update();
        };
        return GraphLogView;
    }());

    /**
     * @hidden
     */
    var GraphLogController = /** @class */ (function () {
        function GraphLogController(doc, config) {
            this.onGraphMouseLeave_ = this.onGraphMouseLeave_.bind(this);
            this.onGraphMouseMove_ = this.onGraphMouseMove_.bind(this);
            this.value = config.value;
            this.cursor_ = new GraphCursor();
            this.view = new GraphLogView(doc, {
                cursor: this.cursor_,
                formatter: config.formatter,
                lineCount: config.lineCount,
                maxValue: config.maxValue,
                minValue: config.minValue,
                value: this.value,
            });
            this.view.element.addEventListener('mouseleave', this.onGraphMouseLeave_);
            this.view.element.addEventListener('mousemove', this.onGraphMouseMove_);
        }
        GraphLogController.prototype.onGraphMouseLeave_ = function () {
            this.cursor_.index = -1;
        };
        GraphLogController.prototype.onGraphMouseMove_ = function (e) {
            var bounds = this.view.graphElement.getBoundingClientRect();
            var x = e.offsetX;
            this.cursor_.index = Math.floor(mapRange(x, 0, bounds.width, 0, this.value.rawValue.length));
        };
        return GraphLogController;
    }());

    function createFormatter() {
        // TODO: formatter precision
        return createNumberFormatter(2);
    }
    function createTextMonitor(_a) {
        var _b;
        var document = _a.document, params = _a.params, value = _a.value;
        if (value.rawValue.length === 1) {
            return new SingleLogMonitorController(document, {
                formatter: createFormatter(),
                value: value,
            });
        }
        return new MultiLogController(document, {
            formatter: createFormatter(),
            lineCount: (_b = params.lineCount) !== null && _b !== void 0 ? _b : Constants.monitor.defaultLineCount,
            value: value,
        });
    }
    function createGraphMonitor(_a) {
        var _b, _c, _d;
        var document = _a.document, params = _a.params, value = _a.value;
        return new GraphLogController(document, {
            formatter: createFormatter(),
            lineCount: (_b = params.lineCount) !== null && _b !== void 0 ? _b : Constants.monitor.defaultLineCount,
            maxValue: (_c = ('max' in params ? params.max : null)) !== null && _c !== void 0 ? _c : 100,
            minValue: (_d = ('min' in params ? params.min : null)) !== null && _d !== void 0 ? _d : 0,
            value: value,
        });
    }
    function shouldShowGraph(params) {
        return 'view' in params && params.view === 'graph';
    }
    /**
     * @hidden
     */
    var NumberMonitorPlugin = {
        id: 'monitor-number',
        accept: function (value, _params) { return (typeof value === 'number' ? value : null); },
        binding: {
            defaultBufferSize: function (params) { return (shouldShowGraph(params) ? 64 : 1); },
            reader: function (_args) { return numberFromUnknown; },
        },
        controller: function (args) {
            if (shouldShowGraph(args.params)) {
                return createGraphMonitor(args);
            }
            return createTextMonitor(args);
        },
    };

    /**
     * @hidden
     */
    var StringMonitorPlugin = {
        id: 'monitor-string',
        accept: function (value, _params) { return (typeof value === 'string' ? value : null); },
        binding: {
            reader: function (_args) { return stringFromUnknown; },
        },
        controller: function (args) {
            var _a;
            var value = args.value;
            var multiline = value.rawValue.length > 1 ||
                ('multiline' in args.params && args.params.multiline);
            if (multiline) {
                return new MultiLogController(args.document, {
                    formatter: formatString,
                    lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
                    value: value,
                });
            }
            return new SingleLogMonitorController(args.document, {
                formatter: formatString,
                value: value,
            });
        },
    };

    function createDefaultWrapperElement(doc) {
        var elem = doc.createElement('div');
        elem.classList.add(ClassName('dfw')());
        if (doc.body) {
            doc.body.appendChild(elem);
        }
        return elem;
    }
    function embedStyle(doc, id, css) {
        if (doc.querySelector("style[data-tp-style=" + id + "]")) {
            return;
        }
        var styleElem = doc.createElement('style');
        styleElem.dataset.tpStyle = id;
        styleElem.textContent = css;
        doc.head.appendChild(styleElem);
    }
    function embedDefaultStyleIfNeeded(doc) {
        embedStyle(doc, 'default', '.tp-lstv_s,.tp-btnv_b,.tp-p2dpadtxtv_b,.tp-fldv_t,.tp-rotv_t,.tp-cltxtv_i,.tp-p2dtxtv_i,.tp-p3dtxtv_i,.tp-clswv_sw,.tp-p2dpadv_p,.tp-txtv_i,.tp-grlv_g,.tp-sglv_i,.tp-mllv_i,.tp-ckbv_i,.tp-cltxtv_ms{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-lstv_s,.tp-btnv_b,.tp-p2dpadtxtv_b{background-color:var(--button-background-color);border-radius:2px;color:var(--button-foreground-color);cursor:pointer;display:block;font-weight:bold;height:var(--unit-size);line-height:var(--unit-size);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-lstv_s:hover,.tp-btnv_b:hover,.tp-p2dpadtxtv_b:hover{background-color:var(--button-background-color-hover)}.tp-lstv_s:focus,.tp-btnv_b:focus,.tp-p2dpadtxtv_b:focus{background-color:var(--button-background-color-focus)}.tp-lstv_s:active,.tp-btnv_b:active,.tp-p2dpadtxtv_b:active{background-color:var(--button-background-color-active)}.tp-fldv_t,.tp-rotv_t{background-color:var(--folder-background-color);color:var(--folder-foreground-color);cursor:pointer;display:block;height:calc(var(--unit-size) + 4px);line-height:calc(var(--unit-size) + 4px);overflow:hidden;padding-left:28px;position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-fldv_t:hover,.tp-rotv_t:hover{background-color:var(--folder-background-color-hover)}.tp-fldv_t:focus,.tp-rotv_t:focus{background-color:var(--folder-background-color-focus)}.tp-fldv_t:active,.tp-rotv_t:active{background-color:var(--folder-background-color-active)}.tp-fldv_m,.tp-rotv_m{background:linear-gradient(to left, var(--folder-foreground-color), var(--folder-foreground-color) 2px, transparent 2px, transparent 4px, var(--folder-foreground-color) 4px);border-radius:2px;bottom:0;content:\'\';display:block;height:6px;left:13px;margin:auto;opacity:0.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-fldv.tp-fldv-expanded>.tp-fldv_t>.tp-fldv_m,.tp-rotv.tp-rotv-expanded .tp-rotv_m{transform:none}.tp-fldv_c,.tp-rotv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-fldv_c>.tp-fldv.tp-v-first,.tp-rotv_c>.tp-fldv.tp-v-first{margin-top:-4px}.tp-fldv_c>.tp-fldv.tp-v-last,.tp-rotv_c>.tp-fldv.tp-v-last{margin-bottom:-4px}.tp-fldv_c>*:not(.tp-v-first),.tp-rotv_c>*:not(.tp-v-first){margin-top:4px}.tp-fldv_c>.tp-fldv:not(.tp-v-hidden)+.tp-fldv,.tp-rotv_c>.tp-fldv:not(.tp-v-hidden)+.tp-fldv{margin-top:0}.tp-fldv_c>.tp-sptv:not(.tp-v-hidden)+.tp-sptv,.tp-rotv_c>.tp-sptv:not(.tp-v-hidden)+.tp-sptv{margin-top:0}.tp-fldv.tp-fldv-expanded>.tp-fldv_c,.tp-rotv.tp-rotv-expanded .tp-rotv_c{opacity:1;padding-bottom:4px;padding-top:4px;transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-cltxtv_i,.tp-p2dtxtv_i,.tp-p3dtxtv_i,.tp-clswv_sw,.tp-p2dpadv_p,.tp-txtv_i{background-color:var(--input-background-color);border-radius:2px;box-sizing:border-box;color:var(--input-foreground-color);font-family:inherit;height:var(--unit-size);line-height:var(--unit-size);min-width:0;width:100%}.tp-cltxtv_i:hover,.tp-p2dtxtv_i:hover,.tp-p3dtxtv_i:hover,.tp-clswv_sw:hover,.tp-p2dpadv_p:hover,.tp-txtv_i:hover{background-color:var(--input-background-color-hover)}.tp-cltxtv_i:focus,.tp-p2dtxtv_i:focus,.tp-p3dtxtv_i:focus,.tp-clswv_sw:focus,.tp-p2dpadv_p:focus,.tp-txtv_i:focus{background-color:var(--input-background-color-focus)}.tp-cltxtv_i:active,.tp-p2dtxtv_i:active,.tp-p3dtxtv_i:active,.tp-clswv_sw:active,.tp-p2dpadv_p:active,.tp-txtv_i:active{background-color:var(--input-background-color-active)}.tp-cltxtv_m,.tp-lstv{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-cltxtv_mm,.tp-lstv_m{bottom:0;margin:auto;position:absolute;right:2px;top:0}.tp-cltxtv_mm svg,.tp-lstv_m svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-cltxtv_mm svg path,.tp-lstv_m svg path{fill:currentColor}.tp-grlv_g,.tp-sglv_i,.tp-mllv_i{background-color:var(--monitor-background-color);border-radius:2px;box-sizing:border-box;color:var(--monitor-foreground-color);height:var(--unit-size);width:100%}.tp-clpv,.tp-p2dpadv{background-color:var(--base-background-color);border-radius:6px;box-shadow:0 2px 4px var(--base-shadow-color);display:none;max-width:168px;padding:4px;position:relative;visibility:hidden;z-index:1000}.tp-clpv.tp-clpv-expanded,.tp-p2dpadv.tp-p2dpadv-expanded{display:block;visibility:visible}.tp-cltxtv_w,.tp-p2dtxtv,.tp-p3dtxtv{display:flex}.tp-cltxtv_i,.tp-p2dtxtv_i,.tp-p3dtxtv_i{padding:0 4px;width:100%}.tp-cltxtv_i+.tp-cltxtv_i,.tp-p2dtxtv_i+.tp-cltxtv_i,.tp-p3dtxtv_i+.tp-cltxtv_i,.tp-cltxtv_i+.tp-p2dtxtv_i,.tp-p2dtxtv_i+.tp-p2dtxtv_i,.tp-p3dtxtv_i+.tp-p2dtxtv_i,.tp-cltxtv_i+.tp-p3dtxtv_i,.tp-p2dtxtv_i+.tp-p3dtxtv_i,.tp-p3dtxtv_i+.tp-p3dtxtv_i{margin-left:2px}.tp-cltxtv_i:first-child,.tp-p2dtxtv_i:first-child,.tp-p3dtxtv_i:first-child{border-top-right-radius:0;border-bottom-right-radius:0}.tp-cltxtv_i:not(:first-child):not(:last-child),.tp-p2dtxtv_i:not(:first-child):not(:last-child),.tp-p3dtxtv_i:not(:first-child):not(:last-child){border-radius:0}.tp-cltxtv_i:last-child,.tp-p2dtxtv_i:last-child,.tp-p3dtxtv_i:last-child{border-top-left-radius:0;border-bottom-left-radius:0}.tp-btnv{padding:0 4px}.tp-btnv_b{width:100%}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--input-background-color);border-radius:2px;cursor:pointer;display:block;height:var(--unit-size);position:relative;width:var(--unit-size)}.tp-ckbv_w svg{bottom:0;display:block;height:16px;left:0;margin:auto;opacity:0;position:absolute;right:0;top:0;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--input-foreground-color);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--input-background-color-hover)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--input-background-color-focus)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--input-background-color-active)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-clpv_h,.tp-clpv_ap{margin-left:6px;margin-right:6px}.tp-clpv_h{margin-top:4px}.tp-clpv_rgb{display:flex;margin-top:4px;width:100%}.tp-clpv_a{display:flex;margin-top:4px;padding-top:8px;position:relative}.tp-clpv_a:before{background-color:var(--separator-color);content:\'\';height:4px;left:-4px;position:absolute;right:-4px;top:0}.tp-clpv_ap{align-items:center;display:flex;flex:3}.tp-clpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:2px;outline:none;overflow:hidden;position:relative}.tp-svpv_c{cursor:crosshair;display:block;height:80px;width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0,0,0,0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--unit-size);outline:none;position:relative}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:2px;border:rgba(255,255,255,0.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,0.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--unit-size);outline:none;position:relative;width:100%}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:2px;box-shadow:0 0 2px rgba(0,0,0,0.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;pointer-events:none;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:2px;border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-clswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:2px}.tp-clswv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;cursor:pointer;display:block;height:var(--unit-size);left:0;margin:0;outline:none;padding:0;position:absolute;top:0;width:var(--unit-size)}.tp-clswv_b:focus::after{border:rgba(255,255,255,0.75) solid 2px;border-radius:2px;bottom:0;content:\'\';display:block;left:0;position:absolute;right:0;top:0}.tp-clswv_p{left:-4px;position:absolute;right:-4px;top:var(--unit-size)}.tp-clswtxtv{display:flex;position:relative}.tp-clswtxtv_s{flex-grow:0;flex-shrink:0;width:var(--unit-size)}.tp-clswtxtv_t{flex:1;margin-left:4px}.tp-cltxtv{display:flex;width:100%}.tp-cltxtv_m{margin-right:4px}.tp-cltxtv_ms{border-radius:2px;color:var(--label-foreground-color);cursor:pointer;height:var(--unit-size);line-height:var(--unit-size);padding:0 18px 0 4px}.tp-cltxtv_ms:hover{background-color:var(--input-background-color-hover)}.tp-cltxtv_ms:focus{background-color:var(--input-background-color-focus)}.tp-cltxtv_ms:active{background-color:var(--input-background-color-active)}.tp-cltxtv_mm{color:var(--label-foreground-color)}.tp-cltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:300px}.tp-fldv.tp-fldv-expanded .tp-fldv_t{transition:border-radius 0s}.tp-fldv_c{border-left:var(--folder-background-color) solid 4px}.tp-fldv_t:hover+.tp-fldv_c{border-left-color:var(--folder-background-color-hover)}.tp-fldv_t:focus+.tp-fldv_c{border-left-color:var(--folder-background-color-focus)}.tp-fldv_t:active+.tp-fldv_c{border-left-color:var(--folder-background-color-active)}.tp-fldv_c>.tp-fldv{margin-left:4px}.tp-fldv_c>.tp-fldv>.tp-fldv_t{border-top-left-radius:2px;border-bottom-left-radius:2px}.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_t{border-bottom-left-radius:0}.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:2px}.tp-grlv{overflow:hidden;position:relative}.tp-grlv_g{display:block;height:calc(var(--unit-size) * 3)}.tp-grlv_g polyline{fill:none;stroke:var(--monitor-foreground-color);stroke-linejoin:round}.tp-grlv_t{color:var(--monitor-foreground-color);font-size:0.9em;left:0;pointer-events:none;position:absolute;text-indent:4px;top:0;visibility:hidden}.tp-grlv_t.tp-grlv_t-valid{visibility:visible}.tp-grlv_t::before{background-color:var(--monitor-foreground-color);border-radius:100%;content:\'\';display:block;height:4px;left:-2px;position:absolute;top:-2px;width:4px}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:4px;padding-right:4px}.tp-lblv_l{color:var(--label-foreground-color);flex:1;-webkit-hyphens:auto;-ms-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:var(--value-width)}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m{color:var(--button-foreground-color)}.tp-sglv_i{padding:0 4px}.tp-mllv_i{display:block;height:calc(var(--unit-size) * 3);line-height:var(--unit-size);padding:0 4px;resize:none;white-space:pre}.tp-p2dpadv{padding-left:calc(4px * 2 + var(--unit-size))}.tp-p2dpadv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpadv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpadv_ax{stroke:var(--input-guide-color)}.tp-p2dpadv_l{stroke:var(--input-foreground-color);stroke-linecap:round;stroke-dasharray:1px 3px}.tp-p2dpadv_m{fill:var(--input-foreground-color)}.tp-p2dpadtxtv{display:flex;position:relative}.tp-p2dpadtxtv_b{height:var(--unit-size);position:relative;width:var(--unit-size)}.tp-p2dpadtxtv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dpadtxtv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dpadtxtv_b svg circle{fill:currentColor}.tp-p2dpadtxtv_p{left:-4px;position:absolute;right:-4px;top:var(--unit-size)}.tp-p2dpadtxtv_t{margin-left:4px}.tp-rotv{--font-family: var(--tp-font-family, Roboto Mono,Source Code Pro,Menlo,Courier,monospace);--unit-size: var(--tp-unit-size, 20px);--value-width: var(--tp-value-width, 200px);--base-background-color: var(--tp-base-background-color, #2f3137);--base-shadow-color: var(--tp-base-shadow-color, rgba(0,0,0,0.2));--button-background-color: var(--tp-button-background-color, #adafb8);--button-background-color-active: var(--tp-button-background-color-active, #d6d7db);--button-background-color-focus: var(--tp-button-background-color-focus, #c8cad0);--button-background-color-hover: var(--tp-button-background-color-hover, #bbbcc4);--button-foreground-color: var(--tp-button-foreground-color, #2f3137);--folder-background-color: var(--tp-folder-background-color, rgba(200,202,208,0.1));--folder-background-color-active: var(--tp-folder-background-color-active, rgba(200,202,208,0.25));--folder-background-color-focus: var(--tp-folder-background-color-focus, rgba(200,202,208,0.2));--folder-background-color-hover: var(--tp-folder-background-color-hover, rgba(200,202,208,0.15));--folder-foreground-color: var(--tp-folder-foreground-color, #c8cad0);--input-background-color: var(--tp-input-background-color, rgba(200,202,208,0.1));--input-background-color-active: var(--tp-input-background-color-active, rgba(200,202,208,0.25));--input-background-color-focus: var(--tp-input-background-color-focus, rgba(200,202,208,0.2));--input-background-color-hover: var(--tp-input-background-color-hover, rgba(200,202,208,0.15));--input-foreground-color: var(--tp-input-foreground-color, #c8cad0);--input-guide-color: var(--tp-input-guide-color, rgba(0,0,0,0.2));--label-foreground-color: var(--tp-label-foreground-color, rgba(200,202,208,0.7));--monitor-background-color: var(--tp-monitor-background-color, rgba(0,0,0,0.2));--monitor-foreground-color: var(--tp-monitor-foreground-color, rgba(200,202,208,0.7));--separator-color: var(--tp-separator-color, rgba(0,0,0,0.2))}.tp-rotv{background-color:var(--base-background-color);border-radius:6px;box-shadow:0 2px 4px var(--base-shadow-color);font-family:var(--font-family);font-size:12px;font-weight:500;line-height:1;text-align:left}.tp-rotv_t{border-bottom-left-radius:6px;border-bottom-right-radius:6px;border-top-left-radius:6px;border-top-right-radius:6px;padding-right:28px;text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_t{border-bottom-left-radius:0;border-bottom-right-radius:0}.tp-rotv_m{transition:none}.tp-rotv_c>.tp-fldv:last-child>.tp-fldv_c{border-bottom-left-radius:6px;border-bottom-right-radius:6px}.tp-rotv_c>.tp-fldv:last-child:not(.tp-fldv-expanded)>.tp-fldv_t{border-bottom-left-radius:6px;border-bottom-right-radius:6px}.tp-rotv_c>.tp-fldv:first-child>.tp-fldv_t{border-top-left-radius:6px;border-top-right-radius:6px}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}.tp-sptv_r{background-color:var(--separator-color);border-width:0;display:block;height:4px;margin:0;width:100%}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--unit-size);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--input-background-color);border-radius:1px;bottom:0;content:\'\';display:block;height:2px;left:0;margin:auto;position:absolute;right:0;top:0}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--input-foreground-color);border-radius:1px;bottom:0;content:\'\';display:block;height:2px;left:0;margin-bottom:auto;margin-top:auto;position:absolute;right:0;top:0}.tp-sldv_k::after{background-color:var(--button-background-color);border-radius:2px;bottom:0;content:\'\';display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--button-background-color-hover)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--button-background-color-focus)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--button-background-color-active)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-txtv_i{padding:0 4px}');
        getAllPlugins().forEach(function (plugin) {
            if (plugin.css) {
                embedStyle(doc, "plugin-" + plugin.id, plugin.css);
            }
        });
    }
    var Tweakpane = /** @class */ (function (_super) {
        __extends(Tweakpane, _super);
        function Tweakpane(opt_config) {
            var _a;
            var _this = this;
            var config = opt_config || {};
            var doc = (_a = config.document) !== null && _a !== void 0 ? _a : getWindowDocument();
            var rootController = new RootController(doc, {
                expanded: config.expanded,
                blade: new Blade(),
                title: config.title,
            });
            _this = _super.call(this, rootController) || this;
            _this.containerElem_ = config.container || createDefaultWrapperElement(doc);
            _this.containerElem_.appendChild(_this.element);
            _this.doc_ = doc;
            _this.usesDefaultWrapper_ = !config.container;
            embedDefaultStyleIfNeeded(_this.document);
            return _this;
        }
        Object.defineProperty(Tweakpane.prototype, "document", {
            get: function () {
                if (!this.doc_) {
                    throw TpError.alreadyDisposed();
                }
                return this.doc_;
            },
            enumerable: false,
            configurable: true
        });
        Tweakpane.prototype.dispose = function () {
            var containerElem = this.containerElem_;
            if (!containerElem) {
                throw TpError.alreadyDisposed();
            }
            if (this.usesDefaultWrapper_) {
                var parentElem = containerElem.parentElement;
                if (parentElem) {
                    parentElem.removeChild(containerElem);
                }
            }
            this.containerElem_ = null;
            this.doc_ = null;
            _super.prototype.dispose.call(this);
        };
        Tweakpane.version = new Semver('2.0.1');
        return Tweakpane;
    }(RootApi));
    function registerDefaultPlugins() {
        [
            Point2dInputPlugin,
            Point3dInputPlugin,
            StringInputPlugin,
            NumberInputPlugin,
            StringColorInputPlugin,
            ObjectColorInputPlugin,
            NumberColorInputPlugin,
            BooleanInputPlugin,
        ].forEach(function (p) {
            RootApi.registerPlugin({
                type: 'input',
                plugin: p,
            });
        });
        [BooleanMonitorPlugin, StringMonitorPlugin, NumberMonitorPlugin].forEach(function (p) {
            RootApi.registerPlugin({
                type: 'monitor',
                plugin: p,
            });
        });
    }
    registerDefaultPlugins();

    return Tweakpane;

})));
