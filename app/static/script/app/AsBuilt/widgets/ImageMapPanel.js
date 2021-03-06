/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

Ext.namespace("AsBuilt");

/** api: (define)
 *  module = AsBuilt
 *  class = ImageMapPanel
 *  extends = GeoExt.MapPanel
 */

/** api: constructor
 *  .. class:: ImageMapPanel(config)
 *
 *      Create a map panel that displays an image.
 */
AsBuilt.ImageMapPanel = Ext.extend(GeoExt.MapPanel, {

    zoom: null,

    center: null,

    projection: null,

    layerName: null,

    url: null,

    /* i18n */
    zoomToTitleText: "Zoom to image title",
    /* end i18n */

    /** private: method[initComponent]
     *  Initializes the map panel. Creates an OpenLayers map if
     *  none was provided in the config options passed to the
     *  constructor.
     */
    initComponent: function(){
        if (this.projection !== "EPSG:3857") {
            this.tbar = [{
                text: this.zoomToTitleText, 
                iconCls: "gxp-icon-zoom-to",
                handler: function() {
                    var extent = this.map.getMaxExtent();
                    var w = this.imageWidth;
                    var h = this.imageHeight;
                    var center = new OpenLayers.LonLat(extent.right-w*0.17, extent.bottom+h*0.16);
                    this.map.setCenter(center, 3);
                }, 
                scope: this
            }];
        }
        this.items = [{
            xtype: "gx_zoomslider",
            vertical: true,
            height: 100
        }];
        var maxExtent, maxResolution, projection, numZoomLevels;
        this.layers = [];
        if (this.projection === "EPSG:3857") {
            maxExtent = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);
            numZoomLevels = 21;
            maxResolution = 156543.03390625;
            projection = this.projection;
            this.layers.push(new OpenLayers.Layer.OSM());
        } else {
            maxExtent = new OpenLayers.Bounds(
                0, -this.imageHeight,
                this.imageWidth, 0); 
            maxResolution = this.imageWidth/256;
            projection = "EPSG:404000";
        }
        this.map = {
            controls: [
                new OpenLayers.Control.Navigation({zoomWheelOptions: {interval: 250}}),
                new OpenLayers.Control.PanPanel(),
                new OpenLayers.Control.ZoomPanel(),
                new OpenLayers.Control.Attribution()
            ],
            maxExtent: maxExtent,
            numZoomLevels: numZoomLevels,
            maxResolution: maxResolution,
            projection: projection,
            units: 'm',
            theme: null
        };
        this.layers.push(new OpenLayers.Layer.WMS(
            null,
            this.url,
            {layers: this.layerName, CQL_FILTER: "PATH='"+this.path+"'"}
        ));

        AsBuilt.ImageMapPanel.superclass.initComponent.call(this);
    }

});

/** api: xtype = app_imagemappanel */
Ext.reg('app_imagemappanel', AsBuilt.ImageMapPanel);
