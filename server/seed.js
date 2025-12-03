const mongoose = require('mongoose');
const Farm = require('./models/Farm');
const User = require('./models/User');

const seedData = async () => {
    try {
        // Seed Admin User
        const adminExists = await User.findOne({ email: 'admin@farmstay.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@farmstay.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created');
        }

        // Seed Farms
        const farmCount = await Farm.countDocuments();
        if (farmCount > 0) return;

        console.log('Seeding data...');

        const farms = [
            {
                title: "Sarayu Farms Stays",
                description: "Experience the serenity of nature at Sarayu Farms. Perfect for family getaways with beautiful landscapes and modern amenities.",
                location: "Karnataka, India",
                price: 5000,
                capacity: 10,
                images: [
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["Swimming Pool", "Kitchen", "Parking", "Wifi"]
            },
            {
                title: "Vine Yards Farm Stays",
                description: "Stay amidst lush vineyards and enjoy authentic farm life with wine tasting tours and organic farming experiences.",
                location: "Maharashtra, India",
                price: 4500,
                capacity: 6,
                images: [
                    "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["Breakfast", "Vineyard Tour", "Bonfire"]
            }
        ];

        await Farm.insertMany(farms);
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

module.exports = seedData;
