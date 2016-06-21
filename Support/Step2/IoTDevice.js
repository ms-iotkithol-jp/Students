var iotdeviceendpoint="http://[IoT Web Name].azurewebsites.net";
var dataqueryparameter="till=0&during=1";
var getIoTDeviceData = function (loadedFunction) {
    var dataOfDevices = [];
    $.get(iotdeviceendpoint + "/api/SASSensors?" + dataqueryparameter, {},
        function (result) {
            result.sort(function (v1, v2) {
                return (v1.time > v2.time ? 1 : -1);
            });
            result.forEach(function (item) {
                if (dataOfDevices.length === 0) {
                    var dataSetOfDevice = { deviceId: item.deviceId, data: [item] };
                    dataOfDevices.push(dataSetOfDevice);
                }
                else {
                    var existed = false;
                    var i = 0;
                    for (; i < dataOfDevices.length; i++) {
                        if (dataOfDevices[i].deviceId === item.deviceId) {
                            existed = true;
                            break;
                        }
                    }
                    if (existed) {
                        dataOfDevices[i].data.push(item);
                    }
                    else {
                        var dataSetOfDevice = { deviceId: item.deviceId, data: [item] };
                        dataOfDevices.push(dataSetOfDevice);
                    }
                }
            });
            loadedFunction(dataOfDevices);
        });
    return dataOfDevices;
};
