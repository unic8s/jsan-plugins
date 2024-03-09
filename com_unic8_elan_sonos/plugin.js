module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,

    install: function (options) {
        this.options = options;

        const DeviceDiscovery = options.SonosApi.DeviceDiscovery;

        DeviceDiscovery((device) => {
            console.log('found device at ' + device.host)

            // mute every device...
            device.setMuted(true)
                .then(d => console.log(`${d.host} now muted`))
        })

        // find one device
        DeviceDiscovery().once('DeviceAvailable', (device) => {
            console.log('found device at ' + device.host)

            // get all groups
            device.getAllGroups().then(groups => {
                groups.forEach(group => {
                    console.log(group.Name);
                })
            })
        })
    },
    uninstall: function () {
        this.stopTimer();
    }
}