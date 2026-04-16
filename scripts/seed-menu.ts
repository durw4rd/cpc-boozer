import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { venues, venueMenuItems } from '../src/lib/db/schema';
import 'dotenv/config';

const VENUE_NAME = 'Pie-nong Thai';

const menu = [
  {
    category: 'Starters',
    dishes: [
      { name: 'Koeng Hom Pla (Kung Hom Pla)', description_en: 'Thai spring rolls with shrimps', versions: [{ menu_number: '1', protein: 'shrimps', price_eur: 8.00 }] },
      { name: 'Saté Kai (Satay Kai)', description_en: 'Marinated chicken satay', versions: [{ menu_number: '2', protein: 'chicken', price_eur: 9.00 }] },
      { name: 'Som Tam Thai', description_en: 'Thai papaya salad with vegetables and lemon', versions: [{ menu_number: '3', protein: 'vegetarian', price_eur: 14.00 }] },
      { name: 'Poh Pia Tod', description_en: 'Thai spring rolls', versions: [{ menu_number: '4', protein: 'vegetables', price_eur: 2.70 }, { menu_number: '4.1', protein: 'chicken', price_eur: 2.50 }] },
      { name: 'Tod Man Pla (Tod Mun Pla)', description_en: 'Fried fishcakes', versions: [{ menu_number: '5', protein: 'fish', price_eur: 8.00 }] }
    ]
  },
  {
    category: 'Soups',
    dishes: [
      { name: 'Kuai Tiew Kai (Kuatiao Khua Kai)', description_en: 'Thai mini noodle soup with chicken and vegetables', versions: [{ menu_number: '6', protein: 'chicken', price_eur: 9.50 }] },
      { name: 'Tom Yam (Tom Yum)', description_en: 'Spicy soup with mushroom and lemon', versions: [{ menu_number: '7', protein: 'tofu', price_eur: 7.00 }, { menu_number: '8', protein: 'chicken', price_eur: 7.50 }, { menu_number: '9', protein: 'shrimps', price_eur: 8.50 }, { menu_number: '10', protein: 'fish', price_eur: 8.00 }] },
      { name: 'Vegetable Soup', description_en: 'Soup with vegetables', versions: [{ menu_number: '11', protein: 'tofu', price_eur: 7.00 }, { menu_number: '12', protein: 'chicken', price_eur: 7.50 }, { menu_number: '13', protein: 'shrimps', price_eur: 8.50 }, { menu_number: '14', protein: 'fish', price_eur: 8.00 }] },
      { name: 'Tom Kha Kai', description_en: 'Mild soup with coconut milk', versions: [{ menu_number: '15', protein: 'tofu', price_eur: 7.00 }, { menu_number: '16', protein: 'chicken', price_eur: 7.50 }, { menu_number: '17', protein: 'shrimps', price_eur: 8.50 }, { menu_number: '18', protein: 'fish', price_eur: 8.00 }] },
      { name: 'Tom Yam Talay (Tom Yum Talay)', description_en: 'Spicy soup with mixed seafood', versions: [{ menu_number: '19', protein: 'mixed seafood', price_eur: 10.00 }] }
    ]
  },
  {
    category: 'Spicy Salads',
    dishes: [
      { name: 'Yam', description_en: 'Spicy salad with vegetables and lemon', versions: [{ menu_number: '20', protein: 'glass noodles', price_eur: 16.50 }, { menu_number: '21', protein: 'chicken', price_eur: 17.50 }, { menu_number: '22', protein: 'beef', price_eur: 19.00 }, { menu_number: '23', protein: 'squid', price_eur: 21.00 }, { menu_number: '24', protein: 'shrimps', price_eur: 20.50 }, { menu_number: '25', protein: 'mixed seafood', price_eur: 24.00 }] },
      { name: 'Laap', description_en: 'Finely chopped meat with mint and lemon', versions: [{ menu_number: '26', protein: 'chicken', price_eur: 17.50 }, { menu_number: '27', protein: 'beef', price_eur: 19.00 }] }
    ]
  },
  {
    category: 'Dishes with white rice',
    dishes: [
      { name: 'Chu Chi', description_en: 'With red curry sauce', versions: [{ menu_number: '29', protein: 'shrimps', price_eur: 20.00 }, { menu_number: '30', protein: 'fish', price_eur: 20.00 }] },
      { name: 'Keng Paneng (Kaeng Panang)', description_en: 'With coconut milk in panang curry sauce', versions: [{ menu_number: '31', protein: 'tofu', price_eur: 16.00 }, { menu_number: '32', protein: 'chicken', price_eur: 17.00 }, { menu_number: '34', protein: 'beef', price_eur: 18.50 }, { menu_number: '35', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Ka Prauw', description_en: 'With fresh Thai chilli pepper, onion and basil', versions: [{ menu_number: '36', protein: 'tofu', price_eur: 16.00 }, { menu_number: '37', protein: 'chicken', price_eur: 17.00 }, { menu_number: '39', protein: 'beef', price_eur: 18.50 }, { menu_number: '40', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Met Ma Muang', description_en: 'With vegetables and cashew nuts', versions: [{ menu_number: '41', protein: 'tofu', price_eur: 16.00 }, { menu_number: '42', protein: 'chicken', price_eur: 17.00 }, { menu_number: '44', protein: 'beef', price_eur: 18.50 }, { menu_number: '45', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Naam Man Hoi', description_en: 'With vegetables in oyster sauce', versions: [{ menu_number: '46', protein: 'tofu', price_eur: 15.50 }, { menu_number: '47', protein: 'chicken', price_eur: 16.50 }, { menu_number: '49', protein: 'beef', price_eur: 18.00 }, { menu_number: '50', protein: 'shrimps', price_eur: 19.50 }] },
      { name: 'Pad Ped', description_en: 'With red curry sauce and long beans', versions: [{ menu_number: '51', protein: 'tofu', price_eur: 16.00 }, { menu_number: '52', protein: 'chicken', price_eur: 17.00 }, { menu_number: '54', protein: 'beef', price_eur: 18.50 }, { menu_number: '55', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Prik Sod', description_en: 'With big fresh chillis in sauce', versions: [{ menu_number: '56', protein: 'tofu', price_eur: 16.00 }, { menu_number: '57', protein: 'chicken', price_eur: 17.00 }, { menu_number: '59', protein: 'beef', price_eur: 18.50 }, { menu_number: '60', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Keng Khiaw Whaan', description_en: 'With coconut milk in green curry sauce', versions: [{ menu_number: '62', protein: 'tofu', price_eur: 16.00 }, { menu_number: '63', protein: 'chicken', price_eur: 17.00 }, { menu_number: '65', protein: 'beef', price_eur: 18.50 }, { menu_number: '66', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Keng Ped', description_en: 'With coconut milk in red curry sauce', versions: [{ menu_number: '68', protein: 'tofu', price_eur: 16.00 }, { menu_number: '69', protein: 'chicken', price_eur: 17.00 }, { menu_number: '70', protein: 'beef', price_eur: 18.50 }, { menu_number: '71', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Kra Thiam', description_en: 'With garlic and peppers', versions: [{ menu_number: '72', protein: 'tofu', price_eur: 16.00 }, { menu_number: '73', protein: 'chicken', price_eur: 17.00 }, { menu_number: '75', protein: 'beef', price_eur: 20.00 }, { menu_number: '77', protein: 'shrimps', price_eur: 20.00 }, { menu_number: '78', protein: 'fish', price_eur: 22.00 }, { menu_number: '78.1', protein: 'squid', price_eur: 21.00 }] },
      { name: 'Kaeng Massaman', description_en: 'With coconut milk in dark curry, potatoes and peanuts', versions: [{ menu_number: '79', protein: 'tofu', price_eur: 16.00 }, { menu_number: '80', protein: 'chicken', price_eur: 17.00 }, { menu_number: '81', protein: 'beef', price_eur: 18.50 }, { menu_number: '82', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Khing', description_en: 'With fine sliced ginger', versions: [{ menu_number: '83', protein: 'tofu', price_eur: 16.00 }, { menu_number: '84', protein: 'chicken', price_eur: 17.00 }, { menu_number: '86', protein: 'beef', price_eur: 18.50 }, { menu_number: '87', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Priew Wan', description_en: 'With vegetables in sweet sour sauce', versions: [{ menu_number: '88', protein: 'tofu', price_eur: 16.00 }, { menu_number: '89', protein: 'chicken', price_eur: 17.00 }, { menu_number: '91', protein: 'beef', price_eur: 18.50 }, { menu_number: '92', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Keng Karië', description_en: 'With coconut milk in yellow curry sauce', versions: [{ menu_number: '93', protein: 'tofu', price_eur: 16.00 }, { menu_number: '94', protein: 'chicken', price_eur: 17.00 }, { menu_number: '96', protein: 'beef', price_eur: 18.50 }, { menu_number: '97', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Pad Pak Ruam Mit', description_en: 'Fried mixed vegetables', versions: [{ menu_number: '98', protein: 'tofu', price_eur: 15.50 }, { menu_number: '99', protein: 'chicken', price_eur: 16.50 }, { menu_number: '101', protein: 'beef', price_eur: 18.00 }, { menu_number: '102', protein: 'shrimps', price_eur: 19.50 }] },
      { name: 'Kauw Pad', description_en: 'Fried rice with vegetables', versions: [{ menu_number: '103', protein: 'tofu', price_eur: 15.00 }, { menu_number: '104', protein: 'chicken', price_eur: 16.00 }, { menu_number: '106', protein: 'beef', price_eur: 17.50 }, { menu_number: '107', protein: 'shrimps', price_eur: 19.00 }] }
    ]
  },
  {
    category: 'Dishes with noodles',
    dishes: [
      { name: 'Pad Thai Pie-Nong Thai', description_en: 'Fried Thai noodles with chicken, beef, seafood and peanuts (our speciality)', versions: [{ menu_number: '61', protein: 'mixed (chicken, beef, seafood)', price_eur: 24.00 }] },
      { name: 'Pad Thai', description_en: 'Fried noodles with vegetables and peanuts', versions: [{ menu_number: '108', protein: 'tofu', price_eur: 16.00 }, { menu_number: '109', protein: 'chicken', price_eur: 17.00 }, { menu_number: '111', protein: 'beef', price_eur: 18.50 }, { menu_number: '112', protein: 'shrimps', price_eur: 20.00 }] },
      { name: 'Mie Pad', description_en: 'Fried noodle with eggs and vegetables', versions: [{ menu_number: '113', protein: 'tofu', price_eur: 15.50 }, { menu_number: '114', protein: 'chicken', price_eur: 16.50 }, { menu_number: '116', protein: 'beef', price_eur: 18.00 }, { menu_number: '117', protein: 'shrimps', price_eur: 19.50 }] },
      { name: 'Pad Siew', description_en: 'Fried Thai noodles with vegetables', versions: [{ menu_number: '118', protein: 'tofu', price_eur: 15.50 }, { menu_number: '119', protein: 'chicken', price_eur: 16.50 }, { menu_number: '121', protein: 'beef', price_eur: 18.00 }, { menu_number: '122', protein: 'shrimps', price_eur: 19.50 }] },
      { name: 'Raad Na', description_en: 'Thai noodles with vegetables', versions: [{ menu_number: '123', protein: 'tofu', price_eur: 16.00 }, { menu_number: '124', protein: 'chicken', price_eur: 17.00 }, { menu_number: '126', protein: 'beef', price_eur: 18.50 }, { menu_number: '127', protein: 'shrimps', price_eur: 20.00 }] }
    ]
  }
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const venue = await db.select({ id: venues.id }).from(venues).where(eq(venues.name, VENUE_NAME)).limit(1);
  if (!venue[0]) {
    console.error(`Venue "${VENUE_NAME}" not found. Create it in the app first.`);
    process.exit(1);
  }
  const venueId = venue[0].id;

  await db.delete(venueMenuItems).where(eq(venueMenuItems.venueId, venueId));
  console.log('Cleared existing menu items.');

  let sortOrder = 0;
  for (const cat of menu) {
    for (const dish of cat.dishes) {
      for (const version of dish.versions) {
        await db.insert(venueMenuItems).values({
          venueId,
          category: cat.category,
          dishName: dish.name,
          descriptionEn: dish.description_en,
          menuNumber: String(version.menu_number),
          protein: version.protein,
          priceEur: String(version.price_eur),
          sortOrder: sortOrder++
        });
      }
    }
  }
  console.log(`Seeded ${sortOrder} menu items for "${VENUE_NAME}".`);
}

main().catch(console.error);
