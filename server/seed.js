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
                title: "Vineyard Farm Stay",
                location: "Amangal, Telangana",
                price: 4999,
                capacity: 12,
                images: [
                    "/images/maharashtra/img1.jpg",
                    "/images/maharashtra/img2.jpg",
                    "/images/maharashtra/img3.jpg",
                    "/images/maharashtra/img4.jpg",
                    "/images/maharashtra/img5.jpg"
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
Here, time slows down and serenity takes over, as you’re surrounded by acres of sun-kissed vineyards, gentle breezes, and a sky that turns gold at dusk.
The tranquil landscapes of Amangal.

Our Rooms – Simple. Traditional. Peaceful.
Vineyard Farm Stay offers three cozy rooms, each inspired by traditional South Indian design.

What to Expect:
• Comfortable beds with clean, cotton sheets.
• Spacious bathrooms with modern fittings and hot water.
• Common Dining Area.
• Verandah or sit-out area to relax with a cup of chai.

A Peaceful Escape at Vineyard Farm Stay

Amenities at Vineyard Farm Stay:
• BBQ Grill – Enjoy a fun evening grilling and dining outdoors.
• Bar – Relax with refreshing drinks while enjoying vineyard views.
• Open Campfire – Gather around the campfire to relax and share stories.
• Music – Enjoy music in the common areas or by the campfire.
• Swimming Pool

Room Tariffs (Per Night):
• KRISHNA: ₹6,400
• GODAVARI: ₹4,999
• KAVERI: ₹5,600

Includes:
• Complimentary breakfast
• Free Wi-Fi
• Access to all amenities (BBQ grill, swimming pool, etc.)

Additional Charges:
• Extra bed (per night): ₹999
• Lunch + Dinner (per person): ₹1,100

Contact & Location:
📍 Sarayu Green Farms, Talakondapalli Road, Amangal, Telangana – 509410
📞 Phone: +91 9989854411
📧 Email: vineyardfarmstay@gmail.com
📸 Instagram: @vineyardfarmstay
🕒 Check-in: 11 AM | Check-out: 11 AM`
            },
            {
                title: "Sarayu Green Farms",
                location: "Amangal, Telangana",
                price: 3500,
                capacity: 8,
                images: [
                    "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["WiFi", "Kitchen", "Parking", "Garden", "Pets Allowed"],
                description: "A beautiful green farm stay located in Amangal, perfect for weekend getaways with family and friends. Enjoy the lush greenery and fresh air."
            }
        ];

        await Farm.insertMany(farms);
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

module.exports = seedData;
