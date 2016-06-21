$(function () {
    var createGraph = function (dataOfDevices) {
        var dataViews = [];
        var columns = [];
        var graphMetadata = {
            columns: [
                {
                    displayName: 'series',
                    isMeasure: true,
                    queryName: 'series',
                    roles: {
                        "Series": true
                    },
                    type: powerbi.ValueType.fromDescriptor({ dateTime: true }),
                },
            ],
            objects: { categoryLabels: { show: true } },
        };
        var count = 1;

        var fieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "table1", name: "scatter-b-t" } });
        var seriesIdentityField = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: 'e', name: 'series' } });

        dataOfDevices.forEach(function (dod) {
            var producedGD = {
                temperatures: [],
                brightness: [],
                accel: [],
                timestamps: []
            };
            dod.data.forEach(function (itemData) {
                producedGD.temperatures.push(itemData.temp);
                producedGD.brightness.push(itemData.brightness);
                producedGD.accel.push(Math.sqrt(itemData.accelx * itemData.accelx + itemData.accely * itemData.accely + itemData.accelz * itemData.accelz));
                var dateTime = new Date(itemData.time);
                if (!dateTime.replase) {
                    dateTime.replace = ('' + this).replace;
                }
                producedGD.timestamps.push(dateTime);
            });

            var categoryValues = producedGD.timestamps;
            var categoryIdentities =
                categoryValues.map(
                function (value) {
                    var expr = powerbi.data.SQExprBuilder.equal(fieldExpr, powerbi.data.SQExprBuilder.text(value));
                    return powerbi.data.createDataViewScopeIdentity(expr);
                }
            );

            graphMetadata.columns.push({
                displayName: 'brightness',
                groupName: dod.deviceId + ':brightness',
                isMeasure: true,
                queryName: "x",
                roles: { "X": true },
                type: powerbi.ValueType.fromDescriptor({ numeric: true })
            });

            graphMetadata.columns.push({
                displayName: 'temperature',
                groupName: dod.deviceId + ':temperature',
                isMeasure: true,
                queryName: "y",
                roles: { "Y": true },
                type: powerbi.ValueType.fromDescriptor({ numeric: true })
            });

            graphMetadata.columns.push({
                displayName: 'accel',
                groupName: dod.deviceId + ':accel',
                isMeasure: true,
                queryName: "size",
                roles: { "Size": true },
                type: powerbi.ValueType.fromDescriptor({ numeric: true })
            });

            columns.push({
                source: graphMetadata.columns[count++],
                values: producedGD.brightness
            });
            columns.push({
                source: graphMetadata.columns[count++],
                values: producedGD.temperatures
            });
            columns.push({
                source: graphMetadata.columns[count++],
                values: producedGD.accel
            });

            var dataValues = dataViewTransform.createValueColumns(columns);

            var categoryMetadata = {
                categories: [{
                    source: graphMetadata.columns[0],
                    values: categoryValues,
                    identity: categoryIdentities,
                    identityFields: [seriesIdentityField],
                    objects: { dataPoint: { fill: { solid: { color: 'blue' } } } }
                }],
                values: dataValues
            };

            var dataView = {
                metadata: graphMetadata,
                categorical: categoryMetadata
            };
            dataViews.push(dataView);


        });

        var viewport = { height: height, width: width };

        if (visual.update) {
            // Call update to draw the visual with some data
            visual.update({
                dataViews: dataViews,
                viewport: viewport,
                duration: 0
            });
        } else if (visual.onDataChanged && visual.onResizing) {
            // Call onResizing and onDataChanged (old API) to draw the visual with some data
            visual.onResizing(viewport);
            visual.onDataChanged({ dataViews: dataViews });
        }

    };

    var createDataView = function () {
        getIoTDeviceData(createGraph);
    };

    function createDefaultStyles() {
        var dataColors = new powerbi.visuals.DataColorPalette();

        return {
            titleText: {
                color: { value: 'rgba(51,51,51,1)' }
            },
            subTitleText: {
                color: { value: 'rgba(145,145,145,1)' }
            },
            colorPalette: {
                dataColors: dataColors,
            },
            labelText: {
                color: {
                    value: 'rgba(51,51,51,1)',
                },
                fontSize: '11px'
            },
            isHighContrast: false,
        };
    }

    var pluginService = powerbi.visuals.visualPluginFactory.create();
    var defaultVisualHostServices = powerbi.visuals.defaultVisualHostServices;
    var width = 600;
    var height = 400;

    var element = $('.visual');
    element.height(height).width(width);


    // Get a plugin
    var visual = pluginService.getPlugin('scatterChart').create();

    var dataViewTransform = powerbi.data.DataViewTransform;

    function createVisual() {
        powerbi.visuals.DefaultVisualHostServices.initialize();

        visual.init({
            // empty DOM element the visual should attach to.
            element: element,
            // host services
            host: defaultVisualHostServices,
            style: createDefaultStyles(),
            viewport: {
                height: height,
                width: width
            },
            settings: { slicingEnabled: true },
            interactivity: { isInteractiveLegend: false, selection: false },
            animation: { transitionImmediate: true }
        });

        createDataView();
    }
    createVisual();
});
