const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Farm = require('./models/Farm');

dotenv.config();

const seedVineyard = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const vineyardData = {
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

Amenities:
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
📞 Phone: +91 (number partially visible)
📧 Email: vineyardfarmstay@gmail.com
📸 Instagram: @vineyardfarmstay
🕒 Check-in: 11 AM | Check-out: 11 AM`
        };

        // Check if it exists
        const existing = await Farm.findOne({ title: "Vineyard Farm Stay" });

        if (existing) {
            await Farm.findByIdAndUpdate(existing._id, vineyardData);
            console.log('Vineyard Farm Stay Updated');
        } else {
            await Farm.create(vineyardData);
            console.log('Vineyard Farm Stay Created');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedVineyard();
