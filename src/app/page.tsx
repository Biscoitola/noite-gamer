import { ButtonLink, Container, Panel } from "@/components/ui";
import { EventLogo, PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";
import { DEFAULT_HERO_POSTER_URL, HOME_CAROUSEL_KEY, HOME_HERO_POSTER_KEY, parseHomeCarouselConfig, readStringSetting } from "@/lib/home-settings";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, games, homeSettings] = await Promise.all([
    prisma.event
      .findMany({
        orderBy: { startsAt: "desc" },
        include: { sponsors: { where: { isActive: true, showInCarousel: true }, orderBy: [{ carouselOrder: "asc" }, { createdAt: "desc" }] } }
      })
      .catch(() => []),
    prisma.game
      .findMany({
        where: { isActive: true, event: { status: "ACTIVE" } },
        orderBy: { name: "asc" }
      })
      .catch(() => []),
    prisma.systemSetting.findMany({ where: { key: { in: [HOME_HERO_POSTER_KEY, HOME_CAROUSEL_KEY] } } }).catch(() => [])
  ]);
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];
  const sponsors = activeEvent?.sponsors ?? [];
  const heroPosterUrl = readStringSetting(homeSettings.find((setting) => setting.key === HOME_HERO_POSTER_KEY)?.value, DEFAULT_HERO_POSTER_URL);
  const carouselConfig = parseHomeCarouselConfig(homeSettings.find((setting) => setting.key === HOME_CAROUSEL_KEY)?.value);
  const carouselEntries = [
    ...sponsors.map((sponsor) => ({
      id: `sponsor-${sponsor.id}`,
      title: sponsor.name,
      imageUrl: sponsor.carouselImageUrl || sponsor.logoUrl,
      href: sponsor.websiteUrl ?? "/patrocinadores",
      external: Boolean(sponsor.websiteUrl)
    })),
    ...carouselConfig.images
      .filter((image) => image.isActive)
      .map((image) => ({
        id: `custom-${image.id}`,
        title: image.title,
        imageUrl: image.imageUrl,
        href: image.linkUrl || "/patrocinadores",
        external: image.linkUrl.startsWith("http")
      }))
  ];
  const carouselItems = carouselEntries.length > 0 ? [...carouselEntries, ...carouselEntries] : [];
  return (
    <div className="scratched min-h-screen neon-page">
      <PublicHeader showBack={false} />
      <Container className="grid gap-8">
        <section className="hero-grid grid min-h-[76vh] items-center gap-8 py-8 lg:grid-cols-[1fr_430px]">
          <div className="max-w-3xl animate-rise">
            <EventLogo />
            <p className="mt-8 text-sm font-bold uppercase text-[#FFD400]">
              {activeEvent ? `${activeEvent.edition} - ${activeEvent.venue} - ${activeEvent.city}/${activeEvent.state}` : "Edicao configuravel - HARP - Tapejara/RS"}
            </p>
            <h1 className="mt-3 text-5xl font-black leading-none text-glow sm:text-7xl">A ARENA ESTA ABERTA</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#D4D4D4]">
              Inscricoes online, Pix, check-in e chaveamento em um painel competitivo com neon, ranking e controle administrativo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/inscricao">Quero participar</ButtonLink>
              <ButtonLink href="/torneios" variant="ghost">Ver chaves</ButtonLink>
            </div>
          </div>
          <div className="folder-showcase animate-float">
            <img
              src={heroPosterUrl}
              alt="Folder da Noite Gamer 2a Edicao"
              className="folder-image"
            />
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          {games.length > 0 ? games.map((game) => (
            <Panel className="interactive-panel" key={game.id}>
              <h2 className="text-xl font-black text-[#FFD400]">{game.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                {game.description}
              </p>
              <p className="mt-3 text-sm font-black text-[#B45CFF]">R$ {Number(game.price).toFixed(2)} - {game.capacity} vagas</p>
            </Panel>
          )) : (
            <Panel className="sm:col-span-3">
              <h2 className="text-xl font-black text-[#FFD400]">Configure sua primeira edicao</h2>
              <p className="mt-2 text-[#A3A3A3]">Entre no admin e crie edicoes e jogos para liberar as inscricoes.</p>
            </Panel>
          )}
        </section>
        <section className="grid gap-4 pb-12">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Quem fortalece a Noite Gamer</p>
            <h2 className="text-3xl font-black text-glow">Patrocinadores</h2>
          </div>
          {carouselItems.length > 0 ? (
            <div className="sponsor-carousel">
              <div className="sponsor-carousel-track" style={{ "--carousel-duration": `${carouselConfig.speedSeconds}s` } as CSSProperties}>
                {carouselItems.map((item, index) => (
                  <a
                    className="sponsor-carousel-card"
                    href={item.href}
                    key={`${item.id}-${index}`}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                  >
                    <img src={item.imageUrl} alt={item.title} />
                    <span>{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <Panel>
              <h2 className="text-xl font-black text-[#FFD400]">Patrocinadores em breve</h2>
              <p className="mt-2 text-[#A3A3A3]">Cadastre patrocinadores no admin e marque a opcao de carrossel para aparecerem aqui.</p>
            </Panel>
          )}
        </section>
      </Container>
    </div>
  );
}
