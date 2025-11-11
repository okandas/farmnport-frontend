// MongoDB Script to Insert Farm Produce with Category Links
// Run this script using: docker exec mongodb mongosh -u root -p example --authenticationDatabase admin dev --file /path/to/farmProduceInsert.js

// First, get all categories
const categories = db.farmProduceCategories.find().toArray();

// Create a map of category slugs to IDs for easy lookup
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.slug] = cat._id;
});

// Define all farm produce items with their category slugs
const farmProduceItems = [
  // Livestock
  { name: 'Cattle', slug: 'cattle', description: 'Beef cattle for meat production', category_slug: 'livestock' },
  { name: 'Pigs', slug: 'pigs', description: 'Swine for pork production', category_slug: 'livestock' },
  { name: 'Sheep', slug: 'sheep', description: 'Sheep for mutton and wool', category_slug: 'livestock' },
  { name: 'Goats', slug: 'goats', description: 'Goats for meat and milk', category_slug: 'livestock' },
  { name: 'Chickens (Broilers)', slug: 'chickens-broilers', description: 'Chickens raised for meat', category_slug: 'livestock' },
  { name: 'Chickens (Layers)', slug: 'chickens-layers', description: 'Chickens raised for egg production', category_slug: 'livestock' },
  { name: 'Ducks', slug: 'ducks', description: 'Ducks for meat and eggs', category_slug: 'livestock' },
  { name: 'Turkeys', slug: 'turkeys', description: 'Turkeys for meat production', category_slug: 'livestock' },
  { name: 'Rabbits', slug: 'rabbits', description: 'Rabbits for meat production', category_slug: 'livestock' },
  { name: 'Ostriches', slug: 'ostriches', description: 'Ostriches for meat and leather', category_slug: 'livestock' },

  // Meat & Poultry
  { name: 'Beef', slug: 'beef', description: 'Processed beef meat', category_slug: 'meat-poultry' },
  { name: 'Pork', slug: 'pork', description: 'Processed pork meat', category_slug: 'meat-poultry' },
  { name: 'Mutton', slug: 'mutton', description: 'Processed sheep meat', category_slug: 'meat-poultry' },
  { name: 'Goat Meat', slug: 'goat-meat', description: 'Processed goat meat', category_slug: 'meat-poultry' },
  { name: 'Chicken Meat', slug: 'chicken-meat', description: 'Processed chicken meat', category_slug: 'meat-poultry' },
  { name: 'Duck Meat', slug: 'duck-meat', description: 'Processed duck meat', category_slug: 'meat-poultry' },
  { name: 'Turkey Meat', slug: 'turkey-meat', description: 'Processed turkey meat', category_slug: 'meat-poultry' },
  { name: 'Ostrich Meat', slug: 'ostrich-meat', description: 'Processed ostrich meat', category_slug: 'meat-poultry' },

  // Dairy & Eggs
  { name: 'Milk (Raw)', slug: 'milk-raw', description: 'Fresh raw milk', category_slug: 'dairy-eggs' },
  { name: 'Cheese', slug: 'cheese', description: 'Dairy cheese products', category_slug: 'dairy-eggs' },
  { name: 'Yogurt', slug: 'yogurt', description: 'Dairy yogurt products', category_slug: 'dairy-eggs' },
  { name: 'Butter', slug: 'butter', description: 'Dairy butter', category_slug: 'dairy-eggs' },
  { name: 'Chicken Eggs', slug: 'chicken-eggs', description: 'Fresh chicken eggs', category_slug: 'dairy-eggs' },
  { name: 'Duck Eggs', slug: 'duck-eggs', description: 'Fresh duck eggs', category_slug: 'dairy-eggs' },

  // Grains & Cereals
  { name: 'Maize/Corn', slug: 'maize-corn', description: 'Corn grain', category_slug: 'grains-cereals' },
  { name: 'Wheat', slug: 'wheat', description: 'Wheat grain', category_slug: 'grains-cereals' },
  { name: 'Sorghum', slug: 'sorghum', description: 'Sorghum grain', category_slug: 'grains-cereals' },
  { name: 'Barley', slug: 'barley', description: 'Barley grain', category_slug: 'grains-cereals' },
  { name: 'Oats', slug: 'oats', description: 'Oat grain', category_slug: 'grains-cereals' },
  { name: 'Rice', slug: 'rice', description: 'Rice grain', category_slug: 'grains-cereals' },
  { name: 'Millet', slug: 'millet', description: 'Millet grain', category_slug: 'grains-cereals' },

  // Oilseeds & Legumes
  { name: 'Soybeans', slug: 'soybeans', description: 'Soybean crop', category_slug: 'oilseeds-legumes' },
  { name: 'Sunflower', slug: 'sunflower', description: 'Sunflower seeds', category_slug: 'oilseeds-legumes' },
  { name: 'Groundnuts/Peanuts', slug: 'groundnuts-peanuts', description: 'Peanut crop', category_slug: 'oilseeds-legumes' },
  { name: 'Dry Beans', slug: 'dry-beans', description: 'Dried bean legumes', category_slug: 'oilseeds-legumes' },
  { name: 'Lentils', slug: 'lentils', description: 'Lentil legumes', category_slug: 'oilseeds-legumes' },
  { name: 'Chickpeas', slug: 'chickpeas', description: 'Chickpea legumes', category_slug: 'oilseeds-legumes' },

  // Vegetables
  { name: 'Potatoes', slug: 'potatoes', description: 'Fresh potatoes', category_slug: 'vegetables' },
  { name: 'Sweet Potatoes', slug: 'sweet-potatoes', description: 'Fresh sweet potatoes', category_slug: 'vegetables' },
  { name: 'Tomatoes', slug: 'tomatoes', description: 'Fresh tomatoes', category_slug: 'vegetables' },
  { name: 'Onions', slug: 'onions', description: 'Fresh onions', category_slug: 'vegetables' },
  { name: 'Cabbage', slug: 'cabbage', description: 'Fresh cabbage', category_slug: 'vegetables' },
  { name: 'Carrots', slug: 'carrots', description: 'Fresh carrots', category_slug: 'vegetables' },
  { name: 'Butternut', slug: 'butternut', description: 'Fresh butternut squash', category_slug: 'vegetables' },
  { name: 'Pumpkins', slug: 'pumpkins', description: 'Fresh pumpkins', category_slug: 'vegetables' },
  { name: 'Peppers', slug: 'peppers', description: 'Fresh peppers', category_slug: 'vegetables' },
  { name: 'Lettuce', slug: 'lettuce', description: 'Fresh lettuce', category_slug: 'vegetables' },
  { name: 'Spinach', slug: 'spinach', description: 'Fresh spinach', category_slug: 'vegetables' },
  { name: 'Beetroot', slug: 'beetroot', description: 'Fresh beetroot', category_slug: 'vegetables' },
  { name: 'Cauliflower', slug: 'cauliflower', description: 'Fresh cauliflower', category_slug: 'vegetables' },
  { name: 'Broccoli', slug: 'broccoli', description: 'Fresh broccoli', category_slug: 'vegetables' },
  { name: 'Cucumbers', slug: 'cucumbers', description: 'Fresh cucumbers', category_slug: 'vegetables' },
  { name: 'Green Beans', slug: 'green-beans', description: 'Fresh green beans', category_slug: 'vegetables' },

  // Fruits
  { name: 'Oranges', slug: 'oranges', description: 'Fresh oranges', category_slug: 'fruits' },
  { name: 'Apples', slug: 'apples', description: 'Fresh apples', category_slug: 'fruits' },
  { name: 'Bananas', slug: 'bananas', description: 'Fresh bananas', category_slug: 'fruits' },
  { name: 'Avocados', slug: 'avocados', description: 'Fresh avocados', category_slug: 'fruits' },
  { name: 'Mangoes', slug: 'mangoes', description: 'Fresh mangoes', category_slug: 'fruits' },
  { name: 'Grapes', slug: 'grapes', description: 'Fresh grapes', category_slug: 'fruits' },
  { name: 'Strawberries', slug: 'strawberries', description: 'Fresh strawberries', category_slug: 'fruits' },
  { name: 'Peaches', slug: 'peaches', description: 'Fresh peaches', category_slug: 'fruits' },
  { name: 'Plums', slug: 'plums', description: 'Fresh plums', category_slug: 'fruits' },
  { name: 'Lemons', slug: 'lemons', description: 'Fresh lemons', category_slug: 'fruits' },
  { name: 'Pears', slug: 'pears', description: 'Fresh pears', category_slug: 'fruits' },
  { name: 'Watermelons', slug: 'watermelons', description: 'Fresh watermelons', category_slug: 'fruits' },
  { name: 'Litchis', slug: 'litchis', description: 'Fresh litchis', category_slug: 'fruits' },
  { name: 'Papayas', slug: 'papayas', description: 'Fresh papayas', category_slug: 'fruits' },

  // Herbs & Spices
  { name: 'Garlic', slug: 'garlic', description: 'Fresh garlic', category_slug: 'herbs-spices' },
  { name: 'Ginger', slug: 'ginger', description: 'Fresh ginger root', category_slug: 'herbs-spices' },
  { name: 'Chillies', slug: 'chillies', description: 'Fresh chillies', category_slug: 'herbs-spices' },
  { name: 'Coriander', slug: 'coriander', description: 'Fresh coriander', category_slug: 'herbs-spices' },
  { name: 'Basil', slug: 'basil', description: 'Fresh basil', category_slug: 'herbs-spices' },
  { name: 'Mint', slug: 'mint', description: 'Fresh mint', category_slug: 'herbs-spices' },
  { name: 'Thyme', slug: 'thyme', description: 'Fresh thyme', category_slug: 'herbs-spices' },
  { name: 'Rosemary', slug: 'rosemary', description: 'Fresh rosemary', category_slug: 'herbs-spices' },
  { name: 'Parsley', slug: 'parsley', description: 'Fresh parsley', category_slug: 'herbs-spices' },

  // Nuts
  { name: 'Macadamia Nuts', slug: 'macadamia-nuts', description: 'Macadamia nuts', category_slug: 'nuts' },
  { name: 'Pecans', slug: 'pecans', description: 'Pecan nuts', category_slug: 'nuts' },
  { name: 'Almonds', slug: 'almonds', description: 'Almond nuts', category_slug: 'nuts' },
  { name: 'Walnuts', slug: 'walnuts', description: 'Walnut nuts', category_slug: 'nuts' },

  // Industrial Crops
  { name: 'Sugarcane', slug: 'sugarcane', description: 'Sugarcane crop', category_slug: 'industrial-crops' },
  { name: 'Cotton', slug: 'cotton', description: 'Cotton crop', category_slug: 'industrial-crops' },
  { name: 'Tobacco', slug: 'tobacco', description: 'Tobacco crop', category_slug: 'industrial-crops' },
  { name: 'Coffee', slug: 'coffee', description: 'Coffee beans', category_slug: 'industrial-crops' },
  { name: 'Tea', slug: 'tea', description: 'Tea leaves', category_slug: 'industrial-crops' },

  // Animal Feed
  { name: 'Lucerne/Alfalfa', slug: 'lucerne-alfalfa', description: 'Alfalfa feed', category_slug: 'animal-feed' },
  { name: 'Hay', slug: 'hay', description: 'Dried grass hay', category_slug: 'animal-feed' },
  { name: 'Silage', slug: 'silage', description: 'Fermented feed', category_slug: 'animal-feed' },

  // Aquaculture
  { name: 'Tilapia', slug: 'tilapia', description: 'Tilapia fish', category_slug: 'aquaculture' },
  { name: 'Trout', slug: 'trout', description: 'Trout fish', category_slug: 'aquaculture' },
  { name: 'Catfish', slug: 'catfish', description: 'Catfish', category_slug: 'aquaculture' },

  // Other
  { name: 'Honey', slug: 'honey', description: 'Natural honey', category_slug: 'other' },
  { name: 'Flowers (Cut Flowers)', slug: 'flowers-cut-flowers', description: 'Cut flowers for decoration', category_slug: 'other' },
  { name: 'Mushrooms', slug: 'mushrooms', description: 'Edible mushrooms', category_slug: 'other' },
];

// Map items to include category_id instead of category_slug
const itemsToInsert = farmProduceItems.map(item => {
  const categoryId = categoryMap[item.category_slug];
  if (!categoryId) {
    print(`Warning: Category not found for slug: ${item.category_slug}`);
    return null;
  }
  return {
    name: item.name,
    slug: item.slug,
    description: item.description,
    category_id: categoryId,
    category_slug: item.category_slug
  };
}).filter(item => item !== null);

// Drop existing collection if it exists
db.farmProduce.drop();

// Insert all items
const result = db.farmProduce.insertMany(itemsToInsert);

print(`Successfully inserted ${result.insertedIds ? Object.keys(result.insertedIds).length : 0} farm produce items`);

// Verify the insertion
print('\nVerifying insertion...');
db.farmProduce.aggregate([
  {
    $group: {
      _id: "$category_slug",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]).forEach(doc => {
  print(`${doc._id}: ${doc.count} items`);
});

print(`\nTotal items: ${db.farmProduce.countDocuments()}`);
