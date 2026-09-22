import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const db = new PrismaClient();

function slug(text: string) {
  return slugify(text, { lower: true, strict: true, locale: "pt" });
}

async function main() {
  console.log("Seeding database...");

  // Passwords come from the environment so they never live in the repo.
  const adminPlain = process.env.SEED_ADMIN_PASSWORD;
  const userPlain = process.env.SEED_USER_PASSWORD;
  if (!adminPlain || !userPlain || adminPlain.length < 12 || userPlain.length < 12) {
    throw new Error(
      "Defina SEED_ADMIN_PASSWORD e SEED_USER_PASSWORD (mínimo 12 caracteres) no .env antes de rodar o seed."
    );
  }

  const adminPassword = await bcrypt.hash(adminPlain, 12);
  const userPassword = await bcrypt.hash(userPlain, 12);

  const admin = await db.user.upsert({
    where: { email: "admin@conectax.local" },
    update: {},
    create: {
      name: "Administradora ConectaX",
      email: "admin@conectax.local",
      passwordHash: adminPassword,
      role: "ADMIN",
      bio: "Mantendo a comunidade organizada.",
    },
  });

  const member = await db.user.upsert({
    where: { email: "usuario@conectax.local" },
    update: {},
    create: {
      name: "Usuário Exemplo",
      email: "usuario@conectax.local",
      passwordHash: userPassword,
      role: "USER",
      bio: "Aprendendo todos os dias.",
    },
  });

  // --- Categories ---------------------------------------------------------
  const techCategoryNames = [
    "Programação e IA",
    "Migração de carreira",
    "Segurança",
    "Ferramentas",
    "Carreira em tecnologia",
    "Vagas",
  ];
  const bookCategoryNames = ["Recomendações", "Resenhas", "Resumos", "Discussões"];
  const languageCategoryNames = ["Vocabulário", "Gramática", "Pronúncia", "Dicas"];
  const forumCategoryNames = [
    "Tecnologia",
    "Programação",
    "Inteligência Artificial",
    "Livros",
    "Idiomas",
    "Carreira",
    "Dúvidas",
    "Off-topic",
  ];

  async function upsertCategories(names: string[], moduleName: "TECNOLOGIA" | "LIVROS" | "IDIOMAS" | "FORUM") {
    const categories = [];
    for (const name of names) {
      const category = await db.category.upsert({
        where: { slug: slug(name) },
        update: {},
        create: { name, slug: slug(name), module: moduleName },
      });
      categories.push(category);
    }
    return categories;
  }

  const [techCategories, bookCategories, languageCategories, forumCategories] = await Promise.all([
    upsertCategories(techCategoryNames, "TECNOLOGIA"),
    upsertCategories(bookCategoryNames, "LIVROS"),
    upsertCategories(languageCategoryNames, "IDIOMAS"),
    upsertCategories(forumCategoryNames, "FORUM"),
  ]);

  // --- Languages ------------------------------------------------------------
  const languageNames = ["Inglês", "Espanhol"];
  const languages = [];
  for (const name of languageNames) {
    const language = await db.language.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name) },
    });
    languages.push(language);
  }

  // --- Tags -------------------------------------------------------------
  async function upsertTag(name: string) {
    return db.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: slug(name) },
    });
  }
  const [tagPython, tagIA, tagCarreira, tagLivros, tagIngles] = await Promise.all([
    upsertTag("python"),
    upsertTag("ia"),
    upsertTag("carreira"),
    upsertTag("leitura"),
    upsertTag("ingles"),
  ]);

  // --- Posts --------------------------------------------------------------
  async function upsertPost(data: {
    title: string;
    summary: string;
    content: string;
    module: "TECNOLOGIA" | "LIVROS" | "IDIOMAS";
    type: "ARTICLE" | "VIDEO" | "PODCAST";
    categoryId?: string;
    languageId?: string;
    bookAuthor?: string;
    tagIds: string[];
    media?: { type: "VIDEO" | "PODCAST"; url: string; thumbnail?: string; duration?: number };
  }) {
    const postSlug = slug(data.title);
    const existing = await db.post.findUnique({ where: { slug: postSlug } });
    if (existing) return existing;

    return db.post.create({
      data: {
        title: data.title,
        slug: postSlug,
        summary: data.summary,
        content: data.content,
        type: data.type,
        status: "PUBLISHED",
        module: data.module,
        bookAuthor: data.bookAuthor,
        publishedAt: new Date(),
        authorId: admin.id,
        categoryId: data.categoryId,
        languageId: data.languageId,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        media: data.media ? { create: data.media } : undefined,
      },
    });
  }

  const post1 = await upsertPost({
    title: "Introdução ao Python para iniciantes",
    summary: "Os primeiros passos para começar a programar em Python.",
    content:
      "# Por que Python?\n\nPython é uma das linguagens mais acessíveis para quem está começando...\n\n## Instalando\n\n1. Baixe o instalador\n2. Configure o PATH\n3. Escreva seu primeiro `print(\"olá mundo\")`",
    module: "TECNOLOGIA",
    type: "ARTICLE",
    categoryId: techCategories[0].id,
    tagIds: [tagPython.id, tagIA.id],
  });

  await upsertPost({
    title: "Python para análise de dados",
    summary: "Um vídeo introdutório sobre pandas e numpy.",
    content: "Neste vídeo mostramos como usar bibliotecas de dados em Python.",
    module: "TECNOLOGIA",
    type: "VIDEO",
    categoryId: techCategories[0].id,
    tagIds: [tagPython.id],
    media: { type: "VIDEO", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", duration: 632 },
  });

  await upsertPost({
    title: "Como migrar de carreira para tecnologia",
    summary: "Um podcast com dicas práticas de transição de carreira.",
    content: "Conversamos com pessoas que migraram com sucesso para tecnologia.",
    module: "TECNOLOGIA",
    type: "PODCAST",
    categoryId: techCategories[1].id,
    tagIds: [tagCarreira.id],
    media: { type: "PODCAST", url: "https://example.com/podcast-migracao.mp3", duration: 1800 },
  });

  await upsertPost({
    title: "Resenha: Clean Code",
    summary: "Vale a pena ler Clean Code em 2025?",
    content: "Clean Code continua sendo referência sobre boas práticas de programação...",
    module: "LIVROS",
    bookAuthor: "Robert C. Martin",
    type: "ARTICLE",
    categoryId: bookCategories[1].id,
    tagIds: [tagLivros.id],
  });

  await upsertPost({
    title: "Vocabulário essencial de inglês para tecnologia",
    summary: "Termos técnicos em inglês que todo profissional deveria conhecer.",
    content: "Uma lista com os termos mais usados no dia a dia de quem trabalha com tecnologia.",
    module: "IDIOMAS",
    type: "ARTICLE",
    categoryId: languageCategories[0].id,
    languageId: languages[0].id,
    tagIds: [tagIngles.id],
  });

  // --- Sample interactions --------------------------------------------------
  await db.like.upsert({
    where: { userId_postId: { userId: member.id, postId: post1.id } },
    update: {},
    create: { userId: member.id, postId: post1.id },
  });

  const existingComment = await db.comment.findFirst({
    where: { postId: post1.id, userId: member.id },
  });
  if (!existingComment) {
    await db.comment.create({
      data: {
        postId: post1.id,
        userId: member.id,
        content: "Ótimo artigo, me ajudou bastante a começar!",
      },
    });
  }

  // --- Forum ---------------------------------------------------------------
  const topicSlug = slug("Como começar com Python?");
  const existingTopic = await db.forumTopic.findUnique({ where: { slug: topicSlug } });
  const topic =
    existingTopic ??
    (await db.forumTopic.create({
      data: {
        title: "Como começar com Python?",
        slug: topicSlug,
        content: "Pessoal, estou começando agora e gostaria de dicas de por onde estudar.",
        userId: member.id,
        categoryId: forumCategories[1].id,
      },
    }));

  const existingReply = await db.forumReply.findFirst({ where: { topicId: topic.id } });
  if (!existingReply) {
    await db.forumReply.create({
      data: {
        topicId: topic.id,
        userId: admin.id,
        content: "Recomendo começar pelo nosso artigo de introdução ao Python, no módulo Tecnologia!",
      },
    });
  }

  console.log("Seed finalizado.");
  console.log("----------------------------------------");
  console.log("Login admin: admin@conectax.local (senha: SEED_ADMIN_PASSWORD)");
  console.log("Login usuário: usuario@conectax.local (senha: SEED_USER_PASSWORD)");
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
