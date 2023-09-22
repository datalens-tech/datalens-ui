const colors = [
    ['#4DA2F1', '#84D1EE', '#1F68A9', '#52A6C5'],
    ['#FF3D64', '#FF91A1', '#ED65A9', '#BE2443'],
    ['#8AD554', '#54A520', '#0FA08D', '#70C1AF'],
    ['#FFC636', '#DB9100', '#FF7E00', '#FFB46C'],
    ['#FFB9DD', '#BA74B3', '#E8B0A4', '#DCA3D7'],
];

function mergeColors() {
    const result = [];
    for (let i = 0; i < colors[0].length; i++) {
        for (let j = 0; j < colors.length; j++) {
            result.push(colors[j][i]);
        }
    }
    return result;
}

export default mergeColors().slice();
