const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const generateAnnotatedImage = async (baseImagePath, outputImagePath, winnerName, txHash) => {
    const image = await loadImage(baseImagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = 'white';
    ctx.font = '30px Sans';
    ctx.fillText(`Winner: ${winnerName}`, 50, image.height - 80);
    ctx.fillText(`Tx: ${txHash.slice(0, 20)}...`, 50, image.height - 40);

    const out = fs.createWriteStream(outputImagePath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    return new Promise((resolve) => {
        out.on('finish', () => resolve(outputImagePath));
    });
};


module.exports = {
    generateAnnotatedImage
}