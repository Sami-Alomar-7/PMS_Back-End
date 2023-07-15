module.exports = (imagePath) => {
    if(imagePath.substring(0, 19) !== 'data\\default_images')
        return false;
    return true;
}