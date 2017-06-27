ContextHub.console.log(ContextHub.Shared.timestamp(), '[loading] contexthub.module.demo.02-basic-renderer - renderer.basic-renderer.js');

(function($) {
    'use strict';

    /**
     * Module implementation.
     *
     * @extends ContextHub.UI.BaseModuleRenderer
     * @constructor
     */
    var TestModule = function() {};

    /* inherit from ContextHub.UI.BaseModuleRenderer */
    ContextHub.Utils.inheritance.inherit(TestModule, ContextHub.UI.BaseModuleRenderer);

    /* renderer default config */
    TestModule.prototype.defaultConfig = {
        /* module icon */
        icon: 'coral-Icon--targeted',

        /* module title */
        title: 'Basic Renderer',

        /* module is clickable */
        clickable: true,

        /* where is data stored? */
        list: '/ddprofile',

        /* indicates that items should be editable */
        listType: 'input',

        /* what can be edited? */
        editable: {
            key: '/ddprofile',

            /* list of disabled properties */
            disabled: [
                '/ddprofile/number'
            ],

            /* list of hidden properties */
            hidden: [
            ]
        },

        /* store mappings */
        storeMapping: {
            myStore: 'ddprofile'
        },

        /* module template */
        template:
            '<p>{{i18n "Basic Renderer"}}</p>' +
            '<p>{{myStore.name}}, {{myStore.age}}, {{myStore.dma}}'
    };

    TestModule.prototype.getPopoverContent = function(module, popoverVariant, configOverride) {
        module.config = $.extend(true, {}, this.defaultConfig, module.config);
        return this.uber('getPopoverContent', module);
    };

    /* register module renderer */
    ContextHub.UI.ModuleRenderer('demo.02-basic-renderer', new TestModule());

}(ContextHubJQ));
