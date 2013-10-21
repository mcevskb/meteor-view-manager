/**
View package for the TunedIn App.

The View session, for displaying views.
This is taken from https://github.com/EventedMind/meteor-build-a-reactive-data-source

@module package view-manager
**/


/**
The reactive View class is used to set and get the views of the app.

Be aware that they can only be used inside a handlebars template like:

    <div>
        {{myHelper}}
    <div>

@class View-Handlebars-helpers
@static
**/


/**
Get the current template set in an `View` key and place it inside the current template.

    {{Template "myTemplateKey"}}


@method Template
@param {String} keyName    The `View` key which holds a template
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
Handlebars.registerHelper('Template', function (keyName) {
    var template = View.get(keyName);

    if(_.isString(keyName) && View.getTemplateName(template)) {
        return View.getTemplate(template);
    }
});




/**
The reactive View class is used to set and get the views of the app.

@class View
@static
**/
View = {
    /**
    This object stores all keys and their values.

    @property store
    @type Object
    @default {}
    @example

        {
            mainPane: "panes/unrated",
            ...
        }

    **/
    store: {},


    /**
    Keeps the dependencies for the keys in the store.

    @property deps
    @type Object
    @default {}
    @example

        {
            mainPane: new Deps.Dependency,
            ...
        }

    **/
    deps: {},


    // METHODS

    // PRIVATE
    /**
    Creates at least ones a `Deps.Dependency` object to a key.

    @method _ensureDeps
    @private
    @param {String} key     the name of the key to add a dependecy tracker to
    @return undefined
    **/
    _ensureDeps: function (key) {
        if (!this.deps[key]){
            this.deps[key] = new Deps.Dependency;
        }
    },


    // PUBLIC

    /**
    When get is called we create a `Deps.Dependency.depend()` for that key in the store.

    @method get
    @param {String} key     The key name to get
    @return {Object|String} The template name or template object like:

        {
            template: "templateName",
            data: {
                key: "value"
            }
        }

    **/
    get: function (key) {
        this._ensureDeps(key);
        this.deps[key].depend();
        return this.store[key];
    },


    /**
    When set is called every depending reactive function where `View.get()` with the same key is called will rerun.

    @method set
    @param {String}        key       The key name to set a template to
    @param {String|Object} value     A template name or an Object. When using the following keys the objects should look as follows:

    **When using any template**

        'templateName'

        or

        {
            template: 'templateName',
            data: {
                key: 'value'
            }
        }

    **When using 'popupContainer' as key**

        {
            template: 'someTemplate',
            large: true,
            data: {
                key: 'dataValue'
             }
        }

    **When using 'infoPopupContainer' key**

        {
            content: "text",
            position: "top" | "bottom",
            ok: function(){...} | true,
            cancel: function(){...} | true,
        }

    **When using 'infoBoxContainer' as key**

        {
            content: "text" | {title: "Title", content: "Content"}
            ok: function(){...} | true,
            cancel: function(){...} | true,
        }

    @return undefined
    **/
    set: function (key, value) {
        this._ensureDeps(key);


        // make sure if passed an object it has the right structure
        if(_.isObject(value) && !((value.template && value.data) || (value.content))) {
            if(Debug)
                Debug.console('View.set() needs an Object with at least a template and data property','error');

            return;
        }

        // MAINPANE DEPENDENCY: make sure the mainPane2 is hidden, when mainPane1 changes
        if(key === 'mainPane1') {
            this.set('mainPane2', false);
            this.set('popupContainer', false);
        }

        // only reload the dependencies, when value actually changed
        if((this.store[key] !== value)) {
            this.store[key] = value;
            this.deps[key].changed();
        }
    },


    /**
    Set a value to a key without reactive changes.

    @method setDefault
    @param {String}        key       The key name to set a template to
    @param {String|Object} value     A template name or an Object. See `View.set()` for details.
    @return undefined
    **/
    setDefault: function (key, value) {
        this._ensureDeps(key);
        this.store[key] = value;
    },


    /**
    Checks if values are equal, but is not reactive.

    @method equals
    @param {String}        key       The key name to set a template to
    @param {String|Object} value     A template name or an Object. See `View.set()` for details.
    @return {Boolean}
    **/
    equals: function(key, value){
        // this._ensureDeps(key);
        // this.deps[key].depend();
        return (this.store[key] === value) ? true : false;
    },


    /**
    Get the templates.


    @method getTemplate
    @param {String|Object} name   The name of the template, or an object like:

        {
            template: 'xyz',
            data: {
                key: 'value'
            }
        }

    @param {Object} data   The data context to pass to that template
    @return {Object|Empty String} Template instance for use in a template helpers return value
    **/
    getTemplate: function(name, data) {

        if(!name)
            return '';

        // check if "name" contains also the data
        if(_.isString(name)) {
            name = {
                template: name
            }

        // if object, use the data from the object
        } else if(_.isObject(name) && name.data) {
            data = name.data;
        }

        // never set an undefined data
        if(_.isUndefined(data))
            data = {};


        if(Template[name.template]) {
            return new Handlebars.SafeString(Template[name.template](data));
        }
        else
            return '';
    },


    /**
    Gets the template name.

    @method getTemplateName
    @param {String|Object} template   The name of the template, or an object like:

        {
            template: 'xyz',
            data: {
                key: 'value'
            }
        }

    @return {String} The name of the template
    **/
    getTemplateName: function(template) {
        return (_.isObject(template) && template.template) ? template.template : template;
    },


    /**
    Checks whether a template exists or not.

    @method isTemplate
    @param {String|Object} template   The name of the template, or an object like:

        {
            template: 'xyz',
            data: {
                key: 'value'
            }
        }

    @return {Boolean} TRUE if the template exists, FALSE if not
    **/
    isTemplate: function(template) {
        if(_.isObject(template) && template.template) {
            return (Template[template.template]) ? true : false;
        } else {
            return (Template[template]) ? true : false;
        }
    }

};
