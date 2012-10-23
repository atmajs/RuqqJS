;
/** rest. using deferred object */

(function($, r, d) {

    var panel = null,
    counter = 0,
    progress = {
        show: function(options) {
            //if (panel == null) {
            //    var $img = $('<img>').attr('src', '/bookmarks/themes/gifs/ajax-loader-2.gif');
            //    panel = $('<div class="ruqq-ajax-progress-panel">').append($img).hide().appendTo($('body'));
            //}
            //
            //if (!options || options.disableAnimation != true || options.animation != false) {
            //    counter++;
            //    panel.show();
            //}
        },
        hide: function(options) {
            if (!options || options.disableAnimation != true || options.animation != false) {
                counter--;
                if (counter == 0) panel.hide();
            }
        }
    };

    var cache = {
        POST: new Object(),
        GET: new Object()
    };

    function send(service, params, data) {

        data = $.extend({
            handleSuccess: false,
            handleError: true,
            method: 'POST'
        },
        data);

        if (typeof params == 'object') {
            // clean parameters 
            for (var key in params) {
                if (typeof params[key] == 'undefined') delete params[key];
            }
            // stringify
            params = $.param(params);
        }

        if (cache[data.method][service + params] != null) {
            return cache[data.method][service + params].promise();
        }

        //progress.show(data);

        var dfr = $.Deferred();
        console.log('params',params, data);
        $.ajax({
            url: '../' + service,
            data: params,
            type: data.method,
            contentType: data.contentType || 'application/x-www-form-urlencoded',
            success: function(response) {
                
                if (typeof response === 'string'){
                    try{
                        response = JSON.parse(response);
                    }catch(error){
                        alert('Parse Error - ' + response);
                    }
                }
                
                if (!response.failure) {
                    dfr.resolve(response);
                } else if (response.failure) {
                    dfr.reject(response.failure);

                    if (data.handleError) {
                        //Controls.notification.error(response.failure);
                        alert(response.failure);
                    }
                }

                if (data.handleSuccess && response.success) {
                    //Controls.notification.show({
                    //    message: response.success || $L('Completed!'),
                    //    type: 'success'
                    //});
                }
            },
            error: function(xhr, errorText) {
                //Controls.notification.show({
                //    message: errorText,
                //    type: 'error'
                //});

                dfr.reject('Network error: ' + errorText);
                d.error(xhr, errorText);
            },
            complete: function() {
                //progress.hide(data);
            }
        });

        if (!data.omitCache) cache[data.method][service + params] = dfr;
        return dfr.promise();
    }

    $.extend(include.promise('ruqq.rest'), {
        /**
         *@argument arg1 -
         *      {null|bool} - check if any activity, {true} - notify user if active
         *      {string} - check if any activity for webService
         */
        busy: function(arg1) {
            if (typeof arg1 == 'undefined' || typeof arg1 == 'boolean') {
                if (counter > 0) {
                    Controls.notification.show($L('Channel is busy...'), 'warn');
                    return true;
                }
                return counter != 0;
            }
            if (typeof arg1 == 'string'){
                if (cache[arg1] == null) return false;
                for(var k in cache[arg1]){
                    if (cache[arg1][k].isResolved() == false && cache[arg1][k].isRejected() == false){
                        return true;
                    }
                }
                return false;
            }
            return false;
        },
        postJson: function(service, params, data) {
            if (data == null) data = {};
            $.extend(data, {
                contentType: 'application/json;charset=utf-8',
                method: 'POST',
                omitCache: true
            });
            params = JSON.stringify(params);
            return send(service, params, data);
        },
        get: function(service, params, data) {
            if (!data) data = {};
            data.method = 'GET';
            return send(service, params, data);
        },
        post: function(service, params, data) {
            if (!data) data = {};
            data.method = 'POST';
            return send(service, params, data);
        }
    });

})(jQuery, ruqq, console);