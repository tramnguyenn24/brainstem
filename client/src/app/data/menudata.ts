import images from "../img/index";
const menuArray =[
    {
      id : 1,
      category: "STARTERS",
      name: "SPRING ROLLS",
      price: "$16.00",
      description: "Crispy rolls filled with vegetables, served with dipping sauce.",
      image: images.starters1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 2,
      category: "STARTERS",
      name: "ALOO TIKKI",
      price: "$12.00",
      description: "Golden potato patties served with chutney.",
      image: images.starters2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 3,
      category: "STARTERS",
      name: "PANEER TIKKA",
      price: "$26.00",
      description: "Grilled paneer cubes, spiced to perfection",
      image: images.starters3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 4,
      category: "STARTERS",
      name: "HARA KEBAB",
      price: "$12.00",
      description: "Green vegetable and herb kebabs, grilled to perfection.",
      image: images.starters1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 5,
      category: "STARTERS",
      name: "CHILI MUSHROOMS",
      price: "$10.00",
      description: "Spicy, crispy mushrooms with a tangy twist.",
      image: images.starters2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 6,
      category: "STARTERS",
      name: "VEG PAKORAS",
      price: "$12.00",
      description: "Crispy vegetable fritters with a dip.",
      image: images.starters3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 7,
      category: "VEGETABLES",
      name: "VEG BIRYANI",
      price: "$06.00",
      description: "Octopus Fennel pairs tender octopus with fresh fennel.",
      image: images.vegetables1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 8,
      category: "VEGETABLES",
      name: "BAINGAN BHARTA",
      price: "$10.00",
      description: "Crispy, freshly made chips paired with rich, flavorful dips.",
      image: images.vegetables2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 9,
      category: "VEGETABLES",
      name: "PANEER BUTTER",
      price: "$06.00",
      description: "Corn Tostada offers a crunchy base with tasty toppings.",
      image: images.vegetables3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 10,
      category: "VEGETABLES",
      name: "PALAK PANEER",
      price: "$08.00",
      description: "Zesty Rolls are filled with vibrant flavors wrapped in a crispy.",
      image: images.vegetables4,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 11,
      category: "VEGETABLES",
      name: "ALOO GOBI",
      price: "$10.00",
      description: "Spicy Bites features crispy, flavorful snacks with a bold, spicy kick.",
      image: images.vegetables5,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 12,
      category: "VEGETABLES",
      name: "VEG. CURRY",
      price: "$08.00",
      description: "Fire Grill offers perfectly charred, smoky-flavored dishes.",
      image: images.vegetables1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 13,
      category: "SEAFOOD",
      name: "GRILLED SALMON",
      price: "$12.99",
      description: "Octopus Fennel pairs tender octopus with fresh fennel.",
      image: images.seafood1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 14,
      category: "SEAFOOD",
      name: "CALAMARI RINGS",
      price: "$05.00",
      description: "Crispy, freshly made chips paired with rich, flavorful dips.",
      image: images.seafood2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 15,
      category: "SEAFOOD",
      name: "SHRIMP MASALA",
      price: "$09.10",
      description: "Corn Tostada offers a crunchy base with tasty toppings.",
      image: images.seafood3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 16,
      category: "SEAFOOD",
      name: "LOBSTER ROLL",
      price: "$12.99",
      description: "Zesty Rolls are filled with vibrant flavors wrapped in a crispy.",
      image: images.seafood4,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 17,
      category: "SEAFOOD",
      name: "FISH TACOS",
      price: "$12.10",
      description: "Spicy Bites features crispy, flavorful snacks with a bold, spicy kick.",
      image: images.seafood5,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 18,
      category: "SEAFOOD",
      name: "FISH CURRY",
      price: "$18.50",
      description: "Fire Grill offers perfectly charred, smoky-flavored dishes.",
      image: images.seafood6,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 19,
      category: "DESSERTS",
      name: "CHOCO LAVA CAKE",
      price: "$06.99",
      description: "Warm, gooey chocolate cake with a molten center.",
      image: images.deserts1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 20,
      category: "DESSERTS",
      name: "GULAB JAMUN",
      price: "$15.00",
      description: "Soft, syrup-soaked Indian sweet dumplings.",
      image: images.deserts2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 21,
      category: "DESSERTS",
      name: "TIRAMISU",
      price: "$16.00",
      description: "A creamy, coffee-flavored Italian classic.",
      image: images.deserts3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 22,
      category: "DESSERTS",
      name: "VANILLA PANNA",
      price: "$12.99",
      description: "Creamy, silky dessert with a hint of vanilla..",
      image: images.deserts4,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 23,
      category: "DESSERTS",
      name: "BERRY CAKE",
      price: "$10.00",
      description: "Smooth cheesecake topped with fresh berries.",
      image: images.deserts5,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 24,
      category: "DESSERTS",
      name: "APPLE PIE",
      price: "$22.00",
      description: "Warm, spiced apple filling in a flaky crust.",
      image: images.deserts6,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 25,
      category: "BEVERAGES",
      name: "MANGO LASSI",
      price: "$04.50",
      description: "A refreshing yogurt-based mango drink.",
      image: images.beverages1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 26,
      category: "BEVERAGES",
      name: "MASALA CHAI",
      price: "$05.50",
      description: "Spiced Indian tea with a bold flavor.",
      image: images.beverages2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 27,
      category: "BEVERAGES",
      name: "ICED COFFEE",
      price: "$07.99",
      description: "Chilled coffee with a smooth, rich flavor",
      image: images.beverages3,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 28,
      category: "BEVERAGES",
      name: "MINT MOJITO",
      price: "$04.99",
      description: "A cool, minty drink with a citrus kick.",
      image: images.beverages4,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 29,
      category: "BEVERAGES",
      name: "LEMONADE",
      price: "$05.10",
      description: "Sweet and tangy homemade lemonade.",
      image: images.beverages5,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 30,
      category: "BEVERAGES",
      name: "COCONUT WATER",
      price: "$03.99",
      description: "Naturally refreshing and hydrating coconut water.",
      image: images.beverages1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 31,
      category: "SALADS & SOUPS",
      name: "GREEK SALAD",
      price: "$06.00",
      description: "A fresh mix of cucumbers, olives, feta, and tomatoes drizzled.",
      image: images.salad1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 32,
      category: "SALADS & SOUPS",
      name: "MINESTRONE SOUP",
      price: "$05.00",
      description: "Hearty vegetable soup with pasta and beans in a savory broth.",
      image: images.salad2,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 33,
      category: "SALADS & SOUPS",
      name: "CAESAR SALAD",
      price: "$06.00",
      description: "Crisp lettuce, creamy dressing, croutons, and parmesan cheese",
      image: images.salad1,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 34,
      category: "SALADS & SOUPS",
      name: "CHICKEN SALAD",
      price: "$08.00",
      description: "Grilled chicken, mixed greens, avocado, and a tangy dressing.",
      image: images.salad4,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 35,
      category: "SALADS & SOUPS",
      name: "TOMATO SOUP",
      price: "$10.00",
      description: "A rich, velvety tomato soup with a hint of basil.",
      image:images.salad5,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
    {
      id : 36,
      category: "SALADS & SOUPS",
      name: "SWEET CORN SOUP",
      price: "$08.00",
      description: "A warm and comforting corn-based soup with mild spices.",
      image: images.salad6,
      options: [
        { title: "Extra Paneer", additionalPrice: 5 },
        { title: "Garlic Butter", additionalPrice: 2 }
      ]
    },
  ];

export default menuArray;