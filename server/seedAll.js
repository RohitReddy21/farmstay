const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Farm = require('./models/Farm');

dotenv.config();

const mudCottageContent = {
    description: "Traditional mud cottages designed for a grounded, earthy living experience, perfect for couples or solo travelers.\n\nDetails:\n- 2 guests\n- 1 king bed\n- Common bathroom",
    location: "BrownCows Dairy Farm",
    price: 4999,
    capacity: 2,
    images: [
        "https://browncowsdairy.com/cdn/shop/files/WhatsAppImage2025-12-16at5.07.08PM.jpg?v=1777122827",
        "https://browncowsdairy.com/cdn/shop/files/DSC00456_fd027cac-92be-4484-9419-150a64572c9f.jpg?v=1777122828",
        "https://browncowsdairy.com/cdn/shop/files/DSC00458_33e91b5d-5aad-4922-a54c-a391e1a0e5c1.jpg?v=1777122828",
        "https://browncowsdairy.com/cdn/shop/files/IMG_20260326_234747.jpg?v=1777216098",
        "https://browncowsdairy.com/cdn/shop/files/DSC00465_5ea5cf30-1758-431c-911f-2b0fc0b4b715.jpg?v=1777216105",
        "https://browncowsdairy.com/cdn/shop/files/DSC08589.jpg?v=1777216110",
        "https://browncowsdairy.com/cdn/shop/files/DSC08604.jpg?v=1777216116",
        "https://browncowsdairy.com/cdn/shop/files/DSC08716.jpg?v=1777216113",
        "https://browncowsdairy.com/cdn/shop/files/DSC08760.jpg?v=1777216114",
        "https://browncowsdairy.com/cdn/shop/files/DSC08718.jpg?v=1776069148"
    ],
    videos: [
        "https://cdn.shopify.com/videos/c/vp/e936e986352347fcaf778348d7697152/e936e986352347fcaf778348d7697152.SD-480p-1.5Mbps-81429832.mp4"
    ],
    amenities: ["Traditional Mud Cottage", "Earthy Living", "Farm Experience", "Wifi", "AC", "Gym", "Firepit", "Breakfast Included", "Free Parking", "Pet Friendly"]
};

const limestoneVillaContent = {
    description: "Spacious duplex villa built with natural limestone, offering orchard views and modern comfort blended with rustic charm.\n\nDetails:\n- Up to 4 guests\n- 3 beds (1 king + 2 single)\n- 2 bathrooms\n- Duplex structure",
    location: "BrownCows Dairy Farm",
    price: 7999,
    capacity: 4,
    images: [
        "/images/Limestone/DSC00349.JPG",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC00331.jpg?v=1776069148",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC08697.jpg?v=1776069148",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_234705.jpg?v=1776069148",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_234413.jpg?v=1777215937",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_234423.jpg?v=1777215938",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/Narmada_restroom_1.jpg?v=1777215942",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/Narmada_restroom.jpg?v=1777215943",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC08718.jpg?v=1776069148"
    ],
    videos: [
        "https://cdn.shopify.com/videos/c/vp/e936e986352347fcaf778348d7697152/e936e986352347fcaf778348d7697152.SD-480p-1.5Mbps-81429832.mp4"
    ],
    amenities: ["Bath Tub", "Traditional Mud Cottage", "Earthy Living", "Farm Experience", "Wifi", "AC", "Gym", "Firepit", "Breakfast Included", "Free Parking", "Pet Friendly"]
};

const vineyardContent = {
    description: "Vineyard Farmstay in Talakondapalli, just 45 mins from the airport on Srisailam Highway. Enjoy a private, spacious bungalow surrounded by lush greenery, perfect for families, couples, and groups. Wake up to fresh air, relax with garden views, and unwind on the terrace. Ideal for quick weekend getaways with easy access and complete peace.\n\nRooms:\n- 3 bedrooms\n- 5 beds\n- Attached bathrooms\n\nFun Activities:\n- Board games: chess and ludo\n- Poker table\n- Play area",
    location: "Talakondapalli, Telangana",
    price: 22000,
    capacity: 12,
    images: [
        "/images/vineyard/IMG_20260326_223938.jpg",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC00531.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_231640.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_231401.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_231026.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_225731.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_225521.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_225434.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_225149.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_225358.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_224736.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_224501.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC00556.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_215033.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/IMG_20260326_214904.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC00528.jpg?v=1776068776",
        "https://cdn.shopify.com/s/files/1/0795/5064/4450/files/DSC00527.jpg?v=1776068776"
    ],
    videos: [
        "https://cdn.shopify.com/videos/c/vp/7c0e3478315a4beb9428d0c4052e3214/7c0e3478315a4beb9428d0c4052e3214.SD-480p-1.2Mbps-81256402.mp4"
    ],
    amenities: ["3 Bedrooms", "5 Beds", "Attached Bathrooms", "Private Bungalow", "Garden Views", "Terrace", "Board Games", "Chess", "Ludo", "Poker Table", "Play Area"]
};

const seedAll = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/farmstay';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        await Farm.deleteMany({});
        console.log('Cleared existing farms');

        const farms = [
            {
                title: "Vineyard Farm Stay",
                ...vineyardContent,
                category: "Farm",
                subCategory: "Vineyard",
                availability: "All Days"
            },
            {
                title: "Luxury Limestone Villa - 1",
                ...limestoneVillaContent,
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Luxury Limestone Villa - 2",
                ...limestoneVillaContent,
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Traditional Mud Cottage - 1",
                ...mudCottageContent,
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
            },
            {
                title: "Traditional Mud Cottage - 2",
                ...mudCottageContent,
                category: "Farm",
                subCategory: "Brown Cows Dairy",
                availability: "Monday to Friday"
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
