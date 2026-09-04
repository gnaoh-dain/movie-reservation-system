import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { env } from "../src/configs/env";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

const movies = [
  { title: "The Godfather", year: 1972, genre: "Crime", description: "The youngest son of a New York mafia boss reluctantly takes over the family crime empire." },
  { title: "Spirited Away", year: 2001, genre: "Animation", description: "Young Chihiro is trapped in a spirit world and must work at a witch's bathhouse to save her parents." },
  { title: "The Dark Knight", year: 2008, genre: "Action", description: "Batman faces the Joker, an anarchist who drags Gotham into a moral crisis." },
  { title: "Inception", year: 2010, genre: "Sci-Fi", description: "A thief who steals secrets through dreams is hired to plant an idea in a target's subconscious." },
  { title: "Interstellar", year: 2014, genre: "Sci-Fi", description: "Astronauts travel through a wormhole in search of a new home as Earth slowly dies." },
  { title: "Mad Max: Fury Road", year: 2015, genre: "Action", description: "In a post-apocalyptic desert, Max and Furiosa flee from the tyrant Immortan Joe." },
  { title: "La La Land", year: 2016, genre: "Romance", description: "A jazz pianist and an aspiring actress fall in love in Los Angeles, torn between romance and ambition." },
  { title: "Get Out", year: 2017, genre: "Horror", description: "A Black man visits his girlfriend's family and uncovers a horrifying truth behind their hospitality." },
  { title: "Parasite", year: 2019, genre: "Thriller", description: "A poor family infiltrates a wealthy household one by one, until the secret in the basement surfaces." },
  { title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi", description: "An immigrant laundromat owner hops across parallel universes to save reality itself." },
];

async function main() {
  const genreIds = new Map<string, string>();
  for (const name of new Set(movies.map((m) => m.genre))) {
    const genre = await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
    genreIds.set(name, genre.id);
  }

  // ponytail: idempotent by skipping when movies already exist; use `pnpm db:reset` to start over.
  if ((await prisma.movie.count()) > 0) {
    console.log("Movies already seeded, skipping.");
    return;
  }

  await prisma.movie.createMany({
    data: movies.map((m) => ({
      title: m.title,
      description: `${m.description} (${m.year})`,
      posterUrl: `https://placehold.co/300x450?text=${encodeURIComponent(m.title)}`,
      genreId: genreIds.get(m.genre)!,
    })),
  });
  console.log(`Seeded ${movies.length} movies across ${genreIds.size} genres.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
