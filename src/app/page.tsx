import { ButtonLink, Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";
import { ACTIVE_REGISTRATION_STATUSES, OCCUPIED_ITEM_STATUSES, remainingSlots } from "@/lib/capacity";
import { HOME_CAROUSEL_KEY, HOME_HERO_POSTER_KEY, parseHomeCarouselConfig, readHeroPosterSetting } from "@/lib/home-settings";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, games, homeSettings] = await Promise.all([
    prisma.event
      .findMany({
        orderBy: { startsAt: "desc" },
        include: {
          sponsors: { where: { isActive: true, showInCarousel: true }, orderBy: [{ carouselOrder: "asc" }, { createdAt: "desc" }] },
          prizes: { where: { isActive: true }, include: { sponsor: true }, orderBy: { createdAt: "desc" } }
        }
      })
      .catch(() => []),
    prisma.game
      .findMany({
        where: { isActive: true, event: { status: "ACTIVE" } },
        include: {
          _count: {
            select: {
              items: {
                where: {
                  status: { in: [...OCCUPIED_ITEM_STATUSES] },
                  registration: { status: { in: [...ACTIVE_REGISTRATION_STATUSES] } }
                }
              }
            }
          }
        },
        orderBy: { name: "asc" }
      })
      .catch(() => []),
    prisma.systemSetting.findMany({ where: { key: { in: [HOME_HERO_POSTER_KEY, HOME_CAROUSEL_KEY] } } }).catch(() => [])
  ]);
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];
  const sponsors = activeEvent?.sponsors ?? [];
  const prizes = activeEvent?.prizes ?? [];
  const heroPosterUrl = readHeroPosterSetting(homeSettings.find((setting) => setting.key === HOME_HERO_POSTER_KEY)?.value);
  const carouselConfig = parseHomeCarouselConfig(homeSettings.find((setting) => setting.key === HOME_CAROUSEL_KEY)?.value);
  const eventLocation = activeEvent ? `${activeEvent.city}/${activeEvent.state}` : "Local em breve";
  const carouselEntries = sponsors.map((sponsor) => ({
    id: `sponsor-${sponsor.id}`,
    title: sponsor.name,
    imageUrl: sponsor.carouselImageUrl || sponsor.logoUrl,
    href: sponsor.websiteUrl ?? "/patrocinadores",
    external: Boolean(sponsor.websiteUrl)
  }));
  const carouselItems = carouselEntries.length > 0 ? [...carouselEntries, ...carouselEntries] : [];
  return (
    <div className="nexus-home min-h-screen neon-page">
      <PublicHeader showBack={false} />
      <Container className="grid max-w-7xl gap-10 px-4 pb-12 pt-6 sm:px-6">
        <section className="home-hero">
          <div className="home-hero-copy animate-rise">
            <p className="home-kicker">Bem-vindo a</p>
            <h1 className="home-title">
              <span>Nexus</span>
              <strong>Arena</strong>
            </h1>
            <p className="home-crown" aria-hidden="true">N</p>
            <p className="home-subtitle">Mais que jogo. Uma comunidade.</p>
            <p className="home-description">
              Chega junto, escolhe teu jogo e vem curtir a Nexus Arena: inscricao online, Pix, check-in, chaveamento ao vivo e sorteios pra deixar a disputa mais divertida.
            </p>
            <div className="home-actions">
              <ButtonLink href="/inscricao">&lt;quero participar&gt;</ButtonLink>
              <ButtonLink href="/torneios" variant="ghost">Ver chaves</ButtonLink>
            </div>
            <div className="home-side-note" aria-label="Temas da Nexus Arena">
              <span>Games</span>
              <span>Amizade</span>
              <span>Competicao</span>
              <span>Experiencias reais</span>
            </div>
          </div>
          <div className="current-edition-card animate-float">
            <div className="edition-card-meta">
              <span>Duelos</span>
              <span>Estrategia</span>
              <span>Habilidade</span>
              <span>Diversao</span>
            </div>
            <img
              src={heroPosterUrl}
              alt={activeEvent ? `Folder Nexus Arena - ${activeEvent.edition}` : "Folder da Nexus Arena"}
              className="folder-image"
            />
          </div>
        </section>
        <section className="home-feature-strip" aria-label="Destaques da Nexus Arena">
          <div>
            <span aria-hidden="true">[ ]</span>
            <strong>Varios jogos</strong>
            <small>De luta, esporte, FPS e mais</small>
          </div>
          <div>
            <span aria-hidden="true">***</span>
            <strong>Para todos</strong>
            <small>Iniciantes e competitivos</small>
          </div>
          <div>
            <span aria-hidden="true">T</span>
            <strong>Eventos presenciais</strong>
            <small>{eventLocation}</small>
          </div>
          <div>
            <span aria-hidden="true">*</span>
            <strong>Premiacoes</strong>
            <small>Dinheiro, trofeus e brindes</small>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          {games.length > 0 ? games.map((game) => (
            <Panel className="interactive-panel" key={game.id}>
              <h2 className="text-xl font-black text-[#A855F7]">{game.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                {game.description}
              </p>
              <p className="mt-3 text-sm font-black text-[#B45CFF]">
                R$ {Number(game.price).toFixed(2)} - {remainingSlots(game.capacity, game._count.items)} vaga{remainingSlots(game.capacity, game._count.items) === 1 ? "" : "s"} disponive{remainingSlots(game.capacity, game._count.items) === 1 ? "l" : "is"}
              </p>
            </Panel>
          )) : (
            <Panel className="sm:col-span-3">
              <h2 className="text-xl font-black text-[#A855F7]">Configure sua primeira edicao</h2>
              <p className="mt-2 text-[#A3A3A3]">Entre no admin e crie edicoes e jogos para liberar as inscricoes.</p>
            </Panel>
          )}
        </section>
        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Premiacao oficial</p>
            <h2 className="text-3xl font-black text-glow">Quem levantar o trofeu ainda entra em sorteio especial</h2>
          </div>
          {prizes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {prizes.slice(0, 3).map((prize) => (
              <a className="trophy-card interactive-panel" href="/premios" key={prize.id}>
                <img src={prize.imageUrl} alt={prize.title} />
                <div>
                  <p>{prize.sponsor.name}</p>
                  <h3>{prize.title}</h3>
                </div>
              </a>
              ))}
            </div>
          ) : (
            <Panel>
              <h2 className="text-xl font-black text-[#A855F7]">Premios em breve</h2>
              <p className="mt-2 text-[#A3A3A3]">Cadastre premios nos patrocinadores da edicao ativa para aparecerem aqui.</p>
            </Panel>
          )}
        </section>
        <section className="grid gap-4 pb-12">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Quem fortalece a Nexus Arena</p>
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
              <h2 className="text-xl font-black text-[#A855F7]">Patrocinadores em breve</h2>
              <p className="mt-2 text-[#A3A3A3]">Cadastre patrocinadores no admin e marque a opcao de carrossel para aparecerem aqui.</p>
            </Panel>
          )}
        </section>
      </Container>
    </div>
  );
}
