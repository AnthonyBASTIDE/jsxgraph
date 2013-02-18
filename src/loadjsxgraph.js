/*
    Copyright 2008-2013
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software dual licensed under the GNU LGPL or MIT License.
    
    You can redistribute it and/or modify it under the terms of the
    
      * GNU Lesser General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version
      OR
      * MIT License: https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT
    
    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    
    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <http://www.gnu.org/licenses/>
    and <http://opensource.org/licenses/MIT/>.
 */


/*global JXG: true, document: true*/
/*jslint nomen: true, plusplus: true, regexp: true*/

/* depends:
 */

/**
 * JSXGraph namespace. Holds all classes, objects, functions and variables belonging to JSXGraph
 * to reduce the risc of interfering with other JavaScript code.
 * @namespace
 */
var JXG = {},
    define;

(function () {

    "use strict";

    // check and table are initialized at the end of the iife
    var i, s, n, arr, table,
        waitlist = [],
        checkwaitlist = true,
        checkJXG = function () {
            return JXG;
        },
        makeCheck = function (s) {
            var a = s.split('.');

            return function () {
                var i, r = JXG;

                if (!r) {
                    return r;
                }

                for (i = 0; i < a.length; i++) {
                    r = r[a[i]];
                    if (!r) {
                        break;
                    }
                }

                return r;
            };
        };

    define = function (deps, factory) {
        var i, oldlength, undef,
            resDeps = [],
            inc = true;

        if (deps === undef) {
            deps = [];
        }

        console.log('define', new Error().stack.split('\n').splice(2, 1).join(''));

        if (factory === undef) {
            factory = function () {};
        }

        for (i = 0; i < deps.length; i++) {
            resDeps.push(table[deps[i]]());
            if (!resDeps[i]) {
                console.log('can\'t find', deps[i]);
                inc = false;
                break;
            }
        }

        if (inc) {
            factory.apply(this, resDeps);
        } else if (checkwaitlist) {
            waitlist.push([deps, factory]);
        }

        if (checkwaitlist) {
            console.log('checking waitlist', waitlist.length);
            // don't go through the waitlist while we're going through the waitlist
            checkwaitlist = false;
            oldlength = 0;

            // go through the waitlist until no more modules can be loaded
            while (oldlength !== waitlist.length) {
                oldlength = waitlist.length;

                // go through the waitlist, look if another module can be initialized
                for (i = 0; i < waitlist.length; i++) {
                    define.apply(this, waitlist[i]);
                }
            }

            checkwaitlist = true;
            console.log('waitlist is now', waitlist.length);
        }
    };

    JXG.require = function (libraryName) {
        document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
    };

    JXG.baseFiles = 'jxg,base/constants,utils/type,utils/xml,utils/env,utils/event,math/math,math/numerics,math/statistics,math/symbolic,math/geometry,math/poly,math/complex,renderer/abstract,renderer/no,reader/file,parser/geonext,base/board,options,jsxgraph,base/element,base/coords,base/point,base/line,base/group,base/circle,element/conic,base/polygon,base/curve,element/arc,element/sector,base/composition,element/composition,base/text,base/image,element/slider,element/measure,base/chart,base/transformation,base/turtle,utils/color,base/ticks,utils/zip,utils/base64,utils/uuid,utils/encoding,server/server,parser/datasource,parser/jessiecode,utils/dump,renderer/svg,renderer/vml,renderer/canvas,renderer/no';
    JXG.requirePath = '';

    for (i = 0; i < document.getElementsByTagName("script").length; i++) {
        s = document.getElementsByTagName("script")[i];
        if (s.src && s.src.match(/loadjsxgraph\.js(\?.*)?$/)) {
            JXG.requirePath = s.src.replace(/loadjsxgraph\.js(\?.*)?$/, '');
            arr = JXG.baseFiles.split(',');
            for (n = 0; n < arr.length; n++) {
                JXG.require(JXG.requirePath + arr[n] + '.js');
            }
        }
    }

    JXG.baseFiles = null;
    JXG.serverBase = JXG.requirePath + 'server/';

    // this is a table with functions which check the availability
    // of certain namespaces, functions and classes. with this structure
    // we are able to get a rough check if a specific dependency is available.
    table = {
        'jsxgraph': checkJXG,
        'jxg': checkJXG,
        'options': makeCheck('Options'),

        'base/board': makeCheck('Board'),
        'base/chart': checkJXG,
        'base/circle': checkJXG,
        'base/composition': makeCheck('Composition'),
        'base/constants': checkJXG,
        'base/coords': makeCheck('Coords'),
        'base/curve': checkJXG,
        'base/element': makeCheck('GeometryElement'),
        'base/group': checkJXG,
        'base/image': checkJXG,
        'base/line': checkJXG,
        'base/point': checkJXG,
        'base/polygon': checkJXG,
        'base/text': checkJXG,
        'base/ticks': checkJXG,
        'base/transformation': checkJXG,
        'base/turtle': checkJXG,

        'element/arc': checkJXG,
        'element/centroid': checkJXG,
        'element/composition': checkJXG,
        'element/conic': checkJXG,
        'element/measure': checkJXG,
        'element/sector': checkJXG,
        'element/slider': checkJXG,
        'element/square': checkJXG,
        'element/triangle': checkJXG,

        'math/bst': makeCheck('Math.BST'),
        'math/complex': makeCheck('Math.Complex'),
        'math/geometry': makeCheck('Math.Geometry'),
        'math/math': makeCheck('Math'),
        'math/numerics': makeCheck('Math.Numerics'),
        'math/poly': makeCheck('Math.Poly'),
        'math/statistics': makeCheck('Math.Statistics'),
        'math/symbolic': makeCheck('Math.Symbolic'),

        'parser/datasource': makeCheck('DataSource'),
        'parser/geonext': makeCheck('GeonextParser'),
        'parser/jessiecode': makeCheck('JessieCode'),

        'reader/cinderella': makeCheck('CinderellaReader'),
        'reader/file': makeCheck('FileReader'),
        'reader/geogebra': makeCheck('GeogebraReader'),
        'reader/geonext': makeCheck('GeonextReader'),
        'reader/graph': makeCheck('GraphReader'),
        'reader/intergeo': makeCheck('IntergeoReader'),
        'reader/sketch': makeCheck('SketchReader'),
        'reader/tracenpoche': makeCheck('TracenpocheReader'),

        'renderer/abstract': makeCheck('AbstractRenderer'),
        'renderer/canvas': makeCheck('CanvasRenderer'),
        'renderer/no': makeCheck('NoRenderer'),
        'renderer/svg': makeCheck('SVGRenderer'),
        'renderer/vml': makeCheck('VMLRenderer'),

        'server/server': makeCheck('Server'),

        'utils/base64': makeCheck('Util.Base64'),
        'utils/color': checkJXG,
        'utils/dump': makeCheck('Dump'),
        'utils/encoding': makeCheck('Util.UTF8'),
        'utils/env': checkJXG,
        'utils/event': makeCheck('EventEmitter'),
        'utils/type': checkJXG,
        'utils/uuid': makeCheck('Util.genUUID'),
        'utils/xml': makeCheck('XML'),
        'utils/zip': makeCheck('Util.Unzip')
    };
}());
