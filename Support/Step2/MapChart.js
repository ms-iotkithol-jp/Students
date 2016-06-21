$(function () {
    var mapApiKey = "[BingMap Key]";
    var boundsSet = false;
    var self = this;
    var map;
    var deviceLocations = [];
    var minLatitude = 360;
    var maxLatitude = 0;
    var minLongitude = 360;
    var maxLongitude = 0;
    var pinInfobox;
    var pinIcons = ["m20_m10", "m10_m5", "m5_0", "0_5", "5_10", "10_15", "15_20", "20_22p5", "22p5_25", "25_27p5", "27p5_30", "30_32p5", "32p5_35", "35_40", "40_50"];
    var pinIconTh = [-10, -5, 0, 5, 10, 15, 20, 22.5, 25, 27.5, 30, 32.5, 35, 40, 50];

    var onMapPinClicked = function (e) {
        displayInfobox(e);
    }

    var setDeviceLocationData = function setDeviceLocationData(minLatitude, minLongitude, maxLatitude, maxLongitude, deviceLocations) {
        var i;
        var loc;
        var mapOptions;
        var pin;
        var pinOptions;

        if (!self.map) {
            return;
        }

        if (!boundsSet) {
            boundsSet = true;

            mapOptions = self.map.getOptions();
            mapOptions.bounds =
                Microsoft.Maps.LocationRect.fromCorners(
                    new Microsoft.Maps.Location(maxLatitude, minLongitude),
                    new Microsoft.Maps.Location(minLatitude, maxLongitude));
            self.map.setView(mapOptions);
        }

        self.map.entities.clear();
        if (deviceLocations) {
            for (i = 0 ; i < deviceLocations.length; ++i) {
                loc = new Microsoft.Maps.Location(deviceLocations[i].latitude, deviceLocations[i].longitude);

                pinOptions = {
                    id: deviceLocations[i].deviceId + ':' + deviceLocations[i].count,
                    height: 20,
                    width: 20,
                    zIndex: i
                };

                var iconName = "";
                for (var c = 0; c < pinIconTh.length; c++) {
                    if (deviceLocations[i].tempavg < pinIconTh[c]) {
                        iconName = pinIcons[c];
                        break;
                    }
                }
                if (iconName === "") {
                    pinOptions.icon = "./images/icon_device.svg";
                }
                else {
                    pinOptions.icon = "./images/icon_device_" + iconName + ".svg";

                }

                pin = new Microsoft.Maps.Pushpin(loc, pinOptions);
                Microsoft.Maps.Events.addHandler(pin, 'click', onMapPinClicked);
                self.map.entities.push(pin);
            }
        }
    }
    var finishMap = function () {
        var options = {
            credentials: mapApiKey,
            mapTypeId: Microsoft.Maps.MapTypeId.aerial,
            enableSearchLogo: false,
            enableClickableLogo: false
        };
        self.map = new Microsoft.Maps.Map(document.getElementById("deviceMap"), options);
        Microsoft.Maps.Events.addHandler(self.map, 'viewchange', hideInfobox);

        setDeviceLocationData(minLatitude, minLongitude, maxLatitude, maxLongitude, deviceLocations);
    };


    var createGraph = function (dataOfDevices) {
        var temperatures = [];
        dataOfDevices.forEach(function (dod) {
            var tempAll = 0.0;
            var located = false;
            for (var i = 0; i < dod.data.length; i++) {
                if (dod.data[i].Latitude !== null && dod.data[i].Longitude !== null) {
                    var existed = false;
                    for (var j = 0; j < deviceLocations.length; j++) {
                        if (dod.data[i].Latitude === deviceLocations[j].latitude && dod.data[i].Longitude === deviceLocations[j].longitude) {
                            existed = true;
                            break;
                        }
                    }
                    if (!existed) {
                        located = true;
                        deviceLocations.push({ latitude: dod.data[i].Latitude, longitude: dod.data[i].Longitude, deviceId: dod.data[i].deviceId, count: dod.data.length });
                        var item = dod.data[i];
                        if (item.Latitude < minLatitude) minLatitude = item.Latitude;
                        if (item.Latitude > maxLatitude) maxLatitude = item.Latitude;
                        if (item.Longitude < minLongitude) minLongitude = item.Longitude;
                        if (item.Longitude > maxLongitude) maxLongitude = item.Longitude;
                    }
                }
                tempAll += dod.data[i].temp;
            }
            if (located) {
                temperatures.push(tempAll / dod.data.length);
            }
        });
        for (var i = 0; i < deviceLocations.length; i++) {
            deviceLocations[i].tempavg = temperatures[i];
        }

        if (minLatitude !== maxLatitude) {
            var deltaLatitude = maxLatitude - minLatitude;
            minLatitude -= deltaLatitude * 0.1;
            maxLatitude += deltaLatitude * 0.1;
        } else {
            minLatitude -= 5;
            maxLatitude += 5;
        }
        if (minLongitude !== maxLongitude) {
            var deltaLongitude = maxLongitude - minLongitude;
            minLongitude -= deltaLongitude * 0.1;
            maxLongitude += deltaLongitude * 0.1;
        } else {
            minLongitude -= 5;
            maxLongitude += 5;
        }

        Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme', { callback: finishMap });

    };

    var createDataView = function () {
        getIoTDeviceData(createGraph);
    }
    var displayInfobox = function (e) {
        if (self.pinInfobox != null) {
            hideInfobox(null);
        }

        var id = e.target.getId();
        var width = (id.length * 7) + 35;
        var horizOffset = -(width / 2);

        self.pinInfobox = new Microsoft.Maps.Infobox(e.target.getLocation(),
            {
                title: id,
                typeName: Microsoft.Maps.InfoboxType.mini,
                width: width,
                height: 25,
                visible: true,
                offset: new Microsoft.Maps.Point(horizOffset, 35)
            });

        self.map.entities.push(self.pinInfobox);
    }

    var hideInfobox = function (e) {
        if (self.pinInfobox != null) {
            self.pinInfobox.setOptions({ visible: false });
            self.map.entities.remove(self.pinInfobox);
            self.pinInfobox = null;
        }
    }

    createDataView();
});
