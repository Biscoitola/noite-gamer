import { Container, Field, Panel, inputClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_HERO_POSTER_URL, HOME_CAROUSEL_KEY, HOME_HERO_POSTER_KEY, parseHomeCarouselConfig, readStringSetting } from "@/lib/home-settings";
import {
  createEditionAction,
  createGameAction,
  createHomeCarouselImageAction,
  deleteGameAction,
  deleteHomeCarouselImageAction,
  toggleGameStatusAction,
  updateGameAction,
  updateHomeCarouselImageAction,
  updateHomeCarouselSettingsAction,
  updateHomeHeroPosterAction
} from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const successMessage = readSearchParam(params?.success);
  const errorMessage = readSearchParam(params?.error);
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: { games: { orderBy: { name: "asc" }, include: { _count: { select: { items: true, tournaments: true } } } } }
  });
  const settings = await prisma.systemSetting.findMany({ where: { key: { in: [HOME_HERO_POSTER_KEY, HOME_CAROUSEL_KEY] } } });
  const heroPosterUrl = readStringSetting(settings.find((setting) => setting.key === HOME_HERO_POSTER_KEY)?.value, DEFAULT_HERO_POSTER_URL);
  const carouselConfig = parseHomeCarouselConfig(settings.find((setting) => setting.key === HOME_CAROUSEL_KEY)?.value);
  return (
    <Container className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Conteudo editavel</p>
        <h1 className="text-3xl font-black text-glow">Edicoes e jogos</h1>
      </div>
      {successMessage ? (
        <div className="border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="border border-red-400/45 bg-red-500/10 p-3 text-sm font-black text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <Panel className="interactive-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-start">
          <div>
            <h2 className="text-xl font-black text-[#FFD400]">Imagem principal da home</h2>
            <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
              Cole uma URL publica da imagem do folder. Ela aparece automaticamente para todos na tela inicial.
            </p>
            <form action={updateHomeHeroPosterAction} className="mt-4 grid gap-3">
              <Field label="URL da imagem">
                <input
                  className={inputClass}
                  name="imageUrl"
                  placeholder="https://..."
                  defaultValue={heroPosterUrl}
                />
              </Field>
              <p className="text-xs text-[#A3A3A3]">
                Para voltar ao padrao, salve vazio ou use /assets/folder-noite-gamer.png. Nao cole arquivo do computador ou imagem copiada; precisa ser link publico.
              </p>
              <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black shadow-[0_0_22px_rgba(255,212,0,0.25)]">
                Salvar imagem da home
              </button>
            </form>
          </div>
          <div className="border border-[#FFD400]/30 bg-black/30 p-2">
            <img className="aspect-[2/3] w-full object-cover" src={heroPosterUrl} alt="Preview da imagem principal da home" />
          </div>
        </div>
      </Panel>

      <Panel className="interactive-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-xl font-black text-[#FFD400]">Carrossel da home</h2>
            <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
              As imagens abaixo aparecem junto com os patrocinadores marcados para o carrossel. Use para artes, chamadas, brindes ou banners extras.
            </p>
            <form action={updateHomeCarouselSettingsAction} className="mt-4 grid gap-3">
              <Field label="Velocidade da animacao em segundos">
                <input className={inputClass} name="speedSeconds" min="8" max="90" type="number" defaultValue={carouselConfig.speedSeconds} />
              </Field>
              <button className="focus-ring min-h-12 bg-[#B45CFF] px-4 font-black uppercase text-white shadow-[0_0_22px_rgba(180,92,255,0.28)]">
                Salvar configuracao do carrossel
              </button>
            </form>
          </div>
          <form action={createHomeCarouselImageAction} className="grid gap-3 border border-[#B45CFF]/25 bg-black/25 p-3">
            <p className="text-xs font-black uppercase text-[#FFD400]">Adicionar imagem extra</p>
            <Field label="Titulo"><input className={inputClass} name="title" required placeholder="Patrocinador, brinde, chamada..." /></Field>
            <Field label="URL da imagem"><input className={inputClass} name="imageUrl" required placeholder="https://..." /></Field>
            <Field label="Link ao clicar"><input className={inputClass} name="linkUrl" placeholder="/patrocinadores ou https://..." /></Field>
            <Field label="Ordem"><input className={inputClass} name="order" type="number" defaultValue="0" /></Field>
            <p className="text-xs text-[#A3A3A3]">
              Use uma URL publica da imagem. Arquivos locais como C:\... ou imagens coladas/base64 nao abrem para outras pessoas.
            </p>
            <label className="flex min-h-12 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
              <input name="isActive" type="checkbox" defaultChecked /> Mostrar no carrossel
            </label>
            <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black shadow-[0_0_22px_rgba(255,212,0,0.25)]">
              Adicionar imagem
            </button>
          </form>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {carouselConfig.images.length > 0 ? carouselConfig.images.map((image) => (
            <article className="grid gap-3 border border-[#FFD400]/25 bg-[#111111] p-3" key={image.id}>
              <div className="flex gap-3">
                <img src={image.imageUrl} alt={image.title} className="h-20 w-28 border border-[#B45CFF]/35 bg-white object-contain p-1" />
                <div>
                  <strong className="text-[#FFD400]">{image.title}</strong>
                  <p className="text-xs uppercase text-[#B45CFF]">Ordem {image.order} | {image.isActive ? "visivel" : "oculta"}</p>
                  <p className="mt-1 break-all text-xs text-[#A3A3A3]">{image.linkUrl || "Sem link"}</p>
                </div>
              </div>
              <form action={updateHomeCarouselImageAction} className="grid gap-3 border border-[#B45CFF]/25 bg-black/25 p-3">
                <input name="imageId" type="hidden" value={image.id} />
                <Field label="Titulo"><input className={inputClass} name="title" required defaultValue={image.title} /></Field>
                <Field label="URL da imagem"><input className={inputClass} name="imageUrl" required defaultValue={image.imageUrl} /></Field>
                <Field label="Link ao clicar"><input className={inputClass} name="linkUrl" defaultValue={image.linkUrl} /></Field>
                <Field label="Ordem"><input className={inputClass} name="order" type="number" defaultValue={image.order} /></Field>
                <label className="flex min-h-11 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
                  <input name="isActive" type="checkbox" defaultChecked={image.isActive} /> Mostrar no carrossel
                </label>
                <button className="focus-ring min-h-11 bg-[#FFD400] px-3 text-xs font-black uppercase text-black">
                  Salvar imagem
                </button>
              </form>
              <form action={deleteHomeCarouselImageAction}>
                <input name="imageId" type="hidden" value={image.id} />
                <button className="focus-ring min-h-10 w-full border border-red-500/50 px-3 text-xs font-black uppercase text-red-200 hover:bg-red-500/10">
                  Remover imagem
                </button>
              </form>
            </article>
          )) : (
            <div className="border border-[#B45CFF]/25 bg-black/25 p-4 text-sm text-[#A3A3A3] lg:col-span-2">
              Nenhuma imagem extra cadastrada. O carrossel ainda pode usar os patrocinadores marcados na aba Patrocinadores.
            </div>
          )}
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel className="interactive-panel">
          <h2 className="text-xl font-black text-[#FFD400]">Criar edicao</h2>
          <form action={createEditionAction} className="mt-4 grid gap-3">
            <Field label="Nome do evento"><input className={inputClass} name="name" required defaultValue="Noite Gamer" /></Field>
            <Field label="Edicao"><input className={inputClass} name="edition" required placeholder="Edicao 1, Copa HARP, Especial Ferias" /></Field>
            <Field label="Descricao"><textarea className={inputClass} name="description" rows={3} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Local"><input className={inputClass} name="venue" defaultValue="HARP" /></Field>
              <Field label="Cidade"><input className={inputClass} name="city" defaultValue="Tapejara" /></Field>
              <Field label="Estado"><input className={inputClass} name="state" defaultValue="RS" /></Field>
              <Field label="Endereco"><input className={inputClass} name="address" placeholder="Endereco do evento" /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Data do evento"><input className={inputClass} name="eventDate" type="date" required /></Field>
              <Field label="Horario do evento"><input className={inputClass} name="eventTime" type="time" defaultValue="19:00" required /></Field>
              <Field label="Inicio das inscricoes"><input className={inputClass} name="registrationStartDate" type="date" /></Field>
              <Field label="Horario de inicio"><input className={inputClass} name="registrationStartTime" type="time" defaultValue="08:00" /></Field>
              <Field label="Fim das inscricoes"><input className={inputClass} name="registrationEndDate" type="date" /></Field>
              <Field label="Horario de fim"><input className={inputClass} name="registrationEndTime" type="time" defaultValue="23:59" /></Field>
            </div>
            <Field label="Status">
              <select className={inputClass} name="status" defaultValue="DRAFT">
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativa</option>
              </select>
            </Field>
            <button className="focus-ring min-h-12 bg-[#B45CFF] px-4 font-black uppercase text-white shadow-[0_0_22px_rgba(180,92,255,0.28)]">Salvar edicao</button>
          </form>
        </Panel>

        <Panel className="interactive-panel">
          <h2 className="text-xl font-black text-[#FFD400]">Adicionar jogo</h2>
          <form action={createGameAction} className="mt-4 grid gap-3">
            <Field label="Edicao">
              <select className={inputClass} name="eventId" required>
                {events.map((event) => <option key={event.id} value={event.id}>{event.name} - {event.edition}</option>)}
              </select>
            </Field>
            <Field label="Nome do jogo"><input className={inputClass} name="name" required placeholder="Tekken, Valorant, Mario Kart..." /></Field>
            <Field label="Slug publico"><input className={inputClass} name="slug" placeholder="tekken-8" /></Field>
            <Field label="Descricao"><textarea className={inputClass} name="description" rows={3} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Preco"><input className={inputClass} name="price" min="0" step="0.01" type="number" defaultValue="0" /></Field>
              <Field label="Vagas"><input className={inputClass} name="capacity" min="2" type="number" defaultValue="16" /></Field>
            </div>
            <label className="flex min-h-12 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
              <input name="isActive" type="checkbox" defaultChecked /> Ativar jogo
            </label>
            <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black shadow-[0_0_22px_rgba(255,212,0,0.25)]">Salvar jogo</button>
          </form>
        </Panel>
      </section>

      <Panel>
        <h2 className="text-xl font-black">Edicoes cadastradas</h2>
        <div className="mt-4 grid gap-4">
          {events.map((event) => (
            <article className="border border-[#B45CFF]/30 bg-black/25 p-4" key={event.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#FFD400]">{event.name} - {event.edition}</h3>
                  <p className="text-sm text-[#A3A3A3]">{event.venue} - {event.city}/{event.state} - {event.status}</p>
                </div>
                <strong className="text-sm text-[#B45CFF]">{event.games.length} jogos</strong>
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {event.games.map((game) => (
                  <li className="border border-[#FFD400]/25 bg-[#111111] p-3" key={game.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong>{game.name}</strong>
                        <p className="text-sm text-[#A3A3A3]">R$ {Number(game.price).toFixed(2)} - {game.capacity} vagas - {game.isActive ? "ativo" : "inativo"}</p>
                        <p className="mt-1 text-xs uppercase text-[#A3A3A3]">
                          {game._count.items} inscricoes | {game._count.tournaments} torneios
                        </p>
                      </div>
                      <span className={game.isActive ? "text-xs font-black text-emerald-300" : "text-xs font-black text-[#A3A3A3]"}>
                        {game.isActive ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>
                    <form action={updateGameAction} className="mt-4 grid gap-3 border border-[#B45CFF]/25 bg-black/25 p-3">
                      <input name="gameId" type="hidden" value={game.id} />
                      <p className="text-xs font-black uppercase text-[#FFD400]">Editar dados do jogo</p>
                      <Field label="Nome do jogo">
                        <input className={inputClass} name="name" required defaultValue={game.name} />
                      </Field>
                      <Field label="Slug publico">
                        <input className={inputClass} name="slug" defaultValue={game.slug} />
                      </Field>
                      <Field label="Descricao">
                        <textarea className={inputClass} name="description" rows={2} defaultValue={game.description} />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Preco">
                          <input className={inputClass} name="price" min="0" step="0.01" type="number" defaultValue={Number(game.price).toFixed(2)} />
                        </Field>
                        <Field label="Vagas">
                          <input className={inputClass} name="capacity" min="2" type="number" defaultValue={game.capacity} />
                        </Field>
                      </div>
                      <label className="flex min-h-11 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
                        <input name="isActive" type="checkbox" defaultChecked={game.isActive} /> Jogo ativo
                      </label>
                      <button className="focus-ring min-h-11 bg-[#FFD400] px-3 text-xs font-black uppercase text-black">
                        Salvar alteracoes
                      </button>
                    </form>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <form action={toggleGameStatusAction}>
                        <input name="gameId" type="hidden" value={game.id} />
                        <input name="isActive" type="hidden" value={game.isActive ? "false" : "true"} />
                        <button className="focus-ring min-h-10 w-full border border-[#B45CFF]/50 px-3 text-xs font-black uppercase text-[#F5F5F5] hover:border-[#FFD400] hover:text-[#FFD400]">
                          {game.isActive ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <form action={deleteGameAction}>
                        <input name="gameId" type="hidden" value={game.id} />
                        <button className="focus-ring min-h-10 w-full border border-red-500/50 px-3 text-xs font-black uppercase text-red-200 hover:bg-red-500/10">
                          {game._count.items > 0 || game._count.tournaments > 0 ? "Ocultar" : "Apagar"}
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Panel>
    </Container>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
