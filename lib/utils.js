/*
* Copyright (c) 2012 Walmart. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// Get current date/time msec count

exports.getTimestamp = function () {

    return (new Date()).getTime();
};


// Clone object or array

exports.clone = function (obj) {

    if (obj === null ||
        obj === undefined) {

        return null;
    }

    var newObj = (obj instanceof Array) ? [] : {};

    for (var i in obj) {

        if (obj.hasOwnProperty(i)) {

            if (obj[i] && typeof obj[i] === 'object') {

                newObj[i] = exports.clone(obj[i]);
            }
            else {

                newObj[i] = obj[i];
            }
        }
    }

    return newObj;
};


// Merge all the properties of source into target; source wins in conflic

exports.merge = function (target, source) {

    if (source) {

        target = target || (source instanceof Array ? [] : {});

        for (var key in source) {

            if (source.hasOwnProperty(key)) {

                var value = source[key];

                if (value &&
                typeof value === 'object') {

                    if (value instanceof Date) {

                        target[key] = new Date(value.getTime());
                    }
                    else if (value instanceof RegExp) {

                        var flags = '' + (value.global ? 'g' : '') + (value.ignoreCase ? 'i' : '') + (value.multiline ? 'm' : '') + (value.sticky ? 'y' : '');
                        target[key] = new RegExp(value.source, flags);
                    }
                    else {

                        target[key] = target[key] || (value instanceof Array ? [] : {});
                        exports.merge(target[key], source[key]);
                    }
                }
                else {

                    target[key] = value;
                }
            }
        }
    }

    return target;
};


// Remove duplicate items from array

exports.unique = function (array, key) {

    var index = {};
    var result = [];

    for (var i = 0, il = array.length; i < il; ++i) {

        if (index[array[i][key]] !== true) {

            result.push(array[i]);
            index[array[i][key]] = true;
        }
    }

    return result;
};


// Convert array into object

exports.map = function (array, key) {

    var obj = {};
    for (var i = 0, il = array.length; i < il; ++i) {

        if (key) {

            if (array[i][key]) {

                obj[array[i][key]] = true;
            }
        }
        else {

            obj[array[i]] = true;
        }
    }

    return obj;
};

