$(function () {
    var createGraph = function (dataOfDevices) {
        var dataViews = [];
        var columns = [];
        var graphMetadata = {
            columns: [
                {
                    displayName: 'Time',
                    isMeasure: true,
                    queryName: 'timestamp',
                    type: powerbi.ValueType.fromDescriptor({ dateTime: true }),
                },
            ]
        };
        var fieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { entity: "table1", name: "time" } });
        var count = 0;

        dataOfDevices.forEach(function (dod) {
            var producedGD = {
                temperatures: [],
                timestamps: []
            };
            count++;
            dod.data.forEach(function (itemData) {
                producedGD.temperatures.push(itemData.temp);
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
                displayName: dod.deviceId,
                isMeasure: true,
                format: "0.00",
                queryName: dod.deviceId + ':temperature',
                type: powerbi.ValueType.fromDescriptor({ numeric: true })
            });

            columns.push({
                source: graphMetadata.columns[count],
                values: producedGD.temperatures
            });

            var dataValues = dataViewTransform.createValueColumns(columns);

            var categoryMetadata = {
                categories: [{
                    source: graphMetadata.columns[0],
                    values: categoryValues,
                    identity: categoryIdentities
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
        //       var dataOfDevices = [];

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
    var visual = pluginService.getPlugin('lineChart').create();

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
