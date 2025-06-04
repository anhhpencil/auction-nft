const sharp = require('sharp');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs/promises');

const generateAnnotatedImage = async (baseImagePath, outputImagePath, winnerName, txHash) => {
    const baseImage = sharp(baseImagePath);
    const metadata = await baseImage.metadata();

    const width = metadata.width;
    const height = metadata.height;

    // Create canvas with same size
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw base image on canvas
    const imgBuffer = await baseImage.toBuffer();
    const image = await loadImage(imgBuffer);
    ctx.drawImage(image, 0, 0, width, height);

    // Set text style
    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'red';
    ctx.fillText(`Winner: ${winnerName}`, 50, height - 80);
    ctx.fillText(`Tx: ${txHash.slice(0, 20)}...`, 50, height - 40);

    // Export canvas to buffer
    const finalBuffer = canvas.toBuffer('image/jpeg');

    // Write to file
    await fs.writeFile(outputImagePath, finalBuffer);

    return outputImagePath;
};


module.exports = {
    generateAnnotatedImage
};
