import { prisma } from "@/lib/prisma";
import MerchGrid from "@/components/MerchGrid";

async function getProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

const SEED_PRODUCTS = [
  {
    id: "seed1",
    name: "American Raffle Flag Tee",
    description: "Premium cotton t-shirt with American Raffle logo and stars & stripes design.",
    price: 29.99,
    image: "",
    category: "apparel",
  },
  {
    id: "seed2",
    name: "Patriot Trucker Hat",
    description: "Mesh-back trucker cap embroidered with American Raffle branding.",
    price: 24.99,
    image: "",
    category: "apparel",
  },
  {
    id: "seed3",
    name: "Stars & Stripes Hoodie",
    description: "Heavyweight fleece hoodie. Perfect for game days and cool evenings.",
    price: 59.99,
    image: "",
    category: "apparel",
  },
  {
    id: "seed4",
    name: "American Raffle Bumper Sticker",
    description: "Weatherproof vinyl sticker — show your patriotic pride everywhere.",
    price: 4.99,
    image: "",
    category: "accessories",
  },
  {
    id: "seed5",
    name: "Patriot Coffee Mug",
    description: "15oz ceramic mug with red, white & blue American Raffle design.",
    price: 19.99,
    image: "",
    category: "home",
  },
  {
    id: "seed6",
    name: "American Eagle Flag",
    description: "3×5 ft outdoor flag with brass grommets and fade-resistant printing.",
    price: 34.99,
    image: "",
    category: "home",
  },
  {
    id: "seed7",
    name: "Limited Edition Polo",
    description: "Classic pique polo shirt with embroidered American Raffle logo.",
    price: 49.99,
    image: "",
    category: "apparel",
  },
  {
    id: "seed8",
    name: "Raffle Sticker Pack (5)",
    description: "5-pack assorted patriotic stickers. Great for laptops, water bottles.",
    price: 9.99,
    image: "",
    category: "accessories",
  },
];

export default async function MerchPage() {
  const dbProducts = await getProducts();
  const products = dbProducts.length > 0 ? dbProducts : SEED_PRODUCTS;

  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        className="text-white py-20 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">🛍️ American Raffle Merch</h1>
        <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-4">
          Show your patriotic pride and earn free raffle tickets at the same time!
        </p>
        <div className="inline-block bg-yellow-400 text-black font-black px-6 py-2 rounded-full text-sm">
          ★ EARN 1 FREE TICKET FOR EVERY $25 SPENT ★
        </div>
      </section>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">Shop All Products</h2>
        <div className="stars-divider">★ ★ ★</div>

        <MerchGrid products={products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image ?? "",
          category: p.category,
        }))} />

        {/* Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="font-black text-lg mb-2" style={{ color: "#3C3B6E" }}>
            🎟️ How Merch Tickets Work
          </h3>
          <p className="text-gray-600">
            For every $25 you spend in the merch store, you receive 1 free ticket in the current active raffle.
            Tickets are credited to your account within 24 hours of your order being confirmed.
            Must have an account to receive free tickets.
          </p>
        </div>
      </div>
    </div>
  );
}
