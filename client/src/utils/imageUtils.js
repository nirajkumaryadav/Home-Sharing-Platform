export const getImageUrl = (home) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60';
    
    if (!home) return fallbackImage;
    
    // Check for valid image URL
    const imageUrl = home.imageUrl || home.image;
    if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
        return fallbackImage;
    }
    
    return imageUrl;
};