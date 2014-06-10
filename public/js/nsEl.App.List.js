/**
 * Global name space for application
 */
var nsEl = nsEl || {};
nsEl.namespace('nsEl.App.List');

(function (nsEl) {

	/**
	 * Creates a new instance of List.
	 */
	nsEl.App.List = function (config) {

		/**
		 * @private variables
		 */
		var
		_cookie = {
			'name' : 'nsEl.App.List.items'
		},
		_configValid = {
			'input' : {
				'type' : 'HTMLInputElement'
			},
			'output': {
				'type' : 'HTMLUListElement'
			},
			'addButton' : {
				'type' : 'HTMLInputElement'
			}
		},
		_errors = {
			'emptyInput' : 'No value entered',
			'eventListeners' : 'Unable to add event listener',
			'validateConfig' : {
				'general' : 'You must provide an object with properties: '
							+'input, output, addButton, removeButton. '
							+'Each is required to be a DOM object. '
							+'Please try again.',
				'invalidType' : 'The following element provided is not '
							+'of the proper type: ',
				'fail' : 'Config validation failed; exiting'
			},
			'attachRemoveButtonListener' : {
				'emptyElement' : 'No element provided'
			},
			'remove' : {
				'general':'Error removing item'
			}
		},
		_shared = {
			'listInitState' : '<li class="empty">Your list is empty. Add something!</li>',
			'clickText' : 'Click to remove this item'
		},


		/**
		 * Clear the input field value.
		 * 
		 * @return Void
		 * @private
		 */
		_clear = function () {
			nsEl.App.List.config.input.value = '';
		},


		/**
		 * Add items to our list (in memory; not the DOM).
		 * 
		 * @param Array
		 * @return Boolean
		 * @private
		 */
		_add = function (e) {
			var config = nsEl.App.List.config,
				item = config.input.value.toString() || '';

			if (item === '') {
				throw new Error(_errors.emptyInput);
			}

			_setItems(item);

			_clear();// clear the input field
			_displayItems();// refresh the display

			return true;
		},


		/**
		 * Add event listeners.This is safe because, when this class is
		 * instantiated, the DOM must already be fully loaded.
		 * 
		 * @param Object
		 * @return Void
		 * @private
		 */
		_attachAddButtonListener = function (config) {
			if (!config || !config.addButton) {
				throw new Error(_errors.eventListeners);
			}
			if (config && config.addButton) {
				if (!config.addButton.addEventListener) {// bad browser
					config.addButton.attachEvent("onclick", _add);
				} else {// good browser
					config.addButton.addEventListener("click", _add);
				}
			}
		},// _addEventListeners


		/**
		 * Attach a listener to each li's click event to trigger removal.
		 * 
		 * @param Object
		 * @return Void
		 * @private
		 */
		_attachRemoveButtonListener = function (element) {
			if (!element) {
				throw new Error(_errors.attachRemoveButtonListener.emptyElement);
			}
			if (!element.addEventListener) {
				element.attachEvent("onclick", _remove);
			} else {
				element.addEventListener("click", _remove);
			}
		},


		/**
		 * Wrapper to call iterate over all items, calling
		 * _attachRemoveButtonListener() on each.
		 * 
		 * @return Void
		 * @private
		 */
		_attachRemoveButtonListeners = function () {
			var element;
			if (!nsEl.App.List.items.length) {
				return false;
			}
			for (i in nsEl.App.List.items) {
				element = document.getElementById('list-item-'+i);
				_attachRemoveButtonListener(element);
			}
		},


		/**
		 * Output our list items to the DOM.
		 * 
		 * @return Boolean
		 * @private
		 */
		_displayItems = function () {
			var items = nsEl.App.List.items,
				output = '',
				hasItems = false;

			if (items.length) {
				hasItems = true;
				// Retrieve items and populate our output
				for (i in items) {
					output += '<li title="'+_shared.clickText+'" id="list-item-'+i+'" class="list-item" data-index="'+i+'">'+items[i]
							+'<span title="'+_shared.clickText+'" class="remove-button" data-index="'+i+'"></li>';
				}
			}

			// Output string is still empty, reinitialize it
			if (!hasItems && output === '') {
				output = _shared.listInitState;
			}
			nsEl.App.List.config.output.innerHTML = output;

			if (hasItems) {
				// Set the cookie
				_setCookie(_cookie.name+"="+JSON.stringify(items));
				_attachRemoveButtonListeners();
			} else {
				// Remove the cookie
				_setCookie(_cookie.name+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT");				
			}
			return true;
		},// _addItemsToDom


		/**
		 * Set cookie value.
		 * 
		 * @param String
		 * @return Void
		 * @private
		 */
		_setCookie = function(value) {
			document.cookie = value;
		},


		/**
		 * Retrieve contents of cookie by key.
		 * 
		 * @param String
		 * @return String
		 * @private
		 */
		_getCookie = function (key) {
		    var	name = key + "=",
		    	cookieParts = document.cookie.split(';'),
		    	i,
		    	c;
			for (i=0; i<cookieParts.length; i++) {
				if (cookieParts[i]) {
					c = cookieParts[i];
					if (c.trim) {
						c = c.trim();					
					}
			        if (c.indexOf(name) == 0) {
			        	return c.substring(name.length,c.length);
			        }
				}
		    }
		    return '';
		},


		/**
		 * Remove items from our list (in memory; not the DOM).
		 * 
		 * @param Number - Index of item to remove
		 * @return Array
		 * @private
		 */
		_remove = function (i) {
			if (i.currentTarget) {
				try {
					nsEl.App.List.items.splice(i.currentTarget.dataset.index,1);
				} catch (e) {
					throw new Error(e);
				}
			} else if (i.srcElement.getAttribute('data-index')) {
				try {
					nsEl.App.List.items.splice(i.srcElement.getAttribute('data-index'),1);
				} catch (e) {
					throw new Error(e);
				}
			} else {
				throw new Error(_errors.remove.general);
			}

			_displayItems();
			return nsEl.App.List.items;
		},// _remove


		/**
		 * Setter for config.
		 * 
		 * @param Object
		 * @private
		 */
		_setConfig = function (config) {
			nsEl.App.List.config = config;
			return nsEl.App.List.config;
		},


		/**
		 * Setter for items.
		 * 
		 * @param Mixed (Array or String)
		 * @private
		 */
		_setItems = function (items) {
			var cookie = _getCookie(_cookie.name) || null;
			if (cookie) {
				cookie = JSON.parse(cookie);
			}

			// Empty value passed; initialize;
			if (!items || !items.length) {
				if (cookie instanceof Array) {
					// Retrieve items from session cookie
					nsEl.App.List.items = cookie;
				} else {
					// No cookie found; reset to empty
					nsEl.App.List.items = [];
				}
				return;
			}
			// At least one string was entered
			if (items instanceof Array || items.length > 0) {
				nsEl.App.List.items.push(items);
			}
			return nsEl.App.List.items;
		},


		/**
		 * Validate the config object before app can be used.
		 * 
		 * @param Object
		 * @return Boolean
		 * @private
		 */
		_validateConfig = function (config) {
			if (!config.input || !config.output || !config.addButton) {
				throw new Error(_errors.validateConfig.general);
			}
			for (property in config) {
				var	propStr = config[property].constructor.toString(),// type of config object
					propertyValidType = _configValid[property].type;

				if (!propStr.indexOf(propertyValidType)) {
					throw new Error(_errors.validateConfig.invalidType + property);
				}
			}
			return true;
		};

		// Initialize input
		config = config || {};

		this.add = _add;
		this.remove = _remove;
		this.items = _setItems();

		// Validate the config object that was passed to this constructor
		if (!_validateConfig(config)) {
			throw new Error(_errors.validateConfig.fail);
		}

		// At this point, we know the config object is valid, set the property
		this.config = _setConfig(config);

		// _addEventListeners relies on us having a valid config object
		_attachAddButtonListener(config);

		// Initialize list display
		_displayItems();
	};

})(nsEl);