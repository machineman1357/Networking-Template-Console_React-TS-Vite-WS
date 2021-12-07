export function populateObjectNames(object: { ids: Array<number>, names: Array<string>  }) {
    const idsKeys = Object.keys(object.ids);
    const idsValues = Object.values(object.ids);

    for (let i = 0, len = idsKeys.length; i < len; i++) {
        const idsKey = idsKeys[i];
        const idsValue = idsValues[i];

        object.names[idsValue] = idsKey;
    }
}

export function getPlayerColorHSL(degree: number) {
    if (degree === -1) return "#d4dbf9";

    return "hsl(" + degree + "deg 79% 47%)";
}