'use strict';

var APP = window.APP = window.APP || {};

APP.mapQuest = (function () {

    var defaults = {
        storageKey: 'mq-config',
        configURL: '/bin/servlet/mapquest',
        location: {
            city: '',
            state: '',
            postal: '',
            'dma_cd': ''
        },
        searchParams: {
            radius: 200,
            maxMatches: 1,
            pageSize: 1,
            units: 'm',
            ambiguities: 'ignore'
        },
        template: '{city}, {state} {postal}',
        contextStore : 'ddprofile'
    };

    var dmaCookie = {
        name: 'DMA',
        delimiter: ':',
        template: '{city}:{state}:{postal}:{dma_cd}:{lat}:{lng}',
        expiry: 1 //days
    };        

    var deferred = new $.Deferred();
    
    var dmaContextHubStore = null;

    //getMQConfiguration
    var getConfig = function () {
        var isMQConfigAvailable = defaults.storageKey in sessionStorage;
        
        if (isMQConfigAvailable) {
             deferred.resolve(JSON.parse(sessionStorage.getItem(defaults.storageKey)));
        } else {
            $.ajax({
                url: defaults.configURL,
                method: 'POST',
                success: function (response) {
                    //console.log(JSON.stringify(response));
                    sessionStorage.setItem(defaults.storageKey, JSON.stringify(response));
                    deferred.resolve(response);
                    //console.log(response);
                },
                error: function (error) {
                    deferred.reject(error);
                }
            });
        }
            
        return deferred.promise();
    };


    //displayLocationDetails
    var displayLocationDetails = function (locationDetails) {
        //TODO: generated HTML will be injected on page once XD is done
        // console.log(generateMarkup(defaults.template, locationDetails));
    };

    //generates Markup
    var generateMarkup = function (template, data) {
        return template.replace(/{[^{}]+}/g, function (key) {
            return data[key.replace(/[{}]+/g, '')] || '';
        });
    };

    //getLocationDetails
    var getLocationDetails = function (params) {
        //Merge params with defaults
        $.extend(true, params, defaults.searchParams);

        $.ajax({
            url: params.url,
            dataType: 'jsonp',
            crossDomain: true,
            data: params,
            success: function (response) {
                var locationDetails;
                if (response.resultsCount > 0) {
                    //pick the topmost search result
                    locationDetails = response.searchResults[0].fields;
                } else {
                    locationDetails = defaults.location;
                }

                //Add origin to location details and create DMA cookie
                locationDetails.origin = params.origin;

                //console.log(CQ_Analytics.PageDataMgr);

                if (!dmaCookieExists()) {
                    CQ_Analytics.PageDataMgr.data.dmaCode = locationDetails.dma_cd; 
                    createDMACookie(locationDetails);
                    
                    if(dmaContextHubStore){
                    	dmaContextHubStore.setItem('dma', locationDetails.dma_cd);
                    }
                }
            },
            error: function (error) {
                console.error(error.message);
            }
        });
    };

    //create DMA Cookie
    var createDMACookie = function (locationDetails) {
        var cookieString = generateMarkup(dmaCookie.template, locationDetails);

        window.Cookies.set(dmaCookie.name, cookieString, {
            expires: dmaCookie.expiry
        });
        
        $(window).trigger('dma-created');
    };

    //Check if DMA Cookie exists
    var dmaCookieExists = function () {
        return (window.Cookies.get(dmaCookie.name) ? true : false);
    };
    
    // Set Store ContextHub Store    
    var setContextHubStore = function () {
    	if(ContextHub){
    		dmaContextHubStore = ContextHub.getStore(defaults.contextStore);
    	}
    };

    //Initialize
    var init = function () {
        // console.log('APP.MapQuest');
    	
        setContextHubStore();
             
        getConfig().then(function (mqConfig) {
            //Set MQ config details in local variable

            var params = {
                url: mqConfig.radiusURL,
                key: mqConfig.key,
                origin: mqConfig.ipAddress,
                hostedData: mqConfig.hostedData
            };

            if (dmaCookieExists()) {
                var cookieValue = window.Cookies.get(dmaCookie.name);
                //console.log(cookieValue);
                var temp = cookieValue.split(dmaCookie.delimiter);
                var locationDetails = {
                    city: temp[0],
                    state: temp[1],
                    postal: temp[2],
                    'dma_cd': temp[3],
                    lat: temp[4],
                    lng: temp[5]
                };
                displayLocationDetails(locationDetails);
                setContextHubStore(locationDetails)
            } else {
                APP.geolocation.location().then(function(origin){
                    var geoOrigin = JSON.stringify({
                        latLng : {
                            lat: origin.coords.latitude, 
                            lng: origin.coords.longitude 
                        }
                    }); 
                
                    params.origin = geoOrigin;
                    getLocationDetails(params);
                }).fail(function(){
                    getLocationDetails(params);
                });
            }
        });
    };

    /**
     * interfaces to public functions
     */
    return {
        init: init,
        getConfig: getConfig
    };
}());
