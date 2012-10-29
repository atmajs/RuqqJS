;
/** rest. using deferred object */

(function($, r, d) {

    var panel = null,
    counter = 0,
    w = window,
    config = {
        progress: {
            show: function(){
                w.pageActivity && w.pageActivity.show();
            },
            hide: function(){
                w.pageActivity && w.pageActivity.hide();
            }
        },
        handle: {
            error: function(message){
                compo.Notification.error(message);
            },
            success: function(message){
                //compo.Notification.success(message);
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

        config.progress.show(data);

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
                        config.handle.error('Parse: ' + response);
                    }
                }
                
                if (!response.failure) {
                    dfr.resolve(response);
                } else if (response.failure) {
                    dfr.reject(response.failure);
                    config.handle.error(response.failure || 'Completed');
                    return;
                    //if (data.handleError) {
                        
                        
                    //}
                }

                config.handle.success(response.success || 'Completed');
                
                if (data.handleSuccess && response.success) {
                    //Controls.notification.show({
                    //    message: response.success || $L('Completed!'),
                    //    type: 'success'
                    //});
                }
            },
            error: function(xhr, errorText) {
                typeof compo != 'undefined' && compo.Notification && compo.Notification.show({
                    message: xhr.status + ' - ' + errorText,
                    type: 'error'
                });

                dfr.reject('Network error: ' + errorText);
                d.error(xhr, errorText);
            },
            complete: function() {
                config.progress.hide(data);
            }
        });

        if (!data.omitCache) cache[data.method][service + params] = dfr;
        return dfr.promise();
    }

    $.extend(include.promise('ruqq.rest'), {
        config: config,
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