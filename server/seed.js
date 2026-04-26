const mongoose = require('mongoose');
const Farm = require('./models/Farm');
const User = require('./models/User');

const seedData = async () => {
    try {
        // Seed Admin User
        // Seed Admin User
        await User.deleteOne({ email: 'admin@farmstay.com' });
        await User.create({
            name: 'Admin',
            email: 'admin@farmstay.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin user reset/created');

        // Clear existing farms to ensure update
        await Farm.deleteMany({});
        console.log('Cleared existing farms');
        
        console.log('Seeding data...');

        const farms = [
            {
                title: "Traditional Mud Cottage - 1",
                description: "Traditional mud cottages designed for a grounded, earthy living experience, perfect for couples or solo travelers. Features 1 king bed and common bathroom.",
                location: "BrownCows Dairy Farm",
                price: 2500,
                capacity: 2,
                images: [
                    "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["King Bed", "Common Bathroom", "Earthy Living", "Farm Experience"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Traditional Mud Cottage - 2",
                description: "Experience the rustic charm of our second traditional mud cottage. Ideal for those seeking a connection with nature and a simple, peaceful stay.",
                location: "BrownCows Dairy Farm",
                price: 2500,
                capacity: 2,
                images: [
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["King Bed", "Common Bathroom", "Rustic Charm", "Nature Connection"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Traditional Mud Cottage - 3",
                description: "Our third mud cottage offers a unique blend of tradition and comfort. Enjoy the serene environment of BrownCows Dairy.",
                location: "BrownCows Dairy Farm",
                price: 2500,
                capacity: 2,
                images: [
                    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["King Bed", "Common Bathroom", "Serene Environment", "Farm Life"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Vineyard Farm Stay",
                location: "Amangal, Telangana",
                price: 4999,
                capacity: 12,
                images: [
                    "/images/vineyard/vineyard1.png",
                    "/images/vineyard/vineyard2.jpg",
                    "/images/vineyard/vineyard3.jpg",
                    "/images/vineyard/vineyard4.jpg",
                    "/images/vineyard/vineyard5.jpg"
                ],
                amenities: [
                    "Swimming Pool",
                    "BBQ Grill",
                    "Bar",
                    "Open Campfire",
                    "Music",
                    "WiFi",
                    "Parking",
                    "Hot Water",
                    "AC"
                ],
                description: `Step away from the noise of everyday life and into the soothing embrace of nature.
Here, time slows down and serenity takes over, as you’re surrounded by acres of sun-kissed vineyards, gentle breezes, and a sky that turns gold at dusk.`,
                category: "Farm",
                subCategory: "Vineyard",
                availability: "All Days"
            }
        ];

        await Farm.insertMany(farms);
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

module.exports = seedData;
