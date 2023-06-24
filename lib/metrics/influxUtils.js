import { Point } from "@influxdata/influxdb-client";

export function getInfluxPoints(ovenStatus) {
    const {
        ovenId,
        data: {
            updatedTimestamp,
            state: { mode },
            nodes: {
                door,
                fan,
                lamp,
                vent,
                waterTank,
                heatingElements,
                steamGenerators,

                temperatureBulbs,
                temperatureProbe,

                timer,
            },
            systemInfo: {
                online,
                hardwareVersion,
                powerMains,
                powerHertz,
                firmwareVersion,
                uiHardwareVersion,
                uiFirmwareVersion,
                firmwareUpdatedTimestamp,
                lastConnectedTimestamp,
                lastDisconnectedTimestamp,
            },
        },
    } = ovenStatus;

    const systemInfoPoint = new Point("systemInfo")
        .tag("ovenId", ovenId)
        .timestamp(new Date(updatedTimestamp));

    systemInfoPoint
        .booleanField("online", online)
        .stringField("hardwareVersion", hardwareVersion)
        .intField("powerMains", powerMains)
        .intField("powerHertz", powerHertz)
        .stringField("firmwareVersion", firmwareVersion)
        .stringField("uiHardwareVersion", uiHardwareVersion)
        .stringField("uiFirmwareVersion", uiFirmwareVersion)
        .intField(
            "firmwareUpdatedTimestamp",
            new Date(firmwareUpdatedTimestamp).getTime()
        )
        .intField(
            "lastConnectedTimestamp",
            new Date(lastConnectedTimestamp).getTime()
        )
        .intField(
            "lastDisconnectedTimestamp",
            new Date(lastDisconnectedTimestamp).getTime()
        );

    const statePoint = new Point("state")
    .tag("ovenId", ovenId)
    .timestamp(new Date(updatedTimestamp));

    statePoint.stringField("mode", mode);

    const nodesPoint = new Point("nodes")
        .tag("ovenId", ovenId)
        .timestamp(new Date(updatedTimestamp));

    nodesPoint
        .floatField("dry", temperatureBulbs.dry.current.celsius)
        .floatField("dryBottom", temperatureBulbs.dryBottom.current.celsius)
        .floatField("dryTop", temperatureBulbs.dryTop.current.celsius)
        .floatField("wet", temperatureBulbs.wet.current.celsius)
        .booleanField("wet-dosed", temperatureBulbs.wet.dosed)
        .stringField("temp-mode", temperatureBulbs.mode);

    if (temperatureBulbs.mode === "dry") {
        nodesPoint.floatField("dry-setpoint", temperatureBulbs.dry.setpoint.celsius);
    }

    if (temperatureBulbs.mode === "wet") {
        nodesPoint.floatField("wet-setpoint", temperatureBulbs.wet.setpoint.celsius);
    }

    nodesPoint
        .booleanField("lamp-on", lamp.on)
        .booleanField("lmap-preference", lamp.preference)
        .booleanField("vent-open", vent.open)
        .booleanField("door-closed", door.closed)
        .booleanField("waterTank-empty", waterTank.empty)
        .intField("fan-speed", fan.speed);

    nodesPoint
        .booleanField("heating-bottom-on", heatingElements.bottom.on)
        .booleanField("heating-top-on", heatingElements.top.on)
        .booleanField("heating-rear-on", heatingElements.rear.on)
        .intField("heating-bottom-watts", heatingElements.bottom.watts)
        .intField("heating-top-watts", heatingElements.top.watts)
        .intField("heating-rear-watts", heatingElements.rear.watts);

    nodesPoint.booleanField("probe-connected", temperatureProbe.connected);

    if (temperatureProbe.connected) {
        nodesPoint.floatField("probe", temperatureProbe.current.celsius);
        if (temperatureProbe.setpoint) {
            nodesPoint.floatField(
                "probe-setpoint",
                temperatureProbe.setpoint.celsius
            );
        }
    }

    nodesPoint
        .stringField("steam-mode", steamGenerators.mode)
        .floatField("evaporator", steamGenerators.evaporator.celsius)
        .floatField("boiler", steamGenerators.boiler.celsius)
        .booleanField("boiler-dosed", steamGenerators.boiler.celsius)
        .intField("evaporator-watts", steamGenerators.evaporator.watts)
        .intField("boiler-watts", steamGenerators.boiler.watts);

    if (steamGenerators.mode === "relative-humidity") {
        nodesPoint
            .floatField(
                "relative-humidity",
                steamGenerators.relativeHumidity.current
            )
            .floatField(
                "relative-humidity-setpoint",
                steamGenerators.relativeHumidity.setpoint
            );
    }

    if (steamGenerators.mode === "steam-percentage") {
        nodesPoint.floatField(
            "steam-percentage-setpoint",
            steamGenerators.steamPercentage.setpoint
        );
    }

    nodesPoint
        .stringField("timer-mode", timer.mode)
        .intField("timer-inital", timer.initial)
        .intField("timer-current", timer.current);

    return {
        systemInfoPoint,
        statePoint,
        nodesPoint,
    };
}
