// Logos oficiais enviados para a edição The Games Emporium.
export const EDITION_SPONSORS = [
  ["ecm", "ECM", "Equipamentos médicos, odontológicos e assistência técnica."],
  ["exata-radiologia", "Exata Radiologia Odontológica", "Radiologia odontológica."],
  ["attos", "Attos", "Patrocinador do The Games Emporium."],
  ["scariot-tintas", "Scariot Tintas", "Patrocinador do The Games Emporium."],
  ["emporium-premium", "Emporium Premium", "Patrocinador do The Games Emporium."],
  ["revista-comunicacao", "Revista Comunicação", "Patrocinador do The Games Emporium."],
  ["ambar-skateshop", "Âmbar Skateshop", "Patrocinador do The Games Emporium."],
  ["marcon-contabilidade", "Marcon Contabilidade", "Patrocinador do The Games Emporium."],
  ["jack-sportswear", "Jack Sportswear", "Patrocinador do The Games Emporium."],
  ["mecanica-marcolin", "Mecânica Marcolin", "Bosch Service — fazemos tudo para seu carro."],
  ["lima-barbearia", "Lima Barbearia", "Patrocinador do The Games Emporium."]
].map(([id, name, description]) => ({
  id: `emporium-${id}`,
  name,
  description,
  logoUrl: `/assets/patrocinadores/${id}.jpeg`,
  carouselImageUrl: `/assets/patrocinadores/${id}.jpeg`,
  websiteUrl: null as string | null,
  prizes: []
}));

function normalizeName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function withEditionSponsors<T extends { id: string; name: string; logoUrl: string }>(sponsors: T[]) {
  const remaining = [...sponsors];
  const edition = EDITION_SPONSORS.map((sponsor) => {
    const index = remaining.findIndex((existing) => normalizeName(existing.name) === normalizeName(sponsor.name));
    if (index < 0) return sponsor;
    const [existing] = remaining.splice(index, 1);
    return { ...existing, logoUrl: sponsor.logoUrl, carouselImageUrl: sponsor.carouselImageUrl };
  });
  return [...edition, ...remaining];
}
