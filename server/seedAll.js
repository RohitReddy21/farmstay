const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Farm = require('./models/Farm');

dotenv.config();

const seedAll = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/farmstay';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        // Clear existing farms
        await Farm.deleteMany({});
        console.log('Cleared existing farms');

        const farms = [
            {
                title: "Traditional Mud Cottage - 1",
                description: "Experience the grounded, earthy living in our traditional mud cottage. Perfect for couples or solo travelers seeking a rustic farm experience.",
                location: "BrownCows Dairy Farm",
                price: 2500,
                capacity: 2,
                images: [
                    "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
                ],
                videos: [
                    "https://www.youtube.com/embed/dQw4w9WgXcQ"
                ],
                amenities: ["King Bed", "Common Bathroom", "Earthy Living", "Farm Experience", "Organic Breakfast"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Traditional Mud Cottage - 2",
                description: "Our second mud cottage offers the same peaceful, traditional experience with modern comfort. Connect with nature and enjoy the serene farm life.",
                location: "BrownCows Dairy Farm",
                price: 2500,
                capacity: 2,
                images: [
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                ],
                videos: [
                    "https://www.youtube.com/embed/9bZkp7q19f0"
                ],
                amenities: ["King Bed", "Common Bathroom", "Rustic Charm", "Nature Connection", "Farm Tour"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Luxury Limestone Villa - 1",
                description: "Spacious duplex villa built with natural limestone, offering orchard views and modern comfort blended with rustic charm.",
                location: "BrownCows Dairy Farm",
                price: 8000,
                capacity: 4,
                images: [
                   "/client/public/images/",
                ],
                videos: [
                    "https://www.youtube.com/embed/tYzMGcUty6s"
                ],
                amenities: ["3 Beds", "AC", "BBQ Grill", "Pool","Bar & Dining Area", "Pit Fire"],
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Luxury Limestone Villa - 2",
                description: "Our second limestone villa provides a premium duplex experience. Built with natural materials for a unique and comfortable stay.",
                location: "BrownCows Dairy Farm",
                price: 4500,
                capacity: 4,
                images: [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                ],
                videos: [
                    "https://www.youtube.com/embed/jNQXAC9IVRw"
                ],
                amenities: ["3 Beds", "2 Bathrooms", "Duplex Structure", "Garden View", "WiFi", "Modern Fittings"],
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
                videos: [
                    "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    "https://www.youtube.com/embed/9bZkp7q19f0"
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
        console.log('Seeded All Farms Successfully');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAll();
