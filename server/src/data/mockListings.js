const mockListings = [
  {
    _id: '1',
    title: 'Modern Downtown Apartment',
    description: 'Beautiful modern apartment in the heart of downtown',
    price: 150,
    location: 'Downtown',
    images: ['https://example.com/image1.jpg'],
    owner: '1',
    createdAt: new Date()
  },
  {
    _id: '2',
    title: 'Cozy Beach House',
    description: 'Relaxing beach house with ocean view',
    price: 200,
    location: 'Beachfront',
    images: ['https://example.com/image2.jpg'],
    owner: '2',
    createdAt: new Date()
  }
];

module.exports = mockListings;