import { v4 as uuidv4 } from "uuid";

const getOvenCommand = (command, ovenId, payload) => {
    return {
        command,
        payload: {
            id: ovenId,
            type: command,
            ...(payload ? { payload } : {}),
        },
        requestId: uuidv4(),
    };
};

const getStopCookCommand = (ovenId) => {
    return getOvenCommand("CMD_APO_STOP", ovenId);
};

export {
    getOvenCommand,
    getStopCookCommand,
};
