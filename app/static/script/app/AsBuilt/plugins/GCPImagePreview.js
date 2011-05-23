/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

Ext.ns("AsBuilt.plugins");

/** api: (define)
 *  module = AsBuilt.plugins
 *  class = GCPImagePreview
 *  extends = gxp.plugins.Tool
 */

/** api: constructor
 *  .. class:: GCPImagePreview(config)
 *
 *    Show preview of image warping.
 */
AsBuilt.plugins.GCPImagePreview = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = app_preview */
    ptype: "app_preview",

    /** api: config[baseMap]
     *  ``OpenLayers.Map`` The base map to which the preview layer should be
     *  added.
     */
    baseMap: null,

    /** api: config[url]
     *  ``String`` The url of the geoserver which is to be used as the back-end
     *  for previewing and warping the images.
     */
    url: null,

    /** api: config[layerName]
     *  ``String`` The name of the WMS layer that holds the images.
     */
    layerName: null,

    /** api: config[styleName]
     *  ``String`` The name of the style that can be used for previewing the
     *  image. This style should have a featureTypeStyle with a properly
     *  defined gs:ImageRectify Function.
     */
    styleName: null,

    /** private: previewLayer
     *  ``OpenLayers.Layer.WMS`` The WMS layer used for previewing the image
     *  which is to be rectifier.
     */
    previewLayer: null,

    /** api: config[gcpManager]
     * ``AsBuilt.GCPManager`` The GCP Manager, needed to know when
     * to enable/disable this tool and to retrieve the list of ground
     * control points.
     */
    gcpManager: null,

    /* start i18n */
    previewTooltip: "Preview warped image",
    previewText: "Preview",
    saveTooltip: "Save the warped image",
    saveText: "Save",
    /* end i18n */

    enableButton: function(mgr, count) {
        Ext.each(this.actions, function(action) {
            action.setDisabled(count < 3);
        });
    },

    getEnv: function() {
        var gcps = this.gcpManager.getGCPs();
        var env = "GCP:[";

        var encodeGeometry = function(geom) {
            var result = "[";
            result += geom.x;
            result += ",";
            result += geom.y;
            result += "]";
            return result;
        };

        var encodeGCP = function(gcp) {
            var result = "[";
            result += encodeGeometry(gcp.source.geometry);
            result += ",";
            result += encodeGeometry(gcp.target.geometry);
            result += "]";
            return result;
        };

        for (var i=0,ii=gcps.length; i<ii; ++i) {
            env += encodeGCP(gcps[i]);
            if (i<ii-1) {
                env += ",";
            }
        }

        env += "],WARP_ORDER:2";
        return env;
    },

    previewImage: function() {
        var map = this.baseMap;
        if (!this.previewLayer) {
            this.previewLayer = new OpenLayers.Layer.WMS(null, this.url, {layers: this.layerName, styles: this.styleName});
            map.addLayer(this.previewLayer);
        }
        this.previewLayer.mergeNewParams({
            CQL_FILTER: "PATH='"+this.target.imageInfo.path+"'",
            ENV: this.getEnv()
        });
    },

    /** api: method[addActions]
     */
    addActions: function() {
        this.gcpManager.on({
            "gcpchanged": this.enableButton, scope: this
        });
        var actions = AsBuilt.plugins.GCPImagePreview.superclass.addActions.call(this, [
            {
                tooltip: this.previewTooltip,
                iconCls: "gxp-icon-preview",
                disabled: true,
                handler: this.previewImage,
                scope: this,
                text: this.previewText
            }, {
                tooltip: this.saveTooltip,
                iconCls: "gxp-icon-save",
                disabled: true,
                text: this.saveText
            }
        ]);
    }

});

Ext.preg(AsBuilt.plugins.GCPImagePreview.prototype.ptype, AsBuilt.plugins.GCPImagePreview);
